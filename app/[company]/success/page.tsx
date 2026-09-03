import { neon } from '@neondatabase/serverless';
import { notFound } from 'next/navigation';
import Image from 'next/image';

type Company = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  cta_success_message: string | null;
  email_brand_color_1: string | null;
  email_brand_color_2: string | null;
};

type PageProps = {
  params: Promise<{ company: string }>;
};

async function getCompany(slug: string): Promise<Company | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  const sql = neon(process.env.DATABASE_URL);
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
    LIMIT 1
  `;
  return (companies[0] as Company) || null;
}

export default async function SuccessPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  const company = await getCompany(companySlug);

  if (!company) {
    notFound();
  }

  const headline = 'Request Received!';
  const subtext =
    company.cta_success_message ||
    "We've got your request and will be in touch soon. Keep an eye on your inbox for a confirmation.";

  const websiteUrl = company.website
    ? company.website.startsWith('http')
      ? company.website
      : `https://${company.website}`
    : null;

  const brandColor1 = company.email_brand_color_1 || '#2563eb';
  const brandColor2 = company.email_brand_color_2 || '#7c3aed';

  return (
    <>
      {/* Smooth CSS Keyframes replacing the harsh pulse */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(25px, -15px) scale(1.05); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-reverse {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.08); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-orb-1 {
          animation: float-slow 14s ease-in-out infinite;
        }
        .animate-orb-2 {
          animation: float-reverse 16s ease-in-out infinite;
        }
      `}</style>

      <div
        className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-x-hidden bg-[#fafaf9] px-4 py-8 font-sans antialiased"
        style={
          {
            '--brand1': brandColor1,
            '--brand2': brandColor2,
          } as React.CSSProperties
        }
      >
        {/* Smooth Floating Ambient Orbs */}
        <div
          aria-hidden="true"
          className="animate-orb-1 pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full opacity-15 blur-[60px] sm:-right-24 sm:-top-36 sm:h-[500px] sm:w-[500px] sm:blur-[80px]"
          style={{ backgroundColor: 'var(--brand1)' }}
        />
        <div
          aria-hidden="true"
          className="animate-orb-2 pointer-events-none absolute -bottom-20 -left-16 h-[250px] w-[250px] rounded-full opacity-15 blur-[60px] sm:-bottom-24 sm:-left-20 sm:h-[400px] sm:w-[400px] sm:blur-[80px]"
          style={{ backgroundColor: 'var(--brand2)' }}
        />

        {/* Main Card */}
        <main className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white px-5 py-7 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06),0_24px_48px_rgba(0,0,0,0.08)] sm:rounded-[24px] sm:p-10">
          {company.logo_url ? (
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_10px_20px_-5px_color-mix(in_srgb,var(--brand1)_15%,transparent),inset_0_0_0_2px_white] sm:mb-8 sm:h-24 sm:w-24 sm:rounded-[28px]">
              <Image
                src={company.logo_url}
                alt={company.name}
                width={64}
                height={64}
                className="max-h-[70%] max-w-[70%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.08)] sm:max-h-[72%] sm:max-w-[72%]"
                unoptimized
                priority
              />
            </div>
          ) : (
            <div
              className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg sm:h-18 sm:w-18"
              style={{
                background: 'linear-gradient(135deg, var(--brand1), var(--brand2))',
                boxShadow: '0 8px 24px color-mix(in srgb, var(--brand1) 30%, transparent)',
              }}
            >
              <svg
                className="h-7 w-7 stroke-current sm:h-8 sm:w-8"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          <h1 className="mb-2 text-xl font-bold tracking-tight text-stone-900 sm:mb-3 sm:text-3xl">
            {headline}
          </h1>
          <p className="mb-6 text-xs leading-relaxed text-stone-600 sm:mb-8 sm:text-base">
            {subtext}
          </p>

          {/* Steps Container */}
          <div className="mb-6 space-y-2.5 text-left sm:mb-8 sm:space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 sm:p-3.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--brand1) 12%, white), color-mix(in srgb, var(--brand2) 12%, white))',
                }}
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--brand1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13 2 4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-semibold text-stone-900">
                  Check your email
                </strong>
                <span className="block text-[11px] text-stone-500 sm:text-xs">
                  Confirmation sent to your inbox
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3 sm:p-3.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8"
                style={{
                  background:
                    'linear-gradient(135deg, color-mix(in srgb, var(--brand1) 12%, white), color-mix(in srgb, var(--brand2) 12%, white))',
                }}
              >
                <svg
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--brand1)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-semibold text-stone-900">
                  We&apos;ll reach out shortly
                </strong>
                <span className="block text-[11px] text-stone-500 sm:text-xs">
                  Our team reviews every request
                </span>
              </div>
            </div>
          </div>

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold text-white transition-all hover:opacity-95 active:scale-[0.99] sm:py-3.5 sm:text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--brand1), var(--brand2))',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--brand1) 35%, transparent)',
              }}
            >
              Visit {company.name}
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}

          <p className="mt-5 text-[10px] font-medium uppercase tracking-wider text-stone-400 sm:mt-6 sm:text-[11px]">
            Powered by Lead2Project
          </p>
        </main>
      </div>
    </>
  );
}