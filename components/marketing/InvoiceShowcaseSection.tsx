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
type Custom = { items: Item[]; total: number; deposit: number; view: InvoiceView };

// No props: the fixed roofing example mid-job (used on /features/payments).
// With `custom`: the visitor's job from the home page demo, at one of three
// points: deposit invoice, balance invoice (deposit paid), or paid in full.
export function InvoiceMock({ custom }: { custom?: Custom } = {}) {
  const items = custom ? custom.items : ITEMS;
  const total = custom ? custom.total : ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const deposit = custom ? custom.deposit : DEPOSIT;
  const view: InvoiceView = custom ? custom.view : 'balance';
  const balance = Math.max(0, total - deposit);

  const dueLabel = view === 'deposit' ? 'DEPOSIT DUE' : 'BALANCE DUE';
  const dueAmount = view === 'deposit' ? deposit : view === 'paid' ? 0 : balance;
  const stamp = view === 'paid' ? 'Paid in full' : view === 'balance' && deposit > 0 ? 'Deposit paid' : null;

  return (
    <div className="relative w-full bg-white text-[#1f2937] rounded-sm overflow-hidden border border-slate-200 shadow-2xl text-[7px] sm:text-[8.5px] leading-snug">
      {stamp && <Stamp label={stamp} className="absolute right-[8%] top-[40%] text-base sm:text-xl" />}
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
        Thank you for your business · Questions? (555) 014-2290
      </div>
    </div>
  );
}

