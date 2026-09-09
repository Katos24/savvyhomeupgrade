import type { NeonQueryFunction } from '@neondatabase/serverless';

// Canonical "recent payments" query — this exact shape existed
// independently in two places (Dashboard's dashboard-stats/route.ts and
// Financials' page.tsx), which is exactly what let them drift out of
// sync: one got the created_at-vs-paid_on sort fix, the other didn't,
// and the two surfaces started showing different "recent" transactions
// for the same underlying data. One function now; both callers use it.
export type RecentPaymentRow = {
  id: number;
  amount: string | number;
  kind: string;
  method: string;
  paid_on: string;
  customer_name: string;
  payment_status?: string | null;
};

/**
 * Real transactions from the payments ledger, not a project's running
 * total. Excludes refunds ('money that came in', not money going back
 * out) — a refund showing up in a "recent payments" list would read as
 * new revenue when it's the opposite.
 *
 * Sorted by created_at (when actually entered), not paid_on (the
 * business date, freely backdated on manual entries). This is an
 * activity feed — "recent" should mean "just happened," not "happened
 * on a recent calendar date."
 *
 * includePaymentStatus controls whether pr.payment_status is selected —
 * Dashboard's badge needs it, Financials computes its own richer state
 * elsewhere and doesn't.
 */
export async function getRecentPayments(
  sql: NeonQueryFunction<false, false>,
  companyId: number,
  limit = 6,
  includePaymentStatus = false
): Promise<RecentPaymentRow[]> {
  if (includePaymentStatus) {
    return sql`
      SELECT
        pay.id, pay.amount, pay.kind, pay.method, pay.paid_on,
        l.name as customer_name, pr.payment_status
      FROM payments pay
      JOIN projects pr ON pay.project_id = pr.id
      JOIN leads l ON pr.lead_id = l.id
      WHERE pay.company_id = ${companyId}
        AND pay.kind <> 'refund'
      ORDER BY pay.created_at DESC
      LIMIT ${limit}
    ` as unknown as Promise<RecentPaymentRow[]>;
  }
  return sql`
    SELECT
      pay.id, pay.amount, pay.kind, pay.method, pay.paid_on,
      l.name as customer_name
    FROM payments pay
    JOIN projects pr ON pay.project_id = pr.id
    JOIN leads l ON pr.lead_id = l.id
    WHERE pay.company_id = ${companyId}
      AND pay.kind <> 'refund'
    ORDER BY pay.created_at DESC
    LIMIT ${limit}
  ` as unknown as Promise<RecentPaymentRow[]>;
}