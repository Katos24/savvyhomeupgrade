'use client';

import { motion, Variants } from 'framer-motion';
import {
  Calendar,
  Bell,
  ChevronRight,
  User,
  DollarSign,
  Camera,
  Check,
  X,
} from 'lucide-react';
import { getTheme } from '@/lib/theme';
import { isStripeVerified } from '@/lib/paymentStatus';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  planTier?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

type StepState = 'pending' | 'active' | 'partial' | 'done' | 'problem';

type Step = {
  state: StepState;
  label: string;
  isStripe?: boolean;
};

// ── Derive the three tracker steps from whatever fields are on the lead.
// Quote and schedule fields are confirmed present (used in the badges below
// already). Invoice fields (invoice_status / invoice_sent_at) are read
// defensively — if your leads query doesn't select those columns yet, this
// falls back to inferring from payment_status alone (skips the "sent,
// awaiting payment" middle state).
function getQuoteStep(lead: any): Step {
  if (lead.project_quote_accepted_at || lead.quote_accepted_at) {
    return { state: 'done', label: 'Accepted' };
  }
  if (lead.project_quote_declined_at || lead.quote_declined_at) {
    return { state: 'problem', label: 'Declined' };
  }
  if (lead.project_quote_sent_at || lead.quote_sent_at) {
    return { state: 'active', label: 'Sent' };
  }
  return { state: 'pending', label: 'Not sent' };
}

function getScheduleStep(lead: any): Step {
  if (!lead.scheduled_date) return { state: 'pending', label: 'Not set' };
  const raw = lead.scheduled_date.split('T')[0];
  const display = new Date(raw.replace(/-/g, '/')).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const isPast = new Date(raw.replace(/-/g, '/')) < new Date(new Date().toDateString());
  return { state: isPast ? 'done' : 'active', label: display };
}

function getInvoiceStep(lead: any): Step {
  const stripeVerified = isStripeVerified(lead);
  if (lead.payment_status === 'paid') {
    return { state: 'done', label: 'Paid', isStripe: stripeVerified };
  }
  if (lead.payment_status === 'partial') {
    return { state: 'partial', label: 'Partial', isStripe: stripeVerified };
  }
  if (lead.payment_status === 'refunded' || lead.payment_status === 'partially_refunded') {
    return { state: 'problem', label: 'Refunded' };
  }
  if (lead.invoice_status === 'sent' || lead.invoice_sent_at) {
    return { state: 'active', label: 'Sent' };
  }
  return { state: 'pending', label: 'Not sent' };
}

const stepDotClasses: Record<StepState, { dark: string; light: string }> = {
  pending: { dark: 'bg-white/10 border-white/20', light: 'bg-slate-100 border-slate-300' },
  active: { dark: 'bg-blue-500 border-blue-400', light: 'bg-blue-500 border-blue-500' },
  partial: { dark: 'bg-amber-500 border-amber-400', light: 'bg-amber-500 border-amber-500' },
  done: { dark: 'bg-emerald-500 border-emerald-400', light: 'bg-emerald-500 border-emerald-500' },
  problem: { dark: 'bg-red-500 border-red-400', light: 'bg-red-500 border-red-500' },
};

