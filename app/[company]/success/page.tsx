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

  if (!company) notFound();

  const headline = "Request Received!";
  const subtext = company.cta_success_message || "We've got your request and will be in touch soon. Keep an eye on your inbox for a confirmation.";

  const websiteUrl = company.website
    ? (company.website.startsWith('http') ? company.website : `https://${company.website}`)
    : null;
  const brandColor1 = company.email_brand_color_1 || '#2563eb';
  const brandColor2 = company.email_brand_color_2 || '#7c3aed';

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: var(--font-dm-sans), sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .page {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
          background: #fafaf9;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
        }
        .orb-1 {
          width: 500px; height: 500px; top: -150px; right: -100px;
          background: var(--brand1);
          animation: drift1 12s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px; bottom: -100px; left: -80px;
          background: var(--brand2);
          animation: drift2 10s ease-in-out infinite alternate;
        }

        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,20px) scale(1.05); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-20px,-30px) scale(1.08); } }

        .card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 24px;
          padding: 40px 32px 36px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06), 0 24px 48px rgba(0,0,0,0.08);
          animation: rise 0.4s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both;
          text-align: center;
          z-index: 10;
        }

        @keyframes rise { from { opacity: 0; transform: translateY(32px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

   /* ─── IMPROVED LOGO HERO ─── */
.logo-hero {
  position: relative;
  width: 100px; 
  height: 100px;
  margin: 0 auto 32px;
  display: flex; 
  align-items: center; 
  justify-content: center;
  
  /* Modern Glassmorphism Base */
  background: white;
  border-radius: 30px; /* Squircle look */
  
  /* Double Border: One thin solid, one soft brand glow */
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05), 
    0 10px 20px -5px color-mix(in srgb, var(--brand1) 15%, transparent),
    inset 0 0 0 2px white,
    inset 0 0 12px color-mix(in srgb, var(--brand1) 5%, transparent);
    
  animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

/* Subtle background ring for extra depth */
.logo-hero::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 38px;
  background: linear-gradient(135deg, var(--brand1), var(--brand2));
  opacity: 0.1;
  z-index: -1;
}

.logo-hero img {
  width: 65%; 
  height: 65%;
  object-fit: contain;
  /* Helps logos with transparency feel "grounded" */
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.08));
}
        .check-ring {
          width: 72px; height: 72px; border-radius: 50%;
          margin: 0 auto 24px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          animation: pop 0.5s 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          background: linear-gradient(135deg, var(--brand1), var(--brand2));
          box-shadow: 0 8px 24px color-mix(in srgb, var(--brand1) 30%, transparent);
        }

        @keyframes pop { from { opacity: 0; transform: scale(0.4); } to { opacity: 1; transform: scale(1); } }

        .check-ring svg {
          width: 32px; height: 32px; color: #fff;
          stroke-dasharray: 40; stroke-dashoffset: 40;
          animation: draw 0.4s 0.4s ease both;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        @keyframes draw { to { stroke-dashoffset: 0; } }

        .dots { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; }
        .dot { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: var(--brand1); animation: burst 0.6s 0.3s cubic-bezier(0.22, 1, 0.36, 1) both; opacity: 0; }
        .dot:nth-child(1) { top: -12px; left: 50%; --tx: -2px; --ty: -18px; }
        .dot:nth-child(2) { top: 10px; right: -14px; --tx: 16px; --ty: -8px; }
        .dot:nth-child(3) { bottom: 10px; right: -12px; --tx: 14px; --ty: 10px; }
        .dot:nth-child(4) { bottom: -12px; left: 50%; --tx: 0px; --ty: 16px; }
        .dot:nth-child(5) { bottom: 10px; left: -14px; --tx: -16px; --ty: 8px; }
        .dot:nth-child(6) { top: 10px; left: -12px; --tx: -14px; --ty: -10px; }

        @keyframes burst { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--tx,0), var(--ty,0)) scale(0); } }

        .headline {
          font-family: var(--font-fraunces), Georgia, serif;
          font-size: clamp(1.5rem, 5vw, 1.85rem);
          font-weight: 700; color: #111;
          margin-bottom: 12px;
          animation: fadein 0.4s 0.2s ease both;
        }

        .subtext {
          font-size: 0.9375rem; color: #6b7280; line-height: 1.6;
          margin-bottom: 32px;
          animation: fadein 0.4s 0.25s ease both;
        }

        @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; text-align: left; animation: fadein 0.4s 0.3s ease both; }
        .step { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f0f0f0; }
        .step-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 15px; background: linear-gradient(135deg, color-mix(in srgb, var(--brand1) 12%, white), color-mix(in srgb, var(--brand2) 12%, white)); }
        .step-text strong { display: block; font-size: 0.8125rem; font-weight: 600; color: #111; margin-bottom: 1px; }
        .step-text span { font-size: 0.75rem; color: #9ca3af; }

        .cta-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 14px 24px; border-radius: 14px;
          font-size: 0.9375rem; font-weight: 600; color: #fff; text-decoration: none;
          background: linear-gradient(135deg, var(--brand1), var(--brand2));
          box-shadow: 0 4px 16px color-mix(in srgb, var(--brand1) 35%, transparent);
          transition: 0.2s;
          animation: fadein 0.4s 0.35s ease both;
        }
        .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .cta-arrow { transition: transform 0.2s; }
        .cta-btn:hover .cta-arrow { transform: translateX(3px); }

        .footer-note { margin-top: 24px; font-size: 0.75rem; color: #d1d5db; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; animation: fadein 0.4s 0.4s ease both; }

        @media (max-width: 480px) { .card { padding: 32px 20px 28px; border-radius: 20px; } }
      `}</style>

      <div
        className="page"
        style={{
          ['--brand1' as any]: brandColor1,
          ['--brand2' as any]: brandColor2,
        }}
      >
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="card">
         {company.logo_url ? (
  <div className="logo-hero">
    <div className="dots">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="dot" />
      ))}
    </div>
    <img src={company.logo_url} alt={company.name} />
  </div>
) : (
  <div className="check-ring">
    <div className="dots">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="dot" />
      ))}
    </div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  </div>
)}

          <h1 className="headline">{headline}</h1>
          <p className="subtext">{subtext}</p>

          <div className="steps">
            <div className="step">
              <div className="step-icon">📬</div>
              <div className="step-text">
                <strong>Check your email</strong>
                <span>Confirmation sent to your inbox</span>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">⏳</div>
              <div className="step-text">
                <strong>We'll reach out shortly</strong>
                <span>Our team reviews every request</span>
              </div>
            </div>
          </div>

          {websiteUrl && (
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="cta-btn">
              Visit {company.name}
              <svg className="cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}

          <p className="footer-note">Powered by Lead2Project</p>
        </div>
      </div>
    </>
  );
}