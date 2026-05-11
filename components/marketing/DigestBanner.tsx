'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-slate-900">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ──── LEFT: EMAIL MOCKUP ──── */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto lg:max-w-none">

              {/* Email card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/10">

                {/* ── Email header (matches your real email) ── */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-950 px-5 sm:px-7 py-5 sm:py-6">
                  <p
                    className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.15em] font-bold mb-1"
                    style={{ fontFamily: font }}
                  >
                    Monday, May 12, 2026
                  </p>
                  <h3
                    className="text-base sm:text-lg text-white leading-snug mb-1"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    Good morning — here&apos;s your day
                  </h3>
                  <p
                    className="text-[11px] sm:text-xs text-slate-500 font-semibold"
                    style={{ fontFamily: font }}
                  >
                    Rapid Flow Plumbing · 9 items need attention
                  </p>
                </div>

                {/* ── Email body ── */}
                <div className="px-5 sm:px-7 py-5 sm:py-6 space-y-4 sm:space-y-5">

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { label: 'Leads', value: '5', color: 'text-blue-600' },
                      { label: 'Scheduled', value: '4', color: 'text-slate-900' },
                      { label: 'Pending', value: '3', color: 'text-amber-600' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center"
                      >
                        <p
                          className={`text-lg sm:text-xl ${item.color}`}
                          style={{ fontFamily: font, fontWeight: 900 }}
                        >
                          {item.value}
                        </p>
                        <p
                          className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-slate-400"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Revenue card */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 sm:py-4 flex justify-between items-center">
                    <div>
                      <p
                        className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-emerald-800"
                        style={{ fontFamily: font, fontWeight: 800 }}
                      >
                        Active Revenue
                      </p>
                      <p
                        className="text-[10px] sm:text-xs text-emerald-600 font-semibold"
                        style={{ fontFamily: font }}
                      >
                        Open jobs & invoices
                      </p>
                    </div>
                    <p
                      className="text-lg sm:text-xl text-emerald-600"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      $18,720
                    </p>
                  </div>

                  {/* Alert rows (matching real email sections) */}
                  <div className="space-y-2 sm:space-y-2.5">

                    {/* Overdue */}
                    <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="text-xs sm:text-sm text-red-900"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          Kevin White — quote sent 3 days ago
                        </p>
                        <p
                          className="text-[10px] text-red-500 font-semibold"
                          style={{ fontFamily: font }}
                        >
                          No response · $4,200
                        </p>
                      </div>
                    </div>

                    {/* Today */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="text-xs sm:text-sm text-blue-900"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          Sarah Johnson — scheduled today
                        </p>
                        <p
                          className="text-[10px] text-blue-500 font-semibold"
                          style={{ fontFamily: font }}
                        >
                          10:00 AM · Leak repair
                        </p>
                      </div>
                    </div>

                    {/* Payment due */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="text-xs sm:text-sm text-amber-900"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          Marcus Thompson — payment due tomorrow
                        </p>
                        <p
                          className="text-[10px] text-amber-600 font-semibold"
                          style={{ fontFamily: font }}
                        >
                          $7,950 outstanding
                        </p>
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p
                          className="text-xs sm:text-sm text-violet-900"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          Lisa Chen — follow-up reminder
                        </p>
                        <p
                          className="text-[10px] text-violet-500 font-semibold"
                          style={{ fontFamily: font }}
                        >
                          Call back about water heater quote
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-7 py-3 sm:py-4 bg-slate-50 border-t border-slate-100 text-center">
                  <p
                    className="text-[10px] text-slate-400"
                    style={{ fontFamily: font, fontWeight: 700 }}
                  >
                    Daily Digest · Rapid Flow Plumbing
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ──── RIGHT: COPY ──── */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Kicker */}
            <p
              className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
              style={{ fontFamily: font }}
            >
              Pro plan feature
            </p>

            <h3
              className="text-2xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5 sm:mb-6"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Your business,{' '}
              <br className="hidden sm:block" />
              <span className="text-sky-400">delivered at 6 AM.</span>
            </h3>

            <p
              className="text-sm sm:text-base text-white leading-relaxed mb-8 sm:mb-10 max-w-lg font-semibold"
              style={{ fontFamily: font }}
            >
              Every morning before you start the truck, a branded digest
              lands in your inbox — today&apos;s jobs, stale quotes, overdue
              payments, follow-up reminders, and revenue totals. Everything
              you need to know, nothing you don&apos;t.
            </p>

            {/* What's included */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8 sm:mb-10">
              {[
                "Today's jobs",
                'Stale quotes',
                'Overdue payments',
                'Follow-up reminders',
                'Revenue totals',
                'New leads',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                  <span
                    className="text-[11px] sm:text-xs text-slate-300 font-bold"
                    style={{ fontFamily: font }}
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-3 bg-sky-500 hover:bg-sky-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-xs sm:text-sm uppercase tracking-wide transition-colors cursor-pointer shadow-lg shadow-sky-500/20"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Try Pro Free for 14 Days
                <ArrowRight size={16} strokeWidth={3} />
              </motion.div>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}