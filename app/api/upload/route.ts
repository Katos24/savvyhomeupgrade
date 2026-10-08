import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { sendNewLeadAlertEmail, sendLeadConfirmationEmail } from '@/lib/email';
import { cleanTimeline, cleanBestTimes } from '@/lib/timing';

export const maxDuration = 60;
export const runtime = 'nodejs';

// Creates a lead. Called by:
//   - the public booking form (UploadForm) — anyone on the internet
//   - the dashboard (contractor adding a lead by hand) — logged in
// Public callers can't pick the company by id alone, can't set created_by,
// can't switch off the emails, and can only attach files from our own Blob
// storage. Logged-in members of the company keep all of those options.

const sql = neon(process.env.DATABASE_URL!);

const MAX = {
  name: 120,
  email: 254,
  phone: 40,
  address: 200,
  city: 100,
  zip: 20,
  category: 80,
  description: 5000,
  leadSource: 80,
  customAnswersJson: 20_000,
  files: 20,
};

const str = (v: unknown, max: number): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.slice(0, max);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same rule as update_lead_step2: only files in our own Vercel Blob store.
function isOurBlobFile(f: any): boolean {
  const raw = typeof f === 'string' ? f : f?.url;
  if (typeof raw !== 'string') return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

const formatCategory = (cat: string) =>
  cat
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Returns the logged-in user's company id, or null for the public.
async function loggedInCompanyId(): Promise<number | null> {
  try {
    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    if (!decoded?.userId) return null;
    const rows = await sql`SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    return rows[0]?.company_id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, any> = {};

    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
    } else {
      const formData = await request.formData();
      for (const key of [
        'name', 'email', 'phone', 'address_line_1', 'address_line_2', 'city', 'zip_code',
        'category', 'description', 'company_slug', 'lead_source',
      ]) {
        const v = formData.get(key);
        if (typeof v === 'string') body[key] = v;
      }
    }

    // ── Fields ──
    const name = str(body.name, MAX.name);
    const emailRaw = str(body.email, MAX.email);
    const email = emailRaw && EMAIL_RE.test(emailRaw) ? emailRaw : null;
    const phone = str(body.phone, MAX.phone);
    const address_line_1 = str(body.address_line_1, MAX.address);
    const address_line_2 = str(body.address_line_2, MAX.address);
    const city = str(body.city, MAX.city);
    const zip_code = str(body.zip_code, MAX.zip);
    const category = str(body.category, MAX.category);
    const description = str(body.description, MAX.description);
    const lead_source = str(body.lead_source, MAX.leadSource);
    // Timing (lib/timing.ts): "how soon" and "best times", never a booking.
    const preferred_date = cleanTimeline(body.preferred_date);
    const preferred_time = cleanBestTimes(body.preferred_time);

    let customAnswers: Record<string, any> =
      body.custom_answers && typeof body.custom_answers === 'object' && !Array.isArray(body.custom_answers)
        ? body.custom_answers
        : {};
    if (JSON.stringify(customAnswers).length > MAX.customAnswersJson) customAnswers = {};

    if (!name) {
      return NextResponse.json({ success: false, error: 'Please enter your name.' }, { status: 400 });
    }
    if (emailRaw && !email) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // ── Which company ──
    const slugIn = str(body.company_slug, 100);
    const idIn = body.company_id != null && body.company_id !== '' ? parseInt(String(body.company_id), 10) : null;

    let company: any = null;
    if (slugIn) {
      const rows = await sql`SELECT id, slug, email, name, custom_questions FROM companies WHERE slug = ${slugIn} LIMIT 1`;
      company = rows[0] || null;
      // If both were sent they must point at the same company.
      if (company && idIn != null && Number.isFinite(idIn) && idIn !== company.id) company = null;
    } else if (idIn != null && Number.isFinite(idIn)) {
      const rows = await sql`SELECT id, slug, email, name, custom_questions FROM companies WHERE id = ${idIn} LIMIT 1`;
      company = rows[0] || null;
    }
    if (!company) {
      return NextResponse.json({ success: false, error: 'This booking form is no longer available.' }, { status: 404 });
    }

    // ── Who is asking ──
    const userCompanyId = await loggedInCompanyId();
    const isMember = userCompanyId != null && userCompanyId === company.id;

    // The public form must give a way to reach the customer and a service.
    // A contractor adding a walk-in by hand is trusted to leave them blank.
    if (!isMember) {
      if (!email && !phone) {
        return NextResponse.json({ success: false, error: 'Please enter an email or phone number.' }, { status: 400 });
      }
      if (!category) {
        return NextResponse.json({ success: false, error: 'Please choose a service.' }, { status: 400 });
      }
    }

    const created_by = isMember ? str(body.created_by, 40) || 'customer' : 'customer';
    const notify_customer = isMember ? body.notify_customer !== false : true;
    const notify_owner = isMember ? body.notify_owner !== false : true;

    const fileUrls = (Array.isArray(body.file_urls) ? body.file_urls : []).filter(isOurBlobFile).slice(0, MAX.files);

    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, address_line_1, address_line_2, city, zip_code, category, description,
        company_id, status, file_urls, lead_source, custom_answers, preferred_date, preferred_time, created_by
      ) VALUES (
        ${name}, ${email}, ${phone}, ${address_line_1}, ${address_line_2}, ${city}, ${zip_code}, ${category}, ${description},
        ${company.id}, 'new', ${JSON.stringify(fileUrls)}, ${lead_source}, ${JSON.stringify(customAnswers)}, ${preferred_date}, ${preferred_time}, ${created_by}
      )
      RETURNING id
    `;
    const leadId = lead.id;

    // ── Emails (don't block the response) ──
    // Same as before: emails only go out when the request named the company
    // by slug (the booking form always does).
    const sendEmails = !!slugIn;
    const categoryLabel = category ? formatCategory(category) : 'General';
    const customQuestions = company.custom_questions || undefined;
    const answers = Object.keys(customAnswers).length > 0 ? customAnswers : undefined;
    const files = fileUrls.length > 0 ? fileUrls : undefined;

    if (sendEmails && notify_owner && company.email) {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${company.slug}/dashboard`;
      sendNewLeadAlertEmail({
        contractorEmail: company.email,
        customerName: name,
        customerEmail: email || '',
        customerPhone: phone || '',
        category: categoryLabel,
        description: description || 'No description provided',
        dashboardUrl,
        address: address_line_1 || undefined,
        addressLine2: address_line_2 || undefined,
        city: city || undefined,
        zipCode: zip_code || undefined,
        photosCount: fileUrls.length,
        fileUrls: files,
        customAnswers: answers,
        customQuestions,
        preferredDate: preferred_date || undefined,
        preferredTime: preferred_time || undefined,
        leadSource: lead_source || undefined,
      }).catch((err: unknown) => console.error('Failed to send contractor email alert:', err));
    }

    if (sendEmails && notify_customer && email) {
      sendLeadConfirmationEmail({
        customerEmail: email,
        customerName: name,
        category: categoryLabel,
        companyName: company.name,
        companyId: company.id,
        description: description || undefined,
        address: address_line_1 || undefined,
        addressLine2: address_line_2 || undefined,
        city: city || undefined,
        zipCode: zip_code || undefined,
        preferredDate: preferred_date || undefined,
        preferredTime: preferred_time || undefined,
        customAnswers: answers,
        customQuestions,
        fileUrls: files,
      }).catch((err: unknown) => console.error('Failed to send customer confirmation:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully!',
      leadId,
      filesUploaded: fileUrls.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}