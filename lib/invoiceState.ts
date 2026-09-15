import { getDepositAmount, isDepositSatisfied } from '@/lib/billing';

// Extracted from FinancialsClient.tsx so the same classification logic
// can run on both the client (the Invoices list/filters) and the server
// (the export route below) without becoming two independent copies that
// can silently drift apart — exactly the pattern that caused most of
// this session's bugs. Anything importing this gets byte-for-byte the
// same "what state is this invoice in" answer as what's on screen.

export type InvoiceState = 'draft' | 'sent' | 'overdue' | 'partial' | 'paid';

export const BUCKETS = [
  { key: '90', label: '90+ days', color: 'bg-rose-500' },
  { key: '60', label: '60–89 days', color: 'bg-orange-500' },
  { key: '30', label: '30–59 days', color: 'bg-amber-500' },
  { key: '1', label: '1–29 days', color: 'bg-yellow-500' },
  { key: '0', label: 'Not yet due', color: 'bg-teal-600' },
];

export function daysOverdue(p: any): number | null {
  if (!p.payment_due_date) return null;
  const due = new Date(p.payment_due_date);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

export function bucketFor(p: any): string {
  const d = daysOverdue(p);
  if (d === null) return '0';
  if (d >= 90) return '90';
  if (d >= 60) return '60';
  if (d >= 30) return '30';
  return '1';
}

/** One real definition of "what state is this invoice in." No Void or
 *  Recurring — neither concept exists anywhere in this schema. No
 *  Refunded either — a refund is a fact about one transaction in the
 *  payments ledger (shown on that transaction, not the job's overall
 *  status), not a state the job's status should claim. An invoice's
 *  status reflects where its money currently stands, full stop,
 *  regardless of refund history along the way. */
export function invoiceState(p: any): InvoiceState {
  if (p._owed <= 0.005) return 'paid';
  if (p._overdue !== null) return 'overdue';
  if (!p._invoiced) return 'draft';
  if (p._collected > 0) return 'partial';
  return 'sent';
}

export function filterByPeriod(
  projects: any[],
  period: string,
  customStart?: string | null,
  customEnd?: string | null
) {
  if (period === 'custom') {
    // Only actually filters once BOTH bounds are set — this is what
    // guarantees a custom range can never silently fall through to full
    // history. The UI enforces this too (the range doesn't "apply" until
    // both dates are filled in), but this is the actual backstop: if
    // period somehow reaches here as 'custom' with an incomplete range,
    // return nothing rather than guessing or defaulting to everything.
    if (!customStart || !customEnd) return [];
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    return projects.filter((p) => {
      const date = new Date(p.created_at);
      return date >= start && date <= end;
    });
  }
  if (period === 'all') return projects;
  const now = new Date();
  return projects.filter((p) => {
    const date = new Date(p.created_at);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter')
      return Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3) && date.getFullYear() === now.getFullYear();
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });
}

/** The full derivation pipeline — takes a raw project row (as selected in
 *  financials/page.tsx's query) and returns it enriched with every
 *  computed field the display and the export both need. Call this once
 *  per row instead of re-deriving pieces of it separately. */
export function deriveInvoiceRow(p: any) {
   const total = parseFloat(p.quote_total || '0');
  const collected = parseFloat(p.payment_amount || '0');
  const remindedToday =
    p.reminder_sent_at &&
    new Date(p.reminder_sent_at).toDateString() === new Date().toDateString();

  // Whole-job remaining — used only to decide whether ANYTHING is still
  // owed at all (billingPhase below), regardless of which phase. This is
  // NOT the value exposed as _owed once a phase is known; see below.
  const rawOwed = Math.max(total - collected, 0);

  const billingInputs = {
    total,
    paidAmount: collected,
    depositType: p.deposit_type,
    depositValue: p.deposit_value,
    depositPaidAt: p.deposit_paid_at,
  };
  const depositAmount = getDepositAmount(billingInputs);
  const hasDepositTerms = depositAmount > 0;
  const depositSatisfied = isDepositSatisfied(billingInputs);
  const billingPhase: 'deposit' | 'balance' | null =
    !hasDepositTerms || rawOwed <= 0.005
      ? null
      : depositSatisfied ? 'balance' : 'deposit';

  // FIXED: was always total-collected regardless of phase, so a draft
  // deposit-phase row showed the WHOLE job's remaining balance as "owed"
  // instead of just the deposit target — a 25% deposit on $441.02 showed
  // $441.02 owed instead of the real ~$110 deposit amount. During the
  // deposit phase, what's actually due right now is the deposit target
  // minus whatever's been collected toward it. Once the deposit is
  // satisfied, billingPhase flips to 'balance' and this correctly falls
  // back to the whole-job remaining amount, since that IS the real
  // amount due at that point.
  const owed = billingPhase === 'deposit'
    ? Math.max(depositAmount - collected, 0)
    : rawOwed;

  // Was !!p.invoice_sent_at unconditionally — that single shared field
  // can hold a stale timestamp from an EARLIER phase's send (e.g. the
  // deposit was sent and paid, invoice_sent_at still reflects that old
  // send, even though the balance invoice — the CURRENT phase — was
  // never actually sent). Checking the phase-specific field instead is
  // what makes _collectedUnsent below detectable at all. Jobs with no
  // deposit terms have only one phase ever, so invoice_sent_at is
  // already correct for them — no join field needed, no fallback
  // ambiguity.
  const invoiced = billingPhase === 'deposit'
    ? !!p.inv_deposit_sent_at
    : billingPhase === 'balance'
    ? !!p.inv_sent_at
    : !!p.invoice_sent_at;

  const derived = {
    ...p,
    _total: total,
    _collected: collected,
    _owed: owed,
    _overdue: daysOverdue(p),
    _bucket: bucketFor(p),
    _invoiced: invoiced,
    _remindedToday: !!remindedToday,
    _billingPhase: billingPhase,
    // True when money's been collected toward the CURRENT phase but that
    // phase's invoice was never actually sent — e.g. a cash payment
    // recorded before any invoice went out, or a deposit paid with the
    // balance never formally invoiced. Real, worth surfacing — but as a
    // qualifier on whatever state (usually 'draft') the row already
    // falls into, not a new top-level filter bucket of its own.
    _collectedUnsent: !invoiced && collected > 0,
  };
  return { ...derived, _state: invoiceState(derived) };
}