'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Calendar, Mail, ChevronRight, Search, Plus, DollarSign, Bell, Filter, ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#3b82f6', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.',  category: 'Roofing'  },
  { name: 'Kim Gutters',       status: 'Won',        statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—',        category: 'Gutters'  },
  { name: 'Martinez Siding',   status: 'Quote Sent', statusColor: '#eab308', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.',  category: 'Siding'   },
  { name: 'David Reyes',       status: 'New',        statusColor: '#10b981', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—',        category: 'Gutters'  },
  { name: 'ProClean Services', status: 'Won',        statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.',  category: 'Cleaning' },
  { name: 'Apex Fencing',      status: 'Contacted',  statusColor: '#f97316', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.',  category: 'Fencing'  },
];

const STATS = [
  { label: 'Leads',   value: '168',   accent: 'bg-blue-500' },
    { label: 'Active',  value: '63',    accent: 'bg-blue-500'   },
  { label: 'Revenue', value: '$102k', accent: 'bg-emerald-500' },
  { label: 'Pending', value: '$122k', accent: 'bg-amber-500'  },
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

const FILTERS = ['Today', 'Unpaid', 'New', 'Scheduled Today'];
type View = 'cards' | 'table' | 'calendar' | 'outbox';

function CardsPanel() {
  return (
    <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto pb-4 no-scrollbar">
      {LEADS.map(lead => (
        <div
          key={lead.name}
          className="flex flex-col bg-white border-2 rounded-2xl overflow-hidden shadow-sm cursor-pointer group"
          style={{ borderColor: '#0f172a' }}
        >
          {/* Status pill */}
          <div className="px-2.5 pt-2.5 pb-1.5">
            <span
              className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: `${lead.statusColor}15`, color: lead.statusColor }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lead.statusColor }} />
              {lead.status}
            </span>
          </div>

          {/* Name + category */}
          <div className="px-2.5 pb-2">
            <p className="text-[12px] font-black text-slate-900 leading-tight mb-0.5 truncate group-hover:text-blue-500 transition-colors">
              {lead.name}
            </p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate">{lead.category}</p>
          </div>

          {/* Stats box */}
          <div className="mx-2.5 mb-2 grid grid-cols-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Job Date</p>
              <div className="flex items-center gap-1">
                <Calendar size={8} className="text-blue-500 shrink-0" />
                <span className="text-[9px] font-black text-blue-500 italic">{lead.date}</span>
              </div>
            </div>
            <div className="border-l border-slate-200 pl-2 space-y-0.5">
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
              <div className="flex items-center gap-0.5">
                <DollarSign size={8} className="text-slate-400 shrink-0" />
                <span className="text-[9px] font-black text-slate-700">
                  {lead.amount === '—' ? '—' : lead.amount.replace('$', '')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-2.5 py-2 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-1">
<div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[7px] font-black text-white shrink-0">                {lead.assigned !== '—' ? lead.assigned.charAt(0) : '?'}
              </div>
              <span className="text-[8px] font-bold text-slate-400 truncate max-w-[45px]">
                {lead.assigned === '—' ? 'Unassigned' : lead.assigned}
              </span>
            </div>
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-slate-900 text-white">
              <span className="text-[7px] font-black uppercase tracking-widest">Open</span>
              <ChevronRight size={8} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePanel() {
  return (
    <div className="overflow-x-auto h-full pb-4">
      <table className="border-collapse w-full" style={{ minWidth: 500 }}>
        <thead>
          <tr className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {['Name','Category','Status','Scheduled','Assigned','Amount','Payment'].map(h => (
              <th key={h} className="p-2 text-left border-b border-slate-100 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LEADS.map(lead => (
            <tr key={lead.name} className="text-[11px] border-b border-slate-50 hover:bg-slate-50">
              <td className="p-2 font-black whitespace-nowrap text-slate-900">{lead.name}</td>
              <td className="p-2 whitespace-nowrap"><span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-sky-100 text-sky-700">{lead.category}</span></td>
              <td className="p-2 whitespace-nowrap"><span className="px-1.5 py-0.5 rounded text-[8px] font-black text-white" style={{ background: lead.statusColor }}>{lead.status}</span></td>
              <td className="p-2 whitespace-nowrap font-bold text-blue-600">{lead.date}</td>
<td className="p-2 whitespace-nowrap">{lead.assigned !== '—' ? <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-100 text-blue-700">{lead.assigned}</span> : <span className="text-slate-300">—</span>}</td>
              <td className="p-2 whitespace-nowrap font-black text-emerald-500">{lead.amount}</td>
              <td className={`p-2 whitespace-nowrap font-black ${lead.paid ? 'text-emerald-500' : 'text-rose-500'}`}>{lead.paid ? 'Paid' : 'Unpaid'}</td>
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
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[{ label: 'Sent', value: '47', color: '#0f172a' }, { label: 'Quote Value', value: '$28k', color: '#f97316' }, { label: 'Reminders', value: '8', color: '#60a5fa' }].map(s => (
          <div key={s.label} className="p-2.5 rounded-xl border bg-slate-50 border-slate-100">
            <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">{s.label}</p>
            <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
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

const VIEWS = [
  { key: 'cards' as View,    icon: <LayoutGrid size={13} />, label: 'Cards'    },
  { key: 'table' as View,    icon: <List size={13} />,       label: 'Table'    },
  { key: 'calendar' as View, icon: <Calendar size={13} />,   label: 'Calendar' },
  { key: 'outbox' as View,   icon: <Mail size={13} />,       label: 'Outbox'   },
];

export default function TheBoard() {
const [current, setCurrent] = useState<View>('table');
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#0d1117] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >

          {/* LEFT — copy */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2
              className="font-black tracking-tight text-white mb-5"
style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', lineHeight: 0.95, letterSpacing: '-0.04em' }}
            >
              Lead2Project is free to try. <br />
              <span className="text-[#1a6645]">We think you'll stay.</span>
            </h2>

         
            <div className="flex flex-col gap-3 mb-8 max-w-sm">
              {[
                'Bulk edit multiple leads at once from table view',
                'Export all your data to CSV anytime',
                'Cards, Table, Calendar, and Outbox views',
                'Full data ownership — yours forever',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1a6645]/20 border border-[#1a6645]/40 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">{item}</p>
                </div>
              ))}
            </div>

      

            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              style={{
                fontSize: '1rem',
                padding: '1rem 2.25rem',
                background: '#1a6645',
                boxShadow: '0 16px 40px -10px rgba(26,102,69,0.4)',
              }}
            >
              Get started — it's free
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[11px] font-semibold text-slate-600 mt-3">14-day free trial · Cancel anytime</p>
          </div>

          {/* RIGHT — laptop */}
          <div className="w-full">

           {/* View tabs above laptop */}
          <div className="mb-4 w-full">
            <div className="flex items-center gap-3 w-full">
              {VIEWS.map(v => {
                const isActive = current === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setCurrent(v.key)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[11px] sm:text-[12px] font-black transition-all whitespace-nowrap"
                    style={isActive
                      ? { background: '#1a6645', color: '#fff', border: '2px solid #1a6645', boxShadow: '0 0 0 3px rgba(255,255,255,0.12)' }
                      : { background: '#fff', color: '#0f172a', border: '2px solid #0f172a', boxShadow: '0 0 0 3px rgba(255,255,255,0.12)' }
                    }
                  >
                    <span className="hidden sm:inline-flex">{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

            {/* Laptop shell */}
            <div className="relative w-full">
              {/* Screen */}
              <div className="rounded-t-2xl overflow-hidden border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
                style={{ background: '#090d12' }}>

                {/* Menubar */}
                <div className="flex items-center px-4 gap-1.5 border-b border-white/5" style={{ height: 24, background: '#090d12' }}>
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <div className="flex-1 mx-4 h-4 rounded" style={{ background: '#1e293b' }} />
                </div>

                {/* Dashboard — light */}
                <div className="bg-white">

                  {/* Nav */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                        <img src="/images/ridgelinelogo.webp" alt="" className="w-4.5 h-4.5 object-contain" style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <div className="text-[12px] font-black text-slate-900 leading-none">Ridge Line Roofing</div>
                        <div className="text-[7px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Dashboard</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border bg-slate-100 border-slate-200 text-slate-400 text-[10px]">
                        <Search size={10} /> Search...
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 bg-blue-600 text-white font-black text-[10px]">                        <Plus size={10} strokeWidth={3} /> Create
                      </div>
                    </div>
                  </div>

          

                  {/* Content */}
                  <div className="px-4 pt-3 h-[280px] overflow-hidden relative">
                    {current === 'cards'    && <CardsPanel />}
                    {current === 'table'    && <TablePanel />}
                    {current === 'calendar' && <CalendarPanel />}
                    {current === 'outbox'   && <OutboxPanel />}
                    <div className="absolute bottom-0 inset-x-0 h-12 pointer-events-none bg-gradient-to-t from-white to-transparent" />
                  </div>

                </div>
              </div>

              {/* Laptop base */}
              <div className="h-3 rounded-b-xl" style={{ background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none' }} />
              <div className="h-2 rounded-b-lg mx-auto" style={{ width: '40%', background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}