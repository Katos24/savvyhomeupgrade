'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, ExternalLink, AlertCircle, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
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
  payment_status: string;
  is_overdue: boolean;
  reminder_sent_recently: boolean;
};

const STORAGE_KEY = 'payment_banner_v2';
const CACHE_KEY = 'payment_banner_cache_v1';
// Refetch at most this often — avoids hitting the API on every dashboard
// mount/navigation. Reminders are inherently low-frequency data (due dates
// don't shift minute to minute), so an hour is plenty fresh.
const CACHE_TTL_MS = 60 * 60 * 1000;

function loadStorage(): { dismissed: boolean; sentIds: number[]; hiddenIds: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: false, sentIds: [], hiddenIds: [] };
    const data = JSON.parse(raw);
    if (data.dismissedAt) {
      const dismissedDay = new Date(data.dismissedAt).toDateString();
      if (dismissedDay !== new Date().toDateString()) {
        return { dismissed: false, sentIds: data.sentIds || [], hiddenIds: data.hiddenIds || [] };
      }
    }
    return {
      dismissed: !!data.dismissedAt,
      sentIds: data.sentIds || [],
      hiddenIds: data.hiddenIds || [],
    };
  } catch {
    return { dismissed: false, sentIds: [], hiddenIds: [] };
  }
}

function saveStorage(dismissed: boolean, sentIds: number[], hiddenIds: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      dismissedAt: dismissed ? new Date().toISOString() : null,
      sentIds,
      hiddenIds,
    }));
  } catch {}
}

function loadCache(slug: string): { reminders: Reminder[]; fetchedAt: number } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${slug}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.fetchedAt > CACHE_TTL_MS) return null; // stale
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

interface PaymentReminderBannerProps {
  slug: string;
  planTier: PlanTier;
  onSelectLead?: (lead: any) => void;
  allLeads?: any[];
}

