import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, name, phone, password } = await request.json();
    const sanitizedName = typeof name === 'string' ? name.trim().slice(0, 100) : '';
    const sanitizedPhone = typeof phone === 'string' ? phone.trim().slice(0, 20) : null;


    if (!token || !sanitizedName || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT u.id, u.email, u.role, u.company_id, c.slug as company_slug
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.invite_token = ${token}
        AND u.invite_expires > NOW()
        AND u.is_active = false
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite link' },
        { status: 400 }
      );
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET name = ${sanitizedName},
          phone = ${sanitizedPhone},
          password = ${hashedPassword},
          is_active = true,
          invite_token = NULL,
          invite_expires = NULL,
          created_at = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      companySlug: user.company_slug,
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}