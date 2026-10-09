'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Loader2, Plus } from 'lucide-react';
import { safeJSONParse } from '@/lib/utils';
import ExpensesOverlay from './ExpensesOverlay';
import { finTokens } from './FinancialsOverview';

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmt0 = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const fmtShort = (d: string | null | undefined) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CATEGORY_LABEL: Record<string, string> = {
  materials: 'Materials',
  labor: 'Labor',
  subcontractor: 'Subcontractor',
  equipment: 'Equipment',
  travel: 'Travel',
  permits: 'Permits',
  other: 'Other',
};

// Same periods as the Financials header. Calendar-based: "This month" means
// the current calendar month, not the last 30 days.
function inPeriod(dateStr: string | null | undefined, period: string, start?: string, end?: string) {
  if (period === 'all') return true;
  if (!dateStr) return false;
  const day = String(dateStr).slice(0, 10); // YYYY-MM-DD
  const [y, m] = day.split('-').map(Number);
  if (!y || !m) return false;
  const now = new Date();
  const ny = now.getFullYear();
  const nm = now.getMonth() + 1;
  switch (period) {
    case 'month':
      return y === ny && m === nm;
    case 'quarter':
      return y === ny && Math.ceil(m / 3) === Math.ceil(nm / 3);
    case 'year':
      return y === ny;
    case 'custom':
      if (!start || !end) return true;
      return day >= start && day <= end;
    default:
      return true;
  }
}

const PERIOD_WORDS: Record<string, string> = {
  month: 'this month',
  quarter: 'this quarter',
  year: 'this year',
  custom: 'in this range',
  all: 'all time',
};

type Expense = {
  id: number;
  project_id: number | null;
  category: string;
  description: string;
  amount: number;
  vendor: string | null;
  expense_date: string;
};

