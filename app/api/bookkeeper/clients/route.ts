import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

async function verifyBookkeeper() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bookkeeper-auth-token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const bookkeeper = await verifyBookkeeper();
    if (!bookkeeper) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const clients = await sql`
      SELECT
        c.id,
        c.name,
        c.slug,
        c.logo_url,
        c.plan_tier,
        c.created_at,
        COUNT(DISTINCT p.id) as total_projects,
        COUNT(DISTINCT CASE WHEN p.payment_status != 'paid' AND p.quote_total IS NOT NULL THEN p.id END) as unpaid_count,
        COUNT(DISTINCT CASE WHEN p.payment_status = 'paid' THEN p.id END) as paid_count,
        SUM(CASE WHEN p.quote_total IS NOT NULL THEN p.quote_total::numeric ELSE 0 END) as total_revenue,
        SUM(CASE WHEN p.payment_amount IS NOT NULL THEN p.payment_amount::numeric ELSE 0 END) as total_collected,
        MAX(p.updated_at) as last_activity
      FROM companies c
      LEFT JOIN leads l ON l.company_id = c.id AND l.deleted = false
      LEFT JOIN projects p ON p.lead_id = l.id
      WHERE c.referred_by_code = ${bookkeeper.partner_code}
      GROUP BY c.id, c.name, c.slug, c.logo_url, c.plan_tier, c.created_at
      ORDER BY last_activity DESC NULLS LAST
    `;

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Bookkeeper clients error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
  }
}