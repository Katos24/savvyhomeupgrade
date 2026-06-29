import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Fail loudly server-side rather than silently falling back to a
      // known dev secret — a missing JWT_SECRET in production should be
      // a deploy-blocking config error, not something that quietly works
      // with a guessable key.
      console.error('JWT_SECRET is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (typeof decoded?.userId !== 'number') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const city = searchParams.get('city');
    const email = searchParams.get('email');
    const company_id_raw = searchParams.get('company_id');
    const exclude_raw = searchParams.get('exclude');

    if (!name || !city || !company_id_raw || !exclude_raw) {
      return NextResponse.json(
        { error: 'Missing required params: name, city, company_id, exclude' },
        { status: 400 }
      );
    }

    // Reject anything that isn't actually a clean positive integer instead
    // of letting parseInt silently coerce garbage into NaN and pass that
    // into the query — a malformed param should be a 400, not an
    // unhandled query failure surfaced as a generic 500.
    const company_id = Number(company_id_raw);
    const exclude = Number(exclude_raw);
    if (!Number.isInteger(company_id) || company_id <= 0) {
      return NextResponse.json({ error: 'Invalid company_id' }, { status: 400 });
    }
    if (!Number.isInteger(exclude) || exclude <= 0) {
      return NextResponse.json({ error: 'Invalid exclude id' }, { status: 400 });
    }

    // Basic sanity bounds — these fields back a name/city equality match,
    // not free text search, so anything absurdly long is either junk or
    // a probe, not a legitimate input.
    if (name.length > 200 || city.length > 200) {
      return NextResponse.json({ error: 'Invalid input length' }, { status: 400 });
    }
    if (email && email.length > 320) { // RFC 5321 max mailbox length
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // ── Verify the requesting user actually belongs to this company ──
    const access = await sql`
      SELECT 1 FROM users WHERE id = ${decoded.userId} AND company_id = ${company_id} LIMIT 1
    `;
    if (access.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const leads = await sql`
      SELECT
        l.id, l.name, l.city, l.email, l.category, l.status, l.created_at,
        l.scheduled_date, l.quote_total, l.payment_status, l.project_id,
        l.address_line_1, l.description, p.project_number
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      WHERE
        l.company_id = ${company_id}
        AND LOWER(TRIM(l.name)) = LOWER(TRIM(${name}))
        AND LOWER(TRIM(l.city)) = LOWER(TRIM(${city}))
        AND l.id != ${exclude}
        AND l.deleted = false
      ORDER BY l.created_at DESC
      LIMIT 50
    `;

    const results = leads.map((lead: any) => ({
      ...lead,
      match_confidence:
        email && lead.email && lead.email.toLowerCase() === email.toLowerCase()
          ? 'high'
          : 'medium',
    }));

    return NextResponse.json(
      { leads: results },
      { headers: { 'Cache-Control': 'private, max-age=3, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('❌ Error fetching related leads:', error);
    return NextResponse.json({ error: 'Failed to fetch related leads' }, { status: 500 });
  }
}