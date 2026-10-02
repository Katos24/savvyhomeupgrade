import Link from 'next/link';
import {
  Columns3,
  Table,
  CalendarDays,
  LayoutGrid,
  Bell,
  ListOrdered,
  Check,
  ArrowRight,
  Send,
  CreditCard,
  Receipt,
  Users,
  Mail,
  PlayCircle,
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   /features/operations
   SEO: contractor job management, quote software for contractors,
        contractor scheduling app, contractor payment tracking
   Every claim below matches lib/permissions.ts and the app today.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Job Management for Contractors | Lead2Project',
  description:
    'Every job on one board. Quotes from templates, scheduling, deposits and payments in one place for contractors.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';
const CARD = 'rounded-lg border border-slate-200 bg-white shadow-lg';

function ProTag() {
  return (
    <span className={`ml-1.5 rounded bg-[#1C1F23] px-1.5 py-0.5 ${D} text-[10px] font-bold uppercase tracking-wider text-[#5EC4C9]`}>
      Pro
    </span>
  );
}

function Bullets({ items }: { items: { text: string; pro?: boolean }[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((i) => (
        <li key={i.text} className="flex items-start gap-2.5 text-[15px] font-medium text-[#1C1F23]">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
          <span>
            {i.text}
            {i.pro && <ProTag />}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── Mock: job board ── */
const BOARD = [
  { label: 'New', dot: 'bg-blue-500', cards: [{ n: 'Maria Lopez', s: 'Roof repair', a: '', d: 'Unscheduled', hot: true }, { n: 'Dan Kim', s: 'Gutters', a: '', d: 'Unscheduled' }] },
  { label: 'Quoted', dot: 'bg-purple-500', cards: [{ n: 'S. Patel', s: 'Siding', a: '$8,400', d: 'Unscheduled' }] },
  { label: 'Scheduled', dot: 'bg-amber-500', cards: [{ n: 'M. Johnson', s: 'Roof repair', a: '$12,000', d: 'Oct 9' }, { n: 'R. Diaz', s: 'Deck stain', a: '$1,850', d: 'Oct 11' }] },
];

function BoardMock() {
  return (
    <div className={`${CARD} bg-[#F4F7F6] p-3 sm:p-4`} aria-hidden>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-bold">Jobs</p>
        <div className="flex gap-1 text-[10px] font-semibold text-slate-500">
          <span className="rounded px-1.5 py-0.5">Cards</span>
          <span className="rounded px-1.5 py-0.5">Table</span>
          <span className="rounded bg-[#00828A] px-1.5 py-0.5 text-white">Board</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {BOARD.map((col) => (
          <div key={col.label} className="min-w-0 space-y-2 rounded-md border border-slate-200 bg-white/70 p-2">
            <div className="flex items-center gap-1.5 px-1">
              <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-600">{col.label}</span>
              <span className="text-[10px] text-slate-400">{col.cards.length}</span>
            </div>
            {col.cards.map((c) => (
              <div key={c.n} className={`rounded-md border bg-white p-2 ${'hot' in c && c.hot ? 'border-[#00828A] ring-2 ring-[#00828A]/20' : 'border-slate-200'}`}>
                <div className="flex items-baseline justify-between gap-1">
                  <p className="truncate text-[11px] font-bold">{c.n}</p>
                  {c.a && <span className="shrink-0 text-[10px] font-bold">{c.a}</span>}
                </div>
                <p className="truncate text-[10px] text-slate-500">{c.s}</p>
                <p className="mt-1 text-[9px] text-slate-400">{c.d}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mock: quote email with Accept / Decline ── */
function QuoteEmailMock() {
  const items = [
    ['Tear-off & disposal', '$2,125.00'],
    ['Architectural shingles', '$4,125.00'],
    ['Labor & installation', '$5,750.00'],
  ];
  return (
    <div className={`${CARD} overflow-hidden`} aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <p className="text-xs text-slate-500">From Summit Roofing</p>
        <p className="mt-0.5 text-base font-bold">Your estimate for Roof Repair</p>
        <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200 text-sm">
          {items.map(([l, v]) => (
            <div key={l} className="flex justify-between px-3 py-2">
              <span className="text-slate-600">{l}</span>
              <span className="font-semibold tabular-nums">{v}</span>
            </div>
          ))}
          <div className="flex justify-between bg-slate-50 px-3 py-2">
            <span className="font-bold">Total</span>
            <span className="font-bold tabular-nums">$12,000.00</span>
          </div>
          <div className="flex justify-between px-3 py-2 text-[#00828A]">
            <span className="font-semibold">Deposit to start (40%)</span>
            <span className="font-bold tabular-nums">$4,800.00</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-[#00828A] py-2.5 text-center text-sm font-bold text-white">Accept</div>
          <div className="rounded-md border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-600">Decline</div>
        </div>
      </div>
    </div>
  );
}

/* ── Mock: week calendar ── */
const WEEK = [
  { day: 'Mon', date: 6, jobs: [{ t: '8:00', n: 'M. Johnson', s: 'Roof repair' }] },
  { day: 'Tue', date: 7, jobs: [] },
  { day: 'Wed', date: 8, jobs: [{ t: '9:30', n: 'R. Diaz', s: 'Deck stain' }, { t: '1:00', n: 'D. Kim', s: 'Gutters' }] },
  { day: 'Thu', date: 9, jobs: [{ t: '8:00', n: 'S. Patel', s: 'Siding' }] },
  { day: 'Fri', date: 10, jobs: [] },
];

function CalendarMock() {
  return (
    <div className={`${CARD} p-3 sm:p-4`} aria-hidden>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-bold">October 6 – 10</p>
        <span className="text-[11px] font-semibold text-slate-500">5-day week</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {WEEK.map((d) => (
          <div key={d.day} className="min-h-[150px] min-w-0 rounded-md border border-slate-200 bg-[#FBF8F2] p-1.5">
            <p className="text-[10px] font-bold uppercase text-slate-500">{d.day}</p>
            <p className="text-sm font-bold">{d.date}</p>
            <div className="mt-1.5 space-y-1.5">
              {d.jobs.map((j) => (
                <div key={j.n} className="rounded border-l-2 border-[#00828A] bg-white px-1.5 py-1 shadow-sm">
                  <p className="text-[9px] font-semibold text-[#00828A]">{j.t}</p>
                  <p className="truncate text-[10px] font-bold">{j.n}</p>
                  <p className="truncate text-[9px] text-slate-500">{j.s}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PIPELINE = ['New', 'Contacted', 'Quoted', 'Scheduled', 'In Progress', 'Completed'];

export default function OperationsPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}>
      <Nav />

      {/* ── Hero ── */}
      <section
        className="bg-[#F4EFE6] pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center sm:text-left">
            <Eyebrow>Operations</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              From first call to paid in full.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              Every job on one board. Quotes from your templates, jobs on the calendar, and every deposit and payment
              tracked, without a spreadsheet.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
                Start free
              </Link>
              <Link
                href="/#how-it-works"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                How it works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <BoardMock />
        </div>
      </section>

      <TradesStrip />

      {/* ── The board ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Your jobs</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Every job. One screen.</h2>
            <p className={`mt-4 ${BODY}`}>
              No more texts, sticky notes and a calendar in your head. Every request and job lives in one place, and you
              pick how to look at it.
            </p>
            <Bullets
              items={[
                { text: 'Card view: every job at a glance' },
                { text: 'Table view: sort, filter and bulk-update jobs' },
                { text: 'Calendar view: see what is scheduled when' },
                { text: 'Board view: drag jobs from stage to stage (desktop)' },
                { text: 'New requests flagged as they come in' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: LayoutGrid, t: 'Cards', d: 'Status, amount and date on every job.' },
              { icon: Table, t: 'Table', d: 'Sort, filter and update many at once.' },
              { icon: CalendarDays, t: 'Calendar', d: 'Your week, 5 or 7 days.' },
              { icon: Columns3, t: 'Board', d: 'Drag a job to its next stage.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-lg border border-slate-200 bg-[#FBF8F2] p-4 sm:p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1C1F23] text-[#5EC4C9]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className={`mt-3 ${D} text-xl font-bold uppercase`}>{t}</p>
                <p className="mt-1 text-sm text-[#3a3f45]">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TapeDivider />

      {/* ── Quotes ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <QuoteEmailMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Quotes</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>A professional quote in a minute.</h2>
            <p className={`mt-4 ${BODY}`}>
              Stop texting estimates from your personal phone at 9 PM. Load your price template for the service, adjust
              it, and send a clean quote with the deposit already on it.
            </p>
            <Bullets
              items={[
                { text: 'Price templates for each service you offer' },
                { text: 'Deposit set per service, percent or flat' },
                { text: 'Branded email with your logo and colors', pro: true },
                { text: 'Customer accepts or declines online', pro: true },
                { text: 'Every quote you send saved in your outbox', pro: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Scheduling ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Scheduling</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Put it on the calendar. Let the customer know.</h2>
            <p className={`mt-4 ${BODY}`}>
              Pick the date and time right on the job, assign someone from your crew, and send the customer their
              confirmation in one click.
            </p>
            <Bullets
              items={[
                { text: 'Date, time and crew member on every job' },
                { text: 'Week view with 5 or 7 days, add jobs right on a day' },
                { text: 'Move a job to another day in a few taps' },
                { text: 'Jobs move to In Progress on their scheduled day' },
                { text: 'One-click schedule email to the customer', pro: true },
              ]}
            />
          </div>
          <CalendarMock />
        </div>
      </section>

      {/* ── Payments ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>Payments</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Stop chasing checks.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Collect the deposit before you buy materials, then the balance when the job is done. Card, cash or check,
              everything lands in one place.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, t: 'Card payments', d: 'Customers pay deposits and balances by card through Stripe.' },
              { icon: Send, t: 'Invoices & reminders', d: 'Email the invoice with a pay link, and send a reminder in one click.' },
              { icon: Check, t: 'Mark paid', d: 'Record cash, check, Venmo or Zelle and the balance updates.' },
              { icon: Receipt, t: 'Receipts sent', d: 'Customers get a receipt for every payment, plus the final invoice PDF.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className={`mt-4 ${D} text-xl font-bold uppercase`}>{t}</p>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <Eyebrow>Your pipeline</Eyebrow>
          <h2 className={`mt-3 ${H2}`}>One dashboard. Every stage.</h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {PIPELINE.map((stage, i) => (
              <div key={stage} className="flex items-center gap-2 sm:gap-3">
                <span className={`rounded-md border border-slate-200 bg-white px-3.5 py-2 shadow-sm ${D} text-base font-bold uppercase tracking-wide`}>
                  {stage}
                </span>
                {i < PIPELINE.length - 1 && <ArrowRight className="h-4 w-4 text-[#00828A]" />}
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: ListOrdered, t: 'Your stages', d: 'Add, rename and reorder stages to match how you work.' },
              { icon: PlayCircle, t: 'Moves on its own', d: 'Accepted quotes and scheduled days move jobs forward for you.' },
              { icon: Users, t: 'Your crew', d: 'Assign jobs and control what each team member can see.' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-5 w-5 text-[#00828A]" />
                <p className={`mt-3 ${D} text-xl font-bold uppercase`}>{t}</p>
                <p className="mt-1 text-sm text-[#3a3f45]">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[#3a3f45]">
<Bell className="h-4 w-4" /> <Mail className="h-4 w-4" /> Plus a morning digest of your day <ProTag />
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Your whole operation. One login.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Stop juggling texts, notebooks and a spreadsheet.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className={`w-full sm:w-auto rounded-md bg-white text-[#00828A] hover:bg-slate-50 px-8 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className={`w-full sm:w-auto rounded-md border border-white/40 text-white hover:bg-white/10 px-6 py-3 transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              See pricing
            </Link>
          </div>
          <p className="mt-6 text-sm font-semibold text-white/80">Free plan available · Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}