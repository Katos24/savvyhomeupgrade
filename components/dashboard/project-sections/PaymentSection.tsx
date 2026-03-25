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
        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Payment Hub</h3>
          </div>
          {total > 0 && (
            <div className="text-right min-w-0">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Quote</p>
              <p className="text-sm font-black text-slate-900 truncate">{fmt(total)}</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="px-5 py-3 bg-white border-b border-slate-50">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2">
                {isPaid ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : isPartial ? <Clock className="w-3.5 h-3.5 text-amber-500" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-300" />}
                <span className="text-[11px] font-bold text-slate-700">
                  {isPaid ? 'Settled' : isPartial ? `${fmt(paid)} collected` : 'Awaiting Payment'}
                </span>
              </div>
              {isPartial && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{fmt(remaining)} left</span>}
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${isPaid ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Form - Fixed Overlap */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="col-span-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    if (markPaidInFull && e.target.value !== lead?.quote_total?.toString()) setMarkPaidInFull(false);
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="col-span-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white outline-none appearance-none"
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

            <div className="col-span-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Paid Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-900 outline-none"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Due Date</label>
              <input
                type="date"
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Mark Paid Full */}
          {total > 0 && (
            <div
              onClick={() => setMarkPaidInFull(!markPaidInFull)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${markPaidInFull ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${markPaidInFull ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                  {markPaidInFull && <CheckCircle className="w-3 h-3" />}
                </div>
                <span className="text-[11px] font-bold text-slate-700">Mark as Paid in Full</span>
              </div>
              <span className="text-[10px] font-black text-slate-400">{fmt(total)}</span>
            </div>
          )}

          {error && <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-600 text-[10px] font-bold">{error}</div>}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button onClick={handleSave} disabled={saving} className="w-full bg-[#0F172A] text-white font-black py-3.5 rounded-xl text-[11px] uppercase tracking-widest active:scale-95 transition-all">
              {saving ? 'Processing...' : 'Save Payment'}
            </button>
            {!isPaid && total > 0 && (
              <button onClick={() => setShowReminderConfirm(true)} disabled={saving || !lead.project_id} className="w-full border-2 border-slate-100 text-slate-600 font-black py-3.5 rounded-xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Send className="w-3.5 h-3.5" /> Send Reminder
              </button>
            )}
          </div>

       
          {/* Outbox Log Full Restoration */}
          {outboxLog.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Mail className="w-3 h-3" /> Sent History</p>
              <div className="space-y-2">
                {outboxLog.map((entry: any, i: number) => (
                  <div key={i} className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>{entry.status}</span>
                        <span className="text-[10px] font-black text-slate-700">{fmtDate(entry.created_at)}</span>
                      </div>
                      {entry.html_body && <button onClick={() => setPreviewHtml(entry.html_body)} className="text-[9px] font-black text-indigo-600 uppercase">Preview</button>}
                    </div>
                    {entry.sent_by_email && <span className="text-[9px] text-slate-400 truncate">{entry.sent_by_email}</span>}
                    {entry.status === 'failed' && entry.error_message && <span className="text-[9px] text-red-500 font-bold truncate">{entry.error_message}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Confirm Modal Full Logic Restoration */}
      {showReminderConfirm && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sendingReminder && setShowReminderConfirm(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95">
            <h3 className="text-lg font-black text-slate-900 mb-1">Send Payment Reminder?</h3>
            <p className="text-xs text-slate-500 mb-4">Send to <span className="font-bold text-slate-800">{lead.name}</span> for <span className="font-bold text-indigo-600">{fmt(remaining)}</span>.</p>
            
            <div className={`rounded-xl p-3 mb-5 text-[10px] font-bold flex items-start gap-2 ${!lastReminderSent ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <div>
                {!lastReminderSent ? <p>No reminder has been sent yet.</p> : <>
                  <p>Last reminder: {fmtDate(lastReminderSent)}</p>
                  <p className="font-medium">{daysSinceReminder === 0 ? 'Already sent today!' : `${daysSinceReminder} days ago`}</p>
                </>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowReminderConfirm(false)} disabled={sendingReminder} className="py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={handleSendReminder} disabled={sendingReminder} className="py-3 bg-indigo-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2">
                {sendingReminder ? <Clock className="w-3.5 h-3.5 animate-spin" /> : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}