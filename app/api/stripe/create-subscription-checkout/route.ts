import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro:   process.env.STRIPE_PRO_PRICE_ID || '',
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
      SELECT slug FROM companies WHERE id = ${companyId}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companySlug = companies[0].slug;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard?subscription=cancelled`,
      client_reference_id: companyId.toString(),
      customer_email: companyEmail,
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