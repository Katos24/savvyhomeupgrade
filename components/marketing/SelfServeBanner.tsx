'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function SelfServeBanner() {
  return (
    <section className="relative bg-white py-20 sm:py-28 overflow-hidden border-b border-slate-100">

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">

          {/* LEFT: The message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
              style={{ fontFamily: font }}
            >
              No demo. No sales call.
            </p>
            <h2
              className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: font }}
            >
              Sign up and start <br />
              <span className="text-emerald-600">in under 2 minutes.</span>
            </h2>
            <p
              className="text-slate-500 font-bold text-base sm:text-lg leading-relaxed max-w-md"
              style={{ fontFamily: font }}
            >
              You don&apos;t need to replace anything you already use. Keep your QuickBooks, keep your payment app. Lead2Project just handles the part you&apos;re missing — catching leads and tracking jobs.
            </p>
          </motion.div>

          {/* RIGHT: CTA card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-2xl p-6 sm:p-8"
          >
            <div className="space-y-3.5 mb-6">
              {[
                'Full access immediately',
                'No credit card on free plan',
                'No waiting for approval',
                'Set up your form and go',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-300" style={{ fontFamily: font }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                style={{ fontFamily: font }}
              >
                Get Started Free
                <ArrowRight size={14} strokeWidth={3} />
              </motion.div>
            </Link>

            <p className="text-[10px] text-slate-500 font-bold text-center mt-3">
              No credit card · Cancel anytime
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}