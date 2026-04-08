'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from './HeroDashboardDemo'; // Ensure this path is correct

export default function Hero() {
  return (
    <section className="relative bg-[#F7F5F0] overflow-hidden pb-12 pt-24 md:pt-32">
      {/* Subtle premium texture */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
        
        {/* HERO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 lg:mb-24">
          
          {/* LEFT: Sales Copy (Order 1 on all screens) */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start max-w-xl mx-auto lg:max-w-none order-1">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 border border-[#1a6645]/20 mb-6 shrink-0">
              <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1a6645]">
                Lead-to-Payment Platform for Residential Pros
              </p>
            </div>

            {/* Headline */}
            <h1
              className="text-[#0F1F3D] font-[900] tracking-tight leading-[0.95] mb-6"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.2rem)' }}
            >
              One job pays for <br className="hidden sm:block" />
              <span className="text-[#1a6645]">the whole year.</span>
            </h1>

            {/* Sub-copy */}
            <p className="text-slate-600 mb-10 text-base sm:text-lg lg:text-xl font-medium leading-relaxed">
              Automate your intake and get your evenings back. No more chasing paper leads, missed quotes, or jobs that fall through the cracks.
            </p>

            {/* CTA + Value Props */}
            <div className="w-full sm:w-auto">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  fontSize: '1.05rem',
                  padding: '1.2rem 2.8rem',
                  background: '#0F1F3D',
                  boxShadow: '0 20px 40px -12px rgba(15,31,61,0.35)',
                }}
              >
                Sign up free. Live in 2 minutes.
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mt-6 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <div className="flex items-center justify-center gap-1.5"><CheckCircle2 size={13} className="text-[#1a6645]" /> 14-day free trial</div>
                <div className="hidden sm:block w-px h-3 bg-slate-300 self-center" />
                <div className="flex items-center justify-center gap-1.5"><CheckCircle2 size={13} className="text-[#1a6645]" /> Cancel anytime</div>
              </div>
            </div>
          </div>

          {/* RIGHT: The Dashboard Demo (Order 2) */}
          <div className="relative w-full order-2">
            {/* The component we built with the floating, animated cards */}
            <HeroDashboardDemo />
          </div>

        </div>

        {/* Dark strip with story */}
        <div className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-12 rounded-[32px] sm:rounded-[50px] bg-[#020617] border border-white/5 shadow-2xl overflow-hidden">
          <div className="relative w-full overflow-hidden sm:overflow-visible">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}