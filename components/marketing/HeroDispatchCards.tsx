'use client';

import { useMemo } from 'react';
import {
  ChevronRight,
  Camera,
  Check,
  X,
  LayoutGrid,
  Rows3,
  CalendarDays,
  Clock,
  AlertCircle,
  CreditCard,
  FileText,
} from 'lucide-react';
import type { TradeLead } from '@/components/marketing/tradeExamples';

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

export type ViewKey = 'cards' | 'table' | 'calendar';

interface HeroDispatchCardsProps {
  leads: TradeLead[];
  statusOptions: StatusOption[];
  trade: string;
  view: ViewKey;
  isDark?: boolean;
}

// Matches production CardsView.tsx's state model exactly.
type StepState = 'empty' | 'active' | 'success' | 'error' | 'partial';
type Step = { state: StepState; label: string; sublabel?: string };

const STATUS_COLOR_HEX: Record<string, string> = {
  blue: '#60a5fa',
  yellow: '#fde047',
  purple: '#c084fc',
  orange: '#fb923c',
  green: '#4ade80',
  red: '#f87171',
  gray: '#94a3b8',
};

function getTokens(isDark: boolean) {
  return {
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textFaint: isDark ? 'text-slate-500' : 'text-slate-400',
    textFainter: isDark ? 'text-slate-600' : 'text-slate-400',
    cardBg: isDark ? 'bg-white/[0.03]' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-slate-200',
    cardBorderHover: isDark ? 'hover:border-white/20' : 'hover:border-slate-300',
    divider: isDark ? 'border-white/5' : 'border-slate-100',
    chipText: isDark ? 'text-slate-300' : 'text-slate-600',
    wrapperBg: isDark ? 'bg-white/[0.02]' : 'bg-white',
    wrapperBorder: isDark ? 'border-white/10' : 'border-slate-200',
    theadBg: isDark ? 'bg-white/[0.02]' : 'bg-slate-50',
    rowHover: isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/80',
    rowDivider: isDark ? 'divide-white/5' : 'divide-slate-100',
    quoteText: isDark ? 'text-emerald-400' : 'text-emerald-600',
    dayNumMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    dayHeaderMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    segTrack: isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100/80 border-slate-200',
    segPill: isDark ? 'bg-white shadow-xs' : 'bg-white shadow-2xs border border-slate-200/80',
    segTextActive: 'text-slate-900',
    segTextInactive: isDark ? 'text-slate-400' : 'text-slate-500',
  };
}
type Tokens = ReturnType<typeof getTokens>;

function parseFileUrls(raw: string): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStatusConfig(statusValue: string, statusOptions: StatusOption[]) {
  return (
    statusOptions.find((s) => s.value === statusValue) ||
    statusOptions[0] || { label: 'New', value: 'new', color: 'blue' }
  );
}

// ── Step resolution — mirrors production CardsView.tsx logic exactly
// (same field names, same state names), minus the Stripe-verified sublabel
// on Invoice since these are mock leads with no real Stripe data behind them.
function getQuoteStep(lead: any): Step {
  if (lead.project_quote_accepted_at || lead.quote_accepted_at) {
    return { state: 'success', label: 'Accepted' };
  }
  if (lead.project_quote_declined_at || lead.quote_declined_at) {
    return { state: 'error', label: 'Declined' };
  }
  if (lead.project_quote_sent_at || lead.quote_sent_at) {
    return { state: 'active', label: 'Sent' };
  }
  return { state: 'empty', label: 'Not sent' };
}

