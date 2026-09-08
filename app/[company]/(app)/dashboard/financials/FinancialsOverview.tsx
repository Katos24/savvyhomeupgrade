'use client';

import { CheckCircle2, Clock, AlertCircle, FileText, DollarSign } from 'lucide-react';
import type { InvoiceState } from './InvoicesList';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const fmtDateLong = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type Props = {
  totalOwed: number;
  totalCollected: number;
  totalQuoted: number;
  overdueTotal: number;
  owedJobsCount: number;
  jobsCount: number;
  aging: Record<string, { amount: number; count: number }>;
  notInvoicedTotal: number;
  notInvoicedCount: number;
  recentPayments: any[];
  onSelectFilter?: (filter: InvoiceState | 'all') => void;
};

export default function FinancialsOverview({
  totalOwed,
  totalCollected,
  totalQuoted,
  overdueTotal,
  owedJobsCount,
  jobsCount,
  notInvoicedTotal,
  notInvoicedCount,
  recentPayments,
  onSelectFilter,
}: Props) {
  const collectionRate = totalQuoted > 0 ? Math.min(Math.round((totalCollected / totalQuoted) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      {/* SECTION 1: HERO METRICS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Total Collected Hero */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-stone-900 p-6 text-white shadow-sm lg:col-span-1">
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
              <span>{collectionRate}%</span>
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
            className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:border-stone-400 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Outstanding Receivables</span>
                <div className="rounded-lg bg-stone-100 p-2 text-stone-600">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-stone-900">{fmt(totalOwed)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-xs text-stone-500">
              <span>{owedJobsCount} open job{owedJobsCount === 1 ? '' : 's'}</span>
              <span className="font-medium text-teal-700">View list &rarr;</span>
            </div>
          </button>

          {/* Past Due -> Filter 'overdue' */}
          <button
            onClick={() => onSelectFilter?.('overdue')}
            className={`flex flex-col justify-between rounded-2xl border p-5 text-left shadow-sm transition-all hover:shadow-md ${
              overdueTotal > 0
                ? 'border-rose-200 bg-rose-50/30 hover:border-rose-400'
                : 'border-stone-200 bg-white hover:border-stone-400'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Past Due</span>
                <div className={`rounded-lg p-2 ${overdueTotal > 0 ? 'bg-rose-100 text-rose-600' : 'bg-stone-100 text-stone-600'}`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
              </div>
              <p className={`mt-2 text-2xl font-bold tabular-nums ${overdueTotal > 0 ? 'text-rose-600' : 'text-stone-900'}`}>
                {fmt(overdueTotal)}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-100/60 pt-2 text-xs text-stone-500">
              <span>{overdueTotal > 0 ? 'Action required' : 'All current'}</span>
              <span className="font-medium text-rose-700">View list &rarr;</span>
            </div>
          </button>

          {/* Uninvoiced -> Filter 'draft' */}
          <button
            onClick={() => onSelectFilter?.('draft')}
            className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all hover:border-stone-400 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">Uninvoiced Work</span>
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-stone-900">{fmt(notInvoicedTotal)}</p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-2 text-xs text-stone-500">
              <span>{notInvoicedCount} job{notInvoicedCount === 1 ? '' : 's'} ready</span>
              <span className="font-medium text-amber-700">View list &rarr;</span>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: REVENUE PIPELINE & RECENT INFLOWS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Revenue Pipeline Summary</h3>
            <p className="mt-0.5 text-xs text-stone-500">Where your money sits right now</p>

            <div className="mt-6 space-y-4">
              <div
                onClick={() => onSelectFilter?.('paid')}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Cash Collected</p>
                    <p className="text-[11px] text-stone-400">In bank / processed</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-stone-900">{fmtExact(totalCollected)}</span>
              </div>

              <div
                onClick={() => onSelectFilter?.('sent')}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3.5 transition-colors hover:border-amber-300 hover:bg-amber-50/40"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Invoiced & Pending</p>
                    <p className="text-[11px] text-stone-400">{owedJobsCount} open invoices</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-stone-900">{fmtExact(totalOwed)}</span>
              </div>

              <div
                onClick={() => onSelectFilter?.('draft')}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3.5 transition-colors hover:border-stone-300 hover:bg-stone-100/60"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-stone-400" />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">Unbilled / Completed Work</p>
                    <p className="text-[11px] text-stone-400">{notInvoicedCount} jobs awaiting invoice creation</p>
                  </div>
                </div>
                <span className="text-sm font-bold tabular-nums text-stone-900">{fmtExact(notInvoicedTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Collections */}
        <div className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-5">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Recent Cash Inflows</h3>
                <p className="mt-0.5 text-xs text-stone-500">Latest payments received</p>
              </div>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>

            {recentPayments.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-xs text-stone-400">
                No payment activity recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {recentPayments.slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-xs font-medium text-stone-900">{p.customer_name || 'Unnamed Client'}</p>
                      <p className="text-[11px] text-stone-400">{fmtDateLong(p.payment_date)}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-emerald-700">
                      +{fmtExact(p._collected)}
                    </span>
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