import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import CompanyDashboardClient from './CompanyDashboardClient';
import { neon } from '@neondatabase/serverless';

type Props = {
  params: Promise<{ company: string }>
};

export default async function CompanyDashboard({ params }: Props) {
  const { company: companySlug } = await params;
  
  // Check if user is logged in
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Check if user has access to this company
  if (session.role !== 'admin' && session.companySlug !== companySlug) {
    redirect('/login');
  }
  
  // Get company details
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`SELECT * FROM companies WHERE slug = ${companySlug}`;
  
  if (companies.length === 0) {
    redirect('/');
  }
  
  return <CompanyDashboardClient company={companies[0]} />;
}
