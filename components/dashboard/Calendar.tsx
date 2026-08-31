'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  CalendarDays, LayoutGrid, ArrowLeft, Filter, User, Clock,
  Briefcase, List, Sun, X, MapPin, Search
} from 'lucide-react';
import { DEFAULT_STATUSES } from '@/lib/formCategories';

export interface Lead {
  id: string | number;
  name: string;
  category?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status?: string;
  job_status?: string;
  assigned_to?: string;
  address_line_1?: string;
  deleted?: boolean;
  [key: string]: any;
}

type CalendarProps = {
  companySlug: string;
  onSelectLead: (lead: Lead) => void;
  statusOptions: any[];
};

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const STATUS_COLOR_HEX: Record<string, string> = {
  blue: '#3b82f6',
  indigo: '#4f46e5',
  purple: '#7c3aed',
  violet: '#7c3aed',
  pink: '#db2777',
  yellow: '#d97706',
  amber: '#d97706',
  orange: '#ea580c',
  coral: '#ea580c',
  green: '#1a6645',
  emerald: '#059669',
  teal: '#0d9488',
  red: '#dc2626',
  rose: '#e11d48',
  slate: '#475569',
  gray: '#6b7280',
  zinc: '#3f3f46',
};

const resolveStatusColor = (colorName?: string) => STATUS_COLOR_HEX[colorName || ''] || '#3b82f6';

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function leadDayKey(lead: Lead): string | null {
  const raw = lead?.scheduled_date;
  if (!raw) return null;
  const s = String(raw);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

function formatTime12h(timeStr?: string) {
  if (!timeStr || timeStr === 'TBD') return 'TBD';
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return 'TBD';
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function timeRank(timeStr?: string): number {
  if (!timeStr || timeStr === 'TBD') return 9999;
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return 9999;
  return h * 60 + (m || 0);
}

export default function Calendar({ companySlug, onSelectLead, statusOptions }: CalendarProps) {
  const [events, setEvents] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [drawerDay, setDrawerDay] = useState<string | null>(null);

  const safeStatusOptions = statusOptions?.length > 0 ? statusOptions : DEFAULT_STATUSES;

  useEffect(() => { 
    fetchScheduledJobs(); 
  }, [companySlug]);

  async function fetchScheduledJobs() {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads?calendarAll=true`);
      const data = await response.json();
      setEvents((data.leads || []).filter((l: Lead) => l.scheduled_date && !l.deleted));
    } catch (error) { 
      toast.error('Failed to sync schedule'); 
    } finally { 
      setLoading(false); 
    }
  }

  const getStatusConfig = (status: string) =>
    safeStatusOptions.find((s: any) => s.value === status) || safeStatusOptions[0];

  const filteredEvents = useMemo(() => {
    return events.filter((e: Lead) => {
      const matchesAssignee = filterAssignee === 'all' || e.assigned_to === filterAssignee;
      const matchesSearch = !searchTerm || 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.address_line_1?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesAssignee && matchesSearch;
    });
  }, [events, filterAssignee, searchTerm]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    filteredEvents.forEach((e: Lead) => {
      const key = leadDayKey(e);
      if (!key) return;
      (map[key] ||= []).push(e);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => timeRank(a.scheduled_time) - timeRank(b.scheduled_time))
    );
    return map;
  }, [filteredEvents]);

  const handleNav = (dir: number) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + (dir * 7));
    else if (view === 'day') d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const activeDrawerEvents = drawerDay ? eventsByDay[drawerDay] || [] : [];

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F2EDE4]">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#1a6645] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Schedule</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#F2EDE4] text-[#0F1F3D] pb-20">

      {/* STICKY HEADER */}
      <nav className="sticky top-0 z-40 bg-[#F2EDE4]/95 backdrop-blur-md border-b border-[#D1C9BD]/60 px-3 sm:px-6 py-2.5 sm:py-4">
        <div className="w-full flex items-center justify-between gap-2">

          {/* Left Side Header */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => window.history.back()}
              className="shrink-0 p-2 bg-white rounded-xl shadow-xs border border-[#D1C9BD] hover:scale-105 transition-transform"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="truncate">
              <h1 className="text-base sm:text-2xl font-black tracking-tighter uppercase italic flex items-center gap-1.5 truncate">
                <CalendarIcon className="text-[#1a6645] shrink-0" size={18} />
                <span className="truncate">Schedule</span>
              </h1>
              <p className="hidden sm:block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {filteredEvents.length} Jobs
              </p>
            </div>
          </div>

          {/* Responsive View Switcher */}
          <div className="flex items-center gap-0.5 bg-white p-1 rounded-2xl border border-[#D1C9BD] shadow-inner shrink-0">
            <ViewTab active={view === 'month'} onClick={() => setView('month')} icon={CalendarDays} shortLabel="M" fullLabel="Month" />
            <ViewTab active={view === 'week'} onClick={() => setView('week')} icon={LayoutGrid} shortLabel="W" fullLabel="Week" />
            <ViewTab active={view === 'day'} onClick={() => setView('day')} icon={Sun} shortLabel="D" fullLabel="Day" />
            <ViewTab active={view === 'agenda'} onClick={() => setView('agenda')} icon={List} shortLabel="List" fullLabel="Agenda" />
          </div>
        </div>
      </nav>

      <main className="w-full px-2.5 sm:px-6 mt-3 sm:mt-6 max-w-7xl mx-auto space-y-3 sm:space-y-4">

        {/* CONTROLS BAR */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">

          {/* Date Navigator */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl shadow-xs border border-[#D1C9BD]">
            <div className="flex items-center gap-1">
              <button onClick={() => handleNav(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 bg-[#0F1F3D] text-white rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-[#1a6645] transition-colors"
              >
                Today
              </button>
              <button onClick={() => handleNav(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider truncate text-right ml-2">
              {view === 'day' 
                ? currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              }
            </h2>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-xs border border-[#D1C9BD]">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-[11px] font-bold bg-transparent outline-none placeholder:text-slate-400"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-slate-400">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-white px-2.5 py-2 rounded-2xl shadow-xs border border-[#D1C9BD] shrink-0">
              <Filter size={12} className="text-[#1a6645] shrink-0" />
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="text-[10px] font-black uppercase outline-none bg-transparent cursor-pointer max-w-[90px] sm:max-w-none truncate"
              >
                <option value="all">Assignee</option>
                {Array.from(new Set(events.map((e: Lead) => e.assigned_to))).filter(Boolean).map((a: any) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* STATUS LEGEND */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
          {safeStatusOptions.map((s: any) => (
            <div key={s.value} className="flex items-center gap-1.5 bg-white/70 px-2 py-0.5 rounded-full border border-[#D1C9BD]/40 shrink-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: resolveStatusColor(s.color) }} />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-600">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ACTIVE VIEW */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view + currentDate.toISOString() + filterAssignee + searchTerm}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {view === 'month' && (
              <MonthGrid
                currentDate={currentDate}
                eventsByDay={eventsByDay}
                onSelect={onSelectLead}
                onOpenDrawer={(dayStr: string) => setDrawerDay(dayStr)}
                getStatus={getStatusConfig}
              />
            )}
            {view === 'week' && (
              <WeekStrip
                currentDate={currentDate}
                eventsByDay={eventsByDay}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
              />
            )}
            {view === 'day' && (
              <DayDetailView
                currentDate={currentDate}
                eventsByDay={eventsByDay}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
              />
            )}
            {view === 'agenda' && (
              <AgendaListView
                events={filteredEvents}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MOBILE JOB DRAWER */}
      <AnimatePresence>
        {drawerDay && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerDay(null)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-[#faf9f5] h-full shadow-2xl z-10 flex flex-col border-l border-[#D1C9BD]"
            >
              <div className="p-4 border-b border-[#D1C9BD] bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-[#0F1F3D]">
                    {new Date(`${drawerDay}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {activeDrawerEvents.length} Scheduled Job{activeDrawerEvents.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button onClick={() => setDrawerDay(null)} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {activeDrawerEvents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-wider">No jobs on this day</p>
                  </div>
                ) : (
                  activeDrawerEvents.map((job: Lead) => (
                    <JobCard key={job.id} job={job} onSelect={onSelectLead} getStatus={getStatusConfig} />
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SUB-COMPONENTS ──

function ViewTab({ active, onClick, icon: Icon, shortLabel, fullLabel }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${
        active ? 'bg-[#0F1F3D] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon size={12} />
      <span className="sm:hidden">{shortLabel}</span>
      <span className="hidden sm:inline">{fullLabel}</span>
    </button>
  );
}

function JobCard({ 
  job, 
  onSelect, 
  getStatus 
}: { 
  job: Lead; 
  onSelect: (lead: Lead) => void; 
  getStatus: (status: string) => any; 
}) {
  const statusConfig = getStatus(job.job_status || job.status || '');
  const color = resolveStatusColor(statusConfig?.color);
  const time = formatTime12h(job.scheduled_time);

  return (
    <button
      onClick={() => onSelect(job)}
      className="w-full text-left p-3.5 bg-white rounded-xl border border-[#D1C9BD]/70 shadow-xs hover:border-[#1a6645] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full truncate max-w-[130px]"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {statusConfig?.label || 'Scheduled'}
        </span>
        <span className="text-[9px] font-black text-slate-600 flex items-center gap-1 shrink-0">
          <Clock size={10} className="text-[#1a6645]" /> {time}
        </span>
      </div>
      <h4 className="text-xs sm:text-sm font-black text-[#0F1F3D] group-hover:text-[#1a6645] truncate">
        {job.name}
      </h4>
      {job.category && (
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 capitalize truncate">
          {job.category.replace(/_/g, ' ')}
        </p>
      )}
      {(job.assigned_to || job.address_line_1) && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-500">
          {job.assigned_to && (
            <span className="flex items-center gap-1 truncate">
              <User size={10} className="text-[#1a6645]" /> {job.assigned_to}
            </span>
          )}
          {job.address_line_1 && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={10} className="text-[#1a6645]" /> {job.address_line_1}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function MonthGrid({ currentDate, eventsByDay, onSelect, onOpenDrawer, getStatus }: any) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const cells = [
    ...Array(startDay).fill(null), 
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const DAY_LABELS_MOBILE = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const DAY_LABELS_DESKTOP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = dayKey(new Date());

  return (
    <div className="bg-white rounded-2xl border border-[#D1C9BD] shadow-md overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#D1C9BD]/40 bg-[#faf9f5]">
        {DAY_LABELS_DESKTOP.map((d, i) => (
          <div key={d} className="py-2.5 text-center text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">
            <span className="sm:hidden">{DAY_LABELS_MOBILE[i]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 divide-x divide-y divide-[#D1C9BD]/20">
        {cells.map((day, i) => {
          const isNull = !day;
          const cellDate = day ? new Date(year, month, day) : null;
          const dStr = cellDate ? dayKey(cellDate) : '';
          const dayEvents = cellDate ? (eventsByDay[dStr] || []) : [];
          const isToday = todayStr === dStr;

          return (
            <div
              key={i}
              onClick={() => dStr && onOpenDrawer(dStr)}
              className={`min-h-[68px] sm:min-h-[124px] p-1.5 sm:p-2 transition-all flex flex-col justify-between ${
                isNull 
                  ? 'bg-slate-50/30' 
                  : 'bg-white hover:bg-slate-50/80 hover:shadow-[inset_0_0_0_1px_rgba(26,102,69,0.15)] cursor-pointer'
              } ${isToday ? 'bg-emerald-50/40' : ''}`}
            >
              {!isNull && (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded ${
                        isToday ? 'bg-[#1a6645] text-white shadow-xs' : 'text-slate-500'
                      }`}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[8px] font-black text-[#1a6645] bg-emerald-100/80 px-1 rounded-full">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Desktop Detailed Badges */}
                    <div className="hidden sm:flex flex-col gap-1 mt-1">
                      {dayEvents.slice(0, 3).map((e: Lead) => {
                        const color = resolveStatusColor(getStatus(e.job_status || e.status || '').color);
                        return (
                          <button
                            key={e.id}
                            onClick={(evt) => {
                              evt.stopPropagation();
                              onSelect(e);
                            }}
                            className="w-full flex items-center justify-between gap-1 text-[8px] font-semibold px-1.5 py-1 rounded-md border-l-2 truncate text-left transition-all hover:shadow-sm hover:brightness-95"
                            style={{ backgroundColor: `${color}14`, borderColor: color, color }}
                          >
                            <span className="truncate normal-case">{e.name}</span>
                            <span className="text-[7px] opacity-70 shrink-0 ml-1">{formatTime12h(e.scheduled_time)}</span>
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-[7px] font-black text-slate-400 pl-0.5">+{dayEvents.length - 3} more</p>
                      )}
                    </div>

                    {/* Mobile Dot Indicators */}
                    <div className="sm:hidden flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map((e: Lead) => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: resolveStatusColor(getStatus(e.job_status || e.status || '').color) }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekStrip({ currentDate, eventsByDay, onSelect, getStatus }: any) {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); 
    d.setDate(start.getDate() + i); 
    return d;
  });
  const todayStr = dayKey(new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-2.5">
      {weekDays.map((d, i) => {
        const dStr = dayKey(d);
        const dayEvents = eventsByDay[dStr] || [];
        const isToday = todayStr === dStr;

        return (
          <div
            key={i}
            className={`rounded-xl border transition-all overflow-hidden flex flex-col ${
              isToday
                ? 'border-[#1a6645] bg-white shadow-sm ring-1 ring-[#1a6645]'
                : 'border-[#D1C9BD] bg-white/80'
            }`}
          >
            <div className={`px-3 py-1.5 flex lg:flex-col lg:items-start items-center justify-between gap-1 ${
              isToday ? 'bg-[#1a6645] text-white' : 'bg-[#faf9f5] border-b border-[#D1C9BD]/40 text-[#0F1F3D]'
            }`}>
              <span className="text-[11px] font-black uppercase tracking-wider">
                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </span>
              <span className={`text-[8px] font-bold uppercase ${isToday ? 'text-white/80' : 'text-slate-500'}`}>
                {dayEvents.length} Job{dayEvents.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="p-2 space-y-1.5 flex-1">
              {dayEvents.length === 0 ? (
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center py-2 lg:py-4">
                  No Jobs
                </p>
              ) : (
                dayEvents.map((job: Lead) => {
                  const statusConfig = getStatus(job.job_status || job.status || '');
                  const color = resolveStatusColor(statusConfig?.color);
                  return (
                    <button
                      key={job.id}
                      onClick={() => onSelect(job)}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-[#D1C9BD]/60 hover:border-[#1a6645] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-2xs group"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-500">
                          {formatTime12h(job.scheduled_time)}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      </div>
                      <p className="text-[11px] font-black text-[#0F1F3D] group-hover:text-[#1a6645] truncate">
                        {job.name}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayDetailView({ currentDate, eventsByDay, onSelect, getStatus }: any) {
  const dStr = dayKey(currentDate);
  const dayEvents = eventsByDay[dStr] || [];

  return (
    <div className="bg-white rounded-2xl border border-[#D1C9BD] p-4 sm:p-5 shadow-md">
      <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#0F1F3D]">
            {currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            {dayEvents.length} Scheduled Jobs
          </p>
        </div>
      </div>

      {dayEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <CalendarIcon size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs font-black uppercase tracking-widest">No jobs scheduled for today</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {dayEvents.map((job: Lead) => (
            <JobCard key={job.id} job={job} onSelect={onSelect} getStatus={getStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgendaListView({ events, onSelect, getStatus }: any) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a: Lead, b: Lead) => {
      const dateA = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0;
      const dateB = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0;
      return dateA - dateB;
    });
  }, [events]);

  return (
    <div className="bg-white rounded-2xl border border-[#D1C9BD] p-3 sm:p-5 shadow-md">
      <h3 className="text-xs font-black uppercase tracking-widest text-[#0F1F3D] mb-3">
        Upcoming Agenda ({sortedEvents.length})
      </h3>

      {sortedEvents.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <List size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-xs font-black uppercase tracking-widest">No matching scheduled jobs</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((job: Lead) => {
            const statusConfig = getStatus(job.job_status || job.status || '');
            const color = resolveStatusColor(statusConfig?.color);
            const dateDisplay = job.scheduled_date 
              ? new Date(`${job.scheduled_date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'TBD';

            return (
              <div
                key={job.id}
                onClick={() => onSelect(job)}
                className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[#D1C9BD]/60 bg-[#faf9f5] hover:bg-white hover:border-[#1a6645] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="px-2 py-1 bg-[#0F1F3D] text-white rounded-lg text-center shrink-0 min-w-[55px]">
                    <span className="text-[9px] font-black uppercase block">{dateDisplay}</span>
                    <span className="text-[8px] text-slate-300 font-medium block">{formatTime12h(job.scheduled_time)}</span>
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-black text-[#0F1F3D] truncate">{job.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      {job.category?.replace(/_/g, ' ') || 'Service'}
                    </p>
                  </div>
                </div>

                <span
                  className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: `${color}1A`, color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {statusConfig?.label || 'Scheduled'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}