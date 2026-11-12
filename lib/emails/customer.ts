// Emails a contractor's CUSTOMERS receive (sent in the contractor's name).
//
// Each email with an editable template is split in two:
//   build…Email()  → { subject, html }. Pure: no database, no sending.
//   send…()        → loads the company + saved template, calls the builder, sends.
// The Settings → Emails live preview calls the same builders with sample
// data, so the preview and the real email can't drift apart.
import {
  buildEmail,
  buildEmailRow,
  buildEmailTable,
  buildEmailSection,
  buildCustomAnswers,
  buildAttachmentSummary,
  buildButton,
  buildHeading,
  buildParagraph,
  buildNotice,
  buildAmount,
  buildSteps,
  EMAIL,
} from '@/lib/emailBase';
import {
  resend,
  sql,
  getCompanyDetails,
  formatCategory,
  BLOCK_REQUEST_SUMMARY,
  BLOCK_REVIEW_BUTTON,
  renderTemplateBody,
  fmtUSD,
  buildLineItems,
  PAY_LABELS,
} from './shared';
import { getCompanyEmailTemplates, renderEmailTemplate } from '@/lib/emailTemplates';
import { timingSummary } from '@/lib/timing';

/** The company fields the builders need. */
export type EmailCompany = {
  name: string;
  logo_url?: string | null;
  phone?: string | null;
  website?: string | null;
  payment_link_url?: string | null;
  payment_link_type?: string | null;
};

export type EmailTemplateText = { subject: string; body: string };
export type BuiltEmail = { subject: string; html: string };

const frame = (company: EmailCompany, phone?: string | null) => ({
  companyName: company.name,
  logoUrl: company.logo_url,
  phone: company.phone || phone,
  website: company.website,
});


// ═════════════════════════════════════════════════════════════
// Lead confirmation
// ═════════════════════════════════════════════════════════════

export type LeadConfirmationData = {
  customerName: string;
  category: string;
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
  testMode?: boolean;
};

export function buildLeadConfirmationEmail(
  company: EmailCompany,
  template: EmailTemplateText | undefined,
  d: LeadConfirmationData
): BuiltEmail {
  const name = company.name;
  const displayCategory = formatCategory(d.category);
  const fullAddress = [d.address, d.addressLine2, d.city, d.zipCode].filter(Boolean).join(', ');
  const attachmentText = buildAttachmentSummary(d.fileUrls);
  const timing = timingSummary(d.preferredDate, d.preferredTime);

  const summaryTable = buildEmailTable([
    buildEmailRow('Service', displayCategory),
    buildEmailRow('Address', fullAddress),
    timing ? buildEmailRow('Timing', timing) : '',
    buildEmailRow('Details', d.description || ''),
    buildEmailRow('Attached', attachmentText),
  ]);

  const summaryHtml =
    buildEmailSection('Your Request', summaryTable) +
    buildCustomAnswers(d.customAnswers, d.customQuestions);

  // Custom template: {request_summary} drops the summary wherever the
  // contractor put it. Otherwise the summary always shows.
  let introHtml: string;
  if (template?.body) {
    const text = renderEmailTemplate(template, {
      company_name: name,
      company_phone: company.phone || '',
      customer_name: d.customerName,
      request_summary: BLOCK_REQUEST_SUMMARY,
    }).body;
    introHtml = text.includes(BLOCK_REQUEST_SUMMARY)
      ? renderTemplateBody(text, { [BLOCK_REQUEST_SUMMARY]: summaryHtml })
      : renderTemplateBody(text) + summaryHtml;
  } else {
    introHtml =
      buildParagraph(`Hi ${d.customerName}, thanks for reaching out. We got your request and will be in touch soon.`) +
      summaryHtml;
  }

  const bodyHtml = `
    ${d.testMode ? buildNotice('<strong>Test preview.</strong> This is what customers get after using your booking form. No lead was created.', 'info') : ''}
    ${buildHeading('Request received', displayCategory)}
    ${introHtml}
    ${buildEmailSection('What happens next', buildSteps([
      'We review your request and confirm availability.',
      'We reach out to go over the details.',
      'We get the job done.',
    ]))}
    <p style="margin: 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
      Questions in the meantime? Just reply to this email.
    </p>
  `;

  const subject = template?.subject
    ? renderEmailTemplate(template, { company_name: name, customer_name: d.customerName }).subject
    : `We received your request — ${name}`;

  return {
    subject: d.testMode ? `[Test] ${subject}` : subject,
    html: buildEmail({
      ...frame(company),
      bodyHtml,
      preheader: `We received your request for ${displayCategory}. Here is a summary.`,
    }),
  };
}

export async function sendLeadConfirmationEmail({
  customerEmail,
  companyName,
  companyId,
  ...data
}: LeadConfirmationData & {
  customerEmail: string;
  companyName: string;
  companyId: number;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);
    const { subject, html } = buildLeadConfirmationEmail(
      { ...company, name: company.name || companyName },
      templates?.lead_confirmation,
      data
    );

    await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject,
      html,
    });

    console.log('Confirmation email sent to customer:', customerEmail);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    if (data.testMode) throw error;
  }
}


// ═════════════════════════════════════════════════════════════
// Quote
// ═════════════════════════════════════════════════════════════

