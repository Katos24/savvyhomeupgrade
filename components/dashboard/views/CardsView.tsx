'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, Bell, Tag, X, Sparkles, Image as ImageIcon, User, CheckCircle2, AlertCircle, DollarSign, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { canUseAiBrief, PlanTier } from '@/lib/permissions';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  planTier?: PlanTier;
}

export default function CardsView({ leads, onSelectLead, statusOptions, planTier = 'basic' }: CardsViewProps) {
  const [briefStates, setBriefStates] = useState<{ [key: number]: { loading: boolean; brief: any | null } }>({});
  const [activeBriefLead, setActiveBriefLead] = useState<any | null>(null);
  const [hoveredReminder, setHoveredReminder] = useState<number | null>(null);

  const formatCategory = (cat: string) => {
    if (!cat) return 'Uncategorized';
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
      green: '#10b981', red: '#ef4444', gray: '#64748b', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatScheduledTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const handleGetBrief = useCallback(async (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    if (briefStates[lead.id]?.brief) { setActiveBriefLead(lead); return; }

    setBriefStates(prev => ({ ...prev, [lead.id]: { loading: true, brief: null } }));
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
          tasks: lead.tasks || null,
          internal_notes: lead.project_internal_notes || null,
          company_name: lead.company_name || null,
          repeat_customer: false,
          past_jobs: [],
          plan_tier: planTier,
          photos: lead.photos?.map((p: any) => p.url) ?? [],  
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBriefStates(prev => ({ ...prev, [lead.id]: { loading: false, brief: data.brief } }));
        setActiveBriefLead(lead);
      } else {
        toast.error(data.error || 'Failed to generate brief');
        setBriefStates(prev => ({ ...prev, [lead.id]: { loading: false, brief: null } }));
      }
    } catch {
      toast.error('Failed to generate AI brief');
      setBriefStates(prev => ({ ...prev, [lead.id]: { loading: false, brief: null } }));
    }
  }, [briefStates, planTier]);

  const getCustomerScoreStyle = (score: string) => {
    switch (score) {
      case 'VIP': return { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', label: '⭐ VIP' };
      case 'Good': return { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', label: '✓ Good' };
      case 'Risky': return { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', label: '⚠ Risky' };
      default: return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', label: 'New' };
    }
  };

  const renderLeadCard = (lead: any) => {
    const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
    const statusHex = getStatusColorHex(statusConfig.color);
    const isProject = !!lead.project_id;
    const briefState = briefStates[lead.id];
    const description = lead.description?.trim();

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className={`group relative bg-white border rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer overflow-hidden ${
          lead.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'
        }`}
        style={{ borderColor: isProject ? `${statusHex}40` : '#e2e8f0' }}
      >
        {/* Status Accent Bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: statusHex }} />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border"
              style={{
                backgroundColor: `${statusHex}10`,
                color: statusHex,
                borderColor: `${statusHex}30`,
              }}
            >
              {statusConfig.label}
            </span>
            
            <div className="flex items-center gap-2">
              {lead.follow_up_date && (
                <div 
                  className="relative flex items-center"
                  onMouseEnter={() => setHoveredReminder(lead.id)}
                  onMouseLeave={() => setHoveredReminder(null)}
                >
                  <Bell className="w-4 h-4 text-red-500 animate-pulse" />
                  {hoveredReminder === lead.id && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 p-3 shadow-xl z-10 min-w-[200px] rounded-lg">
                      <p className="text-xs text-red-600 font-bold mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        Follow-up: {new Date(lead.follow_up_date).toLocaleDateString()}
                      </p>
                      {lead.follow_up_notes && <p className="text-[11px] text-slate-500 italic">"{lead.follow_up_notes}"</p>}
                    </div>
                  )}
                </div>
              )}
              {isProject && <span className="text-slate-400 text-[10px] font-mono font-bold">#{lead.project_number}</span>}
            </div>
          </div>

          <h3 className="text-slate-900 font-bold text-base mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {lead.name}
          </h3>

          {description && (
            <p className="text-slate-500 text-xs mb-3 line-clamp-2 leading-relaxed h-8">
              {description}
            </p>
          )}

          {/* Schedule Info */}
          {lead.scheduled_date && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mb-3 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {lead.scheduled_time && ` at ${formatScheduledTime(lead.scheduled_time)}`}
              </span>
            </div>
          )}

          {/* Payment Status Pill */}
       {/* Payment & Quote Status */}
{lead.quote_total && (
  <div className="flex items-center gap-1.5 mb-4 flex-wrap">
    {/* Price / Payment Status */}
    <span className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 border ${
      lead.payment_status === 'paid'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : lead.payment_status === 'partial'
        ? 'bg-orange-50 border-orange-200 text-orange-700'
        : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}>
      {lead.payment_status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))}
    </span>
    
    {/* Accepted / Declined / Sent Status */}
    {lead.quote_accepted_at ? (
      <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Accepted
      </span>
    ) : lead.quote_declined_at ? (
      <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 border border-red-100 text-red-700">
        ✗ Declined
      </span>
    ) : (() => {
      try {
        const log = typeof lead.quote_emails === 'string' ? JSON.parse(lead.quote_emails) : lead.quote_emails || [];
        if (log.length > 0) return (
          <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-1">
            <Mail className="w-3 h-3" /> Sent
          </span>
        );
      } catch {}
      return null;
    })()}
  </div>
)}

          {/* Card Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                <User className="w-3 h-3" />
                {lead.assigned_to || 'Unassigned'}
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                <Tag className="w-3 h-3" />
                {formatCategory(lead.category)}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                canUseAiBrief(planTier)
                  ? handleGetBrief(e, lead)
                  : window.location.href = `/${window.location.pathname.split('/')[1]}/admin/settings`;
              }}
              disabled={briefState?.loading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                canUseAiBrief(planTier)
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-110'
                  : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600'
              }`}
            >
              {briefState?.loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : canUseAiBrief(planTier) ? (
                <Sparkles className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4 rotate-45" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const brief = useMemo(
    () => (activeBriefLead ? briefStates[activeBriefLead.id]?.brief : null),
    [activeBriefLead, briefStates]
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {leads.map(lead => renderLeadCard(lead))}
      </div>

      {/* ── AI BRIEF MODAL (LIGHT THEME) ── */}
      {activeBriefLead && brief && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-4"
          onClick={() => setActiveBriefLead(null)}
        >
          <div
            className="bg-white rounded-2xl w-full sm:max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-indigo-600 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">AI Project Intelligence</span>
                </div>
                <button onClick={() => setActiveBriefLead(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <h2 className="text-xl font-black leading-tight mb-2">{brief.headline || 'Lead Analysis'}</h2>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-indigo-100 text-sm font-medium">{activeBriefLead.name}</span>
                {brief.customer_score && (() => {
                  const s = getCustomerScoreStyle(brief.customer_score);
                  return (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                  );
                })()}
                {brief.urgency && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white/20 border border-white/30">
                    {brief.urgency} Urgency
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {brief.summary && (
                <section>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Executive Summary</label>
                  <div className="bg-white border border-slate-200 p-4 rounded-xl text-slate-700 text-sm leading-relaxed shadow-sm">
                    {brief.summary}
                  </div>
                </section>
              )}

              {brief.photo_observations && brief.photo_observations !== 'null' && (
                <section>
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> Photo Intelligence
                  </label>
                  <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-indigo-900 text-sm leading-relaxed">
                    {brief.photo_observations}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brief.next_steps?.length > 0 && (
                  <section>
                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Action Plan</label>
                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-3">
                      {brief.next_steps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs font-bold text-emerald-800">
                          <span className="opacity-50">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {brief.critical_info?.length > 0 && (
                  <section>
                    <label className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 block">Critical Alerts</label>
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl space-y-3">
                      {brief.critical_info.map((info: string, i: number) => (
                        <div key={i} className="flex gap-2 text-xs font-bold text-red-800">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{info}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-slate-100 flex gap-3 bg-white">
              <button
                onClick={() => {
                  setBriefStates(prev => ({ ...prev, [activeBriefLead.id]: { loading: false, brief: null } }));
                  setActiveBriefLead(null);
                }}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={() => { setActiveBriefLead(null); onSelectLead(activeBriefLead); }}
                className="flex-[2] px-4 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
              >
                Go to Project Dashboard →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}