// app/api/stripe/cancel-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    // Fetch company info from DB
    const companies = await sql`
      SELECT stripe_subscription_id, subscription_status, trial_ends_at
      FROM companies
      WHERE id = ${companyId}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];

    if (!company.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      company.stripe_subscription_id
    );

    // Cancel at end of period or trial
    const canceledSubscription = await stripe.subscriptions.update(
      company.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    const periodEnd = canceledSubscription.current_period_end
      ? new Date(canceledSubscription.current_period_end * 1000)
      : company.trial_ends_at; // fallback to trial end if no current_period_end

    // Update DB
    await sql`
      UPDATE companies
      SET 
        subscription_status = 'canceled',
        subscription_current_period_end = ${periodEnd}
      WHERE id = ${companyId}
    `;

    return NextResponse.json({
      success: true,
      subscription_status: 'canceled',
      subscription_current_period_end: periodEnd,
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}