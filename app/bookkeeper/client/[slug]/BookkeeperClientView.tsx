'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Download, Receipt, FileText, ExternalLink,
  CheckCircle2, XCircle, AlertCircle, DollarSign,
  Clock, ChevronDown
} from 'lucide-react';

type Project = Record<string, any>;

type Props = {
  company: Record<string, any>;
  projects: Project[];
  bookkeeper: any;
};

type Tab = 'invoices' | 'receipts';

const PERIODS = [
  { label: 'This year',    value: 'year'    },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month',   value: 'month'   },
  { label: 'All time',     value: 'all'     },
];

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCategory(cat: string | null) {
  if (!cat) return '—';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getReceipts(project: Project): any[] {
  try {
    const docs = typeof project.documents === 'string'
      ? JSON.parse(project.documents)
      : project.documents || [];
    return docs.filter((d: any) => d.type === 'receipt');
  } catch { return []; }
}

function filterByPeriod(projects: Project[], period: string): Project[] {
  if (period === 'all') return projects;
  const now = new Date();
  return projects.filter(p => {
    const date = new Date(p.created_at);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      return Math.floor(date.getMonth() / 3) === q && date.getFullYear() === now.getFullYear();
    }
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function InvoicesTab({ projects, company, period, setPeriod }: {
  projects: Project[];
  company: Props['company'];
  period: string;
  setPeriod: (p: string) => void;
}) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const filtered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const totalInvoiced   = useMemo(() => filtered.reduce((s, p) => s + parseFloat(p.quote_total || '0'), 0), [filtered]);
  const totalCollected  = useMemo(() => filtered.reduce((s, p) => s + parseFloat(p.payment_amount || '0'), 0), [filtered]);
  const totalOutstanding = totalInvoiced - totalCollected;
  const unpaidCount     = filtered.filter(p => p.payment_status !== 'paid').length;
  const currentLabel    = PERIODS.find(p => p.value === period)?.label || 'This year';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-black text-white">Invoices</h2>
          <p className="text-xs text-slate-500 mt-0.5">{filtered.length} jobs · {currentLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {currentLabel}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {periodOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden z-10 shadow-xl"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                {PERIODS.map(p => (
                  <button key={p.value} onClick={() => { setPeriod(p.value); setPeriodOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/5"
                    style={{ color: period === p.value ? '#10b981' : '#94a3b8' }}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => window.open(`/api/company/${company.slug}/export-csv?format=quickbooks`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95"
            style={{ background: '#10b981' }}>
            <Download className="w-3.5 h-3.5" />
            QuickBooks Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Invoiced',  value: fmt(totalInvoiced),    icon: DollarSign,  color: '#fff',     bg: 'rgba(255,255,255,0.04)' },
          { label: 'Collected',       value: fmt(totalCollected),   icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
          { label: 'Outstanding',     value: fmt(totalOutstanding), icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
          { label: 'Unpaid Jobs',     value: String(unpaidCount),   icon: AlertCircle,  color: '#f87171', bg: 'rgba(239,68,68,0.08)'   },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl p-4"
              style={{ background: card.bg, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{card.label}</p>
              </div>
              <p className="text-xl font-black" style={{ color: card.color }}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
                {['Customer', 'Invoice #', 'Category', 'Date', 'Amount', 'Collected', 'Status', 'Receipts'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-600 font-bold text-sm">
                    No invoices found for this period
                  </td>
                </tr>
              ) : filtered.map((project, i) => {
                const receipts = getReceipts(project);
                const total     = parseFloat(project.quote_total || '0');
                const collected = parseFloat(project.payment_amount || '0');
                return (
                  <tr key={project.id} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-white">{project.customer_name}</p>
                    </td>
                   <td className="px-4 py-3.5">
  <p className="text-xs font-black text-emerald-400">
    {project.invoice_number || '—'}
  </p>

  {project.invoice_number && (
    <a
      href={`/api/company/${company.slug}/generate-invoice-pdf?project_id=${project.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-bold text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1 mt-0.5"
    >
      <Download className="w-3 h-3" />
      PDF
    </a>
  )}
</td>

                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-400">{formatCategory(project.category)}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="text-xs text-slate-500">{formatDate(project.created_at)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-black text-white">{fmt(total)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold" style={{ color: collected >= total ? '#10b981' : collected > 0 ? '#f59e0b' : '#64748b' }}>
                        {collected > 0 ? fmt(collected) : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{
                        background: project.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : project.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        color: project.payment_status === 'paid' ? '#10b981' : project.payment_status === 'partial' ? '#f59e0b' : '#f87171',
                      }}>
                        {project.payment_status === 'paid' ? 'Paid' : project.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {receipts.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />{receipts.length}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-slate-600">
                          <XCircle className="w-3 h-3" />None
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReceiptsTab({ projects }: { projects: Project[] }) {
  const jobsWithReceipts = projects
    .map(p => ({ ...(p as any), receipts: getReceipts(p) }))
    .filter((p: any) => p.receipts.length > 0) as any[];

  if (jobsWithReceipts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Receipt className="w-5 h-5 text-slate-600" />
        </div>
        <p className="text-slate-500 font-bold text-sm mb-1">No receipts yet</p>
        <p className="text-slate-600 text-xs max-w-xs">Receipts appear here when your client attaches them to jobs.</p>
      </div>
    );
  }

  const totalReceipts = jobsWithReceipts.reduce((s, p) => s + p.receipts.length, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <div className="mb-2">
        <h2 className="text-lg font-black text-white">Receipts</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {totalReceipts} receipt{totalReceipts !== 1 ? 's' : ''} across {jobsWithReceipts.length} job{jobsWithReceipts.length !== 1 ? 's' : ''}
        </p>
      </div>
      {jobsWithReceipts.map(project => (
        <div key={project.id} className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{project.customer_name}</p>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {project.invoice_number && <span className="text-xs font-black text-emerald-400">{project.invoice_number}</span>}
                {project.category && <span className="text-xs text-slate-500">{formatCategory(project.category)}</span>}
                <span className="text-xs text-slate-600">{formatDate(project.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              {project.quote_total && (
                <span className="text-xs font-black text-slate-400">{fmt(parseFloat(project.quote_total))}</span>
              )}
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full" style={{
                background: project.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : project.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                color: project.payment_status === 'paid' ? '#10b981' : project.payment_status === 'partial' ? '#f59e0b' : '#f87171',
              }}>
                {project.payment_status || 'unpaid'}
              </span>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {project.receipts.map((receipt: any, i: number) => {
              const filename = receipt.name || receipt.url?.split('/').pop() || `Receipt ${i + 1}`;
              const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(receipt.url || '');
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {isImage ? <img src={receipt.url} alt="" className="w-8 h-8 object-cover" /> : <FileText className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-300 truncate">{filename}</p>
                      {receipt.uploadedAt && <p className="text-[10px] text-slate-600">{formatDate(receipt.uploadedAt)}</p>}
                    </div>
                  </div>
                  <a href={receipt.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl transition-all shrink-0 ml-3"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <ExternalLink className="w-3 h-3" />View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BookkeeperClientView({ company, projects, bookkeeper }: Props) {
  const [tab, setTab] = useState<Tab>('invoices');
  const [period, setPeriod] = useState('year');

  const totalReceipts = useMemo(() => projects.reduce((s, p) => s + getReceipts(p).length, 0), [projects]);

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Nav */}
      <div className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(16,185,129,0.15)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <Link href="/bookkeeper/dashboard"
            className="flex items-center gap-1.5 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Clients
          </Link>
          <span className="text-slate-700">·</span>
          {company.logo_url && <img src={company.logo_url} alt={company.name} className="h-5 w-auto object-contain" />}
          <span className="text-sm font-black text-white">{company.name}</span>
        </div>
        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hidden sm:block">Bookkeeper View</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-6 gap-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {([
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'receipts', label: `Receipts${totalReceipts > 0 ? ` (${totalReceipts})` : ''}`, icon: Receipt },
        ] as { id: Tab; label: string; icon: any }[]).map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-3.5 text-xs font-black transition-all border-b-2"
              style={{ color: active ? '#10b981' : '#475569', borderBottomColor: active ? '#10b981' : 'transparent', background: 'transparent' }}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === 'invoices'
        ? <InvoicesTab projects={projects} company={company} period={period} setPeriod={setPeriod} />
        : <ReceiptsTab projects={projects} />
      }
    </div>
  );
}