'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ShieldAlert, PlayCircle, CheckCircle2 } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  
  const scrollToDemo = () => {
    const demoElement = document.getElementById('interactive-demo');
    if (demoElement) {
      const offset = -100; // Offset for better centering
      const y = demoElement.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Temporary "Active" effect to show it's interactive
      demoElement.classList.add('scale-[1.02]', 'ring-8', 'ring-emerald-500/20');
      setTimeout(() => {
        demoElement.classList.remove('scale-[1.02]', 'ring-8', 'ring-emerald-500/20');
      }, 1500);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-12 pb-0 sm:pt-32">
      {/* High-End Background Texture */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0F1F3D 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16 lg:mb-28">

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-6 sm:mb-8">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200">
                <Zap size={12} fill="white" className="text-white" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#0F1F3D]">
                Setup in 2 Minutes
              </span>
            </div>

            <h1 
              className="font-black text-[#0F1F3D] leading-[0.85] tracking-[-0.05em] mb-6 sm:mb-8" 
              style={{ fontSize: 'clamp(3rem, 9vw, 6.8rem)' }}
            >
              Get Leads <br /> 
              <span className="text-slate-400/80 italic font-serif font-light">In Your</span> Sleep
            </h1>

            <div className="relative mb-8 lg:mb-14 max-w-xl group">
              <div className="absolute -left-8 top-2 bottom-2 w-1.5 bg-[#1a6645] hidden lg:block rounded-full opacity-20" />
              
              <p className="text-xl sm:text-3xl font-black text-[#0F1F3D] leading-[1.1] mb-5 tracking-tight">
                Manage your empire from the couch <br className="hidden md:block" />
                <span className="text-[#1a6645] underline decoration-emerald-500/30 underline-offset-8">while you watch the game.</span>
              </p>
              <p className="text-base sm:text-lg font-bold text-slate-500/90 leading-relaxed">
                One custom QR code. Customers scan, submit photos, and land on your board. We handle the intake, you handle the deals.
              </p>
            </div>

            {/* CTA BLOCK: Dual Action & Fully Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] bg-[#0F1F3D] px-8 sm:px-10 py-5 text-lg sm:text-xl shadow-[0_20px_40px_-12px_rgba(15,31,61,0.35)]"
              >
                Start 14-Day Free Trial
                <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              
              <button
                onClick={scrollToDemo}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-5 text-[#0F1F3D] font-black text-lg rounded-2xl border-2 border-[#0F1F3D]/10 hover:bg-white hover:border-[#0F1F3D]/20 transition-all group shadow-sm bg-white/50 sm:bg-transparent"
              >
                <div className="relative">
                  <PlayCircle size={22} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="absolute inset-0 bg-emerald-500/20 animate-ping rounded-full" />
                </div>
                Try Live Demo
              </button>
            </div>

            {/* Policy Transparency - High-End Trust Bar */}
            <div className="mt-8 flex items-center gap-4 sm:gap-8 py-3 px-6 rounded-2xl bg-white/50 border border-slate-200/60 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Card Required</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cancel Anytime</span>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Interactive Dashboard */}
          <div className="relative w-full flex items-center justify-center lg:justify-end py-12 lg:py-0 overflow-visible">
            {/* Glow effect for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/5 blur-[100px] rounded-full -z-10" />
            
            <div 
              id="interactive-demo"
              className="w-full max-w-[500px] lg:max-w-none transition-all duration-700 ease-out origin-center lg:origin-right"
            >
              <div className="scale-90 sm:scale-95 lg:scale-110">
                 <HeroDashboardDemo />
              </div>
              
              {/* Interaction Hint for Mobile */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-xl flex items-center gap-2 lg:hidden">
                <Zap size={12} className="text-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-[#0F1F3D] uppercase tracking-widest">Interactive Dashboard</span>
              </div>
            </div>
          </div>
        </div>

        {/* STORY STRIP */}
        <div id="how-it-works" className="relative rounded-[3rem] sm:rounded-[5rem] overflow-hidden bg-[#020617] border border-white/10 shadow-2xl mb-16 sm:mb-24">
          <div className="py-20 sm:py-24 px-6 sm:px-12 lg:py-32">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}