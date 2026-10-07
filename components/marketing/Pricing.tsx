'use client';

import Link from 'next/link';
import { Check, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Eyebrow } from './marketingUI';

// Two plans. "Pro" is the $49.99 plan ('basic' in lib/permissions).
// Keep every line true to what each plan actually unlocks in the app.
const plans = [
  {
    name: 'Free',
    price: '0',
    desc: 'Take requests and keep track of every job.',
    highlight: false,
    cta: 'Start free',
    href: '/signup',
    features: ['Booking link and QR code', 'Lead dashboard and job board', 'Table and calendar views', 'Add jobs from calls and walk-ins'],
  },
  {
    name: 'Pro',
    price: '49.99',
    desc: 'Everything you need to quote, schedule and get paid.',
    highlight: true,
    note: 'Unlimited users included. No per-seat fees.',
    cta: 'Start 14-day free trial',
    href: '/signup?plan=basic',
    features: [
      'Everything in Free',
      'Unlimited users: your whole crew, one price',
      'Services with prices and default deposits',
      'Email quotes customers accept online',
      'Deposits and balance invoices',
      'Card payments through Stripe',
      'Expenses and profit per job',
      'Scheduling and one-click schedule emails',
      'Invoice and payment reminder emails',
      'Google review requests',
      'Custom booking form and branding',
      'Email history, custom templates and a morning digest',
      'CSV export, including QuickBooks format',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            One job pays for the whole year.
          </h2>
          <p className="mt-3 text-base text-[#3a3f45]">Two plans. Cancel anytime. No setup fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
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
              <div className={`h-1.5 ${plan.highlight ? 'bg-[#00828A]' : 'bg-slate-200'}`} aria-hidden />

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight">${plan.price}</span>
                  <span className="text-sm font-semibold text-[#3a3f45]">/mo</span>
                </div>
                {'note' in plan && plan.note && (
                  <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-[#00828A]/10 px-2.5 py-1 text-sm font-bold text-[#00828A]">
                    <Users className="h-4 w-4" /> {plan.note}
                  </p>
                )}
                <p className="mt-2 text-[15px] text-[#3a3f45]">{plan.desc}</p>

                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px]">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? 'text-[#00828A]' : ''}`} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-7 block w-full rounded-md border py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider transition-all ${
                    plan.highlight
                      ? 'bg-[#00828A] hover:bg-[#006e75] text-white border-[#00828A]'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
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