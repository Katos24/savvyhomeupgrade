import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { sendPlanChangedEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || '',
  basic:   process.env.STRIPE_BASIC_PRICE_ID || '',
  pro:     process.env.STRIPE_PRO_PRICE_ID || '',
};

const PLAN_ORDER = [ 'basic', 'pro'];

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

    // ── CHANGE: now also fetches name, email, slug for emails ──
    const companies = await sql`
      SELECT stripe_subscription_id, stripe_customer_id, plan_tier, name, email, slug
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

    const subscription = await stripe.subscriptions.retrieve(
      company.stripe_subscription_id
    ) as unknown as Stripe.Subscription;

    if (
      subscription.status === 'canceled' ||
      subscription.status === 'incomplete_expired'
    ) {
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

    const currentPeriodEnd =
      (currentItem as any).current_period_end ??
      (subscription as any).current_period_end;

    const isDowngrade = PLAN_ORDER.indexOf(newPlan) < PLAN_ORDER.indexOf(company.plan_tier);

    if (isDowngrade) {
      // ── DOWNGRADE: schedule change for end of current billing period ──

      // Release any existing schedule first to avoid conflicts
      if ((subscription as any).schedule) {
        await stripe.subscriptionSchedules.release(
          (subscription as any).schedule as string
        );
      }

      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: company.stripe_subscription_id,
      });

      await stripe.subscriptionSchedules.update(schedule.id, {
        phases: [
          {
            start_date: (schedule as any).phases[0].start_date,
            items: [{ price: currentItem.price.id }],
            end_date: currentPeriodEnd,
          },
          {
            items: [{ price: newPriceId }],
          },
        ],
      });

      const periodEndDate = new Date(currentPeriodEnd * 1000);

      await sql`
        UPDATE companies
        SET pending_downgrade_at = ${periodEndDate}
        WHERE id = ${companyId}
      `;

      // ── Send downgrade scheduled email ──
      try {
        await sendPlanChangedEmail({
          companyEmail: company.email,
          companyName:  company.name,
          previousPlan: company.plan_tier,
          newPlan,
          effective:    'period_end',
          periodEnd:    periodEndDate.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          }),
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${company.slug}/dashboard`,
        });
      } catch (e) {
        console.error('Plan change email failed:', e);
      }

      return NextResponse.json({
        success:      true,
        previousPlan: company.plan_tier,
        newPlan,
        effective:    'period_end',
        periodEnd:    currentPeriodEnd,
      });

    } else {
      // ── UPGRADE: apply immediately with proration ──
      const updatedSubscription = await stripe.subscriptions.update(
        company.stripe_subscription_id,
        {
          items: [{ id: currentItem.id, price: newPriceId }],
          proration_behavior: 'always_invoice',
        }
      );

      await sql`
        UPDATE companies
        SET plan_tier = ${newPlan},
            pending_downgrade_at = NULL
        WHERE id = ${companyId}
      `;

      // ── Send upgrade confirmation email ──
      try {
        await sendPlanChangedEmail({
          companyEmail: company.email,
          companyName:  company.name,
          previousPlan: company.plan_tier,
          newPlan,
          effective:    'immediate',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${company.slug}/dashboard`,
        });
      } catch (e) {
        console.error('Plan change email failed:', e);
      }

      return NextResponse.json({
        success:            true,
        previousPlan:       company.plan_tier,
        newPlan,
        effective:          'immediate',
        subscriptionStatus: updatedSubscription.status,
      });
    }

  } catch (error: any) {
    console.error('Plan change error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change plan' },
      { status: 500 }
    );
  }
}