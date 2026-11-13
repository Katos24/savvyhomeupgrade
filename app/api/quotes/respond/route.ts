import { adminDb as sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteAcceptedNotification } from '@/lib/email';
import { autoAdvanceStatus, logAutoMove } from '@/lib/statusAutomation';
import { sendCollectionInvoice } from '@/lib/sendCollectionInvoice';
import { getDepositAmount } from '@/lib/billing';

// Accept / Decline links in the quote email only SHOW the quote (GET).
// The answer is recorded when the customer taps a button on that page (POST).
// Email security scanners open every link in an email to check it; when the
// GET itself accepted the quote, a scanner could accept or decline a quote
// before the customer ever read it.

type Action = 'accept' | 'decline';

const html = (body: string) => new NextResponse(body, { headers: { 'Content-Type': 'text/html' } });

async function loadProject(token: string) {
  const projects = await sql`
    SELECT
      p.id,
      p.quote_token,
      p.quote_total,
      p.quote_tax_rate,
      p.quote_data,
      p.quote_accepted_at,
      p.quote_declined_at,
      p.deposit_type,
      p.deposit_value,
      p.deposit_due_date,
      p.customer_name,
      p.customer_email,
      l.id as lead_id,
      l.company_id,
      c.name as company_name,
      c.email as company_email,
      c.phone as company_phone,
      c.slug as company_slug,
      c.logo_url as company_logo,
      c.website as company_website,
      c.email_brand_color_1 as brand_color_1,
      c.on_accept_collect
    FROM projects p
    JOIN leads l ON p.lead_id = l.id
    JOIN companies c ON l.company_id = c.id
    WHERE p.quote_token = ${token}
    LIMIT 1
  `;
  return projects[0] ?? null;
}

// What the customer owes to get started, from the same billing math as everywhere else.
function depositFor(project: any): { amount: number; label?: string } | undefined {
  const total = parseFloat(project.quote_total || '0');
  const amount = getDepositAmount({ total, depositType: project.deposit_type, depositValue: project.deposit_value });
  if (!amount || amount <= 0 || amount >= total) return undefined;
  const pct = parseFloat(project.deposit_value || '0');
  return { amount, label: project.deposit_type === 'percent' && pct > 0 ? `${pct}%` : undefined };
}

function invalidLinkPage() {
  return html(renderPage({
    title: 'Invalid Link',
    message: 'This link is invalid or missing required information.',
    state: 'neutral',
  }));
}

function notFoundPage() {
  return html(renderPage({
    title: 'Link No Longer Active',
    message: 'This quote link has already been used or has expired. If you have questions, please contact the company directly.',
    state: 'neutral',
  }));
}

// Shared by GET and POST: a quote that was already answered shows that answer.
function alreadyAnsweredPage(project: any) {
  const brandColor = project.brand_color_1;
  if (project.quote_accepted_at) {
    return html(renderPage({
      title: 'Already Accepted',
      message: `You already accepted this quote on ${new Date(project.quote_accepted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. ${project.company_name} will be in touch to schedule your appointment.`,
      state: 'success',
      companyName: project.company_name,
      companyPhone: project.company_phone,
      companyLogo: project.company_logo,
      brandColor,
      quoteTotal: parseFloat(project.quote_total),
      taxRate: project.quote_tax_rate ? parseFloat(project.quote_tax_rate) : undefined,
      quoteItems: project.quote_data || [],
      customerName: project.customer_name,
    }));
  }
  return html(renderPage({
    title: 'Already Declined',
    message: `You already declined this quote. If you changed your mind, please contact ${project.company_name} directly.`,
    state: 'neutral',
    companyName: project.company_name,
    companyPhone: project.company_phone,
    companyLogo: project.company_logo,
    brandColor,
  }));
}

// GET: show the quote with Accept / Decline buttons. Changes nothing.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action || !['accept', 'decline'].includes(action)) return invalidLinkPage();

  try {
    const project = await loadProject(token);
    if (!project) return notFoundPage();
    if (project.quote_accepted_at || project.quote_declined_at) return alreadyAnsweredPage(project);

    const wantsDecline = action === 'decline';
    return html(renderPage({
      title: wantsDecline ? 'Decline this quote?' : 'Review your quote',
      message: wantsDecline
        ? `Hi ${project.customer_name}, tap Decline below to let ${project.company_name} know you're passing on this quote.`
        : `Hi ${project.customer_name}, here's your quote from ${project.company_name}. Tap Accept quote below to say yes.`,
      state: 'neutral',
      companyName: project.company_name,
      companyPhone: project.company_phone,
      companyWebsite: project.company_website,
      companyLogo: project.company_logo,
      brandColor: project.brand_color_1,
      quoteTotal: parseFloat(project.quote_total),
      taxRate: project.quote_tax_rate ? parseFloat(project.quote_tax_rate) : undefined,
      quoteItems: project.quote_data || [],
      customerName: project.customer_name,
      deposit: depositFor(project),
      confirm: { token, primary: wantsDecline ? 'decline' : 'accept' },
    }));
  } catch (error) {
    console.error('Quote respond (view) error:', error);
    return html(renderPage({
      title: 'Something Went Wrong',
      message: 'Please try again or contact the company directly.',
      state: 'neutral',
    }));
  }
}

