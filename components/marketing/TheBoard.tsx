// REPLACE your current import line with:

'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Calendar, Download, Menu, Sun, Moon, Search, Filter, Clock, DollarSign, Sparkles, Plus } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';
import DashboardCycler from '@/components/marketing/DashboardCycler';
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — THE BOARD
// Paste DashboardCycler (from DashboardCycler.tsx) into the same file,
// or import it: import DashboardCycler from '@/components/marketing/DashboardCycler'
// ─────────────────────────────────────────────────────────────────────────────

function TheBoard() {
  const { ref, visible } = useFadeIn();

  const views = [
    {
      icon: <LayoutGrid size={16} />,
      label: 'Card view',
      desc: 'See every job as a visual card. Check dates, payment status, and photos at a glance. Your daily action list.',
    },
    {
      icon: <List size={16} />,
      label: 'Table view',
      desc: 'Need to update 20 jobs at once? Switch to table view for bulk edits and export everything to CSV in one click.',
    },
    {
      icon: <Calendar size={16} />,
      label: 'Calendar view',
      desc: "See your team's full schedule at a glance. Spot gaps, avoid double bookings, plan the week in seconds.",
    },
  ];

  return (
<section className="py-24 px-6" style={{ backgroundColor: '#06080F' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-16 max-w-3xl mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
<p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#6366f1' }}>
            Your command center
          </p>
          <h2
            className="font-black tracking-tight leading-tight mb-4"
style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: '#ffffff' }}
          >
            Every lead. Every job. Every dollar.{' '}
            <span style={{ color: '#1a6645' }}>One screen.</span>
          </h2>
<p className="text-lg font-medium leading-relaxed" style={{ color: '#64748b' }}>            See everything at a glance — total leads, active jobs, revenue, and what's still unpaid. Switch between three views depending on what you need.
          </p>
        </div>

        {/* Dashboard cycler wrapped in browser chrome */}
        <div
          className="mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          {/* Outer browser shell */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)',
            border: '1px solid #1e2a3a',
          }}>

            {/* Browser chrome bar */}
            <div style={{
              background: '#1a2234',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* Traffic lights */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28c840' }} />
              </div>

              {/* URL bar */}
              <div style={{
                flex: 1,
                background: '#0d1520',
                borderRadius: 8,
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                {/* Lock */}
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="1" y="5.5" width="8" height="6" rx="1.5" fill="#4ade80" />
                  <path d="M3 5.5V3.5a2 2 0 1 1 4 0v2" stroke="#4ade80" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {/* URL text */}
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  lead2project.com/
                  <span style={{ color: '#818cf8', fontWeight: 800 }}>ridge-line-roofing</span>
                  /dashboard
                </span>
              </div>

              {/* Right side browser buttons (decorative) */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            </div>

            {/* Dashboard content */}
            <DashboardCycler />

          </div>

          {/* "Your slug goes here" caption */}
          <p className="text-center text-xs font-bold mt-3" style={{ color: '#9CA3AF' }}>
            Your company name becomes your link —{' '}
            <span style={{ color: '#6366f1' }}>lead2project.com/your-company</span>
          </p>
        </div>

        {/* 3 view callouts */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          {views.map((view, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border"
              style={{ background: '#fff', borderColor: '#E5E0D8' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: '#E8F4EF' }}
              >
                <span style={{ color: '#1a6645' }}>{view.icon}</span>
              </div>
              <p className="text-sm font-black mb-2" style={{ color: '#0F1F3D' }}>{view.label}</p>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>{view.desc}</p>
            </div>
          ))}
        </div>

        {/* CSV callout */}
        <div
          className="mt-8 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: '#E8F4EF',
            border: '1px solid #A8D5C2',
            opacity: visible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
        >
          <div className="flex items-center gap-3">
            <Download size={18} style={{ color: '#1a6645', flexShrink: 0 }} />
            <p className="text-sm font-bold" style={{ color: '#1a6645' }}>
              Your data is always yours — export everything to CSV in one click for bookkeeping, taxes, or reporting.
            </p>
          </div>
          <Link
            href="/signup"
            className="text-[12px] font-black px-4 py-2 rounded-xl whitespace-nowrap transition-all active:scale-95"
            style={{ background: '#1a6645', color: '#fff' }}
          >
            Get Started Free
          </Link>
        </div>

      </div>
    </section>
  );
}

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


export default TheBoard;