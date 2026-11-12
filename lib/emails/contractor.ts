// Emails Lead2Project sends to contractors, their team, bookkeeper partners,
// and demo requests. Customer-facing emails are in ./customer.ts.
import {
  EMAIL,
  formatPhone,
  buildButton,
  buildHeading,
  buildParagraph,
  buildNotice,
  buildAmount,
  buildSteps,
  buildChecklist,
  buildLinkFallback,
  buildEmailRow,
  buildEmailTable,
  buildEmailSection,
  buildCustomAnswers,
  buildAttachmentSummary,
  buildEmail,
} from '@/lib/emailBase';
import {
  resend,
  formatCategory,
  fmtUSD,
  escapeHtml,
  L2P_FRAME,
} from './shared';
import { timingSummary } from '@/lib/timing';
import { describeRequirementReason } from '@/lib/stripe/requirementCopy';

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
  const rawName = customerName;
  try {
    // Everything below came from a public form, so escape it before it
    // goes into HTML. Otherwise someone could put markup or fake links
    // in a form field and it would render in the contractor's inbox.
    customerName = escapeHtml(customerName || '');
    customerEmail = escapeHtml(customerEmail || '');
    customerPhone = escapeHtml(customerPhone || '');
    description = escapeHtml(description || '');
    address = address && escapeHtml(address);
    addressLine2 = addressLine2 && escapeHtml(addressLine2);
    city = city && escapeHtml(city);
    zipCode = zipCode && escapeHtml(zipCode);
    leadSource = leadSource && escapeHtml(leadSource);
    customAnswers = customAnswers &&
      Object.fromEntries(Object.entries(customAnswers).map(([k, v]) => [k, escapeHtml(String(v ?? ''))]));
    const displayCategory = formatCategory(category);
    const fullAddress = [address, addressLine2, city, zipCode].filter(Boolean).join(', ');
    const attachmentText = buildAttachmentSummary(fileUrls) || (photosCount ? `${photosCount} file${photosCount > 1 ? 's' : ''}` : '');
    const timing = timingSummary(preferredDate, preferredTime);
    const link = `color: ${EMAIL.ink}; text-decoration: underline;`;
    const phoneDigits = (customerPhone || '').replace(/\D/g, '');

    const contactTable = buildEmailTable([
      buildEmailRow('Name', customerName),
      customerPhone ? buildEmailRow('Phone', `<a href="tel:${phoneDigits}" style="${link}">${formatPhone(customerPhone)}</a>`) : '',
      customerEmail ? buildEmailRow('Email', `<a href="mailto:${customerEmail}" style="${link}">${customerEmail}</a>`) : '',
      fullAddress
        ? buildEmailRow('Address', `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}" style="${link}">${fullAddress}</a>`)
        : '',
      timing ? buildEmailRow('Timing', timing) : '',
      buildEmailRow('Attached', attachmentText ? `${attachmentText} · view in dashboard` : ''),
      buildEmailRow('Found via', leadSource || ''),
    ]);

    const messageHtml = description
      ? buildEmailSection(
          'Their message',
          `<div style="padding: 14px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; color: ${EMAIL.text}; font-size: 15px; line-height: 1.6;">${description}</div>`
        )
      : '';

    const answersHtml = buildCustomAnswers(customAnswers, customQuestions)
      .replace('Your Responses', 'Form answers');

    // Quick actions: call / text / email right from the email.
    const quickActions = [
      phoneDigits ? buildButton('Call', `tel:${phoneDigits}`, 'secondary') : '',
      phoneDigits ? buildButton('Text', `sms:${phoneDigits}`, 'secondary') : '',
      customerEmail ? buildButton('Email', `mailto:${customerEmail}`, 'secondary') : '',
    ].filter(Boolean);
    const quickActionsHtml = quickActions.length
      ? `
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 0 auto 28px auto;">
          <tr>${quickActions.map(b => `<td style="padding: 0 4px;">${b}</td>`).join('')}</tr>
        </table>
      `
      : '';

    const bodyHtml = `
      ${buildHeading(`New lead: ${customerName}`, displayCategory)}
      ${quickActionsHtml}
      ${buildEmailSection('Contact', contactTable)}
      ${messageHtml}
      ${answersHtml}
    `;

    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml,
      ctaText: 'Open in dashboard',
      ctaUrl: dashboardUrl,
      preheader: `New lead from ${customerName} — ${displayCategory}`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: contractorEmail,
      subject: `New Lead: ${rawName} — ${displayCategory}`,
      html,
    });

    console.log('New lead alert sent to contractor');
  } catch (error) {
    console.error('Failed to send lead alert:', error);
  }
}


// Plan names as customers see them. Internal ids are older than the
// current names: 'basic' is sold as Pro, 'pro' as Crew.
const PLAN_LABELS: Record<string, string> = { free: 'Free', basic: 'Pro', pro: 'Crew' };
const planLabel = (p: string) => PLAN_LABELS[p] || p;

