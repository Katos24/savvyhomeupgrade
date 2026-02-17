'use client';

import { useState, useCallback, useMemo } from 'react';
import { safeJSONParse, parseNotes } from '@/lib/utils';
import { Calendar, Bell, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
  const [briefStates, setBriefStates] = useState<{[key: number]: {
    loading: boolean;
    brief: any | null;
  }}>({});
  const [activeBriefLead, setActiveBriefLead] = useState<any | null>(null);
  const [hoveredReminder, setHoveredReminder] = useState<number | null>(null);

  const formatCategory = (cat: string) => {
    if (!cat) return 'Uncategorized';
    return cat
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusConfig = (statusValue: string) => {
    return statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];
  };

  const getStatusColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      green: '#22c55e',
      red: '#ef4444',
      gray: '#6b7280',
      indigo: '#6366f1',
      pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const leadDate = new Date(date.setHours(0, 0, 0, 0));
    
    if (leadDate.getTime() === today.getTime()) {
      // Manual 12-hour format to avoid locale issues
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    }
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatScheduledTime = (timeString: string) => {
    if (!timeString) return '';
    
    // Handle HH:MM format (24-hour)
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    
    // If it's already formatted or other format, return as is
    return timeString;
  };

  const handleGetBrief = useCallback(async (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    
    if (briefStates[lead.id]?.brief) {
      setActiveBriefLead(lead);
      return;
    }
    
    setBriefStates(prev => ({
      ...prev,
      [lead.id]: { loading: true, brief: null }
    }));
    
    try {
      const response = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          customer_name: lead.name,
          description: lead.description,
          category: lead.category,
          status: lead.status,
          project_id: lead.project_id,
          scheduled_date: lead.scheduled_date,
          scheduled_time: lead.scheduled_time,
          assigned_to: lead.assigned_to,
          quote_total: lead.quote_total,
          payment_amount: lead.payment_amount,
          tasks: lead.tasks,
          internal_notes: lead.project_internal_notes,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBriefStates(prev => ({
          ...prev,
          [lead.id]: { loading: false, brief: data.brief }
        }));
        setActiveBriefLead(lead);
      } else {
        toast.error(data.error || 'Failed to generate brief');
        setBriefStates(prev => ({
          ...prev,
          [lead.id]: { loading: false, brief: null }
        }));
      }
    } catch (error) {
      console.error('Brief error:', error);
      toast.error('Failed to generate AI brief');
      setBriefStates(prev => ({
        ...prev,
        [lead.id]: { loading: false, brief: null }
      }));
    }
  }, [briefStates]);

  const renderLeadCard = (lead: any) => {
    const leadStatus = lead.status || statusOptions[0]?.value || 'new';
    const statusConfig = getStatusConfig(leadStatus);
    const statusColorHex = getStatusColorHex(statusConfig.color);
    const isProject = !!lead.project_id;
    const hasReminder = !!lead.follow_up_date;
    const hasSchedule = !!lead.scheduled_date;
    const briefState = briefStates[lead.id];
    
    const descriptionPreview = lead.description && lead.description.trim().length > 0
      ? (lead.description.length > 80 ? lead.description.substring(0, 80) + '...' : lead.description)
      : null;

    return (
      <div
        key={lead.id}
        className="group relative backdrop-blur-md rounded-xl p-4 border transition-all cursor-pointer shadow-lg hover:shadow-xl"
        style={{
          backgroundColor: isProject ? '#1e3a2f' : '#1e293b',
          borderColor: '#475569'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = statusColorHex;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#475569';
        }}
        onClick={() => onSelectLead(lead)}
      >
        {/* Top Right - Reminder & Project Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-2">
          {/* Reminder Icon with Tooltip */}
          {hasReminder && (
            <div 
              className="relative"
              onMouseEnter={() => setHoveredReminder(lead.id)}
              onMouseLeave={() => setHoveredReminder(null)}
              onClick={(e) => e.stopPropagation()}
            >
              <Bell className="w-4 h-4 text-red-400 cursor-help" />
              
              {/* Tooltip */}
              {hoveredReminder === lead.id && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl z-10 min-w-[200px]">
                  <div className="text-xs text-red-300 font-semibold mb-1">
                    Follow-up: {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {lead.follow_up_notes && (
                    <div className="text-xs text-gray-400">
                      {lead.follow_up_notes}
                    </div>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full right-4 -mt-1">
                    <div className="w-2 h-2 bg-slate-900 border-r border-b border-slate-700 transform rotate-45"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Badge */}
          {isProject && (
            <div className="px-2 py-0.5 bg-emerald-600/20 border border-emerald-500/30 rounded text-emerald-300 text-xs font-bold">
              #{lead.project_number}
            </div>
          )}
        </div>

        {/* Header - Status */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ 
              backgroundColor: `${statusColorHex}20`,
              color: statusConfig.color === 'yellow' ? '#fbbf24' : statusColorHex,
              borderColor: `${statusColorHex}30`
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Customer Name */}
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{lead.name}</h3>

        {/* Description - BRIGHTER TEXT */}
        {descriptionPreview && (
          <p className="text-white/90 text-sm mb-3 line-clamp-2 leading-relaxed">
            {descriptionPreview}
          </p>
        )}

        {/* Schedule Info - Simple Line */}
        {hasSchedule && (
          <div className="text-gray-400 text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              {new Date(lead.scheduled_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
              {lead.scheduled_time && ` at ${formatScheduledTime(lead.scheduled_time)}`}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs">{formatDate(lead.created_at)}</span>
            <span className="text-blue-400 text-xs font-medium flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {formatCategory(lead.category)}
            </span>
          </div>

          {/* AI Brief Button */}
          <button
            onClick={(e) => handleGetBrief(e, lead)}
            disabled={briefState?.loading}
            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs font-semibold transition"
          >
            {briefState?.loading ? '⏳' : '🤖'}
          </button>
        </div>
      </div>
    );
  };

  const brief = useMemo(() => 
    activeBriefLead ? briefStates[activeBriefLead.id]?.brief : null,
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setActiveBriefLead(null)}
        >
          <div 
            className="bg-gradient-to-br from-purple-900 to-blue-900 w-full sm:max-w-2xl sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-purple-800 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-purple-700">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Brief</h3>
                  <p className="text-purple-200 text-xs">{activeBriefLead.name}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveBriefLead(null)}
                className="text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {brief.summary && (
                <div className="bg-blue-800/40 border border-blue-600/50 rounded-lg p-4">
                  <h4 className="text-blue-200 font-semibold text-sm mb-2">📋 Summary</h4>
                  <p className="text-white leading-relaxed text-sm">
                    {brief.summary}
                  </p>
                </div>
              )}

              {brief.next_steps && brief.next_steps.length > 0 && (
                <div className="bg-green-800/40 border border-green-600/50 rounded-lg p-4">
                  <h4 className="text-green-200 font-semibold text-sm mb-3">✅ Next Steps</h4>
                  <ul className="space-y-2">
                    {brief.next_steps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-2 text-white text-sm">
                        <span className="text-green-400 font-bold min-w-[1.5rem]">{i + 1}.</span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {brief.critical_info && brief.critical_info.length > 0 && (
                <div className="bg-yellow-800/40 border-2 border-yellow-600/50 rounded-lg p-4">
                  <h4 className="text-yellow-200 font-semibold text-sm mb-3 flex items-center gap-2">
                    ⚠️ Critical Information
                  </h4>
                  <ul className="space-y-2">
                    {brief.critical_info.map((info: string, i: number) => (
                      <li key={i} className="flex gap-2 text-yellow-100 text-sm">
                        <span className="text-yellow-400">•</span>
                        <span className="leading-relaxed">{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {brief.urgency && (
                <div className="flex justify-center">
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                    brief.urgency === 'Emergency' ? 'bg-red-500 text-white' :
                    brief.urgency === 'High Priority' ? 'bg-orange-500 text-white' :
                    brief.urgency === 'Normal' ? 'bg-blue-500 text-white' :
                    'bg-gray-400 text-white'
                  }`}>
                    Urgency: {brief.urgency}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-purple-800 px-4 sm:px-6 py-4 border-t border-purple-700">
              <button
                onClick={() => setActiveBriefLead(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition"
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