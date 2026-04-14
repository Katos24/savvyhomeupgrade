'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-[#F7F5F0]"
style={{ paddingTop: 'clamp(6rem, 12vw, 9rem)', paddingBottom: '2rem' }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-8 lg:mb-14">

          {/* LEFT — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Eyebrow */}
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a6645] mb-5">
              For home service contractors
            </p>

            {/* H1 */}
            <h1
              className="font-black text-[#0F1F3D] mb-6"
              style={{
                fontSize: 'clamp(2.8rem, 9vw, 6.5rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.05em',
              }}
            >
              Stop losing<br />
              jobs in your<br />
              <span style={{ color: '#1a6645' }}>text thread.</span>
            </h1>

            {/* One strong statement */}
            <p className="text-base font-semibold text-slate-700 leading-relaxed mb-8 max-w-sm text-center lg:text-left">
              One QR code. Customers scan, submit their job with photos,
              and land on your dashboard — ready to quote, schedule,
              and collect payment. No spreadsheets. No missed calls.
            </p>

            {/* CTA — desktop */}
            <div className="hidden lg:flex flex-col items-start gap-3">
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
                Get your booking link
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4"
              >
                See a live demo first
              </Link>
            </div>
          </div>

          {/* RIGHT — demo */}
          <div className="relative w-full flex justify-center lg:justify-end lg:order-last">
            <HeroDashboardDemo />
          </div>
        </div>

        {/* CTA — mobile */}
        <div className="flex lg:hidden flex-col items-center gap-4 mb-12">
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all active:scale-[0.98] w-full"
            style={{
              fontSize: '1rem',
              padding: '1rem 2.25rem',
              background: '#0F1F3D',
              boxShadow: '0 16px 40px -10px rgba(15,31,61,0.3)',
              letterSpacing: '-0.01em',
            }}
          >
            Get your booking link
            <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/demo"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors underline underline-offset-4 text-center"
          >
            See a live demo first
          </Link>
        </div>

        {/* ── Bridge label ── */}
        <div className="flex flex-col items-center mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 mb-3">
            How it works
          </p>
          <div className="w-px h-10 bg-gradient-to-b from-slate-400 to-transparent" />
        </div>

        {/* ── Dark story strip ── */}
        <div
          id="how-it-works"
          className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020617]"
          style={{
            padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 5vw, 3.5rem)',
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