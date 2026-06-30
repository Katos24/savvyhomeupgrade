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

  // Darker, solid-fill variants — used for badges in light mode so text stays readable on white/gray
  const getStatusColorHexLight = (colorName: string) => {
    const map: Record<string, string> = {
      blue: '#2563eb',
      yellow: '#ca8a04',
      purple: '#9333ea',
      orange: '#ea580c',
      green: '#16a34a',
      red: '#dc2626',
      gray: '#475569',
      indigo: '#4f46e5',
      pink: '#db2777',
    };
    return map[colorName] || '#2563eb';
  };

  const getQuoteStatus = (lead: any) => {
    if (lead.project_quote_accepted_at || lead.quote_accepted_at) return 'accepted';
    if (lead.project_quote_declined_at || lead.quote_declined_at) return 'declined';
    if (lead.project_quote_sent_at || lead.quote_sent_at) return 'sent';
    return null;
  };

 const getPaymentStatus = (lead: any) => {
    if (lead.payment_status === 'paid') return 'paid';
    if (lead.payment_status === 'partial') return 'partial';
    if (lead.payment_status === 'refunded' || lead.payment_status === 'partially_refunded') return 'refunded';
    return null;
  };

  return (
    <>
      {/* ── MOBILE: Compact Rows (unchanged structure — still rows, not cards) ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="sm:hidden space-y-2.5 px-1"
      >
        {leads.map((lead) => {
        const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const quoteStatus = getQuoteStatus(lead);
          const paymentStatus = getPaymentStatus(lead);

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
              className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all active:scale-[0.98] ${
                isDark
                  ? 'bg-white/[0.05] border-white/[0.1] active:bg-white/[0.08]'
                  : 'bg-white border-slate-300 shadow-sm active:bg-slate-50'
              } ${isCompleted ? 'opacity-50' : ''}`}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: statusHex }}
              />

              <div className="pl-4 pr-3.5 py-3.5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lead.name}
                    </h3>
                    {lead.follow_up_date && (
                      <div className="w-4.5 h-4.5 bg-red-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <Bell className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
             <div className="flex items-center gap-1.5 flex-shrink-0">
                    {paymentStatus === 'paid' ? (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'}`}>
  <DollarSign className="w-2.5 h-2.5" /> Paid
</div>
                    ) : paymentStatus === 'partial' ? (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-500/15 text-amber-700 border-amber-500/30'}`}>
  <DollarSign className="w-2.5 h-2.5" /> Partial
</div>
                    ) : paymentStatus === 'refunded' ? (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-slate-500/15 text-slate-400 border-slate-500/20' : 'bg-slate-500/15 text-slate-700 border-slate-500/30'}`}>
  <DollarSign className="w-2.5 h-2.5" /> Refunded
</div>
                    ) : (
                      <>
                        {quoteStatus === 'accepted' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
                          </div>
                        )}
                        {quoteStatus === 'declined' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/15 text-red-400 border border-red-500/20">
                            <X className="w-2.5 h-2.5" /> Declined
                          </div>
                        )}
                        {quoteStatus === 'sent' && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            <Send className="w-2.5 h-2.5" /> Sent
                          </div>
                        )}
                      </>
                    )}
                    <div
                      className="px-2 py-1 rounded-lg text-[10px] font-medium border"
                      style={
                        isDark
                          ? { backgroundColor: `${statusHex}15`, color: statusHex, borderColor: `${statusHex}30` }
                          : { backgroundColor: getStatusColorHexLight(statusConfig.color), color: '#fff', borderColor: 'transparent' }
                      }
                    >
                      {statusConfig.label}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
<p className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {lead.category?.replace(/_/g, ' ') || 'General'}
                    </p>
                    {hasPhotos && (
<span className={`text-[11px] font-medium flex items-center gap-0.5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                        <Camera className="w-3 h-3" />{lead.file_urls.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {displayDate && (
                      <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {displayDate}
                      </p>
                    )}
                    {lead.quote_total && parseFloat(lead.quote_total) > 0 && (
                      <p className={`text-[11px] font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
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
        className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {leads.map((lead) => {
         const statusConfig = getStatusConfig(lead.status);
          const statusHex = getStatusColorHex(statusConfig.color);
          const isCompleted = lead.status === 'completed';
          const quoteStatus = getQuoteStatus(lead);
          const paymentStatus = getPaymentStatus(lead);

          const rawDate = lead.scheduled_date ? lead.scheduled_date.split('T')[0] : null;
          const displayDate = rawDate 
            ? new Date(rawDate.replace(/-/g, '/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
            : 'TBD';

          return (
            <motion.div
              key={lead.id}
              variants={cardVariants}
              whileHover={{ y: -2 }}
              onClick={() => onSelectLead(lead)}
              className={`w-full group cursor-pointer relative flex flex-col ${isDark ? t.cardBg : 'bg-white'} border rounded-2xl overflow-hidden transition-all duration-200 ${
                isDark 
                  ? 'border-white/10 hover:border-white/20' 
                  : 'border-slate-300 shadow-md hover:shadow-lg' 
              } ${isCompleted ? 'opacity-50 grayscale-[0.6]' : 'opacity-100'}`}
            >
              <div 
                className="w-full h-1 shrink-0" 
                style={{ backgroundColor: statusHex }} 
              />

              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between px-6 py-4">
                  <div 
                    className="flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-medium"
                    style={
                      isDark
                        ? { backgroundColor: `${statusHex}15`, color: statusHex, borderColor: `${statusHex}30` }
                        : { backgroundColor: getStatusColorHexLight(statusConfig.color), color: '#fff', borderColor: 'transparent' }
                    }
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? statusHex : '#fff' }} />
                    {statusConfig.label}
                  </div>
                  
               <div className="flex items-center gap-2">
                    {paymentStatus === 'paid' ? (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'}`}>
  <DollarSign className="w-3 h-3" /> Paid
</div>
                    ) : paymentStatus === 'partial' ? (
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' : 'bg-amber-500/15 text-amber-700 border-amber-500/30'}`}>
  <DollarSign className="w-2.5 h-2.5" /> Partial
</div>
                    ) : paymentStatus === 'refunded' ? (
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-slate-500/15 text-slate-400 border-slate-500/20' : 'bg-slate-500/15 text-slate-700 border-slate-500/30'}`}>
  <DollarSign className="w-3 h-3" /> Refunded
</div>
                    ) : (
                      <>
                        {quoteStatus === 'accepted' && (
                         <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'}`}>
  <CheckCircle2 className="w-3 h-3" /> Accepted
</div>
                        )}
                        {quoteStatus === 'declined' && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-red-500/15 text-red-700 border-red-500/30'}`}>
                            <X className="w-3 h-3" /> Declined
                          </div>
                        )}
                        {quoteStatus === 'sent' && (
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${isDark ? 'bg-blue-500/15 text-blue-400 border-blue-500/20' : 'bg-blue-500/15 text-blue-700 border-blue-500/30'}`}>
                            <Send className="w-3 h-3" /> Quote sent
                          </div>
                        )}
                      </>
                    )}
                    {lead.follow_up_date && (
                      <div className="bg-red-500 p-1.5 rounded-lg">
                        <Bell className="w-3.5 h-3.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 flex-1">
                  <div className="mb-6">
                    <h3 className={`${t.textHeading} text-xl font-semibold mb-1 truncate transition-colors duration-200`}>
                      <span className="group-hover:opacity-80 transition-opacity duration-200">
                        {lead.name}
                      </span>
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
  {lead.category?.replace(/_/g, ' ') || 'General enquiry'}
</p>
                      {Array.isArray(lead.file_urls) && lead.file_urls.length > 0 && (
<div className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md ${isDark ? 'text-pink-400 bg-pink-500/10' : 'text-pink-700 bg-pink-100'}`}>
                          <Camera className="w-3.5 h-3.5" /> {lead.file_urls.length}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`grid grid-cols-2 gap-4 p-4 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
<span className={`block text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Target date</span>
                      <div className={`flex items-center gap-2 font-medium text-sm ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>            
                        <Calendar className="w-4 h-4" />
                        {displayDate}
                      </div>
                    </div>
                    <div className={`space-y-1 border-l pl-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
<span className={`block text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Est. revenue</span>
                      <div className={`flex items-center gap-2 font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
<DollarSign className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span>{lead.quote_total ? parseFloat(lead.quote_total).toLocaleString() : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2.5">
<div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-medium ${isDark ? 'bg-slate-700 border-white/10 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'}`}>
                      {lead.assigned_to?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {lead.assigned_to || 'Assignee'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    isDark 
                      ? 'bg-emerald-500 text-black group-hover:bg-white'
                      : 'bg-slate-900 text-white'
                  }`}>
                    <span className="text-[11px] font-medium">Review</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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