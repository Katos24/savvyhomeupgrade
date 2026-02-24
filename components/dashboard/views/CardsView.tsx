'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calendar, Bell, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
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
          lead_id: lead.id, customer_name: lead.name, description: lead.description,
          category: lead.category, status: lead.status, project_id: lead.project_id,
          scheduled_date: lead.scheduled_date, scheduled_time: lead.scheduled_time,
          assigned_to: lead.assigned_to, quote_total: lead.quote_total,
          payment_amount: lead.payment_amount, tasks: lead.tasks,
          internal_notes: lead.project_internal_notes,
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
        style={{ backgroundColor: isProject ? '#1a2e1f' : '#243447', borderColor: isProject ? '#2d5a3d' : '#354f6e' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = statusHex)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#354f6e')}
        onClick={() => onSelectLead(lead)}
      >
        {/* Color accent bar */}
        <div className="h-1 w-full" style={{ backgroundColor: statusHex }} />

        <div className="p-4">
          {/* Top row: status + badges */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="px-2.5 py-1 text-xs font-bold border"
              style={{
                backgroundColor: `${statusHex}30`,
                color: statusConfig.color === 'yellow' ? '#fbbf24' : statusHex,
                borderColor: `${statusHex}50`,
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
                <span className="px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                  #{lead.project_number}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <h3 className="text-white font-bold text-base mb-1.5 line-clamp-1">{lead.name}</h3>

          {/* Description */}
          {description && (
            <p className="text-white/70 text-xs mb-3 line-clamp-2 leading-relaxed">{description}</p>
          )}

          {/* Schedule */}
          {lead.scheduled_date && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
              <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <span>
                {new Date(lead.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {lead.scheduled_time && ` · ${formatScheduledTime(lead.scheduled_time)}`}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-500 text-xs">{formatDate(lead.created_at)}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500 text-white text-xs font-bold">
                <Tag className="w-3 h-3" />
                {formatCategory(lead.category)}
              </span>
            </div>
            <button
              onClick={(e) => handleGetBrief(e, lead)}
              disabled={briefState?.loading}
              className="px-2 py-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold transition"
            >
              {briefState?.loading ? '⏳' : '🤖'}
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

      {/* AI Brief Modal */}
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
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between"
              style={{ background: '#312e81' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🤖</span>
                <div>
                  <h3 className="text-white font-bold">AI Brief</h3>
                  <p className="text-indigo-300 text-xs">{activeBriefLead.name}</p>
                </div>
              </div>
              <button onClick={() => setActiveBriefLead(null)}
                className="text-white/50 hover:text-white p-1.5 hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {brief.summary && (
                <div className="bg-slate-800 border border-slate-700 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">📋 Summary</p>
                  <p className="text-white text-sm leading-relaxed">{brief.summary}</p>
                </div>
              )}
              {brief.next_steps?.length > 0 && (
                <div className="bg-slate-800 border border-emerald-900 p-4">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">✅ Next Steps</p>
                  <ul className="space-y-2">
                    {brief.next_steps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-white">
                        <span className="text-emerald-400 font-bold min-w-[1.25rem]">{i + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {brief.critical_info?.length > 0 && (
                <div className="bg-slate-800 border border-amber-900 p-4">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">⚠️ Critical Info</p>
                  <ul className="space-y-2">
                    {brief.critical_info.map((info: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-amber-100">
                        <span className="text-amber-400">•</span>
                        <span className="leading-relaxed">{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {brief.urgency && (
                <div className="flex justify-center pt-1">
                  <span className={`px-4 py-2 text-sm font-bold ${
                    brief.urgency === 'Emergency' ? 'bg-red-600 text-white' :
                    brief.urgency === 'High Priority' ? 'bg-orange-500 text-white' :
                    brief.urgency === 'Normal' ? 'bg-indigo-600 text-white' :
                    'bg-slate-600 text-white'
                  }`}>
                    {brief.urgency}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-700">
              <button
                onClick={() => setActiveBriefLead(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}