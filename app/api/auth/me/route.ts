import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    console.log('Auth check - token exists:', !!token); // DEBUG

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded;
    try {
      const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET is not set');
decoded = jwt.verify(token.value, secret) as any;

      console.log('Token decoded:', decoded); // DEBUG
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError); // DEBUG
      return NextResponse.json(
        { success: false, error: 'Invalid token' }, 
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.company_id,
        c.slug as company_slug,
        c.name as company_name
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
        AND (u.is_active = true OR u.is_active IS NULL)
    `;

    if (users.length === 0) {
      console.log('User not found in DB'); // DEBUG
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 401 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.email, // Using email as name since column doesn't exist
        role: user.role,
        companyId: user.company_id,
        companySlug: user.company_slug,
        companyName: user.company_name
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' }, 
      { status: 401 }
    );
  }
}