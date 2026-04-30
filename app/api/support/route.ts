import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message, imageUrl, companyId, userId } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (subject.length > 500) {
      return NextResponse.json(
        { error: 'Subject must be under 500 characters.' },
        { status: 400 }
      );
    }

    const [ticket] = await sql`
      INSERT INTO support_tickets (
        company_id,
        user_id,
        name,
        email,
        subject,
        message,
        image_url,
        status,
        priority
      ) VALUES (
        ${companyId || null},
        ${userId || null},
        ${name},
        ${email},
        ${subject},
        ${message},
        ${imageUrl || null},
        'open',
        'normal'
      )
      RETURNING id, created_at
    `;

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'Lead2Project Support <hello@lead2project.com>',
        to: email,
        subject: `We got your ticket (#${ticket.id})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <div style="margin-bottom: 32px;">
              <img src="https://lead2project.com/Lead2ProjectLogo.png" alt="Lead2Project" style="width: 36px; height: 36px;" />
            </div>
            <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 8px;">
              We received your request
            </h1>
            <p style="font-size: 15px; color: #64748b; margin: 0 0 28px; line-height: 1.6;">
              Hi ${name}, thanks for reaching out. We have logged your ticket and will get back to you as soon as possible.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
              <p style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px;">
                Ticket #${ticket.id}
              </p>
              <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 12px;">
                ${subject}
              </p>
              <p style="font-size: 14px; color: #64748b; margin: 0; line-height: 1.5;">
                ${message.length > 200 ? message.substring(0, 200) + '...' : message}
              </p>
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.5;">
              We typically respond within 24 hours. If your issue is urgent, reply to this email directly.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;" />
            <p style="font-size: 12px; color: #cbd5e1; margin: 0;">
              Lead2Project Support
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError);
    }

    // Send notification email to support team
    try {
      await resend.emails.send({
        from: 'Lead2Project System <hello@lead2project.com>',
        to: 'hello@lead2project.com',
        subject: `New Ticket #${ticket.id}: ${subject}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 20px;">
              New Support Ticket #${ticket.id}
            </h1>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; font-weight: 600; width: 80px; vertical-align: top;">From</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${name} (${email})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; font-weight: 600; vertical-align: top;">Subject</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${subject}</td>
                </tr>
                ${companyId ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; font-weight: 600; vertical-align: top;">Company</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a;">ID: ${companyId}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            <div style="margin-bottom: 20px;">
              <p style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">
                Message
              </p>
              <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            ${imageUrl ? `
            <div style="margin-bottom: 20px;">
              <p style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">
                Attached Screenshot
              </p>
              <img src="${imageUrl}" alt="Screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0;" />
            </div>
            ` : ''}
            <p style="font-size: 13px; color: #94a3b8; margin: 0;">
              Reply directly to ${email} to respond.
            </p>
          </div>
        `,
        replyTo: email,
      });
    } catch (emailError) {
      console.error('Failed to send support notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Support ticket submitted successfully.',
    });
  } catch (error: any) {
    console.error('Support ticket error:', error);
    return NextResponse.json(
      { error: 'Failed to submit ticket. Please try again.' },
      { status: 500 }
    );
  }
}