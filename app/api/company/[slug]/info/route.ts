import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    // ── 1. Authenticate user ─────────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    // ── 2. Query company & verify user tenancy ───────────────────────────
    const companies = await sql`
      SELECT
        c.id, c.name, c.slug, c.email, c.phone, c.website, c.business_type, c.logo_url,
        c.status_options, c.created_at, c.subscription_status, c.trial_ends_at,
        c.stripe_customer_id, c.stripe_subscription_id, c.plan_tier
      FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;

    if (!companies.length) {
      return NextResponse.json(
        { success: false, error: 'Company not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company: companies[0],
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}