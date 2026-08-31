import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { can, type PlanTier } from '@/lib/permissions';

// Reuse single connection across warm lambdas
const sql = neon(process.env.DATABASE_URL!);

type Props = { params: Promise<{ slug: string }> };

export async function GET(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    } catch {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // ── 1. Authenticate user & check permissions ─────────────────────────
    const company = await sql`
      SELECT c.id, c.plan_tier FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (!company.length) return NextResponse.json({ success: false }, { status: 403 });

    const companyId = company[0].id;
    const dbPlanTier = (company[0].plan_tier ?? 'basic') as PlanTier;
    if (!can(dbPlanTier, 'outbox')) {
      return NextResponse.json({
        success: false,
        error: 'Outbox is available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }

    // ── 2. Parse pagination & filters ────────────────────────────────────
    const url        = new URL(req.url);
    const page       = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const typeFilter = url.searchParams.get('type')?.trim() || '';
    const limit      = 25;
    const offset     = (page - 1) * limit;

    // ── 3. Run emails list & total count in parallel (excluding heavy html_body) ──
    const [emails, totalResult] = await Promise.all([
      typeFilter
        ? sql`
            SELECT id, company_id, project_id, lead_id, type, to_email, to_name,
                   sent_by_email, sent_by_name, subject, status, error_message,
                   created_at, sent_at, metadata,
                   (html_body IS NOT NULL AND html_body <> '') AS has_body
            FROM email_outbox
            WHERE company_id = ${companyId}
              AND type = ${typeFilter}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : sql`
            SELECT id, company_id, project_id, lead_id, type, to_email, to_name,
                   sent_by_email, sent_by_name, subject, status, error_message,
                   created_at, sent_at, metadata,
                   (html_body IS NOT NULL AND html_body <> '') AS has_body
            FROM email_outbox
            WHERE company_id = ${companyId}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
      typeFilter
        ? sql`
            SELECT COUNT(*) as total FROM email_outbox
            WHERE company_id = ${companyId}
              AND type = ${typeFilter}
          `
        : sql`
            SELECT COUNT(*) as total FROM email_outbox
            WHERE company_id = ${companyId}
          `,
    ]);

    return NextResponse.json({
      success: true,
      emails,
      total: parseInt(totalResult[0]?.total || '0', 10),
    });
  } catch (error) {
    console.error('Get outbox emails error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}