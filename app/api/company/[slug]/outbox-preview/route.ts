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

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
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
    // html_body is the full email document — often 100KB+ each, and an
    // invoice email carries an inlined PDF link and full markup. Twenty of
    // them is megabytes over the wire for a list that renders a date and a
    // label. The body is fetched only when Preview is clicked.
    const withBody = url.searchParams.get('body') === '1';

    if (!leadId) {
      return NextResponse.json({ error: 'Missing lead_id' }, { status: 400 });
    }

    // ── Single entry, with its body — for the Preview modal ──
    if (withBody) {
      const entryId = url.searchParams.get('entry_id');
      if (!entryId || Number.isNaN(parseInt(entryId))) {
        return NextResponse.json({ error: 'Missing entry_id' }, { status: 400 });
      }

      const row = await sql`
        SELECT id, subject, html_body
        FROM email_outbox
        WHERE id = ${parseInt(entryId)}
          AND lead_id = ${parseInt(leadId)}
          AND company_id = ${company[0].id}
        LIMIT 1
      `;

      if (!row.length) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json({ entry: row[0] });
    }

    // ── List — everything except the body ──
    // has_body tells the client whether a Preview button is worth showing
    // without shipping the markup to find out.
    const entries = type
      ? await sql`
          SELECT id, type, status, error_message,
            sent_by_email, sent_by_name,
            subject, created_at, sent_at,
            (html_body IS NOT NULL AND html_body <> '') AS has_body
          FROM email_outbox
          WHERE lead_id = ${parseInt(leadId)}
            AND type = ${type}
            AND company_id = ${company[0].id}
          ORDER BY created_at DESC
          LIMIT 20
        `
      : await sql`
          SELECT id, type, status, error_message,
            sent_by_email, sent_by_name,
            subject, created_at, sent_at,
            (html_body IS NOT NULL AND html_body <> '') AS has_body
          FROM email_outbox
          WHERE lead_id = ${parseInt(leadId)}
            AND company_id = ${company[0].id}
          ORDER BY created_at DESC
          LIMIT 50
        `;

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('outbox-preview error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}