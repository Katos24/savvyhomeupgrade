import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Get company's custom email templates or return defaults
export async function getCompanyEmailTemplates(companyId: number) {
  const companies = await sql`
    SELECT email_templates FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  
  const company = companies[0];
  
  // If company has custom templates, return them
  if (company?.email_templates) {
    return company.email_templates;
  }
  
  // Otherwise return defaults
  return {
    quote: {
      subject: 'Your Quote from {{company_name}}',
      body: `Hi {{customer_name}},

Thank you for reaching out! We're excited to work with you on your {{project_description}} project.

QUOTE TOTAL: ${'{{quote_total}}'}

We've prepared a detailed quote for your review. Our team is ready to get started as soon as you're ready!

What's Next?
Simply reply to this email or give us a call if you have any questions. We're here to help make your project a success.

Best regards,
{{company_name}}
{{company_phone}}`,
    },
    schedule: {
      subject: 'Your Appointment is Scheduled! - {{company_name}}',
      body: `Hi {{customer_name}},

Great news! Your appointment has been confirmed.

APPOINTMENT DETAILS:
📅 Date: {{scheduled_date}}
🕐 Time: {{scheduled_time}}
📍 Location: {{customer_address}}

What to Expect:
Our team will arrive on time and ready to work. If you need to reschedule or have any questions before we arrive, just give us a call!

We're looking forward to serving you!

Best regards,
{{company_name}}
{{company_phone}}`,
    },
    payment: {
      subject: 'Payment Reminder - {{company_name}}',
      body: `Hi {{customer_name}},

This is a friendly reminder about your upcoming payment.

PAYMENT DETAILS:
💰 Amount Due: ${'{{payment_amount}}'}
📅 Due Date: {{due_date}}

We appreciate your business! If you have any questions about this payment or need to discuss payment options, please don't hesitate to reach out.

Best regards,
{{company_name}}
{{company_phone}}`,
    },
  };
}

// Replace template variables with actual values
export function renderEmailTemplate(
  template: { subject: string; body: string },
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;
  
  // Replace all {{variable}} with actual values
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    subject = subject.replace(regex, variables[key] || '');
    body = body.replace(regex, variables[key] || '');
  });
  
  return { subject, body };
}

// Convert plain text body to beautiful branded HTML
export function textToHtml(
  text: string, 
  companyName: string,
  companyLogo?: string,
  companyPhone?: string,
  brandColor1?: string,
  brandColor2?: string
): string {
  // Use custom colors or defaults
  const color1 = brandColor1 || '#667eea';
  const color2 = brandColor2 || '#764ba2';

  // Enhanced text parsing with better formatting
  const paragraphs = text.split('\n\n');
  const bodyHtml = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim();
    
    // Check if it's a heading (ALL CAPS followed by colon)
    if (/^[A-Z\s]+:/.test(trimmed)) {
      const [heading, ...content] = trimmed.split('\n');
      const contentHtml = content.join('<br>');
      return `
        <div style="margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; color: ${color1}; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ${heading}
          </h3>
          <div style="color: #334155; font-size: 15px; line-height: 1.6;">
            ${contentHtml}
          </div>
        </div>
      `;
    }
    
    // Regular paragraph
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
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; line-height: 1.6;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
          <tr>
            <td align="center">
              <!-- Main Container -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 15px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header with Logo/Branding -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); padding: 40px 40px; text-align: center; position: relative;">
                    <!-- Decorative elements -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.3);"></div>
                    
                    ${companyLogo ? `
                      <img src="${companyLogo}" alt="${companyName}" style="max-height: 70px; max-width: 220px; display: block; margin: 0 auto 20px auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
                    ` : ''}
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: -0.5px;">
                      ${companyName}
                    </h1>
                  </td>
                </tr>
                
                <!-- Content Body -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <div style="color: #334155;">
                      ${bodyHtml}
                    </div>
                  </td>
                </tr>
                
                <!-- Call to Action (optional separator) -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="border-top: 2px solid #e2e8f0; padding-top: 32px;">
                      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px; text-align: center;">
                        Have questions? We're here to help!
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="tel:${companyPhone}" style="display: inline-block; background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                              📞 Call Us Now
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 8px 0; color: #475569; font-size: 16px; font-weight: 600;">
                            ${companyName}
                          </p>
                          ${companyPhone ? `
                            <p style="margin: 0 0 16px 0; color: #64748b; font-size: 15px;">
                              📞 ${companyPhone}
                            </p>
                          ` : ''}
                          <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                            Questions? Simply reply to this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
              <!-- Legal Footer -->
              <table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                <tr>
                  <td style="text-align: center; padding: 0 40px;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                      © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
                      You received this email because you requested a quote or service from us.
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
