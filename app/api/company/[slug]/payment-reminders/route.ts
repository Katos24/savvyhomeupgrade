import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';

import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, type PlanTier } from '@/lib/permissions';

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const sql = neon(process.env.DATABASE_URL!);

    const companies = await sql`SELECT id, plan_tier FROM companies WHERE slug = ${slug}`;
    if (!companies[0]) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });

    if (!can((companies[0].plan_tier ?? 'free') as PlanTier, 'send_payment_reminder')) {
      const requiredPlan = FEATURE_PLAN_MAP.send_payment_reminder;
      return NextResponse.json({
        success: false,
        error: `Payment reminders are available on the ${PLAN_CONFIG[requiredPlan].label} plan`,
        upgrade_required: true,
        required_plan: requiredPlan,
      }, { status: 403 });
    }

    const companyId = companies[0].id;

    const url = new URL(req.url);
    const showAll = url.searchParams.get('all') === 'true';

    const reminders = await sql`
      SELECT
        l.id as lead_id,
        l.name as customer_name,
        l.email as customer_email,
        l.phone as customer_phone,
        p.id as project_id,
        p.project_number,
        p.payment_due_date::text as payment_due_date,
        p.payment_status,
        p.payment_amount,
        p.quote_total,
        p.deposit_type,
        p.deposit_value,
        p.reminder_sent_at
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND (p.payment_status IS NULL OR p.payment_status NOT IN ('paid'))
        AND p.quote_total IS NOT NULL
        AND (
          ${showAll} = true
          OR (
            p.payment_due_date IS NOT NULL
            AND p.payment_due_date <= NOW() + INTERVAL '7 days'
          )
        )
      ORDER BY p.payment_due_date ASC NULLS LAST
    `;

    const now = new Date();
    const result = reminders.map(r => {
      // Same deposit-aware "what's actually owed" logic used everywhere
      // else — deposit only if nothing's been collected yet and deposit
      // terms exist, otherwise the true remaining balance. Neither raw
      // payment_amount (what's been paid) nor quote_total (the full
      // amount) is the right number to show here on its own.
      const quoteTotal = parseFloat(r.quote_total || '0');
      const collected = parseFloat(r.payment_amount || '0');
      const depositValue = parseFloat(r.deposit_value || '0');
      const hasDepositTerms = !!r.deposit_type && depositValue > 0;
      const depositAmount = hasDepositTerms
        ? Math.min(
            r.deposit_type === 'percent' ? (quoteTotal * depositValue) / 100 : depositValue,
            quoteTotal
          )
        : 0;
      const amountDue = hasDepositTerms && collected === 0
        ? depositAmount
        : Math.max(quoteTotal - collected, 0);

      return {
        ...r,
        amount_due: Math.round(amountDue * 100) / 100,
        is_deposit: hasDepositTerms && collected === 0,
        is_overdue: new Date(r.payment_due_date) < now,
        reminder_sent_recently: r.reminder_sent_at
          ? (now.getTime() - new Date(r.reminder_sent_at).getTime()) < 24 * 60 * 60 * 1000
          : false,
      };
    });

    return NextResponse.json({ success: true, reminders: result });
  } catch (error) {
    console.error('❌ Error fetching payment reminders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
  }
}


export async function POST(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { lead_id, project_id } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // ── Fetch project + company data ──────────────────────────────────────────
    // NOTE: added c.id as company_id so we can log to email_outbox
    const result = await sql`
  SELECT
    l.name as customer_name,
    l.email as customer_email,
    p.payment_due_date::text as payment_due_date,
    p.payment_amount,
    p.quote_total,
  c.id as company_id,
    c.name as company_name,
    c.phone as company_phone,
    c.plan_tier,
    c.slug as company_slug,
    c.stripe_connect_account_id,
    c.stripe_payment_status,
    c.payment_link_url,
    c.payment_link_type
  FROM projects p
  JOIN leads l ON p.lead_id = l.id
  JOIN companies c ON l.company_id = c.id
  WHERE p.id = ${project_id}
    AND l.id = ${lead_id}
    AND c.slug = ${slug}
  LIMIT 1
`;

if (!result[0]) {
  return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
}

const r = result[0];

// Server-side plan check
if (!can((r.plan_tier ?? 'free') as PlanTier, 'send_payment_reminder')) {
  const requiredPlan = FEATURE_PLAN_MAP.send_payment_reminder;
  return NextResponse.json({
    success: false,
    error: `Payment reminders are available on the ${PLAN_CONFIG[requiredPlan].label} plan`,
    upgrade_required: true,
    required_plan: requiredPlan,
  }, { status: 403 });
}

  // ── Dedup check — don't send if reminder sent in last 24 hours ────────────
    const projectCheck = await sql`
      SELECT reminder_sent_at FROM projects WHERE id = ${project_id}
    `;
    if (projectCheck[0]?.reminder_sent_at) {
      const lastSent = new Date(projectCheck[0].reminder_sent_at);
      const hoursSince = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        return NextResponse.json({
          success: false,
          error: `A reminder was already sent ${Math.floor(hoursSince)} hours ago. Please wait 24 hours before sending another.`,
          too_soon: true,
        }, { status: 429 });
      }
    }

    // ── Calculate amount due ──────────────────────────────────────────────────
