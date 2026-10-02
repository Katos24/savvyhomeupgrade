'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FileText, Calendar, Send, Star, Briefcase, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

// Your demo booking link (e.g. your own Lead2Project booking form).
// Leave empty to hide the "Book a demo" link.
const DEMO_URL = '';

export default function Hero() {
  return (
    <div
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-[#F4F7F6] text-slate-900 antialiased selection:bg-[#00828A]/20 selection:text-[#00828A]`}
    >
      <section className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[520px] bg-gradient-to-b from-teal-100/50 via-emerald-50/20 to-transparent blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* ── Copy ── */}
            <div className="lg:col-span-5 space-y-6 text-center sm:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700"
              >
                <span className="w-2 h-2 rounded-full bg-[#00828A]" />
                Built for contractors
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold leading-[1.1] tracking-tight text-slate-900"
              >
                The easiest way to get paid for every job.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-base sm:text-lg text-slate-600 leading-relaxed"
              >
                Set up your services once, with prices and deposits. Every quote asks for the deposit up front,
                and the final invoice collects the balance when the job&rsquo;s done.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2"
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto bg-[#00828A] hover:bg-[#006e75] text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-md shadow-[#00828A]/20 transition-colors text-center"
                >
                  Start free
                </Link>
                {DEMO_URL && (
                  <Link
                    href={DEMO_URL}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
                  >
                    Book a 15-min demo
                  </Link>
                )}
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500"
              >
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00828A]" /> Free plan
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00828A]" /> Card payments through Stripe
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00828A]" /> Cash &amp; check tracked too
                </li>
              </motion.ul>
            </div>

            {/* ── Mockup ── */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative mx-auto max-w-[660px] bg-slate-900 p-2 sm:p-3.5 rounded-[20px] sm:rounded-[24px] shadow-2xl border border-slate-800/80"
              >
                <div className="bg-[#0B1520] rounded-[14px] sm:rounded-[16px] overflow-hidden border border-slate-800 text-slate-800 shadow-inner">
                  {/* App header */}
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
                  </div>

                  <div className="grid grid-cols-12 bg-slate-50 min-h-[320px] sm:min-h-[360px] text-xs">
                    {/* Sidebar */}
                    <div className="hidden md:block col-span-3 bg-[#0F1E2E] border-r border-slate-800/60 p-3 space-y-1 text-slate-400 font-medium">
                      <div className="bg-[#00828A]/20 text-[#00828A] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Invoice
                      </div>
                      <div className="px-2.5 py-1.5 flex items-center gap-2">
                        <Send className="w-3.5 h-3.5" /> Quote
                      </div>
                      <div className="px-2.5 py-1.5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Schedule
                      </div>
                      <div className="px-2.5 py-1.5 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> Reviews
                      </div>
                    </div>

                    {/* Invoice view */}
                    <div className="col-span-12 md:col-span-9 p-3.5 sm:p-5 bg-white space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="text-sm sm:text-base font-bold text-slate-900">Roof Repair</div>
                          <div className="text-slate-400 text-[10px] sm:text-[11px]">M. Johnson · Holbrook</div>
                        </div>
                        <div className="text-emerald-600 font-semibold text-[10px] sm:text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Deposit received
                        </div>
                      </div>

                      {/* Set-once callout — ties the mockup to the headline */}
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[10px] sm:text-[11px] text-slate-600">
                        <Settings2 className="w-3.5 h-3.5 text-[#00828A] shrink-0" />
                        Deposit of 40% set by your <span className="font-semibold text-slate-800">Roofing</span> service
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-emerald-800">
                            <span className="font-semibold text-[10.5px] sm:text-[11px]">1. Deposit (40%)</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div className="text-base sm:text-lg font-bold text-emerald-600">$4,800.00</div>
                          <div className="text-[9.5px] sm:text-[10px] text-emerald-700">✓ Paid by card · Sep 14</div>
                        </div>

                        <div className="p-3 bg-white border-2 border-[#00828A] rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-semibold text-[10.5px] sm:text-[11px]">2. Balance</span>
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div className="text-base sm:text-lg font-bold text-slate-900">$7,200.00</div>
                          <div className="w-full bg-[#00828A] text-white text-[10px] sm:text-[10.5px] font-semibold py-1.5 rounded-md text-center">
                            Send final invoice
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Line items
                        </div>
                        <div className="space-y-1 text-[11px] sm:text-[11.5px]">
                          <div className="flex justify-between text-slate-700">
                            <span>Tear-off &amp; materials</span>
                            <span className="font-semibold text-slate-900">$7,400.00</span>
                          </div>
                          <div className="flex justify-between text-slate-700">
                            <span>Labor &amp; installation</span>
                            <span className="font-semibold text-slate-900">$4,600.00</span>
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
    </div>
  );
}