const fmtLongDate = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

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
    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading('Reset your password')}
        ${buildParagraph(`Hi ${userName}, we got a request to reset your password. Tap the button to choose a new one.`)}
        <div style="margin: 8px 0 0 0;">${buildButton('Reset password', resetLink)}</div>
        ${buildLinkFallback(resetLink)}
        <div style="margin: 28px 0 0 0;">
          ${buildNotice('This link expires in 1 hour. Didn’t ask for this? You can ignore this email and your password stays the same.', 'info')}
        </div>
      `,
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
      ? 'Manage leads, team members, and settings.'
      : 'View and manage leads.';

    const html = buildEmail({
      ...L2P_FRAME,
      footerNote: `You're getting this because ${inviterName} invited you to ${companyName}.`,
      bodyHtml: `
        ${buildHeading(`Join ${companyName}`, `${inviterName} invited you to their team on Lead2Project.`)}
        ${buildEmailSection('Your access', buildEmailTable([
          buildEmailRow('Role', roleLabel),
          buildEmailRow('Can', roleDescription),
        ]))}
        ${buildButton('Accept invitation', inviteLink)}
        ${buildLinkFallback(inviteLink)}
        <div style="margin: 28px 0 0 0;">${buildNotice('This invitation expires in 24 hours.', 'info')}</div>
      `,
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
    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading('Your free trial is ending soon', companyName)}
        ${buildAmount('Trial days left', String(daysRemaining), null)}
        ${buildParagraph('Hope Lead2Project has been useful. When the trial ends you keep everything on your current plan:')}
        <div style="margin: 0 0 24px 0;">
          ${buildChecklist([
            'Unlimited lead tracking',
            'Professional quote builder',
            'Photo uploads from customers',
            'Team management',
            'Email notifications',
          ])}
        </div>
        ${buildNotice('<strong>Your card is charged automatically when the trial ends.</strong> Nothing to do. Want to cancel? You can do it anytime from billing settings.', 'warning')}
      `,
      ctaText: 'View billing',
      ctaUrl: billingUrl,
      preheader: `Your free trial ends in ${daysRemaining} days.`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `Your free trial ends in ${daysRemaining} days`,
      html,
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
    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading('Your payment didn’t go through', companyName)}
        ${buildNotice('We couldn’t process your Lead2Project subscription payment.', 'danger')}
        ${buildParagraph('This usually happens because of an expired card, insufficient funds, or a decline from your bank. Your account is still active for now. Update your card to avoid any interruption.')}
        <p style="margin: 0 0 24px 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
          We’ll retry automatically in a few days. If it keeps failing, your account will be suspended after 7 days.
        </p>
      `,
      ctaText: 'Update payment method',
      ctaUrl: updatePaymentUrl,
      preheader: 'Your Lead2Project payment failed. Update your card to keep your account active.',
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: 'Action required: payment failed — Lead2Project',
      html,
    });

    console.log('✅ Payment failed email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send payment failed email:', error);
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
  isTrialing = true,
}: {
  userEmail: string;
  userName: string;
  companyName: string;
  companySlug: string;
  dashboardUrl: string;
  formUrl: string;
  plan?: 'basic' | 'pro';
  isTrialing?: boolean;
}) {
  const planDetails = {
    basic: {
      label: 'Pro',
      price: '$49.99/mo',
      features: ['Everything in Free', 'Accept online payments (Stripe)', 'Send invoices & payment reminders', 'Job categories & pricing templates', 'CSV export'],
    },
    pro: {
      label: 'Crew',
      price: '$49.99/mo',
      features: ['Quotes customers accept online', 'Deposits and card payments', 'Email history', 'Daily digest'],
    },
  }[plan];

  try {
    const settingsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/home`;

    const planCard = `
      <div style="margin: 0 0 28px 0; padding: 20px; border-radius: 12px; border: 1px solid ${EMAIL.border};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle;">
              <p style="margin: 0; font-size: 13px; color: ${EMAIL.muted};">Your plan</p>
              <p style="margin: 2px 0 0 0; font-size: 18px; font-weight: 700; color: ${EMAIL.ink};">${planDetails.label} <span style="font-size: 14px; font-weight: 400; color: ${EMAIL.muted};">${planDetails.price}</span></p>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; color: ${EMAIL.text}; font-size: 12px; font-weight: 600;">${isTrialing ? '14-day trial' : 'Active'}</span>
            </td>
          </tr>
        </table>
        <div style="margin: 14px 0 0 0; padding: 10px 0 0 0; border-top: 1px solid ${EMAIL.divider};">
          ${buildChecklist(planDetails.features)}
        </div>
      </div>
    `;

    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading(`You’re all set, ${userName}`, `${companyName} is ready to go on ${planDetails.label}.`)}
        ${planCard}
        ${buildEmailSection('Your links', buildEmailTable([
          buildEmailRow('Booking link', `<a href="${formUrl}" style="color: ${EMAIL.ink}; word-break: break-all;">${formUrl.replace(/^https?:\/\//, '')}</a>`),
          buildEmailRow('Dashboard', `<a href="${dashboardUrl}" style="color: ${EMAIL.ink};">Open</a>`),
        ]))}
        ${buildEmailSection('Finish setting up', buildSteps([
          'Add your logo so it shows on every customer email.',
          'Set up your services with pricing, so quotes take a minute.',
          'Connect Stripe to take deposits and card payments.',
          'Send yourself a test request from your booking link.',
        ]))}
      `,
      ctaText: 'Finish setup',
      ctaUrl: settingsUrl,
      preheader: `Your ${planDetails.label} plan is active. Here's how to finish setting up.`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: userEmail,
      subject: `Welcome to Lead2Project — Your ${planDetails.label} dashboard is ready`,
      html,
    });

    console.log('✅ Welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
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
    const billingUrl = dashboardUrl.replace('/dashboard', '/admin/settings?tab=billing');

    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading(`Welcome, ${userName}`, `Your free account for ${companyName} is live.`)}

        <div style="margin: 0 0 28px 0; padding: 20px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; text-align: center;">
          <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: ${EMAIL.muted};">Your booking link</p>
          <p style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: ${EMAIL.ink}; word-break: break-all;">${formUrl.replace(/^https?:\/\//, '')}</p>
          ${buildButton('Open your booking page', formUrl, 'secondary')}
        </div>

        ${buildEmailSection('Try it first', buildSteps([
          'Open your booking page and fill it out like you’re a customer.',
          'Check <strong>Leads</strong> in your dashboard. Your request will be there.',
          'Then share the link anywhere a customer might find you.',
        ]))}

        ${buildEmailSection('Where to put your link', buildChecklist([
          'A “Request a quote” button on your website',
          'Your Google Business Profile',
          'Your truck, yard signs, or business cards (as a QR code)',
          'A text to anyone who asks for a quote',
          'Your Facebook page or Instagram bio',
        ]))}

        <div style="margin: 0 0 28px 0; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: ${EMAIL.ink};">When you’re ready: Pro</p>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: ${EMAIL.muted};">The full workflow, from quote to paid.</p>
          ${buildChecklist([
            'Customers attach photos and videos on your booking form',
            'Professional quotes with line-item templates',
            'Scheduling and payment tracking on every job',
            'One-click quote, schedule, and payment reminder emails',
            'CSV or QuickBooks export for your bookkeeper',
            'AI brief and assistant on every lead',
            'Daily 6am digest of leads, follow-ups, and jobs',
          ])}
          <p style="margin: 14px 0 0 0; font-size: 13px; color: ${EMAIL.muted};">
            $49.99/mo · 14-day free trial · No contracts ·
            <a href="${billingUrl}" style="color: ${EMAIL.ink}; font-weight: 600;">See Pro</a>
          </p>
        </div>
      `,
      ctaText: 'Open your dashboard',
      ctaUrl: dashboardUrl,
      preheader: 'Your booking link is ready. Try it yourself first.',
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: userEmail,
      subject: `Welcome to Lead2Project — Your booking link is ready`,
      html,
    });

    console.log('✅ Free welcome email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Failed to send free welcome email:', error);
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
    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading('Your access has ended', companyName)}
        ${buildNotice('Your Lead2Project subscription has ended and your dashboard is now off.', 'warning')}
        ${buildParagraph('Your data is still safe. If you come back, everything will be exactly where you left it.')}
        ${buildParagraph('We’d also love to know what we could do better. Just reply to this email.')}
      `,
      ctaText: 'Reactivate',
      ctaUrl: resubUrl,
      preheader: 'Your Lead2Project access has ended. Your data is still safe.',
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `Your Lead2Project access has ended`,
      html,
    });

    console.log('✅ Access ended email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send access ended email:', error);
    throw error;
  }
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
  // The old email computed this and then showed the raw "2025-04-15" anyway.
  const accessUntilFormatted = fmtLongDate(accessUntil);

  const html = buildEmail({
    ...L2P_FRAME,
    bodyHtml: `
      ${buildHeading('Cancellation confirmed', `Sorry to see you go, ${companyName}.`)}
      ${buildAmount(
        'You still have full access for',
        `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        `${isTrialing ? 'Trial access' : 'Full access'} until ${accessUntilFormatted}`
      )}
      ${buildParagraph(`You won’t be charged again, and you can keep using everything until <strong>${accessUntilFormatted}</strong>. After that your dashboard turns off.`)}
      ${buildParagraph('Changed your mind? Reactivate anytime before then. Nothing to set up again.')}
    `,
    ctaText: 'Keep my subscription',
    ctaUrl: resubUrl,
    preheader: `You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} of access left.`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `You still have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} of access — Lead2Project`,
    html,
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

  const subject = isUpgrade
    ? `Plan upgraded to ${planLabel(newPlan)} — Lead2Project`
    : `Downgrade to ${planLabel(newPlan)} scheduled — Lead2Project`;

  const bodyText = isUpgrade
    ? `Your plan was upgraded from <strong>${planLabel(previousPlan)}</strong> to <strong>${planLabel(newPlan)}</strong>. Your new features are on now.`
    : `Your plan will change from <strong>${planLabel(previousPlan)}</strong> to <strong>${planLabel(newPlan)}</strong> on <strong>${periodEnd}</strong>. You keep full ${planLabel(previousPlan)} access until then.`;

  const featuresByPlan: Record<string, string[]> = {
    free:    ['Booking link & QR code', 'Basic form', 'Lead dashboard', 'Create leads manually'],
    basic:   ['Everything in Free', 'Custom form & branding', 'Scheduling and quotes', 'Job categories and tasks', 'CSV export'],
    pro:     ['Quotes customers accept online', 'Deposits and card payments', 'Email history', 'Daily digest email'],
  };

  const html = buildEmail({
    ...L2P_FRAME,
    bodyHtml: `
      ${buildHeading(isUpgrade ? `You’re on ${planLabel(newPlan)}` : 'Plan change scheduled', companyName)}
      ${buildParagraph(bodyText)}
      ${(featuresByPlan[newPlan] || []).length
        ? buildEmailSection(`${planLabel(newPlan)} includes`, `<div style="padding: 10px 16px; border-radius: 12px; border: 1px solid ${EMAIL.border};">${buildChecklist(featuresByPlan[newPlan])}</div>`)
        : ''}
      ${!isUpgrade && periodEnd
        ? buildNotice(`<strong>Access until ${periodEnd}.</strong> After that, features not in ${planLabel(newPlan)} turn off. You can upgrade again anytime.`, 'warning')
        : ''}
    `,
    ctaText: 'Go to dashboard',
    ctaUrl: dashboardUrl,
    preheader: isUpgrade ? `You're now on ${planLabel(newPlan)}.` : `Your plan changes to ${planLabel(newPlan)} on ${periodEnd}.`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to:   companyEmail,
    subject,
    html,
  });
}