// POST: the customer tapped Accept or Decline on the page. Records the answer once.
export async function POST(request: NextRequest) {
  let token: string | null = null;
  let action: string | null = null;
  try {
    const form = await request.formData();
    token = String(form.get('token') || '') || null;
    action = String(form.get('action') || '') || null;
  } catch {
    return invalidLinkPage();
  }

  if (!token || !action || !['accept', 'decline'].includes(action)) return invalidLinkPage();

  try {
    const project = await loadProject(token);
    if (!project) return notFoundPage();
    if (project.quote_accepted_at || project.quote_declined_at) return alreadyAnsweredPage(project);

    const brandColor = project.brand_color_1;

    if ((action as Action) === 'accept') {
      // Only the first tap wins: a double-tap or a second tab can't accept twice.
      const updated = await sql`
        UPDATE projects
        SET
          quote_accepted_at = NOW(),
          quote_token = NULL,
          updated_at = NOW()
        WHERE id = ${project.id}
          AND quote_accepted_at IS NULL
          AND quote_declined_at IS NULL
        RETURNING id
      `;
      if (updated.length === 0) {
        return alreadyAnsweredPage({ ...project, quote_accepted_at: project.quote_accepted_at || new Date().toISOString() });
      }

      // Before the email, so a mail failure can't skip the status move. This
      // fires the same whether the customer clicked Accept here or a
      // contractor marked it accepted from the dashboard — the trigger is
      // quote_accepted_at being set, not who set it.
      const movedTo = await autoAdvanceStatus(sql, project.lead_id, 'quote_accepted');
      if (movedTo) {
        await logAutoMove(sql, project.lead_id, `Moved to ${movedTo} automatically — customer accepted the quote`);
      }

      try {
        await sendQuoteAcceptedNotification({
          companyEmail: project.company_email,
          companyName: project.company_name,
          companySlug: project.company_slug,
          customerName: project.customer_name,
          customerEmail: project.customer_email,
          quoteTotal: parseFloat(project.quote_total),
          projectId: project.id,
        });
      } catch (err) {
        console.error('Failed to send acceptance notification:', err);
      }

      // Company setting: ask for the deposit (or full payment) right away.
      // Emails the invoice like the Send button does, and shows a Pay button here.
      let payment: { url?: string; amount: number; kind: 'deposit' | 'balance' | 'full' } | undefined;
      const mode = project.on_accept_collect || 'none';
      if (mode === 'deposit' || mode === 'full') {
        try {
          // Keep the due date picked when the quote was sent. Without passing
          // it, sendCollectionInvoice would overwrite it with null. If that
          // date already passed by the time they accept, it's due today
          // instead, so the request doesn't go out already overdue.
          let dueDate: string | undefined;
          if (project.deposit_due_date) {
            const picked = String(
              project.deposit_due_date instanceof Date
                ? project.deposit_due_date.toISOString()
                : project.deposit_due_date
            ).slice(0, 10);
            const todayET = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); // YYYY-MM-DD
            dueDate = picked < todayET ? todayET : picked;
          }

          const sent = await sendCollectionInvoice({
            leadId: project.lead_id,
            collect: mode === 'full' ? 'full' : undefined,
            onlyIfKind: mode === 'deposit' ? 'deposit' : undefined,
            skipIfAlreadySent: true,
            dueDate,
            sentBy: { name: 'Automatic (quote accepted)', email: '' },
          });
          if (sent.ok) payment = { url: sent.paymentLinkUrl, amount: sent.amount, kind: sent.kind };
          else if (!sent.skipped) console.error('Auto invoice on accept failed:', sent.error);
        } catch (autoErr) {
          console.error('Auto invoice on accept failed (non-blocking):', autoErr);
        }
      }

      return html(renderPage({
        title: 'Quote Accepted',
        message: payment
          ? `Thanks ${project.customer_name}! We've also emailed you the invoice.`
          : `Thanks ${project.customer_name}! ${project.company_name} will be reaching out shortly to schedule your appointment.`,
        state: 'success',
        companyName: project.company_name,
        companyPhone: project.company_phone,
        companyWebsite: project.company_website,
        companyLogo: project.company_logo,
        brandColor,
        quoteTotal: parseFloat(project.quote_total),
        taxRate: project.quote_tax_rate ? parseFloat(project.quote_tax_rate) : undefined,
        quoteItems: project.quote_data || [],
        customerName: project.customer_name,
        payment,
      }));
    }

    // Decline — same one-time guard.
    const updated = await sql`
      UPDATE projects
      SET
        quote_declined_at = NOW(),
        updated_at = NOW()
      WHERE id = ${project.id}
        AND quote_accepted_at IS NULL
        AND quote_declined_at IS NULL
      RETURNING id
    `;
    if (updated.length === 0) return alreadyAnsweredPage(project);

    return html(renderPage({
      title: 'Quote Declined',
      message: `Thanks for letting us know, ${project.customer_name}. If you change your mind or have questions, please contact ${project.company_name} directly.`,
      state: 'neutral',
      companyName: project.company_name,
      companyPhone: project.company_phone,
      companyWebsite: project.company_website,
      companyLogo: project.company_logo,
      brandColor,
    }));
  } catch (error) {
    console.error('Quote respond error:', error);
    return html(renderPage({
      title: 'Something Went Wrong',
      message: 'Please try again or contact the company directly.',
      state: 'neutral',
    }));
  }
}

