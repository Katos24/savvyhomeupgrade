import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    // Check if user exists
    const users = await sql`
      SELECT id, email, name 
      FROM users 
      WHERE email = ${email} AND is_active = true
    `;

    // Always return success (security: don't reveal if email exists)
    if (users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'If that email exists, we sent a reset link' 
      });
    }

    const user = users[0];

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await sql`
      UPDATE users 
      SET reset_token = ${resetToken},
          reset_token_expires = ${expiresAt}
      WHERE id = ${user.id}
    `;

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, log it (in production, use SendGrid/Resend/etc)
    console.log('Password reset link:', resetLink);
    console.log('For user:', email);

    // TEMPORARY: Return link in response (REMOVE IN PRODUCTION!)
    return NextResponse.json({ 
      success: true, 
      message: 'Reset link sent to your email',
      // Remove this in production:
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}