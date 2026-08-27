import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import UploadForm from '@/components/UploadForm';
import type { Category } from '@/lib/formCategories';

// Types stay here or in a shared types file
type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  website?: string | null;
  business_type?: string;
  logo_url?: string | null;
  form_categories?: Category[];
  address_enabled?: boolean | null;
  address_required?: boolean;
  cta_heading?: string | null;
  cta_button_text?: string | null;
  cta_success_message?: string | null;
  custom_questions?: any;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  form_field_config?: any;
  plan_tier?: string | null;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT 
      id, name, slug, email, phone, website, business_type, 
      logo_url, form_categories, address_enabled, address_required,
      cta_heading, cta_button_text, cta_success_message,
      custom_questions, email_brand_color_1, email_brand_color_2,
      form_field_config, plan_tier
    FROM companies 
    WHERE slug = ${slug}
  `;
  return (companies[0] as Company) || null;
}

export default async function CompanyPage({ 
  params 
}: { 
  params: Promise<{ company: string }> 
}) {
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) notFound();

  return <UploadForm company={company} showHeader={true} />;
}