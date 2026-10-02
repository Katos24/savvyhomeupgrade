import Link from 'next/link';
import {
  ArrowRight, Search, FileText, CalendarDays, Bell, AlertTriangle, Copy, Sunrise, Clock,
  DollarSign, ListChecks, Hourglass, User, Mail, Wallet,
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   /features/outbox
   SEO: contractor email history, sent quote tracking,
        daily job digest for contractors
   Outbox + Daily Digest are both Pro in lib/permissions.ts.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Email Outbox & Daily Digest for Contractors | Lead2Project',
  description:
    'Every quote, schedule, invoice and payment reminder you send, saved and searchable. Plus a morning email that tells you what needs your attention today.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

/* ── Mock: outbox list ── */
const ROWS = [
  { type: 'Quote', icon: FileText, name: 'Sarah Johnson', detail: '$4,850.00', when: 'Today, 9:14 AM', status: 'sent' },
  { type: 'Schedule', icon: CalendarDays, name: 'Mike Torres', detail: 'Mon, Oct 6 · 8:00 AM', when: 'Today, 8:02 AM', status: 'sent' },
  { type: 'Reminder', icon: Bell, name: 'Dana Price', detail: '$1,200.00 due', when: 'Yesterday', status: 'failed' },
  { type: 'Quote', icon: FileText, name: 'R. Diaz', detail: '$2,300.00', when: 'Oct 1', status: 'dupe' },
] as const;

function OutboxMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-lg" aria-hidden>
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs text-slate-400">Search by name or email</span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] font-semibold">
        <span className="rounded bg-[#1C1F23] px-2 py-0.5 text-white">All</span>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-500">Quotes</span>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-500">Schedules</span>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-500">Invoices</span>
        <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-500">Reminders</span>
      </div>
      <div className="mt-3 divide-y divide-slate-100 rounded-md border border-slate-200">
        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.name} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#00828A]/10 text-[#00828A]">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold">{r.name}</p>
                  {r.status === 'failed' && (
                    <span className="flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-px text-[9px] font-bold text-red-600">
                      <AlertTriangle className="h-2.5 w-2.5" /> Failed
                    </span>
                  )}
                  {r.status === 'dupe' && (
                    <span className="flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-px text-[9px] font-bold text-amber-700">
                      <Copy className="h-2.5 w-2.5" /> Duplicate
                    </span>
                  )}
                </div>
                <p className="truncate text-[10px] text-slate-500">
                  {r.type} · {r.detail}
                </p>
              </div>
              <span className="shrink-0 text-[10px] font-medium text-slate-400">{r.when}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Mock: one sent email opened ── */
