export const defaultEmailTemplates = {
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
Time: {{scheduled_time}}{{#customer_address}}
Address: {{customer_address}}{{/customer_address}}

We look forward to serving you!

Best regards,
{{company_name}}`,
  },
  payment: {
    subject: 'Payment Reminder - {{company_name}}',
    body: `Hi {{customer_name}},

This is a friendly reminder about your upcoming payment.

Amount Due: {{payment_amount}}{{#due_date}}
Due Date: {{due_date}}{{/due_date}}

Please contact us if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  invoice: {
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `Hi {{customer_name}},

Please find your invoice attached for recent work completed.

Invoice #: {{invoice_number}}
{{amount_label}}: {{amount_value}}{{#project_total}}
Project Total: {{project_total}}{{/project_total}}{{#due_date}}
Due Date: {{due_date}}{{/due_date}}

If you have any questions, don't hesitate to reach out.

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  lead_confirmation: {
    subject: 'We received your request - {{company_name}}',
    body: `Hi {{customer_name}},

Thank you for reaching out to {{company_name}}! We've received your request and will be in touch shortly.

We typically respond within 24 hours.

{{request_summary}}

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  job_completion: {
    subject: 'Job Complete - Thank you, {{customer_name}}!',
    body: `Hi {{customer_name}},

We're happy to let you know that your job has been completed!

It was a pleasure working with you. If you're satisfied with our work, we'd love if you left us a review.

{{google_review_link}}

Thank you for choosing {{company_name}}!

Best regards,
{{company_name}}
{{company_phone}}`,
  },
};