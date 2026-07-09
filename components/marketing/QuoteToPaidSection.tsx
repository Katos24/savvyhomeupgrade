'use client';

import { motion } from 'framer-motion';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const LINE_ITEMS = [
  { name: 'Service call & diagnostic', qty: 1, price: 95 },
  { name: 'Replacement parts', qty: 1, price: 240 },
  { name: 'Labor (2 hrs)', qty: 2, price: 85 },
];
const TOTAL = LINE_ITEMS.reduce((s, i) => s + i.qty * i.price, 0);

export default function QuoteSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[45%_55%] lg:gap-16">
          {/* LEFT — copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1"
          >
            <p
              className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 sm:text-xs"
              style={{ fontFamily: font }}
            >
              Quotes
            </p>

            <h2
              className="mb-0 text-4xl font-black leading-[0.95] tracking-tight text-slate-900 sm:text-5xl lg:mb-8"
              style={{ fontFamily: font }}
            >
              Quotes that <span className="text-emerald-600">build themselves.</span>
            </h2>

            <div className="hidden lg:block">
              <p
                className="mb-8 mt-8 text-lg font-bold leading-relaxed text-slate-600"
                style={{ fontFamily: font }}
              >
                The lead you just captured turns into a quote in a couple
                taps — pricing templates fill in the line items so you&apos;re
                not typing them from scratch every time.
              </p>

              <ul className="mb-8 space-y-4">
                {[
                  'Pricing templates by job type — set once, reuse forever',
                  'Every line item is still editable before you send',
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3 font-bold text-slate-700">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {point}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-slate-900"
              >
                Get started free <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — the quote card, no tabs needed now that it's one job */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 flex flex-col items-center"
          >
            <div className="w-full max-w-[370px]">
              <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
                  <div>
                    <p className="text-xs font-black leading-tight text-white">QT-014</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/50">Sarah T. — Kitchen leak</p>
                  </div>
                  <Calculator size={16} className="text-white/40" />
                </div>

                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Line items</p>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700">
                      From your pricing template
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {LINE_ITEMS.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-[10px] font-bold text-slate-700">{item.name}</span>
                        <span className="text-[10px] font-black text-slate-900">${(item.qty * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                    <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Total</span>
                    <span className="text-lg font-black text-slate-900">${TOTAL.toFixed(2)}</span>
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-900 py-2.5 text-center text-[10px] font-black uppercase tracking-wider text-white">
                    Send quote
                  </div>
                </div>
              </div>
            </div>

            {/* Copy — mobile only */}
            <div className="mt-8 block w-full lg:hidden">
              <p className="mb-6 text-base font-bold leading-relaxed text-slate-600" style={{ fontFamily: font }}>
                The lead you just captured turns into a quote in a couple
                taps — pricing templates fill in the line items so you&apos;re
                not typing them from scratch every time.
              </p>
              <ul className="mb-6 space-y-3">
                {[
                  'Pricing templates by job type — set once, reuse forever',
                  'Every line item is still editable before you send',
                ].map((point) => (
                  <li key={point} className="flex items-center gap-3 font-bold text-slate-700">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white"
              >
                Get started free <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}