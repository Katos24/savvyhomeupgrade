'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, ChevronDown, ChevronUp, BellRing, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import InvoiceDetailDrawer from './InvoiceDetailDrawer';
import type { InvoiceState } from './FinancialsClient';
import BillingOverlay from './BillingOverlay';
import { finTokens } from './FinancialsOverview';

export type { InvoiceState };

const fmtExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDateLong = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// Status colors follow the app rules: gray for neutral states, red only for
// overdue, green only for paid. The drawer still receives the same shape.
const STATE_META: Record<
  InvoiceState,
  { label: string; dot: string; light: { text: string; bg: string }; dark: { text: string; bg: string } }
> = {
  draft:   { label: 'Not sent', dot: '#94a3b8', light: { text: '#64748b', bg: '#f1f5f9' }, dark: { text: '#94a3b8', bg: '#ffffff0d' } },
  sent:    { label: 'Sent',     dot: '#64748b', light: { text: '#334155', bg: '#f1f5f9' }, dark: { text: '#cbd5e1', bg: '#ffffff12' } },
  partial: { label: 'Partly paid', dot: '#64748b', light: { text: '#334155', bg: '#f1f5f9' }, dark: { text: '#cbd5e1', bg: '#ffffff12' } },
  overdue: { label: 'Overdue',  dot: '#ef4444', light: { text: '#b91c1c', bg: '#fef2f2' }, dark: { text: '#fca5a5', bg: '#ef44441f' } },
  paid:    { label: 'Paid',     dot: '#22c55e', light: { text: '#15803d', bg: '#f0fdf4' }, dark: { text: '#86efac', bg: '#22c55e1f' } },
};

// Wider than the shared InvoiceState: splits 'sent'/'partial' by which part
// is still owed (deposit vs balance). 'sent'/'partial' still work when the
// Overview passes them in.
type ListFilter = InvoiceState | 'all' | 'awaiting_deposit' | 'awaiting_balance';

const matchesFilter = (p: any, f: ListFilter): boolean => {
  if (f === 'all') return true;
  if (f === 'draft') return p._state === 'draft';
  if (f === 'overdue') return p._state === 'overdue';
  if (f === 'paid') return p._state === 'paid';
  if (f === 'awaiting_deposit') {
    return p._billingPhase === 'deposit' && p._state !== 'overdue' && p._state !== 'paid';
  }
  if (f === 'awaiting_balance') {
    return p._billingPhase === 'balance' && p._state !== 'overdue' && p._state !== 'paid';
  }
  if (f === 'sent' || f === 'partial') {
    return !!p._billingPhase && p._state !== 'overdue' && p._state !== 'paid' && p._state !== 'draft';
  }
  return false;
};

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Not sent' },
  { key: 'awaiting_deposit', label: 'Awaiting deposit' },
  { key: 'awaiting_balance', label: 'Awaiting balance' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
];

type SortKey = 'customer' | 'amount' | 'due' | 'sent';

const COLS = 'lg:grid-cols-[minmax(0,1fr)_100px_110px_110px_84px_84px_96px]';

// Phase-aware dates: a deposit row's dates live on the deposit fields.
const dueDateFor = (p: any) => (p._billingPhase === 'deposit' ? p.deposit_due_date : p.payment_due_date);
const sentDateFor = (p: any) =>
  p._billingPhase === 'deposit' ? p.inv_deposit_sent_at : p._billingPhase === 'balance' ? p.inv_sent_at : p.invoice_sent_at;
const phaseLabel = (p: any) => (p._billingPhase === 'deposit' ? 'Deposit' : p._billingPhase === 'balance' ? 'Balance' : null);

const timeOrNull = (d: any) => {
  if (!d) return null;
  const t = new Date(d).getTime();
  return isNaN(t) ? null : t;
};

