import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import FinancialsClient from './FinancialsClient';

export const dynamic = 'force-dynamic';

// Auth + company membership now lives once in app/[company]/(app)/layout.tsx.

export default async function FinancialsPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const sql = neon(process.env.DATABASE_URL!);

  const companyRows = await sql`
    SELECT id, name, slug, logo_url, plan_tier,
           stripe_connect_onboarded, stripe_payment_status,
           payment_link_url, payment_link_type
    FROM companies
    WHERE slug = ${companySlug}
    LIMIT 1
  `;
  if (!companyRows.length) notFound();
  const company = companyRows[0];

  const projectRows = await sql`
    SELECT
      p.id,
      p.invoice_number,
      p.invoice_sent_at,
      p.reminder_sent_at,
      l.email as customer_email,
      p.quote_total,
      p.quote_tax_rate,
      p.payment_status,
      p.payment_amount,
      p.payment_date,
      p.payment_due_date,
      p.scheduled_date,
      p.documents,
      p.quote_data,
      COALESCE(p.category, l.category) as category,
      p.status,
      p.created_at,
      p.payment_method,
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

  return <FinancialsClient company={company as any} projects={projectRows as any} />;
}