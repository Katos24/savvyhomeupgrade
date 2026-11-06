'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CreditCard, Loader2, RotateCcw, Send } from 'lucide-react';
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

type Item = { description: string; qty: number; price: number };
export type InvoiceView = 'deposit' | 'balance' | 'paid';
// The made-up business on the invoice. Changes with the job so it's clear the PDF carries the contractor's brand.
type Brand = { name: string; initials: string; color: string; phone: string; email: string; mark: Mark };
type Mark = 'roof' | 'deck' | 'hvac' | 'remodel';

// Simple made-up logo marks, drawn in white on the brand color.
function BrandMark({ mark }: { mark: Mark }) {
  const common = { fill: 'none', stroke: 'white', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden>
      {mark === 'roof' && (
        <>
          <path d="M2.5 14 12 5.5l9.5 8.5" {...common} />
          <path d="M6.5 11.5V19h11v-7.5" {...common} />
          <path d="M16 8.5V5.5h2.5v5" {...common} />
        </>
      )}
      {mark === 'deck' && (
        <>
          <path d="M3.5 7h17M3.5 12h17M3.5 17h17" {...common} />
          <path d="M9 7v5M15 12v5" {...common} strokeWidth={1.6} />
        </>
      )}
      {mark === 'hvac' && (
        <>
          <path d="M12 3.5v17M4.6 7.75l14.8 8.5M4.6 16.25l14.8-8.5" {...common} />
          <path d="M10 5.5 12 7l2-1.5M10 18.5 12 17l2 1.5" {...common} strokeWidth={1.6} />
        </>
      )}
      {mark === 'remodel' && (
        <>
          <path d="M3.5 11.5 12 4.5l8.5 7V20h-17z" {...common} />
          <path
            d="M12 18c-1.6 0-2.6-1-2.6-2.4 0-1.5 1.3-2.1 1.7-3.4 1 .6 1.5 1.5 1.5 2.1.3-.4.5-.9.5-1.3 1 .7 1.5 1.7 1.5 2.6 0 1.4-1 2.4-2.6 2.4z"
            fill="white"
          />
        </>
      )}
    </svg>
  );
}
const SUMMIT: Brand = {
  name: 'Summit Roofing',
  initials: 'SR',
  color: '#d97706',
  phone: '(555) 014-2290',
  email: 'office@summitroofing.co',
  mark: 'roof',
};
type Custom = { items: Item[]; total: number; deposit: number; view: InvoiceView; brand?: Brand };

