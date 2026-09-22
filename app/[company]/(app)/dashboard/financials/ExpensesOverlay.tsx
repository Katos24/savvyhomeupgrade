'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import ExpensesSection from '@/components/dashboard/project-sections/ExpensesSection';

export default function ExpensesOverlay({
  leadId,
  companySlug,
  onClose,
}: {
  leadId: number;
  companySlug: string;
  onClose: () => void;
}) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setLead(data.lead);
      }
    } catch {
      // Overlay stays on its loading/empty state — Financials' own list
      // underneath is unaffected either way. Same reasoning as
      // BillingOverlay's identical catch block.
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-[12px] text-stone-500">Expenses</p>
            <h3 className="text-base font-semibold text-stone-900">{lead?.name || 'Loading...'}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-stone-50">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
            </div>
          ) : lead ? (
            <ExpensesSection
              lead={lead}
              companySlug={companySlug}
              hasProject={!!lead.project_id}
            />
          ) : (
            <p className="py-12 text-center text-[13px] text-stone-400">Couldn&rsquo;t load this job.</p>
          )}
        </div>
      </div>
    </div>
  );
}