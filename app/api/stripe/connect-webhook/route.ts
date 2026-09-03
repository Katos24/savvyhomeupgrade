import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { headers } from 'next/headers';
import { parseAccountStatus } from '@/lib/stripe/parseAccountStatus';
import { getCollectionKind } from '@/lib/billing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Connect webhook signature verification failed:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const projectId = session.metadata?.projectId;
      const eventAccountId = (event as any).account; // the connected account that sent this event

      if (!projectId) {
        console.error('No projectId in Connect session metadata:', session.id);
        break;
      }

      // Verify this event actually came from the connected account tied to this project's company —
      // prevents one connected account's events from updating another company's project.
      const projectCheck = await sql`
        SELECT p.id, c.stripe_connect_account_id
        FROM projects p
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = ${parseInt(projectId)}
        LIMIT 1
      `;

      if (!projectCheck[0]) {
        console.error('Project not found for Connect webhook:', projectId);
        break;
      }

if (projectCheck[0].stripe_connect_account_id !== eventAccountId) {
        console.error(
          `Account mismatch on Connect webhook: event from ${eventAccountId}, project ${projectId} belongs to ${projectCheck[0].stripe_connect_account_id}`
        );
        break;
      }

    // Idempotency now comes from the UNIQUE constraint on
      // payments.stripe_payment_intent_id — the insert below returns nothing
      // on a redelivered event. Guarding on payment_status was wrong once a
      // project can legitimately receive a deposit and then a balance.
      // company_id is NOT NULL on payments and drives RLS, so read it here.
      const projectRows = await sql`
        SELECT company_id, quote_total, payment_amount,
               deposit_type, deposit_value, deposit_paid_at
        FROM projects WHERE id = ${parseInt(projectId)} LIMIT 1
      `;
      const projectRow = projectRows[0];

      if (!projectRow) {
        console.error(`Webhook ${event.id}: project ${projectId} not found`);
        break;
      }
      if (!projectRow.company_id) {
        console.error(`Webhook ${event.id}: project ${projectId} has no company_id`);
        break;
      }

