import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Pricing | Lead2Project',
  description: 'Simple pricing for contractors. Start free, upgrade when you need quotes, deposits and payments.',
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

type PlanName = 'Free' | 'Basic' | 'Pro';
const PLANS: PlanName[] = ['Free', 'Basic', 'Pro'];

// Keep every line on this page true to what each plan unlocks in lib/permissions.
const PLAN_INFO: Record<PlanName, { price: string; period: string; desc: string; cta: string; highlight: boolean }> = {
  Free: { price: '$0', period: 'forever', desc: 'Take requests and keep track of every job.', cta: 'Start free', highlight: false },
  Basic: { price: '$49.99', period: '/month', desc: 'Quotes, deposits, invoices and card payments.', cta: 'Start 14-day free trial', highlight: false },
  Pro: { price: '$79.99', period: '/month', desc: 'Send quotes and schedules by email, fully automated.', cta: 'Start 14-day free trial', highlight: true },
};

const PLAN_HIGHLIGHTS: Record<PlanName, string[]> = {
  Free: ['Booking link and QR code', 'Lead dashboard and job board', 'Table and calendar views', 'Add jobs by hand'],
  Basic: [
    'Everything in Free',
    'Services with price templates',
    'Deposits and balance invoices',
    'Card payments through Stripe',
    'Receipts sent automatically',
    'Custom booking form and branding',
    'Scheduling, tasks and photo uploads',
    'CSV and QuickBooks export',
    'Unlimited team members',
  ],
  Pro: [
    'Everything in Basic',
    'Email quotes customers accept online',
    'One-click schedule emails',
    'Custom email templates',
    'Full email history',
    '6 AM daily digest',
    'AI assistant for your job data',
  ],
};

type FeatureRow = { label: string; free: boolean; basic: boolean; pro: boolean };
type FeatureGroup = { group: string; rows: FeatureRow[] };

const FEATURE_TABLE: FeatureGroup[] = [
  {
    group: 'Getting requests',
    rows: [
      { label: 'Booking link and QR code', free: true, basic: true, pro: true },
      { label: 'Google Business Profile link', free: true, basic: true, pro: true },
      { label: 'Branded booking form', free: false, basic: true, pro: true },
      { label: 'Custom form questions', free: false, basic: true, pro: true },
      { label: 'Customer photo uploads', free: false, basic: true, pro: true },
    ],
  },
  {
    group: 'Managing jobs',
    rows: [
      { label: 'Card view and job board', free: true, basic: true, pro: true },
      { label: 'Table and calendar views', free: true, basic: true, pro: true },
      { label: 'Add jobs by hand', free: true, basic: true, pro: true },
      { label: 'Custom pipeline stages', free: false, basic: true, pro: true },
      { label: 'Services with task checklists', free: false, basic: true, pro: true },
      { label: 'Assign jobs to team members', free: false, basic: true, pro: true },
      { label: 'Delete and archive jobs', free: false, basic: true, pro: true },
    ],
  },
  {
    group: 'Quotes and invoices',
    rows: [
      { label: 'Quote builder with line items', free: false, basic: true, pro: true },
      { label: 'Price templates per service', free: false, basic: true, pro: true },
      { label: 'Invoice PDFs', free: false, basic: true, pro: true },
      { label: 'Invoice email with payment link', free: false, basic: true, pro: true },
      { label: 'Email quotes to customers', free: false, basic: false, pro: true },
      { label: 'Customer accepts the quote online', free: false, basic: false, pro: true },
    ],
  },
  {
    group: 'Getting paid',
    rows: [
      { label: 'Deposits (percent or flat amount)', free: false, basic: true, pro: true },
      { label: 'Card payments through Stripe', free: false, basic: true, pro: true },
      { label: 'Venmo, Zelle, Cash App or PayPal link', free: false, basic: true, pro: true },
      { label: 'Record cash and check payments', free: false, basic: true, pro: true },
      { label: 'Automatic payment receipts', free: false, basic: true, pro: true },
      { label: 'Due dates and overdue tracking', free: false, basic: true, pro: true },
    ],
  },
  {
    group: 'Scheduling',
    rows: [
      { label: 'Schedule jobs with date and time', free: false, basic: true, pro: true },
      { label: 'Assign a technician', free: false, basic: true, pro: true },
      { label: 'Email the schedule to the customer', free: false, basic: false, pro: true },
    ],
  },
  {
    group: 'Bookkeeping',
    rows: [
      { label: 'CSV export', free: false, basic: true, pro: true },
      { label: 'QuickBooks-formatted export', free: false, basic: true, pro: true },
      { label: 'Receipt uploads per job', free: false, basic: true, pro: true },
      { label: 'Financials page', free: false, basic: true, pro: true },
    ],
  },
  {
    group: 'Team',
    rows: [
      { label: 'Unlimited team members', free: false, basic: true, pro: true },
      { label: 'Role-based permissions', free: false, basic: true, pro: true },
    ],
  },
  {
    group: 'Emails and automation',
    rows: [
      { label: 'Google review request on completion', free: false, basic: true, pro: true },
      { label: 'Email history (outbox)', free: false, basic: false, pro: true },
      { label: 'Custom email templates', free: false, basic: false, pro: true },
      { label: 'Daily digest email at 6 AM', free: false, basic: false, pro: true },
      { label: 'AI assistant for your job data', free: false, basic: false, pro: true },
    ],
  },
];

