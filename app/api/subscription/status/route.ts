// app/api/subscription/status/route.ts
// Secure endpoint — reads auth cookie, never trusts URL params

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const companyId = decoded.companyId;
    if (!companyId) {
      return NextResponse.json({ error: 'No company' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const [company] = await sql`
      SELECT id, slug, name, subscription_status, onboarding_completed, stripe_customer_id
FROM companies
WHERE id = ${companyId}
    `;

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

const isActive = ['trialing', 'active'].includes(company.subscription_status)
  || !!company.stripe_customer_id;

    return NextResponse.json({
      success: true,
      subscriptionStatus: company.subscription_status,
      isActive,
      slug: company.slug,
      onboardingCompleted: company.onboarding_completed,
    });
  } catch (err) {
    console.error('Status check error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}