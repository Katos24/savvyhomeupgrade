// app/api/company/[slug]/email-preview/route.ts
//
// Returns the real rendered HTML for a given email template type.
// Used by the EmailTemplatesTab preview pane so it matches the actual sent email exactly.
//
// POST body:
// {
//   templateKey: 'quote' | 'schedule' | 'payment' | 'invoice' | 'lead_confirmation' | 'job_completion',
//   subject: string,   // current subject from editor
//   body: string,      // current body from editor
// }

import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { buildEmail, buildEmailTable, buildEmailRow, buildEmailSection } from '@/lib/emailBase';
import { renderEmailTemplate, getCompanyEmailTemplates } from '@/lib/emailTemplates';

const SAMPLE = {
  customerName:    'John Smith',
  customerEmail:   'john.smith@example.com',
  quoteTotal:       2500,
  invoiceTotal:     2500,
  invoiceNumber:   'INV-001',
  scheduledDate:   'Thursday, March 15, 2026',
  scheduledTime:   '10:00 AM',
  serviceAddress:  '123 Main St, Anytown, NY 11742',
  amountDue:        1250,
  dueDate:         'March 30, 2026',
  description:     'Roof inspection and repair estimate',
  category:        'Roofing',
  assignedTo:      'Mike Johnson',
  googleReviewUrl: 'https://g.page/r/sample-review-link',
};

