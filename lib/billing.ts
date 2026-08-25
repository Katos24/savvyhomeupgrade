// Single source of truth for "what does the customer actually owe right
// now" — deposit-aware, so every surface (billing card, header snapshot,
// PDF, email) agrees on the same number instead of each computing its own
// partial version. Mirrors the math BillingSection/PDF route already use.

export type DepositTerms = {
  total: number;
  paidAmount: number;
  depositType?: 'percent' | 'fixed' | null;
  depositValue?: number | null;
};

export function getDepositAmount({
  total,
  depositType,
  depositValue,
}: Pick<DepositTerms, 'total' | 'depositType' | 'depositValue'>): number {
  const value = depositValue ? parseFloat(String(depositValue)) : 0;
  if (!depositType || !value || value <= 0 || total <= 0) return 0;
  return Math.min(
    Math.round((depositType === 'percent' ? (total * value) / 100 : value) * 100) / 100,
    total
  );
}

export function getAmountDueNow({ total, paidAmount, depositType, depositValue }: DepositTerms): number {
  const depositAmount = getDepositAmount({ total, depositType, depositValue });
  const hasDepositTerms = depositAmount > 0;
  const depositPaid = hasDepositTerms && paidAmount > 0;
  const remaining = Math.max(total - paidAmount, 0);
  return hasDepositTerms && !depositPaid ? depositAmount : remaining;
}