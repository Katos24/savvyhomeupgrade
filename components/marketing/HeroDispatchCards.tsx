'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronRight, User, Camera, Check, X, LayoutGrid, Rows3, CalendarDays } from 'lucide-react';
import type { TradeLead } from '@/components/marketing/tradeExamples';

// ==========================================
// Standalone hero preview — Cards / Table / Calendar, auto-cycling, with
// light/dark support driven by the parent (see `isDark` prop).
//
// Deliberately does NOT import the internal dashboard's CardsView,
// TableView, CalendarView, getTheme, safeJSONParse, or isStripeVerified —
// those are dashboard internals (and in TableView/CalendarView's case,
// depend on @/lib/theme, @/lib/utils, and sonner toasts wired to real
// bulk-update/delete endpoints) that can change shape at any time. The
// marketing hero should never depend on them or on DOM-scraping tricks
// to force a layout.
//
// Typed directly against TradeLead (from tradeExamples.ts). Note what
// TradeLead does NOT have, compared to the internal dashboard's lead shape:
// no quote_accepted_at / quote_declined_at, no invoice_status /
// invoice_sent_at, and — as far as this file has confirmed — no phone,
// email, city, zip_code, lead_source, or custom_answers either. So the
// "quote" step here can only ever be pending/sent (never accepted/
// declined), the "invoice" step is derived from payment_status alone, and
// the Table/Calendar previews below only surface fields already proven to
// exist elsewhere in this file. If tradeExamples.ts gains more fields
// later, extend these views accordingly rather than assuming.
// ==========================================

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface HeroDispatchCardsProps {
  leads: TradeLead[];
  statusOptions: StatusOption[];
  /** Which trade is currently shown — used to pin a consistent view per trade. */
  trade: string;
  /** Drives light/dark styling for this preview. Defaults to dark to match prior behavior. */
  isDark?: boolean;
}

type StepState = 'pending' | 'active' | 'partial' | 'done' | 'problem';
type Step = { state: StepState; label: string };
type ViewKey = 'cards' | 'table' | 'calendar';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const STATUS_COLOR_HEX: Record<string, string> = {
  blue: '#60a5fa',
  yellow: '#fde047',
  purple: '#c084fc',
  orange: '#fb923c',
  green: '#4ade80',
  red: '#f87171',
  gray: '#94a3b8',
  indigo: '#818cf8',
  pink: '#f472b6',
};

// ------------------------------------------
// Theme tokens — every color-sensitive class used across the three views
// lives here, keyed off isDark. Saturated status colors (blue-500,
// emerald-500, etc.) are left as-is since they read fine on both light
// and dark surfaces; only neutrals (text, borders, panel backgrounds)
// switch.
// ------------------------------------------
function getTokens(isDark: boolean) {
  return {
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textFaint: isDark ? 'text-slate-500' : 'text-slate-400',
    textFainter: isDark ? 'text-slate-600' : 'text-slate-400',
    cardBg: isDark ? 'bg-white/[0.05]' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-slate-200',
    cardBorderHover: isDark ? 'hover:border-white/20' : 'hover:border-slate-300',
    cardShadow: isDark ? '' : 'shadow-sm',
    panelBg: isDark ? 'bg-white/5' : 'bg-slate-50',
    panelBorder: isDark ? 'border-white/10' : 'border-slate-200',
    divider: isDark ? 'border-white/5' : 'border-slate-100',
    chipBg: isDark ? 'bg-slate-700' : 'bg-slate-100',
    chipBorder: isDark ? 'border-white/10' : 'border-slate-200',
    chipText: isDark ? 'text-slate-300' : 'text-slate-600',
    wrapperBg: isDark ? 'bg-white/[0.02]' : 'bg-white',
    wrapperBorder: isDark ? 'border-white/10' : 'border-slate-200',
    theadBg: isDark ? 'bg-white/[0.03]' : 'bg-slate-50',
    rowHover: isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50',
    rowDivider: isDark ? 'divide-white/5' : 'divide-slate-100',
    quoteText: isDark ? 'text-emerald-400' : 'text-emerald-600',
    reviewHover: isDark ? 'group-hover:bg-white' : 'group-hover:bg-slate-900 group-hover:text-white',
    dotPending: isDark ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-300',
    emptyCellBg: isDark ? 'bg-white/[0.01]' : 'bg-slate-50/60',
    dayNumMuted: isDark ? 'text-slate-500' : 'text-slate-400',
    dayHeaderMuted: isDark ? 'text-slate-600' : 'text-slate-400',
    indicatorBg: isDark
      ? 'bg-white/[0.03] border-white/10 text-slate-300'
      : 'bg-slate-100 border-slate-200 text-slate-600',
  };
}
type Tokens = ReturnType<typeof getTokens>;