export type QuoteEmailData = {
  customerName: string;
  companyPhone?: string;
  quoteTotal: number;
  quoteItems: Array<{ description: string; quantity?: number; unitPrice?: number; amount: number }>;
  projectDescription?: string;
  quoteToken?: string;
  taxRate?: number;
  /** Shown so the customer knows what's due before accepting. Display only. */
  depositAmount?: number;
  depositLabel?: string;
  /** True when the company auto-sends the deposit request on accept. */
  depositPayOnAccept?: boolean;
  /** YYYY-MM-DD the deposit is due, picked in the Send quote dialog. */
  depositDueDate?: string;
};

export function buildQuoteEmail(
  company: EmailCompany,
  template: EmailTemplateText,
  d: QuoteEmailData
): BuiltEmail {
  const name = company.name;
  const fmt = fmtUSD;
  const { quoteTotal, quoteItems, taxRate, depositLabel } = d;

  // The route passes the raw category ("kitchen_remodel"); show it as
  // "Kitchen Remodel". Real descriptions with spaces are left alone.
  const projectLabel = d.projectDescription
    ? (/^[a-z0-9_]+$/.test(d.projectDescription) ? formatCategory(d.projectDescription) : d.projectDescription)
    : null;

  const dep = d.depositAmount ?? 0;
  const hasDeposit = dep > 0 && dep < quoteTotal;
  const dueText = hasDeposit && d.depositDueDate && /^\d{4}-\d{2}-\d{2}$/.test(d.depositDueDate)
    ? new Date(d.depositDueDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
    : null;

  const amountHtml = buildAmount(
    'Quote total',
    fmt(quoteTotal),
    hasDeposit
      ? `${fmt(dep)} deposit${depositLabel ? ` (${depositLabel})` : ''} to get started${dueText ? `, due by ${dueText}` : ''} · ${fmt(quoteTotal - dep)} when the job is done`
      : null
  );

  const totals: Array<{ label: string; value: string; strong?: boolean }> = [];
  if (taxRate && taxRate > 0) {
    const subtotal = quoteItems.reduce((s, i) => s + (i.amount || 0), 0);
    totals.push({ label: 'Subtotal', value: fmt(subtotal) });
    totals.push({ label: `Tax (${taxRate}%)`, value: fmt(subtotal * (taxRate / 100)) });
  }
  totals.push({ label: 'Total', value: fmt(quoteTotal), strong: true });

  const lineItemsHtml = quoteItems.length > 0
    ? buildEmailSection('Quote details', buildLineItems(quoteItems, totals))
    : '';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const depositNote = hasDeposit
    ? d.depositPayOnAccept
      ? ` A ${fmt(dep)} deposit is due ${dueText ? `by ${dueText}` : 'before work begins'}. You can pay it right after you accept.`
      : ` A ${fmt(dep)} deposit is due ${dueText ? `by ${dueText}` : 'before work begins'}. We’ll send that separately once you accept.`
    : '';

  // Preview has no token: show the same box with inert links.
  const acceptUrl = d.quoteToken ? `${appUrl}/api/quotes/respond?token=${d.quoteToken}&action=accept` : '#';
  const declineUrl = d.quoteToken ? `${appUrl}/api/quotes/respond?token=${d.quoteToken}&action=decline` : '#';
  const acceptDeclineHtml = `
    <div style="margin: 8px 0 0 0; padding: 28px 20px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; text-align: center;">
      <p style="margin: 0 0 6px 0; color: ${EMAIL.ink}; font-size: 17px; font-weight: 700;">Ready to move forward?</p>
      <p style="margin: 0 0 20px 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
        Approve the quote and we’ll get you on the schedule.${depositNote}
      </p>
      ${buildButton('Accept quote', acceptUrl)}
      <p style="margin: 16px 0 0 0; font-size: 13px;">
        <a href="${declineUrl}" style="color: ${EMAIL.muted}; text-decoration: underline;">Decline this quote</a>
      </p>
    </div>
  `;

  const rendered = renderEmailTemplate(template, {
    company_name: name,
    company_phone: company.phone || d.companyPhone || null,
    customer_name: d.customerName,
    quote_total: fmt(quoteTotal),
    project_description: projectLabel || 'Your project',
  });

  return {
    subject: rendered.subject,
    html: buildEmail({
      ...frame(company, d.companyPhone),
      bodyHtml: `
        ${buildHeading('Your quote is ready', projectLabel)}
        ${renderTemplateBody(rendered.body)}
        ${amountHtml}
        ${lineItemsHtml}
        ${acceptDeclineHtml}
      `,
      preheader: hasDeposit
        ? `Your quote from ${name} — ${fmt(quoteTotal)}, ${fmt(dep)} deposit to start`
        : `Your quote from ${name} — ${fmt(quoteTotal)}`,
    }),
  };
}

export async function sendQuoteToCustomer({
  customerEmail,
  companyName,
  companyId,
  contractorEmail,
  ...data
}: QuoteEmailData & {
  customerEmail: string;
  companyName: string;
  companyId: number;
  contractorEmail?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);
    const name = company.name || companyName;
    const { subject, html } = buildQuoteEmail({ ...company, name }, templates.quote, data);

    const emailResult = await resend.emails.send({
      from: `${name} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      bcc: company.bcc_sender_on_email && contractorEmail ? contractorEmail : undefined,
      subject,
      html,
    });

    console.log('Quote email sent to customer:', customerEmail);
    return { subject, html, resendId: emailResult?.data?.id };
  } catch (error) {
    console.error('Failed to send quote email:', error);
    throw error;
  }
}


// Itemized payments for invoice PDFs — same list the download route builds.
async function getPaymentBreakdown(projectId: number | string) {
  try {
    const { adminDb: db } = await import('@/lib/db');
    const rows = await db`
      SELECT amount, kind, paid_on FROM payments
      WHERE project_id = ${projectId}
      ORDER BY paid_on ASC
    `;
    const labels: Record<string, string> = { deposit: 'Deposit paid', balance: 'Balance paid', refund: 'Refund' };
    // paid_on is a date-only value; format it without letting UTC shift the day.
    const fmtDay = (d: any) => {
      if (!d) return undefined;
      const s = d instanceof Date ? d.toISOString() : String(d);
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
      if (!m) return undefined;
      return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };
    const list = rows
      .filter((p: any) => parseFloat(p.amount) !== 0)
      .map((p: any) => ({
        label: labels[p.kind] || 'Payment received',
        amount: parseFloat(p.amount) || 0,
        date: fmtDay(p.paid_on),
      }));
    return list.length ? list : undefined;
  } catch (err) {
    console.error('getPaymentBreakdown failed:', err);
    return undefined;
  }
}


// ═════════════════════════════════════════════════════════════
// Invoice (deposit / balance / full)
// ═════════════════════════════════════════════════════════════

/** What the pay button charges and how the invoice is labeled. Shared by
 *  the PDF and the email so they always agree. */
function invoiceAmounts(d: {
  invoiceTotal: number;
  amountPaid?: number;
  depositAmount?: number;
  collectionKind?: 'deposit' | 'balance';
}) {
  // The pay link charges the deposit, not the total. Showing the total on
  // the button while charging half is how a customer decides the invoice
  // is broken and doesn't pay.
  const isDepositCollection =
    d.collectionKind === 'deposit' && !!d.depositAmount && d.depositAmount > 0 && d.depositAmount < d.invoiceTotal;
  // What the link actually charges: the deposit, or the outstanding balance
  // once money has been collected.
  const outstanding = Math.max(d.invoiceTotal - (d.amountPaid || 0), 0);
  const payButtonAmount = isDepositCollection ? d.depositAmount! : outstanding;
  const amountLabel = isDepositCollection
    ? 'Deposit Due Now'
    : d.amountPaid && d.amountPaid > 0
    ? 'Balance Due'
    : 'Total';
  const showProjectTotalLine = isDepositCollection || (!!d.amountPaid && d.amountPaid > 0 && d.amountPaid < d.invoiceTotal);
  return { isDepositCollection, payButtonAmount, amountLabel, showProjectTotalLine };
}

export type InvoiceEmailData = {
  customerName: string;
  companyPhone?: string;
  invoiceNumber: string;
  invoiceTotal: number;
  invoiceItems: Array<{ description: string; quantity?: number; unitPrice?: number; amount: number }>;
  dueDate?: string;
  notes?: string;
  amountPaid?: number;
  /** The link the pay button uses (Stripe Checkout, or the company's manual link). */
  paymentLinkUrl?: string;
  paymentLinkType?: string;
  taxRate?: number;
  /** What the pay link actually charges, when it's less than the total. */
  depositAmount?: number;
  collectionKind?: 'deposit' | 'balance';
  /** Link to the PDF copy. */
  pdfUrl: string;
};

export function buildInvoiceEmail(
  company: EmailCompany,
  template: EmailTemplateText,
  d: InvoiceEmailData
): BuiltEmail {
  const name = company.name;
  const { invoiceTotal, invoiceNumber, amountPaid, taxRate, invoiceItems, notes } = d;
  const { isDepositCollection, payButtonAmount, amountLabel, showProjectTotalLine } = invoiceAmounts(d);

  const effectivePaymentType = d.paymentLinkType || company.payment_link_type || undefined;
  const rawPaymentUrl = d.paymentLinkUrl || company.payment_link_url || '';
  const paymentUrl = rawPaymentUrl.startsWith('http') ? rawPaymentUrl : `https://${rawPaymentUrl}`;
  const isPartiallyPaid = !!amountPaid && amountPaid > 0 && amountPaid < invoiceTotal;
  const formattedDue = d.dueDate
    ? new Date(d.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Big number = exactly what the pay button charges.
  const amountNote = [formattedDue ? `Due ${formattedDue}` : '', `Invoice ${invoiceNumber}`].filter(Boolean).join(' · ');
  const amountHtml = buildAmount(
    isDepositCollection ? 'Deposit due now' : isPartiallyPaid ? 'Balance due' : 'Amount due',
    fmtUSD(payButtonAmount),
    amountNote
  );

  const payLabel = isDepositCollection ? 'Pay deposit' : (PAY_LABELS[effectivePaymentType || 'other'] || 'Pay Now');
  const buttonsHtml = `
    <div style="margin: 0 0 12px 0;">
      ${rawPaymentUrl ? buildButton(`${payLabel} — ${fmtUSD(payButtonAmount)}`, paymentUrl, 'primary') : ''}
    </div>
    <div style="margin: 0 0 28px 0;">
      ${buildButton('Download invoice (PDF)', d.pdfUrl, rawPaymentUrl ? 'secondary' : 'primary')}
    </div>
  `;

  // Manual methods (Venmo/Zelle/etc.) have nothing tying a payment back to
  // this invoice, so ask the customer to reference the invoice number.
  const methodDisplayNames: Record<string, string> = {
    venmo: 'Venmo', zelle: 'Zelle', cashapp: 'Cash App', paypal: 'PayPal', other: 'the link above',
  };
  const isManualMethod = !!rawPaymentUrl && effectivePaymentType !== 'stripe';
  const manualPaymentNoteHtml = isManualMethod
    ? buildNotice(
        `When paying with ${methodDisplayNames[effectivePaymentType || 'other'] || 'the link above'}, please put <strong>Invoice ${invoiceNumber}</strong> in the note so it gets matched to your job.`,
        'info'
      )
    : '';

  // One breakdown table instead of separate boxes.
  const breakdownRows: string[] = [];
  if (taxRate && taxRate > 0 && !isPartiallyPaid) {
    const subtotal = invoiceItems.reduce((s, i: any) => s + (i.amount || 0), 0);
    breakdownRows.push(buildEmailRow('Subtotal', fmtUSD(subtotal)));
    breakdownRows.push(buildEmailRow(`Tax (${taxRate}%)`, fmtUSD(subtotal * (taxRate / 100))));
  }
  if (isDepositCollection) {
    breakdownRows.push(buildEmailRow('Project total', fmtUSD(invoiceTotal)));
    breakdownRows.push(buildEmailRow('<strong style="color: #0f172a;">Deposit due now</strong>', `<strong>${fmtUSD(d.depositAmount!)}</strong>`));
    breakdownRows.push(buildEmailRow('Balance on completion', fmtUSD(invoiceTotal - d.depositAmount!)));
  } else if (isPartiallyPaid) {
    breakdownRows.push(buildEmailRow('Invoice total', fmtUSD(invoiceTotal)));
    breakdownRows.push(buildEmailRow('Paid so far', `<span style="color: #15803d;">− ${fmtUSD(amountPaid!)}</span>`));
    breakdownRows.push(buildEmailRow('<strong style="color: #0f172a;">Balance due</strong>', `<strong>${fmtUSD(invoiceTotal - amountPaid!)}</strong>`));
  } else if (breakdownRows.length) {
    breakdownRows.push(buildEmailRow('<strong style="color: #0f172a;">Total</strong>', `<strong>${fmtUSD(invoiceTotal)}</strong>`));
  }
  const breakdownHtml = breakdownRows.length ? buildEmailSection('Summary', buildEmailTable(breakdownRows)) : '';

  const notesHtml = notes
    ? buildEmailSection('Notes', `<p style="margin: 0; color: ${EMAIL.text}; font-size: 14px; line-height: 1.6;">${notes}</p>`)
    : '';

  const { subject, body: templateBody } = renderEmailTemplate(template, {
    company_name: name,
    company_phone: company.phone || d.companyPhone || '',
    customer_name: d.customerName,
    invoice_number: invoiceNumber,
    invoice_total: fmtUSD(invoiceTotal),
    amount_label: amountLabel,
    amount_value: fmtUSD(payButtonAmount),
    project_total: showProjectTotalLine ? fmtUSD(invoiceTotal) : undefined,
    due_date: formattedDue,
  });

  return {
    subject,
    html: buildEmail({
      ...frame(company, d.companyPhone),
      bodyHtml: `
        ${buildHeading(isDepositCollection ? 'Deposit request' : 'Invoice', `From ${name}`)}
        ${renderTemplateBody(templateBody)}
        ${amountHtml}
        ${buttonsHtml}
        ${manualPaymentNoteHtml}
        ${breakdownHtml}
        ${notesHtml}
      `,
      preheader: isDepositCollection
        ? `Invoice ${invoiceNumber} from ${name} — ${fmtUSD(d.depositAmount!)} deposit due`
        : `Invoice ${invoiceNumber} from ${name} — ${fmtUSD(payButtonAmount)} due`,
    }),
  };
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
  amountPaid,
  paymentLinkUrl,
  paymentLinkType,
  taxRate,
  depositAmount,
  collectionKind,
  terms,
  projectId,
}: Omit<InvoiceEmailData, 'pdfUrl'> & {
  customerEmail: string;
  companyName: string;
  companyId: number;
  contractorEmail?: string;
  terms?: string;
  /** Lets the PDF itemize past payments (deposit, etc). */
  projectId?: number | string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const name = company.name || companyName;

    // Prefer the explicitly passed-in link (e.g. a Stripe Checkout session)
    // over the company's static payment_link_url
    const effectivePaymentUrl = paymentLinkUrl || company.payment_link_url;
    const effectivePaymentType = paymentLinkType || company.payment_link_type;
    const { isDepositCollection } = invoiceAmounts({ invoiceTotal, amountPaid, depositAmount, collectionKind });

    // ── STEP 1: Generate PDF buffer ───────────────────────
    const { generateInvoicePDFBuffer } = await import('@/lib/generateInvoicePDFServer');
    const paymentBreakdown = projectId ? await getPaymentBreakdown(projectId) : undefined;
    const pdfBuffer = await generateInvoicePDFBuffer({
      invoiceNumber,
      invoiceDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: (company as any).timezone || 'America/New_York' }),
      dueDate,
      companyName: name,
      companyPhone: company.phone || companyPhone,
      companyEmail: company.email || undefined,
      companyLogoUrl: company.logo_url || undefined,
      customerName,
      customerEmail,
      customerPhone: undefined,
      customerAddress: undefined,
      lineItems: invoiceItems.map((item: any) => ({
        description: item.description || '',
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? undefined,
        amount: item.amount ?? 0,
      })),
      total: invoiceTotal,
      taxRate,
      depositAmount: isDepositCollection ? depositAmount : undefined,
      notes,
      terms,
      amountPaid: amountPaid && amountPaid > 0 ? amountPaid : undefined,
      paymentBreakdown,
      paymentLinkUrl: effectivePaymentUrl || undefined,
      paymentLinkType: effectivePaymentType || undefined,
      brandColor1: company.email_brand_color_1 || undefined,
      brandColor2: company.email_brand_color_2 || undefined,
    });

    // ── STEP 2: Upload PDF to Vercel Blob ─────────────────
    const { put } = await import('@vercel/blob');
    const blob = await put(
      `invoices/${invoiceNumber}-${Date.now()}.pdf`,
      Buffer.from(pdfBuffer),
      { access: 'public', contentType: 'application/pdf' }
    );
    const pdfUrl = blob.url;

    // ── STEP 3: Build the email ───────────────────────────
    const templates = await getCompanyEmailTemplates(companyId);
    const { subject, html } = buildInvoiceEmail({ ...company, name }, templates?.invoice, {
      customerName,
      companyPhone,
      invoiceNumber,
      invoiceTotal,
      invoiceItems,
      dueDate,
      notes,
      amountPaid,
      paymentLinkUrl: effectivePaymentUrl || undefined,
      paymentLinkType: effectivePaymentType || undefined,
      taxRate,
      depositAmount,
      collectionKind,
      pdfUrl,
    });

    // ── STEP 4: Send email with PDF attached ──────────────
    const emailResult = await resend.emails.send({
      from: `${name} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      bcc: company.bcc_sender_on_email && contractorEmail ? contractorEmail : undefined,
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
    return { subject, html, resendId: emailResult?.data?.id, pdfUrl };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    throw error;
  }
}


// ═════════════════════════════════════════════════════════════
// Schedule confirmation
// ═════════════════════════════════════════════════════════════

export type ScheduleEmailData = {
  customerName: string;
  companyPhone?: string;
  scheduledDate: string;
  scheduledTime?: string;
  scheduledEndTime?: string;
  serviceAddress?: string;
  assignedTo?: string;
};

export function buildScheduleEmail(
  company: EmailCompany,
  template: EmailTemplateText,
  d: ScheduleEmailData
): BuiltEmail {
  // Date-only values ("2026-11-18") are read as a calendar day, not
  // midnight UTC — otherwise the day shifts with the server's time zone.
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d.scheduledDate));
  const dateObj = dayMatch
    ? new Date(Date.UTC(+dayMatch[1], +dayMatch[2] - 1, +dayMatch[3]))
    : new Date(d.scheduledDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });

  const format12Hour = (t: string) => {
    const [hours, minutes] = t.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  let formattedTime = d.scheduledTime ? format12Hour(d.scheduledTime) : 'TBD';
  if (d.scheduledEndTime) formattedTime += ` – ${format12Hour(d.scheduledEndTime)}`;

  const rendered = renderEmailTemplate(template, {
    company_name: company.name,
    company_phone: company.phone || d.companyPhone || null,
    customer_name: d.customerName,
    scheduled_date: formattedDate,
    scheduled_time: formattedTime,
    customer_address: d.serviceAddress || null,
  });

  // Date + time as the big, scannable part — that's what they need.
  const whenHtml = `
    <div style="margin: 0 0 24px 0; padding: 24px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: ${EMAIL.muted};">Your appointment</p>
      <p style="margin: 0; font-size: 22px; line-height: 1.3; font-weight: 700; letter-spacing: -0.01em; color: ${EMAIL.ink};">${formattedDate}</p>
      <p style="margin: 6px 0 0 0; font-size: 16px; font-weight: 500; color: ${EMAIL.text};">${formattedTime}</p>
    </div>
  `;

  return {
    subject: rendered.subject,
    html: buildEmail({
      ...frame(company, d.companyPhone),
      bodyHtml: `
        ${buildHeading('You’re on the schedule')}
        ${renderTemplateBody(rendered.body)}
        ${whenHtml}
        ${buildEmailSection('Details', buildEmailTable([
          buildEmailRow('Address', d.serviceAddress || ''),
          buildEmailRow('Crew', d.assignedTo || ''),
        ]))}
      `,
      preheader: `Your appointment is confirmed for ${formattedDate}.`,
    }),
  };
}

export async function sendScheduleConfirmation({
  customerEmail,
  companyName,
  companyId,
  contractorEmail,
  ...data
}: ScheduleEmailData & {
  customerEmail: string;
  companyName: string;
  companyId: number;
  contractorEmail?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);
    const name = company.name || companyName;
    const { subject, html } = buildScheduleEmail({ ...company, name }, templates.schedule, data);

    const emailResult = await resend.emails.send({
      from: `${name} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      bcc: company.bcc_sender_on_email && contractorEmail ? contractorEmail : undefined,
      subject,
      html,
    });

    console.log('Schedule confirmation email sent to customer:', customerEmail);
    return { subject, html, resendId: emailResult?.data?.id };
  } catch (error) {
    console.error('Failed to send schedule confirmation:', error);
    throw error;
  }
}


// ═════════════════════════════════════════════════════════════
// Payment reminder
// ═════════════════════════════════════════════════════════════

export type PaymentReminderData = {
  customerName: string;
  companyPhone?: string;
  amountDue: number;
  dueDate: string | null;
  isOverdue: boolean;
  paymentLinkUrl?: string;
  paymentLinkType?: string;
  /** undefined = a plain full payment with no deposit terms. */
  collectionKind?: 'deposit' | 'balance';
};

/** `template` is undefined when there's no company (legacy path): plain default text. */
export function buildPaymentReminderEmail(
  company: EmailCompany,
  template: EmailTemplateText | undefined,
  d: PaymentReminderData
): BuiltEmail {
  const fmt = fmtUSD;
  const name = company.name;
  const kindLabel = d.collectionKind === 'deposit' ? 'Deposit' : d.collectionKind === 'balance' ? 'Balance' : null;
  const kindContext =
    d.collectionKind === 'deposit'
      ? 'This is the deposit for your job. The remaining balance is due once the work is scheduled or complete.'
      : d.collectionKind === 'balance'
      ? 'This is the remaining balance on your invoice.'
      : null;

  const formattedDate = d.dueDate && d.dueDate !== 'null'
    ? (() => {
        const [year, month, day] = String(d.dueDate).split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        });
      })()
    : null;

  let subject: string;
  let bodyText: string;
  if (template) {
    const rendered = renderEmailTemplate(template, {
      company_name: name,
      company_phone: company.phone || d.companyPhone || null,
      customer_name: d.customerName,
      payment_amount: fmt(d.amountDue),
      amount_due: fmt(d.amountDue),
      due_date: formattedDate,
      payment_kind_label: kindLabel,
    });
    subject = rendered.subject;
    bodyText = rendered.body;
  } else {
    const subjectKind = kindLabel ? `${kindLabel} ` : '';
    subject = d.isOverdue
      ? `${subjectKind}Payment Overdue - ${name}`
      : `${subjectKind}Payment Reminder - ${name}`;
    bodyText = `Hi ${d.customerName},\n\nThis is a friendly reminder about your ${kindLabel ? kindLabel.toLowerCase() + ' ' : ''}payment of ${fmt(d.amountDue)}${formattedDate ? `, due ${formattedDate}` : ''}.`;
  }

  const rawUrl = d.paymentLinkUrl || company.payment_link_url || '';
  const payUrl = rawUrl.startsWith('http') ? rawUrl : rawUrl ? `https://${rawUrl}` : '';
  const linkType = d.paymentLinkType || company.payment_link_type || 'other';
  const buttonLabel = kindLabel ? `Pay ${kindLabel.toLowerCase()}` : (PAY_LABELS[linkType] || 'Pay Now');

  // Red only when it's actually overdue; otherwise a calm amber "due" tone.
  const statusHtml = d.isOverdue
    ? buildNotice(`This payment is past due${formattedDate ? ` (was due ${formattedDate})` : ''}.`, 'danger')
    : formattedDate
    ? buildNotice(`Due ${formattedDate}`, 'warning')
    : '';

  return {
    subject,
    html: buildEmail({
      ...frame(company, d.companyPhone),
      bodyHtml: `
        ${buildHeading(d.isOverdue ? 'Payment overdue' : `${kindLabel || 'Payment'} reminder`)}
        ${statusHtml}
        ${renderTemplateBody(bodyText)}
        ${buildAmount(kindLabel ? `${kindLabel} due` : 'Amount due', fmt(d.amountDue), kindContext)}
        ${payUrl ? buildButton(`${buttonLabel} — ${fmt(d.amountDue)}`, payUrl) : ''}
      `,
      preheader: d.isOverdue
        ? `Your payment of ${fmt(d.amountDue)} to ${name} is past due.`
        : `Reminder: ${fmt(d.amountDue)} due${formattedDate ? ` ${formattedDate}` : ''}.`,
    }),
  };
}

