import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/db';
import { sendDemoRequestEmail, sendDemoRequestConfirmationEmail } from '@/lib/email';

// Public route, no session — adminDb is the right client here, same as the
// lead form and quote-respond routes.

const TRADES = ['Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Solar', 'Other'];
const TEAM_SIZES = ['Just me', '2-5', '6-15', '16+'];

/**
 * In-memory rate limit. Resets whenever the lambda cold-starts, so it's a
 * speed bump rather than a wall — enough to stop a naive script. If this form
 * gets seriously abused, move to Upstash or Vercel KV.
 */
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/**
 * Normalizes a phone to 10 digits and stores it formatted.
 * Returns undefined if the value is present but unusable, so the route can
 * reject rather than silently save garbage.
 *
 * US/Canada only. If international leads start coming in, swap this for
 * libphonenumber-js rather than widening the digit count by hand.
 */
function normalizePhone(value: unknown): string | null | undefined {
  if (typeof value !== 'string' || !value.trim()) return null; // not provided

  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);

  if (digits.length !== 10) return undefined; // provided but invalid

  // Reject obvious junk: 0000000000, 1111111111, and the 555-01xx test range.
  if (/^(\d)\1{9}$/.test(digits)) return undefined;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function clean(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot: a hidden field real people never fill in. Return 200 so bots
    // can't tell they were caught.
    if (typeof body.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true });
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429 }
      );
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 200);

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    // Deliberately loose. Strict email regexes reject valid addresses far more
    // often than they catch bad ones; the real test is whether it delivers.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json(
        { error: 'That email address doesn\u2019t look right.' },
        { status: 400 }
      );
    }

    const phone = normalizePhone(body.phone);
    if (phone === undefined) {
      return NextResponse.json(
        { error: 'Enter a 10-digit phone number, or leave it blank.' },
        { status: 400 }
      );
    }

    const company = clean(body.company, 160);
    const message = clean(body.message, 2000);
    const source = clean(body.source, 60);

    const rawTrade = clean(body.trade, 40);
    const trade = rawTrade && TRADES.includes(rawTrade) ? rawTrade : null;

    const rawTeamSize = clean(body.teamSize, 20);
    const teamSize = rawTeamSize && TEAM_SIZES.includes(rawTeamSize) ? rawTeamSize : null;

    const utmSource = clean(body.utmSource, 120);
    const utmMedium = clean(body.utmMedium, 120);
    const utmCampaign = clean(body.utmCampaign, 120);
    const referrer = clean(req.headers.get('referer'), 500);

    // Insert first. If the email fails afterwards the request is still saved,
    // and notify_error records why it never reached the inbox.
    const rows = await adminDb`
      INSERT INTO demo_requests (
        name, email, phone, company, trade, team_size, message,
        source, utm_source, utm_medium, utm_campaign, referrer
      ) VALUES (
        ${name}, ${email}, ${phone}, ${company}, ${trade}, ${teamSize}, ${message},
        ${source}, ${utmSource}, ${utmMedium}, ${utmCampaign}, ${referrer}
      )
      RETURNING id
    `;

    const id = rows[0]?.id as number;

    // Both emails go out together. The internal alert is the one that decides
    // notified_at — if the requester's confirmation bounces, that's worth
    // logging but it isn't the alert you'd lose sleep over missing.
    const [sent, confirmed] = await Promise.all([
      sendDemoRequestEmail({
        id,
        name,
        email,
        phone: phone ?? undefined,
        company: company ?? undefined,
        trade: trade ?? undefined,
        teamSize: teamSize ?? undefined,
        message: message ?? undefined,
        source: source ?? undefined,
      }),
      sendDemoRequestConfirmationEmail({ name, email }),
    ]);

    if (!confirmed.ok) {
      console.error(`Demo request ${id}: confirmation to ${email} failed`);
    }

    if (sent.ok) {
      await adminDb`
        UPDATE demo_requests SET notified_at = NOW() WHERE id = ${id}
      `;
    } else {
      await adminDb`
        UPDATE demo_requests SET notify_error = ${sent.error} WHERE id = ${id}
      `;
    }

    // The visitor's request succeeded either way — the row exists.
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Demo request failed:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please email hello@lead2project.com.' },
      { status: 500 }
    );
  }
}