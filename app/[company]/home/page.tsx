import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { getCompanyBySlug } from '@/lib/getCompany';

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const { company: slug } = await params;
  const company = await getCompanyBySlug(slug);
  const name = company?.name ?? 'Home';

  return {
    title: `${name} | Home`,
    robots: { index: false, follow: false },
  };
}

// ---------------------------------------------------------------------------
// Data — now a thin layer of Home-specific *computed* fields on top of the
// shared raw row. No more hand-picked column list here — that's the whole
// point of this change. If the schema grows a new column, every page using
// getCompanyBySlug gets it automatically; nothing here needs to change.
// ---------------------------------------------------------------------------

async function getHomeData(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const c = await getCompanyBySlug(slug);
  if (!c) return null;

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
  };
}

// ---------------------------------------------------------------------------
// Auth — same as before, now returns decoded so we can pass currentUser down
// ---------------------------------------------------------------------------

async function verifyAuth(companySlug: string): Promise<any> {
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
    SELECT c.slug, u.role
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

  return { ...decoded, role: access[0].role };
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

  const decoded = await verifyAuth(companySlug);

  const company = await getHomeData(companySlug);
  if (!company) notFound();

  return <HomeClient company={company as any} currentUser={{ id: decoded.userId, role: decoded.role }} />;
}