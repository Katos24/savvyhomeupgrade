import Link from 'next/link';
import { ArrowRight, Check, Layers, Send, ThumbsUp, FileText, Search, Percent, PiggyBank, Smartphone, CheckCircle2, Plus } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';
import QuoteBuilderDemo from '@/components/marketing/QuoteBuilderDemo';

/* ─────────────────────────────────────────────────────────
   /features/quoting
   SEO: contractor quote software, estimate templates for contractors,
        send estimates online, roofing estimate app
   Every claim below matches lib/permissions.ts and the app today.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Quotes & Estimate Templates for Contractors | Lead2Project',
  description:
    'Build quotes from your price templates in a minute, with the deposit already on them. Customers accept online.',
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

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// Illustrative quote — adds up: 2,125 + 4,125 + 5,750 = 12,000; 40% deposit = 4,800.
const ITEMS = [
  { d: 'Tear-off & disposal', q: 25, p: 85 },
  { d: 'Architectural shingles', q: 25, p: 165 },
  { d: 'Labor & installation', q: 1, p: 5750 },
];
const TOTAL = ITEMS.reduce((s, i) => s + i.q * i.p, 0);

/* ── Mock: the quote builder ── */
function QuoteBuilderMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <p className="text-sm font-bold">Quote</p>
        <span className="rounded-md bg-[#00828A] px-2.5 py-1 text-xs font-bold text-white">Send Estimate</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-md border border-slate-200 text-sm">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Description</span>
            <span className="text-right">Price × Qty</span>
            <span className="w-20 text-right">Amount</span>
          </div>
          {ITEMS.map((i) => (
            <div key={i.d} className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-slate-100 px-3 py-2 last:border-b-0">
              <span className="truncate font-medium">{i.d}</span>
              <span className="text-right text-slate-500 tabular-nums">
                {fmt(i.p)} × {i.q}
              </span>
              <span className="w-20 text-right font-semibold tabular-nums">{fmt(i.q * i.p)}</span>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1.5 border-t border-dashed border-slate-200 py-2 text-[11px] font-semibold text-slate-400">
            <Plus className="h-3.5 w-3.5" /> Add line item
          </div>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
            <FileText className="h-3.5 w-3.5 text-[#00828A]" /> Add from Saved
          </span>
        </div>
        <div className="rounded-md border border-slate-200 px-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium tabular-nums">{fmt(TOTAL)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 py-2">
            <span className="text-slate-500">Tax</span>
            <span className="text-slate-300">—</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 py-2.5">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold tabular-nums">{fmt(TOTAL)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 py-2">
            <span className="text-slate-500">Deposit due now (40%)</span>
            <span className="font-medium tabular-nums">{fmt(TOTAL * 0.4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mock: what the customer gets ── */
function QuoteEmailMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <p className="text-xs text-slate-500">From Summit Roofing</p>
        <p className="mt-0.5 text-base font-bold">Your estimate for Roof Repair</p>
        <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200 text-sm">
          {ITEMS.map((i) => (
            <div key={i.d} className="flex justify-between px-3 py-2">
              <span className="text-slate-600">{i.d}</span>
              <span className="font-semibold tabular-nums">{fmt(i.q * i.p)}</span>
            </div>
          ))}
          <div className="flex justify-between bg-slate-50 px-3 py-2">
            <span className="font-bold">Total</span>
            <span className="font-bold tabular-nums">{fmt(TOTAL)}</span>
          </div>
          <div className="flex justify-between px-3 py-2 text-[#00828A]">
            <span className="font-semibold">Deposit to start (40%)</span>
            <span className="font-bold tabular-nums">{fmt(TOTAL * 0.4)}</span>
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

/* ── Mock: saved line items search ── */
function SavedItemsMock() {
  const rows = [
    { d: 'Ridge vent (4 ft)', c: 'Roofing', p: '$24.00', added: true },
    { d: 'Drip edge (10 ft)', c: 'Roofing', p: '$18.00' },
    { d: 'Gutter guard install', c: 'Gutters', p: '$600.00' },
    { d: 'Permit & inspection', c: 'Roofing', p: '$350.00' },
  ];
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-lg" aria-hidden>
      <p className="text-sm font-bold">Add to Quote</p>
      <div className="mt-3 flex rounded-md bg-slate-100 p-1 text-xs font-semibold">
        <span className="flex-1 rounded bg-white py-1.5 text-center shadow-sm">Line Items</span>
        <span className="flex-1 py-1.5 text-center text-slate-500">Templates</span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
        <Search className="h-3.5 w-3.5" /> Search saved line items…
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.d}
            className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${r.added ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200'}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.d}</p>
              <p className="text-[11px] text-slate-400">{r.c}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-sm font-bold tabular-nums">{r.p}</span>
              {r.added ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <Check className="h-3 w-3" /> Added
                </span>
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50">
                  <Plus className="h-3.5 w-3.5 text-[#00828A]" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { icon: Layers, title: 'Load your template', desc: 'Pick the service and your saved line items and deposit load in one tap. Adjust quantities for this job.' },
  { icon: Send, title: 'Send it', desc: 'Your customer gets a clean email with every line item, the total and the deposit to start.' },
  { icon: ThumbsUp, title: 'They accept', desc: 'One click from their email, no account needed. The job moves forward on your board right away.' },
];

export default function QuotingPage() {
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
            <Eyebrow>Quoting</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              Stop quoting by text message.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              Build a professional quote from your own price templates in about a minute, with the deposit already on it.
              Your customer accepts with one click.
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
              Quote builder, saved services and emailed quotes with online accept, all on Pro
            </p>
          </div>
                 <QuoteBuilderDemo />
        </div>
      </section>

      <TradesStrip />

      {/* ── How it works ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>From request to accepted quote.</h2>
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
                      {i > 0 && <ProTag />}
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

      {/* ── Templates ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Price templates</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Price it once. Reuse it every time.</h2>
            <p className={`mt-4 ${BODY}`}>
              Save a price template for each service you offer: roof repair, AC install, drain cleaning. When that job comes
              in, your line items are already there. Need one extra item? Search everything you&rsquo;ve ever saved and add
              it in a tap.
            </p>
            <Bullets
              items={[
                { text: 'A price template for each service' },
                { text: 'Search and add any saved line item' },
                { text: 'Save a new quote as a template in one step' },
                { text: 'Price, quantity and totals calculated for you' },
              ]}
            />
          </div>
          <div className="w-full max-w-md mx-auto">
            <SavedItemsMock />
          </div>
        </div>
      </section>

      {/* ── Customer response ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <QuoteEmailMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Customer response</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>They click Accept. The job moves forward.</h2>
            <p className={`mt-4 ${BODY}`}>
              Your customer sees every line item, the total and the deposit to get started. They accept or decline from the
              email, no account and no back-and-forth, and the job updates on your board.
            </p>
            <Bullets
              items={[
                { text: 'Branded email with your logo and colors', pro: true },
                { text: 'Accept or decline online, no account needed', pro: true },
                { text: 'Accepted quotes move the job forward on their own', pro: true },
                { text: 'Every quote you send saved in your outbox', pro: true },
                { text: 'Said yes on the phone? Mark it accepted yourself' },
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
            <h2 className={`mt-3 ${H2}`}>Everything a quote needs.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              No separate estimating app. No copying numbers into an email.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Layers, label: 'Line items with price and quantity' },
              { icon: FileText, label: 'Price templates per service' },
              { icon: Search, label: 'Search your saved line items' },
              { icon: PiggyBank, label: 'Deposit added automatically' },
              { icon: Percent, label: 'Tax rate per quote' },
              { icon: Smartphone, label: 'Build and edit quotes on your phone' },
              { icon: Send, label: 'One-click quote email (Pro)' },
              { icon: ThumbsUp, label: 'Online accept or decline (Pro)' },
              { icon: CheckCircle2, label: 'Mark accepted by hand' },
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
            Your next quote in a minute.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Set up your services once and quote every job the same way.</p>
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