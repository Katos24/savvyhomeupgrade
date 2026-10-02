'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

// Keep every line here true to what each plan actually unlocks in the app.
const plans = [
  {
    name: 'Free',
    price: '0',
    desc: 'Take requests and keep track of every job.',
    highlight: false,
    cta: 'Start free',
    features: [
      'Booking link and QR code',
      'Lead dashboard and job board',
      'Calendar',
      'Add jobs by hand',
    ],
  },
  {
    name: 'Basic',
    price: '49.99',
    desc: 'Quote, collect deposits and get paid.',
    highlight: true,
    cta: 'Start 14-day free trial',
    features: [
      'Everything in Free',
      'Services with price templates',
      'Quotes your customers accept online',
      'Deposits and balance invoices',
      'Card payments through Stripe',
      'Receipts sent automatically',
      'Custom booking form and branding',
      'CSV export',
    ],
  },
  {
    name: 'Pro',
    price: '79.99',
    desc: 'More automation for busy crews.',
    highlight: false,
    cta: 'Start 14-day free trial',
    features: [
      'Everything in Basic',
      'Custom email templates',
      'Full email history',
      '6 AM daily digest',
      'AI assistant for your job data',
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-bold text-[#00828A] tracking-widest uppercase">Pricing</p>
          <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            One job pays for the whole year.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">Cancel anytime. No setup fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                plan.highlight
                  ? 'border-2 border-[#00828A] bg-white shadow-lg shadow-[#00828A]/10'
                  : 'border-slate-200 bg-[#F8FAF9]'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#00828A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Recommended
                </span>
              )}

              <h3 className="text-sm font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">${plan.price}</span>
                <span className="text-sm font-medium text-slate-500">/mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`mt-7 block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                  plan.highlight
                    ? 'bg-[#00828A] text-white hover:bg-[#006e75]'
                    : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}