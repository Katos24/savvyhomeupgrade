'use client';

import Link from 'next/link';
import { ArrowRight, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative bg-[#0a0f1e] overflow-hidden">

      {/* ── BACKGROUND: animated gradient orbs ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #1a6645, transparent 70%)' }} />
        <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #1d4ed8, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #1a6645, transparent 70%)' }} />
        {/* dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* ── NAV SPACER ── */}
        <div className="pt-24 sm:pt-28" />

        {/* ── HERO: left copy + right demo ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pb-16 sm:pb-20">

          {/* LEFT */}
          <div className="flex flex-col">

            {/* eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8 self-start">
              <Zap size={12} className="text-emerald-400" fill="currentColor" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Live in 2 minutes
              </span>
            </div>

            {/* H1 */}
            <h1
              className="font-black text-white leading-[0.85] tracking-[-0.04em] mb-7"
              style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}
            >
              Stop losing jobs<br />
              to{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #4ade80, #1a6645)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                voicemail.
              </span>
            </h1>

            {/* subheading */}
            <p className="text-lg sm:text-xl text-white/50 font-medium leading-relaxed mb-3 max-w-lg">
              One QR code on your truck. Customers scan, submit photos, and land on your board —
              <span className="text-white/80 font-semibold"> while you're on the roof.</span>
            </p>

            {/* social proof line */}
            <p className="text-sm text-emerald-400/80 font-bold mb-10">
              → Contractors using Lead2Project close 30% more jobs.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-3 text-white font-black text-lg px-8 py-4 rounded-2xl transition-all active:scale-[0.98] shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #1a6645, #15803d)', boxShadow: '0 20px 40px -12px rgba(26,102,69,0.5)' }}
              >
                Start free — 14 days
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-sm transition-colors"
              >
                Watch it work →
              </Link>
            </div>

            {/* trust */}
            <div className="flex items-center gap-4 text-[11px] font-bold text-white/25 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={11} className="text-amber-500/70" />
                Card required
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-500/70" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* RIGHT: demo */}
          <div className="w-full flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[560px]">
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* ── STATS BAR ── */}
        <div className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/5 mb-16 sm:mb-24 bg-white/5">
          {[
            { value: '< 2s',   label: 'Lead capture time'   },
            { value: '30%',    label: 'More jobs closed'     },
            { value: '2 min',  label: 'Setup time'           },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center py-6 px-4 bg-white/[0.03] text-center">
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">{stat.value}</p>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── STORY STRIP ── */}
        <div
          id="how-it-works"
          className="rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl mb-16 sm:mb-24"
          style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }}
        >
          <div className="py-16 sm:py-20 px-5 sm:px-10 lg:py-28 lg:px-16">
            <HeroStoryStrip />
          </div>
        </div>

      </div>
    </section>
  );
}