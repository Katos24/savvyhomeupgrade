import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';

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
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}