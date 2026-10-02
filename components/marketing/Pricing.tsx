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
    features: ['Booking link and QR code', 'Lead dashboard and job board', 'Calendar', 'Add jobs by hand'],
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
      'Receipts sent automatically',
      'Custom booking form and branding',
      'CSV and QuickBooks export',
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
      '6 AM daily digest',
      'AI assistant for your job data',
    ],
  },
];

export const hazardStripe = {
  backgroundImage: 'repeating-linear-gradient(-45deg, #FFC72C 0 10px, #1C1F23 10px 20px)',
};

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
              className={`relative flex flex-col border-2 border-[#1C1F23] bg-white ${
                plan.highlight ? 'shadow-[7px_7px_0_0_#1C1F23]' : 'shadow-[4px_4px_0_0_#1C1F23]'
              }`}
            >
              {plan.highlight ? (
                <div className="h-3 border-b-2 border-[#1C1F23]" style={hazardStripe} aria-hidden />
              ) : (
                <div className="h-3 border-b-2 border-[#1C1F23] bg-[#F4EFE6]" aria-hidden />
              )}

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="bg-[#FFC72C] border-2 border-[#1C1F23] px-2 py-0.5 font-[family-name:var(--font-display)] text-xs font-bold uppercase tracking-wider">
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
                  className={`mt-7 block w-full rounded-md border-2 border-[#1C1F23] py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider transition-all hover:translate-x-[2px] hover:translate-y-[2px] ${
                    plan.highlight
                      ? 'bg-[#FFC72C] shadow-[4px_4px_0_0_#1C1F23] hover:shadow-[2px_2px_0_0_#1C1F23]'
                      : 'bg-white shadow-[3px_3px_0_0_#1C1F23] hover:shadow-[1px_1px_0_0_#1C1F23]'
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