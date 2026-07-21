import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { company_slug, user_name } = await request.json();

    if (!company_slug) {
      return NextResponse.json({ success: false, error: 'Missing company_slug' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const companyRows = await sql`SELECT id, email FROM companies WHERE slug = ${company_slug} LIMIT 1`;
    const company = companyRows[0];
    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // Find-or-create: reuse the existing test lead if one already exists,
    // so repeated clicks (e.g. during a demo call) don't spawn duplicates.
    const existing = await sql`
      SELECT * FROM leads
      WHERE company_id = ${company.id} AND is_test = true AND deleted = false
      LIMIT 1
    `;

    if (existing[0]) {
      return NextResponse.json({ success: true, lead: existing[0], reused: true });
    }

    const inserted = await sql`
      INSERT INTO leads (
        company_id, name, email, phone, category, description,
        status, is_test, created_at
      ) VALUES (
        ${company.id},
        'Test Customer',
        ${company.email || 'test@example.com'},
        '(555) 000-0000',
        'general',
        'This is a test lead — try adding a quote, sending the invoice, and marking it complete to see the full customer experience.',
        'new',
        true,
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, lead: inserted[0], reused: false });
  } catch (error: any) {
    console.error('Test drive lead error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}