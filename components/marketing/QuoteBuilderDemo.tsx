'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, CheckCircle2, FileText, Plus, Send, User, Layers, CalendarDays, CreditCard, Receipt, ImageIcon, Lock, Download, RotateCcw } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// The template loads with 22 squares (t); the demo bumps both to 25 (q) for this roof.
// Final: 2,125 + 4,125 + 5,750 = 12,000 subtotal; 8.625% tax = 1,035; total 13,035; 40% deposit = 5,214.
const ITEMS = [
  { d: 'Tear-off & disposal', t: 22, q: 25, p: 85 },
  { d: 'Architectural shingles', t: 22, q: 25, p: 165 },
  { d: 'Labor & installation', t: 1, q: 1, p: 5750 },
];
const TAX_RATE = 8.625;
const SUBTOTAL = ITEMS.reduce((s, i) => s + i.q * i.p, 0);
const TAX = Math.round(SUBTOTAL * TAX_RATE) / 100;
const TOTAL = SUBTOTAL + TAX;
const DEPOSIT = Math.round(TOTAL * 40) / 100;
const TEMPLATE_SUBTOTAL = ITEMS.reduce((s, i) => s + i.t * i.p, 0);
const TEMPLATE_TOTAL = TEMPLATE_SUBTOTAL + Math.round(TEMPLATE_SUBTOTAL * TAX_RATE) / 100;
const START_QTY = ITEMS.map((i) => i.t);
const FINAL_QTY = ITEMS.map((i) => i.q);

// Job card tabs, like the real app. The demo stays on Quote.
const TABS = [
  { label: 'Overview', icon: User },
  { label: 'Quote', icon: FileText },
  { label: 'Schedule', icon: CalendarDays },
  { label: 'Invoice', icon: CreditCard },
  { label: 'Expenses', icon: Receipt },
  { label: 'Media', icon: ImageIcon },
];

// The saved price templates shown in the picker. The demo picks "Roof Repair".
const TEMPLATES = [
  { name: 'Roof Repair', items: 3, total: TEMPLATE_TOTAL, pick: true },
  { name: 'Gutter Install', items: 4, total: 2850 },
  { name: 'Skylight Replacement', items: 3, total: 3400 },
  { name: 'Siding Repair', items: 5, total: 6200 },
];

// 0 empty · 1 template loaded · 2 sent, customer reading · 3 accepted · 4 on the Invoice tab
type Phase = 0 | 1 | 2 | 3 | 4;
const CAPTIONS: Record<Phase, string> = {
  0: 'Pick one of your saved price templates',
  1: 'Line items, total and deposit, already on the quote',
  2: 'Your customer gets the estimate by email',
  3: 'Accepted! Your customer said yes',
  4: 'Next: send the deposit invoice from the same card',
};
type Tab = 'Quote' | 'Invoice';

