'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  FileText,
  CreditCard,
  Calendar,
  BookOpen,
  Sparkles,
  Star,
  Check,
  Building2,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const FEATURES = [
  {
    icon: DollarSign,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Upfront deposits',
    desc: 'Set a deposit percentage on any estimate. The payment link goes out the moment the client signs.',
  },
  {
    icon: Send,
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    title: 'Balances, chased for you',
    desc: 'Remaining balances go out on schedule with automatic reminders until the job is paid in full.',
  },
  {
    icon: FileText,
    color: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    title: 'Emailed PDF invoices',
    desc: 'Every invoice and estimate emails as a clean PDF, with a full outbox history of what was sent and when.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    title: 'Secure Stripe payments',
    desc: 'Card and bank payments run through Stripe, so client details stay protected and payouts land fast.',
  },
  {
    icon: Calendar,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'Scheduling',
    desc: 'Book crews, set job dates, and keep the calendar tied to the same job the money lives on.',
  },
  {
    icon: BookOpen,
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    title: 'Price book & templates',
    desc: 'Build estimates from saved line items and reusable templates instead of typing them out again.',
  },
  {
    icon: Sparkles,
    color: 'bg-teal-50 text-teal-700 border-teal-100',
    title: 'Custom branding',
    desc: 'Your logo, colors, and business details on every estimate, invoice, and client email.',
  },
  {
    icon: Star,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    title: 'Google reviews',
    desc: 'Ask for a Google review automatically once a job is paid, while the work is still fresh.',
  },
];

