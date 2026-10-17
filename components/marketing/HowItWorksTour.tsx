'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, Camera, Check, CreditCard, Mail, Send, FileText, Lock } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   /how-it-works: one roofing job, request to paid in full.
   Every demo is a mock (no real data, no API calls). Each one
   plays only while it's on screen, loops, and shows its final
   frame for people who turn off motion in their device settings.
   ───────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;
const D = 'font-[family-name:var(--font-display)]';
const BIZ = 'Summit Roofing';
const CUSTOMER = 'Maria Lopez';

// One job's numbers, used by every step so they always agree.
const ITEMS = [
  { name: 'Tear-off & disposal', unit: 'sq', price: 95, perSquare: true },
  { name: 'Architectural shingles', unit: 'sq', price: 210, perSquare: true },
  { name: 'Synthetic underlayment', unit: 'sq', price: 45, perSquare: true },
  { name: 'Ridge vent', unit: 'ft', price: 12, perSquare: false, qty: 40 },
  { name: 'Flashing & drip edge', unit: 'job', price: 650, perSquare: false, qty: 1 },
];
const TEMPLATE_SQ = 20;
const MEASURED_SQ = 25;
const qtyFor = (i: (typeof ITEMS)[number], sq: number) => (i.perSquare ? sq : i.qty ?? 1);
const totalFor = (sq: number) => ITEMS.reduce((s, i) => s + qtyFor(i, sq) * i.price, 0);
const TEMPLATE_TOTAL = totalFor(TEMPLATE_SQ); // 8,130
const TOTAL = totalFor(MEASURED_SQ); // 9,880
const DEPOSIT_PCT = 40;
const DEPOSIT = Math.round(TOTAL * DEPOSIT_PCT) / 100; // 3,952
const BALANCE = TOTAL - DEPOSIT; // 5,928

const money = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* ── Timing helpers ─────────────────────────────────────── */

// Steps through phases while `active`; loops back to 0.
function useSequence(durations: number[], active: boolean, reduced: boolean) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduced || !active) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % durations.length), durations[phase]);
    return () => clearTimeout(t);
  }, [phase, active, reduced, durations]);
  return reduced ? durations.length - 1 : phase;
}

// Types `text` out once `run` turns true; clears when it turns false.
function useTyped(text: string, run: boolean, instant: boolean, speed = 45) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (instant) return;
    if (!run) {
      setN(0);
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [run, text, speed, instant]);
  return instant ? text : text.slice(0, n);
}

// Plays the demo only while at least 40% of it is on screen.
function useDemo(durations: number[]) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = !!useReducedMotion();
  const phase = useSequence(durations, inView, reduced);
  return { ref, phase, reduced };
}

/* ── Frames ─────────────────────────────────────────────── */

function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-[272px] overflow-hidden rounded-[2.2rem] border-[7px] border-[#1C1F23] bg-white shadow-2xl"
      style={{ height: 520 }}
    >
      <div className="absolute left-1/2 top-1.5 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#1C1F23]" />
      <div className="relative h-full overflow-hidden pt-8">{children}</div>
    </div>
  );
}

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="ml-2 truncate text-xs font-medium text-slate-500">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Small "what you see on your end" notification next to a phone demo.
function Notice({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div className="mx-auto mt-4 flex h-11 max-w-[300px] items-center justify-center">
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-md"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BizHeader() {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-4 pb-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1C1F23] text-[11px] font-bold text-white">SR</span>
      <span className="text-sm font-semibold text-slate-900">{BIZ}</span>
    </div>
  );
}

function Caret() {
  return <span className="ml-px inline-block h-4 w-px animate-pulse bg-slate-900 align-middle" />;
}

/* ── Step 1: the customer's request form ────────────────── */

const FORM_T = [900, 1300, 900, 1800, 1000, 700, 2800];

