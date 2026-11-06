'use client';

import { platformFeeEnabled, PLATFORM_FEE_LABEL } from '@/lib/stripe/platformFee';
import { Eyebrow } from './marketingUI';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

// ⚠️ Keep these exactly true.
// If you charge a platform fee on card payments, it's described here automatically.
const PLATFORM_FEE_NOTE = platformFeeEnabled()
  ? `Card payments also include a Lead2Project fee of ${PLATFORM_FEE_LABEL} per payment, refunded if you refund the payment.`
  : '';

// "Can you help me get set up?" now lives in the call box on the left.
const FAQS: { q: string; a: string }[] = [
  {
    q: 'What does it cost to take card payments?',
    a:
      'Card payments run through Stripe, which charges its standard processing fee on each payment. The money goes to your own Stripe account.' +
      (PLATFORM_FEE_NOTE ? ` ${PLATFORM_FEE_NOTE}` : ' Lead2Project doesn’t take a cut of your payments.'),
  },
  {
    q: 'Do my customers have to pay by card?',
    a: 'No. You can share a Venmo, Zelle, Cash App or PayPal link, or record cash and check payments yourself. The balance updates either way, and the customer gets a receipt.',
  },
  {
    q: 'Is there a contract?',
    a: 'No. Plans are month to month and you can cancel anytime. You can also stay on the Free plan as long as you like.',
  },
  {
    q: 'How do customers find my booking form?',
    a: 'You get your own booking link and a QR code. Put them on your Google Business Profile, your website, your truck, your invoices, anywhere customers see you.',
  },
  {
    q: 'Is my customers’ card information safe?',
    a: 'Card details are entered on Stripe’s secure checkout and never stored by Lead2Project.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-white px-4 py-14 text-[#1C1F23] sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
        {/* Heading + help */}
        <div className="text-center lg:text-left">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
            Common questions
          </h2>

          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-900 p-5 text-left text-white lg:mx-0">
            <p className="font-[family-name:var(--font-display)] text-lg font-extrabold uppercase leading-tight">Want help getting set up?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-white/70">
              Book a quick call and I&rsquo;ll help set up your services, deposits and booking form, and bring over your customer
              list.
            </p>
            <Link
              href="/book-demo"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#00828A] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#00959e]"
            >
              <CalendarDays className="h-4 w-4" /> Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Questions */}
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className={`text-[15px] font-bold transition-colors sm:text-base ${isOpen ? 'text-[#00828A]' : 'group-hover:text-[#00828A]'}`}>
                    {item.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
                      isOpen ? 'rotate-45 bg-[#00828A] text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 pr-10 text-[14px] leading-relaxed text-[#3a3f45] sm:text-[15px]">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}