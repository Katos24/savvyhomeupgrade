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
  accentColor,
}: {
  globalStats: any;
  allLeads: any[];
  isDark: boolean;
  accentColor?: string;
}) {
  const revenue = globalStats?.revenue ?? 0;
  const pending = globalStats?.pending ?? 0;
  const expenses = globalStats?.expenses ?? globalStats?.expenses_this_month ?? 0;

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
    {
      label: 'Expenses',
      value: fmtCompact(expenses),
      sub: 'Project costs',
      tone: 'expenses' as const,
    },
  ];

  // ── LIGHT MODE ──
  if (!isDark) {
    const dotColor = (tone: string) =>
      tone === 'revenue'
        ? '#16a34a'
        : tone === 'pending'
        ? '#b45309'
        : tone === 'expenses'
        ? '#dc2626'
        : null;

    return (
      <section className="mb-6 sm:mb-8 flex flex-wrap md:flex-nowrap rounded-2xl border border-[#e7e2d8] bg-white overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#e7e2d8]">
        {stats.map((s) => {
          const dot = dotColor(s.tone);
          return (
            <div
              key={s.label}
              className="flex-1 min-w-[130px] px-4 sm:px-5 py-4 sm:py-5"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                {dot && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: dot }}
                  />
                )}
                <p className="text-xs sm:text-sm font-medium text-[#292524] truncate">
                  {s.label}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-[#1c1917] tracking-tight tabular-nums truncate">
                {s.value}
              </p>
              <p className="text-xs text-[#a8a29e] mt-1 truncate">{s.sub}</p>
            </div>
          );
        })}
      </section>
    );
  }

  // ── DARK MODE ──
  return (
    <section className="mb-6 sm:mb-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-3 lg:gap-4">
      {stats.map((s) => {
        const isPending = s.tone === 'pending';
        const isRevenue = s.tone === 'revenue';
        const isExpenses = s.tone === 'expenses';

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
                  : isExpenses
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {s.value}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 truncate">{s.sub}</p>
          </div>
        );
      })}
    </section>
  );
}