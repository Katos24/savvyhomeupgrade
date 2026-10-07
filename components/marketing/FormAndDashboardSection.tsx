'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow } from './marketingUI';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

// Mock data for the board preview — illustrative only.
type MockCard = { name: string; service: string; amount: string; date: string; fresh?: boolean; paid?: string };

const COLUMNS: { label: string; dot: string; cards: MockCard[]; hideOnPhone?: boolean }[] = [
  {
    label: 'New',
    dot: 'bg-blue-500',
    cards: [
      { name: 'Maria Lopez', service: 'Roof repair', amount: '', date: 'Unscheduled', fresh: true },
      { name: 'Dan Kim', service: 'Gutter cleaning', amount: '', date: 'Unscheduled' },
      { name: 'L. Chen', service: 'Skylight leak', amount: '', date: 'Unscheduled' },
    ],
  },
  {
    label: 'Quoted',
    dot: 'bg-purple-500',
    cards: [
      { name: 'S. Patel', service: 'Siding', amount: '$8,400', date: 'Unscheduled' },
      { name: 'T. Brooks', service: 'Gutter install', amount: '$2,850', date: 'Unscheduled' },
    ],
  },
  {
    label: 'Scheduled',
    dot: 'bg-amber-500',
    cards: [
      { name: 'M. Johnson', service: 'Roof repair', amount: '$12,000', date: 'Oct 9', paid: 'Deposit paid' },
      { name: 'K. Nguyen', service: 'Chimney flashing', amount: '$1,900', date: 'Oct 14', paid: 'Deposit paid' },
    ],
  },
  {
    label: 'Completed',
    dot: 'bg-emerald-500',
    hideOnPhone: true,
    cards: [
      { name: 'J. Rivera', service: 'Roof repair', amount: '$4,200', date: 'Oct 2', paid: 'Paid in full' },
      { name: 'A. Moore', service: 'Gutter guards', amount: '$950', date: 'Sep 29', paid: 'Paid in full' },
    ],
  },
];


