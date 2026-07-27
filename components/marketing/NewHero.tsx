'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, QrCode, Link2, Check, CalendarDays } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const ACCENT_TEAL = '#0F766E';

const TRADES = [
  { name: 'Roofing', src: '/images/roofing.webp' },
  { name: 'HVAC', src: '/images/hvac.webp' },
  { name: 'Plumbing', src: '/images/plumbing.webp' },
  { name: 'Electrical', src: '/images/electrical.webp' },
  { name: 'Solar', src: '/images/solar.webp' },
];

const QUICK_FEATURES = [
  'Track jobs',
  'Schedule jobs',
  'Send estimates in seconds',
  'Generate branded invoices',
  'Collect Google reviews',
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

  // Carry the strip along with the cycle until the user takes over.
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
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 px-4 sm:px-8 text-left"
    >
      {/* Soft glow instead of a photo — the trades now live in the strip below,
          where they can actually be seen. */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-[140px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left: the pitch */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black text-teal-300 uppercase tracking-wide">
                Built for {TRADES[currentTradeIndex].name} and local service crews
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight leading-[1.06] mb-6">
              One link.{' '}
              <span className="text-teal-400 block sm:inline">Every lead on one board.</span>
            </h1>

            <p className="text-slate-300 font-medium text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              Share a booking form built in your colors, by link or QR code. Leads come
              straight to your board with photos and job details attached.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3.5">
              <Link href="/signup" className="sm:flex-initial">
                <button
                  style={{ backgroundColor: ACCENT_TEAL }}
                  className="w-full text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Get started free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link href="/book-demo" className="sm:flex-initial">
                <button className="w-full text-white font-black text-sm uppercase tracking-wider px-7 py-4 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                  <CalendarDays size={16} className="shrink-0" />
                  Book a demo
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-4">
              <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
              No credit card required
            </div>
          </div>

          {/* Right: the two URLs every account gets */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl p-6 sm:p-7"
            >
              <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center justify-between gap-3">
                <span>You get two links on signup</span>
                <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md shrink-0">
                  Free
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <QrCode size={21} className="text-teal-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-black text-white leading-tight">
                      Your booking form
                    </span>
                    <span className="block text-xs font-bold text-slate-400 mt-0.5">
                      Share the link or print the QR code
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Link2 size={21} className="text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-black text-white leading-tight">
                      Your dashboard
                    </span>
                    <span className="block text-xs font-bold text-slate-400 mt-0.5">
                      Where every lead and job shows up
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 pt-5 border-t border-white/10 text-xs font-bold text-slate-400 leading-relaxed">
                Both are ready the minute you sign up. Nothing to install.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Trade slideshow ──────────────────────────────────────────
            Bleeds past the container on mobile so the row reads as
            scrollable rather than cut off. */}
        <div className="mt-12 sm:mt-14">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Trusted across the trades
            </p>
            <div className="flex items-center gap-1.5">
              {TRADES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setUserScrolled(false);
                    setCurrentTradeIndex(i);
                  }}
                  aria-label={`Show ${t.name}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentTradeIndex ? 'w-5 bg-teal-400' : 'w-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            ref={stripRef}
            onTouchStart={() => setUserScrolled(true)}
            onWheel={() => setUserScrolled(true)}
            className="-mx-4 sm:-mx-8 px-4 sm:px-8 flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {TRADES.map((trade, i) => {
              const isActive = i === currentTradeIndex && !userScrolled;
              return (
                <div
                  key={trade.name}
                  className={`relative shrink-0 snap-start overflow-hidden rounded-2xl border transition-all duration-500 w-[160px] h-[190px] sm:w-[210px] sm:h-[240px] lg:w-[230px] lg:h-[260px] ${
                    isActive ? 'border-teal-400/70 ring-2 ring-teal-400/40' : 'border-white/10'
                  }`}
                >
                  <img
                    src={trade.src}
                    alt={`${trade.name} crew at work`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {/* Just enough gradient for white text to sit on. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 right-3 text-base sm:text-lg font-black text-white tracking-tight drop-shadow">
                    {trade.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Feature banner ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className="mt-12 sm:mt-16 rounded-[2rem] bg-gradient-to-b from-white via-slate-50 to-slate-100 p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/80"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Everything you need to run your business
            </h2>

            <span className="text-xs font-black text-teal-800 bg-teal-100/80 border border-teal-200/60 px-4 py-2 rounded-full self-start md:self-auto shrink-0">
              Zero extra apps needed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {QUICK_FEATURES.map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-3 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(15,118,110,0.12)] hover:border-teal-400 hover:-translate-y-0.5 transition-all group"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform">
                  <Check size={16} strokeWidth={3} />
                </div>
                <span className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}