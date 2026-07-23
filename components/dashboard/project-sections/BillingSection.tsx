'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Loader2,
  Send,
  Lock,
  Mail,
  Eye,
  BellRing,
  X,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Calendar,
  Receipt,
  Sparkles,
  ArrowRight,
  RefreshCw,
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

const fmt = (n: number | null | undefined) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

function generateInvoiceNumber(projectNumber?: number): string {
  const base = projectNumber ? String(projectNumber).padStart(3, '0') : '001';
  return `INV-${base}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StripeWordmark() {
  return (
    <span className="font-extrabold text-xs tracking-tight text-[#635BFF]">
      stripe
    </span>
  );
}

export default function BillingSection({
  lead,
  company,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
}: BillingSectionProps) {
  // ── UI MODAL STATES ──
  const [showActivity, setShowActivity] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // ── LOADING STATES ──
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // ── INVOICE FIELDS ──
  const [dueDate, setDueDate] = useState('');

  // ── PAYMENT FIELDS ──
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // ── LOGS ──
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [invoiceLog, setInvoiceLog] = useState<any[]>([]);

  // ── PERMISSIONS ──
  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const canSendInvoice = can(planTier, 'send_invoice_email');

  // ── DERIVED METRICS & CALCS ──
  const lineItems = (() => {
    try {
      const raw = lead?.quote_data;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  })();

  const invoiceNumber = lead?.invoice_number || generateInvoiceNumber(lead?.project_number);
  const quoteTotal = parseFloat(lead?.quote_total || '0');
  const hasQuote = quoteTotal > 0;
  const total = quoteTotal;

  const invoiceTaxRate = parseFloat(lead?.quote_tax_rate || '0');
  const invoiceSubtotal = invoiceTaxRate > 0 ? total / (1 + invoiceTaxRate / 100) : total;
  const invoiceTaxAmount = total - invoiceSubtotal;
  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const remaining = Math.max(total - paidAmount, 0);

  const isRefunded = lead?.payment_status === 'refunded';
  const isStripeVerified = !!lead?.stripe_payment_intent_id;
  const isPartiallyRefunded = lead?.payment_status === 'partially_refunded';
  const isClosed = isRefunded || isPartiallyRefunded;
  const refundedAmount = parseFloat(lead?.refunded_amount || '0');

  const stripeActive = !!company?.stripe_connect_onboarded && company?.stripe_payment_status === 'active';
  const hasManualLink = !!company?.payment_link_url;
  const hasPayLink = stripeActive || hasManualLink;

  const paymentMethodLabels: Record<string, string> = {
    venmo: 'Venmo',
    zelle: 'Zelle',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    stripe: 'Stripe',
    other: 'your payment link',
  };

  const activeMethodLabel = stripeActive
    ? 'Stripe'
    : hasManualLink
    ? paymentMethodLabels[company?.payment_link_type || 'other'] || 'your payment link'
    : null;

  const isPaid = !isClosed && total > 0 && paidAmount >= total;
  const isPartial = !isClosed && paidAmount > 0 && !isPaid;
  const invoiceSent = invoiceLog.length > 0;
  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;
  const progressPct = total > 0 ? Math.min((paidAmount / total) * 100, 100) : 0;

  const activityLog = [...invoiceLog, ...outboxLog].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // ── EFFECTS ──
  useEffect(() => {
    setDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
    const num = parseFloat(lead?.payment_amount || '0');
    setRawAmount(num > 0 ? num.toString() : '');
    setPaymentAmount(
      num > 0 ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
    );
  }, [lead?.id]);

  useEffect(() => {
    if (!lead?.id || !companySlug) return;
    fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=invoice`)
      .then((r) => r.json())
      .then((d) => {
        if (d.entries) setInvoiceLog(d.entries);
      })
      .catch(() => {});
  }, [lead?.id, companySlug]);

  useEffect(() => {
    if (!lead?.id || !companySlug || !showActivity) return;
    fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=payment_reminder`)
      .then((r) => r.json())
      .then((d) => {
        if (d.entries) setOutboxLog(d.entries);
      })
      .catch(() => {});
    fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=invoice`)
      .then((r) => r.json())
      .then((d) => {
        if (d.entries) setInvoiceLog(d.entries);
      })
      .catch(() => {});
  }, [lead?.id, companySlug, showActivity]);

  // ── HANDLERS ──
  const handleDownload = async () => {
    if (!hasQuote) {
      toast.error('No quote saved yet');
      return;
    }
    if (!lead?.project_id) {
      toast.error('Convert to project first');
      return;
    }
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
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
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
        fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=invoice`)
          .then((r) => r.json())
          .then((d) => {
            if (d.entries) setInvoiceLog(d.entries);
          })
          .catch(() => {});
      } else toast.error(result.error || 'Failed to send invoice');
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    setDueDate(newDate);
    try {
      await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_invoice',
          invoice_number: invoiceNumber,
          due_date: newDate || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      await onRefresh();
      toast.success('Due date updated');
    } catch {
      toast.error('Failed to update due date');
    }
  };

  const handleSavePayment = async () => {
    if (!hasProject) {
      toast.error('Convert to project first');
      return;
    }
    const amount = parseFloat(rawAmount || '0');
    if (isNaN(amount)) {
      toast.error('Enter a valid amount');
      return;
    }
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
    } catch {
      toast.error('Failed to save payment');
    } finally {
      setSavingPayment(false);
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
        toast.success('Reminder sent!');
        setShowReminderConfirm(false);
        await onRefresh();
        fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=payment_reminder`)
          .then((r) => r.json())
          .then((d) => {
            if (d.entries) setOutboxLog(d.entries);
          })
          .catch(() => {});
      } else toast.error(data.error || 'Failed to send reminder');
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  if (!hasQuote) {
    return (
      <div className="bg-slate-50/50 border border-slate-200/80 rounded-2xl p-8 text-center backdrop-blur-sm">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Receipt className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No active quote available</p>
        <p className="text-xs text-slate-400 mt-1">Save a quote first to activate billing options.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── MAIN CARD HUB ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden text-slate-900">
        
        {/* ── FINANCIAL HIGHLIGHT HEADER ── */}
        <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                  {isRefunded
                    ? 'Refunded'
                    : isPartiallyRefunded
                    ? 'Partially Refunded'
                    : isPaid
                    ? 'Settled'
                    : 'Balance Due'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isRefunded || isPartiallyRefunded
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isPartial
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isRefunded
                    ? 'Refunded'
                    : isPartiallyRefunded
                    ? 'Partial Refund'
                    : isPaid
                    ? 'Paid in Full'
                    : isPartial
                    ? 'Partial Payment'
                    : 'Unpaid'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {isClosed ? fmt(refundedAmount) : isPaid ? fmt(total) : fmt(remaining)}
                </p>
                {total > 0 && !isClosed && (
                  <span className="text-xs text-slate-400 font-medium">
                    of {fmt(total)} total
                  </span>
                )}
              </div>

              {isClosed && lead?.refunded_at && (
                <p className="text-xs text-slate-400 mt-1">
                  Refund processed on {fmtDate(lead.refunded_at)}
                </p>
              )}
            </div>

            {/* Micro Breakdown */}
            {!isClosed && invoiceTaxRate > 0 && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1 sm:min-w-[180px]">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{fmt(invoiceSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax ({invoiceTaxRate}%)</span>
                  <span>{fmt(invoiceTaxAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mt-5 space-y-1.5 relative z-10">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isClosed
                    ? 'bg-slate-500'
                    : isPaid
                    ? 'bg-emerald-400'
                    : 'bg-emerald-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{isClosed ? `${fmt(refundedAmount)} refunded` : `${fmt(paidAmount)} collected`}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN ACTIONS GRID ── */}
        <div className="p-4 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100">
          
          {/* Invoice Management Tile */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  Invoice
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    invoiceSent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                  }`}
                >
                  {invoiceSent ? 'Sent' : 'Draft'}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <p className="text-lg font-bold text-slate-900 tracking-tight">{invoiceNumber}</p>
                <label className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {dueDate ? `Due ${fmtDate(dueDate)}` : 'Set due date'}
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {hasPayLink ? (
                  <>
                    Pay link integrated via{' '}
                    <span className="font-semibold text-slate-700">{activeMethodLabel}</span>.
                  </>
                ) : (
                  <>
                    No payment gateway connected.{' '}
                    <a
                      href={`/${company?.slug}/admin/settings#billing`}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Connect Stripe
                    </a>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {canSendInvoice ? (
                <button
                  onClick={() => setShowSendConfirm(true)}
                  disabled={isPaid}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPaid ? 'Paid' : invoiceSent ? 'Resend' : 'Send Invoice'}
                </button>
              ) : (
                <button
                  onClick={() => (window.location.href = `/${company?.slug}/admin/settings#billing`)}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Upgrade Plan
                </button>
              )}

              <button
                onClick={handleDownload}
                disabled={downloading}
                title="Download PDF"
                className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                )}
                PDF
              </button>
            </div>
          </div>

          {/* Payment Collection Tile */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                  Collection
                </div>

                {!isPaid && !isClosed && (
                  <div className="relative group">
                    <button
                      onClick={() => setShowReminderConfirm(true)}
                      disabled={!lead?.project_id || daysSinceReminder === 0}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors disabled:opacity-40"
                      title="Send payment reminder"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                    </button>
                    {daysSinceReminder === 0 && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-[11px] rounded-lg p-2 text-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
                        Reminder sent today
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-3">
                {isClosed ? (
                  <p className="text-sm font-semibold text-slate-700">
                    Refunded {lead?.refunded_at ? `(${fmtDate(lead.refunded_at)})` : ''}
                  </p>
                ) : lead?.payment_method ? (
                  <div>
                    <p className="text-sm font-bold text-slate-900 capitalize">
                      {lead.payment_method.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-400">{fmtDate(lead.payment_date)}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400">No payment logged yet</p>
                )}
              </div>

              {isStripeVerified && !isClosed && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 mb-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Charged via</span>
                      <StripeWordmark />
                    </div>
                    <a
                      href={`https://dashboard.stripe.com/${company?.stripe_connect_account_id}/payments/${lead.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 font-medium hover:underline"
                    >
                      Stripe
                    </a>
                  </div>
                  {lead.card_brand && lead.card_last4 && (
                    <p className="text-[11px] text-slate-500 capitalize">
                      {lead.card_brand} •••• {lead.card_last4}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              {!isClosed && !isStripeVerified && (
                <button
                  onClick={() => setShowRecordPayment(true)}
                  className={`w-full py-2 px-3 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    isPaid
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isPaid ? 'Edit Payment' : isPartial ? 'Update Payment' : 'Record Payment'}
                </button>
              )}

              {isClosed && (
                <div className="w-full py-2 bg-slate-100 rounded-lg text-center text-xs font-medium text-slate-500">
                  Closed
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── EXPANDABLE AUDIT/ACTIVITY LOG ── */}
        <div>
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors text-left"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity History
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-xs font-medium">{activityLog.length} events</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showActivity ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          <AnimatePresence initial={false}>
            {showActivity && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100 bg-slate-50/40"
              >
                <div className="p-4 space-y-2">
                  {activityLog.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">No recorded activity</p>
                  ) : (
                    activityLog.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-slate-800">
                              {entry.type === 'invoice'
                                ? 'Invoice Dispatched'
                                : entry.type === 'payment_reminder'
                                ? 'Reminder Dispatched'
                                : entry.type}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {new Date(entry.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              ·{' '}
                              {new Date(entry.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {entry.html_body && (
                          <button
                            onClick={() => setPreviewHtml(entry.html_body)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition-colors"
                          >
                            <Eye className="w-3 h-3 text-slate-500" /> Preview
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── MODALS SECTION ── */}

      {/* SEND INVOICE MODAL */}
      <AnimatePresence>
        {showSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Send className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {invoiceSent ? 'Resend Invoice' : 'Send Invoice'}
                  </h3>
                </div>
                <button
                  onClick={() => !sending && setShowSendConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500">Recipient</p>
                  <p className="text-sm font-semibold text-slate-900">{lead?.name}</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{fmt(total)}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {isPartial && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-lg text-xs text-emerald-800">
                    {fmt(paidAmount)} collected. Balance due: {fmt(total - paidAmount)}.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSendConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvoice}
                  disabled={sending}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm & Send'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECORD PAYMENT MODAL */}
      <AnimatePresence>
        {showRecordPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {isPaid ? 'Edit Payment' : isPartial ? 'Update Payment' : 'Record Payment'}
                </h3>
                <button
                  onClick={() => !savingPayment && setShowRecordPayment(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Amount Received
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={paymentAmount}
                    onChange={(e) => {
                      const stripped = e.target.value
                        .replace(/[^0-9.]/g, '')
                        .replace(/(\..*?)\./g, '$1');
                      setRawAmount(stripped);
                      setPaymentAmount(stripped);
                    }}
                    onFocus={() => setPaymentAmount(rawAmount)}
                    onBlur={() => {
                      const num = parseFloat(rawAmount || '0');
                      if (!isNaN(num) && num > 0) {
                        setPaymentAmount(
                          num.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        );
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:bg-white outline-none focus:border-emerald-500 transition-colors"
                  />

                  {total > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const isFullAmount = rawAmount === total.toString();
                        if (isFullAmount) {
                          setRawAmount('');
                          setPaymentAmount('');
                        } else {
                          setRawAmount(total.toString());
                          setPaymentAmount(
                            total.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                          if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                        }
                      }}
                      className={`mt-2 w-full p-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                        rawAmount === total.toString()
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Mark paid in full
                      </span>
                      <span>{fmt(total)}</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white outline-none focus:border-emerald-500 transition-colors"
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
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecordPayment(false)}
                  disabled={savingPayment}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={savingPayment}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMINDER MODAL */}
      <AnimatePresence>
        {showReminderConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Payment Reminder</h3>
                </div>
                <button
                  onClick={() => !sendingReminder && setShowReminderConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-5 text-xs space-y-1">
                <p className="text-slate-500">Recipient: <span className="font-semibold text-slate-800">{lead?.name}</span></p>
                <p className="text-slate-500">Outstanding: <span className="font-bold text-slate-800">{fmt(remaining)}</span></p>
                {lastReminderSent && (
                  <p className="text-slate-400 text-[11px] pt-1">
                    Last sent {fmtDate(lastReminderSent)}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReminderConfirm(false)}
                  disabled={sendingReminder}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={sendingReminder || daysSinceReminder === 0}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Reminder'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" /> Dispatch Preview
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-slate-50 p-2">
                <iframe
                  title="Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;}*{user-select:none!important;}</style>`}
                  className="w-full h-full border-0 rounded-lg bg-white shadow-xs"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}