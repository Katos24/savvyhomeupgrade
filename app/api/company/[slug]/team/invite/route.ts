import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendTeamInviteEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const ALLOWED_INVITE_ROLES = ['member', 'admin']; // adjust to match your actual role model — never include 'owner' or 'super_admin' here

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: companySlug } = await params;

    // ── Auth: required, not optional ──
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(authToken, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, role } = await request.json();
    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email and role are required' },
        { status: 400 }
      );
    }

    // ── Restrict assignable roles ──
    if (!ALLOWED_INVITE_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // ── Verify the caller belongs to the company they're inviting into ──
    const companies = await sql`
      SELECT id, name FROM companies WHERE slug = ${companySlug} AND id = ${decoded.companyId}
    `;
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    const company = companies[0];

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

    const inviteToken = crypto.randomBytes(32).toString('hex');

    await sql`
      INSERT INTO users (
        name, email, phone, company_id, role, invite_token, invite_expires, is_active, created_at
      ) VALUES (
        ${name}, ${email.toLowerCase()}, ${phone || null}, ${company.id}, ${role},
        ${inviteToken}, NOW() + INTERVAL '3 days', false, NOW()
      )
    `;

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite?token=${inviteToken}`;

    const currentUser = await sql`SELECT name FROM users WHERE id = ${decoded.userId}`;
    const inviterName = currentUser[0]?.name || 'Your teammate';

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
    }

    return NextResponse.json({ success: true, message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send invitation' }, { status: 500 });
  }
}