import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import UploadForm from '@/components/UploadForm';

type Company = {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  business_type?: string;
  logo_url?: string;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  const companies = await sql`SELECT * FROM companies WHERE slug = ${slug}`;
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

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Get Your Free Quote
          </h1>
          <p className="text-xl opacity-90">
            Upload photos and we'll get back to you within 24 hours
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