'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const LEADS = [
  { name: 'Torres Roofing',  status: 'Scheduled',  statusColor: '#3b82f6', date: 'Apr 12', amount: '$7,950', assigned: 'Mike T.', category: 'Roofing' },
  { name: 'Kim Gutters',     status: 'Won',        statusColor: '#10b981', date: 'Apr 13', amount: '$2,400', assigned: '—',       category: 'Gutters' },
  { name: 'Martinez Siding', status: 'Quote Sent', statusColor: '#eab308', date: '—',      amount: '$5,200', assigned: 'Dave R.', category: 'Siding'  },
  { name: 'David Reyes',     status: 'New',        statusColor: '#10b981', date: '—',      amount: '—',      assigned: '—',       category: 'Gutters' },
];

const STATS = [
  { label: 'Leads',   value: '168',   accent: '#3b82f6' },
  { label: 'Active',  value: '63',    accent: '#0891b2' },
  { label: 'Revenue', value: '$102k', accent: '#10b981' },
  { label: 'Pending', value: '$122k', accent: '#f59e0b' },
];

type CycleMode = { dark: boolean; view: 'cards' | 'table' };

const CYCLE: CycleMode[] = [
  { dark: true,  view: 'cards' },
  { dark: false, view: 'cards' },
  { dark: false, view: 'table' },
];

