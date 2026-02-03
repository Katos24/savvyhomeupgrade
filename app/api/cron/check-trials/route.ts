import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { 
  sendTrialEndingReminderEmail,
  sendSubscriptionActivatedEmail 
} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    // Get all companies with active trials
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
        // Send reminder at 7 days, 3 days, and 1 day before trial ends
        if (daysRemaining === 7 || daysRemaining === 3 || daysRemaining === 1) {
          await sendTrialEndingReminderEmail({
            companyEmail: company.email,
            companyName: company.name,
            daysRemaining,
            subscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
          });
          
          results.reminders_sent++;
          console.log(`✅ Sent ${daysRemaining}-day reminder to ${company.email}`);
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