'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  AlertCircle,
  DollarSign,
  ExternalLink,
  Mail,
} from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 bg-slate-900">
      {/* subtle background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* LEFT — CLEAN EMAIL */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="max-w-xl mx-auto"
            >

              {/* EMAIL CARD */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">

                {/* HEADER (BRAND ONLY) */}
                <div className="px-6 py-5 bg-slate-900 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                    <Image
                      src="/images/rapid-flow-logo.webp"
                      alt="Rapid Flow"
                      width={34}
                      height={34}
                    />
                  </div>

                  <div>
                    <p
                      className="text-white text-sm"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      Rapid Flow Plumbing
                    </p>
                    <p
                      className="text-slate-400 text-[11px] uppercase tracking-[0.2em]"
                      style={{ fontFamily: font, fontWeight: 800 }}
                    >
                      Daily Digest · 6:00 AM
                    </p>
                  </div>
                </div>

                {/* BODY */}
                <div className="p-6 sm:p-7 space-y-6">

                  {/* TITLE */}
                  <div>
                    <h3
                      className="text-xl sm:text-2xl text-slate-900 leading-tight"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      Good morning — here’s your day
                    </h3>

                    <p
                      className="text-sm text-slate-500 mt-2"
                      style={{ fontFamily: font, fontWeight: 700 }}
                    >
                      9 items need attention
                    </p>
                  </div>

                  {/* METRICS */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Leads', value: '5' },
                      { label: 'Scheduled', value: '4' },
                      { label: 'Pending', value: '3' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center"
                      >
                        <p
                          className="text-lg text-slate-900"
                          style={{ fontFamily: font, fontWeight: 900 }}
                        >
                          {item.value}
                        </p>
                        <p
                          className="text-[9px] uppercase tracking-widest text-slate-500"
                          style={{ fontFamily: font, fontWeight: 800 }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* REVENUE */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-4 flex justify-between items-center">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-widest text-emerald-800"
                        style={{ fontFamily: font, fontWeight: 800 }}
                      >
                        Active Revenue
                      </p>
                      <p
                        className="text-xs text-emerald-600"
                        style={{ fontFamily: font, fontWeight: 700 }}
                      >
                        Open jobs & invoices
                      </p>
                    </div>

                    <p
                      className="text-xl text-emerald-600"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      $18,720
                    </p>
                  </div>

                  {/* ALERTS */}
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                      <p
                        className="text-sm text-red-900"
                        style={{ fontFamily: font, fontWeight: 800 }}
                      >
                        Kevin White — quote sent 3 days ago, no response
                      </p>
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                      <p
                        className="text-sm text-sky-900"
                        style={{ fontFamily: font, fontWeight: 800 }}
                      >
                        Sarah Johnson — scheduled today at 10:00 AM
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full py-4 rounded-2xl bg-sky-600 text-white flex items-center justify-center gap-2"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    Open Dashboard
                    <ExternalLink size={14} />
                  </button>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                  <p
                    className="text-[11px] text-slate-400"
                    style={{ fontFamily: font, fontWeight: 700 }}
                  >
                    Daily Digest · Rapid Flow Plumbing
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COPY */}
          <div className="text-center lg:text-left">
            <h3
              className="text-4xl sm:text-5xl text-white leading-tight mb-6"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Your Business,
              <br />
              <span className="text-sky-400">Delivered Every Morning</span>
            </h3>

            <p
              className="text-slate-400 text-lg mb-8"
              style={{ fontFamily: font, fontWeight: 700 }}
            >
       Every morning at 6:00 AM, Lead2Project sends a branded operational digest showing jobs, stale quotes, overdue invoices, and daily priorities—customized to your company.

            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                'New Leads',
                'Schedule',
                'Revenue',
                'Follow-ups',
              ].map((t) => (
                <div
                  key={t}
                  className="px-4 py-2 rounded-full bg-slate-800 text-slate-200 text-sm"
                  style={{ fontFamily: font, fontWeight: 800 }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}