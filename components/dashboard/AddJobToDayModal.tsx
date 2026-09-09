'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Briefcase, Loader2 } from 'lucide-react';

type UnscheduledJob = {
  project_id: number;
  lead_id: number;
  customer_name: string;
  category: string | null;
  quote_total: string | number | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onPick: (job: UnscheduledJob) => void;
  companySlug: string;
  /** Just for the header — the day this job will be scheduled onto. */
  dayLabel: string;
};

const fmtMoney = (n: any) => {
  const v = parseFloat(n);
  if (!v) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
};

const formatCategoryLabel = (value?: string | null) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function AddJobToDayModal({ isOpen, onClose, onPick, companySlug, dayLabel }: Props) {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<UnscheduledJob[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setJobs([]);
    fetchJobs('');
  }, [isOpen]);

  // Same 400ms debounce convention already used for search elsewhere
  // (DashboardFilters' lead search) — not a new pattern.
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
              <p className="text-[11px] font-black text-[#0F1F3D] uppercase tracking-widest">Add a job</p>
              <p className="text-[9px] text-slate-400 font-bold">Schedule onto {dayLabel}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400">
              <X size={18} />
            </button>
          </div>

          <div className="px-4 pt-4">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 rounded-xl">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search jobs by customer name..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              />
              {loading && <Loader2 size={14} className="animate-spin text-slate-400 shrink-0" />}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {!loading && jobs.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Briefcase size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold uppercase tracking-wider">
                  {search ? 'No matching unscheduled jobs' : 'No unscheduled jobs found'}
                </p>
              </div>
            )}
            {jobs.map((job) => {
              const amount = fmtMoney(job.quote_total);
              return (
                <button
                  key={job.project_id}
                  onClick={() => onPick(job)}
                  className="w-full text-left p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#1a6645] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-[#0F1F3D] truncate">{job.customer_name}</p>
                    {amount && <span className="text-xs font-black text-slate-600 shrink-0">{amount}</span>}
                  </div>
                  {job.category && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                      {formatCategoryLabel(job.category)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}