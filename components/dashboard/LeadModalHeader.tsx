'use client';

import React from 'react';
import { useState } from 'react';
import { ChevronDown, X, MoreVertical, ArrowLeft, Sparkles, User, Calendar, FileText, CreditCard, ListChecks, ImageIcon, MessageCircle, Bell } from 'lucide-react';
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

  const getStatusColor = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7',
      orange: '#f97316', green: '#22c55e', red: '#ef4444',
      gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  const currentStatus = statusOptions.find(s => s.value === lead.status) || statusOptions[0];
  const statusHex = getStatusColor(currentStatus?.color);

  // ── DERIVED DATA ──────────────────────────────────────────
  const scheduledDate = fmtDate(lead.scheduled_date);
  const scheduledTime = fmtTime(lead.scheduled_time);
  const quoteTotal = lead.quote_total ? parseFloat(lead.quote_total) : null;
  const quoteAccepted = !!(lead.project_quote_accepted_at || lead.quote_accepted_at);
  const quoteDeclined = !!(lead.project_quote_declined_at || lead.quote_declined_at);
  const quoteSent = !!(lead.project_quote_sent_at || lead.quote_sent_at);
  const paymentAmount = lead.payment_amount ? parseFloat(lead.payment_amount) : null;
  const paymentStatus = lead.payment_status;
  const invoiceSent = !!(lead.invoice_number || lead.invoice_sent_at);
  const assignedTo = lead.assigned_to || null;

  // Quote sub label
  const quoteSubLabel = quoteAccepted ? { text: 'Accepted ✓', color: '#34d399' }
    : quoteDeclined ? { text: 'Declined', color: '#f87171' }
    : quoteSent ? { text: 'Sent ✓', color: '#60a5fa' }
    : quoteTotal ? { text: 'Not sent', color: 'rgba(255,255,255,0.25)' }
    : null;

  // Payment sub label
  const paymentSubLabel = paymentStatus === 'paid'
    ? { text: 'Paid in full ✓', color: '#34d399' }
    : paymentStatus === 'partial' && paymentAmount && quoteTotal
    ? { text: `${fmt(quoteTotal - paymentAmount)} due`, color: '#fbbf24' }
    : quoteTotal
    ? { text: fmt(quoteTotal) + ' due', color: 'rgba(255,255,255,0.25)' }
    : null;

  // Snapshot columns — only show if has data
  const snapshotItems = [
    {
      id: 'schedule',
      label: 'Scheduled',
      value: scheduledDate,
      sub: scheduledTime,
      subColor: 'rgba(255,255,255,0.4)',
      hasData: !!scheduledDate,
    },
    {
      id: 'quote',
      label: 'Quote',
      value: quoteTotal ? fmt(quoteTotal) : null,
      sub: quoteSubLabel?.text,
      subColor: quoteSubLabel?.color,
      hasData: !!quoteTotal,
    },
    {
      id: 'payment',
      label: 'Payment',
      value: paymentAmount ? fmt(paymentAmount) + ' paid' : quoteTotal ? 'Unpaid' : null,
      sub: paymentSubLabel?.text,
      subColor: paymentSubLabel?.color,
      hasData: !!(quoteTotal || paymentAmount),
    },
    {
      id: 'assigned',
      label: 'Assigned',
      value: assignedTo,
      sub: null,
      subColor: null,
      hasData: !!assignedTo,
    },
    {
      id: 'sent',
      label: 'Sent',
      value: quoteSent ? 'Quote ✓' : 'Quote —',
      valueColor: quoteSent ? '#34d399' : 'rgba(255,255,255,0.2)',
      sub: invoiceSent ? 'Invoice ✓' : 'Invoice —',
      subColor: invoiceSent ? '#60a5fa' : 'rgba(255,255,255,0.2)',
      hasData: true,
    },
  ].filter(i => i.hasData);

  // ── TABS ──────────────────────────────────────────────────
