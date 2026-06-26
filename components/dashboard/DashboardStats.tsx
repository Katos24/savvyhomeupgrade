'use client';

export default function DashboardStats({ globalStats, allLeads, isDark }: {
  globalStats: any;
  allLeads: any[];
  isDark: boolean;
}) {
  const fmtCompact = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const leadsCount = globalStats?.total_leads ?? allLeads.length;
  const activeCount = globalStats?.active_jobs ?? allLeads.filter(l => !['completed', 'cancelled', 'lost'].includes(l.status)).length;
  const revenue = globalStats?.revenue ?? 0;
  const pending = globalStats?.pending ?? 0;

  const stats = [
    { label: 'Leads', value: leadsCount, accent: false },
    { label: 'Active', value: activeCount, accent: false },
    { label: 'Revenue', value: fmtCompact(revenue), accent: false },
    { label: 'Pending', value: fmtCompact(pending), accent: pending > 0 },
  ];

  return (
    <section className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-5 w-full">
      {stats.map((s, i) => (
       <div
  key={i}
  className={`rounded-lg px-2.5 py-2 sm:px-3.5 sm:py-2.5 transition-all min-w-0 ${
    isDark
      ? `bg-white/[0.025] border ${s.accent ? 'border-amber-500/20' : 'border-white/[0.06]'}`
      : `bg-white border ${s.accent ? 'border-amber-300' : 'border-slate-300'} shadow-[0_1px_4px_rgba(0,0,0,0.04)]`
  }`}
>
          <div className="flex items-center justify-between gap-1">
            <p className={`text-[8px] sm:text-[10px] font-medium truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {s.label}
            </p>
            {s.accent && <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />}
          </div>
          <p
            className={`font-bold tracking-tight tabular-nums leading-tight truncate ${
              s.accent
                ? (isDark ? 'text-amber-300' : 'text-amber-600')
                : (isDark ? 'text-white' : 'text-slate-900')
            }`}
            style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1.375rem)' }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </section>
  );
}