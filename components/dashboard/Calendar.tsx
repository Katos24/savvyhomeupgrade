'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  CalendarDays, LayoutGrid, ArrowLeft, Filter, User, Clock,
  Briefcase, List, Sun, Moon, X, MapPin, Search, Plus, ChevronDown,
} from 'lucide-react';
import { DEFAULT_STATUSES, stageColorHex } from '@/lib/formCategories';
import AddJobToDayModal from './AddJobToDayModal';

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
  onScheduleJob?: (
    job: { project_id: number; lead_id: number; customer_name: string },
    day: string,
    opts?: { reschedule?: boolean }
  ) => void;
  refreshTrigger?: number;
};

type ViewMode = 'month' | 'week' | 'day' | 'agenda';
type WeekLength = 5 | 7;

// Fallbacks for older color names the shared stage palette doesn't define.
const EXTRA_COLOR_HEX: Record<string, string> = {
  violet: '#7c3aed', amber: '#d97706', coral: '#ea580c', emerald: '#059669', rose: '#e11d48', zinc: '#3f3f46',
};
const resolveStatusColor = (colorName?: string) =>
  stageColorHex(colorName) || EXTRA_COLOR_HEX[colorName || ''] || '#3b82f6';

const ACCENT = '#1a6645';

// Same page colors as Leads and the Dashboard, so the Calendar doesn't look
// like a different app. Light mode was a darker cream before.
function theme(isDark: boolean) {
  return {
    page: isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf9f5] text-[#1c1917]',
    headerBar: isDark ? 'bg-[#0b0f17]/95 border-white/10' : 'bg-[#faf9f5]/95 border-[#e7e2d8]',
    panel: isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white border-[#e7e2d8]',
    control: isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-[#e7e2d8] text-[#292524]',
    subtle: isDark ? 'bg-white/[0.03]' : 'bg-[#faf9f5]',
    divider: isDark ? 'border-white/10' : 'border-[#f0ece1]',
    muted: isDark ? 'text-slate-500' : 'text-[#a8a29e]',
    soft: isDark ? 'text-slate-400' : 'text-[#78716c]',
    strong: isDark ? 'text-white' : 'text-[#1c1917]',
    hover: isDark ? 'hover:bg-white/10' : 'hover:bg-[#f5f1e8]',
    item: isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' : 'bg-white border-[#e7e2d8] hover:bg-[#faf9f5]',
    option: isDark ? 'bg-[#0b0f17]' : '',
  };
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function leadDayKey(lead: Lead): string | null {
  const raw = lead?.scheduled_date;
  if (!raw) return null;
  const s = String(raw);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

// A YYYY-MM-DD key → Date at local noon (avoids any UTC day-shift).
function keyToDate(key: string) {
  return new Date(`${key}T12:00:00`);
}

function formatTime12h(timeStr?: string) {
  if (!timeStr || timeStr === 'TBD') return 'Any time';
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return 'Any time';
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function timeRank(timeStr?: string): number {
  if (!timeStr || timeStr === 'TBD') return 9999;
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return 9999;
  return h * 60 + (m || 0);
}

// Sunday-start for the 7-day week, Monday-start for the 5-day work week.
function weekDates(anchor: Date, length: WeekLength): Date[] {
  const start = new Date(anchor);
  start.setHours(12, 0, 0, 0);
  const dow = start.getDay();
  start.setDate(start.getDate() - (length === 5 ? (dow + 6) % 7 : dow));
  return Array.from({ length }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const shortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function Calendar({ companySlug, onSelectLead, statusOptions, onScheduleJob, refreshTrigger }: CalendarProps) {
  const [events, setEvents] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [weekLength, setWeekLength] = useState<WeekLength>(7);
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [drawerDay, setDrawerDay] = useState<string | null>(null);
  // One "add a job to this day" flow shared by Week, Day, and the Month drawer.
  const [addJobDay, setAddJobDay] = useState<string | null>(null);

  const [isDark, setIsDark] = useState<boolean>(true);
  useEffect(() => {
    try {
      setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
      const savedLen = localStorage.getItem('calendar-week-length');
      if (savedLen === '5' || savedLen === '7') setWeekLength(Number(savedLen) as WeekLength);
      const savedView = localStorage.getItem('calendar-view');
      if (savedView === 'month' || savedView === 'week' || savedView === 'day' || savedView === 'agenda') setView(savedView);
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('dashboard-theme', next ? 'dark' : 'light');
      } catch {}
      window.dispatchEvent(new Event('theme-changed'));
      return next;
    });
  }, []);

  const changeView = useCallback((v: ViewMode) => {
    setView(v);
    try { localStorage.setItem('calendar-view', v); } catch {}
  }, []);

  const changeWeekLength = useCallback((len: WeekLength) => {
    setWeekLength(len);
    try { localStorage.setItem('calendar-week-length', String(len)); } catch {}
  }, []);

  const t = theme(isDark);

  const safeStatusOptions = useMemo(
    () => (statusOptions?.length > 0 ? statusOptions : DEFAULT_STATUSES),
    [statusOptions]
  );

  const fetchScheduledJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/company/${companySlug}/leads?calendarAll=true`);
      const data = await response.json();
      setEvents((data.leads || []).filter((l: Lead) => l.scheduled_date && !l.deleted));
    } catch {
      toast.error('Failed to load the schedule');
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    fetchScheduledJobs();
  }, [fetchScheduledJobs, refreshTrigger]);

  const getStatusConfig = useCallback(
    (status: string) => safeStatusOptions.find((s: any) => s.value === status) || safeStatusOptions[0],
    [safeStatusOptions]
  );

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.filter((e: Lead) => {
      const matchesAssignee = filterAssignee === 'all' || e.assigned_to === filterAssignee;
      const matchesSearch =
        !term ||
        e.name?.toLowerCase().includes(term) ||
        e.category?.toLowerCase().includes(term) ||
        e.address_line_1?.toLowerCase().includes(term);
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
    Object.values(map).forEach((list) => list.sort((a, b) => timeRank(a.scheduled_time) - timeRank(b.scheduled_time)));
    return map;
  }, [filteredEvents]);

  const assignees = useMemo(
    () => Array.from(new Set(events.map((e: Lead) => e.assigned_to))).filter(Boolean) as string[],
    [events]
  );

  const handleNav = useCallback(
    (dir: number) => {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        if (view === 'month') {
          d.setDate(1);
          d.setMonth(d.getMonth() + dir);
        } else if (view === 'week') d.setDate(d.getDate() + dir * 7);
        else if (view === 'day') d.setDate(d.getDate() + dir);
        return d;
      });
    },
    [view]
  );

  const currentWeek = useMemo(() => weekDates(currentDate, weekLength), [currentDate, weekLength]);

  const periodLabel = useMemo(() => {
    if (view === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (view === 'week') {
      const first = currentWeek[0];
      const last = currentWeek[currentWeek.length - 1];
      return first.getMonth() === last.getMonth()
        ? `${first.toLocaleDateString('en-US', { month: 'short' })} ${first.getDate()} – ${last.getDate()}`
        : `${shortDate(first)} – ${shortDate(last)}`;
    }
    if (view === 'agenda') return 'Upcoming';
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [view, currentDate, currentWeek]);

  // Every scheduled job (ignoring the search/assignee filters) so the
  // add-job picker can offer to move one onto another day.
  const scheduledForPicker = useMemo(
    () =>
      events
        .filter((e: Lead) => e.project_id)
        .map((e: Lead) => ({
          project_id: Number(e.project_id),
          lead_id: Number(e.id),
          customer_name: e.name,
          category: e.category ?? null,
          quote_total: e.quote_total ?? null,
          scheduled_date: leadDayKey(e),
          scheduled_time: e.scheduled_time ?? null,
        })),
    [events]
  );

  const activeDrawerEvents = useMemo(() => (drawerDay ? eventsByDay[drawerDay] || [] : []), [drawerDay, eventsByDay]);

  const openAddJob = onScheduleJob ? (day: string) => setAddJobDay(day) : undefined;

  if (loading) {
    return (
      <div className={`flex h-screen w-full items-center justify-center ${t.page}`}>
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-4 border-[#1a6645] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className={`text-xs font-semibold ${t.muted}`}>Loading schedule…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full pb-20 transition-colors ${t.page}`}>

      {/* STICKY HEADER */}
      <nav className={`sticky top-0 z-20 backdrop-blur-md border-b px-3 sm:px-6 py-2.5 sm:py-3.5 ${t.headerBar}`}>
        <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => window.history.back()}
              className={`shrink-0 p-2 rounded-xl border transition ${t.control} ${t.hover}`}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
                <CalendarIcon className="shrink-0" style={{ color: ACCENT }} size={20} />
                Schedule
              </h1>
              <p className={`hidden sm:block text-[11px] font-semibold ${t.muted}`}>
                {filteredEvents.length} scheduled job{filteredEvents.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className={`sm:order-last p-2 rounded-xl border transition ${t.control} ${t.hover}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* View switcher — full width row on phones, inline on larger screens */}
          <div className={`order-last sm:order-none w-full sm:w-auto grid grid-cols-4 sm:flex items-center gap-0.5 p-1 rounded-xl border ${t.control}`}>
            <ViewTab active={view === 'month'} onClick={() => changeView('month')} icon={CalendarDays} label="Month" />
            <ViewTab active={view === 'week'} onClick={() => changeView('week')} icon={LayoutGrid} label="Week" />
            <ViewTab active={view === 'day'} onClick={() => changeView('day')} icon={Sun} label="Day" />
            <ViewTab active={view === 'agenda'} onClick={() => changeView('agenda')} icon={List} label="List" />
          </div>
        </div>
      </nav>

      <main className="w-full px-3 sm:px-6 mt-3 sm:mt-5 max-w-7xl mx-auto space-y-3">

        {/* CONTROLS BAR */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          {/* Date navigator */}
          <div className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl border ${t.control}`}>
            <div className="flex items-center gap-1">
              {view !== 'agenda' && (
                <button onClick={() => handleNav(-1)} className={`p-2 rounded-lg transition ${t.hover}`} aria-label="Previous">
                  <ChevronLeft size={18} />
                </button>
              )}
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Today
              </button>
              {view !== 'agenda' && (
                <button onClick={() => handleNav(1)} className={`p-2 rounded-lg transition ${t.hover}`} aria-label="Next">
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
            <h2 className="text-sm font-bold truncate text-right pr-1">{periodLabel}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* 5-day / 7-day — only meaningful in Week view */}
            {view === 'week' && (
              <label className={`relative flex items-center shrink-0 rounded-xl border ${t.control}`}>
                <select
                  value={weekLength}
                  onChange={(e) => changeWeekLength(Number(e.target.value) as WeekLength)}
                  className="appearance-none bg-transparent pl-3 pr-7 py-2 text-xs font-bold outline-none cursor-pointer"
                  aria-label="Days shown in week view"
                >
                  <option value={7} className={t.option}>7-day week</option>
                  <option value={5} className={t.option}>Mon–Fri</option>
                </select>
                <ChevronDown size={14} className={`pointer-events-none absolute right-2 ${t.muted}`} />
              </label>
            )}

            {/* Search */}
            <div className={`flex-1 min-w-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border ${t.control}`}>
              <Search size={14} className={`shrink-0 ${t.muted}`} />
              <input
                type="text"
                placeholder="Search jobs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full min-w-0 text-xs font-medium bg-transparent outline-none ${isDark ? 'placeholder:text-slate-500' : 'placeholder:text-[#a8a29e]'}`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className={t.muted} aria-label="Clear search">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Assignee filter */}
            {assignees.length > 0 && (
              <label className={`relative flex items-center gap-1 pl-2.5 shrink-0 rounded-xl border ${t.control}`}>
                <Filter size={13} className="shrink-0" style={{ color: ACCENT }} />
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="appearance-none bg-transparent pr-7 py-2 text-xs font-bold outline-none cursor-pointer max-w-[110px] sm:max-w-[160px] truncate"
                  aria-label="Filter by assignee"
                >
                  <option value="all" className={t.option}>Everyone</option>
                  {assignees.map((a) => (
                    <option key={a} value={a} className={t.option}>{a}</option>
                  ))}
                </select>
                <ChevronDown size={14} className={`pointer-events-none absolute right-2 ${t.muted}`} />
              </label>
            )}
          </div>
        </div>

        {/* STATUS LEGEND */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {safeStatusOptions.map((s: any) => (
            <div key={s.value} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0 ${t.control}`}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: resolveStatusColor(s.color) }} />
              <span className={`text-[10px] font-semibold ${t.soft}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ACTIVE VIEW */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${view}-${weekLength}-${dayKey(currentDate)}`}
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
                onOpenDrawer={setDrawerDay}
                getStatus={getStatusConfig}
                isDark={isDark}
              />
            )}
            {view === 'week' && (
              <WeekStrip
                days={currentWeek}
                eventsByDay={eventsByDay}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
                onAddJob={openAddJob}
                isDark={isDark}
              />
            )}
            {view === 'day' && (
              <DayDetailView
                currentDate={currentDate}
                eventsByDay={eventsByDay}
                onSelect={onSelectLead}
                getStatus={getStatusConfig}
                onAddJob={openAddJob}
                isDark={isDark}
              />
            )}
            {view === 'agenda' && (
              <AgendaListView events={filteredEvents} onSelect={onSelectLead} getStatus={getStatusConfig} isDark={isDark} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* DAY DRAWER (from Month view) */}
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
              className={`relative w-full max-w-sm h-full shadow-2xl z-10 flex flex-col border-l ${
                isDark ? 'bg-[#0b0f17] border-white/10' : 'bg-[#faf9f5] border-[#e7e2d8]'
              }`}
            >
              <div className={`p-4 border-b flex items-center justify-between gap-2 ${t.divider}`}>
                <div className="min-w-0">
                  <h3 className={`text-base font-bold truncate ${t.strong}`}>
                    {keyToDate(drawerDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className={`text-xs font-medium mt-0.5 ${t.muted}`}>
                    {activeDrawerEvents.length} scheduled job{activeDrawerEvents.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button onClick={() => setDrawerDay(null)} className={`p-1.5 rounded-full ${t.hover} ${t.soft}`} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {activeDrawerEvents.length === 0 ? (
                  <div className={`py-10 text-center ${t.muted}`}>
                    <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No jobs this day</p>
                  </div>
                ) : (
                  activeDrawerEvents.map((job: Lead) => (
                    <JobCard key={job.id} job={job} onSelect={onSelectLead} getStatus={getStatusConfig} isDark={isDark} />
                  ))
                )}
                {openAddJob && <AddJobButton onClick={() => openAddJob(drawerDay as string)} isDark={isDark} />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD JOB TO DAY MODAL — shared by Week, Day, and the Month drawer */}
      {addJobDay && onScheduleJob && (
        <AddJobToDayModal
          isOpen={true}
          onClose={() => setAddJobDay(null)}
          companySlug={companySlug}
          dayLabel={keyToDate(addJobDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          targetDay={addJobDay}
          scheduledJobs={scheduledForPicker}
          onPick={(job: any, opts?: { reschedule?: boolean }) => {
            const day = addJobDay as string;
            setAddJobDay(null);
            setDrawerDay(null);
            onScheduleJob(job, day, opts);
          }}
        />
      )}
    </div>
  );
}

// ── SUB-COMPONENTS ──

const ViewTab = memo(function ViewTab({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all ${
        active ? 'text-white shadow-xs' : 'opacity-60 hover:opacity-100'
      }`}
      style={active ? { backgroundColor: ACCENT } : undefined}
    >
      <Icon size={13} />
      {label}
    </button>
  );
});

// Dashed "+ Add job" button that lives inside a day's box.
const AddJobButton = memo(function AddJobButton({ onClick, isDark, compact }: { onClick: () => void; isDark: boolean; compact?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full flex items-center justify-center gap-1 rounded-lg border border-dashed font-semibold transition ${
        compact ? 'py-1.5 text-[11px]' : 'py-2.5 text-xs'
      } ${
        isDark
          ? 'border-white/15 text-slate-400 hover:border-[#1a6645] hover:text-emerald-400 hover:bg-emerald-500/5'
          : 'border-[#d6cfc2] text-[#78716c] hover:border-[#1a6645] hover:text-[#1a6645] hover:bg-emerald-50/60'
      }`}
    >
      <Plus size={13} strokeWidth={2.5} /> Add job
    </button>
  );
});

const JobCard = memo(function JobCard({
  job,
  onSelect,
  getStatus,
  isDark,
}: {
  job: Lead;
  onSelect: (lead: Lead) => void;
  getStatus: (status: string) => any;
  isDark: boolean;
}) {
  const t = theme(isDark);
  const statusConfig = getStatus(job.job_status || job.status || '');
  const color = resolveStatusColor(statusConfig?.color);

  return (
    <button
      onClick={() => onSelect(job)}
      className={`w-full text-left p-3.5 rounded-xl border transition-all hover:border-[#1a6645] hover:shadow-sm group ${t.item}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-[150px]"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {statusConfig?.label || 'Scheduled'}
        </span>
        <span className={`text-[11px] font-semibold flex items-center gap-1 shrink-0 ${t.soft}`}>
          <Clock size={11} style={{ color: ACCENT }} /> {formatTime12h(job.scheduled_time)}
        </span>
      </div>
      <h4 className={`text-sm font-bold truncate group-hover:text-[#1a6645] ${t.strong}`}>{job.name}</h4>
      {job.category && <p className={`text-[11px] font-medium mt-0.5 capitalize truncate ${t.muted}`}>{job.category.replace(/_/g, ' ')}</p>}
      {(job.assigned_to || job.address_line_1) && (
        <div className={`mt-2 pt-2 border-t flex flex-wrap gap-x-3 gap-y-1 text-[11px] ${t.divider} ${t.soft}`}>
          {job.assigned_to && (
            <span className="flex items-center gap-1 truncate">
              <User size={11} style={{ color: ACCENT }} /> {job.assigned_to}
            </span>
          )}
          {job.address_line_1 && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} style={{ color: ACCENT }} /> {job.address_line_1}
            </span>
          )}
        </div>
      )}
    </button>
  );
});

const MonthGrid = memo(function MonthGrid({ currentDate, eventsByDay, onSelect, onOpenDrawer, getStatus, isDark }: any) {
  const t = theme(isDark);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const cells = useMemo(
    () => [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [startDay, daysInMonth]
  );

  const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStr = dayKey(new Date());

  return (
    <div className={`rounded-2xl border overflow-hidden ${t.panel}`}>
      <div className={`grid grid-cols-7 border-b ${t.divider} ${t.subtle}`}>
        {LABELS.map((d) => (
          <div key={d} className={`py-2 text-center text-[10px] sm:text-[11px] font-bold ${t.muted}`}>
            <span className="sm:hidden">{d.charAt(0)}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-7 divide-x divide-y ${isDark ? 'divide-white/10' : 'divide-[#f0ece1]'}`}>
        {cells.map((day, i) => {
          const cellDate = day ? new Date(year, month, day) : null;
          const dStr = cellDate ? dayKey(cellDate) : '';
          const dayEvents: Lead[] = cellDate ? eventsByDay[dStr] || [] : [];
          const isToday = todayStr === dStr;

          const cellBg = !day
            ? isDark ? 'bg-white/[0.02]' : 'bg-[#faf9f5]/60'
            : isToday
            ? isDark ? 'bg-emerald-500/10 cursor-pointer' : 'bg-emerald-50/60 cursor-pointer'
            : `cursor-pointer ${t.hover}`;

          return (
            <div
              key={i}
              onClick={() => dStr && onOpenDrawer(dStr)}
              className={`min-h-[64px] sm:min-h-[120px] p-1 sm:p-2 transition-colors ${cellBg}`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday ? 'text-white' : t.soft
                      }`}
                      style={isToday ? { backgroundColor: ACCENT } : undefined}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className={`hidden sm:inline text-[10px] font-bold px-1.5 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-[#1a6645]'}`}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Desktop: job names */}
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
                          className="w-full flex items-center justify-between gap-1 text-[10px] font-semibold px-1.5 py-1 rounded-md border-l-2 truncate text-left hover:brightness-95"
                          style={{ backgroundColor: `${color}14`, borderColor: color, color }}
                        >
                          <span className="truncate">{e.name}</span>
                          <span className="text-[9px] opacity-75 shrink-0">{e.scheduled_time ? formatTime12h(e.scheduled_time) : ''}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && <p className={`text-[10px] font-semibold pl-0.5 ${t.muted}`}>+{dayEvents.length - 3} more</p>}
                  </div>

                  {/* Mobile: count dots */}
                  {dayEvents.length > 0 && (
                    <div className="sm:hidden flex flex-wrap gap-0.5 mt-1 justify-center">
                      {dayEvents.slice(0, 3).map((e: Lead) => (
                        <span
                          key={e.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: resolveStatusColor(getStatus(e.job_status || e.status || '').color) }}
                        />
                      ))}
                      {dayEvents.length > 3 && <span className={`text-[8px] font-bold leading-none ${t.muted}`}>+</span>}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

const WeekStrip = memo(function WeekStrip({ days, eventsByDay, onSelect, getStatus, onAddJob, isDark }: any) {
  const t = theme(isDark);
  const todayStr = dayKey(new Date());
  const cols = days.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-7';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${cols} gap-2.5`}>
      {days.map((d: Date) => {
        const dStr = dayKey(d);
        const dayEvents: Lead[] = eventsByDay[dStr] || [];
        const isToday = todayStr === dStr;

        return (
          <div
            key={dStr}
            className={`rounded-xl border overflow-hidden flex flex-col lg:min-h-[280px] ${t.panel} ${
              isToday ? 'ring-2 ring-[#1a6645] border-transparent' : ''
            }`}
          >
            {/* Date header — date and count only */}
            <div
              className={`px-3 py-2 flex items-center justify-between gap-2 border-b ${
                isToday ? 'text-white border-transparent' : `${t.divider} ${t.subtle}`
              }`}
              style={isToday ? { backgroundColor: ACCENT } : undefined}
            >
              <span className={`text-xs font-bold ${isToday ? '' : t.strong}`}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}{' '}
                <span className={isToday ? 'text-white/85' : t.soft}>{shortDate(d)}</span>
              </span>
              {dayEvents.length > 0 && (
                <span className={`text-[10px] font-semibold ${isToday ? 'text-white/85' : t.muted}`}>
                  {dayEvents.length} job{dayEvents.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {/* Jobs + Add job inside the box */}
            <div className="p-2 space-y-1.5 flex-1 flex flex-col">
              {dayEvents.length === 0 && (
                <p className={`text-[11px] font-medium text-center py-1.5 lg:py-3 ${t.muted}`}>No jobs</p>
              )}
              {dayEvents.map((job: Lead) => {
                const statusConfig = getStatus(job.job_status || job.status || '');
                const color = resolveStatusColor(statusConfig?.color);
                return (
                  <button
                    key={job.id}
                    onClick={() => onSelect(job)}
                    className={`w-full text-left p-2.5 rounded-lg border-l-[3px] border transition hover:shadow-sm group ${t.item}`}
                    style={{ borderLeftColor: color }}
                  >
                    <div className={`text-[10px] font-semibold ${t.soft}`}>{formatTime12h(job.scheduled_time)}</div>
                    <p className={`text-xs font-bold truncate group-hover:text-[#1a6645] ${t.strong}`}>{job.name}</p>
                    {job.assigned_to && <p className={`text-[10px] truncate ${t.muted}`}>{job.assigned_to}</p>}
                  </button>
                );
              })}
              {onAddJob && (
                <div className="mt-auto pt-1">
                  <AddJobButton onClick={() => onAddJob(dStr)} isDark={isDark} compact />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

const DayDetailView = memo(function DayDetailView({ currentDate, eventsByDay, onSelect, getStatus, onAddJob, isDark }: any) {
  const t = theme(isDark);
  const dStr = dayKey(currentDate);
  const dayEvents: Lead[] = eventsByDay[dStr] || [];
  const isToday = dStr === dayKey(new Date());

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${t.panel}`}>
      <div className={`mb-4 pb-3 border-b ${t.divider}`}>
        <h3 className={`text-base sm:text-lg font-bold ${t.strong}`}>
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <p className={`text-xs font-medium mt-0.5 ${t.muted}`}>
          {dayEvents.length} scheduled job{dayEvents.length === 1 ? '' : 's'}
        </p>
      </div>

      {dayEvents.length === 0 ? (
        <div className={`py-10 text-center ${t.muted}`}>
          <CalendarIcon size={30} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">{isToday ? 'Nothing scheduled today' : 'Nothing scheduled this day'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {dayEvents.map((job: Lead) => (
            <JobCard key={job.id} job={job} onSelect={onSelect} getStatus={getStatus} isDark={isDark} />
          ))}
        </div>
      )}

      {onAddJob && (
        <div className="mt-3 sm:max-w-xs">
          <AddJobButton onClick={() => onAddJob(dStr)} isDark={isDark} />
        </div>
      )}
    </div>
  );
});

const AgendaListView = memo(function AgendaListView({ events, onSelect, getStatus, isDark }: any) {
  const t = theme(isDark);

  // Upcoming jobs grouped by day, so a long list is easy to scan.
  const groups = useMemo(() => {
    const todayStr = dayKey(new Date());
    const upcoming = events
      .filter((a: Lead) => {
        const k = leadDayKey(a);
        return k && k >= todayStr;
      })
      .sort((a: Lead, b: Lead) => {
        const byDay = String(leadDayKey(a)).localeCompare(String(leadDayKey(b)));
        return byDay !== 0 ? byDay : timeRank(a.scheduled_time) - timeRank(b.scheduled_time);
      });
    const map = new Map<string, Lead[]>();
    upcoming.forEach((e: Lead) => {
      const k = leadDayKey(e)!;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  const total = groups.reduce((n, [, list]) => n + list.length, 0);
  const todayStr = dayKey(new Date());

  return (
    <div className={`rounded-2xl border p-3 sm:p-5 ${t.panel}`}>
      <h3 className={`text-sm font-bold mb-3 ${t.strong}`}>Upcoming jobs ({total})</h3>

      {total === 0 ? (
        <div className={`py-10 text-center ${t.muted}`}>
          <List size={30} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No upcoming jobs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map(([k, list]) => (
            <div key={k}>
              <p className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${k === todayStr ? 'text-[#1a6645]' : t.muted}`}>
                {k === todayStr ? 'Today · ' : ''}
                {keyToDate(k).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <div className="space-y-1.5">
                {list.map((job: Lead) => {
                  const statusConfig = getStatus(job.job_status || job.status || '');
                  const color = resolveStatusColor(statusConfig?.color);
                  return (
                    <button
                      key={job.id}
                      onClick={() => onSelect(job)}
                      className={`w-full flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition hover:border-[#1a6645] ${t.item}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[11px] font-bold shrink-0 w-16 ${t.soft}`}>{formatTime12h(job.scheduled_time)}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${t.strong}`}>{job.name}</p>
                          <p className={`text-[11px] truncate capitalize ${t.muted}`}>
                            {job.category?.replace(/_/g, ' ') || 'Service'}
                            {job.assigned_to ? ` · ${job.assigned_to}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: `${color}1A`, color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {statusConfig?.label || 'Scheduled'}
                      </span>
                      <span className="sm:hidden w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});