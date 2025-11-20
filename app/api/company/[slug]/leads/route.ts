import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

type Props = {
  params: Promise<{ slug: string }>
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const sql = neon(process.env.DATABASE_URL!);
    
    // Get company ID from slug
    const companies = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    
    const companyId = companies[0].id;
    
    // Get leads for this company
    const leads = await sql`
      SELECT * FROM leads
      WHERE company_id = ${companyId}
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}
