'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

/* ───────────────────────────────────────────
   EXPANDED SCRAPBOOK COLLAGE ON A WOOD DESK
   ─────────────────────────────────────────── */
function ScrapbookCollage() {
  return (
    <div className="relative w-full max-w-[620px] h-[440px] sm:h-[500px] lg:h-[540px] rounded-2xl p-6 overflow-hidden border border-amber-950/20 shadow-2xl mx-auto lg:ml-auto lg:mr-0 group bg-cover bg-center">
      
      {/* Premium Rich Walnut Wood Grain Background Effect */}
      <div 
        className="absolute inset-0 z-0 bg-[#2C1A10] mix-blend-normal opacity-95 transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(30,16,8,0.15) 0%, rgba(65,39,22,0.15) 50%, rgba(30,16,8,0.15) 100%),
            repeating-linear-gradient(0deg, rgba(20,10,5,0.04) 0px, rgba(20,10,5,0.04) 2px, transparent 2px, transparent 4px),
            linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)
          `
        }}
      />

      {/* Dynamic Ambient Job-Site Lighting Highlight overlay */}
      <div className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-amber-100/10 blur-[80px] pointer-events-none z-10" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none z-10" />

      {/* 1. Inbox Window (Left Top Layer) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-[8%] left-[5%] w-[200px] sm:w-[230px] z-20 -rotate-[3deg]"
      >
        <div className="bg-white/95 border border-slate-200/80 rounded-xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <div className="text-[11px] font-black text-slate-900">Inbox (47)</div>
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
                <div className="flex items-center gap-1.5 truncate">
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

      {/* 2. Old Contact Form Window (Right Top Layer) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-[12%] right-[5%] w-[190px] sm:w-[215px] z-10 rotate-[4deg]"
      >
        <div className="bg-white/95 border border-slate-200/80 rounded-xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2.5">Old Contact Form</div>
          <div className="space-y-2">
            <div className="h-6.5 bg-slate-50 rounded-md border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Full Name</span>
            </div>
            <div className="h-6.5 bg-slate-50 rounded-md border border-slate-100 flex items-center px-2">
              <span className="text-[10px] font-bold text-slate-400">Email Address</span>
            </div>
            <div className="h-10 bg-slate-50 rounded-md border border-slate-100 flex items-start p-1.5">
              <span className="text-[10px] font-bold text-slate-400">Job Details...</span>
            </div>
            <div className="h-6.5 bg-rose-500 rounded-md flex items-center justify-center shadow-sm">
              <span className="text-[10px] text-white font-black uppercase tracking-wide">Lost in Inbox</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Linen Sticky Note (Left Middle Layer) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute top-[46%] left-[7%] z-30 rotate-[8deg]"
      >
        <div
          className="w-[115px] h-[100px] rounded-sm p-3 border border-amber-200/40 flex flex-col justify-between shadow-[3px_6px_16px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: '#FFFDF2', fontFamily: 'monospace' }}
        >
          <div className="text-[10px] text-amber-900 font-bold tracking-tight leading-tight">
            // CALL BACK<br />
            John - leak info<br />
            555-0142
          </div>
          <div className="text-[8px] text-amber-700/80 font-bold text-right border-t border-amber-200/20 pt-1">
            Tuesday?
          </div>
        </div>
      </motion.div>

      {/* 4. Live Text Thread (Center Window) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-[42%] left-[40%] w-[155px] sm:w-[175px] z-40 -rotate-[1deg]"
      >
        <div className="bg-white/95 border border-slate-200/80 rounded-xl p-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <div className="space-y-1.5">
            <div className="flex justify-end">
              <div className="bg-slate-900 rounded-lg rounded-tr-none px-2.5 py-1">
                <span className="text-[10px] text-white font-medium">I can come Thursday</span>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg rounded-tl-none px-2.5 py-1">
                <span className="text-[10px] text-slate-800 font-medium">ok how much?</span>
              </div>
            </div>
            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Read 3:42 PM</div>
          </div>
        </div>
      </motion.div>

      {/* 5. Muted Rose Sticky Note (Right Middle Layer) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute top-[54%] right-[6%] z-30 -rotate-[5deg]"
      >
        <div
          className="w-[120px] h-[100px] rounded-sm p-3 border border-rose-200/40 flex flex-col justify-between shadow-[-3px_6px_16px_rgba(0,0,0,0.3)]"
          style={{ backgroundColor: '#FFF0F2', fontFamily: 'monospace' }}
        >
          <div className="text-[10px] text-rose-950 font-bold tracking-tight leading-tight">
            CRITICAL:<br />
            Did I dispatch <br />
            the quote??
          </div>
          <div className="text-[8px] text-rose-600 font-bold uppercase tracking-wider">
            check email
          </div>
        </div>
      </motion.div>

      {/* 6. Dashboard Tracker Grid (Bottom Center Layer Layout) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-[6%] left-[8%] right-[8%] sm:left-[12%] sm:right-[12%] z-20 -rotate-[2deg]"
      >
        <div className="bg-white/95 border border-slate-200/90 rounded-xl overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="grid grid-cols-3 text-[9px] sm:text-[10px] text-slate-700">
            <div className="border-b border-r border-slate-100 bg-slate-50/80 px-2.5 py-2 font-black uppercase tracking-wider text-slate-400 scale-95 origin-left">Client</div>
            <div className="border-b border-r border-slate-100 bg-slate-50/80 px-2.5 py-2 font-black uppercase tracking-wider text-slate-400 scale-95 origin-left">Status</div>
            <div className="border-b border-slate-100 bg-slate-50/80 px-2.5 py-2 font-black uppercase tracking-wider text-slate-400 scale-95 origin-left">Invoice</div>
            
            <div className="border-b border-r border-slate-100 px-2.5 py-2 font-bold text-slate-900">John S</div>
            <div className="border-b border-r border-slate-100 px-2.5 py-2 text-amber-600 font-bold bg-amber-50/50">Pending</div>
            <div className="border-b border-slate-100 px-2.5 py-2 text-slate-400 font-medium">unsent</div>
            
            <div className="border-r border-slate-100 px-2.5 py-2 font-bold text-slate-900">Mike D</div>
            <div className="border-r border-slate-100 px-2.5 py-2 text-emerald-600 font-bold bg-emerald-50/50">Active</div>
            <div className="px-2.5 py-2 text-emerald-600 font-bold">Paid</div>
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
    <section className="relative bg-white pt-24 sm:pt-32 lg:pt-40 pb-16 lg:pb-24 overflow-hidden border-b border-slate-100">

      {/* Light-mode micro grid matrix layer */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">

          {/* LEFT CONTENT COLUMN */}
          <div className="flex flex-col space-y-6 lg:max-w-xl text-left">
           <h1
  className="text-slate-900 font-black tracking-tighter leading-[1.05] sm:leading-[1.02] lg:leading-[0.92] text-4xl sm:text-6xl lg:text-[5.4rem]"
  style={{ fontFamily: font }}
>
  Stop <br className="lg:hidden" />
  Losing <br className="hidden lg:block" />
  Jobs in <br className="lg:hidden" />
  <span className="text-emerald-600 block lg:inline">Your Inbox.</span>
</h1>

            <p className="text-slate-600 font-bold leading-relaxed text-base sm:text-lg lg:text-xl border-l-4 border-emerald-500 pl-4" style={{ fontFamily: font }}>
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

          {/* RIGHT CONTENT COLUMN — Bigger layout, wood grain contrast background */}
          <div className="w-full relative z-10 lg:pl-6">
            <ScrapbookCollage />
          </div>

        </div>
      </div>
    </section>
  );
}