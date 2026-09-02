'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Receipt } from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import BillingSummaryPanel from './BillingSummaryPanel';
import BillingModals from './BillingModals';

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

function fmtDate(d: string | null | undefined) {
  if (!d) return null;
  const datePart = d.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function generateInvoiceNumber(projectNumber?: number): string {
  const base = projectNumber ? String(projectNumber).padStart(3, '0') : '001';
  return `INV-${base}`;
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
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState<{ url: string; kind: string | null; amount: number; method?: string; linkType?: string } | null>(null);
  const [paymentLinkQr, setPaymentLinkQr] = useState<string | null>(null);
  const [loadingPaymentLink, setLoadingPaymentLink] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const [dueDate, setDueDate] = useState('');
  const [showDueDateEditor, setShowDueDateEditor] = useState(false);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [savingDueDate, setSavingDueDate] = useState(false);

  const [showDepositEditor, setShowDepositEditor] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'full' | 'deposit'>(lead?.deposit_type ? 'deposit' : 'full');

  const [depositTypeDraft, setDepositTypeDraft] = useState<'percent' | 'fixed'>('percent');
  const [depositValueDraft, setDepositValueDraft] = useState('');
  const [savingDeposit, setSavingDeposit] = useState(false);

  const [showTaxEditor, setShowTaxEditor] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState('');
  const [savingTax, setSavingTax] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const payments = paymentsProp ?? [];
  const activityLog = activityProp ?? [];
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [confirmDeletePayment, setConfirmDeletePayment] = useState<any | null>(null);
  const [reverseAmountDraft, setReverseAmountDraft] = useState('');
  const [reverseNoteDraft, setReverseNoteDraft] = useState('');

  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const canSendInvoice = can(planTier, 'send_invoice_email');

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
  const taxLocked = paidAmount > 0;
  const awaitingDeposit = hasDepositTerms && paidAmount < depositAmount && depositAmount > 0;

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
  const dueDateLocked = isPaid || isClosed;
  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;

  const depositPayments = payments.filter((p: any) => p.kind === 'deposit');
  const balancePayments = payments.filter((p: any) => p.kind === 'balance');
  const depositPayment = depositPayments[0];
  const balancePayment = balancePayments[0];
  const depositPaid = hasDepositTerms && paidAmount >= depositAmount;

  const wasSettledThenGrew = !!depositPayment && !!balancePayment && !isPaid && !isClosed && remaining > 0;
  const currentAmountDue = hasDepositTerms && !depositPaid ? depositAmount : remaining;

  // Pure date-string comparison (YYYY-MM-DD sorts correctly as a string,
  // same as numerically) — avoids timezone drift from constructing Date
  // objects out of a date-only value.
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !!dueDate && dueDate < todayStr && !isPaid && !isClosed;
  const daysOverdue = isOverdue
    ? Math.round((new Date(todayStr).getTime() - new Date(dueDate).getTime()) / 86_400_000)
    : 0;
  const overdueSuffix = isOverdue ? ` — ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue` : '';

  // Falls back to 14 if the company hasn't set one yet (or if whatever
  // fetches `company` for this page hasn't been updated to select the new
  // column) — this is deliberately safe-by-default rather than crashing
  // or silently defaulting to 0.
  const defaultBalanceDueDays = company?.default_balance_due_days ?? 14;

  const reversedAmountFor = (paymentId: number) =>
  payments
    .filter((p2: any) => p2.kind === 'refund' && p2.reversed_payment_id === paymentId)
    .reduce((s: number, p2: any) => s + Math.abs(p2.amount), 0);

  const isManualPaymentMethod = !stripeActive && hasManualLink;
  const daysSinceInvoiceSent = lead?.invoice_sent_at
    ? Math.floor((Date.now() - new Date(lead.invoice_sent_at).getTime()) / 86_400_000)
    : null;
  const NUDGE_AFTER_DAYS = 2;
  const showManualPaymentNudge =
    isManualPaymentMethod &&
    invoiceSent &&
    !isPaid &&
    (!isClosed || refundedButOwing) &&
    remaining > 0 &&
    daysSinceInvoiceSent !== null &&
    daysSinceInvoiceSent >= NUDGE_AFTER_DAYS;

  useEffect(() => {
    setPaymentMode(lead?.deposit_type ? 'deposit' : 'full');
    setDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
    const num = parseFloat(lead?.payment_amount || '0');
    setRawAmount(num > 0 ? num.toString() : '');
    setPaymentAmount(
      num > 0 ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
    );
  }, [lead?.id]);

  // A draft, scoped to the Send modal only — NOT the same state the
  // sidebar's "Payment Due Date" row reads. Pre-filling `dueDate` directly
  // here would make the sidebar show a date the moment the modal opens,
  // even if the contractor cancels without sending anything real.
  const [sendDueDateDraft, setSendDueDateDraft] = useState('');

  useEffect(() => {
    if (!showSendConfirm) return;
    if (dueDate) {
      setSendDueDateDraft(dueDate);
      return;
    }
    const days = awaitingDeposit ? 0 : defaultBalanceDueDays;
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSendDueDateDraft(d.toISOString().split('T')[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSendConfirm]);

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
          due_date: sendDueDateDraft || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Invoice sent');
        setDueDate(sendDueDateDraft); // now genuinely saved — safe to reflect in the sidebar
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
    setSavingDueDate(true);
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
      setDueDate(newDate);
      setShowDueDateEditor(false);
      await onRefresh();
      toast.success('Due date updated');
    } catch {
      toast.error('Failed to update due date');
    } finally {
      setSavingDueDate(false);
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

  const handleSaveTaxRate = async (clear = false) => {
    setSavingTax(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_tax_rate',
          tax_rate: clear ? 0 : parseFloat(taxRateDraft || '0'),
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(clear ? 'Marked tax-exempt' : 'Tax rate saved');
        setShowTaxEditor(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Could not save tax rate');
      }
    } catch {
      toast.error('Could not save tax rate');
    } finally {
      setSavingTax(false);
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

  const handleReversePayment = async (paymentId: number, amount: number, note: string) => {
    setDeletingPaymentId(paymentId);
    try {
      const res = await fetch(`/api/company/${companySlug}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reverse_payment_id: paymentId, amount, note }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Payment reversed');
        await onRefresh();
      } else {
        toast.error(result.error || 'Could not reverse payment');
      }
    } catch {
      toast.error('Could not reverse payment');
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

  const handleGetPaymentLink = async () => {
    setShowPaymentLinkModal(true);
    setLoadingPaymentLink(true);
    setPaymentLinkError('');
    setPaymentLinkData(null);
    setPaymentLinkQr(null);
    setLinkCopied(false);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'get_payment_link',
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setPaymentLinkData({ url: data.url, kind: data.kind, amount: data.amount, method: data.method, linkType: data.linkType });

        try {
          const QRCode = (await import('qrcode')).default;
          const dataUrl = await QRCode.toDataURL(data.url, { width: 240, margin: 1 });
          setPaymentLinkQr(dataUrl);
        } catch (qrErr) {
          console.error('QR generation failed:', qrErr);
        }
      } else {
        setPaymentLinkError(data.error || 'Could not generate a payment link.');
      }
    } catch {
      setPaymentLinkError('Network error. Try again.');
    } finally {
      setLoadingPaymentLink(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    if (!paymentLinkData?.url) return;
    try {
      await navigator.clipboard.writeText(paymentLinkData.url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const loadPreview = async (entryId: number) => {
    setPreviewHtml('<p style="padding:32px;font-family:sans-serif;color:#a8a29e">Loading preview…</p>');
    try {
      const res = await fetch(
        `/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&body=1&entry_id=${entryId}`
      );
      const data = await res.json();
      setPreviewHtml(
        data?.entry?.html_body ||
          '<p style="padding:32px;font-family:sans-serif;color:#78716c">Preview unavailable.</p>'
      );
    } catch {
      setPreviewHtml(
        '<p style="padding:32px;font-family:sans-serif;color:#78716c">Could not load preview.</p>'
      );
    }
  };

  const openDepositEditor = () => {
    setPaymentMode('deposit');
    setDepositTypeDraft(depositType ?? 'percent');
    setDepositValueDraft(depositValue > 0 ? String(depositValue) : '');
    setShowDepositEditor(true);
  };

  const openTaxEditor = () => {
    setTaxRateDraft(invoiceTaxRate > 0 ? String(invoiceTaxRate) : '');
    setShowTaxEditor(true);
  };

  const openDueDateEditor = () => {
    setDueDateDraft(dueDate);
    setShowDueDateEditor(true);
  };

  const openRecordPaymentModal = () => {
    const prefill = currentAmountDue;
    if (prefill > 0) {
      setRawAmount(prefill.toString());
      setPaymentAmount(
        prefill.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
    }
    if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
    setShowRecordPayment(true);
  };

  if (!hasQuote) {
    return (
      <div className="bg-white border border-[#e7e2d8] rounded-2xl p-8 text-center">
        <div className="w-10 h-10 bg-[#f5f1e8] rounded-xl flex items-center justify-center mx-auto mb-3 text-[#a8a29e]">
          <Receipt className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-[#292524]">No Invoice Generated</p>
        <p className="text-[13px] text-[#78716c] mt-1">Complete the quote to activate billing &amp; invoicing.</p>
      </div>
    );
  }

  const showReminderLink =
    canSendInvoice && invoiceSent && !isPaid && (!isClosed || refundedButOwing) && remaining > 0;

  // The outbox already tags every invoice email with its real kind
  // ('deposit' or 'balance') — that's what makes the Outbox & Email
  // History list show the right labels. Using that directly here instead
  // of comparing lead.invoice_sent_at against a payment timestamp: that
  // field is shared across every kind of invoice email (and possibly
  // touched by non-send actions like a due-date edit), so it can say
  // "sent" for the balance even when only the deposit ever went out.
  const depositSentEntry = activityLog.find((e: any) => e.type === 'invoice' && e.metadata?.kind === 'deposit');
  const balanceSentEntry = activityLog.find((e: any) => e.type === 'invoice' && e.metadata?.kind === 'balance');
  const depositRequestSent = !!depositSentEntry;
  const balanceRequestSent = !!balanceSentEntry;

  const netOf = (p: any) => Math.max(p.amount - reversedAmountFor(p.id), 0);
  const depositCollected = depositPayments.reduce((s: number, p: any) => s + netOf(p), 0);
  const depositRemaining = Math.max(depositAmount - depositCollected, 0);
  const balanceCollected = balancePayments.reduce((s: number, p: any) => s + netOf(p), 0);
  const balanceTargetAmount = balancePayments.length > 0
    ? balancePayments.reduce((s: number, p: any) => s + netOf(p), 0) + Math.max(total - paidAmount, 0)
    : Math.max(total - depositAmount, 0);
  const balanceRemaining = Math.max(balanceTargetAmount - balanceCollected, 0);

  // The one number that answers "what happens if I hit Send right now" —
  // used for the prominent callout box, separate from the per-step amounts
  // in the timeline below (which show the full deposit/balance targets,
  // not necessarily what's still outstanding on a partially-paid step).
  const amountDueNow = isPaid || isClosed ? 0 : hasDepositTerms && !depositPaid ? depositRemaining : remaining;
  const dueNowLabel = hasDepositTerms && !depositPaid ? 'Deposit Due Now' : hasDepositTerms ? 'Balance Due Now' : 'Amount Due Now';

  const chronological = (arr: any[]) =>
    [...arr].sort((a, b) => {
      const byDate = new Date(a.paid_on).getTime() - new Date(b.paid_on).getTime();
      return byDate !== 0 ? byDate : a.id - b.id;
    });
  const buildCompletionMap = (chrono: any[], target: number) => {
    const map: Record<number, boolean> = {};
    let running = 0;
    for (const p of chrono) {
      running += p.amount;
      map[p.id] = running >= target;
    }
    return map;
  };
  const depositCompletionMap = buildCompletionMap(chronological(depositPayments), depositAmount);
  const balanceCompletionMap = buildCompletionMap(chronological(balancePayments), balanceTargetAmount);

  const paymentBadgeLabel = (p: any) => {
    if (p.kind === 'deposit') return depositCompletionMap[p.id] ? 'Deposit' : 'Deposit · Partial';
    if (p.kind === 'balance') return balanceCompletionMap[p.id] ? 'Balance' : 'Balance · Partial';
    return p.kind;
  };

  type StepStatus = 'locked' | 'ready' | 'sent' | 'overdue' | 'done';
  type Step = {
    key: string;
    title: string;
    amount: number;
    status: StepStatus;
    sub?: string;
    action?: { label: string; onClick: () => void };
    needsUpgrade?: boolean;
    editAction?: { label: string; onClick: () => void };
  };

  const steps: Step[] = hasDepositTerms
    ? [
        {
          key: 'deposit',
          title: 'Deposit',
          amount: depositAmount,
          status: depositPaid
            ? 'done'
            : depositPayments.length > 0 || depositRequestSent
            ? (isOverdue ? 'overdue' : 'sent')
            : 'ready',
          sub: depositPaid
            ? `Paid in full ${fmtDate(depositPayments[depositPayments.length - 1]?.paid_on)}`
            : depositCollected > 0
            ? `${fmt(depositCollected)} paid so far · ${fmt(depositRemaining)} remaining${overdueSuffix}`
            : depositRequestSent
            ? `Sent ${fmtDate(depositSentEntry?.created_at)}${isOverdue ? ` — ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue` : ' — awaiting payment'}`
            : canSendInvoice
            ? undefined
            : 'Emailing invoices needs the Basic plan',
          action:
            !depositPaid && canSendInvoice
              ? { label: depositRequestSent ? 'Resend Deposit Request' : 'Send Deposit', onClick: () => setShowSendConfirm(true) }
              : undefined,
          needsUpgrade: !depositPaid && !canSendInvoice,
          editAction: !depositLocked
            ? {
                label: `${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)} deposit`,
                onClick: openDepositEditor,
              }
            : undefined,
        },
        {
          key: 'balance',
          title: 'Balance',
          amount: isPaid ? total - depositAmount : depositPaid ? remaining : total - depositAmount,
          status: isPaid
            ? 'done'
            : !depositPaid
            ? 'locked'
            : balancePayments.length > 0 || balanceRequestSent
            ? (isOverdue ? 'overdue' : 'sent')
            : 'ready',
          sub: isPaid
            ? `Paid in full ${fmtDate(lead?.payment_date)}`
            : !depositPaid
            ? 'Unlocks once the deposit is paid'
            : balanceCollected > 0
            ? `${fmt(balanceCollected)} paid so far · ${fmt(balanceRemaining)} remaining${overdueSuffix}`
            : balanceRequestSent
            ? `Sent ${fmtDate(balanceSentEntry?.created_at)}${isOverdue ? ` — ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue` : ' — awaiting payment'}`
            : canSendInvoice
            ? 'Ready to send'
            : 'Emailing invoices needs the Basic plan',
          action:
            depositPaid && !isPaid && canSendInvoice
              ? { label: balanceRequestSent ? 'Resend Invoice' : 'Send Remaining Invoice', onClick: () => setShowSendConfirm(true) }
              : undefined,
          needsUpgrade: depositPaid && !isPaid && !canSendInvoice,
        },
        {
          key: 'complete',
          title: 'Paid in full',
          amount: total,
          status: isPaid ? 'done' : 'locked',
          sub: isPaid ? `Completed ${fmtDate(lead?.payment_date)}` : 'Marks the invoice fully paid',
        },
      ]
    : [
        {
          key: 'invoice',
          title: 'Invoice',
          amount: paidAmount > 0 ? remaining : total,
          status: isPaid ? 'done' : invoiceSent ? (isOverdue ? 'overdue' : 'sent') : 'ready',
          sub: isPaid
            ? `Paid ${fmtDate(lead?.payment_date)}`
            : invoiceSent
            ? `Sent ${fmtDate(lead?.invoice_sent_at)}${isOverdue ? ` — ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue` : ' — awaiting payment'}`
            : canSendInvoice
            ? undefined
            : 'Emailing invoices needs the Basic plan',
          action:
            !isPaid && canSendInvoice
              ? { label: invoiceSent ? 'Resend Invoice' : 'Send Invoice', onClick: () => setShowSendConfirm(true) }
              : undefined,
          needsUpgrade: !isPaid && !canSendInvoice,
          editAction: !depositLocked ? { label: 'Want to collect a deposit first?', onClick: openDepositEditor } : undefined,
        },
      ];

  return (
    <>
      <BillingSummaryPanel
        lead={lead}
        company={company}
        invoiceNumber={invoiceNumber}
        invoiceSent={invoiceSent}
        total={total}
        taxLocked={taxLocked}
        invoiceTaxRate={invoiceTaxRate}
        openTaxEditor={openTaxEditor}
        isPaid={isPaid}
        isClosed={isClosed}
        isPartiallyRefunded={isPartiallyRefunded}
        isStripeVerified={isStripeVerified}
        refundedButOwing={refundedButOwing}
        refundedAmount={refundedAmount}
        remaining={remaining}
        wasSettledThenGrew={wasSettledThenGrew}
        amountDueNow={amountDueNow}
        dueNowLabel={dueNowLabel}
        steps={steps}
        depositPayments={depositPayments}
        balancePayments={balancePayments}
        reversedAmountFor={reversedAmountFor}
        handleDownload={handleDownload}
        downloading={downloading}
        hasPayLink={hasPayLink}
        handleGetPaymentLink={handleGetPaymentLink}
        showReminderLink={showReminderLink}
        setShowReminderConfirm={setShowReminderConfirm}
        daysSinceReminder={daysSinceReminder}
        openRecordPaymentModal={openRecordPaymentModal}
        payments={payments}
        paymentBadgeLabel={paymentBadgeLabel}
        deletingPaymentId={deletingPaymentId}
        setConfirmDeletePayment={setConfirmDeletePayment}
        setReverseAmountDraft={setReverseAmountDraft}
        setReverseNoteDraft={setReverseNoteDraft}
        hasDepositTerms={hasDepositTerms}
        depositType={depositType}
        depositValue={depositValue}
        depositAmount={depositAmount}
        dueDate={dueDate}
        isOverdue={isOverdue}
        dueDateLocked={dueDateLocked}
        openDueDateEditor={openDueDateEditor}
        activeMethodLabel={activeMethodLabel}
        activityLog={activityLog}
        loadPreview={loadPreview}
      />

      <BillingModals
        lead={lead}
        showSendConfirm={showSendConfirm}
        setShowSendConfirm={setShowSendConfirm}
        sending={sending}
        invoiceNumber={invoiceNumber}
        awaitingDeposit={awaitingDeposit}
        depositPaymentsCount={depositPayments.length}
        invoiceSent={invoiceSent}
        balanceRequestSent={balanceRequestSent}
        hasDepositTerms={hasDepositTerms}
        isPaid={isPaid}
        depositType={depositType}
        depositValue={depositValue}
        depositRemaining={depositRemaining}
        depositCollected={depositCollected}
        remaining={remaining}
        total={total}
        depositAmount={depositAmount}
        hasPayLink={hasPayLink}
        activeMethodLabel={activeMethodLabel}
        dueDate={sendDueDateDraft}
        setDueDate={setSendDueDateDraft}
        showDueDateEditor={showDueDateEditor}
        setShowDueDateEditor={setShowDueDateEditor}
        savingDueDate={savingDueDate}
        currentDueDate={dueDate}
        dueDateDraft={dueDateDraft}
        setDueDateDraft={setDueDateDraft}
        handleDueDateChange={handleDueDateChange}
        handleSendInvoice={handleSendInvoice}
        confirmDeletePayment={confirmDeletePayment}
        setConfirmDeletePayment={setConfirmDeletePayment}
        deletingPaymentId={deletingPaymentId}
        reverseAmountDraft={reverseAmountDraft}
        setReverseAmountDraft={setReverseAmountDraft}
        reverseNoteDraft={reverseNoteDraft}
        setReverseNoteDraft={setReverseNoteDraft}
        handleReversePayment={handleReversePayment}
        showRecordPayment={showRecordPayment}
        setShowRecordPayment={setShowRecordPayment}
        savingPayment={savingPayment}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        rawAmount={rawAmount}
        setRawAmount={setRawAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        depositPaid={depositPaid}
        paidAmount={paidAmount}
        handleSavePayment={handleSavePayment}
        showDepositEditor={showDepositEditor}
        setShowDepositEditor={setShowDepositEditor}
        savingDeposit={savingDeposit}
        depositTypeDraft={depositTypeDraft}
        setDepositTypeDraft={setDepositTypeDraft}
        depositValueDraft={depositValueDraft}
        setDepositValueDraft={setDepositValueDraft}
        handleSaveDepositTerms={handleSaveDepositTerms}
        showTaxEditor={showTaxEditor}
        setShowTaxEditor={setShowTaxEditor}
        savingTax={savingTax}
        invoiceTaxRate={invoiceTaxRate}
        taxRateDraft={taxRateDraft}
        setTaxRateDraft={setTaxRateDraft}
        handleSaveTaxRate={handleSaveTaxRate}
        showPaymentLinkModal={showPaymentLinkModal}
        setShowPaymentLinkModal={setShowPaymentLinkModal}
        loadingPaymentLink={loadingPaymentLink}
        paymentLinkError={paymentLinkError}
        paymentLinkData={paymentLinkData}
        paymentLinkQr={paymentLinkQr}
        linkCopied={linkCopied}
        handleGetPaymentLink={handleGetPaymentLink}
        handleCopyPaymentLink={handleCopyPaymentLink}
        showReminderConfirm={showReminderConfirm}
        setShowReminderConfirm={setShowReminderConfirm}
        sendingReminder={sendingReminder}
        currentAmountDue={currentAmountDue}
        lastReminderSent={lastReminderSent}
        daysSinceReminder={daysSinceReminder}
        handleSendReminder={handleSendReminder}
        previewHtml={previewHtml}
        setPreviewHtml={setPreviewHtml}
      />
    </>
  );
}