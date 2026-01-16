import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;  // <-- Add await here
    const sql = neon(process.env.DATABASE_URL!);
    
    // Get company ID from slug
    const company = await sql`
      SELECT id FROM companies WHERE slug = ${slug}
    `;
    
    if (company.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    
    // Get deleted leads for this company (WHERE deleted = TRUE)
    const leads = await sql`
      SELECT * FROM leads
      WHERE company_id = ${company[0].id} AND deleted = TRUE
      ORDER BY deleted_at DESC
    `;
    
    return NextResponse.json({ 
      success: true, 
      leads 
    });
    
  } catch (error) {
    console.error('Fetch deleted leads error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch deleted leads' 
    }, { status: 500 });
  }
}