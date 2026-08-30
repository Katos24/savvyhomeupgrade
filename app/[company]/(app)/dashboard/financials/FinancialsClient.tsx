'use client';

import { useState, useMemo } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import FinancialsOverview from './FinancialsOverview';
import InvoicesList from './InvoicesList';

type Props = { company: any; projects: any[]; isBookkeeperView?: boolean };

const PERIODS = [
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: 'all' },
];

function filterByPeriod(projects: any[], period: string) {
  if (period === 'all') return projects;
  const now = new Date();
  return projects.filter((p) => {
    const date = new Date(p.created_at);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter')
      return Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3) && date.getFullYear() === now.getFullYear();
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function daysOverdue(p: any): number | null {
  if (!p.payment_due_date) return null;
  const due = new Date(p.payment_due_date);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

export const BUCKETS = [
  { key: '90', label: '90+ days', color: 'bg-rose-500' },
  { key: '60', label: '60–89 days', color: 'bg-orange-500' },
  { key: '30', label: '30–59 days', color: 'bg-amber-500' },
  { key: '1', label: '1–29 days', color: 'bg-yellow-500' },
  { key: '0', label: 'Not yet due', color: 'bg-teal-600' },
];

function bucketFor(p: any) {
  const d = daysOverdue(p);
  if (d === null) return '0';
  if (d >= 90) return '90';
  if (d >= 60) return '60';
  if (d >= 30) return '30';
  return '1';
}

/** One real definition of "what state is this invoice in," shared by the
 *  Overview stats and the Invoices list, so a job counted as overdue in
 *  one place can never disagree with the other. No Void or Recurring —
 *  neither concept exists anywhere in this schema. */
export type InvoiceState = 'draft' | 'sent' | 'overdue' | 'partial' | 'paid' | 'refunded';

function invoiceState(p: any): InvoiceState {
  if (p.payment_status === 'refunded' || p.payment_status === 'partially_refunded') return 'refunded';
  if (p._owed <= 0.005) return 'paid';
  if (!p._invoiced) return 'draft';
  if (p._overdue !== null) return 'overdue';
  if (p._collected > 0) return 'partial';
  return 'sent';
}

export type Tab = 'overview' | 'invoices';

export default function FinancialsClient({ company, projects, isBookkeeperView = false }: Props) {
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  const periodFiltered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const withMoney = useMemo(
    () =>
      periodFiltered.map((p) => {
        const total = parseFloat(p.quote_total || '0');
        // payment_amount is SUM(payments) including negative refund rows,
        // so it's already net.
        const collected = parseFloat(p.payment_amount || '0');
        const remindedToday =
          p.reminder_sent_at &&
          new Date(p.reminder_sent_at).toDateString() === new Date().toDateString();
        const derived = {
          ...p,
          _total: total,
          _collected: collected,
          _owed: Math.max(total - collected, 0),
          _overdue: daysOverdue(p),
          _bucket: bucketFor(p),
          _invoiced: !!p.invoice_sent_at,
          _remindedToday: !!remindedToday,
        };
        return { ...derived, _state: invoiceState(derived) };
      }),
    [periodFiltered]
  );

  const totalQuoted = useMemo(() => withMoney.reduce((s, p) => s + p._total, 0), [withMoney]);
  const totalCollected = useMemo(() => withMoney.reduce((s, p) => s + p._collected, 0), [withMoney]);
  const owedJobs = useMemo(() => withMoney.filter((p) => p._owed > 0.005), [withMoney]);
  const totalOwed = useMemo(() => owedJobs.reduce((s, p) => s + p._owed, 0), [owedJobs]);
  const notInvoiced = useMemo(() => owedJobs.filter((p) => !p._invoiced), [owedJobs]);
  const notInvoicedTotal = useMemo(() => notInvoiced.reduce((s, p) => s + p._owed, 0), [notInvoiced]);

  const aging = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    BUCKETS.forEach((b) => (map[b.key] = { amount: 0, count: 0 }));
    owedJobs.forEach((p) => {
      map[p._bucket].amount += p._owed;
      map[p._bucket].count += 1;
    });
    return map;
  }, [owedJobs]);

  const overdueTotal = useMemo(
    () => ['90', '60', '30', '1'].reduce((s, k) => s + aging[k].amount, 0),
    [aging]
  );

  // Real data — the same jobs already fetched, filtered to ones with a
  // real payment_date, not a fabricated activity feed.
  const recentPayments = useMemo(
    () =>
      withMoney
        .filter((p) => p.payment_date)
        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 6),
    [withMoney]
  );

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (period !== 'all') params.set('time', period);
    return `/api/company/${company.slug}/export-csv?${params.toString()}`;
  })();

  return (
    <div className="text-stone-900">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-[#1c1917]">Financials</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setPeriodOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                {PERIODS.find((p) => p.value === period)?.label}
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>
              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1.5 min-w-40 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          setPeriod(p.value);
                          setPeriodOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 ${
                          period === p.value ? 'font-semibold text-teal-800' : 'text-stone-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <a
              href={exportHref}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </a>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-6 border-b border-stone-200">
          {([
            ['overview', 'Overview'],
            ['invoices', 'Invoices'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                tab === key ? 'text-stone-900' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {label}
              {tab === key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-stone-900" />}
            </button>
          ))}
        </div>

        {/* Both tabs stay mounted (display toggle) so switching tabs never
            resets the Invoices tab's own search/filter state. */}
        <div style={{ display: tab === 'overview' ? 'block' : 'none' }}>
          <FinancialsOverview
            totalOwed={totalOwed}
            totalCollected={totalCollected}
            totalQuoted={totalQuoted}
            overdueTotal={overdueTotal}
            owedJobsCount={owedJobs.length}
            jobsCount={withMoney.length}
            aging={aging}
            notInvoicedTotal={notInvoicedTotal}
            notInvoicedCount={notInvoiced.length}
            recentPayments={recentPayments}
          />
        </div>
        <div style={{ display: tab === 'invoices' ? 'block' : 'none' }}>
          <InvoicesList company={company} withMoney={withMoney} isBookkeeperView={isBookkeeperView} />
        </div>
      </div>
    </div>
  );
}