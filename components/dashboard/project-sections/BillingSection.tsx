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
  return <span className="font-extrabold text-xs tracking-tight text-[#635BFF]">stripe</span>;
}

/** A row in the details list. Reference material, not a card. */
function DetailRow({
  label,
  children,
  first,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3 ${
        first ? '' : 'border-t border-slate-100'
      }`}
    >
      <span className="text-[13px] text-slate-500 shrink-0">{label}</span>
      <div className="min-w-0 text-right text-[13px] font-medium text-slate-900">{children}</div>
    </div>
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

  // ── LOGS ──
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [invoiceLog, setInvoiceLog] = useState<any[]>([]);
  // Gates only the things that are actively WRONG while loading — the
  // activity count and the primary button. The money comes from the `lead`
  // prop and paints immediately.
  const [logsLoaded, setLogsLoaded] = useState(false);

  // ── PAYMENTS ──
  const [payments, setPayments] = useState<any[]>([]);
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
  const quoteTotal = parseFloat(lead?.quote_total || '0');
  const hasQuote = quoteTotal > 0;
  const total = quoteTotal;

  const invoiceTaxRate = parseFloat(lead?.quote_tax_rate || '0');
  const invoiceSubtotal = invoiceTaxRate > 0 ? total / (1 + invoiceTaxRate / 100) : total;
  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const remaining = Math.max(total - paidAmount, 0);

  // Deposit on the tax-inclusive total, capped at it. Mirrors depositFor() in
  // getOrCreateCheckoutSession so the panel and the customer's link agree.
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
  // Terms lock once money lands — refund to change them.
  const depositLocked = paidAmount > 0;
  // Terms set, nothing collected: the deposit is what's being asked for now.
  const awaitingDeposit = hasDepositTerms && paidAmount === 0 && depositAmount > 0;

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

  // The deposit row from the ledger, so we can tell whether the balance has
  // been asked for since it landed.
  const depositPayment = payments.find((p) => p.kind === 'deposit');
  const depositPaid = !!depositPayment;
  // If the last invoice send predates the deposit, the customer was asked for
  // the deposit — not the balance. Reminding them about a balance they were
  // never sent is the wrong next step.
  const balanceNotYetRequested =
    !!depositPayment &&
    !isPaid &&
    !isClosed &&
    remaining > 0 &&
    (!lead?.invoice_sent_at ||
      new Date(lead.invoice_sent_at).getTime() <
        new Date(depositPayment.paid_on).getTime());

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

  const fetchPayments = async () => {
    if (!lead?.project_id || !companySlug) return;
    try {
      const res = await fetch(`/api/company/${companySlug}/payments?project_id=${lead.project_id}`);
      const data = await res.json();
      if (data.success) setPayments(data.payments || []);
    } catch {
      // Non-fatal — the summary above still renders from the project row.
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [lead?.project_id, companySlug]);

  // Both types on mount. The old version loaded invoices on mount but
  // reminders only when Activity was expanded, so the count read "1" until
  // you opened it and then jumped to "2".
  useEffect(() => {
    if (!lead?.id || !companySlug) return;
    let cancelled = false;
    setLogsLoaded(false);

    const load = (type: string) =>
      fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=${type}`)
        .then((r) => r.json())
        .then((d) => d?.entries || []);

    // allSettled + finally: one dead endpoint can't leave the panel stuck
    // behind a permanent skeleton.
    Promise.allSettled([load('invoice'), load('payment_reminder')])
      .then(([inv, rem]) => {
        if (cancelled) return;
        if (inv.status === 'fulfilled') setInvoiceLog(inv.value);
        if (rem.status === 'fulfilled') setOutboxLog(rem.value);
      })
      .finally(() => {
        if (!cancelled) setLogsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [lead?.id, companySlug]);

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
        toast.success('Invoice sent');
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
      // Inserts a row rather than overwriting the project total, so a deposit
      // followed by a balance keeps both.
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
        setPayments(result.payments || []);
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
        setPayments(result.payments || []);
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
        <p className="text-sm font-semibold text-slate-700">Nothing to invoice yet</p>
        <p className="text-[13px] text-slate-500 mt-1">Save a quote first and billing opens up.</p>
      </div>
    );
  }

  /* ── The one thing to do next ──────────────────────────────────────────
     Sending never disables — resending is legitimate when a customer loses
     the email. Only the reminder greys out, because the server genuinely
     blocks it for 24 hours.                                              */
  const nextAction: {
    label: string;
    sub: string;
    onClick: () => void;
    tone: 'primary' | 'muted';
  } | null = !logsLoaded
    ? null
    : isClosed || isPaid
    ? null
    : !canSendInvoice
    ? {
        label: 'Upgrade to send invoices',
        sub: 'Emailing invoices is on the Basic plan.',
        onClick: () => (window.location.href = `/${company?.slug}/admin/settings#billing`),
        tone: 'primary',
      }
    : balanceNotYetRequested
    ? {
        label: `Send remaining balance — ${fmt(remaining)}`,
        sub: 'Bills what\u2019s left after the deposit.',
        onClick: () => setShowSendConfirm(true),
        tone: 'primary',
      }
    : !invoiceSent
    ? {
        label: awaitingDeposit
          ? `Send deposit request — ${fmt(depositAmount)}`
          : `Send invoice — ${fmt(remaining)}`,
        sub: hasPayLink
          ? `Emails the PDF with a ${activeMethodLabel} pay link.`
          : 'Emails the PDF. No payment method connected yet.',
        onClick: () => setShowSendConfirm(true),
        tone: 'primary',
      }
    : daysSinceReminder === 0
    ? {
        label: 'Reminder sent today',
        sub: 'Available again tomorrow.',
        onClick: () => {},
        tone: 'muted',
      }
    : {
        label: 'Send payment reminder',
        sub: lastReminderSent
          ? `Last reminder ${fmtDate(lastReminderSent)}. ${fmt(remaining)} outstanding.`
          : `Invoice sent. ${fmt(remaining)} outstanding.`,
        onClick: () => setShowReminderConfirm(true),
        tone: 'primary',
      };

  // Resending is a secondary action once something has already gone out —
  // it sits under the primary rather than replacing it.
  const showResend = logsLoaded && invoiceSent && !isPaid && !isClosed && canSendInvoice && !balanceNotYetRequested;

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* ── TOTAL + GRID ──
             Total on top is the contract price and doesn't move as money
             comes in. The two boxes below split it into what's due now and
             what's left. Both always render, so the layout doesn't jump
             when a deposit is added or cleared. */}
        <div className="px-4 sm:px-5 pt-5 pb-4">
          <p className="text-[13px] text-slate-500">
            {isClosed ? 'Refunded' : isPaid ? 'Paid in full' : 'Total due'}
          </p>
          <p
            className={`mt-1 text-[32px] sm:text-4xl font-semibold tracking-tight tabular-nums leading-tight ${
              isClosed ? 'text-slate-500' : isPaid ? 'text-emerald-600' : 'text-slate-900'
            }`}
          >
            {isClosed ? fmt(refundedAmount) : fmt(total)}
          </p>
          {invoiceTaxRate > 0 && !isClosed && (
            <p className="mt-0.5 text-[12px] text-slate-400 tabular-nums">
              {fmt(invoiceSubtotal)} + {invoiceTaxRate}% tax
            </p>
          )}
          {isClosed && lead?.refunded_at && (
            <p className="mt-1 text-[13px] text-slate-500">
              Refund processed {fmtDate(lead.refunded_at)}
            </p>
          )}

          {!isClosed && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {/* DEPOSIT BOX */}
              {showDepositEditor ? (
                <div className="col-span-2 rounded-xl border-2 border-brand-700 bg-white p-3">
                  <p className="text-[11px] text-slate-500 mb-2">Deposit</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex overflow-hidden rounded-lg border border-slate-200 shrink-0">
                      {(['percent', 'fixed'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setDepositTypeDraft(t)}
                          className={`px-3 py-2 text-[13px] font-semibold transition-colors ${
                            depositTypeDraft === t
                              ? 'bg-brand-700 text-white'
                              : 'bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {t === 'percent' ? '%' : '$'}
                        </button>
                      ))}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      max={depositTypeDraft === 'percent' ? 100 : undefined}
                      value={depositValueDraft}
                      onChange={(e) => setDepositValueDraft(e.target.value)}
                      placeholder={depositTypeDraft === 'percent' ? '35' : '500'}
                      autoFocus
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-[15px] font-semibold tabular-nums outline-none focus:border-brand-700"
                    />
                  </div>
                  {parseFloat(depositValueDraft || '0') > 0 && (
                    <p className="mt-2 text-[12px] text-slate-500 tabular-nums">
                      {fmt(
                        Math.min(
                          depositTypeDraft === 'percent'
                            ? (total * parseFloat(depositValueDraft)) / 100
                            : parseFloat(depositValueDraft),
                          total
                        )
                      )}{' '}
                      due now
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleSaveDepositTerms(false)}
                      disabled={savingDeposit}
                      className="flex-1 h-10 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold disabled:opacity-50"
                    >
                      {savingDeposit ? 'Saving...' : 'Save'}
                    </button>
                    {hasDepositTerms && (
                      <button
                        onClick={() => handleSaveDepositTerms(true)}
                        disabled={savingDeposit}
                        className="h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => setShowDepositEditor(false)}
                      className="h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={depositLocked ? undefined : openDepositEditor}
                  disabled={depositLocked}
                  className={`text-left rounded-xl p-3 transition-colors ${
                    depositPaid
                      ? 'bg-emerald-50 border border-emerald-200'
                      : hasDepositTerms
                      ? 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                      : 'border border-dashed border-slate-300 hover:bg-slate-50'
                  } ${depositLocked ? 'cursor-default' : ''}`}
                >
                  <p
                    className={`text-[11px] mb-0.5 ${
                      depositPaid ? 'text-emerald-700' : 'text-slate-500'
                    }`}
                  >
                    Deposit
                  </p>
                  <p
                    className={`text-[17px] font-semibold tabular-nums ${
                      depositPaid
                        ? 'text-emerald-800'
                        : hasDepositTerms
                        ? 'text-slate-900'
                        : 'text-slate-300'
                    }`}
                  >
                    {hasDepositTerms ? fmt(depositAmount) : '—'}
                  </p>
                  <p
                    className={`text-[12px] mt-0.5 ${
                      depositPaid
                        ? 'text-emerald-700'
                        : hasDepositTerms
                        ? 'text-slate-500'
                        : 'text-slate-500 font-medium underline underline-offset-2'
                    }`}
                  >
                    {depositPaid ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 shrink-0" />
                        Paid {fmtDate(depositPayment.paid_on)}
                      </span>
                    ) : hasDepositTerms ? (
                      <>
                        {depositType === 'percent' ? `${depositValue}%` : 'fixed'}
                        {!depositLocked && ' · edit'}
                      </>
                    ) : (
                      'Set one'
                    )}
                  </p>
                </button>
              )}

              {/* REMAINING BOX — always the full amount when no deposit. */}
              {!showDepositEditor && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="text-[11px] text-slate-500 mb-0.5">Remaining</p>
                  <p className="text-[17px] font-semibold tabular-nums text-slate-900">
                    {fmt(hasDepositTerms && !depositPaid ? total - depositAmount : remaining)}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {depositPaid
                      ? 'still owed'
                      : hasDepositTerms
                      ? 'on completion'
                      : 'full amount'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── THE NEXT ACTION ── */}
        {nextAction && (
          <div className="px-4 sm:px-5 pb-4">
            <button
              onClick={nextAction.onClick}
              disabled={nextAction.tone === 'muted'}
              className={`w-full h-12 rounded-xl text-[14px] font-semibold transition-colors ${
                nextAction.tone === 'primary'
                  ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.99]'
                  : 'bg-slate-100 text-slate-400 cursor-default'
              }`}
            >
              {nextAction.label}
            </button>
            <p className="mt-2 text-[12px] text-slate-500 text-center leading-relaxed">
              {nextAction.sub}
            </p>

            {showResend && (
              <button
                onClick={() => setShowSendConfirm(true)}
                className="mt-2 w-full h-11 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Resend invoice
              </button>
            )}
          </div>
        )}

        {isPaid && !isClosed && (
          <div className="mx-4 sm:mx-5 mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="text-[13px] font-medium text-emerald-900">
              Settled{lead?.payment_date ? ` on ${fmtDate(lead.payment_date)}` : ''}. Nothing left to do.
            </p>
          </div>
        )}

        {/* ── DETAILS — reference material, deliberately quiet ── */}
        <div className="border-t border-slate-100">
          <DetailRow first label="Invoice">
            <span className="flex items-center justify-end gap-2">
              {invoiceNumber}
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  invoiceSent
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                }`}
              >
                {invoiceSent ? 'Sent' : 'Draft'}
              </span>
            </span>
          </DetailRow>

          <DetailRow label="Due date">
            <label className="cursor-pointer inline-flex items-center gap-1.5 hover:text-slate-600 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {dueDate ? fmtDate(dueDate) : <span className="text-slate-400">Set a date</span>}
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="sr-only"
              />
            </label>
          </DetailRow>

          <DetailRow label="Customer pays by">
            {hasPayLink ? (
              <span>{activeMethodLabel}</span>
            ) : (
              <a
                href={`/${company?.slug}/admin/settings#billing`}
                className="text-slate-500 hover:text-slate-900 underline underline-offset-2"
              >
                Not set up
              </a>
            )}
          </DetailRow>

          {isStripeVerified && !isClosed && (
            <DetailRow label="Charged via">
              <span className="inline-flex items-center gap-2">
                <StripeWordmark />
                {lead.card_brand && lead.card_last4 && (
                  <span className="text-slate-400 font-normal capitalize">
                    {lead.card_brand} ····{lead.card_last4}
                  </span>
                )}
                <a
                  href={`https://dashboard.stripe.com/${company?.stripe_connect_account_id}/payments/${lead.stripe_payment_intent_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-900 underline underline-offset-2"
                >
                  View
                </a>
              </span>
            </DetailRow>
          )}
        </div>

        {/* ── PAYMENTS RECEIVED ──
             A deposit and a balance are two transactions; showing one number
             hid that. */}
        {payments.length > 0 && (
          <div className="border-t border-slate-100">
            <p className="px-4 sm:px-5 pt-3 pb-1 text-[13px] text-slate-500">Payments received</p>
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 border-t border-slate-50 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 tabular-nums">
                    {p.amount < 0 ? `− ${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                    <span className="ml-2 font-normal text-slate-400 capitalize">{p.kind}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {p.is_stripe && p.card_brand
                      ? `${p.card_brand} ····${p.card_last4}`
                      : p.method.replace('_', ' ')}
                    {p.paid_on && ` · ${fmtDate(p.paid_on)}`}
                    {p.recorded_by && ` · ${p.recorded_by}`}
                  </p>
                </div>

                {/* Stripe rows are locked — deleting one would show the job
                    unpaid while Stripe still holds the money. */}
                {!p.is_stripe && p.kind !== 'refund' && (
                  <button
                    onClick={() => handleDeletePayment(p.id)}
                    disabled={deletingPaymentId === p.id}
                    className="shrink-0 p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    aria-label="Remove payment"
                  >
                    {deletingPaymentId === p.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── SECONDARY ACTIONS ──
             Record a payment is always available — a contractor handed a
             check shouldn't have to email an invoice first to log it. */}
        <div className="flex items-center gap-1 border-t border-slate-100 px-2 sm:px-3 py-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>

          {!isClosed && !isPaid && (
            <button
              onClick={() => {
                // Pre-fill what's actually still owed — the common case is
                // recording exactly the balance.
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
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Record a payment
            </button>
          )}
        </div>

        {/* ── ACTIVITY ── */}
        <div className="border-t border-slate-100">
          <button
            onClick={() => setShowActivity((v) => !v)}
            className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <span className="text-[13px] text-slate-500">Activity</span>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[13px]">{logsLoaded ? activityLog.length : ''}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${showActivity ? 'rotate-180' : ''}`}
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
                className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
              >
                <div className="p-3 sm:p-4 space-y-2">
                  {activityLog.length === 0 ? (
                    <p className="text-[13px] text-slate-400 py-2 text-center">Nothing sent yet</p>
                  ) : (
                    activityLog.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-slate-800 truncate">
                              {entry.type === 'invoice'
                                ? 'Invoice sent'
                                : entry.type === 'payment_reminder'
                                ? 'Reminder sent'
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
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg text-[11px] font-medium transition-colors"
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

      {/* SEND INVOICE */}
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
                <h3 className="text-base font-semibold text-slate-900">
                  {awaitingDeposit
                    ? 'Send deposit request'
                    : invoiceSent
                    ? 'Resend invoice'
                    : 'Send invoice'}
                </h3>
                <button
                  type="button"
                  onClick={() => !sending && setShowSendConfirm(false)}
                  disabled={sending}
                  aria-label="Close"
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500">To</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {lead?.name || 'Unnamed client'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {lead?.email || 'No email on file'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-slate-500">
                        {awaitingDeposit ? 'Deposit' : 'Amount'}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 tabular-nums">
                        {fmt(awaitingDeposit ? depositAmount : remaining)}
                      </p>
                    </div>
                  </div>

                  {awaitingDeposit && (
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 tabular-nums">
                      {fmt(total - depositAmount)} balance due on completion.
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500">
                      {invoiceNumber} · {lineItems?.length || 0} line item
                      {(lineItems?.length || 0) === 1 ? '' : 's'}
                    </span>
                    {lead?.project_id && company?.slug && (
                      <a
                        href={`/api/company/${company.slug}/generate-invoice-pdf?project_id=${lead.project_id}&preview=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
                      >
                        Preview PDF
                      </a>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${
                    hasPayLink
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {hasPayLink ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Includes a <span className="font-semibold">{activeMethodLabel}</span> pay link
                        and the PDF.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        PDF only — no payment method connected, so they can&apos;t pay online.{' '}
                        <a
                          href={`/${company?.slug || ''}/admin/settings#billing`}
                          className="font-semibold underline"
                        >
                          Set one up
                        </a>
                      </span>
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="modal-due-date" className="block text-xs font-medium text-slate-600 mb-1">
                    Due date <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="modal-due-date"
                      type="date"
                      value={dueDate || ''}
                      disabled={sending}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-brand-700 focus:ring-2 focus:ring-slate-100 transition-all disabled:opacity-50"
                    />
                    {dueDate && (
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        disabled={sending}
                        className="px-2.5 py-2 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {isPartial && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                    {fmt(paidAmount)} collected. Balance due {fmt(remaining)}.
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-3 px-3 border border-slate-200 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  disabled={sending}
                  className="flex-1 py-3 px-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Confirm &amp; send
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RECORD PAYMENT */}
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
                <h3 className="text-base font-semibold text-slate-900">Record a payment</h3>
                <button
                  onClick={() => !savingPayment && setShowRecordPayment(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount received</label>
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
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[15px] font-semibold tabular-nums outline-none focus:bg-white focus:border-brand-700 focus:ring-2 focus:ring-slate-100 transition-colors"
                  />

                  {/* Two quick-fills when a deposit is pending — the two
                      amounts a contractor actually receives. */}
                  <div className="mt-2 grid gap-2">
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
                        className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                          rawAmount === depositAmount.toString()
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>Deposit</span>
                        <span className="tabular-nums">{fmt(depositAmount)}</span>
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
                        className={`w-full p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors ${
                          rawAmount === remaining.toString()
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{paidAmount > 0 ? 'Pay off balance' : 'Full amount'}</span>
                        <span className="tabular-nums">{fmt(remaining)}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-brand-700 transition-colors"
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
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-brand-700 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecordPayment(false)}
                  disabled={savingPayment}
                  className="flex-1 py-3 px-3 border border-slate-200 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePayment}
                  disabled={savingPayment}
                  className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save payment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REMINDER */}
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
                <h3 className="text-base font-semibold text-slate-900">Payment reminder</h3>
                <button
                  onClick={() => !sendingReminder && setShowReminderConfirm(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs space-y-1">
                <p className="text-slate-500">
                  To <span className="font-semibold text-slate-800">{lead?.name}</span>
                </p>
                <p className="text-slate-500">
                  Outstanding{' '}
                  <span className="font-semibold text-slate-800 tabular-nums">{fmt(remaining)}</span>
                </p>
                {lastReminderSent && (
                  <p className="text-slate-400 pt-1">Last sent {fmtDate(lastReminderSent)}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReminderConfirm(false)}
                  disabled={sendingReminder}
                  className="flex-1 py-3 px-3 border border-slate-200 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={sendingReminder || daysSinceReminder === 0}
                  className="flex-1 py-3 px-3 bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Send reminder'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMAIL PREVIEW */}
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
                <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400" /> Email preview
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                  aria-label="Close"
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