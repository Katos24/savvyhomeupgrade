import { getJwtSecret } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getCompanyBySlug } from '@/lib/getCompany';
import CalendarClient from './CalendarClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

// Documents the fields this page reads directly — getCompanyBySlug's
// SELECT * means every Stripe/payment column (and anything added later)
// is already on the row regardless of what's listed here.
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
  status_options: any[] | null;
  form_categories?: any[] | null;
  address_enabled: boolean | null;
  address_required: boolean;
};

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
      getJwtSecret()
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

export default async function CalendarPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  // Verify authentication and authorization
  await verifyAuth(companySlug);
  const company = (await getCompanyBySlug(companySlug)) as Company | null;
  if (!company) {
    notFound();
  }

  // Transform company to match CalendarClient's expected type. No JSON.parse
  // needed here — getCompanyBySlug's SELECT * already comes back with JSONB
  // columns deserialized as native arrays/objects (confirmed by this same
  // pattern already working for the Dashboard and Financials pages).
  const companyData = {
    ...company,
    status_options: Array.isArray(company.status_options) && company.status_options.length > 0
      ? company.status_options
      : [],
    form_categories: company.form_categories || [],
    plan_tier: company.plan_tier || 'free',
  };

  return <CalendarClient company={companyData} />;
}