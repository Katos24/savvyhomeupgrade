import { Check, X, Sparkles, Zap, ArrowRight, Minus } from 'lucide-react';
import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Pricing | Lead2Project',
  description: 'Simple, transparent pricing for contractors. Start free, upgrade when you\'re ready.',
};

const PLANS = ['Free', 'Basic', 'Pro'] as const;

const PLAN_PRICES = {
  Free:  { price: '$0',      period: 'forever',  cta: 'Get Started Free', href: '/signup',           highlight: false },
  Basic: { price: '$49.99',  period: '/month',    cta: 'Start Free Trial', href: '/signup', highlight: false },
  Pro:   { price: '$79.99',  period: '/month',    cta: 'Start Free Trial', href: '/signup',   highlight: true  },
};

const PLAN_DESCRIPTIONS = {
  Free:  'See your leads come in. Upgrade when you\'re ready.',
  Basic: 'Full job management for growing crews.',
  Pro:   'Automation and AI for serious contractors.',
};

const PLAN_HIGHLIGHTS = {
  Free: [
    'Booking link and QR code',
    'Basic lead form',
    'Lead dashboard — card view',
    'View and create leads',
    'Table and calendar view',
  ],
 Basic: [
    'Everything in Free',
    'Custom booking form and branding',
    'Accept online payments — send invoices customers pay by card',
    'Job categories, tasks, and quote templates',
    'Scheduling and quote builder',
    'Photo and document uploads',
    'CSV and QuickBooks export',
    'AI classified QuickBooks line items',
    'Unlimited team members',
  ],
 Pro: [
    'Everything in Basic',
    'One-click quote and schedule emails',
    'Email outbox — full sent history',
    'Custom email templates',
    'Daily digest email',
    'AI Brief on every lead',
    'AI quote generator',
    'AI assistant chat',
  ],
};

type PlanName = 'Free' | 'Basic' | 'Pro';
type FeatureRow = {
  label: string;
  free: boolean | 'partial';
  basic: boolean | 'partial';
  pro: boolean | 'partial';
  note?: string;
};

type FeatureGroup = {
  group: string;
  rows: FeatureRow[];
};

const FEATURE_TABLE: FeatureGroup[] = [
  {
    group: 'Lead Capture',
    rows: [
      { label: 'Booking link and QR code',           free: true,  basic: true,  pro: true  },
      { label: 'Branded booking form',               free: false, basic: true,  pro: true  },
      { label: 'Custom form questions',              free: false, basic: true,  pro: true  },
      { label: 'Customer photo and video uploads',   free: false, basic: true,  pro: true  },
      { label: 'Address field on booking form',    free: false, basic: true,  pro: true  },
      { label: 'Google Business Profile link',       free: true,  basic: true,  pro: true  },
    ],
  },
  {
    group: 'Lead Management',
    rows: [
      { label: 'Lead board — card view',             free: true,  basic: true,  pro: true  },
      { label: 'Table view',                         free: true,  basic: true,  pro: true  },
      { label: 'Calendar view',                      free: true,  basic: true,  pro: true  },
      { label: 'Create leads manually',              free: true,  basic: true,  pro: true  },
      { label: 'Custom pipeline stages',             free: false, basic: true,  pro: true  },
      { label: 'Job categories and task templates',  free: false, basic: true,  pro: true  },
      { label: 'Assign leads to team members',       free: false, basic: true,  pro: true  },
      { label: 'Convert lead to project',            free: false, basic: true,  pro: true  },
      { label: 'Delete and archive leads',           free: false, basic: true,  pro: true  },
    ],
  },
  {
    group: 'Quotes and Invoices',
    rows: [
      { label: 'Quote builder with line items',      free: false, basic: true,  pro: true  },
      { label: 'Custom quote templates',             free: false, basic: true,  pro: true  },
      { label: 'Send quote email to customer',       free: false, basic: false, pro: true  },
      { label: 'Customer accept or decline',         free: false, basic: false, pro: true  },
      { label: 'Invoice generation as PDF',          free: false, basic: true,  pro: true  },
      { label: 'Send invoice email with payment link', free: false, basic: true, pro: true },
      { label: 'AI quote generator',                 free: false, basic: false, pro: true  },
    ],
  },
  {
    group: 'Scheduling',
    rows: [
      { label: 'Schedule jobs with date and time',   free: false, basic: true,  pro: true  },
      { label: 'Assign technician to job',           free: false, basic: true,  pro: true  },
      { label: 'Send schedule email to customer',    free: false, basic: false, pro: true  },
    ],
  },
  {
    group: 'Payments',
    rows: [
      { label: 'Track paid, partial, unpaid',        free: false, basic: true,  pro: true  },
      { label: 'Record payment amount and method',   free: false, basic: true,  pro: true  },
      { label: 'Payment due date tracking',          free: false, basic: true,  pro: true  },
      { label: 'Send payment reminder email',        free: false, basic: true,  pro: true  },
      { label: 'Online payments via Stripe',         free: false, basic: true,  pro: true  },
      { label: 'Venmo, Zelle, CashApp, PayPal link', free: false, basic: true,  pro: true  },
    ],
  },
  {
    group: 'Bookkeeping',
    rows: [
      { label: 'CSV export',                         free: false, basic: true,  pro: true  },
      { label: 'QuickBooks formatted export',        free: false, basic: true,  pro: true  },
      { label: 'AI classified line items',           free: false, basic: true, pro: true  },
      { label: 'QBO account name mapping',           free: false, basic: true, pro: true  },
      { label: 'Receipt upload per job',             free: false, basic: true,  pro: true  },
      { label: 'Financials and tax readiness page',  free: false, basic: true,  pro: true  },
    ],
  },
  {
    group: 'Team',
    rows: [
      { label: 'Unlimited team members',             free: false, basic: true,  pro: true  },
      { label: 'Role-based permissions',             free: false, basic: true,  pro: true  },
    ],
  },
  {
    group: 'Emails and Automation',
    rows: [
      { label: 'Email outbox — full sent history',   free: false, basic: false, pro: true  },
      { label: 'Custom email templates',             free: false, basic: false, pro: true  },
      { label: 'Daily digest email at 6AM',          free: false, basic: false, pro: true  },
      { label: 'Google review auto-request',         free: false, basic: true,  pro: true  },
    ],
  },
  {
    group: 'AI Features',
    rows: [
      { label: 'AI Brief on every lead',             free: false, basic: false, pro: true  },
      { label: 'AI quote generator',                 free: false, basic: false, pro: true  },
      { label: 'AI assistant chat',                  free: false, basic: false, pro: true  },
      { label: 'AI photo and text analysis',         free: false, basic: false, pro: true  },
    ],
  },
];