// file_urls comes in as a JSON-stringified array (see tradeExamples.ts,
// e.g. JSON.stringify([{ url, name, type }]) or JSON.stringify([])).
// Parse defensively — never crash the hero over a malformed string.
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

function formatShortDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const raw = dateStr.split('T')[0];
  const date = new Date(raw.replace(/-/g, '/'));
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getQuoteStep(lead: TradeLead): Step {
  // TradeLead only has project_quote_sent_at — no accepted/declined field
  // exists in this data, so those states are intentionally omitted rather
  // than invented.
  if (lead.project_quote_sent_at) return { state: 'active', label: 'Sent' };
  return { state: 'pending', label: 'Not sent' };
}

function getScheduleStep(lead: TradeLead): Step {
  if (!lead.scheduled_date) return { state: 'pending', label: 'Not set' };
  const raw = lead.scheduled_date.split('T')[0];
  const date = new Date(raw.replace(/-/g, '/'));
  const display = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const isPast = date < new Date(new Date().toDateString());
  return { state: isPast ? 'done' : 'active', label: display };
}

function getInvoiceStep(lead: TradeLead): Step {
  // TradeLead has no invoice_status/invoice_sent_at — derived from
  // payment_status alone.
  if (lead.payment_status === 'paid') return { state: 'done', label: 'Paid' };
  if (lead.payment_status === 'partial') return { state: 'partial', label: 'Partial' };
  if (lead.payment_status === 'refunded' || lead.payment_status === 'partially_refunded') {
    return { state: 'problem', label: 'Refunded' };
  }
  return { state: 'pending', label: 'Not sent' };
}

const textClasses: Record<StepState, string> = {
  pending: 'text-slate-500',
  active: 'text-blue-400',
  partial: 'text-amber-400',
  done: 'text-emerald-400',
  problem: 'text-red-400',
};

