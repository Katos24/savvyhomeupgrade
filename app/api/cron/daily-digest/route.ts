import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendDailyDigestEmail } from '@/lib/email';

const sql = neon(process.env.DATABASE_URL!);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📧 Starting daily digest...');

    // Only companies with digest enabled and active subscription
    const companies = await sql`
      SELECT id, name, slug, email, reminder_settings, notification_preferences
      FROM companies
      WHERE
  daily_digest_enabled = true
  AND subscription_status IN ('active', 'trialing')
    `;

    console.log(`📊 ${companies.length} companies have daily digest enabled`);

    let sent = 0;
    let skipped = 0;

    for (const company of companies) {
      try {
        const rs = company.reminder_settings || {};
        const followUpDays    = rs.follow_up_days           || 3;
        const quoteFollowDays = rs.quote_follow_up_days     || 2;
        const schedFollowDays = rs.schedule_follow_up_days  || 1;

        const todayStr = new Date().toISOString().split('T')[0];

        // ── TODAY'S JOBS ──
        const todayJobs = await sql`
          SELECT
            l.name  AS customer_name,
            l.phone AS customer_phone,
            p.scheduled_time,
            p.assigned_to,
            p.project_number,
            l.category
          FROM projects p
          JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND p.scheduled_date::date = ${todayStr}::date
          ORDER BY p.scheduled_time ASC NULLS LAST
        `;

        // ── STALE LEADS (no project yet, inactive) ──
        const staleLeads = await sql`
          SELECT l.id, l.name, l.category, l.status, l.updated_at
          FROM leads l
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND l.project_id IS NULL
            AND l.updated_at < NOW() - (${followUpDays} || ' days')::interval
            AND l.status NOT IN ('completed', 'cancelled', 'lost')
          ORDER BY l.updated_at ASC
          LIMIT 10
        `;

        // ── QUOTES SENT, NO RESPONSE ──
        const staleQuotes = await sql`
          SELECT
            l.name AS customer_name,
            p.project_number,
            p.quote_total,
            p.quote_sent_at
          FROM projects p
          JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND p.quote_sent_at IS NOT NULL
            AND p.quote_accepted_at IS NULL
            AND p.quote_sent_at < NOW() - (${quoteFollowDays} || ' days')::interval
            AND (p.payment_status IS NULL OR p.payment_status = 'unpaid')
          ORDER BY p.quote_sent_at ASC
          LIMIT 10
        `;

        // ── JOB DONE, NO PAYMENT ──
        const unpaidJobs = await sql`
          SELECT
            l.name AS customer_name,
            p.project_number,
            p.quote_total,
            p.scheduled_date
          FROM projects p
          JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND p.scheduled_date IS NOT NULL
            AND p.scheduled_date < NOW() - (${schedFollowDays} || ' days')::interval
            AND (p.payment_status IS NULL OR p.payment_status = 'unpaid')
            AND p.quote_total IS NOT NULL
          ORDER BY p.scheduled_date ASC
          LIMIT 10
        `;

        // ── OVERDUE PAYMENTS ──
        const overduePayments = await sql`
          SELECT
            l.name AS customer_name,
            p.project_number,
            p.quote_total,
            p.payment_amount,
            p.payment_due_date
          FROM projects p
          JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND p.payment_due_date < NOW()
            AND (p.payment_status IS NULL OR p.payment_status NOT IN ('paid'))
          ORDER BY p.payment_due_date ASC
          LIMIT 10
        `;

        // ── DUE THIS WEEK ──
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        const dueSoon = await sql`
          SELECT
            l.name AS customer_name,
            p.project_number,
            p.quote_total,
            p.payment_amount,
            p.payment_due_date
          FROM projects p
          JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
            AND l.deleted = false
            AND p.payment_due_date >= NOW()
            AND p.payment_due_date <= ${weekFromNow.toISOString()}
            AND (p.payment_status IS NULL OR p.payment_status NOT IN ('paid'))
          ORDER BY p.payment_due_date ASC
          LIMIT 10
        `;

        const totalItems =
          todayJobs.length + staleLeads.length + staleQuotes.length +
          unpaidJobs.length + overduePayments.length + dueSoon.length;

        if (totalItems === 0) {
          console.log(`⏭ Skipping ${company.name} — nothing to report`);
          skipped++;
          continue;
        }

        await sendDailyDigestEmail({
          companyEmail: company.email,
          companyName: company.name,
          companySlug: company.slug,
          todayJobs:        todayJobs        as any[],
          staleLeads:       staleLeads       as any[],
          staleQuotes:      staleQuotes      as any[],
          unpaidJobs:       unpaidJobs       as any[],
          overduePayments:  overduePayments  as any[],
          dueSoon:          dueSoon          as any[],
        });

        sent++;
        console.log(`✅ Digest sent → ${company.name} (${company.email}) | ${totalItems} items`);
        await delay(600);

      } catch (err) {
        console.error(`❌ Failed digest for ${company.name}:`, err);
      }
    }

    return NextResponse.json({ success: true, sent, skipped, total: companies.length });

  } catch (error) {
    console.error('❌ Daily digest cron error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}