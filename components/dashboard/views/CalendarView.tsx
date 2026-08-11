'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin, CalendarOff } from 'lucide-react';

interface CalendarViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
}

/* Must match COLOR_OPTIONS in the pipeline settings. `indigo` used to be
   #3b82f6 here — the same blue as Scheduled — so Active and Scheduled jobs
   were indistinguishable on the calendar. green and gray were also off-tone
   from every other view. */
const STATUS_HEX: Record<string, string> = {
  blue:   '#3b82f6',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  green:  '#22c55e',
  red:    '#ef4444',
  gray:   '#6b7280',
  indigo: '#6366f1',
  pink:   '#ec4899',
};

const DAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Local YYYY-MM-DD. Never via toISOString(), which shifts to UTC and lands
 *  evening jobs on the wrong day for anyone west of Greenwich. */
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** scheduled_date arrives as a bare date or a full timestamp depending on the
 *  query. Both start with the calendar date, so take the first ten chars
 *  rather than parsing — parsing a bare date treats it as UTC midnight. */
function leadDayKey(lead: any): string | null {
  const raw = lead?.scheduled_date;
  if (!raw) return null;
  const s = String(raw);
  return s.length >= 10 ? s.slice(0, 10) : null;
}

function formatTime12h(timeStr?: string) {
  if (!timeStr || timeStr === 'TBD') return null;
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

/** Minutes since midnight, or a large number so untimed jobs sort last. */
function timeRank(timeStr?: string): number {
  if (!timeStr || timeStr === 'TBD') return 9999;
  const [h, m] = String(timeStr).split(':').map(Number);
  if (Number.isNaN(h)) return 9999;
  return h * 60 + (m || 0);
}

/** Primary assignee plus any additional staff, for display. Handles
 *  additional_assignees arriving as a JSON string or already-parsed array —
 *  JSONB columns come back inconsistently in this codebase. */
function allAssignees(lead: any): string[] {
  const names: string[] = [];
  if (lead?.assigned_to) names.push(lead.assigned_to);
  try {
    const raw = lead?.additional_assignees;
    const extra = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(extra)) names.push(...extra.filter(Boolean));
  } catch {}
  return names;
}

