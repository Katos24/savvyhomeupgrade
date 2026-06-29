import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { can } from '@/lib/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.companySlug !== slug) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (session.role !== 'owner' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners or admins can connect Stripe' }, { status: 403 });
  }

  const companyResult = await sql`
    SELECT id, name, email, stripe_connect_account_id, plan_tier
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const company = companyResult[0];
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

  // Stripe Connect is a paid-plan feature — block free-plan companies even
  // if they hit this endpoint directly, not just at the UI layer.
  const planTier = company.plan_tier || 'free';
  if (!can(planTier, 'stripe_connect')) {
    return NextResponse.json(
      { error: 'Upgrade to Basic or Pro to accept online payments.' },
      { status: 403 }
    );
  }

  try {
    let accountId = company.stripe_connect_account_id;

    // Create the v2 Account once. If we already created one on a previous
    // attempt (e.g. they refreshed mid-onboarding), reuse it instead of
    // creating a duplicate — Stripe charges/tracks per Account.
    if (!accountId) {
      // NOTE: verify exact required fields for your country/entity mix —
      // this is a minimal example covering a US company. Stripe may
      // require more identity fields up front depending on your account's
      // configuration. Check the response's `requirements` if creation
      // fails or returns incomplete.
      const account = await (stripe as any).v2.core.accounts.create({
        contact_email: company.email,
        display_name: company.name,
        dashboard: 'full', // gives them Stripe Dashboard access, like a Standard account
        identity: {
          country: 'us',
          entity_type: 'company',
        },
        configuration: {
          merchant: {
            capabilities: {
              card_payments: { requested: true },
            },
          },
        },
        defaults: {
          currency: 'usd',
          responsibilities: {
            fees_collector: 'stripe',
            losses_collector: 'stripe',
          },
          locales: ['en-US'],
        },
      });

      accountId = account.id;

      await sql`
        UPDATE companies
        SET stripe_connect_account_id = ${accountId}
        WHERE slug = ${slug}
      `;
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect-return?slug=${slug}`;
    const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/company/${slug}/stripe/connect-onboard`;

    const accountLink = await (stripe as any).v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: 'account_onboarding',
        account_onboarding: {
          configurations: ['merchant'],
          return_url: returnUrl,
          refresh_url: refreshUrl,
        },
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('Stripe v2 Connect onboarding failed:', err.message);
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 });
  }
}