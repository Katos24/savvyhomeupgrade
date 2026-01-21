import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
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
  status_options: any[] | null;
  form_categories: any[] | null;
  address_enabled: boolean | null;
  address_required: boolean;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT * FROM companies WHERE slug = ${slug}
  `;
  
  return companies.length > 0 ? (companies[0] as Company) : null;
}

export default async function CalendarPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  // Transform company to match CalendarClient's expected type
  const companyData = {
    ...company,
    status_options: company.status_options || undefined,
  };

  return <CalendarClient company={companyData} />;
}