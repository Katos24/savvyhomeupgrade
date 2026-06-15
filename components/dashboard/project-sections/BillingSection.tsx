'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Clock, AlertCircle, Download,
  Loader2, Send, Lock, Mail, Eye, BellRing, X, ChevronDown
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type BillingSectionProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function generateInvoiceNumber(projectNumber?: number): string {
  const base = projectNumber ? String(projectNumber).padStart(3, '0') : '001';
  return `INV-${base}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BillingSection({
  lead,
  company,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
}: BillingSectionProps) {

  // ── MODALS ────────────────────────────────────────────────
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // ── LOADING ───────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // ── SEND INVOICE FIELDS (in modal) ───────────────────────
  const [dueDate, setDueDate] = useState('');

  // ── PAYMENT FIELDS (in modal) ────────────────────────────
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // ── ACTIVITY LOG ─────────────────────────────────────────
  const [outboxLog, setOutboxLog] = useState<any[]>([]);

  // ── PERMISSIONS ───────────────────────────────────────────
  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const canSendInvoice = can(planTier, 'send_invoice_email');

  // ── DERIVED ───────────────────────────────────────────────
  const lineItems = (() => {
    try {
      const raw = lead?.quote_data;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();

  const invoiceNumber = lead?.invoice_number || generateInvoiceNumber(lead?.project_number);
  const quoteTotal = parseFloat(lead?.quote_total || '0');
  const hasQuote = quoteTotal > 0;
  const total = quoteTotal;
  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const remaining = Math.max(total - paidAmount, 0);
  const isPaid = total > 0 && paidAmount >= total;
  const isPartial = paidAmount > 0 && !isPaid;
  const hasExistingInvoice = !!lead?.invoice_number;
  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;
  const progressPct = total > 0 ? Math.min((paidAmount / total) * 100, 100) : 0;

  // ── EFFECTS ───────────────────────────────────────────────
  useEffect(() => {
    setDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
    const num = parseFloat(lead?.payment_amount || '0');
    setRawAmount(num > 0 ? num.toString() : '');
    setPaymentAmount(num > 0 ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '');
  }, [lead?.id]);

 const [invoiceLog, setInvoiceLog] = useState<any[]>([]);

  useEffect(() => {
    if (!lead?.id || !companySlug) return;
    // Fetch payment reminders
    fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=payment_reminder`)
      .then(r => r.json())
      .then(d => { if (d.entries) setOutboxLog(d.entries); })
      .catch(() => {});
    // Fetch invoice sends
    fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=invoice`)
      .then(r => r.json())
      .then(d => { if (d.entries) setInvoiceLog(d.entries); })
      .catch(() => {});
  }, [lead?.id, companySlug]);

  // ── HANDLERS ──────────────────────────────────────────────
  const handleDownload = async () => {
    if (!hasQuote) { toast.error('No quote saved yet'); return; }
    if (!lead?.project_id) { toast.error('Convert to project first'); return; }
    setDownloading(true);
    try {
      const res = await fetch(`/api/company/${company?.slug}/generate-invoice-pdf?project_id=${lead.project_id}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch { toast.error('Failed to generate PDF'); }
    finally { setDownloading(false); }
  };

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'send_invoice_to_customer',
          invoice_number: invoiceNumber,
          invoice_data: lineItems,
          due_date: dueDate || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Invoice sent!');
        setShowSendConfirm(false);
        await onRefresh();
      } else toast.error(result.error || 'Failed to send invoice');
    } catch { toast.error('Failed to send invoice'); }
    finally { setSending(false); }
  };

  const handleSavePayment = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const amount = parseFloat(rawAmount || '0');
    if (isNaN(amount)) { toast.error('Enter a valid amount'); return; }
    setSavingPayment(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_payment',
          payment_status: amount >= total ? 'paid' : amount > 0 ? 'partial' : 'unpaid',
          payment_amount: amount,
          payment_method: paymentMethod || null,
          payment_date: paymentDate || null,
          payment_due_date: dueDate || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Payment recorded!');
        setShowRecordPayment(false);
        await onRefresh();
      } else toast.error(result.error || 'Failed to save payment');
    } catch { toast.error('Failed to save payment'); }
    finally { setSavingPayment(false); }
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
        toast.success('Reminder sent!');
        setShowReminderConfirm(false);
        await onRefresh();
      } else toast.error(data.error || 'Failed to send reminder');
    } catch { toast.error('Failed to send reminder'); }
    finally { setSendingReminder(false); }
  };

  // ── NO QUOTE STATE ────────────────────────────────────────
  if (!hasQuote) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
        <p className="text-sm font-bold text-slate-400">Save a quote first to enable billing</p>
      </div>
    );
  }

  // ── MAIN RENDER ───────────────────────────────────────────
  return (
    <>
      <div className="space-y-3">

        {/* ── FINANCIAL SNAPSHOT ── */}
        <div className="bg-slate-900 rounded-2xl p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isPaid ? 'Paid in Full' : 'Outstanding Balance'}
          </p>
          <h2 className="text-4xl font-black text-white mt-1">
            {isPaid ? fmt(total) : fmt(remaining)}
          </h2>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Collected</p>
              <p className="text-xl font-black text-emerald-400">{fmt(paidAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total</p>
              <p className="text-xl font-black text-white">{fmt(total)}</p>
            </div>
          </div>

          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">{Math.round(progressPct)}% collected</p>
        </div>

        {/* ── INVOICE CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Invoice</p>
              <p className="text-xl font-black text-slate-900">{invoiceNumber}</p>
              {lead?.payment_due_date && (
                <p className="text-sm text-slate-500 mt-0.5">Due {fmtDate(lead.payment_due_date)}</p>
              )}
<p className="text-xs text-slate-400 mt-1">{lineItems.length} line item{lineItems.length !== 1 ? 's' : ''} · {fmt(total)}</p>
            {invoiceLog.length > 0 ? (
              <p className="text-xs font-bold text-emerald-600 mt-1">
                ✓ Sent {fmtDate(invoiceLog[0].created_at)}
                {invoiceLog.length > 1 ? ` · ${invoiceLog.length} times` : ''}
              </p>
            ) : (
              <p className="text-xs font-bold text-amber-500 mt-1">⚠ Invoice not sent yet</p>
            )}
                        </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
              isPaid ? 'bg-emerald-100 text-emerald-700'
              : isPartial ? 'bg-amber-100 text-amber-700'
              : hasExistingInvoice ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500'
            }`}>
              {isPaid ? 'Paid' : isPartial ? 'Partial' : hasExistingInvoice ? 'Sent' : 'Draft'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors disabled:opacity-40"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
            </button>

            {canSendInvoice ? (
              <button
                onClick={() => setShowSendConfirm(true)}
                disabled={isPaid}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                {isPaid ? 'Paid' : hasExistingInvoice ? 'Resend' : 'Send Invoice'}
              </button>
            ) : (
              <button
                onClick={() => window.location.href = `/${company?.slug}/admin/settings#billing`}
                className="flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm rounded-xl"
              >
                <Lock className="w-4 h-4" />
                Upgrade to Send
              </button>
            )}
          </div>
        </div>

        {/* ── PAYMENT CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment</p>
              <p className="text-xl font-black text-slate-900">{fmt(paidAmount)}</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {isPaid ? 'Paid in full' : isPartial ? `${fmt(remaining)} remaining` : 'Not yet collected'}
              </p>
              {lead?.payment_method && (
                <p className="text-xs text-slate-400 mt-1 capitalize">{lead.payment_method.replace('_', ' ')} · {fmtDate(lead.payment_date)}</p>
              )}
            </div>
            {!isPaid && (
              <button
                onClick={() => setShowReminderConfirm(true)}
disabled={!lead?.project_id}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors disabled:opacity-40"
              >
                <BellRing className="w-3.5 h-3.5" />
                Remind
              </button>
            )}
          </div>

          <button
            onClick={() => setShowRecordPayment(true)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors"
          >
            {isPaid ? 'Edit Payment' : isPartial ? 'Update Payment' : 'Record Payment'}
          </button>
        </div>

        {/* ── ACTIVITY ── */}
        {outboxLog.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Activity</p>
            <div className="space-y-3">
{[...invoiceLog, ...outboxLog]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((entry: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${entry.status === 'failed' ? 'bg-red-400' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {entry.type === 'invoice' ? 'Invoice Sent' : entry.type === 'payment_reminder' ? 'Reminder Sent' : entry.type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' · '}{new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {entry.html_body && (
                    <button
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <Eye className="w-3 h-3" /> View
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── SEND INVOICE MODAL ── */}
      <AnimatePresence>
        {showSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sending && setShowSendConfirm(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex justify-center mb-6 sm:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-1">
                  {hasExistingInvoice ? 'Resend Invoice?' : 'Send Invoice?'}
                </h3>
                <p className="text-sm text-slate-500 mb-1">{lead?.name}</p>
                <p className="text-2xl font-black text-slate-900 mb-6">{fmt(total)}</p>

                {/* Due date picker in modal */}
                <div className="text-left mb-6">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Due Date (optional)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-300 transition-colors"
                    style={{ fontSize: '14px', WebkitAppearance: 'none' }}
                  />
                </div>

                {isPartial && (
                  <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl mb-4 text-left">
                    <p className="text-xs font-bold text-amber-700">
                      Customer already paid {fmt(paidAmount)}. Invoice will show the full {fmt(total)}.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSendInvoice}
                    disabled={sending}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Now</>}
                  </motion.button>
                  <button onClick={() => setShowSendConfirm(false)} disabled={sending} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RECORD PAYMENT MODAL ── */}
      <AnimatePresence>
        {showRecordPayment && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !savingPayment && setShowRecordPayment(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex justify-center mb-6 sm:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-6">Record Payment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Amount</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={paymentAmount}
                    onChange={e => {
                      const stripped = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1');
                      setRawAmount(stripped);
                      setPaymentAmount(stripped);
                    }}
                    onFocus={() => setPaymentAmount(rawAmount)}
                    onBlur={() => {
                      const num = parseFloat(rawAmount || '0');
                      if (!isNaN(num) && num > 0) {
                        setPaymentAmount(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white outline-none focus:border-blue-300 transition-colors"
                  />
                  {total > 0 && (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const isFullAmount = rawAmount === total.toString();
                        if (isFullAmount) {
                          setRawAmount('');
                          setPaymentAmount('');
                        } else {
                          setRawAmount(total.toString());
                          setPaymentAmount(total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                          if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                        }
                      }}
                      className={`mt-3 w-full p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        rawAmount === total.toString()
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          rawAmount === total.toString() ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                        }`}>
                          {rawAmount === total.toString() && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-slate-700">Mark as Paid in Full</span>
                      </div>
                      <span className="text-sm font-black text-slate-500">{fmt(total)}</span>
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Method</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white outline-none appearance-none focus:border-blue-300 transition-colors"
                    >
                      <option value="">Select method...</option>
                      <option value="cash">Cash</option>
                      <option value="check">Check</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="zelle">Zelle</option>
                      <option value="venmo">Venmo</option>
                      <option value="stripe">Stripe</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Date Received</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-300 focus:bg-white transition-colors"
                    style={{ fontSize: '14px', WebkitAppearance: 'none' }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSavePayment}
                  disabled={savingPayment}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {savingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Payment'}
                </motion.button>
                <button onClick={() => setShowRecordPayment(false)} disabled={savingPayment} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── REMINDER MODAL ── */}
      <AnimatePresence>
        {showReminderConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sendingReminder && setShowReminderConfirm(false)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex justify-center mb-6 sm:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <BellRing className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Send Reminder?</h3>
                <p className="text-sm text-slate-500 mb-1">{lead?.name}</p>
                <p className="text-2xl font-black text-slate-900 mb-6">{fmt(remaining)} due</p>

                {lastReminderSent && (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-left">
                    <p className="text-xs font-bold text-slate-500">Last reminder sent {fmtDate(lastReminderSent)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {daysSinceReminder === 0 ? 'Earlier today' : `${daysSinceReminder} days ago`}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="relative group">
                    <motion.button
                      whileTap={{ scale: daysSinceReminder === 0 ? 1 : 0.97 }}
                      onClick={handleSendReminder}
                      disabled={sendingReminder || daysSinceReminder === 0}
                      className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Reminder</>}
                    </motion.button>
                    {daysSinceReminder === 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs font-medium rounded-xl px-3 py-2 text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        A reminder was sent today. Wait 24 hours before sending another.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowReminderConfirm(false)} disabled={sendingReminder} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMAIL PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/70 flex items-end sm:items-center justify-center"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full sm:max-w-2xl flex flex-col bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl"
              style={{ maxHeight: '92dvh', height: '92dvh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-black text-slate-800">Email Preview</p>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X className="w-4 h-4 text-slate-500" />
                </motion.button>
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
    </>
  );
}