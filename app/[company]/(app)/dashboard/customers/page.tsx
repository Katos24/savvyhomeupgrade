import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import CustomerListClient from './CustomerListClient';

// Auth + company-membership check now lives once in app/[company]/layout.tsx,
// which wraps this page automatically. This page fetches only what it
// specifically needs for its own query.

async function getRawProjects(companyId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT
      id, lead_id, customer_name, customer_email, customer_phone,
      service_address, status, category, updated_at, created_at,
      quote_total, payment_status
    FROM projects
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
  `;
  return rows;
}

export default async function CustomerListPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;

  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT id, email_brand_color_1 FROM companies WHERE slug = ${companySlug} LIMIT 1
  `;
  if (companies.length === 0) notFound();

  const projects = await getRawProjects(companies[0].id);

  return (
    <CustomerListClient
      projects={projects as any}
      companySlug={companySlug}
      accentColor={companies[0].email_brand_color_1 || '#2563eb'}
    />
  );
}