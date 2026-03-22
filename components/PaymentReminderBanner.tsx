'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Clock, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

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

// ── localStorage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = 'payment_banner_v2';

function loadStorage(): { dismissed: boolean; sentIds: number[]; hiddenIds: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { dismissed: false, sentIds: [], hiddenIds: [] };
    const data = JSON.parse(raw);
    // Reset daily dismiss at midnight
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

// ── Component ──────────────────────────────────────────────────────────────
export default function PaymentReminderBanner({ slug }: { slug: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const [sentIds, setSentIds] = useState<number[]>([]);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadStorage();
    setDismissed(stored.dismissed);
    setSentIds(stored.sentIds);
    setHiddenIds(stored.hiddenIds);

    if (stored.dismissed) { setLoaded(true); return; }

    fetch(`/api/company/${slug}/payment-reminders`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.reminders?.length > 0) {
          setReminders(data.reminders);
        }
      })
      .finally(() => setLoaded(true));
  }, [slug]);

  const handleDismissAll = () => {
    saveStorage(true, sentIds, hiddenIds);
    setDismissed(true);
  };

  const handleHideRow = (projectId: number) => {
    const updated = [...hiddenIds, projectId];
    setHiddenIds(updated);
    saveStorage(dismissed, sentIds, updated);
  };

  const handleSend = async (reminder: Reminder) => {
    setSending(reminder.project_id);
    try {
      const res = await fetch(`/api/company/${slug}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: reminder.lead_id, project_id: reminder.project_id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reminder sent to ${reminder.customer_name}`);
        const updated = [...sentIds, reminder.project_id];
        setSentIds(updated);
        saveStorage(dismissed, updated, hiddenIds);
      } else {
        toast.error(data.error || 'Failed to send');
      }
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSending(null);
    }
  };

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

  const formatDate = (d: string | null | undefined) => {
    if (!d) return null;
    const date = new Date(d);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!loaded || dismissed) return null;

  // Filter out hidden rows
  const visible = reminders.filter(r => !hiddenIds.includes(r.project_id));
  if (visible.length === 0) return null;

  const overdue = visible.filter(r => r.is_overdue);
  const upcoming = visible.filter(r => !r.is_overdue);
  const hasOverdue = overdue.length > 0;

  return (
    <div
      className="mb-4 border overflow-hidden shadow-sm"
      style={{ borderColor: hasOverdue ? '#fca5a5' : '#fde68a' }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        style={{ backgroundColor: hasOverdue ? '#fef2f2' : '#fffbeb' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          {hasOverdue
            ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            : <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
          <span className="text-sm font-bold" style={{ color: hasOverdue ? '#991b1b' : '#92400e' }}>
            {overdue.length > 0 && `${overdue.length} overdue payment${overdue.length > 1 ? 's' : ''}`}
            {overdue.length > 0 && upcoming.length > 0 && ' · '}
            {upcoming.length > 0 && `${upcoming.length} due within 7 days`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
          <button
            onClick={e => { e.stopPropagation(); handleDismissAll(); }}
            className="p-1 hover:bg-black/5 rounded transition"
            title="Dismiss for today"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">

          {overdue.length > 0 && (
            <>
              <div className="px-4 py-2 bg-red-50">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Overdue</span>
              </div>
              {overdue.map(r => (
                <ReminderRow
                  key={r.project_id}
                  reminder={r}
                  sending={sending}
                  isSent={sentIds.includes(r.project_id) || r.reminder_sent_recently}
                  onSend={handleSend}
                  onHide={handleHideRow}
                  fmt={fmt}
                  formatDate={formatDate}
                />
              ))}
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="px-4 py-2 bg-amber-50">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Due Soon</span>
              </div>
              {upcoming.map(r => (
                <ReminderRow
                  key={r.project_id}
                  reminder={r}
                  sending={sending}
                  isSent={sentIds.includes(r.project_id) || r.reminder_sent_recently}
                  onSend={handleSend}
                  onHide={handleHideRow}
                  fmt={fmt}
                  formatDate={formatDate}
                />
              ))}
            </>
          )}

        </div>
      )}
    </div>
  );
}

// ── Row component ──────────────────────────────────────────────────────────
function ReminderRow({
  reminder, sending, isSent, onSend, onHide, fmt, formatDate,
}: {
  reminder: Reminder;
  sending: number | null;
  isSent: boolean;
  onSend: (r: Reminder) => void;
  onHide: (projectId: number) => void;
  fmt: (n: string | number) => string;
  formatDate: (d: string | null | undefined) => string | null;
}) {
  const isSending = sending === reminder.project_id;
  const amount = reminder.payment_amount || reminder.quote_total;
  const dueDateStr = formatDate(reminder.payment_due_date);

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{reminder.customer_name}</span>
          {reminder.project_number && (
            <span className="text-xs text-gray-400">#{reminder.project_number}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {amount && <span className="text-xs font-bold text-gray-600">{fmt(amount)}</span>}
          {dueDateStr && (
            <span className={`text-xs ${reminder.is_overdue ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
              due {dueDateStr}
            </span>
          )}
          {isSent && !isSending && (
            <span className="text-xs text-emerald-600 font-semibold">· reminded</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Send / Sent button */}
        <button
          onClick={() => onSend(reminder)}
          disabled={isSending || isSent}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition ${
            isSent
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
              : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white'
          }`}
        >
          {isSent
            ? <><CheckCircle className="w-3.5 h-3.5" /> Sent</>
            : isSending
            ? 'Sending...'
            : <><Send className="w-3.5 h-3.5" /> Send</>}
        </button>

        {/* Remove this row */}
        <button
          onClick={() => onHide(reminder.project_id)}
          className="p-1.5 hover:bg-gray-100 rounded transition text-gray-300 hover:text-gray-500"
          title="Remove from list"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}