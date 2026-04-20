'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, BrainCircuit, Download, MousePointerClick, ShieldCheck } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative bg-[#020617] overflow-hidden">
      
      {/* ── BACKGROUND AMBIENCE ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-10%] w-[70%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Responsive Spacer for Nav */}
        <div className="pt-20 sm:pt-32" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pb-16">
          
          <div className="flex flex-col">
            
            {/* 1. HEADER BLOCK */}
            <div className="order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Zap size={12} className="text-emerald-500 fill-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">The Contractor OS</span>
              </div>

              <h1 className="font-black text-white leading-[0.9] tracking-tight mb-6 sm:mb-8" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
                Win jobs while <br />
                <span className="text-emerald-500">you're on the roof.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed mb-8 sm:mb-10 max-w-lg mx-auto lg:mx-0">
                The first <span className="text-white font-bold italic">Autonomous Project Engine</span> for trades. Capture AI-enriched briefs and close jobs with one-click—all while your tools are still in your hand.
              </p>
            </div>

            {/* 2. MOBILE DEMO: Under header, clean borders */}
            <div className="order-2 lg:hidden mb-10 transform scale-[1.01]">
               <div className="relative p-1.5 bg-white/5 border border-white/10 rounded-[1.5rem] shadow-2xl backdrop-blur-sm">
                  <HeroDashboardDemo />
               </div>
            </div>

            {/* 3. CTA & FEATURES */}
            <div className="order-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <Link href="/signup" className="group flex items-center justify-center gap-3 bg-emerald-600 text-white font-black px-8 py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg text-lg w-full lg:w-auto">
                  Deploy Your Board
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/demo" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-bold px-8 py-5 rounded-2xl transition-all w-full lg:w-auto">
                  Watch 2-min Demo
                </Link>
              </div>

              {/* SIMPLIFIED MOBILE VALUE PROPS */}
              <div className="grid grid-cols-1 gap-4 mb-10 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="hidden sm:flex p-1.5 rounded-lg bg-white/5 border border-white/10"><MousePointerClick size={18} className="text-emerald-400" /></div>
                  <p className="text-sm font-bold"><span className="text-emerald-400 sm:hidden">→</span> One-Click Quotes & Payments</p>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="hidden sm:flex p-1.5 rounded-lg bg-white/5 border border-white/10"><BrainCircuit size={18} className="text-blue-400" /></div>
                  <p className="text-sm font-bold"><span className="text-blue-400 sm:hidden">→</span> AI-Enriched Field Briefs & Chat</p>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="hidden sm:flex p-1.5 rounded-lg bg-white/5 border border-white/10"><Download size={18} className="text-amber-400" /></div>
                  <p className="text-sm font-bold"><span className="text-amber-400 sm:hidden">→</span> Full CSV Export. No Lock-in.</p>
                </div>
              </div>

              {/* MOBILE-READY TRUST SIGNALS */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> 6AM Daily Digest</div>
                <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Branded Tracking</div>
                <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> Exportable Data</div>
              </div>
            </div>
          </div>

          {/* DESKTOP COLUMN */}
          <div className="hidden lg:block relative">
             <div className="absolute -inset-4 bg-emerald-500/5 blur-3xl rounded-full" />
             <div className="relative p-3 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
                <HeroDashboardDemo />
             </div>
          </div>
        </div>

        {/* ── BENTO METRICS: Optimized for 2x2 Grid on Mobile ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden mb-20 shadow-2xl">
          {[
            { label: 'Capture Rate', val: '+40%' },
            { label: 'Admin Saved', val: '12hrs/wk' },
            { label: 'Daily Digest', val: '6:00 AM' },
            { label: 'Data Safety', val: 'CSV/API' },
          ].map((s, i) => (
            <div key={i} className="bg-[#020617] p-6 sm:p-10 text-center hover:bg-white/[0.02] transition-colors">
              <p className="text-xl sm:text-3xl font-black text-white mb-1">{s.val}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── STORY STRIP ── */}
        <div className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent mb-20">
          <div className="py-16 sm:py-24">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}