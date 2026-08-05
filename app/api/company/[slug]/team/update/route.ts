import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canChangeRoles, PERMISSION_ERRORS } from '@/lib/permissions';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { userId, role } = body;

    // 🔒 CHECK PERMISSION
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, getJwtSecret());
    const userRole = decoded.role || 'member';

    if (!canChangeRoles(userRole)) {
      return NextResponse.json(
        { success: false, error: PERMISSION_ERRORS.CANNOT_CHANGE_ROLES },
        { status: 403 }
      );
    }

    // Validate inputs
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    
    // Get company ID
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

    // Verify user belongs to this company and is not owner
    const users = await sql`
      SELECT id, role FROM users
      WHERE id = ${userId} AND company_id = ${companyId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found in this company' },
        { status: 404 }
      );
    }

    if (users[0].role === 'owner') {
      return NextResponse.json(
        { success: false, error: 'Cannot change owner role' },
        { status: 400 }
      );
    }

    // Update role
    await sql`
      UPDATE users
      SET role = ${role}
      WHERE id = ${userId}
    `;


    return NextResponse.json({
      success: true,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}