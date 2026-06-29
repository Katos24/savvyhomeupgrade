import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import FormPageClient from './FormPageClient';

async function getCompany(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, slug, email, phone, website, logo_url, created_at,
      email_brand_color_1, email_brand_color_2, plan_tier,
      form_field_config, custom_questions, form_categories
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  if (!rows.length) return null;
  const c = rows[0];
  return {
    ...c,
    plan_tier: c.plan_tier || 'free',
    form_field_config: c.form_field_config || {},
    custom_questions: c.custom_questions || [],
    form_categories: c.form_categories || [],
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

export async function generateMetadata(
  { params }: { params: Promise<{ company: string }> }
): Promise<Metadata> {
  const { company: slug } = await params;
  return { title: `Booking Form`, robots: { index: false, follow: false } };
}

export default async function FormPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  // NOTE: assumed currentUser shape based on decoded JWT — verify against
  // your actual /api/auth/me response shape used elsewhere (e.g. role field).
  const currentUser = { id: decoded.userId, role: decoded.role || 'owner' };

  return <FormPageClient company={company} currentUser={currentUser} />;
}