'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, X, CheckCheck } from 'lucide-react';

type CompletionSummaryModalProps = {
  lead: any;
  onConfirm: () => void;
  onCancel: () => void;
};

type CheckItem = {
  label: string;
  passed: boolean;
  warning?: boolean;
};

export default function CompletionSummaryModal({ lead, onConfirm, onCancel }: CompletionSummaryModalProps) {

  const beforePhotos = lead?.before_photos
    ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos)
    : [];
  const afterPhotos = lead?.after_photos
    ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos)
    : [];
  const documents = lead?.documents
    ? (typeof lead.documents === 'string' ? JSON.parse(lead.documents) : lead.documents)
    : [];
  const quoteData = lead?.quote_data || [];
  const tasks = Array.isArray(lead?.tasks) ? lead.tasks : [];
  const incompleteTasks = tasks.filter((t: any) => !t.completed);

  const checks: CheckItem[] = [
    {
      label: 'Scheduled date set',
      passed: !!lead?.scheduled_date,
      warning: true,
    },
    {
      label: quoteData.length > 0
        ? `Quote created — ${quoteData.length} line item${quoteData.length !== 1 ? 's' : ''}`
        : 'Quote created',
      passed: quoteData.length > 0,
      warning: true,
    },
    {
      label: lead?.payment_amount
        ? `Payment recorded — $${parseFloat(lead.payment_amount).toLocaleString()}`
        : 'Payment recorded',
      passed: !!lead?.payment_amount,
      warning: false,
    },
    {
      label: afterPhotos.length > 0
        ? `After photos uploaded — ${afterPhotos.length} photo${afterPhotos.length !== 1 ? 's' : ''}`
        : 'After photos uploaded',
      passed: afterPhotos.length > 0,
      warning: true,
    },
    {
      label: documents.length > 0
        ? `Documents attached — ${documents.length} file${documents.length !== 1 ? 's' : ''}`
        : 'Documents attached',
      passed: documents.length > 0,
      warning: true,
    },
    {
      label: lead?.project_internal_notes ? 'Internal notes added' : 'Internal notes added',
      passed: !!lead?.project_internal_notes,
      warning: true,
    },
    ...(incompleteTasks.length > 0
      ? [{
          label: `${incompleteTasks.length} task${incompleteTasks.length !== 1 ? 's' : ''} still open`,
          passed: false,
          warning: false,
        }]
      : []),
  ];

  const criticalMissing = checks.filter(c => !c.passed && !c.warning);
  const warningMissing = checks.filter(c => !c.passed && c.warning);
  const allPassed = checks.every(c => c.passed);
  const passedCount = checks.filter(c => c.passed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[70] p-0 sm:p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-6 pt-4 sm:pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                allPassed ? 'bg-emerald-500' : criticalMissing.length > 0 ? 'bg-slate-900' : 'bg-amber-500'
              }`}>
                {allPassed
                  ? <CheckCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                  : <AlertTriangle className="w-5 h-5 text-white" strokeWidth={2.5} />
                }
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {allPassed ? 'Ready to complete' : 'Review before closing'}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {passedCount} of {checks.length} items complete
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(passedCount / checks.length) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className={`h-full rounded-full ${allPassed ? 'bg-emerald-500' : 'bg-blue-500'}`}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="px-6 py-4 space-y-1 max-h-64 overflow-y-auto">
          {checks.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
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
              <span className={`text-xs font-semibold ${
                item.passed
                  ? 'text-slate-600'
                  : item.warning
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Summary callout */}
        <AnimatePresence>
          {(criticalMissing.length > 0 || warningMissing.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden px-6"
            >
              <div className={`px-4 py-3 rounded-xl text-xs font-bold mb-3 ${
                criticalMissing.length > 0
                  ? 'bg-red-50 text-red-700 border border-red-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {criticalMissing.length > 0
                  ? `${criticalMissing.length} required item${criticalMissing.length !== 1 ? 's' : ''} missing — you can still complete but it is recommended to fill these in first`
                  : `${warningMissing.length} optional item${warningMissing.length !== 1 ? 's' : ''} incomplete — these are not required but help keep your records clean`
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <button
            onClick={onCancel}
            className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-2xl transition active:scale-[0.97]"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className={`py-3.5 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition active:scale-[0.97] shadow-lg ${
              allPassed
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-100'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {allPassed ? 'Complete Project' : 'Complete Anyway'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}