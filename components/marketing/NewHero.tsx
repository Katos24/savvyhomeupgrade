'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Send,
  Copy,
  Check,
  Lock,
  User,
  FileText,
  CalendarDays,
  CreditCard,
  Receipt,
  ListChecks,
  ImageIcon,
  Bell,
  MessageCircle,
  MoreVertical,
  MoreHorizontal,
  X,
  Download,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import QuoteBuilderDemo from '@/components/marketing/QuoteBuilderDemo';

// Your demo booking link. Leave empty to hide the "Book a demo" button.
const DEMO_URL = '/book-demo';

const EASE = [0.22, 1, 0.36, 1] as const;

const SIDEBAR = [
  { icon: User, label: 'Overview' },
  { icon: FileText, label: 'Quote' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: CreditCard, label: 'Invoice', active: true },
  { icon: Receipt, label: 'Expenses' },
  { icon: ListChecks, label: 'Tasks' },
  { icon: ImageIcon, label: 'Media' },
  { icon: Bell, label: 'Reminders' },
  { icon: MessageCircle, label: 'Activity' },
];

// Mobile: same bottom tab bar as the real app
const MOBILE_TABS = [
  { icon: User, label: 'Overview' },
  { icon: FileText, label: 'Quote' },
  { icon: CalendarDays, label: 'Schedule' },
  { icon: CreditCard, label: 'Invoice', active: true },
  { icon: MoreHorizontal, label: 'More' },
];

// 0: Deposit Due · 1: Deposit Sent · 2: Customer Paying · 3: Deposit Secured
type Phase = 0 | 1 | 2 | 3;

const CAPTIONS: Record<Phase, string> = {
  0: 'You send the deposit request from the job card',
  1: 'Your customer receives a link and pays on their phone',
  2: 'Your customer receives a link and pays on their phone',
  3: 'Deposit secured! You are ready to start work.',
};

/* ───────────────────────── Hero ───────────────────────── */

