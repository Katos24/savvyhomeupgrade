import { adminDb as sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { sendQuoteAcceptedNotification } from '@/lib/email';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action');

  if (!token || !action || !['accept', 'decline'].includes(action)) {
    return new NextResponse(renderPage('Invalid Link', 'This link is invalid or missing required information.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const projects = await sql`
      SELECT
        p.id,
        p.quote_token,
        p.quote_total,
        p.quote_accepted_at,
        p.quote_declined_at,
        p.customer_name,
        p.customer_email,
        l.company_id,
        c.name as company_name,
        c.email as company_email,
        c.phone as company_phone,
        c.slug as company_slug
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      JOIN companies c ON l.company_id = c.id
      WHERE p.quote_token = ${token}
      LIMIT 1
    `;

    if (projects.length === 0) {
      return new NextResponse(renderPage('Link Not Found', 'This quote link is invalid or has expired.', false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const project = projects[0];

    if (project.quote_accepted_at) {
      return new NextResponse(renderPage('Already Accepted', `You already accepted this quote on ${new Date(project.quote_accepted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. ${project.company_name} will be in touch to schedule your appointment.`, true), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (project.quote_declined_at) {
      return new NextResponse(renderPage('Already Declined', `You already declined this quote. If you changed your mind, please contact ${project.company_name} directly.`, false), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (action === 'accept') {
      await sql`
        UPDATE projects
        SET
          quote_accepted_at = NOW(),
          quote_token = NULL,
          updated_at = NOW()
        WHERE id = ${project.id}
      `;

      try {
        await sendQuoteAcceptedNotification({
          companyEmail: project.company_email,
          companyName: project.company_name,
          companySlug: project.company_slug,
          customerName: project.customer_name,
          customerEmail: project.customer_email,
          quoteTotal: parseFloat(project.quote_total),
          projectId: project.id,
        });
      } catch (err) {
        console.error('Failed to send acceptance notification:', err);
      }

      return new NextResponse(
        renderPage(
          '✅ Quote Accepted!',
          `Thanks ${project.customer_name}! You've accepted your quote with ${project.company_name}. They'll be reaching out shortly to schedule your appointment.`,
          true
        ),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    if (action === 'decline') {
      await sql`
        UPDATE projects
        SET
          quote_declined_at = NOW(),
          updated_at = NOW()
        WHERE id = ${project.id}
      `;

      return new NextResponse(
        renderPage(
          'Quote Declined',
          `Thanks for letting us know, ${project.customer_name}. Your response has been recorded. If you change your mind or have questions, please contact ${project.company_name} directly${project.company_phone ? ` at ${project.company_phone}` : ''}.`,
          false
        ),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

  } catch (error) {
    console.error('Quote respond error:', error);
    return new NextResponse(renderPage('Something went wrong', 'Please try again or contact the company directly.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function renderPage(title: string, message: string, success: boolean) {
  const color = success ? '#6366f1' : '#64748b';
  const bg = success ? '#eef2ff' : '#f8fafc';
  const icon = success ? '✅' : '📋';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${bg};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      padding: 48px 40px;
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { color: ${color}; font-size: 24px; font-weight: 700; margin-bottom: 12px; }
    p { color: #64748b; font-size: 15px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}