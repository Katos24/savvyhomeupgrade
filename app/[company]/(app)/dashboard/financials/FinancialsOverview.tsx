'use client';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);
const fmtExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
const fmtDateLong = (d: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type Props = {
  totalOwed: number;
  totalCollected: number;
  totalQuoted: number;
  overdueTotal: number;
  owedJobsCount: number;
  jobsCount: number;
  aging: Record<string, { amount: number; count: number }>;
  notInvoicedTotal: number;
  notInvoicedCount: number;
  recentPayments: any[];
};

const BUCKET_META = [
  { key: '90', label: '90+ days', color: 'bg-rose-500' },
  { key: '60', label: '60–89 days', color: 'bg-orange-500' },
  { key: '30', label: '30–59 days', color: 'bg-amber-500' },
  { key: '1', label: '1–29 days', color: 'bg-yellow-500' },
  { key: '0', label: 'Not yet due', color: 'bg-teal-600' },
];

export default function FinancialsOverview({
  totalOwed,
  totalCollected,
  totalQuoted,
  overdueTotal,
  owedJobsCount,
  jobsCount,
  aging,
  notInvoicedTotal,
  notInvoicedCount,
  recentPayments,
}: Props) {
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-[12px] text-stone-500">Collected</p>
          <p className="mt-1 text-[22px] font-semibold leading-tight tabular-nums">{fmt(totalCollected)}</p>
          <p className="mt-0.5 text-[12px] text-stone-400">money received</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-[12px] text-stone-500">Owed to you</p>
          <p className="mt-1 text-[22px] font-semibold leading-tight tabular-nums">{fmt(totalOwed)}</p>
          <p className="mt-0.5 text-[12px] text-stone-400">
            {owedJobsCount} job{owedJobsCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-[12px] text-stone-500">Past due</p>
          <p className={`mt-1 text-[22px] font-semibold leading-tight tabular-nums ${overdueTotal > 0 ? 'text-rose-700' : ''}`}>
            {fmt(overdueTotal)}
          </p>
          <p className="mt-0.5 text-[12px] text-stone-400">{overdueTotal > 0 ? 'needs a nudge' : 'nothing overdue'}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="text-[12px] text-stone-500">Quoted</p>
          <p className="mt-1 text-[22px] font-semibold leading-tight tabular-nums">{fmt(totalQuoted)}</p>
          <p className="mt-0.5 text-[12px] text-stone-400">
            {jobsCount} job{jobsCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      {totalOwed > 0 && (
        <div className="mb-6 rounded-xl border border-stone-200 bg-white p-4">
          <p className="mb-3 text-[13px] font-medium text-stone-700">Aging</p>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
            {BUCKET_META.filter((b) => aging[b.key].amount > 0).map((b) => (
              <div
                key={b.key}
                className={b.color}
                style={{ width: `${(aging[b.key].amount / totalOwed) * 100}%` }}
                title={`${b.label}: ${fmtExact(aging[b.key].amount)}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {BUCKET_META.filter((b) => aging[b.key].amount > 0).map((b) => (
              <div key={b.key} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${b.color}`} />
                <span className="text-[13px] text-stone-500">{b.label}</span>
                <span className="text-[13px] font-medium tabular-nums text-stone-900">{fmt(aging[b.key].amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notInvoicedTotal > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl border border-stone-300 bg-white px-4 py-3">
          <span className="text-[13px] font-medium tabular-nums text-stone-900">{fmt(notInvoicedTotal)}</span>
          <span className="text-[13px] text-stone-600">
            across {notInvoicedCount} job{notInvoicedCount === 1 ? '' : 's'} hasn&apos;t been invoiced yet.
          </span>
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white">
        <p className="border-b border-stone-100 px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-stone-500">
          Recent payments
        </p>
        {recentPayments.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-stone-400">Nothing collected yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-stone-900">{p.customer_name || 'Unnamed'}</p>
                  <p className="text-[12px] text-stone-400">{fmtDateLong(p.payment_date)}</p>
                </div>
                <span className="shrink-0 text-[13px] font-semibold tabular-nums text-teal-800">{fmtExact(p._collected)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}