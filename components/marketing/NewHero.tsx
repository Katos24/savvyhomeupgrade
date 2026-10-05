'use client';

import { motion } from 'framer-motion';
import {
  CheckCircle2,
  User,
  FileText,
  CalendarDays,
  CreditCard,
  Receipt,
  ListChecks,
  ImageIcon,
  Bell,
  MessageCircle,
  Send,
  Copy,
  Plus,
  Download,
  Check,
  X,
  MoreVertical,
  HardHat,
} from 'lucide-react';
import Link from 'next/link';
// Your demo booking link (e.g. your own Lead2Project booking form).
// Leave empty to hide the "Book a demo" link.
const DEMO_URL = '/book-demo';

// Mock numbers — they add up: 40% of $12,000 = $4,800 deposit, $7,200 balance.
const SIDEBAR = [
  { icon: User, label: 'Overview' },
  { icon: FileText, label: 'Quote' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: CreditCard, label: 'Invoice', active: true },
  { icon: Receipt, label: 'Expenses' },
  { icon: ListChecks, label: 'Tasks' },
  { icon: ImageIcon, label: 'Media' },
  { icon: Bell, label: 'Reminders' },
  { icon: MessageCircle, label: 'Activity' },
];

const STEPS = [
  { label: 'Deposit Sent', date: 'Sep 12', done: true },
  { label: 'Deposit Paid', date: 'Sep 14', done: true },
  { label: 'Balance Sent', date: 'Oct 1', done: true },
  { label: 'Paid in Full', date: '—', done: false },
];

export default function Hero() {
  return (
    <div
      className="bg-[#F4EFE6] text-[#1C1F23] antialiased selection:bg-[#00828A]/20"
      style={{
        // Faint blueprint grid
        backgroundImage:
          'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <section className="relative overflow-hidden pt-24 sm:pt-32 lg:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* ── Copy ── */}
            <div className="lg:col-span-5 space-y-6 text-center sm:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 bg-[#1C1F23] px-2.5 py-1 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em] text-[#5EC4C9]"
              >
                <HardHat className="w-4 h-4" strokeWidth={2.25} />
                Built for contractors
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight text-[#1C1F23]"
              >
                The easiest way to{' '}
                               <span className="relative inline-block whitespace-nowrap">
                  <span className="absolute inset-x-0 bottom-[0.08em] h-[0.3em] bg-[#00828A]/30" aria-hidden />
                  <span className="relative">get paid</span>
                </span>{' '}
                for every job.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="text-base sm:text-lg text-[#3a3f45] leading-relaxed"
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
                  className="w-full sm:w-auto bg-[#00828A] hover:bg-[#006e75] text-white font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider px-7 py-3 rounded-md shadow-sm transition-all text-center"
                >
                  Start free
                </Link>
                {DEMO_URL && (
                  <Link
                    href={DEMO_URL}
                    className="w-full sm:w-auto bg-white text-[#1C1F23] hover:bg-slate-50 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider px-6 py-3 rounded-md border border-slate-300 shadow-sm transition-all text-center"
                  >
                    Book a 15-min demo
                  </Link>
                )}
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 text-sm font-semibold text-[#3a3f45]"
              >
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1C1F23]" /> Free plan
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1C1F23]" /> Card payments through Stripe
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1C1F23]" /> Cash &amp; check tracked too
                </li>
              </motion.ul>
            </div>

            {/* ── Mockup: the real Invoice tab ── */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="relative mx-auto max-w-[680px] rounded-md overflow-hidden bg-white border border-slate-200 shadow-2xl text-[10px] sm:text-[11px]"
                aria-hidden
              >
                {/* Lead header */}
                <div className="bg-[#111827] text-white px-4 sm:px-5 pt-3.5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold truncate">M. Johnson</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-indigo-300">
                          <span className="h-1 w-1 rounded-full bg-indigo-300" /> In Progress
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-400">Roof Repair · #41 · Sep 10</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10">
                        <MoreVertical className="h-3 w-3 text-slate-400" />
                      </span>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10">
                        <X className="h-3 w-3 text-slate-400" />
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 divide-x divide-white/10 border-t border-white/10 pt-2.5">
                    <div className="pr-2">
                      <p className="text-slate-400">Quote</p>
                      <p className="font-semibold">$12,000.00</p>
                      <p className="text-emerald-400">Accepted</p>
                    </div>
                    <div className="px-2">
                      <p className="text-slate-400">Payment</p>
                      <p className="font-semibold">Balance due</p>
                      <p className="text-rose-300">$7,200.00</p>
                    </div>
                    <div className="px-2">
                      <p className="text-slate-400">Scheduled</p>
                      <p className="font-semibold">Oct 1</p>
                      <p className="text-slate-400">8:00 AM</p>
                    </div>
                    <div className="hidden sm:block pl-2">
                      <p className="text-slate-400">Invoice</p>
                      <p className="font-semibold text-sky-300">#INV-041</p>
                      <p className="text-emerald-400">Sent</p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="hidden sm:block w-[118px] shrink-0 border-r border-slate-100 bg-white py-2.5 px-2 space-y-0.5">
                    {SIDEBAR.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={s.label}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                            s.active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                          }`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          {s.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* Invoice content */}
                  <div className="flex-1 min-w-0 bg-slate-50/60 p-3 sm:p-4 space-y-3">
                    {/* Step tracker */}
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {STEPS.map((step) => (
                          <div key={step.label} className="flex flex-col items-center gap-1 min-w-0">
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded-full ${
                                step.done ? 'bg-teal-600 text-white' : 'border border-slate-300 bg-white'
                              }`}
                            >
                              {step.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                            </span>
                            <span className={`truncate w-full ${step.done ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                            <span className="text-[9px] text-slate-400">{step.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress strip */}
                    <div className="px-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-slate-600">
                          <span className="font-semibold text-slate-900">$4,800.00</span> of $12,000.00 collected
                        </p>
                        <span className="font-semibold text-emerald-600 shrink-0">40% paid</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                        <div className="h-full w-[40%] rounded-full bg-emerald-500" />
                      </div>
                    </div>

                    {/* Deposit — paid */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500">1. Deposit (40%)</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">Paid</span>
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-extrabold text-emerald-600">$4,800.00</p>
                      <p className="font-medium text-emerald-700">✓ Paid Sep 14</p>
                    </div>

                    {/* Balance — active */}
                    <div className="rounded-lg border-2 border-teal-600 bg-white px-3 py-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">2. Remaining Balance</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-800">Awaiting</span>
                      </div>
                      <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900">$7,200.00</p>
                      <p className="text-slate-500">
                        Sent Oct 1 · <span className="underline">Due Oct 15</span>
                      </p>
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-teal-600 px-2 py-1 font-semibold text-white">
                          <Send className="h-2.5 w-2.5" /> Resend Invoice
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700">
                          <Copy className="h-2.5 w-2.5" /> Payment Link
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 font-semibold text-white">
                          <Plus className="h-2.5 w-2.5" /> Mark Paid
                        </span>
                        <span className="hidden sm:inline-flex ml-auto items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700">
                          <Download className="h-2.5 w-2.5" /> Balance PDF
                        </span>
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