function Cell({ on }: { on: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {on ? (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00828A]">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
      ) : (
        <X className="h-4 w-4 text-slate-300" strokeWidth={2} aria-label="Not included" />
      )}
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] min-h-screen bg-[#F4F7F6] text-slate-900 antialiased`}>
      <Nav />

      {/* ── Header ── */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 text-center">
        <p className="text-xs font-bold text-[#00828A] tracking-widest uppercase">Pricing</p>
        <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          One job pays for the whole year.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          Start free. Upgrade when you&rsquo;re ready to quote, collect deposits and get paid.
        </p>
        <p className="mt-2 text-sm text-slate-500">Cancel anytime · No setup fees</p>
      </section>

      {/* ── Plan cards ── */}
      <section className="pb-16 sm:pb-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((plan) => {
            const info = PLAN_INFO[plan];
            return (
              <div
                key={plan}
                className={`relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                  info.highlight
                    ? 'border-2 border-[#00828A] bg-white shadow-lg shadow-[#00828A]/10'
                    : 'border border-slate-200 bg-white'
                }`}
              >
                {info.highlight && (
                  <span className="absolute -top-3 left-6 rounded-full bg-[#00828A] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Recommended
                  </span>
                )}

                <h2 className="text-sm font-bold">{plan}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{info.price}</span>
                  <span className="text-sm text-slate-500">{info.period}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{info.desc}</p>

                <Link
                  href="/signup"
                  className={`mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors ${
                    info.highlight
                      ? 'bg-[#00828A] text-white hover:bg-[#006e75]'
                      : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {info.cta}
                </Link>

                <ul className="mt-6 space-y-2.5">
                  {PLAN_HIGHLIGHTS[plan].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={2.5} />
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Compare plans</h2>
            <p className="mt-2 text-sm text-slate-500">Everything included in each plan.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* Header row (sticks while scrolling the table) */}
            <div className="grid grid-cols-[1.6fr_repeat(3,1fr)] border-b border-slate-200 bg-white">
              <div className="px-3 sm:px-5 py-4" />
              {PLANS.map((plan) => (
                <div key={plan} className="px-1 sm:px-4 py-4 text-center">
                  <p className={`text-xs font-bold ${PLAN_INFO[plan].highlight ? 'text-[#00828A]' : 'text-slate-600'}`}>{plan}</p>
                  <p className="mt-0.5 text-sm sm:text-lg font-extrabold">{PLAN_INFO[plan].price}</p>
                </div>
              ))}
            </div>

            {FEATURE_TABLE.map((group) => (
              <div key={group.group}>
                <div className="bg-[#F8FAF9] px-3 sm:px-5 py-2.5 border-y border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{group.group}</p>
                </div>
                {group.rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1.6fr_repeat(3,1fr)] border-b border-slate-100 last:border-b-0"
                  >
                    <div className="px-3 sm:px-5 py-3 flex items-center">
                      <span className="text-xs sm:text-sm text-slate-700">{row.label}</span>
                    </div>
                    <div className="py-3 flex items-center justify-center"><Cell on={row.free} /></div>
                    <div className="py-3 flex items-center justify-center"><Cell on={row.basic} /></div>
                    <div className="py-3 flex items-center justify-center"><Cell on={row.pro} /></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pb-20 sm:pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-2xl bg-[#0B1520] text-white p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Start free today.</h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300">
            Set up your services and booking link, then upgrade when you&rsquo;re ready to take payments.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-xl bg-[#00828A] hover:bg-[#006e75] text-white text-sm font-bold transition-colors"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}