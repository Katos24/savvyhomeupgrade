/**
 * emailBase.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all Lead2Project HTML emails.
 *
 * Design: neutral slate on white, no brand colors. Every email looks
 * the same no matter what colors a contractor picked, so dark or
 * clashing brand colors can never make an email unreadable. The
 * contractor's logo + name are still the header, so customer emails
 * clearly come from them.
 *
 * brandColor / brandColor2 are still accepted so existing callers
 * compile, but they are ignored.
 *
 * Usage:
 *   const html = buildEmail({
 *     companyName: 'Arctic Air HVAC',
 *     logoUrl: company.logo_url,
 *     bodyHtml: '...your content...',
 *     ctaText: 'View in Dashboard',
 *     ctaUrl: dashboardUrl,
 *     phone: company.phone,
 *     website: company.website,
 *   });
 * ─────────────────────────────────────────────────────────────
 */

export type BuildEmailOptions = {
  // Required
  companyName: string;
  bodyHtml: string;

  // Branding
  logoUrl?: string | null;
  /** @deprecated ignored — emails no longer use brand colors */
  brandColor?: string | null;
  /** @deprecated ignored — emails no longer use brand colors */
  brandColor2?: string | null;

  // Primary CTA button (e.g. "View in Dashboard")
  ctaText?: string | null;
  ctaUrl?: string | null;

  // Secondary call button — renders a phone CTA below the body
  phone?: string | null;

  // Footer extras
  website?: string | null;

  /**
   * Footer line explaining why they got this email. Defaults to the
   * customer-facing line. Pass something else for emails that go to
   * the contractor (e.g. "You're getting this because you have a
   * Lead2Project account.").
   */
  footerNote?: string | null;

  // Optional plain-text preheader (shows in email client preview)
  preheader?: string | null;
};

// ── Design tokens ──────────────────────────────────────────────
// One place to change the look of every email.

