'use client';

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
} from 'lucide-react';

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

type StepStatus = 'locked' | 'ready' | 'sent' | 'done';
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

type BillingSummaryPanelProps = {
  lead: any;
  company: any;

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

  steps: Step[];
  depositPayments: any[];
  balancePayments: any[];
  reversedAmountFor: (paymentId: number) => number;

  handleDownload: () => void;
  downloading: boolean;
  hasPayLink: boolean;
  handleGetPaymentLink: () => void;

  showReminderLink: boolean;
  setShowReminderConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  daysSinceReminder: number | null;

  openRecordPaymentModal: () => void;

  payments: any[];
  paymentBadgeLabel: (p: any) => string;
  deletingPaymentId: number | null;
  setConfirmDeletePayment: React.Dispatch<React.SetStateAction<any | null>>;
  setReverseAmountDraft: React.Dispatch<React.SetStateAction<string>>;
  setReverseNoteDraft: React.Dispatch<React.SetStateAction<string>>;

  // Right column
  hasDepositTerms: boolean;
  depositType: 'percent' | 'fixed' | null;
  depositValue: number;
  depositAmount: number;
  dueDate: string;
  handleDueDateChange: (newDate: string) => void;
  activeMethodLabel: string | null;
  activityLog: any[];
  loadPreview: (entryId: number) => void;
};

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
  dueDate,
  handleDueDateChange,
  activeMethodLabel,
  activityLog,
  loadPreview,
}: BillingSummaryPanelProps) {
  return (
    <div className="bg-white border border-[#e7e2d8] rounded-2xl overflow-hidden">
      <div className="p-5 lg:p-7 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px] items-start">

        {/* LEFT: Total, progress checklist, actions, payment history */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-xl border border-[#e7e2d8] p-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-[#a8a29e]">Total</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                invoiceSent ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f1e8] text-[#78716c]'
              }`}>
                {invoiceNumber} · {invoiceSent ? 'Sent' : 'Draft'}
              </span>
            </div>
            <p className="text-3xl font-semibold text-[#1c1917] tabular-nums leading-tight">{fmt(total)}</p>
            {taxLocked ? (
              invoiceTaxRate > 0 && (
                <p className="text-[11px] text-[#a8a29e] mt-0.5 tabular-nums">Incl. {invoiceTaxRate}% tax</p>
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
            {isPaid && !isClosed ? (
              <p className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Paid in full
              </p>
            ) : null}

            <div className="border-t border-[#f0ece1] my-4" />

            {wasSettledThenGrew && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-[11px] text-blue-800">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  This job was paid in full{lead?.paid_at ? ` on ${fmtDate(lead.paid_at)}` : ''}. {fmt(remaining)} in
                  new work has been added to the quote since then — this bills the difference, not the
                  original invoice again.
                </span>
              </div>
            )}

            {!(isClosed && !refundedButOwing) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-semibold">
                {steps.map((step, i) => (
                  <span key={step.key} className="inline-flex items-center gap-1.5">
                    {i > 0 && <span className="text-[#d6d3d1]">→</span>}
                    <span
                      className={
                        step.status === 'done'
                          ? 'text-emerald-600'
                          : step.status === 'sent'
                          ? 'text-amber-700'
                          : step.status === 'ready'
                          ? 'text-brand-700'
                          : 'text-[#a8a29e]'
                      }
                    >
                      {step.title}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {isClosed && !refundedButOwing ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs text-amber-800 flex-1">
                  <p className="font-semibold text-amber-900">
                    {isPartiallyRefunded ? 'Partially refunded' : 'Refunded'}
                  </p>
                  <p className="mt-0.5">
                    {fmt(refundedAmount)} refunded{lead?.refunded_at ? ` on ${fmtDate(lead.refunded_at)}` : ''}. No
                    balance remains on this job.
                  </p>
                  {isStripeVerified && (
                    <a
                      href={`https://dashboard.stripe.com/payments/${lead.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-block text-[11px] font-semibold text-amber-900 hover:underline"
                    >
                      View charge &amp; refund in Stripe ↗
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
                      {lead?.refunded_at ? ` on ${fmtDate(lead.refunded_at)}` : ''}. {fmt(remaining)} remains
                      outstanding on this invoice.
                      {isStripeVerified && (
                        <>
                          {' '}
                          <a
                            href={`https://dashboard.stripe.com/payments/${lead.stripe_payment_intent_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-amber-900 hover:underline whitespace-nowrap"
                          >
                            View in Stripe ↗
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  {steps.map((step, i) => (
                    <div key={step.key} className="relative pb-6 pl-9 last:pb-0">
                      {i < steps.length - 1 && (
                        <span
                          className={`absolute left-3.5 top-7 bottom-0 w-px ${
                            step.status === 'done' ? 'bg-emerald-300' : 'bg-[#e7e2d8]'
                          }`}
                        />
                      )}
                      <span
                        className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                          step.status === 'done'
                            ? 'bg-emerald-500 text-white'
                            : step.status === 'sent'
                            ? 'bg-amber-50 border border-amber-300 text-amber-600'
                            : step.status === 'ready'
                            ? 'bg-white border-2 border-brand-700 text-brand-700'
                            : 'bg-[#f5f1e8] border border-[#e7e2d8] text-[#a8a29e]'
                        }`}
                      >
                        {step.status === 'done' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : step.status === 'sent' ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : step.status === 'locked' ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          i + 1
                        )}
                      </span>

                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-sm font-semibold ${step.status === 'locked' ? 'text-[#a8a29e]' : 'text-[#1c1917]'}`}>
                            {step.title}
                          </p>
                          {step.sub && (
                            <p
                              className={`text-[12px] mt-0.5 ${
                                step.status === 'done'
                                  ? 'text-emerald-600 font-medium'
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
                        </div>
                        <p
                          className={`text-sm font-bold tabular-nums shrink-0 ${
                            step.status === 'locked' ? 'text-[#d6d3d1]' : 'text-[#1c1917]'
                          }`}
                        >
                          {fmt(step.amount)}
                        </p>
                      </div>

                      {(step.action || step.needsUpgrade || step.editAction) && (
                        <div className="mt-2.5 flex flex-col items-start gap-2">
                          {(step.key === 'deposit' ? depositPayments : step.key === 'balance' ? balancePayments : []).length > 1 && (
                        <div className="mt-2 space-y-1 pl-0.5">
                          {(step.key === 'deposit' ? depositPayments : balancePayments).map((p: any) => {
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
                      )}
                      {step.action && (
                        <button
                          onClick={step.action.onClick}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {step.action.label}
                            </button>
                          )}
                          {step.needsUpgrade && (
                            <a
                              href={`/${company?.slug}/admin/settings#billing`}
                              className="text-[11px] font-semibold text-brand-700 hover:underline"
                            >
                              Upgrade to send invoices
                            </a>
                          )}
                          {step.editAction && (
                            <button
                              onClick={step.editAction.onClick}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#e7e2d8] bg-white px-3 py-1 text-[11px] font-semibold text-[#57534e] hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              {step.editAction.label}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e7e2d8] bg-[#faf9f5] px-4 py-3">
            <div className="inline-flex rounded-lg border border-[#e7e2d8] bg-white overflow-hidden shrink-0">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] transition-colors disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Download PDF
              </button>

              {hasPayLink && !isPaid && (!isClosed || refundedButOwing) && remaining > 0 && (
                <button
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
                  onClick={openRecordPaymentModal}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Record Payment
                </button>
              )}
            </div>
          </div>

          {payments.length > 0 && (
            <div className="rounded-xl border border-[#e7e2d8] overflow-hidden">
              <div className="px-4 pt-3.5 pb-2 text-[11px] font-medium uppercase tracking-wide text-[#a8a29e] bg-[#faf9f5]">
                Payment Transactions
              </div>
              <div className="divide-y divide-[#f0ece1]">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-[#1c1917] tabular-nums">
                        <span>{p.amount < 0 ? `− ${fmt(Math.abs(p.amount))}` : fmt(p.amount)}</span>
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
                          className="px-2 py-1 rounded-lg text-[10px] font-semibold text-brand-700 hover:bg-brand-50 whitespace-nowrap transition-colors"
                        >
                          Stripe ↗
                        </a>
                      )}
                      {!p.is_stripe && p.kind !== 'refund' && reversedAmountFor(p.id) < p.amount && (
                        <button
                          onClick={() => {
                            const remainingReversible = p.amount - reversedAmountFor(p.id);
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
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#faf9f5] border border-[#e7e2d8] rounded-2xl p-5 space-y-5 lg:sticky lg:top-4">
          <div>
            <p className="text-[11px] font-medium text-[#a8a29e] uppercase tracking-wide mb-2.5">
              Invoice Settings &amp; Dates
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
                <span className="text-[#78716c]">Payment Due Date</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 font-medium text-[#1c1917] hover:text-brand-700">
                  <Calendar className="w-3.5 h-3.5 text-[#a8a29e]" />
                  {dueDate ? fmtDate(dueDate) : <span className="text-[#a8a29e]">Set Date</span>}
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

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
                activityLog.map((entry: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#e7e2d8] text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[#292524] truncate">
                          {entry.type === 'invoice'
                            ? entry.metadata?.kind === 'deposit'
                              ? 'Deposit Sent'
                              : entry.metadata?.kind === 'balance'
                              ? 'Balance Sent'
                              : 'Invoice Sent'
                            : entry.type === 'payment_reminder'
                            ? 'Reminder Sent'
                            : entry.type}
                        </p>
                        <p className="text-[11px] text-[#a8a29e]">
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
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 border border-[#e7e2d8] text-[#57534e] hover:text-[#1c1917] hover:bg-[#f5f1e8] rounded-lg text-[11px] font-medium transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}