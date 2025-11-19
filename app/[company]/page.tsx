import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import CompanyContactForm from './CompanyContactForm';

type Props = {
  params: Promise<{ company: string }>
};

export default async function CompanyPage({ params }: Props) {
  const { company: companySlug } = await params;
  
  console.log('Looking for company:', companySlug);
  
  const sql = neon(process.env.DATABASE_URL!);
  
  const companies = await sql`
    SELECT * FROM companies WHERE slug = ${companySlug}
  `;
  
  console.log('Found companies:', companies);
  
  if (companies.length === 0) {
    notFound();
  }
  
  const company = companies[0];
  
  return <CompanyContactForm company={company} />;
}
