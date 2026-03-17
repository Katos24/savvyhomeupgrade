'use client';

import { useState } from 'react';
import { 
  Calendar, Bell, User, CheckCircle2, 
  DollarSign, Mail, Phone, ChevronRight, 
  Clock, Briefcase 
} from 'lucide-react';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
}

export default function CardsView({ leads, onSelectLead, statusOptions }: CardsViewProps) {
  const [hoveredReminder, setHoveredReminder] = useState<number | null>(null);

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0] || { label: 'New', color: 'blue' };

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
      green: '#10b981', red: '#ef4444', gray: '#64748b', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  const formatScheduledTime = (time: string) => {
    if (!time || time === 'TBD') return 'TBD';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    /* GRID SETTINGS: 
       1 col on mobile
       2 cols on tablet (md)
       3 cols on large desktop (xl)
    */
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status);
        const statusHex = getStatusColorHex(statusConfig.color);
        const isCompleted = lead.status === 'completed';

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={`group relative flex bg-[#0A0C10] border border-[#1C2029] rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:border-[#3b82f6]/50 shadow-sm hover:shadow-xl ${
              isCompleted ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'
            }`}
          >
            {/* Left Status Accent */}
            <div 
              className="w-1.5 shrink-0" 
              style={{ backgroundColor: statusHex }} 
            />

            <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
              
              {/* Header: Status & Follow-up */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                    style={{ 
                      backgroundColor: `${statusHex}15`, 
                      color: statusHex, 
                      borderColor: `${statusHex}30` 
                    }}
                  >
                    {statusConfig.label}
                  </span>
                  {lead.follow_up_date && (
                    <Bell className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  )}
                </div>

                <h3 className="text-white text-lg font-bold tracking-tight truncate group-hover:text-blue-400 transition-colors">
                  {lead.name}
                </h3>
                
                <div className="flex items-center gap-3 mt-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-gray-600" />
                    <span className="truncate max-w-[80px]">{lead.category || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-600" />
                    <span className="truncate">{lead.assigned_to || 'Unassigned'}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Box: Clean Dashboard Style */}
              <div className="grid grid-cols-2 gap-2 mb-5 bg-[#161B22]/50 p-3 rounded-xl border border-[#1C2029]">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Date</span>
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    {lead.scheduled_date 
                      ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Not Set'}
                  </div>
                </div>
                <div className="flex flex-col gap-1 border-l border-[#232830] pl-3">
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Arrival</span>
                  <div className="flex items-center gap-1.5 text-gray-300 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {formatScheduledTime(lead.scheduled_time)}
                  </div>
                </div>
              </div>

              {/* Footer: Money & Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1C2029]">
                <div className="flex flex-col">
                  <div className="text-white font-black text-base tracking-tight">
                    {lead.quote_total 
                      ? `$${parseFloat(lead.quote_total).toLocaleString()}` 
                      : <span className="text-gray-700 text-xs uppercase tracking-widest">No Quote</span>}
                  </div>
                  <div className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${
                    lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-500'
                  }`}>
                    {lead.payment_status || 'Unpaid'}
                  </div>
                </div>

                <div className="h-9 w-9 rounded-xl bg-[#161B22] border border-[#232830] flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-lg">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}