import { Resend } from 'resend';
import { getCompanyEmailTemplates, renderEmailTemplate, textToHtml } from './emailTemplates';
import { neon } from '@neondatabase/serverless';
import {
  buildEmail,
  buildEmailRow,
  buildEmailTable,
  buildEmailSection,
  buildCustomAnswers,
  buildAttachmentSummary,
} from '@/lib/emailBase';

const resend = new Resend(process.env.RESEND_API_KEY);
const sql = neon(process.env.DATABASE_URL!);

async function getCompanyDetails(companyId: number) {
  const companies = await sql`
    SELECT name, logo_url, phone, email, website, email_brand_color_1, email_brand_color_2
    FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  return companies[0];
}

function formatCategory(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────
// sendNewLeadAlertEmail
// Sends a new lead notification to the contractor.
// ─────────────────────────────────────────────────────────────
export async function sendNewLeadAlertEmail({
  contractorEmail,
  customerName,
  customerEmail,
  customerPhone,
  category,
  description,
  dashboardUrl,
  address,
  addressLine2,
  city,
  zipCode,
  photosCount,
  fileUrls,
  customAnswers,
  customQuestions,
  preferredDate,
  preferredTime,
  leadSource,
}: {
  contractorEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: string;
  description: string;
  dashboardUrl: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  zipCode?: string;
  photosCount?: number;
  fileUrls?: { url: string; name: string; size: number; type?: string }[];
  customAnswers?: Record<string, string>;
  customQuestions?: { id: string; label: string; type: string; options?: string[] }[];
  preferredDate?: string;
  preferredTime?: string;
  leadSource?: string;
}) {
  try {
    const displayCategory = formatCategory(category);
    const fullAddress = [address, addressLine2, city, zipCode].filter(Boolean).join(', ');
    const attachmentText = buildAttachmentSummary(fileUrls) || (photosCount ? `${photosCount} file${photosCount > 1 ? 's' : ''}` : '');

    // Contact info table
    const contactTable = buildEmailTable([
      buildEmailRow('Name', customerName),
      buildEmailRow('Phone', `<a href="tel:${customerPhone}" style="color: #3b82f6; text-decoration: none;">${customerPhone}</a>`),
      buildEmailRow('Email', `<a href="mailto:${customerEmail}" style="color: #3b82f6; text-decoration: none;">${customerEmail}</a>`),
      buildEmailRow('Address', fullAddress),
      preferredDate || preferredTime
        ? buildEmailRow('Preferred', [preferredDate, preferredTime].filter(Boolean).join(' at '))
        : '',
      buildEmailRow('Found via', leadSource || ''),
    ]);

    // Description box
    const descriptionHtml = description
      ? `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${description}</p>
        </div>
      `
      : '';

    // Custom answers
    const customAnswerHtml = (() => {
      if (!customAnswers || !customQuestions) return '';
      const entries = Object.entries(customAnswers).filter(([, v]) => v);
      if (!entries.length) return '';
      const cards = entries.map(([qId, answer]) => {
        const question = customQuestions.find(q => q.id === qId);
        return `
          <div style="border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 8px; background-color: #f8fafc;">
            <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${question?.label || qId}</p>
            <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${answer}</p>
          </div>
        `;
      }).join('');
      return buildEmailSection('Form Responses', cards);
    })();

    // Attachment banner
    const attachmentHtml = attachmentText
      ? `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
          <p style="margin: 0; color: #1e40af; font-size: 13px; font-weight: 600;">${attachmentText} attached</p>
          <p style="margin: 4px 0 0 0; color: #60a5fa; font-size: 11px; font-weight: 500;">View in dashboard</p>
        </div>
      `
      : '';

    // Map link
    const mapLinkHtml = fullAddress
      ? `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin-top: 8px;">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}"
            style="color: #16a34a; font-size: 13px; font-weight: 700; text-decoration: none;">
            View on Google Maps &rarr;
          </a>
        </div>
      `
      : '';

    const bodyHtml = `
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50px; padding: 6px 16px; color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
          New Lead
        </span>
        <span style="margin-left: 8px; color: #64748b; font-size: 14px; font-weight: 600;">${displayCategory}</span>
      </div>

      ${buildEmailSection('Contact Information', contactTable)}
      ${descriptionHtml ? buildEmailSection("Customer's Message", descriptionHtml) : ''}
      ${customAnswerHtml}
      ${attachmentText ? buildEmailSection('Attachments', attachmentHtml) : ''}
      ${mapLinkHtml}
    `;

    const html = buildEmail({
      companyName: 'Lead2Project',
      brandColor: '#0f172a',
      brandColor2: '#1e293b',
      bodyHtml,
      ctaText: 'View in Dashboard',
      ctaUrl: dashboardUrl,
      preheader: `New lead from ${customerName} — ${displayCategory}`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: contractorEmail,
      subject: `New Lead: ${customerName} — ${displayCategory}`,
      html,
    });

    console.log('New lead alert sent to contractor');
  } catch (error) {
    console.error('Failed to send lead alert:', error);
  }
}

// ─────────────────────────────────────────────────────────────
// sendLeadConfirmationEmail
// Sends a branded confirmation to the customer after submission.
// ─────────────────────────────────────────────────────────────
export async function sendLeadConfirmationEmail({
  customerEmail,
  customerName,
  category,
  companyName,
  companyId,
  description,
  address,
  addressLine2,
  city,
  zipCode,
  preferredDate,
  preferredTime,
  customAnswers,
  customQuestions,
  fileUrls,
}: {
  customerEmail: string;
  customerName: string;
  category: string;
  companyName: string;
  companyId: number;
  description?: string;
  address?: string;
  addressLine2?: string;
  city?: string;
  zipCode?: string;
  preferredDate?: string;
  preferredTime?: string;
  customAnswers?: Record<string, string>;
  customQuestions?: { id: string; label: string; type: string; options?: string[] }[];
  fileUrls?: { url: string; name: string; size: number; type?: string }[];
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const brandColor = company.email_brand_color_1 || '#667eea';
    const displayCategory = formatCategory(category);
    const fullAddress = [address, addressLine2, city, zipCode].filter(Boolean).join(', ');
    const attachmentText = buildAttachmentSummary(fileUrls);

    const summaryTable = buildEmailTable([
      buildEmailRow('Service', displayCategory),
      buildEmailRow('Address', fullAddress),
      preferredDate || preferredTime
        ? buildEmailRow('Preferred', [preferredDate, preferredTime].filter(Boolean).join(' at '))
        : '',
      buildEmailRow('Details', description || ''),
      buildEmailRow('Attached', attachmentText),
    ]);

    const customAnswerHtml = buildCustomAnswers(customAnswers, customQuestions, brandColor);

    const nextStepsHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${['We review your request and confirm availability.',
           'A team member contacts you to discuss the details.',
           'We get the job done.',
          ].map((step, i) => `
          <tr>
            <td style="padding: 10px 0; vertical-align: top;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="width: 28px; vertical-align: top; padding-top: 1px;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background-color: ${brandColor}; color: #ffffff; font-size: 11px; font-weight: 800; text-align: center; line-height: 22px;">
                      ${i + 1}
                    </div>
                  </td>
                  <td style="padding-left: 12px; color: #334155; font-size: 14px; font-weight: 500; line-height: 1.55;">
                    ${step}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `).join('')}
      </table>
    `;

    const bodyHtml = `
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 50px; padding: 9px 20px;">
          <span style="color: #16a34a; font-size: 13px; font-weight: 700;">Request received successfully</span>
        </div>
      </div>

      <p style="margin: 0 0 28px 0; color: #334155; font-size: 15px; line-height: 1.7;">
        Hi ${customerName}, thanks for reaching out to <strong>${company.name || companyName}</strong>.
        We have received your request and someone will be in touch with you shortly.
      </p>

      ${buildEmailSection('Your Request Summary', summaryTable)}
      ${customAnswerHtml}
      ${buildEmailSection('What Happens Next', nextStepsHtml)}

      <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
        If you have any questions in the meantime, simply reply to this email and we will get back to you.
      </p>
    `;

    const html = buildEmail({
      companyName: company.name || companyName,
      logoUrl: company.logo_url,
      brandColor: company.email_brand_color_1,
      brandColor2: company.email_brand_color_2,
      bodyHtml,
      phone: company.phone,
      website: company.website,
      preheader: `We received your request for ${displayCategory}. Here is a summary.`,
    });

    await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject: `We received your request — ${company.name || companyName}`,
      html,
    });

    console.log('Confirmation email sent to customer:', customerEmail);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }
}




