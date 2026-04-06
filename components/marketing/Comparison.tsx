
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — THE "ALL-IN-ONE" UPGRADE

'use client';
import Link from 'next/link';
import { XCircle, Check, Zap, Globe, ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ─────────────────────────────────────────────────────────────────────────────
function Comparison() {
  const { ref, visible } = useFadeIn();

  const comparisons = [
    { 
      label: 'Digital Presence', 
      them: 'Expensive Website + Hosting', 
      us: 'One Link. Socials, QR, or Bio.' 
    },
    { 
      label: 'Lead Capture', 
      them: 'Contact forms that email you', 
      us: 'Smart Link that builds the job' 
    },
    { 
      label: 'Quoting', 
      them: 'Manual PDF creation', 
      us: 'AI-Drafted line items' 
    },
    { 
      label: 'Visibility', 
      them: 'Check 5 different apps', 
      us: 'Track everything in one board' 
    },
    { 
      label: 'Setup', 
      them: 'Weeks of web design', 
      us: 'Live in 2 minutes' 
    },
  ];

  return (
    <section id="compare" className="py-32 px-6 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="text-center mb-20"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s ease' }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4 block underline underline-offset-4">The New Standard</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            No Website? <br/>
            <span className="text-slate-400 font-medium">No Problem.</span>
          </h2>
          <p className="mt-8 text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            You don't need a $3,000 website. You need a **booking link** that works in your Instagram bio, Facebook page, and email signature. 
            One link to capture, quote, and track every single dollar.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="relative z-10 space-y-3">
          {comparisons.map((item, i) => (
            <div 
              key={i} 
              className="group grid grid-cols-1 md:grid-cols-3 items-center p-6 md:p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.1}s` }}
            >
              {/* Category Label */}
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-0">
                {item.label}
              </div>

              {/* The "Them" side */}
              <div className="flex items-center gap-3 text-slate-400 font-medium mb-4 md:mb-0 grayscale opacity-60">
                <XCircle size={18} className="text-slate-300 shrink-0" />
                <span className="text-sm line-through decoration-slate-300 underline-offset-2">{item.them}</span>
              </div>

              {/* The "Us" side */}
              <div className="flex items-center gap-4 bg-blue-50 md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none border border-blue-100 md:border-none shadow-sm md:shadow-none">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Zap size={14} className="text-white fill-current" />
                </div>
                <span className="text-slate-900 font-black text-lg md:text-2xl tracking-tighter leading-none">
                  {item.us}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="mt-16 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Globe size={120} className="text-white" />
           </div>
           <h3 className="text-white text-2xl font-black mb-4 relative z-10">Ready to own your digital storefront?</h3>
           <p className="text-slate-400 font-medium mb-8 relative z-10">Set up your link in under 2 minutes and start tracking jobs today.</p>
           <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all active:scale-95 relative z-10">
              Claim Your Link <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    </section>
  );
}

export default Comparison;