import { getJwtSecret } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { Metadata } from 'next';
import { neon } from '@neondatabase/serverless';
import FormPageClient from './FormPageClient';
import { getCompanyBySlug } from '@/lib/getCompany';

async function verifyAuth(companySlug: string) {
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
  return decoded;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Booking Form`, robots: { index: false, follow: false } };
}

export default async function FormPage({ params }: { params: Promise<{ company: string }> }) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompanyBySlug(companySlug);
  if (!company) notFound();

  // NOTE: same as before — verify currentUser shape against your actual
  // /api/auth/me response, since decoded JWT may not carry `role`.
  const currentUser = { id: decoded.userId, role: decoded.role || 'owner' };

  return <FormPageClient company={company} currentUser={currentUser} />;
}