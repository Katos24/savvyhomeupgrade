'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutGrid, List, Calendar, Mail, ChevronRight, Search, 
  Plus, DollarSign, Bell, ArrowRight, Download, ShieldCheck, 
  Zap, Database 
} from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#3b82f6', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.',  category: 'Roofing'  },
  { name: 'Kim Gutters',       status: 'Won',        statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—',        category: 'Gutters'  },
  { name: 'Martinez Siding',   status: 'Quote Sent', statusColor: '#eab308', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.',  category: 'Siding'   },
  { name: 'David Reyes',       status: 'New',        statusColor: '#10b981', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—',        category: 'Gutters'  },
  { name: 'ProClean Services', status: 'Won',        statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.',  category: 'Cleaning' },
  { name: 'Apex Fencing',      status: 'Contacted',  statusColor: '#f97316', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.',  category: 'Fencing'  },
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
  { type: 'schedule',         name: 'ProClean Services', detail: 'Apr 15 · 2:00 PM confirmed',  time: '3d ago', color: '#60a5fa', icon: 'calendar' },
];

type View = 'cards' | 'table' | 'calendar' | 'outbox';

const VIEWS: { key: View; icon: React.ReactNode; label: string }[] = [
  { key: 'table',    icon: <List size={13} />,       label: 'Table'    },
  { key: 'cards',    icon: <LayoutGrid size={13} />, label: 'Cards'    },
  { key: 'calendar', icon: <Calendar size={13} />,   label: 'Calendar' },
  { key: 'outbox',   icon: <Mail size={13} />,       label: 'Outbox'   },
];

// --- Sub-Panels ---

function CardsPanel() {
  return (
    <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto pb-4 no-scrollbar">
      {LEADS.map(lead => (
        <div key={lead.name} className="flex flex-col bg-white border-2 border-slate-900 rounded-2xl overflow-hidden shadow-sm cursor-pointer group">
          <div className="px-2.5 pt-2.5 pb-1.5">
            <span className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: `${lead.statusColor}15`, color: lead.statusColor }}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lead.statusColor }} />
              {lead.status}
            </span>
          </div>
          <div className="px-2.5 pb-2">
            <p className="text-[12px] font-black text-slate-900 leading-tight mb-0.5 truncate group-hover:text-emerald-600 transition-colors">{lead.name}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">{lead.category}</p>
          </div>
          <div className="mx-2.5 mb-2 grid grid-cols-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Job Date</p>
              <span className="text-[9px] font-black text-emerald-600 italic">{lead.date}</span>
            </div>
            <div className="border-l border-slate-200 pl-2 space-y-0.5">
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
              <span className="text-[9px] font-black text-slate-700">{lead.amount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePanel() {
  return (
    <div className="overflow-x-auto h-full pb-4 no-scrollbar">
      <table className="border-collapse w-full" style={{ minWidth: 500 }}>
        <thead>
          <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            {['Project Name','Category','Status','Revenue','Payment'].map(h => (
              <th key={h} className="p-3 text-left border-b border-slate-100 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LEADS.map(lead => (
            <tr key={lead.name} className="text-[11px] border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="p-3 font-black text-slate-900 whitespace-nowrap">{lead.name}</td>
              <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-slate-100 text-slate-600 uppercase tracking-tighter whitespace-nowrap">{lead.category}</span></td>
              <td className="p-3">
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black text-white whitespace-nowrap" style={{ background: lead.statusColor }}>{lead.status}</span>
              </td>
              <td className="p-3 font-black text-slate-900">{lead.amount}</td>
              <td className="p-3">
                <div className={`flex items-center gap-1.5 font-black text-[9px] uppercase tracking-tighter ${lead.paid ? 'text-emerald-500' : 'text-rose-500'}`}>
                   <div className={`w-1 h-1 rounded-full ${lead.paid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                   {lead.paid ? 'Settled' : 'Pending'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
            <div key={i} className={`min-h-[38px] p-1 border ${day ? 'bg-slate-50 border-slate-100' : 'border-transparent'}`}>
              {day && <span className="text-[9px] font-black text-slate-400">{day}</span>}
              {events.map((ev, j) => <div key={j} className="text-[7px] font-black text-white px-1 py-0.5 rounded truncate mt-0.5" style={{ background: ev.color }}>{ev.name}</div>)}
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

// --- Main Component ---

export default function TheBoard() {
  // SETTING DEFAULT TO 'table'
  const [current, setCurrent] = useState<View>('table');
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 bg-[#020617] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          style={{ 
            opacity: visible ? 1 : 0, 
            transform: visible ? 'none' : 'translateY(40px)', 
            transition: 'all 1s cubic-bezier(0.16,1,0.3,1)' 
          }}
        >

          {/* LEFT CONTENT */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <Database size={12} className="text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Total Project Control</span>
            </div>
            
            <h2 className="font-black tracking-tighter text-white mb-8" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', lineHeight: 0.9 }}>
              The Operating System <br />
              <span className="text-emerald-500">for Your Pipeline.</span>
            </h2>

            <div className="space-y-6 mb-10 max-w-md">
              <div className="flex items-start gap-4 text-left">
                 <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-emerald-500 shrink-0"><Zap size={18} fill="currentColor" /></div>
                 <div>
                    <h4 className="text-white font-bold text-base">Bulk Workflow Velocity</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Update status, assign crews, or send payment reminders to 50 leads at once via the Table View.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4 text-left">
                 <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-blue-500 shrink-0"><Download size={18} /></div>
                 <div>
                    <h4 className="text-white font-bold text-base">Zero Data Lock-in</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">It's your data. Export your entire project history, lead contacts, and payment records to CSV with one click.</p>
                 </div>
              </div>
            </div>

            <Link href="/signup" className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] bg-[#1a6645] px-10 py-5 text-lg shadow-[0_20px_40px_-12px_rgba(26,102,69,0.4)]">
                Start Your Trial
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          {/* RIGHT VISUAL */}
          <div className="w-full relative">
            <div className="flex items-center gap-2 mb-6 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              {VIEWS.map((v) => {
                const isActive = current === v.key;
                return (
                  <button key={v.key} onClick={() => setCurrent(v.key)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${isActive ? 'bg-white text-[#0F1F3D] shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    {v.icon}
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative group">
              <div className="relative rounded-t-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#090d12]">
                {/* Window Controls */}
                <div className="flex items-center px-4 gap-2 border-b border-white/5 h-8 bg-slate-900/50 backdrop-blur-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                </div>

                {/* Internal App UI */}
                <div className="bg-white">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                        <img src="/images/ridgelinelogo.webp" alt="Logo" className="w-5 h-5 object-contain invert" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-[12px] font-black text-slate-900 leading-none">Ridge Line Roofing</div>
                        <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Project Engine</div>
                      </div>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-[#1a6645] text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <Plus size={12} strokeWidth={3} /> New Project
                    </div>
                  </div>

                  <div className="px-5 pt-4 h-[320px] overflow-hidden relative text-left">
                    {current === 'table'    && <TablePanel />}
                    {current === 'cards'    && <CardsPanel />}
                    {current === 'calendar' && <CalendarPanel />}
                    {current === 'outbox'   && <OutboxPanel />}
                    <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent" />
                  </div>
                </div>
              </div>
              <div className="h-4 rounded-b-2xl bg-slate-800 border-x border-b border-white/20 relative" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}