// Text from the database (names, line items, company details) goes into HTML,
// so escape it. Without this a line item containing "<" would render as markup.
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Only allow http(s) links for the company website / logo.
function safeUrl(v: unknown): string {
  const s = String(v ?? '').trim();
  return /^https?:\/\//i.test(s) ? esc(s) : '';
}

// ─────────────────────────────────────────────────────────────
// renderPage — the page a customer sees after tapping Accept / Decline
//
// Design matches the customer emails (slate on white). The contractor's
// brand color is used for ONE thing: the main button (plus a thin top
// bar and the logo placeholder). No color set → dark slate, never purple.
// Button text flips between white and dark automatically, so a light
// brand color (yellow, white) still has readable text.
// ─────────────────────────────────────────────────────────────

const INK = '#0f172a';
const TEXT = '#334155';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const SOFT = '#f8fafc';

/** A safe accent from the contractor's brand color, plus readable text on it. */
function accentFrom(raw?: string | null): { bg: string; fg: string; edge: string } {
  const m = typeof raw === 'string' ? raw.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) : null;
  if (!m) return { bg: INK, fg: '#ffffff', edge: INK };
  let hex = m[1];
  if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  // WCAG relative luminance
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const bg = `#${hex.toLowerCase()}`;
  // Pick whichever text color has more contrast against the background.
  const contrastWhite = 1.05 / (L + 0.05);
  const contrastInk = (L + 0.05) / 0.0317; // INK luminance ≈ 0.0117
  const fg = contrastWhite >= contrastInk ? '#ffffff' : INK;
  // Very light colors get a visible edge so the button doesn't vanish on white.
  const edge = L > 0.8 ? '#cbd5e1' : bg;
  return { bg, fg, edge };
}

