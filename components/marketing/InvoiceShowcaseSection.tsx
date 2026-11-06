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

const cents = (n: number) => Math.round(n * 100) / 100;

// Example jobs for the demo. Each preset's line items add up to its total.
const PRESETS: { job: string; mode: 'percent' | 'amount'; deposit: string; items: Item[]; brand: Brand }[] = [
  { job: 'Roof replacement', mode: 'percent', deposit: '40', items: ITEMS, brand: SUMMIT },
  {
    job: 'Deck stain',
    brand: {
      name: 'Oak & Grain Decks',
      initials: 'OG',
      color: '#7c5a3a',
      phone: '(555) 019-4471',
      email: 'hello@oakandgraindecks.co',
      mark: 'deck',
    },
    mode: 'amount',
    deposit: '500',
    items: [
      { description: 'Power Wash & Prep', qty: 1, price: 250 },
      { description: 'Semi-Transparent Stain (gal)', qty: 6, price: 55 },
      { description: 'Board Replacement', qty: 4, price: 45 },
      { description: 'Labor', qty: 1, price: 1040 },
    ],
  },
  {
    job: 'AC install',
    brand: {
      name: 'Coolside HVAC',
      initials: 'CH',
      color: '#0284c7',
      phone: '(555) 012-8830',
      email: 'service@coolsidehvac.co',
      mark: 'hvac',
    },
    mode: 'percent',
    deposit: '30',
    items: [
      { description: '3-Ton Condenser', qty: 1, price: 3400 },
      { description: 'Evaporator Coil', qty: 1, price: 1250 },
      { description: 'Line Set & Refrigerant', qty: 1, price: 450 },
      { description: 'Smart Thermostat', qty: 1, price: 180 },
      { description: 'Labor & Installation', qty: 1, price: 2220 },
    ],
  },
  {
    job: 'Kitchen remodel',
    brand: {
      name: 'Hearth Remodeling',
      initials: 'HR',
      color: '#7c3aed',
      phone: '(555) 016-3105',
      email: 'projects@hearthremodeling.co',
      mark: 'remodel',
    },
    mode: 'percent',
    deposit: '25',
    items: [
      { description: 'Demo & Disposal', qty: 1, price: 1650 },
      { description: 'Cabinets', qty: 1, price: 14500 },
      { description: 'Quartz Countertops (sq ft)', qty: 45, price: 95 },
      { description: 'Backsplash Tile (sq ft)', qty: 30, price: 28 },
      { description: 'Plumbing & Electrical', qty: 1, price: 3800 },
      { description: 'Labor & Installation', qty: 1, price: 12935 },
    ],
  },
];

const sumItems = (items: Item[]) => items.reduce((s, i) => s + i.qty * i.price, 0);

const STEPS = ['Deposit sent', 'Deposit paid', 'Balance sent', 'Paid in full'];

export default function InvoiceShowcaseSection() {
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[presetIdx];

  const total = cents(sumItems(preset.items));
  const depositNum = parseFloat(preset.deposit) || 0;
  const deposit = cents(Math.min(preset.mode === 'percent' ? (total * depositNum) / 100 : depositNum, total));
  const balance = cents(total - deposit);

  // 0 not sent · 1 deposit sent, waiting · 2 deposit paid · 3 balance sent, waiting · 4 paid in full
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Picking another job starts the demo over.
  useEffect(() => {
    setStep(0);
    setToast(null);
  }, [presetIdx]);

  // The customer "pays" a moment after each invoice goes out.
  useEffect(() => {
    if (step !== 1 && step !== 3) return;
    const t = setTimeout(() => {
      setToast(`Customer paid ${fmt(step === 1 ? deposit : balance)} by card`);
      setStep(step + 1);
    }, 1500);
    return () => clearTimeout(t);
  }, [step, deposit, balance]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const view: InvoiceView = step <= 1 ? 'deposit' : step === 4 ? 'paid' : 'balance';
  const waiting = step === 1 || step === 3;

  const action = () => {
    if (step === 0) setStep(1);
    else if (step === 2) setStep(3);
    else if (step === 4) setStep(0);
  };
  const actionLabel = waiting
    ? 'Waiting for payment…'
    : step === 0
      ? `Send deposit invoice · ${fmt(deposit)}`
      : step === 2
        ? `Send balance invoice · ${fmt(balance)}`
        : 'Start over';
  const ActionIcon = waiting ? Loader2 : step === 4 ? RotateCcw : Send;

  return (
    <section className="bg-slate-50 px-4 py-14 text-[#1C1F23] sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        {/* Copy + try it */}
        <div className="lg:order-2">
          <div className="text-center lg:text-left">
            <Eyebrow>Try it</Eyebrow>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-[44px]">
              Send the invoice. <span className="text-[#00828A]">Get paid.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[44ch] text-[15px] leading-relaxed text-[#3a3f45] lg:mx-0">
              Your customer gets a clean PDF with your logo, every line item, what&rsquo;s been paid, and a QR code to pay the
              rest.
            </p>
          </div>

          {/* Job picker */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {PRESETS.map((p, idx) => (
              <button
                key={p.job}
                type="button"
                onClick={() => setPresetIdx(idx)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
                  idx === presetIdx
                    ? 'bg-[#1C1F23] text-white shadow-md'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900 hover:ring-slate-300'
                }`}
              >
                {p.job}
              </button>
            ))}
          </div>

          {/* Progress */}
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {STEPS.map((label, i) => {
              const done = step > i || (step === 4 && i === 3);
              const active = !done && (step === i || (waiting && step - 1 === i));
              return (
                <li key={label} className="min-w-0">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <motion.div
                      className="h-full rounded-full bg-[#00828A]"
                      initial={false}
                      animate={{ width: done ? '100%' : active ? '45%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p
                    className={`mt-1.5 flex items-center gap-1 truncate text-[11px] font-semibold sm:text-xs ${
                      done ? 'text-[#00828A]' : 'text-slate-400'
                    }`}
                  >
                    {done && <Check className="h-3 w-3 shrink-0" strokeWidth={3} />}
                    {label}
                  </p>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={action}
            disabled={waiting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00828A] px-5 py-3.5 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white shadow-lg shadow-[#00828A]/25 transition-all hover:-translate-y-0.5 hover:bg-[#006e75] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
          >
            <ActionIcon className={`h-4 w-4 ${waiting ? 'animate-spin' : ''}`} />
            {actionLabel}
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">Demo only. Nothing is sent.</p>
        </div>

        {/* Invoice */}
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-[380px] lg:order-1"
          aria-label="Example Lead2Project invoice"
        >
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[#5EC4C9]/20 blur-2xl" />
            <InvoiceMock custom={{ items: preset.items, total, deposit, view, brand: preset.brand }} />
            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-x-0 top-3 z-10 flex justify-center"
                  role="status"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg sm:text-sm">
                    <CreditCard className="h-4 w-4" /> {toast}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}