// File 1: app/api/auth/validate-invite/route.ts
// This validates the invite token and returns invite info

import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Find user with valid invite token
    const users = await sql`
      SELECT u.id, u.email, u.role, u.company_id, c.name as company_name, c.slug as company_slug
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

    return NextResponse.json({
      success: true,
      invite: {
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        companySlug: user.company_slug,
      }
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}