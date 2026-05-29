'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const font = "'Nunito', sans-serif";

/* ------------------------------------------------------------------ */
/*  CSS-only scrapbook pieces — the chaos of how leads arrive today   */
/* ------------------------------------------------------------------ */

function MissedCall() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -3, x: -60, y: -40 }}
      whileInView={{ opacity: 1, rotate: -3, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[2%] left-[2%] w-[220px] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-sm">📞</span>
        </div>
        <div>
          <p className="text-white text-xs font-bold">Missed Call</p>
          <p className="text-slate-500 text-[10px]">(631) 555-0142</p>
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
      initial={{ opacity: 0, rotate: 2, x: 70 }}
      whileInView={{ opacity: 1, rotate: 2, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[8%] right-[3%] w-[240px] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-20"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <span className="text-green-400 text-sm">💬</span>
        </div>
        <div>
          <p className="text-white text-xs font-bold">Mike R.</p>
          <p className="text-slate-500 text-[10px]">iMessage · now</p>
        </div>
      </div>
      <div className="bg-[#2a2a2e] rounded-xl p-3">
        <p className="text-white text-xs leading-relaxed">Hey I found you on google, I need a roof estimate. Can you come look at it? My address is 42 Oak...</p>
      </div>
      <div className="mt-2 bg-[#34c759]/10 rounded-xl p-2 text-center">
        <p className="text-[#34c759] text-[10px] font-bold">iMessage</p>
      </div>
    </motion.div>
  );
}

function EmailInbox() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -1, x: -70 }}
      whileInView={{ opacity: 1, rotate: -1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[28%] left-[5%] w-[260px] bg-white rounded-2xl p-4 shadow-2xl border border-slate-200 z-30"
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
          <p className="text-slate-400 text-[10px] truncate">Hi, I need help with my bathroom re...</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5 opacity-60">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-[11px] font-bold">Home Depot</p>
            <p className="text-slate-400 text-[9px]">11:15 AM</p>
          </div>
          <p className="text-slate-400 text-[10px]">Your order has shipped! Track your...</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2.5 opacity-40">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-[11px] font-bold">QuickBooks</p>
            <p className="text-slate-400 text-[9px]">10:48 AM</p>
          </div>
          <p className="text-slate-400 text-[10px]">Invoice #1847 is overdue. Send a re...</p>
        </div>
      </div>
    </motion.div>
  );
}