export default function InvoicesList({
  company,
  withMoney,
  isBookkeeperView,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  isDark = false,
}: {
  company: any;
  withMoney: any[];
  isBookkeeperView: boolean;
  filter: ListFilter;
  onFilterChange: (value: ListFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  isDark?: boolean;
}) {
  const router = useRouter();
  const t = finTokens(isDark);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<any | null>(null);
  const [billingLeadId, setBillingLeadId] = useState<number | null>(null);
  const [remindTarget, setRemindTarget] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of FILTERS) c[f.key] = withMoney.filter((p) => matchesFilter(p, f.key)).length;
    return c;
  }, [withMoney]);

  const rows = useMemo(() => {
    let list = withMoney;
    if (filter !== 'all') list = list.filter((p) => matchesFilter(p, filter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.customer_name || '').toLowerCase().includes(q) ||
          (p.invoice_number || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }
    const sorted = [...list];
    if (!sortKey) {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return sorted;
    }
    const dir = sortDir === 'asc' ? 1 : -1;
    const byDate = (at: number | null, bt: number | null) => {
      if (at === null && bt === null) return 0;
      if (at === null) return 1;
      if (bt === null) return -1;
      return dir * (at - bt);
    };
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'customer':
          return dir * (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'amount':
          return dir * (a._owed - b._owed);
        case 'due':
          return byDate(timeOrNull(dueDateFor(a)), timeOrNull(dueDateFor(b)));
        case 'sent':
          return byDate(timeOrNull(sentDateFor(a)), timeOrNull(sentDateFor(b)));
        default:
          return 0;
      }
    });
    return sorted;
  }, [withMoney, filter, search, sortKey, sortDir]);

  const PAGE_SIZE = 25;
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [filter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortKey(null);
        return;
      }
      setSortDir('asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Esc closes the reminder popup.
  useEffect(() => {
    if (!remindTarget) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sending) setRemindTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [remindTarget, sending]);

  const sendReminder = async () => {
    const p = remindTarget;
    if (!p) return;
    setSending(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: p.lead_id, project_id: p.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reminder sent to ${p.customer_name}`);
        setRemindedIds((prev) => new Set(prev).add(p.id));
        setRemindTarget(null);
      } else {
        toast.error(data.error || 'Could not send reminder');
      }
    } catch {
      toast.error('Could not send reminder');
    } finally {
      setSending(false);
    }
  };

  const SortHeader = ({ col, label, right }: { col: SortKey; label: string; right?: boolean }) => {
    const active = sortKey === col;
    return (
      <button
        type="button"
        onClick={() => toggleSort(col)}
        className={`group inline-flex items-center gap-1 text-xs font-medium transition ${right ? 'justify-end' : ''} ${
          active ? t.text : t.faint
        } hover:opacity-80`}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
        )}
      </button>
    );
  };

  const StatusPill = ({ p }: { p: any }) => {
    const def = STATE_META[p._state as InvoiceState] || STATE_META.draft;
    const c = isDark ? def.dark : def.light;
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: def.dot }} />
        {def.label}
      </span>
    );
  };

  const RemindButton = ({ p }: { p: any }) => {
    const reminded = p._remindedToday || remindedIds.has(p.id);
    return (
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setRemindTarget(p);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setRemindTarget(p);
          }
        }}
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition ${
          reminded ? `${t.border} ${t.faint}` : t.btn
        }`}
      >
        <BellRing className="h-3 w-3" />
        {reminded ? 'Reminded' : 'Remind'}
      </span>
    );
  };

  const pagerBtn = `rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${t.btn}`;

  return (
    <div>
      {/* Filters + search */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterChange(f.key)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  active ? `${t.primary} border-transparent` : t.btn
                }`}
              >
                {f.label}
                {counts[f.key] ? <span className="ml-1.5 tabular-nums opacity-60">{counts[f.key]}</span> : null}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-64">
          <Search className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${t.faint}`} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customer or invoice #"
            className={`w-full rounded-xl border py-2 pl-9 pr-8 text-base sm:text-sm outline-none transition ${t.input} ${
              isDark ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
            }`}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 ${t.faint}`}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl ${t.card}`}>
        {/* Desktop header */}
        <div className={`hidden gap-3 border-b px-4 py-2.5 lg:grid ${COLS} ${t.border}`}>
          <SortHeader col="customer" label="Customer" />
          <span className={`text-xs font-medium ${t.faint}`}>Job total</span>
          <SortHeader col="amount" label="Still owed" />
          <span className={`text-xs font-medium ${t.faint}`}>Status</span>
          <SortHeader col="due" label="Due" />
          <SortHeader col="sent" label="Sent" />
          <span />
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className={`text-sm ${t.sub}`}>No invoices match.</p>
            {(filter !== 'all' || search) && (
              <button
                type="button"
                onClick={() => {
                  onFilterChange('all');
                  onSearchChange('');
                }}
                className={`mt-2 text-xs font-semibold underline-offset-2 hover:underline ${t.sub}`}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ul className={`divide-y ${t.divide}`}>
            {pagedRows.map((p) => {
              const canRemind = !isBookkeeperView && p._owed > 0.005 && p._invoiced;
              const phase = phaseLabel(p);
              const owedClass = p._state === 'overdue' ? t.due : p._owed <= 0.005 ? t.faint : t.text;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(p)}
                    className={`w-full px-4 py-3 text-left transition ${t.hover}`}
                  >
                    {/* Mobile */}
                    <div className="space-y-2 lg:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`truncate text-sm font-medium ${t.text}`}>{p.customer_name || 'Unnamed customer'}</p>
                          <p className={`truncate text-xs ${t.faint}`}>{p.invoice_number || 'No invoice #'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-semibold tabular-nums ${owedClass}`}>{fmtExact(p._owed)}</p>
                          <p className={`text-xs tabular-nums ${t.faint}`}>
                            {phase ? `${phase} · ` : ''}of {fmtExact(p._total)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill p={p} />
                          <span className={`text-xs ${t.faint}`}>
                            Due <span className={t.sub}>{fmtDate(dueDateFor(p))}</span>
                          </span>
                        </div>
                        {canRemind && <RemindButton p={p} />}
                      </div>
                      {p._collectedUnsent && (
                        <p className={`text-xs ${t.sub}`}>{fmtExact(p._collected)} collected before an invoice was sent</p>
                      )}
                    </div>

                    {/* Desktop */}
                    <div className={`hidden items-center gap-3 lg:grid ${COLS}`}>
                      <div className="min-w-0">
                        <p className={`truncate text-sm font-medium ${t.text}`}>{p.customer_name || 'Unnamed customer'}</p>
                        <p className={`truncate text-xs ${t.faint}`}>{p.invoice_number || 'No invoice #'}</p>
                      </div>
                      <div className={`text-sm tabular-nums ${t.sub}`}>{fmtExact(p._total)}</div>
                      <div>
                        <div className={`text-sm font-semibold tabular-nums ${owedClass}`}>{fmtExact(p._owed)}</div>
                        {phase && <div className={`text-xs ${t.faint}`}>{phase}</div>}
                      </div>
                      <div>
                        <StatusPill p={p} />
                        {p._collectedUnsent && (
                          <p className={`mt-1 text-xs ${t.faint}`}>{fmtExact(p._collected)} paid, no invoice</p>
                        )}
                      </div>
                      <div className={`text-sm tabular-nums ${t.sub}`}>{fmtDate(dueDateFor(p))}</div>
                      <div className={`text-sm tabular-nums ${t.sub}`}>{fmtDate(sentDateFor(p))}</div>
                      <div className="flex justify-end">{canRemind && <RemindButton p={p} />}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-xs tabular-nums ${t.faint}`}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length} invoice
            {rows.length === 1 ? '' : 's'}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage((n) => Math.max(1, n - 1))} disabled={page === 1} className={pagerBtn}>
                Previous
              </button>
              <span className={`text-xs tabular-nums ${t.sub}`}>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
                disabled={page === totalPages}
                className={pagerBtn}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {selected && (
        <InvoiceDetailDrawer
          project={selected}
          stateMeta={{
            label: (STATE_META[selected._state as InvoiceState] || STATE_META.draft).label,
            dot: (STATE_META[selected._state as InvoiceState] || STATE_META.draft).dot,
            ...(isDark
              ? (STATE_META[selected._state as InvoiceState] || STATE_META.draft).dark
              : (STATE_META[selected._state as InvoiceState] || STATE_META.draft).light),
          }}
          onOpenBilling={() => setBillingLeadId(selected.lead_id)}
          onClose={() => setSelected(null)}
        />
      )}

      {billingLeadId && (
        <BillingOverlay
          leadId={billingLeadId}
          company={company}
          onClose={() => {
            setBillingLeadId(null);
            // The list comes from the server page, so refresh it after billing changes.
            router.refresh();
          }}
        />
      )}

      {remindTarget && (() => {
        const remindedNow = remindTarget._remindedToday || remindedIds.has(remindTarget.id);
        return (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => !sending && setRemindTarget(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className={`w-full max-w-sm rounded-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl ${t.card}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className={`text-base font-semibold ${t.text}`}>Send payment reminder</h3>
                <button
                  type="button"
                  onClick={() => !sending && setRemindTarget(null)}
                  className={`rounded-lg p-1 transition ${t.faint} ${t.hover}`}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <dl className={`mb-4 divide-y rounded-xl border text-sm ${t.border} ${t.divide}`}>
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
                  <dt className={t.sub}>To</dt>
                  <dd className={`min-w-0 truncate text-right font-medium ${t.text}`}>{remindTarget.customer_name}</dd>
                </div>
                {remindTarget.customer_email && (
                  <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
                    <dt className={t.sub}>Email</dt>
                    <dd className={`min-w-0 truncate text-right ${t.sub}`}>{remindTarget.customer_email}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
                  <dt className={t.sub}>Amount due</dt>
                  <dd className={`font-semibold tabular-nums ${t.text}`}>{fmtExact(remindTarget._owed)}</dd>
                </div>
                {remindTarget._overdue !== null && remindTarget._overdue !== undefined && (
                  <div className="flex items-baseline justify-between gap-3 px-3.5 py-2.5">
                    <dt className={t.sub}>Overdue</dt>
                    <dd className={`font-medium ${t.due}`}>
                      {remindTarget._overdue} day{remindTarget._overdue === 1 ? '' : 's'}
                    </dd>
                  </div>
                )}
              </dl>

              <p className={`mb-4 text-sm leading-relaxed ${t.sub}`}>
                {remindTarget.reminder_sent_at || remindedIds.has(remindTarget.id) ? (
                  <>
                    Last reminder sent{' '}
                    <span className={`font-medium ${t.text}`}>
                      {remindedIds.has(remindTarget.id) ? 'just now' : fmtDateLong(remindTarget.reminder_sent_at)}
                    </span>
                    .{' '}
                    {remindedNow
                      ? 'You can send another tomorrow.'
                      : 'Sending again emails them the amount due with a pay link.'}
                  </>
                ) : (
                  'This emails them the amount due with a pay link. No reminder has been sent on this job yet.'
                )}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRemindTarget(null)}
                  disabled={sending}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition disabled:opacity-50 ${t.btn}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={sendReminder}
                  disabled={sending || remindedNow}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-40 ${t.primary}`}
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                  {remindedNow ? 'Sent today' : 'Send reminder'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}