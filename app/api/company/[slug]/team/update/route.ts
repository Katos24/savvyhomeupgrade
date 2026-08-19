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

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, getJwtSecret());

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

    // 🔒 Verify the CALLER actually belongs to this company, re-fetched
    // fresh from the DB — not trusted from the JWT. Without this, any
    // admin/owner from any company could change roles for users in a
    // company they have no relationship to, just by knowing its slug
    // and a target user ID.
    const callers = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId} AND company_id = ${companyId}
    `;
    if (callers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!canChangeRoles(callers[0].role)) {
      return NextResponse.json(
        { success: false, error: PERMISSION_ERRORS.CANNOT_CHANGE_ROLES },
        { status: 403 }
      );
    }

    // Verify target user belongs to this company and is not owner
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