'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Lock, ArrowRight, Loader2, Check, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { can, type PlanTier } from '@/lib/permissions';

type ConvertToProjectButtonProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  planTier?: string;
};

// What converting unlocks — shown in the confirm sheet so it's clear what happens.
const UNLOCKS = ['Build and send the quote', 'Collect a deposit', 'Put it on the schedule', 'Invoice and get paid'];

export default function ConvertToProjectButton({
  lead,
  currentUser,
  onRefresh,
  planTier = 'basic',
}: ConvertToProjectButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pathname = usePathname();
  const companySlug = pathname?.split('/')[1] || '';

  // Esc closes the sheet (not while saving).
  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isConverting) setShowConfirm(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showConfirm, isConverting]);

  if (lead.project_id) return null;

  // Free plan: a small upgrade link instead of the button.
  if (!can(planTier as PlanTier, 'convert_to_project')) {
    return (
      <a
        href={`/${companySlug}/home?section=billing`}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Lock className="h-3.5 w-3.5 text-slate-400" />
        Upgrade to Pro
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }

  const category = lead.category || '';
  const categoryDisplay =
    lead.category_label ||
    category
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'create_project',
          category,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to create project');
        return;
      }

      setShowConfirm(false);
      toast.success(`Project #${result.project_number} created`);

      // Quote starts empty on purpose — QuoteSection's empty state lets the
      // contractor pick a template or start from scratch.
      await onRefresh();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create project');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isConverting}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isConverting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {isConverting ? 'Converting…' : 'Convert to project'}
        {!isConverting && <ArrowRight className="h-3.5 w-3.5" />}
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => !isConverting && setShowConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="convert-title"
            className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-sm sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-9 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:pt-5">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Convert to project</p>
                <h3 id="convert-title" className="mt-0.5 truncate text-lg font-bold text-slate-900">
                  {lead.name || 'This request'}
                </h3>
                {categoryDisplay && <p className="text-xs text-slate-500">{categoryDisplay}</p>}
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isConverting}
                className="-mr-1.5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pt-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">This opens the job up so you can</p>
              <ul className="space-y-1.5">
                {UNLOCKS.map((u) => (
                  <li key={u} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                    {u}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Their request, photos and answers stay on the card.
              </p>
            </div>

            <div
              className="grid grid-cols-2 gap-2.5 px-5 pt-5"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isConverting}
                className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
              >
                {isConverting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isConverting ? 'Converting…' : 'Convert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}