// ─────────────────────────────────────────────────────────────
// sendPasswordResetEmail
// Sends a password reset link to the user.
// ─────────────────────────────────────────────────────────────
export async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetLink,
  companyName,
}: {
  userEmail: string;
  userName: string;
  resetLink: string;
  companyName: string;
}) {
  try {
    const bodyHtml = `
      <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.7;">
        Hi ${userName}, we received a request to reset your password. Click the button below to create a new one.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${resetLink}"
          style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 800; font-size: 15px;">
          Reset Password
        </a>
      </div>

      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 24px 0; word-break: break-all; color: #3b82f6; font-size: 13px;">${resetLink}</p>

      <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px;">
        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 600; line-height: 1.6;">
          This link expires in 1 hour. If you did not request a password reset you can safely ignore this email.
        </p>
      </div>
    `;

    const html = buildEmail({
      companyName: 'Lead2Project',
      brandColor: '#0f172a',
      brandColor2: '#1e293b',
      bodyHtml,
      preheader: 'Reset your Lead2Project password.',
    });

    await resend.emails.send({
      from: `${companyName} <hello@lead2project.com>`,
      to: userEmail,
      subject: 'Reset Your Password',
      html,
    });

    console.log('Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// sendTeamInviteEmail
// Sends a team invitation email to a new member.
// ─────────────────────────────────────────────────────────────
export async function sendTeamInviteEmail({
  inviteeEmail,
  inviterName,
  companyName,
  inviteLink,
  role,
}: {
  inviteeEmail: string;
  inviterName: string;
  companyName: string;
  inviteLink: string;
  role: string;
}) {
  try {
    const isAdmin = role === 'admin';
    const roleLabel = isAdmin ? 'Admin' : 'Member';
    const roleDescription = isAdmin
      ? 'You will be able to manage leads, team members, and settings.'
      : 'You will be able to view and manage leads.';

    const bodyHtml = `
      <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.7;">
        <strong>${inviterName}</strong> has invited you to join their team at <strong>${companyName}</strong>.
      </p>

      ${buildEmailSection('Your Role', buildEmailTable([
        buildEmailRow('Role', roleLabel),
        buildEmailRow('Access', roleDescription),
      ]))}

      <p style="margin: 0 0 24px 0; color: #334155; font-size: 15px; line-height: 1.7;">
        Click the button below to accept the invitation and set up your account.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${inviteLink}"
          style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 800; font-size: 15px;">
          Accept Invitation
        </a>
      </div>

      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 24px 0; word-break: break-all; color: #3b82f6; font-size: 13px;">${inviteLink}</p>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px 16px;">
        <p style="margin: 0; color: #64748b; font-size: 13px; font-weight: 600;">
          This invitation expires in 24 hours.
        </p>
      </div>
    `;

    const html = buildEmail({
      companyName: 'Lead2Project',
      brandColor: '#0f172a',
      brandColor2: '#1e293b',
      bodyHtml,
      preheader: `${inviterName} invited you to join ${companyName} on Lead2Project.`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: inviteeEmail,
      subject: `You have been invited to join ${companyName}`,
      html,
    });

    console.log('Team invite email sent to:', inviteeEmail);
  } catch (error) {
    console.error('Failed to send team invite email:', error);
    throw error;
  }
}


// ─────────────────────────────────────────────────────────────
// sendQuoteToCustomer
// Sends a branded quote email to the customer with line items
// and accept/decline buttons.
// ─────────────────────────────────────────────────────────────
export async function sendQuoteToCustomer({
  customerEmail,
  customerName,
  companyName,
  companyPhone,
  companyId,
  quoteTotal,
  quoteItems,
  projectDescription,
  quoteToken,
  contractorEmail,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyPhone?: string;
  companyId: number;
  quoteTotal: number;
  quoteItems: Array<{ description: string; quantity?: number; unitPrice?: number; amount: number }>;
  projectDescription?: string;
  quoteToken?: string;
  contractorEmail?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);
    const quoteTemplate = templates.quote;

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const accentColor = company.email_brand_color_1 || '#667eea';
    const accentColor2 = company.email_brand_color_2 || accentColor;

    // Line items table
    const lineItemsHtml = quoteItems.length > 0 ? `
      <div style="margin-bottom: 32px;">
        <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;">
          Quote Breakdown
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
          style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px 14px; text-align: left; color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0;">
                Description
              </th>
              <th style="padding: 10px 14px; text-align: center; color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; width: 50px;">
                Qty
              </th>
              <th style="padding: 10px 14px; text-align: right; color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; width: 90px;">
                Unit
              </th>
              <th style="padding: 10px 14px; text-align: right; color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; width: 90px;">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            ${quoteItems.map((item, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#fafafa'}; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 14px; color: #334155; font-size: 14px;">${item.description}</td>
                <td style="padding: 12px 14px; text-align: center; color: #64748b; font-size: 14px;">${item.quantity ?? 1}</td>
                <td style="padding: 12px 14px; text-align: right; color: #64748b; font-size: 14px;">${item.unitPrice ? fmt(item.unitPrice) : '—'}</td>
                <td style="padding: 12px 14px; text-align: right; color: #334155; font-weight: 600; font-size: 14px;">${fmt(item.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; border-top: 2px solid #e2e8f0;">
              <td colspan="3" style="padding: 14px; text-align: right; color: #475569; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                Total
              </td>
              <td style="padding: 14px; text-align: right; color: ${accentColor}; font-weight: 800; font-size: 20px;">
                ${fmt(quoteTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    ` : '';

    // Accept / Decline buttons
    const acceptDeclineHtml = quoteToken ? `
      <div style="margin: 36px 0; padding: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
        <p style="margin: 0 0 6px 0; color: #1e293b; font-size: 15px; font-weight: 700;">
          Ready to move forward?
        </p>
        <p style="margin: 0 0 24px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
          Review the quote above and let us know your decision.
        </p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
          <tr>
            <td style="padding: 0 8px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/respond?token=${quoteToken}&action=accept"
                style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px; letter-spacing: 0.01em; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
                Accept Quote
              </a>
            </td>
            <td style="padding: 0 8px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/quotes/respond?token=${quoteToken}&action=decline"
                style="display: inline-block; background-color: #ffffff; color: #94a3b8; text-decoration: none; padding: 13px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; border: 1.5px solid #e2e8f0;">
                Decline
              </a>
            </td>
          </tr>
        </table>
      </div>
    ` : '';

    // Render custom email template body
    const variables = {
      company_name: company.name || companyName,
      company_phone: company.phone || companyPhone || null,
      customer_name: customerName,
      quote_total: fmt(quoteTotal),
      project_description: projectDescription || 'Your project',
    };

    const rendered = renderEmailTemplate(quoteTemplate, variables);

    const html = buildEmail({
      companyName: company.name || companyName,
      logoUrl: company.logo_url,
      brandColor: company.email_brand_color_1,
      brandColor2: company.email_brand_color_2,
      bodyHtml: `
        <p style="margin: 0 0 28px 0; color: #334155; font-size: 15px; line-height: 1.7;">${rendered.body.replace(/\n/g, '<br>')}</p>
        ${lineItemsHtml}
        ${acceptDeclineHtml}
      `,
      phone: company.phone || companyPhone,
      website: company.website,
      preheader: `Your quote from ${company.name || companyName} — ${fmt(quoteTotal)}`,
    });

    const emailResult = await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject: rendered.subject,
      html,
    });

    console.log('Quote email sent to customer:', customerEmail);
    return { subject: rendered.subject, html, resendId: emailResult?.data?.id };

  } catch (error) {
    console.error('Failed to send quote email:', error);
    throw error;
  }
}


