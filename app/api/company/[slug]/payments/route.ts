import { getJwtSecret } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const VALID_METHODS = ['cash', 'check', 'credit_card', 'zelle', 'venmo', 'paypal', 'stripe', 'other'];
const VALID_KINDS = ['deposit', 'payment', 'balance'];

type AuthResult =
  | { error: NextResponse }
  | { company: any; user: any };

/**
 * Verifies the session, resolves the company by slug, and confirms the user
 * belongs to it. Returns a response to bail with on any failure.
 */
async function authorize(slug: string, requireWriteRole: boolean): Promise<AuthResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, getJwtSecret());
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
    amount: Number(row.amount) || 0,
    invoiced_total: row.invoiced_total === null ? null : Number(row.invoiced_total),
    method: row.method,
    kind: row.kind,
    paid_on: row.paid_on,
    card_brand: row.card_brand,
    card_last4: row.card_last4,
    note: row.note,
    recorded_by: row.recorded_by,
    // Non-null means it came from Stripe and can't be deleted here.
    is_stripe: !!row.stripe_payment_intent_id,
    created_at: row.created_at,
  };
}

async function loadPayments(projectId: number, companyId: number) {
  const rows = await sql`
    SELECT id, amount, invoiced_total, method, kind, paid_on,
           card_brand, card_last4, note, recorded_by,
           stripe_payment_intent_id, created_at
    FROM payments
    WHERE project_id = ${projectId} AND company_id = ${companyId}
    ORDER BY paid_on DESC, id DESC
  `;
  return rows.map(shape);
}

/** Confirms the project exists and belongs to this company. */
async function loadProject(projectId: number, companyId: number) {
  const rows = await sql`
    SELECT id, company_id, quote_total, payment_amount, payment_status
    FROM projects
    WHERE id = ${projectId} AND company_id = ${companyId}
    LIMIT 1
  `;
  return rows[0] || null;
}

/* ═══════════════ GET — list payments for a project ═══════════════ */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, false);
    if ('error' in auth) return auth.error;

    const projectId = parseInt(request.nextUrl.searchParams.get('project_id') || '');
    if (!projectId || Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'Missing project_id' }, { status: 400 });
    }

    const project = await loadProject(projectId, auth.company.id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const payments = await loadPayments(projectId, auth.company.id);
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const total = Number(project.quote_total) || 0;

    return NextResponse.json({
      success: true,
      payments,
      summary: {
        total,
        collected,
        remaining: Math.max(total - collected, 0),
        status: project.payment_status,
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load payments',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/* ═══════════════ POST — record a manual payment ═══════════════ */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, true);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const projectId = parseInt(body.project_id);

    if (!projectId || Number.isNaN(projectId)) {
      return NextResponse.json({ success: false, error: 'Missing project_id' }, { status: 400 });
    }

    const project = await loadProject(projectId, auth.company.id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const amount = parseFloat(body.amount);
    if (Number.isNaN(amount) || amount === 0) {
      return NextResponse.json(
        { success: false, error: 'Enter an amount greater than zero.' },
        { status: 400 }
      );
    }
    // Refunds go through Stripe, not here — a negative manual row would let
    // someone quietly reverse a card payment with no money moving.
    if (amount < 0) {
      return NextResponse.json(
        { success: false, error: 'To refund, issue it in Stripe.' },
        { status: 400 }
      );
    }

    const method = VALID_METHODS.includes(body.method) ? body.method : 'other';

    // Classify from what's already recorded, so the list reads sensibly.
   // 'deposit' is the first partial, 'balance' is the one that settles it,
    // anything in between is just a payment. Labelling every subsequent
    // payment 'balance' was misleading — $700 against a $3,000 job isn't one.
    const alreadyPaid = Number(project.payment_amount) || 0;
    const total = Number(project.quote_total) || 0;
    const kind = VALID_KINDS.includes(body.kind)
      ? body.kind
      : alreadyPaid === 0 && total > 0 && amount < total
      ? 'deposit'
      : total > 0 && alreadyPaid + amount >= total
      ? 'balance'
      : 'payment';

    // Guard against fat-fingering an extra zero.
    if (total > 0 && alreadyPaid + amount > total * 1.5) {
      return NextResponse.json(
        {
          success: false,
          error: `That would collect ${(alreadyPaid + amount).toFixed(2)} on a ${total.toFixed(2)} job. Check the amount.`,
        },
        { status: 400 }
      );
    }

    const paidOn = typeof body.paid_on === 'string' && body.paid_on ? body.paid_on : null;
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) || null : null;

    await sql`
      INSERT INTO payments (
        project_id, company_id, amount, invoiced_total, method, kind, paid_on,
        note, recorded_by
      ) VALUES (
        ${projectId},
        ${auth.company.id},
        ${amount},
        ${total || null},
        ${method},
        ${kind},
        ${paidOn ?? new Date().toISOString().split('T')[0]},
        ${note},
        ${auth.user.name || auth.user.email || 'Unknown'}
      )
    `;

    // payments_sync_project has already updated projects.payment_amount and
    // payment_status, so re-read rather than computing here.
    const refreshed = await loadProject(projectId, auth.company.id);
    const payments = await loadPayments(projectId, auth.company.id);
    const collected = payments.reduce((s, p) => s + p.amount, 0);

    return NextResponse.json({
      success: true,
      message: 'Payment recorded',
      payments,
      summary: {
        total,
        collected,
        remaining: Math.max(total - collected, 0),
        status: refreshed?.payment_status,
      },
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record payment',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/* ═══════════════ DELETE — remove a manual payment ═══════════════ */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await authorize(slug, true);
    if ('error' in auth) return auth.error;

    const paymentId = parseInt(request.nextUrl.searchParams.get('payment_id') || '');
    if (!paymentId || Number.isNaN(paymentId)) {
      return NextResponse.json({ success: false, error: 'Missing payment_id' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, project_id, stripe_payment_intent_id, kind
      FROM payments
      WHERE id = ${paymentId} AND company_id = ${auth.company.id}
      LIMIT 1
    `;
    const payment = rows[0];

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    // Deleting a Stripe row would show the job unpaid while Stripe still
    // holds real money. Refund it there instead.
    if (payment.stripe_payment_intent_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Card payments can\u2019t be deleted here. Issue a refund in Stripe and it will sync back.',
        },
        { status: 400 }
      );
    }

    if (payment.kind === 'refund') {
      return NextResponse.json(
        { success: false, error: 'Refund records can\u2019t be deleted.' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM payments WHERE id = ${paymentId} AND company_id = ${auth.company.id}`;

    const project = await loadProject(payment.project_id, auth.company.id);
    const payments = await loadPayments(payment.project_id, auth.company.id);
    const collected = payments.reduce((s, p) => s + p.amount, 0);
    const total = Number(project?.quote_total) || 0;

    return NextResponse.json({
      success: true,
      message: 'Payment removed',
      payments,
      summary: {
        total,
        collected,
        remaining: Math.max(total - collected, 0),
        status: project?.payment_status,
      },
    });
  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove payment',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}