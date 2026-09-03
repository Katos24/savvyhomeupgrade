import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

type Props = {
  params: Promise<{ slug: string }>;
};

// Reuse connection across requests
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    // ── 1. Auth check ──────────────────────────────────────────
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

    // ── 2. Verify user belongs to this company ─────────────────
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

    // ── 3. Parse Params ─────────────────────────────────────────
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = 20;
    const offset = (page - 1) * limit;

 const search = url.searchParams.get('search')?.trim() || '';
 
    // Whitelisted on purpose — column identifiers can't safely go through
    // the same ${value} interpolation as values, so this maps a small,
    // fixed set of allowed sort keys to real column references. Anything
    // not in this list (or no sort param at all) falls back to the
    // existing default order.
    const SORT_COLUMNS: Record<string, string> = {
      name: 'l.name',
      status: 'l.status',
      scheduled_date: 'p.scheduled_date',
      quote_total: 'p.quote_total',
      payment_amount: 'p.payment_amount',
    };
    const sortParam = url.searchParams.get('sort') || '';
    const sortColumn = SORT_COLUMNS[sortParam] || null;
    const sortDirection = url.searchParams.get('sortDir') === 'asc' ? 'ASC' : 'DESC';
        const status = url.searchParams.get('status')?.trim() || '';
    const category = url.searchParams.get('category')?.trim() || '';
    const assignee = url.searchParams.get('assignee')?.trim() || '';
    const payment = url.searchParams.get('payment')?.trim() || '';
    const timeFilter = url.searchParams.get('timeFilter')?.trim() || '';
    const startDate = url.searchParams.get('startDate')?.trim() || '';
    const endDate = url.searchParams.get('endDate')?.trim() || '';

    const calendarAll = url.searchParams.get('calendarAll') === 'true';
    const CALENDAR_SAFETY_LIMIT = 2000;
    const effectiveLimit = calendarAll ? CALENDAR_SAFETY_LIMIT : limit;

    // Global company-wide stats (revenue/active jobs/etc.) are the same
    // regardless of search/filters, and only the pre-split combined
    // dashboard view renders them. Computing them on every keystroke in
    // the Leads page's search box — which never displays them — was pure
    // waste. Opt-in, not opt-out, since fewer callers need this now.
    const includeStats = url.searchParams.get('includeStats') === 'true';

    const isScheduledToday = timeFilter === 'scheduled_today';
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // ── 4. Build created_at time boundary ───────────────────────
    let timeFrom: Date | null = null;
    let timeTo: Date | null = null;
    const now = new Date();

    if (!isScheduledToday) {
      if (startDate && endDate) {
        timeFrom = new Date(startDate);
        timeTo = new Date(endDate);
        timeTo.setHours(23, 59, 59, 999);
      } else if (startDate) {
        timeFrom = new Date(startDate);
      } else if (endDate) {
        timeTo = new Date(endDate);
        timeTo.setHours(23, 59, 59, 999);
      } else if (timeFilter === 'today') {
        timeFrom = new Date(now);
        timeFrom.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'week') {
        timeFrom = new Date(now);
        timeFrom.setDate(now.getDate() - now.getDay());
        timeFrom.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'month') {
        timeFrom = new Date(now.getFullYear(), now.getMonth(), 1);
      }
    }

    const fromISO = timeFrom ? timeFrom.toISOString() : '2000-01-01T00:00:00.000Z';
    const toISO = timeTo ? timeTo.toISOString() : '2099-12-31T23:59:59.999Z';

    // ── 5. Independent Queries ─────────────────────────────────
    // Skipped entirely (not even sent to Postgres) unless a caller asks
    // for it via includeStats=true.
    const statsPromise = includeStats
      ? sql`
          SELECT
            COUNT(*) as total_leads,
            COUNT(*) FILTER (WHERE l.status NOT IN ('completed','cancelled','lost')) as active_jobs,
            COALESCE(SUM(p.payment_amount::numeric), 0) as revenue,
            COALESCE(SUM(
              GREATEST(COALESCE(p.quote_total::numeric, 0) - COALESCE(p.payment_amount::numeric, 0), 0)
            ) FILTER (WHERE p.quote_total IS NOT NULL), 0) as pending
          FROM leads l
          LEFT JOIN projects p ON l.id = p.lead_id
          WHERE l.company_id = ${companyId}
            AND l.deleted = false
        `
      : Promise.resolve([null]);

    const statusCountsPromise = sql`
      SELECT status, COUNT(*) as count
      FROM leads
      WHERE company_id = ${companyId}
        AND deleted = false
      GROUP BY status
    `;

    // Each branch below folds the total count into the same query as the
    // page of rows via COUNT(*) OVER(), instead of running an identical
    // WHERE clause twice as a separate COUNT(*) query. Same filtering,
    // one query instead of two, for all three branches.
    let leadsPromise;

    if (isScheduledToday) {
      leadsPromise = sql`
        SELECT
          l.*,
          COUNT(*) OVER() as total_count,
          p.id as project_id, p.project_number, p.status as job_status,
          p.scheduled_date, p.scheduled_time, p.scheduled_end_time,
          p.event_location, p.assigned_to, p.additional_assignees,
          p.estimated_hours, p.actual_hours, p.quote_data, p.ai_brief,
          p.quote_total, p.deposit_type, p.deposit_value, p.quote_tax_rate,
          p.quote_sent_at, p.quote_accepted_at, p.quote_declined_at,
          p.schedule_emails, p.payment_status, p.quote_emails,
          p.payment_amount, p.paid_at, p.payment_date, p.payment_method,
          p.payment_notes, p.payment_due_date, p.reminder_sent_at,
          p.invoice_data, p.invoice_number, p.invoice_sent_at,
          p.stripe_payment_intent_id, p.refunded_amount, p.refunded_at,
          p.card_brand, p.card_last4, p.before_photos, p.after_photos,
          p.documents, p.completed_at as job_completed_at,
          p.notes as project_notes, p.tasks as project_tasks,
          p.follow_up_date, p.internal_notes as project_internal_notes,
          p.follow_up_notes
        FROM leads l
        LEFT JOIN projects p ON l.id = p.lead_id
        WHERE l.company_id = ${companyId}
          AND l.deleted = false
          AND p.scheduled_date IS NOT NULL
          AND CAST(p.scheduled_date AS date) = CAST(${todayDateStr} AS date)
          AND (${search} = '' OR (
            l.name        ILIKE ${'%' + search + '%'} OR
            l.email       ILIKE ${'%' + search + '%'} OR
            l.phone       ILIKE ${'%' + search + '%'} OR
            l.description ILIKE ${'%' + search + '%'}
          ))
          AND (${category} = ''
            OR LOWER(REPLACE(l.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
            OR LOWER(REPLACE(p.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
          )
          AND (${payment} = '' OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
        ORDER BY p.scheduled_time ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (calendarAll) {
      leadsPromise = sql`
        SELECT
          l.*,
          COUNT(*) OVER() as total_count,
          p.id as project_id, p.project_number, p.status as job_status,
          p.scheduled_date, p.scheduled_time, p.scheduled_end_time,
          p.event_location, p.assigned_to, p.additional_assignees,
          p.estimated_hours, p.actual_hours, p.quote_data, p.ai_brief,
          p.quote_total, p.deposit_type, p.deposit_value, p.quote_tax_rate,
          p.quote_sent_at, p.quote_accepted_at, p.quote_declined_at,
          p.schedule_emails, p.payment_status, p.quote_emails,
          p.payment_amount, p.paid_at, p.payment_date, p.payment_method,
          p.payment_notes, p.payment_due_date, p.reminder_sent_at,
          p.invoice_data, p.invoice_number, p.invoice_sent_at,
          p.stripe_payment_intent_id, p.refunded_amount, p.refunded_at,
          p.card_brand, p.card_last4, p.before_photos, p.after_photos,
          p.documents, p.completed_at as job_completed_at,
          p.notes as project_notes, p.tasks as project_tasks,
          p.follow_up_date, p.internal_notes as project_internal_notes,
          p.follow_up_notes
        FROM leads l
        LEFT JOIN projects p ON l.id = p.lead_id
        WHERE l.company_id = ${companyId}
          AND l.deleted = false
          AND p.scheduled_date IS NOT NULL
        ORDER BY p.scheduled_date ASC, p.scheduled_time ASC NULLS LAST
        LIMIT ${effectiveLimit}
      `;
    } else {
      leadsPromise = sql`
        SELECT
          l.*,
          COUNT(*) OVER() as total_count,
          p.id as project_id, p.project_number, p.status as job_status,
          p.scheduled_date, p.scheduled_time, p.scheduled_end_time,
          p.event_location, p.assigned_to, p.additional_assignees,
          p.estimated_hours, p.actual_hours, p.quote_data, p.ai_brief,
          p.quote_total, p.deposit_type, p.deposit_value, p.quote_tax_rate,
          p.quote_sent_at, p.quote_accepted_at, p.quote_declined_at,
          p.schedule_emails, p.payment_status, p.quote_emails,
          p.payment_amount, p.paid_at, p.payment_date, p.payment_method,
          p.payment_notes, p.payment_due_date, p.reminder_sent_at,
          p.invoice_data, p.invoice_number, p.invoice_sent_at,
          p.stripe_payment_intent_id, p.refunded_amount, p.refunded_at,
          p.card_brand, p.card_last4, p.before_photos, p.after_photos,
          p.documents, p.completed_at as job_completed_at,
          p.notes as project_notes, p.tasks as project_tasks,
          p.follow_up_date, p.internal_notes as project_internal_notes,
          p.follow_up_notes
        FROM leads l
        LEFT JOIN projects p ON l.id = p.lead_id
        WHERE l.company_id = ${companyId}
          AND l.deleted = false
          AND (${search} = '' OR (
            l.name        ILIKE ${'%' + search + '%'} OR
            l.email       ILIKE ${'%' + search + '%'} OR
            l.phone       ILIKE ${'%' + search + '%'} OR
            l.description ILIKE ${'%' + search + '%'}
          ))
          AND (${status} = '' OR l.status = ${status})
          AND (${category} = ''
            OR LOWER(REPLACE(l.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
            OR LOWER(REPLACE(p.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
          )
          AND (${payment} = '' OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
          AND l.created_at >= ${fromISO}
          AND l.created_at <= ${toISO}
        ORDER BY ${sortColumn ? sql.unsafe(`${sortColumn} ${sortDirection}, l.created_at DESC`) : sql.unsafe('l.created_at DESC')}
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // ── 6. Execute in Parallel ─────────────────────────────────
    const [statsResult, statusCountsResult, leads] = await Promise.all([
      statsPromise,
      statusCountsPromise,
      leadsPromise,
    ]);

    const globalStats = includeStats ? statsResult[0] : null;
    const statusCounts = statusCountsResult.reduce((acc: Record<string, number>, row: any) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});
    // COUNT(*) OVER() puts the total on every returned row — read it off
    // the first one. Zero rows means zero total (there's no row to read
    // total_count from, and there's nothing to paginate either).
    const total = leads.length > 0 ? parseInt((leads[0] as any).total_count, 10) : 0;
    const pages = Math.ceil(total / effectiveLimit);

    // ── 7. Process notes ──────────────────────────────────────
    const processedLeads = leads.map((lead: any) => {
      let notes: any[] = [];
      if (lead.project_notes) {
        try {
          notes = typeof lead.project_notes === 'string'
            ? JSON.parse(lead.project_notes)
            : lead.project_notes;
        } catch { notes = []; }
      }
      notes.sort((a: any, b: any) =>
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
      // total_count was only ever needed to compute `total` above — strip
      // it back out so it doesn't leak into the lead objects the client sees.
      const { project_notes, total_count, ...leadWithoutProjectNotes } = lead;
      return { ...leadWithoutProjectNotes, notes: JSON.stringify(notes) };
    });

    return NextResponse.json({
      success: true,
      leads: processedLeads,
      pagination: { page, pages, total, limit: effectiveLimit },
      statusCounts,
      globalStats,
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}