const SAMPLE_LINE_ITEMS = [
  { description: 'Labor (4 hours)',      quantity: 4,  unitPrice: 125,  amount: 500  },
  { description: 'Materials',            quantity: 1,  unitPrice: 1200, amount: 1200 },
  { description: 'Service / Trip Fee',   quantity: 1,  unitPrice: 150,  amount: 150  },
  { description: 'Permits & Fees',       quantity: 1,  unitPrice: 650,  amount: 650  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { templateKey, subject: rawSubject, body: rawBody } = await req.json();

    const rows = await sql`
      SELECT id, name, phone, logo_url, email,
             email_brand_color_1, email_brand_color_2,
             payment_link_url, payment_link_type, website
      FROM companies WHERE slug = ${slug} LIMIT 1
    ` as any[];

    const company = rows[0];
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    // Use the template from the request body (current editor state, not saved DB state)
    const template = { subject: rawSubject, body: rawBody };

    // Build variables matching each template type
    const baseVars = {
      company_name:  company.name,
      company_phone: company.phone || '',
      customer_name: SAMPLE.customerName,
    };

    let renderedBody = '';
    let renderedSubject = '';
    let extraHtml = '';

    // ── Per-template rendering ──────────────────────────────
    switch (templateKey) {

      case 'quote': {
        const vars = { ...baseVars, quote_total: fmt(SAMPLE.quoteTotal), project_description: SAMPLE.description };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;

        const lineItemsHtml = `
          <div style="margin-bottom:32px;">
            <p style="margin:0 0 10px 0;color:#94a3b8;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;">Quote Breakdown</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;font-size:14px;">
              <thead>
                <tr style="background:#f8fafc;">
                  <th style="padding:10px 14px;text-align:left;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e2e8f0;">Description</th>
                  <th style="padding:10px 14px;text-align:center;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e2e8f0;width:50px;">Qty</th>
                  <th style="padding:10px 14px;text-align:right;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e2e8f0;width:90px;">Unit</th>
                  <th style="padding:10px 14px;text-align:right;color:#64748b;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #e2e8f0;width:90px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${SAMPLE_LINE_ITEMS.map((item, i) => `
                  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafafa'};border-bottom:1px solid #f1f5f9;">
                    <td style="padding:12px 14px;color:#334155;font-size:14px;">${item.description}</td>
                    <td style="padding:12px 14px;text-align:center;color:#64748b;font-size:14px;">${item.quantity}</td>
                    <td style="padding:12px 14px;text-align:right;color:#64748b;font-size:14px;">${fmt(item.unitPrice)}</td>
                    <td style="padding:12px 14px;text-align:right;color:#334155;font-weight:600;font-size:14px;">${fmt(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
                  <td colspan="3" style="padding:14px;text-align:right;color:#475569;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Total</td>
                  <td style="padding:14px;text-align:right;color:${company.email_brand_color_1 || '#667eea'};font-weight:800;font-size:20px;">${fmt(SAMPLE.quoteTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        `;

        const acceptDeclineHtml = `
          <div style="margin:36px 0;padding:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;text-align:center;">
            <p style="margin:0 0 6px 0;color:#1e293b;font-size:15px;font-weight:700;">Ready to move forward?</p>
            <p style="margin:0 0 24px 0;color:#64748b;font-size:13px;line-height:1.6;">Review the quote above and let us know your decision.</p>
            <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
              <tr>
                <td style="padding:0 8px;">
                  <span style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;">Accept Quote</span>
                </td>
                <td style="padding:0 8px;">
                  <span style="display:inline-block;background:#ffffff;color:#94a3b8;padding:13px 24px;border-radius:10px;font-weight:700;font-size:14px;border:1.5px solid #e2e8f0;">Decline</span>
                </td>
              </tr>
            </table>
          </div>
        `;

        renderedBody = `
          <p style="margin:0 0 28px 0;color:#334155;font-size:15px;line-height:1.7;">${rendered.body.replace(/\n/g, '<br>')}</p>
          ${lineItemsHtml}
          ${acceptDeclineHtml}
        `;
        break;
      }

      case 'schedule': {
        const vars = {
          ...baseVars,
          scheduled_date: SAMPLE.scheduledDate,
          scheduled_time: SAMPLE.scheduledTime,
          customer_address: SAMPLE.serviceAddress,
        };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;

        const scheduleCard = buildEmailTable([
          buildEmailRow('Date',        SAMPLE.scheduledDate),
          buildEmailRow('Time',        SAMPLE.scheduledTime),
          buildEmailRow('Address',     SAMPLE.serviceAddress),
          buildEmailRow('Assigned To', SAMPLE.assignedTo),
        ]);

        renderedBody = `
          <p style="margin:0 0 28px 0;color:#334155;font-size:15px;line-height:1.7;">${rendered.body.replace(/\n/g, '<br>')}</p>
          ${buildEmailSection('Appointment Details', scheduleCard)}
        `;
        break;
      }

      case 'payment': {
        const vars = {
          ...baseVars,
          payment_amount: fmt(SAMPLE.amountDue),
          amount_due:     fmt(SAMPLE.amountDue),
          due_date:       SAMPLE.dueDate,
        };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;
        renderedBody = `<p style="margin:0 0 28px 0;color:#334155;font-size:15px;line-height:1.7;white-space:pre-line;">${rendered.body}</p>`;
        break;
      }

      case 'invoice': {
        const vars = {
          ...baseVars,
          invoice_number: SAMPLE.invoiceNumber,
          invoice_total:  fmt(SAMPLE.invoiceTotal),
          due_date:       SAMPLE.dueDate,
        };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;

        const accentColor = company.email_brand_color_1 || '#667eea';
        const payNowBtn = company.payment_link_url ? `
          <div style="margin-bottom:16px;text-align:center;">
            <a href="${company.payment_link_url}" style="display:inline-block;background-color:${accentColor};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;">
              Pay Now — ${fmt(SAMPLE.invoiceTotal)}
            </a>
          </div>
        ` : '';

        renderedBody = `
          <div style="margin-bottom:28px;text-align:center;">
            ${payNowBtn}
            <div style="margin-bottom:16px;text-align:center;">
              <span style="display:inline-block;background-color:#111827;color:#ffffff;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;">Download Invoice PDF</span>
              <p style="margin:10px 0 0 0;color:#94a3b8;font-size:11px;">${SAMPLE.invoiceNumber} · ${fmt(SAMPLE.invoiceTotal)}</p>
            </div>
            <div style="padding:16px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;text-align:center;">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">Payment Due: ${SAMPLE.dueDate}</p>
            </div>
          </div>
          <p style="white-space:pre-line;margin:0 0 24px 0;color:#334155;font-size:15px;line-height:1.7;">${rendered.body}</p>
        `;
        break;
      }
case 'lead_confirmation': {
        const sampleSummary = buildEmailSection('Your Request Summary', buildEmailTable([
          buildEmailRow('Service',   SAMPLE.category),
          buildEmailRow('Address',   SAMPLE.serviceAddress),
          buildEmailRow('Preferred', 'Thursday, March 20, 2026 at 2:00 PM'),
          buildEmailRow('Details',   SAMPLE.description),
        ]));
        const vars = { ...baseVars, request_summary: sampleSummary };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;

        const summaryCard = buildEmailTable([
          buildEmailRow('Service',   SAMPLE.category),
          buildEmailRow('Address',   SAMPLE.serviceAddress),
          buildEmailRow('Preferred', 'Thursday, March 20, 2026 at 2:00 PM'),
          buildEmailRow('Details',   SAMPLE.description),
        ]);

        const nextStepsHtml = `
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${['We review your request and confirm availability.',
               'A team member contacts you to discuss the details.',
               'We get the job done.',
              ].map((step, i) => `
              <tr>
                <td style="padding:10px 0;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <div style="width:22px;height:22px;border-radius:50%;background-color:${company.email_brand_color_1 || '#667eea'};color:#ffffff;font-size:11px;font-weight:800;text-align:center;line-height:22px;">${i + 1}</div>
                      </td>
                      <td style="padding-left:12px;color:#334155;font-size:14px;font-weight:500;line-height:1.55;">${step}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            `).join('')}
          </table>
        `;

        renderedBody = `
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:50px;padding:9px 20px;">
              <span style="color:#16a34a;font-size:13px;font-weight:700;">Request received successfully</span>
            </div>
          </div>
          <p style="margin:0 0 28px 0;color:#334155;font-size:15px;line-height:1.7;white-space:pre-line;">${rendered.body}</p>
          ${buildEmailSection('What Happens Next', nextStepsHtml)}
        `;
        break;
      }

      case 'job_completion': {
        const reviewLinkHtml = `
          <div style="margin:16px 0;">
            <a href="${SAMPLE.googleReviewUrl}" style="display:inline-block;background:#ffffff;color:#1a1a1a;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:800;font-size:15px;border:2px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <img src="https://www.google.com/favicon.ico" alt="G" style="width:18px;height:18px;vertical-align:middle;margin-right:10px;" />
              <span style="vertical-align:middle;">Leave us a Google Review</span>
            </a>
          </div>
        `;

        const vars = {
          ...baseVars,
          google_review_link: reviewLinkHtml,
        };
        const rendered = renderEmailTemplate(template, vars);
        renderedSubject = rendered.subject;
        renderedBody = `<p style="margin:0 0 28px 0;color:#334155;font-size:15px;line-height:1.7;white-space:pre-line;">${rendered.body}</p>`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown template key' }, { status: 400 });
    }

    const html = buildEmail({
      companyName:  company.name,
      logoUrl:      company.logo_url,
      brandColor:   company.email_brand_color_1,
      brandColor2:  company.email_brand_color_2,
      bodyHtml:     renderedBody,
      phone:        company.phone,
      website:      company.website,
      preheader:    `Preview: ${renderedSubject}`,
    });

    return NextResponse.json({ html, subject: renderedSubject });
  } catch (error) {
    console.error('Email preview error:', error);
    return NextResponse.json({ error: 'Failed to render preview' }, { status: 500 });
  }
}