/* ── The job card, as it looks in the app. Static, with clickable tabs. ──
   M. Johnson is the same job as the board above, the invoice section and the profit section:
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
    <div className="hidden xl:flex w-[200px] shrink-0 flex-col justify-center gap-4">
      {CALLOUTS.filter((c) => c.side === side).map((c) => {
        const Icon = c.icon;
        const on = tab === c.tab;
        return (
          <button
            key={c.tab}
            type="button"
            onClick={() => setTab(c.tab)}
            className={`group relative flex items-start gap-2.5 rounded-xl border bg-white p-3 text-left shadow-sm transition-all ${
              on ? 'border-slate-900 shadow-md' : 'border-slate-200 hover:border-slate-400'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                on ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
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
              className={`absolute top-1/2 h-px w-6 ${on ? 'bg-slate-900' : 'bg-slate-300'} ${
                side === 'left' ? '-right-6' : '-left-6'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function JobCardPreview() {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="flex items-stretch justify-center gap-6">
      <Callouts side="left" tab={tab} setTab={setTab} />
    <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-slate-300 bg-white text-[11px] sm:text-xs shadow-2xl ring-4 ring-slate-100">
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

      {/* Tabs on phones */}
      <div className="sm:hidden flex gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-2" role="tablist">
        {TABS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={tab === label}
            onClick={() => setTab(label)}
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 font-semibold ${
              tab === label ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
            }`}
          >
            <Icon className="h-3 w-3" /> {label}
          </button>
        ))}
      </div>

      <div className="flex">
        {/* Sidebar tabs */}
        <div className="hidden sm:block w-[132px] shrink-0 space-y-0.5 border-r border-slate-100 bg-white px-2 py-2.5" role="tablist">
          {TABS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={tab === label}
              onClick={() => setTab(label)}
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                tab === label ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-[420px] sm:min-h-[480px] min-w-0 flex-1 bg-slate-50/60 p-3 sm:p-4" role="tabpanel">
          <p className="mb-2.5 text-sm font-bold text-slate-900">{tab}</p>
          <TabBody tab={tab} />
        </div>
      </div>
    </div>
      <Callouts side="right" tab={tab} setTab={setTab} />
    </div>
  );
}

export default function FormAndDashboardSection() {
  return (
    <section className="bg-white text-[#1C1F23] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center sm:text-left">
          <Eyebrow>Your booking form</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
            Customers request a quote. It lands in your dashboard.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-[#3a3f45] leading-relaxed">
            Share your link or QR code anywhere: your Google profile, your truck, your invoices. Every request shows up
            with the details and photos you need to quote it.
          </p>
          <p className="mt-2 text-sm sm:text-base font-semibold text-[#1C1F23]">
            Ask your own questions for each service, so you can quote without a site visit.
            <span className="ml-1.5 rounded bg-[#1C1F23] px-1.5 py-0.5 align-middle font-[family-name:var(--font-display)] text-[10px] font-bold uppercase tracking-wider text-[#5EC4C9]">
              Pro
            </span>
          </p>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-0.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#00828A]">
              <Link2 className="w-3.5 h-3.5" /> Booking link
            </span>
            <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-0.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#00828A]">
              <QrCode className="w-3.5 h-3.5" /> QR code
            </span>
          </div>
          <div>
            <Link
            href="/features/lead-capture"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00828A] hover:underline underline-offset-4"
          >
            More on your booking form <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </div>

        {/* The customer's side: snapping the damage before requesting a quote */}
        <div className="overflow-hidden rounded-xl border border-slate-200 shadow-lg">
          <Image
            src="/images/homeowner-photo-roof.webp"
            alt="A homeowner takes a photo of storm damage on her roof with her phone"
            width={1200}
            height={896}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="h-auto w-full"
          />
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_auto_1fr] items-center gap-6 lg:gap-8">
          {/* ── Phone: the customer's form ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-[300px] rounded-[2rem] bg-[#1C1F23] p-2.5 shadow-2xl"
          >
            <div className="rounded-[1.6rem] bg-white overflow-hidden">
              <div className="bg-[#00828A] px-5 pt-6 pb-4 text-white">
                <p className="text-[11px] font-semibold opacity-80">Summit Roofing</p>
                <p className="text-base font-bold">Request a free quote</p>
              </div>
              <div className="p-4 space-y-2.5 text-[11px]">
                {[
                  ['Name', 'Maria Lopez'],
                  ['Service', 'Roof repair'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 font-semibold text-slate-500">{label}</p>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 font-medium text-slate-800">
                      {value}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="mb-1 font-semibold text-slate-500">What do you need?</p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700 leading-snug">
                    Leak over the back bedroom after the last storm.
                  </div>
                </div>
                {/* Your own questions for this service */}
                <div className="rounded-xl border border-[#00828A]/30 bg-[#00828A]/[0.03] p-2.5 space-y-2">
                  <span className="inline-block rounded bg-[#00828A]/10 px-1.5 py-px text-[9px] font-bold text-[#00828A]">
                    Your questions for Roof repair
                  </span>
                  <div>
                    <p className="mb-1 font-semibold text-slate-500">What&rsquo;s the problem?</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <span className="rounded-lg border border-[#00828A] bg-white py-1.5 text-center font-semibold text-[#00828A]">Leak</span>
                      <span className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-slate-500">Storm</span>
                      <span className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-slate-500">Shingles</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-slate-500">Roof type</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <span className="rounded-lg border border-[#00828A] bg-white py-1.5 text-center font-semibold text-[#00828A]">Shingle</span>
                      <span className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-slate-500">Metal</span>
                      <span className="rounded-lg border border-slate-200 bg-white py-1.5 text-center text-slate-500">Flat</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <p className="mb-1 font-semibold text-slate-500">Roof age</p>
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-800">
                        15–20 yrs <ChevronDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-slate-500">Stories</p>
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-medium text-slate-800">
                        2 <ChevronDown className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-700">
                    {['object-center', 'object-[38%_50%] scale-[1.8]'].map((crop) => (
                      <span key={crop} className="relative h-6 w-6 shrink-0 overflow-hidden rounded">
                        <Image src="/images/roof-damage.webp" alt="" fill sizes="24px" className={`object-cover ${crop}`} />
                      </span>
                    ))}
                    <span className="ml-0.5">2 photos</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Oct 7
                  </div>
                </div>
                <div className="mt-1 rounded-lg bg-[#00828A] py-2.5 text-center text-xs font-bold text-white">
                  Send request
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Arrow ── */}
          <div className="flex justify-center text-[#1C1F23]">
            <ArrowRight className="hidden lg:block w-10 h-10" strokeWidth={2.5} />
            <ArrowDown className="lg:hidden w-9 h-9" strokeWidth={2.5} />
          </div>

          {/* ── Dashboard: the job board ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-md border border-slate-200 bg-[#F4F7F6] p-3 sm:p-4 shadow-lg overflow-hidden"
          >
            {/* The email alert that comes with every new request */}
            <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-[#1C1F23] px-3 py-2.5 text-white shadow-md">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                <Mail className="h-3.5 w-3.5 text-[#5EC4C9]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold">New request: Maria Lopez</p>
                <p className="truncate text-[10px] text-slate-300">Roof repair · 2 photos · emailed to you</p>
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-[#5EC4C9]">Just now</span>
            </div>

            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-sm font-bold">Jobs</p>
              <span className="text-[11px] font-semibold text-slate-500">Board view</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {COLUMNS.map((col) => (
                <div
                  key={col.label}
                  className={`rounded-xl bg-white/70 border border-slate-200 p-2 space-y-2 min-w-0 ${col.hideOnPhone ? 'hidden sm:block' : ''}`}
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 truncate">{col.label}</span>
                    <span className="text-[10px] text-slate-400">{col.cards.length}</span>
                  </div>
                  {col.cards.map((c) => (
                    <div
                      key={c.name}
                      className={`rounded-lg border bg-white p-2 ${
                        c.fresh ? 'border-[#00828A] ring-2 ring-[#00828A]/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="text-[11px] font-bold truncate">{c.name}</p>
                        {c.amount && <span className="text-[10px] font-bold shrink-0">{c.amount}</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{c.service}</p>
                      <div className="mt-1 flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-400 truncate">{c.date}</span>
                        {c.fresh && <span className="text-[9px] font-bold text-[#00828A] shrink-0">Just now</span>}
                        {c.paid && <span className="text-[9px] font-semibold text-emerald-600 shrink-0">{c.paid}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
                   </motion.div>
        </div>

        {/* ── One job, one card ── */}
        <div
          className="relative mt-16 sm:mt-20 -mx-4 sm:mx-0 overflow-hidden sm:rounded-3xl border-y sm:border border-slate-200 bg-slate-50 px-3 sm:px-8 py-12 sm:py-16"
          style={{
            backgroundImage:
              'linear-gradient(rgba(28,31,35,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        >
          {/* Soft teal glow behind the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[55%] h-[520px] w-[720px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, rgba(0,130,138,0.18), transparent)' }}
          />
          <div className="relative max-w-2xl mx-auto mb-8 sm:mb-10 text-center">
            <Eyebrow>One card per job</Eyebrow>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]">
              One job. One card. Everything in it.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#3a3f45] leading-relaxed">
              Other apps spread a job across customers, quotes, jobs, invoices and payments. Here, open the card and it&rsquo;s
              all there. This is M. Johnson&rsquo;s card from the board above.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#00828A]">Click the tabs to look around.</p>
          </div>
          <div className="relative">
            <JobCardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}