'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Search, ChevronDown, ChevronUp, BellRing, Loader2, X, ExternalLink } from 'lucide-react';
import InvoiceDetailDrawer from './InvoiceDetailDrawer';
import type { InvoiceState } from './FinancialsClient';
import BillingOverlay from './BillingOverlay';

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

// Same bright-dot + darker-text badge convention used in TableView and
// DashboardStats elsewhere in the app, for visual consistency.
const STATE_META: Record<InvoiceState, { label: string; dot: string; text: string; bg: string }> = {
  draft:    { label: 'Draft',    dot: '#a8a29e', text: '#57534e', bg: '#a8a29e18' },
  sent:     { label: 'Sent',     dot: '#3b82f6', text: '#1d4ed8', bg: '#3b82f618' },
  overdue:  { label: 'Overdue',  dot: '#ef4444', text: '#b91c1c', bg: '#ef444418' },
  partial:  { label: 'Partial',  dot: '#eab308', text: '#a16207', bg: '#eab30818' },
  paid:     { label: 'Paid',     dot: '#22c55e', text: '#15803d', bg: '#22c55e18' },
  refunded: { label: 'Refunded', dot: '#f97316', text: '#c2410c', bg: '#f9731618' },
};

const FILTERS: { key: InvoiceState | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'partial', label: 'Partial' },
  { key: 'paid', label: 'Paid' },
  { key: 'refunded', label: 'Refunded' },
];

type SortKey = 'customer' | 'amount' | 'due' | 'sent';

export default function InvoicesList({
  company,
  withMoney,
  isBookkeeperView,
}: {
  company: any;
  withMoney: any[];
  isBookkeeperView: boolean;
}) {
  const [filter, setFilter] = useState<InvoiceState | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
   const [selected, setSelected] = useState<any | null>(null);
  const [billingLeadId, setBillingLeadId] = useState<number | null>(null);
  const [remindTarget, setRemindTarget] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: withMoney.length };
    for (const p of withMoney) c[p._state] = (c[p._state] || 0) + 1;
    return c;
  }, [withMoney]);

  const rows = useMemo(() => {
    let list = withMoney;
    if (filter !== 'all') list = list.filter((p) => p._state === filter);
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
          return dir * (a._total - b._total);
        case 'due': {
          const at = a.payment_due_date ? new Date(a.payment_due_date).getTime() : null;
          const bt = b.payment_due_date ? new Date(b.payment_due_date).getTime() : null;
          if (at === null && bt === null) return 0;
          if (at === null) return 1;
          if (bt === null) return -1;
          return dir * (at - bt);
        }
        case 'sent': {
          const at = a.invoice_sent_at ? new Date(a.invoice_sent_at).getTime() : null;
          const bt = b.invoice_sent_at ? new Date(b.invoice_sent_at).getTime() : null;
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

  const jobHref = (p: any) =>
    isBookkeeperView ? '#' : `/${company.slug}/dashboard?lead=${p.lead_id || p.id}`;

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
        className={`group inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors hover:text-stone-900 ${
          active ? 'text-stone-900' : 'text-stone-500'
        }`}
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

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
              filter === f.key ? 'bg-stone-900 text-white' : 'border border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {f.label}
            {counts[f.key] ? <span className="ml-1 opacity-60">{counts[f.key]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Client or invoice number..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-stone-400 focus:border-teal-700"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="hidden grid-cols-[minmax(0,1fr)_100px_110px_90px_90px_90px] gap-3 border-b border-stone-200 bg-stone-50/70 px-4 py-2.5 lg:grid">
          <SortHeader col="customer" label="Client" />
          <SortHeader col="amount" label="Amount" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-stone-500">Status</span>
          <SortHeader col="due" label="Due" />
          <SortHeader col="sent" label="Sent" />
          <span />
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-14 text-center text-[14px] text-stone-400">No invoices match.</p>
        ) : (
          rows.map((p, i) => {
            const meta = STATE_META[p._state as InvoiceState];
            const alreadyReminded = p._remindedToday || remindedIds.has(p.id);
            const canRemind = !isBookkeeperView && p._owed > 0.005 && p._invoiced;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`grid w-full grid-cols-2 gap-2 px-4 py-3.5 text-left transition-colors hover:bg-stone-50/60 lg:grid-cols-[minmax(0,1fr)_100px_110px_90px_90px_90px] lg:items-center lg:gap-3 lg:py-2.5 ${
                  i > 0 ? 'border-t border-stone-100' : ''
                }`}
              >
                <div className="col-span-2 min-w-0 lg:col-span-1">
                  <p className="truncate text-[14px] font-medium text-stone-900">{p.customer_name || 'Unnamed'}</p>
                  <p className="truncate text-[12px] text-stone-500">{p.invoice_number || 'No invoice #'}</p>
                </div>
                <div className="text-[13px] font-semibold tabular-nums text-stone-900">{fmtExact(p._total)}</div>
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{ backgroundColor: meta.bg, color: meta.text }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                    {meta.label}
                  </span>
                </div>
                <div className="text-[12px] tabular-nums text-stone-500">{fmtDate(p.payment_due_date)}</div>
                <div className="text-[12px] tabular-nums text-stone-500">{fmtDate(p.invoice_sent_at)}</div>
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
                          ? 'border-stone-200 bg-stone-50 text-stone-400'
                          : 'border-stone-300 bg-white text-stone-600 hover:border-teal-700 hover:text-teal-800'
                      }`}
                    >
                      <BellRing className="h-3 w-3" />
                      {alreadyReminded ? 'Reminded' : 'Remind'}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {rows.length > 0 && (
        <p className="mt-3 text-[12px] tabular-nums text-stone-400">
          {rows.length} invoice{rows.length === 1 ? '' : 's'}
        </p>
      )}

            {selected && (
        <InvoiceDetailDrawer
          project={selected}
          stateMeta={STATE_META[selected._state as InvoiceState]}
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
      {/* Reminder modal — unchanged from before */}
      {remindTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !sending && setRemindTarget(null)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-stone-900">Send payment reminder</h3>
              <button
                onClick={() => !sending && setRemindTarget(null)}
                className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 space-y-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[12px] text-stone-500">To</span>
                <span className="min-w-0 truncate text-right text-[13px] font-medium text-stone-900">{remindTarget.customer_name}</span>
              </div>
              {remindTarget.customer_email && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-stone-500">Email</span>
                  <span className="min-w-0 truncate text-right text-[13px] text-stone-600">{remindTarget.customer_email}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-stone-200 pt-2.5">
                <span className="text-[12px] text-stone-500">Amount due</span>
                <span className="text-[15px] font-semibold tabular-nums text-stone-900">{fmtExact(remindTarget._owed)}</span>
              </div>
              {remindTarget._overdue !== null && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-stone-500">Overdue</span>
                  <span className="text-[13px] font-medium text-rose-700">
                    {remindTarget._overdue} day{remindTarget._overdue === 1 ? '' : 's'}
                  </span>
                </div>
              )}
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-stone-600">
              {remindTarget.reminder_sent_at || remindedIds.has(remindTarget.id) ? (
                <>
                  Last reminder sent{' '}
                  <span className="font-medium text-stone-900">
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
                className="rounded-lg border border-stone-300 bg-white py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
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