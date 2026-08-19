import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canInviteMembers } from '@/lib/permissions';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
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

    // 🔒 Confirms the caller actually belongs to this company, re-fetched
    // fresh from the DB — this route previously had no permission check
    // whatsoever, meaning any logged-in user (any role, any company)
    // could create a fully active admin account in any other company
    // just by knowing its slug.
    const callers = await sql`
      SELECT role FROM users WHERE id = ${decoded.userId} AND company_id = ${companyId}
    `;
    if (callers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!canInviteMembers(callers[0].role)) {
      return NextResponse.json(
        { success: false, error: 'Only owners and admins can add team members' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUsers = await sql`
      INSERT INTO users (email, name, password, company_id, role, is_active)
      VALUES (${email}, ${name}, ${hashedPassword}, ${companyId}, ${role}, true)
      RETURNING id, email, name, role, created_at
    `;

    const newUser = newUsers[0];

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}