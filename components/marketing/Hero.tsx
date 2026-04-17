'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Clock, AlertCircle, ArrowDown, ArrowRight as ArrowRightIcon } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-20 pb-12 sm:pt-32 sm:pb-20">
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` 
        }} 
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">
        
        {/* --- 1. THE HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-24">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 text-[#1a6645] mb-6">
              <Zap size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live in 2 minutes</span>
            </div>

            <h1 className="font-black text-[#0F1F3D] leading-[0.9] tracking-[-0.05em] mb-6 text-[clamp(2.8rem,9vw,6rem)]">
              Stop losing <br />
              jobs in your <br />
              <span className="text-[#1a6645]">text thread.</span>
            </h1>

            <div className="relative mb-8">
              <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-[#1a6645] hidden lg:block rounded-full" />
              <p className="text-xl md:text-2xl font-black text-[#0F1F3D] leading-tight mb-4">
                Manage your empire from the couch <br className="hidden md:block" />
                while you watch the game.
              </p>
              <p className="text-base font-medium text-slate-600 max-w-md leading-relaxed">
                One QR code. Customers scan, submit photos, land on your dashboard. Quote, schedule, collect payment — without touching your texts.
              </p>
            </div>

            {/* CTA BLOCK */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-4 w-full">
              <Link
                href="/signup"
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F1F3D] px-8 py-5 text-lg shadow-xl shadow-blue-900/20"
              >
                Try Free for 14 Days
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-1.5 text-[#1a6645] font-black text-[11px] uppercase tracking-tighter">
                  <ShieldCheck size={14} /> 14-day free trial
                </div>
                <span className="text-[10px] text-slate-400 font-medium italic">Card required · Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT — Dashboard Demo */}
          <div className="relative w-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-[500px] lg:max-w-none transform scale-95 sm:scale-100 transition-transform">
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* --- 2. THE PAIN POINTS BRIDGE --- */}
        <div className="py-20 sm:py-32 border-t border-slate-200">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock size={16} className="text-red-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-red-500">The High Cost of Admin</span>
            </div>
            <h2 className="text-[#0F1F3D] font-black leading-none mb-6 text-[clamp(2.2rem,6vw,4rem)] tracking-tighter italic">
              Stop losing <span className="text-red-500 text-6xl md:text-8xl block md:inline">16 hours</span> a week.
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
              Manual admin is a silent killer for your profit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-lg sm:max-w-none mx-auto">
            {[
              { title: 'Leads', old: 'Chasing leads in texts', new: 'Captured automatically' },
              { title: 'Quotes', old: 'Writing quotes by hand', new: 'Sent in 60 seconds' },
              { title: 'Payments', old: 'Manual reminders', new: 'One-click from dashboard' },
              { title: 'Follow-ups', old: 'Forgetting to check in', new: '6AM Daily Digest' },
            ].map((item, i) => (
              <div key={i} className="group relative">
                {/* Before: High Contrast for Mobile Readability */}
                <div className="bg-[#0F1F3D] border border-slate-700 rounded-t-2xl p-4 flex items-center gap-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-slate-100 text-[12px] font-bold leading-tight uppercase tracking-tight">
                    {item.old}
                  </span>
                </div>

                {/* Transition Arrow (Down on Mobile, Right on Desktop) */}
                <div className="absolute left-6 sm:left-auto sm:right-[-14px] top-[48px] sm:top-1/2 -translate-y-1/2 z-20 bg-[#1a6645] rounded-full p-1 border-[4px] border-[#F7F5F0]">
                  <ArrowDown size={10} className="text-white sm:hidden" />
                  <ArrowRightIcon size={10} className="text-white hidden sm:block lg:hidden" />
                  {/* Note: In a 4-col grid, arrows on the last item of a row should be hidden on desktop */}
                  {i < 3 && <ArrowRightIcon size={10} className="text-white hidden lg:block" />}
                </div>

                {/* After: Clean White Card */}
                <div className="bg-white border border-slate-200 rounded-b-2xl p-5 shadow-lg group-hover:shadow-2xl transition-all h-full">
                  <p className="text-[9px] uppercase font-black tracking-widest text-[#1a6645] mb-1">{item.title}</p>
                  <p className="text-[#0F1F3D] text-[13px] font-black leading-tight uppercase italic">
                    {item.new}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 3. THE WORKFLOW STRIP --- */}
        <div className="flex flex-col items-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm mb-6">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">The Solution</span>
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-slate-300 to-transparent" />
        </div>

        <div 
          id="how-it-works" 
          className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden bg-[#020617] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] transition-all"
        >
          <div className="py-16 px-6 sm:px-12 lg:py-24">
            <HeroStoryStrip />
          </div>
        </div>

      </div>
    </section>
  );
}