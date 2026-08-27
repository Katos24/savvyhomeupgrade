'use client';

const fmtCompact = (n: number) =>
new Intl.NumberFormat('en-US', {
style: 'currency',
currency: 'USD',
notation: 'compact',
maximumFractionDigits: 0,
  }).format(n);

export default function DashboardStats({
globalStats,
allLeads,
isDark,
// Accepted but deliberately unused — the highlight/pending card used to
// be styled from this, which was the root cause of the contrast bug.
// Kept in the signature so this call site doesn't need to change; safe
// to delete from the caller whenever convenient.
accentColor,
}: {
globalStats: any;
allLeads: any[];
isDark: boolean;
accentColor?: string;
}) {
const revenue = globalStats?.revenue ?? 0;
const pending = globalStats?.pending ?? 0;

const totalLeads = globalStats?.total_leads ?? allLeads.length;
const activeJobs =
  globalStats?.active_jobs ??
  allLeads.filter((l) => !['completed', 'cancelled', 'lost'].includes(l.status)).length;

const stats = [
    {
label: 'Total Leads',
value: totalLeads,
sub: 'All time',
tone: 'default' as const,
    },
    {
label: 'Active Jobs',
value: activeJobs,
sub: 'In progress',
tone: 'default' as const,
    },
    {
      label: 'Revenue',
      value: fmtCompact(revenue),
      sub: 'Total collected',
      tone: 'revenue' as const,
    },
    {
label: 'Pending',
value: fmtCompact(pending),
sub: pending > 0 ? 'Outstanding' : 'Nothing owed',
tone: pending > 0 ? ('pending' as const) : ('default' as const),
    },
  ];

// ── LIGHT MODE — Terrascape-style: one continuous bordered strip,
// internal dividers instead of gapped cards, plain dark numbers, a small
// colored dot (not colored text) as the only attention signal. Matches
// the same joined-strip pattern already used for the Outbox stats row
// elsewhere in this app. ──
if (!isDark) {
  const dotColor = (tone: string) =>
    tone === 'revenue' ? '#16a34a' : tone === 'pending' ? '#b45309' : null;

  return (
    <section className="mb-6 sm:mb-8 flex rounded-2xl border border-[#e7e2d8] bg-white overflow-hidden">
      {stats.map((s, i) => {
        const dot = dotColor(s.tone);
        return (
          <div
            key={s.label}
            className={`flex-1 px-4 sm:px-6 py-4 sm:py-5 min-w-0 ${i > 0 ? 'border-l border-[#e7e2d8]' : ''}`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
              <p className="text-sm font-medium text-[#292524] truncate">{s.label}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-[#1c1917] tracking-tight tabular-nums truncate">
              {s.value}
            </p>
            <p className="text-xs text-[#a8a29e] mt-1 truncate">{s.sub}</p>
          </div>
        );
      })}
    </section>
  );
}

// ── DARK MODE — unchanged from before ──
return (
<section className="mb-6 sm:mb-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:gap-4">
{stats.map((s) => {
const isPending = s.tone === 'pending';
const isRevenue = s.tone === 'revenue';

return (
<div
key={s.label}
className="relative overflow-hidden rounded-2xl border p-3 sm:p-4 backdrop-blur-xl transition-all duration-300 hover:shadow-md bg-[#0A0C14]/60 border-white/5"
>
<div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
<p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate text-slate-400">
{s.label}
</p>
</div>

<p
className={`text-lg sm:text-2xl font-bold tracking-tight truncate tabular-nums ${
isRevenue
                  ? 'text-emerald-400'
                  : isPending
                    ? 'text-amber-400'
                    : 'text-white'
}`}
>
{s.value}
</p>
</div>
        );
      })}
</section>
  );
}