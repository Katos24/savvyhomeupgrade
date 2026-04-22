'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1: Dashboard — stats + lead cards (static final state)
// ─────────────────────────────────────────────────────────────────────────────
function ScreenDashboard() {
  return (
    <div style={{ background: '#f1f5f9', height: '100%', overflowY: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/images/ridgelinelogo.webp" alt="logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.15 }}>Ridge Line Roofing</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: '#3b82f6', letterSpacing: '.1em', textTransform: 'uppercase' }}>Dashboard</div>
          </div>
        </div>
        <div style={{ position: 'relative', width: 26, height: 26, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <div style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 900, color: '#fff' }}>1</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 5, padding: '8px 10px 6px' }}>
        {[
          { label: 'Leads', value: '169', accent: '#3b82f6' },
          { label: 'Active', value: '63', accent: '#3b82f6' },
          { label: 'Revenue', value: '$102k', accent: '#10b981' },
          { label: 'Pending', value: '$122k', accent: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '6px 8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, flexShrink: 0 }} />
              <div style={{ fontSize: 6, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search + view switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px 6px' }}>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#94a3b8" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span style={{ fontSize: 8, color: '#94a3b8' }}>Search name, email...</span>
        </div>
        <div style={{ display: 'flex', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
          {[true, false, false].map((active, i) => (
            <div key={i} style={{ width: 22, height: 26, background: active ? '#4f46e5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 0 && <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill={active ? '#fff' : '#94a3b8'}/><rect x="9" y="2" width="5" height="5" rx="1" fill={active ? '#fff' : '#94a3b8'}/><rect x="2" y="9" width="5" height="5" rx="1" fill={active ? '#fff' : '#94a3b8'}/><rect x="9" y="9" width="5" height="5" rx="1" fill={active ? '#fff' : '#94a3b8'}/></svg>}
              {i === 1 && <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              {i === 2 && <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#94a3b8" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            </div>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 5, padding: '0 10px 6px', overflow: 'hidden' }}>
        {[
          { label: 'Filters', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { label: 'Today', color: '#475569', bg: '#fff', border: '#e2e8f0' },
          { label: 'Unpaid', color: '#475569', bg: '#fff', border: '#e2e8f0' },
          { label: 'New (23)', color: '#475569', bg: '#fff', border: '#e2e8f0' },
        ].map(c => (
          <div key={c.label} style={{ padding: '3px 7px', borderRadius: 20, fontSize: 7.5, fontWeight: 700, whiteSpace: 'nowrap', background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>{c.label}</div>
        ))}
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 10px 5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ fontSize: 8, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.1em' }}>Today</span>
        </div>
        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8' }}>2 jobs</span>
      </div>

      {/* Cards */}
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* New lead card */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '2px solid #0f172a' }}>
          <div style={{ padding: '7px 10px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#dcfce7', padding: '2px 7px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.06em' }}>New</span>
            </div>
            <span style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 600 }}>just now</span>
          </div>
          <div style={{ padding: '4px 10px 10px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 1 }}>Kevin White</div>
            <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>Unassigned · via QR scan</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8, background: '#f8fafc', borderRadius: 10, padding: '7px 8px', border: '1px solid #e2e8f0' }}>
              {[
                { label: 'Job Date', val: 'TBD', color: '#94a3b8' },
                { label: 'Revenue', val: '$0', color: '#0f172a' },
              ].map((m, i) => (
                <div key={m.label} style={{ borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none', paddingLeft: i > 0 ? 8 : 0 }}>
                  <div style={{ fontSize: 6.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 7, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff' }}>?</div>
                <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 600 }}>Unassigned</span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Open</span>
                <svg width="7" height="7" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Existing lead card */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '7px 10px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef3c7', padding: '2px 7px', borderRadius: 20, border: '1px solid #fde68a' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ fontSize: 7, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '.06em' }}>Contacted</span>
            </div>
            <span style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 600 }}>2h ago</span>
          </div>
          <div style={{ padding: '4px 10px 10px' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 1 }}>Sarah Johnson</div>
            <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>James · via referral</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8, background: '#f8fafc', borderRadius: 10, padding: '7px 8px', border: '1px solid #e2e8f0' }}>
              {[
                { label: 'Job Date', val: 'Apr 12', color: '#0f172a' },
                { label: 'Revenue', val: '$4,800', color: '#0f172a' },
              ].map((m, i) => (
                <div key={m.label} style={{ borderLeft: i > 0 ? '1px solid #e2e8f0' : 'none', paddingLeft: i > 0 ? 8 : 0 }}>
                  <div style={{ fontSize: 6.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: m.color }}>{m.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 7, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 800, color: '#fff' }}>J</div>
                <span style={{ fontSize: 8, color: '#64748b', fontWeight: 600 }}>James</span>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Open</span>
                <svg width="7" height="7" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2: Schedule — final "Saved" state with confirmation
// ─────────────────────────────────────────────────────────────────────────────
function ScreenSchedule() {
  return (
    <div style={{ background: '#f8fafc', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden', position: 'relative' }}>

      {/* Modal header */}
      <div style={{ background: '#1e3a5f', padding: '10px 14px 0' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
          <div style={{ fontSize: 8.5, color: '#93c5fd', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#93c5fd" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Apr 5 · 8:00 AM
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700, color: '#d1d5db' }}>James</div>
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => (
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 1 ? '#fff' : '#6b7280', borderBottom: i === 1 ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Schedule body */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#2563eb" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.06em' }}>Schedule</div>
          </div>

          {[
            { label: 'Assigned To', val: 'James' },
            { label: 'Date', val: 'Apr 5, 2026' },
            { label: 'Time', val: '8:00 AM' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{f.label}</div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{f.val}</div>
            </div>
          ))}

          <div style={{ borderRadius: 10, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#059669', marginTop: 10 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Saved & Confirmed</span>
          </div>
        </div>

        {/* Email confirmation preview */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#2563eb" strokeWidth="2"/><path d="M2 7l10 6 10-6" stroke="#2563eb" strokeWidth="2"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 8, fontWeight: 800, color: '#0f172a' }}>Confirmation Sent</div>
              <div style={{ fontSize: 7, color: '#94a3b8' }}>to kevin.white@email.com</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 6, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: 4 }}>DELIVERED</div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>Your appointment is confirmed</div>
            <div style={{ fontSize: 7, color: '#94a3b8', lineHeight: 1.4 }}>Hi Kevin, your gutter install is scheduled for Apr 5 at 8:00 AM. James will be on site.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3: Quote — final "Sent" state with email preview
// ─────────────────────────────────────────────────────────────────────────────
function ScreenQuote() {
  return (
    <div style={{ background: '#f8fafc', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden' }}>

      {/* Modal header */}
      <div style={{ background: '#1e3a5f', padding: '8px 12px 0' }}>
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 7, color: '#6b7280', fontWeight: 600 }}>#147</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>Kevin White</div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, padding: '2px 6px', fontSize: 7.5, fontWeight: 800, color: '#c4b5fd' }}>Quote Sent</div>
<div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2px 6px', fontSize: 7, fontWeight: 700, color: '#d1d5db' }}>$9,150 due</div>        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => (
            <div key={t} style={{ padding: '5px 8px', fontSize: 8, fontWeight: 700, color: i === 2 ? '#fff' : '#6b7280', borderBottom: i === 2 ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Quote body */}
      <div style={{ padding: '8px 10px' }}>

        {/* Compact line items + total */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 6 }}>
          {[
           { name: 'Tear-off shingles', total: '$2,400' },
            { name: 'Architectural (30sq)', total: '$3,600' },
            { name: 'Flashing & underlay', total: '$1,200' },
            { name: 'Cleanup & haul', total: '$750' },
            { name: 'Labor', total: '$1,200' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #f1f5f9', fontSize: 8, color: '#475569' }}>
              <span>{item.name}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.total}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#0f172a' }}>
            <span style={{ fontSize: 7, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#fff' }}>$9,150.00</span>
          </div>
        </div>

        {/* Email sent badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, padding: '4px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
          <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 7, fontWeight: 700, color: '#059669' }}>Emailed to kevin.white@email.com</span>
        </div>

        {/* Customer email preview */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '5px 8px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/images/ridgelinelogo.webp" alt="" style={{ width: 10, height: 10, objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 6.5, fontWeight: 800, color: '#0f172a' }}>Ridge Line Roofing</div>
              <div style={{ fontSize: 5.5, color: '#94a3b8' }}>Your quote is ready to review</div>
            </div>
            <div style={{ fontSize: 5, fontWeight: 700, color: '#6b7280', background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>INBOX</div>
          </div>

          <div style={{ padding: '6px 8px' }}>
            <div style={{ fontSize: 6.5, color: '#475569', lineHeight: 1.4, marginBottom: 5 }}>
              Hi Kevin, here's your quote for the gutter install. Review the details and tap below to accept.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0', marginBottom: 5 }}>
              <span style={{ fontSize: 7, fontWeight: 800, color: '#0f172a' }}>Total Due</span>
              <span style={{ fontSize: 7, fontWeight: 900, color: '#0f172a' }}>$9,150.00</span>
            </div>

            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ flex: 1, background: '#059669', borderRadius: 4, padding: '4px', textAlign: 'center', fontSize: 6.5, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Accept Quote</div>
              <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '4px', textAlign: 'center', fontSize: 6.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Decline</div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 5, color: '#b0b8c4', marginTop: 3, fontStyle: 'italic' }}>What your customer sees in their inbox</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// Screen 4: Payment — final "Paid" state
// ─────────────────────────────────────────────────────────────────────────────
function ScreenPayment() {
  return (
    <div style={{ background: '#f8fafc', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden' }}>

      {/* Modal header */}
      <div style={{ background: '#1e3a5f', padding: '10px 14px 0' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
          <div style={{ fontSize: 8.5, color: '#93c5fd', fontWeight: 500 }}>Gutter Installation</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          <div style={{ background: '#14532d', border: '1px solid #166534', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 800, color: '#4ade80' }}>Completed</div>
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700, color: '#34d399' }}>Paid in Full</div>
        </div>
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => (
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 3 ? '#fff' : '#6b7280', borderBottom: i === 3 ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Payment body */}
      <div style={{ padding: '10px 14px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px' }}>

          {/* Payment Hub header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, background: '#059669', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '.06em' }}>Paid in Full</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 6.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>$9,150.00</div>
            </div>
          </div>

          {/* Progress bar - full */}
          <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: '#059669', width: '100%' }} />
          </div>

          {/* Payment details */}
          {[
            { label: 'Amount', val: '$9,150.00' },
            { label: 'Method', val: 'Check' },
            { label: 'Paid Date', val: 'Apr 10, 2026' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 7, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{f.label}</div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 10px', fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{f.val}</div>
            </div>
          ))}

          {/* Paid checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: '#059669', border: '1.5px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: '#1e293b' }}>Paid in Full</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#059669' }}>$9,150.00</span>
          </div>
        </div>

        {/* Receipt preview */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '8px 10px', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#0f172a' }}>Receipt #147</div>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>PAID</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#64748b', marginBottom: 3 }}>
            <span>Gutter Installation</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>$9,150.00</span>
          </div>
          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 7 }}>
            <span style={{ color: '#94a3b8' }}>Kevin White</span>
            <span style={{ color: '#94a3b8' }}>Apr 10, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone wrapper — simple tab switching with fade, no animation timers
// ─────────────────────────────────────────────────────────────────────────────
const SLIDES = [
  { label: 'Dashboard', caption: 'Every lead lands instantly' },
  { label: 'Schedule', caption: 'Assign crew & confirm arrival' },
  { label: 'Quote', caption: 'Build & email the quote' },
  { label: 'Payment', caption: 'Collect payment & close out' },
];

interface MockupProps {
  visible?: boolean;
  hideIndicators?: boolean;
  activeTab?: number | null;
  phase?: number;
}

export function CyclingPhoneMockup({
  visible = true,
  hideIndicators = false,
  activeTab = null,
}: MockupProps) {
  const [internalIdx, setInternalIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIdx = activeTab !== null ? activeTab % SLIDES.length : internalIdx;

  // Fade on tab change
  useEffect(() => {
    if (activeTab !== null) {
      setFading(true);
      const t = setTimeout(() => setFading(false), 200);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

  // Auto-cycle only when no activeTab
  useEffect(() => {
    if (!visible || activeTab !== null) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const cycle = () => {
      setFading(true);
      timerRef.current = setTimeout(() => {
        setInternalIdx(i => (i + 1) % SLIDES.length);
        setFading(false);
      }, 200);
    };
    timerRef.current = setTimeout(cycle, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, internalIdx, activeTab]);

  function goTo(i: number) {
    setFading(true);
    setTimeout(() => {
      setInternalIdx(i);
      setFading(false);
    }, 200);
  }

  const renderScreen = () => {
    switch (currentIdx) {
      case 0: return <ScreenDashboard />;
      case 1: return <ScreenSchedule />;
      case 2: return <ScreenQuote />;
      case 3: return <ScreenPayment />;
      default: return <ScreenDashboard />;
    }
  };

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 240, filter: 'drop-shadow(0 32px 56px rgba(0,0,0,0.55))' }}>
        <div style={{ position: 'relative', background: '#0a0a0f', borderRadius: 40, border: '5px solid #1e1e2e', boxShadow: '0 0 0 1px #2a2a3e', overflow: 'hidden', aspectRatio: '9/19.5' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 22, background: '#0a0a0f', borderRadius: '0 0 14px 14px', zIndex: 20 }} />
          <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.2s ease', overflow: 'hidden', paddingTop: 22 }}>
            {renderScreen()}
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 64, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, zIndex: 20 }} />
        </div>
        <div style={{ position: 'absolute', left: -4, top: 76, width: 3, height: 26, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -4, top: 112, width: 3, height: 42, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', left: -4, top: 162, width: 3, height: 42, background: '#374151', borderRadius: '2px 0 0 2px' }} />
        <div style={{ position: 'absolute', right: -4, top: 100, width: 3, height: 56, background: '#374151', borderRadius: '0 2px 2px 0' }} />
      </div>

      {!hideIndicators && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          {SLIDES.map((s, i) => (
            <button key={s.label} onClick={() => goTo(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ width: i === currentIdx ? 22 : 6, height: 6, borderRadius: 3, background: i === currentIdx ? '#4ade80' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: i === currentIdx ? '#4ade80' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease' }}>{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {!hideIndicators && (
        <p style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#64748b', opacity: fading ? 0 : 1, transition: 'opacity 0.2s ease' }}>
          {SLIDES[currentIdx].caption}
        </p>
      )}
    </div>
  );
}