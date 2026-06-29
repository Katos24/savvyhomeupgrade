import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Stripe redirects here after the user finishes (or exits) the v2 onboarding
// flow. Unlike OAuth, there's no `code` to exchange — we already created
// the Account ourselves in connect-onboard, so we just re-check its status.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');

  if (!slug) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const dashboardSettingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/admin/settings`;

  const session = await getSession();
  if (!session || session.companySlug !== slug) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const companyResult = await sql`
    SELECT stripe_connect_account_id
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const accountId = companyResult[0]?.stripe_connect_account_id;

  if (!accountId) {
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=error`);
  }

  try {
    const account = await (stripe as any).v2.core.accounts.retrieve(accountId, {
      include: ['configuration.merchant'],
    });

    console.log('FULL ACCOUNT RESPONSE:', JSON.stringify(account, null, 2));

    // Confirmed against a real test-mode response on 2026-06-29:
    // configuration.merchant.capabilities.card_payments.status is the right
    // field. Values seen so far: "active", "restricted" (with
    // status_details[].code === "requirements_past_due" when onboarding is
    // incomplete). Treat "restricted" as "account exists, not fully
    // onboarded yet" rather than a hard error — they completed the Account
    // Link flow (didn't bail), they just have outstanding requirements.
    const capabilityStatus = account.configuration?.merchant?.capabilities?.card_payments?.status;
    const onboarded =
      capabilityStatus === 'active' ||
      capabilityStatus === 'pending' ||
      capabilityStatus === 'restricted';

    await sql`
      UPDATE companies
      SET stripe_connect_onboarded = ${onboarded}
      WHERE slug = ${slug}
    `;

    return NextResponse.redirect(
      `${dashboardSettingsUrl}?stripe_connect=${onboarded ? 'success' : 'error'}`
    );
  } catch (err: any) {
    console.error('Stripe v2 Connect return check failed:', err.message);
    return NextResponse.redirect(`${dashboardSettingsUrl}?stripe_connect=error`);
  }
}