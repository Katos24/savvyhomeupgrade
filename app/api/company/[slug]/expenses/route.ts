import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Plain array checked here, not a DB constraint — same pattern
// payments.method already uses. Expense categories are far more likely
// to grow over time than something genuinely binary like deposit_type,
// so a hard CHECK would mean a migration every time a new category is
// wanted. Anything not in this list falls back to 'other' rather than
// rejecting the request outright.
const VALID_CATEGORIES = ['materials', 'labor', 'subcontractor', 'equipment', 'travel', 'permits', 'other'];

type AuthResult =
  | { error: NextResponse }
  | { company: any; user: any };

/**
 * Verifies the session, resolves the company by slug, and confirms the user
 * belongs to it. Identical shape to payments/route.ts's authorize() — kept
 * as its own copy rather than shared, matching how that file and others
 * in this codebase already each keep their own.
 */
async function authorize(slug: string, requireWriteRole: boolean): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return { error: NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 }) };
  }

  const companies = await sql`SELECT id, slug FROM companies WHERE slug = ${slug} LIMIT 1`;
  if (companies.length === 0) {
    return { error: NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 }) };
  }

  const users = await sql`
    SELECT id, name, email, role, company_id FROM users WHERE id = ${decoded.userId} LIMIT 1
  `;
  const user = users[0];
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'User not found' }, { status: 404 }) };
  }

  if (user.company_id !== companies[0].id) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 }) };
  }

  if (requireWriteRole && !['owner', 'admin', 'manager'].includes(user.role)) {
    return {
      error: NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 }),
    };
  }

  return { company: companies[0], user };
}

/** Postgres returns NUMERIC as a string; the client does arithmetic on these. */
function shape(row: any) {
  return {
    id: row.id,
    project_id: row.project_id,
    category: row.category,
    description: row.description,
    quantity: Number(row.quantity) || 1,
    unit_price: Number(row.unit_price) || 0,
    amount: Number(row.amount) || 0,
    vendor: row.vendor,
    expense_date: row.expense_date,
    payment_method: row.payment_method,
    receipt_url: row.receipt_url,
    created_by: row.created_by,
    created_at: row.created_at,
  };
}

/* ═══════════════ GET — list expenses, optionally scoped to one project ═══════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, false);
    if ('error' in auth) return auth.error;

    const projectIdParam = request.nextUrl.searchParams.get('project_id');

    // Two separate queries rather than a dynamic WHERE — project_id is
    // either present (job-level tab) or absent (Financials' full list),
    // never a partial/optional filter beyond that.
    const rows = projectIdParam
      ? await sql`
          SELECT id, project_id, category, description, quantity, unit_price, amount,
                 vendor, expense_date, payment_method, receipt_url, created_by, created_at
          FROM expenses
          WHERE company_id = ${auth.company.id}
            AND project_id = ${parseInt(projectIdParam)}
            AND deleted = false
          ORDER BY expense_date DESC, id DESC
        `
      : await sql`
          SELECT id, project_id, category, description, quantity, unit_price, amount,
                 vendor, expense_date, payment_method, receipt_url, created_by, created_at
          FROM expenses
          WHERE company_id = ${auth.company.id}
            AND deleted = false
          ORDER BY expense_date DESC, id DESC
        `;

    const expenses = rows.map(shape);
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    return NextResponse.json({ success: true, expenses, total });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load expenses',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/* ═══════════════ POST — create, update, or soft-delete an expense ═══════════════ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, true);
    if ('error' in auth) return auth.error;

    const body = await request.json();

    // ── Soft delete ──
    // Hard-deleting a real expense with no trace would make it impossible
    // to reconstruct what a job actually cost if the entry was removed by
    // mistake — same reasoning payments.DELETE already applies, via a
    // reversal row instead. This is simpler (expenses aren't money that
    // moved, just a record of a cost), so a flag is enough here.
    if (body.delete_id) {
      const expenseId = parseInt(body.delete_id);
      if (!expenseId || Number.isNaN(expenseId)) {
        return NextResponse.json({ success: false, error: 'Missing delete_id' }, { status: 400 });
      }
      await sql`
        UPDATE expenses
        SET deleted = true, deleted_at = NOW()
        WHERE id = ${expenseId} AND company_id = ${auth.company.id}
      `;
      return NextResponse.json({ success: true, message: 'Expense deleted' });
    }

    // Shared validation for both create and update below.
    const category = VALID_CATEGORIES.includes(body.category) ? body.category : 'other';
    const description = typeof body.description === 'string' ? body.description.trim().slice(0, 500) : '';
    if (!description) {
      return NextResponse.json({ success: false, error: 'Enter a description.' }, { status: 400 });
    }
    const quantity = parseFloat(body.quantity) || 1;
    const unitPrice = parseFloat(body.unit_price);
    if (Number.isNaN(unitPrice) || unitPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Enter a unit price greater than zero.' }, { status: 400 });
    }
    const amount = Math.round(quantity * unitPrice * 100) / 100;
    const vendor = typeof body.vendor === 'string' ? body.vendor.trim().slice(0, 255) || null : null;
    const expenseDate =
      typeof body.expense_date === 'string' && body.expense_date
        ? body.expense_date
        : new Date().toISOString().split('T')[0];
    const paymentMethod =
      typeof body.payment_method === 'string' ? body.payment_method.trim().slice(0, 50) || null : null;
    const projectId = body.project_id ? parseInt(body.project_id) : null;

    // ── Update an existing expense ──
    if (body.update_id) {
      const expenseId = parseInt(body.update_id);
      if (!expenseId || Number.isNaN(expenseId)) {
        return NextResponse.json({ success: false, error: 'Missing update_id' }, { status: 400 });
      }
      await sql`
        UPDATE expenses
        SET category = ${category},
            description = ${description},
            quantity = ${quantity},
            unit_price = ${unitPrice},
            amount = ${amount},
            vendor = ${vendor},
            expense_date = ${expenseDate},
            payment_method = ${paymentMethod},
            project_id = ${projectId},
            updated_at = NOW()
        WHERE id = ${expenseId} AND company_id = ${auth.company.id}
      `;
      return NextResponse.json({ success: true, message: 'Expense updated' });
    }

    // ── Record a new expense ──
    const receiptUrl = typeof body.receipt_url === 'string' ? body.receipt_url : null;

    const inserted = await sql`
      INSERT INTO expenses (
        company_id, project_id, category, description, quantity, unit_price, amount,
        vendor, expense_date, payment_method, receipt_url, created_by
      ) VALUES (
        ${auth.company.id},
        ${projectId},
        ${category},
        ${description},
        ${quantity},
        ${unitPrice},
        ${amount},
        ${vendor},
        ${expenseDate},
        ${paymentMethod},
        ${receiptUrl},
        ${auth.user.name || auth.user.email || 'Unknown'}
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, message: 'Expense recorded', id: inserted[0]?.id });
  } catch (error) {
    console.error('Record expense error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record expense',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}