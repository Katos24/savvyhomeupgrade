import Link from 'next/link';
import { ArrowRight, Check, CalendarDays, Clock, MapPin, User, Mail, Plus, MoveRight, PlayCircle, Smartphone, LayoutGrid } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   /features/scheduling
   SEO: contractor scheduling app, job scheduling software,
        crew calendar for contractors
   Every claim below matches lib/permissions.ts and the app today.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Job Scheduling & Crew Calendar for Contractors | Lead2Project',
  description:
    'Put every job on the calendar with a date, time and crew member, move jobs in a few taps, and email the customer their appointment in one click.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

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

/* ── Mock: week calendar ── */
const WEEK = [
  { day: 'Mon', date: 6, jobs: [{ t: '8:00 AM', n: 'M. Johnson', s: 'Roof repair', who: 'Kevin' }] },
  { day: 'Tue', date: 7, jobs: [] },
  { day: 'Wed', date: 8, jobs: [{ t: '9:30 AM', n: 'R. Diaz', s: 'Deck stain', who: 'Luis' }, { t: '1:00 PM', n: 'D. Kim', s: 'Gutters', who: 'Kevin' }] },
  { day: 'Thu', date: 9, jobs: [{ t: '8:00 AM', n: 'S. Patel', s: 'Siding', who: 'Luis' }] },
  { day: 'Fri', date: 10, jobs: [] },
];

function CalendarMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4 shadow-lg" aria-hidden>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-sm font-bold">October 6 – 10</p>
        <div className="flex gap-1 text-[10px] font-semibold text-slate-500">
          <span className="rounded bg-[#00828A] px-1.5 py-0.5 text-white">5 days</span>
          <span className="rounded px-1.5 py-0.5">7 days</span>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {WEEK.map((d) => (
          <div key={d.day} className="min-h-[170px] min-w-0 rounded-md border border-slate-200 bg-[#FBF8F2] p-1.5">
            <p className="text-[10px] font-bold uppercase text-slate-500">{d.day}</p>
            <p className="text-sm font-bold">{d.date}</p>
            <div className="mt-1.5 space-y-1.5">
              {d.jobs.map((j) => (
                <div key={j.n} className="rounded border-l-2 border-[#00828A] bg-white px-1.5 py-1 shadow-sm">
                  <p className="text-[9px] font-semibold text-[#00828A]">{j.t}</p>
                  <p className="truncate text-[10px] font-bold">{j.n}</p>
                  <p className="truncate text-[9px] text-slate-500">
                    {j.s} · {j.who}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-center rounded border border-dashed border-slate-300 py-1 text-slate-400">
                <Plus className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Mock: schedule email to the customer ── */
function ScheduleEmailMock() {
  const rows = [
    { icon: CalendarDays, label: 'Date', value: 'Monday, October 6' },
    { icon: Clock, label: 'Time', value: '8:00 AM' },
    { icon: MapPin, label: 'Address', value: '12 Oak St, Holbrook, NY' },
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <p className="text-xs text-slate-500">From Summit Roofing</p>
        <p className="mt-0.5 text-base font-bold">Your roof repair is scheduled</p>
        <p className="mt-2 text-sm text-slate-600">Hi Mike, here are the details for your appointment.</p>
        <div className="mt-4 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white shadow-sm">
                <Icon className="h-3.5 w-3.5 text-[#00828A]" />
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">Questions? Call us at (555) 014-2290</p>
      </div>
    </div>
  );
}

/* ── Mock: moving a job to another day ── */
function MoveJobMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-lg" aria-hidden>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600">
          <CalendarDays className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-sm font-bold">Move S. Patel?</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="rounded bg-slate-100 px-2 py-0.5">Thu, Oct 9 · 8:00 AM</span>
            <MoveRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">Fri, Oct 10</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            If you already sent this customer their schedule, send them the new date after you save.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
        <span className="rounded-md border border-slate-200 py-2.5 text-center text-slate-600">Cancel</span>
        <span className="rounded-md bg-[#00828A] py-2.5 text-center text-white">Move job</span>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: CalendarDays, title: 'Pick the day and time', desc: 'Set it right on the job, or tap a day on the calendar and add the job there.' },
  { icon: User, title: 'Assign your crew', desc: 'Pick who’s doing the job from your team, so everyone knows where they’re headed.' },
  { icon: Mail, title: 'Let the customer know', desc: 'One click emails your customer the date, time and address, from your business name.' },
];

export default function SchedulingPage() {
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
            <Eyebrow>Scheduling</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              Every job. A day, a time and a crew.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              Put jobs on the calendar in seconds, see your whole week at a glance, and let customers know when you&rsquo;re
              coming, without a phone call.
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
            <p className="mt-4 text-sm font-semibold text-[#3a3f45]">
              Calendar view on Free · Scheduling, crew and schedule emails on Pro
            </p>
          </div>
          <CalendarMock />
        </div>
      </section>

      <TradesStrip />

      {/* ── How it works ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Schedule a job in under a minute.</h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2 text-white">
                    <span className={`${D} text-sm font-bold uppercase tracking-[0.14em]`}>Step</span>
                    <span className={`${D} text-xl font-extrabold text-[#5EC4C9]`}>#{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300" />
                  <div className="p-5 sm:p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>
                      {step.title}
                      {i === 2 && <ProTag />}
                    </h3>
                    <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <TapeDivider />

      {/* ── Customer email ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Customer email</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>They know when you&rsquo;re coming.</h2>
            <p className={`mt-4 ${BODY}`}>
              One click sends your customer a clean email with the date, time and address. It comes from your business
              name, so they know exactly who it&rsquo;s from.
            </p>
            <Bullets
              items={[
                { text: 'Sent from your business name', pro: true },
                { text: 'Date, time and job address', pro: true },
                { text: 'Edit the wording in your email templates', pro: true },
                { text: 'Every email saved in your outbox', pro: true },
              ]}
            />
          </div>
          <div className="w-full max-w-md mx-auto">
            <ScheduleEmailMock />
          </div>
        </div>
      </section>

      {/* ── Calendar ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <MoveJobMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Your calendar</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Your whole week at a glance.</h2>
            <p className={`mt-4 ${BODY}`}>
              See who&rsquo;s where every day. Add a job right on a day, move one when the weather turns, and spot the open
              days before they become lost money.
            </p>
            <Bullets
              items={[
                { text: '5-day or 7-day week, on desktop and phone' },
                { text: 'Tap a day to add a job there' },
                { text: 'Move a job to another day in a few taps' },
                { text: 'Jobs move to In Progress on their scheduled day' },
                { text: 'Switch between cards, table, board and calendar' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Everything ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>All on the job</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Everything you need to set a job.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              No separate calendar app. No group text to figure out who&rsquo;s where.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: CalendarDays, label: 'Scheduled date' },
              { icon: Clock, label: 'Start time' },
              { icon: User, label: 'Assigned crew member' },
              { icon: Plus, label: 'Add jobs right on the calendar' },
              { icon: MoveRight, label: 'Move jobs to another day' },
              { icon: PlayCircle, label: 'Auto-start on the scheduled day' },
              { icon: Smartphone, label: 'Works on your phone' },
              { icon: LayoutGrid, label: 'Calendar, cards, table and board' },
              { icon: Mail, label: 'One-click schedule email (Pro)' },
            ].map(({ icon: Icon, label }) => (
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
            Stop scheduling by text.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Put your first job on the calendar today.</p>
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