'use client';

import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const STEPS = [
  { text: 'Someone fills out your contact form.', color: 'text-slate-500' },
  { text: 'It lands in your email.', color: 'text-slate-400' },
  { text: 'It gets buried.', color: 'text-white' },
  { text: 'They hire someone else.', color: 'text-red-500' },
];

export default function ProblemSection() {
  return (
    <section className="relative bg-slate-950 py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8">
        <p
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-red-500 mb-8 sm:mb-10"
          style={{ fontFamily: font }}
        >
          The problem
        </p>
        <div className="space-y-5 sm:space-y-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="flex items-center gap-4 sm:gap-5"
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 ${
                  i === STEPS.length - 1
                    ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                {i + 1}
              </div>
              <p
                className={`text-xl sm:text-2xl lg:text-3xl font-black leading-tight ${step.color}`}
                style={{ fontFamily: font }}
              >
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}