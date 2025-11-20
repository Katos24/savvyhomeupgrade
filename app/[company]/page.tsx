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
  
  console.log('Looking for company:', slug);
  const companies = await sql`
    SELECT * FROM companies WHERE slug = ${slug}
  `;
  console.log('Found companies:', companies);

  if (companies.length === 0) {
    return null;
  }

  return companies[0] as Company;
}

export default async function CompanyPage({ params }: { params: { company: string } }) {
  const company = await getCompany(params.company);

  if (!company) {
    notFound();
  }

  return <CompanyContactForm company={company} />;
}
