'use client';

import { useState } from 'react';
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
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleGetBrief = async (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    
    // If already loaded, just show modal
    if (briefStates[lead.id]?.brief) {
      setActiveBriefLead(lead);
      return;
    }
    
    // Start loading
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
  };

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
        className="group relative rounded-xl p-3 sm:p-4 border-2 transition-all cursor-pointer overflow-hidden shadow-lg active:scale-[0.98] sm:hover:shadow-2xl sm:hover:scale-[1.02]"
        style={{
          backgroundColor: isProject ? '#064e3b' : '#1e293b',
          borderColor: statusColorHex,
          boxShadow: `0 4px 20px ${statusColorHex}20`
        }}
        onClick={() => onSelectLead(lead)}
      >
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5" 
          style={{ backgroundColor: statusColorHex }}
        />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <h3 className="text-white font-bold text-base sm:text-lg line-clamp-2 flex-1 pr-1">
            {lead.name}
          </h3>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-shrink-0">
            <span 
              className="inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold shadow-sm whitespace-nowrap"
              style={{ 
                backgroundColor: statusColorHex,
                color: '#ffffff'
              }}
            >
              {statusConfig.label}
            </span>
            
            {isProject && (
              <span className="inline-flex items-center px-2 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
                #{lead.project_number}
              </span>
            )}
          </div>
        </div>

        {hasSchedule && (
          <div className="mb-3 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-emerald-300">
                  {new Date(lead.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {lead.scheduled_time && (
                  <div className="text-xs text-emerald-200">
                    {lead.scheduled_time}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {hasReminder && !hasSchedule && (
          <div className="mb-3 bg-red-500/20 border-2 border-red-500/40 rounded-lg px-2.5 sm:px-3 py-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-red-300">
                  Follow-up: {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {lead.follow_up_notes && (
                  <div className="text-xs text-red-200 mt-0.5 line-clamp-1">
                    {lead.follow_up_notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {descriptionPreview && (
          <div className="mb-3 bg-white/5 rounded-lg px-2.5 sm:px-3 py-2 border border-white/10">
            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
              {descriptionPreview}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 bg-blue-500/20 text-blue-300 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold border border-blue-500/30">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">{formatCategory(lead.category)}</span>
          </span>
          
          <button
            onClick={(e) => handleGetBrief(e, lead)}
            disabled={briefState?.loading}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            {briefState?.loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <>
                🤖
                <span className="hidden sm:inline">Brief</span>
              </>
            )}
          </button>
          
          <span className="text-white/40 text-xs font-medium whitespace-nowrap">
            {formatDate(lead.created_at)}
          </span>
        </div>

        <div 
          className="hidden sm:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at top right, ${statusColorHex}10, transparent 70%)`
          }}
        />
      </div>
    );
  };

  const brief = activeBriefLead ? briefStates[activeBriefLead.id]?.brief : null;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leads.map(lead => renderLeadCard(lead))}
      </div>

      {/* AI BRIEF MODAL - Mobile Friendly */}
      {activeBriefLead && brief && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setActiveBriefLead(null)}
        >
          <div 
            className="bg-gradient-to-br from-purple-900 to-blue-900 w-full sm:max-w-2xl sm:rounded-xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Summary */}
              {brief.summary && (
                <div className="bg-blue-800/40 border border-blue-600/50 rounded-lg p-4">
                  <h4 className="text-blue-200 font-semibold text-sm mb-2">📋 Summary</h4>
                  <p className="text-white leading-relaxed text-sm">
                    {brief.summary}
                  </p>
                </div>
              )}

              {/* Next Steps */}
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

              {/* Critical Info */}
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

              {/* Urgency Badge */}
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

            {/* Footer - Mobile sticky */}
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