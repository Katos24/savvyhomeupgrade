'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle, AlertCircle, Clock,
  CreditCard, Calendar, MessageSquare,
  ChevronDown, ChevronUp, DollarSign, Send, X, Mail, Eye,
} from 'lucide-react';

type PaymentUpdateProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

export default function PaymentUpdate({ lead, currentUser, onRefresh, hasProject, companySlug }: PaymentUpdateProps) {
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [markPaidInFull, setMarkPaidInFull] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState('');
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const amount = lead?.payment_amount || '';
    const total = parseFloat(lead?.quote_total || '0');
    const paid = parseFloat(amount || '0');
    setPaymentAmount(amount);
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
    setPaymentNotes(lead?.payment_notes || '');
    setPaymentDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setMarkPaidInFull(total > 0 && paid >= total);
  }, [lead?.id]);

  useEffect(() => {
    if (!lead?.id || !companySlug) return;
    async function fetchOutbox() {
      try {
        const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=payment_reminder`);
        const data = await res.json();
        if (data.entries) setOutboxLog(data.entries);
      } catch {}
    }
    fetchOutbox();
  }, [lead?.id, companySlug]);

  useEffect(() => {
  if (markPaidInFull && lead?.quote_total) {
    setPaymentAmount(lead.quote_total.toString());
    // Only default to today if no date is already saved
    if (!paymentDate) {
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }
}, [markPaidInFull, lead?.quote_total]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const total = parseFloat(lead?.quote_total || '0');
  const paid = parseFloat(paymentAmount || '0');
  const remaining = Math.max(total - paid, 0);
  const isPaid = total > 0 && paid >= total;
  const isPartial = paid > 0 && !isPaid;

  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;

  const handleSave = async () => {
    setError('');
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const amount = paymentAmount === '' ? 0 : parseFloat(paymentAmount);
    if (isNaN(amount)) { setError('Please enter a valid number.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: isPaid ? 'paid' : isPartial ? 'partial' : 'unpaid',
          payment_amount: amount,
          payment_method: paymentMethod || null,
          payment_date: paymentDate || null,
          payment_due_date: paymentDueDate || null,
          payment_notes: paymentNotes || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Payment updated!');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to update payment');
      }
    } catch {
      setError('Failed to save payment.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const res = await fetch(`/api/company/${companySlug}/payment-reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: lead.id, project_id: lead.project_id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payment reminder sent!');
        setShowReminderConfirm(false);
        await onRefresh();
        // Refresh outbox log after sending
        const res2 = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=payment_reminder`);
        const data2 = await res2.json();
        if (data2.entries) setOutboxLog(data2.entries);
      } else {
        toast.error(data.error || 'Failed to send reminder');
      }
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <>
      {/* Email preview modal */}
      {previewHtml && (
        <div
          className="fixed inset-0 z-[10000] bg-black/70 flex items-end sm:items-center justify-center"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="relative w-full sm:max-w-2xl flex flex-col bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
            style={{ maxHeight: '92dvh', height: '92dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Email Preview</p>
              </div>
              <button onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div style={{ background: '#fff', borderRadius: '8px', pointerEvents: 'none', color: '#111' }}>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Payment Hub</h3>
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Quote</p>
              <p className="text-sm font-black text-slate-900">{fmt(total)}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="px-6 py-4 bg-white border-b border-slate-50">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                {isPaid
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : isPartial
                    ? <Clock className="w-4 h-4 text-amber-500" />
                    : <AlertCircle className="w-4 h-4 text-slate-300" />
                }
                <span className="text-sm font-bold text-slate-700">
                  {isPaid ? 'Settled' : isPartial ? `${fmt(paid)} collected` : 'Awaiting Payment'}
                </span>
              </div>
              {isPartial && (
                <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  {fmt(remaining)} left
                </span>
              )}
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Amount */}
            <div className="relative group">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    if (markPaidInFull && e.target.value !== lead?.quote_total?.toString()) {
                      setMarkPaidInFull(false);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Method */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Select...</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="zelle">Zelle</option>
                <option value="venmo">Venmo</option>
                <option value="stripe">Stripe</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Payment Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                Due Date
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                <input
                  type="date"
                  value={paymentDueDate}
                  onChange={(e) => setPaymentDueDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Mark Paid in Full */}
          {total > 0 && (
            <div
              onClick={() => setMarkPaidInFull(v => !v)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                markPaidInFull
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  markPaidInFull ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'
                }`}>
                  {markPaidInFull && <CheckCircle className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-bold text-slate-700">Mark as Paid in Full</span>
              </div>
              <span className={`text-xs font-black ${markPaidInFull ? 'text-emerald-600' : 'text-slate-400'}`}>
                {fmt(total)}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 animate-spin" /> Processing...
              </span>
            ) : 'Save Payment'}
          </button>

          {/* Send Reminder */}
          {!isPaid && total > 0 && (
            <button
              onClick={() => setShowReminderConfirm(true)}
              disabled={saving || !lead.project_id}
              className="w-full border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 text-slate-600 hover:text-indigo-600 font-black py-4 rounded-xl text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Payment Reminder
              {lastReminderSent && (
                <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal ml-1">
                  (last: {fmtDate(lastReminderSent)})
                </span>
              )}
            </button>
          )}

          {/* Notes */}
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => setShowNotes(v => !v)}
              className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors pt-3"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {showNotes ? 'Hide Notes' : 'Internal Notes'}
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showNotes && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Check numbers, partial payment details, balance notes..."
                />
              </div>
            )}
          </div>

          {/* Email history */}
          {outboxLog.length > 0 && (
            <div className="pt-0 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-3 mb-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Sent History
              </p>
              <div className="space-y-2">
                {outboxLog.map((entry: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {entry.status === 'failed' ? 'Failed' : 'Sent'}
                        </span>
                        <span className="text-xs font-black text-slate-700">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.sent_by_email && (
                        <span className="text-[10px] text-slate-400 truncate">{entry.sent_by_email}</span>
                      )}
                      {entry.status === 'failed' && entry.error_message && (
                        <span className="text-[10px] text-red-500 font-bold truncate">{entry.error_message}</span>
                      )}
                    </div>
                    {entry.html_body && (
                      <button
                        onClick={() => setPreviewHtml(entry.html_body)}
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reminder confirm modal */}
      {showReminderConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !sendingReminder && setShowReminderConfirm(false)}
          />
          <div className="relative bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowReminderConfirm(false)}
              disabled={sendingReminder}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
              <Send className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Send Payment Reminder?</h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              A reminder will be sent to{' '}
              <span className="font-bold text-slate-800">{lead.name}</span>
              {lead.email ? <> at <span className="font-bold text-slate-800">{lead.email}</span></> : null}
              {remaining > 0 ? (
                <> for the outstanding balance of{' '}
                  <span className="font-bold text-indigo-600">{fmt(remaining)}</span>
                </>
              ) : null}.
            </p>
            <div className={`rounded-xl p-3.5 mb-5 text-xs font-bold flex items-start gap-2.5 ${
              !lastReminderSent
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : daysSinceReminder === 0
                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                  : 'bg-slate-50 border border-slate-200 text-slate-500'
            }`}>
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {!lastReminderSent ? (
                  <p className="font-black">No reminder has been sent yet.</p>
                ) : (
                  <>
                    <p className="font-black">Last reminder: {fmtDate(lastReminderSent)}</p>
                    <p className="font-medium mt-0.5">
                      {daysSinceReminder === 0
                        ? 'Already sent today — are you sure you want to send another?'
                        : `${daysSinceReminder} day${daysSinceReminder !== 1 ? 's' : ''} ago`
                      }
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowReminderConfirm(false)}
                disabled={sendingReminder}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminder}
                disabled={sendingReminder}
                className="py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95"
              >
                {sendingReminder ? (
                  <><Clock className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send It</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}