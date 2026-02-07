import { Resend } from 'resend';
import { getCompanyEmailTemplates, renderEmailTemplate, textToHtml } from './emailTemplates';
import { neon } from '@neondatabase/serverless';

const resend = new Resend(process.env.RESEND_API_KEY);
const sql = neon(process.env.DATABASE_URL!);

// Helper function to get company details
async function getCompanyDetails(companyId: number) {
  const companies = await sql`
    SELECT name, logo_url, phone, email_brand_color_1, email_brand_color_2 
    FROM companies WHERE id = ${companyId} LIMIT 1
  `;
  return companies[0];
}

// 🎯 Send new lead alert to contractor
export async function sendNewLeadAlertEmail({
  contractorEmail,
  customerName,
  customerEmail,
  customerPhone,
  category,
  description,
  dashboardUrl,
  address,
  city,
  photosCount,
}: {
  contractorEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  category: string;
  description: string;
  dashboardUrl: string;
  address?: string;
  city?: string;
  photosCount?: number;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; }
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .info-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0; }
            .label { color: #6b7280; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 16px 0 4px 0; }
            .value { color: #333; font-size: 16px; margin: 0 0 16px 0; }
            .highlight { background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 4px; }
            .button { background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 New Lead Received!</h1>
            <p>You have a new lead from <strong>${customerName}</strong></p>
            
            <div class="info-box">
              <div class="label">Category:</div>
              <div class="value">${category}</div>
              
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${customerEmail}">${customerEmail}</a></div>
              
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${customerPhone}">${customerPhone}</a></div>
              
              ${address ? `
                <div class="label">Service Address:</div>
                <div class="value">📍 ${address}${city ? `, ${city}` : ''}</div>
              ` : ''}
              
              ${photosCount && photosCount > 0 ? `
                <div class="label">Photos Uploaded:</div>
                <div class="value">📸 ${photosCount} photo${photosCount > 1 ? 's' : ''} attached</div>
              ` : ''}
              
              ${description ? `
                <div class="label">Description:</div>
                <div class="value">${description}</div>
              ` : ''}
            </div>
            
            ${address ? `
              <div class="highlight">
                <strong>📍 Quick Actions:</strong><br>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + (city ? ', ' + city : ''))}" style="color: #3b82f6; text-decoration: none;">
                  View on Google Maps →
                </a>
              </div>
            ` : ''}
            
            <center>
              <a href="${dashboardUrl}" class="button">View in Dashboard</a>
            </center>
            
            <div class="footer">SavvyHome CRM</div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'SavvyHome CRM <onboarding@resend.dev>',
      to: contractorEmail,
      subject: `🎯 New Lead: ${customerName} - ${category}`,
      html: emailHtml,
    });

    console.log('✅ New lead alert sent to contractor');
  } catch (error) {
    console.error('❌ Failed to send lead alert:', error);
  }
}

// 📧 Send confirmation to customer
export async function sendLeadConfirmationEmail({
  customerEmail,
  customerName,
  category,
  companyName,
}: {
  customerEmail: string;
  customerName: string;
  category: string;
  companyName: string;
}) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; }
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            p { color: #333; font-size: 16px; line-height: 26px; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; border-top: 1px solid #e6ebf1; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Thanks for reaching out! 🎉</h1>
            <p>Hi ${customerName},</p>
            <p>We received your request for <strong>${category}</strong> services.</p>
            <p>We'll review your request and get back to you within 24 hours.</p>
            <div class="footer">${companyName}</div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'SavvyHome <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Thanks for reaching out to ${companyName}!`,
      html: emailHtml,
    });

    console.log('✅ Confirmation email sent to customer');
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
  }
}

