'use client';
import Link from 'next/link';
export default function Footer() {
return (
<footer className="bg-slate-900 border-t-4 border-slate-800 py-14 px-6">
<div className="max-w-6xl mx-auto">
<div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
{/* Brand */}
<div className="col-span-2 md:col-span-1">
<div className="flex items-center gap-2.5 mb-4">
<img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="h-8 w-auto object-contain" />
<span 
className="font-black text-white text-lg"
style={{ fontFamily: 'Inter, sans-serif' }}
>
                Lead2Project
</span>
</div>
<p className="text-sm text-slate-400 font-bold leading-relaxed max-w-[200px]">
Job management built for small and mid-size businesses. Your link. Every lead.
</p>
</div>
{[
            { heading: 'Product',   links: [['Pricing','#pricing'],['Blog','/blog'],['Sign Up','/signup'],['Login','/login']] },
            { heading: 'Features',  links: [['Lead Capture','/features/lead-capture'],['Operations','/features/operations'],['Quoting','/features/quoting'],['Scheduling','/features/scheduling'],['Payments','/features/payments'],['Outbox & Digest','/features/outbox']] },
            { heading: 'Industries', links: [['HVAC','/solutions/hvac'],['Plumbing','/solutions/plumbing'],['Electrical','/solutions/electrical'],['Roofing','/solutions/roofing'],['Cleaning','/solutions/cleaning'],['For Bookkeepers','/partners']] },
          ].map(col => (
<div key={col.heading}>
<p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">{col.heading}</p>
{col.links.map(([label, href]) => (
<div key={label} className="mb-2.5">
<a href={href} className="text-sm text-slate-400 hover:text-white font-bold transition-colors">
{label}
</a>
</div>
              ))}
</div>
          ))}
</div>
<div className="border-t-2 border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
<p className="text-sm text-slate-500 font-bold">
            © {new Date().getFullYear()} Lead2Project. All rights reserved.
</p>
<p className="text-sm text-slate-500 font-bold">
            Built for Service Contractors.
</p>
</div>
</div>
</footer>
  );
}