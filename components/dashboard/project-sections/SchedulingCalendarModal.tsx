'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Loader2, CheckCircle2, User, Search } from 'lucide-react';
import { toast } from 'sonner';

// Three genuinely isolated pickers, not one shared modal with tabs.
// Previously all three (date/time/people) lived in one modal that
// auto-advanced between them on selection — picking a date jumped
// straight to time, picking a time jumped straight to people. That's
// exactly what felt wrong: picking one thing shouldn't sweep you into
// deciding the next thing. Each mode below is now a complete, standalone
// flow with its own Confirm button — closing one never opens another.
export type PickerMode = 'date' | 'time' | 'people';

type Props = {
  isOpen: boolean;
  mode: PickerMode;
  onClose: () => void;
  onConfirmDate: (date: string) => void;
  onConfirmTime: (time: string, endTime?: string) => void;
  onConfirmPeople: (assignees: string[]) => void;
  companySlug: string;
  currentScheduledDate?: string;
  currentScheduledTime?: string;
  currentScheduledEndTime?: string;
  selectedAssignees?: string[];
  teamMembers?: any[];
  currentLeadId?: number;
  currentProjectId?: number;
  bufferMinutes?: number;
  showEndTime?: boolean;
};

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const formatCategoryLabel = (value?: string | null) =>
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

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Shared modal shell — bottom sheet on mobile, centered on desktop. Same
// proven pattern used elsewhere in Scheduling all session.
function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-black text-[#0F1F3D] uppercase tracking-widest">{title}</p>
              {subtitle && <p className="text-[9px] text-slate-400 font-bold">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-4 pb-4">{children}</div>
          <div className="px-4 py-4 border-t border-slate-100 bg-white">{footer}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ConfirmButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 bg-[#0F1F3D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100"
    >
      <Check size={14} strokeWidth={3} />
      {label}
    </button>
  );
}

export default function SchedulingCalendarModal({
  isOpen,
  mode,
  onClose,
  onConfirmDate,
  onConfirmTime,
  onConfirmPeople,
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
}: Props) {
  // ── DATE MODE STATE ──
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // ── TIME MODE STATE ──
  const [pickedTime, setPickedTime] = useState('');
  const [pickedEndTime, setPickedEndTime] = useState('');

  // ── PEOPLE MODE STATE ──
  const [localAssignees, setLocalAssignees] = useState<string[]>(selectedAssignees);
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [assigneeAvailability, setAssigneeAvailability] = useState<
    Record<string, { available: boolean; conflict: { customer_name?: string; category?: string } | null }>
  >({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Reset each mode's local state fresh whenever the modal opens, from
  // whatever the current real values are.
  useEffect(() => {
    if (!isOpen) return;

    if (currentScheduledDate) {
      const [y, m, d] = currentScheduledDate.split('-').map(Number);
      const initial = new Date(y, m - 1, d);
      setPickedDate(initial);
      setCurrentMonth(new Date(y, m - 1, 1));
    } else {
      setPickedDate(null);
      setCurrentMonth(new Date());
    }
    setPickedTime(currentScheduledTime || '');
    setPickedEndTime(currentScheduledEndTime || '');
    setLocalAssignees(selectedAssignees);
    setShowCustomNameInput(false);
    setCustomNameInput('');
  }, [isOpen]);

  // Month-grid "busy day" dots — only needed in date mode.
  useEffect(() => {
    if (!isOpen || mode !== 'date') return;
    setLoadingJobs(true);
    fetch(`/api/company/${companySlug}/leads?calendarAll=true`)
      .then((r) => r.json())
      .then((data) => {
        const jobs = (data.leads || []).filter((l: any) => l.scheduled_date && !l.deleted && l.id !== currentLeadId);
        setScheduledJobs(jobs);
      })
      .catch(() => toast.error('Failed to sync schedule'))
      .finally(() => setLoadingJobs(false));
  }, [isOpen, mode, companySlug, currentLeadId]);

  // Availability — only needed in people mode, and only once a date+time
  // already exist (set independently, via the Date/Time pickers). This
  // mode never changes date/time itself, only reads whatever's already
  // set to check who's free against it.
  useEffect(() => {
    if (!isOpen || mode !== 'people' || !currentScheduledDate || !currentScheduledTime || teamMembers.length === 0) {
      setAssigneeAvailability({});
      return;
    }
    setLoadingAvailability(true);
    const names = teamMembers.map((m: any) => m.name).filter(Boolean).join(',');
    const params = new URLSearchParams({ date: currentScheduledDate, start: currentScheduledTime, names });
    if (showEndTime && currentScheduledEndTime) params.set('end', currentScheduledEndTime);
    if (currentProjectId) params.set('excludeProjectId', String(currentProjectId));

    fetch(`/api/company/${companySlug}/availability/assignees?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAssigneeAvailability(data.availability || {});
      })
      .catch(() => {})
      .finally(() => setLoadingAvailability(false));
  }, [isOpen, mode, currentScheduledDate, currentScheduledTime, currentScheduledEndTime, teamMembers, companySlug, currentProjectId, showEndTime]);

  if (!isOpen) return null;

  const jobsByDay = (dateStr: string) => scheduledJobs.filter((j) => j.scheduled_date?.split('T')[0] === dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addCustomName = () => {
    const val = customNameInput.trim();
    if (val && !localAssignees.includes(val)) {
      setLocalAssignees((prev) => [...prev, val]);
    }
    setCustomNameInput('');
    setShowCustomNameInput(false);
  };

  // ══════════════════════════ DATE MODE ══════════════════════════
  if (mode === 'date') {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const todayStr = toDateStr(today);

    return (
      <ModalShell
        title="Set Date"
        subtitle="Pick a day for this job"
        onClose={onClose}
        footer={
          <ConfirmButton
            label={pickedDate ? `Confirm ${formatDateDisplay(pickedDate)}` : 'Select a date'}
            disabled={!pickedDate}
            onClick={() => {
              if (!pickedDate) return;
              onConfirmDate(toDateStr(pickedDate));
              onClose();
            }}
          />
        }
      >
        <div className="flex items-center justify-between py-4">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <span className="text-sm font-black text-[#0F1F3D] uppercase tracking-widest">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">{d}</div>
          ))}
        </div>

        {loadingJobs ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-[#0F1F3D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 mb-2">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const date = new Date(year, month, day);
              const dStr = toDateStr(date);
              const isPast = date < today;
              const isToday = dStr === todayStr;
              const isSelected = pickedDate ? toDateStr(pickedDate) === dStr : false;
              const hasJobs = jobsByDay(dStr).length > 0;

              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => setPickedDate(date)}
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
                    <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-orange-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </ModalShell>
    );
  }

  // ══════════════════════════ TIME MODE ══════════════════════════
  if (mode === 'time') {
    const canConfirm = !!pickedTime && (!showEndTime || !!pickedEndTime);
    return (
      <ModalShell
        title="Set Time"
        subtitle={currentScheduledDate ? `For ${currentScheduledDate}` : 'Pick a start time'}
        onClose={onClose}
        footer={
          <ConfirmButton
            label={pickedTime ? `Confirm ${formatTime(pickedTime)}${showEndTime && pickedEndTime ? ` – ${formatTime(pickedEndTime)}` : ''}` : 'Select a time'}
            disabled={!canConfirm}
            onClick={() => {
              if (showEndTime && pickedEndTime) {
                const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                if (toMins(pickedEndTime) <= toMins(pickedTime)) {
                  toast.error('End time must be after start time');
                  return;
                }
              }
              onConfirmTime(pickedTime, showEndTime ? pickedEndTime : undefined);
              onClose();
            }}
          />
        }
      >
        <div className="pt-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Start time</p>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => { setPickedTime(time); setPickedEndTime(''); }}
                className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                  pickedTime === time ? 'bg-[#1a6645] text-white shadow-lg shadow-[#1a6645]/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {formatTime(time)}
              </button>
            ))}
          </div>

          {showEndTime && pickedTime && (
            <div className="mt-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">End time</p>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.filter((t) => t > pickedTime).map((time) => (
                  <button
                    key={time}
                    onClick={() => setPickedEndTime(time)}
                    className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                      pickedEndTime === time ? 'bg-[#1a6645] text-white shadow-lg shadow-[#1a6645]/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalShell>
    );
  }

  // ══════════════════════════ PEOPLE MODE ══════════════════════════
  return (
    <ModalShell
      title="Assign Staff"
      subtitle={
        currentScheduledDate && currentScheduledTime
          ? `Checking availability for ${currentScheduledDate}`
          : 'Set a date & time first to see availability'
      }
      onClose={onClose}
      footer={
        <ConfirmButton
          label={localAssignees.length > 0 ? `Confirm · ${localAssignees.length} assigned` : 'Confirm (unassigned)'}
          onClick={() => {
            onConfirmPeople(localAssignees);
            onClose();
          }}
        />
      }
    >
      <div className="pt-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <User size={12} className="text-slate-400" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Team</p>
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
                onClick={() => setLocalAssignees((prev) => (checked ? prev.filter((n) => n !== m.name) : [...prev, m.name]))}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition touch-manipulation min-h-[52px] ${
                  checked ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${checked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
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
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${avail.available ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
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
              <div key={name} className="w-full flex items-center gap-3 p-3 rounded-xl border border-blue-300 bg-blue-50/60">
                <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 min-w-0 text-sm font-semibold text-slate-900 truncate">{name}</p>
                <button type="button" onClick={() => setLocalAssignees((prev) => prev.filter((n) => n !== name))} className="p-1.5 -m-1 text-slate-400 hover:text-slate-700 rounded-md touch-manipulation" aria-label={`Remove ${name}`}>
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
            <button type="button" onClick={addCustomName} className="px-3.5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition touch-manipulation">
              Add
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowCustomNameInput(true)} className="w-full mt-2.5 py-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50/60 rounded-lg transition touch-manipulation">
            + Add someone not listed
          </button>
        )}
      </div>
    </ModalShell>
  );
}