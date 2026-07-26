'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, QrCode, Link2, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const ACCENT_TEAL = '#0F766E';

const TRADE_IMAGES = [
  { name: 'Roofing', src: '/images/roofing.webp' },
  { name: 'HVAC', src: '/images/hvac.webp' },
  { name: 'Plumbing', src: '/images/plumbing.webp' },
  { name: 'Electrical', src: '/images/electrical.webp' },
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

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setCurrentTradeIndex((prev) => (prev + 1) % TRADE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-950 pt-28 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-28 px-4 sm:px-8 text-left"
    >
      {/* Background trade imagery */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTradeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={TRADE_IMAGES[currentTradeIndex].src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover filter brightness-125 opacity-95 saturate-110"
            />
          </motion.div>
        </AnimatePresence>

        {/* Left-weighted scrim keeps the headline readable over any photo. */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Left: the pitch */}
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-7 sm:p-10 lg:p-12">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-slate-950/80 px-3.5 py-1 mb-7 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black text-teal-300 uppercase tracking-wide">
                Built for {TRADE_IMAGES[currentTradeIndex].name} and local service crews
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-white font-black tracking-tight leading-[1.06] mb-7">
              One link.{' '}
              <span className="text-teal-400 block sm:inline">
                Every lead on one board.
              </span>
            </h1>

            <p className="text-white font-medium text-base sm:text-lg mb-10 leading-relaxed max-w-xl">
              Share a booking form built in your colors, by link or QR code. Leads come
              straight to your board with photos and job details attached.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link href="/signup">
                <button
                  style={{ backgroundColor: ACCENT_TEAL }}
                  className="w-full sm:w-auto text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Get started free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-xs font-bold px-2 py-2">
                <CheckCircle2 size={16} className="text-teal-400 shrink-0" />
                No credit card required
              </div>
            </div>
          </div>

          {/* Right: the two URLs every account gets */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-6 sm:p-7"
            >
              <div className="text-[11px] font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center justify-between gap-3">
                <span>You get two links on signup</span>
                <span className="text-[9px] text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md shrink-0">
                  Free
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-slate-900/70 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <QrCode size={21} className="text-teal-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-black text-white leading-tight">
                      Your booking form
                    </span>
                    <span className="block text-[11px] font-bold text-slate-400 mt-0.5">
                      Share the link or print the QR code
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900/70 p-4 rounded-2xl border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Link2 size={21} className="text-blue-400" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-black text-white leading-tight">
                      Your dashboard
                    </span>
                    <span className="block text-[11px] font-bold text-slate-400 mt-0.5">
                      Where every lead and job shows up
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-5 pt-5 border-t border-white/10 text-[11px] font-bold text-slate-400 leading-relaxed">
                Both are ready the minute you sign up. Nothing to install.
              </p>
            </motion.div>
          </div>

        </div>

        {/* ── Pixar-Style Light Feature Banner ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
          className="mt-12 sm:mt-16 rounded-[2.5rem] bg-gradient-to-b from-white via-slate-50 to-slate-100 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white/80 ring-1 ring-slate-200/50"
        >
          {/* Top Headline Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
             
              <div>
               
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Everything you need to run your business
                </h2>
              </div>
            </div>

            <span className="text-xs font-black text-teal-800 bg-teal-100/80 border border-teal-200/60 px-4 py-2 rounded-full shadow-inner self-start md:self-auto shrink-0">
              Zero extra apps needed
            </span>
          </div>

          {/* Light Pixar-Style Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
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