export default function Hero() {
  return (
    <div
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-[#F4F7F6] text-slate-900 antialiased selection:bg-[#00828A]/20 selection:text-[#00828A]`}
    >
      {/* ── 1. HERO SECTION (Adjusted top padding for fixed/sticky Navbar) ── */}
      <section className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-teal-100/50 via-emerald-50/20 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Copy */}
            <div className="lg:col-span-5 space-y-6 text-center sm:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700"
              >
                <span className="w-2 h-2 rounded-full bg-[#00828A]" />
                Built for contractors & field teams
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight text-slate-900"
              >
                Take the deposit before you pull a single stud.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
              >
                Lead2Project sends estimates, collects upfront deposits through Stripe, and chases project balances with emailed PDF invoices &mdash; so the money lands while the crew is still on site.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 pt-2"
              >
                <Link href="/signup" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[#00828A] hover:bg-[#006e75] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-[#00828A]/20 transition-all duration-200 flex items-center justify-center gap-2">
                    Start free
                  </button>
                </Link>
                <span className="text-xs text-slate-500 font-medium">
                  No card required. Setup in 4 minutes.
                </span>
              </motion.div>
            </div>

            {/* Right Column: Mobile & Desktop Responsive Mockup */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative mx-auto max-w-[660px] bg-slate-900 p-2 sm:p-3.5 rounded-[20px] sm:rounded-[24px] shadow-2xl border border-slate-800/80"
              >
                {/* Screen Outer */}
                <div className="bg-[#0B1520] rounded-[14px] sm:rounded-[16px] overflow-hidden border border-slate-800 text-slate-800 shadow-inner">
                  {/* App Header */}
                  <div className="bg-[#0F1E2E] border-b border-slate-800 px-3 sm:px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5 ml-1 text-[11px] sm:text-xs">
                        <Briefcase className="w-3.5 h-3.5 text-[#00828A]" /> Lead2Project
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#00828A] text-white font-semibold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md">
                        Send Invoice
                      </span>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="grid grid-cols-12 bg-slate-50 min-h-[320px] sm:min-h-[360px] text-xs">
                    {/* App Sidebar (Hidden on small mobile screens for clean layout) */}
                    <div className="hidden md:block col-span-3 bg-[#0F1E2E] border-r border-slate-800/60 p-3 space-y-3 text-slate-400 font-medium">
                      <div className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">
                        Workspace
                      </div>
                      <div className="space-y-1">
                        <div className="bg-[#00828A]/20 text-[#00828A] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5" /> Invoices
                        </div>
                        <div className="px-2.5 py-1.5 hover:text-slate-200 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" /> Schedule
                        </div>
                        <div className="px-2.5 py-1.5 hover:text-slate-200 flex items-center gap-2">
                          <Send className="w-3.5 h-3.5" /> Estimates
                        </div>
                        <div className="px-2.5 py-1.5 hover:text-slate-200 flex items-center gap-2">
                          <Star className="w-3.5 h-3.5" /> Reviews
                        </div>
                      </div>
                    </div>

                    {/* Main Invoice View */}
                    <div className="col-span-12 md:col-span-9 p-3.5 sm:p-5 bg-white space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">
                            Invoice
                          </div>
                          <div className="text-slate-400 font-mono text-[10px] sm:text-[11px]">
                            L2P-2026-1041
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-slate-500 text-[10px] sm:text-[11px]">
                            Job: Roof & Framing
                          </div>
                          <div className="text-emerald-600 font-semibold text-[10px] sm:text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Deposit Received
                          </div>
                        </div>
                      </div>

                      {/* Payment Schedule Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-0.5">
                        <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-teal-800">
                            <span className="font-semibold text-[10.5px] sm:text-[11px]">
                              Upfront Deposit (40%)
                            </span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          </div>
                          <div className="text-base sm:text-lg font-bold text-slate-900">
                            $12,500.00
                          </div>
                          <div className="text-[9.5px] sm:text-[10px] text-teal-700/80">
                            Paid via Stripe &middot; Sept 14
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 text-white rounded-xl space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="font-semibold text-[10.5px] sm:text-[11px]">
                              Balance Due
                            </span>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                          </div>
                          <div className="text-base sm:text-lg font-bold text-white">
                            $17,850.00
                          </div>
                          <button className="w-full bg-[#00828A] hover:bg-[#006e75] text-white text-[10px] sm:text-[10.5px] font-semibold py-1.5 rounded-md transition-colors">
                            Send Final Invoice
                          </button>
                        </div>
                      </div>

                      {/* Invoice Item Breakdown */}
                      <div className="space-y-1.5 sm:space-y-2 border-t border-slate-100 pt-2.5 sm:pt-3">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Line Items
                        </div>
                        <div className="space-y-1 text-[11px] sm:text-[11.5px]">
                          <div className="flex justify-between text-slate-700">
                            <span>Teardown & Materials</span>
                            <span className="font-semibold text-slate-900">
                              $18,400.00
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Framing & Labor</span>
                            <span className="font-semibold text-slate-900">
                              $11,950.00
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DARK STATS / COLLECTIONS SECTION ── */}
      <section className="bg-[#081524] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-3 text-center sm:text-left">
              <div className="text-xs font-bold text-[#00828A] tracking-widest uppercase">
                Collections
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Chasing balances is the slow part of getting paid.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Set the deposit and payment schedule once on the estimate. Lead2Project sends each payment link and reminder itself &mdash; no more manual reminder texts.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0E2033] border border-slate-800 rounded-2xl p-6 space-y-2 shadow-sm text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  25%
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Typical deposit collected before a single material is ordered.
                </p>
              </div>

              <div className="bg-[#0E2033] border border-slate-800 rounded-2xl p-6 space-y-2 shadow-sm text-center sm:text-left">
                <div className="text-3xl sm:text-4xl font-extrabold text-white">
                  6.2 days
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Average time from final invoice sent to balance paid in full.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURE GRID ── */}
      <section className="py-16 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F8FAF9]">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-12">
          <div className="space-y-2 max-w-2xl text-center sm:text-left">
            <div className="text-xs font-bold text-[#00828A] tracking-widest uppercase">
              Everything on one job
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Quote, schedule, invoice, collect, and get the review.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat) => {
              const IconComponent = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${feat.color}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}