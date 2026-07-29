'use client';

import React from 'react';
import { useState } from 'react';
import {
  ChevronDown, X, MoreVertical, Sparkles, User, Calendar, FileText,
  CreditCard, ListChecks, ImageIcon, MessageCircle, Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { can, type PlanTier } from '@/lib/permissions';

type LeadModalHeaderProps = {
  lead: any;
  company?: any;
  currentUser?: any;
  statusOptions: any[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  onMoreMenu?: () => void;
  onStatusChange: (status: string) => void;
  isUpdatingStatus?: boolean;
  companySlug: string;
  onLockedTab?: (tabId: string) => void;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  const parts = d.split('T')[0].split('-');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtTime(t: string | null | undefined) {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

const STATUS_HEX: Record<string, string> = {
  blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7',
  orange: '#f97316', green: '#22c55e', red: '#ef4444',
  gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
};

export default function LeadModalHeader({
  lead,
  company,
  statusOptions,
  activeTab,
  onTabChange,
  onClose,
  onMoreMenu,
  onStatusChange,
  isUpdatingStatus,
  companySlug,
  onLockedTab,
}: LeadModalHeaderProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const isProject = !!lead.project_id;

  const currentStatus = statusOptions.find(s => s.value === lead.status) || statusOptions[0];
  const statusHex = STATUS_HEX[currentStatus?.color] || '#3b82f6';

  const scheduledDate = fmtDate(lead.scheduled_date);
  const scheduledTime = fmtTime(lead.scheduled_time);
  const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : null;
  const quoteAccepted = !!(lead.project_quote_accepted_at || lead.quote_accepted_at);
  const quoteDeclined = !!(lead.project_quote_declined_at || lead.quote_declined_at);
  const quoteSent = !!(lead.project_quote_sent_at || lead.quote_sent_at);
  const paymentAmount = lead.payment_amount ? parseFloat(lead.payment_amount) : null;
  const paymentStatus = lead.payment_status;
  const assignedTo = lead.assigned_to || null;

  const quoteSub = quoteAccepted ? { text: 'Accepted', color: '#34d399' }
    : quoteDeclined ? { text: 'Declined', color: '#f87171' }
    : quoteSent ? { text: 'Sent', color: '#60a5fa' }
    : quoteTotal ? { text: 'Not sent', color: 'rgba(255,255,255,0.3)' }
    : null;

  const paymentSub = paymentStatus === 'paid'
    ? { text: 'Paid in full', color: '#34d399' }
    : paymentStatus === 'partial' && paymentAmount && quoteTotal
    ? { text: `${fmt(quoteTotal - paymentAmount)} due`, color: '#f87171' }
    : quoteTotal
    ? { text: `${fmt(quoteTotal)} due`, color: '#f87171' }
    : null;

  const snapshot = [
    { id: 'quote', label: 'Quote', value: quoteTotal ? fmt(quoteTotal) : null, sub: quoteSub?.text, subColor: quoteSub?.color, valueColor: undefined as string | undefined, hasData: !!quoteTotal },
    { id: 'payment', label: 'Payment', value: paymentAmount ? `${fmt(paymentAmount)} paid` : quoteTotal ? 'Unpaid' : null, sub: paymentSub?.text, subColor: paymentSub?.color, valueColor: undefined, hasData: !!(quoteTotal || paymentAmount) },
    { id: 'schedule', label: 'Scheduled', value: scheduledDate, sub: scheduledTime, subColor: 'rgba(255,255,255,0.4)', valueColor: undefined, hasData: !!scheduledDate },
    { id: 'assigned', label: 'Assigned', value: assignedTo, sub: null, subColor: null, valueColor: undefined, hasData: !!assignedTo },
    { id: 'invoice', label: 'Invoice', value: lead.invoice_number ? `#${lead.invoice_number}` : null, sub: lead.invoice_sent_at ? 'Sent' : 'Not sent', subColor: lead.invoice_sent_at ? '#34d399' : 'rgba(255,255,255,0.3)', valueColor: '#60a5fa', hasData: !!lead.invoice_number },
  ].filter(i => i.hasData);

  // On mobile the snapshot duplicates whatever the open tab already shows —
  // the Quote tab leads with the quote, Invoice with the balance. Only worth
  // the ~40px on Overview.
  const showSnapshotOnMobile = activeTab === 'overview';

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: User,          show: true, locked: false },
    { id: 'quote',     label: 'Quote',     icon: FileText,      show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'schedule',  label: 'Schedule',  icon: Calendar,      show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'payment',   label: 'Invoice',   icon: CreditCard,    show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'tasks',     label: 'Tasks',     icon: ListChecks,    show: isProject || !can(planTier, 'custom_tasks'), locked: !can(planTier, 'custom_tasks') },
    { id: 'photos',    label: 'Media',     icon: ImageIcon,     show: isProject || !can(planTier, 'docs_on_card'), locked: !can(planTier, 'docs_on_card') },
    { id: 'reminders', label: 'Reminders', icon: Bell,          show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'activity',  label: 'Activity',  icon: MessageCircle, show: isProject, locked: false },
  ].filter(t => t.show);

  const categoryLabel =
    lead.category_label ||
    (lead.category
      ? lead.category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'No category');

  const iconBtn =
    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/[0.06] border border-white/10';

  return (
    <div className="flex-shrink-0 relative" style={{ background: '#0f172a' }}>
      <div className="px-4 pt-2.5 pb-0">

        {/* ── TOP ROW — name, status, actions. Category and date moved into
              this row on desktop so they don't cost a line of their own. ── */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <h2 className="text-base font-semibold text-white leading-tight truncate">{lead.name}</h2>

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowStatusMenu(v => !v)}
                disabled={isUpdatingStatus}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background: `${statusHex}1a`, border: `1px solid ${statusHex}35`, color: statusHex }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusHex }} />
                {isUpdatingStatus ? '...' : currentStatus?.label}
                <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>

              <AnimatePresence>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={() => setShowStatusMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] w-48 overflow-hidden"
                    >
                      {statusOptions.map((s: any) => (
                        <button
                          key={s.value}
                          onClick={() => { onStatusChange(s.value); setShowStatusMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_HEX[s.color] || '#3b82f6' }} />
                          {s.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Category inline from sm up — saves a whole line on desktop. */}
            <p className="hidden sm:block text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {categoryLabel}
              {isProject && lead.project_number ? ` · #${lead.project_number}` : ''}
              {' · '}{fmtDate(lead.created_at)}
            </p>
          </div>

          {/* One close control, not two. The back arrow and the X both called
              onClose — the X is the conventional one for a modal. */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {onMoreMenu && (
              <button onClick={onMoreMenu} className={iconBtn} aria-label="More actions">
                <MoreVertical className="w-3.5 h-3.5 text-white/50" />
              </button>
            )}
            <button onClick={onClose} className={iconBtn} aria-label="Close">
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>
        </div>

        {/* Category line — mobile only, since it's inline above from sm up. */}
        <p className="sm:hidden text-[11px] mb-1.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {categoryLabel}
          {isProject && lead.project_number ? ` · #${lead.project_number}` : ''}
          {' · '}{fmtDate(lead.created_at)}
        </p>

        {/* ── SNAPSHOT ── */}
        {isProject && snapshot.length > 0 && (
          <div
            className={`${showSnapshotOnMobile ? 'flex' : 'hidden sm:flex'} items-start border-t border-white/[0.07] pt-2 pb-1.5`}
          >
            {snapshot.map((item, i) => (
              <div
                key={item.id}
                className={`min-w-0 flex-1 ${i > 0 ? 'pl-3 border-l border-white/[0.07]' : ''} ${
                  // Only the first two fit on a phone; the rest appear from sm.
                  i > 1 ? 'hidden sm:block' : ''
                }`}
              >
                <p className="text-[10px] font-medium truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {item.label}
                </p>
                {/* Value and sub on one line instead of two — saves ~14px. */}
                <p className="text-[12px] font-medium leading-tight truncate">
                  <span style={{ color: item.valueColor || 'white' }}>{item.value || '—'}</span>
                  {item.sub && (
                    <span className="ml-1.5" style={{ color: item.subColor || 'rgba(255,255,255,0.3)' }}>
                      {item.sub}
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        {tabs.length > 1 && (
          <div className="py-1.5">
            <div
              className="flex items-center overflow-x-auto rounded-[10px] bg-white/5 p-[3px] gap-0.5"
              style={{ scrollbarWidth: 'none' }}
            >
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.locked) { onLockedTab?.(tab.id); return; }
                      onTabChange(tab.id);
                    }}
                    className={`flex-shrink-0 flex items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] transition-colors ${
                      isActive
                        ? 'bg-white font-semibold text-slate-900'
                        : tab.locked
                        ? 'font-medium text-blue-400 hover:bg-white/5'
                        : 'font-medium text-white/45 hover:bg-white/5 hover:text-white/70'
                    }`}
                  >
                    <tab.icon className="hidden sm:block w-3 h-3 flex-shrink-0" />
                    {tab.label}
                    {tab.locked && <Sparkles className="w-2.5 h-2.5 text-yellow-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}