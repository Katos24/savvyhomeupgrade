'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, Bell, Tag, X } from 'lucide-react';
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
      green: '#22c55e', red: '#ef4444', gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      let h = date.getHours();
      const m = date.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
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
  }, [briefStates]);

  const getCustomerScoreStyle = (score: string) => {
    switch (score) {
      case 'VIP': return { bg: 'bg-amber-500', text: 'text-white', label: '⭐ VIP' };
      case 'Good': return { bg: 'bg-emerald-600', text: 'text-white', label: '✓ Good' };
      case 'Risky': return { bg: 'bg-red-600', text: 'text-white', label: '⚠ Risky' };
      default: return { bg: 'bg-slate-600', text: 'text-white', label: '· New' };
    }
  };

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'Emergency': return 'bg-red-600 text-white';
      case 'High Priority': return 'bg-orange-500 text-white';
      case 'Normal': return 'bg-indigo-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const renderLeadCard = (lead: any) => {
    const statusConfig = getStatusConfig(lead.status || statusOptions[0]?.value);
    const statusHex = getStatusColorHex(statusConfig.color);
    const isProject = !!lead.project_id;
    const briefState = briefStates[lead.id];
    const description = lead.description?.trim()
      ? lead.description.length > 80 ? lead.description.slice(0, 80) + '…' : lead.description
      : null;

    return (
      <div
        key={lead.id}
        className="group relative cursor-pointer border transition-all shadow-sm hover:shadow-md"
style={{ 
  backgroundColor: '#243447',
  borderColor: isProject ? '#4f46e5' : '#354f6e'
}}        onMouseEnter={(e) => (e.currentTarget.style.borderColor = statusHex)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = isProject ? '#2d5a3d' : '#354f6e')}
        onClick={() => onSelectLead(lead)}
      >
        <div className="h-1 w-full" style={{ backgroundColor: statusHex }} />

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2.5 py-1 text-xs font-bold border"
              style={{
                backgroundColor: `grey` === statusConfig.color ? '#374151' : `${statusHex}20`,
                color: statusConfig.color === 'yellow' ? '#fbbf24' : statusHex,
                borderColor: `${statusHex}50`,
                fontSize: '10px',
              }}
            >
              {statusConfig.label}
            </span>
            <div className="flex items-center gap-2">
              {lead.follow_up_date && (
                <div
                  className="relative"
                  onMouseEnter={() => setHoveredReminder(lead.id)}
                  onMouseLeave={() => setHoveredReminder(null)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  {hoveredReminder === lead.id && (
                    <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 p-3 shadow-xl z-10 min-w-[180px]">
                      <p className="text-xs text-red-300 font-bold mb-1">
                        Follow-up: {new Date(lead.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      {lead.follow_up_notes && (
                        <p className="text-xs text-gray-400">{lead.follow_up_notes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
             {isProject && (
<span className="text-gray-400 text-xs">
  {lead.project_number}
</span>
)}
            </div>
          </div>

          <h3 className="text-white font-bold text-base mb-1.5 line-clamp-1">{lead.name}</h3>

          {description && (
            <p className="text-white/70 text-xs mb-3 line-clamp-2 leading-relaxed">{description}</p>
          )}

          {lead.scheduled_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span>
                {new Date(lead.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {lead.scheduled_time && ` · ${formatScheduledTime(lead.scheduled_time)}`}
              </span>
            </div>
          )}

  {lead.quote_total && (
            <div className="flex items-center gap-1.5 text-xs mb-3 flex-wrap">
              <span className={`px-2 py-0.5 font-bold ${
                lead.payment_status === 'paid'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  : lead.payment_status === 'partial'
                  ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                  : 'bg-white/5 border border-white/10 text-white/50'
              }`}>
                {lead.payment_status === 'paid'
                  ? `✓ ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))} Paid`
                  : lead.payment_status === 'partial'
                  ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.payment_amount || 0))} / ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))} paid`
                  : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))} due`}
              </span>
                
              {lead.quote_accepted_at && (
                <span className="px-2 py-0.5 font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">✅ Accepted</span>
              )}
              {lead.quote_declined_at && !lead.quote_accepted_at && (
                <span className="px-2 py-0.5 font-bold bg-red-500/20 border border-red-500/30 text-red-300">✗ Declined</span>
              )}
              {!lead.quote_accepted_at && !lead.quote_declined_at && (() => {
                try {
                  const log = typeof lead.quote_emails === 'string' ? JSON.parse(lead.quote_emails) : lead.quote_emails || [];
                  if (log.length > 0) return <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300">📨 Sent</span>;
                } catch {}
                return null;
              })()}
            </div>
          )}
           <span className="text-gray-400 text-xs">
      @{lead.assigned_to || 'Unassigned'}
    </span>


          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-500 text-xs">{formatDate(lead.created_at)}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 text-white/70 text-xs font-bold rounded-md">
  <Tag className="w-3 h-3 opacity-70" />
  {formatCategory(lead.category)}
 
   
  
</span>
            </div>
            <button
              onClick={(e) => canUseAiBrief(planTier)
                ? handleGetBrief(e, lead)
                : window.location.href = `/subscribe?upgrade=pro`}
              disabled={briefState?.loading}
              className={`px-2 py-1 text-white text-xs font-bold transition disabled:opacity-50 ${
                canUseAiBrief(planTier)
                  ? 'bg-violet-600 hover:bg-violet-700'
                  : 'bg-slate-600 hover:bg-amber-500'
              }`}
              title={canUseAiBrief(planTier) ? 'Generate AI Brief' : 'Upgrade to Pro for AI Brief'}
            >
              {briefState?.loading ? '⏳' : canUseAiBrief(planTier) ? '✦' : '🔒'}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leads.map(lead => renderLeadCard(lead))}
      </div>

      {/* ── AI BRIEF MODAL ── */}
      {activeBriefLead && brief && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
          onClick={() => setActiveBriefLead(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 w-full sm:max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-700 flex items-start justify-between"
              style={{ background: '#312e81' }}>
              <div className="flex-1 min-w-0 mr-3">
                {brief.headline && (
                  <p className="text-white font-bold text-base leading-snug mb-2">{brief.headline}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-indigo-300 text-xs">{activeBriefLead.name}</p>
                  {brief.customer_score && (() => {
                    const s = getCustomerScoreStyle(brief.customer_score);
                    return (
                      <span className={`px-2 py-0.5 text-xs font-bold ${s.bg} ${s.text}`}>
                        {s.label}
                      </span>
                    );
                  })()}
                  {brief.urgency && (
                    <span className={`px-2 py-0.5 text-xs font-bold ${getUrgencyStyle(brief.urgency)}`}>
                      {brief.urgency}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveBriefLead(null)}
                className="text-white/50 hover:text-white p-1.5 hover:bg-white/10 transition flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {brief.summary && (
                <div className="bg-slate-800 border border-slate-700 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</p>
                  <p className="text-white text-sm leading-relaxed">{brief.summary}</p>
                </div>
              )}
              {brief.next_steps?.length > 0 && (
                <div className="bg-slate-800 border border-emerald-900 p-4">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">Next Steps</p>
                  <ul className="space-y-2">
                    {brief.next_steps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-sm text-white">
                        <span className="text-emerald-400 font-bold min-w-[1.25rem]">{i + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {brief.critical_info?.length > 0 && (
                <div className="bg-slate-800 border border-amber-900 p-4">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">⚠ Critical</p>
                  <ul className="space-y-2">
                    {brief.critical_info.map((info: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-amber-100">
                        <span className="text-amber-400 flex-shrink-0">•</span>
                        <span className="leading-relaxed">{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => {
                  setBriefStates(prev => ({ ...prev, [activeBriefLead.id]: { loading: false, brief: null } }));
                  setActiveBriefLead(null);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white/60 font-bold py-2.5 text-xs transition"
              >
                Regenerate
              </button>
              <button
                onClick={() => { setActiveBriefLead(null); onSelectLead(activeBriefLead); }}
                className="flex-[2] text-white font-bold py-2.5 text-sm transition"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Open Lead →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}