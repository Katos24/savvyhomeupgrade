import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSchedulingConfig } from '@/lib/schedulingConfig';
import { toMinutes, getAssigneeAvailability } from '@/lib/scheduling';

const sql = neon(process.env.DATABASE_URL!);

// Answers "is THIS SPECIFIC PERSON already busy at this time" — different
// from the sibling ../route.ts, which answers "does the company as a whole
// have capacity," and structurally can't answer this: it never selects
// assigned_to at all, aggregating per-person identity away before it ever
// gets to counting conflicts. Built for the assignee picker specifically.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end'); // optional — point-in-time if absent
    const namesParam = url.searchParams.get('names'); // comma-separated
    const excludeProjectIdParam = url.searchParams.get('excludeProjectId');

    if (!date || !start || !namesParam) {
      return NextResponse.json(
        { success: false, error: 'date, start, and names are required' },
        { status: 400 }
      );
    }

    const candidateNames = namesParam.split(',').map((n) => n.trim()).filter(Boolean);
    if (candidateNames.length === 0) {
      return NextResponse.json({ success: true, availability: {} });
    }

    const companies = await sql`
      SELECT id, business_type FROM companies WHERE slug = ${slug} LIMIT 1
    `;
    if (!companies.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const company = companies[0];
    const { bufferMinutes } = getSchedulingConfig(company.business_type);

    // -1 as a sentinel that never matches a real id, rather than building
    // the WHERE clause conditionally — avoids relying on dynamic SQL
    // fragment composition this driver's exact support for isn't confirmed.
    const excludeId = excludeProjectIdParam ? parseInt(excludeProjectIdParam, 10) : -1;

    const bookingRows = await sql`
      SELECT
        p.id as project_id, p.assigned_to, p.additional_assignees,
        p.scheduled_time, p.scheduled_end_time,
        l.name as customer_name, l.category
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE p.company_id = ${company.id}
        AND p.scheduled_date::date = ${date}::date
        AND p.status != 'cancelled'
        AND p.scheduled_time IS NOT NULL
        AND p.id != ${excludeId}
    `;

    const bookings = bookingRows.map((row: any) => {
      let extra: string[] = [];
      try {
        const raw = row.additional_assignees;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        extra = Array.isArray(parsed) ? parsed : [];
      } catch {
        extra = [];
      }
      return {
        assignees: [row.assigned_to, ...extra].filter(Boolean),
        scheduled_time: row.scheduled_time,
        scheduled_end_time: row.scheduled_end_time,
        project_id: row.project_id,
        customer_name: row.customer_name,
        category: row.category,
      };
    });

    const newStart = toMinutes(start);
    const newEnd = end ? toMinutes(end) : newStart;

    const availability = getAssigneeAvailability(candidateNames, newStart, newEnd, bookings, bufferMinutes);

    return NextResponse.json({ success: true, availability, bufferMinutes });
  } catch (error) {
    console.error('Assignee availability error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 });
  }
}