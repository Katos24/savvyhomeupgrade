import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';

export type CollectionKind = 'deposit' | 'balance';

type Args = {
  projectId: number;
  connectedAccountId: string;
  customerName: string;
  customerEmail?: string | null;
  companySlug: string;
 /** Tax-inclusive contract total. Caller computes it the same way the
   *  invoice does, so the customer is never charged a different number
   *  than the document shows. */
  contractTotal: number;
  /** Contractor's choice at send time. Terms on the job are a default, not
   *  a commitment — 'full' bills everything even when a deposit is set.
   *  Omitted elsewhere (PDF, reminders), which keeps the ledger-derived
   *  default. */
  collect?: CollectionKind | 'full';
};

export type CheckoutResult = {
  url: string | null;
  kind: CollectionKind | null;
  amount: number;
  /** Set when there is nothing left to collect, or terms make it a no-op. */
  reason?: string;
};

/**
 * Deposit on the tax-inclusive total, capped at it. Mirrors depositFor() in
 * CategoriesTab so settings, quote, and checkout all agree.
 */
export function depositFor(
  total: number,
  type: string | null | undefined,
  value: number | null | undefined
): number {
  const v = Number(value) || 0;
  if (!type || v <= 0 || total <= 0) return 0;
  const raw = type === 'percent' ? (total * v) / 100 : v;
  return Math.min(Math.round(raw * 100) / 100, total);
}

/**
 * One collection link at a time. The amount is derived here from what the
 * ledger says has been collected — never passed in — so a stale client or a
 * re-sent invoice can't charge the full total twice.
 *
 * Nothing collected yet + deposit terms  -> deposit for the deposit amount
 * Otherwise                              -> balance for total minus collected
 */
export async function getOrCreateCheckoutSession(args: Args): Promise<CheckoutResult> {
 const {
    projectId,
    connectedAccountId,
    customerName,
    customerEmail,
    companySlug,
    contractTotal,
    collect,
  } = args;

  const rows = await sql`
    SELECT deposit_type, deposit_value, stripe_checkout_session_id,
           COALESCE(payment_amount, 0) AS collected
    FROM projects
    WHERE id = ${projectId}
    LIMIT 1
  `;
  const project = rows[0];
  if (!project) return { url: null, kind: null, amount: 0, reason: 'project_not_found' };

  const collected = parseFloat(project.collected || '0');
  const remaining = Math.round((contractTotal - collected) * 100) / 100;

  if (contractTotal <= 0) return { url: null, kind: null, amount: 0, reason: 'no_total' };
  if (remaining <= 0) return { url: null, kind: null, amount: 0, reason: 'fully_paid' };

  const depositAmount = depositFor(contractTotal, project.deposit_type, project.deposit_value);

  // Deposit only applies before anything has been collected. Once money is in,
  // every subsequent link settles the job.
  const wantsFull = collect === 'full';
  const kind: CollectionKind =
    !wantsFull && collected === 0 && depositAmount > 0 ? 'deposit' : 'balance';
  const amount = kind === 'deposit' ? depositAmount : remaining;

  if (amount <= 0) return { url: null, kind: null, amount: 0, reason: 'nothing_due' };

  const unitAmount = Math.round(amount * 100);

  // Reuse an existing session ONLY if it is still open AND still for this
  // amount. Checking `status === 'open'` alone handed a customer the deposit
  // link when they asked for the balance.
  if (project.stripe_checkout_session_id) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(
        project.stripe_checkout_session_id,
        { stripeAccount: connectedAccountId }
      );
      if (
        existing.status === 'open' &&
        existing.url &&
        existing.amount_total === unitAmount
      ) {
        return { url: existing.url, kind, amount };
      }
    } catch {
      // expired / invalid / belongs to another account — create a new one
    }
  }

  const label =
    kind === 'deposit'
      ? `Deposit for ${customerName}`
      : collected > 0
      ? `Balance for ${customerName}`
      : `Invoice for ${customerName}`;

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: label },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/success?project_id=${projectId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard?payment=cancelled`,
      // kind is advisory only — the webhook re-derives it from the ledger so a
      // replayed or tampered session can't mislabel a row.
      metadata: {
        projectId: String(projectId),
        companySlug,
        collectionKind: kind,
      },
    },
    { stripeAccount: connectedAccountId }
  );

  await sql`
    UPDATE projects
    SET stripe_checkout_session_id = ${session.id}
    WHERE id = ${projectId}
  `;

  return { url: session.url, kind, amount };
}