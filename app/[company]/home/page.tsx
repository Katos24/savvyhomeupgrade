import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { CATEGORY_MAP } from '@/lib/formCategories';

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
  plan_tier?: string;
  custom_questions?: any[];
  categoriesCustomized: boolean;
  hasRealLead: boolean;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const { company: slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT name FROM companies WHERE slug = ${slug} LIMIT 1`;
  const name = rows[0]?.name ?? 'Home';

  return {
    title: `${name} | Home`,
    robots: { index: false, follow: false },
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
      email_brand_color_1, email_brand_color_2, plan_tier,
      form_categories, custom_questions, business_type
    FROM companies
    WHERE slug = ${slug}
    LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];

  // form_categories is seeded with defaults at signup — it's never null.
  // "Customized" means it no longer matches what the defaults for this
  // business_type would be, not just "is non-empty."
  const defaultCategories = CATEGORY_MAP[c.business_type] || CATEGORY_MAP.general;
  const stored = c.form_categories || [];
  const categoriesCustomized = JSON.stringify(stored) !== JSON.stringify(defaultCategories);

  // Signup seeds a sample lead with origin = 'sample' so the dashboard
  // isn't empty — that shouldn't count as "you've gotten a real lead."
  const leadRows = await sql`
    SELECT COUNT(*) as count FROM leads
    WHERE company_id = ${c.id} AND deleted = false AND (origin IS NULL OR origin != 'sample')
  `;
  const hasRealLead = parseInt(leadRows[0]?.count || '0') > 0;

  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
    custom_questions: c.custom_questions || [],
    categoriesCustomized,
    hasRealLead,
  } as unknown as Company;
}

// ---------------------------------------------------------------------------
// Auth — same verification as dashboard page
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
    redirect(own.length ? `/${own[0].slug}/home` : '/login');
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CompanyHomePage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;

  await verifyAuth(companySlug);

  const company = await getCompany(companySlug);
  if (!company) notFound();

  return <HomeClient company={company} />;
}