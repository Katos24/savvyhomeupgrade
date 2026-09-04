'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Check, Loader2, CheckCircle2, User, CalendarDays, Clock } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, endTime: string | undefined, assignees: string[]) => void;
  companySlug: string;
  currentScheduledDate?: string;
  currentScheduledTime?: string;
  currentScheduledEndTime?: string;
  selectedAssignees?: string[];
  teamMembers?: any[];
  /** Excludes this LEAD from the month grid's "any job that day" dots —
   *  a different id space from currentProjectId below. */
  currentLeadId?: number;
  /** Excludes this PROJECT from the per-assignee availability check. */
  currentProjectId?: number;
  bufferMinutes?: number;
  showEndTime?: boolean;
  /** Which tab to land on when the modal opens — set from which of the
   *  three page-level badges (Date/Time/Assignee) was actually clicked,
   *  instead of always resetting to Date regardless of intent. */
  initialStep?: 'date' | 'time' | 'people';
};

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const STEPS = ['date', 'time', 'people'] as const;
type Step = typeof STEPS[number];
const STEP_LABELS: Record<Step, string> = { date: 'Date', time: 'Time', people: 'People' };
const STEP_ICONS: Record<Step, any> = { date: CalendarDays, time: Clock, people: User };

const formatCategoryLabel = (value?: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}${m === 0 ? '' : ':' + String(m).padStart(2, '0')}${ampm}`;
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Slide direction is tracked explicitly (not inferred from step order) so
// clicking backward through the step pills slides the opposite way from
// advancing forward — a plain step-index diff alone doesn't capture that.
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function SchedulingCalendarModal({
  isOpen,
  onClose,
  onConfirm,
  companySlug,
  currentScheduledDate,
  currentScheduledTime,
  currentScheduledEndTime,
  selectedAssignees = [],
  teamMembers = [],
  currentLeadId,
  currentProjectId,
  bufferMinutes = 0,
  showEndTime = false,
  initialStep,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>('date');
  const [direction, setDirection] = useState(1);

  const [localAssignees, setLocalAssignees] = useState<string[]>(selectedAssignees);
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [assigneeAvailability, setAssigneeAvailability] = useState<
    Record<string, { available: boolean; conflict: { customer_name?: string; category?: string } | null }>
  >({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const goToStep = (target: Step) => {
    setDirection(STEPS.indexOf(target) > stepIndex ? 1 : -1);
    setStep(target);
  };

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/company/${companySlug}/leads`)
      .then(r => r.json())
     .then(data => {
        const jobs = (data.leads || []).filter((l: any) =>
          l.scheduled_date && !l.deleted && l.id !== currentLeadId
        ).map((l: any) => {
          let extra: string[] = [];
          try {
            const raw = l.additional_assignees;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            extra = Array.isArray(parsed) ? parsed : [];
          } catch {}
          return { ...l, all_assignees: [l.assigned_to, ...extra].filter(Boolean) };
        });
        setScheduledJobs(jobs);
      })
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));

    if (currentScheduledDate) {
      const [y, m, d] = currentScheduledDate.split('-').map(Number);
      setSelectedDate(new Date(y, m - 1, d));
      setCurrentMonth(new Date(y, m - 1, 1));
    } else {
      setSelectedDate(null);
    }
    setSelectedTime(currentScheduledTime || '');
    setSelectedEndTime(currentScheduledEndTime || '');
    setLocalAssignees(selectedAssignees);
    setShowCustomNameInput(false);
    setCustomNameInput('');
    // Lands on whichever badge was actually clicked — clicking "Assignee"
    // on the page should open straight to People, not force a detour
    // through Date first.
    setStep(initialStep || 'date');
    setDirection(1);
  }, [isOpen]);

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!isOpen || !selectedDate || !selectedTime || teamMembers.length === 0) {
      setAssigneeAvailability({});
      return;
    }
    setLoadingAvailability(true);
    const dateStr = toDateStr(selectedDate);
    const names = teamMembers.map((m: any) => m.name).filter(Boolean).join(',');
    const params = new URLSearchParams({ date: dateStr, start: selectedTime, names });
    if (showEndTime && selectedEndTime) params.set('end', selectedEndTime);
    if (currentProjectId) params.set('excludeProjectId', String(currentProjectId));

    fetch(`/api/company/${companySlug}/availability/assignees?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAssigneeAvailability(data.availability || {});
      })
      .catch(() => {})
      .finally(() => setLoadingAvailability(false));
  }, [isOpen, selectedDate, selectedTime, selectedEndTime, teamMembers, companySlug, currentProjectId, showEndTime]);

  const getJobsForDateStr = (dateStr: string) =>
    scheduledJobs.filter(j => j.scheduled_date?.split('T')[0] === dateStr);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const addCustomName = () => {
    const val = customNameInput.trim();
    if (val && !localAssignees.includes(val)) {
      setLocalAssignees((prev) => [...prev, val]);
    }
    setCustomNameInput('');
    setShowCustomNameInput(false);
  };

  const handleConfirm = () => {
    // Date and time are both genuinely optional now — someone locking in
    // just a date, or just assigning staff with nothing scheduled yet, is
    // a valid save, not an incomplete one. The only combination that's
    // actually invalid is an end time that doesn't come after a start
    // time, and only when both of those exist to compare.
    if (showEndTime && selectedTime && selectedEndTime) {
      const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      if (toMins(selectedEndTime) <= toMins(selectedTime)) {
        toast.error('End time must be after start time');
        return;
      }
    }
    onConfirm(
      selectedDate ? toDateStr(selectedDate) : '',
      selectedTime,
      showEndTime && selectedTime ? selectedEndTime : undefined,
      localAssignees
    );
    onClose();
  };

  if (!isOpen) return null;

  // All three are independent now — no gating. Date, time, and assignee
  // are each optional on their own, so every badge is always clickable
  // regardless of what the others currently hold.

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '92vh' }}
        >
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0F1F3D] flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#0F1F3D] uppercase tracking-widest">Schedule Job</p>
                <p className="text-[9px] text-slate-400 font-bold">Date, time & who&rsquo;s working it</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* BADGES — three independent, freely-switchable tabs, not a
              locked sequence. Date, time, and assignee are each optional
              on their own; a contractor who only wants to lock in a date
              (nothing scheduled to a specific time yet, nobody assigned
              yet) can do that and Confirm immediately. Each badge shows
              its actual current value once set, not just a bare label. */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
            {STEPS.map((s) => {
              const Icon = STEP_ICONS[s];
              const isActive = s === step;
              const hasValue =
                (s === 'date' && !!selectedDate) ||
                (s === 'time' && !!selectedTime) ||
                (s === 'people' && localAssignees.length > 0);

              let valueLabel = STEP_LABELS[s];
              if (s === 'date' && selectedDate) valueLabel = formatDateDisplay(selectedDate);
              if (s === 'time' && selectedTime) {
                valueLabel = formatTime(selectedTime) + (showEndTime && selectedEndTime ? ` – ${formatTime(selectedEndTime)}` : '');
              }
              if (s === 'people' && localAssignees.length > 0) {
                valueLabel = localAssignees.length === 1 ? localAssignees[0] : `${localAssignees.length} assigned`;
              }

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => goToStep(s)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all touch-manipulation ${
                    isActive
                      ? 'bg-[#0F1F3D] text-white'
                      : hasValue
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {hasValue ? <CheckCircle2 size={12} /> : <Icon size={12} />}
                  {valueLabel}
                </button>
              );
            })}
          </div>

          {/* STEP CONTENT — slides left/right between steps instead of
              stacking everything in one scrolling column. */}
          <div className="overflow-hidden flex-1" style={{ minHeight: 360 }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="h-full overflow-y-auto px-4 pb-4"
              >
                {/* ── STEP 1: DATE ── */}
                {step === 'date' && (
                  <>
                    <div className="flex items-center justify-between py-4">
                      <button
                        onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <ChevronLeft size={18} className="text-slate-600" />
                      </button>
                      <span className="text-sm font-black text-[#0F1F3D] uppercase tracking-widest">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <ChevronRight size={18} className="text-slate-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-[#0F1F3D] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {cells.map((day, i) => {
                          if (!day) return <div key={`e-${i}`} />;
                          const date = new Date(year, month, day);
                          const dateStr = toDateStr(date);
                          const isPast = date < today;
                          const isToday = dateStr === toDateStr(today);
                          const isSelected = selectedDate ? toDateStr(selectedDate) === dateStr : false;
                          const jobs = getJobsForDateStr(dateStr);
                          const hasJobs = jobs.length > 0;

                          return (
                            <button
                              key={day}
                              disabled={isPast}
                              onClick={() => {
                                setSelectedDate(date);
                                setSelectedTime('');
                                setSelectedEndTime('');
                                goToStep('time');
                              }}
                              className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-black transition-all active:scale-95 ${
                                isPast
                                  ? 'text-slate-200 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#0F1F3D] text-white shadow-lg'
                                  : isToday
                                  ? 'bg-blue-50 text-blue-600 border-2 border-blue-300'
                                  : 'hover:bg-slate-100 text-[#0F1F3D]'
                              }`}
                            >
                              {day}
                              {hasJobs && !isPast && (
                                <div
                                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                                    isSelected ? 'bg-white/60' : 'bg-orange-400'
                                  }`}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* ── STEP 2: TIME ── */}
                {step === 'time' && selectedDate && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-slate-100" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {formatDateDisplay(selectedDate)}
                      </p>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Start time</p>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map(time => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            onClick={() => {
                              setSelectedTime(time);
                              setSelectedEndTime('');
                              if (!showEndTime) goToStep('people');
                            }}
                            className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                              isSelected
                                ? 'bg-[#1a6645] text-white shadow-lg shadow-[#1a6645]/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {formatTime(time)}
                          </button>
                        );
                      })}
                    </div>

                    {showEndTime && selectedTime && (
                      <div className="mt-5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          End time
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {TIME_SLOTS.filter(t => t > selectedTime).map(time => (
                            <button
                              key={time}
                              onClick={() => {
                                setSelectedEndTime(time);
                                goToStep('people');
                              }}
                              className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                                selectedEndTime === time
                                  ? 'bg-[#1a6645] text-white shadow-lg shadow-[#1a6645]/20'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {formatTime(time)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3: PEOPLE ── */}
                {step === 'people' && (
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-slate-100" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedDate && formatDateDisplay(selectedDate)} at {formatTime(selectedTime)}
                        {showEndTime && selectedEndTime ? ` – ${formatTime(selectedEndTime)}` : ''}
                      </p>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <User size={12} className="text-slate-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Who&rsquo;s working it
                      </p>
                      {loadingAvailability && <Loader2 size={11} className="animate-spin text-slate-400 ml-1" />}
                    </div>

                    <div className="space-y-2">
                      {teamMembers.length === 0 && (
                        <p className="text-[11px] text-slate-400 text-center py-3">No team members yet — add someone below.</p>
                      )}
                      {teamMembers.map((m: any) => {
                        const checked = localAssignees.includes(m.name);
                        const avail = assigneeAvailability[m.name];
                        const showStatus = !!avail;

                        return (
                          <button
                            key={m.id ?? m.name}
                            type="button"
                            onClick={() =>
                              setLocalAssignees((prev) =>
                                checked ? prev.filter((n) => n !== m.name) : [...prev, m.name]
                              )
                            }
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition touch-manipulation min-h-[52px] ${
                              checked ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                                checked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{m.name}</p>
                              {showStatus && !avail.available && avail.conflict && (
                                <p className="text-[10px] text-amber-700 truncate mt-0.5">
                                  Busy · {avail.conflict.customer_name || 'another job'}
                                  {avail.conflict.category ? ` (${formatCategoryLabel(avail.conflict.category)})` : ''}
                                </p>
                              )}
                            </div>
                            {showStatus && (
                              <span
                                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                                  avail.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {avail.available ? 'Available' : 'Busy'}
                              </span>
                            )}
                            {checked && <CheckCircle2 size={15} className="text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}

                      {localAssignees
                        .filter((name) => !teamMembers.some((m: any) => m.name === name))
                        .map((name) => (
                          <div
                            key={name}
                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-300 bg-blue-50/60"
                          >
                            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <p className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{name}</p>
                            <button
                              type="button"
                              onClick={() => setLocalAssignees((prev) => prev.filter((n) => n !== name))}
                              className="p-1.5 -m-1 text-slate-400 hover:text-slate-700 rounded-md touch-manipulation"
                              aria-label={`Remove ${name}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                    </div>

                    {showCustomNameInput ? (
                      <div className="flex gap-1.5 mt-2.5">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Custom name..."
                          value={customNameInput}
                          onChange={(e) => setCustomNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addCustomName()}
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[16px] sm:text-xs font-medium text-slate-900 outline-none focus:border-blue-400"
                        />
                        <button
                          type="button"
                          onClick={addCustomName}
                          className="px-3.5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition touch-manipulation"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowCustomNameInput(true)}
                        className="w-full mt-2.5 py-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50/60 rounded-lg transition touch-manipulation"
                      >
                        + Add someone not listed
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* FOOTER — Confirm always available, since nothing here is
              required. No Back button either — badges are freely
              clickable tabs now, not a locked sequence to step through. */}
          <div className="px-4 py-4 border-t border-slate-100 bg-white">
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleConfirm}
              className="w-full py-4 bg-[#0F1F3D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
            >
              <Check size={14} strokeWidth={3} />
              {selectedDate || selectedTime || localAssignees.length > 0 ? 'Save Schedule' : 'Save (nothing set yet)'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}