'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Download, CheckCircle2, XCircle, AlertCircle, XCircle as CloseIcon } from 'lucide-react';
import type { ThemeTokens } from '@/lib/financialsTheme';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function formatCategory(cat: string | null) {
  if (!cat) return 'Uncategorized';
  return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getReceiptCount(project: any): number {
  try {
    const docs = typeof project.documents === 'string' ? JSON.parse(project.documents) : project.documents || [];
    return docs.filter((d: any) => d.type === 'receipt').length;
  } catch { return 0; }
}

function getTaxReady(project: any): boolean {
  return !!(project.quote_total && parseFloat(project.quote_total) > 0 && project.payment_status === 'paid');
}

/* ── REMINDERS PANEL ── */
function RemindersPanel({
  t, company, reminders, loading, sendingId, results, onClose, onSend,
}: {
  t: ThemeTokens;
  company: any;
  reminders: any[];
  loading: boolean;
  sendingId: number | null;
  results: Record<number, { success: boolean; message: string; sent_at?: string }>;
  onClose: () => void;
  onSend: (reminder: any) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div className="relative w-full max-w-md h-full flex flex-col overflow-hidden" style={{ background: t.panelBg, borderLeft: t.panelBorder }}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <div>
            <p className="text-sm font-black" style={{ color: t.text.primary }}>Payment Reminders</p>
            <p className="text-xs mt-0.5" style={{ color: t.text.muted }}>{reminders.length} unpaid jobs</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: t.text.muted }}>
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm" style={{ color: t.text.muted }}>Loading...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm" style={{ color: t.text.muted }}>No outstanding payments</p>
            </div>
          ) : reminders.map(reminder => {
            const result = results[reminder.project_id];
            const isSending = sendingId === reminder.project_id;
            const sentRecently = reminder.reminder_sent_recently || result?.success;
            const total = parseFloat(reminder.quote_total || '0');
            const paid = parseFloat(reminder.payment_amount || '0');
            const due = paid > 0 ? total - paid : total;
            const sentAt = reminder.reminder_sent_at || result?.sent_at;
            const hoursSince = sentAt ? Math.floor((Date.now() - new Date(sentAt).getTime()) / 3600000) : null;

            return (
              <div key={reminder.project_id} className="rounded-2xl p-4" style={{ background: t.cardBg, border: t.cardBorder }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: t.text.primary }}>{reminder.customer_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.text.muted }}>{reminder.customer_email}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs font-black" style={{ color: '#f59e0b' }}>{fmtFull(due)} due</span>
                      {reminder.payment_due_date && (
                        <span className={`text-xs font-medium ${reminder.is_overdue ? 'text-red-400' : ''}`} style={!reminder.is_overdue ? { color: t.text.muted } : {}}>
                          {reminder.is_overdue ? 'Overdue' : 'Due'} {new Date(reminder.payment_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: reminder.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: reminder.payment_status === 'partial' ? '#f59e0b' : '#f87171',
                        }}>
                        {reminder.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </div>
                    {sentRecently && hoursSince !== null && (
                      <p className="text-xs mt-2" style={{ color: t.text.muted }}>
                        Reminder sent {hoursSince === 0 ? 'just now' : `${hoursSince}h ago`}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => !sentRecently && !isSending && onSend(reminder)}
                    disabled={sentRecently || isSending}
                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-black transition-all"
                    style={{
                      background: sentRecently ? t.cardBg : 'rgba(16,185,129,0.12)',
                      color: sentRecently ? t.text.muted : '#10b981',
                      border: `1px solid ${sentRecently ? t.divider : 'rgba(16,185,129,0.2)'}`,
                      cursor: sentRecently ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSending ? 'Sending...' : sentRecently ? 'Sent' : 'Send'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 py-4" style={{ borderTop: `1px solid ${t.divider}` }}>
          <p className="text-xs text-center" style={{ color: t.text.muted }}>Reminders are rate limited to once per 24 hours per job</p>
        </div>
      </div>
    </div>
  );
}

/* ── EXPORTED REF TYPE ── */
export interface FinancialsTableRef {
  openReminderPanel: () => void;
}

/* ── JOBS TABLE ── */
const FinancialsTable = forwardRef<FinancialsTableRef, {
  t: ThemeTokens;
  company: any;
  filtered: any[];
  buildExportParams: () => string;
}>(function FinancialsTable({ t, company, filtered, buildExportParams }, ref) {
  const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);
  const [reminderResults, setReminderResults] = useState<Record<number, { success: boolean; message: string; sent_at?: string }>>({});

  const unpaidCount = filtered.filter(p => !p.payment_status || p.payment_status === 'unpaid' || p.payment_status === 'partial').length;

  const fetchReminders = async () => {
    setRemindersLoading(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/payment-reminders?all=true`);
      const data = await res.json();
      if (data.success) setReminders(data.reminders);
    } catch { } finally { setRemindersLoading(false); }
  };

  const openReminderPanel = () => {
    setReminderPanelOpen(true);
    fetchReminders();
  };

  useImperativeHandle(ref, () => ({ openReminderPanel }));

  const sendReminder = async (reminder: any) => {
    setSendingReminder(reminder.project_id);
    try {
      const res = await fetch(`/api/company/${company.slug}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: reminder.lead_id, project_id: reminder.project_id }),
      });
      const data = await res.json();
      if (data.success) {
        setReminderResults(prev => ({ ...prev, [reminder.project_id]: { success: true, message: 'Sent', sent_at: new Date().toISOString() } }));
        setReminders(prev => prev.map(r => r.project_id === reminder.project_id ? { ...r, reminder_sent_recently: true, reminder_sent_at: new Date().toISOString() } : r));
      } else {
        setReminderResults(prev => ({ ...prev, [reminder.project_id]: { success: false, message: data.error || 'Failed' } }));
      }
    } catch {
      setReminderResults(prev => ({ ...prev, [reminder.project_id]: { success: false, message: 'Network error' } }));
    } finally { setSendingReminder(null); }
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden" style={{ background: t.cardBg, border: t.cardBorder }}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 flex-wrap gap-3" style={{ borderBottom: `1px solid ${t.divider}` }}>
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold" style={{ color: t.text.primary }}>{filtered.length} jobs</p>
            {unpaidCount > 0 && (
         <button
  onClick={openReminderPanel}
  className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}
>
  Send reminders →
</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href={`/api/company/${company.slug}/export-csv?${buildExportParams()}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: t.filterBg, border: t.filterBorder, color: t.text.secondary }}>
              <Download className="w-3 h-3" /> Export CSV
            </a>
            <a href={`/api/company/${company.slug}/export-csv?format=quickbooks&${buildExportParams()}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
              <Download className="w-3 h-3" /> QuickBooks
            </a>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.rowBorder}` }}>
                {['Customer', 'Invoice', 'Category', 'Total', 'Payment', 'Receipts', 'Tax Ready', ''].map((h, i) => (
                  <th key={i} className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${i === 3 ? 'text-right' : 'text-left'}`}
                    style={{ color: t.text.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-20 text-center text-sm" style={{ color: t.text.muted }}>No jobs found</td></tr>
              ) : filtered.map((project, i) => {
                const receiptCount = getReceiptCount(project);
                const taxReady = getTaxReady(project);
                const total = parseFloat(project.quote_total || '0');
                const collected = parseFloat(project.payment_amount || '0');
                return (
                  <tr key={project.id}
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${t.rowBorder}` : 'none' }}
                    className="group transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = t.rowHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold" style={{ color: t.text.primary }}>{project.customer_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: t.text.muted }}>
                        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold" style={{ color: '#10b981' }}>{project.invoice_number || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: t.text.secondary }}>{formatCategory(project.category)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold" style={{ color: t.text.primary }}>{fmtFull(total)}</p>
                      {collected > 0 && collected < total && (
                        <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>{fmtFull(collected)} paid</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: project.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : project.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                          color: project.payment_status === 'paid' ? '#10b981' : project.payment_status === 'partial' ? '#f59e0b' : '#f87171',
                        }}>
                        {project.payment_status === 'paid' ? 'Paid' : project.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {receiptCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#10b981' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />{receiptCount}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f87171' }}>
                          <XCircle className="w-3.5 h-3.5" />None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {taxReady ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#10b981' }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />Ready
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#f59e0b' }}>
                          <AlertCircle className="w-3.5 h-3.5" />Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/${company.slug}/dashboard?lead=${project.lead_id}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                        style={{ color: t.text.muted }}>
                        View →
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y" style={{ borderColor: t.rowBorder }}>
          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm" style={{ color: t.text.muted }}>No jobs found</p>
          ) : filtered.map(project => {
            const receiptCount = getReceiptCount(project);
            const taxReady = getTaxReady(project);
            const total = parseFloat(project.quote_total || '0');
            const collected = parseFloat(project.payment_amount || '0');
            return (
              <div key={project.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: t.text.primary }}>{project.customer_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: t.text.muted }}>
                      {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: project.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : project.payment_status === 'partial' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                      color: project.payment_status === 'paid' ? '#10b981' : project.payment_status === 'partial' ? '#f59e0b' : '#f87171',
                    }}>
                    {project.payment_status === 'paid' ? 'Paid' : project.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: t.text.secondary }}>{formatCategory(project.category)}</span>
                  <span className="text-sm font-bold" style={{ color: t.text.primary }}>{fmtFull(total)}</span>
                </div>
                {collected > 0 && collected < total && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>{fmtFull(collected)} paid · {fmtFull(total - collected)} remaining</p>
                )}
                <div className="flex items-center gap-4">
                  {project.invoice_number && (
                    <span className="text-xs font-bold" style={{ color: '#10b981' }}>{project.invoice_number}</span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: receiptCount > 0 ? '#10b981' : '#f87171' }}>
                    {receiptCount > 0 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {receiptCount > 0 ? `${receiptCount} receipt${receiptCount > 1 ? 's' : ''}` : 'No receipts'}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: taxReady ? '#10b981' : '#f59e0b' }}>
                    {taxReady ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {taxReady ? 'Tax ready' : 'Unpaid'}
                  </span>
                </div>
                <a href={`/${company.slug}/dashboard?lead=${project.lead_id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs font-semibold" style={{ color: '#6366f1' }}>
                  View job →
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {reminderPanelOpen && (
        <RemindersPanel
          t={t}
          company={company}
          reminders={reminders}
          loading={remindersLoading}
          sendingId={sendingReminder}
          results={reminderResults}
          onClose={() => setReminderPanelOpen(false)}
          onSend={sendReminder}
        />
      )}
    </>
  );
});

export default FinancialsTable;