export async function sendInvoiceToCustomer({
  customerEmail,
  customerName,
  companyName,
  companyPhone,
  companyId,
  invoiceNumber,
  invoiceTotal,
  invoiceItems,
  dueDate,
  notes,
  contractorEmail,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyPhone?: string;
  companyId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  invoiceItems: Array<{ description: string; quantity?: number; unitPrice?: number; amount: number }>;
  dueDate?: string;
  notes?: string;
  contractorEmail?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);

    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const accentColor = company.email_brand_color_1 || '#667eea';

    // ── STEP 1: Generate PDF buffer ───────────────────────
    const { generateInvoicePDFBuffer } = await import('./generateInvoicePDFServer');
    const pdfBuffer = await generateInvoicePDFBuffer({
  invoiceNumber,
  invoiceDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  dueDate,
  companyName: company.name || companyName,
  companyPhone: company.phone || companyPhone,
  companyEmail: company.email || undefined,
  companyLogoUrl: company.logo_url || undefined,  // 👈 add this
  customerName,
  customerEmail,
  lineItems: invoiceItems,
  total: invoiceTotal,
  notes,
});
    

    // ── STEP 2: Upload PDF to Vercel Blob ─────────────────
    const { put } = await import('@vercel/blob');
    const blob = await put(
      `invoices/${invoiceNumber}-${Date.now()}.pdf`,
      Buffer.from(pdfBuffer),
      { access: 'public', contentType: 'application/pdf' }
    );
    const pdfUrl = blob.url;

    // ── STEP 3: Build email HTML sections ─────────────────
    const downloadButtonHtml = `
      <div style="margin-bottom: 28px; text-align: center;">
        <a href="${pdfUrl}"
          style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 800; font-size: 15px;">
          ⬇ Download Invoice PDF
        </a>
        <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 11px;">
          ${invoiceNumber} · ${fmt(invoiceTotal)}
        </p>
      </div>
    `;

    const dueDateHtml = dueDate ? `
      <div style="margin-bottom: 24px; padding: 16px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 700;">
          Payment Due: ${new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    ` : '';

    const notesHtml = notes ? `
      <div style="margin-bottom: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
        <p style="margin: 0 0 4px 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em;">Notes</p>
        <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${notes}</p>
      </div>
    ` : '';

    // ── STEP 4: Build full email ──────────────────────────
    const subject = `Invoice ${invoiceNumber} from ${company.name || companyName}`;

    const html = buildEmail({
      companyName: company.name || companyName,
      logoUrl: company.logo_url,
      brandColor: company.email_brand_color_1,
      brandColor2: company.email_brand_color_2,
      bodyHtml: `
        ${downloadButtonHtml}
        <p style="margin: 0 0 8px 0; color: #334155; font-size: 15px; line-height: 1.7;">
          Hi ${customerName},
        </p>
        <p style="margin: 0 0 28px 0; color: #334155; font-size: 15px; line-height: 1.7;">
          Please find your invoice <strong>${invoiceNumber}</strong> from <strong>${company.name || companyName}</strong> below.
        </p>
        ${dueDateHtml}
        ${notesHtml}
        <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
          If you have any questions, please don't hesitate to reach out.
        </p>
      `,
      phone: company.phone || companyPhone,
      website: company.website,
      preheader: `Invoice ${invoiceNumber} from ${company.name || companyName} — ${fmt(invoiceTotal)}`,
    });

    // ── STEP 5: Send email with PDF attached ──────────────
    const emailResult = await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject,
      html,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer as Uint8Array).toString('base64'),
          contentType: 'application/pdf',
        },
      ],
    });

    console.log('Invoice email sent to customer:', customerEmail);
    return { subject, html, resendId: emailResult?.data?.id };

  } catch (error) {
    console.error('Failed to send invoice email:', error);
    throw error;
  }
}


export async function sendScheduleConfirmation({
  customerEmail,
  customerName,
  companyName,
  companyPhone,
  companyId,
  scheduledDate,
  scheduledTime,
  serviceAddress,
  assignedTo,
  contractorEmail,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyPhone?: string;
  companyId: number;
  scheduledDate: string;
  scheduledTime?: string;
  serviceAddress?: string;
  assignedTo?: string;
  contractorEmail?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);
    const scheduleTemplate = templates.schedule;

    const dateObj = new Date(scheduledDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    let formattedTime = scheduledTime || 'TBD';
    if (scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      formattedTime = `${hour12}:${minutes} ${ampm}`;
    }

    const variables = {
      company_name: company.name || companyName,
      company_phone: company.phone || companyPhone || null,
      customer_name: customerName,
      scheduled_date: formattedDate,
      scheduled_time: formattedTime,
      customer_address: serviceAddress || null,
    };

    const rendered = renderEmailTemplate(scheduleTemplate, variables);

    const scheduleCard = buildEmailTable([
      buildEmailRow('Date', formattedDate),
      buildEmailRow('Time', formattedTime),
      buildEmailRow('Address', serviceAddress || ''),
      buildEmailRow('Assigned To', assignedTo || ''),
    ]);

    const html = buildEmail({
      companyName: company.name || companyName,
      logoUrl: company.logo_url,
      brandColor: company.email_brand_color_1,
      brandColor2: company.email_brand_color_2,
      bodyHtml: `
        <p style="margin: 0 0 28px 0; color: #334155; font-size: 15px; line-height: 1.7;">${rendered.body.replace(/\n/g, '<br>')}</p>
        ${buildEmailSection('Appointment Details', scheduleCard)}
      `,
      phone: company.phone || companyPhone,
      website: company.website,
      preheader: `Your appointment is confirmed for ${formattedDate}.`,
    });

    const emailResult = await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject: rendered.subject,
      html,
    });

    console.log('Schedule confirmation email sent to customer:', customerEmail);
    return { subject: rendered.subject, html, resendId: emailResult?.data?.id };
  } catch (error) {
    console.error('Failed to send schedule confirmation:', error);
    throw error;
  }
}

