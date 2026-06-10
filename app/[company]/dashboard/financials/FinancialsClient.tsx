'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ChevronDown, CheckCircle2,
  XCircle, AlertCircle, BarChart3, Table2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

type Props = {
  company: any;
  projects: any[];
};

const PERIODS = [
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: 'all' },
];

function getReceiptCount(project: any): number {
  try {
    const docs = typeof project.documents === 'string' ? JSON.parse(project.documents) : project.documents || [];
    return docs.filter((d: any) => d.type === 'receipt').length;
  } catch { return 0; }
}

function getTaxReady(project: any): boolean {
  return !!(project.quote_total && parseFloat(project.quote_total) > 0 && project.payment_amount && getReceiptCount(project) > 0);
}

function filterByPeriod(projects: any[], period: string): any[] {
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

function formatCategory(cat: string | null): string {
  if (!cat) return 'Uncategorized';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function FinancialsClient({ company, projects }: Props) {
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [statusOpen, setStatusOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'jobs'>('overview');

  const periodFiltered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const categories = useMemo(() => {
    const cats = [...new Set(periodFiltered.map(p => p.category).filter(Boolean))];
    return cats.sort();
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
  const missingReceipts = filtered.filter(p => getReceiptCount(p) === 0).length;
  const taxReadyCount = filtered.filter(p => getTaxReady(p)).length;
  const taxReadyPct = filtered.length > 0 ? Math.round((taxReadyCount / filtered.length) * 100) : 0;
  const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label || 'This year';

  // Revenue by month chart data
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const map: Record<number, number> = {};
    for (let i = 0; i < 12; i++) map[i] = 0;
    filtered.forEach(p => {
      const d = new Date(p.created_at);
      if (period === 'year' && d.getFullYear() === year) {
        map[d.getMonth()] = (map[d.getMonth()] || 0) + parseFloat(p.quote_total || '0');
      } else if (period !== 'year') {
        map[d.getMonth()] = (map[d.getMonth()] || 0) + parseFloat(p.quote_total || '0');
      }
    });
    return MONTHS.map((m, i) => ({ month: m, revenue: Math.round(map[i] || 0) }));
  }, [filtered, period]);

  // Revenue by category
  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(p => {
      const cat = formatCategory(p.category);
      map[cat] = (map[cat] || 0) + parseFloat(p.quote_total || '0');
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filtered]);

  // Payment status donut
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

  const CARD_COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#818cf8','#60a5fa','#34d399','#fb923c'];

  const Dropdown = ({ open, onToggle, label, children }: any) => (
    <div className="relative">
      <button onClick={onToggle}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 transition-all"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {label}
        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-36 rounded-2xl overflow-hidden z-20"
          style={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          {children}
        </div>
      )}
    </div>
  );

  const DropItem = ({ value, current, onSelect, label }: any) => (
    <button onClick={() => onSelect(value)}
      className="w-full text-left px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
      style={{ color: current === value ? '#10b981' : '#94a3b8', background: current === value ? 'rgba(16,185,129,0.08)' : 'transparent', fontWeight: current === value ? 600 : 400 }}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.98)' }} className="sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href={`/${company.slug}/dashboard`} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-6 w-auto object-contain opacity-80" />
          ) : (
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              {company.name.charAt(0)}
            </div>
          )}
          <span className="text-slate-600 text-sm">/</span>
          <span className="text-slate-300 text-sm font-medium">Financials</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Page title */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Financials</h1>
            <p className="text-slate-500 text-sm mt-1">Tax readiness and job financials</p>
          </div>
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Dropdown open={periodOpen} onToggle={() => { setPeriodOpen(!periodOpen); setCategoryOpen(false); setStatusOpen(false); }} label={currentPeriodLabel}>
              {PERIODS.map(p => <DropItem key={p.value} value={p.value} current={period} onSelect={(v: string) => { setPeriod(v); setPeriodOpen(false); }} label={p.label} />)}
            </Dropdown>
            <Dropdown open={categoryOpen} onToggle={() => { setCategoryOpen(!categoryOpen); setPeriodOpen(false); setStatusOpen(false); }} label={categoryFilter === 'all' ? 'All categories' : formatCategory(categoryFilter)}>
              <DropItem value="all" current={categoryFilter} onSelect={(v: string) => { setCategoryFilter(v); setCategoryOpen(false); }} label="All categories" />
              {categories.map(cat => <DropItem key={cat} value={cat} current={categoryFilter} onSelect={(v: string) => { setCategoryFilter(v); setCategoryOpen(false); }} label={formatCategory(cat)} />)}
            </Dropdown>
            <Dropdown open={statusOpen} onToggle={() => { setStatusOpen(!statusOpen); setPeriodOpen(false); setCategoryOpen(false); }} label={statusFilter === 'all' ? 'All statuses' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}>
              {['all','paid','partial','unpaid'].map(s => <DropItem key={s} value={s} current={statusFilter} onSelect={(v: string) => { setStatusFilter(v); setStatusOpen(false); }} label={s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)} />)}
            </Dropdown>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Revenue', value: fmt(totalRevenue), color: '#ffffff' },
            { label: 'Collected', value: fmt(totalCollected), color: '#10b981' },
            { label: 'Outstanding', value: fmt(totalOutstanding), color: '#f59e0b' },
            { label: 'Tax ready', value: `${taxReadyPct}%`, sub: `${taxReadyCount} of ${filtered.length} jobs`, color: taxReadyPct === 100 ? '#10b981' : taxReadyPct > 50 ? '#60a5fa' : '#f59e0b', progress: taxReadyPct },
          ].map((card, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
              {card.sub && <p className="text-xs text-slate-600 mt-1">{card.sub}</p>}
              {card.progress !== undefined && (
                <div className="mt-3 h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${card.progress}%`, background: card.color }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Missing receipts notice */}
        {missingReceipts > 0 && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-6" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#f59e0b' }} />
            <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>
              {missingReceipts} job{missingReceipts !== 1 ? 's' : ''} missing receipts — your bookkeeper needs these to find every deduction
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0' }}>
          {[
            { value: 'overview', label: 'Overview', icon: BarChart3 },
            { value: 'jobs', label: 'Jobs', icon: Table2 },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button key={t.value} onClick={() => setTab(t.value as any)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative"
                style={{ color: tab === t.value ? '#ffffff' : '#64748b' }}>
                <Icon className="w-4 h-4" />
                {t.label}
                {tab === t.value && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#10b981' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">

            {/* Revenue by month */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-semibold text-white mb-6">Revenue by month</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueByMonth} barSize={24}>
                  <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '' : `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#1c1c24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 12 }}
                    formatter={(v: any) => [fmt(v), 'Revenue']}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="revenue" radius={[6,6,0,0]}>
                    {revenueByMonth.map((_, i) => (
                      <Cell key={i} fill={_ .revenue > 0 ? '#6366f1' : 'rgba(255,255,255,0.05)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Revenue by category */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-semibold text-white mb-6">Revenue by category</p>
                {revenueByCategory.length === 0 ? (
                  <p className="text-slate-600 text-sm">No data</p>
                ) : (
                  <div className="space-y-3">
                    {revenueByCategory.map((cat, i) => {
                      const maxVal = revenueByCategory[0].value;
                      const pct = maxVal > 0 ? (cat.value / maxVal) * 100 : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-400">{cat.name}</span>
                            <span className="text-xs font-bold text-white">{fmt(cat.value)}</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CARD_COLORS[i % CARD_COLORS.length] }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment breakdown */}
              <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-semibold text-white mb-6">Payment status</p>
                {paymentBreakdown.length === 0 ? (
                  <p className="text-slate-600 text-sm">No data</p>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                          {paymentBreakdown.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3 flex-1">
                      {paymentBreakdown.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                            <span className="text-xs font-medium text-slate-400">{entry.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white">{entry.value} jobs</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {tab === 'jobs' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white">{filtered.length} jobs</p>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">{currentPeriodLabel}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Customer','Invoice','Category','Total','Payment','Receipts','Tax Ready',''].map((h, i) => (
                      <th key={i} className={`px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-20 text-center text-slate-600 text-sm">No jobs found</td></tr>
                  ) : (
                    filtered.map((project, i) => {
                      const receiptCount = getReceiptCount(project);
                      const taxReady = getTaxReady(project);
                      const total = parseFloat(project.quote_total || '0');
                      const collected = parseFloat(project.payment_amount || '0');
                      return (
                        <tr key={project.id}
                          style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                          className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-white">{project.customer_name}</p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>{project.invoice_number || '—'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-400">{formatCategory(project.category)}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-sm font-bold text-white">{fmtFull(total)}</p>
                            {collected > 0 && collected < total && (
                              <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>{fmtFull(collected)} paid</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: project.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : project.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                                color: project.payment_status === 'paid' ? '#10b981' : project.payment_status === 'partial' ? '#f59e0b' : '#f87171',
                              }}>
                              {project.payment_status === 'paid' ? 'Paid' : project.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {receiptCount > 0 ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#10b981' }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />{receiptCount}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f87171' }}>
                                <XCircle className="w-3.5 h-3.5" />None
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {taxReady ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#10b981' }}>
                                <CheckCircle2 className="w-3.5 h-3.5" />Ready
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                                <AlertCircle className="w-3.5 h-3.5" />Incomplete
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/${company.slug}/dashboard?lead=${project.lead_id}`}
                              className="text-xs font-semibold text-slate-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}