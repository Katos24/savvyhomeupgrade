'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0F1F3D] border-t border-white/[0.06] py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/Lead2ProjectLogo.png" alt="Lead2Project" className="h-8 w-auto object-contain" />
              <span className="font-black text-white tracking-tight text-[15px]">Lead2Project</span>
            </div>
            <p className="text-[13px] text-slate-400 font-normal leading-relaxed max-w-[200px]">
              Job management built for small and mid-size businesses. One link. Every lead.
            </p>
          </div>

          {[
{ heading: 'Product',   links: [['Pricing','#pricing'],['Blog','/blog'],['Sign Up','/signup'],['Login','/login']] },
            { heading: 'Solutions', links: [['Roofing','/solutions/roofing'],['Cleaning','/solutions/cleaning']] },
            { heading: 'Legal',     links: [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','mailto:hello@lead2project.com']] },
          ].map(col => (
            <div key={col.heading}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">{col.heading}</p>
              {col.links.map(([label, href]) => (
                <div key={label} className="mb-2.5">
                  <a href={href} className="text-[13px] text-slate-400 hover:text-white font-medium transition-colors">{label}</a>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-slate-600 font-medium">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
          <p className="text-[12px] text-slate-600 font-medium">Built for Service Contractors.</p>
        </div>
      </div>
    </footer>
  );
}