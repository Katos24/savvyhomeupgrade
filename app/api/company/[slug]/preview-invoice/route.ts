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

    // Auth — must be a logged-in user belonging to this company
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const companies = await sql`
      SELECT name, phone, email, logo_url,
             email_brand_color_1, email_brand_color_2,
            stripe_connect_onboarded, stripe_payment_status
      FROM companies WHERE slug = ${slug} LIMIT 1
    `;
    if (!companies.length) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    const company = companies[0];

    // ── Sample data — no real project/lead involved ──
    const sampleLineItems = [
      { description: 'Service call & diagnostic', quantity: 1, unitPrice: 95, amount: 95 },
      { description: 'Replacement parts', quantity: 1, unitPrice: 240, amount: 240 },
      { description: 'Labor (2 hrs)', quantity: 2, unitPrice: 85, amount: 170 },
    ];
    const sampleTotal = sampleLineItems.reduce((s, i) => s + i.amount, 0);

    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 14);

    const { generateInvoicePDFBuffer } = await import('@/lib/generateInvoicePDFServer');
    const pdfBuffer = await generateInvoicePDFBuffer({
      invoiceNumber: 'SAMPLE-001',
      invoiceDate: today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      dueDate: due.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      companyName: company.name,
      companyPhone: company.phone || undefined,
      companyEmail: company.email || undefined,
      companyLogoUrl: company.logo_url || undefined,
      customerName: 'Jane Customer',
      customerEmail: 'jane@example.com',
      customerPhone: '5551234567',
      customerAddress: '123 Main St, Anytown, CA',
      lineItems: sampleLineItems,
      total: sampleTotal,
    paymentLinkUrl: company.stripe_payment_status === 'active' ? 'https://checkout.stripe.com/sample' : undefined,
paymentLinkType: company.stripe_payment_status === 'active' ? 'stripe' : undefined,
      brandColor1: company.email_brand_color_1 || undefined,
      brandColor2: company.email_brand_color_2 || undefined,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Sample-Invoice.pdf"',
      },
    });
  } catch (error) {
    console.error('Generate sample invoice PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate sample PDF' }, { status: 500 });
  }
}