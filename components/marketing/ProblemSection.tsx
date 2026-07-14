'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Phone, MessageCircle, FileSpreadsheet } from 'lucide-react';

const font = "'Nunito', sans-serif";

function MissedCall() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, rotate: -2, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
          <Phone className="w-3.5 h-3.5 text-red-500" />
        </div>
        <div>
          <p className="text-slate-900 text-[11px] font-bold">Missed Call</p>
          <p className="text-slate-400 text-[9px]">(631) 555-0142</p>
        </div>
      </div>
      <p className="text-slate-400 text-[9px]">Today 2:47 PM · 3 min ago</p>
      <div className="mt-2 flex gap-1.5">
        <div className="flex-1 bg-red-50 text-red-500 text-[9px] font-bold text-center py-1 rounded-lg">Missed</div>
        <div className="flex-1 bg-slate-100 text-slate-500 text-[9px] font-bold text-center py-1 rounded-lg">Call Back</div>
      </div>
    </motion.div>
  );
}

function TextMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, rotate: 1.5, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-2xl p-3.5 shadow-xl border border-slate-200"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div>
          <p className="text-slate-900 text-[11px] font-bold">Mike R.</p>
          <p className="text-slate-400 text-[9px]">Text message · now</p>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
        <p className="text-slate-700 text-[10px] leading-relaxed">Hey I found you on google, need a roof estimate. Address is 42 Oak...</p>
      </div>
      <div className="mt-1.5 bg-emerald-50 rounded-lg p-1.5 text-center">
        <p className="text-emerald-600 text-[9px] font-bold">Unread</p>
      </div>
    </motion.div>
  );
}

function ExcelSpreadsheet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      whileInView={{ opacity: 1, rotate: -1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-xl p-3 shadow-xl border border-slate-200"
    >
      <div className="flex items-center gap-1.5 mb-2 px-0.5">
        <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
        <span className="text-slate-600 text-[9px] font-bold truncate">Leads_Backup_FINAL_v3.xlsx</span>
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden text-[8px]">
        <div className="grid grid-cols-3 bg-slate-100 text-slate-500 font-bold p-1 border-b border-slate-200">
          <div>Name</div>
          <div>Phone</div>
          <div>Notes</div>
        </div>
        <div className="divide-y divide-slate-100 font-mono text-slate-600">
          <div className="grid grid-cols-3 p-1 bg-white">
            <div className="truncate font-sans text-slate-900">Dave Miller</div>
            <div className="truncate">516-555-0192</div>
            <div className="truncate text-amber-600">lost quote??</div>
          </div>
          <div className="grid grid-cols-3 p-1 bg-slate-50">
            <div className="truncate font-sans text-slate-900">John K.</div>
            <div className="truncate">631-555-4411</div>
            <div className="truncate text-slate-400">no reply</div>
          </div>
          <div className="grid grid-cols-3 p-1 bg-white">
            <div className="truncate font-sans text-slate-900">Unassigned</div>
            <div className="truncate">---</div>
            <div className="truncate text-rose-500 font-sans font-bold">CALL BACK</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StickyNote() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      whileInView={{ opacity: 1, rotate: 3, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center"
    >
      <div className="bg-yellow-300 p-3.5 shadow-lg border border-yellow-400/40 rounded-sm w-full max-w-[160px]">
        <p className="text-yellow-950 text-[11px] font-bold leading-snug tracking-tight">
          Call back<br />
          Tom - deck job<br />
          631-555-0199<br />
          <span className="text-yellow-700 text-[9px] block mt-1 font-medium">← forgot to call</span>
        </p>
      </div>
    </motion.div>
  );
}

export default function ProblemSection() {
  return (
    <section className="bg-slate-700 py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">

          {/* LEFT: the problem — header + contained cards */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="mb-2 inline-block text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-rose-300">
                The Status Quo
              </span>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.15]"
                style={{ fontFamily: font }}
              >
                This is how you get leads today.
              </h2>
            </div>

            <div className="bg-slate-800/50 rounded-3xl border border-white/10 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <MissedCall />
                <TextMessage />
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <ExcelSpreadsheet />
                <StickyNote />
              </div>
            </div>
          </div>

          {/* RIGHT: the fix — header + real product screenshot */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                <ArrowRight size={12} strokeWidth={3} /> The Fix
              </span>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.15]"
                style={{ fontFamily: font }}
              >
                This is how it <span className="text-amber-400">should</span> look.
              </h3>
              <p className="text-slate-300 font-bold text-sm sm:text-base leading-relaxed mt-2">
                Every entry routes directly into one clean card interface. No missed texts, no forgotten schedules.
              </p>
            </div>

          <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="w-full"
            >
              <Image
                src="/images/hero-image-laptop.webp"
                alt="Lead2Project real dashboard showing tracked jobs"
                width={1400}
                height={1000}
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}