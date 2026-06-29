import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb as sql } from '@/lib/db';
import { headers } from 'next/headers';

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

      const amountPaid = session.amount_total ? session.amount_total / 100 : null;

      await sql`
        UPDATE projects
        SET
          payment_status = 'paid',
          payment_amount = ${amountPaid},
          payment_method = 'stripe',
          paid_at = NOW(),
          payment_date = CURRENT_DATE,
          stripe_payment_intent_id = ${session.payment_intent as string}
        WHERE id = ${parseInt(projectId)}
      `;

      console.log(`✅ Project ${projectId} marked paid via Stripe Connect, amount: ${amountPaid}`);

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

    // ── Fired when a company disconnects your platform from their Stripe
    // dashboard side. Without this, your DB shows them as connected forever
    // and payment links/checkout sessions for that company would silently
    // start failing with no warning.
    case 'account.application.deauthorized': {
      const connectedAccountId = (event as any).account;
      if (!connectedAccountId) break;

      await sql`
        UPDATE companies
        SET
          stripe_connect_account_id = NULL,
          stripe_connect_onboarded = FALSE
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
      if (account.charges_enabled === false && account.requirements?.disabled_reason) {
        console.warn(
          'Stripe Connect: account disabled —',
          account.id,
          account.requirements.disabled_reason
        );
      }
      break;
    }

    default:
      console.log(`Unhandled Connect event type: ${event.type}`);
      break;
  }

  return NextResponse.json({ received: true });
}