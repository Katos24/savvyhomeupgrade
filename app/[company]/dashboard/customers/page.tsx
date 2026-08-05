import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import CustomerListClient from './CustomerListClient';

async function verifyAuth(companySlug: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) redirect('/login');

    const decoded = jwt.verify(
      token.value,
      getJwtSecret()
    ) as any;

    const sql = neon(process.env.DATABASE_URL!);

    const userAccess = await sql`
      SELECT u.id, u.company_id, c.slug
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
      AND c.slug = ${companySlug}
    `;

    if (userAccess.length === 0) {
      const userCompany = await sql`
        SELECT c.slug
        FROM users u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ${decoded.userId}
      `;
      if (userCompany.length > 0) redirect(`/${userCompany[0].slug}/dashboard`);
      redirect('/login');
    }

    return decoded;
  } catch (err) {
    console.error(err);
    redirect('/login');
  }
}

// Simplified this function to just return the raw rows
async function getRawProjects(companyId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT 
      id,
      lead_id,
      customer_name,
      customer_email,
      customer_phone,
      service_address,
      status,
      category,
      updated_at,
      created_at
    FROM projects
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
  `;
  return rows;
}
export default async function CustomerListPage({
  params
}: {
  params: Promise<{ company: string }>
}) {
  const { company: companySlug } = await params;

  await verifyAuth(companySlug);

  const sql = neon(process.env.DATABASE_URL!);
  const company = await sql`
    SELECT id FROM companies WHERE slug = ${companySlug}
  `;

  if (company.length === 0) notFound();

  // Fetch the raw flat list of projects
  const projects = await getRawProjects(company[0].id);

  // Pass 'projects' prop to match the CustomerListClient definition
  return <CustomerListClient projects={projects as any} companySlug={companySlug} />;
}