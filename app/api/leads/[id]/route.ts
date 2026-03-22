import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

  // REPLACE WITH:
    const leads = await sql`
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
      LEFT JOIN projects p ON p.lead_id = l.id
      WHERE l.id = ${parseInt(id)} AND l.deleted = false
      LIMIT 1
    `;

    if (!leads.length) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, lead: leads[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}