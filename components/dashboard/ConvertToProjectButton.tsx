'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';

type ConvertToProjectButtonProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
};

export default function ConvertToProjectButton({
  lead,
  currentUser,
  onRefresh,
}: ConvertToProjectButtonProps) {
  const [isConverting, setIsConverting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (lead.project_id) return null;

  const category = lead.category || '';

  const categoryDisplay = category
    .split('_')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const handleConvert = async () => {
    setIsConverting(true);

    try {
      // ── Step 1: Create the project ─────────────────────────────────────────
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

      // ── Step 2: Close modal + show toast immediately ───────────────────────
      // Do this BEFORE refresh so the toast isn't killed by unmount
      setShowConfirm(false);
      toast.success(`Project #${result.project_number} created!`);

      // ── Step 3: Auto-load quote template (optional, non-blocking) ──────────
      // Pull slug from lead object first, fall back to URL parsing
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
          // Non-critical — project was still created successfully
          console.error('Auto-load quote template failed (non-critical):', e);
        }
      }

      // ── Step 4: Refresh the lead board ────────────────────────────────────
      await onRefresh();

    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to create project');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-black rounded-lg transition active:scale-95 shadow-lg shadow-emerald-500/30"
      >
        <Rocket className="w-3.5 h-3.5" />
        Convert to Project
      </button>

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isConverting && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="w-14 h-14 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-7 h-7 text-indigo-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-1">Create Project</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                For <span className="font-bold text-gray-700">{lead.name}</span>
              </p>
              {categoryDisplay && (
                <span className="inline-block mt-3 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600">
                  {categoryDisplay}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isConverting}
                className="py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}