export default function PaymentReminderBanner({ slug, planTier, onSelectLead, allLeads = [] }: PaymentReminderBannerProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Feature isn't available on this plan at all — don't fetch, don't render.
  // Avoids hitting an endpoint that can only ever 403 for this account.
  const featureAvailable = can(planTier, 'send_payment_reminder');

  useEffect(() => {
    if (!featureAvailable) {
      setLoaded(true);
      return;
    }

    const stored = loadStorage();
    setDismissed(stored.dismissed);
    setSentIds(stored.sentIds);
    setHiddenIds(stored.hiddenIds);
    if (stored.dismissed) { setLoaded(true); return; }

    // Serve from cache if it's fresh enough — skip the network call entirely.
    const cached = loadCache(slug);
    if (cached) {
      setReminders(cached.reminders);
      setLoaded(true);
      return;
    }

    fetch(`/api/company/${slug}/payment-reminders`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const list = data.reminders || [];
          setReminders(list);
          saveCache(slug, list);
        }
      })
      .finally(() => setLoaded(true));
  }, [slug, featureAvailable]);

  const handleSend = async (reminder: Reminder) => {
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
        saveStorage(dismissed, updated, hiddenIds);
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
    saveStorage(dismissed, sentIds, updated);
  };

  const handleClearAll = () => {
    const allIds = visible.map(r => r.project_id);
    const updated = [...hiddenIds, ...allIds];
    setHiddenIds(updated);
    saveStorage(dismissed, sentIds, updated);
    setShowTable(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    saveStorage(true, sentIds, hiddenIds);
    setShowTable(false);
  };

  const handleViewProject = (reminder: Reminder) => {
    if (!onSelectLead) return;
    const lead = allLeads.find(l => l.id === reminder.lead_id);
    if (lead) {
      onSelectLead(lead);
      setShowTable(false);
      return;
    }
    fetch(`/api/leads/${reminder.lead_id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.lead) {
          onSelectLead(data.lead);
          setShowTable(false);
        }
      })
      .catch(() => toast.error('Could not open project'));
  };

  if (!featureAvailable || !loaded || dismissed) return null;

  const visible = reminders.filter(r => !hiddenIds.includes(r.project_id));
  if (visible.length === 0) return null;

  const overdue  = visible.filter(r => r.is_overdue);
  const upcoming = visible.filter(r => !r.is_overdue);
  const hasOverdue = overdue.length > 0;
  const sorted = [...overdue, ...upcoming];

  return (
    <>
      {/* ── Compact banner ── */}
      <div
        className={`mx-4 sm:mx-6 mb-3 rounded-lg border cursor-pointer transition-all ${
          hasOverdue
            ? 'bg-red-50 border-red-200 hover:bg-red-100'
            : 'bg-amber-50 border-amber-200 hover:bg-amber-100'
        }`}
        onClick={() => setShowTable(true)}
      >
        <div className="flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-2.5">
            {hasOverdue
              ? <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            }
            <div className="flex items-center gap-1.5 flex-wrap">
              {overdue.length > 0 && (
                <span className="text-xs font-semibold text-red-600">
                  {overdue.length} overdue
                </span>
              )}
              {overdue.length > 0 && upcoming.length > 0 && (
                <span className="text-xs text-slate-300">·</span>
              )}
              {upcoming.length > 0 && (
                <span className="text-xs font-semibold text-amber-600">
                  {upcoming.length} due soon
                </span>
              )}
              <span className="text-xs text-slate-400 hidden sm:inline">
                — click to review
              </span>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Table modal ── */}
      {showTable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setShowTable(false)}
          />

          <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Payment reminders</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {overdue.length > 0 && `${overdue.length} overdue`}
                  {overdue.length > 0 && upcoming.length > 0 && ' · '}
                  {upcoming.length > 0 && `${upcoming.length} due soon`}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-slate-400 hover:text-red-500 transition px-2.5 py-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
                <button
                  onClick={() => setShowTable(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table — desktop */}
            <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[50vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-100">
                    {['Customer', 'Amount', 'Due date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-3.5 py-2 text-left text-[11px] font-medium text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sorted.map(r => (
                    <tr key={r.project_id} className={`group transition ${r.is_overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-3.5 py-2.5">
                        <p className="text-sm font-medium text-slate-900">{r.customer_name}</p>
                        <p className="text-[11px] text-slate-400">#{r.project_number}</p>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className="text-sm font-semibold text-slate-900">
                          ${Number(r.payment_amount || r.quote_total || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <span className={`text-xs font-medium ${r.is_overdue ? 'text-red-600' : 'text-amber-600'}`}>
                          {r.is_overdue ? 'Overdue' : 'Due'}{' '}
                          {new Date(r.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        {sentIds.includes(r.project_id) || r.reminder_sent_recently ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle className="w-3 h-3" /> Sent
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            {r.payment_status}
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5">
                          {onSelectLead && (
                            <button
                              onClick={() => handleViewProject(r)}
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[11px] font-medium transition"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleSend(r)}
                            disabled={sentIds.includes(r.project_id) || r.reminder_sent_recently || sending === r.project_id}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition ${
                              sentIds.includes(r.project_id) || r.reminder_sent_recently
                                ? 'bg-slate-100 text-slate-300 cursor-default'
                                : sending === r.project_id
                                ? 'bg-slate-200 text-slate-400 cursor-wait'
                                : 'bg-slate-900 text-white hover:bg-indigo-600'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            {sending === r.project_id ? 'Sending...' : sentIds.includes(r.project_id) || r.reminder_sent_recently ? 'Sent' : 'Send'}
                          </button>
                          <button
                            onClick={() => handleHide(r.project_id)}
                            className="p-1.5 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-red-50"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-slate-100 overflow-y-auto flex-1">
              {sorted.map(r => (
                <div key={r.project_id} className={`px-4 py-3 ${r.is_overdue ? 'bg-red-50/40' : ''}`}>
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{r.customer_name}</p>
                        <span className="text-[11px] text-slate-400">#{r.project_number}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-slate-900">
                          ${Number(r.payment_amount || r.quote_total || 0).toLocaleString()}
                        </span>
                        <span className={`text-[11px] font-medium ${r.is_overdue ? 'text-red-500' : 'text-amber-500'}`}>
                          {r.is_overdue ? '· Overdue' : '· Due'}{' '}
                          {new Date(r.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleHide(r.project_id)}
                      className="p-1.5 text-slate-200 hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {onSelectLead && (
                      <button
                        onClick={() => handleViewProject(r)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View project
                      </button>
                    )}
                    <button
                      onClick={() => handleSend(r)}
                      disabled={sentIds.includes(r.project_id) || r.reminder_sent_recently || sending === r.project_id}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
                        sentIds.includes(r.project_id) || r.reminder_sent_recently
                          ? 'bg-slate-100 text-slate-300 cursor-default'
                          : sending === r.project_id
                          ? 'bg-slate-200 text-slate-400'
                          : 'bg-slate-900 text-white hover:bg-indigo-600'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {sending === r.project_id ? 'Sending...' : sentIds.includes(r.project_id) || r.reminder_sent_recently ? 'Sent' : 'Send reminder'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-slate-400">
                Reminders reset daily
              </p>
              <button
                onClick={handleDismiss}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition"
              >
                Dismiss for today
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}