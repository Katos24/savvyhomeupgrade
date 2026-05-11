'use client';

import { motion } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';

const font = "'Nunito', sans-serif";

const PAIN_POINTS = [
  {
    pain: 'You drove 45 minutes for a job that was never gonna close.',
    painSub: 'No photos. No budget. No details. Just "can you come take a look?"',
    fix: 'See the job site, damage photos, and budget before you start the truck.',
    accent: '#f97316',
  },
  {
    pain: 'Your competitor sent a branded quote in 30 seconds. You\'re still typing yours.',
    painSub: 'Writing emails from scratch while they already closed the deal.',
    fix: 'Pre-built quote templates. Branded emails. One click to send.',
    accent: '#10b981',
  },
  {
    pain: 'A lead came in last Tuesday. You forgot to follow up.',
    painSub: 'It\'s sitting in your texts somewhere between a parts order and your kid\'s soccer schedule.',
    fix: 'Every lead on a board with status, dates, and automatic daily reminders.',
    accent: '#3b82f6',
  },
];

export default function ValueSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-slate-950">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <p
            className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
            style={{ fontFamily: font }}
          >
            Sound familiar?
          </p>
          <h2
            className="text-2xl sm:text-4xl lg:text-5xl text-white leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Time is money.{' '}
            <br className="hidden sm:block" />
            <span className="text-yellow-400">You&apos;re losing both.</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="space-y-4 sm:space-y-5">
          {PAIN_POINTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group"
            >
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.05] transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-stretch">

                  {/* Pain side */}
                  <div className="p-5 sm:p-7 flex gap-3.5 items-start">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${item.accent}15` }}
                    >
                      <X size={14} className="sm:w-4 sm:h-4" style={{ color: item.accent }} strokeWidth={3} />
                    </div>
                    <div>
                      <p
                        className="text-white text-sm sm:text-base leading-snug mb-1.5"
                        style={{ fontFamily: font, fontWeight: 900 }}
                      >
                        {item.pain}
                      </p>
                      <p
                        className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed"
                        style={{ fontFamily: font }}
                      >
                        {item.painSub}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:flex items-center px-1">
                    <div className="w-px h-[60%] bg-white/[0.08]" />
                  </div>
                  <div className="sm:hidden mx-5">
                    <div className="h-px bg-white/[0.06]" />
                  </div>

                  {/* Fix side */}
                  <div className="p-5 sm:p-7 flex gap-3.5 items-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={14} className="text-emerald-400 sm:w-4 sm:h-4" strokeWidth={3} />
                    </div>
                    <p
                      className="text-slate-300 text-sm sm:text-base font-bold leading-snug"
                      style={{ fontFamily: font }}
                    >
                      {item.fix}
                    </p>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom line */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-14 text-center"
        >
          <p
            className="text-slate-500 text-sm sm:text-base font-semibold mb-6"
            style={{ fontFamily: font }}
          >
            Every minute you spend on admin is a minute you&apos;re not on a roof, under a sink, or closing a deal.
          </p>
        </motion.div>
      </div>
    </section>
  );
}