function EmailDetailMock() {
  const items = [
    { d: 'Tear-off & disposal', a: '$1,450.00' },
    { d: 'Architectural shingles (24 sq)', a: '$2,880.00' },
    { d: 'Ridge vent', a: '$520.00' },
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2.5 text-white">
        <span className={`${D} text-sm font-bold uppercase tracking-[0.14em]`}>Quote sent</span>
        <span className="text-[11px] text-slate-300">Today, 9:14 AM</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">To</p>
            <p className="font-semibold">Sarah Johnson</p>
            <p className="text-slate-500">sarah.j@email.com</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Sent by</p>
            <p className="font-semibold">Kevin</p>
          </div>
        </div>
        <div className="mt-4 rounded-md border border-slate-200">
          {items.map((i) => (
            <div key={i.d} className="flex justify-between border-b border-slate-100 px-3 py-2 text-xs last:border-0">
              <span className="text-slate-600">{i.d}</span>
              <span className="font-semibold">{i.a}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between px-1 text-sm font-bold">
          <span>Total</span>
          <span>$4,850.00</span>
        </div>
      </div>
    </div>
  );
}

/* ── Mock: morning digest email ── */
const DIGEST = [
  { icon: CalendarDays, label: 'Jobs today', n: 3 },
  { icon: FileText, label: 'Quotes with no answer', n: 1 },
  { icon: AlertTriangle, label: 'Overdue payments', n: 2, red: true },
  { icon: Clock, label: 'Leads gone quiet', n: 2 },
];

function DigestMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Lead2Project · This morning</p>
          <Sunrise className="h-4 w-4 text-[#00828A]" />
        </div>
        <p className="mt-1 text-base font-bold">Good morning. Here&rsquo;s your day.</p>
        <div className="mt-4 space-y-2">
          {DIGEST.map(({ icon: Icon, label, n, red }) => (
            <div key={label} className="flex items-center gap-3 rounded-md border border-slate-200 bg-[#FBF8F2] px-3 py-2.5">
              <Icon className={`h-4 w-4 ${red ? 'text-red-600' : 'text-[#00828A]'}`} />
              <span className="flex-1 text-sm font-semibold">{label}</span>
              <span className={`${D} text-xl font-extrabold ${red ? 'text-red-600' : ''}`}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const OUTBOX_POINTS = [
  { icon: Search, title: 'Find it fast', desc: 'Search by customer name or email. Filter by quotes, schedules, invoices or reminders, or by date range.' },
  { icon: FileText, title: 'See what was sent', desc: 'Open any email to see the line items, the scheduled date or the amount due, plus who sent it and when.' },
  { icon: AlertTriangle, title: 'Catch problems', desc: 'Failed sends are flagged, and so are possible accidental duplicates, so you can fix it before the customer calls.' },
];

const DIGEST_ITEMS = [
  { icon: CalendarDays, label: "Today's jobs and who's on them" },
  { icon: Clock, label: 'Leads that have gone quiet' },
  { icon: FileText, label: 'Quotes still waiting on an answer' },
  { icon: DollarSign, label: 'Finished jobs with nothing collected' },
  { icon: Wallet, label: 'Deposits paid, balance still owed' },
  { icon: AlertTriangle, label: 'Overdue payments' },
  { icon: Hourglass, label: 'Payments due this week' },
  { icon: ListChecks, label: 'Follow-ups you set for today' },
];

export default function OutboxPage() {
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
            <Eyebrow>Outbox &amp; daily digest</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              Know what you sent. Know what&rsquo;s next.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              Every quote, schedule, invoice and payment reminder you send is saved in one place. Every morning, one email tells you
              what needs you today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
                Start free
              </Link>
              <Link
                href="/pricing"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                See pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#3a3f45]">Outbox and daily digest are on the Pro plan</p>
          </div>
          <OutboxMock />
        </div>
      </section>

      <TradesStrip />

      {/* ── Outbox ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>Outbox</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>&ldquo;Did I send that?&rdquo; Now you know.</h2>
            <p className={`mt-4 ${BODY}`}>
              When a customer says they never got the quote, you can check in seconds instead of digging through your phone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OUTBOX_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>{title}</h3>
                <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TapeDivider />

      {/* ── Email detail ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <EmailDetailMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>The full record</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Exactly what they got.</h2>
            <p className={`mt-4 ${BODY}`}>
              Open any sent email to see what was in it: the line items and total on a quote, the date and time on a
              schedule, the amount on a reminder. With a team, you also see who sent it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: User, label: 'Who sent it' },
                { icon: Clock, label: 'When' },
                { icon: Mail, label: 'Which email address' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold">
                  <Icon className="h-3.5 w-3.5 text-[#00828A]" /> {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Daily digest ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Daily digest</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Your day, before your coffee.</h2>
            <p className={`mt-4 ${BODY}`}>
              Turn it on and every morning you get one email with what needs you today. No logging in to figure out
              where things stand. On a day with nothing to report, it stays quiet.
            </p>
            <p className="mt-4 text-[15px] font-semibold text-[#1C1F23]">
              Send it to your company email, the owner, or both.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <DigestMock />
          </div>
        </div>
      </section>

      {/* ── What's in the digest ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>In every digest</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Nothing slips.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DIGEST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <Icon className="h-4 w-4 shrink-0 text-[#5EC4C9]" />
                <span className="text-[15px] font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Stop wondering what you sent.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Outbox and daily digest come with Pro.</p>
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