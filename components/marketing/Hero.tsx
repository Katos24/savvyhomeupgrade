'use client';

import Link from 'next/link';
import { ArrowRight, Zap, ListChecks, Image as ImageIcon } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';

export default function Hero() {
  return (
    <section className="relative bg-[#F7F5F0] overflow-hidden pb-12 pt-24 md:pt-32">
      {/* Subtle texture */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
        <div className="flex flex-col items-center text-center mb-16">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 border border-[#1a6645]/20 mb-6">
            <Zap size={12} className="text-[#1a6645] fill-[#1a6645]" />
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1a6645]">
              Lead-to-payment platform for home service contractors
            </p>
          </div>

          {/* Headline */}
          <h1
            className="text-[#0F1F3D] font-[900] tracking-tight leading-[0.95] mb-4 max-w-4xl"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
          >
            One job pays for <br className="hidden sm:block" />
            <span className="text-[#1a6645]">the whole year.</span>
          </h1>

          {/* Product descriptor — what it actually is */}
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-4">
            Custom lead form · Job dashboard · Quotes · Payments · Emails
          </p>

          {/* Sub-copy */}
          <p className="text-slate-600 max-w-xl mb-10 text-base sm:text-lg font-medium leading-relaxed px-2">
            Sign up and get your own branded form link and QR code. Customers fill it out — every lead lands on your dashboard automatically. Schedule, quote, collect, and send emails in one click.
          </p>

          <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto sm:max-w-none">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              style={{
                fontSize: '1.05rem',
                padding: '1.1rem 2.5rem',
                background: '#0F1F3D',
                boxShadow: '0 20px 40px -12px rgba(15,31,61,0.35)',
              }}
            >
              Claim Your Branded Link Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              No credit card · Live in 2 minutes
            </p>

            {/* Two links — clean stack on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:gap-8">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#1a6645]/10 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} className="text-[#1a6645]" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">You get</p>
                  <p className="text-sm font-black text-[#0F1F3D]">Your Customer Form Link</p>
                  <p className="text-[10px] text-slate-400 font-medium">Customers fill it out, leads land instantly</p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-10 bg-slate-300" />

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-[#1a6645]/10 flex items-center justify-center shrink-0">
                  <ListChecks size={16} className="text-[#1a6645]" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">You get</p>
                  <p className="text-sm font-black text-[#0F1F3D]">Your Management Dashboard</p>
                  <p className="text-[10px] text-slate-400 font-medium">Schedule, quote, pay, email — one place</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dark strip with story */}
        <div className="mt-12 sm:mt-24 relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-12 rounded-[32px] sm:rounded-[50px] bg-[#020617] border border-white/5 shadow-2xl overflow-hidden">
          <div className="relative w-full overflow-hidden sm:overflow-visible">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}