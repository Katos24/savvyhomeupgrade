'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

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
    const requiredPlan = FEATURE_PLAN_MAP['convert_to_project'];
    const config = PLAN_CONFIG[requiredPlan as keyof typeof PLAN_CONFIG];
   return (
      <div className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Lock className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-900">Upgrade to create projects</p>
          <p className="text-[10px] text-slate-500">Unlock quotes, scheduling, tasks & payment tracking</p>
      </div>
        
        {/* FIXED THE TAG BELOW */}
        <a 
          href={`/${companySlug}/admin/settings#billing`}
          className="inline-flex items-center gap-1.5 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-200"
        >
          Upgrade Plan
        </a>
        
        <p className="text-[10px] text-slate-400 mt-1 font-bold">Starting at $49.99/mo</p>
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

                const total = items.reduce((s: number, i: any) => s + i.amount, 0);

                await fetch('/api/leads/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: lead.id,
                    action: 'save_quote',
                    quote_data: items,
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
      {/* ── TRIGGER BUTTON (MOBILE FRIENDLY) ── */}
     <button
  onClick={() => setShowConfirm(true)}
  disabled={isConverting}
  className="
    group flex items-center justify-center gap-2
    w-full sm:w-auto
    px-5 py-3
    bg-gradient-to-r from-emerald-500 to-emerald-600
    hover:from-emerald-400 hover:to-emerald-500
    text-white font-bold text-sm tracking-wide
    rounded-xl
    shadow-md shadow-emerald-500/20
    transition-all duration-200 ease-out
    active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  "
>
  {isConverting ? (
    <span className="animate-pulse">Converting...</span>
  ) : (
    <>
      <Sparkles size={16} className="text-emerald-50 group-hover:rotate-12 transition-transform" />
      <span>Convert to Project</span>
    </>
  )}
</button>

      {/* ── CONFIRM MODAL ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isConverting && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="px-6 pt-8 pb-5 text-center">
              <h3 className="text-lg font-black text-gray-900">
                Create Project
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                For <span className="font-semibold text-gray-800">{lead.name}</span>
              </p>

              {categoryDisplay && (
                <div className="mt-4 inline-block px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                  {categoryDisplay}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="px-5 pb-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isConverting}
                className="
                  py-3
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 font-bold text-sm
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
                  py-3
                  bg-blue-600 hover:bg-blue-700
                  text-white font-black text-sm
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