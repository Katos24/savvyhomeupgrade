'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSelectDateTime: (date: string, time: string, endTime?: string) => void;
  companySlug: string;
  currentScheduledDate?: string;
  currentScheduledTime?: string;
  currentScheduledEndTime?: string;
  selectedAssignees?: string[];
  currentLeadId?: number;
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

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}${m === 0 ? '' : ':' + String(m).padStart(2, '0')}${ampm}`;
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function SchedulingCalendarModal({
  isOpen,
  onClose,
  onSelectDateTime,
  companySlug,
  currentScheduledDate,
  currentScheduledTime,
  currentScheduledEndTime,
  selectedAssignees = [],
  currentLeadId,
  bufferMinutes = 0,
  showEndTime = false,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

    // Pre-select current values if they exist
    if (currentScheduledDate) {
      const [y, m, d] = currentScheduledDate.split('-').map(Number);
      setSelectedDate(new Date(y, m - 1, d));
      setCurrentMonth(new Date(y, m - 1, 1));
    }
  if (currentScheduledTime) setSelectedTime(currentScheduledTime);
    if (currentScheduledEndTime) setSelectedEndTime(currentScheduledEndTime);
  }, [isOpen]);

  const getJobsForDateStr = (dateStr: string) =>
    scheduledJobs.filter(j => j.scheduled_date?.split('T')[0] === dateStr);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const toDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const handleConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Pick a date and time');
      return;
    }
    if (showEndTime && selectedEndTime) {
      const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
      if (toMins(selectedEndTime) <= toMins(selectedTime)) {
        toast.error('End time must be after start time');
        return;
      }
    }
    onSelectDateTime(toDateStr(selectedDate), selectedTime, showEndTime ? selectedEndTime : undefined);
    onClose();
  };
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full sm:max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '92vh' }}
        >
          {/* Drag handle — mobile only */}
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
                <p className="text-[11px] font-black text-[#0F1F3D] uppercase tracking-widest">Pick Date & Time</p>
                {selectedAssignees.length > 0 && (
                  <p className="text-[9px] text-slate-400 font-bold">{selectedAssignees.join(', ')}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-4 pb-4">

            {/* Month nav */}
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

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-[9px] font-black text-slate-400 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-[#0F1F3D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 mb-4">
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

            {/* Time slots — appear when date selected */}
            <AnimatePresence>
              {selectedDate && (() => {
                const dateStr = toDateStr(selectedDate);
                const jobsOnDay = getJobsForDateStr(dateStr);

              const getConflict = (time: string) => {
                  if (selectedAssignees.length === 0) return null;
                  const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                  const newStart = toMins(time);
                  return jobsOnDay.find((j: any) => {
                    if (!j.scheduled_time) return false;
                    const overlap = (j.all_assignees || []).some((n: string) => selectedAssignees.includes(n));
                    if (!overlap) return false;
                    const existingStart = toMins(j.scheduled_time);
                    const existingEnd = j.scheduled_end_time ? toMins(j.scheduled_end_time) : existingStart;
                    return newStart <= existingEnd + bufferMinutes && newStart + bufferMinutes >= existingStart;
                  }) || null;
                };

                const selectedConflict = selectedTime ? getConflict(selectedTime) : null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1 bg-slate-100" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {formatDateDisplay(selectedDate)}
                      </p>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    {/* Horizontal scrolling time chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {TIME_SLOTS.map(time => {
                        const isSelected = selectedTime === time;
                        const conflict = getConflict(time);
                        const hasConflict = !!conflict;

                        return (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`shrink-0 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 relative ${
                              isSelected
                                ? hasConflict
                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                  : 'bg-[#1a6645] text-white shadow-lg shadow-[#1a6645]/20'
                                : hasConflict
                                ? 'bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {formatTime(time)}
                            {hasConflict && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border border-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                   {showEndTime && selectedTime && (
                      <div className="mt-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          End time
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {TIME_SLOTS.filter(t => t > selectedTime).map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedEndTime(time)}
                              className={`shrink-0 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wide transition-all active:scale-95 ${
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

                    {/* Conflict warning */}
                    <AnimatePresence>
                      {selectedConflict && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl"
                        >
                          <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold text-amber-700 leading-tight">
                            {selectedConflict.name
                              ? `"${selectedConflict.name}" is already scheduled around this time`
                              : 'A job is already scheduled around this time'}
                            {selectedConflict.assigned_to ? ` — ${selectedConflict.assigned_to}` : ''}. You can still book it.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-slate-100 bg-white">
            {selectedDate && selectedTime && (!showEndTime || selectedEndTime) ? (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleConfirm}
                className="w-full py-4 bg-[#0F1F3D] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all"
              >
                <Check size={14} strokeWidth={3} />
                Confirm — {formatDateDisplay(selectedDate)} at {formatTime(selectedTime)}
                {showEndTime && selectedEndTime ? ` – ${formatTime(selectedEndTime)}` : ''}
              </motion.button>
            ) : (
              <div className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center">
                {!selectedDate ? 'Select a date' : !selectedTime ? 'Select a time' : 'Select an end time'}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}