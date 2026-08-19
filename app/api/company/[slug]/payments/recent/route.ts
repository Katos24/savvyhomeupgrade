import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let decoded: any;
    try {
decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const companies = await sql`
      SELECT c.id
      FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!companies[0]) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const companyId = companies[0].id;

    const since = request.nextUrl.searchParams.get('since');
    if (!since) {
      return NextResponse.json({ success: false, error: 'Missing since param' }, { status: 400 });
    }

    // Real payments only. Refunds get a different kind of notification
    // (a warning, not a celebration) and are deliberately excluded here.
    const rows = await sql`
      SELECT p.id, p.amount, p.kind, p.method, p.created_at,
             pr.project_number,
             l.id as lead_id, l.name as customer_name
      FROM payments p
      JOIN projects pr ON p.project_id = pr.id
      JOIN leads l ON pr.lead_id = l.id
      WHERE p.company_id = ${companyId}
        AND p.created_at > ${since}
        AND p.kind != 'refund'
      ORDER BY p.created_at ASC
      LIMIT 20
    `;

    return NextResponse.json({
      success: true,
      payments: rows.map((r: any) => ({
        id: r.id,
        amount: Number(r.amount) || 0,
        kind: r.kind,
        method: r.method,
        lead_id: r.lead_id,
        customer_name: r.customer_name,
        project_number: r.project_number,
        created_at: r.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch recent payments' }, { status: 500 });
  }
}