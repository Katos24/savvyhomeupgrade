'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  Check,
  CreditCard,
  Mail,
  Send,
  FileText,
  Lock,
  User,
  CalendarDays,
  Receipt,
  ListChecks,
  MessageCircle,
} from 'lucide-react';

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

// 0 board · 1 Maria's request drops in · 2 a second request drops in · 3 pointer to Maria's card
// 4 drag to Quoted · 5 settle · 6 drag to Scheduled · 7 settle · 8 drag to Done · 9 hold
const BOARD_T = [900, 1300, 900, 800, 1000, 900, 1000, 900, 1000, 2200];
const COLS = ['New', 'Quoted', 'Scheduled', 'Done'];
const STATIC_CARDS: Record<string, { name: string; sub: string }[]> = {
  New: [{ name: 'J. Carter', sub: 'Gutters' }],
  Quoted: [{ name: 'D. Nguyen', sub: 'Siding · $8,400' }],
  Scheduled: [{ name: 'R. Patel', sub: 'Roof repair · Oct 22' }],
  Done: [{ name: 'K. Walsh', sub: 'Roof replacement' }],
};

function BoardDemo() {
  const { ref, phase, reduced } = useDemo(BOARD_T);
  const boxRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [cursor, setCursor] = useState({ x: 400, y: 280 });

  // Which column Maria's card is in, and whether it's being dragged.
  const col = reduced ? 'Done' : phase >= 8 ? 'Done' : phase >= 6 ? 'Scheduled' : phase >= 4 ? 'Quoted' : 'New';
  const showMaria = reduced || phase >= 1;
  const showBrooks = reduced || phase >= 2;
  const dragging = phase === 4 || phase === 6 || phase === 8;
  const pressing = phase === 3;
  const toast = phase === 1 || phase === 2;

  // Pointer follows the card: onto it, then along with it to each new column.
  useEffect(() => {
    if (reduced) return;
    const box = boxRef.current;
    if (!box) return;
    if (phase < 3) {
      setCursor({ x: box.clientWidth * 0.85, y: box.clientHeight * 0.9 });
      return;
    }
    const el = colRefs.current[col];
    if (!el) return;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setCursor({ x: r.left - b.left + r.width * 0.6, y: r.top - b.top + 46 });
  }, [phase, col, reduced]);

  const badge =
    col === 'New' ? (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">New request</span>
    ) : col === 'Quoted' ? (
      <span className="text-[10px] font-semibold text-slate-700">{money(TOTAL)} quote sent</span>
    ) : col === 'Scheduled' ? (
      <span className="text-[10px] font-semibold text-emerald-700">Deposit paid · Oct 24</span>
    ) : (
      <span className="text-[10px] font-semibold text-emerald-700">Paid in full</span>
    );

  return (
    <div ref={ref}>
      <Screen title="Lead2Project · Board">
        <div ref={boxRef} className="relative">
          <Cursor x={cursor.x} y={cursor.y} show={!reduced && phase >= 3} pressing={pressing} />

          {/* "New request" notice when one comes in from the booking link */}
          <div className="pointer-events-none absolute inset-x-0 -top-1 z-20 flex justify-center">
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg"
                >
                  <Mail className="h-3 w-3" /> {phase === 1 ? `New request: ${CUSTOMER}` : 'New request: T. Brooks'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-8 sm:gap-2">
            {COLS.map((c) => {
              const count = STATIC_CARDS[c].length + (showMaria && col === c ? 1 : 0) + (c === 'New' && showBrooks ? 1 : 0);
              return (
                <div
                  key={c}
                  ref={(el) => {
                    colRefs.current[c] = el;
                  }}
                  className={`min-h-[250px] rounded-lg p-1.5 transition-colors ${
                    dragging && col === c ? 'bg-slate-200/70' : 'bg-slate-50'
                  }`}
                >
                  <div className="mb-1.5 flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{c}</span>
                    <span className="text-[10px] tabular-nums text-slate-400">{count}</span>
                  </div>
                  <div className="space-y-1.5">
                    {showMaria && col === c && (
                      <motion.div
                        layoutId="tour-featured-card"
                        initial={phase === 1 ? { opacity: 0, y: -24 } : false}
                        animate={{ opacity: 1, y: 0, scale: dragging ? 1.06 : 1, rotate: dragging ? 2 : 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                        className={`relative z-10 rounded-lg border-2 border-slate-900 bg-white p-2 ${dragging ? 'shadow-2xl' : 'shadow-md'}`}
                      >
                        <p className="truncate text-[11px] font-semibold text-slate-900">{CUSTOMER}</p>
                        <p className="truncate text-[10px] text-slate-500">Roof replacement</p>
                        <div className="mt-1.5">{badge}</div>
                      </motion.div>
                    )}
                    {c === 'New' && showBrooks && (
                      <motion.div
                        initial={reduced ? false : { opacity: 0, y: -24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                        className="rounded-lg border border-slate-200 bg-white p-2"
                      >
                        <p className="truncate text-[11px] font-medium text-slate-800">T. Brooks</p>
                        <p className="truncate text-[10px] text-slate-500">Siding repair</p>
                        <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800">New request</span>
                      </motion.div>
                    )}
                    {STATIC_CARDS[c].map((s) => (
                      <div key={s.name} className="rounded-lg border border-slate-200 bg-white p-2">
                        <p className="truncate text-[11px] font-medium text-slate-800">{s.name}</p>
                        <p className="truncate text-[10px] text-slate-500">{s.sub}</p>
                        {c === 'Done' && <p className="mt-1 text-[10px] font-semibold text-emerald-700">Paid</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Screen>
    </div>
  );
}

/* ── Step 3: estimate from a template ───────────────────── */

// See TemplateDemo for what each phase does.
const TEMPLATE_T = [1100, 600, 1700, 700, 1000, 700, 1000, 700, 1000, 900, 350, 2200];

// The demo's fake mouse pointer (same look as the home page hero).
function Cursor({ x, y, show, pressing }: { x: number; y: number; show: boolean; pressing: boolean }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-30"
      initial={false}
      animate={{ x, y, opacity: show ? 1 : 0, scale: pressing ? 0.85 : 1 }}
      transition={{
        x: { duration: 0.7, ease: EASE },
        y: { duration: 0.7, ease: EASE },
        opacity: { duration: 0.25 },
        scale: { duration: 0.12 },
      }}
    >
      <AnimatePresence>
        {pressing && (
          <motion.span
            initial={{ opacity: 0.5, scale: 0 }}
            animate={{ opacity: 0, scale: 2.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#00828A]/40"
          />
        )}
      </AnimatePresence>
      <svg width="20" height="20" viewBox="0 0 24 24" className="relative -translate-x-[3px] -translate-y-[2px] drop-shadow-md">
        <path d="M4 2l16 9.5-7 1.6-3.6 6.4z" fill="#1C1F23" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
}

function TemplateDemo() {
  const { ref, phase, reduced } = useDemo(TEMPLATE_T);
  const boxRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);
  const sendRef = useRef<HTMLSpanElement>(null);
  const qtyRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [cursor, setCursor] = useState({ x: 380, y: 260 });
  const [counter, setCounter] = useState(TEMPLATE_SQ);

  // Phases: 0 move to template · 1 click · 2 items fill in
  // 3/5/7 move to a quantity · 4/6/8 count it up · 9 move to Send · 10 click · 11 sent
  const editRow = phase >= 3 && phase <= 8 ? Math.floor((phase - 3) / 2) : -1; // which per-square row
  const counting = phase === 4 || phase === 6 || phase === 8;
  const picked = phase >= 1;
  const showItems = phase >= 2;
  const sent = phase === 11;
  const pressing = phase === 1 || phase === 10;

  // Quantity shown for the k-th per-square row (0, 1, 2).
  const qtyForRow = (k: number) => {
    if (reduced) return MEASURED_SQ;
    const countPhase = 4 + k * 2;
    if (phase > countPhase) return MEASURED_SQ;
    if (phase === countPhase) return counter;
    return TEMPLATE_SQ;
  };
  let sqIndex = -1;
  const rows = ITEMS.map((item) => {
    if (!item.perSquare) return { item, k: -1, q: item.qty ?? 1 };
    sqIndex += 1;
    return { item, k: sqIndex, q: qtyForRow(sqIndex) };
  });
  const total = rows.reduce((s, r) => s + r.q * r.item.price, 0);
  const deposit = Math.round(total * DEPOSIT_PCT) / 100;

  // Move the pointer to whatever this phase is about to click.
  useEffect(() => {
    if (reduced) return;
    const box = boxRef.current;
    if (!box) return;
    const target =
      phase <= 1 ? chipRef.current : editRow >= 0 ? qtyRefs.current[editRow] : phase === 9 || phase === 10 ? sendRef.current : null;
    if (!target) {
      setCursor({ x: box.clientWidth * 0.78, y: box.clientHeight * 0.92 });
      return;
    }
    const b = box.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    setCursor({ x: r.left - b.left + r.width * 0.6, y: r.top - b.top + r.height * 0.6 });
  }, [phase, editRow, reduced]);

  // The quantity being edited counts up one at a time.
  useEffect(() => {
    if (reduced || !counting) return;
    setCounter(TEMPLATE_SQ);
    const id = setInterval(() => {
      setCounter((v) => {
        if (v >= MEASURED_SQ) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 170);
    return () => clearInterval(id);
  }, [counting, phase, reduced]);

  return (
    <div ref={ref}>
      <Screen title={`Quote · ${CUSTOMER}`}>
        <div ref={boxRef} className="relative">
          <Cursor x={cursor.x} y={cursor.y} show={!reduced && !sent} pressing={pressing} />

          <p className="mb-2 text-xs font-medium text-slate-500">Start from a template</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {['Roof replacement', 'Roof repair', 'Gutters'].map((t) => {
              const on = t === 'Roof replacement' && picked;
              return (
                <span
                  key={t}
                  ref={t === 'Roof replacement' ? chipRef : undefined}
                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <FileText className="h-3 w-3" />
                  {t}
                </span>
              );
            })}
          </div>

          <div className="min-h-[196px] rounded-lg border border-slate-200">
            {showItems ? (
              rows.map(({ item, k, q }, i) => {
                const editing = k >= 0 && k === editRow;
                return (
                  <motion.div
                    key={item.name}
                    initial={reduced ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: phase === 2 ? i * 0.15 : 0, duration: 0.35, ease: EASE }}
                    className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-1.5 text-xs last:border-b-0"
                  >
                    <span className="min-w-0 truncate text-slate-800">{item.name}</span>
                    <span className="flex shrink-0 items-center gap-2 tabular-nums">
                      <span className="flex items-center gap-1 text-slate-500">
                        <span
                          ref={(el) => {
                            if (k >= 0) qtyRefs.current[k] = el;
                          }}
                          className={`inline-flex h-6 min-w-[34px] items-center justify-center rounded border px-1 font-semibold text-slate-900 transition-colors ${
                            editing ? 'border-slate-900 ring-2 ring-slate-900/15' : 'border-slate-200'
                          }`}
                        >
                          {q}
                          {editing && counting && <Caret />}
                        </span>
                        <span className="w-6">{item.unit}</span>
                      </span>
                      <span className="w-14 text-right font-medium text-slate-900">{money(q * item.price)}</span>
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex h-[196px] items-center justify-center text-xs text-slate-400">Pick a template to fill in the quote</div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Total</span>
            <span className="text-base font-semibold tabular-nums text-slate-900">{showItems ? money(total) : ' '}</span>
          </div>
          <div className="mt-1.5 flex h-9 items-center justify-between">
            {showItems ? (
              <>
                <span className="text-sm text-slate-600">
                  Deposit {DEPOSIT_PCT}%: <span className="font-semibold tabular-nums text-slate-900">{money(deposit)}</span>
                </span>
                <motion.span
                  ref={sendRef}
                  animate={{ scale: phase === 10 ? 0.93 : 1 }}
                  transition={{ duration: 0.12 }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                    sent ? 'bg-slate-700' : 'bg-slate-900'
                  }`}
                >
                  {sent ? (
                    <>
                      <Check className="h-3.5 w-3.5" strokeWidth={3} /> Quote sent
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Send quote
                    </>
                  )}
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

/* ── Step 7: the whole job on one card ──────────────────── */

const CARD_TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'quote', label: 'Quote', icon: FileText },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays },
  { key: 'invoice', label: 'Invoice', icon: CreditCard },
  { key: 'expenses', label: 'Expenses', icon: Receipt },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'activity', label: 'Activity', icon: MessageCircle },
] as const;
// The tabs the pointer visits, in order.
const CARD_TOUR = ['overview', 'quote', 'schedule', 'invoice', 'activity'] as const;
const CARD_T = CARD_TOUR.map(() => 2700);

function CardRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-1.5 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

function CardPane({ tab }: { tab: string }) {
  if (tab === 'overview')
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 leading-snug text-slate-800">
          Roof is about 20 years old and missing shingles. Want a price on a full replacement.
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-slate-300 to-slate-400">
              <Camera className="h-3.5 w-3.5 text-white" />
            </span>
          ))}
        </div>
        <div>
          <CardRow label="Address" value="47 Maple Ave, Levittown" />
          <CardRow label="How soon" value="Within a month" />
          <CardRow label="Heard about you" value="Truck QR code" />
        </div>
      </div>
    );
  if (tab === 'quote')
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-slate-900">Roof replacement</span>
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">Accepted Oct 7</span>
        </div>
        <div className="rounded-lg border border-slate-200 px-2">
          {ITEMS.map((i) => (
            <div key={i.name} className="flex justify-between border-b border-slate-100 py-1 last:border-b-0">
              <span className="truncate text-slate-700">{i.name}</span>
              <span className="tabular-nums text-slate-900">{money(qtyFor(i, MEASURED_SQ) * i.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-semibold text-slate-900">
          <span>Total</span>
          <span className="tabular-nums">{money(TOTAL)}</span>
        </div>
      </div>
    );
  if (tab === 'schedule')
    return (
      <div className="space-y-2">
        <div className="rounded-lg border-2 border-slate-900 p-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Scheduled</p>
          <p className="text-sm font-semibold text-slate-900">Fri, Oct 24</p>
          <p className="text-slate-600">8:00 AM – 4:00 PM</p>
        </div>
        <div>
          <p className="mb-1 text-slate-500">Crew</p>
          <div className="flex gap-1.5">
            {['Mike R.', 'Jose T.'].map((n) => (
              <span key={n} className="rounded-full border border-slate-900 px-2 py-0.5 font-medium text-slate-900">
                {n}
              </span>
            ))}
          </div>
        </div>
        <p className="flex items-center gap-1 text-slate-600">
          <Check className="h-3 w-3" strokeWidth={3} /> Customer emailed the date and time
        </p>
      </div>
    );
  if (tab === 'invoice')
    return (
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-slate-500">
            <span>Collected</span>
            <span className="tabular-nums">of {money(TOTAL)}</span>
          </div>
          <p className="text-base font-semibold tabular-nums text-emerald-700">{money(DEPOSIT)}</p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${DEPOSIT_PCT}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-2 py-1.5">
          <span className="text-slate-600">1. Deposit ({DEPOSIT_PCT}%)</span>
          <span className="flex items-center gap-1.5">
            <span className="tabular-nums text-slate-500">{money(DEPOSIT)}</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">Paid</span>
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg border-2 border-slate-900 px-2 py-1.5">
          <span className="font-semibold text-slate-900">2. Balance</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold tabular-nums text-slate-900">{money(BALANCE)}</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">After the job</span>
          </span>
        </div>
      </div>
    );
  // activity
  const events: { d: string; t: string; paid?: boolean }[] = [
    { d: 'Oct 3', t: 'Request came in from your booking link' },
    { d: 'Oct 6', t: `Quote sent · ${money(TOTAL)}` },
    { d: 'Oct 7', t: 'Customer accepted the quote' },
    { d: 'Oct 7', t: `Deposit paid by card · ${money(DEPOSIT)}`, paid: true },
    { d: 'Oct 8', t: 'Scheduled for Oct 24, customer emailed' },
  ];
  return (
    <div className="space-y-1.5">
      {events.map((e, i) => (
        <motion.div
          key={e.t}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.3 }}
          className="flex items-start gap-2"
        >
          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${e.paid ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <span className="w-9 shrink-0 text-slate-400">{e.d}</span>
          <span className={e.paid ? 'font-medium text-emerald-800' : 'text-slate-800'}>{e.t}</span>
        </motion.div>
      ))}
    </div>
  );
}

function CardDemo() {
  const { ref, phase, reduced } = useDemo(CARD_T);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState<string>(reduced ? 'activity' : 'overview');
  const [pressing, setPressing] = useState(false);
  const [cursor, setCursor] = useState({ x: 60, y: 200 });

  // Each phase: move the pointer to the next tab, click it, show it.
  useEffect(() => {
    if (reduced) {
      setActive('activity');
      return;
    }
    const tab = CARD_TOUR[phase];
    const box = boxRef.current;
    const el = tabRefs.current[tab];
    if (box && el) {
      const b = box.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setCursor({ x: r.left - b.left + r.width * 0.55, y: r.top - b.top + r.height * 0.6 });
    }
    const press = setTimeout(() => setPressing(true), 750);
    const show = setTimeout(() => {
      setPressing(false);
      setActive(tab);
    }, 900);
    return () => {
      clearTimeout(press);
      clearTimeout(show);
    };
  }, [phase, reduced]);

  const label = CARD_TABS.find((t) => t.key === active)?.label;

  return (
    <div ref={ref}>
      <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-xl border border-slate-200 bg-white text-[11px] shadow-2xl">
        <div ref={boxRef} className="relative">
          <Cursor x={cursor.x} y={cursor.y} show={!reduced} pressing={pressing} />

          {/* Header: the same on every tab */}
          <div className="bg-[#111827] px-3.5 pb-2.5 pt-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{CUSTOMER}</span>
              <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-slate-200">Scheduled</span>
            </div>
            <p className="text-[10px] text-slate-400">Roof replacement · #48</p>
            <div className="mt-2 grid grid-cols-4 divide-x divide-white/10 border-t border-white/10 pt-1.5 text-[10px]">
              <div className="pr-1.5">
                <p className="text-slate-400">Quote</p>
                <p className="font-semibold">{money(TOTAL)}</p>
              </div>
              <div className="px-1.5">
                <p className="text-slate-400">Deposit</p>
                <p className="font-semibold text-emerald-400">Paid</p>
              </div>
              <div className="px-1.5">
                <p className="text-slate-400">Balance</p>
                <p className="font-semibold tabular-nums">{money(BALANCE)}</p>
              </div>
              <div className="pl-1.5">
                <p className="text-slate-400">Scheduled</p>
                <p className="font-semibold">Oct 24</p>
              </div>
            </div>
          </div>

          {/* Tabs + content */}
          <div className="flex">
            <div className="w-[104px] shrink-0 space-y-0.5 border-r border-slate-100 p-1.5">
              {CARD_TABS.map((t) => {
                const Icon = t.icon;
                const on = t.key === active;
                return (
                  <div
                    key={t.key}
                    ref={(el) => {
                      tabRefs.current[t.key] = el;
                    }}
                    className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors ${
                      on ? 'bg-slate-900 font-semibold text-white' : 'text-slate-600'
                    }`}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    {t.label}
                  </div>
                );
              })}
            </div>
            <div className="h-[236px] min-w-0 flex-1 overflow-hidden p-2.5">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardPane tab={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ad: deposit and balance from the contractor's side ─── */

// 0 pointer to Send deposit · 1 click · 2 sent, customer's phone slides in · 3 they tap Pay
// 4 paid on the phone · 5 phone leaves, deposit shows Paid · 6 pointer to Send final invoice
// 7 click · 8 sent, phone slides in · 9 they tap Pay · 10 paid · 11 paid in full
const PAID_T = [1000, 350, 900, 1300, 900, 1100, 1000, 350, 900, 1300, 900, 2600];

function PaidDemo() {
  const { ref, phase, reduced } = useDemo(PAID_T);
  const boxRef = useRef<HTMLDivElement>(null);
  const depBtnRef = useRef<HTMLSpanElement>(null);
  const balBtnRef = useRef<HTMLSpanElement>(null);
  const [cursor, setCursor] = useState({ x: 300, y: 300 });

  const p = reduced ? 11 : phase;
  const depSent = p >= 2;
  const depPaid = p >= 5;
  const balSent = p >= 8;
  const allPaid = p >= 11;
  const collected = allPaid ? TOTAL : depPaid ? DEPOSIT : 0;
  const phoneFor: 'deposit' | 'balance' | null = p >= 2 && p <= 4 ? 'deposit' : p >= 8 && p <= 10 ? 'balance' : null;
  const phonePaid = p === 4 || p === 10;
  const tapping = p === 3 || p === 9;
  const pressing = p === 1 || p === 7;

  useEffect(() => {
    if (reduced) return;
    const box = boxRef.current;
    const target = p <= 1 ? depBtnRef.current : p === 6 || p === 7 ? balBtnRef.current : null;
    if (!box) return;
    if (!target) {
      setCursor({ x: box.clientWidth * 0.3, y: box.clientHeight * 0.95 });
      return;
    }
    const b = box.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    setCursor({ x: r.left - b.left + r.width * 0.6, y: r.top - b.top + r.height * 0.6 });
  }, [p, reduced]);

  const steps = [
    { label: 'Deposit sent', done: depSent },
    { label: 'Deposit paid', done: depPaid },
    { label: 'Balance sent', done: balSent },
    { label: 'Paid in full', done: allPaid },
  ];
  const pill = (kind: 'paid' | 'awaiting' | 'idle', text: string) => (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        kind === 'paid' ? 'bg-emerald-100 text-emerald-800' : kind === 'awaiting' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {text}
    </span>
  );

  return (
    <div ref={ref}>
      <Screen title={`Invoice · ${CUSTOMER}`}>
        <div ref={boxRef} className="relative">
          <Cursor x={cursor.x} y={cursor.y} show={!reduced && phoneFor === null && !allPaid} pressing={pressing} />

          {/* The customer's phone */}
          <div className="pointer-events-none absolute -right-1 top-6 z-20">
            <AnimatePresence>
              {phoneFor && (
                <motion.div
                  key={phoneFor}
                  initial={{ x: 60, opacity: 0, scale: 0.92 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: 60, opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative w-[176px] rounded-[1.5rem] border border-white/10 bg-[#1C1F23] p-1.5 shadow-2xl"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1C1F23] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                    Customer&rsquo;s phone
                  </div>
                  <div className="overflow-hidden rounded-[1.15rem] bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px]">
                      <span className="font-semibold text-slate-600">{BIZ}</span>
                      <span className="text-slate-400">now</span>
                    </div>
                    {phonePaid ? (
                      <div className="flex flex-col items-center gap-1.5 px-3 py-6 text-center">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600">
                          <Check className="h-5 w-5 text-white" strokeWidth={3} />
                        </span>
                        <p className="text-[12px] font-semibold text-slate-900">Payment sent</p>
                        <p className="text-[10px] tabular-nums text-slate-500">{money(phoneFor === 'deposit' ? DEPOSIT : BALANCE)} paid</p>
                      </div>
                    ) : (
                      <div className="space-y-2 px-3 py-3">
                        <div>
                          <p className="text-[12px] font-semibold leading-tight text-slate-900">
                            {phoneFor === 'deposit' ? 'Deposit request' : 'Final invoice'}
                          </p>
                          <p className="text-[10px] text-slate-500">Roof replacement</p>
                        </div>
                        <p className="text-lg font-bold tabular-nums text-slate-900">{money(phoneFor === 'deposit' ? DEPOSIT : BALANCE)}</p>
                        <motion.div
                          animate={{ scale: tapping ? [1, 1, 0.92, 1] : 1 }}
                          transition={{ duration: 1.3, times: [0, 0.75, 0.88, 1] }}
                          className="flex items-center justify-center gap-1 rounded-lg bg-slate-900 py-1.5 text-[11px] font-semibold text-white"
                        >
                          <CreditCard className="h-3 w-3" /> Pay by card
                        </motion.div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {steps.map((s) => (
              <div key={s.label}>
                <motion.div animate={{ backgroundColor: s.done ? '#059669' : '#e2e8f0' }} transition={{ duration: 0.4 }} className="h-1.5 rounded-full" />
                <p className={`mt-1 text-[10px] leading-tight ${s.done ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-baseline justify-between text-xs text-slate-500">
              <span>Collected</span>
              <span className="tabular-nums">of {money(TOTAL)}</span>
            </div>
            <p className="text-lg font-semibold tabular-nums text-emerald-700">{money(collected)}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div className="h-full rounded-full bg-emerald-600" animate={{ width: `${(collected / TOTAL) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className={`rounded-lg px-3 py-2.5 ${depPaid ? 'border border-slate-200' : 'border-2 border-slate-900'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">1. Deposit ({DEPOSIT_PCT}%)</p>
                  <p className="text-base font-semibold tabular-nums text-slate-900">{money(DEPOSIT)}</p>
                </div>
                {depPaid ? pill('paid', 'Paid') : depSent ? pill('awaiting', 'Awaiting') : pill('idle', 'Not sent')}
              </div>
              {!depSent && (
                <motion.span
                  ref={depBtnRef}
                  animate={{ scale: p === 1 ? 0.93 : 1 }}
                  transition={{ duration: 0.12 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Send className="h-3.5 w-3.5" /> Send deposit request
                </motion.span>
              )}
              {depSent && !depPaid && <p className="mt-1 text-xs text-slate-500">Sent with a pay button</p>}
            </div>

            <div
              className={`rounded-lg px-3 py-2.5 ${
                allPaid ? 'border border-slate-200' : depPaid ? 'border-2 border-slate-900' : 'border border-dashed border-slate-300 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">2. Balance</p>
                  <p className="text-base font-semibold tabular-nums text-slate-900">{money(BALANCE)}</p>
                </div>
                {allPaid ? pill('paid', 'Paid') : balSent ? pill('awaiting', 'Awaiting') : pill('idle', depPaid ? 'Job done' : 'After the job')}
              </div>
              {depPaid && !balSent && (
                <motion.span
                  ref={balBtnRef}
                  animate={{ scale: p === 7 ? 0.93 : 1 }}
                  transition={{ duration: 0.12 }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <Send className="h-3.5 w-3.5" /> Send final invoice
                </motion.span>
              )}
              {balSent && !allPaid && <p className="mt-1 text-xs text-slate-500">Sent with a pay button</p>}
            </div>
          </div>

          <div className="mt-2 flex h-9 items-center justify-center">
            <AnimatePresence>
              {allPaid && (
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
          See exactly how a job goes from &ldquo;can you come take a look?&rdquo; to paid in full. No spreadsheets, no chasing.
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

      <Step n={7} title="All of it, on one card" demo={<CardDemo />}>
        <p>
          The request, the quote, the schedule, the deposit, the invoice and every update live on the same job card. Click any tab and it&rsquo;s right
          there. Nothing to attach, nothing to go looking for.
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

// Used by the ad recording page (app/ad/page.tsx).
export { FormDemo, BoardDemo, TemplateDemo, QuoteDemo, DepositDemo, BalanceDemo, CardDemo, PaidDemo };
export { FORM_T, BOARD_T, TEMPLATE_T, QUOTE_T, DEPOSIT_T, BALANCE_T, CARD_T, PAID_T };