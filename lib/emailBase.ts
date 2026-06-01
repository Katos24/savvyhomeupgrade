/**
 * emailBase.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for all Lead2Project HTML emails.
 *
 * Usage:
 *   import { buildEmail, buildEmailRow, buildEmailSection } from '@/lib/emailBase';
 *
 *   const html = buildEmail({
 *     companyName: 'Arctic Air HVAC',
 *     logoUrl: company.logo_url,
 *     brandColor: company.email_brand_color_1,
 *     brandColor2: company.email_brand_color_2,
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
  brandColor?: string | null;
  brandColor2?: string | null;

  // Primary CTA button (e.g. "View in Dashboard")
  ctaText?: string | null;
  ctaUrl?: string | null;

  // Secondary call button — renders a phone CTA below the body
  phone?: string | null;

  // Footer extras
  website?: string | null;

  // Optional plain-text preheader (shows in email client preview)
  preheader?: string | null;
};

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
 * buildEmailRow
 * Renders a single label/value row for use inside a summary table.
 *
 * buildEmailRow('Service', 'Roof Repair')
 */
export function buildEmailRow(label: string, value: string): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 600; width: 110px; vertical-align: top; white-space: nowrap;">
        ${label}
      </td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-size: 13px; font-weight: 600; vertical-align: top;">
        ${value}
      </td>
    </tr>
  `;
}

/**
 * buildEmailTable
 * Wraps rows in a styled summary card.
 *
 * buildEmailTable([
 *   buildEmailRow('Service', 'Roof Repair'),
 *   buildEmailRow('Address', '123 Main St'),
 * ])
 */
export function buildEmailTable(rows: string[]): string {
  const filtered = rows.filter(Boolean);
  if (!filtered.length) return '';
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; border-collapse: separate; margin-bottom: 0;">
      ${filtered.join('')}
    </table>
  `;
}

/**
 * buildEmailSection
 * Renders a labeled section with an optional content block below.
 *
 * buildEmailSection('Your Request Summary', buildEmailTable([...]))
 */
export function buildEmailSection(title: string, contentHtml: string): string {
  if (!contentHtml) return '';
  return `
    <div style="margin-bottom: 32px;">
      <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;">
        ${title}
      </p>
      ${contentHtml}
    </div>
  `;
}

/**
 * buildCustomAnswers
 * Renders custom question answers in branded left-border cards.
 */
export function buildCustomAnswers(
  customAnswers: Record<string, string> | undefined,
  customQuestions: { id: string; label: string }[] | undefined,
  brandColor: string
): string {
  if (!customAnswers || !customQuestions) return '';
  const entries = Object.entries(customAnswers).filter(([, v]) => v);
  if (!entries.length) return '';

  const cards = entries.map(([qId, answer]) => {
    const question = customQuestions.find(q => q.id === qId);
    const label = question?.label || qId;
    return `
      <div style="border-left: 3px solid ${brandColor}; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 8px; background-color: #f8fafc;">
        <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${label}</p>
        <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${answer}</p>
      </div>
    `;
  }).join('');

  return buildEmailSection('Your Responses', cards);
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
    brandColor,
    brandColor2,
    ctaText,
    ctaUrl,
    phone,
    website,
    preheader,
  } = options;

  const color1 = brandColor || '#667eea';
  const color2 = brandColor2 || color1;
  const rawDigits = (phone || '').replace(/\D/g, '');
  const formattedPhone = formatPhone(phone || '');

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 64px; max-width: 200px; display: block; margin: 0 auto 16px auto; object-fit: contain;">`
    : '';

  const ctaHtml = ctaText && ctaUrl
    ? `
      <div style="text-align: center; padding: 8px 0 0 0;">
        <a href="${ctaUrl}"
          style="display: inline-block; background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 800; font-size: 15px; letter-spacing: 0.01em;">
          ${ctaText}
        </a>
      </div>
    `
    : '';

  const phoneCtaHtml = phone
    ? `
      <tr>
        <td style="padding: 0 40px 40px 40px;">
          <div style="border-top: 1px solid #e2e8f0; padding-top: 28px; text-align: center;">
            <p style="margin: 0 0 14px 0; color: #94a3b8; font-size: 13px;">Have questions? We are here to help.</p>
            <a href="tel:${rawDigits}"
              style="display: inline-block; background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Call Us: ${formattedPhone}
            </a>
          </div>
        </td>
      </tr>
    `
    : '';

  const websiteHtml = website
    ? `<p style="margin: 0 0 6px 0;"><a href="${website}" style="color: ${color1}; font-size: 13px; text-decoration: none; font-weight: 600;">${website.replace(/^https?:\/\//, '')}</a></p>`
    : '';

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#ffffff;line-height:1px;">${preheader}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</div>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email from ${companyName}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%;">

        ${preheaderHtml}

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f6f9fc; padding: 40px 0;">
          <tr>
            <td align="center" style="padding: 0 16px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); max-width: 600px; width: 100%;">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); padding: 40px; text-align: center;">
                    ${logoHtml}
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.2;">${companyName}</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px 40px 32px 40px;">
                    ${bodyHtml}
                    ${ctaHtml}
                  </td>
                </tr>

                <!-- Phone CTA -->
                ${phoneCtaHtml}

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    ${websiteHtml}
                    <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                      You received this email because you requested a service from us.
                    </p>
                  </td>
                </tr>

                <!-- Legal -->
                <tr>
                  <td style="padding: 16px 40px; text-align: center;">
                    <p style="margin: 0; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
                      &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
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