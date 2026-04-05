import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const users = await sql`
      SELECT id, email, name
      FROM users
      WHERE LOWER(email) = ${normalizedEmail} AND is_active = true
    `;

    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If that email exists, we sent a reset link',
      });
    }

    const user = users[0];
    const resetToken = crypto.randomBytes(32).toString('hex');

    await sql`
      UPDATE users
      SET reset_token = ${resetToken},
          reset_token_expires = NOW() + INTERVAL '1 hour'
      WHERE id = ${user.id}
    `;

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        userEmail: email,
        userName: user.name || 'User',
        resetLink,
          companyName: user.company_name,

      });
    } catch (emailError) {
      console.error('❌ Failed to send reset email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'If that email exists, we sent a reset link',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}