const toNum = (v: string) => {
  const n = parseFloat(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};
const cents = (n: number) => Math.round(n * 100) / 100;

// Each preset's line items add up to its price. The last line is labor:
// when the visitor changes the price, labor absorbs the difference so the
// materials stay realistic. If the price drops below the materials, every
// line scales down instead.
const PRESETS: { job: string; mode: 'percent' | 'amount'; deposit: string; items: Item[] }[] = [
  { job: 'Roof replacement', mode: 'percent', deposit: '40', items: ITEMS },
  {
    job: 'Deck stain',
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
const presetPrice = (p: (typeof PRESETS)[number]) => String(sumItems(p.items));

function fitItems(base: Item[], total: number): Item[] {
  if (total <= 0) return base.map((i) => ({ ...i, price: 0 }));
  const materials = sumItems(base.slice(0, -1));
  const labor = base[base.length - 1];
  if (total >= materials) {
    return [...base.slice(0, -1), { ...labor, price: cents(total - materials) }];
  }
  // Price is below materials: scale every line, put rounding on the last one.
  const factor = total / sumItems(base);
  const scaled = base.map((i) => ({ ...i, price: cents(i.price * factor) }));
  const diff = cents(total - sumItems(scaled));
  const last = scaled[scaled.length - 1];
  scaled[scaled.length - 1] = { ...last, price: cents(last.price + diff / last.qty) };
  return scaled;
}

const INPUT =
  'w-full rounded-md border border-white/15 bg-white/[0.06] px-3 py-2.5 text-base font-semibold text-white placeholder:text-slate-500 focus:border-[#5EC4C9] focus:outline-none';

export default function InvoiceShowcaseSection() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [price, setPrice] = useState(presetPrice(PRESETS[0]));
  const [depositMode, setDepositMode] = useState<'percent' | 'amount'>(PRESETS[0].mode);
  const [depositInput, setDepositInput] = useState(PRESETS[0].deposit);

  const total = cents(Math.min(toNum(price), 10_000_000));
  const rawDeposit = depositMode === 'percent' ? (total * Math.min(toNum(depositInput), 100)) / 100 : toNum(depositInput);
  const deposit = cents(Math.min(rawDeposit, total));
  const balance = cents(total - deposit);
  const items = fitItems(PRESETS[presetIdx].items, total);

  // 0 not sent · 1 deposit sent, waiting · 2 deposit paid · 3 balance sent, waiting · 4 paid in full
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // Any change to the job starts the demo over.
  useEffect(() => {
    setStep(0);
    setToast(null);
  }, [presetIdx, price, depositMode, depositInput]);

  // The customer "pays" a moment after each invoice goes out.
  useEffect(() => {
    if (step !== 1 && step !== 3) return;
    const t = setTimeout(() => {
      setToast(`Customer paid ${fmt(step === 1 ? deposit : balance)} by card`);
      setStep(step + 1);
    }, 1600);
    return () => clearTimeout(t);
  }, [step, deposit, balance]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const hasDeposit = deposit > 0;
  const view: InvoiceView = step <= 1 && hasDeposit ? 'deposit' : step === 4 ? 'paid' : 'balance';
  const waiting = step === 1 || step === 3;
  const depositPaid = step >= 2;
  const fullyPaid = step === 4;

  const action = () => {
    if (step === 0) setStep(hasDeposit ? 1 : 3);
    else if (step === 2) setStep(3);
    else if (step === 4) setStep(0);
  };
  const actionLabel = waiting
    ? 'Waiting for payment…'
    : step === 0
      ? hasDeposit
        ? 'Send deposit invoice'
        : 'Send invoice'
      : step === 2
        ? 'Send balance invoice'
        : 'Start over';
  const ActionIcon = waiting ? Loader2 : step === 4 ? RotateCcw : Send;

  return (
    <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy + try it */}
        <div className="lg:order-2">
          <div className="text-center sm:text-left">
            <Eyebrow dark>Try it</Eyebrow>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
              Pick a job. Send the invoice. Get paid.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Your customer gets a clean PDF with your logo, every line item, what&rsquo;s been paid, and a QR code to pay
              the rest.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={p.job}
                  type="button"
                  onClick={() => {
                    setPresetIdx(idx);
                    setPrice(presetPrice(p));
                    setDepositMode(p.mode);
                    setDepositInput(p.deposit);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    idx === presetIdx
                      ? 'border-[#5EC4C9] bg-[#00828A] text-white'
                      : 'border-white/15 text-slate-300 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {p.job}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Job price</span>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    className={`${INPUT} pl-7`}
                    inputMode="decimal"
                    value={price}
                    placeholder="0"
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </label>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Deposit</span>
                <div className="mt-1 flex gap-2">
                  <input
                    className={INPUT}
                    inputMode="decimal"
                    value={depositInput}
                    placeholder="0"
                    onChange={(e) => setDepositInput(e.target.value)}
                    aria-label={depositMode === 'percent' ? 'Deposit percent' : 'Deposit amount'}
                  />
                  <div className="flex shrink-0 overflow-hidden rounded-md border border-white/15 text-sm font-bold">
                    {(['percent', 'amount'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          if (m === depositMode) return;
                          setDepositMode(m);
                          setDepositInput(m === 'amount' ? String(deposit) : total > 0 ? String(cents((deposit / total) * 100)) : '0');
                        }}
                        className={`px-3 ${m === depositMode ? 'bg-[#00828A] text-white' : 'text-slate-300 hover:bg-white/10'}`}
                      >
                        {m === 'percent' ? '%' : '$'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              {[
                { label: 'Deposit', amount: deposit, paid: depositPaid, hide: !hasDeposit },
                { label: 'Balance', amount: balance, paid: fullyPaid, hide: false },
              ]
                .filter((b) => !b.hide)
                .map((b) => (
                  <div
                    key={b.label}
                    className={`rounded-md border px-3 py-2.5 transition-colors ${
                      b.paid ? 'border-[#5EC4C9]/60 bg-[#00828A]/20' : 'border-white/10'
                    } ${!hasDeposit ? 'col-span-2' : ''}`}
                  >
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {b.label}
                      {b.paid && (
                        <span className="flex items-center gap-0.5 text-[#5EC4C9]">
                          <Check className="h-3 w-3" strokeWidth={3} /> Paid
                        </span>
                      )}
                    </p>
                    <p
                      className={`font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-extrabold ${
                        b.paid ? 'text-[#5EC4C9]' : 'text-white'
                      }`}
                    >
                      {fmt(b.amount)}
                    </p>
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={action}
              disabled={waiting}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#00828A] px-5 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#006e75] disabled:cursor-wait disabled:opacity-80"
            >
              <ActionIcon className={`h-4 w-4 ${waiting ? 'animate-spin' : ''}`} />
              {actionLabel}
            </button>
            <p className="mt-2 text-center text-xs text-slate-500">Demo only. Nothing is sent.</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="lg:order-1 w-full max-w-md mx-auto"
          aria-label="Example Lead2Project invoice"
        >
          <div className="relative">
            <InvoiceMock custom={{ items, total, deposit, view }} />
            <AnimatePresence>
              {toast && (
                <motion.div
                  key={toast}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg"
                  style={{ rotate: 1.5 }}
                  role="status"
                >
                  <CreditCard className="h-4 w-4" /> {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}