// Default text for customer emails. A company's saved templates (Settings)
// override these per type.
//
// The emails themselves already show the amount, due date, line items,
// appointment time and pay/accept buttons in their own boxes, so this
// text is just the personal note around them. Don't repeat those details
// here or they show up twice.
export const defaultEmailTemplates = {
  quote: {
    subject: 'Your Quote from {{company_name}}',
    body: `Hi {{customer_name}},

Thanks for your inquiry! Here's your quote. Take a look and let us know if you have any questions.

Best regards,
{{company_name}}`,
  },
  schedule: {
    subject: 'Appointment Scheduled - {{company_name}}',
    body: `Hi {{customer_name}},

You're all set. Your appointment details are below.

We look forward to seeing you!

Best regards,
{{company_name}}`,
  },
  payment: {
    subject: 'Payment Reminder - {{company_name}}',
    body: `Hi {{customer_name}},

Just a friendly reminder about the payment below. If you have any questions, reply to this email.

Thanks,
{{company_name}}`,
  },
  invoice: {
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `Hi {{customer_name}},

Thanks for your business! Your invoice is below, and a PDF copy is attached.

If you have any questions, just reply to this email.

Best regards,
{{company_name}}`,
  },
  lead_confirmation: {
    subject: 'We received your request - {{company_name}}',
    body: `Hi {{customer_name}},

Thanks for reaching out to {{company_name}}! We got your request and will be in touch soon.

{{request_summary}}

Best regards,
{{company_name}}`,
  },
  job_completion: {
    subject: 'Job Complete - Thank you, {{customer_name}}!',
    body: `Hi {{customer_name}},

Your job is complete. It was a pleasure working with you!

If you're happy with our work, a quick Google review would mean a lot.

{{google_review_link}}

Thank you for choosing {{company_name}}!`,
  },
};