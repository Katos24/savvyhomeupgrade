// File 2: app/api/auth/accept-invite/route.ts
// This creates the account when user accepts the invite

import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, name, password } = await request.json();

    if (!token || !name || !password) {
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

    const sql = neon(process.env.DATABASE_URL!);

    // Find user with valid invite token
    const users = await sql`
      SELECT u.*, c.slug as company_slug
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Activate account and set name/password
    await sql`
      UPDATE users
      SET name = ${name},
          password = ${hashedPassword},
          is_active = true,
          invite_token = NULL,
          invite_expires = NULL,
          created_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log('✅ Account created for:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      companySlug: user.company_slug
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}