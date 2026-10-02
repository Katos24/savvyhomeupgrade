'use client';

import { Eyebrow } from './marketingUI';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
// ⚠️ Fill these in before going live — keep them exactly true.
// If you charge a platform fee on card payments, describe it here (e.g. "plus a 1% Lead2Project fee").
// Leave empty if you don't charge one.
const PLATFORM_FEE_NOTE = '';

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
    q: 'Can you help me get set up?',
    a: 'Yes. Book a quick call and I’ll help set up your services, deposits and booking form, and bring over your customer list.',
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
    <section
      id="faq"
      className={`bg-[#F4EFE6] text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20`}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">Common questions</h2>
        </div>

        <div className="rounded-md border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left"
                >
                  <span className="text-base sm:text-lg font-bold">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 sm:px-6 pb-5 -mt-1 text-[15px] text-[#3a3f45] leading-relaxed">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}