function FacebookDM() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 3, x: 60 }}
      whileInView={{ opacity: 1, rotate: 3, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-[48%] right-[2%] w-[220px] bg-[#242526] rounded-2xl p-4 shadow-2xl border border-white/10 z-20 hidden md:block"
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
            <span className="text-[10px]">👤</span>
          </div>
          <div className="bg-[#3a3b3c] rounded-xl p-2 max-w-[170px]">
            <p className="text-white text-[10px] leading-relaxed">Do you guys do siding? Saw ur page. Need a quote ASAP</p>
          </div>
        </div>
        <p className="text-slate-500 text-[9px] pl-8">Sent 4 hours ago · unread</p>
      </div>
    </motion.div>
  );
}

function Voicemail() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -2, x: -50, y: 50 }}
      whileInView={{ opacity: 1, rotate: -2, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-[5%] left-[15%] w-[200px] bg-[#1c1c1e] rounded-2xl p-4 shadow-2xl border border-white/10 z-40 hidden md:block"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
          <span className="text-orange-400 text-sm">🎙️</span>
        </div>
        <span className="text-white text-xs font-bold">Voicemail</span>
      </div>
      <div className="bg-[#2a2a2e] rounded-lg p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-orange-500/30 flex items-center justify-center">
            <span className="text-orange-300 text-[8px]">▶</span>
          </div>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-orange-500 rounded-full" />
          </div>
          <span className="text-slate-500 text-[9px]">0:47</span>
        </div>
      </div>
      <p className="text-slate-500 text-[10px] mt-2">Unknown · Yesterday 6:12 PM</p>
    </motion.div>
  );
}

function StickyNote() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: 5, x: 50, y: 40, scale: 0.8 }}
      whileInView={{ opacity: 1, rotate: 5, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-[5%] right-[8%] w-[160px] z-10"
    >
      <div className="bg-yellow-300 p-4 shadow-lg" style={{ fontFamily: "'Caveat', cursive" }}>
        <p className="text-yellow-900 text-sm font-bold leading-tight">
          Call back<br />
          Tom - deck job<br />
          631-555-0199<br />
          <span className="text-yellow-700 text-xs">← forgot to call 😬</span>
        </p>
      </div>
      <div className="w-full h-2 bg-yellow-400/50 blur-sm" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  The clean Lead2Project dashboard mockup                           */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/5 overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/80 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500/60" />
          </div>
          <div className="flex-1 bg-slate-700/50 rounded-lg px-3 py-1 mx-4 sm:mx-8">
            <p className="text-slate-400 text-[9px] sm:text-[10px] text-center font-mono">lead2project.com/dashboard</p>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <p className="text-white text-xs sm:text-sm font-black">Your Company</p>
              <p className="text-emerald-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Dashboard</p>
            </div>
            <div className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1.5 rounded-lg">+ New Lead</div>
          </div>
          
          {/* Stats row — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {[
              { label: 'Leads', value: '12', color: 'bg-slate-800' },
              { label: 'Active', value: '8', color: 'bg-slate-800' },
              { label: 'Quoted', value: '5', color: 'bg-emerald-900/40' },
              { label: 'Scheduled', value: '3', color: 'bg-emerald-900/40' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} rounded-xl p-2.5 sm:p-3 border border-white/5`}>
                <p className="text-slate-500 text-[8px] sm:text-[9px] font-bold uppercase">{stat.label}</p>
                <p className="text-white text-lg sm:text-xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
          
          {/* Leads — rows on mobile, cards on desktop */}
          <div className="hidden sm:grid grid-cols-3 gap-3">
            {[
              { name: 'Sarah T.', type: 'Bathroom Remodel', status: 'NEW', statusColor: 'bg-emerald-500' },
              { name: 'Mike R.', type: 'Roof Estimate', status: 'QUOTED', statusColor: 'bg-blue-500' },
              { name: 'Tom K.', type: 'Deck Build', status: 'SCHEDULED', statusColor: 'bg-sky-500' },
            ].map((lead, i) => (
              <div key={i} className="bg-slate-800 rounded-xl p-3.5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`${lead.statusColor} text-white text-[8px] font-black px-2 py-0.5 rounded-full`}>{lead.status}</span>
                </div>
                <p className="text-white text-sm font-black">{lead.name}</p>
                <p className="text-slate-400 text-[10px] font-bold">{lead.type}</p>
              </div>
            ))}
          </div>

          {/* Mobile rows */}
          <div className="sm:hidden space-y-2">
            {[
              { name: 'Sarah T.', type: 'Bathroom Remodel', status: 'NEW', statusColor: 'bg-emerald-500' },
              { name: 'Mike R.', type: 'Roof Estimate', status: 'QUOTED', statusColor: 'bg-blue-500' },
              { name: 'Tom K.', type: 'Deck Build', status: 'SCHEDULED', statusColor: 'bg-sky-500' },
            ].map((lead, i) => (
              <div key={i} className="bg-slate-800 rounded-xl px-3.5 py-3 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-white text-xs font-black">{lead.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold">{lead.type}</p>
                </div>
                <span className={`${lead.statusColor} text-white text-[8px] font-black px-2 py-0.5 rounded-full`}>{lead.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/* ------------------------------------------------------------------ */
/*  MAIN SECTION                                                      */
/* ------------------------------------------------------------------ */

export default function LeadAcquisitionSection() {
  return (
    <section className="bg-slate-950 py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SCRAPBOOK — The Chaos */}
        <div className="text-center mb-8">
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1]"
            style={{ fontFamily: font }}
          >
            This is how you get leads today.
          </h2>
        </div>

        {/* Scrapbook collage area */}
        <div className="relative w-full max-w-3xl h-[600px] md:h-[550px] lg:h-[560px] mx-auto bg-slate-900/30 rounded-3xl border border-white/5 backdrop-blur-sm p-4 overflow-hidden mb-16">
          {/* Subtle grid overlay for texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} 
          />
          <div className="relative w-full h-full">
            <MissedCall />
            <TextMessage />
            <EmailInbox />
            <FacebookDM />
            <Voicemail />
            <StickyNote />
          </div>
        </div>

        {/* Transition arrow */}
        <div className="flex flex-col items-center gap-4 mb-16">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowDown className="text-emerald-500" size={32} />
          </motion.div>
          <h3
            className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight text-center"
            style={{ fontFamily: font }}
          >
            This is how it <span className="text-emerald-500">should</span> look.
          </h3>
          <p className="text-slate-400 font-bold text-lg max-w-lg text-center">
            Every lead lands here with their name, details, and photos. Nothing gets lost.
          </p>
        </div>

        {/* THE ANSWER — Clean Dashboard */}
        <DashboardMockup />

      </div>
    </section>
  );
}