function FormDemo() {
  const { ref, phase, reduced } = useDemo(FORM_T);
  const name = useTyped(CUSTOMER, phase >= 1, reduced, 70);
  const desc = useTyped('Leak over the back bedroom after the storm.', phase >= 3, reduced, 30);
  const done = phase === 6;

  return (
    <div ref={ref}>
      <Phone>
        <BizHeader />
        <div className="space-y-3 px-4 pt-3">
          <p className="text-base font-semibold text-slate-900">Request an estimate</p>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">Name</p>
            <div className="h-9 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900">
              {name}
              {phase === 1 && <Caret />}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">Service</p>
            <div className="flex flex-wrap gap-1.5">
              {['Roof repair', 'Roof replacement', 'Gutters'].map((s) => {
                const on = s === 'Roof replacement' && phase >= 2;
                return (
                  <motion.span
                    key={s}
                    animate={{ scale: on && phase === 2 ? [1, 1.08, 1] : 1 }}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {s}
                  </motion.span>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">What&rsquo;s going on?</p>
            <div className="h-14 rounded-lg border border-slate-200 px-3 py-2 text-sm leading-snug text-slate-900">
              {desc}
              {phase === 3 && <Caret />}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">Photos</p>
            <div className="flex h-14 items-center gap-2">
              {phase >= 4 ? (
                [0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    initial={reduced ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12, duration: 0.3, ease: EASE }}
                    className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-300 to-slate-400"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </motion.span>
                ))
              ) : (
                <span className="flex h-14 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                  <Camera className="h-4 w-4" /> Add photos
                </span>
              )}
            </div>
          </div>

          <motion.div
            animate={{ scale: phase === 5 ? 0.95 : 1 }}
            className={`rounded-lg py-2.5 text-center text-sm font-semibold text-white ${phase === 5 ? 'bg-slate-700' : 'bg-slate-900'}`}
          >
            Send request
          </motion.div>
        </div>

        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white px-6 text-center"
            >
              <motion.span
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900"
              >
                <Check className="h-7 w-7 text-white" strokeWidth={3} />
              </motion.span>
              <p className="text-lg font-semibold text-slate-900">Request sent</p>
              <p className="mt-1 text-sm text-slate-500">{BIZ} got your request and will be in touch.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Phone>

      <Notice show={done}>
        <Mail className="h-4 w-4 text-slate-500" />
        New request: {CUSTOMER}
      </Notice>
    </div>
  );
}

/* ── Step 2: the board ──────────────────────────────────── */

const BOARD_T = [1800, 1700, 1700, 2600];
const COLS = ['New', 'Quoted', 'Scheduled', 'Done'];
const STATIC_CARDS: Record<string, { name: string; sub: string }[]> = {
  New: [{ name: 'J. Carter', sub: 'Gutters' }],
  Quoted: [{ name: 'D. Nguyen', sub: 'Siding · $8,400' }],
  Scheduled: [{ name: 'R. Patel', sub: 'Roof repair · Oct 22' }],
  Done: [{ name: 'K. Walsh', sub: 'Roof replacement' }],
};

function BoardDemo() {
  const { ref, phase } = useDemo(BOARD_T);
  const col = COLS[phase];

  const featured = (
    <motion.div
      key="featured"
      layoutId="tour-featured-card"
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="rounded-lg border-2 border-slate-900 bg-white p-2 shadow-lg"
    >
      <p className="truncate text-[11px] font-semibold text-slate-900">{CUSTOMER}</p>
      <p className="truncate text-[10px] text-slate-500">Roof replacement</p>
      <div className="mt-1.5">
        {phase === 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">New request</span>}
        {phase === 1 && <span className="text-[10px] font-semibold text-slate-700">{money(TOTAL)} quote</span>}
        {phase === 2 && <span className="text-[10px] font-semibold text-emerald-700">Deposit paid</span>}
        {phase === 3 && <span className="text-[10px] font-semibold text-emerald-700">Paid in full</span>}
      </div>
    </motion.div>
  );

  return (
    <div ref={ref}>
      <Screen title="Lead2Project · Board">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {COLS.map((c) => (
            <div key={c} className="min-h-[220px] rounded-lg bg-slate-50 p-1.5">
              <div className="mb-1.5 flex items-center justify-between px-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{c}</span>
                <span className="text-[10px] tabular-nums text-slate-400">{STATIC_CARDS[c].length + (col === c ? 1 : 0)}</span>
              </div>
              <div className="space-y-1.5">
                {col === c && featured}
                {STATIC_CARDS[c].map((s) => (
                  <div key={s.name} className="rounded-lg border border-slate-200 bg-white p-2">
                    <p className="truncate text-[11px] font-medium text-slate-800">{s.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{s.sub}</p>
                    {c === 'Done' && <p className="mt-1 text-[10px] font-semibold text-emerald-700">Paid</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Screen>
    </div>
  );
}

/* ── Step 3: estimate from a template ───────────────────── */

const TEMPLATE_T = [1300, 900, 2200, 1800, 2600];

function TemplateDemo() {
  const { ref, phase, reduced } = useDemo(TEMPLATE_T);
  const picked = phase >= 1;
  const showItems = phase >= 2;
  const sq = phase >= 3 ? MEASURED_SQ : TEMPLATE_SQ;
  const total = phase >= 3 ? TOTAL : TEMPLATE_TOTAL;

  return (
    <div ref={ref}>
      <Screen title={`Quote · ${CUSTOMER}`}>
        <p className="mb-2 text-xs font-medium text-slate-500">Start from a template</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {['Roof replacement', 'Roof repair', 'Gutters'].map((t) => {
            const on = t === 'Roof replacement' && picked;
            return (
              <motion.span
                key={t}
                animate={{ scale: on && phase === 1 ? [1, 1.08, 1] : 1 }}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'
                }`}
              >
                <FileText className="h-3 w-3" />
                {t}
              </motion.span>
            );
          })}
        </div>

        <div className="min-h-[178px] rounded-lg border border-slate-200">
          {showItems ? (
            ITEMS.map((item, i) => {
              const q = qtyFor(item, sq);
              const changed = phase === 3 && item.perSquare;
              return (
                <motion.div
                  key={item.name}
                  initial={reduced ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, backgroundColor: changed ? '#fef3c7' : 'rgba(255,255,255,0)' }}
                  transition={{ delay: phase === 2 ? i * 0.15 : 0, duration: 0.35, ease: EASE }}
                  className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-xs last:border-b-0"
                >
                  <span className="min-w-0 truncate text-slate-800">{item.name}</span>
                  <span className="flex shrink-0 items-center gap-3 tabular-nums">
                    <span className="w-12 text-right text-slate-500">
                      {q} {item.unit}
                    </span>
                    <span className="w-14 text-right font-medium text-slate-900">{money(q * item.price)}</span>
                  </span>
                </motion.div>
              );
            })
          ) : (
            <div className="flex h-[178px] items-center justify-center text-xs text-slate-400">Pick a template to fill in the quote</div>
          )}
        </div>

        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">
              {phase >= 3 ? `Measured: ${MEASURED_SQ} squares` : showItems ? `Template: ${TEMPLATE_SQ} squares` : ' '}
            </span>
            <span className="text-base font-semibold tabular-nums text-slate-900">
              {showItems && (
                <motion.span key={total} initial={reduced ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  {money(total)}
                </motion.span>
              )}
            </span>
          </div>
          <div className="flex h-9 items-center justify-between">
            {phase >= 4 ? (
              <>
                <span className="text-slate-600">
                  Deposit {DEPOSIT_PCT}%: <span className="font-semibold tabular-nums text-slate-900">{money(DEPOSIT)}</span>
                </span>
                <motion.span
                  initial={reduced ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Send className="h-3.5 w-3.5" /> Send quote
                </motion.span>
              </>
            ) : null}
          </div>
        </div>
      </Screen>
    </div>
  );
}

/* ── Step 4: the customer accepts the quote ─────────────── */

const QUOTE_T = [1500, 2400, 900, 2600];

function QuoteDemo() {
  const { ref, phase } = useDemo(QUOTE_T);

  return (
    <div ref={ref}>
      <Phone>
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.div key="inbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4">
              <p className="mb-3 text-lg font-semibold text-slate-900">Inbox</p>
              <motion.div
                animate={{ backgroundColor: ['#ffffff', '#f1f5f9', '#ffffff'] }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="rounded-xl border border-slate-200 p-3"
              >
                <p className="text-sm font-semibold text-slate-900">{BIZ}</p>
                <p className="text-sm text-slate-800">Your quote: {money(TOTAL)}</p>
                <p className="mt-0.5 text-xs text-slate-500">Review and accept online</p>
              </motion.div>
              {['Weekly deals', 'Your order shipped'].map((s) => (
                <div key={s} className="mt-2 rounded-xl border border-slate-100 p-3 opacity-50">
                  <p className="text-sm text-slate-700">{s}</p>
                </div>
              ))}
            </motion.div>
          )}

          {(phase === 1 || phase === 2) && (
            <motion.div key="quote" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <BizHeader />
              <div className="px-4 pt-3">
                <p className="text-xs text-slate-500">Quote for {CUSTOMER}</p>
                <p className="text-base font-semibold text-slate-900">Roof replacement</p>
                <div className="mt-2 rounded-lg border border-slate-200">
                  {ITEMS.map((i) => (
                    <div key={i.name} className="flex justify-between border-b border-slate-100 px-2.5 py-1.5 text-[11px] last:border-b-0">
                      <span className="truncate text-slate-700">{i.name}</span>
                      <span className="tabular-nums text-slate-900">{money(qtyFor(i, MEASURED_SQ) * i.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-900">Total</span>
                  <span className="font-semibold tabular-nums text-slate-900">{money(TOTAL)}</span>
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>Deposit to start ({DEPOSIT_PCT}%)</span>
                  <span className="tabular-nums">{money(DEPOSIT)}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <span className="rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-600">Decline</span>
                  <motion.span
                    animate={{ scale: phase === 2 ? 0.94 : 1 }}
                    className={`rounded-lg py-2 text-center text-sm font-semibold text-white ${phase === 2 ? 'bg-slate-700' : 'bg-slate-900'}`}
                  >
                    Accept quote
                  </motion.span>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="accepted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center px-6 pb-10 text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900"
              >
                <Check className="h-7 w-7 text-white" strokeWidth={3} />
              </motion.span>
              <p className="text-lg font-semibold text-slate-900">Quote accepted</p>
              <p className="mt-1 text-sm text-slate-500">Thanks, Maria. Next up: your {money(DEPOSIT)} deposit to get on the schedule.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Phone>

      <Notice show={phase === 3}>
        <span className="h-2 w-2 rounded-full bg-slate-900" />
        {CUSTOMER} accepted your quote
      </Notice>
    </div>
  );
}

/* ── Step 5: the deposit ────────────────────────────────── */

const DEPOSIT_T = [1400, 1800, 1000, 2800];

function DepositDemo() {
  const { ref, phase, reduced } = useDemo(DEPOSIT_T);
  const card = useTyped('4242 4242 4242 4242', phase >= 1, reduced, 40);
  const paid = phase === 3;

  return (
    <div ref={ref}>
      <Phone>
        <BizHeader />
        <div className="px-4 pt-3">
          <p className="text-xs text-slate-500">Deposit for roof replacement</p>
          <p className="text-3xl font-semibold tabular-nums text-slate-900">{money(DEPOSIT)}</p>
          <p className="mt-1 text-xs text-slate-500">
            {DEPOSIT_PCT}% of {money(TOTAL)} · balance of {money(BALANCE)} due when the job is done
          </p>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-medium text-slate-500">Card</p>
            <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm tabular-nums text-slate-900">
              <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{card}</span>
              {phase === 1 && <Caret />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900">{phase >= 1 ? '12 / 28' : ''}</div>
              <div className="h-10 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900">{phase >= 1 ? '123' : ''}</div>
            </div>
          </div>

          <motion.div
            animate={{ scale: phase === 2 ? 0.95 : 1 }}
            className={`mt-5 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white ${
              phase === 2 ? 'bg-slate-700' : 'bg-slate-900'
            }`}
          >
            <Lock className="h-3.5 w-3.5" /> Pay {money(DEPOSIT)}
          </motion.div>
        </div>

        <AnimatePresence>
          {paid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white px-6 text-center"
            >
              <motion.span
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600"
              >
                <Check className="h-7 w-7 text-white" strokeWidth={3} />
              </motion.span>
              <p className="text-lg font-semibold text-slate-900">Deposit paid</p>
              <p className="mt-1 text-sm text-slate-500">A receipt is on its way to your email.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Phone>

      <Notice show={paid}>
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Deposit received: <span className="font-semibold tabular-nums">{money(DEPOSIT)}</span>
      </Notice>
    </div>
  );
}

/* ── Step 6: the balance ────────────────────────────────── */

const BALANCE_T = [1700, 1100, 1700, 3000];

function BalanceDemo() {
  const { ref, phase, reduced } = useDemo(BALANCE_T);
  const sent = phase >= 1;
  const paid = phase === 3;
  const collected = paid ? TOTAL : DEPOSIT;
  const steps = [
    { label: 'Deposit sent', done: true },
    { label: 'Deposit paid', done: true },
    { label: 'Balance sent', done: sent },
    { label: 'Paid in full', done: paid },
  ];

  return (
    <div ref={ref}>
      <Screen title={`Invoice · ${CUSTOMER}`}>
        <div className="mb-3 grid grid-cols-4 gap-1.5">
          {steps.map((s) => (
            <div key={s.label}>
              <motion.div
                animate={{ backgroundColor: s.done ? '#059669' : '#e2e8f0' }}
                transition={{ duration: 0.4 }}
                className="h-1.5 rounded-full"
              />
              <p className={`mt-1 text-[10px] leading-tight ${s.done ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex items-baseline justify-between text-xs text-slate-500">
            <span>Collected</span>
            <span className="tabular-nums">of {money(TOTAL)}</span>
          </div>
          <motion.p key={collected} initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xl font-semibold tabular-nums text-emerald-700">
            {money(collected)}
          </motion.p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full rounded-full bg-emerald-600"
              animate={{ width: `${(collected / TOTAL) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-slate-500">1. Deposit ({DEPOSIT_PCT}%)</p>
              <p className="text-sm font-semibold tabular-nums text-slate-500">{money(DEPOSIT)}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Paid</span>
          </div>

          <motion.div
            animate={{ borderColor: paid ? '#e2e8f0' : '#0f172a' }}
            className="rounded-lg border-2 px-3 py-2.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">2. Remaining balance</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">{money(BALANCE)}</p>
              </div>
              {paid ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Paid</span>
              ) : sent ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Awaiting</span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Job done</span>
              )}
            </div>
            <div className="mt-2 flex h-8 items-center">
              {!sent ? (
                <motion.span
                  animate={{ scale: phase === 0 ? [1, 1, 0.95, 1] : 1 }}
                  transition={{ duration: 1.6, times: [0, 0.7, 0.85, 1] }}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Send className="h-3.5 w-3.5" /> Send final invoice
                </motion.span>
              ) : paid ? (
                <span className="text-xs font-medium text-emerald-700">Paid by card · receipt sent</span>
              ) : (
                <span className="text-xs text-slate-500">Invoice sent with a pay button · Oct 25</span>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-3 flex h-9 items-center justify-center">
          <AnimatePresence>
            {paid && (
              <motion.span
                initial={reduced ? false : { opacity: 0, scale: 1.4, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                className={`rounded border-2 border-emerald-600 px-3 py-0.5 ${D} text-lg font-extrabold uppercase tracking-wider text-emerald-700`}
              >
                Paid in full · {money(TOTAL)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Screen>
    </div>
  );
}

/* ── Page layout ────────────────────────────────────────── */

function PlanTag({ plan }: { plan: 'Free' | 'Pro' }) {
  return (
    <span
      className={`ml-2 inline-block rounded px-1.5 py-0.5 align-middle ${D} text-[11px] font-bold uppercase tracking-wider ${
        plan === 'Pro' ? 'bg-[#1C1F23] text-[#5EC4C9]' : 'border border-[#1C1F23]/20 text-[#3a3f45]'
      }`}
    >
      {plan}
    </span>
  );
}

function Step({
  n,
  title,
  plan,
  children,
  demo,
  flip = false,
}: {
  n: number;
  title: string;
  plan?: 'Free' | 'Pro';
  children: ReactNode;
  demo: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="border-t border-[#1C1F23]/10 py-14 sm:py-20">
      <div className={`mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16`}>
        <div className={flip ? 'md:order-2' : ''}>
          <p className={`${D} text-5xl font-extrabold text-[#00828A] sm:text-6xl`}>{String(n).padStart(2, '0')}</p>
          <h2 className={`${D} mt-2 text-3xl font-extrabold uppercase leading-[0.95] tracking-tight text-[#1C1F23] sm:text-4xl`}>
            {title}
            {plan && <PlanTag plan={plan} />}
          </h2>
          <div className="mt-4 space-y-3 text-base leading-relaxed text-[#3a3f45] sm:text-lg">{children}</div>
        </div>
        <div className={flip ? 'md:order-1' : ''}>{demo}</div>
      </div>
    </section>
  );
}

export default function HowItWorksTour() {
  return (
    <div className="bg-[#F4EFE6] text-[#1C1F23]">
      <header className="mx-auto max-w-3xl px-4 pb-10 pt-28 text-center sm:px-6 sm:pt-36">
        <p className={`${D} text-sm font-bold uppercase tracking-[0.2em] text-[#00828A]`}>How it works</p>
        <h1 className={`${D} mt-3 text-4xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-6xl`}>
          From request to paid in full
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#3a3f45] sm:text-lg">
          Follow one roofing job through Lead2Project, from the customer&rsquo;s first request to the final payment. Each step plays on its own as you scroll.
        </p>
      </header>

      <Step n={1} title="The customer requests an estimate" plan="Free" demo={<FormDemo />}>
        <p>
          You get your own booking link. Put it on your website, your Google profile, or a QR code on the truck. Customers send their address, what they
          need and what&rsquo;s going on.
        </p>
        <p className="text-sm text-[#5a6068]">Photo and video uploads on the form are part of Pro.</p>
      </Step>

      <Step n={2} title="Every job on one board" plan="Free" demo={<BoardDemo />} flip>
        <p>
          New requests land on your board. Drag each job along as it moves: new, quoted, scheduled, done. Your whole team sees the same board, so nobody
          has to ask where a job stands.
        </p>
      </Step>

      <Step n={3} title="Build the estimate from a template" plan="Pro" demo={<TemplateDemo />}>
        <p>
          Save a price template for each service once. On a new job, pick the template, put in the real measurements, and the line items, total and deposit
          update on their own.
        </p>
      </Step>

      <Step n={4} title="Send the quote. They accept online." demo={<QuoteDemo />} flip>
        <p>
          The customer gets a clean quote by email and accepts it with one tap. No printing, no chasing signatures, and you get notified the moment they
          say yes.
        </p>
      </Step>

      <Step n={5} title="Collect the deposit" plan="Pro" demo={<DepositDemo />}>
        <p>
          Send the deposit request in one tap, or turn on automatic deposit requests so it goes out as soon as they accept. They pay by card, and the job
          shows the deposit as paid.
        </p>
        <p className="text-sm text-[#5a6068]">Card payments go through Stripe, straight to your bank account.</p>
      </Step>

      <Step n={6} title="Collect the balance" plan="Pro" demo={<BalanceDemo />} flip>
        <p>
          When the job is done, send the final invoice with a pay button. You always see what&rsquo;s been paid, what&rsquo;s left and when it&rsquo;s
          due, right on the job.
        </p>
      </Step>

      <section className="bg-[#1C1F23] px-4 py-16 text-center text-white sm:py-20">
        <h2 className={`${D} text-3xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl`}>Try it on your next job</h2>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/75">
          Free to start, with your booking link and board. Pro adds templates, deposits and card payments, with a 14-day free trial.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={`inline-flex items-center gap-2 rounded-md bg-[#00828A] px-7 py-3 ${D} text-base font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#006e75]`}
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/book-demo"
            className={`inline-flex items-center gap-2 rounded-md border border-white/30 px-7 py-3 ${D} text-base font-bold uppercase tracking-wider text-white transition-colors hover:bg-white/10`}
          >
            Get help setting it up
          </Link>
        </div>
      </section>
    </div>
  );
}