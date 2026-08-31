import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';

// Reuse single connection instance across warm serverless invocations
const sql = neon(process.env.DATABASE_URL!);

function fmtPaymentDate(d: string | Date | null | undefined): string | undefined {
  if (!d) return undefined;
  let year: number, month: number, day: number;
  if (d instanceof Date) {
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  } else {
    const datePart = d.split('T')[0];
    const parts = datePart.split('-').map(Number);
    [year, month, day] = parts as [number, number, number];
  }
  if (!year || !month || !day) return undefined;
  
  // Format as explicit UTC date to avoid local timezone shifts
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
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

    // ── 1. Execute Company & Project Lookups in Parallel ──────────────────────────
    const [companies, rows] = await Promise.all([
      sql`
        SELECT id, name, phone, email, logo_url, payment_link_url, payment_link_type,
               email_brand_color_1, email_brand_color_2, plan_tier, referred_by_code,
               stripe_connect_account_id, stripe_connect_onboarded, stripe_payment_status,
               invoice_terms
        FROM companies WHERE slug = ${slug} LIMIT 1
      `,
      sql`
        SELECT
          p.id, p.invoice_number, p.quote_total, p.quote_tax_rate, p.quote_data,
          p.payment_status, p.payment_amount, p.payment_due_date,
          p.invoice_sent_at, p.created_at, p.stripe_checkout_session_id,
          p.deposit_type, p.deposit_value,
          l.company_id, l.name as customer_name, l.email as customer_email,
          l.phone as customer_phone, l.address_line_1, l.city, l.zip_code
        FROM projects p
        JOIN leads l ON p.lead_id = l.id
        WHERE p.id = ${projectId}
        LIMIT 1
      `,
    ]);

    if (!companies.length) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const company = companies[0];

    if (!rows.length || rows[0].company_id !== company.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const project = rows[0];

    // Verify bookkeeper permissions if using bookkeeper auth
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

    // ── 2. Parse Line Items & Format Dates ──────────────────────────────────────
    let lineItems: any[] = [];
    try {
      const raw = project.quote_data;
      if (raw) lineItems = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { 
      lineItems = []; 
    }

    const contractTotal = parseFloat(project.quote_total || '0');

    if (!lineItems.length && contractTotal > 0) {
      lineItems = [{ description: 'Services', amount: contractTotal, quantity: 1 }];
    }

    const invoiceDate = fmtPaymentDate(project.invoice_sent_at || project.created_at) || '';
    const dueDate = fmtPaymentDate(project.payment_due_date);

    // ── 3. Calculate Deposit Terms & Payments in Parallel ────────────────────────
    const depositType = project.deposit_type || null;
    const depositValue = parseFloat(project.deposit_value || '0');
    const hasDepositTerms = !!depositType && depositValue > 0;
    const fullDepositAmount = hasDepositTerms
      ? Math.min(
          Math.round((depositType === 'percent' ? (contractTotal * depositValue) / 100 : depositValue) * 100) / 100,
          contractTotal
        )
      : 0;

    const paidSoFar = parseFloat(project.payment_amount || '0');
    const pdfDepositAmount: number | undefined =
      hasDepositTerms && paidSoFar < fullDepositAmount
        ? Math.round((fullDepositAmount - paidSoFar) * 100) / 100
        : undefined;

    let paymentLinkUrl: string | null = company.payment_link_url;
    let paymentLinkType: string | null = company.payment_link_type;

    // Fetch payments & generate Stripe Checkout session concurrently
    const [paymentRows] = await Promise.all([
      sql`
        SELECT amount, kind, paid_on
        FROM payments
        WHERE project_id = ${project.id} AND company_id = ${company.id}
        ORDER BY paid_on ASC, id ASC
      `,
      (async () => {
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
          }
        }
      })(),
    ]);

    const customerAddress = [project.address_line_1, project.city, project.zip_code].filter(Boolean).join(', ');

    const kindLabels: Record<string, string> = {
      deposit: 'Deposit paid',
      balance: 'Balance paid',
    };

    const paymentBreakdown = paymentRows
      .filter((p: any) => parseFloat(p.amount) > 0)
      .map((p: any) => ({
        label: kindLabels[p.kind] || 'Payment received',
        amount: parseFloat(p.amount) || 0,
        date: fmtPaymentDate(p.paid_on),
      }));

    // ── 4. Generate & Stream PDF ────────────────────────────────────────────────
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
      terms: company.invoice_terms || undefined,
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