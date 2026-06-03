'use client';

import { motion, Variants } from 'framer-motion';
import { 
  Calendar, Bell, ChevronRight, 
  User, DollarSign, Camera, Send, CheckCircle2, X
} from 'lucide-react';
import { getTheme } from '@/lib/theme';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  planTier?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: { 
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 }
  }
};

export default function CardsView({ leads, onSelectLead, statusOptions, isDark = true, planTier = 'free' }: CardsViewProps) {
  const t = getTheme(isDark);  

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0] || { label: 'New', color: 'blue' };

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#60a5fa', 
      yellow: '#fde047', 
      purple: '#c084fc', 
      orange: '#fb923c',
      green: '#4ade80', 
      red: '#f87171', 
      gray: '#94a3b8', 
      indigo: '#818cf8', 
      pink: '#f472b6',
    };
    return map[colorName] || '#60a5fa';
  };

  const getQuoteStatus = (lead: any) => {
    if (lead.project_quote_accepted_at || lead.quote_accepted_at) return 'accepted';
    if (lead.project_quote_declined_at || lead.quote_declined_at) return 'declined';
    if (lead.project_quote_sent_at || lead.quote_sent_at) return 'sent';
    return null;
  };

  return (
    <>
      {/* ── MOBILE: Compact Rows ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="sm:hidden space-y-3 px-1"
      >
        {leads.map((lead) => {
          const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const quoteStatus = getQuoteStatus(lead);

          const rawDate = lead.scheduled_date ? lead.scheduled_date.split('T')[0] : null;
          const displayDate = rawDate 
            ? new Date(rawDate.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
            : null;

          const hasPhotos = Array.isArray(lead.file_urls) && lead.file_urls.length > 0;

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              onClick={() => onSelectLead(lead)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden border transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-white/[0.03] border-white/[0.08] active:bg-white/[0.06]'
                  : 'bg-white border-slate-200 active:bg-slate-50 shadow-sm'
              } ${isCompleted ? 'opacity-50' : ''}`}
            >
              {/* Status accent left bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                style={{ backgroundColor: statusHex }}
              />

              <div className="pl-5 pr-4 py-4">
                {/* Top: Name + status + quote badge */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className={`text-base font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lead.name}
                    </h3>
                    {lead.follow_up_date && (
                      <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <Bell className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {quoteStatus === 'accepted' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
                      </div>
                    )}
                    {quoteStatus === 'declined' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20">
                        <X className="w-2.5 h-2.5" /> Declined
                      </div>
                    )}
                    {quoteStatus === 'sent' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        <Send className="w-2.5 h-2.5" /> Sent
                      </div>
                    )}
                    <div
                      className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border"
                      style={{
                        backgroundColor: `${statusHex}15`,
                        color: statusHex,
                        borderColor: `${statusHex}30`,
                      }}
                    >
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* Bottom: Category + meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {lead.category?.replace(/_/g, ' ') || 'General'}
                    </p>
                    {hasPhotos && (
                      <span className="text-[10px] font-bold text-pink-400 flex items-center gap-0.5">
                        <Camera className="w-3 h-3" />{lead.file_urls.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {displayDate && (
                      <p className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {displayDate}
                      </p>
                    )}
                    {lead.quote_total && parseFloat(lead.quote_total) > 0 && (
                      <p className={`text-[11px] font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ${parseFloat(lead.quote_total).toLocaleString()}
                      </p>
                    )}
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── DESKTOP: Full Cards ── */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {leads.map((lead) => {
          const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const quoteStatus = getQuoteStatus(lead);

          const rawDate = lead.scheduled_date ? lead.scheduled_date.split('T')[0] : null;
          const displayDate = rawDate 
            ? new Date(rawDate.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
            : 'TBD';

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              onClick={() => onSelectLead(lead)}
              className={`w-full group cursor-pointer relative flex flex-col ${t.cardBg} border-2 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${
                isDark 
                  ? 'border-white/10 hover:border-white/30 shadow-xl shadow-black/40' 
                  : 'border-slate-200 shadow-lg shadow-slate-200/50' 
              } ${isCompleted ? 'opacity-50 grayscale-[0.8]' : 'opacity-100'}`}
            >
              {/* Status Accent Bar */}
              <div 
                className="w-full h-1.5 shrink-0" 
                style={{ 
                  backgroundColor: statusHex,
                  boxShadow: `0 0 15px ${statusHex}40`
                }} 
              />

              <div className="flex flex-1 flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6">
                  <div 
                    className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.15em]"
                    style={{ 
                      backgroundColor: `${statusHex}15`, 
                      color: statusHex, 
                      borderColor: `${statusHex}30` 
                    }}
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusHex }} />
                    {statusConfig.label}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {quoteStatus === 'accepted' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Accepted
                      </div>
                    )}
                    {quoteStatus === 'declined' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/20">
                        <X className="w-3 h-3" /> Declined
                      </div>
                    )}
                    {quoteStatus === 'sent' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        <Send className="w-3 h-3" /> Quote Sent
                      </div>
                    )}
                    {lead.follow_up_date && (
                      <div className="bg-red-500 p-1.5 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                        <Bell className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 pb-8 flex-1">
                  <div className="mb-8">
                    <h3 
                      className={`${t.textHeading} text-3xl font-[1000] italic uppercase tracking-tighter mb-1 truncate transition-colors duration-300`}
                      style={{ '--status-color': statusHex } as any}
                    >
                      <span className="group-hover:text-[var(--status-color)] transition-colors duration-300">
                        {lead.name}
                      </span>
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {lead.category?.replace(/_/g, ' ') || 'General Enquiry'}
                      </p>
                      {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
                        <div className="flex items-center gap-1.5 text-pink-400 text-[11px] font-black bg-pink-500/10 px-2 py-0.5 rounded-md">
                          <Camera className="w-3.5 h-3.5" /> {lead.file_urls.length}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className={`grid grid-cols-2 gap-4 p-5 rounded-[1.8rem] border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Date</span>
                      <div className={`flex items-center gap-2 font-black italic text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>            
                        <Calendar className="w-4 h-4" />
                        {displayDate}
                      </div>
                    </div>
                    <div className={`space-y-1 border-l pl-5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Est. Revenue</span>
                      <div className={`flex items-center gap-2 font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-base">{lead.quote_total ? parseFloat(lead.quote_total).toLocaleString() : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-between px-8 py-5 border-t ${isDark ? 'border-white/5 bg-black/10' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400 italic">
                      {lead.assigned_to?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight italic">
                      {lead.assigned_to || 'Assignee'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isDark 
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:bg-white'
                      : 'bg-slate-900 text-white'
                  }`}>
                    <span className="text-[11px] font-[1000] uppercase italic tracking-wider">Review</span>
                    <ChevronRight className="w-4 h-4 stroke-[3px]" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}