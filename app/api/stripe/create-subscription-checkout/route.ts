import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro:   process.env.STRIPE_PRO_PRICE_ID   || '',
};

const PLAN_NAMES: Record<string, string> = {
  basic: 'Basic Plan',
  pro:   'Pro Plan',
};

export async function POST(req: NextRequest) {
  try {
    const { companyId, companyEmail, plan = 'basic' } = await req.json();

    if (!companyId || !companyEmail) {
      return NextResponse.json(
        { error: 'Missing companyId or companyEmail' },
        { status: 400 }
      );
    }

    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `No price configured for plan: ${plan}` },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const companies = await sql`
      SELECT slug, name FROM companies WHERE id = ${companyId}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],

      // ── Correct success/cancel URLs ──
      success_url: `${baseUrl}/subscribe?subscription=success`,
      cancel_url:  `${baseUrl}/subscribe?subscription=cancelled`,

      client_reference_id: companyId.toString(),
      customer_email: companyEmail,

      // ── Trial + metadata ──
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          companyId: companyId.toString(),
          plan,
        },
      },

      metadata: {
        companyId: companyId.toString(),
        plan,
      },

      // ── Better checkout copy ──
      custom_text: {
        submit: {
          message: "You won't be charged until your 14-day free trial ends. Cancel anytime.",
        },
      },

      // ── Allow promo codes ──
      allow_promotion_codes: true,

      // ── Phone not needed ──
      phone_number_collection: {
        enabled: false,
      },

      // ── Tax collection ──
      automatic_tax: {
        enabled: true,
      },

      // ── Prefill and lock email ──
      customer_creation: 'always',
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