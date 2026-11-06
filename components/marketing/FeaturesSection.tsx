'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Settings2, Send, CreditCard, QrCode, FileText, Receipt, CalendarDays, Columns3, Star, Mail, Check, FileSpreadsheet,
} from 'lucide-react';
import { Eyebrow } from './marketingUI';

// Every claim here matches what the app does today — keep it that way.
const STEPS = [
  {
    icon: Settings2,
    title: 'Set up your services once',
    desc: 'Add each service with its price template and deposit, a percent or a flat amount.',
  },
  {
    icon: Send,
    title: 'Send the quote',
    desc: 'Load the template in one tap. Your customer accepts online, and the deposit is already on it.',
  },
  {
    icon: CreditCard,
    title: 'Get paid, start to finish',
    desc: 'Collect the deposit by card, then send the final invoice for the balance when the job is done.',
  },
];

const FEATURES = [
  { icon: QrCode, title: 'Booking link & QR code', desc: 'Requests land in your dashboard, ready to quote.' },
  { icon: FileText, title: 'Quotes from templates', desc: 'Saved line items per service. No retyping.' },
  { icon: CreditCard, title: 'Card payments through Stripe', desc: 'Deposits and balances, paid online.' },
  { icon: Receipt, title: 'Cash & check tracked too', desc: 'Record any payment and the balance updates.' },
  { icon: Mail, title: 'Receipts sent for you', desc: 'A receipt for every payment, plus the final invoice PDF when paid in full.' },
  { icon: CalendarDays, title: 'Calendar', desc: 'Schedule jobs and move them with a tap.' },
  { icon: Columns3, title: 'Job board', desc: 'See every job by stage and drag it forward.' },
  { icon: Star, title: 'Review requests', desc: 'Ask for a Google review when you mark a job complete.' },
];

export default function FeaturesSection() {
  return (
    <div className="text-[#1C1F23] antialiased">
      {/* ── How it works: three work-order tickets ── */}
      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        {/* Background photo, darkened so the text stays readable */}
        <Image
          src="/images/morning-brief.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[#1C1F23]/90 sm:bg-transparent sm:bg-gradient-to-r sm:from-[#1C1F23]/95 sm:via-[#1C1F23]/85 sm:to-[#1C1F23]/70"
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow dark>How it works</Eyebrow>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95] text-white">
              Set it up once. Every job follows the same rules.
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm"
                >
                  {/* Ticket stub */}
                  <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2 text-white">
                    <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em]">
                      Work order
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-xl font-extrabold text-[#5EC4C9]">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Perforation */}
                  <div className="border-b border-dashed border-slate-300" />
                  <div className="p-5 sm:p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                      <Icon className="w-5 h-5" strokeWidth={2.25} />
                    </span>
                    <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold uppercase leading-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{step.desc}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
          <div className="text-center sm:text-left">
            <Link
            href="/features/quoting"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5EC4C9] hover:underline underline-offset-4"
          >
            See how quoting works <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
// Import claims match the real importer (Settings → Import): CSV upload, automatic column matching,
// duplicates skipped by email/phone, no emails sent, one-click undo.
const IMPORT_POINTS = [
  'Upload any spreadsheet saved as CSV',
  'We match the columns for you',
  'Duplicates skipped, nobody gets emailed',
  'Undo the whole import in one click',
];

const IMPORT_SAMPLE = [
  { name: 'Maria Lopez', service: 'Roof repair', type: 'Past customer' },
  { name: 'Dan Kowalski', service: 'Gutters', type: 'New lead' },
  { name: 'Priya Shah', service: 'Siding', type: 'New lead' },
];

// Rendered further down the home page as the recap before pricing.
// Replaces the separate "What you get" and "Bring your customers with you" (ImportSection) sections.
export function WhatYouGetSection() {
  return (
    <section className="bg-white px-4 py-14 text-[#1C1F23] antialiased sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
            Everything from first call to <span className="text-[#00828A]">paid in full.</span>
          </h2>
        </div>

        {/* Feature tiles */}
        <ul className="mt-10 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                className="group rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:ring-[#00828A]/30 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00828A]/10 text-[#00828A] transition-colors group-hover:bg-[#00828A] group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-tight">{f.title}</h3>
                <p className="mt-1 text-sm leading-snug text-[#3a3f45]">{f.desc}</p>
              </motion.li>
            );
          })}
        </ul>

        {/* Switching: bring your customers with you */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="relative mt-6 overflow-hidden rounded-[28px] bg-slate-900 p-6 text-white sm:mt-8 sm:p-10"
        >
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#00828A]/30 blur-[100px]" />

          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div className="text-center lg:text-left">
              <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-[#5EC4C9]">
                Switching is easy
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-[28px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl">
                Bring your customers with you.
              </h3>
              <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-white/70 lg:mx-0">
                Already have a list of leads and past customers? Upload it and your history is ready from day one. No
                retyping, no starting from scratch.
              </p>

              <ul className="mx-auto mt-5 grid max-w-lg grid-cols-1 gap-2 text-left sm:grid-cols-2 lg:mx-0">
                {IMPORT_POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm font-semibold text-white">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00828A]">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row lg:items-center">
                <Link
                  href="/signup"
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#00828A] px-7 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00828A]/30 transition hover:bg-[#00959e] sm:w-auto"
                >
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-xs leading-snug text-white/50 sm:max-w-[30ch] sm:text-left">
                  Import leads on any plan. Past customers and active jobs import as jobs on Pro.
                </p>
              </div>
            </div>

            {/* Visual: spreadsheet → jobs */}
            <div className="mx-auto w-full max-w-sm" aria-hidden>
              <div className="overflow-hidden rounded-2xl bg-white text-[#1C1F23] shadow-2xl shadow-black/40">
                <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
                  <FileSpreadsheet className="h-5 w-5 text-[#00828A]" />
                  <span className="text-sm font-bold">customers.csv</span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">3 rows</span>
                </div>
                <div className="flex flex-wrap gap-1.5 px-4 py-3 text-[11px] font-semibold">
                  {['Name → Name', 'Phone → Phone', 'Email → Email', 'Job → Service'].map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 rounded-md bg-[#00828A]/10 px-2 py-1 text-[#006e75]">
                      <Check className="h-3 w-3" strokeWidth={3} /> {m}
                    </span>
                  ))}
                </div>
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {IMPORT_SAMPLE.map((r) => (
                    <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{r.name}</p>
                        <p className="truncate text-xs text-slate-500">{r.service}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          r.type === 'New lead' ? 'bg-[#1C1F23] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.type}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1.5 bg-[#00828A] px-4 py-2.5 text-sm font-semibold text-white">
                  <Check className="h-4 w-4" strokeWidth={3} /> 3 imported · 0 emails sent
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-white/40">Example only, not real customers.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}