function renderPage({
  title,
  message,
  state,
  companyName,
  companyPhone,
  companyWebsite,
  companyLogo,
  brandColor,
  quoteTotal,
  taxRate,
  quoteItems = [],
  customerName,
  confirm,
  payment,
  deposit,
}: {
  title: string;
  message: string;
  state: 'success' | 'neutral';
  companyName?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogo?: string;
  brandColor?: string | null;
  quoteTotal?: number;
  taxRate?: number;
  quoteItems?: any[];
  customerName?: string;
  /** Show Accept / Decline buttons that POST back here. */
  confirm?: { token: string; primary: Action };
  /** After accepting: the deposit / full payment just invoiced, with its pay link. */
  payment?: { url?: string; amount: number; kind: 'deposit' | 'balance' | 'full' };
  /** Deposit due on accepting, shown under the total on the review page. */
  deposit?: { amount: number; label?: string };
}) {
  const isSuccess = state === 'success';
  const accent = accentFrom(brandColor);
  const logoSrc = safeUrl(companyLogo);
  const websiteHref = safeUrl(companyWebsite);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  // ── Header: logo (or initial) + company name ──
  const brandHtml = companyName
    ? `
      <div class="brand">
        ${logoSrc
          ? `<img src="${logoSrc}" alt="${esc(companyName)}" class="logo" />`
          : `<div class="initial" style="background:${accent.bg};color:${accent.fg};">${esc(companyName.charAt(0).toUpperCase())}</div>`}
        <p class="brand-name">${esc(companyName)}</p>
      </div>`
    : '';

  const iconHtml = isSuccess
    ? `<div class="icon" style="background:#f0fdf4;"><svg width="26" height="26" viewBox="0 0 28 28" fill="none"><path d="M6 14l6 6 10-12" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    : '';

  // ── Line items: two columns, qty × price under the description ──
  const hasTax = !!taxRate && taxRate > 0;
  const itemsSubtotal = quoteItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const taxAmount = hasTax ? itemsSubtotal * (taxRate! / 100) : 0;

  const itemRows = quoteItems.map((item: any) => {
    const qty = item.quantity ?? 1;
    const detail = qty !== 1 && item.unitPrice
      ? `<div class="detail">${esc(qty)} × ${fmt(Number(item.unitPrice) || 0)}</div>`
      : '';
    return `<tr><td>${esc(item.description)}${detail}</td><td class="amt">${fmt(item.amount || 0)}</td></tr>`;
  }).join('');

  const totalsRows = `
    ${hasTax ? `
      <tr class="sub"><td>Subtotal</td><td class="amt">${fmt(itemsSubtotal)}</td></tr>
      <tr class="sub"><td>Tax (${esc(taxRate)}%)</td><td class="amt">${fmt(taxAmount)}</td></tr>` : ''}
    ${quoteTotal ? `<tr class="total"><td>Total</td><td class="amt">${fmt(quoteTotal)}</td></tr>` : ''}
    ${deposit && quoteTotal ? `
      <tr class="dep"><td>Deposit to get started${deposit.label ? ` (${esc(deposit.label)})` : ''}</td><td class="amt">${fmt(deposit.amount)}</td></tr>
      <tr class="sub"><td>Balance when the job is done</td><td class="amt">${fmt(quoteTotal - deposit.amount)}</td></tr>` : ''}
  `;

  const quoteHtml = quoteItems.length > 0
    ? `
      <p class="label">Quote</p>
      <table class="items" role="presentation">${itemRows}${totalsRows}</table>`
    : quoteTotal
    ? `
      <p class="label">Quote</p>
      <table class="items" role="presentation">${totalsRows}</table>`
    : '';

  // ── After accepting: what's due now, with the pay button ──
  const payLabel = payment?.kind === 'deposit' ? 'Pay your deposit' : 'Pay your invoice';
  const paymentHtml = payment ? `
    <div class="due">
      <p class="due-label">${payment.kind === 'deposit' ? 'Deposit due to get started' : 'Amount due'}</p>
      <p class="due-amount">${fmt(payment.amount)}</p>
      ${payment.url
        ? `<a href="${safeUrl(payment.url)}" class="btn-primary">${payLabel} now</a>
           <p class="hint">Or pay later from the invoice we emailed you.</p>`
        : `<p class="hint">We&rsquo;ve emailed you the invoice with payment details.</p>`}
    </div>` : '';

  const nextStepsHtml = isSuccess && !payment ? `
    <div class="note">
      <p class="note-title">What happens next</p>
      <p>${esc(companyName || 'The team')} will contact you shortly to confirm your appointment and go over any final details.</p>
    </div>` : '';

  const confirmHtml = confirm ? `
    <form method="POST" action="/api/quotes/respond" class="actions">
      <input type="hidden" name="token" value="${esc(confirm.token)}" />
      ${confirm.primary === 'decline'
        ? `<button type="submit" name="action" value="decline" class="btn-dark">Decline quote</button>
           <button type="submit" name="action" value="accept" class="btn-secondary">Accept instead</button>`
        : `<button type="submit" name="action" value="accept" class="btn-primary">Accept quote</button>
           <button type="submit" name="action" value="decline" class="btn-link">Decline</button>`}
    </form>` : '';

  const phoneDigits = String(companyPhone || '').replace(/\D/g, '');
  const contactHtml = (companyPhone || websiteHref) ? `
    <div class="contact">
      <p class="label" style="text-align:center;">Questions?</p>
      ${companyPhone ? `<a href="tel:${esc(phoneDigits)}" class="btn-secondary">Call ${esc(companyPhone)}</a>` : ''}
      ${websiteHref ? `<p class="site"><a href="${websiteHref}">${esc(String(companyWebsite).replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></p>` : ''}
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>${esc(title)}${companyName ? ` — ${esc(companyName)}` : ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f1f5f9; color: ${TEXT};
      min-height: 100vh; display: flex; flex-direction: column; align-items: center;
      padding: 32px 16px; -webkit-font-smoothing: antialiased;
    }
    .card { width: 100%; max-width: 480px; background: #fff; border: 1px solid ${BORDER}; border-radius: 16px; overflow: hidden; }
    .bar { height: 4px; background: ${accent.bg}; }
    .inner { padding: 28px 24px 24px; }
    .brand { text-align: center; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
    .logo { max-height: 48px; max-width: 180px; width: auto; display: block; margin: 0 auto 10px; object-fit: contain; }
    .initial { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; margin: 0 auto 10px; }
    .brand-name { font-size: 15px; font-weight: 600; color: ${INK}; }
    .icon { width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
    h1 { color: ${INK}; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.3; text-align: center; margin-bottom: 8px; }
    .message { color: ${MUTED}; font-size: 15px; line-height: 1.6; text-align: center; }
    .label { margin: 24px 0 10px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${MUTED}; }
    .items { width: 100%; border: 1px solid ${BORDER}; border-radius: 12px; border-collapse: separate; border-spacing: 0; overflow: hidden; font-size: 14px; }
    .items td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: ${INK}; vertical-align: top; line-height: 1.45; }
    .items tr:last-child td { border-bottom: none; }
    .items .amt { text-align: right; white-space: nowrap; font-weight: 500; }
    .items .detail { margin-top: 2px; color: ${MUTED}; font-size: 13px; }
    .items .sub td { background: ${SOFT}; color: ${MUTED}; padding-top: 8px; padding-bottom: 8px; border-bottom: none; }
    .items .total td { background: ${SOFT}; border-top: 1px solid ${BORDER}; font-size: 16px; font-weight: 700; color: ${INK}; }
    .items .dep td { background: ${SOFT}; border-top: 1px solid ${BORDER}; font-weight: 600; color: ${INK}; }
    .due { margin-top: 24px; padding: 22px 18px; border-radius: 12px; background: ${SOFT}; border: 1px solid ${BORDER}; text-align: center; }
    .due-label { font-size: 13px; font-weight: 600; color: ${MUTED}; margin-bottom: 4px; }
    .due-amount { font-size: 32px; font-weight: 700; letter-spacing: -0.02em; color: ${INK}; margin-bottom: 16px; }
    .hint { margin-top: 10px; font-size: 13px; color: ${MUTED}; }
    .actions { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
    .btn-primary, .btn-dark, .btn-secondary {
      display: block; width: 100%; padding: 14px 16px; border-radius: 12px; font-size: 16px; font-weight: 600;
      text-align: center; text-decoration: none; cursor: pointer; font-family: inherit;
    }
    .btn-primary { background: ${accent.bg}; color: ${accent.fg}; border: 1px solid ${accent.edge}; }
    .btn-dark { background: ${INK}; color: #fff; border: 1px solid ${INK}; }
    .btn-secondary { background: #fff; color: ${INK}; border: 1px solid #cbd5e1; font-size: 15px; }
    .btn-link { background: none; border: none; color: ${MUTED}; font-size: 14px; text-decoration: underline; cursor: pointer; padding: 6px; font-family: inherit; }
    .note { margin-top: 24px; padding: 14px 16px; border-radius: 12px; background: ${SOFT}; border: 1px solid ${BORDER}; font-size: 14px; line-height: 1.6; }
    .note-title { font-weight: 600; color: ${INK}; margin-bottom: 2px; }
    .contact { margin-top: 24px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
    .contact .label { margin-top: 0; }
    .site { margin-top: 10px; text-align: center; font-size: 13px; }
    .site a { color: ${TEXT}; }
    .powered { margin-top: 24px; font-size: 11px; color: #94a3b8; text-decoration: none; font-weight: 500; }
    @media (max-width: 480px) { .inner { padding: 24px 18px 20px; } h1 { font-size: 20px; } }
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <div class="inner">
      ${brandHtml}
      ${iconHtml}
      <h1>${esc(title)}</h1>
      <p class="message">${esc(message)}</p>
      ${paymentHtml}
      ${quoteHtml}
      ${confirmHtml}
      ${nextStepsHtml}
      ${contactHtml}
    </div>
  </div>
  <a href="https://lead2project.com" class="powered">Powered by Lead2Project</a>
</body>
</html>`;
}