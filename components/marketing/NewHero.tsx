'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

/* ───────────────────────────────────────────
   PROFESSIONAL SCRAPBOOK COLLAGE — right side
   ─────────────────────────────────────────── */

function ScrapbookCollage() {
  return (
    <div className="relative w-full h-[440px] sm:h-[500px] lg:h-[560px] bg-slate-100/50 rounded-3xl border border-slate-200/60 p-4 overflow-hidden">
      
      {/* Background architectural structural line for anchoring */}
      <div className="absolute inset-y-0 left-1/3 w-px bg-slate-200/40 pointer-events-none" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200/40 pointer-events-none" />

      {/* 1. Contact form (Premium UI card) */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="absolute top-[8%] right-[6%] lg:right-[12%] w-[190px] sm:w-[220px] z-10"
      >
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="text-[11px] font-black uppercase tracking-wider text-slate-800 mb-3">Contact Request</div>
          <div className="space-y-2">
            <div className="h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Full Name</span>
            </div>
            <div className="h-7 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Email Address</span>
            </div>
            <div className="h-12 bg-slate-50 rounded-lg border border-slate-100 flex items-start p-2">
              <span className="text-[10px] font-bold text-slate-400">Project Description...</span>
            </div>
            <div className="h-7 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-[10px] text-white font-black uppercase tracking-wide">Submit</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Email inbox (Ultra-clean modern window) */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ delay: 0.5, duration: 0.7 }}
        className="absolute top-[4%] left-[4%] lg:left-[8%] w-[210px] sm:w-[230px] z-20"
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
              { text: 'Missed call request', bold: false },
              { text: 'FW: Urgent inspection', bold: true },
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

      {/* 3. Premium Warm-White Linen Sticky Note */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: 7 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="absolute top-[44%] left-[4%] lg:left-[8%] z-40"
      >
        <div
          className="w-[120px] h-[110px] rounded-sm p-3 border border-amber-200/60 flex flex-col justify-between"
          style={{ 
            backgroundColor: '#FFFDF0', 
            boxShadow: '3px 6px 18px rgba(180, 150, 100, 0.15)',
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

      {/* 4. Premium Soft Muted Rose Sticky Note */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, rotate: -5 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute top-[55%] right-[6%] lg:right-[12%] z-40"
      >
        <div
          className="w-[125px] h-[95px] rounded-sm p-3 border border-rose-200/60 flex flex-col justify-between"
          style={{ 
            backgroundColor: '#FFF1F2', 
            boxShadow: '-3px 6px 18px rgba(180, 100, 120, 0.12)',
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

      {/* 5. Minimal Text thread window */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="absolute top-[34%] left-[30%] lg:left-[34%] w-[170px] z-30"
      >
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-[0_15px_40px_rgba(15,23,42,0.05)]">
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-slate-900 rounded-xl rounded-tr-none px-2.5 py-1.5">
                <span className="text-[10px] text-white font-medium">I can come Thursday</span>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-xl rounded-tl-none px-2.5 py-1.5">
                <span className="text-[10px] text-slate-800 font-medium">ok how much?</span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-slate-900 rounded-xl rounded-tr-none px-2.5 py-1.5">
                <span className="text-[10px] text-white font-medium">let me check</span>
              </div>
            </div>
            <div className="flex justify-start pt-0.5">
              <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase">Read 3:42 PM</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. Clean Pro Spreadsheet */}
      <motion.div
        initial={{ opacity: 0, y: 20, rotate: 0 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="absolute bottom-[6%] left-[6%] lg:left-[10%] w-[210px] z-10"
      >
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-3 text-[9px] text-slate-700">
            <div className="border-b border-r border-slate-100 bg-slate-50 px-2 py-2 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Client</div>
            <div className="border-b border-r border-slate-100 bg-slate-50 px-2 py-2 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Status</div>
            <div className="border-b border-slate-100 bg-slate-50 px-2 py-2 font-black uppercase tracking-wider text-slate-400 scale-90 origin-left">Invoice</div>
            
            <div className="border-b border-r border-slate-100 px-2 py-2 font-bold text-slate-900">John S</div>
            <div className="border-b border-r border-slate-100 px-2 py-2 text-amber-600 font-bold bg-amber-50/40">Pending</div>
            <div className="border-b border-slate-100 px-2 py-2 text-slate-400 font-medium">unsent</div>
            
            <div className="border-b border-r border-slate-100 px-2 py-2 font-bold text-slate-900">Sarah M</div>
            <div className="border-b border-r border-slate-100 px-2 py-2 text-slate-400 font-medium">unknown</div>
            <div className="border-b border-slate-100 px-2 py-2 text-slate-400 font-medium">—</div>
            
            <div className="border-r border-slate-100 px-2 py-2 font-bold text-slate-900">Mike D</div>
            <div className="border-r border-slate-100 px-2 py-2 text-emerald-600 font-bold bg-emerald-50/40">Active</div>
            <div className="px-2 py-2 text-emerald-600 font-bold">Paid</div>
          </div>
        </div>
      </motion.div>

      {/* 7. Missed Call Toast Alert */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-[8%] right-[6%] lg:right-[12%] z-30"
      >
        <div className="bg-white border border-slate-200/90 rounded-2xl px-3.5 py-2.5 shadow-[0_20px_40px_rgba(15,23,42,0.08)] flex items-center gap-3 w-[180px]">
          <div className="w-7 h-7 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-100">
            <span className="text-rose-600 text-[12px] font-black">!</span>
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-900">3 Unreturned Calls</div>
            <div className="text-[9px] font-bold text-slate-400">Est. value $4,200</div>
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
    <section className="relative bg-slate-50 pt-24 lg:pt-32 pb-16 lg:pb-20 overflow-hidden">

      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:pr-12 lg:pl-16">

        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">

          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col space-y-6 lg:space-y-8 relative z-20">

            <h1
              className="text-slate-900 font-black tracking-tighter leading-[1.05] lg:leading-[0.95] text-5xl sm:text-7xl lg:text-[6.5rem]"
              style={{ fontFamily: font }}
            >
              Stop <br className="hidden lg:block" />
              Losing <br className="hidden lg:block" />
              Leads to <br />
              <span className="text-emerald-600">Your Inbox.</span>
            </h1>

            {/* Mobile scrapbook rendering natively here if screen is small */}
            <div className="block lg:hidden my-4">
              <ScrapbookCollage />
            </div>

            <p className="text-slate-700 font-bold leading-relaxed text-lg lg:text-xl max-w-md border-l-4 border-emerald-500/80 pl-5">
              Lead2Project replaces your contact form with one branded link that captures photos, details, and job info — all on one dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup" passHref>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4.5 h-14 rounded-xl font-black uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer text-center"
                  >
                    Get Started Free
                    <ArrowRight size={16} strokeWidth={3} />
                  </motion.div>
                </Link>

                <Link href="/demo" passHref>
                  <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 px-8 py-4.5 h-14 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer text-center shadow-sm"
                  >
                    <Play size={14} fill="currentColor" className="text-emerald-600" />
                    Try Demo
                  </motion.div>
                </Link>
              </div>

              <p className="text-xs text-slate-400 font-bold tracking-wide">
                No credit card · 2 minute setup · Cancel anytime
              </p>
            </div>
          </div>

          {/* RIGHT CONTENT COLUMN (Desktop) */}
          <div className="hidden lg:block w-full">
            <ScrapbookCollage />
          </div>

        </div>
      </div>
    </section>
  );
}