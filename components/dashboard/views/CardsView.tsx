'use client';

import { motion, Variants } from 'framer-motion';
import { 
  Calendar, Bell, ChevronRight, 
  User, DollarSign, Camera
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
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { 
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 220, damping: 22 }
  }
};

export default function CardsView({ leads, onSelectLead, statusOptions, isDark = true, planTier = 'free' }: CardsViewProps) {
  const t = getTheme(isDark);  

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0] || { label: 'New', color: 'blue' };

  const getStatusColorHex = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
      green: '#10b981', red: '#ef4444', gray: '#64748b', indigo: '#6366f1', pink: '#ec4899',
    };
    return map[colorName] || '#3b82f6';
  };

  return (
   <motion.div 
  variants={containerVariants}
  initial="hidden"
  animate="show"
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 px-1 sm:px-0"
>
      {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status);
        const statusHex = getStatusColorHex(statusConfig.color);
        const isCompleted = lead.status === 'completed';

        const rawDate = lead.scheduled_date ? lead.scheduled_date.split('T')[0] : null;
        const displayDate = rawDate 
          ? new Date(rawDate.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
          : 'TBD';

        return (
        <motion.div
  key={lead.id}
  data-tour={leads.indexOf(lead) === 0 ? 'lead-card' : undefined}
  variants={cardVariants}
  whileHover={{ y: -2, transition: { duration: 0.2 } }}
  onClick={() => onSelectLead(lead)}
  className={`w-full group cursor-pointer relative flex flex-col sm:flex-col flex-row ${t.cardBg} border-2 rounded-2xl sm:rounded-[2rem] overflow-hidden transition-all duration-300 shadow-md sm:shadow-xl ${
  isDark 
    ? 'border-white shadow-black/40' 
    : 'border-slate-900 shadow-slate-200' 
} ${isCompleted ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}
>
  {/* Mobile: left accent bar */}
  <div className="sm:hidden w-1 shrink-0 self-stretch rounded-l-2xl" style={{ backgroundColor: statusHex }} />

  {/* Content */}
  <div className="flex flex-1 flex-col sm:flex-col">

    {/* Header */}
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-5">
      <div 
        className="flex items-center gap-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest"
        style={{ backgroundColor: `${statusHex}12`, color: statusHex, borderColor: `${statusHex}25` }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusHex }} />
        {statusConfig.label}
      </div>
      {lead.follow_up_date && (
        <div className="flex items-center gap-1.5 bg-red-500 text-white px-2 py-0.5 rounded-lg">
          <Bell className="w-3 h-3" />
          <span className="text-[8px] font-black uppercase hidden sm:inline">Action Req</span>
        </div>
      )}
    </div>

    {/* Body */}
    <div className="px-4 sm:px-6 pb-3 sm:pb-6 flex-1 flex flex-col sm:justify-between">
      <div className="mb-2 sm:mb-6 min-w-0">
        <h3 className={`${t.textHeading} text-lg sm:text-2xl font-black tracking-tight mb-0.5 sm:mb-1.5 truncate group-hover:text-blue-500 transition-colors`}>
          {lead.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
            {lead.category?.replace(/_/g, ' ') || 'General Enquiry'}
          </p>
          {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
            <div className="flex items-center gap-1 text-pink-500 text-[10px] font-black">
              <Camera className="w-3 h-3" /> {lead.file_urls.length}
            </div>
          )}
        </div>
      </div>

      {/* Stats row — hidden on mobile to keep it slim */}
      <div className={`hidden sm:grid grid-cols-2 gap-3 p-4 rounded-[1.5rem] border mb-6 ${
        isDark ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="space-y-1">
          <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Job Date</span>
<div className={`flex items-center gap-2 font-black italic text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>            <Calendar className="w-3.5 h-3.5" />
            {displayDate}
          </div>
        </div>
        <div className={`space-y-1 border-l pl-4 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Revenue</span>
          <div className={`flex items-center gap-2 font-black text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            {lead.quote_total ? parseFloat(lead.quote_total).toLocaleString() : '0.00'}
          </div>
        </div>
      </div>

      {/* Mobile inline stats */}
      <div className="flex sm:hidden items-center gap-3 text-[10px] text-slate-400 font-bold">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-blue-400" />
          {displayDate}
        </div>
        <span>·</span>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-emerald-500" />
          {lead.quote_total ? parseFloat(lead.quote_total).toLocaleString() : '0.00'}
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[8px] font-black text-white uppercase shrink-0">
          {lead.assigned_to?.charAt(0) || <User className="w-3 h-3" />}
        </div>
        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">
          {lead.assigned_to || 'Unassigned'}
        </span>
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
        isDark 
          ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                    : 'bg-slate-900 text-white'
      }`}>
        <span className="text-[10px] font-black uppercase tracking-widest">Open</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </div>

  </div>
</motion.div>
        );
      })}
    </motion.div>
  );
}