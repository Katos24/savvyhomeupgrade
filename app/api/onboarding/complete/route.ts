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

// Get company's first category for the sample lead
    const [companyRow] = await sql`
      SELECT form_categories FROM companies WHERE id = ${companyId}
    `;
    const cats = companyRow?.form_categories;
    const firstCat = Array.isArray(cats) && cats.length > 0 
      ? (cats[0].label || cats[0].value || 'General')
      : 'General';

    // Create sample lead
    const sampleTasks = JSON.stringify([
      { id: 't1', label: 'Call customer to confirm details', done: false },
      { id: 't2', label: 'Send quote for approval', done: false },
      { id: 't3', label: 'Schedule job date', done: false },
      { id: 't4', label: 'Complete the work', done: false },
      { id: 't5', label: 'Collect payment', done: false },
    ]);

    const sampleQuote = JSON.stringify({
      items: [
        { id: 'q1', description: 'Labor (8 hours)', quantity: 8, unitPrice: 150, amount: 1200 },
        { id: 'q2', description: 'Materials & Supplies', quantity: 1, unitPrice: 800, amount: 800 },
        { id: 'q3', description: 'Travel & Equipment', quantity: 1, unitPrice: 500, amount: 500 },
      ],
      total: 2500,
    });

    await sql`
      INSERT INTO leads (
        company_id, name, email, phone,
        category, status, description,
        address_line_1, city, zip_code,
        quote_total, quote_data, payment_status,
        assigned_to, tasks, origin, created_at
      ) VALUES (
        ${companyId},
        'Sarah Johnson',
        'sarah.j@email.com',
        '5551234567',
         ${firstCat},
        'new',
        'This is a sample lead so you can see how everything works. Open it to explore tasks, quotes, scheduling, and more. Delete it whenever you''re ready.',
        '123 Main Street',
        'New York',
        '10001',
        2500.00,
        ${sampleQuote},
        'unpaid',
        'You',
        ${sampleTasks},
        'sample',
        NOW()
      )
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