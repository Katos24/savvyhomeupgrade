'use client';

import { Calendar, Clock, Camera, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { Lead, STATUS_OPTIONS, fmt } from '@/components/demo/types';
import { motion } from 'framer-motion';

type Props = { lead: Lead & { isNew?: boolean }; darkMode: boolean; onClick: () => void; highlighted?: boolean };

function formatTime(time?: string) {
  if (!time) return 'Not set';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'Not set';
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LeadCard({ lead, darkMode, onClick, highlighted }: Props) {
  const s = STATUS_OPTIONS.find(o => o.value === lead.status) || STATUS_OPTIONS[0];
  const isCompleted = lead.status === 'completed';
  const isNew = (lead as any).isNew;

  if (darkMode) {
    return (
      <>
        <motion.div
          initial={isNew ? { opacity: 0, y: -16, scale: 0.97 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={onClick}
         className={`group relative flex border-2 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:border-blue-500/50 shadow-sm hover:shadow-xl cursor-pointer ${
            isNew ? 'border-emerald-500/60 shadow-emerald-500/10 bg-[#141821]' :
            (lead as any).highlighted ? 'border-blue-400 bg-white shadow-blue-200/50 shadow-xl' :
            'border-white bg-[#141821]'
          } ${isCompleted ? 'opacity-60' : ''}`}
        >
          {isNew && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-full">
              <Zap className="w-2.5 h-2.5 text-white" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Just submitted</span>
            </div>
          )}

          <div className="w-1.5 shrink-0" style={{ backgroundColor: isNew ? '#10b981' : s.hex }} />

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                style={{ backgroundColor: `${s.hex}15`, color: s.hex, borderColor: `${s.hex}30` }}
              >
                {s.label}
              </span>
              {lead.ai_brief && (
                <span className="text-[9px] font-bold text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              )}
            </div>

            {/* Name + category */}
            <div className="px-4 pb-2">
              <h3 className={`text-base sm:text-lg font-bold tracking-tight truncate transition-colors ${isNew ? 'text-emerald-400' : 'text-white group-hover:text-blue-400'}`}>
                {lead.name}
              </h3>
              <div className="flex items-center gap-3 mt-0.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                <span className="truncate max-w-[120px]">{lead.category}</span>
                {lead.file_urls?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-gray-600" /> {lead.file_urls.length}
                  </span>
                )}
              </div>
            </div>

            {/* Stats — hidden on mobile */}
            <div className="hidden sm:grid grid-cols-2 gap-2 mx-4 mb-4 bg-[#161B22]/50 p-3 rounded-xl border border-[#1C2029]">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Date</span>
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(lead.scheduled_date)}
                </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-[#232830] pl-3">
                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Time</span>
                <div className="flex items-center gap-1.5 text-gray-300 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {formatTime(lead.scheduled_time)}
                </div>
              </div>
            </div>

            {/* Mobile inline stats */}
            <div className="flex sm:hidden items-center gap-3 px-4 pb-2 text-[10px] text-gray-500 font-bold">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                {formatDate(lead.scheduled_date)}
              </div>
              <span>·</span>
              <span className="text-emerald-400">
                {lead.quote_total ? `$${parseFloat(lead.quote_total).toLocaleString()}` : '—'}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1C2029]">
              <div>
                <div className="text-white font-black text-sm sm:text-base tracking-tight">
                  {lead.quote_total
                    ? `$${parseFloat(lead.quote_total).toLocaleString()}`
                    : <span className="text-gray-700 text-xs uppercase tracking-widest">No quote yet</span>
                  }
                </div>
                <div className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-500'}`}>
                  {lead.payment_status || 'unpaid'}
                </div>
              </div>
              <div className="h-8 w-8 rounded-xl bg-[#161B22] border border-[#232830] flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>

      </>
    );
  }

  return (
    <>
      <motion.div
        initial={isNew ? { opacity: 0, y: -16, scale: 0.97 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={onClick}
        className={`group relative bg-white border-2 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-lg cursor-pointer ${
          isNew ? 'border-emerald-300 shadow-emerald-100' : 'border-slate-900'
        } ${isCompleted ? 'opacity-60' : ''}`}
      >
        {isNew && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-full">
            <Zap className="w-2.5 h-2.5 text-white" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Just submitted</span>
          </div>
        )}

        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: isNew ? '#10b981' : s.hex }} />

        <div className="pl-3">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${s.hex}15`, color: s.hex }}
            >
              {s.label}
            </span>
            {lead.file_urls?.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                <Camera className="w-3 h-3" /> {lead.file_urls.length}
              </span>
            )}
          </div>

          {/* Name + category */}
          <div className="px-3 pb-2">
            <h3 className={`text-base font-bold transition-colors truncate ${isNew ? 'text-emerald-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
              {lead.name}
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{lead.category}</p>
          </div>

          {/* Stats — hidden on mobile */}
          <div className="hidden sm:grid grid-cols-2 gap-2 mx-3 mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Date</p>
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                {formatDate(lead.scheduled_date)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Time</p>
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {formatTime(lead.scheduled_time)}
              </p>
            </div>
          </div>

          {/* Mobile inline stats */}
          <div className="flex sm:hidden items-center gap-3 px-3 pb-2 text-[10px] text-gray-400 font-bold">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" />
              {formatDate(lead.scheduled_date)}
            </div>
            <span>·</span>
            <span className="text-emerald-500">
              {lead.quote_total ? fmt(lead.quote_total) : '—'}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100">
            <div>
              <p className="text-sm font-black text-gray-900">
                {lead.quote_total ? fmt(lead.quote_total) : <span className="text-gray-300 text-xs">No quote yet</span>}
              </p>
              <p className={`text-[9px] font-black uppercase mt-0.5 ${lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-400'}`}>
                {lead.payment_status}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      </motion.div>

   
    </>
  );
}