export async function sendPaymentReminderEmail({
  customerEmail,
  companyName,
  companyId,
  contractorEmail,
  ...data
}: PaymentReminderData & {
  customerEmail: string;
  companyName: string;
  companyId?: number;
  contractorEmail?: string;
}) {
  try {
    let company: any = {};
    let template: EmailTemplateText | undefined;
    if (companyId) {
      company = await getCompanyDetails(companyId);
      const templates = await getCompanyEmailTemplates(companyId);
      template = templates.payment;
    }
    const name = company.name || companyName;
    const { subject, html } = buildPaymentReminderEmail({ ...company, name }, template, data);

    const emailResult = await resend.emails.send({
      from: `${name} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject,
      html,
    });

    console.log('✅ Payment reminder sent to:', customerEmail);
    return { subject, html, resendId: emailResult?.data?.id };
  } catch (error) {
    console.error('❌ Failed to send payment reminder:', error);
    throw error;
  }
}


// ═════════════════════════════════════════════════════════════
// Google review request (job completion)
// ═════════════════════════════════════════════════════════════

export type ReviewRequestData = {
  customerName: string;
  /** Formatted category, e.g. "Roof Repair". */
  displayCategory: string;
  reviewUrl: string;
};

export function buildReviewRequestEmail(
  company: EmailCompany,
  template: EmailTemplateText | undefined,
  d: ReviewRequestData
): BuiltEmail {
  const reviewButtonHtml = `
    <div style="margin: 8px 0 28px 0;">
      <p style="margin: 0 0 14px 0; text-align: center; font-size: 26px; letter-spacing: 4px; color: #f59e0b;">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
      ${buildButton('Leave a Google review', d.reviewUrl)}
      <p style="margin: 12px 0 0 0; text-align: center; color: ${EMAIL.muted}; font-size: 13px;">Takes about a minute.</p>
    </div>
  `;

  // The button always shows, even if the template leaves out {google_review_link}.
  let introHtml: string;
  if (template?.body) {
    const text = renderEmailTemplate(template, {
      company_name: company.name,
      company_phone: company.phone || '',
      customer_name: d.customerName,
      google_review_link: BLOCK_REVIEW_BUTTON,
    }).body;
    introHtml = text.includes(BLOCK_REVIEW_BUTTON)
      ? renderTemplateBody(text, { [BLOCK_REVIEW_BUTTON]: reviewButtonHtml })
      : renderTemplateBody(text) + reviewButtonHtml;
  } else {
    introHtml =
      renderTemplateBody(
        `Hi ${d.customerName}, thank you for choosing ${company.name}. We hope you're happy with your ${d.displayCategory}.\n\nIf you have a moment, a quick Google review would mean a lot. It helps other homeowners find us.`
      ) + reviewButtonHtml;
  }

  const subject = template?.subject
    ? renderEmailTemplate(template, { company_name: company.name, customer_name: d.customerName }).subject
    : `How did we do? — ${company.name}`;

  return {
    subject,
    html: buildEmail({
      ...frame(company),
      bodyHtml: `
        ${buildHeading('How did we do?')}
        ${introHtml}
        <p style="margin: 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
          Thanks again for your business.
        </p>
      `,
      preheader: `How did we do? Leave ${company.name} a quick review.`,
    }),
  };
}

export async function sendGoogleReviewRequestEmail({
  customerEmail,
  customerName,
  companyId,
  jobCategory,
}: {
  customerEmail: string;
  customerName: string;
  companyId: number;
  jobCategory?: string;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const templates = await getCompanyEmailTemplates(companyId);

    const reviewResult = await sql`
      SELECT google_review_url, google_review_enabled, name, plan_tier
      FROM companies WHERE id = ${companyId} LIMIT 1
    `;
    const reviewData = reviewResult[0];

    const { can } = await import('@/lib/permissions');
    if (
      !reviewData?.google_review_enabled ||
      !reviewData?.google_review_url ||
      !can((reviewData?.plan_tier ?? 'free') as any, 'google_reviews')
    ) return;

    const rawReviewUrl = reviewData.google_review_url || '';
    const { subject, html } = buildReviewRequestEmail({ ...company, name: company.name }, templates?.job_completion, {
      customerName,
      displayCategory: jobCategory ? formatCategory(jobCategory) : 'your recent service',
      reviewUrl: rawReviewUrl.startsWith('http') ? rawReviewUrl : `https://${rawReviewUrl}`,
    });

    await resend.emails.send({
      from: `${company.name} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject,
      html,
    });

    console.log('Google review request sent to:', customerEmail);
  } catch (error) {
    console.error('Failed to send review request email:', error);
  }
}


// Sends a payment receipt to the customer after a successful payment. This is triggered by the webhook after the DB update, so we don't want to throw an error if it fails.
export async function sendPaymentReceiptToCustomer({
  customerEmail,
  customerName,
  companyName,
  companyId,
amountPaid,
  invoiceNumber,
  contractTotal,
  paidToDate,
  paymentKind,
  cardBrand,
  cardLast4,
    projectId,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyId: number;
  amountPaid: number;
  invoiceNumber?: string;
  /** Job totals so a deposit receipt says what's still coming. Without these
   *  a customer paying $627 of a $3,135 job just sees "$627 received" and
   *  reasonably assumes they're done. */
  contractTotal?: number;
  paidToDate?: number;
  paymentKind?: 'deposit' | 'balance' | 'refund' | string;
  cardBrand?: string | null;
  cardLast4?: string | null;
    /** When set and the job is paid off, the final invoice PDF is attached. */
  projectId?: number;
}) {
  try {
    const company = await getCompanyDetails(companyId);
    const fmt = (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const total = Number(contractTotal) || 0;
    const collected = Number(paidToDate) || amountPaid;
    const balance = total > 0 ? Math.max(total - collected, 0) : 0;
    const settled = total > 0 && balance <= 0;
    const isDeposit = paymentKind === 'deposit';

    const name = company.name || companyName;
    const cardText = cardBrand && cardLast4
      ? `<span style="text-transform: capitalize;">${cardBrand}</span> ending ${cardLast4}`
      : '';

    // Green = money received (same rule as the app).
    const receivedHtml = `
      <div style="margin: 0 0 24px 0; padding: 24px 16px; border-radius: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #166534;">${isDeposit ? 'Deposit received' : 'Payment received'}</p>
        <p style="margin: 0; font-size: 34px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: ${EMAIL.ink};">${fmt(amountPaid)}</p>
        ${[invoiceNumber, cardText].filter(Boolean).length
          ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: ${EMAIL.muted};">${[invoiceNumber, cardText].filter(Boolean).join(' · ')}</p>`
          : ''}
        ${settled ? `<p style="margin: 12px 0 0 0; font-size: 14px; font-weight: 600; color: #15803d;">Paid in full. Thank you!</p>` : ''}
      </div>
    `;

    // No pay button here on purpose — the balance isn't due yet, and asking
    // for it inside a receipt reads as chasing. The balance invoice is its
    // own email when the work is done.
    const balanceHtml =
      total > 0 && balance > 0
        ? buildEmailSection('Where things stand', buildEmailTable([
            buildEmailRow('Project total', fmt(total)),
            buildEmailRow('Paid so far', `<span style="color: #15803d;">− ${fmt(collected)}</span>`),
            buildEmailRow('<strong style="color: #0f172a;">Balance remaining</strong>', `<strong>${fmt(balance)}</strong>`),
          ])) +
          buildNotice(
            isDeposit
              ? 'Nothing else to pay right now. The balance is due when the work is done, and we’ll send an invoice then.'
              : 'We’ll be in touch about the remaining balance.',
            'info'
          )
        : '';

    const html = buildEmail({
      companyName: name,
      logoUrl: company.logo_url,
      bodyHtml: `
        ${buildHeading(settled ? 'Paid in full' : isDeposit ? 'Deposit received' : 'Payment received', `Thanks, ${customerName}`)}
        ${buildParagraph(`This confirms your ${isDeposit ? 'deposit' : 'payment'} to ${name} went through.`)}
        ${receivedHtml}
        ${balanceHtml}
      `,
      phone: company.phone,
      website: company.website,
      preheader: settled
        ? `Paid in full — ${fmt(amountPaid)} received. Thank you!`
        : balance > 0
        ? `${fmt(amountPaid)} received. ${fmt(balance)} balance remaining.`
        : `Payment of ${fmt(amountPaid)} received — thank you!`,
    });
        // Paid in full → attach the final invoice PDF, same generator the
    // deposit/balance invoice emails use. Any failure here just means the
    // receipt goes out without the attachment.
    let attachments: { filename: string; content: string; contentType: string }[] | undefined;
    if (settled && projectId) {
      try {
        const { adminDb } = await import('@/lib/db');
        const rows = await adminDb`
          SELECT quote_data, quote_tax_rate, quote_total, invoice_number
          FROM projects WHERE id = ${projectId} LIMIT 1
        `;
        const p = rows[0];
        let items: any[] = [];
        const raw = p?.quote_data;
        if (Array.isArray(raw)) items = raw;
        else if (typeof raw === 'string') {
          try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) items = parsed; } catch {}
        }

        if (p && items.length > 0) {
          const { generateInvoicePDFBuffer } = await import('@/lib/generateInvoicePDFServer');
          const finalTotal = contractTotal ?? parseFloat(p.quote_total || '0');
                    const number = invoiceNumber || p.invoice_number || 'Invoice';
          const paymentBreakdown = await getPaymentBreakdown(projectId);
          const pdfBuffer = await generateInvoicePDFBuffer({
            invoiceNumber: number,
            invoiceDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: (company as any).timezone || 'America/New_York' }),
            dueDate: 'Paid in full',
            companyName: company.name || companyName,
            companyPhone: company.phone || undefined,
            companyEmail: company.email || undefined,
            companyLogoUrl: company.logo_url || undefined,
            customerName,
            customerEmail,
            customerPhone: undefined,
            customerAddress: undefined,
            lineItems: items.map((item: any) => ({
              description: item.description || '',
              quantity: item.quantity ?? 1,
              unitPrice: item.unitPrice ?? undefined,
              amount: item.amount ?? 0,
            })),
            total: finalTotal,
            taxRate: parseFloat(p.quote_tax_rate || '0'),
                        amountPaid: paidToDate ?? finalTotal,
            paymentBreakdown,
            brandColor1: company.email_brand_color_1 || undefined,
            brandColor2: company.email_brand_color_2 || undefined,
          });
          attachments = [{
            filename: `Invoice-${number}-Paid.pdf`,
            content: Buffer.from(pdfBuffer as Uint8Array).toString('base64'),
            contentType: 'application/pdf',
          }];
        }
      } catch (pdfErr) {
        console.error('Receipt PDF failed — sending without it:', pdfErr);
      }
    }

    await resend.emails.send({
      from: `${company.name || companyName} <hello@lead2project.com>`,
      to: customerEmail,
      replyTo: company.email || undefined,
      subject: settled
        ? `Paid in full — ${fmt(amountPaid)} received`
        : isDeposit
        ? `Deposit received — ${fmt(amountPaid)}`
        : `Payment received — ${fmt(amountPaid)}`,
           html,
      attachments,
    });

    console.log('Payment receipt sent to customer:', customerEmail);
  } catch (error) {
    console.error('Failed to send payment receipt to customer:', error);
    // don't throw — this shouldn't block the webhook's DB update
  }
}