function Cell({ value }: { value: boolean | 'partial' }) {
  if (value === true) return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    </div>
  );
  if (value === 'partial') return (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
        <Minus className="w-3 h-3 text-white" strokeWidth={3} />
      </div>
    </div>
  );
  return (
    <div className="flex items-center justify-center">
      <X className="w-4 h-4 text-slate-700" strokeWidth={2} />
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav />

      {/* ── HERO ── */}
      <section className="pt-24 sm:pt-32 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3 h-3" /> No credit card required to start
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
          One job pays for<br />
          <span className="text-emerald-400">the whole year.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-2">
          Stop losing leads to disorganization. Start running your business like a pro.
        </p>
        <p className="text-sm text-slate-600">Sign up in 2 minutes · No demo needed · Cancel anytime</p>
      </section>

      {/* ── PLAN CARDS ── */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5">
          {(Object.keys(PLAN_PRICES) as PlanName[]).map(plan => {
            const { price, period, cta, href, highlight } = PLAN_PRICES[plan];
            const isProPlan = plan === 'Pro';
            return (
              <div
                key={plan}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: highlight ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)',
                  border: highlight ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {highlight && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
                {highlight && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-500 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6 sm:p-7 flex-1 flex flex-col">
                  {/* Plan name */}
                  <div className="flex items-center gap-2 mb-4">
                    {isProPlan
                      ? <Sparkles className="w-4 h-4 text-emerald-400" />
                      : <Zap className="w-4 h-4 text-slate-500" />
                    }
                    <span className={`text-xs font-black uppercase tracking-widest ${isProPlan ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {plan}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">{price}</span>
                    <span className="text-slate-500 text-sm ml-1">{period}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">{PLAN_DESCRIPTIONS[plan]}</p>

                  {/* CTA */}
                  <Link
                    href={href}
                    className="block w-full py-3 text-center text-sm font-black rounded-xl transition-all active:scale-95 mb-7"
                    style={{
                      background: highlight ? '#10b981' : plan === 'Free' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      border: highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {cta}
                  </Link>

                  {/* Feature list */}
                  <div className="space-y-2.5 flex-1">
                    {PLAN_HIGHLIGHTS[plan].map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: isProPlan ? '#10b981' : '#64748b' }}
                          strokeWidth={2.5}
                        />
                        <span className="text-sm text-slate-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURE COMPARISON TABLE ── */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Full feature comparison</h2>
            <p className="text-slate-500 text-sm">See exactly what's included in each plan.</p>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Header */}
            <div className="grid grid-cols-4 bg-slate-900" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4" />
              {PLANS.map(plan => (
                <div key={plan} className="px-4 py-4 text-center">
                  <p className={`text-xs font-black uppercase tracking-widest ${plan === 'Pro' ? 'text-emerald-400' : 'text-slate-400'}`}>{plan}</p>
                  <p className="text-white font-black text-lg mt-0.5">{PLAN_PRICES[plan].price}</p>
                  <p className="text-slate-600 text-[10px]">{PLAN_PRICES[plan].period}</p>
                </div>
              ))}
            </div>

            {/* Groups */}
            {FEATURE_TABLE.map((group, gi) => (
              <div key={group.group}>
                {/* Group header */}
                <div
                  className="px-5 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', borderTop: gi > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.group}</p>
                </div>

                {/* Rows */}
                {group.rows.map((row, ri) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-4"
                    style={{
                      borderBottom: ri < group.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: ri % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                    }}
                  >
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="text-sm text-slate-300">{row.label}</span>
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-center">
                      <Cell value={row.free} />
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-center">
                      <Cell value={row.basic} />
                    </div>
                    <div className="px-4 py-3.5 flex items-center justify-center">
                      <Cell value={row.pro} />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Footer row */}
      
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { stat: '1 job',  label: 'Pays for the whole year' },
            { stat: '2 min',  label: 'To set up — no demo needed' },
            { stat: '$0',     label: 'To get started' },
          ].map(({ stat, label }) => (
            <div key={stat} className="rounded-2xl py-6 px-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mb-1">{stat}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center rounded-2xl p-10 sm:p-14" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <h2 className="text-3xl font-black text-white mb-3">Ready to get organized?</h2>
          <p className="text-slate-400 mb-8 text-base">Sign up free in 2 minutes. No credit card required. Upgrade when you're ready.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup"
              className="px-8 py-3.5 rounded-xl text-sm font-black text-white bg-emerald-500 hover:bg-emerald-400 transition-all active:scale-95 inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login"
              className="px-8 py-3.5 rounded-xl text-sm font-black text-slate-300 hover:text-white transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}