import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const company = await sql`
      SELECT c.id FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!company.length) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const url = new URL(request.url);
    const leadId = url.searchParams.get('lead_id');
    const type = url.searchParams.get('type');

    if (!leadId || !type) {
      return NextResponse.json({ error: 'Missing lead_id or type' }, { status: 400 });
    }

    const entries = await sql`
      SELECT
        id, status, error_message,
        sent_by_email, sent_by_name,
        subject, html_body,
        created_at, sent_at
      FROM email_outbox
      WHERE lead_id = ${parseInt(leadId)}
        AND type = ${type}
        AND company_id = ${company[0].id}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({ entries });

  } catch (error) {
    console.error('outbox-preview error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}