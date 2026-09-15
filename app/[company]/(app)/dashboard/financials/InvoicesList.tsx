'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Search, ChevronDown, ChevronUp, BellRing, Loader2, X } from 'lucide-react';
import InvoiceDetailDrawer from './InvoiceDetailDrawer';
import type { InvoiceState } from './FinancialsClient';
import BillingOverlay from './BillingOverlay';

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

const STATE_META: Record<InvoiceState, { label: string; dot: string; light: { text: string; bg: string }; dark: { text: string; bg: string } }> = {
  draft:    { label: 'Draft',    dot: '#a8a29e', light: { text: '#57534e', bg: '#a8a29e18' }, dark: { text: '#d6d3d1', bg: '#a8a29e26' } },
  sent:     { label: 'Sent',     dot: '#3b82f6', light: { text: '#1d4ed8', bg: '#3b82f618' }, dark: { text: '#93c5fd', bg: '#3b82f626' } },
  overdue:  { label: 'Overdue',  dot: '#ef4444', light: { text: '#b91c1c', bg: '#ef444418' }, dark: { text: '#fca5a5', bg: '#ef444426' } },
  partial:  { label: 'Partial',  dot: '#eab308', light: { text: '#a16207', bg: '#eab30818' }, dark: { text: '#fde047', bg: '#eab30826' } },
  paid:     { label: 'Paid',     dot: '#22c55e', light: { text: '#15803d', bg: '#22c55e18' }, dark: { text: '#86efac', bg: '#22c55e26' } },
};

// Widened beyond the shared InvoiceState type, local to this component —
// splits what used to be one ambiguous 'sent'/'partial' bucket into
// phase-aware ones, since "$X owed" meant something different depending
// on whether it was the deposit or the balance still outstanding.
type ListFilter = InvoiceState | 'all' | 'awaiting_deposit' | 'awaiting_balance';

// One real function instead of a plain equality check — 'overdue' stays
// its own urgent, cross-cutting bucket (same priority _state already
// gives it internally), Draft/Paid are unchanged, and the two new
// buckets split the old 'sent'/'partial' state by which phase is
// actually outstanding. Legacy 'sent'/'partial' values are still
// accepted (Overview's cards still pass them) and mapped onto the
// closest real meaning, so that entry point keeps showing sensible
// rows even though no single pill highlights as selected for it.
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
  { key: 'draft', label: 'Draft' },
  { key: 'awaiting_deposit', label: 'Awaiting Deposit' },
  { key: 'awaiting_balance', label: 'Awaiting Balance' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
];

