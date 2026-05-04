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
  { name: 'Marcus Holloway',    status: 'Scheduled',  color: '#2563eb', amount: '$7,950', cat: 'Roofing', date: 12 },
  { name: 'Sarah Jenkins',      status: 'Won',        color: '#10b981', amount: '$2,400', cat: 'Gutters', date: 13 },
  { name: 'Julian Martinez',    status: 'Quote Sent', color: '#0891b2', amount: '$5,200', cat: 'Siding',  date: 21 },
  { name: 'David Reyes',        status: 'New',        color: '#16a34a', amount: '—',      cat: 'Gutters', date: 21 },
];

const OUTBOX_LOGS = [
  { name: 'Marcus Holloway',    msg: 'Quote #4402 Sent',    time: '2h ago',  type: 'quote' },
  { name: 'Sarah Jenkins',      msg: 'Schedule Confirmed',  time: '5h ago',  type: 'event' },
  { name: 'Apex Fencing',       msg: 'Payment Reminder',    time: '1d ago',  type: 'bill'  },
  { name: 'Julian Martinez',    msg: 'Follow-up Email',     time: '2d ago',  type: 'msg'   },
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

// ── CALENDAR VIEW (ACTUAL GRID) ───

function CalendarView() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Example items mapped to specific dates
  const scheduledItems: Record<number, any[]> = {
    12: [{ name: 'Marcus H.', color: '#2563eb' }],
    13: [{ name: 'Sarah J.', color: '#10b981' }],
    15: [{ name: 'Elena G.', color: '#10b981' }],
    21: [
      { name: 'Julian M.', color: '#0891b2' },
      { name: 'David R.', color: '#16a34a' }
    ],
  };

  // We'll show a fixed grid of 35 days (5 weeks) starting from a Sunday
  const calendarDays = Array.from({ length: 35 }, (_, i) => i - 2); // Adjust -2 to align Apr 1st to Wed

  return (
    <div className="flex flex-col h-full">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-2xl font-[1000] uppercase italic tracking-tighter text-slate-950">
          April 2026
        </h3>
        <div className="flex gap-1">
          <div className="w-6 h-6 border-2 border-slate-950 flex items-center justify-center bg-white cursor-pointer hover:bg-yellow-400">
            <span className="text-[10px] font-black">{"<"}</span>
          </div>
          <div className="w-6 h-6 border-2 border-slate-950 flex items-center justify-center bg-white cursor-pointer hover:bg-yellow-400">
            <span className="text-[10px] font-black">{">"}</span>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-x-2 border-t-2 border-slate-950 bg-slate-950">
        {days.map(day => (
          <div key={day} className="py-1 text-center border-r last:border-r-0 border-slate-800">
            <span className="text-[8px] sm:text-[10px] font-black text-white/50 uppercase tracking-widest">{day}</span>
          </div>
        ))}
      </div>

      {/* The Calendar Grid */}
      <div className="grid grid-cols-7 border-2 border-slate-950 bg-white shadow-[4px_4px_0px_#000]">
        {calendarDays.map((date, i) => {
          const isCurrentMonth = date > 0 && date <= 30;
          const items = scheduledItems[date] || [];

          return (
            <div 
              key={i} 
              className={`min-h-[60px] sm:min-h-[90px] border-r border-b border-slate-200 p-1 flex flex-col gap-1 transition-colors hover:bg-slate-50
                ${!isCurrentMonth ? 'bg-slate-100/50' : ''} 
                ${i % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              {/* Date Number */}
              <span className={`text-[9px] sm:text-[11px] font-black ${isCurrentMonth ? 'text-slate-950' : 'text-slate-300'}`}>
                {isCurrentMonth ? date : ''}
              </span>

              {/* Scheduled Items inside the date */}
              <div className="flex flex-col gap-0.5 sm:gap-1">
                {items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="group relative flex items-center px-1 py-0.5 sm:py-1 rounded-sm border border-slate-950 shadow-[1px_1px_0px_#000] overflow-hidden"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-[7px] sm:text-[9px] font-[1000] text-white uppercase leading-none truncate">
                      {item.name.split(' ')[0]}
                    </span>
                    
                    {/* Hover Tooltip for Mobile/Desktop */}
                    <div className="hidden group-hover:block absolute z-50 bg-slate-950 text-white p-2 rounded text-[10px] whitespace-nowrap -top-8 left-0">
                      {item.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend / Key */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#2563eb] border border-slate-950 shadow-[1px_1px_0px_#000]" />
          <span className="text-[9px] font-black uppercase text-slate-400">Roofing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#10b981] border border-slate-950 shadow-[1px_1px_0px_#000]" />
          <span className="text-[9px] font-black uppercase text-slate-400">Gutters</span>
        </div>
      </div>
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
          {/* SUB-NAV: Steel Blue/Emerald Theme (No Yellow/Black) */}
          <div className="flex gap-1 sm:gap-2 mx-3 sm:mx-6 mt-3 sm:mt-4 p-1 bg-slate-200/80 rounded-xl border-2 border-slate-950">
            {['cards', 'calendar'].map(v => (
              <button
                key={v}
                onClick={() => setBoardTab(v)}
                className={`flex-1 py-2 sm:py-2.5 rounded-lg text-[9px] sm:text-[10px] font-[1000] uppercase italic transition-all duration-200 ${
                  boardTab === v
                    ? 'bg-blue-600 text-white shadow-[3px_3px_0px_#1e3a8a] -translate-y-0.5' 
                    : 'text-slate-500 hover:text-slate-700'
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
        
        {/* Header (Stacking correctly on mobile) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 border-b-4 border-slate-950 pb-8">
           <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[4px_4px_0px_#e2e8f0]">
              <Terminal size={12} strokeWidth={3} />
              <p className="text-[10px] font-[1000] uppercase tracking-widest italic text-white">OS_V2.0_MOBILE_READY</p>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-8xl font-[1000] text-slate-950 leading-[0.8] tracking-tighter italic uppercase">
              Industrial <span className="text-slate-300 italic">Power</span>.
            </h2>
          </div>
        </div>

        {/* The Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-[3px] sm:border-[6px] border-slate-950 bg-slate-950 shadow-[8px_8px_0px_#facc15] sm:shadow-[15px_15px_0px_#facc15]">
          
          {/* NAVIGATION: Snap-to-center + Scroll Indicators */}
          <div className="lg:col-span-4 relative flex flex-col border-b-[3px] lg:border-b-0 lg:border-r-[6px] border-slate-950 overflow-hidden">
            {/* Mobile "Swipe" Indicators */}
            <div className="lg:hidden flex justify-center gap-1.5 py-2 bg-slate-900/50">
              {FEATURES.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${active === i ? 'bg-yellow-400 w-4' : 'bg-slate-700'}`} />
              ))}
            </div>

            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible no-scrollbar snap-x snap-mandatory">
              {FEATURES.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`
                    flex items-center gap-4 p-5 lg:p-7 shrink-0 lg:shrink snap-center transition-all min-w-[70%] lg:min-w-full
                    ${active === i ? 'bg-yellow-400 text-slate-950' : 'text-slate-500 hover:bg-slate-900'}
                  `}
                >
                  <div className={active === i ? 'scale-110 rotate-3' : 'opacity-50'}>{f.icon}</div>
                  <span className="text-lg lg:text-2xl font-[1000] uppercase italic tracking-tighter">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW CANVAS */}
          <div className="lg:col-span-8 bg-slate-50 min-h-[400px] lg:min-h-[550px] relative overflow-hidden">
             {/* Industrial Window Bar */}
             <div className="h-8 bg-slate-950 flex items-center px-4 gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
             </div>
             <div className="h-full pt-2">
               {renderPreview()}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}