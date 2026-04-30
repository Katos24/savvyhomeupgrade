'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Zap, Camera, BellRing, MousePointerClick, Sparkles } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import HeroDashboardDemo from '@/components/marketing/HeroDashboardDemo';

/* ─────────────────────────────────────────────
   PIXAR-CRISP HERO
   ─────────────────────────────────────────────
   Design language:
   • Soft cinematic lighting — warm amber/gold key light, cool blue fill
   • Rounded, tactile forms with layered depth
   • Rich shadows that feel dimensional, not flat
   • Clean confident typography with generous spacing
   • Emerald accent stays but gets warmer, more saturated
   ───────────────────────────────────────────── */

function FeaturePill({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: string }) {
  return (
    <div
      className="group flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        animationDelay: delay,
      }}
    >
      <div
        className="p-2.5 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {icon}
      </div>
      <p className="text-[13px] font-bold text-slate-200 tracking-wide">{text}</p>
    </div>
  );
}

function MetricCard({ label, val }: { label: string; val: string }) {
  return (
    <div
      className="relative px-4 py-7 sm:py-10 text-center group hover:scale-[1.02] transition-transform duration-300"
      style={{
        background: 'linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(6,12,34,1) 100%)',
      }}
    >
      {/* Soft top-light glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.6), transparent)' }}
      />
      <p
        className="text-xl sm:text-3xl font-black text-white mb-1.5 tracking-tight"
        style={{ textShadow: '0 0 30px rgba(52,211,153,0.15)' }}
      >
        {val}
      </p>
      <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #020617 0%, #040b1a 50%, #020617 100%)' }}>

      {/* ── PIXAR LIGHTING SETUP ── */}
      {/* Key light: warm amber from top-left */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: '-15%',
            left: '-5%',
            width: '55%',
            height: '60%',
            background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, rgba(251,191,36,0.02) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Fill light: cool emerald from center-right */}
        <div
          className="absolute"
          style={{
            top: '10%',
            right: '-10%',
            width: '50%',
            height: '65%',
            background: 'radial-gradient(ellipse at center, rgba(52,211,153,0.07) 0%, rgba(52,211,153,0.02) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Rim light: subtle blue from bottom */}
        <div
          className="absolute"
          style={{
            bottom: '-10%',
            left: '20%',
            width: '60%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Subtle dot pattern — barely visible, adds tactile texture */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 0.8px, transparent 0.8px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

        {/* NAV SPACER */}
        <div className="pt-28 sm:pt-40 lg:pt-48" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start pb-16 sm:pb-24">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col">

            {/* 1. HEADLINE BLOCK */}
            <div className="order-1 text-center lg:text-left">

              {/* Badge — soft glowing pill */}
              <div
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full mb-7"
                style={{
                  background: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.04) 100%)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  boxShadow: '0 0 20px rgba(52,211,153,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <Sparkles size={12} className="text-emerald-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-400">
                  The Contractor OS
                </span>
              </div>

              {/* Headline — cinematic weight */}
              <h1
                className="font-black text-white leading-[0.92] tracking-[-0.02em] mb-8"
                style={{
                  fontSize: 'clamp(2.4rem, 7vw, 4.8rem)',
                  textShadow: '0 4px 40px rgba(0,0,0,0.3)',
                }}
              >
                Win jobs while{' '}
                <br className="hidden sm:block" />
                <span
                  className="italic"
                  style={{
                    background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 8px rgba(52,211,153,0.3))',
                  }}
                >
                  you&apos;re in the field.
                </span>
              </h1>

              {/* Sub-headline — warm, readable */}
              <p
                className="text-[15px] sm:text-lg text-slate-400 font-medium leading-relaxed mb-11 max-w-lg mx-auto lg:mx-0"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
              >
                The easiest way to track leads and organize your payday.
                Let customers send <span className="text-white font-semibold">photos&nbsp;and&nbsp;videos</span> so
                you can finalize quotes and settle jobs in one click.
              </p>
            </div>

            {/* 2. MOBILE DEMO */}
            <div className="order-2 lg:hidden mb-12">
              <p className="text-center text-sm font-bold text-slate-400 mb-5 px-4">
                Create your custom form. Customers submit requests with photos.
                Every lead lands on your board.{' '}
                <span className="text-emerald-400">Watch&nbsp;it&nbsp;happen.</span>
              </p>
              <div
                className="relative p-2 rounded-3xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <HeroDashboardDemo />
              </div>
            </div>

            {/* 3. CTA & FEATURES */}
            <div className="order-3">

              {/* CTAs — dimensional buttons with depth */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-11">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-3 text-white font-extrabold px-7 sm:px-9 py-4 sm:py-5 rounded-2xl transition-all duration-300 active:scale-[0.97] text-base sm:text-lg w-full lg:w-auto hover:translate-y-[-1px]"
                  style={{
                    background: 'linear-gradient(145deg, #34d399 0%, #10b981 40%, #059669 100%)',
                    boxShadow: '0 8px 32px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  Start 14-Day Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/demo"
                  className="flex items-center justify-center gap-2 text-white font-bold px-7 sm:px-9 py-4 sm:py-5 rounded-2xl transition-all duration-300 w-full lg:w-auto hover:translate-y-[-1px]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  Try the Live Demo
                </Link>
              </div>

              {/* FEATURES — hidden on mobile */}
              <div className="hidden sm:grid grid-cols-1 gap-3 mb-11 max-w-md mx-auto lg:mx-0">
                <FeaturePill
                  icon={<MousePointerClick size={16} className="text-emerald-400" />}
                  text="One-Click Quote & Settlement Tracking"
                  delay="0ms"
                />
                <FeaturePill
                  icon={<Camera size={16} className="text-sky-400" />}
                  text="Direct Photo & Video Job Briefs"
                  delay="60ms"
                />
                <FeaturePill
                  icon={<BellRing size={16} className="text-amber-400" />}
                  text="Payday Reminder Emails & Alerts"
                  delay="120ms"
                />
              </div>

              {/* TRUST SIGNALS — hidden on mobile */}
              <div className="hidden sm:flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-3">
                {[
                  '6AM Daily Digest',
                  'Branded Tracking',
                  'You Own Your Data',
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.3))' }} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── DESKTOP VISUAL ── */}
          <div className="hidden lg:block relative sticky top-40">
            {/* Dimensional glow behind the phone frame */}
            <div
              className="absolute -inset-8 rounded-full"
              style={{
                background: 'radial-gradient(ellipse at 40% 30%, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.03) 40%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
            <div
              className="relative p-3.5 rounded-[3rem]"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              <HeroDashboardDemo />
            </div>
          </div>
        </div>

        {/* ── BENTO METRICS ── */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden mb-16 sm:mb-24 rounded-2xl sm:rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {[
            { label: 'Setup Time',   val: '2 Minutes' },
            { label: 'Tracking',     val: 'One Click' },
            { label: 'Daily Digest', val: '6:00 AM' },
            { label: 'Data Control', val: '100%' },
          ].map((s, i) => (
            <MetricCard key={i} label={s.label} val={s.val} />
          ))}
        </div>

        {/* ── STORY STRIP ── */}
        <div
          className="overflow-hidden mb-16 sm:mb-24 rounded-2xl sm:rounded-[3rem]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <div className="py-12 sm:py-32 px-2 sm:px-10">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}