export default function QuoteBuilderDemo() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [shown, setShown] = useState(0); // how many line items are visible
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false });
  const [pressing, setPressing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [phonePressing, setPhonePressing] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [toast, setToast] = useState(false);
  const [qty, setQty] = useState<number[]>(START_QTY);
  const [editing, setEditing] = useState<number | null>(null); // which row's quantity is being changed
  const [adjusting, setAdjusting] = useState(false); // shows the "change quantities" caption
  const [tab, setTab] = useState<Tab>('Quote');
  const [done, setDone] = useState(false); // played once; show Replay
  const [runId, setRunId] = useState(0); // bump to replay

  const cardRef = useRef<HTMLDivElement>(null);
  const addBtnRef = useRef<HTMLSpanElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLSpanElement>(null);
  const qtyRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(4);
      setShown(ITEMS.length);
      setQty(FINAL_QTY);
      setAccepted(true);
      setTab('Invoice');
      return;
    }

    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => active && fn(), ms));
    };
    const pointAt = (el: HTMLElement | null) => {
      const card = cardRef.current;
      if (!card || !el) return;
      const c = card.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setCursor({ x: r.left - c.left + r.width * 0.5, y: r.top - c.top + r.height * 0.5, show: true });
    };
    const rest = () => {
      const card = cardRef.current;
      if (!card) return;
      const c = card.getBoundingClientRect();
      setCursor((p) => ({ x: c.width * 0.6, y: c.height * 0.9, show: p.show }));
    };

    const run = () => {
      setPhase(0);
      setShown(0);
      setPickerOpen(false);
      setPicked(false);
      setPhoneVisible(false);
      setAccepted(false);
      setToast(false);
      setQty(START_QTY);
      setEditing(null);
      setAdjusting(false);
      setTab('Quote');
      setDone(false);
      rest();

      at(500, () => setCursor((p) => ({ ...p, show: true })));
      // Open "Add from Saved"
      at(1000, () => pointAt(addBtnRef.current));
      at(2000, () => setPressing(true));
      at(2200, () => {
        setPressing(false);
        setPickerOpen(true);
      });
      // Pick the Roof Repair template
      at(2900, () => pointAt(templateRef.current));
      at(4000, () => setPressing(true));
      at(4200, () => {
        setPressing(false);
        setPicked(true);
      });
      at(4700, () => {
        setPickerOpen(false);
        setPicked(false);
        setPhase(1);
      });
      at(4900, () => setShown(1));
      at(5200, () => setShown(2));
      at(5500, () => setShown(3));
      // Change the quantities for this roof: 22 -> 25 squares on the first two lines
      at(5900, () => {
        setAdjusting(true);
        pointAt(qtyRefs.current[0]);
      });
      at(6800, () => setPressing(true));
      at(7000, () => {
        setPressing(false);
        setEditing(0);
      });
      at(7400, () => setQty((q) => [25, q[1], q[2]]));
      at(7900, () => pointAt(qtyRefs.current[1]));
      at(8600, () => setPressing(true));
      at(8800, () => {
        setPressing(false);
        setEditing(1);
      });
      at(9200, () => setQty((q) => [q[0], 25, q[2]]));
      at(9700, () => {
        setEditing(null);
        setAdjusting(false);
        rest();
      });
      // Send Estimate
      at(10300, () => pointAt(sendBtnRef.current));
      at(11300, () => setPressing(true));
      at(11500, () => {
        setPressing(false);
        setPhase(2);
        setCursor((p) => ({ ...p, show: false }));
      });
      // Customer accepts on their phone
      at(11900, () => setPhoneVisible(true));
      at(13700, () => setPhonePressing(true));
      at(13900, () => {
        setPhonePressing(false);
        setAccepted(true);
      });
      at(15000, () => setPhoneVisible(false));
      at(15300, () => {
        setPhase(3);
        setToast(true);
      });
      // Move to the Invoice tab: the deposit is ready to send
      at(17300, () => {
        setToast(false);
        setTab('Invoice');
        setPhase(4);
      });
      // Play once, then stop on this frame with a Replay button
      at(18800, () => setDone(true));
    };

    run();
    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion, runId]);

  const loaded = shown > 0;
  const subtotal = ITEMS.slice(0, shown).reduce((s, i, idx) => s + qty[idx] * i.p, 0);
  const tax = loaded ? Math.round(subtotal * TAX_RATE) / 100 : 0;
  const total = subtotal + tax;
  const depositDue = Math.round(total * 40) / 100;

  return (
    <div className="w-full max-w-2xl mx-auto lg:ml-0">
      {/* Caption */}
      <div className="mb-3 min-h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={adjusting ? 'adjust' : phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-sm font-semibold text-[#1C1F23]"
          >
            {adjusting ? 'Change anything for this job: 22 squares becomes 25' : CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        ref={cardRef}
        className="relative rounded-lg border border-slate-300 ring-4 ring-slate-100 bg-white shadow-lg overflow-hidden text-[12px] sm:text-sm select-none"
        aria-hidden
      >
        {/* Cursor */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-30 hidden sm:block"
          initial={false}
          animate={{ x: cursor.x, y: cursor.y, opacity: cursor.show ? 1 : 0, scale: pressing ? 0.85 : 1 }}
          transition={{ x: { duration: 0.8, ease: EASE }, y: { duration: 0.8, ease: EASE }, opacity: { duration: 0.3 }, scale: { duration: 0.12 } }}
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

        {/* Template picker (opens from "Add from Saved") */}
        <AnimatePresence>
          {pickerOpen && (
            <motion.div
              key="picker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-slate-900/30 p-3"
            >
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="w-full max-w-xs rounded-xl bg-white p-3 shadow-2xl"
              >
                <p className="text-sm font-bold">Add to Quote</p>
                <div className="mt-2 flex rounded-md bg-slate-100 p-1 text-[11px] font-semibold">
                  <span className="flex-1 py-1 text-center text-slate-500">Line Items</span>
                  <span className="flex-1 rounded bg-white py-1 text-center shadow-sm">Templates</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {TEMPLATES.map((t) => {
                    const isPick = !!t.pick;
                    const highlight = isPick && picked;
                    return (
                      <motion.div
                        key={t.name}
                        ref={isPick ? templateRef : undefined}
                        animate={{ scale: isPick && pressing ? 0.97 : 1 }}
                        transition={{ duration: 0.12 }}
                        className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 transition-colors ${
                          highlight ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Layers className="h-3.5 w-3.5 shrink-0 text-[#00828A]" />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-semibold">{t.name}</p>
                            <p className="text-[10px] text-slate-400">{t.items} items · tax · 40% deposit</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-[12px] font-bold tabular-nums">{fmt(t.total)}</span>
                          {highlight ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50">
                              <Plus className="h-3 w-3 text-[#00828A]" />
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer's phone */}
        <div className="pointer-events-none absolute inset-y-0 right-2 sm:right-5 z-[25] flex items-center">
          <AnimatePresence>
            {phoneVisible && (
              <motion.div
                key="phone"
                initial={{ x: 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 80, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative w-[172px] sm:w-[196px] rounded-[1.6rem] bg-[#1C1F23] p-1.5 shadow-2xl border border-white/10 mt-6"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1C1F23] px-3 py-1 text-[10px] font-semibold text-white shadow-md flex items-center gap-1.5">
                  <User className="w-3 h-3 text-sky-400" /> Customer&rsquo;s Phone
                </div>
                <div className="rounded-[1.25rem] bg-white overflow-hidden text-[10px]">
                  <div className="h-1 bg-[#00828A]" />
                  <AnimatePresence mode="wait">
                    {!accepted ? (
                      <motion.div key="email" exit={{ opacity: 0 }} className="px-3 py-3 space-y-2">
                        <div>
                          <p className="text-slate-500">From Summit Roofing</p>
                          <p className="font-bold text-slate-900">Your estimate for Roof Repair</p>
                        </div>
                        <div className="rounded-md border border-slate-200 divide-y divide-slate-100">
                          {ITEMS.map((i) => (
                            <div key={i.d} className="flex justify-between px-2 py-1">
                              <span className="truncate text-slate-600 pr-1">{i.d}</span>
                              <span className="font-semibold tabular-nums">{fmt(i.q * i.p)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between px-2 py-1 text-slate-500">
                            <span>Tax ({TAX_RATE}%)</span>
                            <span className="tabular-nums">{fmt(TAX)}</span>
                          </div>
                          <div className="flex justify-between bg-slate-50 px-2 py-1 font-bold">
                            <span>Total</span>
                            <span className="tabular-nums">{fmt(TOTAL)}</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 text-[#00828A] font-semibold">
                            <span>Deposit to start</span>
                            <span className="tabular-nums">{fmt(DEPOSIT)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <motion.span
                            animate={{ scale: phonePressing ? 0.93 : 1 }}
                            transition={{ duration: 0.12 }}
                            className="rounded-md bg-[#00828A] py-1.5 text-center font-bold text-white"
                          >
                            Accept
                          </motion.span>
                          <span className="rounded-md border border-slate-300 py-1.5 text-center font-semibold text-slate-600">Decline</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ok"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-7 flex flex-col items-center text-center gap-1.5"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-5 w-5" strokeWidth={3} />
                        </span>
                        <p className="font-bold text-slate-900">Estimate accepted</p>
                        <p className="text-slate-500">Summit Roofing has been notified</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accepted note */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-3 top-14 z-20 flex items-center gap-2 rounded-xl bg-[#1C1F23] px-3.5 py-2.5 text-white shadow-xl text-[11px]"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-semibold">Estimate accepted</p>
                <p className="text-[10px] text-slate-300">Roof Repair · {fmt(TOTAL)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Job header, like the real job card */}
        <div className="flex items-center justify-between gap-3 bg-[#111827] px-4 py-2.5 text-white">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold">Maria Lopez</span>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                phase >= 2 ? 'border-purple-400/40 bg-purple-500/15 text-purple-300' : 'border-blue-400/40 bg-blue-500/15 text-blue-300'
              }`}
            >
              <span className={`h-1 w-1 rounded-full ${phase >= 2 ? 'bg-purple-300' : 'bg-blue-300'}`} />
              {phase >= 2 ? 'Quoted' : 'New'}
            </span>
          </div>
          <span className="shrink-0 text-[10px] text-slate-400">Roof repair · #58</span>
        </div>

        {/* Tabs on phones */}
        <div className="sm:hidden flex gap-1.5 overflow-hidden border-b border-slate-100 px-3 py-2">
          {TABS.slice(0, 4).map(({ label, icon: Icon }) => (
            <span
              key={label}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                label === tab ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-500'
              }`}
            >
              <Icon className="h-3 w-3" /> {label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Sidebar tabs */}
          <div className="hidden sm:block w-[100px] shrink-0 space-y-0.5 border-r border-slate-100 px-1.5 py-2.5 text-[11px]">
            {TABS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 ${
                  label === tab ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-500'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="min-w-0 flex-1">
        {tab === 'Invoice' ? (
          <InvoiceView />
        ) : (
        <>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="font-bold">Quote</p>
            {phase === 3 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
              >
                <Check className="h-3 w-3" /> Accepted
              </motion.span>
            )}
          </div>
          <motion.span
            ref={sendBtnRef}
            animate={{ scale: pressing && phase === 1 && !adjusting ? 0.92 : 1, opacity: loaded ? 1 : 0.4 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#00828A] px-2.5 py-1 text-xs font-bold text-white"
          >
            <Send className="h-3 w-3" /> {phase >= 2 ? 'Sent' : 'Send Estimate'}
          </motion.span>
        </div>

        <div className="p-4 space-y-3">
          {/* Line items */}
          <div className="rounded-md border border-slate-200 min-h-[148px]">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Description</span>
              <span className="text-right">Price × Qty</span>
              <span className="w-20 text-right">Amount</span>
            </div>
            {shown === 0 ? (
              <p className="px-3 py-8 text-center text-slate-400">No line items yet</p>
            ) : (
              ITEMS.slice(0, shown).map((i, idx) => (
                <motion.div
                  key={i.d}
                  initial={{ opacity: 0, y: -6, backgroundColor: 'rgba(0,130,138,0.10)' }}
                  animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,130,138,0)' }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-slate-100 px-3 py-2 last:border-b-0"
                >
                  <span className="truncate font-medium">{i.d}</span>
                  <span className="flex items-center justify-end gap-1 text-slate-500 tabular-nums">
                    {fmt(i.p)} ×
                    <motion.span
                      ref={(el) => {
                        qtyRefs.current[idx] = el;
                      }}
                      key={qty[idx]}
                      initial={{ scale: idx < 2 && qty[idx] !== i.t ? 1.25 : 1 }}
                      animate={{ scale: 1 }}
                      className={`inline-block min-w-[2.1em] rounded border px-1 text-center font-semibold transition-colors ${
                        editing === idx ? 'border-slate-900 bg-white text-slate-900 ring-2 ring-slate-900/15' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {qty[idx]}
                    </motion.span>
                  </span>
                  <span className="w-20 text-right font-semibold tabular-nums">{fmt(qty[idx] * i.p)}</span>
                </motion.div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <motion.span
              ref={addBtnRef}
              animate={{ scale: pressing && phase === 0 && !pickerOpen ? 0.92 : 1 }}
              transition={{ duration: 0.12 }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
            >
              <FileText className="h-3.5 w-3.5 text-[#00828A]" /> Add from Saved
            </motion.span>
            <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-400">
              <Plus className="h-3.5 w-3.5" /> Line item
            </span>
          </div>

          {/* Totals */}
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <div className="flex flex-wrap gap-2 border-b border-slate-100 px-3 py-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  loaded ? 'border border-slate-900 text-slate-900' : 'border border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {loaded ? (
                  `Tax ${TAX_RATE}%`
                ) : (
                  <>
                    <Plus className="h-3 w-3" /> Add tax
                  </>
                )}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  loaded ? 'border border-slate-900 text-slate-900' : 'border border-dashed border-slate-300 text-slate-400'
                }`}
              >
                {loaded ? 'Deposit 40%' : 'Deposit'}
              </span>
            </div>
            <div className="px-3">
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 py-1.5 text-slate-600">
                <span>{loaded ? `Tax (${TAX_RATE}%)` : 'Tax'}</span>
                <span className="tabular-nums">{loaded ? fmt(tax) : '—'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 py-2">
                <span className="font-semibold">Total</span>
                <span className="text-base font-bold tabular-nums">{fmt(total)}</span>
              </div>
            </div>
            <div className="flex justify-between bg-slate-50 px-3 py-2">
              <span className="font-semibold text-slate-900">Deposit due</span>
              <span className="font-bold tabular-nums">{fmt(loaded ? depositDue : 0)}</span>
            </div>
          </div>
        </div>
        </>
        )}
          </div>
        </div>
      </div>

      {/* Replay */}
      <div className="mt-3 flex h-9 justify-center">
        <AnimatePresence>
          {done && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => setRunId((n) => n + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Replay
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* The Invoice tab after the quote is accepted: deposit ready to send, balance locked. */
function InvoiceView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <p className="font-bold">Invoice</p>
        <span className="text-[11px] text-slate-500">#INV-058</span>
      </div>
      <div className="min-h-[430px] space-y-3 p-4">
        <div className="rounded-md border border-slate-200 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-slate-600">
              <span className="font-bold tabular-nums text-slate-900">{fmt(0)}</span> of {fmt(TOTAL)} collected
            </p>
            <span className="font-semibold text-slate-700">0%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100" />
        </div>

        <motion.div
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="rounded-md border border-slate-900 px-3 py-3 ring-1 ring-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">1. Deposit (40%)</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Ready to send</span>
          </div>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-slate-900">{fmt(DEPOSIT)}</p>
          <p className="text-slate-500">Quote accepted, so the deposit is next.</p>
          <div className="mt-2.5 flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white">
              <Send className="h-3 w-3" /> Send Deposit Invoice
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <Download className="h-3 w-3" /> PDF
            </span>
          </div>
        </motion.div>

        <div className="rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-3 py-3 opacity-70">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">2. Remaining balance</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              <Lock className="h-2.5 w-2.5" /> Locked
            </span>
          </div>
          <p className="mt-1 text-lg font-extrabold tabular-nums text-slate-400">{fmt(TOTAL - DEPOSIT)}</p>
          <p className="text-slate-500">Send the final invoice when the job is done.</p>
        </div>
      </div>
    </motion.div>
  );
}