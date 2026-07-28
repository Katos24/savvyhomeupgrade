'use client';

import { motion, Variants } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  User,
  Camera,
  Check,
  Clock,
  X,
  AlertCircle,
  CreditCard,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { getTheme } from '@/lib/theme';
import { isStripeVerified } from '@/lib/paymentStatus';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  planTier?: string;
  accentColor?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

type StepState = 'empty' | 'active' | 'success' | 'error' | 'partial';

type Step = {
  state: StepState;
  label: string;
  sublabel?: string;
};

// Helper: Calculate standard WCAG contrast for text over dynamic hex colors
function getContrastTextColor(inputHex: string): string {
  let c = inputHex.trim().replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '#ffffff';
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6 ? '#0f172a' : '#ffffff';
}

// Helper: Format created_at date cleanly
function formatCreatedDate(dateString?: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Helper state resolution
function getQuoteStep(lead: any): Step {
  const amount =
    lead.quote_total && parseFloat(lead.quote_total) > 0
      ? `$${parseFloat(lead.quote_total).toLocaleString()}`
      : undefined;

  if (lead.project_quote_accepted_at || lead.quote_accepted_at) {
    return { state: 'success', label: 'Accepted' };
  }
  if (lead.project_quote_declined_at || lead.quote_declined_at) {
    return { state: 'error', label: 'Declined' };
  }
  if (lead.project_quote_sent_at || lead.quote_sent_at) {
    return { state: 'active', label: 'Sent'};
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
  const stripeVerified = isStripeVerified(lead);

  if (lead.payment_status === 'paid') {
    return { state: 'success', label: 'Paid', sublabel: stripeVerified ? 'Stripe' : undefined };
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

// Status Badge Styling Matrix
const badgeStyles: Record<
  StepState,
  {
    dark: string;
    light: string;
    icon: React.ComponentType<{ className?: string }>;
  }
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

// Unified Tracker Component
function ProgressTracker({
  lead,
  isDark,
}: {
  lead: any;
  isDark: boolean;
}) {
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
      className={`w-full rounded-xl border overflow-hidden backdrop-blur-md ${
        isDark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200/80 bg-slate-50/50'
      }`}
    >
      {rows.map((r, i) => {
        const style = badgeStyles[r.step.state];
        const StateIcon = style.icon;

        return (
          <div
            key={r.key}
            className={`flex items-center justify-between gap-2 px-3 py-2 text-xs ${
              i !== rows.length - 1
                ? isDark
                  ? 'border-b border-white/5'
                  : 'border-b border-slate-200/60'
                : ''
            }`}
          >
            {/* Left Label */}
            <div className="flex items-center gap-1.5 min-w-0">
              <r.icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              />
              <span
                className={`font-bold tracking-tight text-[11px] truncate ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {r.label}
              </span>
            </div>

            {/* Right Value Display */}
            <div className="flex items-center gap-1.5 shrink-0">
              {r.step.sublabel && (
                <span
                  className={`text-[10px] font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {r.step.sublabel}
                </span>
              )}

              {/* SCHEDULE ROW: Plain text */}
              {r.isPlain ? (
                <span
                  className={`text-[11px] font-extrabold ${
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
                /* ESTIMATE & INVOICE ROWS: Colored badges */
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-wider ${
                    style[isDark ? 'dark' : 'light']
                  }`}
                >
                  <StateIcon className="w-2.5 h-2.5 stroke-[3]" />
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

export default function CardsView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
  accentColor = '#2563eb',
}: CardsViewProps) {
  const buttonTextColor = getContrastTextColor(accentColor);

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) ||
    statusOptions[0] || { label: 'New', color: 'blue' };

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#64748b',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  return (
    <>
      {/* MOBILE CARDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="sm:hidden space-y-3 px-1"
      >
        {leads.map((lead) => {
          const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const badgeTextColor = getContrastTextColor(statusHex);
          const isCompleted = lead.status === 'completed';
          const hasPhotos = Array.isArray(lead.file_urls) && lead.file_urls.length > 0;
          const createdDate = formatCreatedDate(lead.created_at);
          const quoteAmount =
            lead.quote_total && parseFloat(lead.quote_total) > 0
              ? parseFloat(lead.quote_total).toLocaleString()
              : null;

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              onClick={() => onSelectLead(lead)}
              className={`relative cursor-pointer rounded-2xl border transition-all active:scale-[0.98] overflow-hidden backdrop-blur-md ${
                isDark
                  ? 'bg-[#0A0C14]/80 border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                  : 'bg-white/90 border-slate-200/90 shadow-xs'
              } ${isCompleted ? 'opacity-60' : ''}`}
            >
              {/* Colored Indicator Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: statusHex }}
              />

              <div className="pl-4 pr-3.5 py-3.5">
                {/* Created Date Top Right */}
                {createdDate && (
                  <div className="flex justify-end mb-1">
                    <span
                      className={`text-[10px] font-semibold tracking-tight ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {createdDate}
                    </span>
                  </div>
                )}

                {/* Header: Name + Follow up + Price */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3
                        className={`text-base font-extrabold truncate leading-snug ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {lead.name}
                      </h3>
                      {lead.follow_up_date && (
                        <Bell className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 shrink-0 animate-pulse" />
                      )}
                    </div>
                  </div>

                  {quoteAmount && (
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    >
                      ${quoteAmount}
                    </span>
                  )}
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-1.5 mb-3 flex-wrap text-[11px] font-bold">
                  {/* Category Pill */}
                  <span
                    className={`px-2 py-0.5 rounded-md ${
                      isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lead.category?.replace(/_/g, ' ') || 'General'}
                  </span>

                  {/* Status Pill with Contrast Text */}
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-extrabold uppercase text-[9px] tracking-wider"
                    style={{ backgroundColor: statusHex, color: badgeTextColor }}
                  >
                    {statusConfig.label}
                  </span>

                  {/* Photos */}
                  {hasPhotos && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                        isDark ? 'bg-pink-950/60 text-pink-400' : 'bg-pink-50 text-pink-700'
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      {lead.file_urls.length}
                    </span>
                  )}
                </div>

                {/* Progress Tracker */}
                <ProgressTracker lead={lead} isDark={isDark} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* DESKTOP GRID CARDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {leads.map((lead) => {
          const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const hasPhotos = Array.isArray(lead.file_urls) && lead.file_urls.length > 0;
          const createdDate = formatCreatedDate(lead.created_at);
          const quoteAmount =
            lead.quote_total && parseFloat(lead.quote_total) > 0
              ? parseFloat(lead.quote_total).toLocaleString()
              : null;

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              onClick={() => onSelectLead(lead)}
              className={`group cursor-pointer relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-200 backdrop-blur-md ${
                isDark
                  ? 'bg-[#0A0C14]/80 border-white/10 hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
                  : 'bg-white/90 border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
              } ${isCompleted ? 'opacity-60 grayscale-[0.3]' : 'opacity-100'}`}
            >
              {/* Top Accent Line */}
              <div className="w-full h-1 shrink-0" style={{ backgroundColor: statusHex }} />

              <div className="flex flex-1 flex-col p-5">
                {/* Status Bar + Created Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: statusHex }}
                    />
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {lead.follow_up_date && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3 fill-rose-500/30" /> Follow Up
                      </span>
                    )}

                    {createdDate && (
                      <span
                        className={`text-[10px] font-semibold tracking-tight ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {createdDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lead Name & Value */}
                <div className="mb-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h3
                      className={`text-lg font-extrabold truncate transition-colors ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {lead.name}
                    </h3>
                    {quoteAmount && (
                      <span
                        className={`text-base font-black shrink-0 ${
                          isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        ${quoteAmount}
                      </span>
                    )}
                  </div>

                  {/* Subtitle Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {lead.category?.replace(/_/g, ' ') || 'General Enquiry'}
                    </span>

                    {hasPhotos && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isDark ? 'text-pink-400 bg-pink-950/50' : 'text-pink-700 bg-pink-50'
                        }`}
                      >
                        <Camera className="w-3 h-3" /> {lead.file_urls.length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tracker Section */}
                <div className="mb-4 mt-auto">
                  <ProgressTracker lead={lead} isDark={isDark} />
                </div>

                {/* Footer */}
                <div
                  className={`flex items-center justify-between pt-3.5 border-t ${
                    isDark ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                        isDark
                          ? 'bg-white/10 text-slate-300 border border-white/10'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {lead.assigned_to?.charAt(0).toUpperCase() || (
                        <User className="w-3 h-3" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {lead.assigned_to || 'Unassigned'}
                    </span>
                  </div>

                  <div
                    style={{ backgroundColor: accentColor, color: buttonTextColor }}
                    className="flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-xs hover:opacity-90"
                  >
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}