function CardsPanel({ dark }: { dark: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-1 h-full overflow-hidden pb-2">
      {LEADS.map(lead => (
        <div
          key={lead.name}
          className="flex flex-col border-2 rounded-xl overflow-hidden"
          style={{
            borderColor: dark ? '#ffffff' : '#0f172a',
            background: dark ? '#161d2f' : '#ffffff',
          }}
        >
          <div className="px-1.5 pt-1.5 pb-1">
            <span
              className="inline-flex items-center gap-1 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
              style={{ background: `${lead.statusColor}20`, color: lead.statusColor }}
            >
              <span className="w-1 h-1 rounded-full shrink-0" style={{ background: lead.statusColor }} />
              {lead.status}
            </span>
          </div>

          <div className="px-1.5 pb-1">
            <p className="text-[10px] font-black leading-tight truncate" style={{ color: dark ? '#f9fafb' : '#0f172a' }}>
              {lead.name}
            </p>
            <p className="text-[7px] font-bold uppercase tracking-widest truncate mt-0.5" style={{ color: dark ? '#4b5563' : '#94a3b8' }}>
              {lead.category}
            </p>
          </div>

          <div
            className="mx-1 mb-1 grid grid-cols-2 p-1 rounded-lg"
            style={{
              background: dark ? '#0d1117' : '#f8fafc',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
            }}
          >
            <div>
              <p className="text-[6px] font-black uppercase tracking-widest mb-0.5" style={{ color: dark ? '#374151' : '#94a3b8' }}>Date</p>
              <p className="text-[8px] font-black text-blue-400">{lead.date}</p>
            </div>
            <div className="pl-1.5" style={{ borderLeft: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` }}>
              <p className="text-[6px] font-black uppercase tracking-widest mb-0.5" style={{ color: dark ? '#374151' : '#94a3b8' }}>Revenue</p>
              <p className="text-[8px] font-black text-emerald-500">{lead.amount}</p>
            </div>
          </div>

          <div
            className="flex items-center justify-between px-1.5 py-1 mt-auto"
            style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}
          >
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[6px] font-black text-white shrink-0">
                {lead.assigned !== '—' ? lead.assigned.charAt(0) : '?'}
              </div>
              <span className="text-[7px] font-bold truncate max-w-[35px]" style={{ color: dark ? '#4b5563' : '#94a3b8' }}>
                {lead.assigned === '—' ? 'Unassigned' : lead.assigned}
              </span>
            </div>
            <div
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
              style={{ background: dark ? 'rgba(59,130,246,0.2)' : '#0f172a' }}
            >
              <span className="text-[6px] font-black uppercase tracking-widest" style={{ color: dark ? '#93c5fd' : '#ffffff' }}>Open</span>
              <svg width="6" height="6" viewBox="0 0 16 16" fill="none">
                <path d="M5 8h6M8 5l3 3-3 3" stroke={dark ? '#93c5fd' : '#ffffff'} strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TablePanel() {
  return (
    <div className="h-full overflow-hidden">
      <table className="w-full border-collapse" style={{ minWidth: 320 }}>
        <thead>
          <tr className="border-b border-slate-100">
            {['Name', 'Status', 'Date', 'Amount'].map(h => (
              <th key={h} className="px-2 py-1.5 text-left text-[7px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LEADS.map(lead => (
            <tr key={lead.name} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-2 py-2">
                <p className="text-[9px] font-black text-slate-900 truncate max-w-[70px]">{lead.name}</p>
                <p className="text-[7px] text-slate-400 truncate">{lead.category}</p>
              </td>
              <td className="px-2 py-2">
                <span
                  className="text-[7px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: `${lead.statusColor}15`, color: lead.statusColor }}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-2 py-2 text-[8px] font-bold text-blue-500 whitespace-nowrap">{lead.date}</td>
              <td className="px-2 py-2 text-[8px] font-black text-emerald-500 whitespace-nowrap">{lead.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardMockupLight() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        position: 'relative', width: 260,
        background: '#f1f5f9', borderRadius: 42,
        border: '6px solid #1e1e2e',
        boxShadow: '0 0 0 1px #2a2a3e, 0 48px 80px rgba(0,0,0,0.65)',
        overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {[{l:true,top:80,h:26},{l:true,top:116,h:44},{l:true,top:168,h:44},{l:false,top:104,h:56}].map((b,i) => (
          <div key={i} style={{ position:'absolute', [b.l?'left':'right']:-3, top:b.top, width:3, height:b.h, background:'#1e1e2e', borderRadius: b.l?'2px 0 0 2px':'0 2px 2px 0' }} />
        ))}
        <div style={{ width:88, height:22, background:'#1e1e2e', borderRadius:'0 0 16px 16px', margin:'0 auto', position:'relative', zIndex:10 }} />
        <div style={{ background:'#f1f5f9', paddingBottom:12 }}>
          <div style={{ margin:'6px 10px', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:10, padding:'5px 10px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />
            <span style={{ fontSize:8, fontWeight:800, color:'#dc2626' }}>15 Overdue</span>
            <span style={{ fontSize:8, color:'#94a3b8', margin:'0 2px' }}>·</span>
            <span style={{ fontSize:8, fontWeight:700, color:'#f97316' }}>1 Due Soon</span>
          </div>
          <div style={{ margin:'6px 10px', background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'8px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:30, height:30, background:'#f8fafc', borderRadius:9, border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/images/ridgelinelogo.webp" alt="" style={{ width:26, height:26, objectFit:'contain' }} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:'#0f172a' }}>Ridge Line Roofing</div>
                <div style={{ fontSize:7.5, fontWeight:700, color:'#3b82f6', letterSpacing:'.1em', textTransform:'uppercase' }}>Dashboard</div>
              </div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, padding:'0 10px 8px' }}>
            {[
              { label:'Total Leads',   value:'168',         color:'#0f172a',  bg:'#eff6ff',  border:'#bfdbfe' },
              { label:'Active Jobs',   value:'63',          color:'#1d4ed8',  bg:'#eff6ff',  border:'#bfdbfe' },
              { label:'Total Revenue', value:'$102,671.96', color:'#15803d',  bg:'#f0fdf4',  border:'#bbf7d0', small:true },
              { label:'Total Pending', value:'$122,880',    color:'#d97706',  bg:'#fffbeb',  border:'#fde68a', small:true },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius:12, padding:'8px 10px', border:`1px solid ${s.border}` }}>
                <div style={{ fontSize:7, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:s.small?11:16, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ margin:'0 10px', background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <div style={{ borderLeft:'4px solid #10b981', padding:'7px 10px 6px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:6, padding:'2px 7px', fontSize:7, fontWeight:800, color:'#15803d', textTransform:'uppercase' }}>New</div>
              <span style={{ fontSize:7, color:'#94a3b8' }}>just now</span>
            </div>
            <div style={{ padding:'8px 10px 10px' }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:1 }}>David Reyes</div>
              <div style={{ fontSize:8.5, color:'#94a3b8', marginBottom:8 }}>Unassigned · via QR scan</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:7, borderTop:'1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#0f172a' }}>$0</div>
                  <div style={{ fontSize:7, color:'#94a3b8', textTransform:'uppercase' }}>Unpaid</div>
                </div>
                <div style={{ width:28, height:28, background:'#dbeafe', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#2563eb"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width:72, height:4, background:'#cbd5e1', borderRadius:4, margin:'8px auto 6px' }} />
      </div>
    </div>
  );
}

export function DashboardLaptopMockup() {
  const [cycleIdx, setCycleIdx] = useState(0);
  const [phoneVisible, setPhoneVisible] = useState(false);

  const current = CYCLE[cycleIdx];

  useEffect(() => {
    const t = setInterval(() => {
      setCycleIdx(i => (i + 1) % CYCLE.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPhoneVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const bgColor      = current.dark ? '#0d1117'                  : '#f1f5f9';
  const navBg        = current.dark ? '#161d2f'                  : '#ffffff';
  const navBorder    = current.dark ? 'rgba(255,255,255,0.05)'   : '#e2e8f0';
  const statsBg      = current.dark ? '#161d2f'                  : '#ffffff';
  const statsBorder  = current.dark ? 'rgba(255,255,255,0.05)'   : '#e2e8f0';
  const labelColor   = current.dark ? '#4b5563'                  : '#94a3b8';
  const filterBg     = current.dark ? '#0d1117'                  : '#f1f5f9';
  const filterBorder = current.dark ? 'rgba(255,255,255,0.06)'   : '#e2e8f0';
  const filterText   = current.dark ? '#6b7280'                  : '#475569';
  const contentBg    = current.dark ? '#0d1117'                  : '#f8fafc';
  const gradientFrom = current.dark ? '#0d1117'                  : '#f8fafc';

  return (
    <div className="relative flex items-end justify-center w-full">

      {/* ── Laptop shell ── */}
      <div className="relative w-full" style={{ maxWidth: 820 }}>

        <div
          className="rounded-t-xl overflow-hidden border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
          style={{ background: '#0d1117', transition: 'background 0.4s ease' }}
        >
          {/* Menu bar */}
          <div className="flex items-center px-3 gap-1.5 border-b border-white/5" style={{ height: 24, background: '#090d12' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <div className="flex-1 mx-3 h-3.5 rounded-sm" style={{ background: '#1e293b' }} />
          </div>

          {/* Dashboard content */}
          <div style={{ background: bgColor, padding: '10px 12px 12px', transition: 'background 0.4s ease' }}>

            {/* Nav bar */}
            <div
              className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
              style={{ background: navBg, border: `1px solid ${navBorder}`, transition: 'background 0.4s ease, border-color 0.4s ease' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-lg overflow-hidden" style={{ width: 22, height: 22, background: '#fff' }}>
                  <img src="/images/ridgelinelogo.webp" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: current.dark ? '#f9fafb' : '#0f172a', letterSpacing: '-0.2px', transition: 'color 0.4s ease' }}>Ridge Line Roofing</div>
                  <div style={{ fontSize: 7, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: filterBg, border: `1px solid ${filterBorder}` }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={filterText} strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke={filterText} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 8, color: filterText }}>Search...</span>
              </div>
            </div>

            {/* Stats — now with soft colored backgrounds matching real dashboard */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {[
                { label: 'Leads',   value: '168',   accent: '#3b82f6', lightBg: '#eff6ff', lightBorder: '#bfdbfe', lightText: '#1d4ed8', darkBg: 'rgba(59,130,246,0.1)', darkBorder: 'rgba(59,130,246,0.2)' },
                { label: 'Active',  value: '63',    accent: '#0891b2', lightBg: '#ecfeff', lightBorder: '#a5f3fc', lightText: '#0e7490', darkBg: 'rgba(8,145,178,0.1)',  darkBorder: 'rgba(8,145,178,0.2)'  },
                { label: 'Revenue', value: '$102k', accent: '#10b981', lightBg: '#f0fdf4', lightBorder: '#bbf7d0', lightText: '#15803d', darkBg: 'rgba(16,185,129,0.1)', darkBorder: 'rgba(16,185,129,0.2)' },
                { label: 'Pending', value: '$122k', accent: '#f59e0b', lightBg: '#fffbeb', lightBorder: '#fde68a', lightText: '#d97706', darkBg: 'rgba(245,158,11,0.1)', darkBorder: 'rgba(245,158,11,0.2)' },
              ].map(s => (
                <div
                  key={s.label}
                  className="rounded-xl px-2 py-1.5"
                  style={{
                    background: current.dark ? s.darkBg : s.lightBg,
                    border: `1px solid ${current.dark ? s.darkBorder : s.lightBorder}`,
                    transition: 'background 0.4s ease',
                  }}
                >
                  <p style={{ fontSize: 6, fontWeight: 700, color: current.dark ? s.accent + 'aa' : s.accent, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>{s.label}</p>
                  <p style={{ fontSize: 9, fontWeight: 800, color: current.dark ? s.accent : s.lightText, transition: 'color 0.4s ease' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 mb-3">
              {['Filters', 'Today', 'Unpaid', 'New (18)'].map((f, i) => (
                <div
                  key={f}
                  className="rounded-full px-2 py-0.5 whitespace-nowrap"
                  style={{
                    fontSize: 7, fontWeight: 700,
                    color: i === 0 ? '#2563eb' : filterText,
                    background: i === 0 ? (current.dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : filterBg,
                    border: `1px solid ${i === 0 ? 'rgba(59,130,246,0.3)' : filterBorder}`,
                    transition: 'background 0.4s ease',
                  }}
                >
                  {f}
                </div>
              ))}
            </div>

            {/* Content area with crossfade */}
            <div className="relative" style={{ height: 160, overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${cycleIdx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  {current.view === 'cards' && <CardsPanel dark={current.dark} />}
                  {current.view === 'table' && <TablePanel />}
                </motion.div>
              </AnimatePresence>

              <div
                className="absolute bottom-0 inset-x-0 h-10 pointer-events-none"
                style={{ background: `linear-gradient(to top, ${gradientFrom}, transparent)`, transition: 'background 0.4s ease' }}
              />
            </div>

          </div>
        </div>

        {/* Laptop base */}
        <div className="rounded-b-xl border-t-0" style={{ height: 12, background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }} />
        <div className="rounded-b-lg mx-auto" style={{ width: '38%', height: 7, background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {CYCLE.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: cycleIdx === i ? 16 : 4,
                height: 4,
                background: cycleIdx === i ? '#1a6645' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Phone overlay — hidden on mobile ── */}
      <div
        className="hidden md:block absolute"
        style={{
          bottom: 28,
          right: -20,
          zIndex: 10,
          opacity: phoneVisible ? 1 : 0,
          transform: phoneVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease 0.5s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
          filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.6))',
        }}
      >
        <div style={{ transform: 'scale(0.62)', transformOrigin: 'bottom right' }}>
          <DashboardMockupLight />
        </div>
      </div>

    </div>
  );
}