function getScheduleStep(lead: any): Step {
  if (!lead.scheduled_date) return { state: 'empty', label: 'Not set' };

  const raw = lead.scheduled_date.split('T')[0];
  const dateDisplay = new Date(raw.replace(/-/g, '/')).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  let timeDisplay: string | undefined;
  if (lead.scheduled_time) {
    const timeSource = lead.scheduled_time.includes('T')
      ? lead.scheduled_time
      : `${raw}T${lead.scheduled_time}`;
    const parsed = new Date(timeSource);
    if (!isNaN(parsed.getTime())) {
      timeDisplay = parsed.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }

  return { state: 'active', label: dateDisplay, sublabel: timeDisplay };
}

function getInvoiceStep(lead: any): Step {
  if (lead.payment_status === 'paid') {
    return { state: 'success', label: 'Paid' };
  }
  if (lead.payment_status === 'partial') {
    return { state: 'partial', label: 'Partial' };
  }
  if (lead.payment_status === 'refunded' || lead.payment_status === 'partially_refunded') {
    return { state: 'error', label: 'Refunded' };
  }
  if (lead.invoice_status === 'sent' || lead.invoice_sent_at) {
    return { state: 'active', label: 'Sent' };
  }
  return { state: 'empty', label: 'Not sent' };
}

// Same badge matrix as production CardsView.tsx
const badgeStyles: Record<
  StepState,
  { dark: string; light: string; icon: React.ComponentType<{ className?: string }> }
> = {
  empty: {
    dark: 'bg-white/5 text-slate-400 border-white/10',
    light: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: Clock,
  },
  active: {
    dark: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    light: 'bg-blue-50 text-blue-600 border-blue-200',
    icon: Clock,
  },
  success: {
    dark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Check,
  },
  error: {
    dark: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    light: 'bg-rose-50 text-rose-600 border-rose-200',
    icon: X,
  },
  partial: {
    dark: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle,
  },
};

// Compact version of production's unified tracker — same visual language
// (icon badges for Estimate/Invoice, plain bold text for Schedule),
// scaled down to fit this smaller marketing card grid.
function ProgressTracker({ lead, isDark }: { lead: TradeLead; isDark: boolean }) {
  const quote = getQuoteStep(lead);
  const schedule = getScheduleStep(lead);
  const invoice = getInvoiceStep(lead);

  const rows = [
    { key: 'quote', label: 'Estimate', icon: FileText, step: quote, isPlain: false },
    { key: 'schedule', label: 'Schedule', icon: CalendarDays, step: schedule, isPlain: true },
    { key: 'invoice', label: 'Invoice', icon: CreditCard, step: invoice, isPlain: false },
  ];

  return (
    <div
      className={`w-full rounded-lg border overflow-hidden ${
        isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200/80 bg-slate-50/50'
      }`}
    >
      {rows.map((r, i) => {
        const style = badgeStyles[r.step.state];
        const StateIcon = style.icon;

        return (
          <div
            key={r.key}
            className={`flex items-center justify-between gap-1.5 px-2 py-1 ${
              i !== rows.length - 1
                ? isDark
                  ? 'border-b border-white/5'
                  : 'border-b border-slate-200/60'
                : ''
            }`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <r.icon className={`w-2.5 h-2.5 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <span className={`font-bold text-[8px] uppercase truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {r.label}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {r.step.sublabel && (
                <span className={`text-[8px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {r.step.sublabel}
                </span>
              )}

              {r.isPlain ? (
                <span
                  className={`text-[9px] font-extrabold ${
                    r.step.state === 'empty'
                      ? isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {r.step.label}
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-wide ${
                    style[isDark ? 'dark' : 'light']
                  }`}
                >
                  <StateIcon className="w-2 h-2 stroke-[3]" />
                  {r.step.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CardsGrid({
  leads,
  statusOptions,
  tokens,
  isDark,
}: {
  leads: TradeLead[];
  statusOptions: StatusOption[];
  tokens: Tokens;
  isDark: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status, statusOptions);
        const statusHex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
        const fileUrls = parseFileUrls(lead.file_urls);
        const hasPhotos = fileUrls.length > 0;
        const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : 0;

        return (
          <div
            key={lead.id}
            className={`w-full border rounded-xl p-3 transition-all ${tokens.cardBg} ${tokens.cardBorder} ${tokens.cardBorderHover}`}
          >
            {/* Top row: Status & Quote */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: statusHex }} />
                <span className={`text-[10px] font-bold ${tokens.chipText}`}>{statusConfig.label}</span>
              </div>
              {quoteTotal > 0 && (
                <span className={`text-[11px] font-extrabold ${tokens.quoteText}`}>
                  ${quoteTotal.toLocaleString()}
                </span>
              )}
            </div>

            {/* Name */}
            <div className="mb-2 flex items-center justify-between">
              <h3 className={`text-xs font-bold leading-tight truncate ${tokens.textPrimary}`}>{lead.name}</h3>
              {hasPhotos && (
                <span className="flex items-center gap-0.5 text-[8px] font-semibold text-pink-400">
                  <Camera className="w-2.5 h-2.5" /> {fileUrls.length}
                </span>
              )}
            </div>

            {/* Progress Tracker */}
            <ProgressTracker lead={lead} isDark={isDark} />
          </div>
        );
      })}
    </div>
  );
}

function TablePreview({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${tokens.wrapperBg} ${tokens.wrapperBorder}`}>
      <table className="w-full">
        <thead>
          <tr className={`border-b ${tokens.divider} ${tokens.theadBg}`}>
            <th className={`px-2.5 py-1.5 text-left text-[8px] font-black uppercase ${tokens.textFainter}`}>Customer</th>
            <th className={`px-2.5 py-1.5 text-left text-[8px] font-black uppercase ${tokens.textFainter}`}>Status</th>
            <th className={`px-2.5 py-1.5 text-left text-[8px] font-black uppercase ${tokens.textFainter}`}>Quote</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${tokens.rowDivider}`}>
          {leads.map((lead) => {
            const statusConfig = getStatusConfig(lead.status, statusOptions);
            const statusHex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
            const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : 0;

            return (
              <tr key={lead.id} className={tokens.rowHover}>
                <td className="px-2.5 py-1.5">
                  <div className={`text-[11px] font-bold truncate ${tokens.textPrimary}`}>{lead.name}</div>
                </td>
                <td className="px-2.5 py-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold text-white" style={{ backgroundColor: statusHex }}>
                    {statusConfig.label}
                  </span>
                </td>
                <td className={`px-2.5 py-1.5 text-[10px] font-extrabold ${tokens.quoteText}`}>
                  {quoteTotal > 0 ? `$${quoteTotal.toLocaleString()}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CalendarPreview({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  const referenceDate = useMemo(() => new Date(), []);
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className={`rounded-xl border overflow-hidden ${tokens.wrapperBg} ${tokens.wrapperBorder}`}>
      <div className={`grid grid-cols-7 border-b ${tokens.divider}`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className={`py-1 text-center text-[8px] font-black ${tokens.dayHeaderMuted}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`h-8 border-r border-b ${tokens.divider}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => (
          <div key={i + 1} className={`h-8 border-r border-b ${tokens.divider} p-0.5 flex flex-col items-center justify-start`}>
            <span className={`text-[8px] font-bold ${tokens.dayNumMuted}`}>{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VIEW_SEQUENCE: ViewKey[] = ['cards', 'table', 'calendar'];
const VIEW_META: Record<ViewKey, { label: string; icon: typeof LayoutGrid }> = {
  cards: { label: 'Cards', icon: LayoutGrid },
  table: { label: 'Table', icon: Rows3 },
  calendar: { label: 'Calendar', icon: CalendarDays },
};

export function DispatchViewSwitcher({
  view,
  onChange,
  isDark = true,
}: {
  view: ViewKey;
  onChange: (view: ViewKey) => void;
  isDark?: boolean;
}) {
  const tokens = getTokens(isDark);
  const activeIndex = VIEW_SEQUENCE.indexOf(view);

  return (
    <div className={`relative grid grid-cols-3 rounded-lg border p-0.5 w-full max-w-[180px] ${tokens.segTrack}`}>
      <div
        className={`absolute top-0.5 bottom-0.5 left-0.5 rounded-md transition-all duration-150 ease-out ${tokens.segPill}`}
        style={{
          width: 'calc(33.333% - 3px)',
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {VIEW_SEQUENCE.map((key) => {
        const meta = VIEW_META[key];
        const isActive = key === view;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative z-10 flex items-center justify-center gap-1 py-1 rounded-md text-[9px] font-bold uppercase transition-colors cursor-pointer ${
              isActive ? tokens.segTextActive : tokens.segTextInactive
            }`}
          >
            <meta.icon className="w-2.5 h-2.5 shrink-0" />
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function HeroDispatchCards({ leads, statusOptions, view, isDark = true }: HeroDispatchCardsProps) {
  const tokens = getTokens(isDark);

  return (
    <>
      {view === 'cards' && <CardsGrid leads={leads} statusOptions={statusOptions} tokens={tokens} isDark={isDark} />}
      {view === 'table' && <TablePreview leads={leads} statusOptions={statusOptions} tokens={tokens} />}
      {view === 'calendar' && <CalendarPreview leads={leads} statusOptions={statusOptions} tokens={tokens} />}
    </>
  );
}