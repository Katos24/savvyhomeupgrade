'use client';

import { motion } from 'framer-motion';
import { Mail, Clock, TrendingUp, Users, AlertCircle, CheckCircle2, ChevronRight, DollarSign } from 'lucide-react';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 bg-slate-900 selection:bg-amber-500/30">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
      
      {/* Glow Effect */}
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left — Interactive Digest Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white rounded-2xl sm:rounded-[2rem] border-[3px] border-slate-800 overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] max-w-sm mx-auto lg:max-w-none"
            >
              {/* Email header */}
              <div className="bg-slate-950 px-4 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white font-black tracking-tight leading-tight" style={{ fontFamily: font }}>Daily Strategy Digest</p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider" style={{ fontFamily: font }}>6:00 AM • Automated Report</p>
                  </div>
                </div>
                <span className="text-[9px] text-amber-400 font-black px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20" style={{ fontFamily: font }}>
                  PRO
                </span>
              </div>

              {/* Digest content */}
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* TOP STATS ROW */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'New Leads', val: '7', color: 'text-slate-900' },
                    { label: 'Scheduled', val: '3', color: 'text-emerald-500' },
                    { label: 'Pending', val: '2', color: 'text-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100 shadow-sm">
                      <p className={`text-lg font-black ${stat.color}`} style={{ fontFamily: font }}>{stat.val}</p>
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter" style={{ fontFamily: font }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* REVENUE BAR - NEW ADDITION */}
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
                        <TrendingUp size={12} className="text-white" />
                     </div>
                     <p className="text-[10px] font-black text-emerald-900 uppercase" style={{ fontFamily: font }}>Active Revenue</p>
                   </div>
                   <p className="text-sm font-black text-emerald-600" style={{ fontFamily: font }}>$21,450.00</p>
                </div>

                {/* Action items */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1" style={{ fontFamily: font }}>Critical Follow-ups</p>
                  <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-900 font-bold leading-snug" style={{ fontFamily: font }}>
                      <span className="font-black">Kevin White</span> — Quote sent 3 days ago, no response.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-900 font-bold leading-snug" style={{ fontFamily: font }}>
                      <span className="font-black">Sarah Johnson</span> — Scheduled today at 10:00 AM.
                    </p>
                  </div>
                </div>

                {/* Bottom CTA Mockup */}
                <div className="pt-2 flex justify-center">
                  <div className="w-full py-2 bg-slate-900 rounded-lg flex items-center justify-center gap-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest" style={{ fontFamily: font }}>View Full Board</span>
                    <ChevronRight size={12} className="text-amber-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Value text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest" style={{ fontFamily: font }}>Exclusive to Pro Plan</span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl text-white mb-6 font-black leading-[1.1] tracking-tight" style={{ fontFamily: font }}>
              Wake Up Knowing
              <br />
              <span className="text-amber-400">Exactly What to Do.</span>
            </h3>

            <p className="text-base sm:text-lg text-slate-400 font-bold leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0" style={{ fontFamily: font }}>
              Your "command center" arrives in your inbox at 6:00 AM. Review new leads, see your projected revenue, and organize your day before you even finish your first coffee.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { label: 'New Leads', icon: Users },
                { label: 'Schedule', icon: Clock },
                { label: 'Overdue tasks', icon: AlertCircle },
                { label: 'Revenue Tracking', icon: DollarSign }
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 backdrop-blur-sm rounded-xl text-xs font-black text-slate-200 border border-slate-700/50"
                  style={{ fontFamily: font }}
                >
                  <item.icon size={14} className="text-amber-400" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}