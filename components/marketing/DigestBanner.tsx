'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative min-h-[850px] lg:min-h-[900px] flex items-center overflow-hidden bg-slate-950">
      
      {/* ──── BACKGROUND IMAGE (Stretches whole section) ──── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/morning-brief.webp"
          alt="Contractor reviewing daily digest operations brief at 6 AM"
          fill
          className="object-cover object-center lg:object-[center_25%]"
          priority
        />
        {/* Complex Premium Lighting Mask */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent lg:from-slate-950/90 lg:via-slate-950/60 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-[0.5px]" />
      </div>

      {/* Structural Minimal Canvas Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 w-full py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-16 lg:gap-12 items-center">
          
          {/* ──── LEFT: THE AUTOMATED OPERATIONS BRIEF ──── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, rotate: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -1.5 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1 flex justify-center lg:justify-start"
          >
            {/* High-End Clean SaaS Email Container */}
            <div className="w-full max-w-[390px] bg-white rounded-3xl shadow-[0_40px_90px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10">
              
              {/* Card Window Bar Header */}
              <div className="bg-slate-900 px-6 py-6 border-b border-white/[0.05]">
                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">
                  Monday, May 12, 2026
                </p>
                <h3 className="text-xl text-white font-black tracking-tight leading-tight" style={{ fontFamily: font }}>
                  Good morning — <br />here&apos;s your day
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                   Rapid Flow Plumbing · 9 items need attention
                </p>
              </div>

              {/* Card Body Contents */}
              <div className="p-6 space-y-5">
                {/* Micro Metric Blocks */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: 'Leads', val: '5', color: 'text-sky-600' },
                    { label: 'Scheduled', val: '4', color: 'text-slate-900' },
                    { label: 'Pending', val: '3', color: 'text-amber-600' }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                      <p className={`text-xl font-black ${stat.color}`} style={{ fontFamily: font }}>{stat.val}</p>
                      <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Ledger / Revenue Segment */}
                <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Active Revenue</p>
                    <p className="text-[10px] text-emerald-600/80 font-bold">Open pipeline balances</p>
                  </div>
                  <p className="text-xl font-black text-emerald-600" style={{ fontFamily: font }}>$18,720</p>
                </div>

                {/* Dynamic Critical Reminders */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <p className="text-[11px] font-bold text-amber-950">Kevin White — quote sent 3 days ago</p>
                  </div>
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <p className="text-[11px] font-bold text-indigo-950">Sarah Johnson — scheduled today</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50/80 py-3.5 text-center border-t border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Daily Operations Digest</p>
              </div>
            </div>
          </motion.div>

          {/* ──── RIGHT: THE NARRATIVE COPY ──── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 flex flex-col justify-center"
          >
            <div className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 mb-6 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <p className="text-[10px] font-black uppercase tracking-wider text-sky-300" style={{ fontFamily: font }}>
                Automated Operations Brief
              </p>
            </div>

            <h3
              className="text-4xl sm:text-5xl lg:text-6xl text-white font-black leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: font }}
            >
              Your business, <br />
              <span className="text-sky-400 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">delivered at 6 AM.</span>
            </h3>

            <p
              className="text-slate-300 font-bold text-base sm:text-lg leading-relaxed mb-8 max-w-md"
              style={{ fontFamily: font }}
            >
Every morning at 6AM, you get a digest email — new leads, upcoming jobs, unpaid invoices. Review everything before you ever turn the key.
            </p>

            {/* Structured Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-lg">
              {[
                "Today's active dispatches",
                'Stale, unaccepted quotes',
                'Overdue retainer invoices',
                'Real-time gross pipeline totals',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-md border border-white/[0.06] rounded-xl px-4 py-3.5">
                  <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-slate-200 font-bold" style={{ fontFamily: font }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="self-start">
              <Link href="/signup" passHref>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-400 text-white px-8 h-14 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-[0_20px_40px_rgba(14,165,233,0.3)] text-center"
                  style={{ fontFamily: font }}
                >
                  Activate Your Dashboard Free
                  <ArrowRight size={14} strokeWidth={3} />
                </motion.div>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}