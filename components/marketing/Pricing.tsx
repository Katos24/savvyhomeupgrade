'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Eyebrow } from './marketingUI';

// Keep every line here true to what each plan actually unlocks in the app.
const plans = [
  {
    name: 'Free',
    price: '0',
    desc: 'Take requests and keep track of every job.',
    highlight: false,
    cta: 'Start free',
    features: ['Booking link and QR code', 'Lead dashboard and job board', 'Table and calendar views', 'Add jobs by hand'],
  },
  {
    name: 'Basic',
    price: '49.99',
    desc: 'Quotes, deposits, invoices and card payments.',
    highlight: false,
    cta: 'Start 14-day free trial',
    features: [
      'Everything in Free',
      'Services with price templates',
      'Quote builder',
      'Deposits and balance invoices',
      'Card payments through Stripe',
      'Invoice and payment reminder emails',
      'Google review requests',
      'Custom booking form and branding',
      'Unlimited team members',
      'CSV export',
    ],
  },
  {
    name: 'Pro',
    price: '79.99',
    desc: 'Send quotes and schedules by email, fully automated.',
    highlight: true,
    cta: 'Start 14-day free trial',
    features: [
      'Everything in Basic',
      'Email quotes customers accept online',
      'One-click schedule emails',
      'Custom email templates',
      'Full email history',
      'Morning daily digest email',
      'AI assistant for your job data',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            One job pays for the whole year.
          </h2>
          <p className="mt-3 text-base text-[#3a3f45]">Cancel anytime. No setup fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white ${
                plan.highlight ? 'shadow-lg' : 'shadow-sm'
              }`}
            >
              {plan.highlight ? (
                <div className="h-1.5 bg-[#00828A]" aria-hidden />
              ) : (
                <div className="h-1.5 bg-slate-200" aria-hidden />
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="rounded bg-[#00828A] px-2 py-0.5 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight">
                    ${plan.price}
                  </span>
                  <span className="text-sm font-semibold text-[#3a3f45]">/mo</span>
                </div>
                <p className="mt-2 text-[15px] text-[#3a3f45]">{plan.desc}</p>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`mt-7 block w-full rounded-md border border-slate-200 py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider transition-all ${
                    plan.highlight
                      ? 'bg-[#00828A] hover:bg-[#006e75] text-white border-[#00828A]'
                      : 'bg-white '
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}