'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow } from './marketingUI';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowDown,
  Camera,
  CalendarDays,
  QrCode,
  Link2,
  Check,
  User,
  FileText,
  CreditCard,
  Receipt,
  ListChecks,
  ImageIcon,
  Bell,
  MessageCircle,
  MoreVertical,
  X,
  Download,
  Send,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  ChevronDown,
  Search,
  Star,
  ArrowUp,
} from 'lucide-react';

/* ── The job card, as it looks in the app. Static, with clickable tabs. ──
   M. Johnson is the same job as the hero board and the invoice & profit section:
   $12,000 job, 40% deposit ($4,800) paid, $7,200 balance, expenses $7,130. */
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

type Tab = 'Overview' | 'Quote' | 'Schedule' | 'Invoice' | 'Expenses' | 'Tasks' | 'Media' | 'Reminders' | 'Activity';
const TABS: { label: Tab; icon: typeof User }[] = [
  { label: 'Overview', icon: User },
  { label: 'Quote', icon: FileText },
  { label: 'Schedule', icon: CalendarDays },
  { label: 'Invoice', icon: CreditCard },
  { label: 'Expenses', icon: Receipt },
  { label: 'Tasks', icon: ListChecks },
  { label: 'Media', icon: ImageIcon },
  { label: 'Reminders', icon: Bell },
  { label: 'Activity', icon: MessageCircle },
];

// Shown first on phones; the rest sit behind "More".
const PRIMARY_TABS: Tab[] = ['Overview', 'Quote', 'Invoice', 'Expenses', 'Activity'];

const QUOTE_ITEMS = [
  { d: 'Tear-off & Disposal (per sq.)', q: 25, p: 85 },
  { d: 'Architectural Shingles', q: 25, p: 165 },
  { d: 'Synthetic Underlayment', q: 5, p: 88 },
  { d: 'Ice & Water Shield (Rolls)', q: 4, p: 120 },
  { d: 'Labor & Installation', q: 1, p: 4830 },
];
const JOB_TOTAL = 12000;
const JOB_DEPOSIT = 4800;
const EXPENSES = [
  { d: 'Shingles & underlayment', c: 'Materials', a: 4150 },
  { d: 'Crew labor', c: 'Labor', a: 2600 },
  { d: 'Dumpster rental', c: 'Equipment', a: 380 },
];

const BOX = 'rounded-lg border border-slate-200 bg-white px-3 py-2.5';
const LABEL = 'text-[10px] font-semibold uppercase tracking-wider text-slate-400';
const BTN_DARK = 'inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 font-semibold text-white whitespace-nowrap';
const BTN_LIGHT =
  'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-semibold text-slate-700 whitespace-nowrap';

