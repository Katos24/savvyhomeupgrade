// app/[company]/layout.tsx
import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CompanyShell from './CompanyShell';

// Same shape as CompanyDashboardPage's Company type — kept minimal here
// since the shell only needs identity/branding fields, not every
// per-feature field individual pages fetch for themselves.
export interface CompanyShellData {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  email_brand_color_1: string | null;
  email_brand_color_2: string | null;
  plan_tier?: string;
}

export interface ShellUser {
  id: number;
  name: string;
  email: string;
}

async function verifyAuthAndGetUser(companySlug: string): Promise<{ userId: number }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token?.value) {
    redirect('/login');
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token.value, getJwtSecret());
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

  return decoded;
}

async function getCompanyForShell(slug: string): Promise<CompanyShellData | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT id, name, slug, logo_url, email_brand_color_1, email_brand_color_2, plan_tier
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  return rows.length ? (rows[0] as CompanyShellData) : null;
}

async function getShellUser(userId: number): Promise<ShellUser | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, name, email FROM users WHERE id = ${userId} LIMIT 1`;
  return rows.length ? (rows[0] as ShellUser) : null;
}

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;

  const decoded = await verifyAuthAndGetUser(companySlug);

  const [company, currentUser] = await Promise.all([
    getCompanyForShell(companySlug),
    getShellUser(decoded.userId),
  ]);

  if (!company) notFound();

  return (
    <CompanyShell company={company} currentUser={currentUser}>
      {children}
    </CompanyShell>
  );
}