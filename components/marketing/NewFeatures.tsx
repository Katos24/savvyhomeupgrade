'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Mail,
  FormInput,
  Download,
  DollarSign,
  Bell,
  CheckCircle2,
  Activity,
  Terminal
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   FEATURES — THE FULL INDUSTRIAL OS (MOBILE OPTIMIZED)
   ───────────────────────────────────────────────────────── */

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  color: '#2563eb', amount: '$7,950', cat: 'Roofing', date: 12 },
  { name: 'Kim Gutters',       status: 'Won',        color: '#10b981', amount: '$2,400', cat: 'Gutters', date: 13 },
  { name: 'Martinez Siding',   status: 'Quote Sent', color: '#0891b2', amount: '$5,200', cat: 'Siding',  date: 21 },
  { name: 'David Reyes',       status: 'New',        color: '#16a34a', amount: '—',      cat: 'Gutters', date: 21 },
];

const OUTBOX_LOGS = [
  { name: 'Torres Roofing',    msg: 'Quote #4402 Sent',    time: '2h ago',  type: 'quote' },
  { name: 'Kim Gutters',       msg: 'Schedule Confirmed',  time: '5h ago',  type: 'event' },
  { name: 'Apex Fencing',      msg: 'Payment Reminder',    time: '1d ago',  type: 'bill'  },
  { name: 'Martinez Siding',   msg: 'Follow-up Email',     time: '2d ago',  type: 'msg'   },
];

// ── CARDS VIEW ──────────────────────────────

