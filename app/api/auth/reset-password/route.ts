import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing token or password' }, 
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

    // Find user with valid reset token
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

    // Update password and clear reset token
    // TODO: Hash password with bcrypt in production!
    await sql`
      UPDATE users 
      SET password = ${password},
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successful' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' }, 
      { status: 500 }
    );
  }
}