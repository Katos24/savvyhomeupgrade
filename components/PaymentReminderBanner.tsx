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

export default function PaymentReminderBanner({ slug }: { slug: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const [sent, setSent] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if dismissed today
    const dismissedAt = sessionStorage.getItem('payment_banner_dismissed');
    if (dismissedAt) { setDismissed(true); setLoaded(true); return; }

    fetch(`/api/company/${slug}/payment-reminders`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.reminders.length > 0) setReminders(data.reminders);
      })
      .finally(() => setLoaded(true));
  }, [slug]);

  const handleDismiss = () => {
    sessionStorage.setItem('payment_banner_dismissed', new Date().toISOString());
    setDismissed(true);
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
        setSent(prev => new Set(prev).add(reminder.project_id));
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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (!loaded || dismissed || reminders.length === 0) return null;

  const overdue = reminders.filter(r => r.is_overdue);
  const upcoming = reminders.filter(r => !r.is_overdue);

  return (
    <div className="mb-4 border overflow-hidden shadow-sm" style={{ borderColor: overdue.length > 0 ? '#fca5a5' : '#fde68a' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ backgroundColor: overdue.length > 0 ? '#fef2f2' : '#fffbeb' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          {overdue.length > 0
            ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            : <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />}
          <span className="text-sm font-bold" style={{ color: overdue.length > 0 ? '#991b1b' : '#92400e' }}>
            {overdue.length > 0 && `${overdue.length} overdue payment${overdue.length > 1 ? 's' : ''}`}
            {overdue.length > 0 && upcoming.length > 0 && ' · '}
            {upcoming.length > 0 && `${upcoming.length} due within 7 days`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 hover:bg-black/5 rounded transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="divide-y divide-gray-100 bg-white">
          {/* Overdue section */}
          {overdue.length > 0 && (
            <>
              <div className="px-4 py-2 bg-red-50">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Overdue</span>
              </div>
              {overdue.map(r => (
                <ReminderRow key={r.project_id} reminder={r} sending={sending} sent={sent} onSend={handleSend} fmt={fmt} formatDate={formatDate} />
              ))}
            </>
          )}

          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <>
              <div className="px-4 py-2 bg-amber-50">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Due Soon</span>
              </div>
              {upcoming.map(r => (
                <ReminderRow key={r.project_id} reminder={r} sending={sending} sent={sent} onSend={handleSend} fmt={fmt} formatDate={formatDate} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderRow({ reminder, sending, sent, onSend, fmt, formatDate }: {
  reminder: Reminder;
  sending: number | null;
  sent: Set<number>;
  onSend: (r: Reminder) => void;
  fmt: (n: string | number) => string;
  formatDate: (d: string) => string;
}) {
  const isSent = sent.has(reminder.project_id);
  const isSending = sending === reminder.project_id;
  const amount = reminder.payment_amount || reminder.quote_total;

  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{reminder.customer_name}</span>
          {reminder.project_number && (
            <span className="text-xs text-gray-400">#{reminder.project_number}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {amount && <span className="text-xs font-bold text-gray-600">{fmt(amount)}</span>}
          <span className="text-xs text-gray-400">due {formatDate(reminder.payment_due_date)}</span>
          {reminder.reminder_sent_recently && !isSent && (
            <span className="text-xs text-gray-300">· reminded recently</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onSend(reminder)}
        disabled={isSending || isSent}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition flex-shrink-0 ml-4 ${
          isSent
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
            : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white'
        }`}
      >
        {isSent
          ? <><CheckCircle className="w-3.5 h-3.5" /> Sent</>
          : isSending
          ? 'Sending...'
          : <><Send className="w-3.5 h-3.5" /> Send Reminder</>}
      </button>
    </div>
  );
}