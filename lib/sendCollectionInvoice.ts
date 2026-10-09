// One place that sends a deposit / balance / full invoice to the customer.
//
// Used by:
//   - the Send button on the Invoice tab (leads/update → send_invoice_to_customer)
//   - the customer accepting a quote (quotes/respond), when the company has
//     "When a customer accepts a quote" set to deposit or full
//   - a job being marked completed (leads/update → update_status), when the
//     company has "Send the final invoice when I mark a job completed" on
//
// Moved here from the send_invoice_to_customer action unchanged in behavior,
// so all three paths compute the amount, create the Stripe link, email the
// customer, log the outbox and record "sent" exactly the same way.
// Amounts come only from lib/billing.ts (getBillingState).

import { adminDb as sql } from '@/lib/db';
import { can, type PlanTier } from '@/lib/permissions';
import { getBillingState } from '@/lib/billing';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';
import { sendInvoiceToCustomer } from '@/lib/email';

export type SendCollectionOptions = {
  leadId: number;
  /** 'full' bills everything left, even when a deposit is set. */
  collect?: 'full';
  /** Only send if the next collection is this kind (e.g. 'deposit' on quote accept). */
  onlyIfKind?: 'deposit';
  /** Skip if this kind of invoice was already sent (automatic sends only). */
  skipIfAlreadySent?: boolean;
  /** Optional overrides from the Send dialog. */
  invoiceData?: any;
  invoiceNumber?: string;
  dueDate?: string;
  notes?: string;
  /** Who sent it, for the outbox and activity log. */
  sentBy: { name: string; email: string };
};

export type SendCollectionResult =
  | {
      ok: true;
      kind: 'deposit' | 'balance' | 'full';
      amount: number;
      paymentLinkUrl?: string;
    }
  | {
      ok: false;
      /** Set when nothing was sent on purpose (not an error). */
      skipped?: string;
      status: number;
      error: string;
      upgradeRequired?: boolean;
    };

async function addActivity(projectId: number, entry: Record<string, unknown>) {
  const rows = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
  let notes: any[] = [];
  try {
    const raw = rows[0]?.notes;
    notes = !raw ? [] : typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
  } catch {
    notes = [];
  }
  notes.push(entry);
  await sql`UPDATE projects SET notes = ${JSON.stringify(notes)}, updated_at = NOW() WHERE id = ${projectId}`;
}

