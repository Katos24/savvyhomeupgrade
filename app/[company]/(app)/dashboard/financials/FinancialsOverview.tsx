'use client';

import { CheckCircle2, Clock, AlertCircle, FileText, DollarSign, ArrowRight } from 'lucide-react';
import type { InvoiceState } from './InvoicesList';

// Accepts undefined or null safely
const fmt = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n ?? 0);

const fmtExact = (n?: number | null) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);

const fmtDateLong = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Same statuses Dashboard's Recent Payments already badges — 'paid'
// isn't shown at all since an unqualified "+$X" already reads correctly
// for a normal, uncomplicated payment.
const statusBadgeStyles: Record<string, { light: string; dark: string }> = {
  refunded: { light: 'bg-stone-100 text-stone-600', dark: 'bg-white/10 text-slate-300' },
  partially_refunded: { light: 'bg-amber-100 text-amber-700', dark: 'bg-amber-500/15 text-amber-400' },
  partial: { light: 'bg-amber-100 text-amber-700', dark: 'bg-amber-500/15 text-amber-400' },
};

const statusBadgeLabels: Record<string, string> = {
  refunded: 'REFUNDED',
  partially_refunded: 'PARTIAL REFUND',
  partial: 'PARTIAL',
};

function StatusBadge({ status, isDark }: { status?: string | null; isDark: boolean }) {
  if (!status || status === 'paid' || status === 'unpaid') return null;
  const styleSet = statusBadgeStyles[status];
  const label = statusBadgeLabels[status];
  if (!styleSet || !label) return null;
  return (
    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isDark ? styleSet.dark : styleSet.light}`}>
      {label}
    </span>
  );
}

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

export default function FinancialsOverview({
  isDark = false,
  totalOwed = 0,
  totalCollected = 0,
  totalQuoted = 0,
  overdueTotal = 0,
  owedJobsCount = 0,
  jobsCount = 0,
  notInvoicedTotal = 0,
  notInvoicedCount = 0,
  recentPayments = [],
  onSelectFilter,
}: Props) {
  const collectionRate = totalQuoted > 0 ? Math.min(Math.round((totalCollected / totalQuoted) * 100), 100) : 0;

  // Shared tokens for the three action cards and the two summary panels —
  // built once here rather than repeating the isDark ternary at every
  // single className, since nearly every card in this file needs the
  // same base treatment.
  const cardBase = isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white';
  const cardHover = isDark ? 'hover:border-white/20' : 'hover:border-stone-400';
  const labelText = isDark ? 'text-slate-400' : 'text-stone-500';
  const valueText = isDark ? 'text-white' : 'text-stone-900';
  const subText = isDark ? 'text-slate-500' : 'text-stone-400';
  const iconBg = isDark ? 'bg-white/5' : 'bg-stone-100';
  const iconBgHover = isDark ? 'group-hover:bg-white/10' : 'group-hover:bg-stone-200';
  const iconText = isDark ? 'text-slate-300' : 'text-stone-600';

  return (
    <div className="space-y-6">
      {/* SECTION 1: HERO METRICS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Total Collected Hero Card — always the dark treatment, light or
            dark mode, matching Dashboard's own hero cards which do the
            same (a deliberately darker "headline" card even in light mode) */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-6 text-white shadow-sm lg:col-span-1">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Collected</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {collectionRate}% Realized
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums">{fmt(totalCollected)}</p>
            <p className="mt-1 text-xs text-stone-400">Across {jobsCount} projects in this period</p>
          </div>

          <div className="mt-6 border-t border-stone-800 pt-4">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Collected vs. Quoted ({fmt(totalQuoted)})</span>
              <span className="font-semibold text-emerald-400">{collectionRate}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Clickable Action Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
          {/* Outstanding Receivables -> Filter 'sent' */}
          <button
            onClick={() => onSelectFilter?.('sent')}
            className={`group flex flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 ${cardBase} ${cardHover} ${
              isDark ? 'focus:ring-white/20' : 'focus:ring-stone-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${labelText}`}>Outstanding Receivables</span>
                <div className={`rounded-lg p-2 transition-colors ${iconBg} ${iconText} ${iconBgHover}`}>
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${valueText}`}>{fmt(totalOwed)}</p>
            </div>
            <div className={`mt-3 flex items-center justify-between border-t pt-2 text-xs ${isDark ? 'border-white/10' : 'border-stone-100'} ${labelText}`}>
              <span>{owedJobsCount} open job{owedJobsCount === 1 ? '' : 's'}</span>
              <span className={`flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-teal-400' : 'text-teal-700'}`}>
                View list <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </button>

          {/* Past Due -> Filter 'overdue' */}
          <button
            onClick={() => onSelectFilter?.('overdue')}
            className={`group flex flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 ${
              overdueTotal > 0
                ? isDark
                  ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50 focus:ring-rose-500/40'
                  : 'border-rose-200 bg-rose-50/40 hover:border-rose-400 focus:ring-rose-400'
                : `${cardBase} ${cardHover} ${isDark ? 'focus:ring-white/20' : 'focus:ring-stone-400'}`
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${labelText}`}>Past Due</span>
                <div className={`rounded-lg p-2 transition-colors ${
                  overdueTotal > 0
                    ? isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-600'
                    : `${iconBg} ${iconText}`
                }`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${
                overdueTotal > 0 ? (isDark ? 'text-rose-400' : 'text-rose-600') : valueText
              }`}>
                {fmt(overdueTotal)}
              </p>
            </div>
            <div className={`mt-3 flex items-center justify-between border-t pt-2 text-xs ${
              isDark ? 'border-white/10' : 'border-stone-100/60'
            } ${labelText}`}>
              <span>{overdueTotal > 0 ? 'Action required' : 'All current'}</span>
              <span className={`flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5 ${
                overdueTotal > 0
                  ? isDark ? 'text-rose-400' : 'text-rose-700'
                  : isDark ? 'text-slate-300' : 'text-stone-700'
              }`}>
                View list <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </button>

          {/* Uninvoiced -> Filter 'draft' */}
          <button
            onClick={() => onSelectFilter?.('draft')}
            className={`group flex flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 ${cardBase} ${cardHover} ${
              isDark ? 'focus:ring-white/20' : 'focus:ring-stone-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${labelText}`}>Uninvoiced Work</span>
                <div className={`rounded-lg p-2 transition-colors ${
                  isDark ? 'bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${valueText}`}>{fmt(notInvoicedTotal)}</p>
            </div>
            <div className={`mt-3 flex items-center justify-between border-t pt-2 text-xs ${isDark ? 'border-white/10' : 'border-stone-100'} ${labelText}`}>
              <span>{notInvoicedCount} job{notInvoicedCount === 1 ? '' : 's'} ready</span>
              <span className={`flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                View list <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: REVENUE PIPELINE & RECENT INFLOWS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Pipeline Summary */}
        <div className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-7 ${cardBase}`}>
          <div>
            <h3 className={`text-sm font-semibold ${valueText}`}>Revenue Pipeline Summary</h3>
            <p className={`mt-0.5 text-xs ${labelText}`}>Breakdown of current capital distribution</p>

            <div className="mt-6 space-y-3">
              <div
                onClick={() => onSelectFilter?.('paid')}
                className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isDark
                    ? 'border-white/5 bg-white/[0.03] hover:border-emerald-500/30 hover:bg-emerald-500/5'
                    : 'border-stone-100 bg-stone-50 hover:border-emerald-200 hover:bg-emerald-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className={`text-xs font-semibold ${valueText}`}>Cash Collected</p>
                    <p className={`text-[11px] ${subText}`}>In bank / processed</p>
                  </div>
                </div>
                <span className={`text-sm font-bold tabular-nums transition-colors ${valueText} ${isDark ? 'group-hover:text-emerald-400' : 'group-hover:text-emerald-900'}`}>
                  {fmtExact(totalCollected)}
                </span>
              </div>

              <div
                onClick={() => onSelectFilter?.('sent')}
                className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isDark
                    ? 'border-white/5 bg-white/[0.03] hover:border-amber-500/30 hover:bg-amber-500/5'
                    : 'border-stone-100 bg-stone-50 hover:border-amber-200 hover:bg-amber-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div>
                    <p className={`text-xs font-semibold ${valueText}`}>Invoiced & Pending</p>
                    <p className={`text-[11px] ${subText}`}>{owedJobsCount} open invoices</p>
                  </div>
                </div>
                <span className={`text-sm font-bold tabular-nums transition-colors ${valueText} ${isDark ? 'group-hover:text-amber-400' : 'group-hover:text-amber-900'}`}>
                  {fmtExact(totalOwed)}
                </span>
              </div>

              <div
                onClick={() => onSelectFilter?.('draft')}
                className={`group flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all ${
                  isDark
                    ? 'border-white/5 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                    : 'border-stone-100 bg-stone-50 hover:border-stone-300 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-slate-500' : 'bg-stone-400'}`} />
                  <div>
                    <p className={`text-xs font-semibold ${valueText}`}>Unbilled / Completed Work</p>
                    <p className={`text-[11px] ${subText}`}>{notInvoicedCount} jobs awaiting invoice creation</p>
                  </div>
                </div>
                <span className={`text-sm font-bold tabular-nums ${valueText}`}>{fmtExact(notInvoicedTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Inflows */}
        <div className={`flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-5 ${cardBase}`}>
          <div>
            <div className={`mb-4 flex items-center justify-between border-b pb-3 ${isDark ? 'border-white/10' : 'border-stone-100'}`}>
              <div>
                <h3 className={`text-sm font-semibold ${valueText}`}>Recent Cash Inflows</h3>
                <p className={`mt-0.5 text-xs ${labelText}`}>Latest payments received</p>
              </div>
              <div className={`rounded-lg p-2 ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <DollarSign className="h-4 w-4" />
              </div>
            </div>

            {recentPayments.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
                <p className={`text-xs font-medium ${labelText}`}>No recent payments</p>
                <p className={`text-[11px] ${subText}`}>Activity will appear here when recorded.</p>
              </div>
            ) : (
              <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-stone-100'}`}>
                {recentPayments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between py-2.5 transition-colors rounded-lg px-1 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <p className={`truncate text-xs font-medium ${valueText}`}>{p.customer_name || 'Unnamed Client'}</p>
                        <StatusBadge status={p.payment_status} isDark={isDark} />
                      </div>
                      <p className={`text-[11px] ${subText}`}>{fmtDateLong(p.payment_date)}</p>
                    </div>
                    {(() => {
                      // A "+" and emerald green both claim "clean, simple
                      // revenue" — misleading right next to a badge that's
                      // simultaneously saying some of it went back out.
                      const isRefundRelated =
                        p.payment_status === 'refunded' || p.payment_status === 'partially_refunded';
                      return (
                        <span
                          className={`shrink-0 text-xs font-semibold tabular-nums ${
                            isRefundRelated
                              ? isDark ? 'text-slate-400' : 'text-stone-500'
                              : isDark ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          {isRefundRelated ? '' : '+'}
                          {fmtExact(p._collected)}
                        </span>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}