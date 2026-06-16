'use client';

import Link from 'next/link';
import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, AlertCircle, BarChart3, Table2, RefreshCw, Sun, Moon } from 'lucide-react';
import { theme as themeTokens } from '@/lib/financialsTheme';
import type { FinancialsTheme } from '@/lib/financialsTheme';
import { StatCards, OutstandingWidget, QBOScore, CategoryLeaderboard, PaymentBreakdown, TopCustomers } from '@/components/dashboard/FinancialsCharts';
import FinancialsTable, { type FinancialsTableRef } from '@/components/dashboard/FinancialsTable';

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
  return projects.filter(p => {
    const date = new Date(p.created_at);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter') return Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3) && date.getFullYear() === now.getFullYear();
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatCategory(cat: string | null) {
  if (!cat) return 'Uncategorized';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getReceiptCount(project: any): number {
  try {
    const docs = typeof project.documents === 'string' ? JSON.parse(project.documents) : project.documents || [];
    return docs.filter((d: any) => d.type === 'receipt').length;
  } catch { return 0; }
}

export default function FinancialsClient({ company, projects, isBookkeeperView = false }: Props) {
  const router = useRouter();
  const tableRef = useRef<FinancialsTableRef>(null);
  const [themeMode, setThemeMode] = useState<FinancialsTheme>('dark');
  const t = themeTokens[themeMode];

  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusOpen, setStatusOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'jobs'>('jobs');

  const closeDropdowns = () => { setPeriodOpen(false); setCategoryOpen(false); setStatusOpen(false); };

  const periodFiltered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const categories = useMemo(() => {
    return [...new Set(periodFiltered.map(p => p.category).filter(Boolean))].sort() as string[];
  }, [periodFiltered]);

  const filtered = useMemo(() => {
    return periodFiltered.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && p.payment_status !== statusFilter) return false;
      return true;
    });
  }, [periodFiltered, categoryFilter, statusFilter]);

  const totalRevenue = useMemo(() => filtered.reduce((s, p) => s + parseFloat(p.quote_total || '0'), 0), [filtered]);
  const totalCollected = useMemo(() => filtered.reduce((s, p) => s + parseFloat(p.payment_amount || '0'), 0), [filtered]);
  const totalOutstanding = totalRevenue - totalCollected;
  const taxReadyCount = filtered.filter(p => p.quote_total && parseFloat(p.quote_total) > 0 && p.payment_status === 'paid').length;
  const taxReadyPct = filtered.length > 0 ? Math.round((taxReadyCount / filtered.length) * 100) : 0;
  const missingReceipts = filtered.filter(p => getReceiptCount(p) === 0).length;

  const unpaidJobs = useMemo(() => filtered.filter(p => !p.payment_status || p.payment_status === 'unpaid'), [filtered]);
  const partialJobs = useMemo(() => filtered.filter(p => p.payment_status === 'partial'), [filtered]);

  const topCustomers = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => { const name = p.customer_name || 'Unknown'; map[name] = (map[name] || 0) + parseFloat(p.quote_total || '0'); });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filtered]);

  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => { const cat = formatCategory(p.category); map[cat] = (map[cat] || 0) + parseFloat(p.quote_total || '0'); });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [filtered]);

  const paymentBreakdown = useMemo(() => {
    const paid = filtered.filter(p => p.payment_status === 'paid').length;
    const partial = filtered.filter(p => p.payment_status === 'partial').length;
    const unpaid = filtered.filter(p => !p.payment_status || p.payment_status === 'unpaid').length;
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Partial', value: partial, color: '#f59e0b' },
      { name: 'Unpaid', value: unpaid, color: '#f87171' },
    ].filter(d => d.value > 0);
  }, [filtered]);

  const buildExportParams = () => {
    const params = new URLSearchParams();
    if (period !== 'all') params.set('time', period);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    return params.toString();
  };

  const handleSendReminders = () => {
    setTab('jobs');
    setTimeout(() => tableRef.current?.openReminderPanel(), 50);
  };

  const Dropdown = ({ open, onToggle, label, children }: any) => (
    <div className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
        style={{ background: t.filterBg, border: t.filterBorder, color: t.text.secondary }}>
        {label}
        <ChevronDown className="w-3.5 h-3.5" style={{ color: t.text.muted }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-36 rounded-2xl overflow-hidden z-20"
          style={{ background: t.dropdownBg, border: t.dropdownBorder, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          {children}
        </div>
      )}
    </div>
  );

  const DropItem = ({ value, current, onSelect, label }: any) => (
    <button onClick={() => onSelect(value)}
      className="w-full text-left px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
      style={{
        color: current === value ? '#10b981' : t.text.secondary,
        background: current === value ? 'rgba(16,185,129,0.08)' : 'transparent',
        fontWeight: current === value ? 600 : 400,
      }}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: t.bg }}>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl" style={{ background: t.headerBg, borderBottom: t.headerBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href={isBookkeeperView ? '/bookkeeper/dashboard' : `/${company.slug}/dashboard`}
            className="p-1.5 rounded-lg transition-colors" style={{ color: t.text.muted }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button onClick={() => router.refresh()} className="p-1.5 rounded-lg transition-colors" style={{ color: t.text.muted }}
  onMouseEnter={e => { e.currentTarget.style.background = t.filterBg; e.currentTarget.style.color = t.text.primary; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.text.muted; }}
>
  <RefreshCw className="w-4 h-4" />
</button>
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-6 w-auto object-contain opacity-80" />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs">
              {company.name.charAt(0)}
            </div>
          )}
          <span style={{ color: t.dividerStrong }} className="text-sm">/</span>
          <span className="text-sm font-medium" style={{ color: t.text.secondary }}>Financials</span>

          <button
            onClick={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')}
            className="ml-auto p-2 rounded-lg transition-colors"
            style={{ color: t.text.muted, background: t.filterBg, border: t.filterBorder }}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: t.text.primary }}>Financials</h1>
            <p className="text-sm mt-1" style={{ color: t.text.muted }}>Tax readiness and job financials</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Dropdown open={periodOpen} onToggle={() => { setPeriodOpen(!periodOpen); setCategoryOpen(false); setStatusOpen(false); }}
              label={PERIODS.find(p => p.value === period)?.label || 'This year'}>
              {PERIODS.map(p => <DropItem key={p.value} value={p.value} current={period} onSelect={(v: string) => { setPeriod(v); closeDropdowns(); }} label={p.label} />)}
            </Dropdown>
            <Dropdown open={categoryOpen} onToggle={() => { setCategoryOpen(!categoryOpen); setPeriodOpen(false); setStatusOpen(false); }}
              label={categoryFilter === 'all' ? 'All categories' : formatCategory(categoryFilter)}>
              <DropItem value="all" current={categoryFilter} onSelect={(v: string) => { setCategoryFilter(v); closeDropdowns(); }} label="All categories" />
              {categories.map(cat => <DropItem key={cat} value={cat} current={categoryFilter} onSelect={(v: string) => { setCategoryFilter(v); closeDropdowns(); }} label={formatCategory(cat)} />)}
            </Dropdown>
            <Dropdown open={statusOpen} onToggle={() => { setStatusOpen(!statusOpen); setPeriodOpen(false); setCategoryOpen(false); }}
              label={statusFilter === 'all' ? 'All statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}>
              {['all', 'paid', 'partial', 'unpaid'].map(s => (
                <DropItem key={s} value={s} current={statusFilter} onSelect={(v: string) => { setStatusFilter(v); closeDropdowns(); }}
                  label={s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)} />
              ))}
            </Dropdown>
          </div>
        </div>

        <StatCards t={t} totalRevenue={totalRevenue} totalCollected={totalCollected}
          totalOutstanding={totalOutstanding} taxReadyPct={taxReadyPct} taxReadyCount={taxReadyCount} filtered={filtered} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <OutstandingWidget t={t} totalOutstanding={totalOutstanding} unpaidJobs={unpaidJobs} partialJobs={partialJobs}
            onSendReminders={handleSendReminders} />
          <QBOScore t={t} filtered={filtered} />
        </div>

        {missingReceipts > 0 && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-6"
            style={{ background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#60a5fa' }} />
            <p className="text-sm font-medium" style={{ color: '#93c5fd' }}>
              {missingReceipts} job{missingReceipts !== 1 ? 's' : ''} without receipts — attaching them gives your bookkeeper more to work with at tax time
            </p>
          </div>
        )}

        <div className="flex items-center gap-1 mb-6" style={{ borderBottom: `1px solid ${t.divider}` }}>
          {[
            { value: 'overview', label: 'Overview', icon: BarChart3 },
            { value: 'jobs', label: 'Jobs', icon: Table2 },
          ].map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setTab(value as any)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative"
              style={{ color: tab === value ? t.text.primary : t.text.muted }}>
              <Icon className="w-4 h-4" />
              {label}
              {tab === value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#10b981' }} />
              )}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <CategoryLeaderboard t={t} revenueByCategory={revenueByCategory} />
              <PaymentBreakdown t={t} paymentBreakdown={paymentBreakdown} />
            </div>
            <TopCustomers t={t} topCustomers={topCustomers} />
          </div>
        )}

        {tab === 'jobs' && (
          <FinancialsTable ref={tableRef} t={t} company={company} filtered={filtered} buildExportParams={buildExportParams} />
        )}
      </div>
    </div>
  );
}