const quoteTotal  = parseFloat(r.quote_total  || '0');
const paid        = parseFloat(r.payment_amount || '0');
let amountDue     = paid > 0 ? Math.max(quoteTotal - paid, 0) : quoteTotal;
const isOverdue   = r.payment_due_date ? new Date(r.payment_due_date) < new Date() : false;
const daysOverdue = isOverdue && r.payment_due_date
  ? Math.floor((Date.now() - new Date(r.payment_due_date).getTime()) / 86400000)
  : 0;

let paymentLinkUrl: string | undefined = r.payment_link_url || undefined;
let paymentLinkType: string | undefined = r.payment_link_type || undefined;
let collectionKind: 'deposit' | 'balance' | undefined;

if (r.stripe_payment_status === 'active' && quoteTotal > 0) {
  try {
    const checkout = await getOrCreateCheckoutSession({
      projectId: project_id,
      connectedAccountId: r.stripe_connect_account_id,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      companySlug: r.company_slug,
      contractTotal: quoteTotal,
    });
    if (checkout.url) {
      paymentLinkUrl = checkout.url;
      paymentLinkType = 'stripe';
      collectionKind = checkout.kind ?? undefined;
      // Authoritative — this is what Stripe will actually charge. Without
      // this, the email displayed the naive full-or-remaining calculation
      // above even when the real session was for a deposit only.
      amountDue = checkout.amount;
    }
  } catch (stripeErr: any) {
    console.error('Reminder checkout session failed:', stripeErr.message);
    // Non-fatal — reminder still sends with the pre-checkout amountDue,
    // falling back to the static link if one exists.
  }
}

    // ── Send the email ────────────────────────────────────────────────────────
    let emailResult: any = null;
    try {
      emailResult = await sendPaymentReminderEmail({
  customerEmail: r.customer_email,
  customerName:  r.customer_name,
  companyName:   r.company_name,
  companyPhone:  r.company_phone,
  companyId: r.company_id,
  amountDue,
  dueDate:       r.payment_due_date,
  isOverdue,
  paymentLinkUrl,
  paymentLinkType,
  collectionKind,
});
    } catch (emailError: any) {
      // ── Log failed send to outbox ─────────────────────────────────────────
      try {
        await sql`
          INSERT INTO email_outbox (
            company_id, project_id, lead_id,
            type, to_email, to_name,
            status, error_message,
            sent_by_email, sent_by_name,
            metadata
          ) VALUES (
            ${r.company_id}, ${project_id}, ${lead_id},
            'payment_reminder',
            ${r.customer_email}, ${r.customer_name},
            'failed', ${emailError?.message || 'Unknown error'},
            'system', 'Automated Reminder',
            ${JSON.stringify({
              amount_due:   amountDue,
              days_overdue: daysOverdue,
              due_date:     r.payment_due_date,
              is_overdue:   isOverdue,
            })}::jsonb
          )
        `;
      } catch (outboxErr) {
        console.error('⚠️ Failed to log failed reminder to outbox:', outboxErr);
      }

      console.error('❌ Failed to send payment reminder email:', emailError);
      return NextResponse.json({ success: false, error: 'Failed to send reminder' }, { status: 500 });
    }

    // ── Log successful send to outbox ─────────────────────────────────────────
    try {
      await sql`
        INSERT INTO email_outbox (
          company_id, project_id, lead_id,
          type, to_email, to_name,
          subject, html_body,
          status,
          sent_by_email, sent_by_name,
          metadata
        ) VALUES (
          ${r.company_id}, ${project_id}, ${lead_id},
          'payment_reminder',
          ${r.customer_email}, ${r.customer_name},
          ${emailResult?.subject || `Payment Reminder — $${amountDue.toFixed(2)} due`},
          ${emailResult?.html    || ''},
          'sent',
          'system', 'Automated Reminder',
          ${JSON.stringify({
            amount_due:   amountDue,
            days_overdue: daysOverdue,
            due_date:     r.payment_due_date,
            is_overdue:   isOverdue,
            resend_id:    emailResult?.resendId || null,
          })}::jsonb
        )
      `;
    } catch (outboxErr) {
      // Don't fail the request — email already sent
      console.error('⚠️ Failed to log reminder to outbox (email still sent):', outboxErr);
    }

    // ── Update reminder_sent_at on the project ────────────────────────────────
    await sql`
      UPDATE projects
      SET reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = ${project_id}
    `;

    return NextResponse.json({ success: true, message: 'Reminder sent!' });

  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reminder' }, { status: 500 });
  }
}