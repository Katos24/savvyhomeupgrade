import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type Props = {
  params: Promise<{ slug: string }>;
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

    // ── Count all non-deleted leads (unfiltered) ────────────
    const result = await sql`
      SELECT COUNT(*) as count
      FROM leads
      WHERE company_id = ${companyId}
        AND deleted = false
    `;

    return NextResponse.json({
      success: true,
      count: parseInt(result[0].count),
    });

  } catch (error) {
    console.error('Error fetching lead count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead count' },
      { status: 500 }
    );
  }
}