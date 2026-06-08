import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Decode token to get company ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const companyId = decoded.companyId;

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Fetch all active users in the company
const members = await sql`
      SELECT 
        id,
        name,
        email,
        role,
        phone
      FROM users
      WHERE company_id = ${companyId}
      AND is_active = true
      ORDER BY name ASC
    `;

const companyResult = await sql`
  SELECT saved_assignees FROM companies WHERE id = ${companyId} LIMIT 1
`;
const savedAssignees: string[] = companyResult[0]?.saved_assignees || [];

// Combine user names + saved assignees, deduplicated
const userNames = members.map((m: any) => m.name).filter(Boolean);
const allAssignees = [...new Set([...userNames, ...savedAssignees])].sort();

return NextResponse.json({ 
  success: true, 
  members: members.map((member: any) => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    phone: member.phone
  })),
  allAssignees,
});

  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
