import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import PaymentsPageClient from './PaymentsPageClient';

async function getCompany(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, slug, email, phone, website, logo_url, created_at,
      email_brand_color_1, email_brand_color_2, plan_tier,
      payment_link_type, payment_link_url,
      stripe_connect_account_id, stripe_connect_onboarded
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];
  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
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
  return decoded;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Customer Payments', robots: { index: false, follow: false } };
}

export default async function PaymentsPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  // NOTE: assumed shape — verify against your actual /api/auth/me response.
  const currentUser = { id: decoded.userId, role: decoded.role || 'owner' };

  return <PaymentsPageClient company={company} currentUser={currentUser} />;
}