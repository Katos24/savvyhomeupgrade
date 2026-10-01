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

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect-return?slug=${slug}`;
  const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/company/${slug}/stripe/connect-onboard`;

  const createAccount = async () => {
    const account = await (stripe as any).v2.core.accounts.create({
      contact_email: company.email,
      display_name: company.name,
      dashboard: 'full',
      identity: { country: 'us', entity_type: 'company' },
      configuration: { merchant: { capabilities: { card_payments: { requested: true } } } },
      defaults: {
        currency: 'usd',
        responsibilities: { fees_collector: 'stripe', losses_collector: 'stripe' },
        locales: ['en-US'],
      },
    });
    await sql`UPDATE companies SET stripe_connect_account_id = ${account.id} WHERE slug = ${slug}`;
    return account.id as string;
  };

  const createLink = (accountId: string) =>
    (stripe as any).v2.core.accountLinks.create({
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

  // Stripe says the saved account doesn't exist — typically an account
  // created with test keys (dev) while production uses live keys.
  const isMissingAccount = (err: any) =>
    err?.statusCode === 404 ||
    err?.code === 'resource_missing' ||
    /no such|not found|does not exist/i.test(err?.message || '');

  try {
    let accountId: string = company.stripe_connect_account_id || (await createAccount());

    let accountLink;
    try {
      accountLink = await createLink(accountId);
    } catch (err: any) {
      if (!company.stripe_connect_account_id || !isMissingAccount(err)) throw err;
      console.warn(`Saved Stripe account ${accountId} not found — creating a new one for ${slug}`);
      await sql`UPDATE companies SET stripe_connect_account_id = NULL, stripe_payment_status = NULL WHERE slug = ${slug}`;
      accountId = await createAccount();
      accountLink = await createLink(accountId);
    }

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error('Stripe v2 Connect onboarding failed:', err?.message, err?.code || '');
    return NextResponse.json({ error: 'Failed to start onboarding' }, { status: 500 });
  }
}