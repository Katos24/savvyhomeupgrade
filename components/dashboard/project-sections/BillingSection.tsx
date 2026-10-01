'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Receipt,
  Check,
  Lock,
  Send,
  Copy,
  Clock,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
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

function fmtTimestampDate(d: string | null | undefined) {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Short "Sep 29" form for the progress steps, so four steps fit a phone width.
function fmtStepDate(d: string | null | undefined) {
  if (!d) return null;
  // A plain "2026-09-30" is a calendar date, not a moment in time. new Date()
  // reads it as UTC midnight, which shows as the previous day in the US.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.exec(String(d));
  const date = dateOnly
    ? new Date(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)))
    : new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// YYYY-MM-DD in the user's LOCAL time zone. toISOString() is UTC, which
// rolls over to tomorrow at 8pm ET — that made invoices show overdue a day
// early and recorded evening payments with tomorrow's date.
function localDateStr(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  // Modal & Async States
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showPaymentLinkModal, setShowPaymentLinkModal] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState<{
    url: string;
    kind: string | null;
    amount: number;
    method?: string;
    linkType?: string;
  } | null>(null);
  const [paymentLinkQr, setPaymentLinkQr] = useState<string | null>(null);
  const [loadingPaymentLink, setLoadingPaymentLink] = useState(false);
  const [paymentLinkError, setPaymentLinkError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Dates & Editors
  const [dueDate, setDueDate] = useState('');
  const [depositDueDate, setDepositDueDate] = useState('');
  const [showDueDateEditor, setShowDueDateEditor] = useState(false);
  const [dueDateEditorPhase, setDueDateEditorPhase] = useState<'deposit' | 'balance'>('balance');
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [savingDueDate, setSavingDueDate] = useState(false);

  const [showDepositEditor, setShowDepositEditor] = useState(false);
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

  // LOCKING RULES: Deposit and Tax CANNOT be updated if ANY payment has been made
  const depositLocked = paidAmount > 0 || payments.length > 0;
  const taxLocked = paidAmount > 0 || payments.length > 0;

  const awaitingDeposit = hasDepositTerms && !lead?.deposit_paid_at;

  const isRefunded = lead?.payment_status === 'refunded';
  const isPartiallyRefunded = lead?.payment_status === 'partially_refunded';
  const isClosed = isRefunded || isPartiallyRefunded;

  const stripeActive =
    !!company?.stripe_connect_onboarded && company?.stripe_payment_status === 'active';
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
  const invoiceSent = !!lead?.invoice_sent_at;
  const lastReminderSent = lead?.reminder_sent_at || null;
  const daysSinceReminder = lastReminderSent
    ? Math.floor((Date.now() - new Date(lastReminderSent).getTime()) / 86_400_000)
    : null;

  const depositPayments = payments.filter((p: any) => p.kind === 'deposit');
  const depositPaid = hasDepositTerms && !!lead?.deposit_paid_at;

  const currentAmountDue = hasDepositTerms && !depositPaid ? depositAmount : remaining;

  const todayStr = localDateStr();

  const isDepositOverdue =
    !!depositDueDate && depositDueDate < todayStr && !depositPaid && !isClosed;
  const depositDaysOverdue = isDepositOverdue
    ? Math.round((new Date(todayStr).getTime() - new Date(depositDueDate).getTime()) / 86_400_000)
    : 0;

  const isOverdue = !!dueDate && dueDate < todayStr && !isPaid && !isClosed;
  const daysOverdue = isOverdue
    ? Math.round((new Date(todayStr).getTime() - new Date(dueDate).getTime()) / 86_400_000)
    : 0;
  const defaultBalanceDueDays = company?.default_balance_due_days ?? 14;

  const reversedAmountFor = (paymentId: number) =>
    payments
      .filter((p2: any) => p2.kind === 'refund' && p2.reversed_payment_id === paymentId)
      .reduce((s: number, p2: any) => s + Math.abs(p2.amount), 0);

  useEffect(() => {
    setDueDate(lead?.payment_due_date ? String(lead.payment_due_date).split('T')[0] : '');
    setDepositDueDate(lead?.deposit_due_date ? String(lead.deposit_due_date).split('T')[0] : '');
    setPaymentMethod(lead?.payment_method || '');
    setPaymentDate(lead?.payment_date ? String(lead.payment_date).split('T')[0] : '');
    const num = parseFloat(lead?.payment_amount || '0');
    setRawAmount(num > 0 ? num.toString() : '');
    setPaymentAmount(
      num > 0
        ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : ''
    );
  }, [lead?.id, lead?.payment_due_date, lead?.deposit_due_date]);

  const [sendDueDateDraft, setSendDueDateDraft] = useState('');

  useEffect(() => {
    if (!showSendConfirm) return;
    const existingDate = awaitingDeposit ? depositDueDate : dueDate;
    if (existingDate) {
      setSendDueDateDraft(existingDate);
      return;
    }
    if (awaitingDeposit) {
      setSendDueDateDraft('');
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + defaultBalanceDueDays);
    setSendDueDateDraft(localDateStr(d));
  }, [showSendConfirm]);

  // Contextual PDF Download Function
  const handleDownload = async (kind?: 'deposit' | 'balance') => {
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
      const kindParam = kind ? `&type=${kind}` : '';
      const res = await fetch(
        `/api/company/${company?.slug}/generate-invoice-pdf?project_id=${lead.project_id}${kindParam}`
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileSuffix = kind ? `-${kind.toUpperCase()}` : '';
      a.download = `Invoice-${invoiceNumber}${fileSuffix}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : 'Invoice'} PDF downloaded`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const [showNoDueDateWarning, setShowNoDueDateWarning] = useState(false);

  const confirmSendInvoice = () => {
    if (!sendDueDateDraft) {
      setShowNoDueDateWarning(true);
      return;
    }
    handleSendInvoice();
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
        if (awaitingDeposit) {
          setDepositDueDate(sendDueDateDraft);
        } else {
          setDueDate(sendDueDateDraft);
        }
        setShowSendConfirm(false);
        setShowNoDueDateWarning(false);
        await onRefresh();
      } else toast.error(result.error || 'Failed to send invoice');
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  // FIXED: previously showed "Due date updated" even when the server
  // rejected the change, and updated the local date anyway.
  const handleDueDateChange = async (newDate: string) => {
    setSavingDueDate(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_invoice',
          invoice_number: invoiceNumber,
          due_date: newDate || null,
          due_date_phase: dueDateEditorPhase,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        toast.error(result?.error || 'Failed to update due date');
        return;
      }
      if (dueDateEditorPhase === 'deposit') {
        setDepositDueDate(newDate);
      } else {
        setDueDate(newDate);
      }
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
    if (depositLocked) {
      toast.error('Deposit terms are locked because a payment has already been recorded');
      return;
    }
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
    if (taxLocked) {
      toast.error('Tax rate is locked because a payment has already been recorded');
      return;
    }
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
        setPaymentLinkData({
          url: data.url,
          kind: data.kind,
          amount: data.amount,
          method: data.method,
          linkType: data.linkType,
        });

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
    setPreviewHtml(
      '<p style="padding:32px;font-family:sans-serif;color:#a8a29e">Loading preview…</p>'
    );
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
    if (depositLocked) {
      toast.error('Deposit terms are locked because a payment has already been recorded');
      return;
    }
    setDepositTypeDraft(depositType ?? 'percent');
    setDepositValueDraft(depositValue > 0 ? String(depositValue) : '');
    setShowDepositEditor(true);
  };

  const openTaxEditor = () => {
    if (taxLocked) {
      toast.error('Tax rate is locked because a payment has already been recorded');
      return;
    }
    setTaxRateDraft(invoiceTaxRate > 0 ? String(invoiceTaxRate) : '');
    setShowTaxEditor(true);
  };

  const openDueDateEditor = (phase: 'deposit' | 'balance') => {
    setDueDateEditorPhase(phase);
    setDueDateDraft(phase === 'deposit' ? depositDueDate : dueDate);
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
    setPaymentDate(localDateStr());
    setShowRecordPayment(true);
  };

  if (!hasQuote) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
          <Receipt className="w-5 h-5" />
        </div>
        <p className="text-base font-bold text-slate-900">No Invoice Generated</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the quote to activate billing &amp; invoicing.
        </p>
      </div>
    );
  }

  const depositSentEntry = activityLog.find(
    (e: any) => e.type === 'invoice' && e.metadata?.kind === 'deposit'
  );
  const balanceSentEntry = activityLog.find(
    (e: any) => e.type === 'invoice' && e.metadata?.kind === 'balance'
  );
  const depositSentAt = lead?.inv_deposit_sent_at || depositSentEntry?.created_at || null;
  const balanceSentAt = lead?.inv_sent_at || balanceSentEntry?.created_at || null;
  const depositRequestSent = !!depositSentAt;
  const balanceRequestSent = !!balanceSentAt;

  const netOf = (p: any) => Math.max(p.amount - reversedAmountFor(p.id), 0);
  const depositCollected = depositPayments.reduce((s: number, p: any) => s + netOf(p), 0);
  const depositRemaining = Math.max(depositAmount - depositCollected, 0);

  // Balance card amount: the projected balance until the deposit is in,
  // then what's actually still owed (was always the full balance, even
  // after partial balance payments).
  const balancePortion = hasDepositTerms ? total - depositAmount : total;
  const balanceDisplay = isPaid
    ? balancePortion
    : hasDepositTerms && !depositPaid
    ? balancePortion
    : remaining;


      // No paid_in_full_at column exists — use the date of the most recent
  // payment (refunds excluded) once the job is fully paid.
  const paidInFullDate = isPaid
    ? payments
        .filter((p: any) => Number(p.amount) > 0 && p.paid_on)
        .map((p: any) => String(p.paid_on).slice(0, 10))
        .sort()
        .pop() ?? null
    : null;
  // Progress steps. Jobs without a deposit only get the two steps that
  // apply to them (previously they showed two deposit steps that could
  // never complete).
  const steps = hasDepositTerms
    ? [
        { id: 1, label: 'Deposit Sent', done: depositRequestSent || depositPaid || isPaid, date: fmtStepDate(depositSentAt) },
        { id: 2, label: 'Deposit Paid', done: depositPaid || isPaid, date: fmtStepDate(lead?.deposit_paid_at) },
        { id: 3, label: 'Balance Sent', done: balanceRequestSent || isPaid, date: fmtStepDate(balanceSentAt) },
        { id: 4, label: 'Paid in Full', done: isPaid, date: fmtStepDate(paidInFullDate) },
      ]
    : [
        { id: 1, label: 'Invoice Sent', done: balanceRequestSent || isPaid, date: fmtStepDate(balanceSentAt) },
        { id: 2, label: 'Paid in Full', done: isPaid, date: fmtStepDate(paidInFullDate) },
      ];

  const anyRequestSent = depositRequestSent || balanceRequestSent;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 text-slate-900 px-1 sm:px-0 font-sans">

      {/* COMPACT HEADER & PROGRESS */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3.5">

        {/* Header Title Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Invoice #{invoiceNumber}
            </h2>
            {isRefunded ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Refunded
              </span>
            ) : isPartiallyRefunded ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Partially Refunded
              </span>
            ) : isPaid ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Paid
              </span>
            ) : isOverdue || isDepositOverdue ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Overdue
              </span>
            ) : depositPaid ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                Deposit Paid
              </span>
            ) : anyRequestSent ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Sent
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                Draft
              </span>
            )}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400">
            Created {fmtDate(lead?.created_at || lead?.invoice_sent_at) || 'Recently'}
          </span>
        </div>

        {/* Progress steps — always fit the width, no horizontal scrolling,
            so the last step is visible on phones. Labels wrap if needed. */}
        <div className={`grid gap-1 sm:gap-2 pt-1 ${steps.length === 4 ? 'grid-cols-4' : 'grid-cols-2'}`}>
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center text-center min-w-0">
              <div className="flex items-center w-full">
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    idx === 0 ? 'bg-transparent' : step.done ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition shrink-0 ${
                    step.done
                      ? 'bg-teal-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {step.done ? <Check className="w-3 h-3 stroke-[3]" /> : step.id}
                </div>
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    idx === steps.length - 1
                      ? 'bg-transparent'
                      : steps[idx + 1]?.done
                      ? 'bg-teal-600'
                      : 'bg-slate-200'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 leading-tight px-0.5 ${
                  step.done ? 'text-teal-900 font-semibold' : 'text-slate-400 font-medium'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {step.date || '—'}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* LEFT COLUMN: Summary Bar & Phase Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                   {/* Summary — one number that matters now, changes with payment state */}
                    {/* Progress strip — context only; the stage cards own the "due now" amount */}
          {(() => {
            const paidInFull = total > 0 && remaining <= 0;
            const nothingPaid = paidAmount <= 0;
            const pct = total > 0 ? Math.min(Math.max((paidAmount / total) * 100, 0), 100) : 0;
            const taxNote = invoiceTaxRate > 0 ? `incl. ${invoiceTaxRate}% tax` : '';

            if (total <= 0) {
              return (
                <p className="px-1 text-xs text-slate-400">
                  No amount to collect yet. Add items on the Quote tab to set a total.
                </p>
              );
            }

            if (paidInFull) {
              return (
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-emerald-700">✓ Paid in full</p>
                    <p className="text-xs text-emerald-700/80 mt-0.5 tabular-nums">
                      {fmt(paidAmount)} collected{taxNote ? ` · ${taxNote}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload('balance')}
                    disabled={downloading}
                    className="shrink-0 px-3 py-2 sm:py-1.5 bg-white border border-emerald-200 hover:bg-emerald-100/60 text-emerald-800 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Invoice PDF
                  </button>
                </div>
              );
            }

            return (
              <div className="px-1">
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <p className="text-slate-600 tabular-nums">
                    <span className="font-semibold text-slate-900">{fmt(paidAmount)}</span> of {fmt(total)} collected
                    {taxNote && <span className="text-slate-400"> · {taxNote}</span>}
                  </p>
                  <span className={`font-semibold shrink-0 ${nothingPaid ? 'text-slate-400' : 'text-emerald-600'}`}>
                    {nothingPaid ? 'Not paid yet' : `${Math.round(pct)}% paid`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}

          {/* STAGE 1: DEPOSIT CARD */}
          {hasDepositTerms && (
            <div
              className={`rounded-xl border transition-all ${
                depositPaid
                  ? 'p-3 sm:p-4 bg-emerald-50/60 border-emerald-200'
                                    : 'p-4 sm:p-5 bg-white border-2 border-teal-600 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`text-xs sm:text-sm font-bold ${depositPaid ? 'text-slate-500' : 'text-slate-900'}`}>
                    1. Deposit ({depositType === 'percent' ? `${depositValue}%` : 'Fixed'})
                  </span>

                  {depositLocked ? (
                    <span
                      title="Deposit terms locked because a payment has been recorded"
                      className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <button
                      onClick={openDepositEditor}
                      className="text-xs text-teal-700 hover:underline font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {depositPaid ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                    Paid
                  </span>
                ) : isDepositOverdue ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 shrink-0">
                    Overdue
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 shrink-0">
                    Awaiting
                  </span>
                )}
              </div>

              <div className="mt-2.5">
                               <div
                  className={`font-extrabold tabular-nums ${
                    depositPaid ? 'text-lg sm:text-xl text-emerald-600' : 'text-xl sm:text-2xl text-slate-900'
                  }`}
                >
                  {fmt(depositAmount)}
                </div>
                {!depositPaid && depositCollected > 0 && (
                  <div className="text-xs text-teal-700 font-medium mt-0.5">
                    {fmt(depositCollected)} collected · {fmt(depositRemaining)} left
                  </div>
                )}
                {depositPaid ? (
                  // Paid: collapse to a single line — due dates and sending no longer matter
                                    <div className="text-xs text-emerald-700 font-medium mt-1">
                    ✓ Paid {fmtTimestampDate(lead?.deposit_paid_at) || ''}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span>
                      {depositSentAt ? `Sent ${fmtTimestampDate(depositSentAt)}` : 'Not sent yet'}
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => openDueDateEditor('deposit')}
                      className="hover:text-slate-800 underline font-medium"
                    >
                      {depositDueDate ? `Due ${fmtDate(depositDueDate)}` : 'Set Due Date'}
                    </button>
                    {isDepositOverdue && (
                      <span className="text-rose-600 font-semibold">
                        ({depositDaysOverdue}d overdue)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions only while the deposit is outstanding. Once paid, the
                  final invoice PDF (balance card) covers the full history. */}
              {!depositPaid && (
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                {canSendInvoice && (
                  <button
                    onClick={() => setShowSendConfirm(true)}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {depositRequestSent ? 'Resend Request' : 'Send Deposit Request'}
                  </button>
                )}
                {!depositPaid && hasPayLink && (
                  <button
                    onClick={handleGetPaymentLink}
                    className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Payment Link
                  </button>
                )}
                {!depositPaid && (
                  <button
                    onClick={openRecordPaymentModal}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Mark Paid
                  </button>
                )}
                <button
                  onClick={() => handleDownload('deposit')}
                  disabled={downloading}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 sm:ml-auto"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  Deposit PDF
                </button>
              </div>
              )}
            </div>
          )}

          {/* STAGE 2: REMAINING BALANCE CARD */}
          <div
            className={`rounded-xl p-4 sm:p-5 border transition-all ${
                           isPaid
                ? 'bg-emerald-50/60 border-emerald-200'
                : hasDepositTerms && !depositPaid
                ? 'bg-slate-50/70 border-2 border-dashed border-slate-200 opacity-75'
                : 'bg-white border-2 border-teal-600 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs sm:text-sm font-bold ${isPaid ? 'text-slate-500' : 'text-slate-900'}`}>
                {hasDepositTerms ? '2. Remaining Balance' : 'Invoice Balance'}
              </span>
              {isPaid ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 shrink-0">
                  Paid
                </span>
              ) : isClosed ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 shrink-0">
                  {isRefunded ? 'Refunded' : 'Partially Refunded'}
                </span>
              ) : hasDepositTerms && !depositPaid ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600 flex items-center gap-1 shrink-0">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              ) : isOverdue ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 shrink-0">
                  Overdue
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 shrink-0">
                  Awaiting
                </span>
              )}
            </div>

            <div className="mt-2.5">
              <div
                               className={`font-extrabold tabular-nums ${
                  isPaid
                    ? 'text-lg sm:text-xl text-emerald-600'
                    : hasDepositTerms && !depositPaid
                    ? 'text-xl sm:text-2xl text-slate-400'
                    : 'text-xl sm:text-2xl text-slate-900'
                }`}
              >
                {fmt(balanceDisplay)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                {isPaid ? (
                  <span className="text-emerald-700 font-medium">
                    ✓ Paid{' '}
                    {(() => {
                      const last = payments
                        .filter((p: any) => p.kind !== 'refund' && parseFloat(p.amount) > 0 && p.paid_on)
                        .map((p: any) => String(p.paid_on))
                        .sort()
                        .pop();
                      return last ? fmtDate(last) : '';
                    })()}
                  </span>
                ) : hasDepositTerms && !depositPaid ? (
                  <span>Unlocks automatically once deposit is paid.</span>
                ) : (
                  <>
                    <span>
                      {balanceSentAt ? `Sent ${fmtTimestampDate(balanceSentAt)}` : 'Not sent yet'}
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => openDueDateEditor('balance')}
                      className="hover:text-slate-800 underline font-medium"
                    >
                      {dueDate ? `Due ${fmtDate(dueDate)}` : 'Set Due Date'}
                    </button>
                    {isOverdue && (
                      <span className="text-rose-600 font-semibold">({daysOverdue}d overdue)</span>
                    )}
                  </>
                )}
              </div>
            </div>

                       {!isPaid && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
              {(!hasDepositTerms || depositPaid) && !isPaid && (
                <>
                  {canSendInvoice && (
                    <button
                      onClick={() => setShowSendConfirm(true)}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {balanceRequestSent ? 'Resend Invoice' : 'Send Invoice'}
                    </button>
                  )}
                  {hasPayLink && (
                    <button
                      onClick={handleGetPaymentLink}
                      className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      Payment Link
                    </button>
                  )}
                  <button
                    onClick={openRecordPaymentModal}
                    className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Mark Paid
                  </button>
                </>
              )}

                         {!(total > 0 && remaining <= 0) && (
                <button
                  onClick={() => handleDownload('balance')}
                  disabled={downloading}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 sm:ml-auto"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                                   {hasDepositTerms ? 'Balance PDF' : 'Invoice PDF'}
                </button>
              )}
            </div>
            )}
          </div>

          {/* RECORDED PAYMENTS TABLE */}
          {payments.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Payment Transactions
              </h3>
              <div className="divide-y divide-slate-100">
                {payments.map((p: any) => {
                  const isRefundRow = p.kind === 'refund';
                  const reversed = isRefundRow ? 0 : reversedAmountFor(p.id);
                  const fullyReversed = !isRefundRow && netOf(p) <= 0;
                  return (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">
                          {fmt(p.amount)}{' '}
                          <span className="ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                            {p.kind}
                          </span>
                        </div>
                        <div className="text-slate-400 mt-0.5">
                          {fmtDate(p.paid_on)} • Method: {p.method || 'Manual'}
                          {reversed > 0 && !fullyReversed && (
                            <span className="text-rose-500"> • {fmt(reversed)} reversed</span>
                          )}
                        </div>
                      </div>
                      {/* Refund rows and fully-reversed payments can't be reversed again */}
                      {isRefundRow ? null : fullyReversed ? (
                        <span className="text-slate-400 font-medium shrink-0">Reversed</span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeletePayment(p)}
                          className="text-rose-600 hover:underline font-medium shrink-0 py-1"
                        >
                          Reverse
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Settings & Outbox Sidebar (1 col) */}
        <div className="space-y-4 sm:space-y-6">

          {/* Settings Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Invoice Settings
              </h3>
              {(depositLocked || taxLocked) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <Lock className="w-3 h-3" />
                  SETTINGS LOCKED
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Deposit:</span>
                {depositLocked ? (
                  <span
                    title="Deposit settings locked after payment"
                    className="font-semibold text-slate-400 flex items-center gap-1 cursor-not-allowed"
                  >
                    <Lock className="w-3 h-3" />
                    {hasDepositTerms
                      ? `${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)} (${fmt(depositAmount)})`
                      : 'Locked'}
                  </span>
                ) : (
                  <button
                    onClick={openDepositEditor}
                    className="font-semibold text-slate-900 hover:text-teal-700 underline"
                  >
                    {hasDepositTerms
                      ? `${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)} (${fmt(depositAmount)})`
                      : 'Add Deposit'}
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-200/60">
                <span className="text-slate-500">Tax Rate:</span>
                {taxLocked ? (
                  <span
                    title="Tax rate locked after payment"
                    className="font-semibold text-slate-400 flex items-center gap-1 cursor-not-allowed"
                  >
                    <Lock className="w-3 h-3" />
                    {invoiceTaxRate > 0 ? `${invoiceTaxRate}%` : 'Exempt'}
                  </span>
                ) : (
                  <button
                    onClick={openTaxEditor}
                    className="font-semibold text-slate-900 hover:text-teal-700 underline"
                  >
                    {invoiceTaxRate > 0 ? `${invoiceTaxRate}%` : 'Exempt / Add Tax'}
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-200/60">
                <span className="text-slate-500">Gateway:</span>
                <span className="font-semibold text-slate-900">
                  {activeMethodLabel || 'Not configured'}
                </span>
              </div>
            </div>
          </div>

          {/* Outbox & Email History Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Outbox &amp; Email History ({activityLog.length})
            </h3>

            {activityLog.length === 0 ? (
              <p className="text-xs text-slate-400">No email history recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {activityLog.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                        <span className="truncate">{entry.title || entry.type || 'Invoice Sent'}</span>
                      </span>
                      <button
                        onClick={() => loadPreview(entry.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-1.5 py-0.5 hover:bg-slate-50 flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {fmtTimestampDate(entry.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* MODALS CONTAINER */}
      <BillingModals
        lead={lead}
        companySlug={companySlug}
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
        dueDateEditorPhase={dueDateEditorPhase}
        setShowDueDateEditor={setShowDueDateEditor}
        savingDueDate={savingDueDate}
        currentDueDate={dueDate}
        dueDateDraft={dueDateDraft}
        setDueDateDraft={setDueDateDraft}
        handleDueDateChange={handleDueDateChange}
        handleSendInvoice={handleSendInvoice}
        confirmSendInvoice={confirmSendInvoice}
        showNoDueDateWarning={showNoDueDateWarning}
        setShowNoDueDateWarning={setShowNoDueDateWarning}
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
    </div>
  );
}