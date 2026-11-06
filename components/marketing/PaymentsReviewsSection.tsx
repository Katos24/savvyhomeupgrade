'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Star, Landmark, CheckCircle2, ArrowRight, CreditCard, Check, Mail } from 'lucide-react';

// Two call-outs side by side: card payments through Stripe, and Google review requests.
// Brand names are shown as plain text on purpose (no third-party logos).

const EASE = [0.22, 1, 0.36, 1] as const;

function Float({ children, className, delay = 0 }: { children: ReactNode; className: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute z-20 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: 0.3 + delay, ease: EASE }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Pill({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold ${
        dark ? 'bg-white/10 text-white ring-1 ring-white/15' : 'bg-white text-[#1C1F23] ring-1 ring-amber-900/10'
      }`}
    >
      {children}
    </li>
  );
}

export default function PaymentsReviewsSection() {
  return (
    <section className="bg-white px-4 py-14 text-slate-900 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Stripe payments: teal panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative flex flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#00828A] via-[#006f76] to-[#0b3d44] p-7 text-white shadow-[0_30px_70px_-30px_rgba(0,90,96,0.7)] sm:p-10"
        >
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#5EC4C9]/30 blur-3xl" />

          <p className="relative font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-[#A6E3E6]">
            Payments by Stripe
          </p>
          <h2 className="relative mt-2 font-[family-name:var(--font-display)] text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            Customers pay by card. The money goes to your bank.
          </h2>
          <p className="relative mt-3 max-w-[46ch] text-base leading-relaxed text-white/90">
            Connect your own Stripe account once. Every deposit and invoice gets a secure pay link, and payouts go straight to
            your bank account.
          </p>

          {/* Mock checkout */}
          <div className="relative mx-auto mt-10 w-full max-w-[320px] pb-6 pt-4">
            <Float className="-left-1 -top-1 sm:-left-8" delay={0}>
              <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-xl">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                Deposit paid
              </span>
            </Float>
            <Float className="-bottom-1 -right-1 sm:-right-8" delay={0.6}>
              <span className="flex items-center gap-1.5 rounded-xl bg-[#1C1F23] px-3 py-2 text-xs font-bold text-white shadow-xl">
                <Landmark className="h-4 w-4 text-[#5EC4C9]" /> Payout to your bank
              </span>
            </Float>

            <div aria-hidden className="relative rotate-[-1.5deg] rounded-2xl bg-white p-5 text-slate-900 shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Summit Roofing</span>
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-600" /> Secure checkout
                </span>
              </div>
              <p className="mt-4 text-[11px] text-slate-500">Deposit for Roof Repair</p>
              <p className="text-3xl font-extrabold tabular-nums">$4,800.00</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <span className="tabular-nums">•••• •••• •••• 4242</span>
                <span className="ml-auto tabular-nums">12/28</span>
              </div>
              <div className="mt-3 rounded-xl bg-[#00828A] py-3 text-center text-sm font-bold text-white">Pay $4,800.00</div>
            </div>
          </div>

          <ul className="relative mt-8 flex flex-wrap gap-2">
            <Pill dark>
              <Lock className="h-3.5 w-3.5 text-[#5EC4C9]" /> Card details handled by Stripe, never stored by us
            </Pill>
            <Pill dark>
              <Landmark className="h-3.5 w-3.5 text-[#5EC4C9]" /> Payouts to your own bank
            </Pill>
            <Pill dark>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#5EC4C9]" /> Balance and receipt update automatically
            </Pill>
          </ul>
          <div className="relative mt-auto pt-6">
            <Link
              href="/features/payments"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#00828A] transition-transform hover:-translate-y-0.5"
            >
              See how payments work <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>

        {/* ── Google reviews: warm panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="relative flex flex-col overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFF4D6] via-[#FFE8B8] to-[#FBD38D] p-7 text-[#1C1F23] shadow-[0_30px_70px_-30px_rgba(180,120,20,0.55)] sm:p-10"
        >
          <div aria-hidden className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full bg-white/50 blur-3xl" />

          <p className="relative font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-amber-800">
            Google reviews
          </p>
          <h2 className="relative mt-2 font-[family-name:var(--font-display)] text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            Ask for the review while the job is fresh.
          </h2>
          <p className="relative mt-3 max-w-[46ch] text-base leading-relaxed text-[#2a2f35]">
            Mark a job complete and your customer gets a thank-you email with a button to your Google review page. More reviews
            help you show up higher when neighbors search for your trade.
          </p>

          {/* Mock email */}
          <div className="relative mx-auto mt-10 w-full max-w-[320px] pb-6 pt-4">
            <Float className="-right-1 -top-1 sm:-right-8" delay={0.3}>
              <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-xl">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400" fill="currentColor" />
                ))}
              </span>
            </Float>
            <Float className="-bottom-1 -left-1 sm:-left-8" delay={0.9}>
              <span className="flex items-center gap-1.5 rounded-xl bg-[#1C1F23] px-3 py-2 text-xs font-bold text-white shadow-xl">
                <CheckCircle2 className="h-4 w-4 text-[#5EC4C9]" /> Sent when the job closed
              </span>
            </Float>

            <div aria-hidden className="relative rotate-[1.5deg] overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl shadow-amber-900/25">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[11px] text-slate-500">
                  From <span className="font-semibold text-slate-700">Summit Roofing</span>
                </p>
              </div>
              <div className="p-5">
                <p className="text-base font-bold">Thanks for choosing us, Maria!</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Your roof repair is all done. If you were happy with the work, a quick Google review would mean a lot.
                </p>
                <div className="mt-4 rounded-xl bg-[#00828A] py-3 text-center text-sm font-bold text-white">Leave a Google review</div>
              </div>
            </div>
          </div>

          <ul className="relative mt-8 flex flex-wrap gap-2">
            <Pill>
              <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" /> Sent when you mark the job complete
            </Pill>
            <Pill>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00828A]" /> You choose per job, so a rough job doesn&rsquo;t get one
            </Pill>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}