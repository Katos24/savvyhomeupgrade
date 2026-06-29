import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { can, type PlanTier } from '@/lib/permissions';

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

  const companyResult = await sql`
    SELECT stripe_connect_account_id, plan_tier
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const company = companyResult[0];

  // Don't even check Stripe if this plan can't use Connect at all —
  // saves a Stripe API round-trip on every call for free-plan accounts,
  // which previously fired unconditionally from Home and the Payments page.
  if (!can((company?.plan_tier ?? 'free') as PlanTier, 'stripe_connect')) {
    return NextResponse.json({ chargesEnabled: false });
  }

  if (!company?.stripe_connect_account_id) {
    return NextResponse.json({ chargesEnabled: false });
  }

  try {
    const account = await (stripe as any).v2.core.accounts.retrieve(
      company.stripe_connect_account_id,
      { include: ['configuration.merchant'] }
    );

    // Confirmed field path against a real test-mode response. Only "active"
    // means they can actually take payments — "restricted" (incomplete
    // requirements) should show as pending/needs-attention in the UI, not
    // as charges-enabled.
    const chargesEnabled =
      account.configuration?.merchant?.capabilities?.card_payments?.status === 'active';

    return NextResponse.json({ chargesEnabled });
  } catch (err: any) {
    console.error('Failed to retrieve v2 connected account status:', err.message);
    return NextResponse.json({ chargesEnabled: false });
  }
}