// Receipt for a contractor's own Lead2Project subscription payment.
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
  // Was planTier capitalized ("Basic"), which isn't what customers bought.
  const planName = planLabel(planTier);

  const html = buildEmail({
    ...L2P_FRAME,
    bodyHtml: `
      ${buildHeading('Payment received', companyName)}
      ${buildAmount('Amount paid', `$${amountPaid}`, invoiceDate)}
      ${buildEmailSection('Details', buildEmailTable([
        buildEmailRow('Plan', planName),
        buildEmailRow('Date', invoiceDate),
        nextBillingDate ? buildEmailRow('Next billing', nextBillingDate) : '',
      ]))}
      ${invoiceUrl ? `<div style="margin: 0 0 12px 0;">${buildButton('View invoice', invoiceUrl, 'secondary')}</div>` : ''}
      <p style="margin: 0 0 24px 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6; text-align: center;">
        Questions about billing? Just reply to this email.
      </p>
    `,
    ctaText: 'Go to dashboard',
    ctaUrl: dashboardUrl,
    preheader: `Payment of $${amountPaid} received. Thanks!`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `Payment received - $${amountPaid}`,
    html,
  });
}


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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const dashboardUrl = `${appUrl}/${companySlug}/dashboard`;
    const count = leads.length;

    const rows = leads.map((lead, i) => {
      const contact = [lead.customer_phone ? formatPhone(lead.customer_phone) : '', lead.customer_email || '']
        .filter(Boolean).join(' · ');
      return `
        <tr>
          <td style="padding: 14px 16px; ${i < count - 1 ? `border-bottom: 1px solid ${EMAIL.divider};` : ''} vertical-align: top;">
            <p style="margin: 0; color: ${EMAIL.ink}; font-size: 15px; font-weight: 600;">${lead.customer_name}</p>
            <p style="margin: 3px 0 0 0; color: ${EMAIL.muted}; font-size: 13px;">${[formatCategory(lead.category || ''), lead.status].filter(Boolean).join(' · ')}</p>
            ${contact ? `<p style="margin: 3px 0 0 0; color: ${EMAIL.muted}; font-size: 13px;">${contact}</p>` : ''}
            <p style="margin: 8px 0 0 0;">
              <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; background-color: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-size: 12px; font-weight: 600;">${lead.reason}</span>
            </p>
          </td>
        </tr>
      `;
    }).join('');

    const html = buildEmail({
      ...L2P_FRAME,
      footerNote: `You're getting this because follow-up reminders are on for ${companyName}. <a href="${appUrl}/${companySlug}/home" style="color: ${EMAIL.faint}; text-decoration: underline;">Change notification settings</a>`,
      bodyHtml: `
        ${buildHeading(`${count} lead${count > 1 ? 's' : ''} waiting on you`, `Morning, ${recipientName}. A quick nudge keeps these from going cold.`)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
          style="margin: 0 0 28px 0; border: 1px solid ${EMAIL.border}; border-radius: 12px; overflow: hidden; border-collapse: separate;">
          ${rows}
        </table>
      `,
      ctaText: 'Open leads',
      ctaUrl: dashboardUrl,
      preheader: `${count} lead${count > 1 ? 's' : ''} need follow-up today.`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: recipientEmail,
      subject: `${count} Lead${count > 1 ? 's' : ''} Need Follow-up - ${companyName}`,
      html,
    });

    console.log('✅ Follow-up reminder email sent to:', recipientEmail);
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    throw error;
  }
}


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
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const dashboardUrl = `${appUrl}/${companySlug}/dashboard`;
    const fmt = (n: string | number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));
    // Date-only values ("2026-11-20") are calendar days; timestamps are shown in Eastern time.
    const fmtDate = (d: string) => {
      const s = String(d);
      return /^\d{4}-\d{2}-\d{2}$/.test(s)
        ? new Date(s + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        : new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' });
    };
    const fmtTime = (t?: string) => {
      if (!t) return '';
      const [h, m] = t.split(':');
      const hour = parseInt(h);
      return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    const owedOn = (p: { quote_total?: string; payment_amount?: string }) => {
      const total = parseFloat(p.quote_total || '0');
      const paid = parseFloat(p.payment_amount || '0');
      return paid > 0 ? Math.max(total - paid, 0) : total;
    };

    const totalItems =
      todayJobs.length + staleLeads.length + staleQuotes.length +
      unpaidJobs.length + overduePayments.length + dueSoon.length +
      followUpReminders.length;

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York',
    });

    const muted = (s: string) => `<span style="color: ${EMAIL.muted}; font-weight: 400;">${s}</span>`;
    const num = (n?: number) => (n ? ` ${muted(`#${n}`)}` : '');

    type Row = { left: string; sub?: string; right: string; rightColor?: string };

    // Tone dot follows the app's colors: red = overdue, amber = money
    // waiting, slate = everything else.
    const section = (title: string, tone: 'red' | 'amber' | 'slate', rows: Row[]) => {
      if (!rows.length) return '';
      const dot = tone === 'red' ? '#dc2626' : tone === 'amber' ? '#d97706' : '#94a3b8';
      const body = rows.map((r, i) => `
        <tr>
          <td style="padding: 12px 16px; ${i < rows.length - 1 ? `border-bottom: 1px solid ${EMAIL.divider};` : ''} color: ${EMAIL.ink}; font-size: 14px; font-weight: 600; vertical-align: top;">
            ${r.left}
            ${r.sub ? `<div style="margin-top: 2px; color: ${EMAIL.muted}; font-size: 13px; font-weight: 400;">${r.sub}</div>` : ''}
          </td>
          <td style="padding: 12px 16px; ${i < rows.length - 1 ? `border-bottom: 1px solid ${EMAIL.divider};` : ''} color: ${r.rightColor || EMAIL.muted}; font-size: 13px; text-align: right; white-space: nowrap; vertical-align: top;">
            ${r.right}
          </td>
        </tr>
      `).join('');
      return `
        <div style="margin: 0 0 24px 0;">
          <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: ${EMAIL.ink};">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${dot}; margin-right: 8px; vertical-align: middle;"></span>${title} ${muted(`(${rows.length})`)}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
            style="border: 1px solid ${EMAIL.border}; border-radius: 12px; overflow: hidden; border-collapse: separate;">
            ${body}
          </table>
        </div>
      `;
    };

    const sections = [
      section("Today's jobs", 'slate', todayJobs.map(j => ({
        left: j.customer_name,
        sub: [j.category, j.assigned_to].filter(Boolean).join(' · '),
        right: j.scheduled_time ? fmtTime(j.scheduled_time) : 'Time TBD',
      }))),
      section('Overdue payments', 'red', overduePayments.map(p => ({
        left: `${p.customer_name}${num(p.project_number)}`,
        sub: p.payment_due_date ? `Was due ${fmtDate(p.payment_due_date)}` : undefined,
        right: `<strong>${fmt(owedOn(p))}</strong>`,
        rightColor: '#b91c1c',
      }))),
      section('Ready to collect', 'amber', unpaidJobs.map(j => ({
        left: `${j.customer_name}${num(j.project_number)}`,
        sub: j.scheduled_date ? `Job on ${fmtDate(j.scheduled_date)}` : undefined,
        right: j.quote_total ? fmt(j.quote_total) : '',
      }))),
      section('Due this week', 'amber', dueSoon.map(p => ({
        left: `${p.customer_name}${num(p.project_number)}`,
        sub: p.payment_due_date ? `Due ${fmtDate(p.payment_due_date)}` : undefined,
        right: fmt(owedOn(p)),
      }))),
      section('Follow-ups', 'slate', followUpReminders.map(r => ({
        left: r.customer_name,
        sub: [r.category, r.follow_up_notes].filter(Boolean).join(' · '),
        right: r.follow_up_date ? fmtDate(r.follow_up_date) : 'Today',
      }))),
      section('Quotes waiting for an answer', 'slate', staleQuotes.map(q => ({
        left: `${q.customer_name}${num(q.project_number)}`,
        sub: q.quote_sent_at ? `Sent ${fmtDate(q.quote_sent_at)}` : undefined,
        right: q.quote_total ? fmt(q.quote_total) : '',
      }))),
      section('Leads going cold', 'slate', staleLeads.map(l => ({
        left: l.name,
        sub: l.category,
        right: l.status || 'new',
      }))),
    ].join('');

    const html = buildEmail({
      ...L2P_FRAME,
      footerNote: `${companyName} daily digest. <a href="${appUrl}/${companySlug}/home" style="color: ${EMAIL.faint}; text-decoration: underline;">Change notification settings</a>`,
      bodyHtml: `
        ${buildHeading('Here’s your day', `${today} · ${totalItems} item${totalItems !== 1 ? 's' : ''} need attention`)}
        ${sections}
      `,
      ctaText: 'Open dashboard',
      ctaUrl: dashboardUrl,
      preheader: `${totalItems} item${totalItems !== 1 ? 's' : ''} need attention today.`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: companyEmail,
      subject: `${today} — ${totalItems} item${totalItems !== 1 ? 's' : ''} need attention · ${companyName}`,
      html,
    });

    console.log('✅ Daily digest sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send daily digest:', error);
    throw error;
  }
}


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
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${companySlug}/dashboard`;

  const html = buildEmail({
    ...L2P_FRAME,
    bodyHtml: `
      ${buildHeading(`${customerName} accepted your quote`, companyName)}
      ${buildAmount('Quote total', fmtUSD(quoteTotal), customerEmail)}
      ${buildParagraph('Next step: get them on the schedule.')}
    `,
    ctaText: 'Schedule the job',
    ctaUrl: dashboardUrl,
    preheader: `${customerName} accepted your ${fmtUSD(quoteTotal)} quote.`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: companyEmail,
    subject: `${customerName} accepted your quote — ${fmtUSD(quoteTotal)}`,
    html,
  });
}


// Sends a payment notification to the contractor after a successful payment.
export async function sendPaymentNotificationToContractor({
  contractorEmail,
  customerName,
  companyName,
  companyId,
  amountPaid,
  dashboardUrl,
  contractTotal,
  paidToDate,
  paymentKind,
}: {
  contractorEmail: string;
  customerName: string;
  companyName: string;
  companyId: number;
  amountPaid: number;
  dashboardUrl: string;
  contractTotal?: number;
  paidToDate?: number;
  paymentKind?: 'deposit' | 'balance' | 'refund' | string;
}) {
  try {
    const total = Number(contractTotal) || 0;
    const collected = Number(paidToDate) || amountPaid;
    const balance = total > 0 ? Math.max(total - collected, 0) : 0;
    const settled = total > 0 && balance <= 0;
    const isDeposit = paymentKind === 'deposit';

    // Green = money in (same rule as the app).
    const receivedHtml = `
      <div style="margin: 0 0 24px 0; padding: 24px 16px; border-radius: 12px; background-color: #f0fdf4; border: 1px solid #bbf7d0; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #166534;">${isDeposit ? 'Deposit received' : 'Payment received'}</p>
        <p style="margin: 0; font-size: 34px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; color: ${EMAIL.ink};">${fmtUSD(amountPaid)}</p>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: ${EMAIL.muted};">from ${customerName}</p>
      </div>
    `;

    const statusHtml = settled
      ? buildNotice('This job is now <strong>paid in full</strong>.', 'success')
      : balance > 0
      ? buildEmailTable([
          buildEmailRow('Job total', fmtUSD(total)),
          buildEmailRow('Collected', fmtUSD(collected)),
          buildEmailRow('<strong style="color: #0f172a;">Still owed</strong>', `<strong>${fmtUSD(balance)}</strong>`),
        ])
      : '';

    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading(`${customerName} paid ${fmtUSD(amountPaid)}`, companyName)}
        ${receivedHtml}
        ${statusHtml ? `<div style="margin: 0 0 28px 0;">${statusHtml}</div>` : ''}
      `,
      ctaText: 'View in dashboard',
      ctaUrl: dashboardUrl,
      preheader: `${customerName} paid ${fmtUSD(amountPaid)}${balance > 0 ? ` · ${fmtUSD(balance)} still owed` : settled ? ' · paid in full' : ''}`,
    });

    await resend.emails.send({
      from: `Lead2Project <hello@lead2project.com>`,
      to: contractorEmail,
      subject: `Payment received — ${fmtUSD(amountPaid)} from ${customerName}`,
      html,
    });

    console.log('Payment notification sent to contractor:', contractorEmail);
  } catch (error) {
    console.error('Failed to send payment notification to contractor:', error);
  }
}


