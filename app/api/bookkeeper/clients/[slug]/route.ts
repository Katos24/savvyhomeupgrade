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
    return jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    return null;
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const bookkeeper = await verifyBookkeeper();
    if (!bookkeeper) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const companies = await sql`
      SELECT id, name, slug, logo_url, plan_tier
      FROM companies
      WHERE slug = ${slug}
        AND referred_by_code = ${bookkeeper.partner_code}
      LIMIT 1
    `;

    if (!companies.length) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const company = companies[0];

    const projects = await sql`
      SELECT
        p.id,
        p.invoice_number,
        p.quote_total,
        p.payment_status,
        p.payment_amount,
        p.payment_date,
        p.payment_due_date,
        p.scheduled_date,
        p.documents,
        p.quote_data,
        p.category,
        p.status,
        p.created_at,
        p.payment_method,
        COALESCE(p.category, l.category) as category,
        l.name as customer_name,
        l.id as lead_id
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${company.id}
        AND l.deleted = false
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ success: true, company, projects });
  } catch (error) {
    console.error('Bookkeeper client error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch client data' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const bookkeeper = await verifyBookkeeper();
    if (!bookkeeper) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { project_id, quote_data } = await req.json();
    if (!project_id || !quote_data) {
      return NextResponse.json({ success: false, error: 'Missing project_id or quote_data' }, { status: 400 });
    }

    const check = await sql`
      SELECT p.id FROM projects p
      JOIN leads l ON p.lead_id = l.id
      JOIN companies c ON l.company_id = c.id
      WHERE p.id = ${project_id}
        AND c.slug = ${slug}
        AND c.referred_by_code = ${bookkeeper.partner_code}
      LIMIT 1
    `;

    if (!check.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    await sql`
      UPDATE projects
      SET quote_data = ${JSON.stringify(quote_data)}, updated_at = NOW()
      WHERE id = ${project_id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookkeeper patch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}