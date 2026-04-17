'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldAlert, PlayCircle, CheckCircle2 } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-20 pb-0 sm:pt-32">
      {/* High-End Background Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0F1F3D 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16 lg:mb-28">

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500">
                <Zap size={12} fill="white" className="text-white" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#0F1F3D]">
                Live in 2 Minutes
              </span>
            </div>

            <h1 
              className="font-black text-[#0F1F3D] leading-[0.85] tracking-[-0.05em] mb-8" 
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)' }}
            >
              Get Leads <br /> 
              <span className="text-slate-400/80 italic font-serif font-light mr-4">In Your</span>
              Sleep
            </h1>

            <div className="relative mb-10 lg:mb-14 max-w-xl group">
              {/* Decorative accent for high-end feel */}
              <div className="absolute -left-8 top-2 bottom-2 w-1.5 bg-[#1a6645] hidden lg:block rounded-full opacity-20" />
              
              <p className="text-2xl sm:text-3xl font-black text-[#0F1F3D] leading-[1.1] mb-5 tracking-tight">
                Manage your empire from the couch <br className="hidden md:block" />
                <span className="text-[#1a6645] underline decoration-emerald-500/30 underline-offset-8">while you watch the game.</span>
              </p>
              <p className="text-lg font-bold text-slate-500/90 leading-relaxed">
                One custom QR code. Customers scan, submit photos, and land on your board. We handle the intake, you handle the deals.
              </p>
            </div>

            {/* CTA BLOCK: Dual Action */}
            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] bg-[#0F1F3D] px-10 py-5 text-xl shadow-[0_20px_40px_-12px_rgba(15,31,61,0.35)]"
              >
                Start 14-Day Free Trial
                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <Link
                href="/demo"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-5 text-[#0F1F3D] font-black text-lg rounded-2xl border-2 border-[#0F1F3D]/10 hover:bg-white transition-all group"
              >
                <PlayCircle size={22} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Link>
            </div>

            {/* Policy Transparency Pill */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 py-3 px-6 rounded-2xl bg-white/50 border border-slate-200/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Card Required</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel Anytime</span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Dashboard Demo */}
          <div className="relative w-full flex items-center justify-center lg:justify-end py-10 lg:py-0">
             {/* Decorative glow behind demo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
            
            <div className="scale-[0.85] sm:scale-95 lg:scale-110 origin-center lg:origin-right transition-transform duration-700 hover:scale-[1.12]">
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* STORY STRIP: Transition into Dark Mode */}
        <div id="how-it-works" className="relative rounded-[3rem] sm:rounded-[5rem] overflow-hidden bg-[#020617] border border-white/10 shadow-2xl mb-16 sm:mb-24">
          <div className="py-20 sm:py-24 px-6 sm:px-12 lg:py-32">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}