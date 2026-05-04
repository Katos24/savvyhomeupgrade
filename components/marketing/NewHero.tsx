'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import HeroCarousel from '@/components/marketing/HeroCarousel';

/* ─────────────────────────────────────────────────────────
   INDUSTRIAL HERO — V2 (POP & GRIT)
   - Deep Navy Base (#0a1628)
   - Solar Yellow & Emerald Accents
   - Hard-edged buttons (Industrial feel)
   ───────────────────────────────────────────────────────── */

export default function NewHero() {
  const heavyFont = "font-[1000] tracking-tighter uppercase leading-[0.95]";

  return (
    <section className="relative overflow-hidden bg-[#0a1628]">

      {/* Industrial Background — Deep Navy + Blue Glows */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, #1e3a8a 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 10% 10%, #1e40af 0%, transparent 40%),
            #0a1628
          `,
        }}
      />

      {/* Blueprint Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10">
<div className="max-w-5xl mx-auto px-6 pt-20 sm:pt-32 lg:pt-36 pb-12 text-center">

          {/* High-Vis Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border-2 border-yellow-400 bg-slate-900/80 mb-8 shadow-[4px_4px_0px_#facc15]">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-[10px] sm:text-xs font-black text-white tracking-[0.2em] uppercase">
              Job Management for Service Contractors
            </span>
          </div>

          {/* Headline - Massive & Italic for speed */}
          <h1 className={`${heavyFont} text-white italic text-5xl sm:text-8xl mb-8`}>
            Blast Your Link. <br />
            <span className="text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.3)]">
              Get Better Leads.
            </span>
          </h1>

          {/* Subtext - High Contrast */}
          <p className="text-lg sm:text-xl text-slate-300 font-bold leading-relaxed max-w-2xl mx-auto mb-12">
            One link and QR code for trucks, yard signs, and bios. 
            Customers submit photos and details. You quote, schedule, 
            and get paid — <span className="text-white underline decoration-emerald-500 decoration-4 underline-offset-4">all from one dashboard.</span>
          </p>

          {/* CTAs - Heavy Industrial Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto group flex items-center justify-center gap-4 bg-yellow-400 p-1 pr-8 transition-all hover:bg-white active:scale-95 shadow-[8px_8px_0px_#064e3b]"
            >
              <div className="bg-slate-950 text-yellow-400 p-4">
                <ArrowRight size={22} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </div>
              <span className="text-base sm:text-xl font-[1000] text-slate-950 uppercase tracking-tighter">
                Start Free — 14 Days
              </span>
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 border-3 sm:border-4 border-white text-white font-black uppercase tracking-wider sm:tracking-widest text-base sm:text-lg hover:bg-white hover:text-slate-950 transition-all shadow-[8px_8px_0px_rgba(255,255,255,0.1)]"
            >
              Live Demo
            </Link>
          </div>

          {/* Trust line */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-[9px] sm:text-xs text-slate-400 font-black uppercase tracking-wide sm:tracking-widest flex-wrap">
            <span>2 Minute Setup</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
            <span>14 Day Free Trial</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
            <span>Cancel Anytime</span>
          </div>
        </div>

        {/* Carousel - Injected here */}
        <div className="pb-20 sm:pb-32">
          <HeroCarousel />
        </div>

      </div>
    </section>
  );
}