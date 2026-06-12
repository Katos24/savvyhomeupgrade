import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

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
             email_brand_color_1, email_brand_color_2, plan_tier, referred_by_code
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
        p.id, p.invoice_number, p.quote_total, p.quote_data,
        p.payment_status, p.payment_amount, p.payment_due_date,
        p.invoice_sent_at, p.created_at,
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

    const customerAddress = [project.address_line_1, project.city, project.zip_code].filter(Boolean).join(', ');

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
      total: parseFloat(project.quote_total || '0'),
      paymentLinkUrl: company.payment_link_url || undefined,
      paymentLinkType: company.payment_link_type || undefined,
    });

    const filename = `Invoice-${project.invoice_number || 'INV'}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}