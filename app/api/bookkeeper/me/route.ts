import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bookkeeper-auth-token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const accounts = await sql`
      SELECT id, name, email, partner_code, created_at
      FROM bookkeeper_accounts
      WHERE id = ${decoded.bookkeeperAccountId}
    `;

    if (accounts.length === 0) return NextResponse.json({ success: false }, { status: 401 });

    return NextResponse.json({ success: true, bookkeeper: accounts[0] });

  } catch {
    return NextResponse.json({ success: false }, { status: 401 });
  }
}