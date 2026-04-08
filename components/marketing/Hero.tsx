'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0]" style={{ paddingTop: 'clamp(6rem, 12vw, 9rem)', paddingBottom: '3rem' }}>

      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">

        {/* ── Split grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 lg:mb-24">

          {/* LEFT — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Headline */}
            <h1
              className="font-black tracking-tight text-[#0F1F3D] mb-5 max-w-lg lg:max-w-none"
              style={{ fontSize: 'clamp(2.6rem, 7vw, 5rem)', lineHeight: '1.0', letterSpacing: '-0.03em' }}
            >
              Stop chasing jobs.<br />
              <span className="text-[#1a6645]">Start closing them.</span>
            </h1>

            {/* Sub-copy */}
            <p
              className="text-slate-500 font-medium leading-relaxed mb-8 max-w-md"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
            >
              Lead2Project gives every home service contractor a custom form, job dashboard, quotes, scheduling, and email outbox — in one place. Sign up and get your evenings back.
            </p>

            {/* CTA */}
            <div className="flex flex-col items-center lg:items-start gap-3 w-full sm:w-auto">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                style={{
                  fontSize: '1rem',
                  padding: '1rem 2.25rem',
                  background: '#0F1F3D',
                  boxShadow: '0 16px 40px -10px rgba(15,31,61,0.3)',
                  letterSpacing: '-0.01em',
                }}
              >
                Start free — live in 2 minutes
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
                14-day free trial · Cancel anytime
              </p>
            </div>

          </div>

          {/* RIGHT — dashboard demo */}
          <div className="relative w-full flex justify-center lg:justify-end order-first lg:order-last">
            <HeroDashboardDemo />
          </div>

        </div>

        {/* ── Dark story strip ── */}
       <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020617]"
  style={{ padding: 'clamp(2.5rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem) clamp(3rem, 6vw, 5rem)' }}>
  <div className="relative w-full">
    <HeroStoryStrip />
  </div>
</div>

      </div>
    </section>
  );
}