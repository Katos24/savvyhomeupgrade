import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

/** Postgres returns NUMERIC as a string; the client does arithmetic on these. */
function shapePayment(row: any) {
  return {
    id: row.id,
    amount: Number(row.amount) || 0,
    invoiced_total: row.invoiced_total === null ? null : Number(row.invoiced_total),
    method: row.method,
    kind: row.kind,
    paid_on: row.paid_on,
    card_brand: row.card_brand,
    card_last4: row.card_last4,
    note: row.note,
    recorded_by: row.recorded_by,
    is_stripe: !!row.stripe_payment_intent_id,
    stripe_payment_intent_id: row.stripe_payment_intent_id,
    reversed_payment_id: row.reversed_payment_id,
    created_at: row.created_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (!leadId || Number.isNaN(leadId)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    // ── 1. Auth & Company Scope Check ──────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, secret) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const users = await sql`
      SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const companyId = users[0]?.company_id;
    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Fetch Lead & Joined Project Data ────────────────────
    const leads = await sql`
      SELECT
        l.*,
        p.id as project_id,
        p.project_number,
        p.status as job_status,
        p.scheduled_date,
        p.scheduled_time,
        p.scheduled_end_time,
        p.event_location,
        p.assigned_to,
        p.additional_assignees,
        p.estimated_hours,
        p.actual_hours,
        p.quote_data,
        p.ai_brief,
        p.quote_total,
        p.quote_tax_rate,
        p.deposit_type,
        p.deposit_value,
        p.quote_sent_at as project_quote_sent_at,
        p.quote_accepted_at as project_quote_accepted_at,
        p.quote_declined_at as project_quote_declined_at,
        p.schedule_emails,
        p.payment_status,
        p.quote_emails,
        p.payment_amount,
        p.paid_at,
        p.payment_date,
        p.payment_method,
        p.payment_notes,
        p.payment_due_date,
        p.card_brand,
        p.card_last4,
        p.stripe_payment_intent_id,
        p.refunded_amount,
        p.refunded_at,
        p.reminder_sent_at,
        p.invoice_data,
        p.invoice_number,
        p.invoice_sent_at,
        p.before_photos,
        p.after_photos,
        p.documents,
        p.completed_at as job_completed_at,
        p.notes as project_notes,
        p.internal_notes,
        p.tasks as project_tasks,
        p.follow_up_date,
        p.internal_notes as project_internal_notes,
        p.follow_up_notes
      FROM leads l
      LEFT JOIN projects p ON p.lead_id = l.id
      WHERE l.id = ${leadId}
        AND l.company_id = ${companyId}
        AND l.deleted = false
      LIMIT 1
    `;

    if (!leads.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const lead = leads[0];
    const projectId = lead.project_id;

    // ── 3. Parallel Fetch Payments & Email Activity ───────────
    const [paymentRows, activityRows] = await Promise.all([
      projectId
        ? sql`
            SELECT id, amount, invoiced_total, method, kind, paid_on,
                   card_brand, card_last4, note, recorded_by,
                   stripe_payment_intent_id, reversed_payment_id, created_at
            FROM payments
            WHERE project_id = ${projectId} AND company_id = ${companyId}
            ORDER BY paid_on DESC, id DESC
          `
        : Promise.resolve([] as any[]),
      sql`
        SELECT id, type, status, error_message,
               sent_by_email, sent_by_name, subject,
               created_at, sent_at, metadata,
               (html_body IS NOT NULL AND html_body <> '') AS has_body
        FROM email_outbox
        WHERE lead_id = ${leadId}
          AND company_id = ${companyId}
          AND type IN ('invoice', 'payment_reminder')
        ORDER BY created_at DESC
        LIMIT 50
      `,
    ]);

    return NextResponse.json({
      success: true,
      lead,
      payments: (paymentRows as any[]).map(shapePayment),
      activity: activityRows,
    });
  } catch (error) {
    console.error('Get lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}