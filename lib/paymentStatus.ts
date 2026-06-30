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