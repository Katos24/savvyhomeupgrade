import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
   const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

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