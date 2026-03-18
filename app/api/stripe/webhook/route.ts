import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';
import { sendSubscriptionActivatedEmail, sendSubscriptionCancelledEmail, sendPaymentFailedEmail, sendCancellationScheduledEmail } from '@/lib/email';

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

  const sql = neon(process.env.DATABASE_URL!);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const companyId = session.metadata?.companyId;
      const plan = session.metadata?.plan || 'basic'; // ← grab plan from metadata

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

      console.log(`✅ Checkout completed for company ${companyId} on ${plan} plan`);

      try {
        const company = await sql`
          SELECT name, email, slug FROM companies WHERE id = ${parseInt(companyId)}
        `;
        if (company[0]) {
          await sendSubscriptionActivatedEmail({
            companyEmail: company[0].email,
            companyName: company[0].name,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${company[0].slug}/dashboard`
          });
        }
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;

      console.log('Subscription updated:', subscription.id, '| Status:', subscription.status, '| Customer:', subscription.customer);

      // Check if plan changed by looking at the price ID
      const priceId = subscription.items?.data?.[0]?.price?.id;
let planTier: string | null = null;
if (priceId === process.env.STRIPE_BASIC_PRICE_ID) planTier = 'basic';
if (priceId === process.env.STRIPE_PRO_PRICE_ID) planTier = 'pro';

// If a downgrade schedule is still active, don't update plan_tier yet —
// wait for the schedule to fire naturally at period end.
const hasActiveSchedule = !!(subscription as any).schedule;
if (hasActiveSchedule && planTier === 'basic') {
  console.log(`⏭️ Skipping plan_tier update — downgrade schedule pending for ${subscription.id}`);
  planTier = null;
}

      const result = planTier
  ? await sql`
      UPDATE companies 
      SET 
        stripe_subscription_id = ${subscription.id},
        subscription_status = ${subscription.status},
        plan_tier = ${planTier},
        pending_downgrade_at = NULL
      WHERE stripe_customer_id = ${subscription.customer as string}
         OR stripe_subscription_id = ${subscription.id}
      RETURNING id, subscription_status, plan_tier
    `
  : await sql`
      UPDATE companies 
      SET 
        stripe_subscription_id = ${subscription.id},
        subscription_status = ${subscription.status}
      WHERE stripe_customer_id = ${subscription.customer as string}
         OR stripe_subscription_id = ${subscription.id}
      RETURNING id, subscription_status
    `;

      if (result.length === 0) {
        console.error('❌ No company found for customer:', subscription.customer, 'or subscription:', subscription.id);
      } else {
        console.log(`✅ Subscription updated for company ${result[0].id}: ${result[0].subscription_status}${planTier ? ` (plan: ${planTier})` : ''}`);
      }

      if (subscription.cancel_at_period_end === true) {
  try {
    const company = await sql`
      SELECT name, email, subscription_status, trial_ends_at FROM companies 
      WHERE stripe_customer_id = ${subscription.customer as string}
    `;
    if (company[0]) {
      const isTrialing = company[0].subscription_status === 'trialing';
      const sub = subscription as any;
      let accessUntil: Date;
      if (isTrialing && company[0].trial_ends_at) {
        accessUntil = new Date(company[0].trial_ends_at);
      } else if (sub.current_period_end) {
        accessUntil = new Date(sub.current_period_end * 1000);
      } else {
        accessUntil = new Date();
      }
      const formattedDate = accessUntil.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      });
      await sql`
        UPDATE companies SET
          subscription_cancel_at = ${accessUntil},
          cancel_at_period_end = true
        WHERE stripe_customer_id = ${subscription.customer as string}
      `;
      await sendCancellationScheduledEmail({
        companyEmail: company[0].email,
        companyName: company[0].name,
        accessUntil: formattedDate,
        isTrialing,
      });
      console.log('✅ Cancellation scheduled email sent, access until:', formattedDate);
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
    plan_tier = 'basic',
    cancel_at_period_end = false,
    subscription_cancel_at = NULL
  WHERE stripe_customer_id = ${subscription.customer as string}
     OR stripe_subscription_id = ${subscription.id}
  RETURNING id
`;

      if (result.length === 0) {
        console.error('❌ No company found for deleted subscription:', subscription.id);
      } else {
        console.log(`✅ Subscription canceled for company ${result[0].id}, reverted to basic`);
      }

      try {
        const company = await sql`
          SELECT name, email FROM companies 
          WHERE stripe_customer_id = ${subscription.customer as string}
        `;
        if (company[0]) {
          await sendSubscriptionCancelledEmail({
            companyEmail: company[0].email,
            companyName: company[0].name
          });
          console.log('✅ Cancellation email sent (immediate cancel)');
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
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
          });
          console.log('✅ Payment failed email sent');
        } else {
          console.error('❌ No company found for failed payment, customer:', invoice.customer);
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      break;
    }

    default:
  const evType = (event as any).type;
  if (evType === 'customer.subscription.schedule.created') {
    console.log('Subscription schedule created:', (event as any).data.object.id);
  } else if (evType === 'customer.subscription.schedule.updated') {
    console.log('Subscription schedule updated:', (event as any).data.object.id);
  } else {
    console.log(`Unhandled event type: ${evType}`);
  }
  }
  return NextResponse.json({ received: true });
}