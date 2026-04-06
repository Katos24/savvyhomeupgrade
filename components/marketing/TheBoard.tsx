'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, List, Calendar, Download, Search, Plus, 
  Sun, Moon, ChevronRight, LayoutDashboard 
} from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ─────────────────────────────────────────────────────────────────────────────
// DATA & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#6366f1', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.' },
  { name: 'Kim Gutters',       status: 'Won',         statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—' },
  { name: 'Martinez Siding',   status: 'Quote Sent',  statusColor: '#eab308', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.' },
  { name: 'Ridge Line LLC',    status: 'New',         statusColor: '#3b82f6', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—' },
  { name: 'ProClean Services', status: 'Won',         statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.' },
  { name: 'Apex Fencing',      status: 'Contacted',   statusColor: '#f97316', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.' },
];

const CAL_EVENTS: Record<number, { name: string; color: string }[]> = {
  12: [{ name: 'Torres',   color: '#6366f1' }],
  13: [{ name: 'Kim G.',   color: '#10b981' }],
  15: [{ name: 'ProClean', color: '#10b981' }],
  21: [{ name: 'Ridge L.', color: '#f97316' }, { name: 'Martinez', color: '#eab308' }],
};

const STATS = [
  { label: 'Total Leads',   value: '166' },
  { label: 'Active Jobs',   value: '61' },
  { label: 'Total Revenue', value: '$102k' },
  { label: 'Total Pending', value: '$122k' },
];

const DURATION = 3500;
const VIEWS = ['cards', 'table', 'calendar'] as const;
type View = typeof VIEWS[number];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-PANELS
// ─────────────────────────────────────────────────────────────────────────────

function CardsPanel({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[10px] h-full overflow-y-auto pb-8 custom-scrollbar">
      {LEADS.map((lead) => (
        <div key={lead.name} className={`flex rounded-[14px] overflow-hidden border shrink-0 ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="w-1 shrink-0" style={{ background: lead.statusColor }} />
          <div className="p-3 flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest px-[7px] py-[2px] rounded-md inline-block mb-2" style={{ background: `${lead.statusColor}25`, color: lead.statusColor }}>{lead.status}</div>
            <div className={`text-[13px] font-black mb-1 truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{lead.name}</div>
            <div className={`grid grid-cols-2 gap-1 p-2 rounded-lg mb-2 border ${isDark ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <div>
                <div className="text-[7px] text-slate-400 font-extrabold uppercase">Date</div>
                <div className="text-[10px] font-extrabold text-indigo-500">{lead.date}</div>
              </div>
              <div className="border-l border-slate-200 pl-2">
                <div className="text-[7px] text-slate-400 font-extrabold uppercase">Arrival</div>
                <div className="text-[10px] font-extrabold text-slate-500">{lead.time}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[11px] font-black text-emerald-500">{lead.amount}</span>
               <ChevronRight size={14} className="text-slate-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePanel({ isDark }: { isDark: boolean }) {
  return (
    <div className="overflow-x-auto h-full pb-8">
      <table className="w-full border-collapse min-w-[500px]">
        <thead>
          <tr className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <th className="p-3 text-left border-b border-white/5">Name</th>
            <th className="p-3 text-left border-b border-white/5">Status</th>
            <th className="p-3 text-left border-b border-white/5">Amount</th>
            <th className="p-3 text-right border-b border-white/5">Payment</th>
          </tr>
        </thead>
        <tbody>
          {LEADS.map((lead) => (
            <tr key={lead.name} className={`text-[11px] border-b ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
              <td className={`p-3 font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{lead.name}</td>
              <td className="p-3"><span className="px-2 py-0.5 rounded text-[8px] font-black text-white" style={{ background: lead.statusColor }}>{lead.status}</span></td>
              <td className="p-3 font-black text-indigo-500">{lead.amount}</td>
              <td className={`p-3 text-right font-black ${lead.paid ? 'text-emerald-500' : 'text-rose-500'}`}>{lead.paid ? 'Paid' : 'Unpaid'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CalendarPanel({ isDark }: { isDark: boolean }) {
  const cells = [...Array(3).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div className="h-full overflow-y-auto pb-8">
      <div className="grid grid-cols-7 gap-[2px]">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="text-[8px] font-black text-slate-400 uppercase text-center py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          const events = day ? (CAL_EVENTS[day] || []) : [];
          return (
            <div key={i} className={`min-h-[48px] p-1 border ${day ? (isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100') : 'border-transparent'}`}>
              {day && <span className="text-[9px] font-black text-slate-400">{day}</span>}
              {events.map((ev, j) => (
                <div key={j} className="text-[7px] font-black text-white p-0.5 rounded truncate mt-1" style={{ background: ev.color }}>{ev.name}</div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION
// ─────────────────────────────────────────────────────────────────────────────

export default function TheBoard() {
  const [isDark, setIsDark] = useState(false);
  const [current, setCurrent] = useState<View>('cards');
  const [progress, setProgress] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const startRef = useRef<number>(performance.now());
  const { ref, visible } = useFadeIn();

  useEffect(() => {
    // If user clicked something, stop the timer
    if (hasInteracted) {
      setProgress(0);
      return;
    }

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = (elapsed / DURATION) * 100;
      if (p >= 100) {
        startRef.current = now;
        setCurrent((prev) => VIEWS[(VIEWS.indexOf(prev) + 1) % VIEWS.length]);
        setProgress(0);
      } else {
        setProgress(p);
      }
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hasInteracted]);

  const handleInteraction = (v: View) => {
    setHasInteracted(true);
    setCurrent(v);
  };

  const handleThemeToggle = () => {
    setHasInteracted(true);
    setIsDark(!isDark);
  };

  return (
    <section className="py-24 px-6 bg-[#06080F]">
      <style jsx global>{`
        @keyframes subtle-pulse {
          0% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0px rgba(99, 102, 241, 0); }
        }
        .click-hint {
          animation: subtle-pulse 2s infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div ref={ref} className="text-center mb-16 max-w-3xl mx-auto"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4 text-[#6366f1]">The Last Dashboard You'll Need</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Every lead. Every job. <span className="text-[#1a6645]">One screen.</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium">Auto-cycling views until you take control.</p>
        </div>

        {/* Browser Shell */}
        <div className="rounded-[20px] overflow-hidden border border-[#1e2a3a] shadow-2xl transition-all duration-500 bg-[#1a2234]">
          {/* URL Bar */}
          <div className="p-3 flex items-center gap-4 border-b border-white/5">
            <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#febc2e]" /><div className="w-3 h-3 rounded-full bg-[#28c840]" /></div>
            <div className="flex-1 bg-[#0d1520] rounded-lg py-1.5 px-3 border border-white/10 text-[10px] text-slate-500 font-mono truncate">
              lead2project.com/<span className="text-indigo-400 font-bold">ridge-line</span>/dashboard
            </div>
          </div>

          {/* DASHBOARD UI */}
          <div className={`transition-colors duration-500 flex flex-col ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
            
            {/* Header / Nav */}
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                  <img src="/images/ridgelinelogo.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <div className="hidden sm:block">
                  <div className={`text-[14px] font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Ridge Line Roofing</div>
                  <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Dashboard</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Clickable Theme Button */}
                <button 
                  onClick={handleThemeToggle} 
                  className={`p-2.5 rounded-xl transition-all active:scale-95 ${!hasInteracted ? 'click-hint' : ''} ${
                    isDark ? 'bg-indigo-500/10 text-amber-400 border border-indigo-500/20' : 'bg-slate-100 text-slate-500 border border-transparent'
                  }`}
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <div className="bg-[#0f172a] dark:bg-white px-4 py-2 rounded-xl flex items-center gap-2 text-white dark:text-slate-900 font-black text-[12px] shadow-lg shadow-indigo-500/10">
                  <Plus size={14} strokeWidth={3} /> Create
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex overflow-x-auto gap-3 p-4 no-scrollbar">
              {STATS.map(s => (
                <div key={s.label} className={`min-w-[120px] flex-1 p-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">{s.label}</p>
                  <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Main Controls */}
            <div className="px-4 pb-4 flex flex-col sm:flex-row items-center gap-4">
              <div className={`w-full flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                <Search size={16} className="text-slate-400" />
                <span className="text-[12px] text-slate-400 font-medium">Search project name...</span>
              </div>
              
              {/* CLICKABLE VIEW SWITCHER */}
              <div className={`flex p-1 rounded-2xl transition-all shadow-xl ${!hasInteracted ? 'click-hint scale-105' : ''} ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-100 border border-slate-200'
              }`}>
                {VIEWS.map(v => (
                  <button 
                    key={v} 
                    onClick={() => handleInteraction(v)} 
                    className={`p-2.5 rounded-xl transition-all relative ${
                      current === v ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-400'
                    }`}
                  >
                    {v === 'cards' && <LayoutGrid size={18} />}
                    {v === 'table' && <List size={18} />}
                    {v === 'calendar' && <Calendar size={18} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar (Only visible during auto-cycle) */}
            <div className="h-[2px] w-full bg-slate-100 dark:bg-white/5">
              {!hasInteracted && (
                <div className="h-full bg-indigo-600 transition-all duration-100" style={{ width: `${progress}%` }} />
              )}
            </div>

            {/* DASHBOARD CONTENT AREA */}
            <div className="px-4 pt-4 h-[400px] overflow-hidden">
              {current === 'cards' && <CardsPanel isDark={isDark} />}
              {current === 'table' && <TablePanel isDark={isDark} />}
              {current === 'calendar' && <CalendarPanel isDark={isDark} />}
            </div>
          </div>
        </div>

        {/* Feature Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[{ title: 'Visual Cards', icon: <LayoutGrid /> }, { title: 'Bulk Editing', icon: <List /> }, { title: 'Team Calendar', icon: <Calendar /> }].map((item, i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">{item.icon}</div>
              <p className="font-black text-slate-900 text-lg mb-2">{item.title}</p>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Switch views to handle different tasks, from field work to accounting.</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}