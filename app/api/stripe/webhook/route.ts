import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { headers } from 'next/headers';
import {
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
  sendCancellationScheduledEmail,
  sendPlanChangedEmail,
} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const companyId = session.metadata?.companyId;
      const plan = session.metadata?.plan || 'starter';

      if (!companyId) {
        console.error('No companyId in session metadata');
        break;
      }

      await sql`
        UPDATE companies 
        SET 
          stripe_customer_id = ${session.customer as string},
          stripe_subscription_id = ${session.subscription as string},
          subscription_status = 'trialing',
          trial_ends_at = NOW() + INTERVAL '14 days',
          plan_tier = ${plan}
        WHERE id = ${parseInt(companyId)}
      `;

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;

      const priceId = subscription.items?.data?.[0]?.price?.id;
      let planTier: string | null = null;

      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) planTier = 'starter';
      if (priceId === process.env.STRIPE_BASIC_PRICE_ID)   planTier = 'basic';
      if (priceId === process.env.STRIPE_PRO_PRICE_ID)     planTier = 'pro';

      // If a downgrade schedule is still pending, don't apply the new plan yet —
      // the schedule will fire at period end and trigger another updated event
      const hasActiveSchedule = !!subscription.schedule;
      if (hasActiveSchedule && (planTier === 'basic' || planTier === 'starter')) {
        planTier = null;
      }

      const justScheduledCancel =
        subscription.cancel_at != null &&
        (event.data.previous_attributes as any)?.cancel_at === null;

      const isCancelling = subscription.cancel_at_period_end === true || justScheduledCancel;

      const cancelAtPeriodEnd = subscription.cancel_at != null;
      const cancelAt = subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000)
        : null;

      // ── 1. DB write first ──
      if (planTier) {
        await sql`
          UPDATE companies
          SET
            stripe_subscription_id = ${subscription.id},
            subscription_status = ${subscription.status},
            plan_tier = ${planTier},
            pending_downgrade_at = NULL,
            cancel_at_period_end = ${cancelAtPeriodEnd},
            subscription_cancel_at = ${cancelAt}
          WHERE stripe_customer_id = ${subscription.customer}
             OR stripe_subscription_id = ${subscription.id}
        `;
      } else {
        await sql`
          UPDATE companies
          SET
            stripe_subscription_id = ${subscription.id},
            subscription_status = ${subscription.status},
            cancel_at_period_end = ${cancelAtPeriodEnd},
            subscription_cancel_at = ${cancelAt}
          WHERE stripe_customer_id = ${subscription.customer}
             OR stripe_subscription_id = ${subscription.id}
        `;
      }

      // ── 2. Plan change email after DB is updated ──
      // Only fires when the price actually changed (e.g. scheduled downgrade executed,
      // or an upgrade was applied). Skipped for status-only updates.
      if (planTier) {
        try {
          const previousPriceId = (event.data.previous_attributes as any)?.items?.data?.[0]?.price?.id;
          const PLAN_ORDER = ['starter', 'basic', 'pro'];
          const previousPlan =
            previousPriceId === process.env.STRIPE_STARTER_PRICE_ID ? 'starter' :
            previousPriceId === process.env.STRIPE_BASIC_PRICE_ID   ? 'basic'   :
            previousPriceId === process.env.STRIPE_PRO_PRICE_ID     ? 'pro'     : null;

          const isActualPlanChange = previousPlan && previousPlan !== planTier;

          if (isActualPlanChange) {
            const company = await sql`
              SELECT name, email, slug FROM companies
              WHERE stripe_customer_id = ${subscription.customer}
                 OR stripe_subscription_id = ${subscription.id}
              LIMIT 1
            `;
            if (company[0]) {
              await sendPlanChangedEmail({
                companyEmail: company[0].email,
                companyName:  company[0].name,
                previousPlan,
                newPlan:      planTier,
                effective:    'immediate',
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${company[0].slug}/dashboard`,
              });
            }
          }
        } catch (e) {
          console.error('Failed to send plan change email:', e);
        }
      }

      // ── 3. Cancellation scheduled email ──
      if (isCancelling) {
        try {
          const company = await sql`
            SELECT name, email, subscription_status, trial_ends_at
            FROM companies
            WHERE stripe_customer_id = ${subscription.customer}
          `;

          if (company[0]) {
            const isTrialing = company[0].subscription_status === 'trialing';
            let accessUntil: Date;

            if (isTrialing && company[0].trial_ends_at) {
              accessUntil = new Date(company[0].trial_ends_at);
            } else if (subscription.cancel_at) {
              accessUntil = new Date(subscription.cancel_at * 1000);
            } else if (subscription.current_period_end) {
              accessUntil = new Date(subscription.current_period_end * 1000);
            } else {
              accessUntil = new Date();
            }

            if (isTrialing) {
              await sql`
                UPDATE companies
                SET subscription_cancel_at = ${accessUntil}
                WHERE stripe_customer_id = ${subscription.customer}
              `;
            }

            const formattedDate = accessUntil.toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            });

            await sendCancellationScheduledEmail({
              companyEmail: company[0].email,
              companyName:  company[0].name,
              accessUntil:  formattedDate,
              isTrialing,
            });
          }
        } catch (emailError) {
          console.error('Failed to send cancellation scheduled email:', emailError);
        }
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;

      const result = await sql`
        UPDATE companies 
        SET 
          subscription_status = 'canceled',
          plan_tier = 'starter',
          cancel_at_period_end = false,
          subscription_cancel_at = NULL
        WHERE stripe_customer_id = ${subscription.customer as string}
           OR stripe_subscription_id = ${subscription.id}
        RETURNING id
      `;

      if (result.length === 0) {
        console.error('No company found for deleted subscription:', subscription.id);
      }

      try {
        const company = await sql`
          SELECT name, email FROM companies 
          WHERE stripe_customer_id = ${subscription.customer as string}
        `;
        if (company[0]) {
          await sendSubscriptionCancelledEmail({
            companyEmail: company[0].email,
            companyName:  company[0].name,
          });
        }
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;

      try {
        const company = await sql`
          SELECT name, email FROM companies
          WHERE stripe_customer_id = ${invoice.customer as string}
        `;
        if (company[0]) {
          await sendPaymentFailedEmail({
            companyEmail: company[0].email,
            companyName:  company[0].name,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
          });
        } else {
          console.error('No company found for failed payment, customer:', invoice.customer);
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      break;
    }

    default:
      const evType = (event as any).type;
      if (
        evType === 'subscription_schedule.created' ||
        evType === 'subscription_schedule.updated'
      ) {
        console.log(`Subscription schedule event: ${evType}`);
      } else {
        console.log(`Unhandled event type: ${evType}`);
      }
      break;
  }

  return NextResponse.json({ received: true });
}