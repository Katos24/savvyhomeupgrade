'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  QrCode,
  Link2,
  Check,
  CalendarDays,
} from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const TRADES = [
  { name: 'Roofing', src: '/images/roofing.webp' },
  { name: 'HVAC', src: '/images/hvac.webp' },
  { name: 'Plumbing', src: '/images/plumbing.webp' },
  { name: 'Electrical', src: '/images/electrical.webp' },
  { name: 'Solar', src: '/images/solar.webp' },
];

const FEATURES = [
  { title: 'Track jobs', desc: 'Real-time board overview' },
  { title: 'Schedule jobs', desc: 'One‑click calendar scheduling' },
  { title: 'Instant estimates', desc: 'Send & approve in seconds' },
  { title: 'Branded invoices', desc: 'Get paid faster online' },
  { title: 'Google reviews', desc: 'Automate review requests' },
];

export default function Hero() {
  const [currentTradeIndex, setCurrentTradeIndex] = useState(0);
  const [userScrolled, setUserScrolled] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setCurrentTradeIndex((prev) => (prev + 1) % TRADES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userScrolled) return;
    const strip = stripRef.current;
    const card = strip?.children[currentTradeIndex] as HTMLElement | undefined;
    if (!strip || !card) return;

    strip.scrollTo({
      left: card.offsetLeft - strip.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [currentTradeIndex, userScrolled]);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-950 pt-36 pb-24 sm:pt-44 sm:pb-32 lg:pt-48 lg:pb-36 px-6 sm:px-12 text-left"
    >
      {/* Subtle Joist-style ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] sm:h-[650px] sm:w-[650px] rounded-full bg-teal-500/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ── TOP SECTION: Joist-Style Hero Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20 sm:mb-28">
          
          {/* Main Copy */}
          <div className="lg:col-span-7 max-w-2xl">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl text-white font-black tracking-tight leading-[1.08] mb-6 sm:mb-8">
              Capture Leads, Send Quotes,{' '}
              <span className="text-teal-400 block sm:inline">
                and Get Paid Faster.
              </span>
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl font-normal leading-relaxed mb-8 sm:mb-10 max-w-xl">
              The modern platform built for trade contractors. Share your custom booking
              link, manage your job board, and collect payments all in one place.
            </p>

            {/* CTAs with air between them */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base px-8 py-4 rounded-xl shadow-xl hover:shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group">
                  Get started free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link href="/book-demo" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-white font-bold text-base px-7 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                  <CalendarDays size={18} className="shrink-0 text-slate-400" />
                  Book a demo
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              Instant setup. No credit card required.
            </div>
          </div>

          {/* Right Column Card: Spacious "Two Links" Box */}
          <div className="lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-md p-7 sm:p-8 shadow-2xl"
            >
              <div className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-6 flex items-center justify-between">
                <span>Included on signup</span>
                <span className="text-[11px] text-teal-300 font-bold bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-md">
                  100% Free
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <QrCode size={22} className="text-teal-400" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white leading-tight">
                      Your booking form
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 leading-normal">
                      Share your link or print your custom QR code on trucks and yard signs.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Link2 size={22} className="text-blue-400" strokeWidth={2} />
                  </div>
                  <div>
                    <span className="block text-base font-bold text-white leading-tight">
                      Your dashboard
                    </span>
                    <span className="block text-xs text-slate-400 mt-1 leading-normal">
                      Where incoming leads, quotes, and customer payments live.
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-6 pt-5 border-t border-white/10 text-xs font-medium text-slate-400 text-center">
                Ready in under 60 seconds. Nothing to install.
              </p>
            </motion.div>
          </div>
        </div>


        {/* ── MIDDLE SECTION: Trade Carousel with Extra Margin ── */}
        <div className="w-full mb-24 sm:mb-32">
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Trusted by contractors across every trade
            </p>
            <div className="flex items-center gap-2">
              {TRADES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setUserScrolled(false);
                    setCurrentTradeIndex(i);
                  }}
                  aria-label={`Show ${t.name}`}
                  className={`h-2 rounded-full transition-all ${
                    i === currentTradeIndex ? 'w-6 bg-teal-400' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            ref={stripRef}
            onTouchStart={() => setUserScrolled(true)}
            onWheel={() => setUserScrolled(true)}
            className="-mx-6 sm:-mx-12 px-6 sm:px-12 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {TRADES.map((trade, i) => {
              const isActive = i === currentTradeIndex && !userScrolled;
              return (
                <div
                  key={trade.name}
                  className={`relative shrink-0 snap-start overflow-hidden rounded-2xl border transition-all duration-500 w-[160px] h-[200px] sm:w-[230px] sm:h-[280px] ${
                    isActive ? 'border-teal-400 ring-2 ring-teal-400/40 scale-[1.02]' : 'border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={trade.src}
                    alt={`${trade.name} crew at work`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-4 left-4 right-4 text-base sm:text-xl font-extrabold text-white tracking-tight drop-shadow">
                    {trade.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>


        {/* ── BOTTOM SECTION: Soft Light Feature Showcase ── */}
        <div className="w-full rounded-3xl bg-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading & Subtitle */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-slate-900">
                Everything you need to run your business
              </h2>
              <p className="text-slate-600 font-semibold text-base sm:text-lg leading-relaxed max-w-xl">
                Run your entire workflow—from field estimate to bank deposit—without losing track of leads or chasing down payments.
              </p>
            </div>

            {/* Right Column: Rounded Pill Feature List */}
            <div className="lg:col-span-6 space-y-3.5">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 bg-teal-50/70 border border-teal-100/80 rounded-full px-6 py-4 transition-all duration-200 hover:bg-teal-100/50 hover:border-teal-200"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  </div>
                  <div>
                    <span className="block text-slate-900 font-extrabold text-base sm:text-lg leading-tight">
                      {feature.title}
                    </span>
                    <span className="block text-slate-500 font-bold text-xs sm:text-sm mt-0.5">
                      {feature.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}