function StepDot({ state, tokens }: { state: StepState; tokens: Tokens }) {
  if (state === 'partial') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-amber-400 relative overflow-hidden shrink-0">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-500" />
      </div>
    );
  }
  const dotClasses: Record<StepState, string> = {
    pending: tokens.dotPending,
    active: 'bg-blue-500 border-blue-400',
    partial: '',
    done: 'bg-emerald-500 border-emerald-400',
    problem: 'bg-red-500 border-red-400',
  };
  return (
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${dotClasses[state]}`}>
      {state === 'done' && <Check className="w-3 h-3 text-white stroke-[3px]" />}
      {state === 'problem' && <X className="w-3 h-3 text-white stroke-[3px]" />}
    </div>
  );
}

function connectorClass(state: StepState, tokens: Tokens) {
  return state === 'done' ? 'bg-emerald-500/50' : tokens.dotPending.split(' ')[0];
}

function ProgressTracker({ lead, tokens }: { lead: TradeLead; tokens: Tokens }) {
  const steps: { key: string; category: string; step: Step }[] = [
    { key: 'quote', category: 'Quote', step: getQuoteStep(lead) },
    { key: 'schedule', category: 'Sched.', step: getScheduleStep(lead) },
    { key: 'invoice', category: 'Invoice', step: getInvoiceStep(lead) },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <StepDot state={s.step.state} tokens={tokens} />
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1.5 rounded-full ${connectorClass(s.step.state, tokens)}`} />
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 mt-1.5">
        {steps.map((s) => (
          <div key={s.key} className="flex flex-col items-center text-center px-0.5">
            <span className={`text-[9px] font-semibold uppercase tracking-wide ${tokens.textFaint}`}>
              {s.category}
            </span>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${textClasses[s.step.state]}`}>
              {s.step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// CARDS VIEW — fixed 2-column grid, no responsive breakpoints, no
// querySelector hacks needed from the parent.
// ==========================================
function CardsGrid({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4"
    >
      {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status, statusOptions);
        const statusHex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
        const isCompleted = lead.status === 'completed';
        const fileUrls = parseFileUrls(lead.file_urls);
        const hasPhotos = fileUrls.length > 0;
        const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : 0;

        return (
          <motion.div
            key={lead.id}
            variants={cardVariants}
            whileHover={{ y: -2 }}
            className={`w-full group relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 ${tokens.cardBg} ${tokens.cardBorder} ${tokens.cardBorderHover} ${tokens.cardShadow} ${
              isCompleted ? 'opacity-50 grayscale-[0.6]' : 'opacity-100'
            }`}
          >
            <div className="w-full h-1 shrink-0" style={{ backgroundColor: statusHex }} />

            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusHex }} />
                  <span className={`text-[11px] font-medium ${tokens.chipText}`}>{statusConfig.label}</span>
                </div>
              </div>

              <div className="px-4 pb-2 flex-1">
                <div className="mb-3">
                  <h3 className={`text-base font-semibold mb-0.5 truncate ${tokens.textPrimary}`}>{lead.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className={`text-[10px] font-medium ${tokens.textMuted}`}>
                      {lead.category?.replace(/_/g, ' ') || 'General enquiry'}
                    </p>
                    {hasPhotos && (
                      <div className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md text-pink-400 bg-pink-500/10">
                        <Camera className="w-3 h-3" /> {fileUrls.length}
                      </div>
                    )}
                    {quoteTotal > 0 && (
                      <p className={`ml-auto text-[13px] font-semibold ${tokens.quoteText}`}>
                        ${quoteTotal.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border mb-3 ${tokens.panelBg} ${tokens.panelBorder}`}>
                  <ProgressTracker lead={lead} tokens={tokens} />
                </div>
              </div>

              <div className={`flex items-center justify-between px-4 py-3 border-t ${tokens.divider}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-medium ${tokens.chipBg} ${tokens.chipBorder} ${tokens.chipText}`}>
                    {lead.assigned_to?.charAt(0) || <User className="w-3 h-3" />}
                  </div>
                  <span className={`text-[10px] font-medium ${tokens.textMuted}`}>
                    {lead.assigned_to || 'Assignee'}
                  </span>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-black transition-all duration-200 ${tokens.reviewHover}`}>
                  <span className="text-[10px] font-medium">Review</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ==========================================
// TABLE VIEW — compact preview. Columns are limited to fields already
// confirmed to exist on TradeLead elsewhere in this file (name, category,
// status, scheduled_date, quote_total, assigned_to). No sorting, bulk
// edit, or delete — this is a marketing snapshot, not the real dashboard
// table.
// ==========================================
function TablePreview({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${tokens.wrapperBg} ${tokens.wrapperBorder}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className={`border-b ${tokens.divider} ${tokens.theadBg}`}>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>
                Customer
              </th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>
                Status
              </th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>
                Scheduled
              </th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>
                Quote
              </th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>
                Assigned
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tokens.rowDivider}`}>
            {leads.map((lead) => {
              const statusConfig = getStatusConfig(lead.status, statusOptions);
              const statusHex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
              const scheduled = formatShortDate(lead.scheduled_date);
              const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : 0;

              return (
                <tr key={lead.id} className={`transition-colors ${tokens.rowHover}`}>
                  <td className="px-3 py-2.5 align-top">
                    <div className={`text-[12px] font-bold truncate max-w-[150px] ${tokens.textPrimary}`}>{lead.name}</div>
                    <div className={`text-[10px] truncate max-w-[150px] ${tokens.textFaint}`}>
                      {lead.category?.replace(/_/g, ' ') || 'General enquiry'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top whitespace-nowrap">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-black text-white"
                      style={{ backgroundColor: statusHex }}
                    >
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 align-top text-[11px] font-semibold whitespace-nowrap ${tokens.chipText}`}>
                    {scheduled || <span className={`font-normal ${tokens.textFainter}`}>Not set</span>}
                  </td>
                  <td className={`px-3 py-2.5 align-top text-[12px] font-bold whitespace-nowrap ${tokens.quoteText}`}>
                    {quoteTotal > 0 ? (
                      `$${quoteTotal.toLocaleString()}`
                    ) : (
                      <span className={`font-normal ${tokens.textFainter}`}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 align-top whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${tokens.chipBg} ${tokens.chipBorder} ${tokens.chipText}`}>
                        {lead.assigned_to?.charAt(0) || <User className="w-2.5 h-2.5" />}
                      </div>
                      <span className={`text-[11px] truncate max-w-[90px] ${tokens.textMuted}`}>
                        {lead.assigned_to || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className={`py-8 text-center text-xs font-bold ${tokens.textFainter}`}>No leads to display</div>
      )}
    </div>
  );
}

// ==========================================
// CALENDAR VIEW — compact month grid. The displayed month is derived from
// the first lead that has a scheduled_date (falling back to the current
// month), so demo entries are visible immediately — this is a static
// snapshot, not a navigable calendar.
// ==========================================
function CalendarPreview({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  const referenceDate = useMemo(() => {
    const withDate = leads.find((l) => !!l.scheduled_date);
    if (withDate?.scheduled_date) {
      const raw = withDate.scheduled_date.split('T')[0];
      const parsed = new Date(raw.replace(/-/g, '/'));
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  }, [leads]);

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const leadsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return leads.filter((l) => l.scheduled_date?.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className={`rounded-xl border overflow-hidden ${tokens.wrapperBg} ${tokens.wrapperBorder}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${tokens.divider} ${tokens.theadBg}`}>
        <span className={`text-[11px] font-black tracking-tight ${tokens.textPrimary}`}>{monthName}</span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${tokens.textFainter}`}>
          {leads.filter((l) => l.scheduled_date).length} scheduled
        </span>
      </div>

      <div className={`grid grid-cols-7 border-b ${tokens.divider}`}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className={`py-1.5 text-center text-[8px] font-black uppercase tracking-wider ${tokens.dayHeaderMuted}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`h-9 sm:h-11 border-r border-b ${tokens.divider} ${tokens.emptyCellBg}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);

          return (
            <div
              key={day}
              className={`h-9 sm:h-11 border-r border-b ${tokens.divider} p-1 flex flex-col items-center justify-start`}
            >
              <span
                className={`text-[9px] font-black w-4 h-4 flex items-center justify-center rounded ${
                  todayCell ? 'bg-blue-500 text-white' : tokens.dayNumMuted
                }`}
              >
                {day}
              </span>
              {dayLeads.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayLeads.slice(0, 3).map((l) => {
                    const statusConfig = getStatusConfig(l.status, statusOptions);
                    const hex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
                    return <span key={l.id} className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: hex }} />;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {leads.filter((l) => l.scheduled_date).length === 0 && (
        <div className={`py-6 text-center text-xs font-bold ${tokens.textFainter}`}>No scheduled jobs this month</div>
      )}
    </div>
  );
}

// ==========================================
// Default export — the view is pinned to whichever trade is currently
// showing, not an independent timer, so it can't drift out of sync with
// the trade rotation happening one level up in ArchitectHero.
//
// TRADE_VIEW_MAP lets you deliberately pin a view to a specific trade
// (e.g. plumbing always shows as a table). Fill this in with the real
// trade keys from tradeExamples.ts once confirmed — I don't have that
// file, so it starts empty rather than guessing wrong strings that would
// silently fail to match. Any trade not listed falls back to a
// deterministic hash of its name, so it still gets a *consistent* view
// every time that trade comes up (never re-randomized), just not one
// you've deliberately chosen yet.
// ==========================================
const TRADE_VIEW_MAP: Partial<Record<string, ViewKey>> = {
  // plumbing: 'table',
  // electrical: 'cards',
  // roofing: 'calendar',
};

function hashStringToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

function getViewForTrade(trade: string): ViewKey {
  const override = TRADE_VIEW_MAP[trade.trim().toLowerCase()];
  if (override) return override;
  return VIEW_SEQUENCE[hashStringToIndex(trade, VIEW_SEQUENCE.length)];
}

const VIEW_SEQUENCE: ViewKey[] = ['cards', 'table', 'calendar'];
const VIEW_META: Record<ViewKey, { label: string; icon: typeof LayoutGrid }> = {
  cards: { label: 'Cards', icon: LayoutGrid },
  table: { label: 'Table', icon: Rows3 },
  calendar: { label: 'Calendar', icon: CalendarDays },
};

export default function HeroDispatchCards({ leads, statusOptions, trade, isDark = true }: HeroDispatchCardsProps) {
  const view = getViewForTrade(trade);
  const tokens = getTokens(isDark);
  const ActiveIcon = VIEW_META[view].icon;

  return (
    <div className="space-y-3">
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border w-fit transition-colors duration-300 ${tokens.indicatorBg}`}
      >
        <ActiveIcon className="w-3 h-3" />
        <span className="text-[10px] font-black uppercase tracking-wider">{VIEW_META[view].label} view</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${trade}-${view}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {view === 'cards' && <CardsGrid leads={leads} statusOptions={statusOptions} tokens={tokens} />}
          {view === 'table' && <TablePreview leads={leads} statusOptions={statusOptions} tokens={tokens} />}
          {view === 'calendar' && <CalendarPreview leads={leads} statusOptions={statusOptions} tokens={tokens} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}