// No props: the fixed roofing example mid-job (used on /features/payments).
// With `custom`: the visitor's job from the home page demo, at one of three
// points: deposit invoice, balance invoice (deposit paid), or paid in full.
export function InvoiceMock({ custom }: { custom?: Custom } = {}) {
  const items = custom ? custom.items : ITEMS;
  const total = custom ? custom.total : ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const deposit = custom ? custom.deposit : DEPOSIT;
  const view: InvoiceView = custom ? custom.view : 'balance';
  const brand = custom?.brand ?? SUMMIT;
  const balance = Math.max(0, total - deposit);

  const dueLabel = view === 'deposit' ? 'DEPOSIT DUE' : 'BALANCE DUE';
  const dueAmount = view === 'deposit' ? deposit : view === 'paid' ? 0 : balance;
  const stamp = view === 'paid' ? 'Paid in full' : view === 'balance' && deposit > 0 ? 'Deposit paid' : null;

  return (
    <div className="relative w-full bg-white text-[#1f2937] rounded-sm overflow-hidden border border-slate-200 shadow-2xl text-[7px] sm:text-[8.5px] leading-snug">
      {stamp && <Stamp label={stamp} className="absolute right-[8%] top-[40%] text-base sm:text-xl" />}
      {/* Header */}
      <div className="h-1 transition-colors" style={{ background: brand.color }} />
      <div className="bg-[#1f2937] text-white px-[6%] py-[5%] flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 sm:h-12 sm:w-12 flex-col items-center justify-center gap-px rounded-md shrink-0 ring-2 ring-white/90 transition-colors"
            style={{ background: brand.color }}
          >
            <BrandMark mark={brand.mark} />
            <span className="text-[6px] sm:text-[7px] font-extrabold leading-none tracking-wider text-white">{brand.initials}</span>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-extrabold tracking-wide uppercase">{brand.name}</p>
            <p className="mt-0.5 text-slate-300">{brand.phone}</p>
            <p className="text-slate-300">{brand.email}</p>
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
            <p className="font-bold text-[6.5px] sm:text-[7.5px] tracking-wide text-slate-500">{dueLabel}</p>
            <p className={`text-sm sm:text-lg font-extrabold ${view === 'paid' ? 'text-emerald-700' : ''}`}>{fmt(dueAmount)}</p>
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
          {items.map((it, i) => (
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
            {view === 'deposit' ? (
              <>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="font-bold">DEPOSIT DUE</span>
                  <span className="text-[10px] sm:text-xs font-extrabold">{fmt(deposit)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Balance due on completion</span>
                  <span className="font-semibold">{fmt(balance)}</span>
                </div>
              </>
            ) : (
              <>
                {deposit > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Deposit paid · Sep 14</span>
                    <span className="font-semibold">− {fmt(deposit)}</span>
                  </div>
                )}
                {view === 'paid' && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Balance paid · Oct 3</span>
                    <span className="font-semibold">− {fmt(balance)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="font-bold">BALANCE DUE</span>
                  <span className="text-[10px] sm:text-xs font-extrabold">{fmt(view === 'paid' ? 0 : balance)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* QR to pay, or paid */}
        {view === 'paid' ? (
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 px-3 py-2 text-emerald-700">
            <span className="text-[10px] sm:text-xs font-extrabold">✓ Paid in full</span>
            <span>Thank you</span>
          </div>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2.5 bg-slate-50 p-2">
            <div className="h-10 w-10 sm:h-12 sm:w-12">
              <FakeQR />
            </div>
            <div>
              <p className="font-bold">Scan QR to Pay</p>
              <p className="text-[10px] sm:text-xs font-extrabold">{fmt(dueAmount)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#1f2937] px-[6%] py-2 text-slate-400">
        Thank you for your business · Questions? {brand.phone}
      </div>
    </div>
  );
}


// ── Home page: "Get paid. See what you kept." ──
// One job (M. Johnson, the same job used across the page): the invoice on the left,
// that job's profit on the right. Replaces the separate "Try it" invoice demo and ProfitSection.
// Numbers add up: 12,000 total, 4,800 deposit, 7,200 balance; expenses 4,150 + 2,600 + 380 = 7,130; kept 4,870.

const JOB_EXPENSES = [
  { d: 'Shingles & underlayment', c: 'Materials', a: 4150 },
  { d: 'Crew labor', c: 'Labor', a: 2600 },
  { d: 'Dumpster rental', c: 'Equipment', a: 380 },
];
const JOB_TOTAL = ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
const JOB_SPENT = JOB_EXPENSES.reduce((s, e) => s + e.a, 0);
const JOB_KEPT = JOB_TOTAL - JOB_SPENT;
const JOB_MARGIN = Math.round((JOB_KEPT / JOB_TOTAL) * 100);

const VIEWS: { id: InvoiceView; label: string }[] = [
  { id: 'deposit', label: 'Deposit invoice' },
  { id: 'balance', label: 'Balance invoice' },
  { id: 'paid', label: 'Paid in full' },
];

export default function InvoiceShowcaseSection() {
  const [view, setView] = useState<InvoiceView>('deposit');

  return (
    <section className="relative overflow-hidden bg-slate-900 px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/4 h-[480px] w-[480px] rounded-full bg-[#00828A]/25 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#5EC4C9]/15 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.2em] text-[#5EC4C9]">
            Invoices &amp; profit
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            Get paid. <span className="text-[#5EC4C9]">See what you kept.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-white/85 sm:text-base">
            Your customer gets a clean PDF with your logo and a QR code to pay. Log your costs on the job, and you see exactly
            what you made.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 sm:mt-12 lg:grid-cols-2 lg:gap-14">
          {/* ── Invoice ── */}
          <div className="mx-auto w-full max-w-[400px]">
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1 ring-1 ring-white/15" role="tablist" aria-label="Invoice stage">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={view === v.id}
                  onClick={() => setView(v.id)}
                  className={`rounded-lg px-1 py-2 text-[12px] font-bold transition-colors sm:text-[13px] ${
                    view === v.id ? 'bg-white text-slate-900' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16, rotate: -1.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              aria-label="Example Lead2Project invoice"
            >
              <InvoiceMock custom={{ items: ITEMS, total: JOB_TOTAL, deposit: DEPOSIT, view, brand: SUMMIT }} />
            </motion.div>
          </div>

          {/* ── Profit for the same job ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="overflow-hidden rounded-2xl bg-white text-[#1C1F23] shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">M. Johnson · Roof replacement</p>
                  <p className="text-xs text-slate-400">#INV-041 · Job profit</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#00828A]/10 px-2.5 py-1 text-xs font-bold text-[#00828A]">{JOB_MARGIN}% kept</span>
              </div>

              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    Came in <span className="tabular-nums">{fmt(JOB_TOTAL)}</span>
                  </p>
                  <div className="space-y-1 text-[13px] text-slate-700">
                    <div className="flex justify-between">
                      <span>Deposit · paid by card</span>
                      <span className="tabular-nums">{fmt(DEPOSIT)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance · paid by card</span>
                      <span className="tabular-nums">{fmt(JOB_TOTAL - DEPOSIT)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                    Went out <span className="tabular-nums">{fmt(JOB_SPENT)}</span>
                  </p>
                  <div className="space-y-1 text-[13px] text-slate-700">
                    {JOB_EXPENSES.map((e) => (
                      <div key={e.d} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {e.d} <span className="text-slate-400">({e.c})</span>
                        </span>
                        <span className="shrink-0 tabular-nums">{fmt(e.a)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-bold">You kept</span>
                  <span className="font-[family-name:var(--font-display)] text-3xl font-extrabold tabular-nums text-[#00828A]">{fmt(JOB_KEPT)}</span>
                </div>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                  <span className="h-full bg-rose-400" style={{ width: `${100 - JOB_MARGIN}%` }} />
                  <span className="h-full bg-[#00828A]" style={{ width: `${JOB_MARGIN}%` }} />
                </div>
              </div>
            </div>

            <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {['Profit on every job', 'Log costs as you go', 'CSV & QuickBooks export'].map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold text-white ring-1 ring-white/15"
                >
                  <Check className="h-3.5 w-3.5 text-[#5EC4C9]" strokeWidth={3} /> {label}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}