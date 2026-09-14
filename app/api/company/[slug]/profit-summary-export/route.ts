import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

function csvEscape(value: string | null | undefined): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const fmtDate = (d: string | Date | null) => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const companies = await sql`SELECT id FROM companies WHERE slug = ${slug} LIMIT 1`;
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    const company = companies[0];

    const users = await sql`SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    if (!users[0] || users[0].company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // One row per job with real income. LEFT JOIN to a pre-aggregated
    // expenses subquery (not a raw join to the expenses table) — a plain
    // join would multiply each job's income row once per expense line,
    // silently inflating income totals for any job with more than one
    // expense logged against it.
    const rows = await sql`
      SELECT
        l.name as customer_name,
        p.id as project_id,
        p.project_number,
        p.invoice_number,
        p.created_at,
        p.quote_total::numeric as income,
        COALESCE(exp.total, 0) as expenses
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      LEFT JOIN (
        SELECT project_id, SUM(amount) as total
        FROM expenses
        WHERE company_id = ${company.id} AND deleted = false AND project_id IS NOT NULL
        GROUP BY project_id
      ) exp ON exp.project_id = p.id
      WHERE l.company_id = ${company.id}
        AND l.deleted = false
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
      ORDER BY p.created_at DESC
    `;

    const header = [
      'Job', 'Project #', 'Invoice #', 'Date', 'Income', 'Expenses', 'Profit', 'Margin %',
    ].join(',');

    const lines = rows.map((r: any) => {
      const income = Number(r.income) || 0;
      const expenses = Number(r.expenses) || 0;
      const profit = income - expenses;
      const margin = income > 0 ? ((profit / income) * 100).toFixed(1) : '0.0';
      return [
        csvEscape(r.customer_name),
        csvEscape(r.project_number != null ? String(r.project_number) : ''),
        csvEscape(r.invoice_number),
        csvEscape(fmtDate(r.created_at)),
        income.toFixed(2),
        expenses.toFixed(2),
        profit.toFixed(2),
        margin,
      ].join(',');
    });

    const csv = [header, ...lines].join('\n');
    const filename = `${slug}-profit-summary-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Profit summary export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export profit summary',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}