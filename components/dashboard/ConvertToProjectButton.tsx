'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, type PlanTier } from '@/lib/permissions';

type ConvertToProjectButtonProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  planTier?: string;
};

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

  if (lead.project_id) return null;

  if (!can(planTier as PlanTier, 'convert_to_project')) {
    return (
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-900">Unlock Project Conversion</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold">
                <Sparkles size={10} /> Pro feature
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Create projects, send professional quotes, schedule jobs, and track payments.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-right hidden md:block">
            <span className="text-[11px] font-medium text-slate-400 block">Starting at</span>
            <span className="text-xs font-bold text-slate-800">$49.99/mo</span>
          </div>
          <a 
            href={`/${companySlug}/admin/settings#billing`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 shrink-0"
          >
            Upgrade plan <ArrowRight size={13} />
          </a>
        </div>
      </div>
    );
  }
  
  const category = lead.category || '';

  const categoryDisplay = category
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
      toast.success(`Project #${result.project_number} created!`);

      const companySlug =
        lead.company_slug ||
        lead.slug ||
        window.location.pathname.split('/').find((s: string) =>
          s.length > 0 && s !== 'dashboard' && s !== 'leads' && s !== 'settings'
        ) ||
        '';

      if (companySlug && category) {
        try {
          const tmplRes = await fetch(`/api/company/${companySlug}/quote-templates`);
          if (tmplRes.ok) {
            const tmplData = await tmplRes.json();

            if (tmplData.success) {
              const match = (tmplData.templates || []).find(
                (t: any) => t.category === category
              );

              if (match?.items?.length > 0) {
                const items = match.items.map((item: any, i: number) => ({
                  id: Date.now() + i,
                  description: item.description,
                  quantity: item.quantity || 1,
                  unitPrice: item.unitPrice || item.amount / (item.quantity || 1),
                  amount: item.amount,
                }));

                const rate = match.tax_rate ?? 0;
                const subtotal = items.reduce((s: number, i: any) => s + i.amount, 0);
                const total = subtotal + subtotal * (rate / 100);

                await fetch('/api/leads/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: lead.id,
                    action: 'save_quote',
                    quote_data: items,
                    quote_tax_rate: rate,
                    quote_total: total,
                    user_name: currentUser?.name || 'Unknown',
                    user_email: currentUser?.email || '',
                  }),
                });
              }
            }
          }
        } catch (e) {
          console.error('Auto-load quote template failed:', e);
        }
      }

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
      {/* Trigger button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isConverting}
        className="
          flex items-center justify-center gap-2
          w-full sm:w-auto
          px-4.5 py-2.5
          bg-emerald-600
          hover:bg-emerald-700
          text-white font-semibold text-xs
          rounded-xl
          transition-all duration-200 ease-out
          active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm
        "
      >
        {isConverting ? 'Converting...' : 'Convert to project'}
      </button>

      {/* Confirm modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isConverting && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-8 pb-5 text-center">
              <h3 className="text-base font-semibold text-gray-900">
                Create project
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                For <span className="font-medium text-gray-800">{lead.name}</span>
              </p>

              {categoryDisplay && (
                <div className="mt-3 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700">
                  {categoryDisplay}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-5 pb-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isConverting}
                className="
                  py-2.5
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 font-medium text-xs
                  rounded-xl
                  transition
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="
                  py-2.5
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium text-xs
                  rounded-xl
                  transition
                  disabled:opacity-50
                "
              >
                {isConverting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}