function Row({ left, right, muted }: { left: ReactNode; right: ReactNode; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 ${muted ? 'text-slate-500' : 'text-slate-800'}`}>
      <span className="min-w-0 truncate">{left}</span>
      <span className="shrink-0 tabular-nums">{right}</span>
    </div>
  );
}

function TabBody({ tab }: { tab: Tab }) {
  if (tab === 'Overview')
    return (
      <div className="space-y-3">
        <div className={BOX}>
          <p className={LABEL}>Request · Sep 8</p>
          <p className="mt-1 font-semibold text-slate-900">Roof repair</p>
          <p className="mt-0.5 text-slate-600">Leak over the back bedroom after the last storm.</p>
          <div className="mt-2.5 rounded-md border border-slate-200 divide-y divide-slate-100">
            {[
              ['What’s the problem?', 'Leak'],
              ['Roof type', 'Shingle'],
              ['Roof age', '15–20 yrs'],
              ['Stories', '2'],
            ].map(([q, a]) => (
              <div key={q} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
                <span className="text-slate-500">{q}</span>
                <span className="font-semibold text-slate-900">{a}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-0.5 text-slate-700">
              <Camera className="h-3 w-3" /> 2 photos
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-0.5 text-slate-700">
              <CalendarDays className="h-3 w-3" /> Prefers Oct 7
            </span>
          </div>
        </div>
        <div className={`${BOX} grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-slate-700`}>
          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" /> (555) 010-4417</span>
          <span className="flex items-center gap-1.5 min-w-0"><Mail className="h-3 w-3 shrink-0 text-slate-400" /> <span className="truncate">mjohnson@email.com</span></span>
          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" /> 48 Elm St, Holbrook, NY</span>
          <span className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3 text-slate-400" /> Prefers mornings</span>
        </div>
        <div className={BOX}>
          <p className={LABEL}>Where the job stands</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {['Request', 'Quote', 'Deposit', 'Scheduled'].map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 font-semibold text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} /> {s}
              </span>
            ))}
            {['Job done', 'Paid in full', 'Review'].map((s) => (
              <span key={s} className="rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-slate-400">{s}</span>
            ))}
          </div>
        </div>
      </div>
    );

  if (tab === 'Quote')
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
            <Check className="h-3 w-3" /> Accepted Sep 10
          </span>
          <span className="rounded-full border border-slate-900 px-2.5 py-0.5 font-semibold text-slate-900">Deposit 40%</span>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="divide-y divide-slate-100 px-3">
            {QUOTE_ITEMS.map((i) => (
              <Row key={i.d} left={<>{i.d} <span className="text-slate-400">× {i.q}</span></>} right={fmt(i.q * i.p)} />
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900">
            <span>Total</span>
            <span className="tabular-nums">{fmt(JOB_TOTAL)}</span>
          </div>
        </div>
      </div>
    );

  if (tab === 'Schedule') {
    const days = [
      { d: 'Mon', n: 6 },
      { d: 'Tue', n: 7 },
      { d: 'Wed', n: 8 },
      { d: 'Thu', n: 9, job: true },
      { d: 'Fri', n: 10, job: true },
    ];
    return (
      <div className="space-y-3">
        <div className={BOX}>
          <p className={LABEL}>October</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5 text-center">
            {days.map((x) => (
              <div
                key={x.n}
                className={`rounded-md border py-1.5 ${x.job ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-500'}`}
              >
                <p className="text-[9px]">{x.d}</p>
                <p className="text-sm font-bold">{x.n}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${BOX} space-y-1.5 text-slate-700`}>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-slate-400" /> Thu, Oct 9 · 8:00 AM · 2 days</span>
          <span className="flex items-center gap-1.5"><Users className="h-3 w-3 text-slate-400" /> 2 crew</span>
          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" /> 48 Elm St, Holbrook, NY</span>
        </div>
      </div>
    );
  }

  if (tab === 'Invoice')
    return (
      <div className="space-y-3">
        <div className={BOX}>
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-slate-600">
              <span className="font-bold text-slate-900 tabular-nums">{fmt(JOB_DEPOSIT)}</span> of {fmt(JOB_TOTAL)} collected
            </p>
            <span className="font-semibold text-slate-700">40%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[40%] rounded-full bg-slate-900" />
          </div>
        </div>
        <div className="rounded-lg border border-emerald-500 bg-emerald-50/30 px-3 py-2.5 ring-1 ring-emerald-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-800">1. Deposit (40%)</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">Paid</span>
          </div>
          <p className="mt-1 text-sm font-extrabold tabular-nums text-emerald-800">{fmt(JOB_DEPOSIT)}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-medium text-emerald-700">✓ Paid by card Sep 14</span>
            <span className={BTN_LIGHT}><Download className="h-3 w-3" /> Deposit PDF</span>
          </div>
        </div>
        <div className="rounded-lg border border-slate-900 bg-white px-3 py-2.5 ring-1 ring-slate-900">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">2. Remaining balance</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">Not sent</span>
          </div>
          <p className="mt-1 text-sm font-extrabold tabular-nums text-slate-900">{fmt(JOB_TOTAL - JOB_DEPOSIT)}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className={BTN_DARK}><Send className="h-3 w-3" /> Send Final Invoice</span>
            <span className={BTN_LIGHT}><Download className="h-3 w-3" /> PDF</span>
          </div>
        </div>
      </div>
    );

  if (tab === 'Expenses') {
    const spent = EXPENSES.reduce((s, e) => s + e.a, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: 'Job total', v: fmt(JOB_TOTAL) },
            { l: 'Expenses', v: fmt(spent) },
            { l: 'Profit', v: fmt(JOB_TOTAL - spent) },
          ].map((x) => (
            <div key={x.l} className={BOX}>
              <p className={LABEL}>{x.l}</p>
              <p className="mt-0.5 font-bold tabular-nums text-slate-900">{x.v}</p>
            </div>
          ))}
        </div>
        <div className={`${BOX} divide-y divide-slate-100`}>
          {EXPENSES.map((e) => (
            <Row key={e.d} left={<>{e.d} <span className="text-slate-400">({e.c})</span></>} right={fmt(e.a)} />
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'Tasks') {
    const tasks = [
      { t: 'Order shingles & underlayment', done: true },
      { t: 'Book dumpster for Oct 8', done: true },
      { t: 'Confirm start time with customer', done: true },
      { t: 'Final walkthrough photos', done: false },
      { t: 'Haul away debris', done: false },
    ];
    return (
      <div className={`${BOX} space-y-2`}>
        {tasks.map((x) => (
          <div key={x.t} className="flex items-center gap-2">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                x.done ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {x.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            <span className={x.done ? 'text-slate-400 line-through' : 'text-slate-800'}>{x.t}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'Media')
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {/* The customer's photos, sent with the request (second one is a close-up crop of the same shot) */}
        {['object-center', 'object-[38%_50%] scale-[1.8]'].map((crop) => (
          <div key={crop} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-200">
            <Image
              src="/images/roof-damage.webp"
              alt="Customer photo of storm-damaged roof shingles"
              fill
              sizes="(min-width: 640px) 160px, 45vw"
              className={`object-cover ${crop}`}
            />
            <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white">From customer</span>
          </div>
        ))}
        {[
          { l: 'Before', g: 'linear-gradient(135deg,#e2e8f0,#94a3b8)' },
          { l: 'Before', g: 'linear-gradient(135deg,#a8a29e,#57534e)' },
          { l: 'Materials', g: 'linear-gradient(135deg,#d6d3d1,#78716c)' },
        ].map((m, i) => (
          <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg" style={{ background: m.g }}>
            <ImageIcon className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-white/60" />
            <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white">{m.l}</span>
          </div>
        ))}
      </div>
    );

  if (tab === 'Reminders')
    return (
      <div className="space-y-2">
        {[
          { t: 'Call to confirm the start', w: 'Wed, Oct 8 · 9:00 AM' },
          { t: 'Send the final invoice', w: 'Sat, Oct 11 · 10:00 AM' },
        ].map((r) => (
          <div key={r.t} className={`${BOX} flex items-center gap-2.5`}>
            <Bell className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{r.t}</p>
              <p className="text-slate-500">{r.w}</p>
            </div>
          </div>
        ))}
      </div>
    );

  // Activity
  return (
    <div className={`${BOX} space-y-2.5`}>
      {[
        { t: 'Request received from your booking form', w: 'Sep 8' },
        { t: 'Quote sent · $12,000.00', w: 'Sep 9' },
        { t: 'Quote accepted by customer', w: 'Sep 10' },
        { t: 'Deposit invoice sent · $4,800.00', w: 'Sep 12' },
        { t: 'Deposit paid by card · $4,800.00', w: 'Sep 14' },
        { t: 'Scheduled for Thu, Oct 9 · 8:00 AM', w: 'Sep 15' },
      ].map((a) => (
        <div key={a.t} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <p className="min-w-0 flex-1 text-slate-700">{a.t}</p>
          <span className="shrink-0 text-slate-400">{a.w}</span>
        </div>
      ))}
    </div>
  );
}

// Feature call-outs beside the card on wide screens. Clicking one opens that tab.
const CALLOUTS: { side: 'left' | 'right'; tab: Tab; icon: typeof User; title: string; desc: string }[] = [
  { side: 'left', tab: 'Overview', icon: User, title: 'Requests land here', desc: 'Details, photos and their answers.' },
  { side: 'left', tab: 'Quote', icon: FileText, title: 'Quote in a tap', desc: 'Load your template and send.' },
  { side: 'left', tab: 'Schedule', icon: CalendarDays, title: 'Book the crew', desc: 'Pick the day, time and crew.' },
  { side: 'right', tab: 'Invoice', icon: CreditCard, title: 'Get paid by card', desc: 'Deposit first, balance when done.' },
  { side: 'right', tab: 'Expenses', icon: Receipt, title: 'Know your profit', desc: 'Log costs, see what you kept.' },
  { side: 'right', tab: 'Activity', icon: MessageCircle, title: 'Every step logged', desc: 'See what happened, and when.' },
];

function Callouts({ side, tab, setTab }: { side: 'left' | 'right'; tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="hidden lg:flex lg:w-[170px] xl:w-[200px] shrink-0 flex-col justify-center gap-4">
      {CALLOUTS.filter((c) => c.side === side).map((c) => {
        const Icon = c.icon;
        const on = tab === c.tab;
        return (
          <button
            key={c.tab}
            type="button"
            onClick={() => setTab(c.tab)}
            className={`group relative flex items-start gap-2.5 rounded-xl border bg-white p-3 text-left shadow-sm transition-all ${
              on ? 'border-[#5EC4C9] shadow-[0_0_0_3px_rgba(94,196,201,0.25)]' : 'border-transparent hover:border-white/40'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                on ? 'bg-[#00828A] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-[family-name:var(--font-display)] text-base font-bold uppercase leading-tight text-[#1C1F23]">
                {c.title}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-500">{c.desc}</span>
            </span>
            {/* little connector toward the card */}
            <span
              aria-hidden
              className={`absolute top-1/2 h-px w-6 ${on ? 'bg-[#5EC4C9]' : 'bg-white/20'} ${
                side === 'left' ? '-right-6' : '-left-6'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// Exported so the hero can open this same card over its board. `callouts` adds the feature call-outs on wide screens.
// `hints` (desktop): teal dots on tabs not opened yet, a "Click to explore" label, and a clearer hover.
export function JobCardPreview({ callouts = true, hints = false }: { callouts?: boolean; hints?: boolean } = {}) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [showMore, setShowMore] = useState(false);
  const [seen, setSeen] = useState<Tab[]>(['Overview']);
  const pick = (t: Tab) => {
    setTab(t);
    setSeen((s) => (s.includes(t) ? s : [...s, t]));
  };

  return (
    <div className="flex items-stretch justify-center gap-6">
      {callouts && <Callouts side="left" tab={tab} setTab={pick} />}
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-white text-[11px] text-[#1C1F23] sm:text-xs shadow-2xl shadow-black/40 ring-4 ring-white/10">
      {/* Header */}
      <div className="bg-[#111827] px-4 sm:px-5 pt-3.5 pb-3 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm sm:text-base font-bold">M. Johnson</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                <span className="h-1 w-1 rounded-full bg-amber-300" /> Scheduled
              </span>
            </div>
            <p className="mt-0.5 text-slate-400">Roof Repair · #41 · Sep 8</p>
          </div>
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10">
              <MoreVertical className="h-3 w-3 text-slate-400" />
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10">
              <X className="h-3 w-3 text-slate-400" />
            </span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 divide-x divide-white/10 border-t border-white/10 pt-2.5">
          <div className="pr-2">
            <p className="text-slate-400">Quote</p>
            <p className="font-semibold">{fmt(JOB_TOTAL)}</p>
            <p className="text-emerald-400">Accepted</p>
          </div>
          <div className="px-2">
            <p className="text-slate-400">Payment</p>
            <p className="font-semibold">Balance due</p>
            <p className="text-slate-300">{fmt(JOB_TOTAL - JOB_DEPOSIT)}</p>
          </div>
          <div className="px-2">
            <p className="text-slate-400">Scheduled</p>
            <p className="font-semibold">Oct 9</p>
            <p className="text-slate-400">8:00 AM</p>
          </div>
          <div className="hidden sm:block pl-2">
            <p className="text-slate-400">Invoice</p>
            <p className="font-semibold text-sky-300">#INV-041</p>
            <p className="text-slate-400">Deposit paid</p>
          </div>
        </div>
      </div>

      {/* Tabs on phones: the 5 that matter most, the rest behind "More" */}
      <div className="sm:hidden border-b border-slate-100 px-3 py-2">
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {(showMore ? TABS : TABS.filter((t) => PRIMARY_TABS.includes(t.label) || t.label === tab)).map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === label}
              onClick={() => pick(label)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 font-semibold ${
                tab === label ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
              }`}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1.5 font-semibold text-slate-500"
          >
            {showMore ? 'Less' : 'More'} <ChevronDown className={`h-3 w-3 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar tabs */}
        <div className="hidden sm:block w-[132px] shrink-0 space-y-0.5 border-r border-slate-100 bg-white px-2 py-2.5" role="tablist">
          {hints && (
            <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-wider text-[#00828A]">Click to explore</p>
          )}
          {TABS.map(({ label, icon: Icon }) => {
            const unseen = hints && !seen.includes(label);
            return (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={tab === label}
                onClick={() => pick(label)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                  tab === label
                    ? 'bg-blue-50 font-semibold text-blue-700'
                    : hints
                      ? 'text-slate-600 hover:bg-[#00828A]/10 hover:text-[#00828A]'
                      : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">{label}</span>
                {unseen && <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00828A]" />}
              </button>
            );
          })}
        </div>

        <div className="min-h-[420px] sm:min-h-[480px] min-w-0 flex-1 bg-slate-50/60 p-3 sm:p-4" role="tabpanel">
          <p className="mb-2.5 text-sm font-bold text-slate-900">{tab}</p>
          <TabBody tab={tab} />
        </div>
      </div>
    </div>
      {callouts && <Callouts side="right" tab={tab} setTab={pick} />}
    </div>
  );
}

/* ───────────── Part 1: one connected story ─────────────
   Phases (≈1s each, loops while the section is on screen):
   0 the "Request quote" button pulses · 1 customer taps it · 2 name filled · 3 answers picked
   4 photos added · 5 Send tapped · 6–8 "Request sent!" */
const PHASES = 9;
const PHASE_MS = 1000;
const ARRIVED = 6;

function useStory() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-120px' });
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setPhase(ARRIVED + 1);
      return;
    }
    if (!inView) return;
    const id = setInterval(() => setPhase((p) => (p + 1) % PHASES), PHASE_MS);
    return () => clearInterval(id);
  }, [inView, reduceMotion]);

  return { ref, phase };
}

// What the customer is doing at each phase (caption under the phone)
const PHASE_CAPTION = [
  'They find you on Google or your website',
  'They tap “Request quote”',
  'They fill in their details',
  'They answer your questions for the service',
  'They add photos of the job',
  'They send it',
  'It lands on your board, ready to quote',
  'It lands on your board, ready to quote',
  'It lands on your board, ready to quote',
];

function Chip({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <span
      className={`rounded-lg border py-1.5 text-center transition-all duration-300 ${
        on ? 'border-[#00828A] bg-[#00828A] font-semibold text-white' : 'border-slate-200 bg-white text-slate-500'
      }`}
    >
      {children}
    </span>
  );
}

/* Step 1: Google profile with your link behind the button */
function ShareMock({ phase }: { phase: number }) {
  const tapping = phase === 1;
  return (
    <div aria-hidden>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-[13px] shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <span className="text-slate-600">roofer near me</span>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1C1F23] text-sm font-extrabold text-white">SR</div>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900">Summit Roofing</p>
              <div className="mt-0.5 flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 truncate text-xs text-slate-500">Roofing contractor</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Holbrook, NY · <span className="font-semibold text-emerald-700">Open</span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <span className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 py-2 text-slate-600">
              <Phone className="h-4 w-4" /> Call
            </span>
            <span className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 py-2 text-slate-600">
              <MapPin className="h-4 w-4" /> Directions
            </span>
            <motion.span
              animate={{ scale: tapping ? 0.9 : 1 }}
              transition={{ duration: 0.15 }}
              className="relative flex flex-col items-center gap-1 overflow-hidden rounded-lg bg-[#00828A] py-2 text-white shadow-md"
            >
              {!tapping && <span className="absolute inset-0 rounded-lg ring-2 ring-inset ring-white/70 motion-safe:animate-pulse" />}
              <AnimatePresence>
                {tapping && (
                  <motion.span
                    initial={{ opacity: 0.6, scale: 0 }}
                    animate={{ opacity: 0, scale: 3 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                  />
                )}
              </AnimatePresence>
              <CalendarDays className="relative h-4 w-4" />
              <span className="relative">Request quote</span>
            </motion.span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Your website */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            <span className="ml-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200">summitroofing.com</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-3">
            <p className="font-[family-name:var(--font-display)] text-sm font-extrabold uppercase leading-tight text-slate-900">
              Roof repair you can trust
            </p>
            <span className="shrink-0 rounded-md bg-[#00828A] px-2.5 py-1.5 text-[11px] font-bold text-white">Get a quote</span>
          </div>
        </div>
        {/* QR code */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-md">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1C1F23] text-white">
            <QrCode className="h-6 w-6" />
          </span>
          <p className="text-xs leading-snug text-[#3a3f45]">
            <span className="font-semibold text-[#1C1F23]">QR code</span> for your truck, signs and invoices
          </p>
        </div>
      </div>
    </div>
  );
}

/* Step 2: the customer's form, filling itself in */
function FormMock({ phase }: { phase: number }) {
  const sent = phase >= ARRIVED;
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[2rem] bg-[#1C1F23] p-2.5 shadow-2xl" aria-hidden>
      <div className="relative overflow-hidden rounded-[1.6rem] bg-white">
        <div className="bg-[#00828A] px-5 pb-4 pt-5 text-white">
          <p className="text-[11px] font-semibold opacity-80">Summit Roofing</p>
          <p className="text-base font-bold">Request a free quote</p>
        </div>
        <div className="space-y-2.5 p-4 text-[11px]">
          <div>
            <p className="mb-1 font-semibold text-slate-500">Name</p>
            <div className="h-[30px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-medium text-slate-800">
              <motion.span initial={false} animate={{ opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 0.3 }}>
                Maria Lopez
              </motion.span>
              {phase < 2 && <span className="ml-px inline-block h-3 w-px animate-pulse bg-slate-400 align-middle" />}
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold text-slate-500">Service</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-medium text-slate-800">Roof repair</div>
          </div>

          {/* Your own questions for this service */}
          <div className="space-y-2 rounded-xl border border-[#00828A]/30 bg-[#00828A]/[0.04] p-2.5">
            <span className="inline-flex items-center gap-1 rounded bg-[#00828A]/10 px-1.5 py-px text-[9px] font-bold text-[#00828A]">
              Your questions for Roof repair
            </span>
            <div>
              <p className="mb-1 font-semibold text-slate-500">What&rsquo;s the problem?</p>
              <div className="grid grid-cols-3 gap-1.5">
                <Chip on={phase >= 3}>Leak</Chip>
                <Chip on={false}>Storm</Chip>
                <Chip on={false}>Shingles</Chip>
              </div>
            </div>
            <div>
              <p className="mb-1 font-semibold text-slate-500">Roof type</p>
              <div className="grid grid-cols-3 gap-1.5">
                <Chip on={phase >= 3}>Shingle</Chip>
                <Chip on={false}>Metal</Chip>
                <Chip on={false}>Flat</Chip>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-700">
            {['object-center', 'object-[38%_50%] scale-[1.8]'].map((crop, i) => (
              <motion.span
                key={crop}
                initial={false}
                animate={{ opacity: phase >= 4 ? 1 : 0.2, scale: phase >= 4 ? 1 : 0.8 }}
                transition={{ duration: 0.3, delay: phase >= 4 ? i * 0.12 : 0 }}
                className="relative h-7 w-7 shrink-0 overflow-hidden rounded"
              >
                <Image src="/images/roof-damage.webp" alt="" fill sizes="28px" className={`object-cover ${crop}`} />
              </motion.span>
            ))}
            <span className="ml-0.5">{phase >= 4 ? '2 photos added' : 'Add photos'}</span>
          </div>

          <motion.div
            animate={{ scale: phase === 5 ? 0.94 : 1 }}
            transition={{ duration: 0.15 }}
            className="mt-1 rounded-lg bg-[#00828A] py-2.5 text-center text-xs font-bold text-white"
          >
            Send request
          </motion.div>
        </div>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white"
            >
              <motion.span
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 260 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
              >
                <Check className="h-6 w-6" strokeWidth={3} />
              </motion.span>
              <p className="text-sm font-bold text-slate-900">Request sent!</p>
              <p className="text-[11px] text-slate-500">Summit Roofing will be in touch.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FormAndDashboardSection() {
  const { ref, phase } = useStory();

  return (
    <section className="text-[#1C1F23]">
      {/* ── Part 1: lead capture. Your link on Google / your site → the customer fills in your form ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#EAF6F6] to-slate-50 px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20 lg:px-8">
        <div ref={ref} className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          {/* Left: the pitch + where your link lives */}
          <div>
            <div className="text-center lg:text-left">
              <Eyebrow>Lead capture</Eyebrow>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[34px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-[56px]">
                Catch every lead,{' '}
                <span className="bg-[linear-gradient(transparent_64%,#5EC4C9_64%,#5EC4C9_92%,transparent_92%)] px-1 [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
                  even after hours.
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-[48ch] text-base leading-relaxed text-[#3a3f45] sm:text-lg lg:mx-0">
                Put your booking link on your Google profile, your website and your truck. Customers send their details,
                answers and photos any time, and every request lands on your board. No missed calls, no lost texts.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1F23] px-3 py-1 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#5EC4C9]">
                  <Link2 className="h-3.5 w-3.5" /> Booking link
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1C1F23] px-3 py-1 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#5EC4C9]">
                  <QrCode className="h-3.5 w-3.5" /> QR code
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#1C1F23]/15 bg-white px-3 py-1 text-xs font-semibold text-[#1C1F23]">
                  Custom questions per service
                  <span className="rounded bg-[#1C1F23] px-1.5 py-px font-[family-name:var(--font-display)] text-[10px] font-bold uppercase tracking-wider text-[#5EC4C9]">
                    Pro
                  </span>
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              className="mx-auto mt-8 w-full max-w-lg lg:mx-0"
            >
              <ShareMock phase={phase} />
            </motion.div>
          </div>

          {/* Right: the customer's form filling itself in */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[300px]"
          >
            <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-[#5EC4C9]/25 blur-3xl" />
            <FormMock phase={phase} />
            <div className="mt-5 flex min-h-[44px] items-center justify-center gap-2 text-center">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1C1F23] text-[11px] font-bold text-[#5EC4C9]">
                {Math.min(phase + 1, 7)}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={PHASE_CAPTION[phase]}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-[#1C1F23]"
                >
                  {PHASE_CAPTION[phase]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="text-center">
              <Link
                href="/features/lead-capture"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00828A] underline-offset-4 hover:underline"
              >
                More on lead capture <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}