// Keep all your other email functions below (trial reminders, etc.) - they stay the same
export async function sendTrialEndingReminderEmail({
  companyEmail,
  companyName,
  daysRemaining,
  billingUrl,
}: {
  companyEmail: string;
  companyName: string;
  daysRemaining: number;
  billingUrl: string;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; border-radius: 8px; }
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .warning-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center; }
            .days { font-size: 48px; font-weight: bold; color: #f59e0b; margin: 12px 0; }
            .button { background-color: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .features { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { margin: 12px 0; padding-left: 24px; position: relative; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Your Free Trial is Ending Soon</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="warning-box">
              <div class="days">${daysRemaining} Days Left</div>
              <p style="margin: 8px 0; color: #92400e; font-weight: 600;">Your free trial ends in ${daysRemaining} days</p>
            </div>
            
            <p>We hope you've been enjoying Lead2Project! Your trial is ending soon, but don't worry - you can continue using all features on your current plan.</p>
            
            <div class="features">
              <h3 style="margin-top: 0; color: #333;">What You Keep:</h3>
              <div class="feature">✓ Unlimited lead tracking</div>
              <div class="feature">✓ Professional quote builder</div>
              <div class="feature">✓ Photo uploads from customers</div>
              <div class="feature">✓ Team management</div>
              <div class="feature">✓ Email notifications</div>
            </div>
            
            <p><strong>Your card will be automatically charged on your trial end date.</strong> No action needed!</p>
            
            <center>
  <a href="${billingUrl}" class="button">View Billing Details →</a>
</center>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px; text-align: center;">
              Want to cancel? You can do so anytime from your billing settings.
            </p>
            
            <div class="footer">
              Lead2Project<br>
              Questions? Reply to this email - we're here to help!
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `Your free trial ends in ${daysRemaining} days`,
      html: emailHtml,
    });

    console.log(`✅ Trial reminder (${daysRemaining} days) sent to:`, companyEmail);
  } catch (error) {
    console.error('❌ Failed to send trial reminder:', error);
    throw error;
  }
}

export async function sendPaymentFailedEmail({
  companyEmail,
  companyName,
  updatePaymentUrl,
}: {
  companyEmail: string;
  companyName: string;
  updatePaymentUrl: string;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; border-radius: 8px; }
            h1 { color: #dc2626; font-size: 24px; margin-bottom: 20px; text-align: center; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .alert-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 24px 0; border-radius: 8px; }
            .button { background-color: #dc2626; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Payment Failed</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="alert-box">
              <p style="margin: 0; font-weight: 600; color: #991b1b; text-align: center;">
                We couldn't process your payment
              </p>
            </div>
            
            <p>Your recent subscription payment failed to process. This could be due to:</p>
            
            <ul style="color: #555; line-height: 28px;">
              <li>Insufficient funds</li>
              <li>Expired card</li>
              <li>Card declined by your bank</li>
            </ul>
            
            <p><strong>Don't worry!</strong> Your account is still active for now. Please update your payment method to avoid service interruption.</p>
            
            <center>
              <a href="${updatePaymentUrl}" class="button">Update Payment Method →</a>
            </center>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              We'll automatically retry in a few days. If payment continues to fail, your account will be suspended after 7 days.
            </p>
            
            <div class="footer">
              Lead2Project<br>
              Questions? Reply to this email and we'll help you out!
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: 'Action required: payment failed — Lead2Project',
      html: emailHtml,
    });

    console.log('✅ Payment failed email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send payment failed email:', error);
    throw error;
  }
}

