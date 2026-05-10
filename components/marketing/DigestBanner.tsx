'use client';

import { motion } from 'framer-motion';
import { Mail, Clock, TrendingUp, Users, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function DigestBanner() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-20 bg-slate-900 selection:bg-amber-500/30">
      {/* Background Pattern - subtle dots */}
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
              <div className="bg-slate-950 px-5 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-black tracking-tight leading-tight">Daily Strategy Digest</p>
                    <p className="text-[10px] text-slate-400 font-semibold">6:00 AM • Automated Report</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-[10px] text-amber-400 font-black px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">
                    PRO
                  </span>
                </div>
              </div>

              {/* Digest content */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'New Leads', val: '7', color: 'text-slate-900' },
                    { label: 'Scheduled', val: '3', color: 'text-emerald-500' },
                    { label: 'Pending', val: '2', color: 'text-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100 shadow-sm">
                      <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Action items */}
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-red-50/50 rounded-xl border border-red-100">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-900 font-medium leading-relaxed">
                      <span className="font-bold">Kevin White</span> — Quote sent 3 days ago, no response. Follow up needed.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <Clock size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
                      <span className="font-bold">Sarah Johnson</span> — Inspection scheduled today at 10:00 AM.
                    </p>
                  </div>
                </div>

                {/* Bottom CTA Mockup */}
                <div className="pt-2 flex justify-center">
                  <div className="w-full py-2 bg-slate-100 rounded-lg flex items-center justify-center gap-2 opacity-60">
                    <span className="text-[10px] font-bold text-slate-400">View Full Report</span>
                    <ChevronRight size={12} className="text-slate-400" />
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
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Available on Pro</span>
            </div>

            <h3 className="text-3xl sm:text-4xl md:text-5xl text-white mb-6 font-black leading-[1.1] tracking-tight">
              Wake Up Knowing
              <br />
              <span className="text-amber-400">Exactly What to Do.</span>
            </h3>

            <p className="text-base sm:text-lg text-slate-400 font-medium leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Your "command center" arrives in your inbox at 6:00 AM. Review new leads, handle follow-ups, and organize your day before you even finish your first coffee.
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start mb-8">
              {['New Leads', 'Schedule', 'Overdue tasks', 'Revenue'].map(item => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg text-xs font-bold text-slate-300 border border-slate-700/50"
                >
                  <CheckCircle2 size={12} className="text-amber-400" />
                  {item}
                </div>
              ))}
            </div>
            
      
          </motion.div>

        </div>
      </div>
    </section>
  );
}