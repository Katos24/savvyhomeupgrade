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
      process.env.JWT_SECRET || 'your-secret-key-change-this'
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

async function getCustomers(companyId: number) {
  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT 
      customer_name,
      customer_email,
      customer_phone,
      service_address,
      city,
      id AS project_id,
      status,
      created_at
    FROM projects
    WHERE company_id = ${companyId}
    ORDER BY created_at DESC
  `;

  // Group by customer_email
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.customer_email)) {
      map.set(row.customer_email, {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        addresses: new Set(),
        latest_project: row.project_id,
        latest_status: row.status,
        latest_date: row.created_at
      });
    }

    const entry = map.get(row.customer_email);
    if (row.service_address) entry.addresses.add(row.service_address);
  }

  return Array.from(map.values()).map(c => ({
    ...c,
    addresses: Array.from(c.addresses)
  }));
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

  const customers = await getCustomers(company[0].id);

  return <CustomerListClient customers={customers} companySlug={companySlug} />;
}