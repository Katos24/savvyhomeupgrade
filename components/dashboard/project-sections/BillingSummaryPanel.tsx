'use client';

import React from 'react';
import {
  CheckCircle,
  Download,
  Loader2,
  Send,
  Eye,
  CreditCard,
  Calendar,
  AlertCircle,
  Edit2,
  Clock,
  Lock,
  QrCode,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

// ==========================================
// Types & Interfaces
// ==========================================

export type StepStatus = 'locked' | 'ready' | 'sent' | 'overdue' | 'done';

export interface StepAction {
  label: string;
  onClick: () => void;
}

export interface Step {
  key: string;
  title: string;
  amount: number;
  status: StepStatus;
  sub?: string;
  action?: StepAction;
  needsUpgrade?: boolean;
  editAction?: StepAction;
  // Added for the deposit/balance due-date split — each phase now
  // carries its own due date instead of one shared field.
  dueDate?: string | null;
  isOverdue?: boolean;
  editDueDateAction?: StepAction;
  dueDateLocked?: boolean;
}

export interface Payment {
  id: number;
  amount: number;
  kind?: 'payment' | 'refund';
  method: string;
  paid_on?: string | null;
  is_stripe?: boolean;
  card_brand?: string;
  card_last4?: string;
  stripe_payment_intent_id?: string;
}

export interface ActivityLogEntry {
  id: number;
  type: string;
  status?: string;
  created_at: string;
  has_body?: boolean;
  metadata?: {
    kind?: 'deposit' | 'balance' | string;
  };
}

export interface Lead {
  paid_at?: string | null;
  refunded_at?: string | null;
  stripe_payment_intent_id?: string;
}

export interface Company {
  slug: string;
}

export interface BillingSummaryPanelProps {
  lead?: Lead | null;
  company?: Company | null;

  invoiceNumber: string;
  invoiceSent: boolean;
  total: number;
  taxLocked: boolean;
  invoiceTaxRate: number;
  openTaxEditor: () => void;

  isPaid: boolean;
  isClosed: boolean;
  isPartiallyRefunded: boolean;
  isStripeVerified: boolean;
  refundedButOwing: boolean;
  refundedAmount: number;
  remaining: number;

  wasSettledThenGrew: boolean;
  amountDueNow: number;
  dueNowLabel: string;

  steps: Step[];
  depositPayments: Payment[];
  balancePayments: Payment[];
  reversedAmountFor: (paymentId: number) => number;

  handleDownload: () => void;
  downloading: boolean;
  hasPayLink: boolean;
  handleGetPaymentLink: () => void;

  showReminderLink: boolean;
  setShowReminderConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  daysSinceReminder: number | null;

  openRecordPaymentModal: () => void;

  payments: Payment[];
  paymentBadgeLabel: (p: Payment) => string;
  deletingPaymentId: number | null;
  setConfirmDeletePayment: React.Dispatch<React.SetStateAction<Payment | null>>;
  setReverseAmountDraft: React.Dispatch<React.SetStateAction<string>>;
  setReverseNoteDraft: React.Dispatch<React.SetStateAction<string>>;

  // Right column — due date now lives per-step, so these are just the
  // deposit-terms summary and payment link status.
  hasDepositTerms: boolean;
  depositType: 'percent' | 'fixed' | null;
  depositValue: number;
  depositAmount: number;
  activeMethodLabel: string | null;
  activityLog: ActivityLogEntry[];
  loadPreview: (entryId: number) => void;
}

// ==========================================
// Formatters
// ==========================================

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const fmt = (n: number | null | undefined): string => usdFormatter.format(n || 0);

function fmtDate(d: string | null | undefined): string | null {
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

function fmtShortDateTime(isoString: string): { dateStr: string; timeStr: string } {
  const date = new Date(isoString);
  return {
    dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timeStr: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}

// ==========================================
// Sub-Components
// ==========================================

function StatusBadge({ status }: { status: StepStatus }) {
  const baseClasses =
    'inline-flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-bold uppercase tracking-wide shrink-0';

  switch (status) {
    case 'done':
      return (
        <span className={`${baseClasses} bg-emerald-50 text-emerald-700`}>
          <CheckCircle className="w-3 h-3" /> Paid
        </span>
      );
    case 'overdue':
      return (
        <span className={`${baseClasses} bg-rose-50 text-rose-600`}>
          <AlertCircle className="w-3 h-3" /> Overdue
        </span>
      );
    case 'sent':
      return (
        <span className={`${baseClasses} bg-amber-50 text-amber-600`}>
          <Clock className="w-3 h-3" /> Sent
        </span>
      );
    case 'ready':
      return (
        <span className={`${baseClasses} bg-brand-50 text-brand-700`}>
          Ready
        </span>
      );
    case 'locked':
    default:
      return (
        <span className={`${baseClasses} bg-[#f5f1e8] text-[#a8a29e]`}>
          <Lock className="w-3 h-3" /> Locked
        </span>
      );
  }
}

// One deposit/balance box. Mobile: full width, stacked. Desktop: two
// columns side by side via the grid this is called from — this
// component itself doesn't need to know which, it just fills its cell.
function PhaseBox({ step }: { step: Step }) {
  const isLocked = step.status === 'locked';

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 h-full flex flex-col ${
        isLocked
          ? 'border-dashed border-[#e7e2d8] bg-[#faf9f5]/60 opacity-60'
          : step.status === 'done'
          ? 'border-emerald-200 bg-emerald-50/30'
          : step.status === 'overdue'
          ? 'border-rose-200 bg-rose-50/30'
          : 'border-[#e7e2d8] bg-white'
      }`}
    >
            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#a8a29e]">
            {step.title}
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold tabular-nums mt-0.5 ${
              isLocked ? 'text-[#d6d3d1]' : 'text-[#1c1917]'
            }`}
          >
            {fmt(step.amount)}
          </p>
        </div>
        <StatusBadge status={step.status} />
      </div>

      {step.sub && (
        <p
          className={`text-[12px] mb-3 ${
            step.status === 'done'
              ? 'text-emerald-700 font-medium'
              : step.status === 'overdue'
              ? 'text-rose-700 font-semibold'
              : step.status === 'sent'
              ? 'text-amber-800 font-semibold'
              : step.status === 'ready'
              ? 'text-brand-700 font-medium'
              : 'text-[#a8a29e]'
          }`}
        >
          {step.sub}
        </p>
      )}

      {!isLocked && step.editDueDateAction && (
        <div className="flex items-center justify-between gap-2 mb-3 text-[11px]">
          <span className="text-[#a8a29e]">Due</span>
          {step.dueDateLocked ? (
            <span className="font-medium text-[#57534e]">
              {step.dueDate ? fmtDate(step.dueDate) : 'Not set'}
            </span>
          ) : (
            <button
              type="button"
              onClick={step.editDueDateAction.onClick}
              className={`inline-flex items-center gap-1 font-semibold rounded-lg px-1.5 py-0.5 -mr-1.5 transition-colors ${
                step.isOverdue
                  ? 'text-rose-700 hover:bg-rose-100'
                  : !step.dueDate
                  ? 'text-amber-700 hover:bg-amber-100'
                  : 'text-[#1c1917] hover:text-brand-700'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {step.editDueDateAction.label}
            </button>
          )}
        </div>
      )}

      <div className="mt-auto space-y-2">
        {step.action && (
          <button
            type="button"
            onClick={step.action.onClick}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {step.action.label}
          </button>
        )}

        {step.needsUpgrade && (
          <p className="text-[11px] text-[#a8a29e] text-center">
            {step.sub}
          </p>
        )}

        {step.editAction && (
          <button
            type="button"
            onClick={step.editAction.onClick}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-[#e7e2d8] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#57534e] hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            {step.editAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Main Component
// ==========================================

export default function BillingSummaryPanel({
  lead,
  company,
  invoiceNumber,
  invoiceSent,
  total,
  taxLocked,
  invoiceTaxRate,
  openTaxEditor,
  isPaid,
  isClosed,
  isPartiallyRefunded,
  isStripeVerified,
  refundedButOwing,
  refundedAmount,
  remaining,
  wasSettledThenGrew,
  amountDueNow,
  dueNowLabel,
  steps,
  depositPayments,
  balancePayments,
  reversedAmountFor,
  handleDownload,
  downloading,
  hasPayLink,
  handleGetPaymentLink,
  showReminderLink,
  setShowReminderConfirm,
  daysSinceReminder,
  openRecordPaymentModal,
  payments,
  paymentBadgeLabel,
  deletingPaymentId,
  setConfirmDeletePayment,
  setReverseAmountDraft,
  setReverseNoteDraft,
  hasDepositTerms,
  depositType,
  depositValue,
  depositAmount,
  activeMethodLabel,
  activityLog,
  loadPreview,
}: BillingSummaryPanelProps) {
  // The boxes to actually render — deposit+balance side by side, or a
  // single invoice box for jobs with no deposit terms. The 'complete'
  // step (hasDepositTerms case) isn't rendered as a third box; its
  // information (isPaid, paid date) already drives the emerald "Paid in
  // full" banner below instead.
  const boxSteps = steps.filter((s) => s.key !== 'complete');
  const completeStep = steps.find((s) => s.key === 'complete');

  return (
    <div className="bg-white border border-[#e7e2d8] rounded-2xl overflow-hidden">
      <div className="p-5 lg:p-7 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px] items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-xl border border-[#e7e2d8] p-5">
            {/* Header / Invoice Metadata */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#a8a29e]">
                Total
              </span>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  invoiceSent ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f1e8] text-[#78716c]'
                }`}
              >
                {invoiceNumber} · {invoiceSent ? 'Sent' : 'Draft'}
              </span>
            </div>

            <p className="text-3xl font-semibold text-[#1c1917] tabular-nums leading-tight">
              {fmt(total)}
            </p>

            {taxLocked ? (
              invoiceTaxRate > 0 && (
                <p className="text-[11px] text-[#a8a29e] mt-0.5 tabular-nums">
                  Incl. {invoiceTaxRate}% tax
                </p>
              )
            ) : (
              <button
                type="button"
                onClick={openTaxEditor}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#e7e2d8] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#78716c] hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
              >
                <Edit2 className="w-2.5 h-2.5" />
                {invoiceTaxRate > 0 ? `Incl. ${invoiceTaxRate}% tax` : 'Add tax'}
              </button>
            )}

            {isPaid && !isClosed && (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Paid in full
                {completeStep?.sub ? ` — ${completeStep.sub.replace('Completed ', '')}` : ''}
              </p>
            )}

            {amountDueNow > 0 && (
              <div
                className={`mt-4 rounded-xl border p-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 ${
                  isClosed ? 'border-rose-200 bg-rose-50' : 'border-brand-100 bg-brand-50/60'
                }`}
              >
                <p
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    isClosed ? 'text-rose-700' : 'text-brand-700'
                  }`}
                >
                  {dueNowLabel}
                </p>
                <p className="text-2xl font-bold text-[#1c1917] tabular-nums">
                  {fmt(amountDueNow)}
                </p>
              </div>
            )}

            <div className="border-t border-[#f0ece1] my-4" />

            {wasSettledThenGrew && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[11px] text-blue-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  This job was paid in full
                  {lead?.paid_at ? ` on ${fmtDate(lead.paid_at)}` : ''}. {fmt(remaining)} in new work
                  has been added to the quote since then — this bills the difference, not the
                  original invoice again.
                </span>
              </div>
            )}

            {/* Refunded or Closed State */}
            {isClosed && !refundedButOwing ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs text-amber-800 flex-1">
                  <p className="font-semibold text-amber-900">
                    {isPartiallyRefunded ? 'Partially refunded' : 'Refunded'}
                  </p>
                  <p className="mt-0.5">
                    {fmt(refundedAmount)} refunded
                    {lead?.refunded_at ? ` on ${fmtDate(lead.refunded_at)}` : ''}. No balance
                    remains on this job.
                  </p>
                  {isStripeVerified && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${lead?.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 hover:underline"
                    >
                      View charge &amp; refund in Stripe <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <>
                {refundedButOwing && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>{fmt(refundedAmount)} refunded</strong>
                      {lead?.refunded_at ? ` on ${fmtDate(lead.refunded_at)}` : ''}. {fmt(remaining)}{' '}
                      remains outstanding on this invoice.
                      {isStripeVerified && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${lead?.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 inline-flex items-center gap-0.5 font-semibold text-amber-900 hover:underline whitespace-nowrap"
                        >
                          View in Stripe <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </div>
                )}

                {/* TWO-BOX GRID — stacked on mobile, side by side from sm
                    up. A single box (no-deposit jobs) just fills the
                    grid alone rather than sitting oddly next to an empty
                    cell — grid-cols-1 with a single item naturally does
                    this without extra conditional logic. */}
                                <div className="mt-4 grid grid-cols-1 gap-3">
                  {boxSteps.map((step) => (
                    <PhaseBox key={step.key} step={step} />
                  ))}
                </div>

                {/* Individual payment rows per phase, when more than one
                    payment exists for that phase — same detail the old
                    timeline showed, now under its own box's section. */}
                {(depositPayments.length > 1 || balancePayments.length > 1) && (
                  <div className="mt-3 space-y-3">
                    {depositPayments.length > 1 && (
                      <div className="rounded-lg border border-[#e7e2d8] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#a8a29e] mb-1.5">
                          Deposit payments
                        </p>
                        <div className="space-y-1">
                          {depositPayments.map((p) => {
                            const refunded = reversedAmountFor(p.id);
                            return (
                              <div key={p.id} className="flex items-center justify-between text-[11px] text-[#78716c]">
                                <span>
                                  {p.method?.replace('_', ' ') || 'Payment'} · {fmtDate(p.paid_on)}
                                  {refunded > 0 && <span className="text-amber-700"> · {fmt(refunded)} refunded</span>}
                                </span>
                                <span className="tabular-nums font-medium text-[#57534e]">
                                  {fmt(Math.max(p.amount - refunded, 0))}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {balancePayments.length > 1 && (
                      <div className="rounded-lg border border-[#e7e2d8] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#a8a29e] mb-1.5">
                          Balance payments
                        </p>
                        <div className="space-y-1">
                          {balancePayments.map((p) => {
                            const refunded = reversedAmountFor(p.id);
                            return (
                              <div key={p.id} className="flex items-center justify-between text-[11px] text-[#78716c]">
                                <span>
                                  {p.method?.replace('_', ' ') || 'Payment'} · {fmtDate(p.paid_on)}
                                  {refunded > 0 && <span className="text-amber-700"> · {fmt(refunded)} refunded</span>}
                                </span>
                                <span className="tabular-nums font-medium text-[#57534e]">
                                  {fmt(Math.max(p.amount - refunded, 0))}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7e2d8] bg-[#faf9f5] px-4 py-3">
            <div className="inline-flex rounded-lg border border-[#e7e2d8] bg-white overflow-hidden shrink-0">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Download PDF
              </button>

              {hasPayLink && !isPaid && (!isClosed || refundedButOwing) && remaining > 0 && (
                <button
                  type="button"
                  onClick={handleGetPaymentLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] border-l border-[#e7e2d8] transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  In-Person Payment
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {showReminderLink && (
                <button
                  type="button"
                  onClick={() => setShowReminderConfirm(true)}
                  disabled={daysSinceReminder === 0}
                  className="inline-flex items-center gap-1 px-2 py-2 rounded-lg text-[10px] font-medium text-[#a8a29e] hover:text-[#57534e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Clock className="w-3 h-3" />
                  {daysSinceReminder === 0 ? 'Reminder sent today' : 'Send reminder'}
                </button>
              )}

              {(!isClosed || refundedButOwing) && !isPaid && (
                <button
                  type="button"
                  onClick={openRecordPaymentModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Record Payment
                </button>
              )}
            </div>
          </div>

          {/* Payment Transactions History */}
          {payments.length > 0 && (
            <div className="rounded-xl border border-[#e7e2d8] overflow-hidden">
              <div className="px-4 pt-3.5 pb-2 text-[11px] font-medium uppercase tracking-wide text-[#a8a29e] bg-[#faf9f5]">
                Payment Transactions
              </div>
              <div className="divide-y divide-[#f0ece1]">
                {payments.map((p) => {
                  const reversedAmt = reversedAmountFor(p.id);
                  const canReverse = !p.is_stripe && p.kind !== 'refund' && reversedAmt < p.amount;

                  return (
                    <div key={p.id} className="flex items-center justify-between px-4 py-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-[#1c1917] tabular-nums">
                          <span>
                            {p.amount < 0 ? `− ${fmt(Math.abs(p.amount))}` : fmt(p.amount)}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#f5f1e8] text-[#57534e] whitespace-nowrap">
                            {paymentBadgeLabel(p)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a8a29e] capitalize mt-0.5">
                          {p.is_stripe && p.card_brand
                            ? `${p.card_brand} ····${p.card_last4}`
                            : !p.is_stripe && p.method === 'stripe'
                            ? 'Stripe (manual)'
                            : p.method.replace('_', ' ')}
                          {p.paid_on && ` · ${fmtDate(p.paid_on)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {p.is_stripe && p.kind !== 'refund' && p.stripe_payment_intent_id && (
                          <a
                            href={`https://dashboard.stripe.com/payments/${p.stripe_payment_intent_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-semibold text-brand-700 hover:bg-brand-50 whitespace-nowrap transition-colors"
                          >
                            Stripe <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {canReverse && (
                          <button
                            type="button"
                            onClick={() => {
                              const remainingReversible = p.amount - reversedAmt;
                              setConfirmDeletePayment(p);
                              setReverseAmountDraft(String(remainingReversible));
                              setReverseNoteDraft('');
                            }}
                            disabled={deletingPaymentId === p.id}
                            className="p-1.5 rounded-lg text-[#d6d3d1] hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50"
                            aria-label="Reverse payment"
                          >
                            {deletingPaymentId === p.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Settings & Outbox Log */}
        <div className="bg-[#faf9f5] border border-[#e7e2d8] rounded-2xl p-5 space-y-5 lg:sticky lg:top-4">
          <div>
            <p className="text-[11px] font-medium text-[#a8a29e] uppercase tracking-wide mb-2.5">
              Invoice Settings
            </p>
            <div className="space-y-2.5 text-xs">
              {hasDepositTerms && (
                <div className="flex justify-between items-center">
                  <span className="text-[#78716c]">Deposit</span>
                  <span className="font-medium text-[#1c1917] tabular-nums">
                    {depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)}{' '}
                    <span className="text-[#a8a29e]">({fmt(depositAmount)})</span>
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-[#78716c]">Payment Link Gateway</span>
                {hasPayLink ? (
                  <span className="font-medium text-[#1c1917]">{activeMethodLabel}</span>
                ) : (
                  <a
                    href={`/${company?.slug}/home#payments`}
                    className="text-[#78716c] hover:text-[#1c1917] underline"
                  >
                    Not Configured
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#e7e2d8] pt-4">
            <p className="text-[11px] font-medium text-[#a8a29e] uppercase tracking-wide mb-2.5">
              Outbox &amp; Email History ({activityLog.length})
            </p>
            <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
              {activityLog.length === 0 ? (
                <p className="text-xs text-[#a8a29e] py-2 text-center">No emails sent yet.</p>
              ) : (
                activityLog.map((entry) => {
                  const { dateStr, timeStr } = fmtShortDateTime(entry.created_at);
                  const isDeposit = entry.metadata?.kind === 'deposit';
                  const isBalance = entry.metadata?.kind === 'balance';

                  const label =
                    entry.type === 'invoice'
                      ? isDeposit
                        ? 'Deposit Sent'
                        : isBalance
                        ? 'Balance Sent'
                        : 'Invoice Sent'
                      : entry.type === 'payment_reminder'
                      ? 'Reminder Sent'
                      : entry.type;

                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#e7e2d8] text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#292524] truncate">{label}</p>
                          <p className="text-[11px] text-[#a8a29e]">
                            {dateStr} · {timeStr}
                          </p>
                        </div>
                      </div>

                      {entry.has_body && (
                        <button
                          type="button"
                          onClick={() => loadPreview(entry.id)}
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 border border-[#e7e2d8] text-[#57534e] hover:text-[#1c1917] hover:bg-[#f5f1e8] rounded-lg text-[11px] font-medium transition-colors"
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}