export default function FinancialsExpenses({
  isDark = false,
  company,
  withMoney,
  period = 'all',
  customStart,
  customEnd,
}: {
  isDark?: boolean;
  company: any;
  withMoney: any[];
  period?: string;
  customStart?: string;
  customEnd?: string;
}) {
  const router = useRouter();
  const t = finTokens(isDark);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [showOverhead, setShowOverhead] = useState(false);
  const [expensesOverlayLeadId, setExpensesOverlayLeadId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/expenses`);
      const data = await res.json();
      if (data.success) setExpenses((data.expenses || []).map((e: any) => ({ ...e, amount: Number(e.amount) || 0 })));
      else setLoadFailed(true);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [company.slug]);

  useEffect(() => {
    load();
  }, [load]);

  const expensesByProject = useMemo(() => {
    const map = new Map<number, Expense[]>();
    for (const e of expenses) {
      if (e.project_id == null) continue;
      const list = map.get(e.project_id) || [];
      list.push(e);
      map.set(e.project_id, list);
    }
    return map;
  }, [expenses]);

  // Overhead = expenses not tied to a job, limited to the selected period by
  // the date the expense happened.
  const overhead = useMemo(
    () =>
      expenses
        .filter((e) => e.project_id == null && inPeriod(e.expense_date, period, customStart, customEnd))
        .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()),
    [expenses, period, customStart, customEnd]
  );
  const periodWords = PERIOD_WORDS[period] || 'this period';
  // There's no way to add overhead in the app yet, so only show the overhead /
  // net profit view once at least one non-job expense exists (any date).
  const usesOverhead = useMemo(() => expenses.some((e) => e.project_id == null), [expenses]);
  const overheadTotal = overhead.reduce((s, e) => s + e.amount, 0);

  // Jobs in the selected period with a price on them.
  const jobs = useMemo(
    () =>
      [...withMoney]
        .filter((p) => p._total > 0)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [withMoney]
  );

  const totals = useMemo(() => {
    let jobTotal = 0;
    let jobCosts = 0;
    for (const j of jobs) {
      jobTotal += j._total || 0;
      jobCosts += (expensesByProject.get(j.id) || []).reduce((s, e) => s + e.amount, 0);
    }
    const profit = jobTotal - jobCosts;
    return { jobTotal, jobCosts, profit, net: profit - overheadTotal };
  }, [jobs, expensesByProject, overheadTotal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className={`h-5 w-5 animate-spin ${t.faint}`} />
      </div>
    );
  }

  const pct = (n: number) => (totals.jobTotal > 0 ? `${Math.round((n / totals.jobTotal) * 100)}%` : null);
  const jobMargin = pct(totals.profit);
  const netMargin = pct(totals.net);

  return (
    <div className="space-y-6">
      {loadFailed && (
        <div className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${t.card}`}>
          <p className={`text-sm ${t.due}`}>Couldn't load expenses. Costs below may show as $0.</p>
          <button type="button" onClick={load} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${t.btn}`}>
            Try again
          </button>
        </div>
      )}

      {/* Summary for the selected period: jobs − job costs − overhead = net */}
      <div className={`grid gap-3 ${usesOverhead ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
        {(usesOverhead
          ? [
          { label: 'Job totals', value: fmt0(totals.jobTotal), note: `${jobs.length} job${jobs.length === 1 ? '' : 's'}` },
          {
            label: 'Job costs',
            value: fmt0(totals.jobCosts),
            note: `Job profit ${fmt0(totals.profit)}${jobMargin ? ` · ${jobMargin}` : ''}`,
          },
          {
            label: 'Overhead',
            value: fmt0(overheadTotal),
            note: overhead.length ? `${overhead.length} expense${overhead.length === 1 ? '' : 's'} ${periodWords}` : `None logged ${periodWords}`,
          },
          {
            label: 'Net profit',
            value: fmt0(totals.net),
            note: netMargin ? `${netMargin} of job totals` : 'After all costs',
            danger: totals.net < 0,
            strong: true,
          },
        ]
          : [
              { label: 'Job totals', value: fmt0(totals.jobTotal), note: `${jobs.length} job${jobs.length === 1 ? '' : 's'}` },
              { label: 'Job costs', value: fmt0(totals.jobCosts), note: 'Logged on jobs' },
              {
                label: 'Profit',
                value: fmt0(totals.profit),
                note: jobMargin ? `${jobMargin} margin` : 'Job totals minus costs',
                danger: totals.profit < 0,
              },
            ]
        ).map((s: any) => (
          <div key={s.label} className={`min-w-0 rounded-2xl p-3 sm:p-4 ${t.card} ${s.strong ? (isDark ? 'ring-1 ring-white/20' : 'ring-1 ring-slate-300') : ''}`}>
            <p className={`text-xs font-medium ${t.sub}`}>{s.label}</p>
            <p className={`mt-1.5 truncate text-lg font-semibold tabular-nums tracking-tight sm:text-2xl ${s.danger ? t.due : t.text}`}>
              {s.value}
            </p>
            <p className={`mt-1 truncate text-xs ${t.faint}`}>{s.note}</p>
          </div>
        ))}
      </div>

      {/* Per-job list */}
      <section>
        <h2 className={`mb-2.5 text-sm font-semibold ${t.text}`}>By job</h2>
        {jobs.length === 0 ? (
          <div className={`rounded-2xl px-4 py-10 text-center ${t.card}`}>
            <p className={`text-sm ${t.sub}`}>No priced jobs in this period.</p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl ${t.card}`}>
            <div className={`hidden grid-cols-[minmax(0,1fr)_110px_110px_110px_20px] gap-3 border-b px-4 py-2.5 sm:grid ${t.border}`}>
              <span className={`text-xs font-medium ${t.faint}`}>Job</span>
              <span className={`text-right text-xs font-medium ${t.faint}`}>Job total</span>
              <span className={`text-right text-xs font-medium ${t.faint}`}>Costs</span>
              <span className={`text-right text-xs font-medium ${t.faint}`}>Profit</span>
              <span />
            </div>
            <ul className={`divide-y ${t.divide}`}>
              {jobs.map((job) => {
                const jobExpenses = expensesByProject.get(job.id) || [];
                const income = job._total || 0;
                const expenseTotal = jobExpenses.reduce((s, e) => s + e.amount, 0);
                const profit = income - expenseTotal;
                const isOpen = openId === job.id;
                const lineItems = safeJSONParse(job.quote_data) || [];

                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : job.id)}
                      aria-expanded={isOpen}
                      className={`grid w-full grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-3 px-4 py-3 text-left transition sm:grid-cols-[minmax(0,1fr)_110px_110px_110px_20px] ${t.hover}`}
                    >
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${t.text}`}>{job.customer_name || 'Unnamed customer'}</p>
                        <p className={`truncate text-xs ${t.faint}`}>
                          {job.invoice_number ? `${job.invoice_number} · ` : ''}
                          {fmtShort(job.created_at)}
                          {jobExpenses.length === 0 && ' · no costs logged'}
                        </p>
                      </div>
                      <span className={`hidden text-right text-sm tabular-nums sm:block ${t.sub}`}>{fmt(income)}</span>
                      <span className={`hidden text-right text-sm tabular-nums sm:block ${t.sub}`}>
                        {expenseTotal ? fmt(expenseTotal) : '—'}
                      </span>
                      <span className={`text-right text-sm font-semibold tabular-nums ${profit < 0 ? t.due : t.text}`}>
                        {fmt(profit)}
                      </span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${t.faint} ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className={`grid grid-cols-1 gap-5 border-t px-4 pb-4 pt-3 sm:grid-cols-2 ${t.border}`}>
                        <div>
                          <p className={`mb-2 text-xs font-semibold ${t.sub}`}>Quote items</p>
                          {lineItems.length === 0 ? (
                            <p className={`text-xs ${t.faint}`}>No line items on this job.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {lineItems.map((item: any, i: number) => (
                                <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                                  <span className={`min-w-0 truncate ${t.text}`}>{item.description || 'Item'}</span>
                                  <span className={`shrink-0 tabular-nums ${t.sub}`}>{fmt(item.amount || 0)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <p className={`text-xs font-semibold ${t.sub}`}>Costs</p>
                            {job.lead_id && (
                              <button
                                type="button"
                                onClick={() => setExpensesOverlayLeadId(job.lead_id)}
                                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition ${t.btn}`}
                              >
                                <Plus className="h-3 w-3" />
                                {jobExpenses.length ? 'Add or edit' : 'Add cost'}
                              </button>
                            )}
                          </div>
                          {jobExpenses.length === 0 ? (
                            <p className={`text-xs ${t.faint}`}>No costs logged for this job.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {jobExpenses.map((e) => (
                                <li key={e.id} className="flex items-baseline justify-between gap-3 text-sm">
                                  <span className={`min-w-0 truncate ${t.text}`}>
                                    {e.description}
                                    <span className={`ml-1.5 text-xs ${t.faint}`}>{CATEGORY_LABEL[e.category] || e.category}</span>
                                  </span>
                                  <span className={`shrink-0 tabular-nums ${t.sub}`}>{fmt(e.amount)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Overhead */}
      {overhead.length > 0 && (
        <section>
          <h2 className={`mb-2.5 text-sm font-semibold ${t.text}`}>Overhead</h2>
          <div className={`overflow-hidden rounded-2xl ${t.card}`}>
            <button
              type="button"
              onClick={() => setShowOverhead((v) => !v)}
              aria-expanded={showOverhead}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${t.hover}`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-medium ${t.text}`}>Not tied to a job</p>
                <p className={`text-xs ${t.faint}`}>
                  {overhead.length} expense{overhead.length === 1 ? '' : 's'} · {periodWords} · by expense date
                </p>
              </div>
              <span className="flex items-center gap-3">
                <span className={`text-sm font-semibold tabular-nums ${t.text}`}>{fmt(overheadTotal)}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${t.faint} ${showOverhead ? 'rotate-180' : ''}`} />
              </span>
            </button>
            {showOverhead && (
              <ul className={`divide-y border-t ${t.divide} ${t.border}`}>
                {overhead.map((e) => (
                  <li key={e.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0">
                      <span className={`block truncate ${t.text}`}>{e.description}</span>
                      <span className={`block text-xs ${t.faint}`}>
                        {[fmtShort(e.expense_date), CATEGORY_LABEL[e.category] || e.category, e.vendor].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className={`shrink-0 tabular-nums ${t.sub}`}>{fmt(e.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {expensesOverlayLeadId && (
        <ExpensesOverlay
          leadId={expensesOverlayLeadId}
          companySlug={company.slug}
          onClose={() => {
            setExpensesOverlayLeadId(null);
            // Refetch expenses here, and refresh the server data behind job totals.
            load();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}