'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';

interface CalendarViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
}

const STATUS_HEX: Record<string, string> = {
  blue:   '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  green:  '#10b981',
  red:    '#ef4444',
  gray:   '#64748b',
  indigo: '#6366f1',
  pink:   '#ec4899',
};

function formatTime12h(timeStr?: string) {
  if (!timeStr || timeStr === 'TBD') return 'TBD';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDateNice(dateStr: string) {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CalendarView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
}: CalendarViewProps) {
  const [calDate, setCalDate] = useState(new Date());

  const year  = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const DAYS        = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusHex = (lead: any) => {
    const opt = statusOptions.find((s: any) => s.value === lead.status);
    if (!opt) return '#6366f1';
    if (opt.hex) return opt.hex;
    return STATUS_HEX[opt.color] || '#6366f1';
  };

  const scheduledLeads = leads.filter(l => l.scheduled_date);

  const leadsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledLeads.filter(l => l.scheduled_date?.startsWith(dateStr));
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;

  const border  = isDark ? 'border-white/[0.06]' : 'border-gray-100';
  const cellBg  = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50';
const textDay = isDark ? 'text-white' : 'text-gray-400';

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0f172a] border-white/[0.08]' : 'bg-white border-gray-200'}`}>

      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
        <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthName}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCalDate(new Date(year, month - 1, 1))}
            className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCalDate(new Date())}
            className={`px-3 py-1 rounded-lg text-xs font-black transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            Today
          </button>
          <button
            onClick={() => setCalDate(new Date(year, month + 1, 1))}
            className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className={`grid grid-cols-7 border-b ${border}`}>
        {DAYS.map(d => (
          <div key={d} className={`py-2 text-center text-[10px] font-black uppercase tracking-widest ${textDay}`}>
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`min-h-[70px] sm:min-h-[100px] border-r border-b ${border}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day      = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);
          const isLastCol = (day + firstDay - 1) % 7 === 6;

          return (
            <div
              key={day}
              className={`min-h-[52px] sm:min-h-[100px] border-r border-b p-1 sm:p-2 transition ${border} ${cellBg} ${isLastCol ? 'border-r-0' : ''}`}
            >
              {/* Day number */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-black mb-1 ${
                todayCell
                  ? 'bg-indigo-600 text-white'
                  : isDark ? 'text-white' : 'text-gray-500'

              }`}>
                {day}
              </div>

              {/* Lead pills */}
              <div className="space-y-0.5">
                {dayLeads.slice(0, 2).map(lead => {
                  const hex = getStatusHex(lead);
                  return (
                    <button
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="w-full text-left px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold truncate transition hover:opacity-80"
style={{ backgroundColor: `${hex}30`, color: isDark ? '#ffffff' : hex }}
                    >
                     
<span className="hidden sm:inline">
  {lead.scheduled_time ? formatTime12h(lead.scheduled_time) + ' ' : ''}
  {lead.name.split(' ')[0]}
</span>
<span className="sm:hidden">{lead.name[0]}</span>
                    </button>
                  );
                })}
                {dayLeads.length > 2 && (
                  <p className={`text-[9px] font-black px-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    +{dayLeads.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

     
      {scheduledLeads.length === 0 && (
        <div className={`px-5 py-10 text-center border-t ${border}`}>
          <Calendar className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-white/10' : 'text-gray-200'}`} />
          <p className={`text-sm font-bold ${isDark ? 'text-white/20' : 'text-gray-300'}`}>No scheduled jobs yet</p>
        </div>
      )}
    </div>
  );
}