import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type Props = {
  params: Promise<{ slug: string }>
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    // ── Auth check ──────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let decoded: any;
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET is not set');
      decoded = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // ── Verify user belongs to this company ─────────────────
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

    // ── Parse params ─────────────────────────────────────────
    const url        = new URL(request.url);
    const page       = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit      = 20;
    const offset     = (page - 1) * limit;
    const search     = url.searchParams.get('search')?.trim()     || '';
    const status     = url.searchParams.get('status')?.trim()     || '';
    const category   = url.searchParams.get('category')?.trim()   || '';
    const assignee   = url.searchParams.get('assignee')?.trim()   || '';
    const payment    = url.searchParams.get('payment')?.trim()    || '';
    const timeFilter = url.searchParams.get('timeFilter')?.trim() || '';
    const startDate  = url.searchParams.get('startDate')?.trim()  || '';
    const endDate    = url.searchParams.get('endDate')?.trim()    || '';

    // ── Scheduled Today special case ──────────────────────────
    const isScheduledToday = timeFilter === 'scheduled_today';
    const today = new Date();
    const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // ── Build created_at time boundary (standard filters) ─────
    let timeFrom: Date | null = null;
    let timeTo:   Date | null = null;
    const now = new Date();

    if (!isScheduledToday) {
      if (startDate && endDate) {
        timeFrom = new Date(startDate);
        timeTo   = new Date(endDate);
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
    const toISO   = timeTo   ? timeTo.toISOString()   : '2099-12-31T23:59:59.999Z';

    // ── Build all independent query promises (not awaited yet) ─

    const statsPromise = sql`
      SELECT
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE l.status NOT IN ('completed','cancelled','lost')) as active_jobs,
        COALESCE(SUM(p.quote_total::numeric) FILTER (WHERE p.payment_status = 'paid'), 0) as revenue,
        COALESCE(SUM(p.quote_total::numeric) FILTER (WHERE p.payment_status != 'paid' AND p.quote_total IS NOT NULL), 0) as pending
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
    `;

    const statusCountsPromise = sql`
      SELECT status, COUNT(*) as count
      FROM leads
      WHERE company_id = ${companyId}
        AND deleted = false
      GROUP BY status
    `;

    let countPromise;
    let leadsPromise;

    if (isScheduledToday) {
      // ── Path A: Scheduled Today — filter by p.scheduled_date ──
      countPromise = sql`
        SELECT COUNT(*) as total
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
          AND (${payment} = ''  OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
      `;

      leadsPromise = sql`
        SELECT
          l.*,
          p.id                     as project_id,
          p.project_number,
          p.status                 as job_status,
          p.scheduled_date,
          p.scheduled_time,
          p.assigned_to,
          p.estimated_hours,
          p.actual_hours,
          p.quote_data,
          p.ai_brief,
          p.quote_total,
          p.quote_data,
          p.quote_sent_at,
          p.quote_accepted_at,
          p.quote_declined_at,
          p.schedule_emails,
          p.payment_status,
          p.quote_emails,
          p.payment_amount,
          p.paid_at,
          p.payment_date,
          p.payment_method,
          p.payment_notes,
          p.payment_due_date,
          p.reminder_sent_at,
           p.invoice_data,
          p.invoice_number,
          p.invoice_sent_at,
          p.stripe_payment_intent_id,
          p.refunded_amount,
          p.refunded_at,
          p.card_brand,
          p.card_last4,
          p.before_photos,
          p.after_photos,
          p.documents,
          p.completed_at           as job_completed_at,
          p.notes                  as project_notes,
          p.tasks                  as project_tasks,
          p.follow_up_date,
          p.internal_notes         as project_internal_notes,
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
          AND (${payment} = ''  OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
        ORDER BY p.scheduled_time ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;

    } else {
      // ── Path B: Standard filters — filter by l.created_at ─────
      countPromise = sql`
        SELECT COUNT(*) as total
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
          AND (${status} = ''   OR l.status = ${status})
          AND (${category} = ''
            OR LOWER(REPLACE(l.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
            OR LOWER(REPLACE(p.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
          )
          AND (${payment} = ''  OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
          AND l.created_at >= ${fromISO}
          AND l.created_at <= ${toISO}
      `;

      leadsPromise = sql`
        SELECT
          l.*,
          p.id                     as project_id,
          p.project_number,
          p.status                 as job_status,
          p.scheduled_date,
          p.scheduled_time,
          p.assigned_to,
          p.estimated_hours,
          p.actual_hours,
          p.quote_data,
          p.ai_brief,
          p.quote_total,
          p.quote_sent_at,
          p.quote_accepted_at,
          p.quote_declined_at,
          p.schedule_emails,
          p.payment_status,
          p.quote_emails,
          p.payment_amount,
          p.paid_at,
          p.payment_date,
          p.payment_method,
          p.payment_notes,
          p.payment_due_date,
          p.reminder_sent_at,
        p.invoice_data,
          p.invoice_number,
          p.invoice_sent_at,
          p.stripe_payment_intent_id,
          p.refunded_amount,
          p.refunded_at,
          p.before_photos,
          p.after_photos,
          p.documents,
          p.completed_at           as job_completed_at,
          p.notes                  as project_notes,
          p.tasks                  as project_tasks,
          p.follow_up_date,
          p.internal_notes         as project_internal_notes,
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
          AND (${status} = ''   OR l.status = ${status})
          AND (${category} = ''
            OR LOWER(REPLACE(l.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
            OR LOWER(REPLACE(p.category, ' ', '_')) = LOWER(REPLACE(${category}, ' ', '_'))
          )
          AND (${payment} = ''  OR p.payment_status = ${payment})
          AND (
            ${assignee} = '' OR
            (${assignee} = 'unassigned' AND p.assigned_to IS NULL) OR
            p.assigned_to = ${assignee}
          )
          AND l.created_at >= ${fromISO}
          AND l.created_at <= ${toISO}
        ORDER BY l.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    // ── Run all four independent queries in parallel ─────────
    const [statsResult, statusCountsResult, countResult, leads] = await Promise.all([
      statsPromise,
      statusCountsPromise,
      countPromise,
      leadsPromise,
    ]);

    const globalStats = statsResult[0];
    const statusCounts = statusCountsResult.reduce((acc: Record<string, number>, row: any) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
    const total = parseInt(countResult[0].total);

    const pages = Math.ceil(total / limit);

    // ── Process notes ─────────────────────────────────────────
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
      const { project_notes, ...leadWithoutProjectNotes } = lead;
      return { ...leadWithoutProjectNotes, notes: JSON.stringify(notes) };
    });

    return NextResponse.json({
      success: true,
      leads: processedLeads,
      pagination: { page, pages, total, limit },
      statusCounts,
      globalStats,
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}