export const EMAIL = {
  bg: '#f1f5f9',        // page background (slate-100)
  card: '#ffffff',
  border: '#e2e8f0',    // slate-200
  divider: '#f1f5f9',   // slate-100
  ink: '#0f172a',       // headings, buttons (slate-900)
  text: '#334155',      // body text (slate-700)
  muted: '#64748b',     // labels (slate-500)
  faint: '#94a3b8',     // footer (slate-400)
  soft: '#f8fafc',      // tinted panels (slate-50)
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

// Status tones — same meaning as the app: green = money/paid,
// amber = waiting, red = overdue/problem, slate = neutral info.
const TONES = {
  info:    { bg: '#f8fafc', border: '#e2e8f0', text: '#334155' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  danger:  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
} as const;
export type EmailTone = keyof typeof TONES;

// ── Helpers ────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/**
 * buildButton
 * Table-based "bulletproof" button so it renders in Outlook too
 * (gradients and padding on <a> alone break there).
 *
 * variant 'primary' = solid dark, 'secondary' = white with border.
 */
export function buildButton(
  text: string,
  url: string,
  variant: 'primary' | 'secondary' = 'primary'
): string {
  const primary = variant === 'primary';
  const bg = primary ? EMAIL.ink : '#ffffff';
  const color = primary ? '#ffffff' : EMAIL.ink;
  const border = primary ? EMAIL.ink : '#cbd5e1';
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto;">
      <tr>
        <td align="center" bgcolor="${bg}" style="border-radius: 10px; background-color: ${bg}; border: 1px solid ${border};">
          <a href="${url}" target="_blank"
            style="display: inline-block; padding: 14px 32px; font-family: ${EMAIL.font}; font-size: 15px; font-weight: 600; line-height: 1; color: ${color}; text-decoration: none; border-radius: 10px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * buildHeading
 * Big title + optional one-line subtitle at the top of the body.
 *
 * buildHeading('Your quote is ready', 'Roof repair · 12 Elm St')
 */
export function buildHeading(title: string, subtitle?: string | null): string {
  return `
    <h1 style="margin: 0 0 ${subtitle ? '8px' : '24px'} 0; font-family: ${EMAIL.font}; font-size: 24px; line-height: 1.3; font-weight: 700; letter-spacing: -0.02em; color: ${EMAIL.ink};">
      ${title}
    </h1>
    ${subtitle ? `<p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: ${EMAIL.muted};">${subtitle}</p>` : ''}
  `;
}

/**
 * buildParagraph
 * Standard body text.
 */
export function buildParagraph(html: string): string {
  return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: ${EMAIL.text};">${html}</p>`;
}

/**
 * buildNotice
 * A soft colored box for status messages.
 *
 * buildNotice('Deposit received. Thank you!', 'success')
 */
export function buildNotice(html: string, tone: EmailTone = 'info'): string {
  const t = TONES[tone];
  return `
    <div style="margin: 0 0 24px 0; padding: 14px 16px; border-radius: 10px; background-color: ${t.bg}; border: 1px solid ${t.border}; color: ${t.text}; font-size: 14px; line-height: 1.55; font-weight: 500;">
      ${html}
    </div>
  `;
}

/**
 * buildAmount
 * Big centered money figure, e.g. amount due or amount paid.
 *
 * buildAmount('Amount due', '$1,250.00', 'Due Nov 20')
 */
export function buildAmount(label: string, amount: string, note?: string | null): string {
  return `
    <div style="margin: 0 0 24px 0; padding: 24px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: ${EMAIL.muted};">${label}</p>
      <p style="margin: 0; font-size: 34px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: ${EMAIL.ink};">${amount}</p>
      ${note ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: ${EMAIL.muted};">${note}</p>` : ''}
    </div>
  `;
}

/**
 * buildSteps
 * Numbered list, e.g. "what happens next".
 */
export function buildSteps(steps: string[]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${steps.map((step, i) => `
        <tr>
          <td style="width: 32px; padding: 8px 0; vertical-align: top;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; color: ${EMAIL.ink}; font-size: 12px; font-weight: 600; text-align: center; line-height: 24px;">${i + 1}</div>
          </td>
          <td style="padding: 10px 0 8px 8px; color: ${EMAIL.text}; font-size: 15px; line-height: 1.5; vertical-align: top;">${step}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

/**
 * buildChecklist
 * Plain check-marked list, e.g. plan features.
 */
export function buildChecklist(items: string[]): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${items.map(item => `
        <tr>
          <td style="width: 24px; padding: 6px 0; vertical-align: top; color: #15803d; font-size: 14px; font-weight: 700;">&#10003;</td>
          <td style="padding: 6px 0; color: ${EMAIL.text}; font-size: 14px; line-height: 1.5; vertical-align: top;">${item}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

/**
 * buildLinkFallback
 * "Or copy this link" under a button, for clients that block buttons.
 */
export function buildLinkFallback(url: string): string {
  return `
    <p style="margin: 20px 0 0 0; color: ${EMAIL.muted}; font-size: 13px; line-height: 1.5; text-align: center;">
      Button not working? Copy this link:<br>
      <a href="${url}" style="color: ${EMAIL.text}; word-break: break-all;">${url}</a>
    </p>
  `;
}

/**
 * buildEmailRow
 * Renders a single label/value row for use inside a summary table.
 *
 * buildEmailRow('Service', 'Roof Repair')
 */
export function buildEmailRow(label: string, value: string): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${EMAIL.divider}; color: ${EMAIL.muted}; font-size: 14px; font-weight: 400; vertical-align: top; line-height: 1.45; white-space: nowrap;">
        ${label}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid ${EMAIL.divider}; color: ${EMAIL.ink}; font-size: 14px; font-weight: 500; vertical-align: top; text-align: right; line-height: 1.45;">
        ${value}
      </td>
    </tr>
  `;
}

/**
 * buildEmailTable
 * Wraps rows in a bordered summary card.
 */
export function buildEmailTable(rows: string[]): string {
  const filtered = rows.filter(Boolean);
  if (!filtered.length) return '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border: 1px solid ${EMAIL.border}; border-radius: 12px; overflow: hidden; border-collapse: separate; margin: 0;">
      ${filtered.join('')}
    </table>
  `;
}

/**
 * buildEmailSection
 * Renders a labeled section with an optional content block below.
 */
export function buildEmailSection(title: string, contentHtml: string): string {
  if (!contentHtml) return '';
  return `
    <div style="margin: 0 0 28px 0;">
      <p style="margin: 0 0 10px 0; color: ${EMAIL.muted}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">
        ${title}
      </p>
      ${contentHtml}
    </div>
  `;
}

/**
 * buildCustomAnswers
 * Renders the customer's answers to custom form questions.
 * The third argument used to be a brand color; it's kept so old
 * calls still compile, but it's ignored.
 */
export function buildCustomAnswers(
  customAnswers: Record<string, string> | undefined,
  customQuestions: { id: string; label: string }[] | undefined,
  _brandColor?: string
): string {
  if (!customAnswers || !customQuestions) return '';
  const entries = Object.entries(customAnswers).filter(([, v]) => v);
  if (!entries.length) return '';

  const rows = entries.map(([qId, answer], i) => {
    const question = customQuestions.find(q => q.id === qId);
    const label = question?.label || qId;
    const last = i === entries.length - 1;
    return `
      <div style="padding: 12px 16px; ${last ? '' : `border-bottom: 1px solid ${EMAIL.divider};`}">
        <p style="margin: 0 0 3px 0; color: ${EMAIL.muted}; font-size: 13px;">${label}</p>
        <p style="margin: 0; color: ${EMAIL.ink}; font-size: 14px; font-weight: 500; line-height: 1.5;">${answer}</p>
      </div>
    `;
  }).join('');

  return buildEmailSection(
    'Your Responses',
    `<div style="border: 1px solid ${EMAIL.border}; border-radius: 12px; overflow: hidden;">${rows}</div>`
  );
}

/**
 * buildAttachmentSummary
 * Returns a human-readable string like "2 photos and 1 video".
 */
export function buildAttachmentSummary(
  fileUrls?: { url: string; name: string; size: number; type?: string }[]
): string {
  if (!fileUrls?.length) return '';
  const imageCount = fileUrls.filter(f =>
    f.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic|gif)$/i.test(f.name)
  ).length;
  const videoCount = fileUrls.filter(f =>
    f.type?.startsWith('video/') || /\.(mov|mp4|avi|webm)$/i.test(f.name)
  ).length;
  const parts: string[] = [];
  if (imageCount > 0) parts.push(`${imageCount} photo${imageCount > 1 ? 's' : ''}`);
  if (videoCount > 0) parts.push(`${videoCount} video${videoCount > 1 ? 's' : ''}`);
  if (!parts.length) parts.push(`${fileUrls.length} file${fileUrls.length > 1 ? 's' : ''}`);
  return parts.join(' and ');
}

/**
 * buildEmail
 * The main wrapper. Produces a complete, responsive HTML email.
 */
export function buildEmail(options: BuildEmailOptions): string {
  const {
    companyName,
    bodyHtml,
    logoUrl,
    ctaText,
    ctaUrl,
    phone,
    website,
    footerNote,
    preheader,
  } = options;

  const rawDigits = (phone || '').replace(/\D/g, '');
  const formattedPhone = formatPhone(phone || '');
  const footerText = footerNote ?? 'You received this email because you requested a service from us.';

  // Header: logo + name on white. Works with any logo color.
  const headerHtml = logoUrl
    ? `
      <img src="${logoUrl}" alt="${companyName}" height="48"
        style="display: block; max-height: 48px; max-width: 180px; width: auto; height: auto; margin: 0 auto 12px auto; border: 0;">
      <p style="margin: 0; font-size: 15px; font-weight: 600; color: ${EMAIL.ink};">${companyName}</p>
    `
    : `
      <p style="margin: 0; font-size: 18px; font-weight: 700; letter-spacing: -0.01em; color: ${EMAIL.ink};">${companyName}</p>
    `;

  const ctaHtml = ctaText && ctaUrl
    ? `<div style="padding: 8px 0 0 0;">${buildButton(ctaText, ctaUrl, 'primary')}</div>`
    : '';

  const phoneCtaHtml = phone
    ? `
      <tr>
        <td class="px" style="padding: 0 40px 36px 40px;">
          <div style="border-top: 1px solid ${EMAIL.border}; padding-top: 28px; text-align: center;">
            <p style="margin: 0 0 14px 0; color: ${EMAIL.muted}; font-size: 14px;">Questions? Give us a call.</p>
            ${buildButton(formattedPhone, `tel:${rawDigits}`, 'secondary')}
          </div>
        </td>
      </tr>
    `
    : '';

  const websiteHtml = website
    ? `<p style="margin: 0 0 8px 0;"><a href="${website}" style="color: ${EMAIL.text}; font-size: 13px; text-decoration: underline; font-weight: 500;">${website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></p>`
    : '';

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${EMAIL.bg};line-height:1px;">${preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title>Email from ${companyName}</title>
        <style>
          @media only screen and (max-width: 620px) {
            .px { padding-left: 24px !important; padding-right: 24px !important; }
            .outer { padding: 16px 0 !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: ${EMAIL.bg}; font-family: ${EMAIL.font}; -webkit-text-size-adjust: 100%; color: ${EMAIL.text};">

        ${preheaderHtml}

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="outer" style="background-color: ${EMAIL.bg}; padding: 40px 0;">
          <tr>
            <td align="center" style="padding: 0 12px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                style="background-color: ${EMAIL.card}; border: 1px solid ${EMAIL.border}; border-radius: 16px; overflow: hidden; max-width: 600px; width: 100%; font-family: ${EMAIL.font};">

                <!-- Header -->
                <tr>
                  <td class="px" style="padding: 28px 40px 24px 40px; text-align: center; border-bottom: 1px solid ${EMAIL.divider};">
                    ${headerHtml}
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td class="px" style="padding: 36px 40px 32px 40px;">
                    ${bodyHtml}
                    ${ctaHtml}
                  </td>
                </tr>

                <!-- Phone CTA -->
                ${phoneCtaHtml}

              </table>

              <!-- Footer (outside the card, quieter) -->
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">
                <tr>
                  <td class="px" style="padding: 24px 40px 0 40px; text-align: center; font-family: ${EMAIL.font};">
                    ${websiteHtml}
                    ${footerText ? `<p style="margin: 0 0 6px 0; color: ${EMAIL.faint}; font-size: 12px; line-height: 1.6;">${footerText}</p>` : ''}
                    <p style="margin: 0; color: ${EMAIL.faint}; font-size: 12px; line-height: 1.6;">
                      &copy; ${new Date().getFullYear()} ${companyName}
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;
}