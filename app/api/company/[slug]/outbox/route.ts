import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { can, type PlanTier } from '@/lib/permissions';

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
      SELECT c.id, c.plan_tier FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!company.length) return NextResponse.json({ success: false }, { status: 403 });

    const dbPlanTier = (company[0].plan_tier ?? 'basic') as PlanTier;
    if (!can(dbPlanTier, 'outbox')) {
      return NextResponse.json({
        success: false,
        error: 'Outbox is available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }

    const url        = new URL(req.url);
    const page       = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const typeFilter = url.searchParams.get('type')?.trim() || '';
    const limit      = 25;
    const offset     = (page - 1) * limit;

    // ── Emails with optional type filter ─────────────────────────
    const emails = typeFilter
      ? await sql`
          SELECT * FROM email_outbox
          WHERE company_id = ${company[0].id}
            AND type = ${typeFilter}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await sql`
          SELECT * FROM email_outbox
          WHERE company_id = ${company[0].id}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

    // ── Total count for this filter ───────────────────────────────
    const totalResult = typeFilter
      ? await sql`
          SELECT COUNT(*) as total FROM email_outbox
          WHERE company_id = ${company[0].id}
            AND type = ${typeFilter}
        `
      : await sql`
          SELECT COUNT(*) as total FROM email_outbox
          WHERE company_id = ${company[0].id}
        `;

    return NextResponse.json({
      success: true,
      emails,
      total: parseInt(totalResult[0].total),
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}