import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const company = await sql`
      SELECT c.id FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!company.length) return NextResponse.json({ success: false }, { status: 403 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = 25;
    const offset = (page - 1) * limit;

    const emails = await sql`
      SELECT * FROM email_outbox
      WHERE company_id = ${company[0].id}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return NextResponse.json({ success: true, emails });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}