// Sends a notification when a contractor's Stripe account becomes restricted
// (e.g. missing SSN, expired ID, new compliance requirement). Triggered from
// the account.updated webhook only when status regresses TO restricted from
// something else — see the webhook's previousStatus check. Same fail-soft
// pattern as the payment emails: never throw, this runs inside a webhook
// handler that must still return 200 to Stripe.
export async function sendStripeActionNeededEmail({
  contractorEmail,
  companyName,
  companyId,
  reasons,
  dashboardUrl,
}: {
  contractorEmail: string;
  companyName: string;
  companyId: number;
  reasons: { capability: string; code: string; resolution: string }[];
  dashboardUrl: string;
}) {
  try {
    const reasonItems = (reasons.length > 0
      ? reasons.map(r => describeRequirementReason(r.code, r.capability))
      : ['Stripe needs more information to keep processing payments.']
    ).map(text => `<li style="margin: 0 0 8px 0; color: ${EMAIL.text}; font-size: 14px; line-height: 1.5;">${text}</li>`).join('');

    const html = buildEmail({
      ...L2P_FRAME,
      bodyHtml: `
        ${buildHeading('Your card payments are paused', companyName)}
        ${buildNotice('Customers can’t pay by card and payouts are on hold until this is fixed.', 'danger')}
        ${buildEmailSection('What Stripe needs', `
          <div style="padding: 14px 16px 6px 16px; border-radius: 12px; border: 1px solid ${EMAIL.border};">
            <ul style="margin: 0; padding-left: 18px;">${reasonItems}</ul>
          </div>
        `)}
      `,
      ctaText: 'Fix it now',
      ctaUrl: dashboardUrl,
      preheader: 'Action needed: your Stripe card payments are paused',
    });

    await resend.emails.send({
      from: `Lead2Project <hello@lead2project.com>`,
      to: contractorEmail,
      subject: `Action needed — your Stripe payments are paused`,
      html,
    });

    console.log('Stripe action-needed email sent to:', contractorEmail);
  } catch (error) {
    console.error('Failed to send Stripe action-needed email:', error);
  }
}