export default function CalendarView({
  leads,
  onSelectLead,
  statusOptions,
  isDark = true,
}: CalendarViewProps) {
  const [cursor, setCursor] = useState(new Date());
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<string | null>(dayKey(new Date()));

  const todayKey = dayKey(new Date());

  const statusFor = (lead: any) => {
    const opt = statusOptions.find((s: any) => s.value === lead.status);
    return {
      hex: opt?.hex || STATUS_HEX[opt?.color] || '#3b82f6',
      label: opt?.label || lead.status || 'New',
    };
  };

  /* Bucketed once and sorted by time. The old version filtered the whole
     lead list per cell — 31 passes over every lead to draw one month — and
     never ordered within a day, so a 7am job could render below a 4pm one. */
  const byDay = useMemo(() => {
    const map: Record<string, any[]> = {};
    leads.forEach((l) => {
      const key = leadDayKey(l);
      if (!key) return;
      (map[key] ||= []).push(l);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => timeRank(a.scheduled_time) - timeRank(b.scheduled_time))
    );
    return map;
  }, [leads]);

  const scheduledCount = useMemo(
    () => leads.filter((l) => leadDayKey(l)).length,
    [leads]
  );

  const unscheduledCount = useMemo(
    () =>
      leads.filter(
        (l) => !leadDayKey(l) && !['completed', 'cancelled', 'lost'].includes(l.status)
      ).length,
    [leads]
  );

  /* Both views render the same flat array of days, so the cell markup and
     the agenda below it are written once rather than duplicated per mode. */
  const { cells, title } = useMemo(() => {
    if (mode === 'week') {
      const start = new Date(cursor);
      start.setDate(cursor.getDate() - cursor.getDay());
      start.setHours(0, 0, 0, 0);
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
      const end = days[6];
      const sameMonth = start.getMonth() === end.getMonth();
      return {
        cells: days.map((d) => ({ date: d, inMonth: true })),
        title: sameMonth
          ? `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()}–${end.getDate()}`
          : `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      };
    }

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: Date; inMonth: boolean }[] = [];
    // Lead-in days from the previous month keep the grid rectangular and give
    // a job on the 1st somewhere to sit visually.
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1].date;
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      days.push({ date: next, inMonth: false });
    }

    return {
      cells: days,
      title: cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };
  }, [cursor, mode]);

  const step = (dir: -1 | 1) => {
    const next = new Date(cursor);
    if (mode === 'week') next.setDate(cursor.getDate() + dir * 7);
    else next.setMonth(cursor.getMonth() + dir, 1);
    setCursor(next);
  };

  const goToday = () => {
    const now = new Date();
    setCursor(now);
    setSelectedDay(dayKey(now));
  };

  const selectedLeads = selectedDay ? byDay[selectedDay] || [] : [];
  const selectedDate = selectedDay ? new Date(`${selectedDay}T12:00:00`) : null;

  // Theme tokens
  const bg = isDark ? 'bg-[#0a0c14]' : 'bg-white';
  const border = isDark ? 'border-white/[0.06]' : 'border-slate-200';
  const headerBg = isDark ? 'bg-white/[0.02]' : 'bg-slate-50';
  const cellHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50';
  const textMuted = isDark ? 'text-white/35' : 'text-slate-400';
  const textDim = isDark ? 'text-white/20' : 'text-slate-300';
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textBody = isDark ? 'text-white/70' : 'text-slate-600';
  const btnHover = isDark
    ? 'hover:bg-white/10 text-white/40 hover:text-white'
    : 'hover:bg-slate-100 text-slate-400 hover:text-slate-900';

  return (
    <div className={`rounded-2xl border overflow-hidden ${bg} ${border} shadow-sm`}>
      {/* ── HEADER ── */}
      <div className={`flex flex-wrap items-center gap-2 px-3 sm:px-5 py-3 border-b ${border} ${headerBg}`}>
        <h3 className={`text-[15px] font-semibold tracking-tight ${textMain} mr-auto`}>{title}</h3>

        {/* Month / week */}
        <div className={`inline-flex rounded-lg overflow-hidden border ${border}`}>
          {(['month', 'week'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                mode === m
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-900 text-white'
                  : `${textMuted} ${cellHover}`
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => step(-1)}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${btnHover}`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToday}
            className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all active:scale-95 ${btnHover}`}
          >
            Today
          </button>
          <button
            onClick={() => step(1)}
            className={`p-1.5 rounded-lg transition-all active:scale-90 ${btnHover}`}
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unscheduled work is invisible on a calendar by definition, but it's
          the thing most worth knowing about when looking at one. */}
      {unscheduledCount > 0 && (
        <div
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 border-b text-[12px] ${border} ${
            isDark ? 'bg-amber-500/5 text-amber-300/80' : 'bg-amber-50 text-amber-800'
          }`}
        >
          <CalendarOff className="w-3.5 h-3.5 shrink-0" />
          {unscheduledCount} open job{unscheduledCount === 1 ? '' : 's'} with no date set
        </div>
      )}

      {/* ── DAY HEADERS ── */}
      <div className={`grid grid-cols-7 border-b ${border}`}>
        {DAYS_FULL.map((d, i) => (
          <div key={d} className={`py-2 text-center font-medium uppercase tracking-wide ${textMuted}`}>
            <span className="hidden sm:inline text-[10px]">{d}</span>
            <span className="sm:hidden text-[10px]">{DAYS_SHORT[i]}</span>
          </div>
        ))}
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-7">
        {cells.map(({ date, inMonth }, i) => {
          const key = dayKey(date);
          const dayLeads = byDay[key] || [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;
          const isLastCol = i % 7 === 6;

          return (
            <button
              key={key}
              onClick={() => setSelectedDay(key)}
              className={`relative text-left min-h-[62px] ${
                mode === 'week' ? 'sm:min-h-[150px]' : 'sm:min-h-[104px]'
              } border-b p-1.5 sm:p-2 transition-colors ${border} ${isLastCol ? '' : 'border-r'} ${cellHover} ${
                !inMonth ? (isDark ? 'bg-white/[0.01]' : 'bg-slate-50/50') : ''
              } ${isSelected ? (isDark ? 'bg-white/[0.06]' : 'bg-slate-100/80') : ''}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-lg text-[11px] font-semibold tabular-nums ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : inMonth
                      ? textMuted
                      : textDim
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayLeads.length > 0 && (
                  <span className={`hidden sm:block text-[10px] font-medium tabular-nums ${textDim}`}>
                    {dayLeads.length}
                  </span>
                )}
              </div>

              {/* Desktop: readable pills. Mobile: dots, since a name won't
                  fit in a 44px-wide cell without truncating to nothing. */}
              <div className="hidden sm:flex flex-col gap-0.5 mt-1">
                {dayLeads.slice(0, mode === 'week' ? 5 : 3).map((lead) => {
                  const { hex } = statusFor(lead);
                  const time = formatTime12h(lead.scheduled_time);
                  return (
                    <span
                      key={lead.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="w-full px-1.5 py-1 rounded-md text-[10px] font-medium truncate transition-all hover:brightness-110 cursor-pointer"
                      style={{ backgroundColor: `${hex}22`, color: hex }}
                    >
                      {time ? `${time} · ` : ''}
                      {lead.name?.split(' ')[0]}
                    </span>
                  );
                })}
                {dayLeads.length > (mode === 'week' ? 5 : 3) && (
                  <span className={`text-[10px] font-medium px-1 ${textDim}`}>
                    +{dayLeads.length - (mode === 'week' ? 5 : 3)} more
                  </span>
                )}
              </div>

              {dayLeads.length > 0 && (
                <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                  {dayLeads.slice(0, 3).map((lead) => (
                    <span
                      key={lead.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusFor(lead).hex }}
                    />
                  ))}
                  {dayLeads.length > 3 && (
                    <span className={`text-[9px] font-medium leading-none ${textDim}`}>
                      +{dayLeads.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── DAY AGENDA ──
           The grid answers "when is everything"; this answers "what am I
           doing that day". On a phone it's the whole point — tapping a dot
           to guess which job it was is not a workflow. */}
      {selectedDate && (
        <div className={`border-t ${border}`}>
          <div className={`px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 ${headerBg}`}>
            <p className={`text-[13px] font-medium ${textMain}`}>
              {selectedDay === todayKey
                ? 'Today'
                : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className={`text-[12px] tabular-nums ${textMuted}`}>
              {selectedLeads.length} job{selectedLeads.length === 1 ? '' : 's'}
            </p>
          </div>

          {selectedLeads.length === 0 ? (
            <p className={`px-3 sm:px-5 py-8 text-center text-[13px] ${textDim}`}>
              Nothing scheduled
            </p>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}`}>
              {selectedLeads.map((lead) => {
                const { hex, label } = statusFor(lead);
                const time = formatTime12h(lead.scheduled_time);
                const address = [lead.address_line_1, lead.city].filter(Boolean).join(', ');
                return (
                  <button
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className={`w-full text-left flex items-start gap-3 px-3 sm:px-5 py-3 transition-colors ${cellHover}`}
                  >
                    <span
                      className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className={`text-[14px] font-medium truncate ${textMain}`}>{lead.name}</p>
                        <span
                          className="shrink-0 text-[11px] font-medium tabular-nums"
                          style={{ color: hex }}
                        >
                          {time || 'No time set'}
                        </span>
                      </div>
                      <div className={`mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] ${textBody}`}>
                        <span className="truncate">{lead.category?.replace(/_/g, ' ') || 'General'}</span>
                        <span className="opacity-60">{label}</span>
                       {allAssignees(lead).length > 0 && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <User className="w-3 h-3 shrink-0" />
                            {allAssignees(lead).join(', ')}
                          </span>
                        )}
                        {address && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {address}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {scheduledCount === 0 && (
        <div className={`px-5 py-10 text-center border-t ${border}`}>
          <Calendar className={`w-7 h-7 mx-auto mb-2 ${textDim}`} />
          <p className={`text-[13px] font-medium ${textMuted}`}>No scheduled jobs yet</p>
          <p className={`text-[12px] mt-0.5 ${textDim}`}>
            Set a date on a job and it&apos;ll show up here.
          </p>
        </div>
      )}
    </div>
  );
}