'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ChevronDown, RefreshCw } from 'lucide-react';
import FinancialsOverview from './FinancialsOverview';
import InvoicesList from './InvoicesList';
import { deriveInvoiceRow, filterByPeriod, BUCKETS, type InvoiceState } from '@/lib/invoiceState';

export type { InvoiceState };
export { BUCKETS };

type Props = {
  company: any;
  projects: any[];
  isBookkeeperView?: boolean;
  // Real transactions from the payments ledger — one row per actual
  // payment, not one row per job. See page.tsx for why this had to become
  // a separate query instead of being derived from `projects` below.
  recentPayments?: any[];
};

const PERIODS = [
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'Custom range', value: 'custom' },
  { label: 'All time', value: 'all' },
];

export type Tab = 'overview' | 'invoices';

export default function FinancialsClient({
  company,
  projects,
  isBookkeeperView = false,
  recentPayments: realPayments = [],
}: Props) {
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  // Draft values for the custom range inputs — kept separate from the
  // applied range below so typing a start date alone can't briefly
  // filter anything before Apply is actually pressed.
  const [customStartDraft, setCustomStartDraft] = useState('');
  const [customEndDraft, setCustomEndDraft] = useState('');
  // The actually-applied range. Stays null until Apply is pressed with
  // both dates filled — this is what "never full history unless
  // selected" means in practice: there's no moment where 'custom' is
  // active with an incomplete or empty range.
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  // Search, lifted up from InvoicesList.tsx so the export can share the
  // same filter instead of only ever exporting an unfiltered list
  // regardless of what the person is actually looking at.
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [activeFilter, setActiveFilter] = useState<InvoiceState | 'all'>('all');
  const router = useRouter();
  // page.tsx does the real DB queries as a server component — refresh()
  // re-runs those and streams fresh props down to this component without
  // a full browser reload, and without remounting this component, so the
  // current tab/filter selection survives the refresh.
  const [isRefreshing, startRefresh] = useTransition();

  const periodFiltered = useMemo(
    () => filterByPeriod(projects, period, customRange?.start, customRange?.end),
    [projects, period, customRange]
  );

  const withMoney = useMemo(
    () => periodFiltered.map(deriveInvoiceRow),
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

  const recentPayments = useMemo(
    () =>
      realPayments.map((p) => ({
        id: p.id,
        customer_name: p.customer_name,
        payment_date: p.paid_on,
        _collected: parseFloat(p.amount) || 0,
      })),
    [realPayments]
  );

  // New, dedicated export for this page — separate from the existing
  // export-csv route, which is shared with other parts of the app and
  // wasn't purpose-built for invoice fields or this page's filters.
  // Previously only ever passed the time period; the status filter
  // (Draft/Sent/Overdue/etc.) was silently ignored, so exporting while
  // looking at "Overdue" still exported everything. Now passes both.
  const exportHref = (() => {
    const params = new URLSearchParams();
    if (period !== 'all') params.set('period', period);
    if (period === 'custom' && customRange) {
      params.set('startDate', customRange.start);
      params.set('endDate', customRange.end);
    }
    if (activeFilter !== 'all') params.set('status', activeFilter);
    if (search.trim()) params.set('search', search.trim());
    return `/api/company/${company.slug}/financials-export?${params.toString()}`;
  })();

  // Callback to bridge Overview clicks directly to filtered Invoices list view
  const handleSelectFilter = (filterKey: InvoiceState | 'all') => {
    setActiveFilter(filterKey);
    setTab('invoices');
  };

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
                {period === 'custom' && customRange
                  ? `${customRange.start} – ${customRange.end}`
                  : PERIODS.find((p) => p.value === period)?.label}
                <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
              </button>
              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                    {PERIODS.filter((p) => p.value !== 'custom').map((p) => (
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
                    {/* Custom range gets its own inline inputs rather than
                        applying immediately on click — this is the actual
                        mechanism behind "never full history unless
                        selected": there's no click that activates 'custom'
                        with an empty or half-filled range. Nothing happens
                        until Apply is pressed with both dates present. */}
                    <div className={`border-t border-stone-100 px-4 py-3 ${period === 'custom' ? 'bg-teal-50/40' : ''}`}>
                      <p className={`mb-2 text-sm ${period === 'custom' ? 'font-semibold text-teal-800' : 'text-stone-600'}`}>
                        Custom range
                      </p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={customStartDraft}
                          onChange={(e) => setCustomStartDraft(e.target.value)}
                          max={customEndDraft || undefined}
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs outline-none focus:border-teal-700"
                        />
                        <input
                          type="date"
                          value={customEndDraft}
                          onChange={(e) => setCustomEndDraft(e.target.value)}
                          min={customStartDraft || undefined}
                          className="w-full rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs outline-none focus:border-teal-700"
                        />
                        <button
                          onClick={() => {
                            if (!customStartDraft || !customEndDraft) return;
                            setCustomRange({ start: customStartDraft, end: customEndDraft });
                            setPeriod('custom');
                            setPeriodOpen(false);
                          }}
                          disabled={!customStartDraft || !customEndDraft}
                          className="w-full rounded-lg bg-stone-900 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => startRefresh(() => router.refresh())}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
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
              onClick={() => {
                if (key === 'invoices' && tab === 'overview') {
                  setActiveFilter('all');
                }
                setTab(key);
              }}
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
            onSelectFilter={handleSelectFilter}
          />
        </div>
        <div style={{ display: tab === 'invoices' ? 'block' : 'none' }}>
          <InvoicesList
            company={company}
            withMoney={withMoney}
            isBookkeeperView={isBookkeeperView}
            filter={activeFilter}
            onFilterChange={setActiveFilter}
            search={search}
            onSearchChange={setSearch}
          />
        </div>
      </div>
    </div>
  );
}