function CardsView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      {LEADS.map(lead => (
        <div key={lead.name} className="bg-white border-2 border-slate-950 p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.8rem] shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
          <p className="text-[12px] sm:text-[14px] font-[1000] uppercase italic tracking-tighter text-slate-900 mb-2">{lead.name}</p>
          <div className="flex justify-between items-center">
            <span className="text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase text-white shadow-sm" style={{ background: lead.color }}>
              {lead.status}
            </span>
            <span className="text-[11px] sm:text-[13px] font-black text-slate-950 italic">{lead.amount}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── CALENDAR VIEW (COMPACT SCHEDULE LIST) ───

function CalendarView() {
  const scheduled = [
    { name: 'Torres Roofing', date: 'Apr 12', time: '9:00 AM', amount: '$7,950', color: '#2563eb', status: 'Confirmed' },
    { name: 'Kim Gutters', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', color: '#10b981', status: 'Complete' },
    { name: 'ProClean Services', date: 'Apr 15', time: '2:00 PM', amount: '$1,800', color: '#10b981', status: 'Confirmed' },
    { name: 'Martinez Siding', date: 'Apr 21', time: '10:00 AM', amount: '$5,200', color: '#0891b2', status: 'Pending' },
  ];

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[11px] sm:text-[13px] font-[1000] uppercase italic tracking-tighter text-slate-950">April 2026</span>
        <span className="text-[9px] font-black text-slate-400 uppercase">{scheduled.length} Jobs</span>
      </div>
      {scheduled.map((job, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 bg-white border-2 border-slate-950 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 border-slate-950" style={{ background: job.color }}>
            <span className="text-[7px] sm:text-[8px] font-black text-white/70 uppercase leading-none">Apr</span>
            <span className="text-[14px] sm:text-[18px] font-[1000] text-white leading-none">{job.date.split(' ')[1]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-[13px] font-[1000] uppercase italic tracking-tighter text-slate-950 truncate">{job.name}</p>
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">{job.time}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] sm:text-[13px] font-black text-slate-950 italic">{job.amount}</p>
            <p className="text-[7px] sm:text-[8px] font-black uppercase" style={{ color: job.color }}>{job.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── OUTBOX VIEW ─────────────────────────────

function OutboxView() {
  const icons: Record<string, React.ReactNode> = { 
    quote: <DollarSign size={14}/>, 
    event: <CalendarDays size={14}/>, 
    bill: <Bell size={14}/>, 
    msg: <Mail size={14}/> 
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {OUTBOX_LOGS.map((log, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 bg-white border-2 border-slate-950 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-[2px_2px_0px_#3b82f6] sm:shadow-[4px_4px_0px_#3b82f6]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            {icons[log.type] || <Mail size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-[12px] font-[1000] uppercase italic truncate text-slate-950 leading-none mb-1">{log.name}</p>
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-tight">{log.msg}</p>
          </div>
          <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase italic whitespace-nowrap">{log.time}</span>
        </div>
      ))}
    </div>
  );
}

// ── EXPORT VIEW ─────────────────────────────

function ExportView() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-2 border-slate-950 bg-white rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden mb-3 sm:mb-4">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            <tr><th className="p-2 sm:p-3">Client</th><th className="p-2 sm:p-3">Cat.</th><th className="p-2 sm:p-3 text-right">Value</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {LEADS.map(l => (
              <tr key={l.name} className="text-[10px] sm:text-[11px] font-bold text-slate-700">
                <td className="p-2 sm:p-3">{l.name}</td>
                <td className="p-2 sm:p-3 uppercase text-[8px] sm:text-[9px] text-slate-400">{l.cat}</td>
                <td className="p-2 sm:p-3 text-right font-black">{l.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="group w-full bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-slate-950 p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-[3px_3px_0px_#000] sm:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 sm:gap-3">
        <Download size={16} strokeWidth={3} />
        <span className="text-[11px] sm:text-[14px] font-[1000] uppercase italic tracking-tighter">Export_Database.CSV</span>
      </button>
    </div>
  );
}

// ── FEATURES LIST ───────────────────────────

const FEATURES = [
  { id: 'board', icon: <LayoutDashboard size={20} />, name: 'Project Board' },
  { id: 'quote', icon: <FileText size={20} />, name: 'One-Click Quote', img: '/images/quote-builder.webp' },
  { id: 'schedule', icon: <CalendarDays size={20} />, name: 'Scheduling', img: '/images/schedule-send.webp' },
  { id: 'outbox', icon: <Mail size={20} />, name: 'Email Outbox' },
  { id: 'forms', icon: <FormInput size={20} />, name: 'Booking Forms', img: '/images/form-builder.webp' },
  { id: 'export', icon: <Download size={20} />, name: 'CSV Export' },
];

// ── MAIN COMPONENT ──────────────────────────

export default function NewFeatures() {
  const [active, setActive] = useState(0);
  const [boardTab, setBoardTab] = useState('cards');
  const current = FEATURES[active];

  function renderPreview() {
    if (current.id === 'board') {
      return (
        <div className="flex flex-col h-full">
          <div className="flex gap-1 sm:gap-2 mx-3 sm:mx-6 mt-3 sm:mt-4 p-1 bg-slate-200 rounded-full border-2 border-slate-950">
            {['cards', 'calendar'].map(v => (
              <button
                key={v}
                onClick={() => setBoardTab(v)}
                className={`flex-1 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase italic transition-all ${
                  boardTab === v
                    ? v === 'cards'
                      ? 'bg-yellow-400 text-slate-950 shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex-1 overflow-y-auto pb-4 sm:pb-6">
            {boardTab === 'cards' ? <CardsView /> : <CalendarView />}
          </div>
        </div>
      );
    }
    if (current.img) {
      return (
        <div className="h-full p-3 sm:p-8 flex items-center justify-center">
          <img src={current.img} alt={current.name} className="max-h-full w-auto rounded-[1.2rem] sm:rounded-[2rem] border-2 border-slate-950 shadow-2xl" />
        </div>
      );
    }
    if (current.id === 'outbox') return <div className="p-3 sm:p-10 h-full overflow-y-auto"><OutboxView /></div>;
    if (current.id === 'export') return <div className="p-3 sm:p-10 h-full overflow-y-auto"><ExportView /></div>;
    
    return <div className="flex items-center justify-center h-full text-slate-400 font-black uppercase italic">Module_Offline</div>;
  }

  return (
    <section className="bg-white py-12 lg:py-20 border-t-[6px] sm:border-t-[12px] border-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 border-b-2 sm:border-b-4 border-slate-950 pb-6 sm:pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-3 sm:mb-4 shadow-[3px_3px_0px_#e2e8f0] sm:shadow-[4px_4px_0px_#e2e8f0]">
              <Terminal size={12} strokeWidth={3} />
              <p className="text-[9px] sm:text-[10px] font-[1000] uppercase tracking-widest italic">Core Operating System</p>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-8xl font-[1000] text-slate-950 leading-[0.8] tracking-tighter italic uppercase">
              Built <span className="text-slate-300 italic">to</span> <br/>Dominate.
            </h2>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
           
            
          </div>
        </div>

        {/* Industrial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-[3px] sm:border-[6px] border-slate-950 bg-slate-950 shadow-[8px_8px_0px_#facc15] sm:shadow-[15px_15px_0px_#facc15]">
          
          {/* Navigation */}
<div className="lg:col-span-4 relative">
            {/* Scroll hint fade — mobile only */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none lg:hidden" />
            <div className="flex lg:flex-col divide-x-2 lg:divide-x-0 lg:divide-y-2 divide-slate-900 overflow-x-auto no-scrollbar">            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 sm:gap-4 lg:gap-5 p-3 sm:p-5 lg:p-7 text-left shrink-0 transition-all ${
                  active === i ? 'bg-yellow-400 text-slate-950' : 'text-slate-500 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className={active === i ? 'scale-110 rotate-3' : 'opacity-50'}>{f.icon}</div>
                <span className="text-sm sm:text-lg lg:text-2xl font-[1000] uppercase italic tracking-tighter whitespace-nowrap">{f.name}</span>
              </button>
           ))}
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-8 bg-slate-50 min-h-[320px] sm:min-h-[450px] lg:min-h-[550px] relative border-t-[3px] sm:border-t-[6px] lg:border-t-0 lg:border-l-[6px] border-slate-950 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-7 sm:h-8 bg-slate-950 flex items-center px-3 sm:px-4 gap-1.5 z-30">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-800" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-800" />
              </div>
              <span className="ml-auto text-[7px] sm:text-[8px] text-white/30 font-black uppercase tracking-widest">sys_module_{current.id}.exe</span>
            </div>
            <div className="h-full pt-7 sm:pt-8">
              {renderPreview()}
            </div>
          </div>
        </div>
        

        {/* Bottom Ticker */}
        <div className="mt-8 sm:mt-12 flex flex-wrap items-center justify-between gap-4 sm:gap-6 border-t-2 border-slate-100 pt-6 sm:pt-8">
          <div className="flex items-center gap-4 sm:gap-6 opacity-40 grayscale">
            
           
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rotate-45" />
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Industrial Grade Performance</p>
          </div>
        </div>
      </div>
      
    </section>
  );
}