import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import FinancialsClient from './FinancialsClient';
import { getRecentPayments } from '@/lib/recentPayments';

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

  // deposit_type/deposit_value/deposit_paid_at added — without these,
  // FinancialsClient has no way to know a job even has deposit terms, so
  // "Partial" was the only status any deposit-in-progress job could ever
  // show, with no distinction from "deposit's done, owes the remainder."
  // Same missing-column pattern already found and fixed in
  // payments/route.ts and generate-invoice-pdf/route.ts earlier — this is
  // the same gap, just in Financials' own query.
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
      p.deposit_type,
      p.deposit_value,
      p.deposit_paid_at,
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

  // Now sourced from the shared lib/recentPayments.ts function instead of
  // its own inline copy — same duplication risk as Dashboard's version,
  // which is exactly what let the two surfaces disagree on what counts
  // as "recent" for the same underlying data.
  //
  // FIXED: last argument was `false` — meaning this call never fetched
  // payment_status at all, so FinancialsOverview's "Recent Cash Inflows"
  // card had no way to show a refunded/partial badge even after that
  // component was updated to render one. A payment that was later fully
  // refunded looked identical to real, uncomplicated revenue here, while
  // Dashboard's own Recent Payments (which does pass true) correctly
  // showed the badge for the exact same underlying data.
  const paymentRows = await getRecentPayments(sql, company.id, 6, true);

  return (
    <FinancialsClient
      company={company as any}
      projects={projectRows as any}
      recentPayments={paymentRows as any}
    />
  );
}