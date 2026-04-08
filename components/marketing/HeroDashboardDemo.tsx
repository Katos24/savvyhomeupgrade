'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, ChevronRight, QrCode, Wifi } from 'lucide-react';

const EXISTING_LEADS = [
  { name: 'Marcus Thornton', status: 'Contacted', statusColor: '#f59e0b', date: 'Apr 12', category: 'Roofing', amount: '$7,950' },
  { name: 'David Reyes',     status: 'Scheduled', statusColor: '#6366f1', date: 'Apr 15', category: 'Gutters', amount: '$2,400' },
  { name: 'Sarah Kim',       status: 'Won',        statusColor: '#10b981', date: 'Apr 13', category: 'Siding',  amount: '$5,200' },
];

const STATS = [
  { label: 'Total Leads', value: '168' },
  { label: 'Active Jobs', value: '63'  },
  { label: 'Revenue',     value: '$102k' },
];

function LeadRow({ name, status, statusColor, date, category, amount, isNew = false, visible = true }: any) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-700"
      style={{
        background: isNew ? `${statusColor}08` : '#0d1117',
        borderColor: isNew ? `${statusColor}30` : '#1f2937',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        boxShadow: isNew ? `0 0 0 1px ${statusColor}15` : 'none',
      }}
    >
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: statusColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-black text-white truncate">{name}</p>
          {isNew && <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">just now</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ background: `${statusColor}20`, color: statusColor }}>{status}</span>
          <span className="text-[9px] text-slate-600 font-medium">{category}</span>
          {isNew && (
            <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
              <QrCode size={9} /> via QR scan
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[11px] font-black text-emerald-500">{amount}</p>
        <p className="text-[9px] text-slate-600">{date}</p>
      </div>
      <ChevronRight size={12} className="text-slate-700 shrink-0" />
    </div>
  );
}

export default function HeroDashboardDemo() {
  const [newLeadVisible, setNewLeadVisible] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setNewLeadVisible(true), 1200);
    const t2 = setTimeout(() => setBadgeVisible(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative w-full max-w-[560px] mx-auto lg:mx-0">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(26,102,69,0.12) 0%, transparent 70%)' }} />

      {/* Browser shell */}
      <div className="relative rounded-[1.75rem] overflow-hidden border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
        style={{ background: '#06080F' }}>

        {/* URL bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5" style={{ background: '#0d1117' }}>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 bg-white/5 rounded-lg py-1 px-3 text-[10px] font-mono text-slate-500 border border-white/5">
            lead2project.com/<span className="text-indigo-400 font-bold">ridge-line</span>/dashboard
          </div>
        </div>

        {/* Dashboard header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
              <img src="/images/ridgelinelogo.png" alt="" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="text-[12px] font-black text-white leading-none">Ridge Line Roofing</p>
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 text-slate-500 text-[10px]">
              <Search size={11} /> Search...
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-[10px]">
              <Plus size={11} strokeWidth={3} /> Create
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3 px-4 py-3 border-b border-white/5">
          {STATS.map(s => (
            <div key={s.label} className="flex-1 px-3 py-2 rounded-xl border border-white/5" style={{ background: '#0d1117' }}>
              <p className="text-[7px] font-black uppercase text-slate-600 tracking-widest mb-1">{s.label}</p>
              <p className="text-[16px] font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Lead list */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Recent Leads</p>
            <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-400">
              <Wifi size={9} /> Live
            </div>
          </div>

          {/* New lead — animates in first */}
          <LeadRow
            name="Curtis Wilson"
            status="New"
            statusColor="#10b981"
            date="just now"
            category="Roofing"
            amount="—"
            isNew
            visible={newLeadVisible}
          />

          {/* Existing leads */}
          {EXISTING_LEADS.map((lead, i) => (
            <LeadRow key={i} {...lead} visible />
          ))}
        </div>

        <div className="h-3" />
      </div>

      {/* Floating badge */}
      <div
        className="absolute -bottom-4 right-2 sm:-right-4 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 shadow-2xl transition-all duration-700"
        style={{
          background: '#0F1F3D',
          opacity: badgeVisible ? 1 : 0,
          transform: badgeVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
        }}
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <QrCode size={15} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New lead</p>
          <p className="text-[12px] font-black text-white">Curtis Wilson · via QR</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      </div>

    </div>
  );
}