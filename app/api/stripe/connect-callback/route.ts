import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // this is the slug
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (!state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const dashboardSettingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${state}/admin/settings`;

  if (error) {
    console.warn('Stripe Connect OAuth denied:', error, errorDescription);
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=error`);
  }

  const session = await getSession();
  if (!session || session.companySlug !== state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  if (session.role !== 'owner' && session.role !== 'admin') {
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=error`);
  }

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });

    const connectedAccountId = response.stripe_user_id;
    if (!connectedAccountId) {
      throw new Error('No stripe_user_id returned from OAuth token exchange');
    }

    // Guard against the same Stripe account being linked to two different
    // companies in our system (e.g. multi-brand operator, or user error
    // re-running the flow against an account already claimed elsewhere).
    const existing = await sql`
      SELECT slug
      FROM companies
      WHERE stripe_connect_account_id = ${connectedAccountId}
        AND slug != ${state}
      LIMIT 1
    `;
    if (existing[0]) {
      console.warn(
        'Stripe Connect: account', connectedAccountId,
        'already linked to company', existing[0].slug,
        '— rejecting link to', state
      );
      return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=already_linked`);
    }

    await sql`
      UPDATE companies
      SET
        stripe_connect_account_id = ${connectedAccountId},
        stripe_connect_onboarded = TRUE
      WHERE slug = ${state}
    `;

    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=success`);
  } catch (err: any) {
    console.error('Stripe Connect OAuth token exchange failed:', err.message);
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=error`);
  }
}