// 🔒 Send password reset email
export async function sendPasswordResetEmail({
  userEmail,
  userName,
  resetLink,
}: {
  userEmail: string;
  userName: string;
  resetLink: string;
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
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .button { background-color: #5469d4; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔒 Reset Your Password</h1>
            
            <p>Hi ${userName},</p>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #5469d4;">${resetLink}</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
            </div>
            
            <div class="footer">
              Lead2Project<br>
              This is an automated email, please do not reply.
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <onboarding@resend.dev>',
      to: userEmail,
      subject: '🔒 Reset Your Password',
      html: emailHtml,
    });

    console.log('✅ Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

// 👥 Send team member invitation email
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
            .button { background-color: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .info-box { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>👥 You've Been Invited!</h1>
            
            <p>Hi there!</p>
            
            <p><strong>${inviterName}</strong> has invited you to join their team at <strong>${companyName}</strong>.</p>
            
            <div class="info-box">
              <strong>Your Role:</strong> ${role === 'admin' ? '⚙️ Admin' : '👤 Member'}<br>
              ${role === 'admin' 
                ? 'You\'ll be able to manage leads, team members, and settings.' 
                : 'You\'ll be able to view and manage leads.'}
            </div>
            
            <p>Click the button below to accept the invitation and set up your account:</p>
            
            <center>
              <a href="${inviteLink}" class="button">Accept Invitation →</a>
            </center>
            
            <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6; font-size: 14px;">${inviteLink}</p>
            
            <p style="font-size: 14px; color: #999; margin-top: 32px;">
              ⚠️ This invitation will expire in 24 hours.
            </p>
            
            <div class="footer">
              Lead2Project<br>
              This is an automated email, please do not reply.
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <onboarding@resend.dev>',
      to: inviteeEmail,
      subject: `You've been invited to join ${companyName}`,
      html: emailHtml,
    });

    console.log('✅ Team invite email sent to:', inviteeEmail);
  } catch (error) {
    console.error('❌ Failed to send team invite email:', error);
    throw error;
  }
}

// 💰 Send quote to customer (NOW USES CUSTOM TEMPLATES WITH BRANDING!)
export async function sendQuoteToCustomer({
  customerEmail,
  customerName,
  companyName,
  companyPhone,
  companyId,
  quoteTotal,
  quoteItems,
  projectDescription,
}: {
  customerEmail: string;
  customerName: string;
  companyName: string;
  companyPhone?: string;
  companyId: number;
  quoteTotal: number;
  quoteItems: Array<{ description: string; amount: number }>;
  projectDescription?: string;
}) {
  try {
    console.log('🔥 sendQuoteToCustomer called');

    // Get company details for logo
    const company = await getCompanyDetails(companyId);

    // Get company's custom email template
    const templates = await getCompanyEmailTemplates(companyId);
    const quoteTemplate = templates.quote;
    
    // Prepare variables
    const variables = {
      company_name: company.name || companyName,
      company_phone: company.phone || companyPhone || '',
      customer_name: customerName,
      quote_total: quoteTotal.toFixed(2),
      project_description: projectDescription || 'Your project',
    };
    
    // Render the template
    const rendered = renderEmailTemplate(quoteTemplate, variables);
    
    // Convert to branded HTML with logo
   const emailHtml = textToHtml(
  rendered.body,
  company.name || companyName,
  company.logo_url || undefined,
  company.phone || companyPhone,
  company.email_brand_color_1 || undefined,
  company.email_brand_color_2 || undefined
);
    await resend.emails.send({
      from: `${company.name || companyName} <onboarding@resend.dev>`,
      to: customerEmail,
      subject: rendered.subject,
      html: emailHtml,
    });

    console.log('✅ Quote email sent to customer:', customerEmail);
  } catch (error) {
    console.error('❌ Failed to send quote email:', error);
    throw error;
  }
}

