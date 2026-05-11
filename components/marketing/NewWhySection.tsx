'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

const font = "'Nunito', sans-serif";

export default function NewWhySection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-slate-50 py-14 sm:py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="inline-flex items-center gap-3 mb-5 self-start">
              <div
                className="w-11 h-11 bg-yellow-400 rounded-xl flex items-center justify-center text-white border-3 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                style={{ borderWidth: '3px' }}
              >
                <Zap size={24} />
              </div>
              <span
                className="text-sm text-slate-600 uppercase tracking-wider"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Lead Capture
              </span>
            </div>

            <h3
              className="text-3xl sm:text-4xl text-slate-900 mb-5 leading-tight"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Your Truck Is Now a Lead Machine
            </h3>

            <p
              className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8"
              style={{ fontFamily: font, fontWeight: 700 }}
            >
              Most yard signs get eyeballs but not calls. Lead2Project turns every truck and sign into a digital intake form that works while you're on the roof.
            </p>

            <div className="space-y-3 mb-8">
              {['Custom branded QR decals', 'Direct-to-board photo uploads', 'Real-time board updates'].map((bullet, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border-2 border-emerald-400">
                    <ArrowRight size={14} className="text-white" strokeWidth={3} />
                  </div>
                  <span
                    className="text-base sm:text-lg text-slate-800"
                    style={{ fontFamily: font, fontWeight: 800 }}
                  >
                    {bullet}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-3 bg-emerald-500 text-white px-8 py-4 rounded-2xl text-lg group self-start border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                <span>Get Started Today</span>
                <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
              </motion.div>
            </Link>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden border-4 border-slate-900 rounded-2xl sm:rounded-3xl aspect-[4/3] bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
              <img
                src="/images/qrbranded2.webp"
                alt="QR code decals on a work truck"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}