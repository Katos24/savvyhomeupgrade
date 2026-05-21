'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function DigestBanner() {
  return (
    <section className="relative min-h-[800px] lg:min-h-[900px] flex items-center overflow-hidden bg-slate-950">
      
      {/* ──── BACKGROUND IMAGE (Stretches whole section) ──── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/morning-brief.webp" // The contractor in truck
          alt="Contractor reviewing daily digest"
          fill
          className="object-cover object-center lg:object-[center_25%]"
          priority
        />
        {/* Deep Gradient Overlay to make text and card readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-slate-950/80 lg:from-slate-950/60 lg:to-transparent" />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
      </div>

      {/* Grid background pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-[1]"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* ──── LEFT: THE EMAIL CARD ──── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 flex justify-center lg:justify-start"
          >
            {/* The Email Card Mockup */}
            <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 transform -rotate-2">
              
              {/* Card Header */}
              <div className="bg-[#111827] px-8 py-7">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1" style={{ fontFamily: font }}>
                  Monday, May 12, 2026
                </p>
                <h3 className="text-xl text-white font-black leading-tight" style={{ fontFamily: font }}>
                  Good morning — <br/>here&apos;s your day
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-bold" style={{ fontFamily: font }}>
                   Rapid Flow Plumbing · 9 items need attention
                </p>
              </div>

              {/* Card Body */}
              <div className="p-8 space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Leads', val: '5', color: 'text-blue-600' },
                    { label: 'Scheduled', val: '4', color: 'text-slate-900' },
                    { label: 'Pending', val: '3', color: 'text-amber-600' }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                      <p className={`text-2xl font-black ${stat.color}`} style={{ fontFamily: font }}>{stat.val}</p>
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Revenue Section */}
                <div className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Active Revenue</p>
                    <p className="text-[11px] text-emerald-600 font-bold">Open jobs & invoices</p>
                  </div>
                  <p className="text-2xl font-black text-emerald-600" style={{ fontFamily: font }}>$18,720</p>
                </div>

                {/* Dynamic Alerts */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <p className="text-xs font-extrabold text-red-900">Kevin White — quote sent 3 days ago</p>
                  </div>
                  <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <p className="text-xs font-extrabold text-blue-900">Sarah Johnson — scheduled today</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 py-4 text-center border-t border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Daily Digest · Rapid Flow Plumbing</p>
              </div>
            </div>
          </motion.div>

          {/* ──── RIGHT: THE COPY ──── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-sky-300" style={{ fontFamily: font }}>
                Pro Plan Feature
              </p>
            </div>

            <h3
              className="text-4xl sm:text-6xl text-white leading-[1.05] mb-8"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Your business, <br />
              <span className="text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">delivered at 6 AM.</span>
            </h3>

            <p
              className="text-lg text-slate-200 leading-relaxed mb-10 max-w-lg font-medium"
              style={{ fontFamily: font }}
            >
              Every morning before you start the truck, a branded digest lands in your inbox.
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              {[
                "Today's jobs",
                'Stale quotes',
                'Overdue payments',
                'Revenue totals',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-4">
                  <CheckCircle2 size={20} className="text-sky-400 shrink-0" />
                  <span className="text-sm text-white font-bold" style={{ fontFamily: font }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-4 bg-sky-500 hover:bg-sky-400 text-white px-10 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_-10px_rgba(14,165,233,0.5)]"
                style={{ fontFamily: font }}
              >
                Try Pro Free for 14 Days
                <ArrowRight size={20} strokeWidth={3} />
              </motion.div>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}