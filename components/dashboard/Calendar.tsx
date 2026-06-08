'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CalendarDays, LayoutGrid, ArrowLeft, Filter, User, Clock,
  Briefcase, CheckCircle2
} from 'lucide-react';

type CalendarProps = {
  companySlug: string;
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
};

export default function Calendar({ companySlug, onSelectLead, statusOptions }: CalendarProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const safeStatusOptions = statusOptions?.length > 0 ? statusOptions : [
    { value: 'new', label: 'New', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'orange' },
    { value: 'completed', label: 'Completed', color: 'green' },
  ];

  useEffect(() => { fetchScheduledJobs(); }, [companySlug]);

  async function fetchScheduledJobs() {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads`);
      const data = await response.json();
      setEvents((data.leads || []).filter((l: any) => l.scheduled_date && !l.deleted));
    } catch (error) { toast.error('Failed to sync schedule'); }
    finally { setLoading(false); }
  }

  const filteredEvents = useMemo(() => {
    return filterAssignee === 'all' ? events : events.filter(e => e.assigned_to === filterAssignee);
  }, [events, filterAssignee]);

  const getStatusConfig = (status: string) =>
    safeStatusOptions.find(s => s.value === status) || safeStatusOptions[0];

  const handleNav = (dir: number) => {
    const d = new Date(currentDate);
    view === 'month' ? d.setMonth(d.getMonth() + dir) : d.setDate(d.getDate() + (dir * 7));
    setCurrentDate(d);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F2EDE4]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1a6645] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Master Schedule</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F2EDE4] text-[#0F1F3D] pb-20">

      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-[#F2EDE4]/90 backdrop-blur-md border-b border-[#D1C9BD]/50 px-3 sm:px-6 py-3 sm:py-5">
        <div className="w-full flex flex-row items-center justify-between gap-3">

          {/* Left: back + title */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button
              onClick={() => window.history.back()}
              className="shrink-0 p-2.5 sm:p-3 bg-white rounded-2xl shadow-sm border border-[#D1C9BD] hover:scale-105 transition-transform"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2 truncate">
                <CalendarIcon className="text-[#1a6645] shrink-0" size={20} /> Schedule
              </h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Operations Hub</p>
            </div>
          </div>

          {/* Right: view switcher */}
          <div className="flex items-center gap-1 bg-white/70 p-1 rounded-[2rem] border border-[#D1C9BD] shadow-inner shrink-0">
            <ViewTab active={view === 'week'} onClick={() => setView('week')} icon={LayoutGrid} label="Week" />
            <ViewTab active={view === 'month'} onClick={() => setView('month')} icon={CalendarDays} label="Month" />
          </div>
        </div>
      </nav>

      <main className="w-full px-3 sm:px-6 mt-4 sm:mt-8">

        {/* CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5 sm:mb-8 items-stretch sm:items-center">

          {/* Month nav */}
          <div className="flex items-center gap-3 bg-white px-4 sm:px-8 py-3 sm:py-4 rounded-[2.5rem] shadow-xl border border-[#D1C9BD] flex-1 justify-between">
            <button onClick={() => handleNav(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => handleNav(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-2 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-[2.5rem] shadow-xl border border-[#D1C9BD]">
            <Filter size={13} className="text-[#1a6645] shrink-0" />
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-[10px] sm:text-[11px] font-black uppercase outline-none bg-transparent min-w-[100px] sm:min-w-[140px]"
            >
              <option value="all">Everyone</option>
              {Array.from(new Set(events.map(e => e.assigned_to))).filter(Boolean).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Today button */}
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 sm:px-10 py-3 sm:py-4 bg-[#0F1F3D] text-white rounded-[2.5rem] text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:bg-[#1a6645] transition-all active:scale-95 shadow-lg shrink-0"
          >
            Today
          </button>
        </div>

        {/* VIEWS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view + currentDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {view === 'month' ? (
              <MonthGrid
                currentDate={currentDate}
                events={filteredEvents}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
              />
            ) : (
              <WeekStrip
                currentDate={currentDate}
                events={filteredEvents}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── COMPONENTS ──

function ViewTab({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-[#0F1F3D] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={13} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MonthGrid({ currentDate, events, onSelect, getStatus }: any) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const DAY_LABELS_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DAY_LABELS_DESKTOP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-[#D1C9BD] shadow-2xl overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {DAY_LABELS_DESKTOP.map((d, i) => (
          <div key={d} className="py-3 sm:py-5 text-center text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
            <span className="sm:hidden">{DAY_LABELS_MOBILE[i]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return (
            <div key={`empty-${i}`} className="min-h-[50px] sm:min-h-[120px] bg-slate-50/20 border-r border-b border-slate-50" />
          );

          const dStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
          const dayEvents = events.filter((e: any) => e.scheduled_date?.split('T')[0] === dStr);
          const isToday = new Date().toISOString().split('T')[0] === dStr;

          return (
            <div
              key={day}
              className={`min-h-[50px] sm:min-h-[140px] p-1 sm:p-2 border-r border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${isToday ? 'bg-blue-50/30' : ''}`}
            >
              <div className="mb-1 sm:mb-2">
                <span className={`text-[10px] sm:text-[11px] font-black w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-md sm:rounded-lg ${
                  isToday ? 'bg-[#1a6645] text-white shadow-md' : 'text-slate-300'
                }`}>
                  {day}
                </span>
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, 3).map((e: any) => (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    className="w-full text-[7px] sm:text-[8px] font-black p-1 sm:p-1.5 rounded-md border border-black/5 text-white uppercase truncate text-left shadow-sm hover:brightness-110 active:scale-95 transition-all"
                    style={{ backgroundColor: getStatus(e.job_status || e.status).color === 'green' ? '#1a6645' : '#3b82f6' }}
                  >
                    <span className="hidden sm:inline">{e.name}</span>
                    <span className="sm:hidden">•</span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <p className="text-[7px] sm:text-[8px] font-black text-slate-400 pl-1">+{dayEvents.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({ currentDate, events, onSelect, getStatus }: any) {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });

  return (
    <div className="space-y-4 sm:space-y-8">
      {weekDays.map((d, i) => {
        const dStr = d.toISOString().split('T')[0];
        const dayEvents = events.filter((e: any) => e.scheduled_date?.split('T')[0] === dStr);
        const isToday = new Date().toISOString().split('T')[0] === dStr;

        return (
          <div
            key={i}
            className={`group relative rounded-[2rem] sm:rounded-[3rem] border transition-all overflow-hidden ${
              isToday
                ? 'border-[#1a6645] bg-white shadow-2xl scale-[1.01] sm:scale-[1.02] z-10'
                : 'border-[#D1C9BD] bg-white/60 shadow-md'
            }`}
          >
            {/* Day header */}
            <div className={`px-5 sm:px-10 py-4 sm:py-6 flex justify-between items-center ${
              isToday ? 'bg-[#1a6645] text-white' : 'bg-white border-b border-[#D1C9BD]/30 text-[#0F1F3D]'
            }`}>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60 mb-0.5 sm:mb-1">
                  {d.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <h3 className="text-xl sm:text-3xl font-black italic tracking-tighter">
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
              </div>
              {isToday && (
                <div className="flex items-center gap-2 bg-white/20 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/30 backdrop-blur-md">
                  <CheckCircle2 size={13} />
                  <span className="text-[9px] sm:text-[10px] font-black uppercase hidden sm:inline">Active Today</span>
                </div>
              )}
            </div>

            {/* Day content */}
            <div className="p-4 sm:p-10">
              {dayEvents.length === 0 ? (
                <div className="py-6 sm:py-10 text-center opacity-20">
                  <Briefcase size={28} className="mx-auto mb-3 sm:mb-4" />
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">No Jobs Scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {dayEvents.map((e: any) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e)}
                      className="flex flex-col p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-[#D1C9BD]/50 hover:border-[#1a6645] hover:shadow-2xl transition-all group/card relative overflow-hidden text-left"
                    >
                      <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 group-hover/card:opacity-100 transition-opacity">
                        <ChevronRight size={16} />
                      </div>
                      <div
                        className="w-10 sm:w-12 h-1.5 rounded-full mb-4 sm:mb-6"
                        style={{ background: getStatus(e.job_status || e.status).color === 'green' ? '#1a6645' : '#3b82f6' }}
                      />
                      <h4 className="text-base sm:text-xl font-black tracking-tight mb-3 sm:mb-6 truncate">{e.name}</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 italic">
                          <Clock size={13} className="text-[#1a6645] shrink-0" />
                          {e.scheduled_time || 'TBD'}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase text-slate-400 italic">
                          <User size={13} className="text-[#1a6645] shrink-0" />
                          {e.assigned_to || 'Unassigned'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}