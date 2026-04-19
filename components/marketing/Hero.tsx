'use client';

import Link from 'next/link';
import { ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

export default function Hero() {
  return (
    <section className="relative bg-[#F7F5F0] overflow-hidden">
      {/* subtle dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0F1F3D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.035,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* ── TOP NAV SPACER ── */}
        <div className="pt-24 sm:pt-32" />

        {/* ── HEADLINE BLOCK ── */}
        <div className="max-w-4xl mb-12 sm:mb-16">

          {/* eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
              For contractors who are done losing leads
            </span>
          </div>

          {/* H1 — massive, left-aligned, one message */}
          <h1
            className="font-black text-[#0F1F3D] leading-[0.85] tracking-[-0.04em] mb-8"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 7.5rem)' }}
          >
            Your truck<br />
            is now a<br />
            <span className="text-[#1a6645]">sales machine.</span>
          </h1>

          {/* one-liner */}
          <p className="text-lg sm:text-2xl text-slate-500 font-medium leading-snug max-w-2xl mb-10">
            Stick a QR code on your rig. Customers scan, submit photos, and land on your board — while you're finishing the job.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-3 bg-[#0F1F3D] text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-[#1a2d50] active:scale-[0.98] transition-all"
            >
              Start free — 14 days
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-amber-500" />
                Card required
              </div>
              <div className="w-px h-3 bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>

        {/* ── DEMO — full width, no container cap ── */}
        <div className="w-full flex justify-center pb-20 sm:pb-28">
          <div className="w-full max-w-2xl">
            <HeroDashboardDemo />
          </div>
        </div>

        {/* ── STORY STRIP ── */}
        <div
          id="how-it-works"
          className="rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden bg-[#020617] border border-white/10 shadow-2xl mb-16 sm:mb-24"
        >
          <div className="py-16 sm:py-20 px-5 sm:px-10 lg:py-28 lg:px-16">
            <HeroStoryStrip />
          </div>
        </div>

      </div>
    </section>
  );
}