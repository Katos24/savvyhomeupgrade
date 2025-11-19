import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const companies = await sql`SELECT * FROM companies ORDER BY created_at DESC`;
    
    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, slug, email, phone, password } = await request.json();
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Create company
    const company = await sql`
      INSERT INTO companies (name, slug, email, phone)
      VALUES (${name}, ${slug}, ${email}, ${phone})
      RETURNING *
    `;
    
    // Create user for the company
    await sql`
      INSERT INTO users (email, password, company_id, role)
      VALUES (${email}, ${password}, ${company[0].id}, 'contractor')
    `;
    
    return NextResponse.json({ success: true, company: company[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, error: 'Failed to create company' }, { status: 500 });
  }
}
