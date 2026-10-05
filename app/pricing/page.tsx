import { Check, X } from 'lucide-react';
import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider } from '@/components/marketing/marketingUI';

export const metadata = {
  title: 'Pricing | Lead2Project',
  description:
    'Two plans for contractors. Start free with a booking link and job board, or go Pro for $49.99/month: quotes, deposits, card payments and more.',
};

// Two plans. "Pro" is the $49.99 plan ('basic' in lib/permissions).
// Keep every line on this page true to what each plan unlocks.
type PlanName = 'Free' | 'Pro';
const PLANS: PlanName[] = ['Free', 'Pro'];

const PLAN_INFO: Record<PlanName, { price: string; period: string; desc: string; cta: string; href: string; highlight: boolean }> = {
  Free: { price: '$0', period: 'forever', desc: 'Take requests and keep track of every job.', cta: 'Start free', href: '/signup', highlight: false },
  Pro: {
    price: '$49.99',
    period: '/month',
    desc: 'Everything you need to quote, schedule and get paid.',
    cta: 'Start 14-day free trial',
    href: '/signup?plan=basic',
    highlight: true,
  },
};

const PLAN_HIGHLIGHTS: Record<PlanName, string[]> = {
  Free: ['Booking link and QR code', 'Lead dashboard and job board', 'Table and calendar views', 'Add jobs by hand'],
  Pro: [
    'Everything in Free',
    'Services with prices and default deposits',
    'Email quotes customers accept online',
    'Deposits and balance invoices',
    'Card payments through Stripe',
    'Scheduling and one-click schedule emails',
    'Invoice and payment reminder emails',
    'Google review requests',
    'Custom booking form and branding',
    'Email history, custom templates and a morning digest',
    'Unlimited team members',
    'CSV export, including QuickBooks format',
  ],
};

type FeatureRow = { label: string; free: boolean };
type FeatureGroup = { group: string; rows: FeatureRow[] };

// Pro includes every row, so only Free needs a flag.
const FEATURE_TABLE: FeatureGroup[] = [
  {
    group: 'Getting requests',
    rows: [
      { label: 'Booking link and QR code', free: true },
      { label: 'Google Business Profile link', free: true },
      { label: 'Branded booking form', free: false },
      { label: 'Custom form questions', free: false },
      { label: 'Customer photo uploads', free: false },
    ],
  },
  {
    group: 'Managing jobs',
    rows: [
      { label: 'Card view and job board', free: true },
      { label: 'Table and calendar views', free: true },
      { label: 'Add jobs by hand', free: true },
      { label: 'Custom pipeline stages', free: false },
      { label: 'Services with task checklists', free: false },
      { label: 'Assign jobs to team members', free: false },
      { label: 'Delete and archive jobs', free: false },
    ],
  },
  {
    group: 'Quotes and invoices',
    rows: [
      { label: 'Quote builder with line items', free: false },
      { label: 'Saved services with prices', free: false },
      { label: 'Email quotes to customers', free: false },
      { label: 'Customer accepts the quote online', free: false },
      { label: 'Invoice PDFs', free: false },
      { label: 'Invoice email with payment link', free: false },
    ],
  },
  {
    group: 'Getting paid',
    rows: [
      { label: 'Deposits (percent or flat amount)', free: false },
      { label: 'Card payments through Stripe', free: false },
      { label: 'Venmo, Zelle, Cash App or PayPal link', free: false },
      { label: 'Record cash and check payments', free: false },
      { label: 'Automatic payment receipts', free: false },
      { label: 'Due dates and overdue tracking', free: false },
      { label: 'Payment reminder emails', free: false },
    ],
  },
  {
    group: 'Scheduling',
    rows: [
      { label: 'Schedule jobs with date and time', free: false },
      { label: 'Assign a crew member', free: false },
      { label: 'Email the schedule to the customer', free: false },
    ],
  },
  {
    group: 'Bookkeeping',
    rows: [
      { label: 'CSV export, including QuickBooks format', free: false },
      { label: 'Expenses and profit per job', free: false },
      { label: 'Receipt and document uploads per job', free: false },
    ],
  },
  {
    group: 'Team',
    rows: [
      { label: 'Unlimited team members', free: false },
      { label: 'Role-based permissions', free: false },
    ],
  },
  {
    group: 'Emails and extras',
    rows: [
      { label: 'Google review request on completion', free: false },
      { label: 'Email history (outbox)', free: false },
      { label: 'Custom email templates', free: false },
      { label: 'Daily digest email every morning', free: false },
      { label: 'AI assistant for your job data', free: false },
    ],
  },
];

