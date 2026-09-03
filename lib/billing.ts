// THE single source of truth for deposit/balance math across this app.
//
// This file existed before with a promise it wasn't keeping: at least nine
// places across the codebase (BillingSection.tsx, LeadModalHeader.tsx,
// getOrCreateCheckoutSession.ts, generate-invoice-pdf/route.ts,
// payments/route.ts, payment-reminders/route.ts, leads/update/route.ts —
// twice) each independently computed some version of "is the deposit
// satisfied" or "what's the deposit amount." Some used a live comparison
// that could un-satisfy itself when the quote grew after the deposit was
// already paid. Some used different variable/function names for the exact
// same formula. None of them agreed with each other by construction — only
// by coincidence, until someone edited one and not the others.
//
// Every consumer should import from here. Nothing should reimplement any
// of this math locally, ever — that's the entire point of this file
// existing. If a surface needs something this module doesn't yet expose,
// the fix is to add it here, not to compute it locally "just this once."

export type DepositType = 'percent' | 'fixed' | null | undefined;

export type BillingInputs = {
  /** Tax-inclusive contract total (quote_total). */
  total: number;
  /** Net amount actually collected so far (payments minus refunds). */
  paidAmount: number;
  depositType?: DepositType;
  depositValue?: number | string | null;
  /** Sticky DB fact (projects.deposit_paid_at). Null/undefined means the
   *  deposit has never been satisfied. Once a timestamp exists, the
   *  deposit is satisfied FOREVER — this module never un-sets it based on
   *  amounts, because that's the exact bug this consolidation exists to
   *  eliminate. Every caller MUST fetch and pass this — there is no safe
   *  live-recompute fallback anymore. A caller that omits it is telling
   *  this module "assume never satisfied," which is wrong far more often
   *  than it's right. */
  depositPaidAt?: string | Date | null;
};

export type CollectionKind = 'deposit' | 'balance' | 'full';

export type BillingState = {
  hasDepositTerms: boolean;
  /** Full deposit target, capped at total. Percent or fixed. */
  depositAmount: number;
  /** Sticky — true only once deposit_paid_at is actually set. */
  depositSatisfied: boolean;
  /** total - paidAmount, floored at 0. */
  remaining: number;
  /** What should actually be charged/shown as due right now. */
  amountDueNow: number;
  /** What a fresh collection request (invoice send, checkout session,
   *  reminder) should ask for. */
  collectionKind: CollectionKind;
};

/** The one deposit-amount calculation. Percent or fixed, capped at total.
 *  Previously duplicated verbatim as depositFor() in
 *  getOrCreateCheckoutSession.ts under a different name — same formula,
 *  now one function. */
export function getDepositAmount({
  total,
  depositType,
  depositValue,
}: Pick<BillingInputs, 'total' | 'depositType' | 'depositValue'>): number {
  const value = depositValue ? parseFloat(String(depositValue)) : 0;
  if (!depositType || !value || value <= 0 || total <= 0) return 0;
  return Math.min(
    Math.round((depositType === 'percent' ? (total * value) / 100 : value) * 100) / 100,
    total
  );
}

/** Sticky, not recomputed. True only once the database says so. */
export function isDepositSatisfied({ depositPaidAt }: Pick<BillingInputs, 'depositPaidAt'>): boolean {
  return !!depositPaidAt;
}

/** What kind of collection a fresh request (invoice, checkout session,
 *  reminder) should be for. `forceFull` is for a contractor explicitly
 *  choosing to bill everything even when deposit terms exist — a
 *  one-time override, not a stored state. */
export function getCollectionKind(inputs: BillingInputs, forceFull = false): CollectionKind {
  if (forceFull) return 'full';
  const depositAmount = getDepositAmount(inputs);
  if (depositAmount <= 0) return 'balance';
  return isDepositSatisfied(inputs) ? 'balance' : 'deposit';
}

/** What's actually owed right now — the number every surface (billing
 *  card, header snapshot, PDF, email, checkout session) should show.
 *  `forceFull` must match whatever was passed to getCollectionKind for the
 *  same request — otherwise the label could say "full" while the amount
 *  still reflects deposit-shortfall math. */
export function getAmountDueNow(inputs: BillingInputs, forceFull = false): number {
  const remaining = Math.max(inputs.total - inputs.paidAmount, 0);
  if (forceFull) return remaining;
  const depositAmount = getDepositAmount(inputs);
  const hasDepositTerms = depositAmount > 0;
  const satisfied = isDepositSatisfied(inputs);
  return hasDepositTerms && !satisfied ? Math.max(depositAmount - inputs.paidAmount, 0) : remaining;
}

/** Everything a consumer needs, computed once, consistently. Prefer this
 *  over calling the individual functions separately when a surface needs
 *  more than one of these values — guarantees they can't drift relative
 *  to each other within the same render/request. */
export function getBillingState(inputs: BillingInputs, forceFull = false): BillingState {
  const depositAmount = getDepositAmount(inputs);
  const hasDepositTerms = depositAmount > 0;
  const depositSatisfied = isDepositSatisfied(inputs);
  const remaining = Math.max(inputs.total - inputs.paidAmount, 0);
  const amountDueNow = getAmountDueNow(inputs, forceFull);
  const collectionKind = getCollectionKind(inputs, forceFull);
  return { hasDepositTerms, depositAmount, depositSatisfied, remaining, amountDueNow, collectionKind };
}