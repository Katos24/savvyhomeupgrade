// app/api/ai/quote-status/route.ts
//
// Client polls this every 1.5s until status is 'complete' or 'failed'
// Security: job is scoped to company — can't peek at other companies' jobs

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { can, type PlanTier } from '@/lib/permissions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId      = searchParams.get('jobId');
    const companySlug = searchParams.get('company_slug');

    if (!jobId || !companySlug) {
      return NextResponse.json({ success: false, error: 'Missing jobId or company_slug' }, { status: 400 });
    }

    // Basic UUID format check — prevent injection attempts
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(jobId)) {
      return NextResponse.json({ success: false, error: 'Invalid jobId format' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Verify company exists and owns this job — prevents peeking at other companies
    const companyRows = await sql`
      SELECT id, plan_tier FROM companies WHERE slug = ${companySlug} LIMIT 1
    `;

    if (!companyRows[0]) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const { id: companyId, plan_tier } = companyRows[0];

    // Re-check plan on every poll (plan could have been downgraded)
    if (!can((plan_tier ?? 'free') as PlanTier, 'ai_quote')) {
      return NextResponse.json({
        success: false,
        error: 'AI quote generator is available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }

    // Fetch job — scoped to this company only
    const jobRows = await sql`
      SELECT id, status, result, error, attempts, created_at, updated_at
      FROM ai_quote_jobs
      WHERE id = ${jobId}
        AND company_id = ${companyId}
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (!jobRows[0]) {
      return NextResponse.json({
        success: false,
        error: 'Job not found or expired',
      }, { status: 404 });
    }

    const job = jobRows[0];

    // ── Return status-appropriate response ────────────────────────────────
    switch (job.status) {
      case 'pending':
      case 'processing':
        return NextResponse.json({
          success: true,
          status: job.status,
          message: job.status === 'pending' ? 'Waiting to start...' : 'Analyzing your project...',
        }, {
          headers: { 'Cache-Control': 'no-store' },
        });

      case 'complete':
        return NextResponse.json({
          success: true,
          status: 'complete',
          items:      job.result?.items      ?? [],
          usedPhotos: job.result?.usedPhotos ?? 0,
        }, {
          headers: { 'Cache-Control': 'no-store' },
        });

      case 'failed':
        return NextResponse.json({
          success: false,
          status: 'failed',
          error: job.error || 'Quote generation failed. Please try again.',
          attempts: job.attempts,
        }, { status: 422 });

      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown job status',
        }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Quote status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check quote status',
    }, { status: 500 });
  }
}