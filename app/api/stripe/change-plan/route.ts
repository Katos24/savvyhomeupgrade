import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
};

export async function POST(req: NextRequest) {
  try {
    const { companyId, newPlan } = await req.json();

    if (!companyId || !newPlan) {
      return NextResponse.json(
        { error: 'Missing companyId or newPlan' },
        { status: 400 }
      );
    }

    const newPriceId = PLAN_PRICE_IDS[newPlan];
    if (!newPriceId) {
      return NextResponse.json(
        { error: `No price configured for plan: ${newPlan}` },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get the company's current Stripe subscription
    const companies = await sql`
      SELECT stripe_subscription_id, stripe_customer_id, plan_tier
      FROM companies
      WHERE id = ${companyId}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];

    if (!company.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      );
    }

    if (company.plan_tier === newPlan) {
      return NextResponse.json(
        { error: `You are already on the ${newPlan} plan.` },
        { status: 400 }
      );
    }

    // Retrieve the subscription to get the current item ID
    const subscription = await stripe.subscriptions.retrieve(
      company.stripe_subscription_id
    );

    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      return NextResponse.json(
        { error: 'Subscription is no longer active. Please subscribe again.' },
        { status: 400 }
      );
    }

    const currentItem = subscription.items.data[0];

    if (!currentItem) {
      return NextResponse.json(
        { error: 'No subscription item found' },
        { status: 500 }
      );
    }

    // Update the subscription: swap the price, prorate immediately
    const updatedSubscription = await stripe.subscriptions.update(
      company.stripe_subscription_id,
      {
        items: [
          {
            id: currentItem.id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      }
    );

    // Update plan_tier locally right away (webhook will also fire, but this keeps UI snappy)
    await sql`
      UPDATE companies
      SET plan_tier = ${newPlan}
      WHERE id = ${companyId}
    `;

    console.log(
      `✅ Plan changed for company ${companyId}: ${company.plan_tier} → ${newPlan}`
    );

    return NextResponse.json({
      success: true,
      previousPlan: company.plan_tier,
      newPlan,
      subscriptionStatus: updatedSubscription.status,
    });
  } catch (error: any) {
    console.error('Plan change error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change plan' },
      { status: 500 }
    );
  }
}