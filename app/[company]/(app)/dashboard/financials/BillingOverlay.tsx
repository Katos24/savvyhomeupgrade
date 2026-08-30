'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import BillingSection from '@/components/dashboard/project-sections/BillingSection';

export default function BillingOverlay({
  leadId,
  company,
  onClose,
}: {
  leadId: number;
  company: any;
  onClose: () => void;
}) {
  const [lead, setLead] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setLead(data.lead);
        setPayments(data.payments || []);
        setActivity(data.activity || []);
      }
    } catch {
      // Overlay just stays on its loading/empty state — Financials'
      // own list underneath is unaffected either way.
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => { if (data.success) setCurrentUser(data.user); })
      .catch(() => {});
  }, [fetchLead]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <p className="text-[12px] text-stone-500">Billing</p>
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

        <div className="flex-1 overflow-y-auto bg-stone-50 p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
            </div>
          ) : lead ? (
                       <BillingSection
              lead={lead}
              company={company}
              currentUser={currentUser}
              onRefresh={fetchLead}
              hasProject={true}
              companySlug={company.slug}
              payments={payments}
              activity={activity}
            />
          ) : (
            <p className="py-12 text-center text-[13px] text-stone-400">Couldn't load this job.</p>
          )}
        </div>
      </div>
    </div>
  );
}