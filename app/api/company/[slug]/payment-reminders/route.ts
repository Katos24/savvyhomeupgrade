import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';
import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, type PlanTier } from '@/lib/permissions';
import { getBillingState, getAmountDueNow } from '@/lib/billing';

// Reuse single connection across warm lambdas
const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ slug: string }> };

/* ═══════════════ GET ═══════════════ */

export async function GET(req: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Single query: verify slug ownership & get company + plan ──────────────
    const companies = await sql`
      SELECT c.id, c.plan_tier
      FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    
    if (!companies[0]) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const company = companies[0];

    if (!can((company.plan_tier ?? 'free') as PlanTier, 'send_payment_reminder')) {
      const requiredPlan = FEATURE_PLAN_MAP.send_payment_reminder;
      return NextResponse.json({
        success: false,
        error: `Payment reminders are available on the ${PLAN_CONFIG[requiredPlan].label} plan`,
        upgrade_required: true,
        required_plan: requiredPlan,
      }, { status: 403 });
    }

    const companyId = company.id;
    const url = new URL(req.url);
    const showAll = url.searchParams.get('all') === 'true';

    // ── Fetch Reminders ────────────────────────────────────────────────────────
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
        p.deposit_paid_at,
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
      const quoteTotal = parseFloat(r.quote_total || '0');
      const collected = parseFloat(r.payment_amount || '0');
      // Was its own inline copy using "collected === 0" as the satisfaction
      // check — the OLDEST, most naive version of this bug found across the
      // app: it flipped to "balance" the instant ANY payment landed, even a
      // single cent toward a much larger deposit. Now reads from
      // lib/billing.ts like everywhere else, sticky-aware via
      // deposit_paid_at.
      const billing = getBillingState({
        total: quoteTotal,
        paidAmount: collected,
        depositType: r.deposit_type,
        depositValue: r.deposit_value,
        depositPaidAt: r.deposit_paid_at,
      });

      return {
        ...r,
        amount_due: Math.round(billing.amountDueNow * 100) / 100,
        is_deposit: billing.collectionKind === 'deposit',
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

/* ═══════════════ POST ═══════════════ */

export async function POST(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { lead_id, project_id } = body;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── Single query: Auth check & Fetch project + company + dedup in 1 roundtrip ──
    const result = await sql`
      SELECT
        l.name as customer_name,
        l.email as customer_email,
        p.payment_due_date::text as payment_due_date,
        p.payment_amount,
        p.quote_total,
        p.deposit_type,
        p.deposit_value,
        p.deposit_paid_at,
        p.reminder_sent_at,
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
      JOIN users u ON u.company_id = c.id
      WHERE p.id = ${project_id}
        AND l.id = ${lead_id}
        AND c.slug = ${slug}
        AND u.id = ${decoded.userId}
      LIMIT 1
    `;

    if (!result[0]) {
      return NextResponse.json({ success: false, error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const r = result[0];

    // ── Server-side plan check ────────────────────────────────────────────────
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
    if (r.reminder_sent_at) {
      const hoursSince = (Date.now() - new Date(r.reminder_sent_at).getTime()) / (1000 * 60 * 60);
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
    // Was "paid > 0 ? remaining : quoteTotal" — completely ignored deposit
    // terms in this fallback. If Stripe wasn't connected, or the checkout
    // call below failed, THIS wrong number is what actually went into the
    // reminder email — a deposit-based job would get reminded for the full
    // remaining balance instead of just the deposit shortfall. Now
    // deposit-aware and sticky via deposit_paid_at, same as every other
    // surface. Still gets overridden below if the Stripe checkout succeeds,
    // same as before — this only matters as the fallback.
    let amountDue = getAmountDueNow({
      total: quoteTotal,
      paidAmount: paid,
      depositType: r.deposit_type,
      depositValue: r.deposit_value,
      depositPaidAt: r.deposit_paid_at,
    });
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
          amountDue = checkout.amount;
        }
      } catch (stripeErr: any) {
        console.error('Reminder checkout session failed:', stripeErr.message);
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
        companyId:     r.company_id,
        amountDue,
        dueDate:       r.payment_due_date,
        isOverdue,
        paymentLinkUrl,
        paymentLinkType,
        collectionKind,
      });
    } catch (emailError: any) {
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
      console.error('⚠️ Failed to log reminder to outbox (email still sent):', outboxErr);
    }

    // ── Update reminder_sent_at on the project ────────────────────────────────
    await sql`
      UPDATE projects
      SET reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = ${project_id} AND company_id = ${r.company_id}
    `;

    return NextResponse.json({ success: true, message: 'Reminder sent!' });

  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reminder' }, { status: 500 });
  }
}