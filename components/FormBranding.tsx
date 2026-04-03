'use client';

export function FormHeader({ company }: { company: any }) {
  const color1 = company.email_brand_color_1 || '#6366f1';

  return (
<header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 sticky top-0 z-40">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {company.logo_url ? (
          <img
  src={company.logo_url}
  className="h-12 w-auto object-contain"
  alt={company.name}
/>
          ) : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
              style={{ backgroundColor: color1 }}
            >
              {company.name.charAt(0)}
            </div>
          )}
          <span className="font-black text-gray-900 text-sm tracking-tight">{company.name}</span>
        </div>
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] hidden sm:block">
          Powered by Lead2Project
        </span>
      </div>
    </header>
  );
}

export function FormHero({ company, ctaHeading }: { company: any; ctaHeading: string }) {
  const color1 = company.email_brand_color_1 || '#6366f1';
  const color2 = company.email_brand_color_2 || '#8b5cf6';

  return (
    <div
      className="px-6 py-10 sm:py-12 text-center text-white relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
    >
      {/* Subtle texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
   <div className="relative max-w-xl mx-auto">
 
  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
          {ctaHeading}
        </h1>
        <p className="text-sm sm:text-base opacity-80 font-medium">
          Takes less than 2 minutes. No account needed.
        </p>
      </div>
    </div>
  );
}