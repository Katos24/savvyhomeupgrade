import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';
import { sendSubscriptionActivatedEmail, sendSubscriptionCancelledEmail, sendPaymentFailedEmail } from '@/lib/email';

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

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const companyId = session.metadata?.companyId;

      if (!companyId) {
        console.error('No companyId in session metadata');
        break;
      }

      // Update company with subscription info
      await sql`
        UPDATE companies 
        SET 
          stripe_customer_id = ${session.customer as string},
          stripe_subscription_id = ${session.subscription as string},
          subscription_status = 'trialing',
          trial_ends_at = NOW() + INTERVAL '14 days'
        WHERE id = ${parseInt(companyId)}
      `;

      console.log(`✅ Subscription created for company ${companyId}`);

      // 🔥 SEND ACTIVATION EMAIL
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
      
      await sql`
        UPDATE companies 
        SET subscription_status = ${subscription.status}
        WHERE stripe_subscription_id = ${subscription.id}
      `;

      console.log(`✅ Subscription updated: ${subscription.status}`);
      
      // 🔥 SEND CANCELLATION EMAIL IF SCHEDULED TO CANCEL
      if (subscription.cancel_at_period_end === true) {
        try {
          const company = await sql`
            SELECT name, email FROM companies WHERE stripe_subscription_id = ${subscription.id}
          `;
          if (company[0]) {
            await sendSubscriptionCancelledEmail({
              companyEmail: company[0].email,
              companyName: company[0].name
            });
            console.log('✅ Cancellation email sent (cancel at period end)');
          }
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }
      }
      
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      await sql`
        UPDATE companies 
        SET subscription_status = 'canceled'
        WHERE stripe_subscription_id = ${subscription.id}
      `;

      console.log(`✅ Subscription canceled`);

      // 🔥 SEND CANCELLATION EMAIL (for immediate cancels)
      try {
        const company = await sql`
          SELECT name, email FROM companies WHERE stripe_subscription_id = ${subscription.id}
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
          SELECT name, email FROM companies WHERE stripe_customer_id = ${invoice.customer}
        `;
        if (company[0]) {
          await sendPaymentFailedEmail({
            companyEmail: company[0].email,
            companyName: company[0].name,
            updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
          });
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      console.log(`✅ Payment failed email sent`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}