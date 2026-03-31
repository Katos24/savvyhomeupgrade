'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Calendar, Bell, User, CheckCircle2, 
  DollarSign, Mail, Phone, ChevronRight, 
  Clock, Briefcase, Camera
} from 'lucide-react';
import { getTheme } from '@/lib/theme';

interface CardsViewProps {
  leads: any[];
  onSelectLead: (lead: any) => void;
  statusOptions: any[];
  isDark?: boolean;
  planTier?: string;
}

// ── ANIMATION VARIANTS (TS SAFE) ──────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // Snappy stagger for high-end feel
      delayChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.96 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 24 
    } 
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export default function CardsView({ leads, onSelectLead, statusOptions, isDark = true, planTier = 'starter' }: CardsViewProps) {
  const isStarter = planTier === 'starter';
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

  const formatScheduledTime = (time: string) => {
    if (!time || time === 'TBD') return 'TBD';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-1 sm:px-0"
    >
      {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status);
        const statusHex = getStatusColorHex(statusConfig.color);
        const isCompleted = lead.status === 'completed';

        return (
          <motion.div
            key={lead.id}
            variants={cardVariants}
            whileHover={{ 
              y: -5, 
              scale: 1.01,
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectLead(lead)}
            className={`w-full group cursor-pointer relative flex ${t.cardBg} border ${t.cardBorder} rounded-[1.5rem] overflow-hidden transition-colors ${t.cardBorderHover} shadow-sm hover:shadow-2xl hover:shadow-black/10 ${
              isCompleted ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'
            }`}
          >
            {/* Left Status Accent */}
            <div 
              className="w-1.5 shrink-0" 
              style={{ backgroundColor: statusHex }} 
            />

            <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
              
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                    style={{ 
                      backgroundColor: `${statusHex}12`, 
                      color: statusHex, 
                      borderColor: `${statusHex}20` 
                    }}
                  >
                    {statusConfig.label}
                  </span>
                  {lead.follow_up_date && (
                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full">
                       <Bell className="w-3 h-3 text-red-500 animate-pulse" />
                       <span className="text-[9px] font-black text-red-500 uppercase">Follow up</span>
                    </div>
                  )}
                </div>

                <h3 className={`${t.textHeading} text-xl font-black tracking-tight truncate group-hover:text-blue-400 transition-colors`}>
                  {lead.name}
                </h3>
                
                <div className={`flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-wider ${t.textSecondary}`}>
                  
                  <div className="flex items-center gap-1.5">
                    <User className={`w-3.5 h-3.5 ${t.textMuted}`} />
                    <span className="truncate">{lead.assigned_to || 'Unassigned'}</span>
                  </div>
                  {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
                    <div className="flex items-center gap-1 text-pink-500 bg-pink-500/10 px-1.5 py-0.5 rounded-md">
                      <Camera className="w-3 h-3" />
                      <span className="font-black text-[9px]">{lead.file_urls.length}</span>
                    </div>
                  )}
                </div>
              </div>


              {/* Schedule Box */}
              {!isStarter && (
                <div className="mb-4">
                  <div className={`grid grid-cols-2 gap-2 ${t.innerBg} p-4 rounded-2xl border ${t.innerBorder}`}>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Job Date</span>
                      <div className="flex items-center gap-2 text-indigo-400 font-black text-[12px] italic">
                        <Calendar className="w-4 h-4" />
                        {lead.scheduled_date 
                          ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'TBD'}
                      </div>
                    </div>
                    <div className={`flex flex-col gap-1.5 border-l ${t.innerBorder} pl-4`}>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Arrival</span>
                      <div className="flex items-center gap-2 text-slate-300 font-black text-[12px] italic">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {formatScheduledTime(lead.scheduled_time)}
                      </div>
                    </div>
                  </div>
                  {/* Category below schedule box */}
                  <div className={`flex items-center gap-1.5 mt-2 px-1 text-[9px] font-black uppercase tracking-widest ${t.textMuted}`}>
                    <Briefcase className="w-3 h-3" />
                    {lead.category ? lead.category.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'General'}
                  </div>
                </div>
              )}

              {/* Footer */}
<div className={`flex items-center justify-between pt-4 border-t ${t.cardBorder}`}>
  {!isStarter ? (
    <div className="flex flex-col gap-1">
      <div className={`${t.textHeading} font-black text-lg tracking-tight`}>
        {lead.quote_total 
          ? `$${parseFloat(lead.quote_total).toLocaleString()}` 
          : <span className={`${t.textEmpty} text-[10px] uppercase tracking-[0.2em] opacity-40`}>Pending Quote</span>}
      </div>
      <div className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
        lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-slate-500'
      }`}>
        <div className={`w-1 h-1 rounded-full ${lead.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
        {lead.payment_status || 'Unpaid'}
      </div>
     
    </div>
  ) : (
    <div className="flex flex-col gap-1">
      <div className={`text-[10px] font-bold uppercase tracking-widest ${t.textMuted}`}>
        {lead.category ? lead.category.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'General'}
      </div>
    </div>
  )}

  <div className={`h-10 w-10 rounded-2xl ${t.innerBg} border ${t.innerBorder} flex items-center justify-center ${t.textSecondary} group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all shadow-lg active:scale-90`}>
    <ChevronRight className="w-5 h-5" />
  </div>
</div>

            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}