export async function sendSubscriptionActivatedEmail({
  companyEmail,
  companyName,
  dashboardUrl,
}: {
  companyEmail: string;
  companyName: string;
  dashboardUrl: string;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; border-radius: 8px; }
            h1 { color: #10b981; font-size: 24px; margin-bottom: 20px; text-align: center; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center; }
            .button { background-color: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Lead2Project!</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="success-box">
              <p style="margin: 0; font-weight: 600; color: #065f46; font-size: 18px;">
                Your subscription is now active!
              </p>
            </div>
            
            <p>Thank you for subscribing! Your payment has been processed successfully.</p>
            
            <p>You now have full access to all Lead2Project features:</p>
            
            <ul style="color: #555; line-height: 28px;">
              <li>✓ Unlimited lead tracking</li>
              <li>✓ Professional quote builder</li>
              <li>✓ Photo uploads from customers</li>
              <li>✓ Team collaboration</li>
            </ul>
            
            <center>
              <a href="${dashboardUrl}" class="button">Go to Dashboard →</a>
            </center>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              You'll be billed monthly. Manage your subscription anytime from your billing settings.
            </p>
            
            <div class="footer">
              Lead2Project<br>
              Need help? Reply to this email anytime!
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: 'Your subscription is active — Lead2Project',
      html: emailHtml,
    });

    console.log('✅ Subscription activated email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send activation email:', error);
    throw error;
  }
}
export async function sendWelcomeEmail({
  userEmail,
  userName,
  companyName,
  companySlug,
  dashboardUrl,
  formUrl,
  plan = 'basic',
}: {
  userEmail: string;
  userName: string;
  companyName: string;
  companySlug: string;
  dashboardUrl: string;
  formUrl: string;
  plan?: 'basic' | 'pro';
}) {
  const planDetails = {

    basic: {
      label: 'Basic',
      price: '$49.99/mo',
      features: ['Everything in Free', 'Scheduling and quotes', 'Job categories and tasks', 'CSV export'],
      color: '#2563eb', // Deeper Blue
    },
    pro: {
      label: 'Pro',
      price: '$79.99/mo',
      features: ['Everything in Basic', 'One-click emails', 'AI quote generator', 'Daily digest', 'Email outbox'],
      color: '#0f172a', // Professional Slate
    },
  }[plan];

  try {
    const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/admin/settings`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);max-width:600px;width:100%;border:1px solid #e2e8f0;">

                <tr>
                  <td style="padding:48px 40px 32px;text-align:center;">
                    <div style="display:inline-block;background:#eff6ff;padding:12px;border-radius:16px;margin-bottom:24px;">
                      <img src="https://lead2project.com/Lead2ProjectLogo.png" width="40" height="40" alt="L2P" style="display:block;">
                    </div>
                    <p style="margin:0 0 8px 0;color:#3b82f6;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Subscription Active</p>
                    <h1 style="margin:0;color:#0f172a;font-size:30px;font-weight:900;line-height:1.2;letter-spacing:-0.5px;">You're all set, ${userName}!</h1>
                    <p style="margin:16px 0 0 0;color:#64748b;font-size:16px;">Everything you need for <strong style="color:#0f172a;">${companyName}</strong> is ready to go.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px 32px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;">
                            <p style="margin:0 0 2px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Your Selected Plan</p>
                            <p style="margin:0;font-size:20px;font-weight:900;color:#0f172a;">${planDetails.label} <span style="font-size:14px;font-weight:500;color:#94a3b8;">${planDetails.price}</span></p>
                          </td>
                          <td style="text-align:right;vertical-align:middle;">
                            <span style="display:inline-block;background:#0f172a;color:#fff;padding:8px 16px;border-radius:12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">14-day trial</span>
                          </td>
                        </tr>
                      </table>
                      <div style="border-top:1px solid #e2e8f0;margin-top:16px;padding-top:16px;">
                        ${planDetails.features.map(f =>
                          `<div style="padding:4px 0;font-size:13px;color:#475569;font-weight:500;">
                            <span style="color:#10b981;font-weight:900;">&#10003;</span>&nbsp;&nbsp;${f}
                          </div>`
                        ).join('')}
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px;">
                    <h2 style="margin:0 0 16px 0;color:#0f172a;font-size:18px;font-weight:900;">Quick Access Links</h2>

                    <div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:16px;padding:20px;margin-bottom:16px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#166534;">Booking Form</p>
                      <p style="margin:0 0 12px 0;font-size:13px;color:#374151;line-height:1.5;">Share this with customers to capture leads instantly.</p>
                      <a href="${formUrl}" style="color:#16a34a;text-decoration:none;font-weight:800;font-size:13px;word-break:break-all;">${formUrl}</a>
                    </div>

                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:32px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#1e40af;">Dashboard</p>
                      <p style="margin:0 0 12px 0;font-size:13px;color:#374151;line-height:1.5;">Manage leads, quotes, schedules, and payments.</p>
                      <a href="${dashboardUrl}" style="color:#2563eb;text-decoration:none;font-weight:800;font-size:13px;word-break:break-all;">${dashboardUrl}</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px;">
                    <h2 style="margin:0 0 16px 0;color:#0f172a;font-size:18px;font-weight:900;">Setup Checklist</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        { title: 'Service Categories', desc: 'Roofing, Plumbing, HVAC — each with its own tasks.' },
                        { title: 'Pricing Templates', desc: 'Pre-fill quote line items for faster bidding.' },
                        { title: 'Task Checklists', desc: 'Automatic steps for your team on every job.' },
                        { title: 'Brand Identity', desc: 'Upload your logo to appear on all customer emails.' },
                      ].map(item => `
                        <tr>
                          <td style="padding:0 0 12px 0;">
                            <div style="background:#ffffff;border:1px solid #f1f5f9;border-radius:12px;padding:16px;">
                                  <p style="margin:0 0 4px 0;font-size:14px;font-weight:800;color:#0f172a;">${item.title}</p>
                                  <p style="margin:0;font-size:13px;color:#64748b;line-height:1.4;">${item.desc}</p>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px 48px;text-align:center;">
                    <a href="${settingsUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:18px 42px;border-radius:16px;font-weight:900;font-size:15px;box-shadow:0 10px 15px -3px rgba(15,23,42,0.2);">
                      Complete Your Setup
                    </a>
                    <p style="margin:16px 0 0 0;font-size:12px;color:#94a3b8;font-weight:500;">Takes about 5 minutes to fully customize your brand.</p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:500;line-height:1.8;">
                      Lead2Project &copy; 2026 — The CRM for the Trades.<br>
                      Questions? Just reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: userEmail,
      subject: `Welcome to Lead2Project — Your ${planDetails.label} dashboard is ready`,
      html: emailHtml,
    });

    console.log('✅ Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
}


