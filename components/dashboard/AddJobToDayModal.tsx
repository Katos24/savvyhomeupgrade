'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Briefcase, Loader2, CalendarClock, ArrowRight } from 'lucide-react';

type UnscheduledJob = {
  project_id: number;
  lead_id: number;
  customer_name: string;
  category: string | null;
  quote_total: string | number | null;
};

export type ScheduledPickerJob = UnscheduledJob & {
  scheduled_date: string | null; // YYYY-MM-DD
  scheduled_time?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** reschedule = true when an already-scheduled job is being moved. */
  onPick: (job: UnscheduledJob, opts?: { reschedule?: boolean }) => void;
  companySlug: string;
  /** Just for the header — the day this job will be scheduled onto. */
  dayLabel: string;
  /** YYYY-MM-DD of the target day — jobs already on this day aren't offered. */
  targetDay?: string;
  /** Already-scheduled jobs (the Calendar has these loaded) — searchable so
   *  a job can be moved to this day. Omit to keep the old behavior. */
  scheduledJobs?: ScheduledPickerJob[];
};

const fmtMoney = (n: any) => {
  const v = parseFloat(n);
  if (!v) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
};

const formatCategoryLabel = (value?: string | null) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fmtDay = (key?: string | null) =>
  key ? new Date(`${key}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

const fmtTime = (t?: string | null) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  if (Number.isNaN(h)) return '';
  return `${h % 12 || 12}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export default function AddJobToDayModal({
  isOpen,
  onClose,
  onPick,
  companySlug,
  dayLabel,
  targetDay,
  scheduledJobs,
}: Props) {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<UnscheduledJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingMove, setPendingMove] = useState<ScheduledPickerJob | null>(null);
  const [showScheduled, setShowScheduled] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setJobs([]);
    setPendingMove(null);
    setShowScheduled(false);
    fetchJobs('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchJobs = (term: string) => {
    setLoading(true);
    fetch(`/api/company/${companySlug}/jobs/unscheduled?search=${encodeURIComponent(term)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setJobs(data.jobs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchJobs(val), 400);
  };

  // Already-scheduled jobs, searched locally (the Calendar already loaded them).
  const scheduledMatches = useMemo(() => {
    if (!scheduledJobs?.length) return [];
    const term = search.trim().toLowerCase();
    return scheduledJobs
      .filter((j) => j.scheduled_date && j.scheduled_date !== targetDay)
      .filter(
        (j) =>
          !term ||
          j.customer_name?.toLowerCase().includes(term) ||
          (j.category || '').toLowerCase().includes(term)
      )
      .sort((a, b) => String(a.scheduled_date).localeCompare(String(b.scheduled_date)))
      .slice(0, 25);
  }, [scheduledJobs, search, targetDay]);

  // Scheduled jobs show automatically while searching or when there's
  // nothing unscheduled to pick; otherwise behind a "show" link, so the
  // default list stays focused on jobs that still need a date.
  const scheduledVisible =
    scheduledMatches.length > 0 && (showScheduled || !!search.trim() || (!loading && jobs.length === 0));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
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
              <p className="text-sm font-bold text-[#1c1917]">Add a job</p>
              <p className="text-xs text-slate-500 font-medium">Schedule onto {dayLabel}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* ── Confirm moving an already-scheduled job ── */}
          {pendingMove ? (
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarClock size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#1c1917]">Move {pendingMove.customer_name}?</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5">
                      {fmtDay(pendingMove.scheduled_date)}
                      {pendingMove.scheduled_time ? ` · ${fmtTime(pendingMove.scheduled_time)}` : ''}
                    </span>
                    <ArrowRight size={13} className="text-slate-400" />
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[#1a6645]">{dayLabel}</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    If you already sent this customer their schedule, send them the new date after you save — otherwise they&rsquo;ll still expect the old one.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPendingMove(null)}
                  className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const job = pendingMove;
                    setPendingMove(null);
                    onPick(
                      {
                        project_id: job.project_id,
                        lead_id: job.lead_id,
                        customer_name: job.customer_name,
                        category: job.category,
                        quote_total: job.quote_total,
                      },
                      { reschedule: true }
                    );
                  }}
                  className="rounded-xl bg-[#1a6645] py-2.5 text-xs font-bold text-white hover:opacity-90"
                >
                  Move job
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 pt-4">
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 rounded-xl">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by customer or service…"
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  {loading && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {/* Unscheduled jobs */}
                {jobs.length > 0 && (
                  <p className="px-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Not scheduled yet</p>
                )}
                {jobs.map((job) => {
                  const amount = fmtMoney(job.quote_total);
                  return (
                    <button
                      key={job.project_id}
                      onClick={() => onPick(job)}
                      className="w-full text-left p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#1a6645] hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-[#1c1917] truncate">{job.customer_name}</p>
                        {amount && <span className="text-xs font-bold text-slate-600 shrink-0">{amount}</span>}
                      </div>
                      {job.category && (
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatCategoryLabel(job.category)}</p>
                      )}
                    </button>
                  );
                })}

                {!loading && jobs.length === 0 && !scheduledVisible && (
                  <div className="py-10 text-center text-slate-400">
                    <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">
                      {search ? 'No matching jobs' : 'No jobs waiting to be scheduled'}
                    </p>
                  </div>
                )}

                {/* Already-scheduled jobs — to move one to this day */}
                {scheduledVisible && (
                  <>
                    <p className="px-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Already scheduled — tap to move here
                    </p>
                    {scheduledMatches.map((job) => (
                      <button
                        key={`s-${job.project_id}`}
                        onClick={() => setPendingMove(job)}
                        className="w-full text-left p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-white transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-[#1c1917] truncate">{job.customer_name}</p>
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-md px-1.5 py-0.5 shrink-0">
                            {fmtDay(job.scheduled_date)}
                          </span>
                        </div>
                        {job.category && (
                          <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatCategoryLabel(job.category)}</p>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {!scheduledVisible && scheduledMatches.length > 0 && (
                  <button
                    onClick={() => setShowScheduled(true)}
                    className="w-full py-2.5 text-xs font-semibold text-[#1a6645] hover:underline"
                  >
                    Move an already-scheduled job here instead
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}