// 📅 Send schedule confirmation to customer (NOW USES CUSTOM TEMPLATES WITH BRANDING!)
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
}) {
  try {
    console.log('🔥 sendScheduleConfirmation called');

    // Get company details for logo
    const company = await getCompanyDetails(companyId);

    // Get company's custom email template
    const templates = await getCompanyEmailTemplates(companyId);
    const scheduleTemplate = templates.schedule;
    
    // Format the date nicely
    const dateObj = new Date(scheduledDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Format time if provided
    let formattedTime = scheduledTime || 'TBD';
    if (scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      formattedTime = `${hour12}:${minutes} ${ampm}`;
    }
    
    // Prepare variables
    const variables = {
      company_name: company.name || companyName,
      company_phone: company.phone || companyPhone || '',
      customer_name: customerName,
      scheduled_date: formattedDate,
      scheduled_time: formattedTime,
      customer_address: serviceAddress || '',
    };
    
    // Render the template
    const rendered = renderEmailTemplate(scheduleTemplate, variables);
    
    // Convert to branded HTML with logo
  const emailHtml = textToHtml(
  rendered.body,
  company.name || companyName,
  company.logo_url || undefined,
  company.phone || companyPhone,
  company.email_brand_color_1 || undefined,
  company.email_brand_color_2 || undefined
);

    await resend.emails.send({
      from: `${company.name || companyName} <onboarding@resend.dev>`,
      to: customerEmail,
      subject: rendered.subject,
      html: emailHtml,
    });

    console.log('✅ Schedule confirmation sent to customer:', customerEmail);
  } catch (error) {
    console.error('❌ Failed to send schedule confirmation:', error);
    throw error;
  }
}

// Keep all your other email functions below (trial reminders, etc.) - they stay the same
export async function sendTrialEndingReminderEmail({
  companyEmail,
  companyName,
  daysRemaining,
  subscribeUrl,
}: {
  companyEmail: string;
  companyName: string;
  daysRemaining: number;
  subscribeUrl: string;
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
            <h1>⏰ Your Free Trial is Ending Soon</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="warning-box">
              <div style="font-size: 64px; margin-bottom: 12px;">⏰</div>
              <div class="days">${daysRemaining} Days Left</div>
              <p style="margin: 8px 0; color: #92400e; font-weight: 600;">Your free trial ends in ${daysRemaining} days</p>
            </div>
            
            <p>We hope you've been enjoying Lead2Project! Your trial is ending soon, but don't worry - you can continue using all features for just <strong>$39.99/month</strong>.</p>
            
            <div class="features">
              <h3 style="margin-top: 0; color: #333;">✅ What You Keep:</h3>
              <div class="feature">✓ Unlimited lead tracking</div>
              <div class="feature">✓ Professional quote builder</div>
              <div class="feature">✓ Photo uploads from customers</div>
              <div class="feature">✓ Get paid in 2 days with Stripe</div>
              <div class="feature">✓ Team management</div>
              <div class="feature">✓ Email notifications</div>
            </div>
            
            <p><strong>Your card will be automatically charged $39.99 on your trial end date.</strong> No action needed!</p>
            
            <center>
              <a href="${subscribeUrl}" class="button">View Billing Details →</a>
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
      from: 'Lead2Project <onboarding@resend.dev>',
      to: companyEmail,
      subject: `⏰ ${daysRemaining} days left in your free trial`,
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
            <h1>⚠️ Payment Failed</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="alert-box">
              <div style="font-size: 48px; text-align: center; margin-bottom: 12px;">💳</div>
              <p style="margin: 0; font-weight: 600; color: #991b1b; text-align: center;">
                We couldn't process your payment
              </p>
            </div>
            
            <p>Your recent payment of $39.99 failed to process. This could be due to:</p>
            
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
      from: 'Lead2Project <onboarding@resend.dev>',
      to: companyEmail,
      subject: '⚠️ Payment Failed - Update Your Card',
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
            <h1>🎉 Welcome to Lead2Project!</h1>
            
            <p>Hi ${companyName},</p>
            
            <div class="success-box">
              <div style="font-size: 64px; margin-bottom: 12px;">✅</div>
              <p style="margin: 0; font-weight: 600; color: #065f46; font-size: 18px;">
                Your subscription is now active!
              </p>
            </div>
            
            <p>Thank you for subscribing! Your payment of <strong>$39.99</strong> has been processed successfully.</p>
            
            <p>You now have full access to all Lead2Project features:</p>
            
            <ul style="color: #555; line-height: 28px;">
              <li>✓ Unlimited lead tracking</li>
              <li>✓ Professional quotes & invoices</li>
              <li>✓ Fast payments (2 days with Stripe)</li>
              <li>✓ Photo uploads from customers</li>
              <li>✓ Team collaboration</li>
            </ul>
            
            <center>
              <a href="${dashboardUrl}" class="button">Go to Dashboard →</a>
            </center>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
              You'll be billed $39.99 monthly. Manage your subscription anytime from your billing settings.
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
      from: 'Lead2Project <onboarding@resend.dev>',
      to: companyEmail,
      subject: '🎉 Welcome to Lead2Project - Subscription Active!',
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
  subscribeUrl,
}: {
  userEmail: string;
  userName: string;
  companyName: string;
  subscribeUrl: string;
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
            h1 { color: #333; font-size: 28px; margin-bottom: 20px; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .button { background-color: #10b981; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎉 Welcome to Lead2Project, ${userName}!</h1>
            
            <p>Your account for <strong>${companyName}</strong> has been created successfully!</p>
            
            <p>Next step: Complete your setup by adding your payment method to start your 14-day free trial.</p>
            
            <center>
              <a href="${subscribeUrl}" class="button">Complete Your Signup →</a>
            </center>
            
            <p>You won't be charged until after your trial ends. Cancel anytime!</p>
            
            <div class="footer">
              Lead2Project<br>
              Questions? Reply to this email!
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <onboarding@resend.dev>',
      to: userEmail,
      subject: `🎉 Welcome to Lead2Project - Complete Your Signup`,
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
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; }
            .container { background-color: #ffffff; margin: 40px auto; padding: 40px; max-width: 600px; border-radius: 8px; }
            h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
            p { color: #555; font-size: 16px; line-height: 24px; margin: 16px 0; }
            .button { background-color: #3b82f6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-weight: bold; }
            .footer { color: #8898aa; font-size: 14px; text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e6ebf1; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>😔 Your Subscription Has Been Cancelled</h1>
            
            <p>Hi ${companyName},</p>
            
            <p>We're sorry to see you go! Your Lead2Project subscription has been cancelled.</p>
            
            <p><strong>What happens now:</strong></p>
            <ul style="color: #555; line-height: 28px;">
              <li>Your access will continue until the end of your current billing period</li>
              <li>You won't be charged again</li>
              <li>Your data will be saved for 30 days in case you change your mind</li>
            </ul>
            
            <p>Want to come back? You can reactivate your subscription anytime!</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/subscribe" class="button">Reactivate Subscription</a>
            </center>
            
            <p style="font-size: 14px; color: #666; margin-top: 32px;">
              We'd love to know why you cancelled. Reply to this email and let us know how we can improve!
            </p>
            
            <div class="footer">
              Lead2Project<br>
              We hope to see you again soon!
            </div>
          </div>
        </body>
      </html>
    `;

    await resend.emails.send({
      from: 'Lead2Project <onboarding@resend.dev>',
      to: companyEmail,
      subject: 'Your Lead2Project subscription has been cancelled',
      html: emailHtml,
    });

    console.log('✅ Cancellation email sent to:', companyEmail);
  } catch (error) {
    console.error('❌ Failed to send cancellation email:', error);
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
            <h1>🔔 Follow-up Reminders</h1>
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
      from: 'Lead2Project Reminders <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `🔔 ${leads.length} Lead${leads.length > 1 ? 's' : ''} Need Follow-up - ${companyName}`,
      html: emailHtml,
    });

    console.log('✅ Follow-up reminder email sent to:', recipientEmail);
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error);
    throw error;
  }
}