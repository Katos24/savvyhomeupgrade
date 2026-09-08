'use client';

import { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle, AlertCircle, Clock, Trash2, ExternalLink, Loader2, X, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { can, type PlanTier } from '@/lib/permissions';

type Reminder = {
  lead_id: number;
  project_id: number;
  project_number: number;
  customer_name: string;
  customer_email: string;
  payment_due_date: string;
  payment_amount: string;
  quote_total: string;
  amount_due: number;
  is_deposit: boolean;
  payment_status: string;
  is_overdue: boolean;
  reminder_sent_recently: boolean;
};

const STORAGE_KEY = 'payment_reminders_widget_v1';
const CACHE_KEY = 'payment_banner_cache_v2';
const CACHE_TTL_MS = 60 * 60 * 1000;

function loadStorage(): { sentIds: number[]; hiddenIds: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sentIds: [], hiddenIds: [] };
    const data = JSON.parse(raw);
    return {
      sentIds: data.sentIds || [],
      hiddenIds: data.hiddenIds || [],
    };
  } catch {
    return { sentIds: [], hiddenIds: [] };
  }
}

function saveStorage(sentIds: number[], hiddenIds: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sentIds, hiddenIds }));
  } catch {}
}

function loadCache(slug: string): { reminders: Reminder[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${slug}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.fetchedAt > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCache(slug: string, reminders: Reminder[]) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${slug}`, JSON.stringify({
      reminders,
      fetchedAt: Date.now(),
    }));
  } catch {}
}

const fmtAmount = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface PaymentRemindersWidgetProps {
  slug: string;
  companyName: string;
  planTier: PlanTier;
  isDark?: boolean;
  onSelectLead?: (leadId: number) => void;
}

export default function PaymentRemindersWidget({
  slug,
  companyName,
  planTier,
  isDark = true,
  onSelectLead,
}: PaymentRemindersWidgetProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [sending, setSending] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  
  // Modal state for confirming reminder
  const [previewReminder, setPreviewReminder] = useState<Reminder | null>(null);

  const featureAvailable = can(planTier, 'send_payment_reminder');

  const fetchReminders = useCallback(() => {
    return fetch(`/api/company/${slug}/payment-reminders`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const list = data.reminders || [];
          setReminders(list);
          saveCache(slug, list);
        }
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!featureAvailable) {
      setLoaded(true);
      return;
    }

    const stored = loadStorage();
    setSentIds(stored.sentIds);
    setHiddenIds(stored.hiddenIds);

    // Cache paints instantly if present — fast initial render, not a
    // substitute for a real fetch.
    const cached = loadCache(slug);
    if (cached) {
      setReminders(cached.reminders);
      setLoaded(true);
    }

    // Always fetch fresh regardless of cache hit. The old version
    // returned early on a cache hit and skipped this call entirely —
    // which meant a reminder for a job that just got paid could sit here
    // for up to the full hour-long cache TTL, even while this exact
    // widget was on screen the whole time.
    fetchReminders().finally(() => setLoaded(true));

    // Keep it current while the widget stays mounted, same 30s interval
    // convention LeadsClient.tsx already uses for its new-lead poll — a
    // payment made mid-session clears within one interval instead of
    // requiring a full page reload to notice.
    const interval = setInterval(() => {
      if (document.hidden) return;
      fetchReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, [slug, featureAvailable, fetchReminders]);

  const handleConfirmSend = async (reminder: Reminder) => {
    setSending(reminder.project_id);
    try {
      const res = await fetch(`/api/company/${slug}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: reminder.lead_id,
          project_id: reminder.project_id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reminder sent to ${reminder.customer_name}`);
        const updated = [...sentIds, reminder.project_id];
        setSentIds(updated);
        saveStorage(updated, hiddenIds);
        setPreviewReminder(null);
      } else {
        toast.error(data.error || 'Failed to send reminder');
      }
    } catch {
      toast.error('Network error — could not send reminder');
    } finally {
      setSending(null);
    }
  };

  const handleHide = (id: number) => {
    const updated = [...hiddenIds, id];
    setHiddenIds(updated);
    saveStorage(sentIds, updated);
  };

  const handleClearAll = () => {
    const allIds = visible.map((r) => r.project_id);
    const updated = [...hiddenIds, ...allIds];
    setHiddenIds(updated);
    saveStorage(sentIds, updated);
  };

  if (!featureAvailable || !loaded) return null;

  const visible = reminders.filter((r) => !hiddenIds.includes(r.project_id));
  const overdue = visible.filter((r) => r.is_overdue);
  const upcoming = visible.filter((r) => !r.is_overdue);
  const sorted = [...overdue, ...upcoming];

  const cardBg = isDark ? 'bg-[#0f1420] border-white/10' : 'bg-white border-[#e7e2d8]';
  const textPrimary = isDark ? 'text-white' : 'text-[#1c1917]';
  const textSecondary = isDark ? 'text-slate-400' : 'text-[#78716c]';
  const divideBorder = isDark ? 'divide-white/10' : 'divide-[#e7e2d8]';

  return (
    <>
      <div className={`rounded-2xl border ${cardBg} overflow-hidden font-sans flex flex-col h-full`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-5 py-3.5 border-b ${divideBorder}`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${overdue.length > 0 ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {overdue.length > 0 ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className={`text-sm sm:text-base font-semibold ${textPrimary}`}>
                Payment Reminders
              </h3>
              <p className={`text-xs ${textSecondary}`}>
                {overdue.length > 0 && <span className="text-rose-500 font-bold">{overdue.length} Overdue</span>}
                {overdue.length > 0 && upcoming.length > 0 && ' · '}
                {upcoming.length > 0 && <span className="text-amber-500 font-bold">{upcoming.length} Due Soon</span>}
                {visible.length === 0 && 'No active reminders'}
              </p>
            </div>
          </div>

          {visible.length > 0 && (
            <button
              onClick={handleClearAll}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              }`}
              title="Clear all active reminders"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear all</span>
            </button>
          )}
        </div>

        {/* Reminders List */}
        <div className={`divide-y overflow-y-auto max-h-[380px] flex-1 ${divideBorder}`}>
          {visible.length === 0 ? (
            <div className="p-8 text-center">
              <p className={`text-xs sm:text-sm ${textSecondary}`}>All payment reminders are up to date.</p>
            </div>
          ) : (
            sorted.map((r) => {
              const isSent = sentIds.includes(r.project_id) || r.reminder_sent_recently;

              return (
                <div
                  key={r.project_id}
                  className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                    r.is_overdue
                      ? isDark ? 'bg-rose-950/10 hover:bg-rose-950/20' : 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isDark ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]'
                  }`}
                >
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold truncate ${textPrimary}`}>{r.customer_name}</p>
                      <span className={`text-xs font-mono ${textSecondary}`}>#{r.project_number}</span>
                      {r.is_deposit && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          Deposit
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className={`font-bold ${textPrimary}`}>{fmtAmount(r.amount_due)}</span>
                      <span className="text-slate-400">•</span>
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded ${
                          r.is_overdue
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {r.is_overdue ? 'Overdue' : 'Due'}{' '}
                        {new Date(r.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectLead && (
                      <button
                        onClick={() => onSelectLead(r.lead_id)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isDark
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="View Lead"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setPreviewReminder(r)}
                      disabled={isSent}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                        isSent
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 shadow-none cursor-default'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                      }`}
                    >
                      {isSent ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      {isSent ? 'Sent' : 'Send'}
                    </button>

                    <button
                      onClick={() => handleHide(r.project_id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Hide reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Email Preview & Confirmation Modal */}
      {previewReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#141a29] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${divideBorder}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Send Payment Reminder</h3>
                  <p className={`text-xs ${textSecondary}`}>Preview message before sending</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewReminder(null)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Fields Preview */}
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className={`text-xs font-semibold ${textSecondary}`}>Recipient</span>
                <p className={`font-mono p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  {previewReminder.customer_name} &lt;{previewReminder.customer_email || 'No email provided'}&gt;
                </p>
              </div>

              <div className="space-y-1">
                <span className={`text-xs font-semibold ${textSecondary}`}>Subject</span>
                <p className={`font-medium p-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  Payment Reminder for Project #{previewReminder.project_number} — {companyName}
                </p>
              </div>

              <div className="space-y-1">
                <span className={`text-xs font-semibold ${textSecondary}`}>Email Body Preview</span>
                <div className={`p-3.5 rounded-xl border leading-relaxed space-y-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <p>Hi {previewReminder.customer_name.split(' ')[0]},</p>
                  <p>
                    This is a friendly reminder regarding your outstanding balance of{' '}
                    <strong className={textPrimary}>{fmtAmount(previewReminder.amount_due)}</strong> for Project #{previewReminder.project_number}.
                  </p>
                  <p>
                    Due Date:{' '}
                    <strong className={previewReminder.is_overdue ? 'text-rose-500' : textPrimary}>
                      {new Date(previewReminder.payment_due_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </strong>
                  </p>
                  <p>Please click the link below to view your invoice and complete your payment.</p>
                  <p className="pt-2 font-medium">Thank you,<br />{companyName}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-end gap-2.5 px-5 py-4 border-t ${divideBorder} ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50'}`}>
              <button
                onClick={() => setPreviewReminder(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmSend(previewReminder)}
                disabled={sending === previewReminder.project_id || !previewReminder.customer_email}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {sending === previewReminder.project_id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Email Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}