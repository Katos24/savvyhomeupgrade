import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import CompanySettingsClient from './CompanySettingsClient';
import { getCompanyBySlug } from '@/lib/getCompany';

const sql = neon(process.env.DATABASE_URL!);

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    ) as any;

    const users = await sql`
      SELECT id, company_id, role FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];
    if (!currentUser) redirect('/login');

    const company = await getCompanyBySlug(resolvedParams.company);
    if (!company) redirect('/login');
    if (currentUser.company_id !== company.id) redirect('/login');
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      redirect(`/${resolvedParams.company}/dashboard`);
    }

    // Same explicit DTO shaping as before, unchanged — this is genuinely
    // page-specific defaulting logic (?? null, ?? false, ?? []), not a raw
    // passthrough, so it stays here rather than moving into the shared query.
    const dto = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      email: company.email,
      phone: company.phone,
      website: company.website,
      business_type: company.business_type,
      logo_url: company.logo_url,
      status_options: company.status_options,
      form_categories: company.form_categories,
      email_templates: company.email_templates,
      email_brand_color_1: company.email_brand_color_1,
      email_brand_color_2: company.email_brand_color_2,
      reminder_settings: company.reminder_settings,
      notification_preferences: company.notification_preferences,
      daily_digest_enabled: company.daily_digest_enabled,
      daily_digest_time: company.daily_digest_time,
      address_enabled: company.address_enabled,
      address_required: company.address_required,
      cta_heading: company.cta_heading,
      cta_button_text: company.cta_button_text,
      cta_success_message: company.cta_success_message,
      custom_questions: company.custom_questions,
      subscription_status: company.subscription_status,
      trial_ends_at: company.trial_ends_at,
      plan_tier: company.plan_tier,
      form_field_config: company.form_field_config,
      pending_downgrade_at: company.pending_downgrade_at ?? null,
      google_review_url: company.google_review_url ?? '',
      google_review_enabled: company.google_review_enabled ?? false,
      payment_link_type: company.payment_link_type ?? '',
      payment_link_url: company.payment_link_url ?? '',
      bcc_sender_on_email: company.bcc_sender_on_email ?? false,
      stripe_connect_account_id: company.stripe_connect_account_id ?? null,
      stripe_connect_onboarded: company.stripe_connect_onboarded ?? false,
      stripe_payment_status: company.stripe_payment_status ?? null,
      stripe_requirements_summary: company.stripe_requirements_summary ?? [],
    };

    return <CompanySettingsClient company={dto} currentUser={currentUser} />;
  } catch (error) {
    console.error('Settings page error:', error);
    redirect('/login');
  }
}