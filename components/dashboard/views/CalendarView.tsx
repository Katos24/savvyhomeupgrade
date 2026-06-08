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
  indigo: '#3b82f6',
  pink:   '#ec4899',
};

function formatTime12h(timeStr?: string) {
  if (!timeStr || timeStr === 'TBD') return 'TBD';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const DAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
}: CalendarViewProps) {
  const [calDate, setCalDate] = useState(new Date());

  const year        = calDate.getFullYear();
  const month       = calDate.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName   = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getStatusHex = (lead: any) => {
    const opt = statusOptions.find((s: any) => s.value === lead.status);
    if (!opt) return '#3b82f6';
    if (opt.hex) return opt.hex;
    return STATUS_HEX[opt.color] || '#3b82f6';
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

  // Theme tokens
  const bg        = isDark ? 'bg-[#0a0c14]'          : 'bg-white';
  const border    = isDark ? 'border-white/[0.06]'   : 'border-slate-100';
  const headerBg  = isDark ? 'bg-white/[0.02]'       : 'bg-slate-50/80';
  const cellHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50';
  const textMuted = isDark ? 'text-white/30'          : 'text-slate-400';
  const textMain  = isDark ? 'text-white'             : 'text-slate-900';

  return (
    <div className={`rounded-[1.5rem] sm:rounded-[2rem] border overflow-hidden ${bg} ${border} shadow-2xl`}>

      {/* HEADER */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b ${border} ${headerBg}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
            <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h3 className={`text-sm sm:text-base font-black tracking-tight ${textMain}`}>{monthName}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCalDate(new Date(year, month - 1, 1))}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all active:scale-90 ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCalDate(new Date())}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setCalDate(new Date(year, month + 1, 1))}
            className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all active:scale-90 ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DAY HEADERS */}
      <div className={`grid grid-cols-7 border-b ${border}`}>
        {DAYS_FULL.map((d, i) => (
          <div key={d} className={`py-2 sm:py-3 text-center font-black uppercase tracking-widest ${textMuted}`}>
            <span className="hidden sm:inline text-[10px]">{d}</span>
            <span className="sm:hidden text-[9px]">{DAYS_SHORT[i]}</span>
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7">
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div
            key={`empty-${i}`}
className={`min-h-[52px] sm:min-h-[90px] border-r border-b ${border} ${isDark ? 'bg-white/[0.01]' : 'bg-slate-50/30'}`}
          />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day      = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);
          const isLastCol = (day + firstDay - 1) % 7 === 6;
          const hasLeads  = dayLeads.length > 0;

          return (
            <div
              key={day}
className={`min-h-[52px] sm:min-h-[90px] border-b p-1 sm:p-2 transition-colors ${border} ${                isLastCol ? '' : `border-r`
              } ${cellHover}`}
            >
              {/* Day number */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-lg text-[10px] sm:text-[11px] font-black mb-1 ${
                todayCell
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : textMuted
              }`}>
                {day}
              </div>

              {/* Lead pills — desktop: full pill, mobile: tap to open directly */}
              <div className="flex flex-col gap-0.5">
                {/* Desktop pills */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  {dayLeads.slice(0, 3).map(lead => {
                    const hex = getStatusHex(lead);
                    return (
                      <button
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className="w-full text-left px-1.5 py-1 rounded-md text-[9px] font-bold truncate transition-all hover:brightness-110 active:scale-95"
                        style={{ backgroundColor: `${hex}25`, color: hex }}
                      >
                        {lead.scheduled_time ? formatTime12h(lead.scheduled_time) + ' · ' : ''}
                        {lead.name.split(' ')[0]}
                      </button>
                    );
                  })}
                  {dayLeads.length > 3 && (
                    <p className={`text-[8px] font-black px-1 ${textMuted}`}>
                      +{dayLeads.length - 3} more
                    </p>
                  )}
                </div>

                {/* Mobile: colored dot buttons — each opens the lead directly */}
                {hasLeads && (
                  <div className="sm:hidden flex flex-wrap gap-1 mt-0.5">
                    {dayLeads.slice(0, 4).map(lead => {
                      const hex = getStatusHex(lead);
                      return (
                        <button
                          key={lead.id}
                          onClick={() => onSelectLead(lead)}
                          className="w-4 h-4 rounded-full active:scale-90 transition-transform shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={lead.name}
                        />
                      );
                    })}
                    {dayLeads.length > 4 && (
                      <span className={`text-[8px] font-black ${textMuted} leading-4`}>
                        +{dayLeads.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {scheduledLeads.length === 0 && (
        <div className={`px-5 py-10 text-center border-t ${border}`}>
          <Calendar className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-white/10' : 'text-slate-200'}`} />
          <p className={`text-sm font-bold ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
            No scheduled jobs yet
          </p>
        </div>
      )}
    </div>
  );
}