function StepDot({ state, isDark, size = 'md' }: { state: StepState; isDark: boolean; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconDim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  if (state === 'partial') {
    // Half-filled dot: amber left half, hollow right half — visually distinct
    // from a fully-paid solid dot rather than just a different color.
    const borderColor = isDark ? 'border-amber-400' : 'border-amber-500';
    return (
      <div className={`${dim} rounded-full border-2 ${borderColor} relative overflow-hidden shrink-0`}>
        <div className="absolute inset-y-0 left-0 w-1/2 bg-amber-500" />
      </div>
    );
  }

  const cls = stepDotClasses[state][isDark ? 'dark' : 'light'];
  return (
    <div className={`${dim} rounded-full border flex items-center justify-center shrink-0 ${cls}`}>
      {state === 'done' && <Check className={`${iconDim} text-white stroke-[3px]`} />}
      {state === 'problem' && <X className={`${iconDim} text-white stroke-[3px]`} />}
    </div>
  );
}

function connectorClass(a: StepState, isDark: boolean) {
  if (a === 'done') return isDark ? 'bg-emerald-500/50' : 'bg-emerald-300';
  return isDark ? 'bg-white/10' : 'bg-slate-200';
}

const stepTextClasses: Record<StepState, { dark: string; light: string }> = {
  pending: { dark: 'text-slate-500', light: 'text-slate-400' },
  active: { dark: 'text-blue-400', light: 'text-blue-600' },
  partial: { dark: 'text-amber-400', light: 'text-amber-600' },
  done: { dark: 'text-emerald-400', light: 'text-emerald-600' },
  problem: { dark: 'text-red-400', light: 'text-red-600' },
};

// ── The unified tracker: replaces the separate quote badge + payment badge.
function ProgressTracker({
  lead,
  isDark,
  size = 'md',
}: {
  lead: any;
  isDark: boolean;
  size?: 'sm' | 'md';
}) {
  const quote = getQuoteStep(lead);
  const schedule = getScheduleStep(lead);
  const invoice = getInvoiceStep(lead);
  const categorySize = size === 'sm' ? 'text-[8px]' : 'text-[9px]';
  const statusSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  const steps: { key: string; category: string; step: Step }[] = [
    { key: 'quote', category: 'Quote', step: quote },
    { key: 'schedule', category: 'Sched.', step: schedule },
    { key: 'invoice', category: 'Invoice', step: invoice },
  ];

  return (
    <div className="w-full">
      {/* Row 1: dots + connectors — alignment never depends on label height */}
      <div className="flex items-center">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <StepDot state={s.step.state} isDark={isDark} size={size} />
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1.5 rounded-full ${connectorClass(s.step.state, isDark)}`} />
            )}
          </div>
        ))}
      </div>

      {/* Row 2: category + live status, one column per step */}
      <div className="grid grid-cols-3 mt-1.5">
        {steps.map((s) => (
          <div key={s.key} className="flex flex-col items-center text-center px-0.5">
            <span
              className={`${categorySize} font-semibold uppercase tracking-wide ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {s.category}
            </span>
            <span
              className={`${statusSize} font-semibold whitespace-nowrap ${
                stepTextClasses[s.step.state][isDark ? 'dark' : 'light']
              }`}
            >
              {s.step.label}
            </span>
            {s.step.isStripe && (
              <span
                className="text-[8px] font-bold tracking-tight mt-0.5"
                style={{ color: '#635BFF' }}
              >
                via Stripe
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CardsView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
  planTier = 'free',
}: CardsViewProps) {
  const t = getTheme(isDark);

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0] || { label: 'New', color: 'blue' };

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
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
    return map[colorName] || '#60a5fa';
  };

  return (
    <>
      {/* ── MOBILE: bigger cards, not thin rows ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="sm:hidden space-y-3 px-1"
      >
        {leads.map((lead) => {
          const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const hasPhotos = Array.isArray(lead.file_urls) && lead.file_urls.length > 0;

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              onClick={() => onSelectLead(lead)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden border transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-white/[0.05] border-white/[0.1] active:bg-white/[0.08]'
                  : 'bg-white border-slate-200 shadow-sm active:bg-slate-50'
              } ${isCompleted ? 'opacity-50' : ''}`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: statusHex }} />

              <div className="pl-5 pr-4 py-4">
                {/* Row 1: name + follow-up + chevron */}
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className={`text-base font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lead.name}
                    </h3>
                    {lead.follow_up_date && (
                      <Bell className="w-4 h-4 text-red-500 shrink-0 fill-red-500/20" />
                    )}
                  </div>
                  <ChevronRight className={`w-5 h-5 shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                </div>

                {/* Row 2: category, photos, pipeline status */}
                <div className="flex items-center gap-2.5 mb-3.5 flex-wrap">
                  <span className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lead.category?.replace(/_/g, ' ') || 'General'}
                  </span>
                  <span className={isDark ? 'text-white/10' : 'text-slate-200'}>•</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: statusHex }}
                    />
                    <span className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  {hasPhotos && (
                    <span className={`text-[12px] font-medium flex items-center gap-1 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                      <Camera className="w-3.5 h-3.5" />
                      {lead.file_urls.length}
                    </span>
                  )}
                  {lead.quote_total && parseFloat(lead.quote_total) > 0 && (
                    <span className={`ml-auto text-[13px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ${parseFloat(lead.quote_total).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Row 3: the tracker — main focus of the card */}
                <div
                  className={`rounded-xl px-4 py-3 ${
                    isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <ProgressTracker lead={lead} isDark={isDark} size="md" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── DESKTOP: Full Cards ── */}
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

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              whileHover={{ y: -2 }}
              onClick={() => onSelectLead(lead)}
              className={`w-full group cursor-pointer relative flex flex-col ${isDark ? t.cardBg : 'bg-white'} border rounded-2xl overflow-hidden transition-all duration-200 ${
                isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 shadow-sm hover:shadow-md'
              } ${isCompleted ? 'opacity-50 grayscale-[0.6]' : 'opacity-100'}`}
            >
              <div className="w-full h-1 shrink-0" style={{ backgroundColor: statusHex }} />

              <div className="flex flex-1 flex-col">
                {/* Header: pipeline status (dot + text, no pill bg) + follow-up */}
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: statusHex }} />
                    <span className={`text-[12px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  {lead.follow_up_date && (
                    <Bell className="w-4 h-4 text-red-500 fill-red-500/20" />
                  )}
                </div>

                <div className="px-6 pb-2 flex-1">
                  <div className="mb-4">
                    <h3 className={`${t.textHeading} text-xl font-semibold mb-1 truncate transition-colors duration-200`}>
                      <span className="group-hover:opacity-80 transition-opacity duration-200">
                        {lead.name}
                      </span>
                    </h3>

                    <div className="flex items-center gap-3">
                      <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {lead.category?.replace(/_/g, ' ') || 'General enquiry'}
                      </p>
                      {hasPhotos && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${isDark ? 'text-pink-400 bg-pink-500/10' : 'text-pink-700 bg-pink-100'}`}>
                          <Camera className="w-3.5 h-3.5" /> {lead.file_urls.length}
                        </div>
                      )}
                      {lead.quote_total && parseFloat(lead.quote_total) > 0 && (
                        <p className={`ml-auto text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          ${parseFloat(lead.quote_total).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* The tracker — replaces the old quote/payment badge stack */}
                  <div
                    className={`p-4 rounded-xl border mb-4 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <ProgressTracker lead={lead} isDark={isDark} size="md" />
                  </div>
                </div>

                <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-medium ${isDark ? 'bg-slate-700 border-white/10 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                      {lead.assigned_to?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lead.assigned_to || 'Assignee'}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      isDark ? 'bg-emerald-500 text-black group-hover:bg-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <span className="text-[11px] font-medium">Review</span>
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