import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendTeamInviteEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: companySlug } = await params;
    const { name, email, phone, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email and role are required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Get company info
    const companies = await sql`
      SELECT id, name FROM companies WHERE slug = ${companySlug}
    `;

    if (companies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = companies[0];

    // Check if email already exists
    const existingUsers = await sql`
      SELECT id FROM users 
      WHERE email = ${email.toLowerCase()} 
      AND company_id = ${company.id}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This email is already a team member' },
        { status: 400 }
      );
    }

// Generate invite token (valid for 3 days)
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // Create user with invite token (account not active yet)
    await sql`
      INSERT INTO users (
        name,
        email, 
        phone,
        company_id, 
        role, 
        invite_token, 
        invite_expires,
        is_active,
        created_at
      ) VALUES (
        ${name},
        ${email.toLowerCase()},
        ${phone || null},
        ${company.id},
        ${role},
        ${inviteToken},
NOW() + INTERVAL '3 days',
        false,
        NOW()
      )
    `;

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;

    // Get current user info for email
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    let inviterName = 'Your teammate';

    if (authToken) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded: any = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key-change-this');
        const currentUser = await sql`SELECT name FROM users WHERE id = ${decoded.userId}`;
        if (currentUser.length > 0) {
          inviterName = currentUser[0].name || inviterName;
        }
      } catch (e) {
        // If token verification fails, use default name
      }
    }

    // Send invite email
    try {
      await sendTeamInviteEmail({
        inviteeEmail: email,
        inviterName,
        companyName: company.name,
        inviteLink,
        role,
      });
    } catch (emailError) {
      console.error('❌ Failed to send invite email:', emailError);
      // Still return success since the invite was created in DB
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}