import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

function generatePartnerCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${random}`;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Name, email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await sql`
      SELECT id FROM bookkeeper_accounts WHERE email = ${email.toLowerCase()}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate unique partner code
    let partner_code = generatePartnerCode(name);
    let attempts = 0;
    while (attempts < 10) {
      const codeExists = await sql`
        SELECT id FROM bookkeeper_accounts WHERE partner_code = ${partner_code}
      `;
      if (codeExists.length === 0) break;
      partner_code = generatePartnerCode(name);
      attempts++;
    }

    // Create account
    const result = await sql`
      INSERT INTO bookkeeper_accounts (name, email, password_hash, partner_code)
      VALUES (${name}, ${email.toLowerCase()}, ${password_hash}, ${partner_code})
      RETURNING id, name, email, partner_code
    `;

    return NextResponse.json({
      success: true,
      bookkeeper: result[0],
    });

  } catch (error) {
    console.error('Bookkeeper signup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create account' }, { status: 500 });
  }
}