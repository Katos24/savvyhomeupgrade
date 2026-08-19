'use client';

import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

type RecentPayment = {
  id: number;
  amount: number;
  kind: string;
  method: string;
  lead_id: number | null;
  customer_name: string;
  project_number: number | null;
  created_at: string;
};

const POLL_INTERVAL_MS = 30_000;

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const KIND_LABEL: Record<string, string> = {
  deposit: 'Deposit paid',
  balance: 'Balance paid',
  payment: 'Payment received',
};

export default function PaymentToastPoller({
  slug,
  onSelectLead,
}: {
  slug: string;
  /** Optional — lets the toast's "View" button open the lead directly,
   *  same pattern as PaymentReminderBanner's onSelectLead. Omit to
   *  render the toast without an action button. */
  onSelectLead?: (leadId: number) => void;
}) {
  // Starts at "now" — this never fires for payments that already existed
  // before the tab opened, only genuinely new ones from this point on.
  const sinceRef = useRef<string>(new Date().toISOString());
  const pollingRef = useRef(false);

  // Belt-and-suspenders against timestamp precision loss: Postgres
  // timestamps can carry more precision than survives a JSON round-trip
  // to the browser, which can make the same row satisfy `created_at >
  // since` again on the next poll — the exact "keeps reappearing every
  // 30s" bug. Tracking IDs we've already shown makes a repeat toast
  // impossible regardless of what the timestamp comparison does.
  const seenIdsRef = useRef<Set<number>>(new Set());

  const poll = useCallback(async () => {
    if (pollingRef.current) return; // don't let overlapping requests stack up
    pollingRef.current = true;
    try {
      const res = await fetch(
        `/api/company/${slug}/payments/recent?since=${encodeURIComponent(sinceRef.current)}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.payments) && data.payments.length > 0) {
        const payments: RecentPayment[] = data.payments;
        const newOnes = payments.filter((p) => !seenIdsRef.current.has(p.id));

        for (const p of newOnes) {
          seenIdsRef.current.add(p.id);
          toast.success(`${fmt(p.amount)} from ${p.customer_name}`, {
            description: `${KIND_LABEL[p.kind] || 'Payment received'}${
              p.project_number ? ` · Project #${p.project_number}` : ''
            }`,
            icon: <DollarSign className="w-4 h-4" />,
            duration: 6000,
            action:
              onSelectLead && p.lead_id
                ? { label: 'View', onClick: () => onSelectLead(p.lead_id as number) }
                : undefined,
          });
        }

        // Advance the cursor to the server's own latest timestamp — still
        // useful to keep the query fast/scoped, even though it's no
        // longer the only thing preventing a duplicate toast.
        const latest = payments[payments.length - 1]?.created_at;
        if (latest) sinceRef.current = latest;
      }
    } catch {
      // Silent on failure — the next interval tick just tries again.
    } finally {
      pollingRef.current = false;
    }
  }, [slug, onSelectLead]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') poll();
    }, POLL_INTERVAL_MS);

    // Catch up immediately on returning to the tab, rather than waiting
    // for the next interval tick — otherwise a payment made while the
    // user was elsewhere could sit unnotified for up to 30s after they
    // switch back.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') poll();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [poll]);

  return null; // no visible output of its own — sonner's <Toaster /> renders the toasts
}