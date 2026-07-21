import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import CompanyDashboardClient from './CompanyDashboardClient';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Company {
  id: number;
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
stripe_connect_account_id?: string | null;
  stripe_connect_onboarded?: boolean;
  stripe_payment_status?: string | null;
  payment_link_url?: string | null;
  payment_link_type?: string | null;
  default_tax_rate?: number | null;
}

// ---------------------------------------------------------------------------
// Metadata  dynamically generated per company
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const { company: slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT name FROM companies WHERE slug = ${slug} LIMIT 1`;
  const name = rows[0]?.name ?? 'Dashboard';

  return {
    title: `${name} | Dashboard`,
    description: `Manage leads and projects for ${name}.`,
    robots: { index: false, follow: false },
    openGraph: { title: `${name} | Dashboard` },
  };
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
SELECT
      id, name, slug, email, phone, website, logo_url, created_at,
      email_brand_color_1, email_brand_color_2,
      subscription_status, trial_ends_at, plan_tier,
      status_options, form_categories, custom_questions,
      form_field_config,
      onboarding_completed, onboarding_steps, cancel_at_period_end, subscription_cancel_at,
      stripe_connect_account_id, stripe_connect_onboarded, stripe_payment_status,
      payment_link_url, payment_link_type, default_tax_rate
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];
  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
    status_options: c.status_options || [],
    form_categories: c.form_categories || [],
    custom_questions: c.custom_questions || [],
    form_field_config: c.form_field_config || {},
  } as Company;
}

// ---------------------------------------------------------------------------
// Auth  verify JWT and company membership
// ---------------------------------------------------------------------------

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
      process.env.JWT_SECRET || 'your-secret-key-change-this'
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;

  await verifyAuth(companySlug);

  const company = await getCompany(companySlug);
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

  return <CompanyDashboardClient company={company} />;
}