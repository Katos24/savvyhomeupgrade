'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image } from 'lucide-react';
import { toast } from 'sonner';

// REPLACE WITH:
type AiBriefTabProps = {
  lead: any;
  currentUser: any;
  company?: any;
  customerPhotos: string[];
  relatedLeads: any[];
  isProject: boolean;
  onRefresh: () => Promise<void>;
};

/**
 * Full AI Brief tab.
 *
 * - Pre-populates from lead.ai_brief (joined from projects table by your data layer)
 * - Auto-saves to projects via POST /api/leads/update { action: 'save_ai_brief' }
 * - Regenerate clears state and re-runs generation + save
 *
 * Backend requirement (projects table already has ai_brief jsonb column):
 *   In your /api/leads/update handler, add:
 *
 *   case 'save_ai_brief':
 *     await db('projects')
 *       .where({ lead_id: body.id })
 *       .update({ ai_brief: body.ai_brief, updated_at: new Date() });
 *     return res.json({ success: true });
 */
export default function AiBriefTab({
  lead, currentUser, company, customerPhotos, relatedLeads, isProject, onRefresh,
}: AiBriefTabProps) {
  const [brief, setBrief] = useState<any>(lead.ai_brief ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-sync if lead prop changes (e.g. parent refreshes)
  useEffect(() => {
    setBrief(lead.ai_brief ?? null);
  }, [lead.ai_brief]);

  // ── Save to projects table ──────────────────────────────────────────────────
  const saveBrief = async (data: any) => {
    if (!isProject) return; // only projects have a row in the projects table
    setSaving(true);
    try {
      await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_ai_brief',
          ai_brief: data,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
    // REPLACE WITH:
    } catch (e) {
      console.error('Failed to save AI brief:', e);
     } finally {
      setSaving(false);
    }
  };

  // ── Generate ────────────────────────────────────────────────────────────────
  const generate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          customer_name: lead.name,
          description: lead.description,
          category: lead.category,
          status: lead.status,
          project_id: lead.project_id,
          scheduled_date: lead.scheduled_date || null,
          scheduled_time: lead.scheduled_time || null,
          assigned_to: lead.assigned_to || null,
          quote_total: lead.quote_total || null,
          payment_amount: lead.payment_amount || null,
          payment_status: lead.payment_status || null,
          internal_notes: lead.project_internal_notes || null,
          company_name: company?.name || null,
          repeat_customer: relatedLeads.length > 0,
          past_jobs: relatedLeads.map(r => ({
            category: r.category, status: r.status, quote_total: r.quote_total,
            payment_status: r.payment_status, created_at: r.created_at, description: r.description,
          })),
          photos: customerPhotos.filter(u => u.startsWith('http')).slice(0, 4),
        }),
      });
      const data = await res.json();
      // REPLACE WITH:
if (data.success) {
  setBrief(data.brief);
  if (isProject) {
    await saveBrief(data.brief);
    await onRefresh();
  }
} else {
        toast.error('Failed to generate brief');
      }
    } catch {
      toast.error('Failed to generate brief');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setBrief(null);
    generate();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-violet-400" />
          </span>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Brief</h3>

          {customerPhotos.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-none">
              includes photos
            </span>
          )}

          {/* Saved indicator — only shown for projects */}
          {brief && isProject && (
            <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-none">
              {saving ? '↻ saving…' : '✓ saved'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {brief && !loading && (
            <button
              onClick={handleRegenerate}
              className="px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-none transition"
            >
              Regenerate
            </button>
          )}
     
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-5 py-16 flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-violet-100" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
            <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-b-violet-300 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-violet-500" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-700">Analyzing your lead</p>
            <p className="text-xs text-gray-400">
              {customerPhotos.length > 0 ? 'Reading description and photos...' : 'Reading job details...'}
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
{!brief && !loading && (
  <div className="px-5 py-16 text-center flex flex-col items-center">
    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Sparkles className="w-6 h-6 text-violet-300" />
    </div>
    <p className="text-sm font-semibold text-gray-500 mb-1">No brief yet</p>
    <p className="text-xs text-gray-400 max-w-[240px] mx-auto leading-relaxed mb-6">
      {customerPhotos.length > 0
        ? 'Job details and photos will be analyzed.'
        : 'Get a quick summary, urgency level, and next steps.'}
    </p>
    <button
      onClick={generate}
      className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-white rounded-none transition-all active:scale-95"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 0 16px rgba(124,58,237,0.35)' }}
    >
      <Sparkles className="w-4 h-4" />
      Generate Brief
    </button>
  </div>
)}

      {/* Brief content */}
      {brief && !loading && (
        <div className="p-5 space-y-4">

          {brief.headline && (
            <div className="text-sm font-bold text-gray-900 border-l-4 border-violet-400 pl-3 leading-snug">
              {brief.headline}
            </div>
          )}

          {/* Badges */}
          <div className="flex gap-2 flex-wrap">
            {brief.urgency && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-none ${
                brief.urgency === 'Emergency'    ? 'bg-red-500 text-white' :
                brief.urgency === 'High Priority'? 'bg-orange-500 text-white' :
                brief.urgency === 'Normal'       ? 'bg-blue-500 text-white' :
                'bg-gray-400 text-white'
              }`}>{brief.urgency}</span>
            )}
            {brief.customer_score && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-none border ${
                brief.customer_score === 'VIP'   ? 'bg-amber-100 text-amber-800 border-amber-300' :
                brief.customer_score === 'Good'  ? 'bg-green-100 text-green-800 border-green-300' :
                brief.customer_score === 'Risky' ? 'bg-red-100 text-red-800 border-red-300' :
                'bg-gray-100 text-gray-700 border-gray-300'
              }`}>{brief.customer_score}</span>
            )}
          </div>

          {/* Summary */}
          {brief.summary && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-none">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">{brief.summary}</p>
            </div>
          )}

          {/* Photo analysis */}
          {brief.photo_observations && brief.photo_observations !== 'null' && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-none">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" /> Photo Analysis
              </p>
              <p className="text-sm text-indigo-900 leading-relaxed">{brief.photo_observations}</p>
            </div>
          )}

          {/* Next steps */}
          {brief.next_steps?.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-none">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Next Steps</p>
              <ul className="space-y-2">
                {brief.next_steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                    <span className="text-emerald-500 font-bold min-w-[1.25rem]">{i + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical info */}
          {brief.critical_info?.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-none">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">⚠ Critical</p>
              <ul className="space-y-1">
                {brief.critical_info.map((info: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-800">
                    <span>•</span><span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}
    </div>
  );
}