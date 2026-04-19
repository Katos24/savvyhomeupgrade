'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image, RefreshCw, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AiBriefTabProps = {
  lead: any;
  currentUser: any;
  company?: any;
  customerPhotos: string[];
  relatedLeads: any[];
  isProject: boolean;
  onRefresh: () => Promise<void>;
};

export default function AiBriefTab({
  lead,
  currentUser,
  company,
  customerPhotos,
  relatedLeads,
  isProject,
  onRefresh,
}: AiBriefTabProps) {
  const [brief, setBrief] = useState<any>(lead.ai_brief ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBrief(lead.ai_brief ?? null);
  }, [lead.ai_brief]);

  const saveBrief = async (data: any) => {
    if (!lead.project_id) return;
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
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
      if (!res.ok) throw new Error('Failed to save');
    } catch (e) {
      console.error('Failed to save AI brief:', e);
      toast.error('Sync failed');
    } finally {
      setSaving(false);
    }
  };

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
          company_slug: company?.slug || null,
          repeat_customer: relatedLeads.length > 0,
          past_jobs: relatedLeads.map((r) => ({
            category: r.category,
            status: r.status,
            quote_total: r.quote_total,
            payment_status: r.payment_status,
            created_at: r.created_at,
            description: r.description,
          })),
          photos: customerPhotos.filter((u) => u.startsWith('http')).slice(0, 4),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBrief(data.brief);
        if (lead.project_id) {
          await saveBrief(data.brief);
          await onRefresh();
        }
      } else {
        toast.error('Generation failed');
      }
    } catch {
      toast.error('Error connecting to AI service');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setBrief(null);
    generate();
  };

  return (
    <div className="bg-white min-h-[400px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
              AI Analysis
            </h3>
            <div className="flex items-center gap-2">
              {brief && lead.project_id && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {saving ? 'SYNCING' : 'SAVED TO CLOUD'}
                </span>
              )}
            </div>
          </div>
        </div>

        {brief && !loading && (
          <button
            onClick={handleRegenerate}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="px-5 py-20 flex flex-col items-center text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-50" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <h4 className="text-base font-bold text-gray-900">Processing Data</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
            {customerPhotos.length > 0 
              ? 'Analyzing visual evidence and job history...' 
              : 'Synthesizing lead details...'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!brief && !loading && (
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
            <Sparkles className="w-8 h-8 text-gray-200" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-2">No Brief Available</h4>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">
            Generate an AI brief to see urgency levels, project summaries, and recommended next steps.
          </p>
          <button
            onClick={generate}
            className="w-full flex items-center justify-center gap-3 py-4 bg-black text-white text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            Generate Now
          </button>
        </div>
      )}

      {/* Brief Content */}
      {brief && !loading && (
        <div className="divide-y divide-gray-50 pb-20">
          {/* Top Line / Headline */}
          <div className="p-4 bg-gray-50/50">
            <div className="flex gap-2 mb-3">
              {brief.urgency && (
                <span className={`text-[10px] font-black px-2 py-1 uppercase tracking-tight ${
                  brief.urgency.toLowerCase().includes('emergency') || brief.urgency.toLowerCase().includes('high')
                    ? 'bg-red-600 text-white'
                    : 'bg-black text-white'
                }`}>
                  {brief.urgency}
                </span>
              )}
              {brief.customer_score && (
                <span className="text-[10px] font-black px-2 py-1 bg-white border border-gray-200 text-gray-900 uppercase tracking-tight">
                  Score: {brief.customer_score}
                </span>
              )}
            </div>
            {brief.headline && (
              <h2 className="text-lg font-black text-gray-900 leading-tight italic">
                "{brief.headline}"
              </h2>
            )}
          </div>

          {/* Summary Section */}
          {brief.summary && (
            <div className="p-4">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Executive Summary</label>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {brief.summary}
              </p>
            </div>
          )}

          {/* Photo Analysis */}
          {brief.photo_observations && brief.photo_observations !== 'null' && (
            <div className="p-4 bg-blue-50/30">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Image className="w-3 h-3" /> Visual Observations
              </label>
              <p className="text-sm text-blue-900/80 leading-relaxed">
                {brief.photo_observations}
              </p>
            </div>
          )}

          {/* Next Steps */}
          {brief.next_steps?.length > 0 && (
            <div className="p-4">
              <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-3">Action Plan</label>
              <div className="space-y-3">
                {brief.next_steps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm text-gray-600 leading-snug">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Warnings */}
          {brief.critical_info?.length > 0 && (
            <div className="p-4 bg-red-50">
              <label className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3 h-3" /> Critical Notes
              </label>
              <ul className="space-y-2">
                {brief.critical_info.map((info: string, i: number) => (
                  <li key={i} className="text-sm text-red-900 font-bold flex gap-2">
                    <span className="text-red-400">/</span> {info}
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