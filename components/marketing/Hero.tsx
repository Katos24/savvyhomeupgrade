'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, Clock, AlertCircle, ArrowDown } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-24 pb-12 sm:pt-32 sm:pb-20">
      {/* Subtle Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` 
        }} 
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center mb-8 lg:mb-16">

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 text-[#1a6645] mb-6 border border-[#1a6645]/20">
              <Zap size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live in 2 minutes</span>
            </div>

        <h1 
  className="font-black text-[#0F1F3D] leading-[0.95] tracking-[-0.04em] mb-6" 
  style={{ fontSize: 'clamp(3.2rem, 8vw, 6rem)' }}
>
  Get Leads In Your Sleep <br />
  <span className="text-[#1a6645]"> Wake Up To More Deals</span>
</h1>

            <div className="relative mb-4 lg:mb-8">
              <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-[#1a6645] hidden lg:block rounded-full" />
              <p className="text-xl md:text-2xl font-black text-[#0F1F3D] leading-tight mb-3 italic">
                Manage your empire from the couch <br className="hidden md:block" />
                while you watch the game.
              </p>
              <p className="hidden lg:block text-base font-medium text-slate-600 max-w-md leading-relaxed">
                One QR code. Customers scan, submit photos, and land on your dashboard. Quote, schedule, and track balances — without touching your personal texts.
              </p>
              <p className="lg:hidden text-sm font-medium text-slate-500 max-w-sm leading-relaxed">
                QR code → customer submits job → lands on your dashboard. Done.
              </p>
            </div>

            {/* DESKTOP CTA */}
            <div className="hidden lg:flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F1F3D] px-8 py-4 text-lg shadow-xl shadow-blue-900/20"
                >
                  Try Free for 14 Days
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[#1a6645] font-bold text-xs uppercase tracking-tighter">
                    <ShieldCheck size={14} /> 14-day free trial
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium tracking-tight">Cancel anytime</span>
                </div>
              </div>
              <Link 
                href="/demo" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-[#0F1F3D] text-[#0F1F3D] font-black text-sm hover:bg-[#0F1F3D] hover:text-white transition-all active:scale-[0.98]"
              >
                See the live demo first
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* RIGHT CONTENT — Dashboard Demo */}
          <div className="relative w-full flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] lg:max-w-none lg:translate-x-6">
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* MOBILE CTA (Positioned below demo on mobile) */}
        <div className="flex lg:hidden flex-col items-start gap-3 mb-20">
          <Link 
            href="/signup" 
            className="w-full flex items-center justify-center gap-3 text-white font-black rounded-2xl bg-[#0F1F3D] py-5 text-lg shadow-xl shadow-blue-900/20"
          >
            Try Free for 14 Days
            <ArrowRight size={20} />
          </Link>
          <Link 
            href="/demo" 
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-[#0F1F3D] text-[#0F1F3D] font-black text-sm hover:bg-[#0F1F3D] hover:text-white transition-all"
          >
            See the live demo first
            <ArrowRight size={15} />
          </Link>
          <p className="text-[10px] font-black text-[#1a6645] uppercase tracking-widest">14-day free trial · Cancel anytime</p>
        </div>

        {/* ── PAIN POINTS: THE "ADMIN TAX" ── */}
        <div className="py-16 sm:py-24 border-t border-slate-200">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock size={14} className="text-red-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-red-500">The Admin Tax</span>
            </div>
            <h2 className="text-[#0F1F3D] font-black leading-none mb-6 text-[clamp(2.2rem,6vw,4rem)] tracking-tighter italic">
              Stop losing <span className="text-red-500">16 hours</span> a week.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              { title: 'Leads', old: 'Lost in text threads', new: 'Captured Instantly' },
              { title: 'Quotes', old: 'Manual pen & paper', new: 'Sent in 60 seconds' },
              { title: 'Payments', old: 'Manual follow-ups', new: 'Balance Tracking' },
              { title: 'Outbox', old: 'Mental reminders', new: 'Verified History' },
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="bg-[#0F1F3D] border border-slate-700 rounded-t-2xl p-4 flex items-center gap-3">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <span className="text-slate-100 text-[11px] font-bold uppercase tracking-tight">{item.old}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-b-2xl p-5 shadow-lg group-hover:-translate-y-1 transition-all">
                  <p className="text-[9px] uppercase font-black tracking-widest text-[#1a6645] mb-1">{item.title}</p>
                  <p className="text-[#0F1F3D] text-[13px] font-black leading-tight uppercase italic">{item.new}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION TRANSITION */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 font-bold">The Solution</p>
          <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent" />
        </div>

        {/* STORY STRIP CONTAINER */}
        <div 
          id="how-it-works" 
          className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden bg-[#020617] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          <div className="py-16 px-6 sm:px-12 lg:py-24">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}