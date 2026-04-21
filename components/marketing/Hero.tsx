'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Camera, Download, BellRing, ShieldCheck, MousePointerClick } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative bg-[#020617] overflow-hidden">
      
      {/* ── BACKGROUND AMBIENCE ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-[-10%] w-[70%] h-[50%] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* NAV SPACER */}
        <div className="pt-24 sm:pt-40 lg:pt-48" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start pb-12 sm:pb-20">
          
          <div className="flex flex-col">
            
            {/* 1. HEADLINE BLOCK */}
            <div className="order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5 backdrop-blur-md">
                <Zap size={12} className="text-emerald-500 fill-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">The Contractor OS</span>
              </div>

              <h1 className="font-black text-white leading-[0.95] tracking-tight mb-6 sm:mb-8" style={{ fontSize: 'clamp(2.2rem, 7vw, 5rem)' }}>
                Win jobs while{' '}
                <br className="hidden sm:block" />
                <span className="text-emerald-500 italic">you're in the field.</span>
              </h1>

              <p className="text-[15px] sm:text-xl text-slate-400 font-medium leading-relaxed mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0">
                The easiest way to track leads and organize your payday. Let customers send <span className="text-white">photos and videos</span> so you can finalize quotes and settle jobs in one click.
              </p>
            </div>

            {/* 2. MOBILE DEMO */}
            <div className="order-2 lg:hidden mb-10 transform scale-[1.01]">
               <div className="relative p-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-sm">
                  <HeroDashboardDemo />
               </div>
            </div>

            {/* 3. CTA & FEATURES */}
            <div className="order-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10">
                <Link href="/signup" className="group flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] shadow-lg text-base sm:text-lg w-full lg:w-auto">
                  Start 14-Day Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/demo" className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all w-full lg:w-auto">
                  Try the Live Demo
                </Link>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-1 gap-4 mb-8 sm:mb-10 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                  <div className="p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 shrink-0"><MousePointerClick size={16} className="text-emerald-400" /></div>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                    One Click Quote and Settlement Tracking
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                  <div className="p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 shrink-0"><Camera size={16} className="text-blue-400" /></div>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                    Direct Photo and Video Job Briefs
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                  <div className="p-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 shrink-0"><BellRing size={16} className="text-amber-400" /></div>
                  <p className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wide">
                    Payday Reminder Emails and Alerts
                  </p>
                </div>
              </div>

              {/* TRUST SIGNALS */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-2 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2 text-slate-400"><CheckCircle2 size={14} className="text-emerald-500" /> 6AM Daily Digest</div>
                <div className="flex items-center gap-2 text-slate-400"><CheckCircle2 size={14} className="text-emerald-500" /> Branded Tracking</div>
                <div className="flex items-center gap-2 text-slate-400"><CheckCircle2 size={14} className="text-emerald-500" /> You Own Your Data</div>
              </div>
            </div>
          </div>

          {/* DESKTOP VISUAL */}
          <div className="hidden lg:block relative sticky top-40">
             <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl rounded-full" />
             <div className="relative p-3 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-md shadow-2xl">
                <HeroDashboardDemo />
             </div>
          </div>
        </div>

        {/* ── BENTO METRICS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-xl sm:rounded-3xl overflow-hidden mb-14 sm:mb-20 shadow-2xl">
          {[
            { label: 'Setup Time', val: '2 Minutes' },
            { label: 'Tracking', val: 'One Click' },
            { label: 'Daily Digest', val: '6:00 AM' },
            { label: 'Data Control', val: '100%' },
          ].map((s, i) => (
            <div key={i} className="bg-[#020617] px-3 py-5 sm:p-10 text-center hover:bg-white/[0.02] transition-colors">
              <p className="text-lg sm:text-3xl font-black text-white mb-1">{s.val}</p>
              <p className="text-[7px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── STORY STRIP ── */}
        <div className="rounded-2xl sm:rounded-[4rem] overflow-hidden border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent mb-14 sm:mb-20">
          <div className="py-10 sm:py-32 px-2 sm:px-10">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}