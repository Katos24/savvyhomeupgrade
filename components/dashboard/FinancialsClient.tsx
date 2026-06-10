'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  DollarSign, Receipt, FileText, AlertTriangle, ArrowLeft,
  CheckCircle2, XCircle, ChevronDown, Download,
  TrendingUp, Clock, AlertCircle
} from 'lucide-react';
import DashboardHeader from '@/components/DashboardHeader';

type Project = {
  id: number;
  invoice_number: string | null;
  quote_total: string;
  payment_status: string | null;
  payment_amount: string | null;
  payment_date: string | null;
  payment_due_date: string | null;
  scheduled_date: string | null;
  documents: any;
  quote_data: any;
  category: string | null;
  status: string | null;
  created_at: string;
  customer_name: string;
  lead_id: number;
};

type Props = {
  company: {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
    plan_tier: string;
  };
  projects: Project[];
};

const PERIODS = [
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: 'all' },
];

function getTaxReady(project: Project): boolean {
  const hasQuote = project.quote_total && parseFloat(project.quote_total) > 0;
  const hasPayment = !!project.payment_amount;
  const hasReceipt = getReceiptCount(project) > 0;
  return !!(hasQuote && hasPayment && hasReceipt);
}

function getReceiptCount(project: Project): number {
  try {
    const docs = typeof project.documents === 'string'
      ? JSON.parse(project.documents)
      : project.documents || [];
    return docs.filter((d: any) => d.type === 'receipt').length;
  } catch {
    return 0;
  }
}

function getDocCount(project: Project): number {
  try {
    const docs = typeof project.documents === 'string'
      ? JSON.parse(project.documents)
      : project.documents || [];
    return docs.length;
  } catch {
    return 0;
  }
}

function filterByPeriod(projects: Project[], period: string): Project[] {
  if (period === 'all') return projects;
  const now = new Date();
  return projects.filter(p => {
    const date = new Date(p.created_at);
    if (period === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      const dq = Math.floor(date.getMonth() / 3);
      return dq === q && date.getFullYear() === now.getFullYear();
    }
    if (period === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

export default function FinancialsClient({ company, projects }: Props) {
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);

  const filtered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const totalRevenue = useMemo(() =>
    filtered.reduce((sum, p) => sum + parseFloat(p.quote_total || '0'), 0), [filtered]);

  const totalCollected = useMemo(() =>
    filtered.reduce((sum, p) => sum + parseFloat(p.payment_amount || '0'), 0), [filtered]);

  const totalOutstanding = totalRevenue - totalCollected;

  const missingReceipts = filtered.filter(p => getReceiptCount(p) === 0).length;
  const taxReadyCount = filtered.filter(p => getTaxReady(p)).length;
  const taxReadyPct = filtered.length > 0 ? Math.round((taxReadyCount / filtered.length) * 100) : 0;

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label || 'This year';

  return (
    <div className="min-h-screen bg-slate-950">
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link
            href={`/${company.slug}/dashboard`}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="h-8 w-auto object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm">
              {company.name.charAt(0)}
            </div>
          )}
          <p className="text-white font-bold text-sm">{company.name}</p>
          <span className="text-slate-600 font-bold text-sm">/</span>
          <p className="text-slate-400 font-bold text-sm">Financials</p>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Financials</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              Track your job financials and get tax ready
            </p>
          </div>

          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-all"
            >
              {currentPeriodLabel}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {periodOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden z-10 shadow-xl">
                {PERIODS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => { setPeriod(p.value); setPeriodOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${
                      period === p.value
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="text-2xl font-black text-white">{fmt(totalRevenue)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Collected</p>
            <p className="text-2xl font-black text-emerald-400">{fmt(totalCollected)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Outstanding</p>
            <p className="text-2xl font-black text-amber-400">{fmt(totalOutstanding)}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tax Ready</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-white">{taxReadyPct}%</p>
              <p className="text-xs text-slate-500 font-bold mb-1">{taxReadyCount}/{filtered.length} jobs</p>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${taxReadyPct === 100 ? 'bg-emerald-500' : taxReadyPct > 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
                style={{ width: `${taxReadyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Missing receipts banner */}
        {missingReceipts > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm font-bold text-amber-300">
              {missingReceipts} job{missingReceipts !== 1 ? 's' : ''} missing receipts — attach them before tax season so your bookkeeper can find every deduction
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <p className="text-sm font-black text-white">{filtered.length} jobs</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{currentPeriodLabel}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Payment</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Receipts</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Docs</th>
                  <th className="px-4 py-3 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Tax Ready</th>
                  <th className="px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-slate-500 font-bold text-sm">
                      No jobs found for this period
                    </td>
                  </tr>
                ) : (
                  filtered.map((project, i) => {
                    const receiptCount = getReceiptCount(project);
                    const docCount = getDocCount(project);
                    const taxReady = getTaxReady(project);
                    const total = parseFloat(project.quote_total || '0');
                    const collected = parseFloat(project.payment_amount || '0');

                    return (
                      <tr
                        key={project.id}
                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                          i % 2 === 0 ? '' : 'bg-slate-800/30'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-white">{project.customer_name}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs font-black text-emerald-400">
                            {project.invoice_number || '—'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-400">
                            {project.category || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p className="text-sm font-black text-white">{fmt(total)}</p>
                          {collected > 0 && collected < total && (
                            <p className="text-xs text-amber-400 font-bold mt-0.5">
                              {fmt(collected)} paid
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${
                            project.payment_status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : project.payment_status === 'partial'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {project.payment_status === 'paid' ? 'Paid' : project.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {receiptCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {receiptCount}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-red-400">
                              <XCircle className="w-3.5 h-3.5" />
                              None
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-black ${docCount > 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                            {docCount > 0 ? docCount : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {taxReady ? (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Incomplete
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/${company.slug}/dashboard?lead=${project.lead_id}`}
                            className="text-xs font-black text-slate-500 hover:text-white transition-colors"
                          >
                            View
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
      </div>
    </div>
  );
}