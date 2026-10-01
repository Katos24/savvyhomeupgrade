'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Star, AlertTriangle } from 'lucide-react';

type CompletionSummaryModalProps = {
  lead: any;
  onConfirm: (sendReview: boolean) => void;
  onCancel: () => void;
};

type CheckItem = { label: string; done: boolean; detail?: string };

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// Parses a JSON array field that may arrive as a string, an array, or not at all.
// Returns null when the field isn't present on this lead object (e.g. opened
// from the board, where the list data doesn't carry photos/tasks) so we skip
// the check instead of wrongly calling it "missing".
const parseList = (val: any): any[] | null => {
  if (val === undefined) return null;
  if (val === null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default function CompletionSummaryModal({ lead, onConfirm, onCancel }: CompletionSummaryModalProps) {
  // On by default — most finished jobs should get a review ask. The toggle
  // exists because the app can't know when a job ended badly.
  const [sendReview, setSendReview] = useState(true);

  const firstName = lead?.name?.split(' ')[0] || 'the customer';
  const hasEmail = !!lead?.email;
  const reviewSentAt = lead?.review_request_sent_at;
  const canAskReview = hasEmail && !reviewSentAt;

  // ── Money ──
  const total = parseFloat(lead?.quote_total || '0') || 0;
  const paid = parseFloat(lead?.payment_amount || '0') || 0;
  const balance = Math.max(Math.round((total - paid) * 100) / 100, 0);
  const paidInFull = total > 0 && balance <= 0;

  // ── Checklist (only items we actually have data for) ──
  const quoteItems = parseList(lead?.quote_data);
  const afterPhotos = parseList(lead?.after_photos);
  const documents = parseList(lead?.documents);
  const tasks = parseList(lead?.tasks);
  const receipts = documents ? documents.filter((d: any) => d?.type === 'receipt') : null;
  const openTasks = tasks ? tasks.filter((t: any) => !t?.completed) : null;

  const checks: CheckItem[] = [
    { label: 'Scheduled', done: !!lead?.scheduled_date },
    ...(quoteItems
      ? [{
          label: 'Quote',
          done: quoteItems.length > 0,
          detail: quoteItems.length > 0 ? `${quoteItems.length} item${quoteItems.length === 1 ? '' : 's'}` : undefined,
        }]
      : []),
    ...(total > 0 ? [{ label: 'Paid in full', done: paidInFull }] : []),
    ...(afterPhotos
      ? [{
          label: 'After photos',
          done: afterPhotos.length > 0,
          detail: afterPhotos.length > 0 ? `${afterPhotos.length}` : undefined,
        }]
      : []),
    ...(receipts
      ? [{
          label: 'Receipts',
          done: receipts.length > 0,
          detail: receipts.length > 0 ? `${receipts.length}` : undefined,
        }]
      : []),
    ...(openTasks && tasks && tasks.length > 0
      ? [{
          label: 'Tasks',
          done: openTasks.length === 0,
          detail: openTasks.length > 0 ? `${openTasks.length} open` : 'All done',
        }]
      : []),
  ];

  const missingCount = checks.filter((c) => !c.done).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[700] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Complete job</p>
            <h3 className="mt-0.5 text-lg font-bold text-slate-900 truncate">{lead?.name || 'This job'}</h3>
            {lead?.category && (
              <p className="text-xs text-slate-500 capitalize">{String(lead.category).replace(/_/g, ' ')}</p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 space-y-4">
          {/* Money */}
          {total > 0 && (
            <div className="grid grid-cols-3 rounded-xl border border-slate-200 divide-x divide-slate-200">
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">{fmt(total)}</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Collected</p>
                <p className="text-sm font-bold text-emerald-600 tabular-nums">{fmt(paid)}</p>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Balance</p>
                <p className={`text-sm font-bold tabular-nums ${balance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {fmt(balance)}
                </p>
              </div>
            </div>
          )}

          {balance > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-px" />
              <p className="text-xs text-amber-800 leading-relaxed">
                {fmt(balance)} is still owed. You can still collect it after the job is marked complete.
              </p>
            </div>
          )}

          {/* Checklist */}
          {checks.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">
                {missingCount === 0 ? 'Everything is in place' : `${missingCount} thing${missingCount === 1 ? '' : 's'} not done — fine to complete anyway`}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {checks.map((c) => (
                  <div
                    key={c.label}
                    className={`flex items-center gap-2 rounded-lg px-2.5 py-2 ${c.done ? 'bg-slate-50' : 'bg-white border border-dashed border-slate-200'}`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        c.done ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {c.done && <Check className="w-2.5 h-2.5" strokeWidth={3.5} />}
                    </span>
                    <span className={`text-xs font-medium truncate ${c.done ? 'text-slate-700' : 'text-slate-400'}`}>
                      {c.label}
                    </span>
                    {c.detail && <span className="ml-auto text-[11px] text-slate-400 shrink-0">{c.detail}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review request */}
          <div className="rounded-xl border border-slate-200 px-3.5 py-3">
            {canAskReview ? (
              <button
                type="button"
                onClick={() => setSendReview((v) => !v)}
                className="w-full flex items-center gap-3 text-left"
                role="switch"
                aria-checked={sendReview}
              >
                <Star
                  className={`w-4 h-4 shrink-0 ${sendReview ? 'text-amber-400' : 'text-slate-300'}`}
                  fill={sendReview ? 'currentColor' : 'none'}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Ask {firstName} for a Google review</p>
                  <p className="text-[11px] text-slate-500">
                    {sendReview ? 'Email goes out when you complete the job' : 'No review email will be sent'}
                  </p>
                </div>
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                    sendReview ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                      sendReview ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 shrink-0 text-slate-300" />
                <p className="text-xs text-slate-500">
                  {reviewSentAt
                    ? `Review request already sent ${new Date(reviewSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : `No email on file for ${firstName}, so no review request`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="grid grid-cols-2 gap-2.5 px-5 pt-3"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onCancel}
            className="py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(canAskReview && sendReview)}
            className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            Mark complete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}