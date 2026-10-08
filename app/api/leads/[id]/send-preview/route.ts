// GET /api/leads/[id]/send-preview
//
// What the "Send Quote?" popup needs to tell the contractor exactly what the
// customer will get and what happens when they answer. Uses the SAVED quote,
// which is what send_quote_to_customer actually emails.
// Read only. Nothing is sent from here.

import { getJwtSecret } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getDepositAmount } from '@/lib/billing';

const sql = neon(process.env.DATABASE_URL!);

export type QuoteSendPreview = {
  total: number;
  itemCount: number;
  deposit: { amount: number; label?: string } | null;
  /** Company switch: deposit request goes out automatically on accept. */
  autoDeposit: boolean;
  /** Stripe can take card payments, so the deposit email gets a Pay button. */
  payLink: boolean;
  acceptedAt: string | null;
  declinedAt: string | null;
  depositPaid: boolean;
  /** Net amount collected so far (payments minus refunds). */
  paidAmount: number;
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
      SELECT l.company_id,
             p.quote_total, p.quote_data, p.deposit_type, p.deposit_value, p.deposit_paid_at, p.payment_amount,
             p.quote_accepted_at, p.quote_declined_at,
             c.on_accept_collect, c.stripe_payment_status
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      LEFT JOIN companies c ON l.company_id = c.id
      WHERE l.id = ${leadId}
      LIMIT 1
    `;
    const r = rows[0];
    if (!r || r.company_id !== user.company_id) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const total = parseFloat(r.quote_total || '0') || 0;
    const items = (() => {
      try {
        const v = typeof r.quote_data === 'string' ? JSON.parse(r.quote_data) : r.quote_data;
        return Array.isArray(v) ? v : [];
      } catch {
        return [];
      }
    })();

    // Same rule the quote email uses to show deposit rows.
    const depAmount = getDepositAmount({ total, depositType: r.deposit_type, depositValue: r.deposit_value });
    const pct = parseFloat(r.deposit_value || '0');
    const deposit =
      depAmount > 0 && depAmount < total
        ? { amount: depAmount, label: r.deposit_type === 'percent' && pct > 0 ? `${pct}%` : undefined }
        : null;

    const preview: QuoteSendPreview = {
      total,
      itemCount: items.length,
      deposit,
      autoDeposit: r.on_accept_collect === 'deposit',
      payLink: r.stripe_payment_status === 'active',
      acceptedAt: r.quote_accepted_at ? new Date(r.quote_accepted_at).toISOString() : null,
      declinedAt: r.quote_declined_at ? new Date(r.quote_declined_at).toISOString() : null,
      depositPaid: !!r.deposit_paid_at,
      paidAmount: parseFloat(r.payment_amount || '0') || 0,
    };

    return NextResponse.json({ success: true, preview });
  } catch (err) {
    console.error('send-preview failed:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}