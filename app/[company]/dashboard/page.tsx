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
  status_options?: any[];
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

    // Check if user belongs to this company
    const sql = neon(process.env.DATABASE_URL!);
    const userAccess = await sql`
      SELECT u.id, u.company_id, c.slug
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
      AND c.slug = ${companySlug}
    `;

    // If no match found, user doesn't have access to this company
    if (userAccess.length === 0) {
      // Get their actual company slug
      const userCompany = await sql`
        SELECT c.slug
        FROM users u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ${decoded.userId}
      `;

      if (userCompany.length > 0) {
        // Redirect to their own dashboard
        redirect(`/${userCompany[0].slug}/dashboard`);
      } else {
        // No company found, go to login
        redirect('/login');
      }
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

  // CHECK SUBSCRIPTION STATUS
  const isTrialExpired = company.subscription_status === 'trialing' && 
    company.trial_ends_at && 
    new Date(company.trial_ends_at) < new Date();

  const needsPayment = !company.subscription_status || 
    company.subscription_status === 'canceled' ||
    company.subscription_status === 'past_due' ||
    company.subscription_status === 'inactive' ||
    isTrialExpired;

  // Redirect to subscribe page if payment needed
  if (needsPayment) {
    redirect(`/subscribe?reason=payment_required&company=${companySlug}`);
  }

  return <CompanyDashboardClient company={company} />;
}