type SortKey = 'customer' | 'amount' | 'due' | 'sent';

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
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<any | null>(null);
  const [billingLeadId, setBillingLeadId] = useState<number | null>(null);
  const [remindTarget, setRemindTarget] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  const cardBase = isDark ? 'border-white/10 bg-[#0f1420]' : 'border-stone-200 bg-white';
  const headerBg = isDark ? 'bg-white/5 border-white/10' : 'bg-stone-50/70 border-stone-200';
  const labelText = isDark ? 'text-slate-400' : 'text-stone-500';
  const valueText = isDark ? 'text-white' : 'text-stone-900';
  const subText = isDark ? 'text-slate-500' : 'text-stone-400';
  const rowBorder = isDark ? 'border-white/10' : 'border-stone-100';
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-stone-50/60';
  const pillActive = isDark ? 'bg-white text-[#0b0f17]' : 'bg-stone-900 text-white';
  const pillInactive = isDark
    ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
    : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50';

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
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'customer':
          return dir * (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'amount':
          return dir * (a._owed - b._owed);
        case 'due': {
          const at = a.payment_due_date ? new Date(a.payment_due_date).getTime() : null;
          const bt = b.payment_due_date ? new Date(b.payment_due_date).getTime() : null;
          if (at === null && bt === null) return 0;
          if (at === null) return 1;
          if (bt === null) return -1;
          return dir * (at - bt);
        }
        case 'sent': {
          const aSent = a._billingPhase === 'deposit' ? a.inv_deposit_sent_at : a._billingPhase === 'balance' ? a.inv_sent_at : a.invoice_sent_at;
          const bSent = b._billingPhase === 'deposit' ? b.inv_deposit_sent_at : b._billingPhase === 'balance' ? b.inv_sent_at : b.invoice_sent_at;
          const at = aSent ? new Date(aSent).getTime() : null;
          const bt = bSent ? new Date(bSent).getTime() : null;
          if (at === null && bt === null) return 0;
          if (at === null) return 1;
          if (bt === null) return -1;
          return dir * (at - bt);
        }
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
  const pagedRows = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

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

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => {
    const active = sortKey === col;
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`group inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${
          active ? valueText : labelText
        } ${isDark ? 'hover:text-white' : 'hover:text-stone-900'}`}
      >
        {label}
        {active ? (
          sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
        )}
      </button>
    );
  };

  const phaseLabel = (p: any) => (p._billingPhase === 'deposit' ? 'Deposit' : p._billingPhase === 'balance' ? 'Balance' : null);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f.key ? pillActive : `border ${pillInactive}`
            }`}
          >
            {f.label}
            {counts[f.key] ? <span className="ml-1 opacity-60">{counts[f.key]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className={`pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${subText}`} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Client or invoice number..."
            className={`w-full rounded-lg border py-2 pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-teal-700 ${
              isDark
                ? 'border-white/10 bg-white/5 text-white placeholder:text-slate-500'
                : 'border-stone-300 bg-white placeholder:text-stone-400'
            }`}
          />
        </div>
      </div>

      <div className={`overflow-hidden rounded-xl border ${cardBase}`}>
        {/* 7 columns now — Total Bill and Remaining shown separately,
            not collapsed into one strikethrough number. Remaining is what
            drives sort/urgency; Total is context, always visible. */}
        <div className={`hidden grid-cols-[minmax(0,1fr)_90px_100px_110px_90px_90px_90px] gap-3 border-b px-4 py-2.5 lg:grid ${headerBg}`}>
          <SortHeader col="customer" label="Client" />
          <span className={`text-[11px] font-medium uppercase tracking-wide ${labelText}`}>Total Bill</span>
          <SortHeader col="amount" label="Remaining" />
          <span className={`text-[11px] font-medium uppercase tracking-wide ${labelText}`}>Status</span>
          <SortHeader col="due" label="Due" />
          <SortHeader col="sent" label="Sent" />
          <span />
        </div>

        {rows.length === 0 ? (
          <p className={`px-5 py-14 text-center text-[14px] ${subText}`}>No invoices match.</p>
        ) : (
          pagedRows.map((p, i) => {
            const stateDef = STATE_META[p._state as InvoiceState] || STATE_META.draft;
            const meta = isDark ? stateDef.dark : stateDef.light;
            const alreadyReminded = p._remindedToday || remindedIds.has(p.id);
            const canRemind = !isBookkeeperView && p._owed > 0.005 && p._invoiced;
            const phase = phaseLabel(p);
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-4 py-3.5 transition-colors ${rowHover} ${
                  i > 0 ? `border-t ${rowBorder}` : ''
                }`}
              >
                {/* MOBILE */}
                <div className="lg:hidden space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`truncate text-[14px] font-medium ${valueText}`}>{p.customer_name || 'Unnamed'}</p>
                      <p className={`truncate text-[12px] ${labelText}`}>{p.invoice_number || 'No invoice #'}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-[14px] font-semibold tabular-nums ${valueText}`}>
                        {fmtExact(p._owed)}
                        {phase && <span className={`ml-1 text-[10px] font-normal ${labelText}`}>{phase.toLowerCase()}</span>}
                      </p>
                      {p._owed !== p._total && (
                        <p className={`text-[11px] tabular-nums ${subText}`}>of {fmtExact(p._total)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stateDef.dot }} />
                      {stateDef.label}
                    </span>
                    {p._collectedUnsent && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                        {fmtExact(p._collected)} collected, not invoiced
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center justify-between text-[12px] ${labelText}`}>
                    <span>Due <span className={`tabular-nums ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>{fmtDate(p.payment_due_date)}</span></span>
                    <span>Sent <span className={`tabular-nums ${isDark ? 'text-slate-300' : 'text-stone-700'}`}>{fmtDate(p.invoice_sent_at)}</span></span>
                  </div>

                  {canRemind && (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRemindTarget(p);
                      }}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                        alreadyReminded
                          ? (isDark ? 'border-white/10 bg-white/5 text-slate-500' : 'border-stone-200 bg-stone-50 text-stone-400')
                          : (isDark
                              ? 'border-white/10 bg-white/5 text-slate-300 hover:border-teal-500 hover:text-teal-400'
                              : 'border-stone-300 bg-white text-stone-600 hover:border-teal-700 hover:text-teal-800')
                      }`}
                    >
                      <BellRing className="h-3 w-3" />
                      {alreadyReminded ? 'Reminded' : 'Remind'}
                    </span>
                  )}
                </div>

                {/* DESKTOP — 7 columns matching the new header */}
                <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_90px_100px_110px_90px_90px_90px] lg:items-center lg:gap-3">
                  <div className="min-w-0">
                    <p className={`truncate text-[14px] font-medium ${valueText}`}>{p.customer_name || 'Unnamed'}</p>
                    <p className={`truncate text-[12px] ${labelText}`}>{p.invoice_number || 'No invoice #'}</p>
                  </div>
                  <div className={`text-[12px] tabular-nums ${labelText}`}>{fmtExact(p._total)}</div>
                  <div>
                    <div className={`text-[13px] font-semibold tabular-nums ${valueText}`}>{fmtExact(p._owed)}</div>
                    {phase && <div className={`text-[10px] uppercase tracking-wide ${labelText}`}>{phase}</div>}
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      style={{ backgroundColor: meta.bg, color: meta.text }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stateDef.dot }} />
                      {stateDef.label}
                    </span>
                    {p._collectedUnsent && (
                      <p className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
                        {fmtExact(p._collected)} collected, not invoiced
                      </p>
                    )}
                  </div>
                  <div className={`text-[12px] tabular-nums ${labelText}`}>{fmtDate(p.payment_due_date)}</div>
                  <div className={`text-[12px] tabular-nums ${labelText}`}>{fmtDate(p.invoice_sent_at)}</div>
                  <div className="flex justify-end">
                    {canRemind && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemindTarget(p);
                        }}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                          alreadyReminded
                            ? (isDark ? 'border-white/10 bg-white/5 text-slate-500' : 'border-stone-200 bg-stone-50 text-stone-400')
                            : (isDark
                                ? 'border-white/10 bg-white/5 text-slate-300 hover:border-teal-500 hover:text-teal-400'
                                : 'border-stone-300 bg-white text-stone-600 hover:border-teal-700 hover:text-teal-800')
                        }`}
                      >
                        <BellRing className="h-3 w-3" />
                        {alreadyReminded ? 'Reminded' : 'Remind'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className={`text-[12px] tabular-nums ${subText}`}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of{' '}
            {rows.length} invoice{rows.length === 1 ? '' : 's'}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Previous
              </button>
              <span className={`text-[12px] tabular-nums ${labelText}`}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
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
          onClose={() => setBillingLeadId(null)}
        />
      )}

      {remindTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !sending && setRemindTarget(null)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl border p-5 shadow-xl ${cardBase}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className={`text-base font-semibold ${valueText}`}>Send payment reminder</h3>
              <button
                onClick={() => !sending && setRemindTarget(null)}
                className={`rounded-lg p-1 transition-colors ${
                  isDark ? 'text-slate-500 hover:bg-white/10 hover:text-slate-300' : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                }`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className={`mb-4 space-y-2.5 rounded-xl border p-3.5 ${isDark ? 'border-white/10 bg-white/5' : 'border-stone-200 bg-stone-50'}`}>
              <div className="flex items-baseline justify-between gap-3">
                <span className={`text-[12px] ${labelText}`}>To</span>
                <span className={`min-w-0 truncate text-right text-[13px] font-medium ${valueText}`}>{remindTarget.customer_name}</span>
              </div>
              {remindTarget.customer_email && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-[12px] ${labelText}`}>Email</span>
                  <span className={`min-w-0 truncate text-right text-[13px] ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>{remindTarget.customer_email}</span>
                </div>
              )}
              <div className={`flex items-baseline justify-between gap-3 border-t pt-2.5 ${isDark ? 'border-white/10' : 'border-stone-200'}`}>
                <span className={`text-[12px] ${labelText}`}>Amount due</span>
                <span className={`text-[15px] font-semibold tabular-nums ${valueText}`}>{fmtExact(remindTarget._owed)}</span>
              </div>
              {remindTarget._overdue !== null && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className={`text-[12px] ${labelText}`}>Overdue</span>
                  <span className={`text-[13px] font-medium ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                    {remindTarget._overdue} day{remindTarget._overdue === 1 ? '' : 's'}
                  </span>
                </div>
              )}
            </div>
            <p className={`mb-4 text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
              {remindTarget.reminder_sent_at || remindedIds.has(remindTarget.id) ? (
                <>
                  Last reminder sent{' '}
                  <span className={`font-medium ${valueText}`}>
                    {remindedIds.has(remindTarget.id) ? 'just now' : fmtDateLong(remindTarget.reminder_sent_at)}
                  </span>
                  .{' '}
                  {remindTarget._remindedToday || remindedIds.has(remindTarget.id)
                    ? 'Another can be sent tomorrow.'
                    : 'Sending again emails them the outstanding balance with a pay link.'}
                </>
              ) : (
                'This emails them the outstanding balance with a pay link. No reminder has been sent on this job yet.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRemindTarget(null)}
                disabled={sending}
                className={`rounded-lg border py-2.5 text-[13px] font-medium transition-colors disabled:opacity-50 ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={sendReminder}
                disabled={sending || remindTarget._remindedToday || remindedIds.has(remindTarget.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-700 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-teal-800 disabled:opacity-40"
              >
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                {remindTarget._remindedToday || remindedIds.has(remindTarget.id) ? 'Sent today' : 'Send reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}