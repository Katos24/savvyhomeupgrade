'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import HeroCarousel from '@/components/marketing/HeroCarousel';

/* ─────────────────────────────────────────────────────────
   NEW HERO — V2 (NO PURPLE)
   ─────────────────────────────────────────────────────────
   Colors: deep navy (#0a1628) + blue (#1e3a8a) + emerald accent
   Zero purple/indigo/violet anywhere.
   ───────────────────────────────────────────────────────── */

export default function NewHero() {
  return (
    <section className="relative overflow-hidden">

      {/* Background — navy blues only, no purple */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, #1e3a8a 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 75% 15%, #1e40af 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 25% 20%, #1d4ed8 0%, transparent 50%),
            #0a1628
          `,
        }}
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top glow — blue, not purple */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(30,64,175,0.25) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10">

        <div className="max-w-4xl mx-auto px-6 sm:px-10 pt-32 sm:pt-44 lg:pt-52 pb-14 sm:pb-18 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <span className="text-xs font-bold text-white/80 tracking-wide">
              Job Management for Service Contractors
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-black text-white leading-[1.05] tracking-[-0.03em] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)' }}
          >
            Blast Your Link.{' '}
            <br className="hidden sm:block" />
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 50%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Get Better Leads.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-white font-semibold leading-relaxed max-w-xl mx-auto mb-10">
            One link and QR code for trucks, yard signs, and bios.
            Customers submit photos and details. You quote, schedule,
            and get paid — all from one dashboard.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-3 font-extrabold px-10 py-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] active:scale-[0.97] text-base sm:text-lg w-full sm:w-auto bg-white text-slate-900"
              style={{
                boxShadow: '0 8px 32px rgba(255,255,255,0.15)',
              }}
            >
              Start Free — 14 Days
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:translate-y-[-2px] text-base sm:text-lg w-full sm:w-auto text-white"
              style={{ border: '1.5px solid rgba(255,255,255,0.3)' }}
            >
              Try the Live Demo
            </Link>
          </div>

          {/* Trust line */}
          <p className="text-xs text-white/40 font-medium tracking-wide">
            No credit card required · 2 minute setup · Cancel anytime
          </p>
        </div>

        {/* Carousel */}
        <div className="pb-16 sm:pb-24">
          <HeroCarousel />
        </div>

      </div>
    </section>
  );
}