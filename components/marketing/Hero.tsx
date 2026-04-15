'use client';

import Link from 'next/link';
import { ArrowRight, Smartphone, Zap, ShieldCheck } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 text-[#1a6645] mb-6">
              <Zap size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live in 2 minutes</span>
            </div>

            <h1 
              className="font-black text-[#0F1F3D] leading-[0.9] tracking-[-0.05em] mb-8" 
              style={{ fontSize: 'clamp(3.2rem, 8vw, 6rem)' }}
            >
              Stop losing <br />
              jobs in your <br />
              <span className="text-[#1a6645]">text thread.</span>
            </h1>

            {/* THE NEW EMPIRE PITCH */}
            <div className="relative mb-8 group">
              {/* Vertical accent bar for desktop */}
              <div className="absolute -left-6 top-0 bottom-0 w-1.5 bg-[#1a6645] hidden lg:block rounded-full" />
              
              <p className="text-xl md:text-2xl font-black text-[#0F1F3D] leading-tight mb-3">
                Manage your empire from the couch <br className="hidden md:block" />
                while you watch the game.
              </p>
              <p className="text-base font-medium text-slate-500 max-w-md italic leading-relaxed">
                One QR code. Customers scan, send photos, and land on your dashboard. No spreadsheets. No missed calls. Send quotes in seconds with one click email.
              </p>
            </div>

            {/* DESKTOP CTA */}
            <div className="hidden lg:flex flex-col items-start gap-4">
              <div className="flex items-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#0F1F3D] px-8 py-4 text-lg shadow-xl shadow-blue-900/20"
                >
                  Get your L2P link
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

       {/* MOBILE CTA — Simplified for thumb-access */}
        <div className="flex lg:hidden flex-col items-center gap-3 mb-20">
          <Link 
            href="/signup" 
            className="w-full flex items-center justify-center gap-3 text-white font-black rounded-2xl bg-[#0F1F3D] py-5 text-lg shadow-xl shadow-blue-900/20"
          >
            Get your L2P link
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

        {/* SECTION TRANSITION */}
        <div className="flex flex-col items-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">The Workflow</p>
          <div className="w-px h-12 bg-gradient-to-b from-slate-300 to-transparent" />
        </div>

        {/* STORY STRIP CONTAINER */}
        <div 
          id="how-it-works" 
          className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden bg-[#020617] border border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
        >
           <div className="py-12 px-6 sm:px-12">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}