export async function sendBookkeeperWelcomeEmail({
  name,
  email,
  partnerCode,
}: {
  name: string;
  email: string;
  partnerCode: string;
}) {
  const referralUrl = `https://lead2project.com/signup?ref=${partnerCode}`;

  const html = buildEmail({
    ...L2P_FRAME,
    footerNote: "You're getting this because you joined the Lead2Project Partner Program.",
    bodyHtml: `
      ${buildHeading(`Welcome to the Partner Program, ${name}`, 'Your account is set up and ready for referrals.')}
      <div style="margin: 0 0 28px 0; padding: 24px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; text-align: center;">
        <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: ${EMAIL.muted};">Your partner code</p>
        <p style="margin: 0 0 14px 0; font-size: 32px; font-weight: 700; letter-spacing: 0.06em; color: ${EMAIL.ink};">${partnerCode}</p>
        <p style="margin: 0 0 4px 0; font-size: 13px; color: ${EMAIL.muted};">Referral link for your contractor clients:</p>
        <a href="${referralUrl}" style="font-size: 14px; color: ${EMAIL.ink}; word-break: break-all;">${referralUrl}</a>
      </div>
      ${buildEmailSection('How it works', buildSteps([
        'Share your link with HVAC, plumbing, roofing, or electrical contractors.',
        'They sign up and get organized: leads, quotes, invoices and receipts in one place.',
        'You get a clean QuickBooks export with AI-classified line items every month. No chasing.',
      ]))}
    `,
    ctaText: 'Go to your dashboard',
    ctaUrl: 'https://lead2project.com/bookkeeper/dashboard',
    preheader: `Welcome to Lead2Project Partners — your code is ${partnerCode}`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: email,
    subject: `Welcome to Lead2Project Partners — your code is ${partnerCode}`,
    html,
  });
}


