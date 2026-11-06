'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Users, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eyebrow } from './marketingUI';
import { platformFeeEnabled, PLATFORM_FEE_LABEL } from '@/lib/stripe/platformFee';

// Two plans. "Pro" is the $49.99 plan ('basic' in lib/permissions).
// Keep every line true to what each plan actually unlocks in the app.
const FREE_FEATURES = ['Booking link and QR code', 'Lead dashboard and job board', 'Table and calendar views', 'Add jobs from calls and walk-ins'];

// Shown up front on the Pro card
const PRO_TOP = [
  'Email quotes customers accept online',
  'Deposits and balance invoices',
  'Card payments through Stripe',
  'Scheduling and one-click schedule emails',
  'Expenses and profit per job',
  'Google review requests',
];

// Revealed with "See all Pro features"
const PRO_MORE = [
  'Services with prices and default deposits',
  'Invoice and payment reminder emails',
  'Custom booking form and branding',
  'Email history, custom templates and a morning digest',
  'CSV export, including QuickBooks format',
];

function Feature({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 text-[15px] leading-snug ${dark ? 'text-white/90' : 'text-[#1C1F23]'}`}>
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          dark ? 'bg-[#00828A] text-white' : 'bg-slate-200 text-[#1C1F23]'
        }`}
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
      </span>
      {children}
    </li>
  );
}

export default function Pricing() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-20 bg-slate-50 px-4 py-14 text-[#1C1F23] sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center sm:mb-10">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            One job pays for <span className="text-[#00828A]">the whole year.</span>
          </h2>
          <p className="mt-3 text-base text-[#2a2f35]">Two plans. Cancel anytime. No setup fees.</p>
        </div>

        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* ── Free ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
            className="flex flex-col rounded-[24px] bg-white p-6 ring-1 ring-slate-200 sm:p-7 md:mt-6"
          >
            <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-slate-500">Free</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight">$0</span>
              <span className="text-sm font-semibold text-[#2a2f35]">/mo</span>
            </div>
            <p className="mt-2 text-base text-[#2a2f35]">Take requests and keep track of every job.</p>

            <ul className="mt-5 space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <Feature key={f}>{f}</Feature>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-6 block w-full rounded-xl border border-slate-300 bg-white py-3 text-center font-[family-name:var(--font-display)] text-base font-bold transition-colors hover:bg-slate-50"
            >
              Start free
            </Link>
          </motion.div>

          {/* ── Pro ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: 0.06 }}
            className="relative flex flex-col overflow-hidden rounded-[24px] bg-slate-900 p-6 text-white shadow-[0_30px_70px_-30px_rgba(15,23,42,0.7)] sm:p-7"
          >
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00828A]/35 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#5EC4C9]">Pro</h3>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight">$49.99</span>
                  <span className="text-sm font-semibold text-white/80">/mo</span>
                </div>
              </div>
              <span className="mt-1 shrink-0 rounded-full bg-[#5EC4C9] px-2.5 py-1 font-[family-name:var(--font-display)] text-xs font-bold text-slate-900">
                14-day free trial
              </span>
            </div>

            <p className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-sm font-bold text-[#5EC4C9]">
              <Users className="h-4 w-4" /> Unlimited users. No per-seat fees.
            </p>
            <p className="relative mt-2 text-base text-white/85">Everything in Free, plus everything you need to quote, schedule and get paid.</p>

            <ul className="relative mt-5 grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
              {PRO_TOP.map((f) => (
                <Feature key={f} dark>
                  {f}
                </Feature>
              ))}
            </ul>

            <AnimatePresence initial={false}>
              {showAll && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative grid grid-cols-1 gap-x-5 gap-y-2.5 overflow-hidden pt-2.5 sm:grid-cols-2"
                >
                  {PRO_MORE.map((f) => (
                    <Feature key={f} dark>
                      {f}
                    </Feature>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-expanded={showAll}
              className="relative mt-3 inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#5EC4C9] hover:text-white"
            >
              {showAll ? 'Show less' : `See all Pro features (+${PRO_MORE.length})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>

            <Link
              href="/signup?plan=basic"
              className="group relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00828A] py-3.5 text-center font-[family-name:var(--font-display)] text-base font-bold text-white shadow-lg shadow-[#00828A]/30 transition-all hover:bg-[#00959e]"
            >
              Start 14-day free trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="relative mt-4 text-xs leading-relaxed text-white/75">
              <span className="font-semibold text-white/90">Card payments:</span> Stripe&rsquo;s 2.9% + 30¢
              {platformFeeEnabled() ? ` + Lead2Project ${PLATFORM_FEE_LABEL}` : ''} per payment.{' '}
              <Link href="/pricing#fees" className="underline underline-offset-2 hover:text-white">
                All fees
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}