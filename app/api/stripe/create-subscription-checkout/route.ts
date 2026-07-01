import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro:   process.env.STRIPE_PRO_PRICE_ID   || '',
};

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = decoded.companyId;
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan = 'basic' } = await req.json();
    const priceId = PLAN_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: `No price configured for plan: ${plan}` }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const companies = await sql`
      SELECT id, slug, name, email, stripe_customer_id, trial_ends_at, subscription_status
      FROM companies
      WHERE id = ${companyId}
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];

    // ── Has this company ever had a trial? ──
    // trial_ends_at gets set on first checkout.session.completed
    // so if it's non-null they've already used their trial
    const alreadyTrialed = company.trial_ends_at != null;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/subscribe?subscription=success`,
      cancel_url:  `${baseUrl}/subscribe?subscription=cancelled`,
      client_reference_id: companyId.toString(),
      ...(company.stripe_customer_id
        ? { customer: company.stripe_customer_id }
        : { customer_email: company.email }),
      subscription_data: {
        // Only give trial if they've never had one before
        ...(!alreadyTrialed ? { trial_period_days: 14 } : {}),
        metadata: { companyId: companyId.toString(), plan },
      },
      metadata: { companyId: companyId.toString(), plan },
      custom_text: {
        submit: {
          message: alreadyTrialed
            ? 'Your card will be charged today. Cancel anytime.'
            : "You won't be charged until your 14-day free trial ends. Cancel anytime.",
        },
      },
      allow_promotion_codes: true,
      phone_number_collection: { enabled: false },
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