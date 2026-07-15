'use client';

import { motion } from 'framer-motion';
import { 
  Phone, 
  MessageSquare, 
  FileSpreadsheet, 
  ChevronDown, 
  AlertTriangle,
  Wifi,
  Battery,
  User,
  Plus
} from 'lucide-react';

const font = "'Nunito', sans-serif";

// ==========================================
// PHONE 1: Overwhelmed Lockscreen (Slanted Left)
// ==========================================
function OverwhelmedPhone() {
  const mockTime = "11:42";
  return (
    <div className="relative mx-auto w-full max-w-[260px] aspect-[9/18.5] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 p-2 shadow-[-20px_20px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-black rounded-full z-30" />

      <div className="relative flex-1 w-full h-full rounded-[32px] bg-slate-900 overflow-hidden flex flex-col justify-between pt-5 pb-3 px-2 select-none">
        
        {/* High-Contrast Status Bar */}
        <div className="flex justify-between items-center px-3 py-0.5 text-white text-[10px] font-black tracking-tight shrink-0">
          <span>{mockTime}</span>
          <div className="flex items-center gap-1">
            <Wifi size={10} strokeWidth={3} />
            <Battery size={12} className="ml-0.5" />
          </div>
        </div>

        {/* Time & Notifications */}
        <div className="flex-1 flex flex-col pt-3">
          <div className="text-center mb-5">
            <span className="text-3xl font-bold text-white tracking-tight">{mockTime}</span>
            <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest mt-0.5">Wednesday, July 15</p>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[220px] px-1">
            {/* Missed Call */}
            <div className="bg-black border-2 border-rose-500 rounded-xl p-2.5 shadow-lg text-left flex gap-2.5 items-start">
              <div className="h-6 w-6 rounded bg-rose-500 flex items-center justify-center text-white shrink-0">
                <Phone size={12} strokeWidth={3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-rose-400 uppercase tracking-wider">Missed Call</span>
                  <span className="text-[8px] font-extrabold text-slate-300">3m ago</span>
                </div>
                <p className="text-[11px] font-black text-white mt-0.5">(631) 555-0142</p>
              </div>
            </div>

            {/* Lead SMS */}
            <div className="bg-black border-2 border-amber-500 rounded-xl p-2.5 shadow-lg text-left flex gap-2.5 items-start">
              <div className="h-6 w-6 rounded bg-amber-500 flex items-center justify-center text-black shrink-0">
                <MessageSquare size={12} strokeWidth={3} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider">New SMS Lead</span>
                  <span className="text-[8px] font-extrabold text-slate-300">12m ago</span>
                </div>
                <p className="text-[11px] font-black text-white mt-0.5">Mike Ross</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-20 h-1 bg-white rounded-full mx-auto shrink-0 z-20" />
      </div>
    </div>
  );
}

// ==========================================
// LAPTOP: Real Light-Mode Spreadsheet (Center Focus)
// ==========================================
function SpreadsheetLaptop() {
  return (
    <div className="relative w-full max-w-[520px] mx-auto z-20">
      {/* Screen Frame */}
      <div className="relative rounded-t-2xl border-[12px] border-b-0 border-slate-900 bg-slate-100 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
        
        {/* Google Sheets / Excel Mock */}
        <div className="bg-white min-h-[250px] sm:min-h-[280px] flex flex-col">
          {/* Header Controls */}
          <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-350" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-350" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-350" />
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 border-b-transparent px-4 py-1.5 rounded-t-md text-[10px] font-black text-slate-850 relative top-[9px]">
              <FileSpreadsheet size={12} className="text-emerald-650 text-emerald-600" />
              Contractor_Leads_2026.xlsx
            </div>
            <div className="w-10" />
          </div>

          {/* Clean Grid Table */}
          <div className="p-4 flex-1 overflow-x-auto bg-white mt-2">
            <table className="w-full text-left border-collapse border border-slate-300 rounded-lg overflow-hidden text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black border-b border-slate-300">
                  <th className="p-2.5 border-r border-slate-300">Client Name</th>
                  <th className="p-2.5 border-r border-slate-300">Phone Number</th>
                  <th className="p-2.5">Lead Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-900 font-bold">
                <tr className="hover:bg-slate-50/50">
                  <td className="p-2.5 border-r border-slate-300 font-black">Dave Miller</td>
                  <td className="p-2.5 border-r border-slate-300 font-mono text-[9.5px]">516-555-0192</td>
                  <td className="p-2.5">
                    <span className="inline-block bg-amber-100 border border-amber-300 text-amber-800 text-[8.5px] font-black px-2 py-0.5 rounded">
                      Unassigned Quote
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="p-2.5 border-r border-slate-300 font-black">John K.</td>
                  <td className="p-2.5 border-r border-slate-300 font-mono text-[9.5px]">631-555-4411</td>
                  <td className="p-2.5">
                    <span className="inline-block bg-rose-100 border border-rose-300 text-rose-800 text-[8.5px] font-black px-2 py-0.5 rounded">
                      Never Replied
                    </span>
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-2.5 border-r border-slate-300 text-slate-400 italic">No Name Added</td>
                  <td className="p-2.5 border-r border-slate-300 font-mono text-[9.5px] text-slate-400">---</td>
                  <td className="p-2.5">
                    <span className="inline-flex items-center gap-1 bg-red-100 border border-red-300 text-red-800 text-[8.5px] font-black px-2 py-0.5 rounded">
                      <AlertTriangle size={10} /> LOST BACKLOG
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-looking Yellow Sticky Note */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: -4 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className="absolute right-4 bottom-4 bg-[#FFE033] p-3 rounded shadow-[0_15px_30px_rgba(0,0,0,0.35)] border border-yellow-450 max-w-[130px] text-left z-20"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-500/20" />
          <p className="text-black text-[10px] font-black leading-tight pt-1">
            Call Tom back today!
          </p>
          <span className="font-mono text-slate-900 text-[9px] block mt-0.5 font-black">631-555-0199</span>
          <span className="text-amber-950 text-[7px] font-black uppercase tracking-wider block mt-2 border-t border-yellow-500/30 pt-1">
            Urgent Deck Quote
          </span>
        </motion.div>
      </div>

      {/* Hardware Base */}
      <div className="relative h-3 bg-slate-300 border-2 border-t-0 border-slate-400 rounded-b-md" />
      <div className="relative h-1.5 mx-[12%] bg-slate-800 rounded-b-xl -mt-px" />
    </div>
  );
}

// ==========================================
// PHONE 2: Died-Out Chat (Slanted Right)
// ==========================================
function DiedOutSmsPhone() {
  return (
    <div className="relative mx-auto w-full max-w-[260px] aspect-[9/18.5] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 p-2 shadow-[20px_20px_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-black rounded-full z-30" />

      <div className="relative flex-1 w-full h-full rounded-[32px] bg-white overflow-hidden flex flex-col justify-between pt-5 pb-3 px-2 select-none">
        
        {/* iOS Status Bar */}
        <div className="flex justify-between items-center px-3 py-0.5 text-slate-950 z-20 text-[10px] font-black tracking-tight shrink-0">
          <span>11:42</span>
          <div className="flex items-center gap-1">
            <Wifi size={10} strokeWidth={3} className="text-slate-950" />
            <Battery size={12} className="ml-0.5 text-slate-950" />
          </div>
        </div>

        {/* Chat Header */}
        <div className="border-b border-slate-200 py-2 flex items-center justify-center gap-1.5 shrink-0">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
            <User size={12} className="text-slate-605 text-slate-600" />
          </div>
          <span className="text-[10px] font-black text-slate-950">John K. (Prospect)</span>
        </div>

        {/* Message Flows */}
        <div className="flex-1 p-2 space-y-3 flex flex-col justify-end text-left">
          <div className="self-start max-w-[85%] bg-slate-100 rounded-2xl rounded-tl-none p-2.5 text-slate-950 text-[10px] font-black leading-relaxed">
            "Hey, looking to replace my front porch roof before the fall. Can you swing by for a quote today?"
          </div>

          <div className="text-center text-[8px] text-slate-400 font-black uppercase py-0.5">
            5 Hours Later
          </div>

          <div className="self-end max-w-[85%] bg-emerald-650 bg-emerald-600 rounded-2xl rounded-tr-none p-2.5 text-white text-[10px] font-black leading-relaxed">
            "Hey John, sorry, just saw this. I can come out on Saturday afternoon?"
          </div>

          <div className="text-right text-[8px] text-rose-600 font-black uppercase py-1 bg-rose-50 border border-rose-200 rounded text-center">
            John went with another contractor
          </div>
        </div>

        {/* iOS Typing Area */}
        <div className="bg-slate-50 border-t border-slate-200 p-1.5 flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-500">
            <Plus size={12} strokeWidth={2.5} />
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-full px-3 py-1 text-[10px] text-slate-400 font-black">
            iMessage
          </div>
        </div>

        <div className="w-20 h-1 bg-slate-400 rounded-full mx-auto shrink-0 z-20 mt-1" />
      </div>
    </div>
  );
}

// ==========================================
// MINIMALIST HERO / INTERFACE
// ==========================================
export default function ProblemSection() {
  return (
    <section className="relative bg-[#06070B] py-20 lg:py-28 overflow-hidden border-b border-slate-900">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title Only - High Contrast & Extremely Punchy */}
        <div className="text-center mb-16 sm:mb-24">
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tighter leading-none max-w-3xl mx-auto"
            style={{ fontFamily: font }}
          >
            This is how you get leads today.
          </h2>
        </div>

        {/* 3D Slanted Device Array - The Images Tell the Whole Story */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Left Device: Slanted Inward Right */}
          <div className="md:col-span-3 flex justify-center md:[transform:rotateY(16deg)_rotateX(4deg)] transition-transform duration-550 hover:transform-none">
            <OverwhelmedPhone />
          </div>

          {/* Center Device: Flat, Clean and Dominant Laptop */}
          <div className="md:col-span-6 flex justify-center z-20">
            <SpreadsheetLaptop />
          </div>

          {/* Right Device: Slanted Inward Left */}
          <div className="md:col-span-3 flex justify-center md:[transform:rotateY(-16deg)_rotateX(4deg)] transition-transform duration-550 hover:transform-none">
            <DiedOutSmsPhone />
          </div>

        </div>

        {/* Downward Transition Arrow */}
        <div className="flex flex-col items-center text-center mt-20 sm:mt-24 max-w-xl mx-auto">
  <p className="text-slate-400 font-bold text-sm sm:text-base leading-relaxed mb-1">
    Missed calls. Dead threads. A spreadsheet nobody updates.
  </p>
  <p className="text-white font-black text-xl sm:text-2xl tracking-tight mb-6" style={{ fontFamily: font }}>
    Why not send one link instead?
  </p>
  <ChevronDown size={20} className="text-slate-600 animate-bounce" />
</div>

      </div>
    </section>
  );
}