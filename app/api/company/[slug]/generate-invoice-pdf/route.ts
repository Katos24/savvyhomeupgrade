import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';

import { stripe } from '@/lib/stripe';

function fmtPaymentDate(d: string | Date | null | undefined): string | undefined {
  if (!d) return undefined;
  let year: number, month: number, day: number;
  if (d instanceof Date) {
    // Postgres DATE columns often come back from the driver as a Date
    // already anchored to UTC midnight for that calendar date. Reading the
    // UTC getters (not local ones) pulls the intended calendar date back
    // out without a timezone shift — same goal as the string-splitting
    // branch below, just for an object instead of a "YYYY-MM-DD" string.
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  } else {
    const datePart = d.split('T')[0];
    const parts = datePart.split('-').map(Number);
    [year, month, day] = parts as [number, number, number];
  }
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    // ?preview=1 renders in an iframe instead of triggering a download.
    const isPreview = searchParams.get('preview') === '1';

    if (!projectId) {
      return NextResponse.json({ error: 'project_id required' }, { status: 400 });
    }

    // Auth — accept both contractor and bookkeeper tokens
    const cookieStore = await cookies();
    const contractorToken = cookieStore.get('auth-token')?.value;
    const bookkeeperToken = cookieStore.get('bookkeeper-auth-token')?.value;

    if (!contractorToken && !bookkeeperToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get company
   const companies = await sql`
  SELECT id, name, phone, email, logo_url, payment_link_url, payment_link_type,
         email_brand_color_1, email_brand_color_2, plan_tier, referred_by_code,
         stripe_connect_account_id, stripe_connect_onboarded, stripe_payment_status
  FROM companies WHERE slug = ${slug} LIMIT 1
`;
    if (!companies.length) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const company = companies[0];

    // If bookkeeper token verify they have access to this company
    if (bookkeeperToken && !contractorToken) {
      try {
        const bk = jwt.verify(bookkeeperToken, process.env.JWT_SECRET!) as any;
        if (company.referred_by_code !== bk.partner_code) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get project + lead data
         const rows = await sql`
      SELECT
        p.id, p.invoice_number, p.quote_total, p.quote_tax_rate, p.quote_data,
        p.payment_status, p.payment_amount, p.payment_due_date,
        p.invoice_sent_at, p.created_at, p.stripe_checkout_session_id,
        p.deposit_type, p.deposit_value,
        l.name as customer_name, l.email as customer_email,
        l.phone as customer_phone, l.address_line_1, l.city, l.zip_code
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE p.id = ${projectId}
        AND l.company_id = ${company.id}
      LIMIT 1
    `;

    if (!rows.length) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = rows[0];

    // Parse line items
    let lineItems: any[] = [];
    try {
      const raw = project.quote_data;
      if (raw) lineItems = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { lineItems = []; }

    if (!lineItems.length && project.quote_total) {
      lineItems = [{ description: 'Services', amount: parseFloat(project.quote_total), quantity: 1 }];
    }

    const invoiceDate = project.invoice_sent_at
      ? new Date(project.invoice_sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const dueDate = project.payment_due_date
      ? new Date(project.payment_due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : undefined;

       // Determine payment link: prefer a live Stripe Checkout session if Connect is set up
  let paymentLinkUrl: string | null = company.payment_link_url;
    let paymentLinkType: string | null = company.payment_link_type;

const contractTotal = parseFloat(project.quote_total || '0');

    // What the deposit actually is — sourced from the lead's own saved
    // terms, not from Stripe. This way it still shows correctly even when
    // Stripe isn't active, isn't configured, or the checkout call below
    // fails — previously this was only ever set inside the Stripe branch,
    // so no Stripe meant no deposit on the PDF regardless of terms.
    const depositType = project.deposit_type || null;
    const depositValue = parseFloat(project.deposit_value || '0');
    const hasDepositTerms = !!depositType && depositValue > 0;
    const pdfDepositAmount: number | undefined = hasDepositTerms
      ? Math.min(
          Math.round((depositType === 'percent' ? (contractTotal * depositValue) / 100 : depositValue) * 100) / 100,
          contractTotal
        )
      : undefined;

    if (company.stripe_payment_status === 'active' && contractTotal > 0) {
      try {
        const checkout = await getOrCreateCheckoutSession({
          projectId: project.id,
          connectedAccountId: company.stripe_connect_account_id,
          customerName: project.customer_name,
          customerEmail: project.customer_email,
          companySlug: slug,
          contractTotal,
        });
       if (checkout.url) {
          paymentLinkUrl = checkout.url;
          paymentLinkType = 'stripe';
        }
      } catch (stripeErr: any) {
        console.error('Failed to create Stripe Checkout session for PDF:', stripeErr.message);
        // fall through — PDF shows the fallback payment_link_url, if any
      }
    }
    
        const customerAddress = [project.address_line_1, project.city, project.zip_code].filter(Boolean).join(', ');

    const kindLabels: Record<string, string> = {
      deposit: 'Deposit paid',
      balance: 'Balance paid',
    };
    const paymentRows = await sql`
      SELECT amount, kind, paid_on
      FROM payments
      WHERE project_id = ${project.id} AND company_id = ${company.id}
      ORDER BY paid_on ASC, id ASC
    `;
    // Refunds (negative amount) aren't part of "what was collected" —
    // exclude them from this breakdown specifically.
    const paymentBreakdown = paymentRows
      .filter((p: any) => parseFloat(p.amount) > 0)
      .map((p: any) => ({
        label: kindLabels[p.kind] || 'Payment received',
        amount: parseFloat(p.amount) || 0,
        date: fmtPaymentDate(p.paid_on),
      }));

    // Generate PDF
    const { generateInvoicePDFBuffer } = await import('@/lib/generateInvoicePDFServer');
    const pdfBuffer = await generateInvoicePDFBuffer({
      invoiceNumber: project.invoice_number || 'INV-001',
      invoiceDate,
      dueDate,
      companyName: company.name,
      companyPhone: company.phone || undefined,
      companyEmail: company.email || undefined,
      companyLogoUrl: company.logo_url || undefined,
      customerName: project.customer_name,
      customerEmail: project.customer_email || undefined,
      customerPhone: project.customer_phone || undefined,
      customerAddress: customerAddress || undefined,
      lineItems: lineItems.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? undefined,
        amount: item.amount ?? 0,
      })),
   total: contractTotal,
      taxRate: project.quote_tax_rate ? parseFloat(project.quote_tax_rate) : undefined,
            amountPaid: project.payment_amount ? parseFloat(project.payment_amount) : undefined,
      depositAmount: pdfDepositAmount,
      paymentBreakdown,
      paymentLinkUrl: paymentLinkUrl || undefined,
      paymentLinkType: paymentLinkType || undefined,
      brandColor1: company.email_brand_color_1 || undefined,
      brandColor2: company.email_brand_color_2 || undefined,
    });

    const filename = `Invoice-${project.invoice_number || 'INV'}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${isPreview ? 'inline' : 'attachment'}; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}