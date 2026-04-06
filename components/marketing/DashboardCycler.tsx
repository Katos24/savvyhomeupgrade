'use client';

import { useEffect, useRef, useState } from 'react';
import {
  LayoutGrid, List, Calendar, Search, Plus, Menu,
  Sun, Moon, Sparkles, Filter, Clock, DollarSign,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const LEADS = [
  { name: 'Torres Roofing',    status: 'Scheduled',  statusColor: '#6366f1', date: 'Apr 12', time: '9:00 AM',  amount: '$7,950', paid: false, assigned: 'Mike T.', cat: 'Roofing'  },
  { name: 'Kim Gutters',       status: 'Won',         statusColor: '#10b981', date: 'Apr 13', time: '11:00 AM', amount: '$2,400', paid: true,  assigned: '—',       cat: 'Gutters'  },
  { name: 'Martinez Siding',   status: 'Quote Sent',  statusColor: '#eab308', date: '—',      time: '—',        amount: '$5,200', paid: false, assigned: 'Dave R.', cat: 'Siding'   },
  { name: 'Ridge Line LLC',    status: 'New',         statusColor: '#3b82f6', date: '—',      time: '—',        amount: '—',      paid: false, assigned: '—',       cat: 'Roofing'  },
  { name: 'ProClean Services', status: 'Won',         statusColor: '#10b981', date: 'Apr 15', time: '2:00 PM',  amount: '$1,800', paid: true,  assigned: 'Mike T.', cat: 'Cleaning' },
  { name: 'Apex Fencing',      status: 'Contacted',   statusColor: '#f97316', date: 'Apr 18', time: '10:00 AM', amount: '$3,100', paid: false, assigned: 'Dave R.', cat: 'Fencing'  },
];

const CAL_EVENTS: Record<number, { name: string; color: string }[]> = {
  12: [{ name: 'Torres',   color: '#6366f1' }],
  13: [{ name: 'Kim G.',   color: '#10b981' }],
  15: [{ name: 'ProClean', color: '#10b981' }],
  21: [{ name: 'Ridge L.', color: '#f97316' }, { name: 'Martinez', color: '#eab308' }],
};

const STATS = [
  { label: 'Total Leads',   value: '166',   darkColor: '#e2e8f0', lightColor: '#0f172a' },
  { label: 'Active Jobs',   value: '61',    darkColor: '#3b82f6', lightColor: '#3b82f6' },
  { label: 'Total Revenue', value: '$102k', darkColor: '#22c55e', lightColor: '#16a34a' },
  { label: 'Total Pending', value: '$122k', darkColor: '#f59e0b', lightColor: '#d97706' },
];

const DURATION = 3500;
const VIEWS = ['cards', 'table', 'calendar'] as const;
type View = typeof VIEWS[number];


// ─────────────────────────────────────────────────────────────────────────────
// Cards panel
// ─────────────────────────────────────────────────────────────────────────────

function CardsPanel({ isDark }: { isDark: boolean }) {
  const cardBg    = isDark ? '#1e293b' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const innerBg   = isDark ? '#0f172a' : '#f8fafc';
  const innerBorder = isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';
  const namColor  = isDark ? '#f1f5f9' : '#0f172a';
  const metaColor = isDark ? '#475569' : '#9ca3af';
  const schedColor = isDark ? '#818cf8' : '#6366f1';
  const timeColor = isDark ? '#94a3b8' : '#6b7280';
  const amtColor  = isDark ? '#f1f5f9' : '#0f172a';
  const arrowBg   = isDark ? '#0f172a' : '#f1f5f9';
  const arrowBorder = isDark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const arrowColor = isDark ? '#475569' : '#9ca3af';
  

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {LEADS.map((lead) => (
        <div key={lead.name} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: 4, flexShrink: 0, background: lead.statusColor }} />
          <div style={{ padding: 12, flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 5, display: 'inline-block', marginBottom: 8, background: `${lead.statusColor}25`, color: lead.statusColor }}>
              {lead.status}
            </div>
            <div style={{ fontSize: 13, fontWeight: 900, color: namColor, marginBottom: 4 }}>{lead.name}</div>
            <div style={{ fontSize: 9, color: metaColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{lead.assigned}</div>
            <div style={{ background: innerBg, border: `1px solid ${innerBorder}`, borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 7, color: metaColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Date</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: schedColor }}>{lead.date}</div>
              </div>
              <div style={{ borderLeft: `1px solid ${innerBorder}`, paddingLeft: 8 }}>
                <div style={{ fontSize: 7, color: metaColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Arrival</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: timeColor }}>{lead.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${innerBorder}` }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: amtColor }}>{lead.amount}</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: lead.paid ? '#10b981' : metaColor, marginTop: 2 }}>{lead.paid ? 'PAID' : 'UNPAID'}</div>
              </div>
              <div style={{ width: 28, height: 28, background: arrowBg, border: `1px solid ${arrowBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: arrowColor, fontSize: 14 }}>›</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Table panel
// ─────────────────────────────────────────────────────────────────────────────

function TablePanel({ isDark }: { isDark: boolean }) {
  const headBg  = isDark ? '#0a1120' : '#f9fafb';
  const border  = isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const rowBorder = isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6';
  const textPrimary = isDark ? '#f1f5f9' : '#111827';
  const textMuted   = isDark ? '#475569' : '#9ca3af';
  const textSec     = isDark ? '#cbd5e1' : '#374151';

  const th: React.CSSProperties = { fontSize: 9, fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '7px 10px', textAlign: 'left', borderBottom: `1px solid ${border}`, background: headBg, whiteSpace: 'nowrap' };
  const td = (extra?: React.CSSProperties): React.CSSProperties => ({ fontSize: 11, padding: '9px 10px', borderBottom: `1px solid ${rowBorder}`, whiteSpace: 'nowrap', color: textSec, ...extra });

  return (
    <div>
      <div style={{ background: headBg, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: textMuted, fontWeight: 600 }}>5 leads</span>
        <span style={{ background: '#6366f1', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6 }}>Edit</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Category', 'Status', 'Scheduled', 'Quote', 'Payment', 'Assigned'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADS.map((lead) => (
              <tr key={lead.name}>
                <td style={td({ fontWeight: 800, color: textPrimary })}>{lead.name}</td>
                <td style={td()}><span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', background: isDark ? 'rgba(14,165,233,0.2)' : '#e0f2fe', color: isDark ? '#38bdf8' : '#0369a1' }}>{lead.cat}</span></td>
                <td style={td()}><span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', color: 'white', background: lead.statusColor }}>{lead.status}</span></td>
                <td style={td({ color: lead.date !== '—' ? (isDark ? '#818cf8' : '#6366f1') : (isDark ? '#334155' : '#d1d5db'), fontWeight: lead.date !== '—' ? 700 : 400 })}>
                  {lead.date !== '—' ? `${lead.date} · ${lead.time}` : '—'}
                </td>
                <td style={td({ fontWeight: 800, color: lead.amount !== '—' ? '#10b981' : (isDark ? '#334155' : '#d1d5db') })}>{lead.amount}</td>
                <td style={td()}><span style={{ fontSize: 10, fontWeight: 800, color: lead.paid ? '#10b981' : '#ef4444' }}>{lead.paid ? 'Paid' : 'Unpaid'}</span></td>
                <td style={td({ color: lead.assigned !== '—' ? textSec : (isDark ? '#334155' : '#d1d5db') })}>{lead.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calendar panel
// ─────────────────────────────────────────────────────────────────────────────

function CalendarPanel({ isDark }: { isDark: boolean }) {
  const cellBg     = isDark ? 'rgba(255,255,255,0.02)' : '#f9fafb';
  const cellBorder = isDark ? 'rgba(255,255,255,0.04)' : '#e5e7eb';
  const dayColor   = isDark ? '#475569' : '#9ca3af';
  const labelColor = isDark ? '#334155' : '#d1d5db';
  const monthColor = isDark ? '#f1f5f9' : '#0f172a';
  const navBg      = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const navBorder  = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const navColor   = isDark ? '#475569' : '#9ca3af';

  const firstDay = 3; // April 2026 starts Wednesday
  const totalDays = 30;
  const today = 6;
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: monthColor }}>April 2026</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['‹', 'Today', '›'].map(l => (
            <div key={l} style={{ background: navBg, border: `1px solid ${navBorder}`, borderRadius: 7, padding: '3px 8px', color: navColor, fontSize: l === 'Today' ? 9 : 12, fontWeight: 800 }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ fontSize: 8, fontWeight: 800, color: labelColor, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', padding: '4px 0' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          const events = day ? (CAL_EVENTS[day] || []) : [];
          const isToday = day === today;
          return (
            <div key={i} style={{ minHeight: 54, background: day ? cellBg : 'transparent', border: `1px solid ${day ? cellBorder : 'transparent'}`, borderRadius: 7, padding: 4 }}>
              {day && (
                <>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: isToday ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: isToday ? 'white' : dayColor, marginBottom: 3 }}>{day}</div>
                  {events.map((ev, j) => (
                    <div key={j} style={{ fontSize: 8, fontWeight: 800, padding: '2px 4px', borderRadius: 4, marginBottom: 2, background: ev.color, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{ev.name}</div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardCycler() {
const [isDark, setIsDark] = useState(false);
  const [current, setCurrent] = useState<View>('cards');
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number>(0);

  useEffect(() => {
    let elapsed = 0;
    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      const delta = ts - startRef.current;
      startRef.current = ts;
      elapsed += delta;
      setProgress(Math.min((elapsed / DURATION) * 100, 100));
      if (elapsed >= DURATION) {
        elapsed = 0;
        setCurrent(prev => VIEWS[(VIEWS.indexOf(prev) + 1) % VIEWS.length]);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function jumpTo(v: View) {
    setCurrent(v);
    setProgress(0);
    startRef.current = null;
  }

  // Theme tokens
  const shell        = isDark ? '#0f172a' : '#ffffff';
  const shellBorder  = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const topbarBg     = isDark ? '#0a1120' : '#f9fafb';
  const topbarBorder = isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const titleColor   = isDark ? '#f1f5f9' : '#0f172a';
  const subtitleColor= isDark ? '#475569' : '#9ca3af';
  const tabActive    = isDark ? { bg: '#1e293b', border: 'rgba(255,255,255,0.1)', color: '#f1f5f9' } : { bg: '#e0e7ff', border: '#c7d2fe', color: '#4338ca' };
  const tabInactive  = isDark ? { color: '#475569' } : { color: '#9ca3af' };
  const statBg       = isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb';
  const statBorder   = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const statLabel    = isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af';
  const contentBg    = isDark ? '#0f172a' : '#ffffff';
  const searchBg     = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const searchBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const searchColor  = isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af';
  const pillBg       = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const pillBorder   = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
  const pillColor    = isDark ? 'rgba(255,255,255,0.4)' : '#6b7280';
  const menuBg       = isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6';
  const menuBorder   = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';

  const TAB_ICONS: Record<View, React.ReactNode> = {
    cards:    <LayoutGrid size={12} />,
    table:    <List size={12} />,
    calendar: <Calendar size={12} />,
  };

  return (
    <div style={{ background: shell, border: `1px solid ${shellBorder}` }}>

      {/* ── Top bar (mimics real dashboard header) */}
      <div style={{ background: topbarBg, borderBottom: `1px solid ${topbarBorder}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Hamburger */}
          <div style={{ width: 32, height: 32, background: menuBg, border: `1px solid ${menuBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={14} color={pillColor} />
          </div>
          {/* Logo */}
          <div style={{ width: 36, height: 36, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <img src="/images/ridgelinelogo.png" alt="Ridge Line Roofing" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          </div>
          <div style={{ borderLeft: `1px solid ${topbarBorder}`, paddingLeft: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: titleColor, lineHeight: 1 }}>Ridge Line Roofing</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: 3 }}>Dashboard</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Dark/light toggle */}
          <button
            onClick={() => setIsDark(v => !v)}
            style={{ width: 32, height: 32, background: menuBg, border: `1px solid ${menuBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {isDark ? <Sun size={13} color={pillColor} /> : <Moon size={13} color={pillColor} />}
          </button>
          {/* Create button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: isDark ? '#ffffff' : '#0f172a', borderRadius: 10, padding: '6px 12px' }}>
            <Plus size={12} color={isDark ? '#0f172a' : '#ffffff'} strokeWidth={3} />
            <span style={{ fontSize: 11, fontWeight: 800, color: isDark ? '#0f172a' : '#ffffff' }}>Create</span>
          </div>
        </div>
      </div>

      {/* ── Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '12px 16px 0' }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: statBg, border: `1px solid ${statBorder}`, borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: statLabel, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: isDark ? s.darkColor : s.lightColor }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Search + view switcher row */}
      <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search */}
        <div style={{ flex: 1, background: searchBg, border: `1px solid ${searchBorder}`, borderRadius: 12, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={13} color={searchColor} />
          <span style={{ fontSize: 11, color: searchColor, fontWeight: 500 }}>Search by name, email or phone...</span>
        </div>
        {/* Filter pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 10, padding: '7px 10px' }}>
          <Filter size={12} color={pillColor} />
          <span style={{ fontSize: 10, fontWeight: 800, color: pillColor }}>Filters</span>
        </div>
        {/* View switcher */}
        <div style={{ display: 'flex', background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {VIEWS.map(v => (
            <button
              key={v}
              onClick={() => jumpTo(v)}
              style={{
                padding: '6px 8px', borderRadius: 8, cursor: 'pointer', border: 'none',
                background: current === v ? '#6366f1' : 'transparent',
                color: current === v ? 'white' : pillColor,
                display: 'flex', alignItems: 'center', transition: 'all 0.2s',
              }}
            >
              {TAB_ICONS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Smart pills row */}
      <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6 }}>
        {[
          { icon: <Clock size={10} />, label: 'Scheduled Today' },
          { icon: <DollarSign size={10} />, label: 'Unpaid' },
          { icon: <Sparkles size={10} />, label: 'New (4)' },
        ].map(p => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: pillBg, border: `1px solid ${pillBorder}`, borderRadius: 10, padding: '5px 10px' }}>
            <span style={{ color: pillColor }}>{p.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: pillColor }}>{p.label}</span>
          </div>
        ))}
      </div>

      {/* ── Progress bar */}
      <div style={{ margin: '10px 16px 0', height: 2, background: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#6366f1', width: `${progress}%`, transition: 'width 0.05s linear' }} />
      </div>

      {/* ── View content — fixed height so switching views doesn't resize the shell */}
      <div style={{ padding: 16, background: contentBg, height: 340, overflow: 'hidden' }}>
        {current === 'cards'    && <CardsPanel    isDark={isDark} />}
        {current === 'table'    && <TablePanel    isDark={isDark} />}
        {current === 'calendar' && <CalendarPanel isDark={isDark} />}
      </div>

    </div>
  );
}