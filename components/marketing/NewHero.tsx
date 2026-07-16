'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Send, 
  Wrench,
  FileSpreadsheet,
  Zap as QuickZap,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';

import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

// ==========================================
// Main Trade-Optimized Architect Hero
// Full-bleed dark hero (badge -> headline -> horizontal icon row -> CTA ->
// rotating trade line), full-width photo slideshow directly beneath it
// with a short feature-pill row under the photos. No product mockup/form
// card in the hero itself — deliberate, matches the Housecall Pro
// reference this was modeled on.
//
// The old bottom "Feature Badges" section (1-Tap Invoices, Get Paid
// Faster, All-in-One Dashboard) has been removed — it duplicated the
// bullet row above it. The new pill row under the photos replaces it with
// mostly-new information instead of restating the same three claims a
// second time.
// ==========================================
export default function ArchitectHero() {
  const [activeExample, setActiveExample] = useState(0);
  const current = TRADE_EXAMPLES[activeExample];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-[#0B1B33] pt-24 pb-14 sm:pt-24 sm:pb-16 lg:pt-28 border-b-[3px] border-[#7BC94F] z-10"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#fff 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* STAGE 1: CENTERED HERO TEXT */}
        <div className="flex flex-col items-center text-center space-y-8 mb-14 lg:mb-16">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 sm:px-4 whitespace-nowrap">
            <Wrench className="w-4 h-4 text-[#7BC94F] shrink-0" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest text-white">
              <span className="sm:hidden">Built for Trades</span>
              <span className="hidden sm:inline">Built for Contractors & Local Trades</span>
            </span>
          </div>

          <h1 className="tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl lg:text-[76px] font-black">
            Your form. Your workflow.<br />
            <span className="text-[#7BC94F]">Your brand.</span>
          </h1>

          {/* Horizontal icon row — was a vertical stack of full sentences.
              Shorter phrases, side by side, wraps on small screens. */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 max-w-2xl">
            {[
              { icon: Wrench, color: '#5B9BF0', text: 'Built For Your Trade' },
              { icon: Send, color: '#7BC94F', text: 'Branded Invoices, One Click' },
              { icon: QuickZap, color: '#F5A524', text: 'Get Paid Instantly' },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * i }}
                className="flex items-center gap-2"
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/15 shrink-0"
                  style={{ backgroundColor: `${item.color}25` }}
                >
                  <item.icon size={13} strokeWidth={3} style={{ color: item.color }} />
                </span>
                <span className="text-slate-200 font-bold text-sm whitespace-nowrap">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>

          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-[#7BC94F] text-slate-950 px-9 py-4 rounded-full font-black uppercase tracking-wider text-sm transition-all cursor-pointer shadow-[0_8px_24px_-8px_rgba(123,201,79,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(123,201,79,0.8)]"
            >
              Start Free
              <ArrowRight size={16} strokeWidth={3} />
            </motion.div>
          </Link>

        </div>
      </div>

      {/* FULL-WIDTH PHOTO SLIDESHOW — same dark surface as the hero above, no seam between them */}
      <div className="w-full pb-10 lg:pb-14">
       
        <div className="flex items-end justify-start lg:justify-center gap-3 overflow-x-auto scrollbar-none px-4 sm:px-8 lg:px-12">
          {TRADE_EXAMPLES.map((example, index) => {
            const isActive = index === activeExample;
            return (
              <button
                key={example.trade}
                onClick={() => setActiveExample(index)}
                className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer"
              >
                <div
                  className={`relative rounded-xl border-2 overflow-hidden transition-all duration-400 ${
                    isActive
                      ? 'w-44 h-32 sm:w-64 sm:h-44 lg:w-80 lg:h-52 border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]'
                      : 'w-24 h-20 sm:w-32 sm:h-24 border-slate-700 opacity-60 group-hover:opacity-90'
                  }`}
                >
                  <img
                    src={example.heroPhoto}
                    alt={`${example.trade} example`}
                    className={`w-full h-full object-cover transition-all duration-400 ${
                      isActive ? 'blur-none grayscale-0' : 'blur-[3px] grayscale group-hover:blur-[1px] group-hover:grayscale-0'
                    }`}
                  />
                </div>
                <span
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors duration-300"
                  style={{ color: isActive ? example.color : '#64748b' }}
                >
                  {example.trade}
                </span>
              </button>
            );
          })}
        </div>

        {/* Short feature pills — directly under the photos, replacing the
            old bottom badge row. Kept intentionally short, not sentences. */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 px-4">
          {[
            { icon: Send, text: 'Send Invoice in Seconds' },
            { icon: FileSpreadsheet, text: 'Export CSV' },
            { icon: QuickZap, text: 'Get Paid Faster' },
            { icon: ClipboardList, text: 'Create Estimate Templates' },
          ].map((item) => (
            <div
              key={item.text}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-sm px-3 py-1.5"
            >
              <item.icon size={12} strokeWidth={2.5} className="text-[#7BC94F] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wide text-slate-200 whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}