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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const companyId = session.metadata?.companyId;

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
          trial_ends_at = NOW() + INTERVAL '14 days'
        WHERE id = ${parseInt(companyId)}
      `;

      console.log(`✅ Checkout completed for company ${companyId}`);

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

      // Look up by stripe_customer_id as fallback since subscription_id may not be set yet
      const result = await sql`
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
        console.log(`✅ Subscription updated for company ${result[0].id}: ${result[0].subscription_status}`);
      }

      // Send cancellation email if scheduled to cancel
      if (subscription.cancel_at_period_end === true) {
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

      const result = await sql`
        UPDATE companies 
        SET subscription_status = 'canceled'
        WHERE stripe_customer_id = ${subscription.customer as string}
           OR stripe_subscription_id = ${subscription.id}
        RETURNING id
      `;

      if (result.length === 0) {
        console.error('❌ No company found for deleted subscription:', subscription.id);
      } else {
        console.log(`✅ Subscription canceled for company ${result[0].id}`);
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
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}