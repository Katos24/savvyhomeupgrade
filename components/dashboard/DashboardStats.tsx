'use client';

/** True if the color is so dark that text set in it disappears on a dark background. */
function isColorTooDark(hex: string): boolean {
  let c = hex.trim().replace('#', '');
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;

  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25;
}

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
  accentColor = '#2563eb',
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
      label: 'Leads',
      value: globalStats?.total_leads ?? allLeads.length,
      tone: 'default' as const,
    },
    {
      label: 'Active',
      value:
        globalStats?.active_jobs ??
        allLeads.filter((l) => !['completed', 'cancelled', 'lost'].includes(l.status)).length,
      tone: 'default' as const,
    },
    { label: 'Revenue', value: fmtCompact(revenue), tone: 'revenue' as const },
    {
      label: 'Pending',
      value: fmtCompact(pending),
      tone: pending > 0 ? ('highlight' as const) : ('default' as const),
    },
  ];

  // A near-black accent is invisible on the dark theme, so fall back to white.
  const accent = isDark && isColorTooDark(accentColor) ? '#ffffff' : accentColor;

  const cardBase =
    'relative overflow-hidden rounded-xl border px-3.5 py-2.5 backdrop-blur-md min-w-0 flex-1 lg:flex-none lg:min-w-[150px]';
  const cardTone = isDark
    ? 'bg-[#0A0C14]/60 border-white/5'
    : 'bg-white/80 border-slate-200/80 shadow-xs';
  const cardHighlight = isDark
    ? 'bg-[#0A0C14]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
    : 'bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]';

  return (
    // 2-up on mobile, natural-width row from lg so it doesn't stretch across
    // a wide screen.
    <section className="mb-4 grid w-full grid-cols-2 gap-2 sm:mb-5 sm:gap-2.5 lg:flex lg:w-auto lg:items-center">
      {stats.map((s) => {
        const isHighlight = s.tone === 'highlight';

        return (
          <div
            key={s.label}
            className={`${cardBase} ${isHighlight ? cardHighlight : cardTone}`}
            style={isHighlight ? { borderColor: `${accent}60` } : undefined}
          >
            {isHighlight && (
              <span
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ backgroundColor: accent }}
              />
            )}

            <div className="flex min-w-0 items-center gap-1.5">
              <p
                className={`truncate text-[10px] font-extrabold uppercase tracking-wider ${
                  isHighlight
                    ? isDark ? 'text-white' : 'text-slate-900'
                    : isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {s.label}
              </p>
              {isHighlight && (
                <span
                  className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full"
                  style={{ backgroundColor: accent }}
                />
              )}
            </div>

            <p
              className={`mt-0.5 truncate text-base font-black leading-snug tracking-tight tabular-nums sm:text-lg ${
                s.tone === 'revenue'
                  ? 'text-emerald-500'
                  : isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={isHighlight ? { color: accent } : undefined}
            >
              {s.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}