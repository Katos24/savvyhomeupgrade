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

    // ── Single query: verify access AND get the count in one round trip ──
    const result = await sql`
      SELECT COUNT(l.id) as count
      FROM companies c
      JOIN users u ON u.company_id = c.id
      LEFT JOIN leads l ON l.company_id = c.id AND l.deleted = false
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      GROUP BY c.id
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { success: true, count: parseInt(result[0].count) },
      { headers: { 'Cache-Control': 'private, max-age=3, stale-while-revalidate=10' } }
    );
  } catch (error) {
    console.error('Error fetching lead count:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lead count' },
      { status: 500 }
    );
  }
}