export async function sendBookkeeperNewClientEmail({
  bookkeepName,
  bookkeepEmail,
  clientName,
  partnerCode,
}: {
  bookkeepName: string;
  bookkeepEmail: string;
  clientName: string;
  partnerCode: string;
}) {
  const html = buildEmail({
    ...L2P_FRAME,
    footerNote: "You're getting this because you're a Lead2Project partner.",
    bodyHtml: `
      ${buildHeading(`New client: ${clientName}`, `Signed up with your code ${partnerCode}`)}
      ${buildParagraph(`Hi ${bookkeepName}, <strong>${clientName}</strong> just signed up with your referral code and is now linked to your partner account.`)}
      ${buildParagraph('Once they start logging jobs and invoices on a paid plan, you can view their financials and pull their QuickBooks export from your dashboard.')}
    `,
    ctaText: 'View your clients',
    ctaUrl: 'https://lead2project.com/bookkeeper/dashboard',
    preheader: `${clientName} just signed up using your referral code`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: bookkeepEmail,
    subject: `New client: ${clientName} signed up with your code`,
    html,
  });
}


export async function sendContractorReferredWelcomeEmail({
  contractorName,
  contractorEmail,
  bookkeeperName,
  dashboardUrl,
}: {
  contractorName: string;
  contractorEmail: string;
  bookkeeperName: string;
  dashboardUrl: string;
}) {
  const html = buildEmail({
    ...L2P_FRAME,
    bodyHtml: `
      ${buildHeading(`Welcome, ${contractorName}`, 'Your account is set up and ready to go.')}
      ${buildNotice(`<strong>Connected to ${bookkeeperName}.</strong> They referred you and can see your jobs, invoices, receipts and QuickBooks exports from their partner dashboard. No more sending files back and forth.`, 'info')}
      ${buildEmailSection('To get the most out of it', buildSteps([
        'Add your first job, or share your booking link.',
        'Attach receipts to each job as you go.',
        'Your bookkeeper handles the rest.',
      ]))}
    `,
    ctaText: 'Go to your dashboard',
    ctaUrl: dashboardUrl,
    preheader: `${bookkeeperName} set you up on Lead2Project`,
  });

  await resend.emails.send({
    from: 'Lead2Project <hello@lead2project.com>',
    to: contractorEmail,
    subject: `You're set up on Lead2Project — ${bookkeeperName} can now access your financials`,
    html,
  });
}


