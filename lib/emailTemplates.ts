import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getCompanyEmailTemplates(companyId: number) {
  const companies = await sql`
    SELECT email_templates FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  
  const company = companies[0];
  if (company?.email_templates) return company.email_templates;

  return {
    quote: {
      subject: 'Your Quote from {{company_name}}',
      body: `Hi {{customer_name}},

Thank you for your inquiry! We've prepared a quote for your project.

Quote Total: {{quote_total}}

Please review the attached quote and let us know if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
    },
    schedule: {
      subject: 'Appointment Scheduled - {{company_name}}',
      body: `Hi {{customer_name}},

Your appointment has been scheduled!

Date: {{scheduled_date}}
Time: {{scheduled_time}}
Address: {{customer_address}}

We look forward to serving you!

Best regards,
{{company_name}}
{{company_phone}}`,
    },
    payment: {
      subject: 'Payment Reminder - {{company_name}}',
      body: `Hi {{customer_name}},

This is a friendly reminder about your upcoming payment.

Amount Due: {{payment_amount}}
Due Date: {{due_date}}

Please contact us if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
    },
  };
}

export function renderEmailTemplate(
  template: { subject: string; body: string },
  variables: Record<string, any>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  Object.keys(variables).forEach(key => {
    let value = variables[key];
    if (key === 'line_items' && Array.isArray(value)) {
      value = formatLineItems(value);
    }
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    subject = subject.replace(regex, value || '');
    body = body.replace(regex, value || '');
  });

  return { subject, body };
}

function formatLineItems(items: { description: string; amount: number }[]) {
  if (!items.length) return '';

  const rows = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
      <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e2e8f0;">$${item.amount}</td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 8px; border-bottom: 2px solid #cbd5e1;">Description</th>
          <th style="text-align: right; padding: 8px; border-bottom: 2px solid #cbd5e1;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function textToHtml(
  text: string,
  companyName: string,
  companyLogo?: string,
  companyPhone?: string,
  brandColor1?: string,
  brandColor2?: string,
  extraHtml?: string
): string {
  const color1 = brandColor1 || '#667eea';
  const color2 = brandColor2 || '#764ba2';

  const bodyHtml = text.split('\n\n').map(paragraph => {
    const trimmed = paragraph.trim();
    if (/^[A-Z\s]+:/.test(trimmed)) {
      const [heading, ...content] = trimmed.split('\n');
      return `
        <div style="margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; color: ${color1}; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ${heading}
          </h3>
          <div style="color: #334155; font-size: 15px; line-height: 1.6;">
            ${content.join('<br>')}
          </div>
        </div>
      `;
    }
    return `<p style="margin: 0 0 16px 0; color: #334155; font-size: 15px; line-height: 1.7;">${trimmed.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email from ${companyName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f6f9fc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); overflow: hidden;">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); padding: 40px; text-align: center;">
                    ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" style="max-height: 70px; max-width: 220px; display: block; margin: 0 auto 20px auto;">` : ''}
                    <h1 style="margin: 0; color: #fff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">${companyName}</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="color: #334155;">
                      ${bodyHtml}
                      ${extraHtml || ''}
                    </div>
                  </td>
                </tr>

                <!-- Call CTA -->
                ${companyPhone ? `
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="border-top: 2px solid #e2e8f0; padding-top: 32px; text-align: center;">
                      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">Have questions? We're here to help.</p>
                      <a href="tel:${companyPhone}"
                        style="display: inline-block; background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                        Call Us: ${companyPhone}
                      </a>
                    </div>
                  </td>
                </tr>
                ` : ''}

                <!-- Footer -->
                <tr>
                  <td style="background: #f8fafc; padding: 28px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0 0 4px 0; color: #475569; font-size: 15px; font-weight: 600;">${companyName}</p>
                    ${companyPhone ? `<p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">${companyPhone}</p>` : ''}
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">You received this email because you requested a service from us.</p>
                  </td>
                </tr>

              </table>

              <!-- Legal footer -->
              <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                <tr>
                  <td style="text-align: center; padding: 0 40px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                      © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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