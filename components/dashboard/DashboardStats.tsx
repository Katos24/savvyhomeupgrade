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

  const stats = [
    {
      label: 'Total Leads',
      value: globalStats?.total_leads ?? allLeads.length,
      tone: 'default' as const,
    },
    {
      label: 'Active Jobs',
      value:
        globalStats?.active_jobs ??
        allLeads.filter((l) => !['completed', 'cancelled', 'lost'].includes(l.status)).length,
      tone: 'default' as const,
    },
    { label: 'Revenue', value: fmtCompact(revenue), tone: 'revenue' as const },
    {
      // Fixed amber, not brand color — same convention used everywhere
      // else in the app for "money owed" (deposit/balance due, overdue
      // reminders). The card shell itself now matches every other stat
      // card exactly — only the value text carries the amber tone, the
      // same way Revenue carries green. No special border, glow, or
      // pulsing indicator anymore; those were what made this card read
      // as broken/cut-off rather than just "money pending."
      label: 'Pending',
      value: fmtCompact(pending),
      tone: pending > 0 ? ('pending' as const) : ('default' as const),
    },
  ];

  return (
    // Responsive grid: 2 columns on mobile, 4 on desktop.
    <section className="mb-6 sm:mb-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:gap-4">
      {stats.map((s) => {
        const isPending = s.tone === 'pending';
        const isRevenue = s.tone === 'revenue';

        return (
          <div
            key={s.label}
            className={`relative overflow-hidden rounded-2xl border p-3 sm:p-4 backdrop-blur-xl transition-all duration-300 hover:shadow-md ${
              isDark
                ? 'bg-[#0A0C14]/60 border-white/5'
                : 'bg-white/80 border-slate-300/80 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 sm:mb-1.5">
              <p
                className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {s.label}
              </p>
            </div>

            <p
              className={`text-lg sm:text-2xl font-bold tracking-tight truncate tabular-nums ${
                isRevenue
                  ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                  : isPending
                    ? isDark ? 'text-amber-400' : 'text-amber-700'
                    : isDark
                      ? 'text-white'
                      : 'text-slate-900'
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