export async function sendSubscriptionCancelledEmail({
  companyEmail,
  companyName,
}: {
  companyEmail: string;
  companyName: string;
}) {
  const resubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`;

  try {
    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `Your Lead2Project access has ended`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f9fc;margin:0;padding:0;">
            <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
              <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:28px 32px;">
                <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Your Access Has Ended</h1>
                <p style="margin:8px 0 0 0;color:#fca5a5;font-size:14px;">${companyName}</p>
              </div>
              <div style="padding:32px;">
                <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:20px;margin-bottom:24px;">
                  <p style="margin:0;font-size:15px;color:#991b1b;font-weight:600;">
                    Your Lead2Project subscription has fully ended. Your dashboard is now deactivated.
                  </p>
                </div>
                <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:8px;">
                  Your account data is still safe. If you reactivate, everything will be exactly as you left it.
                </p>
                <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px;">
                  We'd love to have you back — and we'd love to know how we can do better. Reply to this email anytime.
                </p>
                <div style="text-align:center;">
                  <a href="${resubUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">
                    Reactivate Your Account →
                  </a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;">
                  Lead2Project · We hope to see you again soon
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Access ended email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send access ended email:', error);
    throw error;
  }
}





// 🔔 Send follow-up reminder email to team
export async function sendFollowUpReminderEmail({
  recipientEmail,
  recipientName,
  companyName,
  companySlug,
  leads,
}: {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  companySlug: string;
  leads: Array<{
    id: number;
    customer_name: string;
    customer_email?: string;
    customer_phone?: string;
    status: string;
    category: string;
    reason: string;
    type: string;
  }>;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard`;

    const leadsHtml = leads.map((lead) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px;">
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">
            ${lead.customer_name}
          </div>
          <div style="font-size: 13px; color: #64748b;">
            ${lead.customer_email || ''} ${lead.customer_phone ? `• ${lead.customer_phone}` : ''}
          </div>
        </td>
        <td style="padding: 16px;">
          <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;">
            ${lead.category}
          </div>
          <div style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
            ${lead.status}
          </div>
        </td>
        <td style="padding: 16px;">
          <div style="font-size: 13px; color: #ef4444; font-weight: 500;">
            ${lead.reason}
          </div>
        </td>
        <td style="padding: 16px; text-align: right;">
          <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: white; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;">
            View Lead
          </a>
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 800px; border-radius: 12px; }
            h1 { color: #1e293b; font-size: 28px; margin-bottom: 12px; }
            .stats { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center; }
            .stats-number { font-size: 48px; font-weight: bold; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Follow-up Reminders</h1>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 24px;">
              Good morning ${recipientName}! You have leads waiting for follow-up.
            </p>
            
            <div class="stats">
              <div class="stats-number">${leads.length}</div>
              <div style="font-size: 18px; font-weight: 600;">Lead${leads.length > 1 ? 's' : ''} Need Your Attention</div>
            </div>

            <table>
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Customer
                  </th>
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Status
                  </th>
                  <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    Action Needed
                  </th>
                  <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                    
                  </th>
                </tr>
              </thead>
              <tbody>
                ${leadsHtml}
              </tbody>
            </table>

            <center style="margin-top: 32px;">
              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                View All Leads in Dashboard →
              </a>
            </center>

            <div class="footer">
              ${companyName}<br>
              You're receiving this because you have follow-up reminders enabled.<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/admin/settings" style="color: #3b82f6; text-decoration: none;">Manage notification settings</a>
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
from: 'Lead2Project <hello@lead2project.com>',
      to: recipientEmail,
      subject: `${leads.length} Lead${leads.length > 1 ? 's' : ''} Need Follow-up - ${companyName}`,
      html: emailHtml,
    });

    console.log('✅ Follow-up reminder email sent to:', recipientEmail);
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    throw error;
  }
}
export async function sendPaymentReminderEmail({
  customerEmail,
  customerName,
  companyName,
  companyPhone,
  companyId,
  amountDue,
  dueDate,
  isOverdue,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyPhone?: string;
  companyId?: number;
  amountDue: number;
  dueDate: string | null;  // ← fix the type
  isOverdue: boolean;
  contractorEmail?: string;
}) {
  try {
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    // ← format only if dueDate is a real value
    const formattedDate = dueDate && dueDate !== 'null'
      ? (() => {
          const [year, month, day] = String(dueDate).split('T')[0].split('-').map(Number);
          return new Date(year, month - 1, day).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
          });
        })()
      : null;

    let company: any = {};
    let emailHtml: string;
    let subject: string;

    if (companyId) {
      company = await getCompanyDetails(companyId);
      const templates = await getCompanyEmailTemplates(companyId);
      const paymentTemplate = templates.payment;

      const variables = {
        company_name: company.name || companyName,
        company_phone: company.phone || companyPhone || null,
        customer_name: customerName,
        payment_amount: fmt(amountDue),
        amount_due: fmt(amountDue),
        due_date: formattedDate,  // null if no due date → conditional block strips the line
      };

      const rendered = renderEmailTemplate(paymentTemplate, variables);
      subject = rendered.subject;
      emailHtml = textToHtml(
  rendered.body,
  company.name || companyName,
  company.logo_url || undefined,
  company.phone || companyPhone || undefined,
  company.website || undefined,           // ← was undefined before
  company.email_brand_color_1 || undefined,
  company.email_brand_color_2 || undefined,
);

    } else {
      const accentColor = isOverdue ? '#dc2626' : '#f59e0b';
      subject = isOverdue
        ? `Payment Overdue - ${companyName}`
        : `Payment Reminder - ${companyName}`;
      emailHtml = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;">
        <h2 style="color:${accentColor};">${isOverdue ? 'Payment Overdue' : 'Payment Reminder'}</h2>
        <p>Hi ${customerName},</p>
        <p>Amount due: <strong>${fmt(amountDue)}</strong>${formattedDate ? ` by ${formattedDate}` : ''}</p>
        <p>${companyPhone ? `Call us: ${companyPhone}` : ''}</p>
        <p>${companyName}</p>
      </body></html>`;
    }

    const emailResult = await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject,
      html: emailHtml,
    });

    console.log('✅ Payment reminder sent to:', customerEmail);
    return { subject, html: emailHtml, resendId: emailResult?.data?.id };
  } catch (error) {
    console.error('❌ Failed to send payment reminder:', error);
    throw error;
  }
}


// 📋 Daily digest email to contractor
// Replace the existing sendDailyDigestEmail function in /lib/email.ts with this

export async function sendDailyDigestEmail({
  companyEmail,
  companyName,
  companySlug,
  todayJobs,
  staleLeads,
  staleQuotes,
  unpaidJobs,
  overduePayments,
  dueSoon,
  followUpReminders = [],
}: {
  companyEmail: string;
  companyName: string;
  companySlug: string;
  todayJobs: Array<{ customer_name: string; customer_phone?: string; scheduled_time?: string; assigned_to?: string; project_number?: number; category?: string }>;
  staleLeads: Array<{ name: string; category?: string; status?: string; updated_at?: string }>;
  staleQuotes: Array<{ customer_name: string; project_number?: number; quote_total?: string; quote_sent_at?: string }>;
  unpaidJobs: Array<{ customer_name: string; project_number?: number; quote_total?: string; scheduled_date?: string }>;
  overduePayments: Array<{ customer_name: string; project_number?: number; quote_total?: string; payment_amount?: string; payment_due_date?: string }>;
  dueSoon: Array<{ customer_name: string; project_number?: number; quote_total?: string; payment_amount?: string; payment_due_date?: string }>;
  followUpReminders?: Array<{ customer_name: string; customer_phone?: string; category?: string; project_number?: number; follow_up_date?: string; follow_up_notes?: string }>;
}) {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard`;
    const fmt = (n: string | number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));
    const fmtDate = (d: string) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fmtTime = (t?: string) => {
      if (!t) return '';
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const totalItems =
      todayJobs.length + staleLeads.length + staleQuotes.length +
      unpaidJobs.length + overduePayments.length + dueSoon.length +
      followUpReminders.length;

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });

    // ── section builder ──
    const section = (
      title: string,
      color: string,
      rows: string[]
    ) => rows.length === 0 ? '' : `
      <div style="margin-bottom: 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px; border-bottom: 2px solid ${color}20;">
          <tr>
            <td style="padding-bottom: 8px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>
              <span style="color: ${color}; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                ${title}
              </span>
              <span style="font-weight: 400; color: #94a3b8; font-size: 13px;"> (${rows.length})</span>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${rows.join('')}
        </table>
      </div>
    `;

    const row = (left: string, right: string, accent = '#f8fafc') => `
      <tr style="border-bottom: 1px solid #f1f5f9; background: ${accent};">
        <td style="padding: 10px 12px; color: #334155; font-size: 14px;">${left}</td>
        <td style="padding: 10px 12px; color: #64748b; font-size: 13px; text-align: right; white-space: nowrap;">${right}</td>
      </tr>
    `;

    const todayRows = todayJobs.map(j =>
      row(
        `<strong>${j.customer_name}</strong>${j.category ? ` <span style="color:#94a3b8;">· ${j.category}</span>` : ''}`,
        `${j.scheduled_time ? fmtTime(j.scheduled_time) : 'Time TBD'}${j.assigned_to ? ` · ${j.assigned_to}` : ''}`
      )
    );

    const staleLeadRows = staleLeads.map(l =>
      row(
        `<strong>${l.name}</strong>${l.category ? ` <span style="color:#94a3b8;">· ${l.category}</span>` : ''}`,
        l.status || 'new'
      )
    );

    const quoteRows = staleQuotes.map(q =>
      row(
        `<strong>${q.customer_name}</strong>${q.project_number ? ` <span style="color:#94a3b8;">#${q.project_number}</span>` : ''}`,
        `${q.quote_total ? fmt(q.quote_total) : ''} · sent ${q.quote_sent_at ? fmtDate(q.quote_sent_at) : ''}`
      )
    );

    const unpaidRows = unpaidJobs.map(j =>
      row(
        `<strong>${j.customer_name}</strong>${j.project_number ? ` <span style="color:#94a3b8;">#${j.project_number}</span>` : ''}`,
        `${j.quote_total ? fmt(j.quote_total) : ''} · job ${j.scheduled_date ? fmtDate(j.scheduled_date) : ''}`
      )
    );

    const overdueRows = overduePayments.map(p => {
      const total = parseFloat(p.quote_total || '0');
      const paid = parseFloat(p.payment_amount || '0');
      const owed = paid > 0 ? Math.max(total - paid, 0) : total;
      return row(
        `<strong>${p.customer_name}</strong>${p.project_number ? ` <span style="color:#94a3b8;">#${p.project_number}</span>` : ''}`,
        `<span style="color:#ef4444;font-weight:700;">${fmt(owed)}</span> · due ${p.payment_due_date ? fmtDate(p.payment_due_date) : ''}`,
        '#fff5f5'
      );
    });

    const dueSoonRows = dueSoon.map(p => {
      const total = parseFloat(p.quote_total || '0');
      const paid = parseFloat(p.payment_amount || '0');
      const owed = paid > 0 ? Math.max(total - paid, 0) : total;
      return row(
        `<strong>${p.customer_name}</strong>${p.project_number ? ` <span style="color:#94a3b8;">#${p.project_number}</span>` : ''}`,
        `${fmt(owed)} · due ${p.payment_due_date ? fmtDate(p.payment_due_date) : ''}`
      );
    });

    const followUpRows = followUpReminders.map(r =>
      row(
        `<strong>${r.customer_name}</strong>${r.category ? ` <span style="color:#94a3b8;">· ${r.category}</span>` : ''}${r.follow_up_notes ? `<br><span style="color:#94a3b8;font-size:12px;">${r.follow_up_notes}</span>` : ''}`,
        r.follow_up_date ? fmtDate(r.follow_up_date) : 'Today'
      )
    );

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f9fc;padding:32px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:28px 32px;">
                    <p style="margin:0 0 4px 0;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${today}</p>
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Good morning — here's your day</h1>
                    <p style="margin:6px 0 0 0;color:#64748b;font-size:14px;">${companyName} · ${totalItems} item${totalItems !== 1 ? 's' : ''} need attention</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px;">

                    ${section("Today's Jobs", '#3b82f6', todayRows)}
    ${section('Follow-up Reminders', '#8b5cf6', followUpRows)}
    ${section('Overdue Payments', '#ef4444', overdueRows)}
    ${section('Collect Payment', '#f97316', unpaidRows)}
    ${section('Due This Week', '#f59e0b', dueSoonRows)}
    ${section('Quote Follow-up', '#eab308', quoteRows)}
    ${section('Stale Leads', '#6366f1', staleLeadRows)}

                    <!-- CTA -->
                    <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;">
                      <a href="${dashboardUrl}"
                        style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;">
                        Open Dashboard →
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                      ${companyName} · Daily Digest<br>
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/admin/settings" style="color:#6366f1;">Manage notification settings</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `${today} — ${totalItems} item${totalItems !== 1 ? 's' : ''} need attention · ${companyName}`,
      html: emailHtml,
    });

    console.log('✅ Daily digest sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send daily digest:', error);
    throw error;
  }
}

