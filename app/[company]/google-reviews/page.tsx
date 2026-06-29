import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import GoogleReviewsPageClient from './GoogleReviewsPageClient';
import { can, type PlanTier } from '@/lib/permissions';

async function getCompany(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, slug, plan_tier, google_review_url, google_review_enabled
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];
  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
  } as unknown as {
    id: number; name: string; slug: string; plan_tier: string;
    google_review_url: string | null; google_review_enabled: boolean;
  };
}

async function verifyAuth(companySlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  if (!token?.value) redirect('/login');
  let decoded: any;
  try {
    decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key-change-this');
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
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Google Reviews', robots: { index: false, follow: false } };
}

export default async function GoogleReviewsPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = await params;
  await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  return <GoogleReviewsPageClient company={company} locked={!can((company.plan_tier || 'free') as PlanTier, 'google_reviews')} />;
}