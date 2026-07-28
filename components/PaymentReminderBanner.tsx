'use client';

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, ExternalLink, AlertCircle, Clock, Trash2, ChevronRight, Loader2 } from 'lucide-react';
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
      {/* ── Compact Banner ── */}
      <div
        className={`mx-4 sm:mx-6 mb-4 rounded-xl border shadow-sm transition-all duration-200 group cursor-pointer ${
          hasOverdue
            ? 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-50 hover:border-rose-300'
            : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-50 hover:border-amber-300'
        }`}
        onClick={() => setShowTable(true)}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              hasOverdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {hasOverdue
                ? <AlertCircle className="w-4 h-4" />
                : <Clock className="w-4 h-4" />
              }
            </div>
            
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              {overdue.length > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  {overdue.length} Overdue
                </span>
              )}
              {upcoming.length > 0 && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  {upcoming.length} Due Soon
                </span>
              )}
              <span className="text-xs font-medium text-slate-500 hidden sm:inline-block truncate">
                Click to review pending payment reminders
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 flex items-center gap-0.5 transition-colors">
              Review <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={e => { e.stopPropagation(); handleDismiss(); }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Table Modal ── */}
      {showTable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowTable(false)}
          />

          <div className="relative w-full sm:max-w-3xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[85vh] flex flex-col border border-slate-100">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Payment Reminders</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {overdue.length > 0 && `${overdue.length} overdue`}
                    {overdue.length > 0 && upcoming.length > 0 && ' · '}
                    {upcoming.length > 0 && `${upcoming.length} due soon`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </button>
                <button
                  onClick={() => setShowTable(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto overflow-y-auto max-h-[55vh]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md border-b border-slate-100 z-10">
                  <tr>
                    {['Customer & Job', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map(r => {
                    const isSent = sentIds.includes(r.project_id) || r.reminder_sent_recently;
                    const isSending = sending === r.project_id;

                    return (
                      <tr key={r.project_id} className={`group hover:bg-slate-50/80 transition-colors ${r.is_overdue ? 'bg-rose-50/20' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-900">{r.customer_name}</p>
                          <p className="text-[11px] font-medium text-slate-400">Project #{r.project_number}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-900">
                            ${Number(r.payment_amount || r.quote_total || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            r.is_overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.is_overdue ? 'Overdue' : 'Due'}{' '}
                            {new Date(r.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500 capitalize">
                              {r.payment_status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {onSelectLead && (
                              <button
                                onClick={() => handleViewProject(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                                View
                              </button>
                            )}
                            <button
                              onClick={() => handleSend(r)}
                              disabled={isSent || isSending}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                isSent
                                  ? 'bg-slate-100 text-slate-400 border border-slate-200/60 shadow-none cursor-default'
                                  : isSending
                                  ? 'bg-slate-200 text-slate-500 cursor-wait'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                              }`}
                            >
                              {isSending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              {isSending ? 'Sending...' : isSent ? 'Sent' : 'Send'}
                            </button>
                            <button
                              onClick={() => handleHide(r.project_id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-rose-50"
                              title="Hide item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-slate-100 overflow-y-auto flex-1">
              {sorted.map(r => {
                const isSent = sentIds.includes(r.project_id) || r.reminder_sent_recently;
                const isSending = sending === r.project_id;

                return (
                  <div key={r.project_id} className={`p-4 ${r.is_overdue ? 'bg-rose-50/30' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{r.customer_name}</p>
                          <span className="text-[11px] font-semibold text-slate-400">#{r.project_number}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold text-slate-900">
                            ${Number(r.payment_amount || r.quote_total || 0).toLocaleString()}
                          </span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                            r.is_overdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {r.is_overdue ? 'Overdue' : 'Due'}{' '}
                            {new Date(r.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleHide(r.project_id)}
                        className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSelectLead && (
                        <button
                          onClick={() => handleViewProject(r)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition-colors hover:bg-slate-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleSend(r)}
                        disabled={isSent || isSending}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isSent
                            ? 'bg-slate-100 text-slate-400 border border-slate-200/60 shadow-none'
                            : isSending
                            ? 'bg-slate-200 text-slate-500'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                        }`}
                      >
                        {isSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        {isSending ? 'Sending...' : isSent ? 'Sent' : 'Send Reminder'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <p className="text-[11px] font-medium text-slate-400">
                Reminders reset daily
              </p>
              <button
                onClick={handleDismiss}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
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