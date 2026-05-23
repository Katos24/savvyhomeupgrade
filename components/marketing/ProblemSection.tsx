'use client';

import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const STEPS = [
  { num: '1', text: 'Someone fills out your contact form.' },
  { num: '2', text: 'It lands in your email.' },
  { num: '3', text: 'It gets buried.' },
  { num: '4', text: 'They hire someone else.', isFinal: true },
];

export default function ProblemSection() {
  return (
    <section className="relative bg-slate-950 pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* Bottom Ambient Glow to bleed into the next section */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-40 bg-gradient-to-t from-emerald-500/[0.03] to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
        <p
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-red-500 mb-8 sm:mb-12 text-center sm:text-left"
          style={{ fontFamily: font }}
        >
          The problem
        </p>

        <div className="max-w-3xl mx-auto sm:mx-0 space-y-6 sm:space-y-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.215, 0.610, 0.355, 1.000] }}
              className="flex items-start sm:items-center gap-4 sm:gap-6 group"
            >
              <div
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs sm:text-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
                  step.isFinal
                    ? 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : 'bg-white/[0.03] text-slate-500 border border-white/5'
                }`}
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                {step.num}
              </div>
              <p
                className={`text-xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight pt-1 sm:pt-0 ${
                  step.isFinal ? 'text-red-500' : i === 2 ? 'text-slate-200' : 'text-slate-500'
                }`}
                style={{ fontFamily: font }}
              >
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Lead2Project callout — styled as an elegant transition banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 sm:mt-24 pt-10 border-t border-white/[0.04] text-center"
        >
          <p
            className="text-emerald-400 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight"
            style={{ fontFamily: font }}
          >
            Lead2Project makes sure that doesn't happen.
          </p>
        </motion.div>
      </div>
    </section>
  );
}