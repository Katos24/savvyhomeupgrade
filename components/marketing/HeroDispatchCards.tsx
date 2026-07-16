'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronRight, User, Camera, Check, X, LayoutGrid, Rows3, CalendarDays } from 'lucide-react';
import type { TradeLead } from '@/components/marketing/tradeExamples';

// ==========================================
// Standalone hero preview — Cards / Table / Calendar.
//
// This used to own the view-switcher pill AND the content in one
// component. Now it's split in two:
//   - `DispatchViewSwitcher`: the pill control only. Render it wherever
//     you want (e.g. outside the laptop bezel), and hold the `view` state
//     in the parent.
//   - `HeroDispatchCards` (default export): content only, fully
//     controlled via the `view` prop. No internal view state, no
//     auto-cycling — it renders whatever `view` the parent gives it.
//
// Deliberately does NOT import the internal dashboard's CardsView,
// TableView, CalendarView, getTheme, safeJSONParse, or isStripeVerified —
// those are dashboard internals that can change shape at any time. The
// marketing hero should never depend on them or on DOM-scraping tricks
// to force a layout.
// ==========================================

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

type StepState = 'pending' | 'active' | 'partial' | 'done' | 'problem';
type Step = { state: StepState; label: string };

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
    segTrack: isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200',
    segPill: isDark ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]' : 'bg-white shadow-sm border border-slate-200',
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

function formatShortDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const raw = dateStr.split('T')[0];
  const date = new Date(raw.replace(/-/g, '/'));
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getQuoteStep(lead: TradeLead): Step {
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

function ProgressTracker({ lead, tokens, compact = false }: { lead: TradeLead; tokens: Tokens; compact?: boolean }) {
  const steps: { key: string; category: string; step: Step }[] = [
    { key: 'quote', category: 'Quote', step: getQuoteStep(lead) },
    { key: 'schedule', category: 'Sched.', step: getScheduleStep(lead) },
    { key: 'invoice', category: 'Invoice', step: getInvoiceStep(lead) },
  ];

  // Compact: dots + connectors only, no per-step text labels underneath —
  // used in the mobile row layout where there isn't room for a 3-column
  // label grid under each row.
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <StepDot state={s.step.state} tokens={tokens} />
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1 rounded-full ${connectorClass(s.step.state, tokens)}`} />
            )}
          </div>
        ))}
      </div>
    );
  }

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

function CardsGrid({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4"
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
            className={`w-full group relative border rounded-2xl overflow-hidden transition-all duration-200 ${tokens.cardBg} ${tokens.cardBorder} ${tokens.cardBorderHover} ${tokens.cardShadow} ${
              isCompleted ? 'opacity-50 grayscale-[0.6]' : 'opacity-100'
            }`}
          >
            {/* MOBILE ROW LAYOUT — shown below sm only. A full 2-column card
                grid was too cramped on narrow phones (name, category, photo
                count, price, and a 3-step tracker with labels all fighting
                for ~140px), so mobile gets a single-column row instead. */}
            <div className="sm:hidden flex items-center gap-3 px-3 py-2.5">
              <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: statusHex }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold truncate ${tokens.textPrimary}`}>{lead.name}</h3>
                  {quoteTotal > 0 && (
                    <span className={`ml-auto shrink-0 text-xs font-semibold ${tokens.quoteText}`}>
                      ${quoteTotal.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <p className={`text-[10px] font-medium truncate ${tokens.textMuted}`}>
                    {lead.category?.replace(/_/g, ' ') || 'General enquiry'}
                  </p>
                  {hasPhotos && (
                    <div className="flex items-center gap-0.5 text-[9px] font-medium text-pink-400 shrink-0">
                      <Camera className="w-2.5 h-2.5" /> {fileUrls.length}
                    </div>
                  )}
                </div>
                <div className="mt-1.5">
                  <ProgressTracker lead={lead} tokens={tokens} compact />
                </div>
              </div>
            </div>

            {/* FULL CARD LAYOUT — hidden below sm, unchanged from before */}
            <div className="hidden sm:flex sm:flex-col">
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
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function TablePreview({ leads, statusOptions, tokens }: { leads: TradeLead[]; statusOptions: StatusOption[]; tokens: Tokens }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${tokens.wrapperBg} ${tokens.wrapperBorder}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className={`border-b ${tokens.divider} ${tokens.theadBg}`}>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>Customer</th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>Status</th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>Scheduled</th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>Quote</th>
              <th className={`px-3 py-2 text-left text-[9px] font-black uppercase tracking-wider ${tokens.textFainter}`}>Assigned</th>
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
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black text-white" style={{ backgroundColor: statusHex }}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className={`px-3 py-2.5 align-top text-[11px] font-semibold whitespace-nowrap ${tokens.chipText}`}>
                    {scheduled || <span className={`font-normal ${tokens.textFainter}`}>Not set</span>}
                  </td>
                  <td className={`px-3 py-2.5 align-top text-[12px] font-bold whitespace-nowrap ${tokens.quoteText}`}>
                    {quoteTotal > 0 ? `$${quoteTotal.toLocaleString()}` : <span className={`font-normal ${tokens.textFainter}`}>—</span>}
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
          <div key={`empty-${i}`} className={`h-12 sm:h-16 border-r border-b ${tokens.divider} ${tokens.emptyCellBg}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);

          return (
            <div key={day} className={`h-12 sm:h-16 border-r border-b ${tokens.divider} p-1 flex flex-col items-center justify-start gap-0.5 overflow-hidden`}>
              <span
                className={`text-[9px] font-black w-4 h-4 flex items-center justify-center rounded shrink-0 ${
                  todayCell ? 'bg-blue-500 text-white' : tokens.dayNumMuted
                }`}
              >
                {day}
              </span>
              {/* Named badges instead of bare dots — makes clear these are
                  actual scheduled jobs you can see at a glance, not just an
                  abstract "something's happening" marker. */}
              {dayLeads.length > 0 && (
                <div className="w-full flex flex-col items-stretch gap-0.5">
                  {dayLeads.slice(0, 2).map((l) => {
                    const statusConfig = getStatusConfig(l.status, statusOptions);
                    const hex = STATUS_COLOR_HEX[statusConfig.color] || '#60a5fa';
                    const firstName = l.name?.split(' ')[0] || 'Lead';
                    return (
                      <span
                        key={l.id}
                        className="w-full px-1 py-[1px] rounded text-[7px] sm:text-[8px] font-bold text-white truncate text-center leading-tight"
                        style={{ backgroundColor: hex }}
                        title={l.name}
                      >
                        {firstName}
                      </span>
                    );
                  })}
                  {dayLeads.length > 2 && (
                    <span className={`text-[7px] font-bold text-center ${tokens.textFainter}`}>
                      +{dayLeads.length - 2} more
                    </span>
                  )}
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
// EXPORTED SWITCHER — the Cards/Table/Calendar pill control, on its own.
// Render this wherever you want (e.g. outside the laptop bezel); it holds
// no state itself — the parent owns `view` and passes `onChange`.
// ==========================================
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
    <div className={`relative grid grid-cols-3 rounded-xl border p-1 w-full max-w-sm mx-auto ${tokens.segTrack}`}>
      <motion.div
        className={`absolute top-1 bottom-1 left-1 rounded-lg ${tokens.segPill}`}
        style={{ width: 'calc(33.333% - 4px)' }}
        animate={{ x: `${activeIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      />
      {VIEW_SEQUENCE.map((key) => {
        const meta = VIEW_META[key];
        const isActive = key === view;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`relative z-10 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
              isActive ? tokens.segTextActive : `${tokens.segTextInactive} hover:${isDark ? 'text-slate-200' : 'text-slate-700'}`
            }`}
          >
            <meta.icon className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// Default export — content only. Fully controlled via `view`; no internal
// state, no switcher rendered here. The parent should default its own
// `view` state to 'cards'.
// ==========================================
export default function HeroDispatchCards({ leads, statusOptions, trade, view, isDark = true }: HeroDispatchCardsProps) {
  const tokens = getTokens(isDark);

  return (
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
  );
}