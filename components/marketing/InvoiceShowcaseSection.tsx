'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Eyebrow, Stamp } from './marketingUI';
// A faithful copy of the real Lead2Project invoice PDF layout (dark header,
// accent stripe, Bill To / Amount Due, line items, payments, QR to pay),
// shown mid-job with the deposit paid. Demo data only.
// Totals add up: 2,125 + 4,125 + 440 + 480 + 4,830 = 12,000; 12,000 − 4,800 = 7,200.
const ITEMS = [
  { description: 'Tear-off & Disposal (per sq.)', qty: 25, price: 85 },
  { description: 'Architectural Shingles', qty: 25, price: 165 },
  { description: 'Synthetic Underlayment', qty: 5, price: 88 },
  { description: 'Ice & Water Shield (Rolls)', qty: 4, price: 120 },
  { description: 'Labor & Installation', qty: 1, price: 4830 },
];
const DEPOSIT = 4800;

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// Decorative QR-style pattern (not scannable): three finder squares + a fixed pseudo-random fill.
function FakeQR() {
  const n = 21;
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < n * n; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const inFinder = (r: number, c: number) => {
    const box = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    return box(0, 0) || box(0, n - 7) || box(n - 7, 0);
  };
  const finderOn = (r: number, c: number) => {
    const local = (r0: number, c0: number) => {
      const rr = r - r0;
      const cc = c - c0;
      const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      return ring || core;
    };
    if (r < 7 && c < 7) return local(0, 0);
    if (r < 7 && c >= n - 7) return local(0, n - 7);
    return local(n - 7, 0);
  };
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-full w-full" shapeRendering="crispEdges" aria-hidden>
      <rect width={n} height={n} fill="#fff" />
      {Array.from({ length: n * n }).map((_, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        const on = inFinder(r, c) ? finderOn(r, c) : cells[i];
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="#111827" /> : null;
      })}
    </svg>
  );
}

function InvoiceMock() {
  const total = ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const balance = total - DEPOSIT;

  return (
    <div className="relative w-full bg-white text-[#1f2937] rounded-sm overflow-hidden border border-slate-200 shadow-2xl text-[7px] sm:text-[8.5px] leading-snug">
      <Stamp label="Deposit paid" className="absolute right-[8%] top-[40%] text-base sm:text-xl" />
      {/* Header */}
      <div className="h-1 bg-[#f59e0b]" />
      <div className="bg-[#1f2937] text-white px-[6%] py-[5%] flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-white shrink-0">
            <span className="text-[11px] sm:text-sm font-extrabold text-[#1f2937]">SR</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-extrabold tracking-wide">SUMMIT ROOFING</p>
            <p className="mt-0.5 text-slate-300">(555) 014-2290</p>
            <p className="text-slate-300">office@summitroofing.co</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base sm:text-xl font-extrabold tracking-tight">INVOICE</p>
          <div className="mt-1 grid grid-cols-[auto_auto] gap-x-3 text-left">
            <span className="text-slate-400">Invoice #</span>
            <span>INV-041</span>
            <span className="text-slate-400">Date</span>
            <span>Oct 1, 2026</span>
          </div>
        </div>
      </div>

      <div className="px-[6%] pt-[5%] pb-[4%]">
        {/* Bill to / Amount due */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-l-2 border-[#1f2937] bg-slate-50 px-2.5 py-2">
            <p className="font-bold text-[6.5px] sm:text-[7.5px] tracking-wide">BILL TO</p>
            <p className="text-[10px] sm:text-xs font-extrabold">M. Johnson</p>
            <p className="text-slate-500">mjohnson@email.com</p>
            <p className="text-slate-500">Holbrook, NY</p>
          </div>
          <div className="border-t-2 border-[#1f2937] bg-slate-50 px-2.5 py-2">
            <p className="font-bold text-[6.5px] sm:text-[7.5px] tracking-wide text-slate-500">BALANCE DUE</p>
            <p className="text-sm sm:text-lg font-extrabold">{fmt(balance)}</p>
            <p className="text-slate-500">of {fmt(total)} project total</p>
          </div>
        </div>

        {/* Line items */}
        <div className="mt-3">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 bg-slate-100 px-2 py-1.5 font-bold text-[6.5px] sm:text-[7.5px] tracking-wide">
            <span>DESCRIPTION</span>
            <span className="text-right w-6">QTY</span>
            <span className="text-right w-12">UNIT PRICE</span>
            <span className="text-right w-14">AMOUNT</span>
          </div>
          {ITEMS.map((it, i) => (
            <div
              key={it.description}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-2 py-1.5 border-b border-slate-100 ${i % 2 ? 'bg-slate-50/70' : ''}`}
            >
              <span className="truncate">{it.description}</span>
              <span className="text-right w-6 text-slate-500">{it.qty}</span>
              <span className="text-right w-12 text-slate-500">{fmt(it.price)}</span>
              <span className="text-right w-14 font-bold">{fmt(it.qty * it.price)}</span>
            </div>
          ))}
        </div>

        {/* Totals + payments */}
        <div className="mt-3 flex justify-end">
          <div className="w-[58%] border-t-2 border-[#1f2937] bg-slate-50 px-2.5 py-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Project total</span>
              <span className="font-semibold">{fmt(total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Deposit paid · Sep 14</span>
              <span className="font-semibold">− {fmt(DEPOSIT)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1">
              <span className="font-bold">BALANCE DUE</span>
              <span className="text-[10px] sm:text-xs font-extrabold">{fmt(balance)}</span>
            </div>
          </div>
        </div>

        {/* QR to pay */}
        <div className="mt-4 inline-flex items-center gap-2.5 bg-slate-50 p-2">
          <div className="h-10 w-10 sm:h-12 sm:w-12">
            <FakeQR />
          </div>
          <div>
            <p className="font-bold">Scan QR to Pay</p>
            <p className="text-[10px] sm:text-xs font-extrabold">{fmt(balance)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#1f2937] px-[6%] py-2 text-slate-400">
        Thank you for your business · Questions? (555) 014-2290
      </div>
    </div>
  );
}

export default function InvoiceShowcaseSection() {
  return (
    <section
      className={`bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="text-center sm:text-left lg:order-2">
          <Eyebrow dark>Invoices</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            Invoices that look like a real business sent them.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Every invoice goes out as a clean PDF with your logo, the line items, what&rsquo;s been paid, and a QR
            code to pay the rest.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-200 inline-block text-left">
            {[
              'Your logo and business details',
              'Every line item, quantity and price',
              'Deposit paid and balance due, clearly shown',
              'A QR code your customer scans to pay',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5EC4C9]" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="lg:order-1 w-full max-w-md mx-auto"
          aria-label="Example Lead2Project invoice"
        >
          <InvoiceMock />
        </motion.div>
      </div>
    </section>
  );
}