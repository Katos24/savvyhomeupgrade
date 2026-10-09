'use client';

import { ArrowRight } from 'lucide-react';
import type { InvoiceState } from './InvoicesList';
import { BUCKETS } from '@/lib/invoiceState';

// ---------------------------------------------------------------------------
// Shared tokens — same slate palette as the Dashboard and Outbox.
// Color only carries meaning: green = money received, red = past due,
// amber = needs an invoice.
// ---------------------------------------------------------------------------

export function finTokens(isDark: boolean) {
  return isDark
    ? {
        page: 'bg-[#0b0f17] text-slate-100',
        card: 'bg-[#0f1420] border border-white/10',
        text: 'text-white',
        sub: 'text-slate-400',
        faint: 'text-slate-500',
        divide: 'divide-white/10',
        border: 'border-white/10',
        hover: 'hover:bg-white/[0.04]',
        track: 'bg-white/[0.06]',
        bar: 'bg-slate-300',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        menu: 'border-white/10 bg-[#0f1420]',
        input: 'border-white/10 bg-white/5 text-slate-100 focus:border-white/30',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        active: 'text-white font-semibold',
        paid: 'text-emerald-400',
        due: 'text-rose-400',
        dueCard: 'border-rose-500/30',
        warnDot: 'bg-amber-400',
      }
    : {
        page: 'bg-slate-50 text-slate-900',
        card: 'bg-white border border-slate-200',
        text: 'text-slate-900',
        sub: 'text-slate-500',
        faint: 'text-slate-400',
        divide: 'divide-slate-100',
        border: 'border-slate-200',
        hover: 'hover:bg-slate-50',
        track: 'bg-slate-100',
        bar: 'bg-slate-800',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        menu: 'border-slate-200 bg-white',
        input: 'border-slate-200 bg-white text-slate-900 focus:border-slate-400',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        active: 'text-slate-900 font-semibold',
        paid: 'text-emerald-700',
        due: 'text-rose-600',
        dueCard: 'border-rose-300',
        warnDot: 'bg-amber-500',
      };
}
export type FinTokens = ReturnType<typeof finTokens>;

const fmt = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const fmtExact = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const fmtDate = (d?: string | null) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

// Overdue bucket keys used by FinancialsClient. Labels come from BUCKETS
// when it has them, otherwise these.
const OVERDUE_KEYS = ['1', '30', '60', '90'] as const;
const FALLBACK_AGE_LABELS: Record<string, string> = {
  '1': '1–29 days late',
  '30': '30–59 days late',
  '60': '60–89 days late',
  '90': '90+ days late',
};
function ageLabel(key: string) {
  const b = (BUCKETS as any[]).find((x) => x.key === key);
  return (b && typeof b.label === 'string' && b.label) || FALLBACK_AGE_LABELS[key] || key;
}

const REFUND_LABELS: Record<string, string> = {
  refunded: 'Refunded',
  partially_refunded: 'Partly refunded',
  partial: 'Partial',
};

export interface RecentPayment {
  id: string | number;
  customer_name?: string | null;
  payment_date?: string | null;
  _collected?: number | null;
  payment_status?: string | null;
}

