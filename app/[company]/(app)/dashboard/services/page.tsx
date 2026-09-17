import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getCompanyBySlug } from '@/lib/getCompany';
import ServicesClient from './ServicesClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

// Same minimal typed shape CalendarPage uses for its own known fields —
// getCompanyBySlug's SELECT * means every other field CategoriesTab
// reads (default_tax_rate, default_deposit_type, email_brand_color_1,
// custom_questions, etc.) is already present on the row regardless of
// what's listed here.
type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  created_at: string;
  business_type: string;
  plan_tier?: string;
  form_categories?: any[] | null;
};

async function verifyAuth(companySlug: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    if (!token) {
      redirect('/login');
    }
    const decoded = jwt.verify(
      token.value,
      getJwtSecret()
    ) as any;

    if (decoded.role !== 'admin' && decoded.companySlug !== companySlug) {
      redirect(`/${decoded.companySlug}/dashboard`);
    }
    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    redirect('/login');
  }
}

// Same shape CompanyShell's own getShellUser uses at the layout level —
// CategoriesTab accepts currentUser as an optional prop, so this fetches
// it server-side rather than leaving it undefined.
async function getCurrentUser(userId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId} LIMIT 1`;
  return rows.length ? rows[0] : null;
}

export default async function ServicesPage({ params }: PageProps) {
  const { company: companySlug } = await params;

  const decoded = await verifyAuth(companySlug);

  const [company, currentUser] = await Promise.all([
    getCompanyBySlug(companySlug) as Promise<Company | null>,
    getCurrentUser(decoded.userId),
  ]);

  if (!company) {
    notFound();
  }

  const companyData = {
    ...company,
    form_categories: company.form_categories || [],
    plan_tier: company.plan_tier || 'free',
  };

  return <ServicesClient company={companyData} currentUser={currentUser} />;
}