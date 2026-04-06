import Link from 'next/link';
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
      phone,
      website,
      cta_success_message 
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
    company.cta_success_message ||
    "Your request has been received! We'll be in touch soon.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        {company.logo_url && (
          <div className="mb-4 flex justify-center">
            <img
              src={company.logo_url}
              alt={company.name}
              className="h-16 w-auto object-contain"
            />
          </div>
        )}


        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          {successMessage}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            We've received your request and will contact you shortly.
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

          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex-1 inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              📞 Call Us
            </a>
          )}

          {company.website && (
            <a
              href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Visit Website
            </a>
          )}

        </div>

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