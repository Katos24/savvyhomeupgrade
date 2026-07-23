'use client';

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
  const fmtCompact = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const leadsCount = globalStats?.total_leads ?? allLeads.length;
  const activeCount =
    globalStats?.active_jobs ??
    allLeads.filter((l) => !['completed', 'cancelled', 'lost'].includes(l.status)).length;
  const revenue = globalStats?.revenue ?? 0;
  const pending = globalStats?.pending ?? 0;

  // Check if hex is too dark to render text over a dark mode background
  const isColorTooDark = (hex: string): boolean => {
    let c = hex.trim().replace('#', '');
    if (c.length === 3) {
      c = c.split('').map((ch) => ch + ch).join('');
    }
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return false;
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma < 0.25; // Returns true if color is black or very dark
  };

  const colorIsDark = isColorTooDark(accentColor);

  // Safe fallback color logic
  const getHighlightTextColor = () => {
    if (isDark && colorIsDark) return '#ffffff'; // Fallback to white text on dark mode if accent is black
    if (!isDark && !colorIsDark) return accentColor;
    return accentColor;
  };

  const getHighlightAccentBg = () => {
    if (isDark && colorIsDark) return '#ffffff'; // Top bar & dot fallback in dark mode
    return accentColor;
  };

  const highlightTextColor = getHighlightTextColor();
  const highlightAccentBg = getHighlightAccentBg();

  const stats = [
    { label: 'LEADS', value: leadsCount, highlight: false, isRevenue: false },
    { label: 'ACTIVE', value: activeCount, highlight: false, isRevenue: false },
    { label: 'REVENUE', value: fmtCompact(revenue), highlight: false, isRevenue: true },
    { label: 'PENDING', value: fmtCompact(pending), highlight: pending > 0, isRevenue: false },
  ];

  return (
    <section className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 w-full">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all backdrop-blur-md min-w-0 border ${
            s.highlight
              ? isDark
                ? 'bg-[#0A0C14]/80 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                : 'bg-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
              : isDark
              ? 'bg-[#0A0C14]/60 border-white/5'
              : 'bg-white/80 border-slate-200/80 shadow-xs'
          }`}
          style={{
            borderColor: s.highlight ? `${highlightAccentBg}60` : undefined,
          }}
        >
          {/* Subtle Top Accent Bar for Pending/Highlighted Card */}
          {s.highlight && (
            <div
              className="absolute top-0 inset-x-0 h-0.5"
              style={{ backgroundColor: highlightAccentBg }}
            />
          )}

          <div className="flex items-center justify-between gap-1 mb-1">
            <p
              className={`text-[10px] font-extrabold uppercase tracking-wider truncate ${
                s.highlight
                  ? isDark
                    ? 'text-white'
                    : 'text-slate-900'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {s.label}
            </p>

            {s.highlight && (
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
                style={{ backgroundColor: highlightAccentBg }}
              />
            )}
          </div>

          <p
            className={`font-black tracking-tight tabular-nums leading-none truncate ${
              s.isRevenue
                ? 'text-emerald-500'
                : isDark
                ? 'text-white'
                : 'text-slate-900'
            }`}
            style={{
              fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
              color: s.highlight ? highlightTextColor : undefined,
            }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </section>
  );
}