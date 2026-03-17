import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { name, emailNotifications } = await request.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.userId;

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE users
      SET name = ${name},
          email_notifications = ${emailNotifications}
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}