import { getJwtSecret } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import { getCompanyBySlug } from '@/lib/getCompany';
import LeadsClient from './LeadsClient';

export const dynamic = 'force-dynamic';

// Mirrors app/[company]/(app)/dashboard/page.tsx exactly — same auth,
// same plan-gating, same getCompanyBySlug pattern. Kept as a near-duplicate
// on purpose rather than sharing a helper, since the two pages' redirect
// targets differ (this one has no reason to exist yet, so if either page's
// gating logic needs to diverge later, they aren't secretly coupled).

interface Company {
  id: number;
  business_type?: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  website: string | null;
  email_brand_color_1: string | null;
  email_brand_color_2: string | null;
  logo_url: string | null;
  created_at: Date;
  subscription_status?: string;
  trial_ends_at?: string | null;
  plan_tier?: string;
  status_options?: any[];
  form_categories?: any[];
  custom_questions?: any[];
  form_field_config?: any;
  onboarding_completed?: boolean;
  onboarding_steps?: Record<string, boolean>;
  cancel_at_period_end?: boolean;
  subscription_cancel_at?: string | null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const { company: slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT name FROM companies WHERE slug = ${slug} LIMIT 1`;
  const name = rows[0]?.name ?? 'Leads';

  return {
    title: `${name} | Leads`,
    description: `Manage leads and projects for ${name}.`,
    robots: { index: false, follow: false },
    openGraph: { title: `${name} | Leads` },
  };
}

async function verifyAuth(companySlug: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token?.value) {
    redirect('/login');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(
      token.value,
      getJwtSecret()
    );
  } catch {
    redirect('/login');
  }

  const sql = neon(process.env.DATABASE_URL!);

  const access = await sql`
    SELECT c.slug
    FROM users u
    JOIN companies c ON u.company_id = c.id
    WHERE u.id = ${decoded.userId}
      AND c.slug = ${companySlug}
    LIMIT 1
  `;

  if (!access.length) {
    const own = await sql`
      SELECT c.slug
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
      LIMIT 1
    `;
    redirect(own.length ? `/${own[0].slug}/dashboard` : '/login');
  }
}

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;

  await verifyAuth(companySlug);

  const company = (await getCompanyBySlug(companySlug)) as Company | null;
  if (!company) notFound();

  const isTrialing =
    company.subscription_status === 'trialing' &&
    company.trial_ends_at &&
    new Date(company.trial_ends_at) > new Date();

  const isTrialExpired =
    company.subscription_status === 'trialing' &&
    company.trial_ends_at &&
    new Date(company.trial_ends_at) <= new Date();

  const isFree = company.plan_tier === 'free';

  const needsPayment =
    !company.subscription_status ||
    ['canceled', 'past_due', 'inactive'].includes(company.subscription_status) ||
    isTrialExpired;

  if (needsPayment && !isTrialing && !isFree) {
    redirect(`/${companySlug}/admin/settings#billing`);
  }

  return <LeadsClient company={company} />;
}