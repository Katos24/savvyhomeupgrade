import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { companyId, companyEmail } = await req.json();

    if (!companyId || !companyEmail) {
      return NextResponse.json(
        { error: 'Missing companyId or companyEmail' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured' },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=cancelled`,
      client_reference_id: companyId.toString(),
      customer_email: companyEmail,
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          companyId: companyId.toString(),
        },
      },
      metadata: {
        companyId: companyId.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}