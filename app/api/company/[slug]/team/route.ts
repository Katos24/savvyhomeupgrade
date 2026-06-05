import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }    const sql = neon(process.env.DATABASE_URL!);
    
    // Get company ID from slug
    const companies = await sql`
      SELECT id FROM companies WHERE slug = ${slug}
    `;

    if (companies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const companyId = companies[0].id;

    // Get all team members for this company
    const teamMembers = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        created_at,
        last_login,
        is_active
      FROM users
      WHERE company_id = ${companyId}
      ORDER BY 
        CASE role
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'member' THEN 3
          ELSE 4
        END,
        created_at ASC
    `;

    return NextResponse.json({
      success: true,
      teamMembers: teamMembers.map(member => ({
        id: member.id,
        user_id: member.id, // For compatibility with TeamAdminPage component
        email: member.email,
        name: member.name,
        role: member.role,
        status: member.is_active ? 'active' : 'disabled',
        invited_at: member.created_at,
        accepted_at: member.created_at,
        invited_by_name: null
      })),
      pendingInvitations: [] // No invitations in simple mode
    });

  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}