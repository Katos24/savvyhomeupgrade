import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CompanyDashboardClient from './CompanyDashboardClient';

interface Company {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logo_url: string | null;
  created_at: Date;
  subscription_status?: string;
  trial_ends_at?: string | null;
}

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT 
      id,
      name,
      slug,
      email,
      phone,
      logo_url,
      created_at,
      subscription_status,
      trial_ends_at,
      status_options
    FROM companies 
    WHERE slug = ${slug}
  `;

  if (companies.length === 0) {
    return null;
  }

  return companies[0] as Company;
}

async function verifyAuth(companySlug: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      redirect('/login');
    }

    // Verify JWT
    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    ) as any;

    // Check if user has access to this company
    if (decoded.role !== 'admin' && decoded.companySlug !== companySlug) {
      // Redirect to their own dashboard
      redirect(`/${decoded.companySlug}/dashboard`);
    }

    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    redirect('/login');
  }
}

export default async function CompanyDashboardPage({
  params
}: {
  params: Promise<{ company: string }>
}) {
  // Await params first
  const { company: companySlug } = await params;

  // Verify authentication and authorization
  await verifyAuth(companySlug);

  // Get company data
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  return <CompanyDashboardClient company={company} />;
}