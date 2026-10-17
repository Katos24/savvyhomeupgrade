// Lead2Project's fee on card payments made through Stripe.
// 0.5% of the payment, never more than $50, rounded to the cent.
// OFF unless PLATFORM_FEE_ENABLED=true is set (turn it on only after the
// pricing page, terms and Payments tab disclose it).

export const PLATFORM_FEE_RATE = 0.005; // 0.5%
export const PLATFORM_FEE_CAP_CENTS = 5000; // $50

// One switch for the server (charging) and the screens (disclosure), so they
// can never disagree. NEXT_PUBLIC_ so the Payments page can read it too.
export function platformFeeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PLATFORM_FEE_ENABLED === 'true';
}

/** "1%, max $50" for display. */
export const PLATFORM_FEE_LABEL = `${PLATFORM_FEE_RATE * 100}%, max $${PLATFORM_FEE_CAP_CENTS / 100}`;

/** Fee in cents for a payment of `amountCents`. 0 when the fee is off. */
export function platformFeeCents(amountCents: number): number {
  if (!platformFeeEnabled()) return 0;
  if (!Number.isFinite(amountCents) || amountCents <= 0) return 0;
  return Math.min(Math.round(amountCents * PLATFORM_FEE_RATE), PLATFORM_FEE_CAP_CENTS);
}