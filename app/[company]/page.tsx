import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import UploadForm from '@/components/UploadForm';
import { getCTAConfig } from '@/lib/ctaConfig';
import type { Category } from '@/lib/formCategories';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
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
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT 
      id, 
      name, 
      slug, 
      email, 
      phone, 
      business_type, 
      logo_url,
      form_categories, 
      address_enabled, 
      address_required,
      cta_heading,
      cta_button_text,
      cta_success_message,
      custom_questions,
      email_brand_color_1,
      email_brand_color_2
    FROM companies 
    WHERE slug = ${slug}
  `;
  return companies.length > 0 ? (companies[0] as Company) : null;
}

export default async function CompanyPage({ 
  params 
}: { 
  params: Promise<{ company: string }> 
}) {
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  // Get dynamic CTA config
  const cta = getCTAConfig(company);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* COMPANY LOGO */}
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`}
                className="h-14 w-auto object-contain"
              />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {company.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-blue-600">{company.name}</h1>
              <p className="text-sm text-gray-600">Get your free quote</p>
            </div>
          </div>
          <a 
            href="/" 
            className="text-gray-600 hover:text-gray-900 text-sm transition"
          >
            Powered by SavvyHomeUpgrade
          </a>
        </div>
      </header>

      {/* Hero Section - Dynamic CTA Heading with Brand Colors */}
      <div 
        className="text-white py-12 px-6"
        style={{
          background: company.email_brand_color_1 && company.email_brand_color_2
            ? `linear-gradient(to right, ${company.email_brand_color_1}, ${company.email_brand_color_2})`
            : 'linear-gradient(to right, #3b82f6, #8b5cf6)'
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {cta.heading}
          </h1>
          <p className="text-xl opacity-90">
            {company.business_type === 'construction' 
              ? 'Upload photos and details to get a fast, accurate quote'
              : company.business_type === 'hvac'
              ? 'Describe your issue and upload photos for faster service'
              : company.business_type === 'food_services'
              ? 'Tell us what you need and we\'ll create something special'
              : 'Upload photos and we\'ll get back to you within 24 hours'}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="py-12 px-6">
        <UploadForm 
          company={company}
          successRoute={`/${company.slug}/success`}
          showHeader={false}
        />
      </div>
    </div>
  );
}