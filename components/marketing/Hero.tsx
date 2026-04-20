'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative bg-[#0a0f1e] overflow-hidden">

      {/* ── BACKGROUND: animated gradient orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1a6645, transparent 70%)' }} />
        <div className="absolute -top-20 right-0 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] sm:w-[800px] sm:h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #1a6645, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* Spacer accounts for fixed nav (mobile ~64px, desktop ~72px) */}
        <div className="pt-20 sm:pt-28" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-20 items-center pb-12 sm:pb-20">

          {/* LEFT */}
          <div className="flex flex-col">

            <h1
              className="font-black text-white leading-[0.95] tracking-[-0.035em] sm:tracking-[-0.04em] mb-6 sm:mb-8"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
            >
              Win{' '}
              <span
                className="relative inline-block pb-1"
                style={{
                  background: 'linear-gradient(135deg, #4ade80, #1a6645)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: '1',
                }}
              >
                every job
              </span>
              <br />
              before competition<br />
              picks up.
            </h1>

            <p className="text-base sm:text-xl text-white/60 font-medium leading-relaxed mb-8 sm:mb-10 max-w-lg">
              One QR code on your truck. Customers scan, submit photos, and land on your board —
              <span className="text-white/90 font-semibold"> while you're still on the roof.</span>
            </p>

            {/* ── CTA ── */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-6 w-full">

              {/* PRIMARY */}
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 text-white font-bold text-base sm:text-lg px-6 py-4 rounded-2xl transition-all active:scale-[0.98] shadow-2xl w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #1a6645, #15803d)',
                  boxShadow: '0 20px 40px -12px rgba(26,102,69,0.5)',
                }}
              >
                Start free for 14 days
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* SECONDARY */}
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 text-white/70 hover:text-white font-semibold text-sm sm:text-base px-6 py-4 sm:py-3 rounded-2xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition w-full sm:w-auto"
              >
                See it in action
              </Link>
            </div>

            {/* ── TRUST (promises, not warnings) ── */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 pt-1 sm:pt-2 text-[10px] sm:text-[11px] font-bold text-white/40 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500/70 shrink-0" />
                No setup fees
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500/70 shrink-0" />
                Cancel anytime
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500/70 shrink-0" />
                Works on any phone
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="w-full flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[560px] lg:max-w-[600px]">
              <HeroDashboardDemo />
            </div>
          </div>

        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/5 mb-12 sm:mb-24 bg-white/5">
          {[
            { value: '< 2s', label: 'Lead capture' },
            { value: '30%', label: 'More jobs closed' },
            { value: '2 min', label: 'Setup time' },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-5 sm:py-6 px-2 sm:px-4 bg-white/[0.03] text-center">
              <p className="text-xl sm:text-3xl font-black text-white tracking-tight mb-1">{stat.value}</p>
              <p className="text-[9px] sm:text-[11px] font-bold text-white/30 uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── STORY STRIP ── */}
        <div
          id="how-it-works"
          className="rounded-[2rem] sm:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl mb-16 sm:mb-24"
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }}
        >
          <div className="py-14 sm:py-20 px-5 sm:px-10 lg:py-28 lg:px-16">
            <HeroStoryStrip />
          </div>
        </div>

      </div>
    </section>
  );
}