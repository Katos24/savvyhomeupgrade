// app/api/company/[slug]/email-preview/route.ts
//
// Live preview for Settings → Emails. Runs the SAME build functions the
// real emails use (lib/emails/customer.ts) with sample data and the
// template text currently in the editor (not the saved version), so the
// preview can't drift from what customers actually get.
//
// POST body: { templateKey, subject, body }

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { adminDb as sql } from '@/lib/db';
import {
  buildQuoteEmail,
  buildInvoiceEmail,
  buildScheduleEmail,
  buildPaymentReminderEmail,
  buildLeadConfirmationEmail,
  buildReviewRequestEmail,
  type BuiltEmail,
  type EmailCompany,
} from '@/lib/emails/customer';

const SAMPLE_ITEMS = [
  { description: 'Labor (4 hours)',    quantity: 4, unitPrice: 125,  amount: 500  },
  { description: 'Materials',          quantity: 1, unitPrice: 1200, amount: 1200 },
  { description: 'Service / trip fee', quantity: 1, unitPrice: 150,  amount: 150  },
  { description: 'Permits & fees',     quantity: 1, unitPrice: 650,  amount: 650  },
];
const SAMPLE_TOTAL = 2500;
const SAMPLE_DEPOSIT = 625;

// A date a week out, so sample due dates never look stale.
const isoInDays = (n: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // ── Auth: same check as the other company routes ──
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { templateKey, subject: rawSubject, body: rawBody } = await req.json();

    const rows = await sql`
      SELECT id, name, phone, logo_url, website, payment_link_url, payment_link_type
      FROM companies WHERE slug = ${slug} LIMIT 1
    ` as any[];
    const row = rows[0];
    if (!row) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    if (row.id !== decoded.companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const company: EmailCompany = row;
    // Current editor text, not the saved version
    const template = { subject: String(rawSubject ?? ''), body: String(rawBody ?? '') };
    const customerName = 'John Smith';
    const dueIn7 = isoInDays(7);

    let built: BuiltEmail;
    switch (templateKey) {
      case 'quote':
        built = buildQuoteEmail(company, template, {
          customerName,
          quoteTotal: SAMPLE_TOTAL,
          quoteItems: SAMPLE_ITEMS,
          projectDescription: 'roof_repair',
          depositAmount: SAMPLE_DEPOSIT,
          depositLabel: '25%',
          depositPayOnAccept: true,
          depositDueDate: dueIn7,
          // no quoteToken: Accept / Decline render as inert preview links
        });
        break;

      case 'invoice':
        built = buildInvoiceEmail(company, template, {
          customerName,
          invoiceNumber: 'INV-001',
          invoiceTotal: SAMPLE_TOTAL,
          invoiceItems: SAMPLE_ITEMS,
          dueDate: dueIn7,
          paymentLinkUrl: company.payment_link_url || 'https://example.com/pay',
          paymentLinkType: company.payment_link_type || 'stripe',
          depositAmount: SAMPLE_DEPOSIT,
          collectionKind: 'deposit',
          pdfUrl: '#',
        });
        break;

      case 'schedule':
        built = buildScheduleEmail(company, template, {
          customerName,
          scheduledDate: isoInDays(3),
          scheduledTime: '10:00',
          scheduledEndTime: '12:00',
          serviceAddress: '123 Main St, Anytown, NY 11742',
          assignedTo: 'Mike Johnson',
        });
        break;

      case 'payment':
        built = buildPaymentReminderEmail(company, template, {
          customerName,
          amountDue: SAMPLE_TOTAL - SAMPLE_DEPOSIT,
          dueDate: dueIn7,
          isOverdue: false,
          paymentLinkUrl: company.payment_link_url || 'https://example.com/pay',
          paymentLinkType: company.payment_link_type || 'stripe',
          collectionKind: 'balance',
        });
        break;

      case 'lead_confirmation':
        built = buildLeadConfirmationEmail(company, template, {
          customerName,
          category: 'roof_repair',
          description: 'Leak over the back bedroom after the last storm.',
          address: '123 Main St',
          city: 'Anytown',
          zipCode: '11742',
        });
        break;

      case 'job_completion':
        built = buildReviewRequestEmail(company, template, {
          customerName,
          displayCategory: 'Roof Repair',
          reviewUrl: '#',
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown template key' }, { status: 400 });
    }

    return NextResponse.json({ html: built.html, subject: built.subject });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json({ error: 'Failed to render preview' }, { status: 500 });
  }
}