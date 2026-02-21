'use client';

import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

type CompletionSummaryModalProps = {
  lead: any;
  onConfirm: () => void;
  onCancel: () => void;
};

type CheckItem = {
  label: string;
  passed: boolean;
  warning?: boolean; // yellow instead of red — nice to have but not critical
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
      label: quoteData.length > 0 ? `Quote created (${quoteData.length} item${quoteData.length !== 1 ? 's' : ''})` : 'Quote created',
      passed: quoteData.length > 0,
      warning: true,
    },
    {
      label: lead?.payment_amount
        ? `Payment recorded ($${lead.payment_amount})`
        : 'Payment recorded',
      passed: !!lead?.payment_amount,
      warning: false, // critical — red if missing
    },
    {
      label: afterPhotos.length > 0
        ? `After photos uploaded (${afterPhotos.length})`
        : 'After photos uploaded',
      passed: afterPhotos.length > 0,
      warning: true,
    },
    {
      label: documents.length > 0
        ? `Documents attached (${documents.length})`
        : 'Documents attached',
      passed: documents.length > 0,
      warning: true,
    },
    {
      label: !!lead?.project_internal_notes ? 'Internal notes added' : 'Internal notes added',
      passed: !!lead?.project_internal_notes,
      warning: true,
    },
    ...(incompleteTasks.length > 0
      ? [{
          label: `${incompleteTasks.length} task${incompleteTasks.length !== 1 ? 's' : ''} not completed`,
          passed: false,
          warning: false,
        }]
      : []),
  ];

  const criticalMissing = checks.filter(c => !c.passed && !c.warning);
  const warningMissing = checks.filter(c => !c.passed && c.warning);
  const allPassed = checks.every(c => c.passed);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={`p-5 ${allPassed ? 'bg-green-50 border-b border-green-100' : 'bg-amber-50 border-b border-amber-100'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {allPassed ? '🎉 Ready to complete!' : 'Before you close this out...'}
              </h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {allPassed
                  ? 'Everything looks good on this project.'
                  : 'Review the checklist below before marking as completed.'}
              </p>
            </div>
            <button onClick={onCancel} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-5 space-y-2.5 max-h-72 overflow-y-auto">
          {checks.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : item.warning ? (
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                item.passed
                  ? 'text-gray-700'
                  : item.warning
                  ? 'text-amber-700'
                  : 'text-red-700 font-semibold'
              }`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Missing summary */}
        {(criticalMissing.length > 0 || warningMissing.length > 0) && (
          <div className="px-5 pb-3">
            {criticalMissing.length > 0 && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ {criticalMissing.length} critical item{criticalMissing.length !== 1 ? 's' : ''} missing
              </p>
            )}
            {warningMissing.length > 0 && (
              <p className="text-xs text-amber-600 mt-0.5">
                {warningMissing.length} optional item{warningMissing.length !== 1 ? 's' : ''} incomplete
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-5 pt-2 flex gap-3 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl transition text-sm"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition text-sm shadow-sm"
          >
            {allPassed ? 'Complete Project ✓' : 'Complete Anyway'}
          </button>
        </div>

      </div>
    </div>
  );
}