type Props = {
  isDark?: boolean;
  totalOwed?: number;
  totalCollected?: number;
  totalQuoted?: number;
  overdueTotal?: number;
  owedJobsCount?: number;
  jobsCount?: number;
  aging?: Record<string, { amount: number; count: number }>;
  notInvoicedTotal?: number;
  notInvoicedCount?: number;
  recentPayments?: RecentPayment[];
  onSelectFilter?: (filter: InvoiceState | 'all') => void;
};

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function Stat({
  label,
  value,
  note,
  valueClass,
  cardClass = '',
  onClick,
  t,
}: {
  label: string;
  value: string;
  note: string;
  valueClass?: string;
  cardClass?: string;
  onClick?: () => void;
  t: FinTokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col rounded-2xl p-4 text-left transition ${t.card} ${cardClass} ${t.hover}`}
    >
      <span className={`text-xs font-medium ${t.sub}`}>{label}</span>
      <span className={`mt-1.5 truncate text-xl font-semibold tabular-nums tracking-tight sm:text-2xl ${valueClass || t.text}`}>{value}</span>
      <span className={`mt-1 flex items-center justify-between gap-2 text-xs ${t.faint}`}>
        <span className="truncate">{note}</span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
      </span>
    </button>
  );
}

function Row({
  label,
  note,
  amount,
  dot,
  amountClass,
  onClick,
  t,
}: {
  label: string;
  note?: string;
  amount: number;
  dot?: string;
  amountClass?: string;
  onClick?: () => void;
  t: FinTokens;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${
        onClick ? t.hover : 'cursor-default'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        {dot && <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />}
        <span className="min-w-0">
          <span className={`block truncate text-sm ${t.text}`}>{label}</span>
          {note && <span className={`block truncate text-xs ${t.faint}`}>{note}</span>}
        </span>
      </span>
      <span className={`shrink-0 text-sm font-semibold tabular-nums ${amountClass || t.text}`}>{fmtExact(amount)}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function FinancialsOverview({
  isDark = false,
  totalOwed = 0,
  totalCollected = 0,
  totalQuoted = 0,
  overdueTotal = 0,
  owedJobsCount = 0,
  jobsCount = 0,
  aging = {},
  notInvoicedTotal = 0,
  notInvoicedCount = 0,
  recentPayments = [],
  onSelectFilter,
}: Props) {
  const t = finTokens(isDark);

  // totalOwed includes jobs that haven't been invoiced yet, so split it:
  // "waiting on payment" is only what customers have actually been billed for.
  const invoicedOwed = Math.max(0, totalOwed - notInvoicedTotal);
  const invoicedOwedCount = Math.max(0, owedJobsCount - notInvoicedCount);

  const collectedPct = totalQuoted > 0 ? Math.min(100, Math.round((totalCollected / totalQuoted) * 100)) : 0;

  const overdueRows = OVERDUE_KEYS.map((k) => ({ key: k, ...(aging[k] || { amount: 0, count: 0 }) })).filter(
    (r) => r.amount > 0.005
  );
  const overdueCount = overdueRows.reduce((s, r) => s + r.count, 0);

  const go = (f: InvoiceState | 'all') => () => onSelectFilter?.(f);

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Collected"
          value={fmt(totalCollected)}
          note={`${plural(jobsCount, 'job')} this period`}
          onClick={go('paid')}
          t={t}
        />
        <Stat
          label="Waiting on payment"
          value={fmt(invoicedOwed)}
          note={invoicedOwedCount ? `${plural(invoicedOwedCount, 'invoice')} sent` : 'Nothing outstanding'}
          onClick={go('sent')}
          t={t}
        />
        <Stat
          label="Past due"
          value={fmt(overdueTotal)}
          note={overdueTotal > 0 ? `${plural(overdueCount, 'job')} · follow up` : 'All current'}
          valueClass={overdueTotal > 0 ? t.due : undefined}
          cardClass={overdueTotal > 0 ? t.dueCard : ''}
          onClick={go('overdue')}
          t={t}
        />
        <Stat
          label="Not invoiced yet"
          value={fmt(notInvoicedTotal)}
          note={notInvoicedCount ? `${plural(notInvoicedCount, 'job')} ready to bill` : 'All billed'}
          onClick={go('draft')}
          t={t}
        />
      </div>

      {/* Collected vs quoted */}
      <div className={`rounded-2xl p-4 ${t.card}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className={`text-sm ${t.sub}`}>
            <span className={`font-semibold ${t.text}`}>{fmt(totalCollected)}</span> collected of{' '}
            <span className={`font-semibold ${t.text}`}>{fmt(totalQuoted)}</span> in jobs this period
          </p>
          <span className={`text-sm font-semibold tabular-nums ${t.text}`}>{collectedPct}%</span>
        </div>
        <div className={`mt-3 h-1.5 overflow-hidden rounded-full ${t.track}`}>
          <div className={`h-full rounded-full transition-all duration-500 ${t.bar}`} style={{ width: `${collectedPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Where the money is */}
        <section className="lg:col-span-7">
          <h2 className={`mb-2.5 text-sm font-semibold ${t.text}`}>Where the money is</h2>
          <div className={`rounded-2xl p-1.5 ${t.card}`}>
            <Row
              label="Collected"
              note="Paid by customers"
              amount={totalCollected}
              amountClass={totalCollected > 0 ? t.paid : undefined}
              onClick={go('paid')}
              t={t}
            />
            <Row
              label="Waiting on payment"
              note={`${plural(invoicedOwedCount, 'invoice')} sent, not paid yet`}
              amount={invoicedOwed}
              onClick={go('sent')}
              t={t}
            />
            <Row
              label="Not invoiced yet"
              note={`${plural(notInvoicedCount, 'job')} with a balance and no invoice`}
              amount={notInvoicedTotal}
              dot={notInvoicedTotal > 0 ? t.warnDot : undefined}
              onClick={go('draft')}
              t={t}
            />
          </div>

          {overdueRows.length > 0 && (
            <>
              <h2 className={`mb-2.5 mt-6 text-sm font-semibold ${t.text}`}>Past due by age</h2>
              <div className={`rounded-2xl p-1.5 ${t.card}`}>
                {overdueRows.map((r) => (
                  <Row
                    key={r.key}
                    label={ageLabel(r.key)}
                    note={plural(r.count, 'job')}
                    amount={r.amount}
                    amountClass={t.due}
                    onClick={go('overdue')}
                    t={t}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Latest payments (not limited to the selected period) */}
        <section className="lg:col-span-5">
          <h2 className={`mb-2.5 text-sm font-semibold ${t.text}`}>Latest payments</h2>
          <div className={`rounded-2xl ${t.card}`}>
            {recentPayments.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className={`text-sm ${t.sub}`}>No payments yet</p>
                <p className={`mt-1 text-xs ${t.faint}`}>Payments show up here as soon as they come in.</p>
              </div>
            ) : (
              <ul className={`divide-y ${t.divide}`}>
                {recentPayments.slice(0, 6).map((p) => {
                  const refundLabel = p.payment_status ? REFUND_LABELS[p.payment_status] : undefined;
                  const isRefund = p.payment_status === 'refunded' || p.payment_status === 'partially_refunded';
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className={`truncate text-sm ${t.text}`}>{p.customer_name || 'Unnamed customer'}</p>
                        <p className={`text-xs ${t.faint}`}>
                          {fmtDate(p.payment_date)}
                          {refundLabel && <> · {refundLabel}</>}
                        </p>
                      </div>
                      <span className={`shrink-0 text-sm font-semibold tabular-nums ${isRefund ? t.sub : t.paid}`}>
                        {isRefund ? '' : '+'}
                        {fmtExact(p._collected)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}