'use client';

import { motion } from 'framer-motion';
import {
  Settings2,
  Send,
  CreditCard,
  QrCode,
  FileText,
  Receipt,
  CalendarDays,
  Columns3,
  Star,
  Mail,
} from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

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
  { icon: Mail, title: 'Receipts sent for you', desc: 'Customers get a receipt for every payment, plus the final invoice PDF when paid in full.' },
  { icon: CalendarDays, title: 'Calendar', desc: 'Schedule jobs and move them with a tap.' },
  { icon: Columns3, title: 'Job board', desc: 'See every job by stage and drag it forward.' },
  { icon: Star, title: 'Review requests', desc: 'Ask for a Google review when you mark a job complete.' },
];

export default function FeaturesSection() {
  return (
    <div className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] text-slate-900 antialiased`}>
      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <p className="text-xs font-bold text-[#00828A] tracking-widest uppercase">How it works</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Set it up once. Every job follows the same rules.
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative rounded-2xl border border-slate-200 bg-[#F8FAF9] p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00828A] text-white text-sm font-bold">
                      {i + 1}
                    </span>
                    <Icon className="w-5 h-5 text-[#00828A]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="bg-[#F4F7F6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-12 text-center sm:text-left">
            <p className="text-xs font-bold text-[#00828A] tracking-widest uppercase">What you get</p>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Everything from first call to paid in full.
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-[#00828A]">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold">{f.title}</h3>
                    <p className="mt-0.5 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
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