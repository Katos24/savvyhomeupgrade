import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    const userId = decoded.userId;

    const { name, email, phone } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email.toLowerCase()} 
      AND id != ${userId}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This email is already in use' },
        { status: 400 }
      );
    }

    // Update user profile
    await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email.toLowerCase()},
        phone = ${phone || null},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}