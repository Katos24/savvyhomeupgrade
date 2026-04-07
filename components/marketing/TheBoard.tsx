'use client';

import { useRef, useState } from 'react';
import { LayoutGrid, List, Calendar, Mail, ChevronRight, Search, Plus, Sun, Moon, DollarSign, Bell, Filter } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ── Data ─────────────────────────────────────────────────────────────────────

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#6366f1', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.',  category: 'Roofing'  },
  { name: 'Kim Gutters',       status: 'Won',         statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—',        category: 'Gutters'  },
  { name: 'Martinez Siding',   status: 'Quote Sent',  statusColor: '#eab308', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.',  category: 'Siding'   },
  { name: 'David Reyes',       status: 'New',         statusColor: '#10b981', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—',        category: 'Gutters'  },
  { name: 'ProClean Services', status: 'Won',         statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.',  category: 'Cleaning' },
  { name: 'Apex Fencing',      status: 'Contacted',   statusColor: '#f97316', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.',  category: 'Fencing'  },
];

const STATS = [
  { label: 'Total Leads',   value: '168', color: '#f9fafb' },
  { label: 'Active Jobs',   value: '63',  color: '#3b82f6' },
  { label: 'Revenue',       value: '$102k', color: '#10b981' },
  { label: 'Pending',       value: '$122k', color: '#f59e0b' },
];

const CAL_EVENTS: Record<number, { name: string; color: string }[]> = {
  12: [{ name: 'Torres',    color: '#6366f1' }],
  13: [{ name: 'Kim G.',    color: '#10b981' }],
  15: [{ name: 'ProClean',  color: '#10b981' }],
  21: [{ name: 'D. Reyes',  color: '#10b981' }, { name: 'Martinez', color: '#eab308' }],
};

const OUTBOX = [
  { type: 'quote',            name: 'Torres Roofing',    detail: '$7,950 quote sent',          time: '2h ago',  color: '#f97316', icon: 'dollar'    },
  { type: 'schedule',         name: 'Kim Gutters',       detail: 'Apr 13 · 11:00 AM confirmed', time: '5h ago',  color: '#60a5fa', icon: 'calendar'  },
  { type: 'payment_reminder', name: 'Apex Fencing',      detail: '$3,100 payment reminder',    time: '1d ago',  color: '#fb923c', icon: 'bell'      },
  { type: 'quote',            name: 'Martinez Siding',   detail: '$5,200 quote sent',          time: '2d ago',  color: '#f97316', icon: 'dollar'    },
  { type: 'schedule',         name: 'ProClean Services', detail: 'Apr 15 · 2:00 PM confirmed', time: '3d ago',  color: '#60a5fa', icon: 'calendar'  },
];

const FILTERS = ['Today', 'Unpaid', 'New', 'Scheduled Today'];

type View = 'cards' | 'table' | 'calendar' | 'outbox';

// ── Sub-panels ────────────────────────────────────────────────────────────────

function CardsPanel({ isDark }: { isDark: boolean }) {
  const bg = isDark ? 'bg-[#1e293b] border-white/8' : 'bg-white border-slate-200';
  const text = isDark ? 'text-slate-100' : 'text-slate-900';
  const sub = isDark ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-100';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 h-full overflow-y-auto pb-4">
      {LEADS.map(lead => (
        <div key={lead.name} className={`flex rounded-xl overflow-hidden border ${bg}`}>
          <div className="w-1 shrink-0" style={{ background: lead.statusColor }} />
          <div className="p-2.5 flex-1 min-w-0">
            <div className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded inline-block mb-1.5"
              style={{ background: `${lead.statusColor}25`, color: lead.statusColor }}>
              {lead.status}
            </div>
            <div className={`text-[12px] font-black mb-1 truncate ${text}`}>{lead.name}</div>
            <div className={`text-[9px] font-bold mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{lead.category}</div>
            <div className={`grid grid-cols-2 gap-1 p-1.5 rounded-lg mb-2 border ${sub}`}>
              <div>
                <div className="text-[7px] text-slate-400 font-black uppercase">Date</div>
                <div className="text-[9px] font-black text-indigo-500">{lead.date}</div>
              </div>
              <div className="border-l border-slate-200/20 pl-1.5">
                <div className="text-[7px] text-slate-400 font-black uppercase">Arrival</div>
                <div className="text-[9px] font-black text-slate-500">{lead.time}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-emerald-500">{lead.amount}</span>
              <ChevronRight size={12} className="text-slate-400" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePanel({ isDark }: { isDark: boolean }) {
  const headText = isDark ? 'text-slate-500' : 'text-slate-400';
  const rowText = isDark ? 'text-white' : 'text-slate-900';
  const borderCol = isDark ? 'border-white/5' : 'border-slate-100';

  return (
    <div className="overflow-x-auto h-full pb-4">
      <table className="w-full border-collapse" style={{ minWidth: 560 }}>
        <thead>
          <tr className={`text-[9px] font-black uppercase tracking-widest ${headText}`}>
            {['Name', 'Category', 'Status', 'Scheduled', 'Assigned', 'Amount', 'Payment'].map(h => (
              <th key={h} className={`p-2.5 text-left border-b ${borderCol} whitespace-nowrap`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LEADS.map(lead => (
            <tr key={lead.name} className={`text-[11px] border-b ${borderCol} ${isDark ? 'hover:bg-white/3' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}>
              <td className={`p-2.5 font-black whitespace-nowrap ${rowText}`}>{lead.name}</td>
              <td className="p-2.5 whitespace-nowrap">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isDark ? 'bg-sky-500/15 text-sky-300 border border-sky-500/20' : 'bg-sky-100 text-sky-700'}`}>
                  {lead.category}
                </span>
              </td>
              <td className="p-2.5 whitespace-nowrap">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black text-white" style={{ background: lead.statusColor }}>
                  {lead.status}
                </span>
              </td>
              <td className={`p-2.5 whitespace-nowrap font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{lead.date}</td>
              <td className="p-2.5 whitespace-nowrap">
                {lead.assigned !== '—'
                  ? <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isDark ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : 'bg-violet-100 text-violet-700'}`}>{lead.assigned}</span>
                  : <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>—</span>
                }
              </td>
              <td className="p-2.5 whitespace-nowrap font-black text-emerald-500">{lead.amount}</td>
              <td className={`p-2.5 whitespace-nowrap font-black ${lead.paid ? 'text-emerald-500' : 'text-rose-500'}`}>
                {lead.paid ? 'Paid' : 'Unpaid'}
              </td>
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
    <div className="h-full overflow-y-auto pb-4">
      <div className="grid grid-cols-7 gap-px">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-[8px] font-black text-slate-500 uppercase text-center py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          const events = day ? (CAL_EVENTS[day] || []) : [];
          return (
            <div key={i} className={`min-h-[44px] p-1 border text-[9px] ${
              day ? (isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100') : 'border-transparent'
            }`}>
              {day && <span className="font-black text-slate-400">{day}</span>}
              {events.map((ev, j) => (
                <div key={j} className="text-[7px] font-black text-white px-1 py-0.5 rounded truncate mt-0.5" style={{ background: ev.color }}>
                  {ev.name}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutboxPanel({ isDark }: { isDark: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    dollar:   <DollarSign size={14} />,
    calendar: <Mail size={14} />,
    bell:     <Bell size={14} />,
  };

  return (
    <div className="h-full overflow-y-auto pb-4 space-y-2">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Sent',     value: '47', color: '#f9fafb' },
          { label: 'Quotes',   value: '$28k', color: '#f97316' },
          { label: 'Reminders',value: '8',  color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} className={`p-2.5 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <p className="text-[7px] font-black uppercase text-slate-500 tracking-widest mb-1">{s.label}</p>
            <p className="text-[13px] font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Email rows */}
      {OUTBOX.map((email, i) => (
        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${isDark ? 'bg-[#0d1117] border-white/5 hover:bg-white/3' : 'bg-white border-slate-100 hover:bg-slate-50'}`}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${email.color}15`, border: `1px solid ${email.color}30`, color: email.color }}>
            {icons[email.icon]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: email.color }}>
                {email.type === 'payment_reminder' ? 'Reminder' : email.type.charAt(0).toUpperCase() + email.type.slice(1)}
              </span>
            </div>
            <p className={`text-[11px] font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{email.name}</p>
            <p className={`text-[10px] truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{email.detail}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{email.time}</span>
          </div>
        </div>
      ))}

      <p className={`text-center text-[10px] font-black uppercase tracking-widest pt-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        All emails tracked · Nothing missed
      </p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TheBoard() {
  const [isDark, setIsDark] = useState(false);
  const [current, setCurrent] = useState<View>('cards');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { ref, visible } = useFadeIn();

  const VIEWS: { key: View; icon: React.ReactNode; label: string; activeColor: string; activeBg: string; activeBorder: string }[] = [
    { key: 'cards',    icon: <LayoutGrid size={15} />, label: 'Visual Cards',   activeColor: '#4f46e5', activeBg: '#eef2ff', activeBorder: '#c7d2fe' },
    { key: 'table',    icon: <List size={15} />,       label: 'Table View',     activeColor: '#0369a1', activeBg: '#e0f2fe', activeBorder: '#bae6fd' },
    { key: 'calendar', icon: <Calendar size={15} />,   label: 'Team Calendar',  activeColor: '#15803d', activeBg: '#dcfce7', activeBorder: '#bbf7d0' },
    { key: 'outbox',   icon: <Mail size={15} />,       label: 'Email Outbox',   activeColor: '#c2410c', activeBg: '#fff7ed', activeBorder: '#fed7aa' },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#06080F] overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={ref} className="text-center mb-8 max-w-3xl mx-auto"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4 text-[#6366f1]">The Last Dashboard You'll Need</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Every lead. Every job. <span className="text-[#1a6645]">One screen.</span>
          </h2>
          <p className="text-slate-400 font-medium mb-8">Switch views. Your data, your way.</p>

          {/* View tabs — centered, Jobber-style light pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {VIEWS.map(v => {
              const isActive = current === v.key;
              return (
                <button key={v.key} onClick={() => setCurrent(v.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-black transition-all border"
                  style={isActive ? {
                    background: v.activeBg,
                    color: v.activeColor,
                    borderColor: v.activeBorder,
                  } : {
                    background: 'rgba(255,255,255,0.05)',
                    color: '#64748b',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                  {v.icon}
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theme toggle + shell wrapper */}
        <div className="flex justify-end mb-3">
          <button onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl transition-all border text-[11px] font-bold flex items-center gap-1.5 ${isDark ? 'bg-indigo-500/10 text-amber-400 border-indigo-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Browser shell */}
        <div className={`rounded-2xl overflow-hidden border shadow-2xl transition-colors duration-500 ${isDark ? 'border-white/8 bg-[#0f172a]' : 'border-slate-200 bg-white'}`}>

          {/* URL bar */}
          <div className={`flex items-center gap-3 px-4 py-2.5 border-b ${isDark ? 'bg-[#1a2234] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className={`flex-1 rounded-lg py-1 px-3 text-[10px] font-mono truncate ${isDark ? 'bg-[#0d1520] border border-white/8 text-slate-500' : 'bg-white border border-slate-200 text-slate-400'}`}>
              lead2project.com/<span className={isDark ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold'}>ridge-line</span>/dashboard
            </div>
          </div>

          {/* Dashboard nav */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${isDark ? 'bg-white border-slate-200' : 'bg-white border-slate-200'}`}>
                <img src="/images/ridgelinelogo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className={`text-[13px] font-black leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>Ridge Line Roofing</div>
                <div className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Dashboard</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] ${isDark ? 'bg-white/5 border-white/8 text-slate-500' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                <Search size={12} /> Search...
              </div>
              <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white font-black text-[11px] ${isDark ? 'bg-indigo-600' : 'bg-indigo-600'}`}>
                <Plus size={12} strokeWidth={3} /> Create
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className={`flex overflow-x-auto gap-3 px-4 py-3 border-b no-scrollbar ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            {STATS.map(s => (
              <div key={s.label} className={`min-w-[100px] flex-1 p-2.5 rounded-xl border shrink-0 ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[7px] font-black uppercase text-slate-400 tracking-widest mb-1">{s.label}</p>
                <p className="text-[17px] font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className={`flex items-center gap-2 px-4 py-2.5 border-b overflow-x-auto no-scrollbar ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <Filter size={11} className={isDark ? 'text-slate-600 shrink-0' : 'text-slate-400 shrink-0'} />
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                  activeFilter === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : isDark
                      ? 'bg-white/4 border-white/8 text-slate-400 hover:border-white/20'
                      : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-4 pt-3 h-[360px] overflow-hidden">
            {current === 'cards'    && <CardsPanel    isDark={isDark} />}
            {current === 'table'    && <TablePanel    isDark={isDark} />}
            {current === 'calendar' && <CalendarPanel isDark={isDark} />}
            {current === 'outbox'   && <OutboxPanel   isDark={isDark} />}
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { title: 'Visual Cards',    icon: <LayoutGrid size={18} />, desc: 'See every lead at a glance. Color-coded by status, filterable by crew or category.'  },
            { title: 'Table & Exports', icon: <List size={18} />,       desc: 'Full data table with bulk edits, sorting, and CSV export for accounting or reporting.' },
            { title: 'Team Calendar',   icon: <Calendar size={18} />,   desc: 'See all scheduled jobs in one view. Know who\'s where and when at a glance.'           },
            { title: 'Email Outbox',    icon: <Mail size={18} />,       desc: 'Every quote, schedule, and reminder tracked. Never wonder if something was sent.'       },
          ].map((item, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${isDark ? 'bg-white/3 border-white/8' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-50 text-emerald-700'}`}>
                {item.icon}
              </div>
              <p className={`font-black text-[14px] mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
              <p className={`text-[12px] font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}