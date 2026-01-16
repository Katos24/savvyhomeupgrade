import { neon } from '@neondatabase/serverless';
import { redirect } from 'next/navigation';
import DeletedLeadsClient from './DeletedLeadsClient';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
};

type PageProps = {
  params: Promise<{
    company: string;
  }>;
};

export default async function DeletedLeadsPage({ params }: PageProps) {
  const { company: slug } = await params;
  const sql = neon(process.env.DATABASE_URL!);

  // Fetch company data
  const companies = await sql`
    SELECT id, name, slug, logo_url FROM companies WHERE slug = ${slug}
  `;

  if (companies.length === 0) {
    redirect('/');
  }

  const company = companies[0] as Company;

  return <DeletedLeadsClient company={company} />;
}