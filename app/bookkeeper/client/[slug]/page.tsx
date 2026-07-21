import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import BookkeeperClientView from './BookkeeperClientView';

export default async function BookkeeperClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('bookkeeper-auth-token')?.value;
  if (!token) redirect('/bookkeeper/login');

  let bookkeeper: any;
  try {
    bookkeeper = jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    redirect('/bookkeeper/login');
  }

  const sql = neon(process.env.DATABASE_URL!);

  // Verify company belongs to this bookkeeper
  const companies = await sql`
    SELECT id, name, slug, logo_url, plan_tier
    FROM companies
    WHERE slug = ${slug}
      AND referred_by_code = ${bookkeeper.partner_code}
    LIMIT 1
  `;

  if (!companies.length) notFound();

  const company = companies[0];

  const projects = await sql`
    SELECT
      p.id,
      p.invoice_number,
      p.quote_total,
      p.quote_tax_rate,
      p.payment_status,
      p.payment_amount,
      p.payment_date,
      p.payment_due_date,
      p.scheduled_date,
      p.documents,
      p.quote_data,
      p.status,
      p.created_at,
      p.payment_method,
      p.invoice_pdf_url,
      COALESCE(p.category, l.category) as category,
      l.name as customer_name,
      l.id as lead_id
    FROM projects p
    JOIN leads l ON p.lead_id = l.id
    WHERE l.company_id = ${company.id}
      AND l.deleted = false
      AND p.quote_total IS NOT NULL
      AND p.quote_total::numeric > 0
    ORDER BY p.created_at DESC
  `;

  return (
    <BookkeeperClientView
      company={company}
      projects={projects}
      bookkeeper={bookkeeper}
    />
  );
}