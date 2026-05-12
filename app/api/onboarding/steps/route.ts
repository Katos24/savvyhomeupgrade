import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { companyId, step, value = true } = await req.json();

    if (!companyId || !step) {
      return NextResponse.json(
        { error: 'Missing companyId or step' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Merge the new step into existing onboarding_steps JSON
    await sql`
      UPDATE companies
      SET onboarding_steps = COALESCE(onboarding_steps, '{}'::jsonb) || ${JSON.stringify({ [step]: value })}::jsonb
      WHERE id = ${companyId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Onboarding step update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update onboarding step' },
      { status: 500 }
    );
  }
}

// GET — fetch current onboarding steps
export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      SELECT onboarding_steps FROM companies WHERE id = ${parseInt(companyId)}
    `;

    return NextResponse.json({
      success: true,
      steps: rows[0]?.onboarding_steps || {},
    });
  } catch (error: any) {
    console.error('Onboarding steps fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding steps' },
      { status: 500 }
    );
  }
}