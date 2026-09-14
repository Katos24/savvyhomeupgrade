import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Standard CSV field escaping — wraps in quotes only when the value
// actually needs it (contains a comma, quote, or newline), doubling any
// internal quotes. Kept local rather than shared, matching how
// financials-export and export-csv each already keep their own copy
// rather than a shared util for this one small function.
function csvEscape(value: string | null | undefined): string {
  const v = value ?? '';
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

const fmtDate = (d: string | Date | null) => {
  if (!d) return '';
  // expense_date is a DATE column with no time/timezone component in the
  // database — but this route reads it straight from the driver, which
  // returns it as a native JS Date object, not a string. The previous
  // version assumed a clean 'YYYY-MM-DD' string and called .split('-')
  // directly, which throws outright on a Date object (no .split method
  // exists on it). Reading UTC parts specifically — not local — is
  // deliberate: a DATE column has no timezone to begin with, so there's
  // no "correct" local conversion to make; UTC just reads back the exact
  // calendar date that was actually stored.
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CATEGORY_LABEL: Record<string, string> = {
  materials: 'Materials',
  labor: 'Labor',
  subcontractor: 'Subcontractor',
  equipment: 'Equipment',
  travel: 'Travel',
  permits: 'Permits',
  other: 'Other',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Same auth shape as every other company route in this app.
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

    const companies = await sql`SELECT id, name FROM companies WHERE slug = ${slug} LIMIT 1`;
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }
    const company = companies[0];

    const users = await sql`SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    if (!users[0] || users[0].company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // LEFT JOIN so overhead expenses (project_id IS NULL) still export
    // correctly — they just show blank job columns instead of being
    // silently dropped by an inner join.
    const rows = await sql`
      SELECT
        e.expense_date,
        e.category,
        e.description,
        e.quantity,
        e.unit_price,
        e.amount,
        e.vendor,
        e.payment_method,
        e.created_by,
        l.name as customer_name,
        p.project_number,
        p.invoice_number
      FROM expenses e
      LEFT JOIN projects p ON p.id = e.project_id
      LEFT JOIN leads l ON l.id = p.lead_id
      WHERE e.company_id = ${company.id}
        AND e.deleted = false
      ORDER BY e.expense_date DESC, e.id DESC
    `;

    const header = [
      'Date', 'Category', 'Description', 'Quantity', 'Unit Price', 'Amount',
      'Vendor', 'Payment Method', 'Job', 'Invoice #', 'Logged By',
    ].join(',');

    const lines = rows.map((r: any) =>
      [
        csvEscape(fmtDate(r.expense_date)),
        csvEscape(CATEGORY_LABEL[r.category] || r.category),
        csvEscape(r.description),
        csvEscape(String(r.quantity ?? '')),
        csvEscape(r.unit_price != null ? Number(r.unit_price).toFixed(2) : ''),
        csvEscape(r.amount != null ? Number(r.amount).toFixed(2) : ''),
        csvEscape(r.vendor),
        csvEscape(r.payment_method),
        // Blank for genuine overhead expenses — not "General Overhead" as
        // literal text, so a spreadsheet filter on this column cleanly
        // separates "has a job" from "doesn't" without a magic string.
        csvEscape(r.customer_name ? `${r.customer_name}${r.project_number ? ` (#${r.project_number})` : ''}` : ''),
        csvEscape(r.invoice_number),
        csvEscape(r.created_by),
      ].join(',')
    );

    const csv = [header, ...lines].join('\n');
    const filename = `${slug}-expenses-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Expenses export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to export expenses',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}