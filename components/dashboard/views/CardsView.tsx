'use client';

import { motion, Variants } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  User,
  Camera,
  CalendarDays,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  accentColor?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

// Clean status dot & text mappings
/* Must cover every colour PipelineTab offers — a stage set to one that's
   missing here silently renders blue, so New and Active looked identical. */
const statusColorMap: Record<string, { dot: string; textDark: string; textLight: string }> = {
  blue: { dot: 'bg-blue-500', textDark: 'text-blue-400', textLight: 'text-blue-600' },
  green: { dot: 'bg-emerald-500', textDark: 'text-emerald-400', textLight: 'text-emerald-600' },
  yellow: { dot: 'bg-amber-500', textDark: 'text-amber-400', textLight: 'text-amber-600' },
  purple: { dot: 'bg-purple-500', textDark: 'text-purple-400', textLight: 'text-purple-600' },
  orange: { dot: 'bg-orange-500', textDark: 'text-orange-400', textLight: 'text-orange-600' },
  red: { dot: 'bg-rose-500', textDark: 'text-rose-400', textLight: 'text-rose-600' },
  gray: { dot: 'bg-slate-500', textDark: 'text-slate-400', textLight: 'text-slate-600' },
  indigo: { dot: 'bg-indigo-500', textDark: 'text-indigo-400', textLight: 'text-indigo-600' },
  pink: { dot: 'bg-pink-500', textDark: 'text-pink-400', textLight: 'text-pink-600' },
};

// Helper: Check if payment/invoice is past due
function isPastDue(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

function CleanProgressTracker({ lead, isDark }: { lead: any; isDark: boolean }) {
  const quoteSent = lead.project_quote_sent_at || lead.quote_sent_at;
  const quoteAccepted = lead.project_quote_accepted_at || lead.quote_accepted_at;

  // Invoice & Payment Logic
  const paidAmount = parseFloat(lead.payment_amount || '0');
  const isPaid = lead.payment_status === 'paid';
  const isPartial = !isPaid && (lead.payment_status === 'partially_paid' || paidAmount > 0);
  const invoiceSent = lead.invoice_status === 'sent' || lead.invoice_sent_at;
  const pastDue = !isPaid && (lead.is_past_due || isPastDue(lead.invoice_due_date || lead.due_date));

  return (
    <div
      className={`grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg border ${
        isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
      }`}
    >
      {/* 1. Estimate */}
      <div className="flex items-center gap-1.5 min-w-0">
        <FileText className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <span
          className={`text-xs font-medium truncate ${
            quoteAccepted
              ? 'text-emerald-500 font-semibold'
              : quoteSent
              ? isDark ? 'text-slate-200' : 'text-slate-800'
              : isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {quoteAccepted ? 'Accepted' : quoteSent ? 'Sent' : 'No Estimate'}
        </span>
      </div>

      {/* 2. Schedule */}
      <div className="flex items-center gap-1.5 min-w-0">
        <CalendarDays className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <span
          className={`text-xs font-medium truncate ${
            lead.scheduled_date
              ? isDark ? 'text-slate-200' : 'text-slate-800'
              : isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {lead.scheduled_date
            ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Unscheduled'}
        </span>
      </div>

      {/* 3. Invoice & Payment Status (Single source of truth) */}
      <div className="flex items-center gap-1.5 min-w-0 justify-end">
        {isPaid ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Paid
          </span>
        ) : pastDue ? (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-500 truncate animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Past Due
          </span>
        ) : isPartial ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 truncate">
            <Clock className="w-3.5 h-3.5 shrink-0" /> Partial
          </span>
        ) : invoiceSent ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-500 truncate">
            <Clock className="w-3.5 h-3.5 shrink-0" /> Awaiting
          </span>
        ) : (
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} truncate`}>
            Not Invoiced
          </span>
        )}
      </div>
    </div>
  );
}

export default function UltraReadableCardsView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
  accentColor = '#2563eb',
}: CardsViewProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {leads.map((lead) => {
        const statusConfig = statusOptions.find((s) => s.value === lead.status) || {
          label: lead.status || 'New',
          color: 'blue',
        };
        const statusTheme = statusColorMap[statusConfig.color] || statusColorMap.blue;
        const quoteAmount =
          lead.quote_total && parseFloat(lead.quote_total) > 0
            ? parseFloat(lead.quote_total).toLocaleString()
            : null;

        const isPaid = lead.payment_status === 'paid';
        const pastDue = !isPaid && (lead.is_past_due || isPastDue(lead.invoice_due_date || lead.due_date));

        return (
          <motion.div
            key={lead.id}
            variants={cardVariants}
            whileHover={{ y: -2 }}
            onClick={() => onSelectLead(lead)}
            className={`group cursor-pointer p-4 rounded-xl border transition-all duration-150 ${
              isDark
                ? 'bg-slate-900 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/90'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {/* Header: Status Indicator + Follow Up / Past Due Notice + Date */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${statusTheme.dot}`} />
                <span
                  className={`text-xs font-bold tracking-wide uppercase ${
                    isDark ? statusTheme.textDark : statusTheme.textLight
                  }`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {pastDue ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                    <AlertCircle className="w-3 h-3" /> Payment Past Due
                  </span>
                ) : lead.follow_up_date ? (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Bell className="w-3 h-3" /> Follow Up
                  </span>
                ) : null}

                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </span>
              </div>
            </div>

            {/* Core Info: Title & Amount */}
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className={`text-base font-bold truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {lead.name}
              </h3>
              {quoteAmount && (
                <span
                  className={`text-base font-black shrink-0 ${
                    isPaid
                      ? 'text-emerald-500'
                      : pastDue
                      ? 'text-rose-500'
                      : isDark
                      ? 'text-slate-100'
                      : 'text-slate-900'
                  }`}
                >
                  ${quoteAmount}
                </span>
              )}
            </div>

            {/* Category Subtitle */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {lead.category?.replace(/_/g, ' ') || 'General Project'}
                {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
                  <> • <Camera className="w-3 h-3 inline" /> {lead.file_urls.length}</>
                )}
              </span>
            </div>

            {/* Progress Bar (Single location for Invoice status) */}
            <div className="mb-3">
              <CleanProgressTracker lead={lead} isDark={isDark} />
            </div>

            {/* Footer */}
            <div
              className={`flex items-center justify-between pt-2.5 border-t ${
                isDark ? 'border-slate-800/80' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <User className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                  {lead.assigned_to || 'Unassigned'}
                </span>
              </div>

              <div
                className={`flex items-center gap-0.5 text-xs font-semibold group-hover:translate-x-0.5 transition-transform ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <span>View</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}