export default function Hero() {
  return (
    <div
      className="bg-[#F4EFE6] text-[#1C1F23] antialiased selection:bg-[#00828A]/20 overflow-x-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-14 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* ── Copy ── */}
            <div className="lg:col-span-6 flex flex-col space-y-6 sm:space-y-7 text-center sm:text-left">
              <h1 className="font-[family-name:var(--font-display)] text-[52px] sm:text-7xl lg:text-[80px] xl:text-[88px] font-extrabold uppercase leading-[0.88] tracking-tight text-[#1C1F23]">
                <span className="block">Quote it.</span>
                <span className="block">Win it.</span>
                <span className="relative inline-block whitespace-nowrap">
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
                    className="absolute -left-[0.06em] -right-[0.1em] bottom-[0.06em] h-[0.38em] origin-left -rotate-1 rounded-[0.08em] bg-[#5EC4C9]/70"
                  />
                  <span className="relative text-[#00828A]">Get paid.</span>
                </span>
              </h1>

              <p className="text-[17px] sm:text-lg lg:text-xl text-[#3a3f45] leading-relaxed max-w-[36ch] mx-auto sm:mx-0 sm:max-w-xl">
                Every request becomes one card. Quote it, collect the deposit up front, schedule it, and send the
                final invoice, all without leaving the job.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4"
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto bg-[#00828A] hover:bg-[#006e75] active:scale-[0.98] text-white font-[family-name:var(--font-display)] text-base sm:text-lg font-bold uppercase tracking-wider px-8 py-3.5 sm:py-4 rounded-md shadow-md transition-all text-center min-h-[48px] flex items-center justify-center"
                >
                  Start free
                </Link>
                {DEMO_URL && (
                  <Link
                    href={DEMO_URL}
                    className="w-full sm:w-auto bg-white text-[#1C1F23] hover:bg-slate-50 active:scale-[0.98] font-[family-name:var(--font-display)] text-base sm:text-lg font-bold uppercase tracking-wider px-7 py-3.5 sm:py-4 rounded-md border border-slate-300 shadow-md transition-all text-center min-h-[48px] flex items-center justify-center"
                  >
                    Book a 15-min demo
                  </Link>
                )}
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 sm:gap-x-6 text-sm sm:text-base font-semibold text-[#3a3f45]"
              >
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00828A] shrink-0" /> Free plan
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00828A] shrink-0" /> Card payments through Stripe
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00828A] shrink-0" /> Quotes customers accept online
                </li>
              </motion.ul>
            </div>

            {/* ── Auto-play demo ── */}
            <motion.div
              className="lg:col-span-6 w-full overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <QuoteBuilderDemo />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────── Demo ───────────────────────── */

export function JobDemo() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Interactions
  const [cursor, setCursor] = useState({ x: 0, y: 0, show: false });
  const [pressing, setPressing] = useState(false); // Contractor mouse press
  const [phonePressing, setPhonePressing] = useState(false); // Customer finger tap

  const [phoneVisible, setPhoneVisible] = useState(false);
  const [phonePaid, setPhonePaid] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const depositBtnRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(3);
      return;
    }

    let isActive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => {
      timers.push(setTimeout(() => { if (isActive) fn(); }, ms));
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
      setCursor((p) => ({ x: c.width * 0.55, y: c.height * 0.92, show: p.show }));
    };

    const runSequence = () => {
      // 0. Reset state for loop
      setPhase(0);
      setShowSuccess(false);
      setPhoneVisible(false);
      setPhonePaid(false);
      rest();

      at(500, () => setCursor((p) => ({ ...p, show: true })));

      // 1. Contractor clicks deposit send button
      at(1000, () => pointAt(depositBtnRef.current));
      at(2100, () => setPressing(true));
      at(2300, () => {
        setPressing(false);
        setPhase(1);
        setCursor((p) => ({ ...p, show: false })); // Hide contractor cursor
        rest(); // Move hidden cursor back to start
      });

      // 2. Customer gets phone notification & taps pay
      at(2800, () => {
        setPhase(2);
        setPhoneVisible(true);
      });
      at(4600, () => setPhonePressing(true));
      at(4800, () => {
        setPhonePressing(false);
        setPhonePaid(true);
      });

      // 3. Phone slides out, UI updates to success
      at(6000, () => {
        setPhoneVisible(false);
        setPhonePaid(false);
      });
      at(6300, () => {
        setPhase(3);
        setShowSuccess(true);
      });

      // Success pop-up disappears
      at(9000, () => setShowSuccess(false));

      // 4. Restart loop after a pause so the user can read the updated card
      at(11500, runSequence);
    };

    runSequence();

    return () => {
      isActive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  const depositSent = phase >= 1;
  const depositPaid = phase >= 3;
  const pct = depositPaid ? 40 : 0;

  const ROW = 'mt-2.5 pt-2.5 border-t border-slate-100 min-h-[40px] flex flex-wrap items-center gap-2 overflow-hidden';
  const BTN_DARK =
    'inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 font-semibold text-white whitespace-nowrap text-[10px] sm:text-[11px]';
  const BTN_LIGHT =
    'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 whitespace-nowrap text-[10px] sm:text-[11px]';
  const BTN_PDF = `ml-auto ${BTN_LIGHT}`;

  const steps = [
    { label: 'Quote Accepted', state: 'done' as const },
    { label: 'Deposit Secured', state: depositPaid ? ('done' as const) : ('todo' as const) },
    { label: 'Ready to Work', state: depositPaid ? ('current' as const) : ('todo' as const) },
    { label: 'Balance Collected', state: 'todo' as const },
  ];

  return (
    <div className="w-full">
      {/* Caption */}
      <div className="mb-3 min-h-6 text-center px-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="text-xs sm:text-sm font-semibold text-[#1C1F23]"
          >
            {CAPTIONS[phase]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        ref={cardRef}
        className="relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xl text-[10px] sm:text-[11px] select-none"
      >
        {/* Contractor's Fake Cursor */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-30 hidden sm:block"
          initial={false}
          animate={{ x: cursor.x, y: cursor.y, opacity: cursor.show ? 1 : 0, scale: pressing ? 0.85 : 1 }}
          transition={{
            x: { duration: 0.8, ease: EASE },
            y: { duration: 0.8, ease: EASE },
            opacity: { duration: 0.3 },
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

        {/* Customer's Mobile Phone Simulation */}
        <div className="pointer-events-none absolute inset-y-0 right-2 sm:right-6 z-[25] flex items-center">
          <AnimatePresence>
            {phoneVisible && (
              <motion.div
                key="phone"
                initial={{ x: 80, opacity: 0, scale: 0.9 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 80, opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="relative w-[150px] xs:w-[168px] sm:w-[192px] rounded-[1.6rem] bg-[#1C1F23] p-1.5 shadow-2xl border border-white/10 mt-6"
              >
                {/* Customer Label Badge */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1C1F23] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-white shadow-md border border-white/10 flex items-center gap-1.5">
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-400" /> Customer&rsquo;s Phone
                </div>

                <div className="rounded-[1.25rem] bg-white overflow-hidden text-[10px]">
                  <div className="flex items-center justify-between bg-slate-50 px-2.5 sm:px-3 py-2 border-b border-slate-100">
                    <span className="font-semibold text-slate-500 truncate">Summit Roofing</span>
                    <span className="text-slate-400 shrink-0">now</span>
                  </div>
                  <AnimatePresence mode="wait">
                    {!phonePaid ? (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-2.5 sm:px-3 py-3 space-y-2.5"
                      >
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">Secure Payment Request</p>
                          <p className="text-slate-500 text-[9px]">Deposit (40%)</p>
                        </div>
                        <p className="text-sm xs:text-base sm:text-lg font-extrabold tabular-nums text-slate-900">$4,800.00</p>

                        {/* Mobile Pay Button + Touch Ripple */}
                        <motion.div
                          animate={{ scale: phonePressing && !phonePaid ? 0.93 : 1 }}
                          transition={{ duration: 0.12 }}
                          className="relative flex w-full items-center justify-center rounded-lg bg-[#00828A] py-1.5 sm:py-2 font-semibold text-white shadow-sm overflow-hidden text-[9px] sm:text-[10px]"
                        >
                          <span className="relative z-10">Pay $4,800.00</span>
                          <AnimatePresence>
                            {phonePressing && (
                              <motion.span
                                initial={{ opacity: 0.6, scale: 0 }}
                                animate={{ opacity: 0, scale: 4 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white z-0"
                              />
                            )}
                          </AnimatePresence>
                        </motion.div>

                        <p className="flex items-center gap-1 text-[8px] sm:text-[9px] text-slate-400 border-t border-slate-100 pt-2">
                          <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0 text-emerald-600" /> Secure via Stripe
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="paid"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3 py-5 sm:py-6 flex flex-col items-center text-center gap-1.5"
                      >
                        <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
                        </span>
                        <p className="font-bold text-slate-900 text-[10px] sm:text-[11px]">Payment Successful!</p>
                        <p className="tabular-nums text-slate-500 text-[8px] sm:text-[9px]">$4,800.00 charged</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Central Success Pop-up */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.85, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.85, y: 12 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="flex w-full max-w-[14rem] sm:max-w-[16rem] flex-col items-center gap-2.5 sm:gap-3 rounded-2xl border border-white/10 bg-[#1C1F23] px-4 py-4 sm:px-6 sm:py-5 text-center text-white shadow-2xl"
              >
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-inner">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-bold">Deposit Secured!</p>
                  <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-300">You are clear to begin work.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-[#111827] text-white px-3.5 sm:px-5 pt-3.5 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-base font-bold truncate">M. Johnson</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[10px] font-semibold text-indigo-300">
                  <span className="h-1 w-1 rounded-full bg-indigo-300" /> Scheduled
                </span>
              </div>
              <p className="mt-0.5 text-slate-400 text-[9px] sm:text-[10px]">Roof Repair · #41 · Sep 10</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-white/10">
                <MoreVertical className="h-3 w-3 text-slate-400" />
              </span>
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md border border-white/10">
                <X className="h-3 w-3 text-slate-400" />
              </span>
            </div>
          </div>
          <div className="mt-2.5 sm:mt-3 grid grid-cols-3 sm:grid-cols-4 divide-x divide-white/10 border-t border-white/10 pt-2 text-[9px] sm:text-[10px]">
            <div className="pr-1.5 sm:pr-2">
              <p className="text-slate-400">Quote</p>
              <p className="font-semibold">$12,000.00</p>
              <p className="text-emerald-400">Accepted</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="text-slate-400">Payment</p>
              <p className="font-semibold">{depositPaid ? 'Balance due' : 'Deposit due'}</p>
              <p className={depositPaid ? 'text-slate-300' : 'text-rose-300'}>{depositPaid ? '$7,200.00' : '$4,800.00'}</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="text-slate-400">Scheduled</p>
              <p className="font-semibold">Oct 1</p>
              <p className="text-slate-400">8:00 AM</p>
            </div>
            <div className="hidden sm:block pl-2">
              <p className="text-slate-400">Invoice</p>
              <p className="font-semibold text-sky-300">#INV-041</p>
              <p className="text-slate-400">{depositPaid ? 'Deposit paid' : depositSent ? 'Deposit sent' : 'Draft'}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex">
          <div className="hidden sm:block w-[118px] shrink-0 border-r border-slate-100 bg-white py-2.5 px-2 space-y-0.5">
            {SIDEBAR.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                    s.active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  {s.label}
                </div>
              );
            })}
          </div>

          <div className="flex-1 min-w-0 bg-slate-50/60 p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
            {/* Steps */}
            <div className="rounded-lg border border-slate-200 bg-white px-1.5 sm:px-3 py-2 grid grid-cols-4 gap-0.5 sm:gap-1 text-center text-[8px] sm:text-[10px]">
              {steps.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 min-w-0">
                  <span
                    className={`flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full transition-colors duration-500 ${
                      s.state === 'done'
                        ? 'bg-teal-600 text-white'
                        : s.state === 'current'
                        ? 'border-2 border-teal-600 bg-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {s.state === 'done' && <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5" strokeWidth={3} />}
                    {s.state === 'current' && <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-teal-600" />}
                  </span>
                  <span
                    className={`w-full leading-tight truncate ${
                      s.state === 'done'
                        ? 'font-semibold text-slate-800'
                        : s.state === 'current'
                        ? 'font-semibold text-teal-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-2 sm:py-2.5 text-[9px] sm:text-[10px]">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-slate-600 truncate">
                  <span className="font-bold text-slate-900 tabular-nums">{depositPaid ? '$4,800.00' : '$0.00'}</span> of
                  $12k
                </p>
                <span className="font-semibold shrink-0 text-slate-700">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-slate-900"
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </div>
            </div>

            {/* 1. Deposit */}
            <div
              className={`rounded-lg border bg-white px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-500 ${
                depositPaid ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-slate-900 ring-1 ring-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${depositPaid ? 'text-emerald-800' : 'text-slate-900'}`}>1. Deposit (40%)</span>
                <span
                  className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold ${
                    depositPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : depositSent
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {depositPaid ? 'Paid' : depositSent ? 'Awaiting' : 'Not sent'}
                </span>
              </div>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-base font-extrabold tabular-nums ${depositPaid ? 'text-emerald-800' : 'text-slate-900'}`}>
                $4,800.00
              </p>
              <p className={depositPaid ? 'font-medium text-emerald-700 text-[9px] sm:text-[10px]' : 'text-slate-500 text-[9px] sm:text-[10px]'}>
                {depositPaid ? '✓ Secured Sep 14' : depositSent ? 'Sent Sep 12 · Due Sep 19' : 'Not sent yet'}
              </p>
              <div className={ROW}>
                {depositPaid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold truncate text-[9px] sm:text-[10px]">
                    <Wrench className="h-3 w-3 shrink-0" /> Clear to work
                  </span>
                ) : depositSent ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-600 whitespace-nowrap text-[9px] sm:text-[10px]">
                    <Check className="h-3 w-3" /> Request sent
                  </span>
                ) : (
                  <>
                    <motion.span
                      ref={depositBtnRef}
                      animate={{ scale: pressing && phase === 0 ? 0.92 : 1 }}
                      transition={{ duration: 0.12 }}
                      className={BTN_DARK}
                    >
                      <Send className="h-3 w-3" /> Send Deposit
                    </motion.span>
                    <span className={`hidden md:inline-flex ${BTN_LIGHT}`}>
                      <Copy className="h-3 w-3" /> Link
                    </span>
                  </>
                )}
                <span className={BTN_PDF}>
                  <Download className="h-3 w-3" /> Deposit PDF
                </span>
              </div>
            </div>

            {/* 2. Remaining balance */}
            <div
              className={`rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 transition-all duration-500 ${
                depositPaid ? 'border border-slate-300 bg-white' : 'border border-dashed border-slate-300 bg-slate-50/70 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-bold ${depositPaid ? 'text-slate-900' : 'text-slate-500'}`}>2. Remaining Balance</span>
                {depositPaid ? (
                  <span className="rounded-full bg-amber-100 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold text-amber-800">Next up</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-semibold text-slate-600">
                    <Lock className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> Locked
                  </span>
                )}
              </div>
              <p className={`mt-0.5 sm:mt-1 text-xs sm:text-base font-extrabold tabular-nums ${depositPaid ? 'text-slate-900' : 'text-slate-400'}`}>
                $7,200.00
              </p>
              <p className="text-slate-500 text-[9px] sm:text-[10px]">
                {depositPaid ? 'Send final invoice when done' : 'Unlocks after deposit'}
              </p>
              <div className={ROW}>
                {depositPaid ? (
                  <>
                    <span className={BTN_LIGHT}>
                      <Send className="h-3 w-3" /> Send Invoice
                    </span>
                    <span className={BTN_PDF}>
                      <Download className="h-3 w-3" /> Balance PDF
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 truncate text-[9px] sm:text-[10px]">Collect when job is done</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom tabs */}
        <div className="sm:hidden grid grid-cols-5 gap-0.5 bg-[#111827] px-1 py-1">
          {MOBILE_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className={`flex flex-col items-center gap-0.5 rounded-lg py-1 ${
                  t.active ? 'bg-white/10 text-blue-300' : 'text-slate-400'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="text-[8px] font-medium">{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}