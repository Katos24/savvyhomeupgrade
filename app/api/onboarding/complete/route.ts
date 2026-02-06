import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, skipped } = body;

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Mark onboarding as completed
    await sql`
      UPDATE companies 
      SET onboarding_completed = true,
          onboarding_completed_at = NOW(),
          onboarding_skipped = ${skipped || false}
      WHERE id = ${companyId}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}