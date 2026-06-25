'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-slate-50 pt-28 lg:pt-32 pb-14 lg:pb-28 overflow-hidden">
      
      {/* Subtle Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:pr-0 lg:pl-12">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col space-y-6 lg:space-y-10 relative z-20">
            
       {/* HEADLINE */}
<h1 className="text-slate-900 tracking-tighter leading-[0.9] sm:leading-[0.95] text-5xl sm:text-6xl lg:text-7xl">
  <span className="font-extrabold block mb-1 sm:mb-2">The job management tool</span>
  <span className="font-black text-emerald-600 block">built for the field.</span>
</h1>
            {/* MOBILE IMAGE */}
            <div className="lg:hidden relative w-full">
              <div className="relative rounded-2xl overflow-hidden bg-slate-50/50">
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard"
                  width={1200}
                  height={900}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwMCIgaGVpZ2h0PSIxMzAwIiB4bWxucz0iaHR0cDovL3d3dy5zdmcub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
                  className="w-full h-auto object-contain mix-blend-multiply"
                />
              </div>
            </div>

{/* SUBHEAD SECTION */}
<div className="flex flex-col items-start gap-8">
  <p className="text-xl text-slate-600 max-w-lg leading-normal font-medium tracking-tight">
    Manage your entire workflow from the first lead to the final payment. Everything you need, all in one place.
  </p>

  {/* WORKFLOW PILLS */}
  <div className="flex items-center gap-2 flex-wrap">
    {['Lead', 'Quote', 'Schedule'].map((step) => (
      <div key={step} className="flex items-center gap-2">
        <span className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-700">
          {step}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-300" strokeWidth={2} />
      </div>
    ))}

    <span className="px-4 py-2 rounded-lg bg-emerald-600 text-[13px] font-semibold text-white shadow-sm">
      Paid
    </span>
  </div>
</div>


            {/* CTAs */}
            <div className="flex flex-col space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-wide shadow-xl transition-all cursor-pointer text-center"
                  >
                    Get Started Free
                    <ArrowRight size={20} strokeWidth={3} />
                  </motion.div>
                </Link>
              </div>

             <div className="flex flex-wrap items-center gap-3">
                <Image
                  src="/images/quickbooks-export-badge.webp"
                  alt="QuickBooks Export"
                  width={112}
                  height={56}
                  className="h-8 w-auto opacity-70"
                />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Payments powered by</span>
                  <span className="text-[12px] font-black text-slate-700">Stripe</span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  No credit card · 2 min setup · Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Tilted laptop (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            <div
              className="relative w-[125%] origin-left -ml-32"
              style={{ perspective: '2000px' }}
            >
              <motion.div
                animate={{ rotateY: -18, rotateX: 4, rotateZ: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="rounded-3xl shadow-[0_50px_100px_rgba(15,23,42,0.2)] border border-slate-200/50 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 15%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)',
                }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard"
                  width={1800}
                  height={1300}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwMCIgaGVpZ2h0PSIxMzAwIiB4bWxucz0iaHR0cDovL3d3dy5zdmcub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
        
      </div>
      
    </section>
    
  );
}