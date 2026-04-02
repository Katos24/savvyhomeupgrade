import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete companies that never completed payment after 24 hours
    // subscription_status stays 'inactive' until webhook fires on payment
    const deleted = await sql`
      DELETE FROM companies
      WHERE subscription_status = 'inactive'
      AND created_at < NOW() - INTERVAL '24 hours'
      RETURNING id, name, email, created_at
    `;

    console.log(`🧹 Cleaned up ${deleted.length} ghost accounts`);

    return NextResponse.json({
      success: true,
      deleted: deleted.length,
      accounts: deleted.map((c: any) => ({ id: c.id, email: c.email, created_at: c.created_at })),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json(
      { error: 'Cleanup cron failed', details: error },
      { status: 500 }
    );
  }
}