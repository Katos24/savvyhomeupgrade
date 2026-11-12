// Shared by lib/emails/customer.ts and lib/emails/contractor.ts.
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';
import { buildParagraph, EMAIL } from '@/lib/emailBase';

export const resend = new Resend(process.env.RESEND_API_KEY);
export const sql = neon(process.env.DATABASE_URL!);

export async function getCompanyDetails(companyId: number) {
  const companies = await sql`
    SELECT name, logo_url, phone, email, website, email_brand_color_1, email_brand_color_2,
           payment_link_type, payment_link_url, bcc_sender_on_email
    FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  return companies[0];
}

export function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ── Shared pieces for customer emails ─────────────────────────

// Placeholders swapped in for template variables that hold HTML, so
// the surrounding plain text can be turned into paragraphs safely.
export const BLOCK_REQUEST_SUMMARY = '%%L2P_REQUEST_SUMMARY%%';
export const BLOCK_REVIEW_BUTTON = '%%L2P_REVIEW_BUTTON%%';

/**
 * Turns a contractor's plain-text template (blank line = new paragraph,
 * single newline = line break) into styled paragraphs. Any placeholder
 * in `blocks` is replaced with its HTML as its own block.
 */
export function renderTemplateBody(text: string, blocks: Record<string, string> = {}): string {
  const tokens = Object.keys(blocks);
  const splitter = tokens.length
    ? new RegExp(`(${tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`)
    : null;

  return (text || '')
    .trim()
    .split(/\n\s*\n/)
    .map(chunk => {
      const parts = splitter ? chunk.split(splitter) : [chunk];
      return parts
        .map(part => {
          if (blocks[part] !== undefined) return blocks[part];
          const t = part.trim();
          return t ? buildParagraph(t.replace(/\n/g, '<br>')) : '';
        })
        .join('');
    })
    .join('');
}

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

/**
 * Line items as a two-column list: description (with "qty × price"
 * underneath when qty > 1) and amount. Reads well on a phone, unlike
 * the old four-column table.
 */
export function buildLineItems(
  items: Array<{ description: string; quantity?: number; unitPrice?: number; amount: number }>,
  totals: Array<{ label: string; value: string; strong?: boolean }>
): string {
  if (!items.length) return '';
  const itemRows = items.map(item => {
    const qty = item.quantity ?? 1;
    const detail = qty !== 1 && item.unitPrice
      ? `<div style="margin-top: 2px; color: ${EMAIL.muted}; font-size: 13px;">${qty} × ${fmtUSD(item.unitPrice)}</div>`
      : '';
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${EMAIL.divider}; color: ${EMAIL.ink}; font-size: 14px; line-height: 1.45; vertical-align: top;">
          ${item.description}${detail}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid ${EMAIL.divider}; color: ${EMAIL.ink}; font-size: 14px; font-weight: 500; text-align: right; vertical-align: top; white-space: nowrap;">
          ${fmtUSD(item.amount)}
        </td>
      </tr>
    `;
  }).join('');

  const totalRows = totals.map(t => `
    <tr>
      <td style="padding: ${t.strong ? '14px' : '8px'} 16px; background-color: ${EMAIL.soft}; color: ${t.strong ? EMAIL.ink : EMAIL.muted}; font-size: ${t.strong ? '15px' : '14px'}; font-weight: ${t.strong ? 700 : 400}; ${t.strong ? `border-top: 1px solid ${EMAIL.border};` : ''}">
        ${t.label}
      </td>
      <td style="padding: ${t.strong ? '14px' : '8px'} 16px; background-color: ${EMAIL.soft}; color: ${t.strong ? EMAIL.ink : EMAIL.muted}; font-size: ${t.strong ? '15px' : '14px'}; font-weight: ${t.strong ? 700 : 400}; text-align: right; white-space: nowrap; ${t.strong ? `border-top: 1px solid ${EMAIL.border};` : ''}">
        ${t.value}
      </td>
    </tr>
  `).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
      style="border: 1px solid ${EMAIL.border}; border-radius: 12px; overflow: hidden; border-collapse: separate;">
      ${itemRows}
      ${totalRows}
    </table>
  `;
}

export const PAY_LABELS: Record<string, string> = {
  venmo: 'Pay with Venmo',
  zelle: 'Pay with Zelle',
  cashapp: 'Pay with Cash App',
  paypal: 'Pay with PayPal',
  stripe: 'Pay with Card',
  other: 'Pay Now',
};

/**
 * Escapes user input before it goes into email HTML.
 *
 * Note: the existing lead emails interpolate `description` and custom answers
 * straight into the markup. That's worth revisiting separately — a customer
 * can put arbitrary HTML in a form field and it renders in your inbox.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Must be an absolute URL — email clients can't resolve site-relative paths.
 * PNG rather than the .webp alongside it: Outlook on Windows won't render webp.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lead2project.com';
export const LOGO_URL = `${SITE_URL}/Lead2ProjectLogo.png`;


/** Frame for emails Lead2Project sends to contractors (not their customers). */
export const L2P_FRAME = {
  companyName: 'Lead2Project',
  footerNote: "You're getting this because you have a Lead2Project account.",
};