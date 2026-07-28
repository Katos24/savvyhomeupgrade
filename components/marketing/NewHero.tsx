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
  LayoutDashboard,
  FileText,
  CreditCard,
  Sparkles,
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
      /* Increased top padding (pt-32) so fixed nav on mobile doesn't overlap header */
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pt-32 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-24 px-4 sm:px-8 text-left"
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 lg:left-1/4 lg:translate-x-0 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-teal-500/10 blur-[100px] sm:blur-[140px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Main Flex/Grid Wrapper: Handles mobile order vs desktop columns */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">

          {/* 1. HEADLINE & CTAS (Mobile: 1st | Desktop: Left Column) */}
          <div className="order-1 lg:col-span-7 w-full">
            <h1 className="text-[2rem] sm:text-5xl lg:text-6xl text-white font-black tracking-tight leading-[1.1] sm:leading-[1.06] mb-4 sm:mb-6">
              One link.{' '}
              <span className="text-teal-400 block sm:inline">Every lead on one board.</span>
            </h1>

            <p className="text-slate-300 font-medium text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed max-w-xl">
              Share a booking form built in your colors, by link or QR code. Leads come
              straight to your board with photos and job details attached.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <Link href="/signup" className="w-full sm:w-auto sm:flex-initial">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-wider px-6 sm:px-8 py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                  Get started free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link href="/book-demo" className="w-full sm:w-auto sm:flex-initial">
                <button className="w-full text-white font-black text-sm uppercase tracking-wider px-6 sm:px-7 py-4 rounded-xl border border-white/25 bg-white/5 hover:bg-white/10 hover:border-white/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                  <CalendarDays size={16} className="shrink-0" />
                  Book a demo
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mt-4">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              No credit card required
            </div>
          </div>

          {/* 2. SLIDESHOW (Mobile: 2nd | Desktop: Full width bottom row) */}
          <div className="order-2 lg:order-3 lg:col-span-12 w-full mt-2 lg:mt-6">
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
                    className={`relative shrink-0 snap-start overflow-hidden rounded-2xl border transition-all duration-500 w-[140px] h-[170px] sm:w-[210px] sm:h-[240px] lg:w-[230px] lg:h-[260px] ${
                      isActive ? 'border-teal-400/70 ring-2 ring-teal-400/40' : 'border-white/10'
                    }`}
                  >
                    <img
                      src={trade.src}
                      alt={`${trade.name} crew at work`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                    <span className="absolute bottom-3 left-3 right-3 text-sm sm:text-lg font-black text-white tracking-tight drop-shadow">
                      {trade.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. TWO LINKS CARD (Mobile: 3rd | Desktop: Right Column) */}
          <div className="order-3 lg:order-2 lg:col-span-5 w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl p-5 sm:p-7"
            >
              <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-4 sm:mb-5 flex items-center justify-between gap-3">
                <span>You get two links on signup</span>
                <span className="text-[10px] text-teal-300 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md shrink-0">
                  Free
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <QrCode size={20} className="text-teal-400" strokeWidth={2.5} />
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

                <div className="flex items-center gap-3 bg-slate-900/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Link2 size={20} className="text-blue-400" strokeWidth={2.5} />
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

              <p className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-white/10 text-xs font-bold text-slate-400 leading-relaxed">
                Both are ready the minute you sign up. Nothing to install.
              </p>
            </motion.div>
          </div>

          {/* 4. COMPACT FEATURE GRID (Mobile: 2 Columns | Desktop: 5 Columns) */}
          <div className="order-4 lg:col-span-12 w-full mt-2 lg:mt-6">
  <motion.div
    initial={{ opacity: 0, scale: 0.96, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
    className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden text-left"
  >
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100 relative z-10">
      <div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Everything you need to run your business
        </h2>
        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5 sm:mt-1">
          Built specifically to handle job flow, estimates, and customer payments in one place.
        </p>
      </div>

      <span className="text-[10px] sm:text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full self-start md:self-auto shrink-0 uppercase tracking-wider">
        Zero extra apps needed
      </span>
    </div>

    {/* 2 columns on mobile (grid-cols-2), 3 on tablet, 5 on desktop */}
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3.5 relative z-10">
      {[
        { title: 'Track jobs', desc: 'Real-time board overview', icon: <LayoutDashboard size={16} /> },
        { title: 'Schedule jobs', desc: 'One‑click calendar scheduling', icon: <CalendarDays size={16} /> },
        { title: 'Instant estimates', desc: 'Send & approve in seconds', icon: <FileText size={16} /> },
        { title: 'Branded invoices', desc: 'Get paid faster online', icon: <CreditCard size={16} /> },
        { title: 'Google reviews', desc: 'Automate review requests', icon: <Sparkles size={16} />, fullMobile: true },
      ].map((feat) => (
        <div
          key={feat.title}
          className={`flex flex-col justify-between bg-slate-50/70 border border-slate-200/60 hover:border-emerald-500/50 hover:bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group duration-200 ${
            feat.fullMobile ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100/70 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
              {feat.icon}
            </div>
            <Check size={14} className="text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>

          <div>
            <span className="block text-xs sm:text-sm font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
              {feat.title}
            </span>
            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5 sm:mt-1">
              {feat.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
</div>

        </div>
      </div>
    </section>
  );
}