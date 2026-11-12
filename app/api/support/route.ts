import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { Resend } from 'resend';
import {
  buildEmail,
  buildHeading,
  buildParagraph,
  buildEmailSection,
  buildEmailTable,
  buildEmailRow,
  EMAIL,
} from '@/lib/emailBase';
import { escapeHtml, L2P_FRAME } from '@/lib/emails/shared';

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

    // Everything below came from a form, so escape it before it goes into HTML.
    const safe = {
      name: escapeHtml(String(name)),
      email: escapeHtml(String(email)),
      subject: escapeHtml(String(subject)),
      message: escapeHtml(String(message)),
      preview: escapeHtml(String(message).length > 200 ? String(message).substring(0, 200) + '…' : String(message)),
    };
    const safeImageUrl = typeof imageUrl === 'string' && /^https:\/\//i.test(imageUrl) ? escapeHtml(imageUrl) : '';

    const ticketBox = (text: string) => `
      <div style="margin: 0 0 28px 0; padding: 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border};">
        <p style="margin: 0 0 4px 0; font-size: 13px; color: ${EMAIL.muted};">Ticket #${ticket.id}</p>
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${EMAIL.ink};">${safe.subject}</p>
        <p style="margin: 0; font-size: 14px; color: ${EMAIL.text}; line-height: 1.55; white-space: pre-wrap;">${text}</p>
      </div>
    `;

    // Confirmation to the person who wrote in
    try {
      const html = buildEmail({
        ...L2P_FRAME,
        footerNote: 'You’re getting this because you contacted Lead2Project support.',
        bodyHtml: `
          ${buildHeading('We got your request')}
          ${buildParagraph(`Hi ${safe.name}, thanks for reaching out. Your ticket is logged and we’ll get back to you as soon as possible.`)}
          ${ticketBox(safe.preview)}
          <p style="margin: 0; color: ${EMAIL.muted}; font-size: 14px; line-height: 1.6;">
            We typically respond within 24 hours. If it’s urgent, just reply to this email.
          </p>
        `,
        preheader: `Ticket #${ticket.id} received. We'll be in touch soon.`,
      });

      await resend.emails.send({
        from: 'Lead2Project Support <hello@lead2project.com>',
        to: email,
        subject: `We got your ticket (#${ticket.id})`,
        html,
      });
    } catch (emailError) {
      console.error('Failed to send user confirmation email:', emailError);
    }

    // Notification to the support inbox
    try {
      const html = buildEmail({
        ...L2P_FRAME,
        footerNote: 'Internal notification. Hit reply to answer them directly.',
        bodyHtml: `
          ${buildHeading(`New ticket #${ticket.id}`, safe.subject)}
          ${buildEmailSection('From', buildEmailTable([
            buildEmailRow('Name', safe.name),
            buildEmailRow('Email', `<a href="mailto:${safe.email}" style="color: ${EMAIL.ink};">${safe.email}</a>`),
            companyId ? buildEmailRow('Company', `ID ${escapeHtml(String(companyId))}`) : '',
          ]))}
          ${buildEmailSection('Message', `<div style="padding: 14px 16px; border-radius: 12px; background-color: ${EMAIL.soft}; border: 1px solid ${EMAIL.border}; color: ${EMAIL.text}; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safe.message}</div>`)}
          ${safeImageUrl ? buildEmailSection('Screenshot', `<img src="${safeImageUrl}" alt="Screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid ${EMAIL.border};" />`) : ''}
        `,
        preheader: `${safe.name}: ${safe.subject}`,
      });

      await resend.emails.send({
        from: 'Lead2Project System <hello@lead2project.com>',
        to: 'hello@lead2project.com',
        subject: `New Ticket #${ticket.id}: ${subject}`,
        html,
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