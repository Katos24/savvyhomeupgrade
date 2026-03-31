import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import OutboxClient from './OutboxClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT id, name, slug, logo_url
    FROM companies
    WHERE slug = ${slug}
  `;
  if (companies.length === 0) return null;
  return companies[0] as Company;
}

async function verifyAuth(companySlug: string): Promise<{ userId: number }> {
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
      if (userCompany.length > 0) {
        redirect(`/${userCompany[0].slug}/dashboard`);
      } else {
        redirect('/login');
      }
    }

    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    redirect('/login');
  }
}

async function getCurrentUser(userId: number): Promise<CurrentUser | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`
    SELECT id, name, email FROM users WHERE id = ${userId}
  `;
  if (users.length === 0) return null;
  return users[0] as CurrentUser;
}

async function getOutboxData(companyId: number) {
  const sql = neon(process.env.DATABASE_URL!);

  const [outboxEmails, outboxTotal, projects, legacyTotal, statsRows] = await Promise.all([
    sql`
      SELECT * FROM email_outbox
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 25
    `,
    sql`SELECT COUNT(*) as total FROM email_outbox WHERE company_id = ${companyId}`,
    sql`
      SELECT id, lead_id, customer_name, customer_email,
        COALESCE(quote_emails, '[]'::jsonb) AS quote_emails,
        COALESCE(schedule_emails, '[]'::jsonb) AS schedule_emails
      FROM projects
      WHERE company_id = ${companyId}
        AND (
          jsonb_array_length(COALESCE(quote_emails, '[]'::jsonb)) > 0
          OR jsonb_array_length(COALESCE(schedule_emails, '[]'::jsonb)) > 0
        )
      ORDER BY updated_at DESC
      LIMIT 25
    `,
    sql`
      SELECT COUNT(*) as total FROM projects
      WHERE company_id = ${companyId}
        AND (
          jsonb_array_length(COALESCE(quote_emails, '[]'::jsonb)) > 0
          OR jsonb_array_length(COALESCE(schedule_emails, '[]'::jsonb)) > 0
        )
    `,
    sql`
      SELECT
COUNT(*) FILTER (WHERE status != 'failed') as sent,
        COUNT(*) FILTER (WHERE type = 'payment_reminder') as reminders,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(SUM(
          CASE WHEN type = 'quote'
          THEN COALESCE((metadata->>'quote_total')::numeric, 0)
          ELSE 0 END
        ), 0) as revenue
      FROM email_outbox
      WHERE company_id = ${companyId}
    `,
  ]);

  const stats = statsRows[0];
console.log('SERVER totalStats:', {
  sent: parseInt(stats.sent) + parseInt(legacyTotal[0].total),
  revenue: parseFloat(stats.revenue) || 0,
  reminders: parseInt(stats.reminders) || 0,
  failed: parseInt(stats.failed) || 0,
});

  return {
    outboxEmails,
    projects,
    outboxTotal: parseInt(outboxTotal[0].total) + parseInt(legacyTotal[0].total),
    totalStats: {
      sent: parseInt(outboxTotal[0].total) + parseInt(legacyTotal[0].total),
      revenue: parseFloat(stats.revenue) || 0,
      reminders: parseInt(stats.reminders) || 0,
      failed: parseInt(stats.failed) || 0,
    },
  };
}


export default async function OutboxPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  const [currentUser, outboxData] = await Promise.all([
    getCurrentUser(decoded.userId),
    getOutboxData(company.id),
  ]);

  if (!currentUser) redirect('/login');

return (
  <OutboxClient
    company={company}
    projects={outboxData.projects as any}
    outboxEmails={outboxData.outboxEmails as any}
    totalEmails={outboxData.outboxTotal}
    totalStats={outboxData.totalStats}
  />
);
}