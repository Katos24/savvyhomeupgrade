import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const sql = neon(process.env.DATABASE_URL!);

    const users = await sql`
      SELECT u.*, c.slug, c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE LOWER(u.email) = ${normalizedEmail}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' }, 
        { status: 401 }
      );
    }

    // Update last login
    try {
      await sql`
        UPDATE users
        SET last_login = NOW()
        WHERE id = ${user.id}
      `;
    } catch (updateError) {
      console.error('Failed to update last login:', updateError);
      // Don't fail login if update fails
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        companyId: user.company_id,
        companySlug: user.slug
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );


    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        companySlug: user.slug,
        companyName: user.company_name
      }
    });

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login. Please try again.' }, 
      { status: 500 }
    );
  }
}
