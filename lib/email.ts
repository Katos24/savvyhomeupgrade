import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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