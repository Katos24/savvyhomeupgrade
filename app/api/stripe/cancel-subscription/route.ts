import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json();
    if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

    const companies = await sql`
      SELECT id, name, email, stripe_subscription_id, subscription_status, trial_ends_at
      FROM companies
      WHERE id = ${companyId}
    `;

    if (companies.length === 0) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    const company = companies[0];

    if (!company.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 });
    }

    const canceled = await stripe.subscriptions.update(
      company.stripe_subscription_id,
      { cancel_at_period_end: true }
    ) as any;

    const isTrialing = company.subscription_status === 'trialing';
    let periodEnd: Date;

    if (isTrialing && company.trial_ends_at) {
      periodEnd = new Date(company.trial_ends_at);
    } else if (canceled.current_period_end) {
      periodEnd = new Date(canceled.current_period_end * 1000);
    } else {
      periodEnd = new Date();
    }

    const formattedDate = periodEnd.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

    await sql`
      UPDATE companies
      SET
        subscription_cancel_at = ${periodEnd},
        cancel_at_period_end = true
      WHERE id = ${companyId}
    `;

    return NextResponse.json({
      success: true,
      message: `Subscription will cancel on ${formattedDate}`,
      access_until: periodEnd,
    });

  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cancel' }, { status: 500 });
  }
}