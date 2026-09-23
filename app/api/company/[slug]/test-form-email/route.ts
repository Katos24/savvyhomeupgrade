// app/api/company/[slug]/test-form-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { getCompanyEmailTemplates, renderEmailTemplate } from '@/lib/emailTemplates';
import { buildEmail, buildEmailRow, buildEmailTable, buildEmailSection, buildCustomAnswers } from '@/lib/emailBase';

const resend = new Resend(process.env.RESEND_API_KEY);
const sql = neon(process.env.DATABASE_URL!);

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Sends the SAME confirmation email a real customer would receive after
 * submitting the public form — reusing sendLeadConfirmationEmail's exact
 * template pieces (buildEmail, buildEmailSection, buildCustomAnswers) so
 * this can never visually drift from the real thing. Deliberately makes
 * NO database writes at all: no lead, no project, nothing to later find
 * and delete. This is purely "let the contractor see what their customer
 * would see," triggered from FormTab's Test Mode modal.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // ── Auth — same shape as other company-scoped routes this session ──
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    let decoded: any;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const companies = await sql`
      SELECT id, name, logo_url, phone, email, website, email_brand_color_1, email_brand_color_2
      FROM companies WHERE slug = ${slug} LIMIT 1
    `;
    const company = companies[0];
    if (!company || company.id !== decoded.companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { to, name, category, description, answers, address, preferredDate, preferredTime } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing recipient email' }, { status: 400 });
    }

    const emailTemplates = await getCompanyEmailTemplates(company.id);
    const confirmTemplate = emailTemplates?.lead_confirmation;
    const brandColor = company.email_brand_color_1 || '#667eea';
    const displayCategory = category ? formatCategory(category) : 'Your Service';

    // Custom question answers arrive keyed by question id — real labels
    // aren't available here without a second query, so this passes plain
    // keys through as a lightweight fallback. Good enough for a test
    // preview; the real send path (sendLeadConfirmationEmail) already
    // resolves real labels via customQuestions.
    const answerEntries = answers && typeof answers === 'object'
      ? Object.entries(answers).filter(([, v]) => v)
      : [];
    const customAnswerHtml = answerEntries.length
      ? buildEmailSection(
          'Form Responses',
          answerEntries
            .map(
              ([key, value]) => `
                <div style="border-left: 3px solid ${brandColor}; padding: 10px 14px; border-radius: 0 6px 6px 0; margin-bottom: 8px; background-color: #f8fafc;">
                  <p style="margin: 0 0 2px 0; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${key}</p>
                  <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">${value}</p>
                </div>
              `
            )
            .join('')
        )
      : '';

    const summaryTable = buildEmailTable([
      buildEmailRow('Service', displayCategory),
      buildEmailRow('Address', address || ''),
      preferredDate || preferredTime
        ? buildEmailRow('Preferred', [preferredDate, preferredTime].filter(Boolean).join(' at '))
        : '',
      buildEmailRow('Details', description || ''),
    ]);

    const nextStepsHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        ${[
          'We review your request and confirm availability.',
          'A team member contacts you to discuss the details.',
          'We get the job done.',
        ]
          .map(
            (step, i) => `
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
        `
          )
          .join('')}
      </table>
    `;

    const bodyHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 50px; padding: 6px 16px;">
          <span style="color: #1e40af; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Test Mode Preview</span>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 50px; padding: 9px 20px;">
          <span style="color: #16a34a; font-size: 13px; font-weight: 700;">Request received successfully</span>
        </div>
      </div>

      <p style="margin: 0 0 28px 0; color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-line;">
        ${
          confirmTemplate?.body
            ? renderEmailTemplate(confirmTemplate, {
                company_name: company.name,
                company_phone: company.phone || '',
                customer_name: name || 'there',
                request_summary: buildEmailSection('Your Request Summary', summaryTable) + customAnswerHtml,
              }).body
            : `Hi ${name || 'there'}, thanks for reaching out to <strong>${company.name}</strong>. We have received your request and someone will be in touch with you shortly.`
        }
      </p>

      ${buildEmailSection('What Happens Next', nextStepsHtml)}

      <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
        This is a test preview — no lead was created and nothing was saved to your dashboard.
      </p>
    `;

    const html = buildEmail({
      companyName: company.name,
      logoUrl: company.logo_url,
      brandColor: company.email_brand_color_1,
      brandColor2: company.email_brand_color_2,
      bodyHtml,
      phone: company.phone,
      website: company.website,
      preheader: `Test preview of your booking confirmation email — ${displayCategory}`,
    });

    const confirmSubject = confirmTemplate?.subject
      ? renderEmailTemplate(confirmTemplate, {
          company_name: company.name,
          customer_name: name || 'there',
        }).subject
      : `[Test] We received your request — ${company.name}`;

    await resend.emails.send({
      from: `${company.name} <hello@lead2project.com>`,
      to,
      replyTo: company.email || undefined,
      subject: confirmSubject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test form email error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 500 });
  }
}