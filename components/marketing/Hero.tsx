'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldAlert } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-20 pb-0 sm:pt-32">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0F1F3D 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12 lg:mb-24">

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-[#1a6645] mb-6 sm:mb-8 border border-emerald-500/20 shadow-sm">
              <Zap size={14} fill="currentColor" className="animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em]">Live in 2 minutes</span>
            </div>

            <h1 
              className="font-black text-[#0F1F3D] leading-[0.9] sm:leading-[0.85] tracking-[-0.05em] mb-6 sm:mb-8" 
              style={{ fontSize: 'clamp(2.75rem, 10vw, 6.5rem)' }}
            >
              Get Leads <br /> In Your Sleep <br />
              <span className="text-[#1a6645]">Wake Up To Deals</span>
            </h1>

            <div className="relative mb-8 lg:mb-12 group max-w-lg">
              <div className="absolute -left-6 top-0 bottom-0 w-2 bg-[#1a6645] hidden lg:block rounded-full" />
              <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#0F1F3D] leading-[1.1] mb-4 tracking-tight">
                Manage your empire from the couch <br className="hidden md:block" />
                <span className="text-slate-400 italic">while you watch the game.</span>
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-500 leading-snug">
                One custom QR code. Customers scan, submit photos, and land on your board. Quote, schedule, and win.
              </p>
            </div>

            {/* CTA BLOCK */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] bg-[#0F1F3D] px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl shadow-xl shadow-blue-900/20"
              >
                Start 14-Day Free Trial
                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-slate-500 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">
                  <ShieldAlert size={14} className="text-amber-500" /> Credit Card Required
                </div>
                <span className="text-[10px] sm:text-[11px] text-[#1a6645] font-bold tracking-tight">
                  Cancel anytime before Day 14
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Demo moves below on mobile, scales down slightly */}
          <div className="relative w-full flex items-center justify-center lg:justify-end py-8 lg:py-0 overflow-hidden sm:overflow-visible">
            <div className="scale-[0.85] sm:scale-90 lg:scale-100 origin-center lg:origin-right">
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* STORY STRIP */}
        <div id="how-it-works" className="relative rounded-t-[2.5rem] sm:rounded-t-[5rem] overflow-hidden bg-[#020617] border border-white/10 shadow-2xl">
          <div className="py-16 sm:py-20 px-6 sm:px-12 lg:py-32">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}