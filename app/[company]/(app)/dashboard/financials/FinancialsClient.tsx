'use client';

import { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Download, ChevronDown, RefreshCw, Sun, Moon } from 'lucide-react';
import FinancialsOverview from './FinancialsOverview';
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
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'Custom range', value: 'custom' },
  { label: 'All time', value: 'all' },
];

export type Tab = 'overview' | 'invoices' | 'expenses';

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
  const [activeFilter, setActiveFilter] = useState<InvoiceState | 'all'>('all');
  
  const router = useRouter();
  const pathname = usePathname();
  const [isRefreshing, startRefresh] = useTransition();

  // Dark mode state management & synchronization
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const syncTheme = () => setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
    syncTheme();

    window.addEventListener('storage', syncTheme);
    window.addEventListener('focus', syncTheme);
    return () => {
      window.removeEventListener('storage', syncTheme);
      window.removeEventListener('focus', syncTheme);
    };
  }, [pathname]);

  const skipFirstThemeWrite = useRef(true);
  useEffect(() => {
    if (skipFirstThemeWrite.current) {
      skipFirstThemeWrite.current = false;
      return;
    }
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Derived Financial Data
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

  const buttonBaseClass = `inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
    isDark
      ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
  }`;

  return (
    <div className={isDark ? 'min-h-screen bg-[#0b0f17] text-slate-100' : 'min-h-screen bg-[#faf9f5] text-stone-900'}>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        
        {/* Top Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>
            Financials
          </h1>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDark((v) => !v)}
              className={buttonBaseClass}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Period Selector Dropdown */}
            <div className="relative">
              <button onClick={() => setPeriodOpen((v) => !v)} className={buttonBaseClass}>
                {period === 'custom' && customRange
                  ? `${customRange.start} – ${customRange.end}`
                  : PERIODS.find((p) => p.value === period)?.label}
                <ChevronDown className={`h-3.5 w-3.5 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
              </button>

              {periodOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setPeriodOpen(false)} />
                  <div
                    className={`absolute right-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-xl border shadow-lg ${
                      isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white'
                    }`}
                  >
                    {PERIODS.filter((p) => p.value !== 'custom').map((p) => (
                      <button
                        key={p.value}
                        onClick={() => {
                          setPeriod(p.value);
                          setPeriodOpen(false);
                        }}
                        className={`block w-full px-4 py-2.5 text-left text-xs transition-colors ${
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

                    <div
                      className={`border-t px-4 py-3 ${
                        isDark ? 'border-white/10' : 'border-stone-100'
                      } ${period === 'custom' ? (isDark ? 'bg-teal-500/10' : 'bg-teal-50/40') : ''}`}
                    >
                      <p
                        className={`mb-2 text-xs font-medium ${
                          period === 'custom'
                            ? 'font-semibold text-teal-500'
                            : isDark ? 'text-slate-300' : 'text-stone-600'
                        }`}
                      >
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

            {/* Refresh Button */}
            <button
              onClick={() => startRefresh(() => router.refresh())}
              disabled={isRefreshing}
              className={`${buttonBaseClass} disabled:opacity-50`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export Dropdown / Link */}
            {tab === 'expenses' ? (
              <div className="relative">
                <button onClick={() => setExportMenuOpen((v) => !v)} className={buttonBaseClass}>
                  <Download className="h-3.5 w-3.5" />
                  Export
                  <ChevronDown className={`h-3 w-3 ${isDark ? 'text-slate-400' : 'text-stone-400'}`} />
                </button>

                {exportMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setExportMenuOpen(false)} />
                    <div
                      className={`absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-xl border shadow-lg ${
                        isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white'
                      }`}
                    >
                      <a
                        href={`/api/company/${company.slug}/expenses-export`}
                        onClick={() => setExportMenuOpen(false)}
                        className={`block px-4 py-3 text-left transition-colors ${
                          isDark ? 'text-slate-200 hover:bg-white/5' : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="block text-xs font-medium">Expense Ledger</span>
                        <span className={`mt-0.5 block text-[11px] ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                          Every logged expense, one row each
                        </span>
                      </a>
                      <a
                        href={`/api/company/${company.slug}/profit-summary-export`}
                        onClick={() => setExportMenuOpen(false)}
                        className={`block border-t px-4 py-3 text-left transition-colors ${
                          isDark
                            ? 'border-white/10 text-slate-200 hover:bg-white/5'
                            : 'border-stone-100 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="block text-xs font-medium">Profit Summary</span>
                        <span className={`mt-0.5 block text-[11px] ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                          Income, expenses & profit per job
                        </span>
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <a href={exportHref} className={buttonBaseClass}>
                <Download className="h-3.5 w-3.5" />
                Export
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`mb-6 flex items-center gap-6 border-b ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
          {(
            [
              ['overview', 'Overview'],
              ['invoices', 'Invoices'],
              ['expenses', 'Expenses'],
            ] as const
          ).map(([key, label]) => (
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
                  ? isDark
                    ? 'text-white'
                    : 'text-stone-900'
                  : isDark
                  ? 'text-slate-500 hover:text-slate-300'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {label}
              {tab === key && (
                <span
                  className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${
                    isDark ? 'bg-white' : 'bg-stone-900'
                  }`}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
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
          <FinancialsExpenses isDark={isDark} company={company} withMoney={withMoney} />
        </div>

      </div>
    </div>
  );
}