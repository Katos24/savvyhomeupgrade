'use client';

import { motion } from 'framer-motion';
import { Phone, MessageSquare, FileSpreadsheet, ChevronDown, Clock, AlertCircle } from 'lucide-react';

const font = "'Nunito', sans-serif";

// ==========================================
// 1. Sleek iOS-Style Missed Call (Dark Glass)
// ==========================================
function MissedCall() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, rotate: -1.5, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0D111C]/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800/80 hover:border-rose-500/30 transition-all duration-300 group"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
          <Phone className="w-4 h-4 text-rose-450 text-rose-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white text-xs font-black tracking-tight">Missed Call</span>
            <span className="text-slate-400 text-[9px] font-semibold flex items-center gap-1">
              <Clock size={10} /> 3m ago
            </span>
          </div>
          <p className="text-slate-200 text-[11px] font-extrabold mt-0.5">(631) 555-0142</p>
          <p className="text-slate-450 text-slate-400 text-[10px] mt-1 italic">Left no voicemail</p>
        </div>
      </div>
      
      <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex gap-2">
        <button className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-extrabold text-center py-1.5 rounded-lg transition-colors cursor-pointer">
          Callback
        </button>
        <button className="flex-1 bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 text-[10px] font-extrabold text-center py-1.5 rounded-lg transition-colors cursor-pointer">
          Ignore
        </button>
      </div>
    </motion.div>
  );
}

// ==========================================
// 2. Translucent Dark SMS Message
// ==========================================
function TextMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, rotate: 2, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0D111C]/90 backdrop-blur-md rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800/80 hover:border-emerald-500/30 transition-all duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white text-xs font-black tracking-tight">Mike Ross</span>
            <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              Unread
            </span>
          </div>
          <p className="text-slate-400 text-[9px] font-bold">SMS • 12 mins ago</p>
        </div>
      </div>

      <div className="mt-3 bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5">
        <p className="text-slate-300 text-[10px] leading-relaxed font-semibold">
          "Hey, got your number from Google. I need a clean roof estimate asap. Address is 42 Oak Rd..."
        </p>
      </div>
    </motion.div>
  );
}

// ==========================================
// 3. SaaS / Dark-Grid Spreadsheet
// ==========================================
function ExcelSpreadsheet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, rotate: -1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#0D111C]/90 rounded-2xl p-4 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-slate-800/80"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-slate-200 text-[11px] font-black truncate">Leads_Backup_v3.xlsx</span>
        </div>
        <span className="text-slate-500 text-[9px] font-black uppercase tracking-wider">Draft Sheets</span>
      </div>

      <div className="border border-slate-800/80 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-[#111625] text-slate-400 text-[8px] font-black uppercase tracking-wider p-2 border-b border-slate-800">
          <div>Client</div>
          <div>Contact</div>
          <div>Status Tag</div>
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-slate-800/40 text-[10px] font-semibold text-slate-300">
          <div className="grid grid-cols-3 p-2 bg-[#0D111C]/40 items-center">
            <span className="text-white font-bold truncate">Dave Miller</span>
            <span className="font-mono text-slate-400 text-[9px]">516-555-0192</span>
            <div>
              <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                lost quote?
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 p-2 bg-[#111625]/20 items-center">
            <span className="text-white font-bold truncate">John K.</span>
            <span className="font-mono text-slate-400 text-[9px]">631-555-4411</span>
            <div>
              <span className="inline-block bg-slate-800 text-slate-450 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                no reply
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 p-2 bg-[#0D111C]/40 items-center">
            <span className="text-slate-550 text-slate-500 italic truncate">Unassigned</span>
            <span className="font-mono text-slate-600 text-[9px]">---</span>
            <div>
              <span className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black px-1.5 py-0.5 rounded-md">
                <AlertCircle size={8} /> BACKLOG
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 4. Glowing Tactile Neon Sticky Note
// ==========================================
function StickyNote() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      whileInView={{ opacity: 1, rotate: 3.5, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center w-full"
    >
      {/* Dynamic ambient back-glow behind the note */}
      <div className="relative bg-[#FFE17D] p-4 rounded-[2px] w-full max-w-[170px] shadow-[0_20px_45px_rgba(255,225,125,0.07),5px_15px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-yellow-300/20">
        
        {/* Soft simulated shadow overlay of sticky edge */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-yellow-400/20" />

        <p className="text-[#3A2400] text-[11px] font-black leading-normal tracking-tight pt-1">
          Call Back Tom<br />
          <span className="text-[10px] font-extrabold text-[#5C3E00] block mt-1">• Deck Job Proposal</span>
          <span className="font-mono font-bold text-[#7A5300] text-[10px] block mt-0.5">631-555-0199</span>
        </p>

        <div className="mt-4 pt-2 border-t border-[#3A2400]/10 flex items-center justify-between">
          <span className="text-[#8F6100] text-[8px] font-black uppercase tracking-wider">
            🚨 Urgent
          </span>
          <span className="text-[#8F6100]/80 text-[8px] font-bold">forgot to call</span>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 5. High-Contrast Dark Problem Section
// ==========================================
export default function ProblemSection() {
  return (
    <section className="relative bg-[#06070B] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-slate-900">
      
      {/* Cyberpunk style radial ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Crisp dark-mode dot grid texture */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 py-1 shadow-sm mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-450 text-rose-400">
              The Daily Headache
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl font-black text-white tracking-tighter leading-[1.08] max-w-2xl mx-auto"
            style={{ fontFamily: font }}
          >
            Stop fighting to keep track of <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">scattered leads.</span>
          </h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed mt-4 max-w-xl mx-auto">
            Missed calls, random text threads, sticky notes falling off your monitor, and obsolete spreadsheets. It&apos;s almost impossible to secure jobs when your intake pipeline is this fragmented.
          </p>
        </div>

        {/* Outer Dark Sandbox Container */}
        <div className="relative bg-[#090B11]/80 rounded-3xl border border-slate-800/80 p-5 sm:p-7 max-w-2xl mx-auto shadow-[20px_40px_80px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <MissedCall />
            <TextMessage />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            <div className="sm:col-span-7">
              <ExcelSpreadsheet />
            </div>
            <div className="sm:col-span-5 flex justify-center">
              <StickyNote />
            </div>
          </div>
        </div>

        {/* Visual Downward transition marker */}
        <motion.div
          className="flex flex-col items-center gap-1.5 mt-12 sm:mt-16"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Discover the streamlined way
          </span>
          <ChevronDown size={15} className="text-slate-600" />
        </motion.div>

      </div>
    </section>
  );
}