import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import FinancialsClient from './FinancialsClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

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
      SELECT u.id, u.company_id, c.slug, c.id as cid
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
      AND c.slug = ${companySlug}
    `;

    if (userAccess.length === 0) {
      const userCompany = await sql`
        SELECT c.slug FROM users u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ${decoded.userId}
      `;
      redirect(userCompany.length > 0 ? `/${userCompany[0].slug}/dashboard` : '/login');
    }

    return { decoded, companyId: userAccess[0].cid };
  } catch {
    redirect('/login');
  }
}

export default async function FinancialsPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const { companyId } = await verifyAuth(companySlug);

  const sql = neon(process.env.DATABASE_URL!);

const [companyRows, projectRows] = await Promise.all([
        sql`
      SELECT id, name, slug, logo_url, plan_tier
      FROM companies
      WHERE slug = ${companySlug}
      LIMIT 1
    `,
   sql`
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
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
      ORDER BY p.created_at DESC
    `,
  ]);

  if (!companyRows.length) notFound();

  const company = companyRows[0];

  return (
    <FinancialsClient
      company={company as any}
      projects={projectRows as any}
    />
  );
}