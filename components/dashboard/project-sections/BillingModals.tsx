'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Send,
  Mail,
  CreditCard,
  AlertCircle,
  Clock,
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

const paymentMethodLabels: Record<string, string> = {
  venmo: 'Venmo',
  zelle: 'Zelle',
  cashapp: 'Cash App',
  paypal: 'PayPal',
  stripe: 'Stripe',
  other: 'your payment link',
};

// Every popup BillingSection can show, in one place. BillingSection owns
// all the state and handlers below — this component just renders whichever
// modal is currently open.
type BillingModalsProps = {
  lead: any;

  // Send Invoice
  showSendConfirm: boolean;
  setShowSendConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  sending: boolean;
  invoiceNumber: string;
  awaitingDeposit: boolean;
  depositPaymentsCount: number;
  invoiceSent: boolean;
  balanceRequestSent: boolean;
  hasDepositTerms: boolean;
  isPaid: boolean;
  depositType: 'percent' | 'fixed' | null;
  depositValue: number;
  depositRemaining: number;
  depositCollected: number;
  remaining: number;
  total: number;
  depositAmount: number;
  hasPayLink: boolean;
  activeMethodLabel: string | null;
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
  handleSendInvoice: () => void;

  // Confirm Delete/Reverse Payment
  confirmDeletePayment: any | null;
  setConfirmDeletePayment: React.Dispatch<React.SetStateAction<any | null>>;
  deletingPaymentId: number | null;
  reverseAmountDraft: string;
  setReverseAmountDraft: React.Dispatch<React.SetStateAction<string>>;
  reverseNoteDraft: string;
  setReverseNoteDraft: React.Dispatch<React.SetStateAction<string>>;
  handleReversePayment: (paymentId: number, amount: number, note: string) => Promise<void>;

  // Record Payment
  showRecordPayment: boolean;
  setShowRecordPayment: React.Dispatch<React.SetStateAction<boolean>>;
  savingPayment: boolean;
  paymentAmount: string;
  setPaymentAmount: React.Dispatch<React.SetStateAction<string>>;
  rawAmount: string;
  setRawAmount: React.Dispatch<React.SetStateAction<string>>;
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  paymentDate: string;
  setPaymentDate: React.Dispatch<React.SetStateAction<string>>;
  depositPaid: boolean;
  paidAmount: number;
  handleSavePayment: () => void;

  // Edit Deposit Terms
  showDepositEditor: boolean;
  setShowDepositEditor: React.Dispatch<React.SetStateAction<boolean>>;
  savingDeposit: boolean;
  depositTypeDraft: 'percent' | 'fixed';
  setDepositTypeDraft: React.Dispatch<React.SetStateAction<'percent' | 'fixed'>>;
  depositValueDraft: string;
  setDepositValueDraft: React.Dispatch<React.SetStateAction<string>>;
  handleSaveDepositTerms: (clear?: boolean) => void;

  // Edit Tax Rate
  showTaxEditor: boolean;
  setShowTaxEditor: React.Dispatch<React.SetStateAction<boolean>>;
  savingTax: boolean;
  invoiceTaxRate: number;
  taxRateDraft: string;
  setTaxRateDraft: React.Dispatch<React.SetStateAction<string>>;
  handleSaveTaxRate: (clear?: boolean) => void;

  // Edit Due Date
  showDueDateEditor: boolean;
  setShowDueDateEditor: React.Dispatch<React.SetStateAction<boolean>>;
  savingDueDate: boolean;
  currentDueDate: string;
  dueDateDraft: string;
  setDueDateDraft: React.Dispatch<React.SetStateAction<string>>;
  handleDueDateChange: (newDate: string) => void;

  // In-Person Payment Link
  showPaymentLinkModal: boolean;
  setShowPaymentLinkModal: React.Dispatch<React.SetStateAction<boolean>>;
  loadingPaymentLink: boolean;
  paymentLinkError: string;
  paymentLinkData: { url: string; kind: string | null; amount: number; method?: string; linkType?: string } | null;
  paymentLinkQr: string | null;
  linkCopied: boolean;
  handleGetPaymentLink: () => void;
  handleCopyPaymentLink: () => void;

  // Payment Reminder
  showReminderConfirm: boolean;
  setShowReminderConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  sendingReminder: boolean;
  currentAmountDue: number;
  lastReminderSent: string | null;
  daysSinceReminder: number | null;
  handleSendReminder: () => void;

  // Email Preview
  previewHtml: string | null;
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function BillingModals({
  lead,
  showSendConfirm,
  setShowSendConfirm,
  sending,
  invoiceNumber,
  awaitingDeposit,
  depositPaymentsCount,
  invoiceSent,
  balanceRequestSent,
  hasDepositTerms,
  isPaid,
  depositType,
  depositValue,
  depositRemaining,
  depositCollected,
  remaining,
  total,
  depositAmount,
  hasPayLink,
  activeMethodLabel,
  dueDate,
  setDueDate,
  handleSendInvoice,
  confirmDeletePayment,
  setConfirmDeletePayment,
  deletingPaymentId,
  reverseAmountDraft,
  setReverseAmountDraft,
  reverseNoteDraft,
  setReverseNoteDraft,
  handleReversePayment,
  showRecordPayment,
  setShowRecordPayment,
  savingPayment,
  paymentAmount,
  setPaymentAmount,
  rawAmount,
  setRawAmount,
  paymentMethod,
  setPaymentMethod,
  paymentDate,
  setPaymentDate,
  depositPaid,
  paidAmount,
  handleSavePayment,
  showDepositEditor,
  setShowDepositEditor,
  savingDeposit,
  depositTypeDraft,
  setDepositTypeDraft,
  depositValueDraft,
  setDepositValueDraft,
  handleSaveDepositTerms,
  showTaxEditor,
  setShowTaxEditor,
  savingTax,
  invoiceTaxRate,
  taxRateDraft,
  setTaxRateDraft,
  handleSaveTaxRate,
  showDueDateEditor,
  setShowDueDateEditor,
  savingDueDate,
  currentDueDate,
  dueDateDraft,
  setDueDateDraft,
  handleDueDateChange,
  showPaymentLinkModal,
  setShowPaymentLinkModal,
  loadingPaymentLink,
  paymentLinkError,
  paymentLinkData,
  paymentLinkQr,
  linkCopied,
  handleGetPaymentLink,
  handleCopyPaymentLink,
  showReminderConfirm,
  setShowReminderConfirm,
  sendingReminder,
  currentAmountDue,
  lastReminderSent,
  daysSinceReminder,
  handleSendReminder,
  previewHtml,
  setPreviewHtml,
}: BillingModalsProps) {
  return (
    <>
      {/* MODAL 1: SEND INVOICE */}
      <AnimatePresence>
        {showSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !sending && setShowSendConfirm(false)}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">
                  {awaitingDeposit
                    ? depositPaymentsCount > 0
                      ? 'Resend Deposit Request'
                      : 'Send Deposit Request'
                    : balanceRequestSent
                    ? 'Resend Invoice'
                    : 'Send Invoice'}
                </h3>
                <button
                  type="button"
                  onClick={() => !sending && setShowSendConfirm(false)}
                  disabled={sending}
                  aria-label="Close"
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between gap-3 px-0.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1c1917] truncate">{lead?.name || 'Client'}</p>
                    <p className="text-[11px] text-[#78716c] truncate">{lead?.email || 'No email'}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#f5f1e8] text-[#78716c]">
                    {invoiceNumber}
                  </span>
                </div>

                {hasDepositTerms && !isPaid ? (
                  <div className="rounded-xl border border-[#e7e2d8] overflow-hidden">
                    <div className="p-3.5 bg-brand-50/60 border-b border-[#e7e2d8]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold text-brand-700">
                          {awaitingDeposit
                            ? `Deposit due now${depositType === 'percent' ? ` · ${depositValue}%` : ''}`
                            : 'Balance due now'}
                        </p>
                        <p className="text-xl font-bold text-[#1c1917] tabular-nums shrink-0">
                          {fmt(awaitingDeposit ? depositRemaining : remaining)}
                        </p>
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 space-y-1 text-[11px]">
                      {awaitingDeposit ? (
                        <>
                          {depositCollected > 0 && (
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Already paid toward deposit</span>
                              <span className="tabular-nums">{fmt(depositCollected)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-[#78716c]">
                            <span>Balance due on completion</span>
                            <span className="tabular-nums">{fmt(total - depositAmount)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Deposit already paid</span>
                          <span className="tabular-nums">{fmt(depositCollected)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-[#57534e] pt-1 border-t border-[#f0ece1]">
                        <span>Total invoice</span>
                        <span className="tabular-nums">{fmt(total)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#e7e2d8] p-3.5 flex items-center justify-between gap-3">
                    <p className="text-[11px] font-semibold text-[#78716c]">Amount billed</p>
                    <p className="text-xl font-bold text-[#1c1917] tabular-nums">{fmt(remaining)}</p>
                  </div>
                )}

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
                  <label htmlFor="modal-due-date" className="block text-xs font-medium text-[#57534e] mb-1">
                    Invoice Due Date
                  </label>
                  <input
                    id="modal-due-date"
                    type="date"
                    value={dueDate || ''}
                    disabled={sending}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-brand-700"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { label: 'Due on receipt', days: 0 },
                      { label: '+7 days', days: 7 },
                      { label: '+14 days', days: 14 },
                      { label: '+30 days', days: 30 },
                    ].map((preset) => {
                      const presetDate = new Date();
                      presetDate.setDate(presetDate.getDate() + preset.days);
                      const presetDateStr = presetDate.toISOString().split('T')[0];
                      const isSelected = dueDate === presetDateStr;
                      return (
                        <button
                          key={preset.days}
                          type="button"
                          disabled={sending}
                          onClick={() => setDueDate(presetDateStr)}
                          className={`px-3 py-2 rounded-full border text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-brand-700 border-brand-700 text-white'
                              : 'border-[#e7e2d8] text-[#57534e] hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                  {!dueDate && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>No due date set.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSendConfirm(false)}
                  disabled={sending}
                  className="flex-1 py-2.5 border border-[#e7e2d8] text-[#57534e] font-medium text-xs rounded-xl hover:bg-[#f5f1e8] transition-colors"
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

      {/* CONFIRM DELETE PAYMENT */}
      <AnimatePresence>
        {confirmDeletePayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => deletingPaymentId === null && setConfirmDeletePayment(null)}
            className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-[#1c1917]">Remove this payment?</h3>
                <button
                  type="button"
                  onClick={() => setConfirmDeletePayment(null)}
                  disabled={deletingPaymentId !== null}
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e7e2d8] mb-3 flex items-center justify-between text-sm">
                <span className="text-[#57534e] capitalize">
                  {confirmDeletePayment.kind} · {confirmDeletePayment.method?.replace('_', ' ')}
                </span>
                <span className="font-bold text-[#1c1917] tabular-nums">
                  {fmt(confirmDeletePayment.amount)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-[#57534e] mb-1">Amount to reverse</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={reverseAmountDraft}
                    onChange={(e) => setReverseAmountDraft(e.target.value)}
                    className="w-full rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-brand-700"
                  />
                  <p className="mt-1 text-[11px] text-[#a8a29e]">Full amount by default — edit for a partial correction.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534e] mb-1">Reason</label>
                  <input
                    type="text"
                    value={reverseNoteDraft}
                    onChange={(e) => setReverseNoteDraft(e.target.value)}
                    placeholder="e.g. entered wrong amount"
                    className="w-full rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800 mb-5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This adds a reversal entry — the original payment stays on record. Balance due, payment
                  status, and deposit/tax editing will recalculate to reflect the correction.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeletePayment(null)}
                  disabled={deletingPaymentId !== null}
                  className="flex-1 py-2.5 border border-[#e7e2d8] text-[#57534e] font-medium text-xs rounded-xl hover:bg-[#f5f1e8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const amt = parseFloat(reverseAmountDraft || '0');
                    await handleReversePayment(confirmDeletePayment.id, amt, reverseNoteDraft);
                    setConfirmDeletePayment(null);
                  }}
                  disabled={deletingPaymentId !== null || !reverseAmountDraft}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {deletingPaymentId !== null ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reverse Payment'}
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
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">Record Manual Payment</h3>
                <button
                  onClick={() => !savingPayment && setShowRecordPayment(false)}
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5 text-xs">
                <div>
                  <label className="block font-medium text-[#57534e] mb-1">Amount Collected</label>
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
                    className="w-full px-3 py-2.5 bg-[#faf9f5] border border-[#e7e2d8] rounded-lg text-sm font-bold tabular-nums outline-none focus:bg-white focus:border-brand-700"
                  />

                  <div className="mt-2 grid gap-1.5">
                    {hasDepositTerms && !depositPaid && depositAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const shortfall = Math.max(depositAmount - paidAmount, 0);
                          setRawAmount(shortfall.toString());
                          setPaymentAmount(
                            shortfall.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                          if (!paymentDate) setPaymentDate(new Date().toISOString().split('T')[0]);
                        }}
                        className="w-full p-2 rounded-lg border border-[#e7e2d8] bg-[#faf9f5] hover:bg-[#f5f1e8] flex items-center justify-between transition-colors text-[11px]"
                      >
                        <span>Fill Required Deposit</span>
                        <span className="font-bold tabular-nums">{fmt(Math.max(depositAmount - paidAmount, 0))}</span>
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
                        className="w-full p-2 rounded-lg border border-[#e7e2d8] bg-[#faf9f5] hover:bg-[#f5f1e8] flex items-center justify-between transition-colors text-[11px]"
                      >
                        <span>Fill Full Balance</span>
                        <span className="font-bold tabular-nums">{fmt(remaining)}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#57534e] mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-lg outline-none focus:bg-white focus:border-brand-700 font-medium"
                  >
                    <option value="">Select Method...</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card (External)</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="stripe">Stripe (manual entry)</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#57534e] mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#faf9f5] border border-[#e7e2d8] rounded-lg outline-none focus:bg-white focus:border-brand-700 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRecordPayment(false)}
                  disabled={savingPayment}
                  className="flex-1 py-2.5 border border-[#e7e2d8] text-[#57534e] font-medium text-xs rounded-xl hover:bg-[#f5f1e8] transition-colors"
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

      {/* MODAL: EDIT DEPOSIT TERMS */}
      <AnimatePresence>
        {showDepositEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !savingDeposit && setShowDepositEditor(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">
                  {hasDepositTerms ? 'Edit Deposit Terms' : 'Collect a Deposit First?'}
                </h3>
                <button
                  type="button"
                  onClick={() => !savingDeposit && setShowDepositEditor(false)}
                  disabled={savingDeposit}
                  aria-label="Close"
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-[#57534e]">
                  {hasDepositTerms ? 'Change the deposit amount' : 'How much is the deposit?'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="inline-flex overflow-hidden rounded-lg border border-[#e7e2d8] shrink-0">
                    {(['percent', 'fixed'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setDepositTypeDraft(t)}
                        className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                          depositTypeDraft === t
                            ? 'bg-brand-700 text-white'
                            : 'bg-white text-[#57534e] hover:bg-[#f5f1e8]'
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
                    className="min-w-0 flex-1 rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositEditor(false)}
                  disabled={savingDeposit}
                  className="px-3 py-2 rounded-lg border border-[#e7e2d8] text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] disabled:opacity-50"
                >
                  Cancel
                </button>
                {hasDepositTerms && (
                  <button
                    type="button"
                    onClick={() => handleSaveDepositTerms(true)}
                    disabled={savingDeposit}
                    className="px-3 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Remove deposit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveDepositTerms(false)}
                  disabled={savingDeposit || !depositValueDraft}
                  className="px-3 py-2 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingDeposit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {savingDeposit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT TAX RATE */}
      <AnimatePresence>
        {showTaxEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !savingTax && setShowTaxEditor(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">
                  {invoiceTaxRate > 0 ? 'Edit Tax Rate' : 'Add Tax'}
                </h3>
                <button
                  type="button"
                  onClick={() => !savingTax && setShowTaxEditor(false)}
                  disabled={savingTax}
                  aria-label="Close"
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {invoiceSent && (
                <div className="flex items-start gap-2 p-2.5 mb-3 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    This invoice was already sent. The customer&rsquo;s copy still shows the old
                    rate — only the next thing you send will reflect this change.
                  </span>
                </div>
              )}

              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-[#57534e]">Tax rate for this quote</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={taxRateDraft}
                    onChange={(e) => setTaxRateDraft(e.target.value)}
                    placeholder="8.625"
                    className="min-w-0 flex-1 rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-brand-700"
                  />
                  <span className="text-sm font-semibold text-[#78716c] shrink-0">%</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaxEditor(false)}
                  disabled={savingTax}
                  className="px-3 py-2 rounded-lg border border-[#e7e2d8] text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] disabled:opacity-50"
                >
                  Cancel
                </button>
                {invoiceTaxRate > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSaveTaxRate(true)}
                    disabled={savingTax}
                    className="px-3 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Mark tax-exempt
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveTaxRate(false)}
                  disabled={savingTax || !taxRateDraft}
                  className="px-3 py-2 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingTax && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {savingTax ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT DUE DATE */}
      <AnimatePresence>
        {showDueDateEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !savingDueDate && setShowDueDateEditor(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">Edit Due Date</h3>
                <button
                  type="button"
                  onClick={() => !savingDueDate && setShowDueDateEditor(false)}
                  disabled={savingDueDate}
                  aria-label="Close"
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {invoiceSent && (
                <div className="flex items-start gap-2 p-2.5 mb-3 rounded-xl border border-amber-200 bg-amber-50 text-[11px] text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    This invoice was already sent. The customer&rsquo;s copy still shows the old
                    date — resend to update what they see.
                  </span>
                </div>
              )}

              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-[#57534e]">When is payment due?</p>
                <input
                  type="date"
                  value={dueDateDraft || ''}
                  disabled={savingDueDate}
                  onChange={(e) => setDueDateDraft(e.target.value)}
                  className="w-full rounded-lg border border-[#e7e2d8] px-3 py-2 text-sm font-semibold outline-none focus:border-brand-700"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Due on receipt', days: 0 },
                    { label: '+7 days', days: 7 },
                    { label: '+14 days', days: 14 },
                    { label: '+30 days', days: 30 },
                  ].map((preset) => {
                    const presetDate = new Date();
                    presetDate.setDate(presetDate.getDate() + preset.days);
                    const presetDateStr = presetDate.toISOString().split('T')[0];
                    const isSelected = dueDateDraft === presetDateStr;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        disabled={savingDueDate}
                        onClick={() => setDueDateDraft(presetDateStr)}
                        className={`px-3 py-2 rounded-full border text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                          isSelected
                            ? 'bg-brand-700 border-brand-700 text-white'
                            : 'border-[#e7e2d8] text-[#57534e] hover:border-brand-700 hover:text-brand-700 hover:bg-brand-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDueDateEditor(false)}
                  disabled={savingDueDate}
                  className="px-3 py-2 rounded-lg border border-[#e7e2d8] text-xs font-medium text-[#57534e] hover:bg-[#f5f1e8] disabled:opacity-50"
                >
                  Cancel
                </button>
                {currentDueDate && (
                  <button
                    type="button"
                    onClick={() => handleDueDateChange('')}
                    disabled={savingDueDate}
                    className="px-3 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    Clear due date
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDueDateChange(dueDateDraft)}
                  disabled={savingDueDate || !dueDateDraft}
                  className="px-3 py-2 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingDueDate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {savingDueDate ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: IN-PERSON PAYMENT LINK */}
      <AnimatePresence>
        {showPaymentLinkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentLinkModal(false)}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">In-Person Payment</h3>
                <button
                  onClick={() => setShowPaymentLinkModal(false)}
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingPaymentLink ? (
                <div className="py-10 flex flex-col items-center gap-2 text-[#a8a29e]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <p className="text-xs font-medium">Generating link...</p>
                </div>
              ) : paymentLinkError ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-semibold text-rose-600 mb-3">{paymentLinkError}</p>
                  <button
                    onClick={handleGetPaymentLink}
                    className="text-xs font-semibold text-brand-700 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : paymentLinkData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a8a29e]">
                      Customer pays
                    </p>
                    <p className="text-2xl font-bold text-[#1c1917] tabular-nums">
                      {fmt(paymentLinkData.amount)}
                    </p>
                    {paymentLinkData.kind && (
                      <p className="text-xs text-[#78716c] capitalize mt-0.5">{paymentLinkData.kind}</p>
                    )}
                  </div>

                  {paymentLinkQr && (
                    <div className="flex justify-center">
                      <img
                        src={paymentLinkQr}
                        alt="Scan to pay"
                        className="w-48 h-48 rounded-xl border border-[#e7e2d8]"
                      />
                    </div>
                  )}

                  <p className="text-center text-xs text-[#a8a29e]">
                    {paymentLinkQr ? 'Customer scans with their phone camera' : 'Share this link with the customer'}
                  </p>

                  <div className="flex items-center gap-2 p-2.5 bg-[#faf9f5] border border-[#e7e2d8] rounded-lg">
                    <p className="flex-1 text-[11px] text-[#57534e] truncate font-mono">
                      {paymentLinkData.url}
                    </p>
                    <button
                      onClick={handleCopyPaymentLink}
                      className="shrink-0 px-2.5 py-1.5 rounded-md bg-[#1c1917] text-white text-[11px] font-semibold hover:bg-[#292524] transition-colors"
                    >
                      {linkCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>

                  {paymentLinkData.method === 'manual' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
                      Scanning opens {paymentMethodLabels[paymentLinkData.linkType || 'other'] || 'the payment link'}{' '}
                      — the amount isn&rsquo;t prefilled yet, so let the customer know to send {fmt(paymentLinkData.amount)}{' '}
                      and note <strong>Invoice {invoiceNumber}</strong>. Record it here once it lands.
                    </div>
                  )}
                </div>
              ) : null}
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
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-[#1c1917]/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-xl border border-[#e7e2d8]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#1c1917]">Send Payment Reminder</h3>
                <button
                  onClick={() => !sendingReminder && setShowReminderConfirm(false)}
                  className="p-1 rounded-lg text-[#a8a29e] hover:bg-[#f5f1e8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[#faf9f5] rounded-xl border border-[#e7e2d8] mb-5 text-xs space-y-1">
                <p className="text-[#78716c]">
                  Recipient: <span className="font-semibold text-[#292524]">{lead?.name}</span>
                </p>
                <p className="text-[#78716c]">
                  {hasDepositTerms && !depositPaid ? 'Deposit Due' : 'Balance Outstanding'}:{' '}
                  <span className="font-bold text-[#1c1917] tabular-nums">{fmt(currentAmountDue)}</span>
                </p>
                {lastReminderSent && (
                  <p className="text-[#a8a29e] pt-1">Last reminder sent {fmtDate(lastReminderSent)}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowReminderConfirm(false)}
                  disabled={sendingReminder}
                  className="flex-1 py-2.5 border border-[#e7e2d8] text-[#57534e] font-medium text-xs rounded-xl hover:bg-[#f5f1e8] transition-colors"
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
            className="fixed inset-0 z-[1000] bg-[#1c1917]/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-[#e7e2d8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#292524]">
                  <Mail className="w-4 h-4 text-[#a8a29e]" /> Outbox Email Preview
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1 rounded-lg hover:bg-[#f5f1e8] text-[#a8a29e] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-[#faf9f5] p-2">
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