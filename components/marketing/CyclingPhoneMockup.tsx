'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1: Dashboard — stats + lead card
// ─────────────────────────────────────────────────────────────────────────────
function ScreenDashboard() {
  return (
    <div style={{ background: '#0d0d1a', height: '100%', overflowY: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 16, height: 1.5, background: '#6b7280', borderRadius: 2 }} />)}
          </div>
          <div style={{ width: 30, height: 30, background: '#111827', borderRadius: 9, border: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/images/ridgelinelogo.png" alt="logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.3px', lineHeight: 1.15 }}>Ridge Line Roofing</div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: '#4b5563', letterSpacing: '.1em', textTransform: 'uppercase' }}>Dashboard</div>
          </div>
        </div>
        <div style={{ width: 26, height: 26, background: '#1d4ed8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, padding: '0 12px 8px' }}>
        {[
          { label: 'Total Leads',   value: '167',      color: '#f9fafb', small: false },
          { label: 'Active Jobs',   value: '62',       color: '#10b981', small: false },
          { label: 'Total Revenue', value: '$102,671', color: '#10b981', small: true  },
          { label: 'Total Pending', value: '$122,880', color: '#f59e0b', small: true  },
        ].map(s => (
          <div key={s.label} style={{ background: '#111827', borderRadius: 10, padding: '8px 10px', border: '1px solid #1f2937' }}>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: s.small ? 12 : 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px 6px' }}>
        <div style={{ flex: 1, background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#374151" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 9, color: '#374151' }}>Search by name...</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[false, true, false].map((active, i) => (
            <div key={i} style={{ width: 24, height: 24, background: active ? '#1d4ed8' : '#111827', border: `1px solid ${active ? '#1d4ed8' : '#1f2937'}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 1 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#fff"/></svg>}
              {i !== 1 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 5, padding: '0 12px 8px', overflow: 'hidden' }}>
        {[
          { label: 'Today',    bg: 'transparent', border: '#1f2937', color: '#6b7280' },
          { label: '$ Unpaid', bg: '#064e3b',     border: '#065f46', color: '#10b981' },
          { label: 'New (17)', bg: '#1e3a5f',     border: '#1d4ed8', color: '#60a5fa' },
        ].map(c => (
          <div key={c.label} style={{ padding: '3px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, whiteSpace: 'nowrap', background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>{c.label}</div>
        ))}
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 4px' }}>
        <span style={{ fontSize: 8, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '.1em' }}>Today</span>
        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#1d4ed8' }}>1 job</span>
      </div>

      {/* Lead card */}
      <div style={{ margin: '0 10px', background: '#111827', borderRadius: 12, border: '1px solid #1f2937', overflow: 'hidden' }}>
        <div style={{ background: '#0d1526', padding: '7px 10px 6px', borderBottom: '1px solid #1a2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#064e3b', padding: '2px 7px', borderRadius: 5, border: '1px solid #065f46' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 7, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.06em' }}>New</span>
          </div>
          <span style={{ fontSize: 7.5, color: '#374151', fontWeight: 600 }}>just now</span>
        </div>
        <div style={{ padding: '8px 10px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#f9fafb', marginBottom: 1 }}>Kevin White</div>
          <div style={{ fontSize: 8.5, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Unassigned · via QR scan</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
            {[
              { label: 'Category', val: 'Roofing', color: '#6366f1' },
              { label: 'Photos',   val: '2 files', color: '#10b981' },
              { label: 'Job Date', val: 'TBD',     color: '#374151' },
              { label: 'Arrival',  val: 'TBD',     color: '#374151' },
            ].map(m => (
              <div key={m.label} style={{ background: '#0d0d1a', borderRadius: 6, padding: '4px 6px' }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: m.color }}>{m.val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #1a2535' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#6b7280' }}>$900</div>
              <div style={{ fontSize: 7.5, color: '#374151', fontWeight: 600 }}>PARTIAL</div>
            </div>
            <div style={{ width: 28, height: 28, background: '#312e81', borderRadius: 9, border: '1px solid #3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#818cf8"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2: Schedule tab — job modal
// ─────────────────────────────────────────────────────────────────────────────
function ScreenSchedule() {
  return (
    <div style={{ background: '#0d0d1a', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden' }}>

      {/* Modal header — dark navy */}
      <div style={{ background: '#1e1b4b', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
            <div style={{ fontSize: 8.5, color: '#a5b4fc', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#9ca3af"/><circle cx="8" cy="8" r="1.5" fill="#9ca3af"/><circle cx="8" cy="12" r="1.5" fill="#9ca3af"/></svg>
            </div>
            <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <div style={{ background: '#78350f', border: '1px solid #92400e', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 800, color: '#fbbf24' }}>Contacted</div>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#a5b4fc" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Apr 5 · 8:00 AM
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {[
            { label: 'James' },
            { label: '$5,385 due' },
            { label: 'AI Brief', icon: '✦' },
          ].map(b => (
            <div key={b.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700, color: '#d1d5db', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 9 }}>{b.icon}</span>{b.label}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => (
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 1 ? '#fff' : '#6b7280', borderBottom: i === 1 ? '2px solid #6366f1' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Schedule body */}
      <div style={{ padding: '10px 14px', background: '#f8fafc' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 26, height: 26, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#7c3aed"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.06em' }}>Schedule</div>
              </div>
            </div>
            <div style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 7, padding: '3px 8px', fontSize: 7.5, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#475569" strokeWidth="1.5"/><path d="M5 1v3M11 1v3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Calendar
            </div>
          </div>

          {[
            { label: 'Assigned To', val: 'James', sub: null },
            { label: 'Date', val: 'Apr 5, 2026', sub: null },
            { label: 'Time', val: '8:00 AM', sub: null },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{f.label}</div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{f.val}</div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1, background: '#0f172a', borderRadius: 10, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#818cf8"/></svg>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Save Schedule</span>
            </div>
            <div style={{ width: 34, height: 34, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13 3L6 10M13 3H9M13 3V7" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 3H3v10h10v-3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3: Quote tab — line items + total
// ─────────────────────────────────────────────────────────────────────────────
function ScreenQuote() {
  const items = [
    { name: '6" Seamless Gutter', qty: 1, unit: '$1,920', total: '$1,920' },
    { name: '3x4 Downspout',      qty: 3, unit: '$185',   total: '$555'   },
    { name: 'Gutter Guards',      qty: 1, unit: '$1,360', total: '$1,360' },
    { name: 'Removal & Disposal', qty: 1, unit: '$350',   total: '$350'   },
    { name: 'Labor',              qty: 1, unit: '$1,200', total: '$1,200' },
  ];

  return (
    <div style={{ background: '#0d0d1a', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden' }}>

      {/* Same modal header */}
      <div style={{ background: '#1e1b4b', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
            <div style={{ fontSize: 8.5, color: '#a5b4fc', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#9ca3af"/><circle cx="8" cy="8" r="1.5" fill="#9ca3af"/><circle cx="8" cy="12" r="1.5" fill="#9ca3af"/></svg>
            </div>
            <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.08)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <div style={{ background: '#78350f', border: '1px solid #92400e', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 800, color: '#fbbf24' }}>Contacted</div>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#a5b4fc" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Apr 5 · 8:00 AM
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {[{ label: 'James'}, { label: '$5,385 due'}, { label: 'AI Brief', icon: '✦' }].map(b => (
            <div key={b.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700, color: '#d1d5db', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 9 }}>{b.icon}</span>{b.label}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => (
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 2 ? '#fff' : '#6b7280', borderBottom: i === 2 ? '2px solid #6366f1' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Quote line items */}
      <div style={{ background: '#f8fafc', padding: '10px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => (
            <div key={item.name} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '8px 10px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Amount</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>{item.total}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Unit · Qty</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#475569' }}>{item.unit} · {item.qty}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total bar */}
        <div style={{ background: '#0f172a', borderRadius: 12, padding: '10px 14px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 7.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>Quote Total</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>$5,385.00</div>
          </div>
          <div style={{ background: '#1d4ed8', borderRadius: 9, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M13 3L6 10M13 3H9M13 3V7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Email Quote</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cycling phone wrapper
// ─────────────────────────────────────────────────────────────────────────────
const SLIDES = [
  { label: 'Dashboard', caption: 'Every lead lands instantly',    component: <ScreenDashboard /> },
  { label: 'Schedule',  caption: 'Assign crew & confirm arrival', component: <ScreenSchedule /> },
  { label: 'Quote',     caption: 'Build & email the quote',       component: <ScreenQuote />    },
];

export function CyclingPhoneMockup({ visible = true, hideIndicators = false }: { visible?: boolean; hideIndicators?: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setTimeout(cycle, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, activeIdx]);

  function cycle() {
    setFading(true);
    timerRef.current = setTimeout(() => {
      setActiveIdx(i => (i + 1) % SLIDES.length);
      setFading(false);
    }, 300);
  }

  function goTo(i: number) {
    if (i === activeIdx) return;
    setFading(true);
    setTimeout(() => { setActiveIdx(i); setFading(false); }, 300);
  }

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Phone */}
      <div style={{ position: 'relative', width: 240, filter: 'drop-shadow(0 32px 56px rgba(0,0,0,0.55))' }}>

        {/* Shell */}
        <div style={{ position: 'relative', background: '#0a0a0f', borderRadius: 40, border: '5px solid #1e1e2e', boxShadow: '0 0 0 1px #2a2a3e', overflow: 'hidden', aspectRatio: '9/19.5' }}>

          {/* Notch */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 22, background: '#0a0a0f', borderRadius: '0 0 14px 14px', zIndex: 20 }} />

          {/* Screen content */}
          <div
  style={{
    position: 'absolute', inset: 0,
    opacity: fading ? 0 : 1,
    transition: 'opacity 0.3s ease',
    overflow: 'hidden',
    paddingTop: 22,
    willChange: 'opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'translateZ(0)',
  }}
>
            {SLIDES[activeIdx].component}
          </div>

          {/* Home bar */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 64, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, zIndex: 20 }} />
        </div>

        {/* Side buttons */}
        <div style={{ position: 'absolute', left: -4, top: 76,  width: 3, height: 26, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -4, top: 112, width: 3, height: 42, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -4, top: 162, width: 3, height: 42, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: -4, top: 100, width: 3, height: 56, background: '#374151', borderRadius: '0 2px 2px 0' }} />
      </div>

{/* Dot + label indicators */}
      {!hideIndicators && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ width: i === activeIdx ? 22 : 6, height: 6, borderRadius: 3, background: i === activeIdx ? '#4ade80' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: i === activeIdx ? '#4ade80' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Caption */}
      {!hideIndicators && (
        <p style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#64748b', opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          {SLIDES[activeIdx].caption}
        </p>
      )}
    </div>
  );
}