const tabs: { id: string; label: string; icon: React.ElementType; show: boolean; locked: boolean }[] = [
    { id: 'overview',  label: 'Overview',  icon: User,          show: true, locked: false },
    { id: 'schedule',  label: 'Schedule',  icon: Calendar,      show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'quote',     label: 'Quote',     icon: FileText,      show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'payment',   label: 'Billing',   icon: CreditCard,    show: isProject || !can(planTier, 'quotes'), locked: !can(planTier, 'quotes') },
    { id: 'tasks',     label: 'Tasks',     icon: ListChecks,    show: isProject || !can(planTier, 'custom_tasks'), locked: !can(planTier, 'custom_tasks') },
    { id: 'photos',    label: 'Media',     icon: ImageIcon,     show: isProject || !can(planTier, 'docs_on_card'), locked: !can(planTier, 'docs_on_card') },
    { id: 'activity',  label: 'Activity',  icon: MessageCircle, show: isProject, locked: false },
    { id: 'reminders', label: 'Reminders', icon: Bell,          show: isProject || !can(planTier, 'scheduling'), locked: !can(planTier, 'scheduling') },
    { id: 'ai',        label: 'AI',        icon: Sparkles,      show: isProject || !can(planTier, 'ai_brief'), locked: !can(planTier, 'ai_brief') },
  ].filter(t => t.show) as { id: string; label: string; icon: React.ElementType; show: boolean; locked: boolean }[];

  return (
    <div className="flex-shrink-0 relative" style={{ background: '#0f172a' }}>
      <div className="px-5 pt-4 pb-0">

        {/* ── TOP ROW: back · name + meta · more · close ── */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <ArrowLeft className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-extrabold text-white leading-tight truncate">{lead.name}</h2>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
{lead.category_label || (lead.category ? lead.category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'No category')}
              {isProject && lead.project_number ? ` · #${lead.project_number}` : ''}
              {' · '}Submitted {fmtDate(lead.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onMoreMenu && (
              <button onClick={onMoreMenu}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <MoreVertical className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            )}
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <X className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>
        </div>

        {/* ── STATUS — left aligned below name ── */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowStatusMenu(v => !v)}
            disabled={isUpdatingStatus}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: `${statusHex}20`, border: `1px solid ${statusHex}40`, color: statusHex }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusHex }} />
            {isUpdatingStatus ? 'Saving...' : currentStatus?.label}
            <ChevronDown className="w-3 h-3 opacity-60" />
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
                  {statusOptions.map((s: any) => {
                    const hex = getStatusColor(s.color);
                    return (
                      <button key={s.value}
                        onClick={() => { onStatusChange(s.value); setShowStatusMenu(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: hex }} />
                        {s.label}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* ── SNAPSHOT ROW ── */}
        {isProject && snapshotItems.length > 0 && (
          <div
            className="flex items-start mb-1"
            style={{ borderTop: '0.5px solid rgba(255,255,255,0.08)', paddingTop: 12, paddingBottom: 6 }}
          >
            {snapshotItems.map((item, i) => (
              <div
                key={item.id}
                className="flex-1 min-w-0"
                style={{
                  paddingLeft: i > 0 ? 12 : 0,
                  paddingRight: i < snapshotItems.length - 1 ? 12 : 0,
                  borderLeft: i > 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                }}
              >
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 3px', whiteSpace: 'nowrap' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 12, fontWeight: 500, color: (item as any).valueColor || 'white', margin: 0, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.value || '—'}
                </p>
                {item.sub && (
                  <p style={{ fontSize: 9, color: item.subColor || 'rgba(255,255,255,0.3)', margin: '2px 0 0', whiteSpace: 'nowrap' }}>
                    {item.sub}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

      {/* ── TAB BAR — pill segment control ── */}
        {tabs.length > 1 && <div className="py-3">
          <div
            className="flex items-center overflow-x-auto sm:overflow-visible"
            style={{
              scrollbarWidth: 'none',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 99,
              padding: '3px',
              gap: 2,
            }}
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
                 className="flex-shrink-0 sm:flex-1 flex items-center justify-center gap-1 whitespace-nowrap transition-all"
                  style={{
                    padding: '6px 10px',
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#0f172a' : tab.locked ? '#60a5fa' : 'rgba(255,255,255,0.45)',
                    background: isActive ? 'white' : 'transparent',
                    boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                    border: isActive ? '1px solid transparent' : '1px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent'; }}
                >
                  <tab.icon className="hidden sm:block w-3 h-3 flex-shrink-0" />
                  {tab.label}
                  {tab.locked && <Sparkles className="w-2.5 h-2.5 text-yellow-400" />}
                </button>
              );
            })}
          </div>
        </div>}

      </div>
    </div>
    
  );
  
}