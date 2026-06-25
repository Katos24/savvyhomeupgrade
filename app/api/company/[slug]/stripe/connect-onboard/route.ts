import { NextRequest, NextResponse } from 'next/server';
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
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (session.companySlug !== slug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.role !== 'owner' && session.role !== 'admin') {
    return NextResponse.json({ error: 'Only owners or admins can connect Stripe' }, { status: 403 });
  }

 const companyResult = await sql`
    SELECT id, email, stripe_connect_account_id, stripe_connect_onboarded
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;

  const company = companyResult[0];
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }

const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/connect-callback`;


  const oauthParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
    scope: 'read_write',
    redirect_uri: redirectUri,
    state: slug,
  });

  if (company.email) {
    oauthParams.set('stripe_user[email]', company.email);
  }
  const oauthUrl = `https://connect.stripe.com/oauth/authorize?${oauthParams.toString()}`;

  return NextResponse.json({ url: oauthUrl });
}