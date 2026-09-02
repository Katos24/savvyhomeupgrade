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
  Phone,
  Mail,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helper: Text color contrast & Hex to RGBA conversion (Pure-black fallback)
// ---------------------------------------------------------------------------
function getSafeAccentColor(input: string, isDark: boolean): string {
  let c = input.trim().replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return isDark ? '#3b82f6' : '#2563eb';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance < 0.08) {
    return isDark ? '#60a5fa' : '#1e293b';
  }
  return input;
}

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

const statusColorMap: Record<string, { dot: string; textDark: string; textLight: string; bgDark: string; bgLight: string }> = {
  blue: { dot: 'bg-blue-500', textDark: 'text-blue-400', textLight: 'text-blue-700', bgDark: 'bg-blue-500/10', bgLight: 'bg-blue-50' },
  green: { dot: 'bg-emerald-500', textDark: 'text-emerald-400', textLight: 'text-emerald-700', bgDark: 'bg-emerald-500/10', bgLight: 'bg-emerald-50' },
  yellow: { dot: 'bg-amber-500', textDark: 'text-amber-400', textLight: 'text-amber-700', bgDark: 'bg-amber-500/10', bgLight: 'bg-amber-50' },
  purple: { dot: 'bg-purple-500', textDark: 'text-purple-400', textLight: 'text-purple-700', bgDark: 'bg-purple-500/10', bgLight: 'bg-purple-50' },
  orange: { dot: 'bg-orange-500', textDark: 'text-orange-400', textLight: 'text-orange-700', bgDark: 'bg-orange-500/10', bgLight: 'bg-orange-50' },
  red: { dot: 'bg-rose-500', textDark: 'text-rose-400', textLight: 'text-rose-700', bgDark: 'bg-rose-500/10', bgLight: 'bg-rose-50' },
  gray: { dot: 'bg-slate-500', textDark: 'text-slate-400', textLight: 'text-[#57534e]', bgDark: 'bg-slate-500/10', bgLight: 'bg-[#f5f1e8]' },
  indigo: { dot: 'bg-indigo-500', textDark: 'text-indigo-400', textLight: 'text-indigo-700', bgDark: 'bg-indigo-500/10', bgLight: 'bg-indigo-50' },
  pink: { dot: 'bg-pink-500', textDark: 'text-pink-400', textLight: 'text-pink-700', bgDark: 'bg-pink-500/10', bgLight: 'bg-pink-50' },
};

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

  const paidAmount = parseFloat(lead.payment_amount || '0');
  const isPaid = lead.payment_status === 'paid';
  const isPartial = !isPaid && (lead.payment_status === 'partially_paid' || paidAmount > 0);
  const invoiceSent = lead.invoice_status === 'sent' || lead.invoice_sent_at;
  const pastDue = !isPaid && (lead.is_past_due || isPastDue(lead.invoice_due_date || lead.due_date));

  return (
    <div
      className={`grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg border ${
        isDark ? 'bg-slate-950/40 border-slate-800/80' : 'bg-[#faf9f5] border-[#e7e2d8]'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <FileText className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
        <span
          className={`text-xs font-medium truncate ${
            quoteAccepted
              ? 'text-emerald-500 font-semibold'
              : quoteSent
              ? isDark ? 'text-slate-200' : 'text-[#292524]'
              : isDark ? 'text-slate-500' : 'text-[#a8a29e]'
          }`}
        >
          {quoteAccepted ? 'Accepted' : quoteSent ? 'Sent' : 'No Estimate'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 min-w-0">
        <CalendarDays className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
        <span
          className={`text-xs font-medium truncate ${
            lead.scheduled_date
              ? isDark ? 'text-slate-200' : 'text-[#292524]'
              : isDark ? 'text-slate-500' : 'text-[#a8a29e]'
          }`}
        >
          {lead.scheduled_date
            ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Unscheduled'}
        </span>
      </div>

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
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'} truncate`}>
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
  const safeAccent = getSafeAccentColor(accentColor, isDark);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans"
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
        const isCompleted = lead.status === 'completed';

        return (
          <motion.div
            key={lead.id}
            variants={cardVariants}
            whileHover={{ y: -2 }}
            onClick={() => onSelectLead(lead)}
            onMouseEnter={(e) => {
              if (isCompleted) return;
              (e.currentTarget as HTMLElement).style.borderColor = safeAccent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = '';
            }}
            className={`group cursor-pointer p-4 rounded-xl border transition-all duration-150 ${
              isCompleted
                ? isDark
                  ? 'bg-slate-900/40 border-slate-800/50 opacity-60'
                  : 'bg-[#f5f1e8]/70 border-[#e7e2d8] opacity-70'
                : isDark
                ? 'bg-slate-900 border-slate-800/90 hover:bg-slate-900/90'
                : 'bg-white border-[#e7e2d8] hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${
                  isDark ? `${statusTheme.bgDark} ${statusTheme.textDark}` : `${statusTheme.bgLight} ${statusTheme.textLight}`
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                {statusConfig.label}
              </span>

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

                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>
                  {lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : ''}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 className={`text-base font-bold truncate ${isDark ? 'text-slate-100' : 'text-[#1c1917]'}`}>
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
                      : 'text-[#1c1917]'
                  }`}
                >
                  ${quoteAmount}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
                {lead.category?.replace(/_/g, ' ') || 'General Project'}
                {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
                  <> • <Camera className="w-3 h-3 inline" /> {lead.file_urls.length}</>
                )}
              </span>
            </div>

            <div className="mb-3">
              <CleanProgressTracker lead={lead} isDark={isDark} />
            </div>

            <div
              className={`flex items-center justify-between pt-2.5 border-t ${
                isDark ? 'border-slate-800/80' : 'border-[#f0ece1]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs">
                <User className={`w-3.5 h-3.5 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
                <span className={isDark ? 'text-slate-400' : 'text-[#57534e]'}>
                  {lead.assigned_to || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {lead.phone && (
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Call"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-white/10' : 'text-[#a8a29e] hover:text-[#292524] hover:bg-[#f5f1e8]'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                {lead.email && (
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Email"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark ? 'text-slate-500 hover:text-slate-200 hover:bg-white/10' : 'text-[#a8a29e] hover:text-[#292524] hover:bg-[#f5f1e8]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold group-hover:translate-x-0.5 transition-transform pl-1 ${
                    isDark ? 'text-slate-200' : 'text-[#1c1917]'
                  }`}
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
  );
}