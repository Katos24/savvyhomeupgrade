import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

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
    SELECT stripe_connect_account_id
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const company = companyResult[0];

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