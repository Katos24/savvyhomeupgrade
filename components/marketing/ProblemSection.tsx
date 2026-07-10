'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Phone, MessageCircle, Mic, User, Play, FileText, FileSpreadsheet } from 'lucide-react';

const font = "'Nunito', sans-serif";

function MissedCall() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, y: 20 }}
      whileInView={{ opacity: 1, rotate: -3, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[220px] sm:absolute top-[2%] left-[2%] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <Phone className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-white text-xs font-bold">Missed Call</p>
          <p className="text-slate-400 text-[10px]">(631) 555-0142</p>
        </div>
      </div>
      <p className="text-slate-500 text-[10px]">Today 2:47 PM · 3 min ago</p>
      <div className="mt-2 flex gap-2">
        <div className="flex-1 bg-red-500/20 text-red-400 text-[10px] font-bold text-center py-1.5 rounded-lg">Missed</div>
        <div className="flex-1 bg-slate-800 text-slate-400 text-[10px] font-bold text-center py-1.5 rounded-lg">Call Back</div>
      </div>
    </motion.div>
  );
}

function TextMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, rotate: 2, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[240px] sm:absolute top-[6%] right-[3%] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-20"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-white text-xs font-bold">Mike R.</p>
          <p className="text-slate-400 text-[10px]">Text message · now</p>
        </div>
      </div>
      <div className="bg-[#2a2a2e] rounded-xl p-3">
        <p className="text-white text-xs leading-relaxed">Hey I found you on google, I need a roof estimate. Can you come look at it? My address is 42 Oak...</p>
      </div>
      <div className="mt-2 bg-[#34c759]/10 rounded-xl p-2 text-center">
        <p className="text-[#34c759] text-[10px] font-bold">Unread</p>
      </div>
    </motion.div>
  );
}

function ExcelSpreadsheet() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, rotate: -1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:block absolute top-[22%] left-[34%] w-[270px] bg-[#1e1e24] rounded-xl p-3 shadow-2xl border border-white/5 z-10"
    >
      <div className="flex items-center gap-2 mb-2 px-1">
        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-slate-300 text-[10px] font-bold truncate">Leads_Backup_FINAL_v3.xlsx</span>
      </div>
      <div className="border border-slate-800 rounded-lg overflow-hidden text-[9px]">
        {/* Table Header */}
        <div className="grid grid-cols-3 bg-slate-800/80 text-slate-400 font-bold p-1.5 border-b border-slate-700">
          <div>Name</div>
          <div>Phone</div>
          <div>Notes</div>
        </div>
        {/* Rows */}
        <div className="divide-y divide-slate-800 font-mono text-slate-300">
          <div className="grid grid-cols-3 p-1.5 bg-slate-900/40">
            <div className="truncate font-sans text-white">Dave Miller</div>
            <div className="truncate">516-555-0192</div>
            <div className="truncate text-amber-400">lost quote??</div>
          </div>
          <div className="grid grid-cols-3 p-1.5 bg-slate-900/20">
            <div className="truncate font-sans text-white">John K.</div>
            <div className="truncate">631-555-4411</div>
            <div className="truncate text-slate-500">no reply</div>
          </div>
          <div className="grid grid-cols-3 p-1.5 bg-slate-900/40">
            <div className="truncate font-sans text-white">Unassigned</div>
            <div className="truncate">---</div>
            <div className="truncate text-rose-400 font-sans font-bold">CALL BACK</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmailInbox() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, rotate: -1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[260px] sm:absolute top-[42%] left-[4%] bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-30"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
          <span className="text-white text-[10px] font-black">M</span>
        </div>
        <span className="text-slate-900 text-xs font-bold">Gmail</span>
        <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">47</span>
      </div>
      <div className="space-y-2">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <div className="flex justify-between items-center">
            <p className="text-slate-900 text-[11px] font-black">Sarah Thompson</p>
            <p className="text-slate-400 text-[9px]">11:32 AM</p>
          </div>
          <p className="text-slate-600 text-[10px] font-bold">Website Form: New Estimate Request</p>
        </div>
      </div>
    </motion.div>
  );
}

function FacebookDM() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, rotate: 3, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[220px] sm:absolute top-[52%] right-[2%] bg-[#242526] rounded-2xl p-4 shadow-2xl border border-white/10 z-20 hidden md:block"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#1877f2] flex items-center justify-center">
          <span className="text-white text-[10px] font-black">f</span>
        </div>
        <span className="text-white text-xs font-bold">Messenger</span>
        <span className="ml-auto bg-[#1877f2] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">3</span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 items-start">
          <div className="w-6 h-6 rounded-full bg-orange-500/20 flex-shrink-0 flex items-center justify-center">
            <User className="w-3 h-3 text-orange-300" />
          </div>
          <div className="bg-[#3a3b3c] rounded-xl p-2 max-w-[170px]">
            <p className="text-white text-[10px] leading-relaxed">Do you guys do siding? Saw ur page. Need a quote ASAP</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Voicemail() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, rotate: -2, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[200px] sm:absolute bottom-[5%] left-[10%] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-40 hidden md:block"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Mic className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <span className="text-white text-xs font-bold">Voicemail</span>
      </div>
      <div className="bg-[#2a2a2e] rounded-lg p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-orange-300 text-orange-300" />
          </div>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-orange-500 rounded-full" />
          </div>
          <span className="text-slate-500 text-[9px]">0:47</span>
        </div>
      </div>
    </motion.div>
  );
}

