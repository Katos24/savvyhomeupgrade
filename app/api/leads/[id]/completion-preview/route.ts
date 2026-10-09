// GET /api/leads/[id]/completion-preview
//
// Tells the "Complete job" popup exactly what will happen when the job is
// marked completed, using the same rules the server uses when it happens:
//   - final invoice: the same checks as lib/sendCollectionInvoice.ts
//     (company switch, plan, amount left, email, line items, already sent)
//   - review request: the same checks as update_status (email, already sent),
//     plus plan and a saved Google review link.
// Read only. Nothing is sent from here.

import { getJwtSecret } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { can, type PlanTier } from '@/lib/permissions';
import { getBillingState } from '@/lib/billing';

const sql = neon(process.env.DATABASE_URL!);

export type CompletionPreview = {
  invoice:
    | { state: 'will_send'; amount: number; kind: 'deposit' | 'balance' | 'full'; email: string; payLink: boolean }
    | { state: 'off' | 'plan' | 'paid' | 'no_email' | 'no_items' }
    | { state: 'already_sent'; sentAt: string };
  review:
    | { state: 'can_send'; email: string }
    | { state: 'plan' | 'no_email' | 'no_link' }
    | { state: 'already_sent'; sentAt: string };
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const leadId = parseInt(id, 10);
    if (!Number.isFinite(leadId)) {
      return NextResponse.json({ success: false, error: 'Bad id' }, { status: 400 });
    }

    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await sql`SELECT id, company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    const user = users[0];
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const rows = await sql`
      SELECT l.id, l.email, l.company_id,
             p.id AS project_id, p.quote_total, p.payment_amount, p.quote_data, p.invoice_data,
             p.deposit_type, p.deposit_value, p.deposit_paid_at, p.review_request_sent_at,
             c.plan_tier, c.auto_send_balance_on_complete, c.google_review_url,
             CASE WHEN c.card_payments_enabled = false THEN 'off' ELSE c.stripe_payment_status END AS stripe_payment_status
                   FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN companies c ON l.company_id = c.id
      WHERE l.id = ${leadId}
      LIMIT 1
    `;
    const r = rows[0];
    // Same "not found" for another company's lead, so ids can't be probed.
    if (!r || r.company_id !== user.company_id) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const plan = (r.plan_tier ?? 'free') as PlanTier;
    const email: string = r.email || '';

    // ── Final invoice ──
    let invoice: CompletionPreview['invoice'];
    const items = (() => {
      try {
        const raw = r.invoice_data || r.quote_data;
        if (!raw) return [];
        const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    })();
    const billing = getBillingState(
      {
        total: parseFloat(r.quote_total || '0') || 0,
        paidAmount: parseFloat(r.payment_amount || '0') || 0,
        depositType: r.deposit_type as any,
        depositValue: r.deposit_value,
        depositPaidAt: r.deposit_paid_at,
      },
      true
    );

    if (!r.auto_send_balance_on_complete) invoice = { state: 'off' };
    else if (!can(plan, 'send_invoice_email')) invoice = { state: 'plan' };
    else if (!r.project_id || billing.amountDueNow <= 0 || billing.remaining <= 0) invoice = { state: 'paid' };
    else if (!email) invoice = { state: 'no_email' };
    else if (items.length === 0) invoice = { state: 'no_items' };
    else {
      const inv = await sql`SELECT sent_at FROM invoices WHERE project_id = ${r.project_id} LIMIT 1`;
      if (inv[0]?.sent_at) invoice = { state: 'already_sent', sentAt: new Date(inv[0].sent_at).toISOString() };
      else
        invoice = {
          state: 'will_send',
          amount: billing.amountDueNow,
          kind: billing.collectionKind,
          email,
          payLink: r.stripe_payment_status === 'active',
        };
    }

    // ── Google review request ──
    let review: CompletionPreview['review'];
    if (r.review_request_sent_at) review = { state: 'already_sent', sentAt: new Date(r.review_request_sent_at).toISOString() };
    else if (!can(plan, 'google_reviews')) review = { state: 'plan' };
    else if (!email) review = { state: 'no_email' };
    else if (!r.google_review_url) review = { state: 'no_link' };
    else review = { state: 'can_send', email };

    return NextResponse.json({ success: true, preview: { invoice, review } satisfies CompletionPreview });
  } catch (err) {
    console.error('completion-preview failed:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}