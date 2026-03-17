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
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
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

// ── Pagination + search ──────────────────────────────────
const url = new URL(request.url);
const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
const search = url.searchParams.get('search')?.trim() || '';
const limit = 25;
const offset = (page - 1) * limit;

// ── Count total ──────────────────────────────────────────
const countResult = search ? await sql`
  SELECT COUNT(*) as total FROM leads
  WHERE company_id = ${companyId}
    AND deleted = false
    AND (
      name ILIKE ${'%' + search + '%'} OR
      email ILIKE ${'%' + search + '%'} OR
      phone ILIKE ${'%' + search + '%'} OR
      description ILIKE ${'%' + search + '%'}
    )
` : await sql`
  SELECT COUNT(*) as total FROM leads
  WHERE company_id = ${companyId} AND deleted = false
`;
const total = parseInt(countResult[0].total);
const pages = Math.ceil(total / limit);

// ── Fetch page ───────────────────────────────────────────
const leads = search ? await sql`
  SELECT
    l.*,
    p.id as project_id,
    p.project_number,
    p.status as job_status,
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
    p.invoice_sent_at,
    p.before_photos,
    p.after_photos,
    p.documents,
    p.completed_at as job_completed_at,
    p.notes as project_notes,
    p.tasks as project_tasks,
    p.follow_up_date,
    p.internal_notes as project_internal_notes,
    p.follow_up_notes
  FROM leads l
  LEFT JOIN projects p ON l.id = p.lead_id
  WHERE l.company_id = ${companyId}
    AND l.deleted = false
    AND (
      l.name ILIKE ${'%' + search + '%'} OR
      l.email ILIKE ${'%' + search + '%'} OR
      l.phone ILIKE ${'%' + search + '%'} OR
      l.description ILIKE ${'%' + search + '%'}
    )
  ORDER BY l.created_at DESC
  LIMIT 50
` : await sql`
  SELECT
    l.*,
    p.id as project_id,
    p.project_number,
    p.status as job_status,
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
    p.invoice_sent_at,
    p.before_photos,
    p.after_photos,
    p.documents,
    p.completed_at as job_completed_at,
    p.notes as project_notes,
    p.tasks as project_tasks,
    p.follow_up_date,
    p.internal_notes as project_internal_notes,
    p.follow_up_notes
  FROM leads l
  LEFT JOIN projects p ON l.id = p.lead_id
  WHERE l.company_id = ${companyId}
    AND l.deleted = false
  ORDER BY l.created_at DESC
  LIMIT ${limit} OFFSET ${offset}
`;
    // ── Process notes ────────────────────────────────────────
    const processedLeads = leads.map(lead => {
      let notes: any[] = [];
      if (lead.project_notes) {
        try {
          notes = typeof lead.project_notes === 'string'
            ? JSON.parse(lead.project_notes)
            : lead.project_notes;
        } catch {
          notes = [];
        }
      }
      notes.sort((a: any, b: any) =>
        new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
      );
      const { project_notes, ...leadWithoutProjectNotes } = lead;
      return {
        ...leadWithoutProjectNotes,
        notes: JSON.stringify(notes),
      };
    });

    return NextResponse.json({
      success: true,
      leads: processedLeads,
      pagination: { page, pages, total, limit },
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}