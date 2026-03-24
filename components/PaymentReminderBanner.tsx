'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Clock, Send, CheckCircle, ChevronDown, ChevronRight, ChevronUp, History } from 'lucide-react';
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

const STORAGE_KEY = 'payment_banner_v2';

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
        if (data.success && data.reminders?.length > 0) setReminders(data.reminders);
      })
      .finally(() => setLoaded(true));
  }, [slug]);

  if (!loaded || dismissed) return null;
  const visible = reminders.filter(r => !hiddenIds.includes(r.project_id));
  if (visible.length === 0) return null;

  const overdue = visible.filter(r => r.is_overdue);
  const upcoming = visible.filter(r => !r.is_overdue);
  const hasOverdue = overdue.length > 0;

  return (
    <div className="mb-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* ── COMPACT HEADER ── */}
      <div 
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          <div className="flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${hasOverdue ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-xs font-bold text-slate-700">
              {overdue.length > 0 && `${overdue.length} Overdue`}
              {overdue.length > 0 && upcoming.length > 0 && ' • '}
              {upcoming.length > 0 && `${upcoming.length} Due Soon`}
            </span>
          </div>
        </div>

        <button 
          onClick={e => { e.stopPropagation(); setDismissed(true); saveStorage(true, sentIds, hiddenIds); }}
          className="p-1 hover:text-red-500 text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── SLIM LIST ── */}
      {expanded && (
        <div className="divide-y divide-slate-100">
          {[...overdue, ...upcoming].map(r => (
            <ReminderRow 
              key={r.project_id} 
              reminder={r} 
              sending={sending === r.project_id} 
              isSent={sentIds.includes(r.project_id) || r.reminder_sent_recently}
              onSend={() => {}} // Connect to your handleSend
              onHide={(id: number) => {
                const updated = [...hiddenIds, id];
                setHiddenIds(updated);
                saveStorage(dismissed, sentIds, updated);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, sending, isSent, onSend, onHide }: any) {
  return (
    <div className={`flex flex-wrap sm:flex-nowrap items-center justify-between px-4 py-2 group gap-3 border-l-4 ${reminder.is_overdue ? 'border-l-red-500' : 'border-l-amber-400'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-900 truncate">{reminder.customer_name}</span>
          <span className="text-[10px] text-slate-400 font-medium">#{reminder.project_number}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="text-indigo-600 font-bold">${Number(reminder.payment_amount).toLocaleString()}</span>
          <span>Due {new Date(reminder.payment_due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          {isSent && (
            <span className="flex items-center gap-1 text-emerald-600">
              <History className="w-3 h-3" /> Reminded
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <button
          onClick={(e) => { e.stopPropagation(); onSend(reminder); }}
          disabled={isSent || sending}
          className={`h-8 px-3 rounded-md text-[11px] font-bold transition-all active:scale-95 ${
            isSent 
              ? 'bg-slate-100 text-slate-400 cursor-default' 
              : 'bg-slate-900 text-white hover:bg-indigo-600'
          }`}
        >
          {isSent ? 'Sent' : sending ? 'Sending...' : 'Send'}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onHide(reminder.project_id); }}
          className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}