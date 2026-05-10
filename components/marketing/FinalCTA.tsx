'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

export default function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-6 text-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl opacity-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl text-white mb-5 leading-tight"
          style={{ fontFamily: font, fontWeight: 900 }}
        >
          Stop Bleeding Leads.
          <br />
          <span className="text-yellow-400">One Win Pays for the Year.</span>
        </h2>

        <p
          className="text-white text-base sm:text-lg mb-10 leading-relaxed max-w-lg mx-auto"
          style={{ fontFamily: font, fontWeight: 700 }}
        >
          Your competitor down the street is still texting quotes from his personal number. You don't have to be.
        </p>

        <Link href="/signup">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-yellow-400 text-slate-900 px-10 py-5 rounded-2xl text-lg group border-4 border-slate-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Start Free Trial
            <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
          </motion.div>
        </Link>

        <p
          className="mt-6 text-sm text-white/60 uppercase tracking-wider"
          style={{ fontFamily: font, fontWeight: 800 }}
        >
          14-day free trial · Cancel anytime · 2 min setup
        </p>
      </motion.div>
    </section>
  );
}