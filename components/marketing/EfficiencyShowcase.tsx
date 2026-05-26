'use client';

import { motion } from 'framer-motion';
import {
  List,
  Calendar,
  Send,
  SlidersHorizontal,
  Sparkles,
  Download,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ExternalLink
} from 'lucide-react';

const font = "'Nunito', sans-serif";

/* ─────────────────────────────────────
   1. DATA-DENSE DATA TABLE PREVIEW
   ───────────────────────────────────── */
function TablePreview() {
  const leads = [
    { name: 'John Smith', status: 'Scheduled', category: 'Roof Repair', amount: '$5,750', time: '8:30 AM' },
    { name: 'Sarah Kim', status: 'Quoted', category: 'Leak Detect', amount: '$1,200', time: '2:15 PM' },
    { name: 'Mike Davis', status: 'New Lead', category: 'Inspection', amount: '$450', time: 'Just now' },
    { name: 'Alex Cooper', status: 'In Progress', category: 'Siding Fix', amount: '$3,800', time: 'Yesterday' }
  ];

  const statusColors: Record<string, string> = {
    'New Lead': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Quoted: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Scheduled: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'In Progress': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-white/[0.08] overflow-hidden shadow-inner w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.05] bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[9px] font-bold text-slate-400">
            <Filter size={8} /> Filter
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-[9px] font-bold text-slate-400">
            <ArrowUpDown size={8} /> Sort
          </div>
        </div>
        <span className="text-[8px] font-mono text-slate-500">Active Database View</span>
      </div>
      <div className="p-2 space-y-1.5 bg-slate-900/40">
        {leads.map((lead) => (
          <div key={lead.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-white/[0.03] hover:border-white/[0.08] transition-colors">
            <div>
              <p className="text-[10px] font-black text-white" style={{ fontFamily: font }}>{lead.name}</p>
              <p className="text-[8px] text-slate-400 font-bold flex items-center gap-1">
                <span>{lead.category}</span>
                <span className="text-slate-600">•</span>
                <span>{lead.time}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${statusColors[lead.status]}`}>
                {lead.status}
              </span>
              <p className="text-[10px] font-mono font-black text-slate-300">{lead.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   2. RICH MASTER DISPATCH CALENDAR PREVIEW
   ───────────────────────────────────── */
function CalendarPreview() {
  const scheduleDays = [
    {
      date: 'TUE 20',
      slots: [
        { client: 'J. Smith', time: '8:30 AM', tech: 'Crew A', bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400' },
        { client: 'R. Garcia', time: '1:00 PM', tech: 'Crew B', bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400' }
      ]
    },
    {
      date: 'WED 21',
      slots: [
        { client: 'M. Davis', time: '10:00 AM', tech: 'Crew A', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
        { client: 'P. Huber', time: '3:30 PM', tech: 'Crew C', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400' }
      ]
    },
    {
      date: 'THU 22',
      slots: [
        { client: 'D. Reyes', time: '11:15 AM', tech: 'Crew B', bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400' },
        { client: 'L. Evans', time: '4:00 PM', tech: 'Crew A', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400' }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <span className="text-[10px] font-black text-slate-900" style={{ fontFamily: font }}>May 2026</span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-bold text-slate-400 px-1.5 py-0.5">Day</span>
          <span className="text-[8px] bg-slate-950 text-white font-black px-1.5 py-0.5 rounded shadow-sm">Week</span>
          <span className="text-[8px] font-bold text-slate-400 px-1.5 py-0.5">Month</span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
        {scheduleDays.map((col) => (
          <div key={col.date} className="p-1.5 min-h-[145px] space-y-1.5">
            <p className="text-[8px] font-black text-slate-400 text-center tracking-wider pb-1 border-b border-slate-50" style={{ fontFamily: font }}>
              {col.date}
            </p>
            <div className="space-y-1">
              {col.slots.map((slot, i) => (
                <div key={i} className={`p-1.5 rounded-lg border flex flex-col justify-between ${slot.bg}`}>
                  <div className="flex justify-between items-start gap-1">
                    <p className="text-[9px] font-black tracking-tight truncate leading-none">{slot.client}</p>
                    <span className="text-[6px] font-mono opacity-80 shrink-0 leading-none">{slot.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[6px] opacity-90 font-bold border-t border-current/10 pt-1">
                    <User size={6} />
                    <span>{slot.tech}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   3. VERIFIED OUTBOX ROUTING LOG PREVIEW
   ───────────────────────────────────── */
function OutboxPreview() {
  const logs = [
    { user: 'John Smith', action: 'Quote Estimate Shared', status: 'Delivered', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '12m ago' },
    { user: 'Sarah Kim', action: 'Appointment Confirmed', status: 'Opened', color: 'text-blue-600 bg-blue-50 border-blue-100', time: '1h ago' },
    { user: 'Mike Davis', action: 'Retainer Balance Request', status: 'Delivered', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '3h ago' },
    { user: 'Tom Harris', action: 'Review Follow-up Sent', status: 'Processing', color: 'text-slate-500 bg-slate-50 border-slate-100', time: 'Just now' }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 space-y-1.5 w-full shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Send size={10} className="text-slate-500" />
          <span className="text-[9px] font-black text-slate-800 tracking-tight" style={{ fontFamily: font }}>Live Outbox Ledger</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold">
          <Clock size={8} /> Real-time
        </div>
      </div>
      <div className="space-y-1 max-h-[140px] overflow-hidden">
        {logs.map((log, index) => (
          <div key={index} className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="truncate pr-2">
              <div className="flex items-center gap-1.5">
                <p className="text-[9px] font-black text-slate-900 truncate" style={{ fontFamily: font }}>{log.user}</p>
                <span className="text-[7px] text-slate-400 font-bold">{log.time}</span>
              </div>
              <p className="text-[8px] text-slate-500 font-medium truncate mt-0.5">{log.action}</p>
            </div>
            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border flex-shrink-0 tracking-wider ${log.color}`}>
              {log.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   4. CONTEXTUAL AI INGEST PIPELINE PREVIEW
   ───────────────────────────────────── */
function AIPreview() {
  return (
    <div className="bg-slate-950 rounded-xl border border-white/[0.08] p-3 space-y-2.5 w-full shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-2">
        <div className="flex items-center gap-1.5 text-emerald-400 font-black">
          <Sparkles size={11} className="animate-pulse" />
          <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: font }}>AI Intake Assistant</span>
        </div>
        <span className="text-[7px] font-mono text-slate-500 bg-white/[0.02] border border-white/[0.05] px-1 rounded">Model 4.0</span>
      </div>
      <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-lg p-2.5">
        <p className="text-[9px] text-emerald-400/90 font-bold leading-relaxed">
          &ldquo;Homeowner uploaded 3 photos showing clear asphalt shingle decay on north valley slope. House age matches 2011 builder standard. Insurance project open. Action item: Dispatch replacement quote packet.&rdquo;
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-md">
          <span className="text-[7px] font-black text-slate-500 block uppercase">Confidence</span>
          <span className="text-[9px] font-black text-white">98.4%</span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] p-1.5 rounded-md">
          <span className="text-[7px] font-black text-slate-500 block uppercase">Flag Target</span>
          <span className="text-[9px] font-black text-amber-400">High-Value Replace</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────── */
export default function OperationsShowcase() {
  return (
    <section id="showcase" className="py-24 sm:py-28 lg:py-36 bg-slate-50 relative overflow-hidden">
      
      {/* Structural Micro Matrix Canvas Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* INTELLECTUAL VALUE HEADER */}
        <div className="max-w-2xl mb-16 sm:mb-24">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
            style={{ fontFamily: font }}
          >
            Beyond the board view
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight"
            style={{ fontFamily: font }}
          >
            The rest of your office <br />
            <span className="text-emerald-600">operations. Solved.</span>
          </motion.h2>
        </div>

        {/* HIGH-FIDELITY BENTO GRID MATRIX */}
        <div 
          className="flex md:grid flex-nowrap md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch overflow-x-auto md:overflow-visible pb-6 md:pb-0 snap-x snap-mandatory scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          
          {/* CARD 1: DATABASE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div className="mb-6">
              <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center mb-4 border border-sky-100">
                <List size={16} className="text-sky-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Complete Data Tables
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed" style={{ fontFamily: font }}>
                Filter by status, project value, or assigned technician. Bulk edit 50 distinct requests in a single select window.
              </p>
            </div>
            <TablePreview />
          </motion.div>

          {/* CARD 2: DISPATCH CALENDAR */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div className="mb-6">
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center mb-4 border border-rose-100">
                <Calendar size={16} className="text-rose-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Master Dispatch Calendar
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed" style={{ fontFamily: font }}>
                Map your field schedule cleanly across standard day, week, or monthly tracks. Know precisely which crew is allocated where.
              </p>
            </div>
            <CalendarPreview />
          </motion.div>

          {/* CARD 3: COMMUNICATIONS LOG */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div className="mb-6">
              <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center mb-4 border border-violet-100">
                <Send size={16} className="text-violet-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Verified Email Outbox
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed" style={{ fontFamily: font }}>
                Track every line-item quote, text response, and confirmation alert with permanent timestamps and precise receipt statuses.
              </p>
            </div>
            <OutboxPreview />
          </motion.div>

          {/* CARD 4: PIPELINE ARCHITECTURE */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
                <SlidersHorizontal size={16} className="text-amber-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Custom Pipelines
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4" style={{ fontFamily: font }}>
                Rearrange, alter, or inject step milestones into your dashboard engine to match exactly how your back office prefers to operate.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-700">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>Custom Intake Milestones Applied</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 line-through">
                <AlertCircle size={12} className="text-slate-300 shrink-0" />
                <span>Generic CRM Presets</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 5: ASSIST ENGINES */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div className="mb-4">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 border border-emerald-100">
                <Sparkles size={16} className="text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Contextual AI Briefs
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed" style={{ fontFamily: font }}>
                Synthesize messy paragraphs and text dumps from client uploads into clean, structured operational intelligence profiles instantly.
              </p>
            </div>
            <AIPreview />
          </motion.div>

          {/* CARD 6: EXPORT CONTROL */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="min-w-[85vw] md:min-w-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between snap-center"
          >
            <div>
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center mb-4 border border-slate-200/60">
                <Download size={16} className="text-slate-600" />
              </div>
              <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5" style={{ fontFamily: font }}>
                Clean CSV Portability
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed" style={{ fontFamily: font }}>
                Your data is yours. Download your historical customer databases instantly at any time for bookkeeping, text lists, or external audits.
              </p>
            </div>
            <div className="border border-dashed border-slate-200 bg-slate-50/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center">
              <p className="text-[10px] text-slate-700 font-black">leads_export_2026.csv</p>
              <span className="text-[8px] bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                Download Available 24/7 <ExternalLink size={8} />
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}