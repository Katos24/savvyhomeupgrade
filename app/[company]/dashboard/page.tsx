import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import CompanyDashboardClient from './CompanyDashboardClient';

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

export default async function CompanyDashboardPage({ 
  params 
}: { 
  params: { company: string } 
}) {
  const company = await getCompany(params.company);
  
  if (!company) {
    notFound();
  }

  return <CompanyDashboardClient company={company} />;
}
