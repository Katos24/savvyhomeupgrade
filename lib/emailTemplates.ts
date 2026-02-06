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

Thank you for your inquiry! We've prepared a quote for your project.

Quote Total: ${'{{quote_total}}'}

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

Amount Due: ${'{{payment_amount}}'}
Due Date: {{due_date}}

Please contact us if you have any questions.

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

// Convert plain text body to HTML
export function textToHtml(text: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background-color: #f6f9fc; 
            margin: 0; 
            padding: 0; 
          }
          .container { 
            background-color: #ffffff; 
            margin: 40px auto; 
            padding: 40px; 
            max-width: 600px; 
            border-radius: 8px; 
          }
          .content { 
            color: #333; 
            font-size: 16px; 
            line-height: 24px; 
            white-space: pre-wrap;
          }
          .footer { 
            color: #8898aa; 
            font-size: 14px; 
            text-align: center; 
            margin-top: 32px; 
            padding-top: 20px; 
            border-top: 1px solid #e6ebf1; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">${text}</div>
        </div>
      </body>
    </html>
  `;
}
