import { neon } from '@neondatabase/serverless';
import { defaultEmailTemplates } from './emailTemplateDefaults';

const sql = neon(process.env.DATABASE_URL!);

// Default template text lives in ./emailTemplateDefaults.ts.

export async function getCompanyEmailTemplates(companyId: number) {
  const companies = await sql`
    SELECT email_templates FROM companies WHERE id = ${companyId} LIMIT 1
  `;

  const company = companies[0];

  // Merge DB templates with defaults so new template types always have a fallback
  let savedTemplates = {};
  if (company?.email_templates) {
    try {
      savedTemplates = typeof company.email_templates === 'string'
        ? JSON.parse(company.email_templates)
        : company.email_templates;
    } catch {
      savedTemplates = {};
    }
  }

  return {
    ...defaultEmailTemplates,
    ...savedTemplates,
  };
}

export function renderEmailTemplate(
  template: { subject: string; body: string },
  variables: Record<string, any>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  // Handle conditional blocks: {{#key}}content{{/key}}
  body = body.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    const value = variables[key];
    return value !== undefined && value !== null && value !== '' ? content : '';
  });

  subject = subject.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
    const value = variables[key];
    return value !== undefined && value !== null && value !== '' ? content : '';
  });

  // Always strip company_phone from body — it's shown in the call button already
  body = body.replace(/\{\{company_phone\}\}/g, '');

  // Replace remaining {{variable}} placeholders
  Object.keys(variables).forEach(key => {
    const raw = variables[key];
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    if (raw === null || raw === undefined || raw === '') {
      subject = subject.replace(regex, '');
      body = body.replace(regex, '');
      return;
    }
    let value = raw;
    if (key === 'line_items' && Array.isArray(value)) {
      value = formatLineItems(value);
    }
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  });

  // Clean up any remaining unreplaced placeholders
  subject = subject.replace(/\{\{[\w]+\}\}/g, '');
  body = body.replace(/\{\{[\w]+\}\}/g, '');

  // Clean up lines that are just a label with no value
  body = body.replace(/^.*:\s*$/gm, '');
  // Clean up multiple blank lines
  body = body.replace(/\n{3,}/g, '\n\n');

  return { subject, body };
}

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