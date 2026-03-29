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
    <div className="flex h-screen items-center justify-center bg-[#F2EDE4]">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1a6645] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Master Schedule</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2EDE4] text-[#0F1F3D] pb-20">
      {/* --- HEADER --- */}
      <nav className="sticky top-0 z-50 bg-[#F2EDE4]/80 backdrop-blur-md px-6 py-6 border-b border-[#D1C9BD]/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => window.history.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-[#D1C9BD] hover:scale-105 transition-transform">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                <CalendarIcon className="text-[#1a6645]" /> Schedule
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operations Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/50 p-1.5 rounded-[2rem] border border-[#D1C9BD] shadow-inner self-center">
            <ViewTab active={view === 'week'} onClick={() => setView('week')} icon={LayoutGrid} label="Week" />
            <ViewTab active={view === 'month'} onClick={() => setView('month')} icon={CalendarDays} label="Month" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        {/* --- CONTROLS --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-[2.5rem] shadow-xl border border-[#D1C9BD] flex-1 justify-between">
            <button onClick={() => handleNav(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft /></button>
            <h2 className="text-sm font-black uppercase tracking-[0.2em]">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => handleNav(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight /></button>
          </div>

          <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-[2.5rem] shadow-xl border border-[#D1C9BD]">
            <Filter size={14} className="text-[#1a6645]" />
            <select 
              value={filterAssignee} 
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-[11px] font-black uppercase outline-none bg-transparent min-w-[140px]"
            >
              <option value="all">Every Assignee</option>
              {Array.from(new Set(events.map(e => e.assigned_to))).filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          
          <button onClick={() => setCurrentDate(new Date())} className="px-10 py-4 bg-[#0F1F3D] text-white rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-[#1a6645] transition-all active:scale-95 shadow-lg">Today</button>
        </div>

        {/* --- VIEWS --- */}
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
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#0F1F3D] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

function MonthGrid({ currentDate, events, onSelect, getStatus }: any) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  
  return (
    <div className="bg-white rounded-[3rem] border border-[#D1C9BD] shadow-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/20 border-r border-b border-slate-50" />;
          
          const dStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
          const dayEvents = events.filter((e: any) => e.scheduled_date?.split('T')[0] === dStr);
          const isToday = new Date().toISOString().split('T')[0] === dStr;

          return (
            <div key={day} className={`min-h-[140px] p-2 border-r border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${isToday ? 'bg-blue-50/30' : ''}`}>
              <div className="mb-2">
                <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-lg ${isToday ? 'bg-[#1a6645] text-white shadow-md' : 'text-slate-300'}`}>{day}</span>
              </div>
              <div className="space-y-1">
                {dayEvents.map((e: any) => (
                  <button 
                    key={e.id} 
                    onClick={() => onSelect(e)}
                    className="w-full text-[8px] font-black p-1.5 rounded-md border border-black/5 text-white uppercase truncate text-left shadow-sm hover:brightness-110 active:scale-95 transition-all"
                    style={{ backgroundColor: getStatus(e.job_status || e.status).color === 'green' ? '#1a6645' : '#3b82f6' }}
                  >
                    {e.name}
                  </button>
                ))}
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
    <div className="space-y-8">
      {weekDays.map((d, i) => {
        const dStr = d.toISOString().split('T')[0];
        const dayEvents = events.filter((e: any) => e.scheduled_date?.split('T')[0] === dStr);
        const isToday = new Date().toISOString().split('T')[0] === dStr;

        return (
          <div key={i} className={`group relative rounded-[3rem] border transition-all overflow-hidden ${isToday ? 'border-[#1a6645] bg-white shadow-2xl scale-[1.02] z-10' : 'border-[#D1C9BD] bg-white/60 shadow-md'}`}>
            <div className={`px-10 py-6 flex justify-between items-center ${isToday ? 'bg-[#1a6645] text-white' : 'bg-white border-b border-[#D1C9BD]/30 text-[#0F1F3D]'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{d.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                <h3 className="text-3xl font-black italic tracking-tighter">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
              </div>
              {isToday && <div className="flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full border border-white/30 backdrop-blur-md"><CheckCircle2 size={14} /><span className="text-[10px] font-black uppercase">Active Today</span></div>}
            </div>
            
            <div className="p-10">
              {dayEvents.length === 0 ? (
                <div className="py-10 text-center opacity-20"><Briefcase size={40} className="mx-auto mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">No Jobs Scheduled</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayEvents.map((e: any) => (
                    <button 
                      key={e.id} 
                      onClick={() => onSelect(e)}
                      className="flex flex-col p-8 rounded-[2.5rem] bg-white border border-[#D1C9BD]/50 hover:border-[#1a6645] hover:shadow-2xl transition-all group/card relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover/card:opacity-100 transition-opacity"><ChevronRight /></div>
                      <div className="w-12 h-1.5 rounded-full mb-6" style={{ background: getStatus(e.job_status || e.status).color === 'green' ? '#1a6645' : '#3b82f6' }} />
                      <h4 className="text-xl font-black tracking-tight mb-6">{e.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic"><Clock size={14} className="text-[#1a6645]" /> {e.scheduled_time || 'TBD'}</div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 italic"><User size={14} className="text-[#1a6645]" /> {e.assigned_to || 'Unassigned'}</div>
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