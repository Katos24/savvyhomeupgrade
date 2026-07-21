import { adminDb as sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteAcceptedNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action || !['accept', 'decline'].includes(action)) {
    return new NextResponse(renderPage({
      title: 'Invalid Link',
      message: 'This link is invalid or missing required information.',
      state: 'neutral',
    }), { headers: { 'Content-Type': 'text/html' } });
  }

  try {
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

    if (projects.length === 0) {
      return new NextResponse(renderPage({
        title: 'Link Not Found',
        message: 'This quote link is invalid or has expired.',
        state: 'neutral',
      }), { headers: { 'Content-Type': 'text/html' } });
    }

    const project = projects[0];
    const brandColor = project.brand_color_1 || '#6366f1';

    if (project.quote_accepted_at) {
      return new NextResponse(renderPage({
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
      }), { headers: { 'Content-Type': 'text/html' } });
    }

    if (project.quote_declined_at) {
      return new NextResponse(renderPage({
        title: 'Already Declined',
        message: `You already declined this quote. If you changed your mind, please contact ${project.company_name} directly.`,
        state: 'neutral',
        companyName: project.company_name,
        companyPhone: project.company_phone,
        companyLogo: project.company_logo,
        brandColor,
      }), { headers: { 'Content-Type': 'text/html' } });
    }

    if (action === 'accept') {
      await sql`
        UPDATE projects
        SET
          quote_accepted_at = NOW(),
          quote_token = NULL,
          updated_at = NOW()
        WHERE id = ${project.id}
      `;

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

      return new NextResponse(renderPage({
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
      }), { headers: { 'Content-Type': 'text/html' } });
    }

    if (action === 'decline') {
      await sql`
        UPDATE projects
        SET
          quote_declined_at = NOW(),
          updated_at = NOW()
        WHERE id = ${project.id}
      `;

      return new NextResponse(renderPage({
        title: 'Quote Declined',
        message: `Thanks for letting us know, ${project.customer_name}. If you change your mind or have questions, please contact ${project.company_name} directly.`,
        state: 'neutral',
        companyName: project.company_name,
        companyPhone: project.company_phone,
        companyWebsite: project.company_website,
        companyLogo: project.company_logo,
        brandColor,
      }), { headers: { 'Content-Type': 'text/html' } });
    }

  } catch (error) {
    console.error('Quote respond error:', error);
    return new NextResponse(renderPage({
      title: 'Something Went Wrong',
      message: 'Please try again or contact the company directly.',
      state: 'neutral',
    }), { headers: { 'Content-Type': 'text/html' } });
  }
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
}) {
  const isSuccess = state === 'success';

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const logoHtml = companyLogo
    ? `<img src="${companyLogo}" alt="${companyName || ''}" style="height:48px;width:auto;object-fit:contain;margin-bottom:16px;" />`
    : companyName
    ? `<div style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:${brandColor};color:#fff;font-size:20px;font-weight:900;margin-bottom:16px;">${companyName.charAt(0).toUpperCase()}</div>`
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
            <td colspan="2" style="padding:8px 14px;text-align:right;color:#64748b;font-size:12px;">Tax (${taxRate}%)</td>
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
              <td style="padding:12px 14px;color:#334155;font-size:14px;">${item.description || ''}</td>
              <td style="padding:12px 14px;text-align:center;color:#64748b;font-size:14px;">${item.quantity ?? 1}</td>
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
          <span style="font-size:12px;color:#94a3b8;">Tax (${taxRate}%)</span>
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
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">${companyName || 'The team'} will contact you shortly to confirm your appointment and go over any final details.</p>
    </div>
  ` : '';

  const contactHtml = (companyPhone || companyWebsite) ? `
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f1f5f9;text-align:center;">
      <p style="margin:0 0 8px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contact</p>
      ${companyPhone ? `<p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#334155;"><a href="tel:${companyPhone}" style="color:${brandColor};text-decoration:none;">${companyPhone}</a></p>` : ''}
      ${companyWebsite ? `<p style="margin:0;font-size:13px;"><a href="${companyWebsite}" style="color:${brandColor};text-decoration:none;">${companyWebsite}</a></p>` : ''}
    </div>
  ` : '';

  const iconHtml = isSuccess
    ? `<div style="width:56px;height:56px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M6 14l6 6 10-12" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </div>`
    : `<div style="width:56px;height:56px;border-radius:50%;background:#f8fafc;display:flex;align-items:center;justify-content:center;margin:0 auto 16px auto;">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 8v8M14 20h.01" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/></svg>
       </div>`;

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
  <title>${title}${companyName ? ` — ${companyName}` : ''}</title>
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
      <h1>${title}</h1>
      <p class="message">${message}</p>
    </div>
    ${lineItemsHtml}
    ${nextStepsHtml}
    ${contactHtml}
  </div>
  ${poweredByHtml}
</body>
</html>`;
}