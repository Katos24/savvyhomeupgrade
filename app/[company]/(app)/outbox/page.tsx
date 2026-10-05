import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import OutboxClient from './OutboxClient';
import { can, type PlanTier } from '@/lib/permissions';
import { Lock } from 'lucide-react';

type PageProps = {
  params: Promise<{ company: string }>;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  plan_tier?: string | null;
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
        SELECT id, name, slug, logo_url, plan_tier
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

  const [outboxEmails, outboxTotal, projects, statsRows, revenueRows, typeCounts] = await Promise.all([

    // ── First page of outbox emails ───────────────────────────────
    sql`
      SELECT * FROM email_outbox
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
      LIMIT 25
    `,

    // ── Total outbox count ────────────────────────────────────────
    sql`
      SELECT COUNT(*) as total
      FROM email_outbox
      WHERE company_id = ${companyId}
    `,

    // ── Legacy project emails (quote/schedule stored in projects) ─
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

    // ── Stats from outbox only ────────────────────────────────────
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status != 'failed') as sent,
        COUNT(*) FILTER (WHERE type = 'payment_reminder') as reminders,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM email_outbox
      WHERE company_id = ${companyId}
    `,

    // ── Real revenue: net dollars actually collected (refunds are
    // already negative rows, so they net out), not the value of every
    // quote emailed regardless of whether it was ever accepted or paid.
    sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE company_id = ${companyId}
    `,

    // ── Per-type counts for accurate tab badges ───────────────────
    sql`
      SELECT type, COUNT(*) as count
      FROM email_outbox
      WHERE company_id = ${companyId}
      GROUP BY type
    `,
  ]);

  const stats = statsRows[0];
  const total = parseInt(outboxTotal[0].total);
  const realRevenue = parseFloat(revenueRows[0]?.total) || 0;

  // Build type count map for accurate tab counts
  const typeCountMap: Record<string, number> = {};
  typeCounts.forEach((row: any) => {
    typeCountMap[row.type] = parseInt(row.count);
  });

  return {
    outboxEmails,
    projects,
    // Total is outbox only — legacy emails shown as supplement, not double counted
    outboxTotal: total,
        totalStats: {
      sent:     parseInt(stats.sent)     || 0,
      revenue:  realRevenue,
      reminders: parseInt(stats.reminders) || 0,
      failed:   parseInt(stats.failed)   || 0,
    },
    typeCountMap,
  };
}

export default async function OutboxPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const decoded = await verifyAuth(companySlug);
  const company = await getCompany(companySlug);
  if (!company) notFound();

  // Outbox is a paid feature. Show an upgrade screen instead of loading any emails.
  if (!can((company.plan_tier || 'free') as PlanTier, 'outbox')) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 sm:px-10 text-center shadow-xs">
            <Lock className="mx-auto mb-4 h-6 w-6 text-slate-400" />
            <p className="text-lg sm:text-xl font-bold text-slate-900">Every email you send, in one place.</p>
            <p className="mt-2 text-sm text-slate-500">The outbox is on the Pro plan.</p>
            <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
              {[
                'Every quote, schedule, invoice and reminder you send',
                'Search by customer name or email',
                'See exactly what was sent, and who sent it',
                'Failed sends and duplicates flagged',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 font-bold text-blue-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={`/${companySlug}/home?section=billing`}
              className="mt-7 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

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
      typeCountMap={outboxData.typeCountMap}
    />
  );
}