const DEMO_NOTIFY_TO = ['alexkatos24@gmail.com', 'hello@lead2project.com'];

export async function sendDemoRequestEmail({
  id,
  name,
  email,
  phone,
  company,
  trade,
  teamSize,
  message,
  source,
}: {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  trade?: string;
  teamSize?: string;
  message?: string;
  source?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: phone ? escapeHtml(phone) : '',
      company: company ? escapeHtml(company) : '',
      trade: trade ? escapeHtml(trade) : '',
      teamSize: teamSize ? escapeHtml(teamSize) : '',
      message: message ? escapeHtml(message) : '',
      source: source ? escapeHtml(source) : '',
    };
    const link = `color: ${EMAIL.ink}; text-decoration: underline;`;

    const detailsTable = buildEmailTable([
      buildEmailRow('Name', safe.name),
      buildEmailRow('Email', `<a href="mailto:${safe.email}" style="${link}">${safe.email}</a>`),
      safe.phone ? buildEmailRow('Phone', `<a href="tel:${safe.phone.replace(/\D/g, '')}" style="${link}">${safe.phone}</a>`) : '',
      buildEmailRow('Company', safe.company),
      buildEmailRow('Trade', safe.trade),
      buildEmailRow('Team size', safe.teamSize),
      buildEmailRow('Came from', safe.source),
    ]);

    const messageHtml = safe.message
      ? buildEmailSection(
          'What they said',
          `<div style="padding: 14px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; color: ${EMAIL.text}; font-size: 15px; line-height: 1.6; white-space: pre-line;">${safe.message}</div>`
        )
      : '';

    const html = buildEmail({
      ...L2P_FRAME,
      footerNote: 'Internal notification. Hit reply to answer them directly.',
      bodyHtml: `
        ${buildHeading(`Demo request: ${safe.name}`, `${safe.company ? `${safe.company} · ` : ''}#${id}`)}
        ${buildEmailSection('Who', detailsTable)}
        ${messageHtml}
      `,
      preheader: `Demo request from ${safe.name}${safe.company ? ` at ${safe.company}` : ''}`,
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: DEMO_NOTIFY_TO,
      replyTo: email, // hit reply and you're answering them directly
      subject: `Demo request: ${name}${company ? ` — ${company}` : ''}`,
      html,
    });

    return { ok: true };
  } catch (error) {
    // Returned rather than swallowed, so the route can record why it failed.
    console.error('Failed to send demo request email:', error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ─────────────────────────────────────────────────────────────
// sendDemoRequestConfirmationEmail
// Goes to the person who asked for the demo, so they know it landed.
// ─────────────────────────────────────────────────────────────

export async function sendDemoRequestConfirmationEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const safeName = escapeHtml(name);

    const html = buildEmail({
      ...L2P_FRAME,
      footerNote: 'You’re getting this because you asked for a Lead2Project demo.',
      bodyHtml: `
        ${buildHeading('We got your demo request')}
        ${buildParagraph(`Hi ${safeName}, thanks for asking about Lead2Project. Your request is in and we’ll be in touch shortly to find a time.`)}
        ${buildEmailSection('What happens next', buildSteps([
          'We read every request personally, usually the same day.',
          'You get an email back with a couple of times that work.',
          'We walk through your setup on a call, about 20 minutes.',
        ]))}
        <p style="margin: 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
          In a hurry? Reply to this email and it comes straight to us. You can also look around the product yourself at
          <a href="https://lead2project.com/demo" style="color: ${EMAIL.ink};">lead2project.com/demo</a>.
        </p>
      `,
      preheader: 'We got your demo request — here is what happens next.',
    });

    await resend.emails.send({
      from: 'Lead2Project <hello@lead2project.com>',
      to: email,
      replyTo: 'hello@lead2project.com',
      subject: 'We got your demo request — Lead2Project',
      html,
    });

    return { ok: true };
  } catch (error) {
    console.error('Failed to send demo confirmation:', error);
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}