export async function sendCollectionInvoice(opts: SendCollectionOptions): Promise<SendCollectionResult> {
  const { leadId, sentBy } = opts;

  const rows = await sql`
    SELECT l.*, p.invoice_data, p.invoice_number, p.quote_data, p.quote_total, p.quote_tax_rate,
           p.payment_amount, p.payment_status, p.stripe_checkout_session_id,
           p.deposit_type, p.deposit_value, p.deposit_paid_at,
           c.name as company_name, c.phone as company_phone,
           c.email as company_email,
           c.id as company_id, c.slug as company_slug, c.plan_tier,
           c.stripe_connect_account_id, c.stripe_connect_onboarded,
           CASE WHEN c.card_payments_enabled = false THEN 'off' ELSE c.stripe_payment_status END AS stripe_payment_status,
           c.payment_link_url, c.payment_link_type,
                                 c.invoice_terms
    FROM leads l
    LEFT JOIN projects p ON l.project_id = p.id
    LEFT JOIN companies c ON l.company_id = c.id
    WHERE l.id = ${leadId}
  `;
  const lead = rows[0];
  if (!lead) return { ok: false, status: 404, error: 'Lead not found' };

  if (!can((lead.plan_tier ?? 'free') as PlanTier, 'send_invoice_email')) {
    return { ok: false, status: 403, error: 'Sending invoices is available on the Pro plan', upgradeRequired: true };
  }
  if (!lead.project_id) return { ok: false, status: 400, error: 'No project exists.' };
  if (!lead.email) return { ok: false, status: 400, error: 'This customer has no email address.' };

  const invoiceItems = (() => {
    try {
      const raw = opts.invoiceData || lead.invoice_data || lead.quote_data;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  })();
  if (invoiceItems.length === 0) return { ok: false, status: 400, error: 'No line items found.' };

  const invoiceTaxRate = lead.quote_tax_rate ? parseFloat(lead.quote_tax_rate) : 0;
  // quote_total is stored tax-inclusive and is what the PDF and the payment link both use.
  const invoiceTotal = parseFloat(lead.quote_total || '0');
  const invoiceNumber = opts.invoiceNumber || lead.invoice_number || 'INV-001';

  const paidSoFar = parseFloat(lead.payment_amount || '0');
  const billing = getBillingState(
    {
      total: invoiceTotal,
      paidAmount: paidSoFar,
      depositType: lead.deposit_type,
      depositValue: lead.deposit_value,
      depositPaidAt: lead.deposit_paid_at,
    },
    opts.collect === 'full'
  );
  const collectionKind = billing.collectionKind;
  const chargeAmount = billing.amountDueNow;

  // ── Automatic-send guards (the Send button passes none of these) ──
  if (opts.onlyIfKind && collectionKind !== opts.onlyIfKind) {
    return { ok: false, skipped: 'not_' + opts.onlyIfKind, status: 200, error: 'Nothing to send' };
  }
  if (chargeAmount <= 0 || billing.remaining <= 0) {
    if (opts.skipIfAlreadySent || opts.onlyIfKind) {
      return { ok: false, skipped: 'nothing_due', status: 200, error: 'Nothing due' };
    }
  }
  if (opts.skipIfAlreadySent) {
    const inv = await sql`SELECT deposit_sent_at, sent_at FROM invoices WHERE project_id = ${lead.project_id} LIMIT 1`;
    const already = collectionKind === 'deposit' ? inv[0]?.deposit_sent_at : inv[0]?.sent_at;
    if (already) return { ok: false, skipped: 'already_sent', status: 200, error: 'Already sent' };
  }

  // sendInvoiceToCustomer's collectionKind predates 'full': unset = full amount.
  const emailCollectionKind = collectionKind === 'full' ? undefined : collectionKind;

  // ── Stripe Connect payment link ──
   // Manual link (Venmo, Zelle…) by default; replaced by Stripe Checkout below when cards are on.
  let paymentLinkUrl: string | undefined = lead.payment_link_url || undefined;
  let paymentLinkType: string | undefined = lead.payment_link_url ? lead.payment_link_type || 'other' : undefined;
  if (lead.stripe_payment_status === 'active' && invoiceTotal > 0) {
    try {
      const checkout = await getOrCreateCheckoutSession({
        projectId: lead.project_id,
        connectedAccountId: lead.stripe_connect_account_id,
        customerName: lead.name,
        customerEmail: lead.email,
        companySlug: lead.company_slug,
        contractTotal: invoiceTotal,
        collect: opts.collect === 'full' ? 'full' : undefined,
      });
      if (checkout.url) {
        paymentLinkUrl = checkout.url;
        paymentLinkType = 'stripe';
      }
    } catch (stripeErr: any) {
      console.error('Failed to create Stripe Checkout session:', stripeErr.message);
      if (stripeErr.code === 'account_invalid' || stripeErr.message?.includes('not enabled')) {
        return {
          ok: false,
          status: 400,
          error:
            'Your Stripe account needs attention before you can send payment links. Check your Stripe dashboard or reconnect in Settings.',
        };
      }
      // other errors: email sends without a pay-now button
    }
  }

  try {
    const emailResult = await sendInvoiceToCustomer({
      projectId: lead.project_id,
      customerEmail: lead.email,
      customerName: lead.name,
      companyName: lead.company_name || '',
      companyPhone: lead.company_phone || undefined,
      companyId: lead.company_id,
      invoiceNumber,
      invoiceTotal,
      amountPaid: lead.payment_amount ? parseFloat(lead.payment_amount) : undefined,
      invoiceItems,
      terms: lead.invoice_terms || undefined,
      dueDate: opts.dueDate || undefined,
      notes: opts.notes || undefined,
      contractorEmail: lead.company_email,
      paymentLinkUrl,
      paymentLinkType,
      taxRate: invoiceTaxRate > 0 ? invoiceTaxRate : undefined,
      depositAmount: chargeAmount,
      collectionKind: emailCollectionKind,
    });

    // Outbox
    try {
      await sql`
        INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, subject, html_body, status, sent_by_email, sent_by_name, metadata)
        VALUES (
          ${lead.company_id}, ${lead.project_id}, ${leadId}, 'invoice',
          ${lead.email}, ${lead.name},
          ${emailResult?.subject || 'Invoice'}, ${emailResult?.html || ''},
          'sent', ${sentBy.email}, ${sentBy.name},
          ${JSON.stringify({
            invoice_number: invoiceNumber,
            invoice_total: invoiceTotal,
            resend_id: emailResult?.resendId,
            kind: collectionKind,
            amount: chargeAmount,
          })}::jsonb
        )
      `;
    } catch (outboxErr) {
      console.error('Failed to log to outbox:', outboxErr);
    }

    // Record the send on projects + invoices (non-blocking: the email already went out).
    try {
      if (collectionKind === 'deposit') {
        await sql`
          UPDATE projects
                   SET invoice_status = 'sent',
              invoice_sent_at = NOW(),
              deposit_invoice_sent_at = NOW(),
              invoice_pdf_url = ${emailResult?.pdfUrl || null},
              deposit_due_date = ${opts.dueDate || null},
              updated_at = NOW()
          WHERE id = ${lead.project_id}
        `;
        await sql`
          UPDATE invoices
          SET deposit_sent_at = NOW(), updated_at = NOW()
          WHERE project_id = ${lead.project_id}
        `;
      } else {
        await sql`
          UPDATE projects
                   SET invoice_status = 'sent',
              invoice_sent_at = NOW(),
              balance_invoice_sent_at = NOW(),
              invoice_pdf_url = ${emailResult?.pdfUrl || null},
              payment_due_date = ${opts.dueDate || null},
              updated_at = NOW()
          WHERE id = ${lead.project_id}
        `;
        await sql`
          UPDATE invoices
          SET sent_at = NOW(), updated_at = NOW()
          WHERE project_id = ${lead.project_id}
        `;
      }
    } catch (mirrorErr) {
      console.error('Failed to update project/invoice after send:', mirrorErr);
    }

    try {
      await addActivity(lead.project_id, {
        type: 'invoice_sent',
        text: `Invoice ${invoiceNumber} emailed to customer`,
        user_name: sentBy.name,
        user_email: sentBy.email,
        timestamp: new Date().toISOString(),
      });
    } catch (actErr) {
      console.error('Failed to log invoice activity:', actErr);
    }

    return { ok: true, kind: collectionKind, amount: chargeAmount, paymentLinkUrl };
  } catch (emailError: any) {
    try {
      await sql`
        INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, status, error_message, sent_by_email, sent_by_name, metadata)
        VALUES (
          ${lead.company_id}, ${lead.project_id}, ${leadId}, 'invoice',
          ${lead.email}, ${lead.name},
          'failed', ${emailError.message || 'Unknown error'},
          ${sentBy.email}, ${sentBy.name},
          ${JSON.stringify({ invoice_number: invoiceNumber })}::jsonb
        )
      `;
    } catch {}
    return { ok: false, status: 500, error: 'Failed to send email.' };
  }
}