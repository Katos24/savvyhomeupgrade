'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertCircle, Clock,
  CreditCard,
  ChevronDown, Send, X, Mail, Eye, BellRing, Loader2
} from 'lucide-react';
import StickyActionBar from '@/components/dashboard/StickyActionBar';
import InvoiceSection from './InvoiceSection';

type PaymentUpdateProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

export default function PaymentUpdate({ lead, company, currentUser, onRefresh, hasProject, companySlug }: PaymentUpdateProps) {
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [markPaidInFull, setMarkPaidInFull] = useState(false);
  const [error, setError] = useState('');
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  useEffect(() => {
    const amount = lead?.payment_amount || '';
    const total = parseFloat(lead?.quote_total || '0');
    const paid = parseFloat(amount || '0');
    const num = parseFloat(amount || '0');
    const formatted = num > 0
      ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '';
    setPaymentAmount(formatted);
    setRawAmount(num > 0 ? num.toString() : '');
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
      const num = parseFloat(lead.quote_total);
      setRawAmount(num.toString());
      setPaymentAmount(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
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
  const paid = parseFloat(rawAmount || paymentAmount.replace(/,/g, '') || '0');
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
    const amount = paymentAmount === '' ? 0 : parseFloat(paymentAmount.replace(/,/g, ''));
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
      <InvoiceSection
        lead={lead}
        company={company}
        currentUser={currentUser}
        onRefresh={onRefresh}
        hasProject={hasProject}
      />

      {/* EMAIL PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-slate-900/80 flex items-end sm:items-center justify-center"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full sm:max-w-2xl flex flex-col bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
              style={{ maxHeight: '92dvh', height: '92dvh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-800">Email preview</p>
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden p-3" style={{ minHeight: 0 }}>
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}*{user-select:none!important;}</style>`}
                  className="w-full h-full border-0 rounded-xl bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">Payment</h3>
          </div>
          {total > 0 && (
            <div className="text-right min-w-0">
              <p className="text-[11px] text-slate-400">Total quote</p>
              <p className="text-sm font-semibold text-slate-900 truncate">{fmt(total)}</p>
            </div>
          )}
        </div>

        {/* PROGRESS BAR */}
        {total > 0 && (
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {isPaid ? (
                    <motion.div key="paid" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    </motion.div>
                  ) : isPartial ? (
                    <motion.div key="partial" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="unpaid" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="text-[11px] font-medium text-slate-700">
                  {isPaid ? 'Settled' : isPartial ? `${fmt(paid)} collected` : 'Awaiting payment'}
                </span>
              </div>
              <AnimatePresence>
                {isPartial && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded"
                  >
                    {fmt(remaining)} left
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${isPaid ? 'bg-emerald-500' : 'bg-blue-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((paid / total) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* FORM */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 gap-2.5">
            <div className="min-w-0">
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Amount</label>
              <input
                type="text"
                inputMode="decimal"
                value={paymentAmount}
                onChange={e => {
                  const stripped = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
                  setRawAmount(stripped);
                  setPaymentAmount(stripped);
                  if (markPaidInFull && parseFloat(stripped) !== parseFloat(lead?.quote_total || '0')) {
                    setMarkPaidInFull(false);
                  }
                }}
                onFocus={() => {
                  setPaymentAmount(rawAmount || paymentAmount.replace(/,/g, ''));
                }}
                onBlur={() => {
                  const num = parseFloat(rawAmount || paymentAmount.replace(/,/g, '') || '0');
                  if (isNaN(num) || num === 0) { setPaymentAmount(''); setRawAmount(''); return; }
                  setPaymentAmount(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                }}
                className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none transition-colors focus:border-blue-300"
                placeholder="0.00"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Method</label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white outline-none appearance-none transition-colors focus:border-blue-300"
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="min-w-0 overflow-hidden">
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Paid date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full min-w-0 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none transition-colors focus:border-blue-300 focus:bg-white"
                  style={{
                    maxWidth: '100%',
                    WebkitAppearance: 'none',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* MARK PAID IN FULL */}
          {total > 0 && (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setMarkPaidInFull(!markPaidInFull)}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                markPaidInFull ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ backgroundColor: markPaidInFull ? '#10b981' : '#fff', borderColor: markPaidInFull ? '#10b981' : '#cbd5e1' }}
                  className="w-4 h-4 rounded flex items-center justify-center border"
                >
                  <AnimatePresence>
                    {markPaidInFull && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-[11px] font-medium text-slate-700">Mark as paid in full</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">{fmt(total)}</span>
            </motion.div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-2 bg-rose-50 border border-rose-100 rounded text-rose-600 text-xs">{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTION BUTTONS */}
          <StickyActionBar
            summary={
              total > 0
                ? isPaid ? `Paid in full — ${fmt(total)}` : isPartial ? `${fmt(paid)} of ${fmt(total)}` : `${fmt(total)} due`
                : 'No quote yet'
            }
            primaryLabel="Save Payment"
            primaryLoading={saving}
            onPrimary={handleSave}
            secondaryLabel={!isPaid && total > 0 ? 'Send Reminder' : undefined}
            secondaryDisabled={isPaid || !lead.project_id}
            onSecondary={!isPaid && total > 0 ? () => setShowReminderConfirm(true) : undefined}
          />

          {/* SENT HISTORY */}
          {outboxLog.length > 0 && (
            <div className="pt-3 border-t border-slate-100 -mx-4 px-4 pb-1">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <p className="text-[11px] text-slate-400">
                  Sent history ({outboxLog.length})
                </p>
              </div>

              <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5">
                {outboxLog.map((entry: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 transition-all hover:border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                            {entry.status}
                          </span>
                          <span className="text-[11px] font-medium text-slate-700">
                            {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {entry.sent_by_email && <p className="text-[10px] text-slate-400 truncate mt-0.5">{entry.sent_by_email}</p>}
                        {entry.status === 'failed' && entry.error_message && (
                          <p className="text-[10px] text-red-500 truncate mt-0.5">{entry.error_message}</p>
                        )}
                      </div>
                    </div>
                    {entry.html_body && (
                      <button
                        onClick={() => setPreviewHtml(entry.html_body)}
                        className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0 ml-2"
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
      </motion.div>

      {/* REMINDER CONFIRM MODAL */}
      <AnimatePresence>
        {showReminderConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !sendingReminder && setShowReminderConfirm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-7 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-center mb-5 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BellRing className="w-6 h-6 text-blue-500" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">Send payment reminder?</h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                  Send to <span className="font-medium text-slate-800">{lead.name}</span> for{' '}
                  <span className="font-medium text-blue-600">{fmt(remaining)}</span>.
                </p>

                <div className={`rounded-xl p-3.5 mb-6 text-[11px] flex items-start gap-3 text-left ${
                  !lastReminderSent ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}>
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    {!lastReminderSent ? (
                      <p>No reminder has been sent yet. Good time to follow up.</p>
                    ) : (
                      <>
                        <p className="opacity-70 mb-0.5">Last reminder sent</p>
                        <p className="text-sm font-medium">{fmtDate(lastReminderSent)}</p>
                        <p className="mt-1">{daysSinceReminder === 0 ? 'Sent earlier today' : `${daysSinceReminder} days ago`}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={handleSendReminder}
                    disabled={sendingReminder}
                    className="w-full py-3.5 bg-blue-600 text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {sendingReminder ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send now
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowReminderConfirm(false)}
                    disabled={sendingReminder}
                    className="w-full py-3.5 text-slate-400 font-medium text-sm hover:text-slate-600 transition"
                  >
                    Not now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}