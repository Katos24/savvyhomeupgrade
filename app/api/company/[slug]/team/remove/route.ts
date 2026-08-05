import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canRemoveMembers, PERMISSION_ERRORS } from '@/lib/permissions';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { userId } = body;

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

    if (!canRemoveMembers(userRole)) {
      return NextResponse.json(
        { success: false, error: PERMISSION_ERRORS.CANNOT_REMOVE },
        { status: 403 }
      );
    }

    // Validate input
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
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
        { success: false, error: 'Cannot remove company owner' },
        { status: 400 }
      );
    }

    // Delete user
    await sql`
      DELETE FROM users 
      WHERE id = ${userId}
    `;


    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}