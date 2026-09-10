'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const [customStartDraft, setCustomStartDraft] = useState('');
  const [customEndDraft, setCustomEndDraft] = useState('');
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [activeFilter, setActiveFilter] = useState<InvoiceState | 'all'>('all');
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();

  // Same shared 'dashboard-theme' key and same storage/focus-listener
  // pattern CompanyShell already uses. This page previously had zero
  // dark-mode code at all — every card hardcoded light colors — while
  // sitting inside a shell that DOES paint a dark background when the
  // toggle is on elsewhere (Dashboard, Leads). That mismatch, not any
  // actual bug, was the 'renders weird when dark carries over' report:
  // a light-only page rendered on top of a dark shell background.
  const [isDark, setIsDark] = useState<boolean>(true);
  // FIXED: the previous version relied on 'storage' and 'focus' browser
  // events to notice a theme change made on another page. Neither one
  // actually fires for the ordinary case of clicking a sidebar link and
  // navigating from Dashboard to Financials in the same tab — 'storage'
  // only fires in OTHER tabs/windows, never the one that made the
  // change, and 'focus' only fires when the whole browser window
  // regains focus (switching apps or tabs), not on an in-app route
  // change. The only thing that ever re-ran the read was a hard reload,
  // which is exactly "you need to refresh to go back to light." Keying
  // this effect on pathname instead means it re-reads localStorage on
  // every actual navigation into this page, mount or not — matching how
  // someone actually moves between pages in practice. 'storage' and
  // 'focus' are kept too, harmlessly, for the genuinely separate cases
  // they DO cover (a second tab open side by side, or switching back
  // from another app).
  useEffect(() => {
    const onStorage = () => setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
    onStorage();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, [pathname]);

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
        // FIXED: this mapping picked four specific fields and silently
        // dropped everything else — including payment_status, even
        // after page.tsx started actually fetching it. It existed the
        // whole time on `p.payment_status`, it just never survived the
        // trip from the raw query result to what FinancialsOverview
        // actually receives as props.
        payment_status: p.payment_status,
      })),
    [realPayments]
  );

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

  const handleSelectFilter = (filterKey: InvoiceState | 'all') => {
    setActiveFilter(filterKey);
    setTab('invoices');
  };

  return (
    <div className={isDark ? 'bg-[#0b0f17] min-h-screen text-slate-100' : 'bg-[#faf9f5] min-h-screen text-stone-900'}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>Financials</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setPeriodOpen((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                {period === 'custom' && customRange
                  ? `${customRange.start} – ${customRange.end}`
                  : PERIODS.find((p) => p.value === period)?.label}
                <ChevronDown className={`h-3.5 w-3.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              </button>
              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                  <div className={`absolute right-0 top-full z-20 mt-1.5 w-64 overflow-hidden rounded-xl border shadow-lg ${
                    isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white'
                  }`}>
                    {PERIODS.filter((p) => p.value !== 'custom').map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          setPeriod(p.value);
                          setPeriodOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          isDark ? 'hover:bg-white/5' : 'hover:bg-stone-50'
                        } ${
                          period === p.value
                            ? 'font-semibold text-teal-500'
                            : isDark ? 'text-slate-300' : 'text-stone-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    <div className={`border-t px-4 py-3 ${isDark ? 'border-white/10' : 'border-stone-100'} ${
                      period === 'custom' ? (isDark ? 'bg-teal-500/10' : 'bg-teal-50/40') : ''
                    }`}>
                      <p className={`mb-2 text-sm ${
                        period === 'custom'
                          ? 'font-semibold text-teal-500'
                          : isDark ? 'text-slate-300' : 'text-stone-600'
                      }`}>
                        Custom range
                      </p>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={customStartDraft}
                          onChange={(e) => setCustomStartDraft(e.target.value)}
                          max={customEndDraft || undefined}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-teal-500 ${
                            isDark ? 'border-white/10 bg-white/5 text-slate-100' : 'border-stone-300 bg-white'
                          }`}
                        />
                        <input
                          type="date"
                          value={customEndDraft}
                          onChange={(e) => setCustomEndDraft(e.target.value)}
                          min={customStartDraft || undefined}
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:border-teal-500 ${
                            isDark ? 'border-white/10 bg-white/5 text-slate-100' : 'border-stone-300 bg-white'
                          }`}
                        />
                        <button
                          onClick={() => {
                            if (!customStartDraft || !customEndDraft) return;
                            setCustomRange({ start: customStartDraft, end: customEndDraft });
                            setPeriod('custom');
                            setPeriodOpen(false);
                          }}
                          disabled={!customStartDraft || !customEndDraft}
                          className={`w-full rounded-lg py-1.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-stone-900 hover:bg-stone-800'
                          }`}
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
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <a
              href={exportHref}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                isDark
                  ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </a>
          </div>
        </div>

        <div className={`mb-6 flex items-center gap-6 border-b ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
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
                tab === key
                  ? isDark ? 'text-white' : 'text-stone-900'
                  : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {label}
              {tab === key && (
                <span className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${isDark ? 'bg-white' : 'bg-stone-900'}`} />
              )}
            </button>
          ))}
        </div>

        <div style={{ display: tab === 'overview' ? 'block' : 'none' }}>
          <FinancialsOverview
            isDark={isDark}
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