function Cell({ on }: { on: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {on ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00828A] text-white">
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </span>
      ) : (
        <X className="h-4 w-4 text-slate-300" strokeWidth={2} aria-label="Not included" />
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-[#F4EFE6] text-[#1C1F23] antialiased`}>
      <Nav />

      {/* ── Header ── */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold uppercase tracking-tight leading-[0.9]">
          One job pays for the whole year.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#3a3f45] max-w-xl mx-auto">
          Start free. Go Pro when you&rsquo;re ready to quote, collect deposits and get paid.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#3a3f45]">Cancel anytime · No setup fees · No contract</p>
      </section>

      {/* ── Plan cards ── */}
      <section className="pb-16 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {PLANS.map((plan) => {
            const info = PLAN_INFO[plan];
            return (
              <div
                key={plan}
                className={`relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-6 sm:p-7 pt-8 ${
                  info.highlight ? 'shadow-lg' : 'shadow-sm'
                }`}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ background: info.highlight ? '#00828A' : '#e2e8f0' }}
                  aria-hidden
                />

                <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase">{plan}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight">{info.price}</span>
                  <span className="text-sm text-slate-500">{info.period}</span>
                </div>
                <p className="mt-2 text-[15px] text-[#3a3f45]">{info.desc}</p>

                <Link
                  href={info.href}
                  className={`mt-6 block w-full rounded-md border py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider transition-all ${
                    info.highlight
                      ? 'bg-[#00828A] hover:bg-[#006e75] text-white border-[#00828A]'
                      : 'bg-white border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {info.cta}
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {PLAN_HIGHLIGHTS[plan].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[15px]">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${info.highlight ? 'text-[#00828A]' : ''}`} strokeWidth={3} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Comparison table ── */}
      <section className="pb-16 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold uppercase tracking-tight">Compare plans</h2>
            <p className="mt-2 text-sm text-slate-500">Pro includes everything on this list.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1.8fr_1fr_1fr] border-b border-slate-200 bg-[#1C1F23] text-white">
              <div className="px-3 sm:px-5 py-4" />
              {PLANS.map((plan) => (
                <div key={plan} className="px-1 sm:px-4 py-4 text-center">
                  <p
                    className={`font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider ${
                      PLAN_INFO[plan].highlight ? 'text-[#5EC4C9]' : 'text-slate-300'
                    }`}
                  >
                    {plan}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-display)] text-lg sm:text-2xl font-extrabold">{PLAN_INFO[plan].price}</p>
                </div>
              ))}
            </div>

            {FEATURE_TABLE.map((group) => (
              <div key={group.group}>
                <div className="bg-[#F4EFE6] px-3 sm:px-5 py-2">
                  <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em]">{group.group}</p>
                </div>
                {group.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1.8fr_1fr_1fr] border-b border-slate-100 last:border-b-0">
                    <div className="px-3 sm:px-5 py-3 flex items-center">
                      <span className="text-sm sm:text-[15px]">{row.label}</span>
                    </div>
                    <div className="py-3 flex items-center justify-center">
                      <Cell on={row.free} />
                    </div>
                    <div className="py-3 flex items-center justify-center">
                      <Cell on />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pb-20 sm:pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-lg bg-[#00828A] text-white shadow-lg p-8 sm:p-12">
          <h2 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold uppercase tracking-tight">Start free today.</h2>
          <p className="mt-3 text-base text-white/85">
            Get your booking link and job board for free. Go Pro when you&rsquo;re ready to quote and take payments.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-md bg-white text-[#00828A] hover:bg-slate-50 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              Start free
            </Link>
            <Link
              href="/signup?plan=basic"
              className="px-8 py-3 rounded-md border border-white/40 text-white hover:bg-white/10 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider transition-colors"
            >
              Try Pro free for 14 days
            </Link>
          </div>
        </div>
      </section>

      <TapeDivider />
      <Footer />
    </div>
  );
}