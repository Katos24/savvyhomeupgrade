'use client';

import { Calendar, Clock, Camera, ChevronRight, Sparkles } from 'lucide-react';
import { Lead, STATUS_OPTIONS, fmt, Task, QuoteItem } from '@/components/demo/types';


type Props = { lead: Lead; darkMode: boolean; onClick: () => void };

function formatTime(time?: string) {
  if (!time) return 'TBD';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function LeadCard({ lead, darkMode, onClick }: Props) {
  const s = STATUS_OPTIONS.find(o => o.value === lead.status) || STATUS_OPTIONS[0];
  const isCompleted = lead.status === 'completed';

  if (darkMode) {
    return (
      <div
        onClick={onClick}
        className={`group relative flex bg-[#0A0C10] border border-[#1C2029] rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:border-blue-500/50 shadow-sm hover:shadow-xl cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
      >
        <div className="w-1.5 shrink-0" style={{ backgroundColor: s.hex }} />
        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
                style={{ backgroundColor: `${s.hex}15`, color: s.hex, borderColor: `${s.hex}30` }}>
                {s.label}
              </span>
              {lead.ai_brief && (
                <span className="text-[9px] font-bold text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              )}
            </div>
            <h3 className="text-white text-lg font-bold tracking-tight truncate group-hover:text-blue-400 transition-colors">{lead.name}</h3>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
              <span className="truncate max-w-[100px]">{lead.category}</span>
              {lead.file_urls?.length > 0 && (
                <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-gray-600" /> {lead.file_urls.length}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5 bg-[#161B22]/50 p-3 rounded-xl border border-[#1C2029]">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Date</span>
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                <Calendar className="w-3.5 h-3.5" />
                {lead.scheduled_date
                  ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Not set'}
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

          <div className="flex items-center justify-between pt-3 border-t border-[#1C2029]">
            <div>
              <div className="text-white font-black text-base tracking-tight">
                {lead.quote_total
                  ? `$${parseFloat(lead.quote_total).toLocaleString()}`
                  : <span className="text-gray-700 text-xs uppercase tracking-widest">No quote</span>}
              </div>
              <div className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-500'}`}>
                {lead.payment_status || 'Unpaid'}
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[#161B22] border border-[#232830] flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:border-indigo-200 hover:shadow-lg cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
    >
      <div className="h-1 w-full" style={{ backgroundColor: s.hex }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${s.hex}15`, color: s.hex }}>
              {s.label}
            </span>
            <h3 className="text-gray-900 text-base font-bold mt-1.5 group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
            <p className="text-xs text-gray-400 font-medium">{lead.category}</p>
          </div>
          {lead.file_urls?.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400"><Camera className="w-3 h-3" /> {lead.file_urls.length}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
          <div>
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Date</p>
            <p className="text-xs font-bold text-gray-700 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-400" />
              {lead.scheduled_date
                ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Not set'}
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

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-black text-gray-900">
              {lead.quote_total ? fmt(lead.quote_total) : <span className="text-gray-300 text-xs">No quote</span>}
            </p>
            <p className={`text-[9px] font-black uppercase mt-0.5 ${lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-400'}`}>
              {lead.payment_status}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}