function StickyNote() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, rotate: 5, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full sm:w-[160px] sm:absolute bottom-[5%] right-[8%] z-10"
    >
      <div className="bg-yellow-300 p-4 shadow-xl border border-yellow-400/40 rounded-sm">
        <p className="text-yellow-950 text-xs font-bold leading-snug tracking-tight">
          Call back<br />
          Tom - deck job<br />
          631-555-0199<br />
          <span className="text-yellow-700 text-[10px] block mt-1 font-medium">← forgot to call</span>
        </p>
      </div>
    </motion.div>
  );
}

const ALL_LEADS = [
  { name: 'Sarah T.', type: 'Bathroom Remodel', status: 'NEW', statusColor: 'bg-emerald-500', rev: '$1,200' },
  { name: 'Mike R.', type: 'Roof Estimate', status: 'QUOTED', statusColor: 'bg-blue-500', rev: '$4,800' },
  { name: 'Tom K.', type: 'Deck Build', status: 'SCHEDULED', statusColor: 'bg-sky-500', rev: '$3,400' },
  { name: 'Lisa P.', type: 'Duct Repair', status: 'IN PROGRESS', statusColor: 'bg-violet-500', rev: '$890' },
  { name: 'James H.', type: 'Leak Repair', status: 'NEW', statusColor: 'bg-emerald-500', rev: '$550' },
  { name: 'Ray C.', type: 'AC Repair', status: 'QUOTED', statusColor: 'bg-blue-500', rev: '$2,100' },
];

const MOBILE_LEADS = ALL_LEADS.slice(0, 3);

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-950/60 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
          <div className="flex-1 bg-slate-800/40 rounded-xl px-3 py-1 mx-4 sm:mx-8 border border-white/5">
            <p className="text-slate-400 text-[10px] text-center font-mono tracking-wide truncate">lead2project.com/dashboard</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white text-xs sm:text-sm font-black">Your Company Control Center</p>
              <p className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Live Operations Board</p>
            </div>
            <div className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-md hover:bg-emerald-500 transition-colors">
              + New
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
            {[
              { label: 'Total Leads', value: '12', color: 'text-white' },
              { label: 'Active Scope', value: '8', color: 'text-violet-400' },
              { label: 'Quoted Value', value: '5', color: 'text-blue-400' },
              { label: 'Scheduled Jobs', value: '3', color: 'text-emerald-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/80 rounded-2xl p-2.5 sm:p-3 border border-white/5 shadow-sm">
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-wider truncate">{stat.label}</p>
                <p className={`text-sm sm:text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {ALL_LEADS.map((lead, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl p-4 border border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className={`${lead.statusColor} text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                    {lead.status}
                  </span>
                  <span className="text-slate-300 text-xs font-black">{lead.rev}</span>
                </div>
                <p className="text-white text-sm font-black">{lead.name}</p>
                <p className="text-slate-400 text-[10px] font-bold mt-0.5 flex items-center gap-1">
                  <FileText size={10} /> {lead.type}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile view */}
          <div className="sm:hidden space-y-2">
            {MOBILE_LEADS.map((lead, i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl px-3.5 py-3 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-black">{lead.name}</p>
                  <p className="text-slate-400 text-[9px] font-bold mt-0.5">{lead.type}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`${lead.statusColor} text-white text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-wider`}>
                    {lead.status}
                  </span>
                  <span className="text-white text-xs font-black">{lead.rev}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LeadAcquisitionSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="mb-2 sm:mb-3 inline-block text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-rose-500">
            The Status Quo
          </span>
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]"
            style={{ fontFamily: font }}
          >
            This is how you get leads today.
          </h2>
        </div>

        {/* Chaos Container */}
        <div className="relative w-full max-w-3xl h-auto sm:h-[550px] lg:h-[560px] mx-auto bg-slate-950 rounded-3xl border border-white/10 p-4 sm:p-0 overflow-hidden mb-12 sm:mb-16 shadow-2xl">
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none hidden sm:block"
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
          />
          {/* Mobile flex stack / Desktop relative canvas */}
          <div className="relative w-full h-full flex flex-col sm:block gap-3">
            <MissedCall />
            <TextMessage />
            <ExcelSpreadsheet /> {/* Rendered safely with hidden lg:block inside */}
            <EmailInbox />
            <FacebookDM />
            <Voicemail />
            <StickyNote />
          </div>
        </div>

        {/* TRANSITION DIVIDER */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mb-12 sm:mb-16">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <ArrowDown className="text-emerald-600" size={28} strokeWidth={2.5} />
          </motion.div>
          <h3
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight text-center"
            style={{ fontFamily: font }}
          >
            This is how it <span className="text-emerald-600">should</span> look.
          </h3>
          <p className="text-slate-500 font-bold text-base sm:text-lg max-w-lg text-center leading-relaxed">
            Every entry routes securely directly into one clean card interface. No missed text messages, no forgotten schedules.
          </p>
        </div>

        {/* DIGITAL CONTROL BOARD */}
        <DashboardMockup />

      </div>
    </section>
  );
}