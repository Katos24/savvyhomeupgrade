import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import CategoriesPageClient from './CategoriesPageClient';

async function getCompany(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, slug, email, phone, website, logo_url, created_at,
      email_brand_color_1, email_brand_color_2, plan_tier,
      form_categories, business_type
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];
  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
    form_categories: c.form_categories || [],
  };
}

async function verifyAuth(companySlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  if (!token?.value) redirect('/login');
  let decoded: any;
  try {
    decoded = jwt.verify(token.value, getJwtSecret());
  } catch {
    redirect('/login');
  }
  const sql = neon(process.env.DATABASE_URL!);
  const access = await sql`
    SELECT c.slug FROM users u JOIN companies c ON u.company_id = c.id
    WHERE u.id = ${decoded.userId} AND c.slug = ${companySlug} LIMIT 1
  `;
  if (!access.length) {
    const own = await sql`
      SELECT c.slug FROM users u JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId} LIMIT 1
    `;
    redirect(own.length ? `/${own[0].slug}/home` : '/login');
  }
  return decoded;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Categories, Tasks & Pricing', robots: { index: false, follow: false } };
}

export default async function CategoriesPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  // NOTE: assumed shape — verify against your actual /api/auth/me response.
  const currentUser = { id: decoded.userId, role: decoded.role || 'owner' };

  return <CategoriesPageClient company={company} currentUser={currentUser} />;
}