'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Settings2, Send, CreditCard, QrCode, FileText, Receipt, CalendarDays, Columns3, Star, Mail } from 'lucide-react';
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
// Rendered on its own further down the home page, as the recap before pricing.
export function WhatYouGetSection() {
  return (
    <div className="text-[#1C1F23] antialiased">
      {/* ── What you get ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-12 text-center sm:text-left">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
              Everything from first call to paid in full.
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-7">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-[#1C1F23] text-[#5EC4C9]">
                    <Icon className="w-5 h-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-bold uppercase leading-tight">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-[15px] text-[#3a3f45] leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}