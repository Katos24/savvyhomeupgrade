import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import CompanyContactForm from './CompanyContactForm';

interface Company {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  logo_url: string | null;
  created_at: Date;
}

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const companies = await sql`
    SELECT * FROM companies WHERE slug = ${slug}
  `;

  if (companies.length === 0) {
    return null;
  }

  return companies[0] as Company;
}

export default async function CompanyPage({ 
  params 
}: { 
  params: Promise<{ company: string }> 
}) {
  // Await params first!
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  return <CompanyContactForm company={company} />;
}
