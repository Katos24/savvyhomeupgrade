// app/api/company/[slug]/test-form-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { sendLeadConfirmationEmail } from '@/lib/email';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Sends the SAME confirmation email a real customer gets after submitting
 * the public form, by calling sendLeadConfirmationEmail itself in test
 * mode (test banner + "[Test]" subject). It used to rebuild the email
 * here, which had drifted from the real one. Makes NO database writes:
 * no lead, no project. Triggered from FormTab's Test Mode modal.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // ── Auth ──
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

    const companies = await sql`SELECT id, name FROM companies WHERE slug = ${slug} LIMIT 1`;
    const company = companies[0];
    if (!company || company.id !== decoded.companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { to, name, category, description, answers, address, preferredDate, preferredTime } = body;

    if (!to || typeof to !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing recipient email' }, { status: 400 });
    }

    // Answers arrive keyed by question id. Real labels would need another
    // query, so the id doubles as the label — fine for a test preview.
    const customAnswers: Record<string, string> = {};
    if (answers && typeof answers === 'object') {
      for (const [k, v] of Object.entries(answers)) {
        if (v) customAnswers[k] = String(v);
      }
    }
    const customQuestions = Object.keys(customAnswers).map((id) => ({ id, label: id, type: 'text' }));

    await sendLeadConfirmationEmail({
      customerEmail: to,
      customerName: name || 'there',
      category: category || 'your_service',
      companyName: company.name,
      companyId: company.id,
      description: description || undefined,
      address: address || undefined,
      preferredDate: preferredDate || undefined,
      preferredTime: preferredTime || undefined,
      customAnswers,
      customQuestions,
      testMode: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Test form email error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send test email' }, { status: 500 });
  }
}