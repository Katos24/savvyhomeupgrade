import { adminDb as sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteAcceptedNotification } from '@/lib/email';
import { autoAdvanceStatus, logAutoMove } from '@/lib/statusAutomation';

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
      c.email_brand_color_2 as brand_color_2
    FROM projects p
    JOIN leads l ON p.lead_id = l.id
    JOIN companies c ON l.company_id = c.id
    WHERE p.quote_token = ${token}
    LIMIT 1
  `;
  return projects[0] ?? null;
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
  const brandColor = project.brand_color_1 || '#6366f1';
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
      brandColor: project.brand_color_1 || '#6366f1',
      quoteTotal: parseFloat(project.quote_total),
      taxRate: project.quote_tax_rate ? parseFloat(project.quote_tax_rate) : undefined,
      quoteItems: project.quote_data || [],
      customerName: project.customer_name,
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

    const brandColor = project.brand_color_1 || '#6366f1';

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

      return html(renderPage({
        title: 'Quote Accepted',
        message: `Thanks ${project.customer_name}! ${project.company_name} will be reaching out shortly to schedule your appointment.`,
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
// renderPage — branded quote response page
// ─────────────────────────────────────────────────────────────
function renderPage({
  title,
  message,
  state,
  companyName,
  companyPhone,
  companyWebsite,
  companyLogo,
  brandColor = '#6366f1',
  quoteTotal,
  taxRate,
  quoteItems = [],
  customerName,
  confirm,
}: {
  title: string;
  message: string;
  state: 'success' | 'neutral';
  companyName?: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyLogo?: string;
  brandColor?: string;
  quoteTotal?: number;
  taxRate?: number;
  quoteItems?: any[];
  customerName?: string;
  /** Show Accept / Decline buttons that POST back here. */
  confirm?: { token: string; primary: Action };
}) {
  const isSuccess = state === 'success';
  // Brand color goes into inline styles; only allow a plain hex color.
  brandColor = /^#[0-9a-fA-F]{3,8}$/.test(brandColor) ? brandColor : '#6366f1';
  const logoSrc = safeUrl(companyLogo);
  const websiteHref = safeUrl(companyWebsite);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const logoHtml = logoSrc
    ? `<img src="${logoSrc}" alt="${esc(companyName)}" style="height:48px;width:auto;object-fit:contain;margin-bottom:16px;" />`
    : companyName
    ? `<div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:${brandColor};color:#fff;font-size:20px;font-weight:900;margin-bottom:16px;">${esc(companyName.charAt(0).toUpperCase())}</div>`
    : '';

  const hasTax = !!taxRate && taxRate > 0;
  const itemsSubtotal = quoteItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const taxAmount = hasTax ? itemsSubtotal * (taxRate! / 100) : 0;

  const taxRowsHtml = hasTax ? `
          <tr style="background:#fff;border-top:1px solid #f1f5f9;">
            <td colspan="2" style="padding:8px 14px;text-align:right;color:#64748b;font-size:12px;">Subtotal</td>
            <td style="padding:8px 14px;text-align:right;color:#64748b;font-size:12px;">${fmt(itemsSubtotal)}</td>
          </tr>
          <tr style="background:#fff;">
            <td colspan="2" style="padding:8px 14px;text-align:right;color:#64748b;font-size:12px;">Tax (${esc(taxRate)}%)</td>
            <td style="padding:8px 14px;text-align:right;color:#64748b;font-size:12px;">${fmt(taxAmount)}</td>
          </tr>
  ` : '';

  const lineItemsHtml = quoteItems.length > 0 ? `
    <div style="margin-top:28px;">
      <p style="margin:0 0 10px 0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:#94a3b8;">Quote Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-size:14px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;">Description</th>
            <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;width:50px;">Qty</th>
            <th style="padding:10px 14px;text-align:right;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e2e8f0;width:90px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${quoteItems.map((item: any, i: number) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'};border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px 14px;color:#334155;font-size:14px;">${esc(item.description)}</td>
              <td style="padding:12px 14px;text-align:center;color:#64748b;font-size:14px;">${esc(item.quantity ?? 1)}</td>
              <td style="padding:12px 14px;text-align:right;color:#334155;font-weight:600;font-size:14px;">${fmt(item.amount || 0)}</td>
            </tr>
          `).join('')}
          ${taxRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
            <td colspan="2" style="padding:14px;text-align:right;color:#475569;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Total</td>
            <td style="padding:14px;text-align:right;color:${brandColor};font-weight:800;font-size:20px;">${quoteTotal ? fmt(quoteTotal) : ''}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  ` : quoteTotal ? `
    <div style="margin-top:20px;padding:16px 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
      ${hasTax ? `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:12px;color:#94a3b8;">Subtotal</span>
          <span style="font-size:12px;color:#94a3b8;">${fmt(itemsSubtotal)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <span style="font-size:12px;color:#94a3b8;">Tax (${esc(taxRate)}%)</span>
          <span style="font-size:12px;color:#94a3b8;">${fmt(taxAmount)}</span>
        </div>
        <div style="border-top:1px solid #e2e8f0;padding-top:10px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Total</span>
          <span style="font-size:22px;font-weight:800;color:${brandColor};">${fmt(quoteTotal)}</span>
        </div>
      ` : `
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Quote Total</span>
          <span style="font-size:22px;font-weight:800;color:${brandColor};">${fmt(quoteTotal)}</span>
        </div>
      `}
    </div>
  ` : '';

  const nextStepsHtml = isSuccess ? `
    <div style="margin-top:24px;padding:16px 20px;background:${brandColor}08;border:1px solid ${brandColor}20;border-radius:10px;">
      <p style="margin:0 0 4px 0;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;color:${brandColor};">What happens next?</p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${esc(companyName || 'The team')} will contact you shortly to confirm your appointment and go over any final details.</p>
    </div>
  ` : '';

  const contactHtml = (companyPhone || websiteHref) ? `
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0 0 8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contact</p>
      ${companyPhone ? `<p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#334155;"><a href="tel:${esc(companyPhone)}" style="color:${brandColor};text-decoration:none;">${esc(companyPhone)}</a></p>` : ''}
      ${websiteHref ? `<p style="margin:0;font-size:13px;"><a href="${websiteHref}" style="color:${brandColor};text-decoration:none;">${websiteHref}</a></p>` : ''}
    </div>
  ` : '';

  const iconHtml = isSuccess
    ? `<div style="width:56px;height:56px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l6 6 10-12" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </div>`
    : `<div style="width:56px;height:56px;border-radius:50%;background:#f8fafc;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8v8M14 20h.01" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/></svg>
       </div>`;

  const btnPrimary = `display:block;width:100%;padding:14px 16px;border:none;border-radius:12px;background:${brandColor};color:#fff;font-size:16px;font-weight:700;cursor:pointer;`;
  const btnSecondary = 'display:block;width:100%;padding:13px 16px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;color:#334155;font-size:15px;font-weight:600;cursor:pointer;';
  const confirmHtml = confirm ? `
    <form method="POST" action="/api/quotes/respond" style="margin-top:24px;display:flex;flex-direction:column;gap:10px;">
      <input type="hidden" name="token" value="${esc(confirm.token)}" />
      ${confirm.primary === 'decline'
        ? `<button type="submit" name="action" value="decline" style="${btnPrimary}">Decline quote</button>
           <button type="submit" name="action" value="accept" style="${btnSecondary}">Accept instead</button>`
        : `<button type="submit" name="action" value="accept" style="${btnPrimary}">Accept quote</button>
           <button type="submit" name="action" value="decline" style="${btnSecondary}">Decline</button>`}
    </form>
  ` : '';

  const poweredByHtml = `
    <div style="text-align:center;margin-top:32px;">
      <a href="https://lead2project.com" style="font-size:11px;color:#cbd5e1;text-decoration:none;font-weight:600;letter-spacing:0.05em;">
        Powered by Lead2Project
      </a>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}${companyName ? ` — ${esc(companyName)}` : ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 32px rgba(0,0,0,0.08);
      padding: 40px 36px;
      max-width: 480px;
      width: 100%;
    }
    .header { text-align: center; margin-bottom: 24px; }
    h1 { color: #0f172a; font-size: 22px; font-weight: 800; margin-bottom: 8px; }
    .message { color: #64748b; font-size: 15px; line-height: 1.7; text-align: center; }
    @media (max-width: 480px) {
      .card { padding: 28px 20px; }
      h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${logoHtml}
      ${iconHtml}
      <h1>${esc(title)}</h1>
      <p class="message">${esc(message)}</p>
    </div>
    ${lineItemsHtml}
    ${confirmHtml}
    ${nextStepsHtml}
    ${contactHtml}
  </div>
  ${poweredByHtml}
</body>
</html>`;
}