'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Download,
  Loader2,
  Send,
  Mail,
  Eye,
  X,
  ChevronDown,
  CreditCard,
  Calendar,
  Receipt,
  AlertCircle,
  Edit2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';

type BillingSectionProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
  payments?: any[];
  activity?: any[];
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
  return <span className="font-extrabold text-xs tracking-tight text-[#635BFF]">stripe</span>;
}

export default function BillingSection({
  lead,
  company,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
  payments: paymentsProp,
  activity: activityProp,
}: BillingSectionProps) {
  // ── UI / MODAL STATES ──
  const [showActivity, setShowActivity] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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

  // ── DEPOSIT TERMS ──
  const [showDepositEditor, setShowDepositEditor] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<'percent' | 'fixed'>('percent');
  const [depositValueDraft, setDepositValueDraft] = useState('');
  const [savingDeposit, setSavingDeposit] = useState(false);

  // ── PAYMENT FIELDS ──
  const [paymentAmount, setPaymentAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const payments = paymentsProp ?? [];
  const activityLog = activityProp ?? [];
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);

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
  const total = parseFloat(lead?.quote_total || '0');
  const hasQuote = total > 0;

  const invoiceTaxRate = parseFloat(lead?.quote_tax_rate || '0');
  const invoiceSubtotal = invoiceTaxRate > 0 ? total / (1 + invoiceTaxRate / 100) : total;
  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const remaining = Math.max(total - paidAmount, 0);

  const depositType = (lead?.deposit_type || null) as 'percent' | 'fixed' | null;
  const depositValue = parseFloat(lead?.deposit_value || '0');
  const hasDepositTerms = !!depositType && depositValue > 0;
  const depositAmount = hasDepositTerms
    ? Math.min(
        Math.round(
          (depositType === 'percent' ? (total * depositValue) / 100 : depositValue) * 100
        ) / 100,
        total
      )
    : 0;

  const depositLocked = paidAmount > 0;
  const awaitingDeposit = hasDepositTerms && paidAmount === 0 && depositAmount > 0;

  const isRefunded = lead?.payment_status === 'refunded';
  const isStripeVerified = !!lead?.stripe_payment_intent_id;
  const isPartiallyRefunded = lead?.payment_status === 'partially_refunded';
  const isClosed = isRefunded || isPartiallyRefunded;
  const refundedAmount = parseFloat(lead?.refunded_amount || '0');
  const refundedButOwing = isClosed && remaining > 0;

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
  const invoiceSent = !!lead?.invoice_sent_at;
  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;

  const depositPayment = payments.find((p: any) => p.kind === 'deposit');
  const depositPaid = hasDepositTerms && paidAmount > 0;
  const balanceNotYetRequested =
    !!depositPayment &&
    !isPaid &&
    !isClosed &&
    remaining > 0 &&
    (!lead?.invoice_sent_at ||
      new Date(lead.invoice_sent_at).getTime() <
        new Date(depositPayment.paid_on).getTime());

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

  // ── HANDLERS ──
  const handleDownload = async () => {
    if (!hasQuote) {
      toast.error('No invoice available');
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
      toast.success('Invoice PDF downloaded');
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
        toast.success('Invoice sent');
        setShowSendConfirm(false);
        await onRefresh();
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

  const handleSaveDepositTerms = async (clear = false) => {
    setSavingDeposit(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_deposit_terms',
          deposit_type: clear ? null : depositTypeDraft,
          deposit_value: clear ? null : parseFloat(depositValueDraft || '0'),
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(clear ? 'Deposit removed' : 'Deposit saved');
        setShowDepositEditor(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Could not save deposit');
      }
    } catch {
      toast.error('Could not save deposit');
    } finally {
      setSavingDeposit(false);
    }
  };

  const handleSavePayment = async () => {
    if (!hasProject) {
      toast.error('Convert to project first');
      return;
    }
    const amount = parseFloat(rawAmount || '0');
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter an amount greater than zero');
      return;
    }

    setSavingPayment(true);
    try {
      const res = await fetch(`/api/company/${companySlug}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: lead.project_id,
          amount,
          method: paymentMethod || 'other',
          paid_on: paymentDate || null,
        }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        toast.success('Payment recorded');
        setShowRecordPayment(false);
        setRawAmount('');
        setPaymentAmount('');
        setPaymentMethod('');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to record payment');
      }
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    setDeletingPaymentId(paymentId);
    try {
      const res = await fetch(
        `/api/company/${companySlug}/payments?payment_id=${paymentId}`,
        { method: 'DELETE' }
      );
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Payment removed');
        await onRefresh();
      } else {
        toast.error(result.error || 'Could not remove payment');
      }
    } catch {
      toast.error('Could not remove payment');
    } finally {
      setDeletingPaymentId(null);
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
        toast.success('Reminder sent');
        setShowReminderConfirm(false);
        await onRefresh();
      } else toast.error(data.error || 'Failed to send reminder');
    } catch {
      toast.error('Failed to send reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const loadPreview = async (entryId: number) => {
    setPreviewHtml('<p style="padding:32px;font-family:sans-serif;color:#94a3b8">Loading preview…</p>');
    try {
      const res = await fetch(
        `/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&body=1&entry_id=${entryId}`
      );
      const data = await res.json();
      setPreviewHtml(
        data?.entry?.html_body ||
          '<p style="padding:32px;font-family:sans-serif;color:#64748b">Preview unavailable.</p>'
      );
    } catch {
      setPreviewHtml(
        '<p style="padding:32px;font-family:sans-serif;color:#64748b">Could not load preview.</p>'
      );
    }
  };

  const openDepositEditor = () => {
    setDepositTypeDraft(depositType ?? 'percent');
    setDepositValueDraft(depositValue > 0 ? String(depositValue) : '');
    setShowDepositEditor(true);
  };

  if (!hasQuote) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Receipt className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No Invoice Generated</p>
        <p className="text-[13px] text-slate-500 mt-1">Complete the quote to activate billing &amp; invoicing.</p>
      </div>
    );
  }

  // ── ACTION LOGIC ──
  type ActionKey = 'upgrade' | 'deposit' | 'balance' | 'invoice' | 'reminder' | 'reminder-sent';
  const nextAction: {
    key: ActionKey;
    label: string;
    sub: string;
    onClick: () => void;
    tone: 'primary' | 'muted';
  } | null = (isClosed && !refundedButOwing) || isPaid
    ? null
    : !canSendInvoice
    ? {
        key: 'upgrade',
        label: 'Upgrade to Send Invoices',
        sub: 'Emailing invoices is available on the Basic plan.',
        onClick: () => (window.location.href = `/${company?.slug}/admin/settings#billing`),
        tone: 'primary',
      }
    : awaitingDeposit
    ? {
        key: 'deposit',
        label: `Send Deposit Request — ${fmt(depositAmount)}`,
        sub: `Customer pays ${fmt(depositAmount)} now, ${fmt(total - depositAmount)} on completion.`,
        onClick: () => setShowSendConfirm(true),
        tone: 'primary',
      }
    : balanceNotYetRequested
    ? {
        key: 'balance',
        label: `Send Final Balance Invoice — ${fmt(remaining)}`,
        sub: 'Bills remaining balance following settled deposit.',
        onClick: () => setShowSendConfirm(true),
        tone: 'primary',
      }
    : !invoiceSent
    ? {
        key: 'invoice',
        label: `Send Invoice — ${fmt(remaining)}`,
        sub: hasPayLink
          ? `Includes ${activeMethodLabel} pay link and attached PDF.`
          : 'Emails PDF invoice directly to customer.',
        onClick: () => setShowSendConfirm(true),
        tone: 'primary',
      }
    : daysSinceReminder === 0
    ? {
        key: 'reminder-sent',
        label: 'Reminder Sent Today',
        sub: 'Follow-up available again tomorrow.',
        onClick: () => {},
        tone: 'muted',
      }
    : {
        key: 'reminder',
        label: 'Send Payment Reminder',
        sub: lastReminderSent
          ? `Last reminder sent ${fmtDate(lastReminderSent)}. ${fmt(remaining)} outstanding.`
          : `Invoice sent. ${fmt(remaining)} outstanding.`,
        onClick: () => setShowReminderConfirm(true),
        tone: 'primary',
      };

  const secondaryAction: { label: string; onClick: () => void } | null =
    !nextAction || isPaid || (isClosed && !refundedButOwing)
      ? null
      : nextAction.key === 'reminder' || nextAction.key === 'reminder-sent'
      ? { label: 'Resend Full Invoice', onClick: () => setShowSendConfirm(true) }
      : (nextAction.key === 'deposit' || nextAction.key === 'balance' || nextAction.key === 'invoice') &&
        invoiceSent &&
        daysSinceReminder !== 0
      ? { label: 'Send Payment Reminder', onClick: () => setShowReminderConfirm(true) }
      : null;

  const staleInvoiceWarning = awaitingDeposit && invoiceSent && !refundedButOwing;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* ── INVOICE TOP BANNER ── */}
        <div className="px-5 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">{invoiceNumber}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    invoiceSent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {invoiceSent ? 'Sent' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {dueDate ? `Due ${fmtDate(dueDate)}` : 'No due date set'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">
              Status
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {isClosed && !refundedButOwing
                ? 'Refunded'
                : isPaid
                ? 'Paid in Full'
                : awaitingDeposit
                ? 'Awaiting Deposit'
                : isPartial
                ? 'Partially Paid'
                : 'Outstanding'}
            </span>
          </div>
        </div>

        {/* ── FINANCIAL KPI SUMMARY TILES ── */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
          <div className="p-3.5 sm:p-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              Invoiced Total
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {fmt(total)}
            </span>
            {invoiceTaxRate > 0 && (
              <span className="text-[10px] text-slate-400 block tabular-nums">
                Incl. {invoiceTaxRate}% tax
              </span>
            )}
          </div>

          <div className="p-3.5 sm:p-4">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              Paid to Date
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-600 tabular-nums">
              {fmt(paidAmount)}
            </span>
          </div>

          <div className="p-3.5 sm:p-4">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
              Amount Due
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {fmt(remaining)}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* ── REFUND WARNING BANNER ── */}
          {refundedButOwing && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>{fmt(refundedAmount)} refunded</strong>
                {lead?.refunded_at ? ` on ${fmtDate(lead.refunded_at)}` : ''}.{' '}
                {paidAmount > 0
                  ? `${fmt(remaining)} remains outstanding on this invoice.`
                  : 'No collected balance remains on this job.'}
              </span>
            </div>
          )}

          {/* ── STAGE MILESTONE TRACKER ── */}
          {(!isClosed || refundedButOwing) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-3 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Invoice Milestones</span>
                {!depositLocked && (
                  <button
                    onClick={openDepositEditor}
                    className="text-brand-700 hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3" />
                    {hasDepositTerms ? 'Edit Terms' : 'Set Deposit'}
                  </button>
                )}
              </div>

              {showDepositEditor ? (
                <div className="rounded-lg border-2 border-brand-700 bg-white p-3 space-y-3">
                  <p className="text-xs font-medium text-slate-600">Configure Deposit Required</p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 shrink-0">
                      {(['percent', 'fixed'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setDepositTypeDraft(t)}
                          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                            depositTypeDraft === t
                              ? 'bg-brand-700 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t === 'percent' ? '%' : '$'}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.001"
                      min="0"
                      max={depositTypeDraft === 'percent' ? 100 : undefined}
                      value={depositValueDraft}
                      onChange={(e) => setDepositValueDraft(e.target.value)}
                      placeholder={depositTypeDraft === 'percent' ? '25' : '500'}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold tabular-nums outline-none focus:border-brand-700"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setShowDepositEditor(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    {hasDepositTerms && (
                      <button
                        onClick={() => handleSaveDepositTerms(true)}
                        disabled={savingDeposit}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => handleSaveDepositTerms(false)}
                      disabled={savingDeposit}
                      className="px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-50"
                    >
                      {savingDeposit ? 'Saving...' : 'Save Terms'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Step 1: Deposit */}
                  <div
                    className={`rounded-lg p-2.5 border text-xs ${
                      depositPaid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : hasDepositTerms
                        ? 'bg-white border-slate-200 text-slate-900'
                        : 'bg-white border-dashed border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        1. Deposit
                      </span>
                      {depositPaid && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="font-bold tabular-nums text-sm">
                      {hasDepositTerms ? fmt(depositAmount) : 'None set'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {depositPaid
                        ? `Paid ${fmtDate(depositPayment?.paid_on)}`
                        : hasDepositTerms
                        ? depositType === 'percent'
                          ? `${depositValue}% required`
                          : 'Fixed amount'
                        : 'Optional'}
                    </p>
                  </div>

                  {/* Step 2: Final Balance */}
                  <div
                    className={`rounded-lg p-2.5 border text-xs ${
                      isPaid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        2. Final Balance
                      </span>
                      {isPaid && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="font-bold tabular-nums text-sm">
                      {fmt(hasDepositTerms && !depositPaid ? total - depositAmount : remaining)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isPaid ? 'Fully settled' : 'Due on completion'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRIMARY ACTION ── */}
          {nextAction && (
            <div className="space-y-2">
              <button
                onClick={nextAction.onClick}
                disabled={nextAction.tone === 'muted'}
                className={`w-full h-11 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  nextAction.tone === 'primary'
                    ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.99]'
                    : 'bg-slate-100 text-slate-400 cursor-default'
                }`}
              >
                <Send className="w-4 h-4" />
                {nextAction.label}
              </button>
              <p className="text-center text-[11px] text-slate-500">{nextAction.sub}</p>

              {secondaryAction && (
                <button
                  onClick={secondaryAction.onClick}
                  className="w-full h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {secondaryAction.label}
                </button>
              )}

              {staleInvoiceWarning && (
                <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    Full invoice previously sent. Requesting deposit emails an updated link for {fmt(depositAmount)}.
                  </span>
                </p>
              )}
            </div>
          )}

          {isPaid && !isClosed && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Invoice completely settled{lead?.payment_date ? ` on ${fmtDate(lead.payment_date)}` : ''}.</span>
            </div>
          )}
        </div>

        {/* ── SECONDARY ACTION TOOLBAR ── */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 bg-slate-50/50">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Download PDF
          </button>

          {(!isClosed || refundedButOwing) && !isPaid && (
            <button
              onClick={() => {
                const prefill = hasDepositTerms && !depositPaid ? depositAmount : remaining;
                if (prefill > 0) {
                  setRawAmount(prefill.toString());
                  setPaymentAmount(
                    prefill.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  );
                }
                if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                setShowRecordPayment(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Record Payment
            </button>
          )}
        </div>

        {/* ── ACCORDION 1: INVOICE DETAILS ── */}
        <div className="border-t border-slate-100">
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Invoice Settings &amp; Dates
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                showDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showDetails && (
            <div className="bg-slate-50/50 border-t border-slate-100 px-5 py-3 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Invoice Number</span>
                <span className="font-mono font-medium text-slate-900">{invoiceNumber}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Due Date</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 font-medium text-slate-900 hover:text-brand-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {dueDate ? fmtDate(dueDate) : <span className="text-slate-400">Set Date</span>}
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Link Gateway</span>
                {hasPayLink ? (
                  <span className="font-medium text-slate-900">{activeMethodLabel}</span>
                ) : (
                  <a
                    href={`/${company?.slug}/admin/settings#billing`}
                    className="text-slate-500 hover:text-slate-900 underline"
                  >
                    Not Configured
                  </a>
                )}
              </div>

              {isStripeVerified && !isClosed && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Stripe Card Charge</span>
                  <span className="inline-flex items-center gap-1.5">
                    <StripeWordmark />
                    {lead.card_brand && lead.card_last4 && (
                      <span className="text-slate-600 capitalize">
                        {lead.card_brand} ····{lead.card_last4}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PAYMENTS LEDGER ── */}
        {payments.length > 0 && (
          <div className="border-t border-slate-100">
            <div className="px-5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Payment Transactions
            </div>
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-2.5 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900 tabular-nums">
                      <span>{p.amount < 0 ? `− ${fmt(Math.abs(p.amount))}` : fmt(p.amount)}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {p.kind}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 capitalize mt-0.5">
                      {p.is_stripe && p.card_brand
                        ? `${p.card_brand} ····${p.card_last4}`
                        : p.method.replace('_', ' ')}
                      {p.paid_on && ` · ${fmtDate(p.paid_on)}`}
                    </p>
                  </div>

                  {!p.is_stripe && p.kind !== 'refund' && (
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      disabled={deletingPaymentId === p.id}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      aria-label="Remove payment"
                    >
                      {deletingPaymentId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACCORDION 2: OUTBOX ACTIVITY ── */}
        <div className="border-t border-slate-100">
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outbox &amp; Email History ({activityLog.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                showActivity ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {showActivity && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
              >
                <div className="p-3 sm:p-4 space-y-2">
                  {activityLog.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2 text-center">No emails sent yet.</p>
                  ) : (
                    activityLog.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate">
                              {entry.type === 'invoice'
                                ? 'Invoice Sent'
                                : entry.type === 'payment_reminder'
                                ? 'Reminder Sent'
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

                        {entry.has_body && (
                          <button
                            onClick={() => loadPreview(entry.id)}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            <Eye className="w-3 h-3" /> Preview
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

      {/* ══════════ MODALS ══════════ */}

      {/* MODAL 1: SEND INVOICE */}
      <AnimatePresence>
        {showSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !sending && setShowSendConfirm(false)}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {awaitingDeposit
                    ? 'Send Deposit Request'
                    : invoiceSent
                    ? 'Resend Invoice'
                    : 'Send Invoice'}
                </h3>
                <button
                  type="button"
                  onClick={() => !sending && setShowSendConfirm(false)}
                  disabled={sending}
                  aria-label="Close"
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400">Recipient</p>
                      <p className="font-bold text-slate-900 truncate">{lead?.name || 'Client'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{lead?.email || 'No email'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-400">
                        {awaitingDeposit ? 'Deposit Due' : 'Amount Billed'}
                      </p>
                      <p className="font-bold text-slate-900 tabular-nums text-sm">
                        {fmt(awaitingDeposit ? depositAmount : remaining)}
                      </p>
                    </div>
                  </div>

                  {awaitingDeposit && (
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 tabular-nums">
                      {fmt(total - depositAmount)} balance due on job completion.
                    </p>
                  )}
                </div>

                <div
                  className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs ${
                    hasPayLink
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {hasPayLink ? (
                    <>
                      <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Includes direct payment link ({activeMethodLabel}) and PDF invoice.</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>PDF attachment only. No digital pay link configured.</span>
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-due-date" className="block text-xs font-medium text-slate-600 mb-1">
                    Invoice Due Date
                  </label>
                  <input
                    id="modal-due-date"
                    type="date"
                    value={dueDate || ''}
                    disabled={sending}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  disabled={sending}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Confirm &amp; Send
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 2: RECORD PAYMENT */}
      <AnimatePresence>
        {showRecordPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !savingPayment && setShowRecordPayment(false)}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Record Manual Payment</h3>
                <button
                  onClick={() => !savingPayment && setShowRecordPayment(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Amount Collected</label>
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
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold tabular-nums outline-none focus:bg-white focus:border-brand-700"
                  />

                  {/* QUICK FILLS */}
                  <div className="mt-2 grid gap-1.5">
                    {hasDepositTerms && !depositPaid && depositAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawAmount(depositAmount.toString());
                          setPaymentAmount(
                            depositAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                          if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors text-[11px]"
                      >
                        <span>Fill Required Deposit</span>
                        <span className="font-bold tabular-nums">{fmt(depositAmount)}</span>
                      </button>
                    )}
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRawAmount(remaining.toString());
                          setPaymentAmount(
                            remaining.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                          if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors text-[11px]"
                      >
                        <span>Fill Full Balance</span>
                        <span className="font-bold tabular-nums">{fmt(remaining)}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-700 font-medium"
                  >
                    <option value="">Select Method...</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card (External)</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="stripe">Stripe</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-brand-700 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecordPayment(false)}
                  disabled={savingPayment}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={savingPayment}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PAYMENT REMINDER */}
      <AnimatePresence>
        {showReminderConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !sendingReminder && setShowReminderConfirm(false)}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Send Payment Reminder</h3>
                <button
                  onClick={() => !sendingReminder && setShowReminderConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs space-y-1">
                <p className="text-slate-500">
                  Recipient: <span className="font-semibold text-slate-800">{lead?.name}</span>
                </p>
                <p className="text-slate-500">
                  Balance Outstanding:{' '}
                  <span className="font-bold text-slate-900 tabular-nums">{fmt(remaining)}</span>
                </p>
                {lastReminderSent && (
                  <p className="text-slate-400 pt-1">Last reminder sent {fmtDate(lastReminderSent)}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReminderConfirm(false)}
                  disabled={sendingReminder}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={sendingReminder || daysSinceReminder === 0}
                  className="flex-1 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send Reminder'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 4: EMAIL PREVIEW */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
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
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Mail className="w-4 h-4 text-slate-400" /> Outbox Email Preview
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
                  className="w-full h-full border-0 rounded-lg bg-white"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}