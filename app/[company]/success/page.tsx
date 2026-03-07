import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ company: string }>;
};

async function getCompany(slug: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`
    SELECT 
      id, 
      name, 
      slug, 
      logo_url, 
      website,
      cta_success_message,
      email_brand_color_1,
      email_brand_color_2
    FROM companies 
    WHERE slug = ${slug}
  `;
  return companies.length > 0 ? companies[0] : null;
}

export default async function SuccessPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  const successMessage =
    company.cta_success_message || "You're all set! 🎉";

  const websiteUrl = company.website
    ? (company.website.startsWith('http') ? company.website : `https://${company.website}`)
    : null;

  const brandColor1 = company.email_brand_color_1 || '#3b82f6';
  const brandColor2 = company.email_brand_color_2 || '#8b5cf6';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f8fafc' }}>
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          {company.logo_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-16 w-auto object-contain"
              />
            </div>
          )}

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {successMessage}
          </h2>

          <p className="text-gray-500 text-sm mb-6">
            We've received your request and will be in touch shortly.
          </p>

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                background: `linear-gradient(to right, ${brandColor1}, ${brandColor2})`,
              }}
            >
              Visit {company.name} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}