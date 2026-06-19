import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { adminDb as sql } from '@/lib/db';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headersList = await headers();

  let event: any;

  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: headersList.get('svix-id')!,
        timestamp: headersList.get('svix-timestamp')!,
        signature: headersList.get('svix-signature')!,
      },
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
    });
  } catch (err: any) {
    console.error('Resend webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const resendId = event.data?.email_id;
  if (!resendId) {
    return NextResponse.json({ received: true });
  }

  const now = new Date().toISOString();

  switch (event.type) {
    case 'email.delivered':
      await sql`UPDATE email_outbox SET status = 'delivered', delivered_at = ${now} WHERE resend_id = ${resendId}`;
      break;
    case 'email.bounced':
      await sql`UPDATE email_outbox SET status = 'bounced', bounced_at = ${now} WHERE resend_id = ${resendId}`;
      break;
    case 'email.clicked':
      await sql`UPDATE email_outbox SET clicked_at = ${now} WHERE resend_id = ${resendId}`;
      break;
    case 'email.opened':
      await sql`UPDATE email_outbox SET opened_at = ${now} WHERE resend_id = ${resendId}`;
      break;
    default:
      console.log(`Unhandled Resend event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}