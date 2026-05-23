'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function SelfServeBanner() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden border-b border-slate-100">

      {/* Subtle background accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-slate-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8">

        {/* "Works alongside" banner — top */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 sm:mb-24 flex flex-col sm:flex-row items-center gap-8 p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/60 shadow-sm"
        >
          <div className="w-full sm:w-[160px] h-[110px] flex-shrink-0 rounded-xl overflow-hidden relative">
            <Image
              src="/images/get-paid.webp"
              alt="Contractor with happy customer"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p
              className="text-slate-900 text-lg font-black tracking-tight leading-snug mb-2"
              style={{ fontFamily: font }}
            >
              Keep your current payment system. Keep your accounting software.
            </p>
            <p
              className="text-slate-500 text-sm font-semibold leading-relaxed"
              style={{ fontFamily: font }}
            >
              Lead2Project organizes the front end of your business so nothing falls
              through the cracks. It works alongside what you already use — not instead of it.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
              <Check size={12} strokeWidth={3} />
              No tools to replace
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-20">

          {/* LEFT — Context */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-slate-100 rounded-md border border-slate-200">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700" style={{ fontFamily: font }}>
                  No demos. Pure build.
                </span>
              </div>

              <h2
                className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: font }}
              >
                Lead2Project is ready <br />
                when you are.
              </h2>

              <p
                className="text-slate-500 font-semibold text-base sm:text-lg leading-relaxed mb-8 max-w-lg"
                style={{ fontFamily: font }}
              >
                Skip the sales cycles and endless pitches. Experience a platform designed to let you configure your dashboard, <span className="text-slate-900 font-black">not wait on sales reps.</span>
              </p>

              {/* The "Other Guy" List */}
              <div className="space-y-4 border-t border-slate-100 pt-6 max-w-md">
                {[
                  { text: 'Book a sales demo', detail: 'Wait days for an available discovery calendar call' },
                  { text: 'Complex annual commitments', detail: 'Locked agreements required before configuration' },
                  { text: 'Hidden variable pricing tiers', detail: "Opaque 'Contact Us' models built to inflate bills" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <X className="text-rose-500 shrink-0 mt-0.5" size={14} strokeWidth={3} />
                    <div>
                      <p className="text-xs font-black text-slate-900" style={{ fontFamily: font }}>
                        {item.text}
                      </p>
                      <p className="text-[11px] text-slate-400 font-bold mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:w-[380px] shrink-0"
          >
            <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col justify-between">

              <div className="mb-8 border-b border-slate-200/60 pb-6 text-center">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1" style={{ fontFamily: font }}>
                  The Build First Model
                </h4>
                <p className="text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: font }}>
                  Lead2Project
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Instant Workspace Creation',
                  'Free Access Tier Available',
                  'Month-to-Month Flexibility',
                  'No Credit Card required',
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Check className="text-emerald-600" size={12} strokeWidth={3} />
                    </div>
                    <span className="text-slate-700 text-xs sm:text-sm font-bold" style={{ fontFamily: font }}>
                      {t}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-emerald-600 text-white py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer group shadow-md"
                  style={{ fontFamily: font }}
                >
                  Start Building Free
                  <ArrowRight size={14} strokeWidth={3} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </motion.div>
              </Link>

              {/* Trust Indicators */}
              <div className="mt-6 pt-5 border-t border-slate-200/60 flex items-center justify-center gap-6 text-slate-400">
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <Clock size={12} strokeWidth={2.5} /> Live in 2 minutes
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <Shield size={12} strokeWidth={2.5} /> Secure Access
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}