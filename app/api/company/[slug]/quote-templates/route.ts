import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { can, type PlanTier } from '@/lib/permissions';

const sql = neon(process.env.DATABASE_URL!);

type TemplateRow = {
  id: string;
  category: string;
  items: any;
  tax_rate: string | number;
  total: string | number;
};

/**
 * Postgres returns NUMERIC as a string to avoid float precision loss.
 * The client does arithmetic on these, so convert here rather than
 * letting "0.00" leak into a calculation somewhere downstream.
 */
function shape(row: TemplateRow) {
  return {
    id: row.id,
    category: row.category,
    items: Array.isArray(row.items) ? row.items : [],
    tax_rate: Number(row.tax_rate) || 0,
    total: Number(row.total) || 0,
  };
}

async function loadTemplates(companyId: number) {
  const rows = (await sql`
    SELECT id, category, items, tax_rate, total
    FROM quote_templates
    WHERE company_id = ${companyId}
    ORDER BY category
  `) as TemplateRow[];
  return rows.map(shape);
}

/** Auth + plan + membership. Returns the company or a response to bail with. */
async function authorize(slug: string, requireWriteRole: boolean) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || 'your-secret-key-change-this'
  ) as any;

  const companies = await sql`
    SELECT id, plan_tier FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  if (companies.length === 0) {
    return { error: NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 }) };
  }
  const company = companies[0];

  if (!can((company.plan_tier ?? 'basic') as PlanTier, 'quote_templates')) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: 'Quote templates are available on the Basic plan',
          upgrade_required: true,
        },
        { status: 403 }
      ),
    };
  }

  const users = await sql`SELECT id, role, company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
  const user = users[0];
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }) };
  }

  if (user.company_id !== company.id) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 }) };
  }

  if (requireWriteRole && !['owner', 'admin', 'manager'].includes(user.role)) {
    return {
      error: NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return { company, user };
}

/* ═══════════════ GET ═══════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, false);
    if ('error' in auth) return auth.error;

    return NextResponse.json({ success: true, templates: await loadTemplates(auth.company.id) });
  } catch (error) {
    console.error('Get quote templates error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load templates',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/* ═══════════════ POST ═══════════════ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, true);
    if ('error' in auth) return auth.error;

    const companyId = auth.company.id;
    const body = await request.json();
    const { action, template, templateId, templates } = body;

    /* ── create ──
       Upsert on (company_id, category): the UI allows one template per
       category, so a double-submit should update rather than 409. */
  if (action === 'create') {
  if (!template?.id || !template?.category) {
    return NextResponse.json({ success: false, error: 'Missing template id or category' }, { status: 400 });
  }

  await sql`
    INSERT INTO quote_templates (id, company_id, category, items, tax_rate, total, deposit_type, deposit_value)
    VALUES (
      ${template.id},
      ${companyId},
      ${template.category},
      ${JSON.stringify(template.items ?? [])}::jsonb,
      ${Number(template.tax_rate) || 0},
      ${Number(template.total) || 0},
      ${template.deposit_type || null},
      ${template.deposit_value ?? null}
    )
    ON CONFLICT (company_id, category) DO UPDATE SET
      items         = EXCLUDED.items,
      tax_rate      = EXCLUDED.tax_rate,
      total         = EXCLUDED.total,
      deposit_type  = EXCLUDED.deposit_type,
      deposit_value = EXCLUDED.deposit_value
  `;

  return NextResponse.json({
    success: true,
    message: 'Template created',
    templates: await loadTemplates(companyId),
  });
}

    /* ── update ──
       Scoped by company_id so an id from another tenant can't be touched. */
    if (action === 'update') {
      if (!template?.id) {
        return NextResponse.json({ success: false, error: 'Missing template id' }, { status: 400 });
      }

      const updated = await sql`
        UPDATE quote_templates
        SET items    = ${JSON.stringify(template.items ?? [])}::jsonb,
            tax_rate = ${Number(template.tax_rate) || 0},
            total    = ${Number(template.total) || 0},
            category = ${template.category}
        WHERE id = ${template.id} AND company_id = ${companyId}
        RETURNING id
      `;

      if (updated.length === 0) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Template updated',
        templates: await loadTemplates(companyId),
      });
    }

    /* ── update-many ──
       One statement, so applying a tax rate across every template is
       atomic. This is the case that was silently losing writes when it
       was N parallel requests against a single jsonb column. */
    if (action === 'update-many') {
      if (!Array.isArray(templates) || templates.length === 0) {
        return NextResponse.json({ success: false, error: 'templates must be a non-empty array' }, { status: 400 });
      }

      const payload = templates.map((t: any) => ({
        id: String(t.id),
        items: t.items ?? [],
        tax_rate: Number(t.tax_rate) || 0,
        total: Number(t.total) || 0,
      }));

      const updated = await sql`
        UPDATE quote_templates qt
        SET items    = v.items,
            tax_rate = v.tax_rate,
            total    = v.total
        FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb)
          AS v(id text, items jsonb, tax_rate numeric, total numeric)
        WHERE qt.id = v.id AND qt.company_id = ${companyId}
        RETURNING qt.id
      `;

      return NextResponse.json({
        success: true,
        message: `${updated.length} template${updated.length === 1 ? '' : 's'} updated`,
        updated: updated.length,
        requested: payload.length,
        templates: await loadTemplates(companyId),
      });
    }

    /* ── delete ── */
    if (action === 'delete') {
      if (!templateId) {
        return NextResponse.json({ success: false, error: 'Missing templateId' }, { status: 400 });
      }

      await sql`
        DELETE FROM quote_templates
        WHERE id = ${templateId} AND company_id = ${companyId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Template deleted',
        templates: await loadTemplates(companyId),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Quote templates API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}