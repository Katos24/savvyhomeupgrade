import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || typeof token !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing token or password' },
        { status: 400 }
      );
    }

    if (!/^[0-9a-f]{64}$/.test(token)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token format' },
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
      SELECT id, email, name
      FROM users
      WHERE reset_token = ${token}
        AND reset_token_expires > NOW()
        AND is_active = true
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hashedPassword},
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}