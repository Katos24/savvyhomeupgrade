import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

// Lightweight search for the "+ Add a job to this day" picker in
// Calendar's day drawer — deliberately separate from the main
// /leads route rather than adding a param to it: that route returns the
// full lead+project shape used everywhere else, which is far more than a
// simple name-search autocomplete needs. Scoped to jobs only (a project
// must already exist) — a raw, unconverted lead can't be scheduled at
// all, since update_project itself requires a project_id.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') || '').trim();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fresh re-verification of company membership, same pattern proven
    // correct in the team routes earlier — never trust a company claim
    // baked into the JWT at issue time.
    const access = await sql`
      SELECT c.id
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId} AND c.slug = ${slug}
      LIMIT 1
    `;
    if (access.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const companyId = access[0].id;

    const searchPattern = `%${search}%`;

    const jobs = await sql`
      SELECT
        p.id as project_id,
        l.id as lead_id,
        l.name as customer_name,
        COALESCE(p.category, l.category) as category,
        p.quote_total
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE p.company_id = ${companyId}
        AND l.deleted = false
        AND p.scheduled_date IS NULL
        AND (${search} = '' OR l.name ILIKE ${searchPattern})
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Unscheduled jobs search error:', error);
    return NextResponse.json({ success: false, error: 'Failed to search jobs' }, { status: 500 });
  }
}