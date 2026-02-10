import Link from 'next/link';
import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import { getCTAConfig } from '@/lib/ctaConfig';

type PageProps = {
  params: Promise<{ company: string }>;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  business_type?: string;
  logo_url?: string | null;
  phone?: string | null;
  cta_heading?: string | null;
  cta_button_text?: string | null;
  cta_success_message?: string | null;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT id, name, slug, business_type, logo_url, phone,
           cta_heading, cta_button_text, cta_success_message 
    FROM companies 
    WHERE slug = ${slug}
  `;
  return companies.length > 0 ? (companies[0] as Company) : null;
}

export default async function SuccessPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  
  // Fetch company
  const company = await getCompany(companySlug);
  
  
  if (!company) {
    notFound();
  }
  
  // Get dynamic CTA config
  const cta = getCTAConfig(company);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Company Logo (if available) */}
        {company.logo_url && (
          <div className="mb-4 flex justify-center">
            <img 
              src={company.logo_url} 
              alt={company.name}
              className="h-16 w-auto object-contain"
            />
          </div>
        )}

        <div className="text-6xl mb-4">✅</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>

        {/* Dynamic success message based on business type */}
        <p className="text-lg text-gray-600 mb-6">
  {company.cta_success_message || cta.successMessage}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            {company.business_type === 'restaurant' 
              ? '🍽️ Your order has been received and we\'ll contact you shortly to confirm.'
              : company.business_type === 'salon'
              ? '💇 We\'ll reach out soon to confirm your appointment details.'
              : '📸 We\'re reviewing your request and will contact you within 24 hours.'}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Check your email for confirmation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            href={`/${companySlug}`}
            className="flex-1 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Submit Another Request
          </Link>
          
          {company.business_type !== 'restaurant' && company.phone && (
            
<a href={`tel:${company.phone}`}
              className="flex-1 inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              📞 Call Us
            </a>
          )}
        </div>

        {/* Company Info Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{company.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            We appreciate your business!
          </p>
        </div>
      </div>
    </div>
  );
}