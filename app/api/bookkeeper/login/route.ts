import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Find account
    const accounts = await sql`
      SELECT id, name, email, password_hash, partner_code
      FROM bookkeeper_accounts
      WHERE email = ${email.toLowerCase()}
    `;

    if (accounts.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const account = accounts[0];

    // Verify password
    const valid = await bcrypt.compare(password, account.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { bookkeeperAccountId: account.id, email: account.email, partner_code: account.partner_code },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    const response = NextResponse.json({
      success: true,
      bookkeeper: { id: account.id, name: account.name, email: account.email, partner_code: account.partner_code },
    });

    // Set separate cookie from contractor auth
    response.cookies.set('bookkeeper-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Bookkeeper login error:', error);
    return NextResponse.json({ success: false, error: 'Failed to login' }, { status: 500 });
  }
}