import { getJwtSecret } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import GoogleReviewsPageClient from './GoogleReviewsPageClient';
import { can, type PlanTier } from '@/lib/permissions';
import { getCompanyBySlug } from '@/lib/getCompany';

async function verifyAuth(companySlug: string) {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!);
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  if (!token?.value) redirect('/login');
  let decoded: any;
  try {
    decoded = jwt.verify(token.value, getJwtSecret());
  } catch {
    redirect('/login');
  }
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
  const company = await getCompanyBySlug(companySlug);
  if (!company) notFound();
  const planTier = (company.plan_tier || 'free') as PlanTier;
  return <GoogleReviewsPageClient company={company} locked={!can(planTier, 'google_reviews')} />;
}