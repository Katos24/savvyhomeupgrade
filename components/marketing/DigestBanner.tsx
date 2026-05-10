'use client';

import { motion } from 'framer-motion';
import { Mail, Clock, TrendingUp, Users, AlertCircle } from 'lucide-react';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-14 bg-slate-900">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-8 lg:gap-12 items-center">

          {/* Left — Mini digest preview */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border-3 border-slate-700 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] max-w-md mx-auto lg:max-w-none" style={{ borderWidth: '3px' }}>
              
              {/* Email header */}
              <div className="bg-slate-950 px-4 sm:px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Mail size={13} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white" style={{ fontFamily: font, fontWeight: 900 }}>Daily Strategy Digest</p>
                    <p className="text-[8px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>Delivered every morning at 6:00 AM</p>
                  </div>
                </div>
                <span className="text-[8px] text-amber-400 px-2 py-0.5 bg-amber-500/15 rounded border border-amber-500/25" style={{ fontFamily: font, fontWeight: 900 }}>
                  PRO
                </span>
              </div>

              {/* Digest content */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 space-y-2">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <p className="text-lg text-slate-900" style={{ fontFamily: font, fontWeight: 900 }}>7</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 700 }}>New Leads</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <p className="text-lg text-emerald-500" style={{ fontFamily: font, fontWeight: 900 }}>3</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 700 }}>Scheduled</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-2 text-center border border-slate-100">
                    <p className="text-lg text-amber-500" style={{ fontFamily: font, fontWeight: 900 }}>2</p>
                    <p className="text-[8px] text-slate-500 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 700 }}>Need Follow-Up</p>
                  </div>
                </div>

                {/* Action items */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-red-50 rounded-lg border border-red-100">
                    <AlertCircle size={10} className="text-red-500 shrink-0" />
                    <p className="text-[9px] text-red-700" style={{ fontFamily: font, fontWeight: 700 }}>
                      <strong>Kevin White</strong> — quote sent 3 days ago, no response
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                    <Clock size={10} className="text-blue-500 shrink-0" />
                    <p className="text-[9px] text-blue-700" style={{ fontFamily: font, fontWeight: 700 }}>
                      <strong>Sarah Johnson</strong> — inspection scheduled today at 10 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — Value text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/15 rounded-full border border-amber-500/25 mb-4">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 900 }}>Pro Plan Feature</span>
            </div>

            <h3
              className="text-2xl sm:text-3xl text-white mb-3 leading-snug"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Wake Up Knowing
              <br />
              <span className="text-amber-400">Exactly What to Do.</span>
            </h3>

            <p
              className="text-sm sm:text-base text-slate-400 leading-relaxed mb-5"
              style={{ fontFamily: font, fontWeight: 600 }}
            >
              Every morning at 6 AM, you get an email with your new leads, today's schedule, overdue follow-ups, and which deals need attention. Before your coffee's ready, you already have a plan.
            </p>

            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {['New leads summary', 'Today\'s schedule', 'Overdue follow-ups', 'Revenue snapshot'].map(item => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-slate-800 rounded-full text-[11px] text-slate-300 border border-slate-700"
                  style={{ fontFamily: font, fontWeight: 700 }}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}