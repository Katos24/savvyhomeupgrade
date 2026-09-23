// components/HowItWorksModal.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Link2, Tag, FileText, ArrowRight,
  ArrowDown, HandCoins, CreditCard, CheckCircle2, Mail, Kanban,
  Sparkles, Download, MousePointerClick,
} from 'lucide-react';

/* ═══════════════ Slide shell ═══════════════ */

function SlideShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}

/* ═══════════════ Slide 1 — Services → Form connection ═══════════════
   The actual confusion this solves: "why do I manage this in one place
   but it shows up somewhere else." An animated arrow connecting a real
   Services card to a real Step-2 form field makes that relationship
   visible in a way "they sync automatically" as a sentence never does. */

function ServicesToFormSlide() {
  return (
    <SlideShell eyebrow="Services & Your Form" title="One place feeds the other">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch sm:justify-center">
        {/* Services card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[220px] rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-bold text-slate-900">Services</p>
          </div>
          <p className="text-[11px] font-semibold text-slate-700">Roofing</p>
          <div className="mt-1.5 space-y-1">
            <div className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200">
              Pricing template
            </div>
            <div className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200">
              25% deposit
            </div>
            <div className="rounded-md bg-white px-2 py-1 text-[10px] font-medium text-slate-500 border border-slate-200">
              "What's your roof pitch?"
            </div>
          </div>
        </motion.div>

        {/* Animated connector */}
        <div className="flex items-center justify-center py-1 sm:py-0">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden sm:flex items-center text-blue-500"
          >
            <ArrowRight className="h-6 w-6" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex sm:hidden items-center text-blue-500"
          >
            <ArrowDown className="h-6 w-6" />
          </motion.div>
        </div>

        {/* Form Step 2 card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-[220px] rounded-xl border border-slate-200 bg-white p-4 shadow-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-bold text-slate-900">Your Form — Step 2</p>
          </div>
          <p className="text-[11px] font-semibold text-slate-700">Customer selected "Roofing"</p>
          <div className="mt-1.5 rounded-md border border-blue-200 bg-blue-50/60 px-2 py-1.5">
            <p className="text-[10px] font-bold text-blue-900">What's your roof pitch?</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
        <p className="text-xs font-medium leading-relaxed text-slate-600">
          A category's pricing, deposit, and custom questions live in one place — <strong className="text-slate-900">Services</strong>.
          Nothing needs to be entered twice: whatever you set there shows up automatically
          the moment a customer picks that category on your form.
        </p>
      </div>
    </SlideShell>
  );
}

/* ═══════════════ Slide 2 — Payments lifecycle ═══════════════
   The other real confusion: deposit vs. balance isn't obvious from the
   words alone. A horizontal progress track with the current-money
   states highlighted makes the SEQUENCE visible, not just described. */

function PaymentsSlide() {
  const steps = [
    { icon: Mail, label: 'Quote Sent', sub: 'Customer sees the price' },
    { icon: HandCoins, label: 'Deposit Collected', sub: 'Job is locked in' },
    { icon: CreditCard, label: 'Balance Invoiced', sub: 'Sent once work starts/finishes' },
    { icon: CheckCircle2, label: 'Paid in Full', sub: 'Job closed out' },
  ];

  return (
    <SlideShell eyebrow="How Payments Move" title="Two collection points, one job">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex flex-1 flex-col items-center text-center"
          >
            <div className="relative flex w-full items-center">
              {i > 0 && <div className="hidden h-px flex-1 bg-slate-200 sm:block" />}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-blue-600 mx-auto">
                <s.icon className="h-4 w-4" />
              </div>
              {i < steps.length - 1 && <div className="hidden h-px flex-1 bg-slate-200 sm:block" />}
            </div>
            <p className="mt-2 text-[11px] font-bold text-slate-900">{s.label}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-500 max-w-[100px]">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 space-y-2.5">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
          <p className="text-xs font-bold text-amber-900">Deposit ≠ the whole job</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-amber-800/90">
            If a service has a deposit set (in Services), you send that first — usually before
            the job starts. The customer only owes the deposit amount at that point, not the full quote.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
          <p className="text-xs font-bold text-slate-900">Balance comes after</p>
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-600">
            Once the deposit is paid, the job unlocks its balance invoice — the remaining amount,
            sent whenever you're ready. The job isn't "Paid" until both are collected.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}

/* ═══════════════ Remaining slides — brief, standard topics ═══════════════ */

function StartSlide() {
  return (
    <SlideShell eyebrow="Getting Started" title="Your link and your dashboard">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Link2 className="h-4 w-4 text-blue-600 mb-2" />
          <p className="text-xs font-bold text-slate-900">Public link + QR</p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
            Share it anywhere. Customers land on your form — no login required.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <Kanban className="h-4 w-4 text-blue-600 mb-2" />
          <p className="text-xs font-bold text-slate-900">Private dashboard</p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
            Every submission becomes a lead here — jobs, quotes, payments, settings.
          </p>
        </div>
      </div>
    </SlideShell>
  );
}

function PipelineSlide() {
  return (
    <SlideShell eyebrow="Leads & Board" title="From submission to paid job">
      <p className="text-xs font-medium leading-relaxed text-slate-600">
        Every form submission lands as a lead card on your board. From there you schedule,
        quote, collect payment, and attach photos or files — all on that one card.
        The stages themselves are customizable in Settings to match how you actually work.
      </p>
    </SlideShell>
  );
}

function EmailsSlide() {
  return (
    <SlideShell eyebrow="Emails & Outbox" title="One click, fully logged">
      <p className="text-xs font-medium leading-relaxed text-slate-600">
        Send a branded schedule confirmation, quote, or payment reminder in one click.
        Every send is logged in the Outbox, so you always know exactly what went out and when.
      </p>
    </SlideShell>
  );
}

function DataSlide() {
  return (
    <SlideShell eyebrow="Data & Export" title="Nothing is locked in">
      <p className="text-xs font-medium leading-relaxed text-slate-600">
        Export leads and job data as CSV anytime — including a QuickBooks-compatible format.
        Table view also supports bulk edits, so updating several leads at once doesn't mean
        opening each one individually.
      </p>
    </SlideShell>
  );
}

/* ═══════════════ Main modal ═══════════════ */

const SLIDES = [
  { key: 'start', component: StartSlide },
  { key: 'services-form', component: ServicesToFormSlide },
  { key: 'payments', component: PaymentsSlide },
  { key: 'pipeline', component: PipelineSlide },
  { key: 'emails', component: EmailsSlide },
  { key: 'data', component: DataSlide },
];

export default function HowItWorksModal({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const Slide = SLIDES[index].component;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[85vh] sm:h-[560px] w-full sm:max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 shrink-0">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-900">
            How Lead2Project Works
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress dots — click any to jump directly */}
        <div className="flex items-center justify-center gap-1.5 border-b border-slate-100 py-3 shrink-0">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="relative flex-1 overflow-hidden px-6 py-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={SLIDES[index].key}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              <Slide />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 shrink-0">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="text-[11px] font-semibold text-slate-400">
            {index + 1} of {SLIDES.length}
          </span>
          {index < SLIDES.length - 1 ? (
            <button
              onClick={() => goTo(index + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              <MousePointerClick className="h-3.5 w-3.5" /> Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
}