const amountPaid = session.amount_total ? session.amount_total / 100 : null;
      if (amountPaid === null) {
        // payments.amount is NOT NULL; inserting would throw and Stripe would
        // retry forever on an event that can never succeed.
        console.error(`Webhook ${event.id}: session ${session.id} has no amount_total`);
        break;
      }

      // Fetch card brand/last4 once at payment time so BillingSection can
      // display it without a live Stripe call on every page load.
      let cardBrand: string | null = null;
      let cardLast4: string | null = null;
      try {
        const intent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ['latest_charge'] },
          { stripeAccount: eventAccountId }
        );
        const charge = (intent as any).latest_charge;
        const cardDetails = charge?.payment_method_details?.card;
        if (cardDetails) {
          cardBrand = cardDetails.brand;
          cardLast4 = cardDetails.last4;
        }
      } catch (err: any) {
        console.error('Failed to retrieve card details for receipt:', err.message);
        // Non-fatal — payment still gets marked paid even if this fails
      }

      // A session created for a balance is smaller than quote_total, so
      // classify rather than assuming this settles the job. The job's
      // deposit terms decide this, not the amount — derived here rather
      // than read from session.metadata so a replayed session can't
      // mislabel the row.
      //
      // Reads from lib/billing.ts, the single source of truth, instead of
      // its own inline copy of this math. This one mattered more than most
      // of the other instances of this bug: unlike a live display that
      // self-corrects the moment the code is fixed, this determines the
      // permanent 'kind' value written to the payments table below — a
      // misclassification here doesn't fix itself later, it's baked into
      // the historical record. See the note above this file's edit for
      // whether any already-recorded rows need a separate data correction.
      const projectQuoteTotal = parseFloat(projectRow.quote_total || '0');
      const alreadyPaidAmount = parseFloat(projectRow.payment_amount || '0');
      const rawKind = getCollectionKind({
        total: projectQuoteTotal,
        paidAmount: alreadyPaidAmount,
        depositType: projectRow.deposit_type,
        depositValue: projectRow.deposit_value,
        depositPaidAt: projectRow.deposit_paid_at,
      });
      const paymentKind: 'deposit' | 'balance' = rawKind === 'deposit' ? 'deposit' : 'balance';

      const insertedPayment = await sql`
       INSERT INTO payments (
          project_id, company_id, amount, invoiced_total, method, kind, paid_on,
          stripe_payment_intent_id, stripe_checkout_session_id,
          card_brand, card_last4, recorded_by
        ) VALUES (
          ${parseInt(projectId)},
          ${projectRow.company_id},
          ${amountPaid},
          ${projectQuoteTotal || null},
          'stripe',
          ${paymentKind},
          CURRENT_DATE,
          ${session.payment_intent as string},
          ${session.id},
          ${cardBrand},
          ${cardLast4},
          'Stripe'
        )
        ON CONFLICT (stripe_payment_intent_id) DO NOTHING
        RETURNING id
      `;

      
      if (insertedPayment.length === 0) {
        console.log(`Webhook ${event.id}: intent ${session.payment_intent} already recorded — skipping`);
        break;
      }

      // payments_sync_project recomputes projects.payment_amount,
      // payment_status, payment_method, payment_date, card_brand, card_last4
      // and paid_at from SUM(payments.amount). Nothing else to write.
      console.log(
        `✅ Project ${projectId}: ${paymentKind} of ${amountPaid} recorded via Stripe Connect`
      );

      // The trigger has already run, so this is the true collected total.
      // Both receipts need it — a customer paying a deposit otherwise sees
      // only the amount they just paid and assumes the job is settled.
      const afterInsert = await sql`
        SELECT COALESCE(payment_amount, 0) AS collected
        FROM projects WHERE id = ${parseInt(projectId)} LIMIT 1
      `;
      const paidToDate = parseFloat(afterInsert[0]?.collected || '0');
      // ── Send confirmation emails to customer and contractor ──
      const emailData = await sql`
        SELECT l.email as customer_email, l.name as customer_name,
               c.id as company_id, c.name as company_name, c.email as contractor_email, c.slug as company_slug,
               p.invoice_number
        FROM projects p
        JOIN leads l ON p.lead_id = l.id
        JOIN companies c ON p.company_id = c.id
        WHERE p.id = ${parseInt(projectId)}
        LIMIT 1
      `;
      const d = emailData[0];

      if (d) {
        const { sendPaymentReceiptToCustomer, sendPaymentNotificationToContractor } = await import('@/lib/email');

        if (d.customer_email) {
         await sendPaymentReceiptToCustomer({
            customerEmail: d.customer_email,
            customerName: d.customer_name,
            companyName: d.company_name,
            companyId: d.company_id,
            amountPaid: amountPaid || 0,
            invoiceNumber: d.invoice_number,
            contractTotal: projectQuoteTotal,
            paidToDate,
            paymentKind,
            cardBrand,
            cardLast4,
          });
        }

        if (d.contractor_email) {
          await sendPaymentNotificationToContractor({
            contractorEmail: d.contractor_email,
            customerName: d.customer_name,
            companyName: d.company_name,
            companyId: d.company_id,
            amountPaid: amountPaid || 0,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${d.company_slug}/dashboard`,
            contractTotal: projectQuoteTotal,
            paidToDate,
            paymentKind,
          });
        }
      }

      break;
    }

   case 'checkout.session.expired': {
      const session = event.data.object as any;
      console.log('Checkout session expired:', session.id, 'project:', session.metadata?.projectId);
      // No DB update needed — project stays unpaid, contractor can resend
      break;
    }

    // ── Fired when a contractor issues a refund (full or partial) from
    // their own Stripe Dashboard. Stripe handles the customer-facing
    // refund email automatically; this just keeps our DB's payment_status
    // in sync so the dashboard doesn't keep showing "Paid" after money
    // has actually gone back to the customer.
    case 'charge.refunded': {
      const charge = event.data.object as any;
      const paymentIntentId = charge.payment_intent;
      const eventAccountId = (event as any).account;
 
      if (!paymentIntentId) {
        console.error('charge.refunded with no payment_intent:', charge.id);
        break;
      }
 
      // Find the payment this refund reverses. Not via
      // projects.stripe_payment_intent_id — that column holds only the most
      // recent payment, so refunding an earlier one would miss.
           const refundTargetRows = await sql`
        SELECT id, project_id, company_id, amount, invoiced_total
        FROM payments
        WHERE stripe_payment_intent_id = ${paymentIntentId}
          AND kind <> 'refund'
        LIMIT 1
      `;
      const refundTarget = refundTargetRows[0];
 
      if (!refundTarget) {
        console.error('No matching payment for refunded charge:', charge.id, paymentIntentId);
        break;
      }
 
      const refundProjectId = refundTarget.project_id;
      const refundCompanyId = refundTarget.company_id;
      // Carry the total from the payment being reversed, not the current
      // quote_total — the refund belongs to the job as it was invoiced then.
      const refundInvoicedTotal = refundTarget.invoiced_total;
 
      // Pull the authoritative refund list from the API rather than trusting
      // charge.refunds on the event payload, which Stripe truncates past ~10.
      let refunds: any[] = [];
      try {
        const refundList = await stripe.refunds.list(
          { charge: charge.id, limit: 100 },
          { stripeAccount: eventAccountId }
        );
        refunds = refundList.data || [];
      } catch (err: any) {
        console.error('Failed to list refunds for charge', charge.id, err.message);
        // Return 500 so Stripe retries — better than silently losing the refund.
        return NextResponse.json({ error: 'refund_list_failed' }, { status: 500 });
      }
 
      // Only refunds that actually moved money. Stripe can report 'pending',
      // 'failed', or 'canceled'; recording those would understate collections.
      const settledRefunds = refunds.filter((r) => r.status === 'succeeded');
 
      if (settledRefunds.length === 0) {
        console.log(`charge.refunded ${charge.id}: no succeeded refunds yet, nothing to record`);
        break;
      }
 
      const refundIds = settledRefunds.map((r) => r.id);
      const existingRows = await sql`
        SELECT stripe_refund_id
        FROM payments
        WHERE stripe_refund_id = ANY(${refundIds})
      `;
      const alreadyRecorded = new Set(existingRows.map((r: any) => r.stripe_refund_id));
 
      const newRefunds = settledRefunds.filter((r) => !alreadyRecorded.has(r.id));
 
      if (newRefunds.length === 0) {
        console.log(`charge.refunded ${charge.id}: all ${settledRefunds.length} refund(s) already recorded`);
        break;
      }
 
      let recordedTotal = 0;
      for (const refund of newRefunds) {
        const refundAmount = (refund.amount || 0) / 100;
        if (refundAmount <= 0) continue;
 
        // Negative row so SUM(amount) reflects what was actually kept.
        // ON CONFLICT covers the race where two events for the same charge
        // arrive concurrently and both pass the check above.
                const inserted = await sql`
         INSERT INTO payments (
            project_id, company_id, amount, invoiced_total, method, kind, paid_on,
            stripe_refund_id, note, recorded_by, reversed_payment_id
          ) VALUES (
            ${refundProjectId},
            ${refundCompanyId},
            ${-Math.abs(refundAmount)},
            ${refundInvoicedTotal},
            'stripe',
            'refund',
            CURRENT_DATE,
            ${refund.id},
            ${`Refund ${refund.id} against intent ${paymentIntentId}`},
            'Stripe',
            ${refundTarget.id}
          )
          ON CONFLICT (stripe_refund_id) DO NOTHING
          RETURNING id
        `;
 
        if (inserted.length > 0) recordedTotal += refundAmount;
      }
 
      if (recordedTotal === 0) {
        console.log(`charge.refunded ${charge.id}: nothing new inserted after conflict check`);
        break;
      }
 
      // payments_sync_project has recomputed projects.payment_amount from the
      // sum, negatives included. Read it back rather than inferring status
      // from a single charge.
      const afterRefund = await sql`
        SELECT COALESCE(payment_amount, 0) AS net_paid
        FROM projects WHERE id = ${refundProjectId} LIMIT 1
      `;
      const netPaid = parseFloat(afterRefund[0]?.net_paid || '0');
 
      await sql`
        UPDATE projects
        SET payment_status  = ${netPaid <= 0 ? 'refunded' : 'partially_refunded'},
            refunded_amount = COALESCE(refunded_amount, 0) + ${recordedTotal},
            refunded_at     = NOW()
        WHERE id = ${refundProjectId}
      `;
 
      console.log(
        `Project ${refundProjectId}: recorded ${newRefunds.length} refund(s) ` +
        `totalling ${recordedTotal}, net paid now ${netPaid}`
      );
 
      break;
    }

    // ── Fired when a company disconnects your platform from their Stripe
    // dashboard side. ...
    case 'account.application.deauthorized': {
      const connectedAccountId = (event as any).account;
      if (!connectedAccountId) break;

      await sql`
       UPDATE companies
        SET
          stripe_connect_account_id = NULL,
          stripe_connect_onboarded = FALSE,
          stripe_payment_status = NULL,
          stripe_requirements_summary = NULL
        WHERE stripe_connect_account_id = ${connectedAccountId}
      `;
      console.log('Stripe Connect: account deauthorized, cleared for', connectedAccountId);
      break;
    }

    // ── Fired whenever Stripe approves, restricts, or otherwise changes
    // status on a connected account (e.g. charges_enabled flips, or Stripe
    // disables an account for compliance reasons). Currently just logs —
    // hook point for a future "your Stripe account needs attention" email.
   case 'account.updated': {
      const account = event.data.object as any;
      const connectedAccountId = account.id;

      const { paymentStatus, blockingReasons } = parseAccountStatus(account);

      const previous = await sql`
        SELECT stripe_payment_status
        FROM companies
        WHERE stripe_connect_account_id = ${connectedAccountId}
        LIMIT 1
      `;
      const previousStatus = previous[0]?.stripe_payment_status;

      await sql`
        UPDATE companies
        SET
          stripe_payment_status = ${paymentStatus},
          stripe_requirements_summary = ${JSON.stringify(blockingReasons)}
        WHERE stripe_connect_account_id = ${connectedAccountId}
      `;

      console.log(
        `Stripe Connect: ${connectedAccountId} status -> ${paymentStatus}`,
        blockingReasons.length ? blockingReasons : '(no blockers)'
      );

      if (paymentStatus === 'restricted' && previousStatus !== 'restricted') {
        const companyRow = await sql`
          SELECT id, email as contractor_email, name as company_name, slug as company_slug
          FROM companies
          WHERE stripe_connect_account_id = ${connectedAccountId}
          LIMIT 1
        `;
        const c = companyRow[0];
  if (c?.contractor_email) {
      const { sendStripeActionNeededEmail } = await import('@/lib/email');
      await sendStripeActionNeededEmail({
        contractorEmail: c.contractor_email,
        companyName: c.company_name,
        companyId: c.id,
        reasons: blockingReasons,
dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${c.company_slug}/home`,
      });
    }

      }

      break;
    }

    default:
      console.log(`Unhandled Connect event type: ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}