'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Import, Loader2, Receipt } from 'lucide-react';
import { safeJSONParse } from '@/lib/utils';
import ExpensesOverlay from './ExpensesOverlay';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const CATEGORY_LABEL: Record<string, string> = {
  materials: 'Materials',
  labor: 'Labor',
  subcontractor: 'Subcontractor',
  equipment: 'Equipment',
  travel: 'Travel',
  permits: 'Permits',
  other: 'Other',
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
}: {
  isDark?: boolean;
  company: any;
  withMoney: any[];
}) {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  // Separate from openId (which toggles the inline accordion) — this
  // opens the real overlay so someone can actually add/edit an expense
  // from Financials, which this tab previously had no way to do at all.
  const [expensesOverlayLeadId, setExpensesOverlayLeadId] = useState<number | null>(null);

  // Extracted from the old inline useEffect fetch into a real, callable
  // function — needed so the overlay's onClose can trigger a refetch,
  // same pattern ExpensesSection.tsx itself already uses for its own load.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/expenses`);
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch {
      // Left empty on failure — the accordion still renders with income
      // data and $0 expenses per job rather than blocking the whole tab.
    } finally {
      setLoading(false);
    }
  }, [company.slug]);

  useEffect(() => {
    load();
  }, [load]);

  // Expenses grouped by project — a Map, not an object, since project ids
  // are numeric and this avoids any string-coercion key surprises.
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

  // Overhead — not tied to any job, doesn't count toward any project's
  // profit, shown as its own summary rather than folded into the
  // per-job list where it wouldn't have anywhere honest to attach.
  const overhead = useMemo(() => expenses.filter((e) => e.project_id == null), [expenses]);
  const overheadTotal = overhead.reduce((s, e) => s + e.amount, 0);

  // Only jobs with real income, matching what the rest of Financials
  // already considers "in scope" — a $0 job with no expenses either
  // wouldn't tell anyone anything by showing up here.
  const jobs = useMemo(
    () =>
      [...withMoney]
        .filter((p) => p._total > 0)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [withMoney]
  );

  const cardBase = isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white';
  const labelText = isDark ? 'text-slate-400' : 'text-stone-500';
  const valueText = isDark ? 'text-white' : 'text-stone-900';
  const subText = isDark ? 'text-slate-500' : 'text-stone-400';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className={`h-5 w-5 animate-spin ${labelText}`} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {overhead.length > 0 && (
        <div className={`rounded-2xl border p-4 shadow-sm ${cardBase}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className={`h-4 w-4 ${labelText}`} />
              <p className={`text-sm font-semibold ${valueText}`}>General Overhead</p>
              <span className={`text-xs ${subText}`}>({overhead.length} not tied to a job)</span>
            </div>
            <span className={`text-sm font-bold tabular-nums ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
              {fmt(overheadTotal)}
            </span>
          </div>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center shadow-sm ${cardBase}`}>
          <p className={`text-sm ${labelText}`}>No jobs with income yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => {
            const jobExpenses = expensesByProject.get(job.id) || [];
            const income = job._total || 0;
            const expenseTotal = jobExpenses.reduce((s, e) => s + e.amount, 0);
            const profit = income - expenseTotal;
            const isOpen = openId === job.id;
            const incomeLineItems = safeJSONParse(job.quote_data) || [];

            return (
              <div key={job.id} className={`rounded-2xl border shadow-sm overflow-hidden ${cardBase}`}>
                <button
                  onClick={() => setOpenId(isOpen ? null : job.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-stone-50/60'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${valueText}`}>
                      {job.customer_name || 'Unnamed Client'}
                    </p>
                    <p className={`text-xs ${subText}`}>
                      {job.invoice_number ? `#${job.invoice_number} · ` : ''}
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className={`text-[10px] uppercase tracking-wide ${subText}`}>Income</p>
                      <p className={`text-sm font-semibold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {fmt(income)}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className={`text-[10px] uppercase tracking-wide ${subText}`}>Expenses</p>
                      <p className={`text-sm font-semibold tabular-nums ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                        {fmt(expenseTotal)}
                      </p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className={`text-[10px] uppercase tracking-wide ${subText}`}>Profit</p>
                      <p className={`text-base font-bold tabular-nums ${valueText}`}>{fmt(profit)}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${labelText} ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4 border-t ${isDark ? 'border-white/10' : 'border-stone-100'} pt-3`}>
                    <div>
                      <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${labelText}`}>Income</p>
                      {incomeLineItems.length === 0 ? (
                        <p className={`text-xs ${subText}`}>No line-item breakdown available.</p>
                      ) : (
                        <div className="space-y-1">
                          {incomeLineItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className={valueText}>{item.description || 'Item'}</span>
                              <span className={`tabular-nums ${valueText}`}>{fmt(item.amount || 0)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                                       <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-[11px] font-semibold uppercase tracking-wide ${labelText}`}>Expenses</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpensesOverlayLeadId(job.lead_id);
                          }}
                          className={`text-[11px] font-semibold underline ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'}`}
                        >
                          Add / Edit
                        </button>
                      </div>
                      {jobExpenses.length === 0 ? (
                        <p className={`text-xs ${subText}`}>No expenses logged for this job.</p>
                      ) : (
                        <div className="space-y-1">
                          {jobExpenses.map((e) => (
                            <div key={e.id} className="flex items-center justify-between text-xs">
                              <span className={valueText}>
                                {e.description}
                                <span className={`ml-1.5 ${subText}`}>({CATEGORY_LABEL[e.category] || e.category})</span>
                              </span>
                              <span className={`tabular-nums ${valueText}`}>{fmt(e.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
               </div>
      )}

      {expensesOverlayLeadId && (
        <ExpensesOverlay
          leadId={expensesOverlayLeadId}
          companySlug={company.slug}
          onClose={() => {
            setExpensesOverlayLeadId(null);
            // Same reasoning as BillingOverlay's onClose — this tab's own
            // `expenses` state refetches on load, but the accordion's
            // `withMoney`/income totals come from the parent Financials
            // page, which needs a real refresh to reflect a newly added
            // or edited expense.
            load();
            router.refresh();
          }}
        />
      )}
    </div>
  );
}