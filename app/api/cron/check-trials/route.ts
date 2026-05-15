import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { 
  sendTrialEndingReminderEmail,
} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trialingCompanies = await sql`
      SELECT id, name, slug, email, trial_ends_at, subscription_status
      FROM companies
      WHERE subscription_status = 'trialing'
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at > NOW()
    `;

    const now = new Date();
    const results = {
      checked: trialingCompanies.length,
      reminders_sent: 0,
      errors: 0
    };

    for (const company of trialingCompanies) {
      const trialEndDate = new Date(company.trial_ends_at);
      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      try {
        if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
          await sendTrialEndingReminderEmail({
            companyEmail: company.email,
            companyName: company.name,
            daysRemaining,
billingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
          });

          results.reminders_sent++;
        }
      } catch (error) {
        console.error(`❌ Error sending reminder to ${company.email}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: error },
      { status: 500 }
    );
  }
}