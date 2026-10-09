'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, ChevronDown, RefreshCw, Sun, Moon, Check } from 'lucide-react';
import FinancialsOverview, { finTokens } from './FinancialsOverview';
import InvoicesList from './InvoicesList';
import FinancialsExpenses from './FinancialsExpenses';
import { deriveInvoiceRow, filterByPeriod, BUCKETS, type InvoiceState } from '@/lib/invoiceState';

export type { InvoiceState };
export { BUCKETS };

type Props = {
  company: any;
  projects: any[];
  isBookkeeperView?: boolean;
  recentPayments?: any[];
};

const PERIODS = [
  { label: 'This month', value: 'month' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This year', value: 'year' },
  { label: 'All time', value: 'all' },
];

export type Tab = 'overview' | 'invoices' | 'expenses';

const TABS: [Tab, string][] = [
  ['overview', 'Overview'],
  ['invoices', 'Invoices'],
  ['expenses', 'Expenses'],
];

const fmtRangeDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function FinancialsClient({
  company,
  projects,
  isBookkeeperView = false,
  recentPayments: realPayments = [],
}: Props) {
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [customStartDraft, setCustomStartDraft] = useState('');
  const [customEndDraft, setCustomEndDraft] = useState('');
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [activeFilter, setActiveFilter] = useState<InvoiceState | 'all' | 'awaiting_deposit' | 'awaiting_balance'>('all');

  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  // Theme: same key + event as the Dashboard and Outbox, so all three stay in sync.
  const [isDark, setIsDark] = useState<boolean>(true);
  useEffect(() => {
    const read = () => {
      try {
        setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
      } catch {}
    };
    read();
    window.addEventListener('storage', read);
    window.addEventListener('theme-changed', read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener('theme-changed', read);
    };
  }, []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
    } catch {}
    window.dispatchEvent(new Event('theme-changed'));
  };

  // Esc closes whichever menu is open.
  useEffect(() => {
    if (!periodOpen && !exportMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPeriodOpen(false);
        setExportMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [periodOpen, exportMenuOpen]);

  const t = finTokens(isDark);

  // Derived financial data
  const periodFiltered = useMemo(
    () => filterByPeriod(projects, period, customRange?.start, customRange?.end),
    [projects, period, customRange]
  );

  const withMoney = useMemo(() => periodFiltered.map(deriveInvoiceRow), [periodFiltered]);

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
      if (!map[p._bucket]) map[p._bucket] = { amount: 0, count: 0 };
      map[p._bucket].amount += p._owed;
      map[p._bucket].count += 1;
    });
    return map;
  }, [owedJobs]);

  const overdueTotal = useMemo(
    () => ['90', '60', '30', '1'].reduce((s, k) => s + (aging[k]?.amount || 0), 0),
    [aging]
  );

  const recentPayments = useMemo(
    () =>
      realPayments.map((p) => ({
        id: p.id,
        customer_name: p.customer_name,
        payment_date: p.paid_on,
        _collected: parseFloat(p.amount) || 0,
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

  const periodLabel =
    period === 'custom' && customRange
      ? `${fmtRangeDate(customRange.start)} – ${fmtRangeDate(customRange.end)}`
      : PERIODS.find((p) => p.value === period)?.label || 'This year';

  const btn = `inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition ${t.btn}`;
  const menuItem = `flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${t.hover}`;

  return (
    <div className={`min-h-screen ${t.page}`}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className={`text-xl font-semibold ${t.text}`}>Financials</h1>
            <p className={`text-xs ${t.sub}`}>{periodLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period */}
            <div className="relative">
              <button type="button" onClick={() => setPeriodOpen((v) => !v)} className={btn} aria-expanded={periodOpen}>
                {periodLabel}
                <ChevronDown className={`h-3.5 w-3.5 ${t.faint}`} />
              </button>

              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-20 bg-black/30 sm:bg-transparent" onClick={() => setPeriodOpen(false)} />
                  <div className={`fixed inset-x-3 bottom-3 z-30 overflow-hidden rounded-2xl border shadow-2xl pb-[env(safe-area-inset-bottom)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-64 sm:rounded-xl sm:pb-0 sm:shadow-lg ${t.menu}`}>
                    {PERIODS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          setPeriod(p.value);
                          setPeriodOpen(false);
                        }}
                        className={`${menuItem} ${period === p.value ? t.active : t.sub}`}
                      >
                        {p.label}
                        {period === p.value && <Check className="h-4 w-4" />}
                      </button>
                    ))}

                    <div className={`border-t px-4 py-3 ${t.border}`}>
                      <p className={`mb-2 text-xs font-medium ${period === 'custom' ? t.active : t.sub}`}>Custom range</p>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="block">
                          <span className={`mb-1 block text-[11px] ${t.faint}`}>From</span>
                          <input
                            type="date"
                            value={customStartDraft}
                            onChange={(e) => setCustomStartDraft(e.target.value)}
                            max={customEndDraft || undefined}
                            className={`w-full rounded-lg border px-2 py-1.5 text-base sm:text-xs outline-none ${t.input}`}
                          />
                        </label>
                        <label className="block">
                          <span className={`mb-1 block text-[11px] ${t.faint}`}>To</span>
                          <input
                            type="date"
                            value={customEndDraft}
                            onChange={(e) => setCustomEndDraft(e.target.value)}
                            min={customStartDraft || undefined}
                            className={`w-full rounded-lg border px-2 py-1.5 text-base sm:text-xs outline-none ${t.input}`}
                          />
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!customStartDraft || !customEndDraft) return;
                          setCustomRange({ start: customStartDraft, end: customEndDraft });
                          setPeriod('custom');
                          setPeriodOpen(false);
                        }}
                        disabled={!customStartDraft || !customEndDraft}
                        className={`mt-2.5 w-full rounded-lg py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${t.primary}`}
                      >
                        Apply range
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Export */}
            {tab === 'expenses' ? (
              <div className="relative">
                <button type="button" onClick={() => setExportMenuOpen((v) => !v)} className={btn} aria-expanded={exportMenuOpen}>
                  <Download className="h-3.5 w-3.5" />
                  Export
                  <ChevronDown className={`h-3.5 w-3.5 ${t.faint}`} />
                </button>

                {exportMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20 bg-black/30 sm:bg-transparent" onClick={() => setExportMenuOpen(false)} />
                    <div className={`fixed inset-x-3 bottom-3 z-30 overflow-hidden rounded-2xl border shadow-2xl pb-[env(safe-area-inset-bottom)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-1.5 sm:w-60 sm:rounded-xl sm:pb-0 sm:shadow-lg ${t.menu}`}>
                      <a
                        href={`/api/company/${company.slug}/expenses-export`}
                        onClick={() => setExportMenuOpen(false)}
                        className={`block px-4 py-3 transition ${t.hover}`}
                      >
                        <span className={`block text-sm font-medium ${t.text}`}>Expense ledger</span>
                        <span className={`mt-0.5 block text-xs ${t.faint}`}>Every logged expense, one row each</span>
                      </a>
                      <a
                        href={`/api/company/${company.slug}/profit-summary-export`}
                        onClick={() => setExportMenuOpen(false)}
                        className={`block border-t px-4 py-3 transition ${t.border} ${t.hover}`}
                      >
                        <span className={`block text-sm font-medium ${t.text}`}>Profit summary</span>
                        <span className={`mt-0.5 block text-xs ${t.faint}`}>Income, expenses and profit per job</span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a href={exportHref} className={btn}>
                <Download className="h-3.5 w-3.5" />
                Export
              </a>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={() => startRefresh(() => router.refresh())}
              disabled={isRefreshing}
              className={`${btn} w-9 justify-center px-0 disabled:opacity-50`}
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`${btn} w-9 justify-center px-0`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`mb-6 flex items-center gap-6 border-b ${t.border}`}>
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === 'invoices' && tab === 'overview') setActiveFilter('all');
                setTab(key);
              }}
              className={`relative pb-3 text-sm font-medium transition ${tab === key ? t.text : `${t.faint} hover:opacity-80`}`}
            >
              {label}
              {tab === key && (
                <span className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${isDark ? 'bg-white' : 'bg-slate-900'}`} />
              )}
            </button>
          ))}
        </div>

        {/* Tab content — kept mounted so filters and scroll survive tab switches */}
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
            isDark={isDark}
            filter={activeFilter}
            onFilterChange={setActiveFilter}
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        <div style={{ display: tab === 'expenses' ? 'block' : 'none' }}>
          <FinancialsExpenses
            isDark={isDark}
            company={company}
            withMoney={withMoney}
            period={period}
            customStart={customRange?.start}
            customEnd={customRange?.end}
          />
        </div>
      </div>
    </div>
  );
}