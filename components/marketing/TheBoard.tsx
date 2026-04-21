'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, List, Calendar, Mail, 
  Plus, DollarSign, Bell, ArrowRight, Download, 
  Zap, Database 
} from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type View = 'cards' | 'table' | 'calendar' | 'outbox';

interface Lead {
  name: string;
  status: string;
  statusColor: string;
  date: string;
  time: string;
  amount: string;
  paid: boolean;
  assigned: string;
  category: string;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const LEADS: Lead[] = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#6366f1', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.',  category: 'Roofing'  },
  { name: 'Kim Gutters',       status: 'Won',        statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—',        category: 'Gutters'  },
  { name: 'Martinez Siding',   status: 'Quote Sent', statusColor: '#0891b2', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.',  category: 'Siding'   },
  { name: 'David Reyes',       status: 'New',        statusColor: '#1a6645', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—',        category: 'Gutters'  },
  { name: 'ProClean Services', status: 'Won',        statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.',  category: 'Cleaning' },
  { name: 'Apex Fencing',      status: 'Contacted',  statusColor: '#8b5cf6', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.',  category: 'Fencing'  },
];

const CAL_EVENTS: Record<number, { name: string; color: string }[]> = {
  12: [{ name: 'Torres',   color: '#6366f1' }],
  13: [{ name: 'Kim G.',   color: '#10b981' }],
  15: [{ name: 'ProClean', color: '#10b981' }],
  21: [{ name: 'D. Reyes', color: '#10b981' }, { name: 'Martinez', color: '#eab308' }],
};

const OUTBOX = [
  { type: 'quote',            name: 'Torres Roofing',    detail: '$7,950 quote sent',           time: '2h ago', color: '#f97316', icon: 'dollar'   },
  { type: 'schedule',         name: 'Kim Gutters',       detail: 'Apr 13 · 11:00 AM confirmed', time: '5h ago', color: '#60a5fa', icon: 'calendar' },
  { type: 'payment_reminder', name: 'Apex Fencing',      detail: '$3,100 payment reminder',     time: '1d ago', color: '#fb923c', icon: 'bell'     },
  { type: 'quote',            name: 'Martinez Siding',   detail: '$5,200 quote sent',           time: '2d ago', color: '#f97316', icon: 'dollar'   },
];

const VIEWS: { key: View; icon: React.ReactNode; label: string }[] = [
  { key: 'table',    icon: <List size={13} />,       label: 'Table'    },
  { key: 'cards',    icon: <LayoutGrid size={13} />, label: 'Cards'    },
  { key: 'calendar', icon: <Calendar size={13} />,   label: 'Calendar' },
  { key: 'outbox',   icon: <Mail size={13} />,       label: 'Outbox'   },
];

// ─── SUB-PANELS ───────────────────────────────────────────────────────────────

function CardsPanel() {
  return (
    <div className="h-full overflow-y-auto pb-4 no-scrollbar">
      {/* MOBILE: compact single-column list-style cards */}
      <div className="sm:hidden space-y-2">
        {LEADS.map(lead => (
          <div key={lead.name} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 cursor-pointer">
            <div className="w-2 h-full min-h-[36px] rounded-full shrink-0" style={{ background: lead.statusColor }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-[13px] font-black text-slate-900 truncate">{lead.name}</p>
                <span className="text-[12px] font-black text-slate-900 shrink-0">{lead.amount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full" style={{ background: `${lead.statusColor}15`, color: lead.statusColor }}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: lead.statusColor }} />
                  {lead.status}
                </span>
                <span className="text-[9px] font-bold text-slate-400">{lead.category}</span>
                {lead.date !== '—' && <span className="text-[9px] font-bold text-slate-400">· {lead.date}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: 2-col card grid */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        {LEADS.map(lead => (
          <div key={lead.name} className="flex flex-col bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-sm cursor-pointer group">
            <div className="px-3 pt-3 pb-1.5 flex justify-between items-start">
              <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${lead.statusColor}15`, color: lead.statusColor }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lead.statusColor }} />
                {lead.status}
              </span>
            </div>
            <div className="px-3 pb-3">
              <p className="text-[14px] font-black text-slate-900 leading-tight mb-1 truncate">{lead.name}</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{lead.category}</p>
            </div>
            <div className="mx-3 mb-3 grid grid-cols-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-[7px] font-black text-slate-400 uppercase">Date</p>
                <span className="text-[10px] font-black text-emerald-600 italic">{lead.date}</span>
              </div>
              <div className="border-l border-slate-200 pl-3 space-y-0.5">
                <p className="text-[7px] font-black text-slate-400 uppercase">Rev</p>
                <span className="text-[10px] font-black text-slate-700">{lead.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablePanel() {
  return (
    <div className="h-full overflow-y-auto pb-4 no-scrollbar">
      <div className="hidden sm:block">
        <table className="border-collapse w-full">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {['Project','Category','Status','Revenue'].map(h => (
                <th key={h} className="p-3 text-left border-b border-slate-100 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADS.map(lead => (
              <tr key={lead.name} className="text-[11px] border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-3 font-black text-slate-900">{lead.name}</td>
                <td className="p-3 font-black text-slate-400 text-[9px]">{lead.category}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black text-white" style={{ background: lead.statusColor }}>{lead.status}</span>
                </td>
                <td className="p-3 font-black text-slate-900">{lead.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden space-y-2">
        {LEADS.map(lead => (
          <div key={lead.name} className="flex justify-between items-center p-3 border-b border-slate-100">
            <div>
              <p className="text-[12px] font-black text-slate-900">{lead.name}</p>
              <p className="text-[8px] font-black text-slate-400 uppercase">{lead.category}</p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-900">{lead.amount}</p>
               <span className="text-[7px] font-black uppercase tracking-tighter" style={{ color: lead.statusColor }}>{lead.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarPanel() {
  const cells = [...Array(3).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div className="h-full overflow-y-auto pb-4 no-scrollbar">
      <div className="grid grid-cols-7 gap-px">
        {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-[8px] font-black text-slate-400 text-center py-1">{d}</div>)}
        {cells.map((day, i) => {
          const events = day ? (CAL_EVENTS[day] || []) : [];
          return (
            <div key={i} className={`min-h-[32px] sm:min-h-[38px] p-0.5 sm:p-1 border ${day ? 'bg-slate-50 border-slate-100' : 'border-transparent'}`}>
              {day && <span className="text-[8px] sm:text-[9px] font-black text-slate-400">{day}</span>}
              {events.map((ev, j) => <div key={j} className="text-[6px] sm:text-[7px] font-black text-white px-0.5 sm:px-1 py-0.5 rounded truncate mt-0.5" style={{ background: ev.color }}>{ev.name}</div>)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutboxPanel() {
  const icons: Record<string, React.ReactNode> = { dollar: <DollarSign size={13} />, calendar: <Mail size={13} />, bell: <Bell size={13} /> };
  return (
    <div className="h-full overflow-y-auto pb-4 space-y-2 no-scrollbar">
      {OUTBOX.map((email, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-white border-slate-100">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${email.color}15`, color: email.color }}>{icons[email.icon]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black truncate text-slate-900">{email.name}</p>
            <p className="text-[9px] truncate text-slate-400">{email.detail}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-slate-400">{email.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TheBoard() {
  const [current, setCurrent] = useState<View>('table');
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 lg:py-32 px-4 sm:px-6 bg-[#020617] overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-24 items-center"
          style={{ 
            opacity: visible ? 1 : 0, 
            transform: visible ? 'none' : 'translateY(40px)', 
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1)' 
          }}
        >
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1 px-2">
            <div className="inline-flex items-center gap-2 mb-5 sm:mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Database size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Project Control</span>
            </div>
            
            <h2 className="font-black tracking-tighter text-white mb-6 sm:mb-8 text-3xl sm:text-5xl lg:text-7xl leading-[0.9]">
              The Operating System{' '}
              <br className="hidden sm:block" />
              <span className="text-emerald-500 font-serif italic">for contractors.</span>
            </h2>

            <div className="space-y-6 mb-8 sm:mb-10 max-w-md">
              <div className="flex items-start gap-4 text-left">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 border border-emerald-500/20">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-1">Mass Action Workflow</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">Update status, assign crews, or send reminders to 50 leads at once.</p>
                </div>
              </div>
            </div>

            <Link href="/signup" className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-xl sm:rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] bg-[#1a6645] px-8 py-4 text-base shadow-xl w-full sm:w-auto">
              Start Free Trial
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* RIGHT VISUAL */}
          <div className="lg:col-span-7 w-full relative order-1 lg:order-2">
            <div className="flex items-center gap-1 mb-3 sm:mb-4 p-1 sm:p-1.5 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md">
              {VIEWS.map((v) => {
                const isActive = current === v.key;
                return (
                  <button 
                    key={v.key} 
                    onClick={() => setCurrent(v.key)} 
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black transition-all uppercase tracking-widest ${isActive ? 'bg-white text-[#0F1F3D] shadow-xl' : 'text-slate-400 hover:text-white'}`}
                  >
                    {v.icon}
                    <span className="hidden xs:inline sm:inline">{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative group">
              <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-[#090d12]">
                <div className="bg-white">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 rounded-sm rotate-45" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-[11px] sm:text-[12px] font-black text-slate-900 truncate">Ridge Line Dashboard</div>
                        <div className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Control Center</div>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center sm:hidden">
                       <Plus size={14} className="text-slate-900" />
                    </div>
                  </div>

                  <div className="px-3 sm:px-6 pt-3 sm:pt-6 h-[320px] sm:h-[460px] overflow-hidden relative text-left">
                    {current === 'table'    && <TablePanel />}
                    {current === 'cards'    && <CardsPanel />}
                    {current === 'calendar' && <CalendarPanel />}
                    {current === 'outbox'   && <OutboxPanel />}
                    <div className="absolute bottom-0 inset-x-0 h-12 sm:h-16 pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}