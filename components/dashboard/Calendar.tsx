'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  List, CalendarDays, LayoutGrid, ArrowLeft, Filter, User, Clock,
  Briefcase, Phone, Mail, MapPin
} from 'lucide-react';

type CalendarProps = {
  companySlug: string;
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
};

type CalendarEvent = {
  id: number;
  name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  job_status: string;
  assigned_to: string;
  category: string;
  phone: string;
  email: string;
  is_pending?: boolean;
};

export default function Calendar({ companySlug, onSelectLead, statusOptions }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const DEFAULT_STATUSES = [
    { value: 'new', label: 'New', color: 'blue', emoji: '🆕' },
    { value: 'contacted', label: 'Contacted', color: 'yellow', emoji: '📞' },
    { value: 'quoted', label: 'Quoted', color: 'purple', emoji: '💰' },
    { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
    { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
  ];

  const safeStatusOptions = statusOptions?.length > 0 ? statusOptions : DEFAULT_STATUSES;

  // Extract unique assignees for the filter dropdown
  const assignees = useMemo(() => {
    const names = new Set<string>();
    events.forEach(e => { if (e.assigned_to) names.add(e.assigned_to); });
    return Array.from(names).sort();
  }, [events]);

  // Filtered Events logic
  const filteredEvents = useMemo(() => {
    if (filterAssignee === 'all') return events;
    return events.filter(e => e.assigned_to === filterAssignee);
  }, [events, filterAssignee]);

  const getStatusColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7',
      orange: '#f97316', green: '#22c55e', red: '#ef4444',
      gray: '#6b7280', indigo: '#6366f1',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  const getStatusConfig = (statusValue: string) => {
    return safeStatusOptions.find((s: any) => s.value === statusValue) || safeStatusOptions[0];
  };

  useEffect(() => {
    fetchScheduledJobs();
  }, [companySlug]);

  async function fetchScheduledJobs() {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads`);
      const data = await response.json();
      const scheduledLeads = (data.leads || []).filter((lead: any) => {
        return lead.scheduled_date && lead.scheduled_date.trim() !== '' && !lead.deleted;
      });
      setEvents(scheduledLeads);
    } catch (error) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="font-black uppercase tracking-widest text-[10px]">Syncing Schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden bg-slate-50 min-h-screen">
      {/* ── MODERN STICKY HEADER ── */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a href={`/${companySlug}/dashboard`} className="p-2.5 hover:bg-slate-100 rounded-2xl transition border border-slate-200 shadow-sm bg-white">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </a>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-2 uppercase">
                  <CalendarIcon className="w-6 h-6 text-blue-600" /> 
                  Schedule
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Job & Team Management</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <TabBtn active={view === 'list'} onClick={() => setView('list')} icon={List} label="List" />
              <TabBtn active={view === 'week'} onClick={() => setView('week')} icon={LayoutGrid} label="Week" />
              <TabBtn active={view === 'month'} onClick={() => setView('month')} icon={CalendarDays} label="Month" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center justify-between flex-1 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - (view === 'month' ? 1 : 0))))} 
                className="p-2 hover:bg-slate-50 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + (view === 'month' ? 1 : 0))))} 
                className="p-2 hover:bg-slate-50 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="text-xs font-black uppercase bg-transparent outline-none text-slate-600 cursor-pointer min-w-[120px]"
              >
                <option value="all">Every Assignee</option>
                {assignees.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            
            <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-blue-200">Today</button>
          </div>
        </div>
      </div>

      {/* ── VIEW RENDERING ── */}
      <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            getEventsForDate={(date: Date) => filteredEvents.filter(e => e.scheduled_date?.split('T')[0] === date.toISOString().split('T')[0])} 
            getStatusConfig={getStatusConfig} 
            getStatusColorHex={getStatusColorHex}
            onSelectLead={onSelectLead}
            formatTime={formatTime}
          />
        )}
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            getEventsForDate={(date: Date) => filteredEvents.filter(e => e.scheduled_date?.split('T')[0] === date.toISOString().split('T')[0])} 
            getStatusConfig={getStatusConfig} 
            getStatusColorHex={getStatusColorHex}
            onSelectLead={onSelectLead}
            formatTime={formatTime}
          />
        )}
        {view === 'list' && (
          <ListView 
            events={filteredEvents} 
            getStatusConfig={getStatusConfig} 
            getStatusColorHex={getStatusColorHex}
            onSelectLead={onSelectLead}
            formatTime={formatTime}
          />
        )}
      </div>
    </div>
  );
}

// ── SUBCOMPONENTS ──

function TabBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> 
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function MonthView({ currentDate, getEventsForDate, getStatusConfig, getStatusColorHex, onSelectLead, formatTime }: any) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-2xl">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {dayNames.map(d => <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/20 border-b border-r border-slate-50" />;
          
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const evs = getEventsForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={day} className={`min-h-[120px] border-b border-r border-slate-100 p-2 transition-all ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black ${isToday ? 'bg-blue-600 text-white px-2 py-0.5 rounded-lg shadow-md' : 'text-slate-400'}`}>{day}</span>
                {evs.length > 0 && <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
              </div>
              <div className="space-y-1">
                {evs.map((e: any) => {
                  const color = getStatusColorHex(getStatusConfig(e.job_status || e.status).color);
                  return (
                    <button 
                      key={e.id} 
                      onClick={() => onSelectLead(e)}
                      className="w-full text-left p-1.5 rounded-xl border text-white shadow-sm transition hover:scale-[1.03] active:scale-95 group relative"
                      style={{ backgroundColor: color, borderColor: color }}
                    >
                      <p className="text-[9px] font-black truncate leading-tight uppercase">{e.name}</p>
                      {e.is_pending && <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full ring-2 ring-red-500" title="Pending Invite" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, getEventsForDate, getStatusConfig, getStatusColorHex, onSelectLead, formatTime }: any) {
  const start = new Date(currentDate);
  start.setDate(currentDate.getDate() - currentDate.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(start.getDate() + i); return d;
  });

  return (
    <div className="space-y-6">
      {days.map((d, i) => {
        const evs = getEventsForDate(d);
        const isToday = new Date().toDateString() === d.toDateString();
        
        return (
          <div key={i} className={`rounded-[2.5rem] border-2 transition-all overflow-hidden ${isToday ? 'border-blue-500 bg-white shadow-2xl' : 'border-slate-100 bg-white shadow-sm'}`}>
            <div className={`px-8 py-4 border-b flex justify-between items-center ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-900'}`}>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{d.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                 <h3 className="text-2xl font-black italic">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
               </div>
               {isToday && <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 backdrop-blur-md">Active Today</span>}
            </div>
            <div className="p-4 sm:p-8">
              {evs.length === 0 ? (
                <div className="text-center py-10 opacity-20"><Briefcase className="w-12 h-12 mx-auto mb-2" /><p className="text-xs font-black uppercase">Open Availability</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evs.map((e: any) => {
                    const color = getStatusColorHex(getStatusConfig(e.job_status || e.status).color);
                    return (
                      <button 
                        key={e.id} 
                        onClick={() => onSelectLead(e)}
                        className="group flex items-center gap-6 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative"
                      >
                        <div className="w-2 h-12 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: color }} />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-black text-slate-900 text-lg tracking-tight">{e.name}</h4>
                            {e.is_pending && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase ring-1 ring-amber-200">Pending</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-y-2 mt-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic">
                               <Clock className="w-3 h-3 text-blue-500" /> {formatTime(e.scheduled_time)}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic">
                               <User className="w-3 h-3 text-indigo-500" /> {e.assigned_to || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ events, getStatusConfig, getStatusColorHex, onSelectLead, formatTime }: any) {
  if (events.length === 0) return <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching jobs found</p></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((e: any) => {
        const config = getStatusConfig(e.job_status || e.status);
        const color = getStatusColorHex(config.color);
        return (
          <button 
            key={e.id}
            onClick={() => onSelectLead(e)}
            className="group relative bg-white border border-slate-200 p-8 rounded-[3rem] text-left hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl" style={{ backgroundColor: color }}>
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Job Label</p>
                <div className="mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ color: color, backgroundColor: `${color}15` }}>
                  {config.label}
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-tight mb-2 group-hover:text-blue-600 transition-colors">
              {e.name}
            </h3>
            
            <div className="space-y-3 mt-6">
               <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {new Date(e.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </div>
               <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {formatTime(e.scheduled_time)}
               </div>
               <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
                  <User className="w-4 h-4 text-slate-400" />
                  {e.assigned_to || 'Assignee Required'}
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-900 uppercase italic">View Details</span>
               <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                 <ChevronRight className="w-4 h-4" />
               </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}