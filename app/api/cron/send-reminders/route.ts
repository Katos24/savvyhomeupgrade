import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendFollowUpReminderEmail } from '@/lib/email';

const sql = neon(process.env.DATABASE_URL!);

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const companies = await sql`
      SELECT 
        id, 
        name, 
        slug,
        reminder_settings
      FROM companies
      WHERE 
        reminder_settings IS NOT NULL
        AND (reminder_settings->>'follow_up_enabled')::boolean = true
    `;


    let totalReminders = 0;

    for (const company of companies) {
      const settings = company.reminder_settings || {
        follow_up_enabled: true,
        follow_up_days: 3,
        quote_follow_up_days: 2,
        schedule_follow_up_days: 1,
      };

      const users = await sql`
        SELECT email, name
        FROM users
        WHERE company_id = ${company.id}
          AND role IN ('owner', 'admin')
          AND email IS NOT NULL
        LIMIT 1
      `;

      if (users.length === 0) {
        continue;
      }

      const adminUser = users[0];
      const leadsNeedingFollowUp: any[] = [];

      // 1. General follow-ups (no activity in X days)
      if (settings.follow_up_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - settings.follow_up_days);
        
        const generalFollowUps = await sql`
          SELECT 
            p.id,
            p.lead_id,
            p.customer_name,
            p.customer_email,
            p.customer_phone,
            p.status,
            l.category,
            p.updated_at,
            EXTRACT(DAY FROM NOW() - p.updated_at) as days_since_update
          FROM projects p
          LEFT JOIN leads l ON p.lead_id = l.id
          WHERE p.company_id = ${company.id}
            AND p.status NOT IN ('completed', 'cancelled', 'lost')
            AND p.updated_at < ${cutoffDate.toISOString()}
            AND (
              p.reminder_sent_at IS NULL
              OR p.reminder_sent_at < NOW() - INTERVAL '24 hours'
            )
          ORDER BY p.updated_at ASC
          LIMIT 50
        `;

        generalFollowUps.forEach((lead: any) => {
          leadsNeedingFollowUp.push({
            ...lead,
            reason: `No activity for ${Math.floor(lead.days_since_update)} days`,
            type: 'general',
          });
        });
      }

      // 2. Quote follow-ups (quote sent X days ago)
      if (settings.quote_follow_up_days && settings.quote_follow_up_days > 0) {
        const quoteCutoffDate = new Date();
        quoteCutoffDate.setDate(quoteCutoffDate.getDate() - settings.quote_follow_up_days);
        
        const quoteFollowUps = await sql`
          SELECT DISTINCT ON (p.id)
            p.id,
            p.lead_id,
            p.customer_name,
            p.customer_email,
            p.customer_phone,
            p.status,
            l.category,
            p.quote_total,
            EXTRACT(DAY FROM NOW() - (
              SELECT (note->>'timestamp')::timestamp 
              FROM jsonb_array_elements(p.notes) AS note
              WHERE note->>'type' = 'quote_sent'
              ORDER BY (note->>'timestamp')::timestamp DESC
              LIMIT 1
            )) as days_since_quote
          FROM projects p
          LEFT JOIN leads l ON p.lead_id = l.id
          WHERE p.company_id = ${company.id}
            AND p.status = 'quoted'
            AND p.notes IS NOT NULL
            AND EXISTS (
              SELECT 1 
              FROM jsonb_array_elements(p.notes) AS note
              WHERE note->>'type' = 'quote_sent'
                AND (note->>'timestamp')::timestamp < ${quoteCutoffDate.toISOString()}
            )
          LIMIT 50
        `;

        quoteFollowUps.forEach((lead: any) => {
          if (!leadsNeedingFollowUp.find(l => l.id === lead.id)) {
            leadsNeedingFollowUp.push({
              ...lead,
              reason: `Quote sent ${Math.floor(lead.days_since_quote)} days ago`,
              type: 'quote',
            });
          }
        });
      }

      // 3. Post-appointment follow-ups
      if (settings.schedule_follow_up_days && settings.schedule_follow_up_days > 0) {
        const scheduleCutoffDate = new Date();
        scheduleCutoffDate.setDate(scheduleCutoffDate.getDate() - settings.schedule_follow_up_days);
        
        const scheduleFollowUps = await sql`
          SELECT 
            p.id,
            p.lead_id,
            p.customer_name,
            p.customer_email,
            p.customer_phone,
            p.status,
            l.category,
            p.scheduled_date,
            EXTRACT(DAY FROM NOW() - p.scheduled_date) as days_since_appointment
          FROM projects p
          LEFT JOIN leads l ON p.lead_id = l.id
          WHERE p.company_id = ${company.id}
            AND p.scheduled_date IS NOT NULL
            AND p.scheduled_date < ${scheduleCutoffDate.toISOString()}
            AND p.status NOT IN ('completed', 'cancelled', 'lost')
          LIMIT 50
        `;

        scheduleFollowUps.forEach((lead: any) => {
          if (!leadsNeedingFollowUp.find(l => l.id === lead.id)) {
            leadsNeedingFollowUp.push({
              ...lead,
              reason: `Appointment was ${Math.floor(lead.days_since_appointment)} days ago`,
              type: 'schedule',
            });
          }
        });
      }

      // 4. Custom reminders (manually set follow-up dates)
      const customReminders = await sql`
        SELECT 
          p.id,
          p.lead_id,
          p.customer_name,
          p.customer_email,
          p.customer_phone,
          p.status,
          l.category,
          p.follow_up_date,
          p.follow_up_notes
        FROM projects p
        LEFT JOIN leads l ON p.lead_id = l.id
        WHERE p.company_id = ${company.id}
          AND p.follow_up_date IS NOT NULL
          AND p.follow_up_date::date <= CURRENT_DATE
          AND p.status NOT IN ('completed', 'cancelled', 'lost')
          AND (
            p.reminder_sent_at IS NULL
            OR p.reminder_sent_at < NOW() - INTERVAL '24 hours'
          )
        LIMIT 50
      `;

      customReminders.forEach((lead: any) => {
        if (!leadsNeedingFollowUp.find(l => l.id === lead.id)) {
          leadsNeedingFollowUp.push({
            ...lead,
            reason: lead.follow_up_notes || 'Custom reminder',
            type: 'custom',
          });
        }
      });

      // Send email if there are leads needing follow-up
      if (leadsNeedingFollowUp.length > 0) {
        
        await sendFollowUpReminderEmail({
          recipientEmail: adminUser.email,
          recipientName: adminUser.name || 'Team',
          companyName: company.name,
          companySlug: company.slug,
          leads: leadsNeedingFollowUp,
        });

         totalReminders++;

        // Mark all reminded projects so we don't double-send
        const remindedIds = leadsNeedingFollowUp.map((l: any) => l.id).filter(Boolean);
        if (remindedIds.length > 0) {
          await sql`
            UPDATE projects
            SET reminder_sent_at = NOW()
            WHERE id = ANY(${remindedIds}::int[])
          `;
        }

        await delay(600);
      }
    }


    return NextResponse.json({
      success: true,
      companiesChecked: companies.length,
      remindersSent: totalReminders,
    });

  } catch (error) {
    console.error('❌ Error in send-reminders cron:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
}