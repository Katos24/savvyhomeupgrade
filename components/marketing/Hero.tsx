'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-[#F7F5F0]"
      style={{ paddingTop: 'clamp(4rem, 8vw, 6rem)',
paddingBottom: '2rem' }}
    >
      {/* Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 z-10">

        {/* ── Split grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-8 lg:mb-12">

          {/* LEFT — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            <h1
              className="font-black tracking-tight text-[#0F1F3D] mb-5 max-w-lg lg:max-w-none"
              style={{
                fontSize: 'clamp(2.6rem, 8vw, 6rem)',
                lineHeight: '0.95',
                letterSpacing: '-0.04em',
              }}
            >
              Stop losing jobs in messages.<br />
              <span className="text-[#1a6645]">Start booking them in seconds.</span>
            </h1>

            <p
              className="text-slate-500 font-normal leading-relaxed mb-8 max-w-sm"
              style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)' }}
            >
              Lead2Project gives home service contractors a simple booking system to capture leads,
              send quotes, schedule jobs, and manage every customer in one place.
              <br /><br />
              No spreadsheets. No scattered texts. No missed calls.
            </p>

            {/* CTA — desktop */}
            <div className="hidden lg:flex flex-col items-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    fontSize: '1rem',
                    padding: '1rem 2.25rem',
                    background: '#0F1F3D',
                    boxShadow: '0 16px 40px -10px rgba(15,31,61,0.3)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Start free today
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 font-black rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    fontSize: '1rem',
                    padding: '1rem 1.75rem',
                    color: '#0F1F3D',
                    borderColor: '#0F1F3D40',
                    background: 'transparent',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Try the demo
                </Link>
              </div>

              <p className="text-[11px] font-semibold text-slate-400 tracking-wide">
                Built for contractors who want more booked work, less chaos
              </p>
            </div>
          </div>

          {/* RIGHT — demo */}
          <div className="relative w-full flex justify-center lg:justify-end lg:order-last">
            <HeroDashboardDemo />
          </div>
        </div>

        {/* CTA — mobile */}
        <div className="flex lg:hidden flex-col items-center gap-3 mb-12">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full"
            style={{
              fontSize: '1rem',
              padding: '1rem 2.25rem',
              background: '#0F1F3D',
              boxShadow: '0 16px 40px -10px rgba(15,31,61,0.3)',
              letterSpacing: '-0.01em',
            }}
          >
            Start free today
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 font-black rounded-2xl border transition-all w-full"
            style={{
              fontSize: '1rem',
              padding: '1rem 1.75rem',
              color: '#0F1F3D',
              borderColor: '#0F1F3D40',
              background: 'transparent',
              letterSpacing: '-0.01em',
            }}
          >
            Try the demo
          </Link>

          <p className="text-[11px] font-semibold text-slate-400 tracking-wide text-center">
            Built for contractors who want more booked work, less chaos
          </p>
        </div>

        {/* ── Bridge label ── */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
            See how it works
          </p>
          <div className="w-px h-8 bg-gradient-to-b from-slate-300 to-transparent" />
        </div>

        {/* ── Dark story strip ── */}
        <div
          id="how-it-works"
          className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020617]"
          style={{
            padding:
              'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 5vw, 3.5rem)',
          }}
        >
          <div className="w-full overflow-hidden">
            <HeroStoryStrip />
          </div>
        </div>

      </div>
    </section>
  );
}