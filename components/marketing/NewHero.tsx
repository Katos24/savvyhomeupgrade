'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

/* ───────────────────────────────────────────
   MOBILE-OPTIMIZED SCRAPBOOK COLLAGE 
   (Hides secondary cards to keep mobile ultra-clean)
   ─────────────────────────────────────────── */
function ScrapbookCollage() {
  return (
    <div className="relative w-full min-h-none lg:h-[600px] bg-slate-100/70 rounded-3xl border border-slate-200/60 p-4 sm:p-6 overflow-hidden backdrop-blur-sm flex flex-col sm:grid sm:grid-cols-2 lg:block gap-4 sm:gap-6 lg:gap-0">
      
      {/* Background structural lines — Desktop only */}
      <div className="hidden lg:block absolute inset-y-0 left-1/3 w-px bg-slate-200/50 pointer-events-none" />
      <div className="hidden lg:block absolute inset-x-0 top-1/2 h-px bg-slate-200/50 pointer-events-none" />

      {/* 1. Contact form — VISIBLE EVERYWHERE (Core Problem) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full sm:w-auto lg:absolute lg:top-[8%] lg:right-[6%] lg:w-[210px] z-10 lg:rotate-[2deg]"
      >
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-3">Old Contact Form</div>
          <div className="space-y-2">
            <div className="h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Full Name</span>
            </div>
            <div className="h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Email Address</span>
            </div>
            <div className="h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-start p-2">
              <span className="text-[10px] font-bold text-slate-400">Job Details...</span>
            </div>
            <div className="h-7 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-[10px] text-white font-black uppercase tracking-wide">Lost in Inbox</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Email inbox simulation — HIDDEN ON MOBILE (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden lg:block lg:absolute lg:top-[4%] lg:left-[4%] lg:w-[220px] z-20 lg:rotate-[-3deg]"
      >
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <div className="text-[10px] font-black text-slate-900 tracking-tight">Inbox (47)</div>
            </div>
            <span className="text-[9px] font-bold text-slate-400">Primary</span>
          </div>
          <div className="space-y-2">
            {[
              { text: 'New lead - John S.', bold: true, tag: 'Roofing' },
              { text: 'Re: Quote update...', bold: true },
              { text: 'New lead - Sarah L.', bold: true, tag: 'Solar' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className={`w-1 h-1 rounded-full flex-shrink-0 ${item.bold ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <div className={`text-[10px] truncate ${item.bold ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>{item.text}</div>
                </div>
                {item.tag && (
                  <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-bold scale-90">{item.tag}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 3. Linen Sticky Note — HIDDEN ON MOBILE (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="hidden lg:block lg:absolute lg:top-[44%] lg:left-[4%] z-40 lg:rotate-[6deg]"
      >
        <div
          className="w-[130px] h-[105px] rounded-sm p-3 border border-amber-200/60 flex flex-col justify-between"
          style={{ 
            backgroundColor: '#FFFDF0', 
            boxShadow: '3px 6px 18px rgba(180, 150, 100, 0.1)',
            fontFamily: 'monospace'
          }}
        >
          <div className="text-[11px] text-amber-900 font-bold tracking-tight leading-tight">
            // CALL BACK<br />
            John - leak info<br />
            555-0142
          </div>
          <div className="text-[9px] text-amber-600/80 font-bold text-right border-t border-amber-200/40 pt-1">
            Tuesday?
          </div>
        </div>
      </motion.div>

      {/* 4. Muted Rose Sticky Note — HIDDEN ON MOBILE (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="hidden lg:block lg:absolute lg:top-[53%] lg:right-[6%] z-40 lg:rotate-[-4deg]"
      >
        <div
          className="w-[130px] h-[105px] rounded-sm p-3 border border-rose-200/60 flex flex-col justify-between"
          style={{ 
            backgroundColor: '#FFF1F2', 
            boxShadow: '-3px 6px 18px rgba(180, 100, 120, 0.08)',
            fontFamily: 'monospace'
          }}
        >
          <div className="text-[11px] text-rose-950 font-bold tracking-tight leading-tight">
            CRITICAL:<br />
            Did I dispatch <br />
            the quote??
          </div>
          <div className="text-[8px] text-rose-500 font-bold uppercase tracking-wider">
            check email
          </div>
        </div>
      </motion.div>

      {/* 5. Live Text Thread — HIDDEN ON MOBILE (Desktop Only) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden lg:block lg:absolute lg:top-[34%] lg:left-[32%] lg:w-[170px] z-30 lg:rotate-[1deg]"
      >
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
          <div className="space-y-1.5">
            <div className="flex justify-end">
              <div className="bg-slate-900 rounded-xl rounded-tr-none px-2.5 py-1">
                <span className="text-[10px] text-white font-medium">I can come Thursday</span>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-xl rounded-tl-none px-2.5 py-1">
                <span className="text-[10px] text-slate-800 font-medium">ok how much?</span>
              </div>
            </div>
            <div className="flex justify-start pt-0.5">
              <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase">Read 3:42 PM</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. Dashboard Tracker Grid — VISIBLE EVERYWHERE (Core Solution) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full sm:w-auto sm:col-span-1 lg:absolute lg:bottom-[4%] lg:left-[6%] lg:w-[220px] z-10 lg:rotate-[-2deg]"
      >
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.04)] lg:shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-3 text-[9px] text-slate-700">
            <div className="border-b border-r border-slate-100 bg-slate-50 px-2 py-1.5 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Client</div>
            <div className="border-b border-r border-slate-100 bg-slate-50 px-2 py-1.5 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Status</div>
            <div className="border-b border-slate-100 bg-slate-50 px-2 py-1.5 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Invoice</div>
            
            <div className="border-b border-r border-slate-100 px-2 py-1.5 font-bold text-slate-900">John S</div>
            <div className="border-b border-r border-slate-100 px-2 py-1.5 text-amber-600 font-bold bg-amber-50/40">Pending</div>
            <div className="border-b border-slate-100 px-2 py-1.5 text-slate-400 font-medium">unsent</div>
            
            <div className="border-r border-slate-100 px-2 py-1.5 font-bold text-slate-900">Mike D</div>
            <div className="border-r border-slate-100 px-2 py-1.5 text-emerald-600 font-bold bg-emerald-50/40">Active</div>
            <div className="px-2 py-1.5 text-emerald-600 font-bold">Paid</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

/* ───────────────────────────────────────────
   HERO MAIN WRAPPER
   ─────────────────────────────────────────── */
export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-28 sm:pt-36 lg:pt-44 pb-16 lg:pb-24 overflow-hidden border-b border-slate-100">

      {/* Light-mode micro grid matrix layer */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:pr-12 lg:pl-16">

        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-10 lg:gap-12 items-center">

          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col space-y-6 relative z-20">

            <h1
              className="text-slate-900 font-black tracking-tighter leading-[1.05] sm:leading-[1.02] lg:leading-[0.92] text-4xl sm:text-6xl lg:text-[6.2rem]"
              style={{ fontFamily: font }}
            >
              Stop <br />
              Losing <br />
              Leads to <br />
              <span className="text-emerald-600">Your Inbox.</span>
            </h1>

            {/* Mobile scrapbook renders natively inline here beneath the title */}
            <div className="block lg:hidden my-2">
              <ScrapbookCollage />
            </div>

            <p className="text-slate-600 font-bold leading-relaxed text-base sm:text-lg lg:text-xl max-w-md border-l-4 border-emerald-500 pl-4 sm:pl-5" style={{ fontFamily: font }}>
              Lead2Project replaces your contact form with one branded link that captures photos, details, and job info — all on one dashboard.
            </p>

            {/* Micro value outcomes using clean, native contractor talk */}
            <div className="space-y-2.5 text-xs sm:text-sm font-bold text-slate-800" style={{ fontFamily: font }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>See job details and site photos immediately</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Quote serious customers before competitors reply</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Stop chasing low-budget tire kickers for free estimates</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup" passHref>
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4 h-14 rounded-xl font-black uppercase tracking-wider text-xs shadow-md transition-all cursor-pointer text-center"
                    style={{ fontFamily: font }}
                  >
                    Get Started Free
                    <ArrowRight size={14} strokeWidth={3} />
                  </motion.div>
                </Link>

                <Link href="/demo" passHref>
                  <motion.div
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-950 px-8 py-4 h-14 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer text-center shadow-sm"
                    style={{ fontFamily: font }}
                  >
                    <Play size={12} fill="currentColor" className="text-emerald-600" />
                    Try Demo
                  </motion.div>
                </Link>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 font-bold tracking-wide" style={{ fontFamily: font }}>
                No credit card required · 2 minute setup · Cancel anytime
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT COLUMN (Desktop Layout Only) */}
          <div className="hidden lg:block w-full">
            <ScrapbookCollage />
          </div>

        </div>
      </div>
    </section>
  );
}