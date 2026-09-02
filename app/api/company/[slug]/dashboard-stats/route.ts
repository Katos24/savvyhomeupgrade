import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

type Props = { params: Promise<{ slug: string }> };

const sql = neon(process.env.DATABASE_URL!);

// Every number here is a genuine query against fields already used
// elsewhere in this app (quote_sent_at/quote_accepted_at from the leads
// route, the payments table from the Stripe work, scheduled_date/time from
// Calendar). Two things from the reference screenshot are NOT here:
//
// - "New Requests" — no corresponding feature/table exists anywhere I've
//   seen in this codebase. Not stubbed with fake data; just omitted from
//   the response entirely so the frontend can't accidentally treat a
//   placeholder zero as a real metric.
// - "Route" building — no route/sequencing system exists either. Today's
//   Schedule below is jobs-only, no route panel.
export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const companies = await sql`
      SELECT c.id FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const companyId = companies[0].id;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // ── Leads: new this week ──
    const leadsPromise = sql`
      SELECT COUNT(*) as new_this_week
      FROM leads
      WHERE company_id = ${companyId}
        AND deleted = false
        AND created_at >= ${weekStart.toISOString()}
    `;

    // ── Estimates: open (sent, no accept/decline yet) vs. accepted ──
    // Assumption: quote_sent_at / quote_accepted_at / quote_declined_at
    // track the estimate lifecycle — these fields exist and are selected
    // elsewhere (the leads route), but I haven't seen the code that sets
    // quote_declined_at, so verify a declined quote actually populates it
    // rather than just leaving quote_accepted_at null forever.
    const estimatesPromise = sql`
      SELECT
        COUNT(*) FILTER (WHERE p.quote_sent_at IS NOT NULL AND p.quote_accepted_at IS NULL AND p.quote_declined_at IS NULL) as open_estimates,
        COUNT(*) FILTER (WHERE p.quote_accepted_at IS NOT NULL) as accepted_estimates
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
    `;

    // ── Jobs: active count + contract value of active jobs ──
    // Same 'completed'/'cancelled'/'lost' convention already used in
    // DashboardStats.tsx and the leads route — a stable status VALUE
    // regardless of what label a company customizes it to display as.
    const jobsPromise = sql`
      SELECT
        COUNT(*) FILTER (WHERE p.status NOT IN ('completed','cancelled','lost')) as active_jobs,
        COALESCE(SUM(p.quote_total::numeric) FILTER (WHERE p.status NOT IN ('completed','cancelled','lost')), 0) as active_jobs_value
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
    `;

    // ── Invoices: awaiting payment / draft / past due ──
    const invoicesPromise = sql`
      SELECT
        COUNT(*) FILTER (WHERE p.invoice_sent_at IS NOT NULL AND (p.payment_status IS DISTINCT FROM 'paid')) as awaiting_payment,
        COUNT(*) FILTER (WHERE p.invoice_number IS NOT NULL AND p.invoice_sent_at IS NULL) as draft_invoices,
        COUNT(*) FILTER (WHERE p.payment_due_date IS NOT NULL AND p.payment_due_date < NOW() AND (p.payment_status IS DISTINCT FROM 'paid')) as past_due
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
    `;

    // ── Today's Schedule: jobs only, no route panel (see file comment) ──
    const schedulePromise = sql`
      SELECT
        l.id as lead_id, l.name as customer_name, l.category,
        p.id as project_id, p.scheduled_time, p.scheduled_end_time,
        p.status as job_status, p.quote_total
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.scheduled_date IS NOT NULL
        AND CAST(p.scheduled_date AS date) = CAST(${todayDateStr} AS date)
      ORDER BY p.scheduled_time ASC NULLS LAST
    `;

    // ── Revenue this month: from the payments ledger, not projects.payment_amount ──
    // projects.payment_amount is a running lifetime total per project — summing
    // it across projects would double-count payments from prior months. The
    // payments table (used by the Stripe webhook/BillingSection work) has one
    // row per transaction with its own paid_on date, including negative-amount
    // refund rows, so this nets out correctly.
    const revenuePromise = sql`
      SELECT COALESCE(SUM(amount), 0) as revenue_this_month
      FROM payments
      WHERE company_id = ${companyId}
        AND paid_on >= ${monthStart.toISOString().split('T')[0]}
    `;

    // ── Ready to Invoice: completed jobs with no invoice sent yet ──
    const readyToInvoicePromise = sql`
      SELECT
        COUNT(*) as ready_count,
        COALESCE(SUM(p.quote_total::numeric), 0) as ready_value
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.status = 'completed'
        AND p.invoice_sent_at IS NULL
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
    `;

    // Recent payments — real transactions from the ledger, not a project's
    // running total. Excludes refunds ('money that came in', not money
    // going back out) — a refund showing up in a "recent payments" list
    // would read as new revenue when it's the opposite.
    //
    // pr.payment_status reflects the project's CURRENT state (as of now),
    // not necessarily "was this the exact payment that completed it" — for
    // an older row where a later payment finished the job, this still
    // correctly shows the job as paid, just not credited to this specific
    // row's payment as the one that tipped it over. Good enough for an
    // at-a-glance list; a precise per-row running total would need a
    // window function and isn't worth the complexity here.
    const recentPaymentsPromise = sql`
      SELECT
        pay.id, pay.amount, pay.kind, pay.method, pay.paid_on,
        l.name as customer_name, pr.payment_status
      FROM payments pay
      JOIN projects pr ON pay.project_id = pr.id
      JOIN leads l ON pr.lead_id = l.id
      WHERE pay.company_id = ${companyId}
        AND pay.kind <> 'refund'
      ORDER BY pay.paid_on DESC, pay.created_at DESC
      LIMIT 6
    `;

    const [
      leadsResult, estimatesResult, jobsResult, invoicesResult,
      schedule, revenueResult, readyResult, recentPayments,
    ] = await Promise.all([
      leadsPromise, estimatesPromise, jobsPromise, invoicesPromise,
      schedulePromise, revenuePromise, readyToInvoicePromise, recentPaymentsPromise,
    ]);

    return NextResponse.json({
      success: true,
      leads: {
        new_this_week: parseInt(leadsResult[0]?.new_this_week || '0', 10),
      },
      estimates: {
        open: parseInt(estimatesResult[0]?.open_estimates || '0', 10),
        accepted: parseInt(estimatesResult[0]?.accepted_estimates || '0', 10),
      },
      jobs: {
        active: parseInt(jobsResult[0]?.active_jobs || '0', 10),
        active_value: parseFloat(jobsResult[0]?.active_jobs_value || '0'),
      },
      invoices: {
        awaiting_payment: parseInt(invoicesResult[0]?.awaiting_payment || '0', 10),
        draft: parseInt(invoicesResult[0]?.draft_invoices || '0', 10),
        past_due: parseInt(invoicesResult[0]?.past_due || '0', 10),
      },
      todays_schedule: schedule,
      revenue_this_month: parseFloat(revenueResult[0]?.revenue_this_month || '0'),
      ready_to_invoice: {
        count: parseInt(readyResult[0]?.ready_count || '0', 10),
        value: parseFloat(readyResult[0]?.ready_value || '0'),
      },
      recent_payments: recentPayments,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}