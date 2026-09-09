import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { deriveInvoiceRow, filterByPeriod, type InvoiceState } from '@/lib/invoiceState';

const sql = neon(process.env.DATABASE_URL!);

// A dedicated export for this page, separate from the app's existing
// export-csv route (shared elsewhere, not purpose-built for invoice
// fields). Uses the same lib/invoiceState.ts derivation the Financials
// page itself uses, so an export with "Overdue" selected always contains
// exactly the same rows the Overdue filter shows on screen — never a
// second, independently-computed answer that can drift out of sync.

function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  // Quote whenever the value contains a comma, quote, or newline —
  // doubling any internal quotes, per standard CSV escaping.
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

const STATE_LABELS: Record<InvoiceState, string> = {
  draft: 'Draft',
  sent: 'Sent',
  overdue: 'Overdue',
  partial: 'Partial',
  paid: 'Paid',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const companies = await sql`
      SELECT c.id FROM companies c
      JOIN users u ON u.company_id = c.id
      WHERE c.slug = ${slug} AND u.id = ${decoded.userId}
      LIMIT 1
    `;
    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    const companyId = companies[0].id;

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all';
    const statusFilter = url.searchParams.get('status') as InvoiceState | null;
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const searchTerm = url.searchParams.get('search')?.trim().toLowerCase() || '';

    // Same query shape as financials/page.tsx — kept in sync deliberately
    // rather than importing the page's own query function, since a
    // server component's data-fetching isn't meant to be called directly
    // from a route handler.
    const projectRows = await sql`
      SELECT
        p.id,
        p.invoice_number,
        p.invoice_sent_at,
        p.reminder_sent_at,
        l.email as customer_email,
        p.quote_total,
        p.quote_tax_rate,
        p.payment_status,
        p.payment_amount,
        p.payment_date,
        p.payment_due_date,
        p.scheduled_date,
        p.deposit_type,
        p.deposit_value,
        p.deposit_paid_at,
        COALESCE(p.category, l.category) as category,
        p.status,
        p.created_at,
        p.payment_method,
        l.name as customer_name,
        l.id as lead_id
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.quote_total IS NOT NULL
        AND p.quote_total::numeric > 0
      ORDER BY p.created_at DESC
    `;

    const periodFiltered = filterByPeriod(projectRows, period, startDate, endDate);
    const withMoney = periodFiltered.map(deriveInvoiceRow);
    let rows = statusFilter ? withMoney.filter((p) => p._state === statusFilter) : withMoney;
    if (searchTerm) {
      // Same three fields InvoicesList.tsx's own search checks — keeps
      // the export matching exactly what the search box actually filters
      // on screen, not a separately-guessed field set.
      rows = rows.filter(
        (p) =>
          (p.customer_name || '').toLowerCase().includes(searchTerm) ||
          (p.invoice_number || '').toLowerCase().includes(searchTerm) ||
          (p.category || '').toLowerCase().includes(searchTerm)
      );
    }

    const header = [
      'Customer', 'Invoice #', 'Status', 'Total', 'Collected', 'Owed',
      'Due Date', 'Invoice Sent',
    ];

    const lines = [header.map(csvEscape).join(',')];
    for (const p of rows) {
      lines.push([
        csvEscape(p.customer_name || 'Unnamed'),
        csvEscape(p.invoice_number || ''),
        csvEscape(STATE_LABELS[p._state as InvoiceState] || p._state),
        csvEscape(p._total.toFixed(2)),
        csvEscape(p._collected.toFixed(2)),
        csvEscape(p._owed.toFixed(2)),
        csvEscape(fmtDate(p.payment_due_date)),
        csvEscape(fmtDate(p.invoice_sent_at)),
      ].join(','));
    }

    const csv = lines.join('\r\n');
    const filenameParts = ['invoices', period !== 'all' ? period : null, statusFilter || null].filter(Boolean);
    const filename = `${filenameParts.join('-')}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Financials export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate export' }, { status: 500 });
  }
}