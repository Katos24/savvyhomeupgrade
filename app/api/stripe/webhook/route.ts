import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { headers } from 'next/headers';
import {
  sendSubscriptionActivatedEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
  sendCancellationScheduledEmail,
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

      try {
        const company = await sql`
          SELECT name, email, slug FROM companies WHERE id = ${parseInt(companyId)}
        `;
        if (company[0]) {
          await sendSubscriptionActivatedEmail({
            companyEmail: company[0].email,
            companyName: company[0].name,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${company[0].slug}/dashboard`,
          });
        }
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as any;

      const priceId = subscription.items?.data?.[0]?.price?.id;
      let planTier: string | null = null;

      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) planTier = 'starter';
      if (priceId === process.env.STRIPE_BASIC_PRICE_ID)   planTier = 'basic';
      if (priceId === process.env.STRIPE_PRO_PRICE_ID)     planTier = 'pro';

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
              companyName: company[0].name,
              accessUntil: formattedDate,
              isTrialing,
            });
          }
        } catch (emailError) {
          console.error('❌ Failed to send cancellation scheduled email:', emailError);
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
        console.error('❌ No company found for deleted subscription:', subscription.id);
      }

      try {
        const company = await sql`
          SELECT name, email FROM companies 
          WHERE stripe_customer_id = ${subscription.customer as string}
        `;
        if (company[0]) {
          await sendSubscriptionCancelledEmail({
            companyEmail: company[0].email,
            companyName: company[0].name,
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
          SELECT name, email FROM companies WHERE stripe_customer_id = ${invoice.customer as string}
        `;
        if (company[0]) {
          await sendPaymentFailedEmail({
            companyEmail: company[0].email,
            companyName: company[0].name,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
          });
        } else {
          console.error('❌ No company found for failed payment, customer:', invoice.customer);
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}