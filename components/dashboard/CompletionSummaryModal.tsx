'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, X, CheckCheck, Star } from 'lucide-react';

type CompletionSummaryModalProps = {
  lead: any;
  onConfirm: (sendReview: boolean) => void;
  onCancel: () => void;
};

type CheckItem = {
  label: string;
  passed: boolean;
  warning?: boolean;
  badge?: string;
};

export default function CompletionSummaryModal({ lead, onConfirm, onCancel }: CompletionSummaryModalProps) {
  /* On by default — asking for a review is the right move on most jobs, and
     a contractor closing five on a Friday shouldn't have to opt in five
     times. The opt-out exists because the app can't know when a job ended
     badly, and a public review request after a dispute makes it worse. */
  const [sendReview, setSendReview] = useState(true);
  const alreadySent = !!lead?.review_request_sent_at;

  const beforePhotos = lead?.before_photos
    ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos)
    : [];
  const afterPhotos = lead?.after_photos
    ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos)
    : [];
  const documents = lead?.documents
    ? (typeof lead.documents === 'string' ? JSON.parse(lead.documents) : lead.documents)
    : [];
  const receipts = documents.filter((d: any) => d.type === 'receipt');
  const quoteData = lead?.quote_data || [];
  const tasks = Array.isArray(lead?.tasks) ? lead.tasks : [];
  const incompleteTasks = tasks.filter((t: any) => !t.completed);

  const checks: CheckItem[] = [
    {
      label: 'Scheduled date set',
      passed: !!lead?.scheduled_date,
      warning: true,
      badge: lead?.scheduled_date ? 'Done' : 'Missing',
    },
    {
      label: quoteData.length > 0
        ? `Quote created — ${quoteData.length} line item${quoteData.length !== 1 ? 's' : ''}`
        : 'Quote created',
      passed: quoteData.length > 0,
      warning: true,
      badge: quoteData.length > 0 ? 'Done' : 'Missing',
    },
    {
      label: lead?.payment_amount
        ? `Payment recorded — $${parseFloat(lead.payment_amount).toLocaleString()}`
        : 'Payment recorded',
      passed: !!lead?.payment_amount,
      warning: false,
      badge: lead?.payment_amount ? 'Done' : 'Missing',
    },
    {
      label: afterPhotos.length > 0
        ? `After photos — ${afterPhotos.length} photo${afterPhotos.length !== 1 ? 's' : ''}`
        : 'After photos uploaded',
      passed: afterPhotos.length > 0,
      warning: true,
      badge: afterPhotos.length > 0 ? 'Done' : 'Missing',
    },
    {
      label: receipts.length > 0
        ? `Receipts attached — ${receipts.length} file${receipts.length !== 1 ? 's' : ''}`
        : 'Receipts attached',
      passed: receipts.length > 0,
      warning: true,
      badge: receipts.length > 0 ? 'Done' : 'Missing',
    },
    {
      label: lead?.project_internal_notes ? 'Internal notes added' : 'Internal notes added',
      passed: !!lead?.project_internal_notes,
      warning: true,
      badge: lead?.project_internal_notes ? 'Done' : 'Missing',
    },
    ...(incompleteTasks.length > 0
      ? [{
          label: `${incompleteTasks.length} task${incompleteTasks.length !== 1 ? 's' : ''} still open`,
          passed: false,
          warning: false,
          badge: 'Open',
        }]
      : []),
  ];

  const criticalMissing = checks.filter(c => !c.passed && !c.warning);
  const warningMissing = checks.filter(c => !c.passed && c.warning);
  const allPassed = checks.every(c => c.passed);
  const passedCount = checks.filter(c => c.passed).length;
  const progressPct = Math.round((passedCount / checks.length) * 100);

  const hasReceiptWarning = warningMissing.some(c => c.label.includes('Receipt'));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-5">

          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {passedCount} of {checks.length} complete
            </span>
            <span className="text-xs font-bold text-slate-400">{progressPct}%</span>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              className={`h-full rounded-full ${allPassed ? 'bg-emerald-500' : progressPct > 50 ? 'bg-blue-500' : 'bg-amber-400'}`}
            />
          </div>

          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                allPassed ? 'bg-emerald-100' : criticalMissing.length > 0 ? 'bg-slate-100' : 'bg-amber-100'
              }`}>
                {allPassed
                  ? <CheckCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                  : <AlertTriangle className={`w-4 h-4 ${criticalMissing.length > 0 ? 'text-slate-600' : 'text-amber-500'}`} strokeWidth={2.5} />
                }
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  {allPassed ? 'Ready to complete' : 'Review before closing'}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {allPassed
                    ? 'Everything looks good'
                    : `${warningMissing.length + criticalMissing.length} item${warningMissing.length + criticalMissing.length !== 1 ? 's' : ''} need attention`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        {/* Checklist */}
        <div className="px-5 py-4 space-y-2 max-h-64 overflow-y-auto">
          {checks.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                item.passed
                  ? 'bg-slate-50'
                  : item.warning
                  ? 'bg-amber-50'
                  : 'bg-red-50'
              }`}
            >
              {item.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
              ) : item.warning ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={2.5} />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2.5} />
              )}
              <span className={`text-xs font-semibold flex-1 ${
                item.passed ? 'text-slate-600' : item.warning ? 'text-amber-700' : 'text-red-700'
              }`}>
                {item.label}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                item.passed
                  ? 'bg-emerald-100 text-emerald-700'
                  : item.warning
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {item.badge}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Callout */}
        <AnimatePresence>
          {(criticalMissing.length > 0 || warningMissing.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-5"
            >
              <div className={`px-4 py-3 rounded-xl text-xs font-bold mb-3 ${
                criticalMissing.length > 0
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {hasReceiptWarning
                  ? 'Receipts missing — your bookkeeper may need these at month end'
                  : criticalMissing.length > 0
                  ? `${criticalMissing.length} required item${criticalMissing.length !== 1 ? 's' : ''} missing — recommended to fill in before completing`
                  : `${warningMissing.length} optional item${warningMissing.length !== 1 ? 's' : ''} incomplete — not required but keeps records clean`
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review request */}
        {!alreadySent && lead?.customer_email !== null && (
          <div className="px-5 pb-1">
            <button
              onClick={() => setSendReview(v => !v)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${
                sendReview
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition ${
                  sendReview ? 'bg-emerald-600' : 'bg-white border border-slate-300'
                }`}
              >
                {sendReview && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </div>
              <div className="flex-1 text-left">
                <p className={`text-xs font-bold ${sendReview ? 'text-emerald-800' : 'text-slate-500'}`}>
                  Ask {lead?.name?.split(' ')[0] || 'them'} for a Google review
                </p>
                <p className={`text-[11px] font-medium mt-0.5 ${sendReview ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {sendReview ? 'Sends right after you complete this' : 'No review request will be sent'}
                </p>
              </div>
              <Star
                className={`w-4 h-4 shrink-0 ${sendReview ? 'text-emerald-500' : 'text-slate-300'}`}
                fill={sendReview ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        )}

        {/* Actions */}
        <div
          className="px-5 pb-6 pt-2 grid grid-cols-2 gap-3"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onCancel}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition active:scale-[0.97]"
          >
            Go Back
          </button>
         <button
            onClick={() => onConfirm(sendReview && !alreadySent)}
            className={`py-3.5 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition active:scale-[0.97] ${
              allPassed
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {allPassed ? 'Complete Project' : 'Complete Anyway'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}