// ✅ Notify contractor when customer accepts a quote
// ADD THIS to the end of lib/email.ts

export async function sendQuoteAcceptedNotification({
  companyEmail,
  companyName,
  companySlug,
  customerName,
  customerEmail,
  quoteTotal,
  projectId,
}: {
  companyEmail: string;
  companyName: string;
  companySlug: string;
  customerName: string;
  customerEmail: string;
  quoteTotal: number;
  projectId: number;
}) {
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard`;

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `${customerName} accepted your quote — ${fmt(quoteTotal)}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f9fc;margin:0;padding:0;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px;">
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Quote Accepted!</h1>
              <p style="margin:8px 0 0 0;color:#d1fae5;font-size:14px;">${customerName} just accepted your quote</p>
            </div>
            <div style="padding:32px;">
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#6b7280;text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Quote Total</p>
                <p style="margin:0;font-size:32px;font-weight:800;color:#10b981;">${fmt(quoteTotal)}</p>
                <p style="margin:8px 0 0 0;font-size:14px;color:#374151;">Customer: <strong>${customerName}</strong> · ${customerEmail}</p>
              </div>
              <p style="color:#64748b;font-size:14px;margin-bottom:24px;">Time to schedule their appointment. Click below to open their project.</p>
              <div style="text-align:center;">
                <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">
                  Schedule Now →
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}



export async function sendCancellationScheduledEmail({
  companyEmail,
  companyName,
  accessUntil,
  isTrialing,
}: {
  companyEmail: string;
  companyName: string;
  accessUntil: string; // always pass ISO format: "2025-04-15"
  isTrialing: boolean;
}) {
  const resubUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`;
  const accessDate = new Date(accessUntil + 'T00:00:00'); // force local midnight, avoids timezone shift
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((accessDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const accessUntilFormatted = accessDate.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `You still have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} of access — Lead2Project`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f6f9fc;margin:0;padding:0;">
          <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
            <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:28px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Cancellation Confirmed</h1>
              <p style="margin:8px 0 0 0;color:#94a3b8;font-size:14px;">We're sorry to see you go, ${companyName}</p>
            </div>
            <div style="padding:32px;">

              <!-- Days remaining hero -->
              <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:24px;margin-bottom:24px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:13px;color:#92400e;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                  You still have full access for
                </p>
                <p style="margin:0;font-size:48px;font-weight:800;color:#78350f;line-height:1.1;">${daysLeft}</p>
                <p style="margin:0;font-size:20px;font-weight:700;color:#92400e;">more day${daysLeft !== 1 ? 's' : ''}</p>
                <p style="margin:12px 0 0 0;font-size:14px;color:#92400e;">
                  ${isTrialing ? 'Trial access' : 'Full access'} until <strong>${accessUntil}</strong>
                </p>
              </div>

              <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:16px;">
                Your cancellation is confirmed. You won't be charged again, and you can keep using 
                everything until <strong>${accessUntil}</strong>.
              </p>
              <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px;">
                After that, your dashboard will be deactivated. Changed your mind? 
                Reactivate anytime before your access ends — no setup required.
              </p>

              <div style="text-align:center;">
                <a href="${resubUrl}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:15px;">
                  Reactivate Subscription →
                </a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}




export async function sendPlanChangedEmail({
  companyEmail,
  companyName,
  previousPlan,
  newPlan,
  effective,
  periodEnd,
  dashboardUrl,
}: {
  companyEmail: string;
  companyName:  string;
  previousPlan: string;
  newPlan:      string;
  effective:    'immediate' | 'period_end';
  periodEnd?:   string;
  dashboardUrl: string;
}) {
  const PLAN_ORDER = ['free', 'basic', 'pro'];
  const isUpgrade = PLAN_ORDER.indexOf(newPlan) > PLAN_ORDER.indexOf(previousPlan);
  const planLabel = (p: string) =>
    ({ free: 'Free', basic: 'Basic', pro: 'Pro' }[p] || p);

  const subject = isUpgrade
    ? `Plan upgraded to ${planLabel(newPlan)} — Lead2Project`
    : `Downgrade to ${planLabel(newPlan)} scheduled — Lead2Project`;

  const bodyText = isUpgrade
    ? `Your plan has been upgraded from <strong>${planLabel(previousPlan)}</strong> to <strong>${planLabel(newPlan)}</strong>. Your new features are available right now.`
    : `Your plan will change from <strong>${planLabel(previousPlan)}</strong> to <strong>${planLabel(newPlan)}</strong> on <strong>${periodEnd}</strong>. You keep full ${planLabel(previousPlan)} access until then.`;

  const featuresByPlan: Record<string, string[]> = {
    free:    ['Booking link & QR code', 'Basic form', 'Lead dashboard', 'Create leads manually'],
    basic:   ['Everything in Free', 'Custom form & branding', 'Scheduling and quotes', 'Job categories and tasks', 'CSV export'],
    pro:     ['Everything in Basic', 'One-click emails (quote, schedule, reminder)', 'AI quote generator and brief', 'Daily digest email', 'Email outbox'],
  };

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to:   companyEmail,
    subject,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
    <div style="background:${isUpgrade ? '#10b981' : '#475569'};padding:28px 32px;">
      <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.7);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Lead2Project</p>
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">${isUpgrade ? 'Plan Upgraded' : 'Plan Change Scheduled'}</h1>
      <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${companyName}</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px 0;">${bodyText}</p>

      <div style="background:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;">${planLabel(newPlan)} plan includes</p>
        ${(featuresByPlan[newPlan] || []).map(f =>
          `<div style="padding:4px 0;font-size:14px;color:#374151;">&#10003;&nbsp;&nbsp;${f}</div>`
        ).join('')}
      </div>

      ${!isUpgrade && periodEnd ? `
      <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
          <strong>Access until ${periodEnd}.</strong> After that, features not included in ${planLabel(newPlan)} will be disabled. You can upgrade again anytime.
        </p>
      </div>` : ''}

      <div style="text-align:center;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#1e293b;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:14px;">Go to Dashboard</a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">Lead2Project — questions? Reply to this email.</p>
    </div>
  </div>
