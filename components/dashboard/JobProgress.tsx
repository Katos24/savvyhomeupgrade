'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, X, ChevronRight } from 'lucide-react';

type Step = { key: string; label: string; done: boolean; detail: string; review?: boolean };

type Props = {
  lead: any;
  canReview: boolean;
  reviewSentAt: string | null;
  sendingReview: boolean;
  onSendReview: () => void;
};

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const fmtTime = (t?: string | null) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h >= 12 ? 'PM' : 'AM'}`;
};

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 === 0 ? 0 : 2 });

const num = (v: any) => parseFloat(String(v ?? '0')) || 0;

export default function JobProgress({ lead, canReview, reviewSentAt, sendingReview, onSendReview }: Props) {
  const [open, setOpen] = useState(false);

  // Same payment math as BillingSection
  const jobTotal = num(lead.quote_total);
  const amountPaid = num(lead.payment_amount);
  const paidInFull = jobTotal > 0 && amountPaid >= jobTotal;

   // Prefer the invoices table (deposit and final invoice are separate there); fall back to legacy project fields
  const depositType = lead.inv_deposit_type || lead.deposit_type;
  const depositValue = num(lead.inv_deposit_value ?? lead.deposit_value);
  const hasDeposit = !!depositType && depositValue > 0;
  const depositAmount = depositType === 'percent' ? (jobTotal * depositValue) / 100 : depositValue;
  const depositPaidAt = lead.inv_deposit_paid_at || lead.deposit_paid_at || null;
  const depositInvoiceSentAt = lead.deposit_invoice_sent_at || lead.inv_deposit_sent_at || null;
  // Most explicit first: projects.balance_invoice_sent_at, then invoices.sent_at, then the legacy field
  const finalInvoiceSentAt =
    lead.balance_invoice_sent_at || (lead.inv_id ? lead.inv_sent_at : lead.invoice_sent_at) || null;

  const completed = lead.status === 'completed' || !!lead.job_completed_at;
  const scheduledDate = lead.scheduled_date ? String(lead.scheduled_date).split('T')[0] : '';

  const steps: Step[] = [];

  steps.push({
    key: 'request',
    label: 'Request',
    done: true,
    detail: `Came in ${fmtDate(lead.created_at)}`,
  });

  steps.push({
    key: 'quote',
    label: 'Quote',
    done: !!lead.project_quote_sent_at,
    detail: lead.project_quote_declined_at
      ? `Declined ${fmtDate(lead.project_quote_declined_at)}`
      : lead.project_quote_accepted_at
      ? `${money(jobTotal)} · accepted ${fmtDate(lead.project_quote_accepted_at)}`
      : lead.project_quote_sent_at
      ? `${jobTotal > 0 ? money(jobTotal) + ' · ' : ''}sent ${fmtDate(lead.project_quote_sent_at)}`
      : jobTotal > 0
      ? `${money(jobTotal)} · not sent yet`
      : 'Not started',
  });

  if (hasDeposit) {
    steps.push({
      key: 'deposit',
      label: 'Deposit',
           done: !!depositPaidAt,
      detail: depositPaidAt
        ? `${money(depositAmount)} paid ${fmtDate(depositPaidAt)}`
               : depositInvoiceSentAt
        ? `${money(depositAmount)} · invoice sent ${fmtDate(depositInvoiceSentAt)}, waiting`
        : `${money(depositAmount)} · not sent yet`,
    });
  }

  steps.push({
    key: 'scheduled',
    label: 'Scheduled',
    done: !!scheduledDate,
    detail: scheduledDate
      ? (() => {
          const [y, m, d] = scheduledDate.split('-').map(Number);
          const day = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return `${day}${lead.scheduled_time ? ' · ' + fmtTime(lead.scheduled_time) : ''}`;
        })()
      : 'No date yet',
  });

  steps.push({
    key: 'done',
    label: 'Job done',
    done: completed,
    detail: completed ? (lead.job_completed_at ? `Finished ${fmtDate(lead.job_completed_at)}` : 'Finished') : 'Not yet',
  });

  // Skip the invoice step when it was paid in full without one (e.g. cash at the door)
   if (!(paidInFull && !finalInvoiceSentAt)) {
    steps.push({
      key: 'invoice',
      label: 'Final invoice',
      done: !!finalInvoiceSentAt,
      detail: finalInvoiceSentAt ? `Sent ${fmtDate(finalInvoiceSentAt)}` : 'Not sent',
    });
  }

  steps.push({
    key: 'paid',
    label: 'Paid in full',
    done: paidInFull,
    detail: paidInFull
      ? `${money(amountPaid)} collected`
      : amountPaid > 0
      ? `${money(amountPaid)} of ${money(jobTotal)}`
      : jobTotal > 0
      ? `${money(jobTotal)} due`
      : 'No total yet',
  });

  if (canReview) {
    steps.push({
      key: 'review',
      label: 'Review requested',
      done: !!reviewSentAt,
      detail: reviewSentAt ? `Sent ${fmtDate(reviewSentAt)}` : lead.email ? 'Not asked yet' : 'Needs customer email',
      review: true,
    });
  }

  const doneCount = steps.filter((s) => s.done).length;
  const current = steps.find((s) => !s.done) || null;
  const currentIndex = current ? steps.indexOf(current) : steps.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <>
      {/* One-line status bar — tap for the full summary */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-4 py-3 text-left shadow-xs transition hover:border-[#00828A]/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {current ? current.label : 'All done'}
              <span className="ml-1.5 font-normal text-gray-500">
                · {current ? current.detail : 'Every step complete'}
              </span>
            </p>
            <span className="shrink-0 text-[11px] font-semibold text-gray-400">
              {current ? `Step ${currentIndex + 1} of ${steps.length}` : `${steps.length}/${steps.length}`}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-[#00828A] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {/* Summary modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{lead.name || 'Job'}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {lead.category_label || lead.category || 'Job'}{jobTotal > 0 ? ` · ${money(jobTotal)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {paidInFull && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Paid in full
                    </span>
                  )}
                  <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <ol className="relative px-5 py-5">
                <span className="absolute left-[31px] top-8 bottom-8 w-px bg-gray-200" aria-hidden />
                {steps.map((s, i) => {
                  const isCurrent = i === currentIndex;
                  return (
                    <li key={s.key} className="relative flex items-start gap-3 py-2">
                      <span
                        className={`relative z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ${
                          s.done
                            ? s.review ? 'bg-amber-400' : 'bg-[#00828A]'
                            : isCurrent
                            ? 'border-2 border-[#00828A] bg-white'
                            : 'border-2 border-gray-200 bg-white'
                        }`}
                      >
                        {s.done &&
                          (s.review ? (
                            <Star className="h-3 w-3 text-white" fill="currentColor" />
                          ) : (
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          ))}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${s.done || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                          {s.label}
                        </p>
                        <p className={`text-xs ${s.done || isCurrent ? 'text-gray-500' : 'text-gray-400'}`}>{s.detail}</p>

                        {s.key === 'review' && !s.done && completed && lead.email && (
                          <button
                            onClick={onSendReview}
                            disabled={sendingReview}
                            className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                          >
                            {sendingReview ? 'Sending…' : 'Send review request'}
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}