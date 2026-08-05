'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  RefreshCw,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  BellRing,
  Loader2,
  ExternalLink,
  X,
} from 'lucide-react';

type Props = { company: any; projects: any[]; isBookkeeperView?: boolean };

const PERIODS = [
  { label: 'This year', value: 'year' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This month', value: 'month' },
  { label: 'All time', value: 'all' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

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

function filterByPeriod(projects: any[], period: string) {
  if (period === 'all') return projects;
  const now = new Date();
  return projects.filter((p) => {
    const date = new Date(p.created_at);
    if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === 'quarter')
      return Math.floor(date.getMonth() / 3) === Math.floor(now.getMonth() / 3) && date.getFullYear() === now.getFullYear();
    if (period === 'year') return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatCategory(cat: string | null) {
  if (!cat) return 'Uncategorized';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Days past the due date. Null when no date was set or it hasn't passed. */
function daysOverdue(p: any): number | null {
  if (!p.payment_due_date) return null;
  const due = new Date(p.payment_due_date);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

/* Aging buckets are the thing a contractor acts on. "You're owed $14k" is a
   fact; "$6k of it is more than 90 days late" is a decision. */
const BUCKETS = [
  { key: '90', label: '90+ days', color: 'bg-rose-500' },
  { key: '60', label: '60–89 days', color: 'bg-orange-500' },
  { key: '30', label: '30–59 days', color: 'bg-amber-500' },
  { key: '1', label: '1–29 days', color: 'bg-yellow-500' },
  { key: '0', label: 'Not yet due', color: 'bg-teal-600' },
];

function bucketFor(p: any) {
  const d = daysOverdue(p);
  if (d === null) return '0';
  if (d >= 90) return '90';
  if (d >= 60) return '60';
  if (d >= 30) return '30';
  return '1';
}

type SortKey = 'invoice' | 'customer' | 'due' | 'quoted' | 'collected' | 'owed';
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'customer', label: 'Customer' },
  { key: 'due', label: 'Due' },
  { key: 'quoted', label: 'Quoted', align: 'right' },
  { key: 'collected', label: 'Collected', align: 'right' },
  { key: 'owed', label: 'Owed', align: 'right' },
];

const GRID = 'lg:grid-cols-[95px_minmax(0,1fr)_85px_105px_105px_115px_105px_110px]';

export default function FinancialsClient({ company, projects, isBookkeeperView = false }: Props) {
  const router = useRouter();
  const [period, setPeriod] = useState('year');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'owed' | 'paid' | 'all'>('owed');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [remindTarget, setRemindTarget] = useState<any | null>(null);
  // Reminders sent this session, so rows update without a page refresh.
  const [remindedIds, setRemindedIds] = useState<Set<number>>(new Set());

  /* Default is the call list: most overdue first. Invoice number ordering
     looks tidy but tells a contractor nothing about who to phone. */
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const periodFiltered = useMemo(() => filterByPeriod(projects, period), [projects, period]);

  const withMoney = useMemo(
    () =>
      periodFiltered.map((p) => {
        const total = parseFloat(p.quote_total || '0');
        // payment_amount is SUM(payments) including negative refund rows, so
        // it's already net. The old version skipped refunded jobs entirely,
        // which zeroed out real money on a job refunded and then paid again.
        const collected = parseFloat(p.payment_amount || '0');
        const remindedToday =
          p.reminder_sent_at &&
          new Date(p.reminder_sent_at).toDateString() === new Date().toDateString();
        return {
          ...p,
          _total: total,
          _collected: collected,
          _owed: Math.max(total - collected, 0),
          _overdue: daysOverdue(p),
          _bucket: bucketFor(p),
          _invoiced: !!p.invoice_sent_at,
          _remindedToday: !!remindedToday,
        };
      }),
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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Third click clears back to the call-list default rather than
      // trapping you in a sort you didn't want.
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

  const rows = useMemo(() => {
    let list = withMoney;
    if (statusFilter === 'owed') list = list.filter((p) => p._owed > 0.005);
    if (statusFilter === 'paid') list = list.filter((p) => p._owed <= 0.005);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.customer_name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.invoice_number || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (!sortKey) {
      // Most overdue first, then largest balance — the order you'd work it.
      sorted.sort((a, b) => {
        if (statusFilter === 'paid') return b._collected - a._collected;
        const ao = a._overdue ?? -1;
        const bo = b._overdue ?? -1;
        if (ao !== bo) return bo - ao;
        return b._owed - a._owed;
      });
      return sorted;
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'invoice':
          return dir * (a.invoice_number || '').localeCompare(b.invoice_number || '', undefined, { numeric: true });
        case 'customer':
          return dir * (a.customer_name || '').localeCompare(b.customer_name || '');
        case 'due': {
          // Undated jobs sort last either way — a missing date isn't "early".
          const at = a.payment_due_date ? new Date(a.payment_due_date).getTime() : null;
          const bt = b.payment_due_date ? new Date(b.payment_due_date).getTime() : null;
          if (at === null && bt === null) return 0;
          if (at === null) return 1;
          if (bt === null) return -1;
          return dir * (at - bt);
        }
        case 'quoted':
          return dir * (a._total - b._total);
        case 'collected':
          return dir * (a._collected - b._collected);
        case 'owed':
          return dir * (a._owed - b._owed);
        default:
          return 0;
      }
    });
    return sorted;
  }, [withMoney, statusFilter, search, sortKey, sortDir]);

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (period !== 'all') params.set('time', period);
    return `/api/company/${company.slug}/export-csv?${params.toString()}`;
  })();

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

  /** Invoice state and what's owed are different facts — a job nobody has
   *  invoiced isn't late, you just haven't asked yet. */
  const statusChip = (p: any) => {
    if (p._owed <= 0.005) return { label: 'Paid', cls: 'bg-teal-50 text-teal-800 border-teal-200' };
    if (!p._invoiced) return { label: 'Not sent', cls: 'bg-stone-100 text-stone-600 border-stone-200' };
    if (p._overdue !== null && p._overdue >= 60)
      return { label: `${p._overdue}d late`, cls: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (p._overdue !== null)
      return { label: `${p._overdue}d late`, cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (p._collected > 0) return { label: 'Partly paid', cls: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
    return { label: 'Sent', cls: 'bg-white text-stone-600 border-stone-300' };
  };

  const SortHeader = ({ col }: { col: (typeof COLUMNS)[number] }) => {
    const active = sortKey === col.key;
    return (
      <button
        onClick={() => toggleSort(col.key)}
        className={`group inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide transition-colors hover:text-stone-900 ${
          active ? 'text-stone-900' : 'text-stone-500'
        } ${col.align === 'right' ? 'justify-end' : ''}`}
      >
        {col.label}
        {active ? (
          sortDir === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-40" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-stone-900">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#F7F4EF]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            href={isBookkeeperView ? '/bookkeeper/dashboard' : `/${company.slug}/dashboard`}
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            onClick={() => router.refresh()}
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {company.logo_url ? (
            <img src={company.logo_url} alt="" className="h-6 w-auto object-contain" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700 text-[11px] font-bold text-white">
              {company.name?.charAt(0)}
            </div>
          )}
          <span className="text-sm text-stone-400">/</span>
          <span className="text-sm font-medium text-stone-700">Money</span>

          <a
            href={exportHref}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
        {/* ── HERO ── */}
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-stone-500">Owed to you</p>
            <p className="mt-0.5 text-[44px] font-semibold leading-none tracking-tight tabular-nums sm:text-[56px]">
              {fmt(totalOwed)}
            </p>
            <p className="mt-1.5 text-[13px] tabular-nums text-stone-500">
              across {owedJobs.length} job{owedJobs.length === 1 ? '' : 's'}
              {overdueTotal > 0 && (
                <>
                  {' · '}
                  <span className="font-medium text-rose-700">{fmt(overdueTotal)} past due</span>
                </>
              )}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              {PERIODS.find((p) => p.value === period)?.label}
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            </button>
            {periodOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPeriodOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1.5 min-w-40 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg">
                  {PERIODS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPeriod(p.value);
                        setPeriodOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 ${
                        period === p.value ? 'font-semibold text-teal-800' : 'text-stone-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Aging bar */}
        {totalOwed > 0 && (
          <div className="mb-6">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
              {BUCKETS.filter((b) => aging[b.key].amount > 0).map((b) => (
                <div
                  key={b.key}
                  className={b.color}
                  style={{ width: `${(aging[b.key].amount / totalOwed) * 100}%` }}
                  title={`${b.label}: ${fmtExact(aging[b.key].amount)}`}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {BUCKETS.filter((b) => aging[b.key].amount > 0).map((b) => (
                <div key={b.key} className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${b.color}`} />
                  <span className="text-[13px] text-stone-500">{b.label}</span>
                  <span className="text-[13px] font-medium tabular-nums text-stone-900">
                    {fmt(aging[b.key].amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Never asked for is a different problem from not yet paid. */}
        {notInvoicedTotal > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl border border-stone-300 bg-white px-4 py-3">
            <span className="text-[13px] font-medium tabular-nums text-stone-900">
              {fmt(notInvoicedTotal)}
            </span>
            <span className="text-[13px] text-stone-600">
              across {notInvoiced.length} job{notInvoiced.length === 1 ? '' : 's'} hasn&apos;t been invoiced yet.
            </span>
          </div>
        )}

        {/* ── SECONDARY TOTALS ── */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-[12px] text-stone-500">Collected</p>
            <p className="mt-1 text-[22px] font-semibold leading-tight tabular-nums">{fmt(totalCollected)}</p>
            <p className="mt-0.5 text-[12px] text-stone-400">money received</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-[12px] text-stone-500">Quoted</p>
            <p className="mt-1 text-[22px] font-semibold leading-tight tabular-nums">{fmt(totalQuoted)}</p>
            <p className="mt-0.5 text-[12px] text-stone-400">
              {withMoney.length} job{withMoney.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-stone-300 bg-white">
            {([
              ['owed', 'Owed'],
              ['paid', 'Settled'],
              ['all', 'All'],
            ] as const).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={`px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  statusFilter === v ? 'bg-teal-700 text-white' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Customer, invoice, category…"
              className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-stone-400 focus:border-teal-700"
            />
          </div>

          {sortKey && (
            <button
              onClick={() => setSortKey(null)}
              className="text-[12px] font-medium text-stone-500 underline underline-offset-2 hover:text-stone-900"
            >
              Back to most overdue
            </button>
          )}
        </div>

        {/* ── TABLE ──
             Real columns at lg for scanning; labelled cards below, because a
             seven-column table on a phone is unreadable. */}
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          <div
            className={`hidden gap-3 border-b border-stone-200 bg-stone-50/70 px-4 py-2.5 lg:grid ${GRID}`}
          >
            {COLUMNS.map((c) => (
              <div key={c.key} className={c.align === 'right' ? 'text-right' : ''}>
                <SortHeader col={c} />
              </div>
            ))}
            <span className="text-right text-[11px] font-medium uppercase tracking-wide text-stone-500">
              Status
            </span>
            <span />
          </div>

          {rows.length === 0 ? (
            <p className="px-5 py-14 text-center text-[14px] text-stone-400">
              {statusFilter === 'owed' ? 'Nothing outstanding. Everything is settled.' : 'No jobs match.'}
            </p>
          ) : (
            rows.map((p, i) => {
              const chip = statusChip(p);
              const alreadyReminded = p._remindedToday || remindedIds.has(p.id);
              const canRemind = !isBookkeeperView && p._owed > 0.005 && p._invoiced;
              return (
                <div
                  key={p.id}
                  className={`px-4 py-3.5 transition-colors hover:bg-stone-50/60 ${
                    i > 0 ? 'border-t border-stone-100' : ''
                  } lg:grid lg:items-center lg:gap-3 lg:py-2.5 ${GRID}`}
                >
                  <div className="mb-1 lg:mb-0">
                    <span className="text-[13px] tabular-nums text-stone-500">{p.invoice_number || '—'}</span>
                  </div>

                  <div className="min-w-0">
                    {/* Opens in a new tab so the list you were working keeps
                        its filters, sort, and scroll position. */}
                    <Link
                      href={jobHref(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-w-0 items-center gap-1.5 text-[14px] font-medium text-stone-900 hover:text-teal-800"
                    >
                      <span className="truncate">{p.customer_name || 'Unnamed'}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-stone-300 transition-colors group-hover:text-teal-700" />
                    </Link>
                    <p className="truncate text-[12px] text-stone-500">{formatCategory(p.category)}</p>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[13px] tabular-nums text-stone-500 lg:mt-0 lg:block">
                    <span className="text-[12px] text-stone-400 lg:hidden">Due</span>
                    <span>{fmtDate(p.payment_due_date)}</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between lg:mt-0 lg:block lg:text-right">
                    <span className="text-[12px] text-stone-400 lg:hidden">Quoted</span>
                    <span className="text-[13px] tabular-nums text-stone-600">{fmtExact(p._total)}</span>
                  </div>
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[12px] text-stone-400 lg:hidden">Collected</span>
                    <span className="text-[13px] tabular-nums text-teal-800">{fmtExact(p._collected)}</span>
                  </div>
                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-[12px] text-stone-400 lg:hidden">Owed</span>
                    <span className="text-[14px] font-semibold tabular-nums text-stone-900">
                      {fmtExact(p._owed)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 lg:mt-0 lg:justify-end">
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-medium ${chip.cls}`}
                    >
                      {chip.label}
                    </span>
                  </div>

                  <div className="mt-2 lg:mt-0 lg:text-right">
                    {canRemind ? (
                      <button
                        onClick={() => setRemindTarget(p)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                          alreadyReminded
                            ? 'border-stone-200 bg-stone-50 text-stone-400'
                            : 'border-stone-300 bg-white text-stone-600 hover:border-teal-700 hover:text-teal-800'
                        }`}
                      >
                        <BellRing className="h-3 w-3" />
                        {alreadyReminded ? 'Reminded' : 'Remind'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {rows.length > 0 && (
          <p className="mt-3 text-[12px] tabular-nums text-stone-400">
            {rows.length} job{rows.length === 1 ? '' : 's'}
            {statusFilter === 'owed' && totalOwed > 0 && ` · ${fmtExact(totalOwed)} outstanding`}
          </p>
        )}
      </div>

      {/* ── REMINDER MODAL ──
           Sending an email to a customer is not an action to fire from a
           single click in a list. This states who it goes to, for how much,
           and when the last one went out. */}
      {remindTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => !sending && setRemindTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
                <span className="min-w-0 truncate text-right text-[13px] font-medium text-stone-900">
                  {remindTarget.customer_name}
                </span>
              </div>
              {remindTarget.customer_email && (
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-stone-500">Email</span>
                  <span className="min-w-0 truncate text-right text-[13px] text-stone-600">
                    {remindTarget.customer_email}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-stone-200 pt-2.5">
                <span className="text-[12px] text-stone-500">Amount due</span>
                <span className="text-[15px] font-semibold tabular-nums text-stone-900">
                  {fmtExact(remindTarget._owed)}
                </span>
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
                    {remindedIds.has(remindTarget.id)
                      ? 'just now'
                      : fmtDateLong(remindTarget.reminder_sent_at)}
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