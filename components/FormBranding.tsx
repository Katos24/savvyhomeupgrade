export const FormHeader = ({ company }: { company: any }) => (
  <header className="bg-white border-b border-gray-100 px-6 py-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3">
        {company.logo_url ? (
          <img src={company.logo_url} className="h-10 w-auto object-contain" alt="logo" />
        ) : (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: company.email_brand_color_1 || '#3b82f6' }}
          >
            {company.name.charAt(0)}
          </div>
        )}
        <span className="font-bold text-gray-900">{company.name}</span>
      </div>
    </div>
  </header>
);

export const FormHero = ({ company, ctaHeading }: { company: any, ctaHeading: string }) => (
  <div 
    className="py-16 px-6 text-center text-white"
    style={{ 
      background: `linear-gradient(135deg, ${company.email_brand_color_1 || '#3b82f6'}, ${company.email_brand_color_2 || '#8b5cf6'})` 
    }}
  >
    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{ctaHeading}</h1>
    <p className="text-lg opacity-90 max-w-2xl mx-auto">
      Fast, professional service tailored to your needs.
    </p>
  </div>
);