</body>
</html>`,
  });
}


// ─── ADD THIS FUNCTION TO YOUR lib/email.ts ───

export async function sendPaymentReceiptEmail({
  companyEmail,
  companyName,
  amountPaid,
  invoiceDate,
  planTier,
  nextBillingDate,
  dashboardUrl,
  invoiceUrl,
}: {
  companyEmail: string;
  companyName: string;
  amountPaid: string;
  invoiceDate: string;
  planTier: string;
  nextBillingDate: string | null;
  dashboardUrl: string;
  invoiceUrl: string | null;
}) {
  const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1);

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `Payment received - $${amountPaid}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
        <div style="margin-bottom: 32px;">
          <img src="https://lead2project.com/Lead2ProjectLogo.png" alt="Lead2Project" style="width: 36px; height: 36px;" />
        </div>

        <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">
          Payment received
        </h1>
        <p style="font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.6;">
          Hi ${companyName}, your payment has been processed successfully. Here are the details.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 28px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Amount</td>
              <td style="padding: 8px 0; font-size: 16px; color: #0f172a; font-weight: 700; text-align: right;">$${amountPaid}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Plan</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0f172a; text-align: right;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Date</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0f172a; text-align: right;">${invoiceDate}</td>
            </tr>
            ${nextBillingDate ? `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #94a3b8; font-weight: 600;">Next billing</td>
              <td style="padding: 8px 0; font-size: 14px; color: #0f172a; text-align: right;">${nextBillingDate}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="margin-bottom: 28px;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Go to Dashboard
          </a>
          ${invoiceUrl ? `
          <a href="${invoiceUrl}" style="display: inline-block; font-size: 14px; font-weight: 600; color: #2563eb; padding: 12px 24px; text-decoration: none;">
            View Invoice
          </a>
          ` : ''}
        </div>

        <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">
          Thank you for using Lead2Project. If you have any questions about your billing, reply to this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;" />
        <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
          Lead2Project - Job management for contractors
        </p>
      </div>
    `,
  });
}


export async function sendFreeWelcomeEmail({
  userEmail,
  userName,
  companyName,
  companySlug,
  dashboardUrl,
  formUrl,
}: {
  userEmail: string;
  userName: string;
  companyName: string;
  companySlug: string;
  dashboardUrl: string;
  formUrl: string;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 15px -3px rgba(0,0,0,0.05);max-width:600px;width:100%;border:1px solid #e2e8f0;">

                <tr>
                  <td style="padding:48px 40px 32px;text-align:center;background:#ffffff;">
                    <div style="display:inline-block;background:#eff6ff;padding:12px;border-radius:16px;margin-bottom:24px;">
                      <img src="https://lead2project.com/Lead2ProjectLogo.png" width="40" height="40" alt="L2P" style="display:block;">
                    </div>
                    <p style="margin:0 0 8px 0;color:#3b82f6;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;">Onboarding Complete</p>
                    <h1 style="margin:0;color:#0f172a;font-size:30px;font-weight:900;line-height:1.2;letter-spacing:-0.5px;">Welcome, ${userName}!</h1>
                    <p style="margin:16px 0 0 0;color:#64748b;font-size:16px;line-height:1.6;">Your free account for <strong style="color:#0f172a;">${companyName}</strong> is officially active.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px;">
                    <div style="height:1px;background:#f1f5f9;width:100%;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px 0;">
                    <h2 style="margin:0 0 12px 0;color:#0f172a;font-size:18px;font-weight:800;">The Workflow</h2>
                    <p style="margin:0 0 24px 0;font-size:15px;color:#64748b;line-height:1.6;">Share your link. Customers book. Leads hit your dashboard. It's that simple.</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px 16px;">
                    <div style="background:#f0fdf4;border:1px solid #dcfce7;border-radius:20px;padding:24px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#166534;">Your Booking Link</p>
                      <p style="margin:0 0 16px 0;font-size:13px;color:#374151;line-height:1.5;">Print this on your truck or yard signs to capture more leads.</p>
                      <a href="${formUrl}" style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:800;font-size:14px;box-shadow:0 4px 6px rgba(16,185,129,0.1);">
                        View Booking Page
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 40px 16px;">
                    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:24px;">
                      <p style="margin:0 0 4px 0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#1e40af;">Manage Leads</p>
                      <p style="margin:0 0 16px 0;font-size:13px;color:#374151;line-height:1.5;">Check this often to see new requests and customer details.</p>
                      <a href="${dashboardUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:12px;font-weight:800;font-size:14px;box-shadow:0 4px 6px rgba(15,23,42,0.1);">
                        Open Dashboard
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:16px 40px 48px;">
                    <div style="background:#ffffff;border:2px dashed #cbd5e1;border-radius:20px;padding:28px;text-align:center;">
                      <p style="margin:0 0 8px 0;font-size:16px;font-weight:900;color:#0f172a;">Ready to grow your business?</p>
                      <p style="margin:0 0 20px 0;font-size:14px;color:#64748b;line-height:1.5;">Upgrade to professional tools like AI-generated quotes, job scheduling, and payment tracking.</p>
                      <a href="${dashboardUrl.replace('/dashboard', '/admin/settings?tab=billing')}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:800;font-size:14px;box-shadow:0 4px 10px rgba(59,130,246,0.2);">
                        Explore Pro Features
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px;background:#f8fafc;text-align:center;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;font-weight:500;line-height:1.8;">
                      Lead2Project &copy; 2026 — Built for the trades.<br>
                      Need help? Just reply to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: userEmail,
      subject: `Welcome to Lead2Project — Your booking link is ready`,
      html: emailHtml,
    });

    console.log('✅ Free welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Failed to send free welcome email:', error);
    throw error;
  }
}