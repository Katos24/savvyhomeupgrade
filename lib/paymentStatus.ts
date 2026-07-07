export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'refunded' | 'partially_refunded';

export function getPaymentStatusDisplay(status: string | null | undefined): { label: string; color: string; bg: string } {
  switch (status) {
    case 'paid':
      return { label: 'Paid', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
    case 'partial':
      return { label: 'Partial', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    case 'refunded':
      return { label: 'Refunded', color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
    case 'partially_refunded':
      return { label: 'Partially Refunded', color: '#64748b', bg: 'rgba(100,116,139,0.12)' };
    default:
      return { label: 'Unpaid', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  }
}

// Whether this status should count toward revenue totals
export function countsAsRevenue(status: string | null | undefined): boolean {
  return status === 'paid';
}

// A payment is "Stripe-verified" only if stripe_payment_intent_id is set —
// that field is written exclusively by Stripe's webhook on a confirmed
// charge, unlike payment_method, which is a free-text/select value anyone
// can set manually (including typing "stripe" without it being real).
// This is the single source of truth every surface (BillingSection,
// CardsView, TableView, FinancialsTable, CSV export) should check instead
// of re-deriving its own version of this logic.
export function isStripeVerified(record: { stripe_payment_intent_id?: string | null }): boolean {
  return !!record.stripe_payment_intent_id;
}

// Human-readable "how was this paid" label, consistent across every surface.
// Returns e.g. "Stripe (Visa •••• 4242)", "Stripe", or whatever manual
// payment_method value was recorded ("Cash", "Zelle", etc.), falling back
// to "Manual" if nothing was specified.
export function getPaymentMethodLabel(record: {
  stripe_payment_intent_id?: string | null;
  card_brand?: string | null;
  card_last4?: string | null;
  payment_method?: string | null;
}): string {
  if (isStripeVerified(record)) {
    return record.card_brand && record.card_last4
      ? `Stripe (${record.card_brand} •••• ${record.card_last4})`
      : 'Stripe';
  }
  return record.payment_method || 'Manual';
}