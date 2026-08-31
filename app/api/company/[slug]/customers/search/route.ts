import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

// Reuse connection across warm lambdas
const sql = neon(process.env.DATABASE_URL!);

/** Escape PostgreSQL LIKE / ILIKE wildcard characters (% and _) */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const q = request.nextUrl.searchParams.get('q')?.trim() || '';
    if (q.length < 2) {
      return NextResponse.json({ success: true, customers: [] });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    // Auth & tenant isolation check
    const companies = await sql`
      SELECT c.id FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!companies.length) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const companyId = companies[0].id;

    // Safely format search query pattern
    const searchPattern = `%${escapeLike(q)}%`;

    // Fetch matching customers (most recent lead details win per email)
    const rows = await sql`
      SELECT DISTINCT ON (email)
        id, name, email, phone, address_line_1, address_line_2, city, zip_code
      FROM leads
      WHERE company_id = ${companyId}
        AND deleted = false
        AND email IS NOT NULL AND email <> ''
        AND (name ILIKE ${searchPattern} OR email ILIKE ${searchPattern} OR phone ILIKE ${searchPattern})
      ORDER BY email, created_at DESC
      LIMIT 8
    `;

    return NextResponse.json({ success: true, customers: rows });
  } catch (error) {
    console.error('Customer search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}