import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CalendarClient from './CalendarClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

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
      business_type,
     status_options,
      form_categories,
      plan_tier,
      address_enabled,
      address_required
    FROM companies 
    WHERE slug = ${slug}
  `;
  
  if (companies.length === 0) return null;
  
  const company = companies[0] as Company;
  
  // Parse JSON fields if they're strings
  if (typeof company.status_options === 'string') {
    company.status_options = JSON.parse(company.status_options);
  }
  if (typeof company.form_categories === 'string') {
    company.form_categories = JSON.parse(company.form_categories);
  }
  
  return company;
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

export default async function CalendarPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  
  // Verify authentication and authorization
  await verifyAuth(companySlug);
  
  const company = await getCompany(companySlug);
  
  if (!company) {
    notFound();
  }

// Transform company to match CalendarClient's expected type
const companyData = {
...company,
status_options: Array.isArray(company.status_options) && company.status_options.length > 0
? company.status_options 
: [],
form_categories: company.form_categories || [],
plan_tier: company.plan_tier || 'free',
};

return <CalendarClient company={companyData} />;} 