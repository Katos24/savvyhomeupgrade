'use client';

import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

export default function BuildFormSection() {
  return (
    <section className="relative py-14 sm:py-18 bg-white overflow-hidden">

      {/* ultra subtle background */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* small kicker (not a big section headline anymore) */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] uppercase tracking-[0.3em] text-slate-400 font-black mb-4"
          style={{ fontFamily: font }}
        >
          Setup in minutes
        </motion.p>

        {/* refined headline */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-4xl font-black text-slate-950 leading-tight"
          style={{ fontFamily: font }}
        >
          Build your form instantly
        </motion.h2>



      </div>
    </section>
  );
}