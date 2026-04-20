'use client';

import { useState, useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1: Dashboard — stats + lead card
// ─────────────────────────────────────────────────────────────────────────────
function ScreenDashboard({ phase }: { phase: number }) {
  // phase 0 = existing card visible, phase 1 = Kevin White slides in on top, phase 2 = settled
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
          {/* Notification badge — pops when new card arrives */}
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 10, height: 10, borderRadius: '50%',
            background: '#ef4444', border: '1.5px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 6, fontWeight: 900, color: '#fff',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0)',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            1
          </div>
        </div>
      </div>

      {/* Stats — compact 4-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 5, padding: '8px 10px 6px' }}>
        {[
          { label: 'Leads',   value: phase >= 1 ? '169' : '168', accent: '#3b82f6' },
          { label: 'Active',  value: '63',    accent: '#3b82f6' },
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
          { label: 'Today',   color: '#475569', bg: '#fff',    border: '#e2e8f0' },
          { label: 'Unpaid',  color: '#475569', bg: '#fff',    border: '#e2e8f0' },
          { label: 'New (23)',color: '#475569', bg: '#fff',    border: '#e2e8f0' },
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
        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8' }}>{phase >= 1 ? '2 jobs' : '1 job'}</span>
      </div>

      {/* === CARDS CONTAINER === */}
      <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>

        {/* NEW: Kevin White card — slides in from top */}
        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? 'translateY(0)' : 'translateY(-30px)',
          maxHeight: phase >= 1 ? 200 : 0,
          overflow: 'hidden',
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, overflow: 'hidden',
            border: phase >= 2 ? '2px solid #0f172a' : '2px solid #3b82f6',
            boxShadow: phase < 2 ? '0 0 0 3px rgba(59,130,246,0.15), 0 8px 24px rgba(59,130,246,0.12)' : 'none',
            transition: 'border-color 0.5s ease, box-shadow 0.5s ease',
          }}>
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
                  { label: 'Revenue',  val: '$0',  color: '#0f172a' },
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
        </div>

        {/* EXISTING: Sarah Johnson card — always visible, pushed down when Kevin arrives */}
        <div style={{
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
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
                  { label: 'Revenue',  val: '$4,800', color: '#0f172a' },
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2: Schedule tab — with animated "send confirmation" flow
// ─────────────────────────────────────────────────────────────────────────────
function ScreenSchedule({ phase }: { phase: number }) {
  // phase 0 = form visible, phase 1 = button pressing, phase 2 = confirmation sent overlay
  return (
    <div style={{ background: '#0d0d1a', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden', position: 'relative' }}>

      {/* Modal header — dark navy */}
      <div style={{ background: '#1e3a5f', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
            <div style={{ fontSize: 8.5, color: '#93c5fd', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
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
          <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#93c5fd" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Mar 19 · 2:15 PM
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {[
            { label: 'Joe' },
            { label: '$900.00 paid' },
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
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 1 ? '#fff' : '#6b7280', borderBottom: i === 1 ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* Schedule body */}
      <div style={{ padding: '10px 14px', background: '#f8fafc' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 26, height: 26, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#2563eb"/></svg>
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
            { label: 'Assigned To', val: 'James' },
            { label: 'Date', val: 'Apr 5, 2026' },
            { label: 'Time', val: '8:00 AM' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{f.label}</div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{f.val}</div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <div style={{
              flex: 1, borderRadius: 10, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: phase >= 1 ? '#059669' : '#0f172a',
              transform: phase === 1 ? 'scale(0.96)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {phase >= 2 ? (
                <>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Saved!</span>
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#60a5fa"/></svg>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Save Schedule</span>
                </>
              )}
            </div>
            <div style={{ width: 34, height: 34, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13 3L6 10M13 3H9M13 3V7" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 3H3v10h10v-3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation email sent overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, #059669, #059669 70%, transparent)',
        padding: '50px 20px 24px',
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(100%)',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        {/* Animated envelope icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: phase >= 2 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-20deg)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="5" width="20" height="14" rx="3" stroke="#fff" strokeWidth="1.5"/>
            <path d="M2 7l10 6 10-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Confirmation Sent!
        </div>
        <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.4 }}>
          Kevin White will receive a branded<br/>
          email confirming Apr 5 at 8:00 AM
        </div>
        {/* Mini email preview */}
        <div style={{
          background: '#fff', borderRadius: 10, padding: '8px 10px', width: '100%', maxWidth: 180,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" stroke="#2563eb" strokeWidth="2"/><path d="M2 7l10 6 10-6" stroke="#2563eb" strokeWidth="2"/></svg>
            </div>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#0f172a' }}>Ridge Line Roofing</div>
          </div>
          <div style={{ fontSize: 7, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>Your appointment is confirmed</div>
          <div style={{ fontSize: 6.5, color: '#94a3b8', lineHeight: 1.3 }}>Hi Kevin, your gutter install is scheduled for Apr 5 at 8:00 AM. James will be...</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3: Quote tab — with animated "email quote" flow
// ─────────────────────────────────────────────────────────────────────────────
function ScreenQuote({ phase }: { phase: number }) {
  const items = [
    { name: '6" Seamless Gutter', qty: 1, unit: '$1,920', total: '$1,920' },
    { name: '3x4 Downspout',      qty: 3, unit: '$185',   total: '$555'   },
    { name: 'Gutter Guards',      qty: 1, unit: '$1,360', total: '$1,360' },
    { name: 'Removal & Disposal', qty: 1, unit: '$350',   total: '$350'   },
    { name: 'Labor',              qty: 1, unit: '$1,200', total: '$1,200' },
  ];

  return (
    <div style={{ background: '#0d0d1a', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden', position: 'relative' }}>

      {/* Same modal header */}
      <div style={{ background: '#1e3a5f', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
            <div style={{ fontSize: 8.5, color: '#93c5fd', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
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
          <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#93c5fd" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
            <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: i === 2 ? '#fff' : '#6b7280', borderBottom: i === 2 ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>{t}</div>
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

        {/* Total bar with animated button */}
        <div style={{ background: '#0f172a', borderRadius: 12, padding: '10px 14px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 7.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 2 }}>Quote Total</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>$5,385.00</div>
          </div>
          <div style={{
            borderRadius: 9, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 5,
            background: phase >= 1 ? '#059669' : '#1d4ed8',
            transform: phase === 1 ? 'scale(0.94)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {phase >= 2 ? (
              <>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Sent!</span>
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M13 3L6 10M13 3H9M13 3V7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Email Quote</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quote sent overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, #1d4ed8, #1d4ed8 70%, transparent)',
        padding: '50px 20px 24px',
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(100%)',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: phase >= 2 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-20deg)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Quote Emailed!
        </div>
        <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.4 }}>
          Kevin can accept or decline<br/>
          directly from his inbox
        </div>
        {/* Mini quote email preview */}
        <div style={{
          background: '#fff', borderRadius: 10, padding: '8px 10px', width: '100%', maxWidth: 180,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#2563eb" strokeWidth="2"/><path d="M7 9h10M7 13h6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#0f172a' }}>Quote #147</div>
            <div style={{ marginLeft: 'auto', fontSize: 7, fontWeight: 800, color: '#0f172a' }}>$5,385</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ flex: 1, background: '#059669', borderRadius: 5, padding: '3px', textAlign: 'center', fontSize: 6.5, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>Accept</div>
            <div style={{ flex: 1, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 5, padding: '3px', textAlign: 'center', fontSize: 6.5, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Decline</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 4: Payment Hub — matches real app UI with form fields + animation
// ─────────────────────────────────────────────────────────────────────────────
function ScreenPayment({ phase }: { phase: number }) {
  // phase 0: initial "Awaiting Payment" state with empty form
  // phase 1: form fills in (amount populates, date appears, checkbox checks)
  // phase 2: "Save Payment" button presses → "Paid in Full" state + overlay

  const inputStyle = {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '5px 8px',
    fontSize: 10,
    fontWeight: 600 as const,
    color: '#1e293b',
    width: '100%',
  };

  const labelStyle = {
    fontSize: 7,
    fontWeight: 700 as const,
    color: '#f59e0b',
    textTransform: 'uppercase' as const,
    letterSpacing: '.06em',
    marginBottom: 3,
  };

  return (
    <div style={{ background: '#0d0d1a', height: '100%', fontFamily: 'Inter, system-ui, sans-serif', overflowY: 'hidden', position: 'relative' }}>

      {/* Modal header */}
      <div style={{ background: '#1e3a5f', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>#147</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 2 }}>Kevin White</div>
            <div style={{ fontSize: 8.5, color: '#93c5fd', fontWeight: 500 }}>Submitted Mar 31, 2026</div>
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

        {/* Status chips — matches real app header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {/* "New" dropdown chip — green like the real app */}
          <div style={{
            borderRadius: 7, padding: '3px 10px', fontSize: 8.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4,
            background: '#14532d',
            border: '1px solid #166534',
            color: '#4ade80',
          }}>
            New
            <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M3 5l3 3 3-3" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          {/* Not scheduled chip */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '3px 8px', fontSize: 8.5, fontWeight: 700, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#9ca3af" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Not scheduled
          </div>
        </div>

        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {/* Payment status chip — animates from "$5,385.00 due" → "Paid in Full" */}
          <div style={{
            background: phase >= 2 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${phase >= 2 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700,
            color: phase >= 2 ? '#34d399' : '#d1d5db',
            display: 'flex', alignItems: 'center', gap: 3,
            transition: 'all 0.5s ease',
          }}>
            <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7h12" stroke="currentColor" strokeWidth="1.3"/></svg>
            {phase >= 2 ? 'Paid in Full' : '$5,385.00 due'}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '3px 7px', fontSize: 8, fontWeight: 700, color: '#d1d5db', display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 9 }}>✦</span>AI Brief
          </div>
        </div>

        {/* Tabs — Pay active, with icons on all tabs matching real app */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {['Overview', 'Schedule', 'Quote', 'Pay'].map((t, i) => {
            const isActive = i === 3;
            const color = isActive ? '#fff' : '#6b7280';
            return (
              <div key={t} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, color, borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent', marginBottom: -1 }}>
                {i === 0 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.3"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>}
                {i === 1 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke={color} strokeWidth="1.3"/><path d="M5 1v3M11 1v3M2 7h12" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>}
                {i === 2 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke={color} strokeWidth="1.3"/><path d="M6 5h4M6 8h4M6 11h2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>}
                {i === 3 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="2" stroke={color} strokeWidth="1.3"/><path d="M2 7h12" stroke={color} strokeWidth="1.3"/></svg>}
                {t}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Hub body */}
      <div style={{ padding: '10px 14px', background: '#f8fafc' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '10px 12px', marginBottom: 8 }}>

          {/* Payment Hub header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 24, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="4" width="12" height="9" rx="2" stroke="#fff" strokeWidth="1.3"/>
                  <path d="M5 7.5h6" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '.06em' }}>Payment Hub</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 6.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' }}>Total Quote</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>$5,385.00</div>
            </div>
          </div>

          {/* Awaiting Payment / Paid status bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, padding: '4px 8px',
            background: phase >= 2 ? '#f0fdf4' : '#f8fafc',
            borderRadius: 6,
            border: phase >= 2 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
            transition: 'all 0.5s ease',
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: phase >= 2 ? '#dcfce7' : '#fef3c7',
              transition: 'all 0.5s ease',
            }}>
              {phase >= 2 ? (
                <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <svg width="7" height="7" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#d97706" strokeWidth="1.5"/><path d="M8 5v3.5l2 1.5" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round"/></svg>
              )}
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: phase >= 2 ? '#059669' : '#92400e', transition: 'color 0.5s' }}>
              {phase >= 2 ? 'Paid in Full' : 'Awaiting Payment'}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: phase >= 2 ? '#059669' : '#f59e0b',
              width: phase >= 2 ? '100%' : '0%',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>

          {/* AMOUNT field */}
          <div style={{ marginBottom: 7 }}>
            <div style={labelStyle}>Amount</div>
            <div style={{
              ...inputStyle,
              color: phase >= 1 ? '#0f172a' : '#94a3b8',
              transition: 'color 0.4s ease',
            }}>
              {phase >= 1 ? '$5,385.00' : '0.00'}
            </div>
          </div>

          {/* METHOD field */}
          <div style={{ marginBottom: 7 }}>
            <div style={labelStyle}>Method</div>
            <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: phase >= 1 ? '#0f172a' : '#94a3b8', transition: 'color 0.4s ease' }}>
                {phase >= 1 ? 'Check' : 'Select...'}
              </span>
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* PAID DATE field */}
          <div style={{ marginBottom: 7 }}>
            <div style={labelStyle}>Paid Date</div>
            <div style={{
              ...inputStyle,
              color: phase >= 1 ? '#0f172a' : '#94a3b8',
              transition: 'color 0.4s ease',
            }}>
              {phase >= 1 ? 'Apr 10, 2026' : ''}
              {phase < 1 && <span>&nbsp;</span>}
            </div>
          </div>

          {/* DUE DATE field */}
          <div style={{ marginBottom: 8 }}>
            <div style={labelStyle}>Due Date</div>
            <div style={{ ...inputStyle, color: '#94a3b8' }}>
              {phase >= 1 ? 'Apr 15, 2026' : ''}
              {phase < 1 && <span>&nbsp;</span>}
            </div>
          </div>

          {/* Mark as Paid in Full checkbox row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 8px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
            marginBottom: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 14, height: 14, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: phase >= 1 ? '#2563eb' : '#fff',
                border: phase >= 1 ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                transition: 'all 0.3s ease',
              }}>
                {phase >= 1 && (
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: '#1e293b' }}>Mark as Paid in Full</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#0f172a' }}>$5,385.00</span>
          </div>

          {/* Action buttons — SEND + SAVE PAYMENT */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              flex: 0, borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: '#fff', border: '1px solid #e2e8f0',
            }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M14 2L7 9M14 2l-5 12-2-5-5-2z" stroke="#475569" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 8, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em' }}>Send</span>
            </div>
            <div style={{
              flex: 1, borderRadius: 10, padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: phase >= 2 ? '#059669' : '#0f172a',
              transform: phase === 1 ? 'scale(0.96)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {phase >= 2 ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Saved!</span>
                </>
              ) : (
                <span style={{ fontSize: 8, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '.06em' }}>Save Payment</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paid in full celebration overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(to top, #059669, #059669 75%, transparent)',
        padding: '50px 20px 24px',
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(100%)',
        opacity: phase >= 2 ? 1 : 0,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: phase >= 2 ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(-20deg)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="4" fill="rgba(255,255,255,0.3)" stroke="#fff" strokeWidth="1.5"/>
            <path d="M10 12l1.5 1.5L14 10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', textAlign: 'center', letterSpacing: '-0.3px' }}>
          Paid in Full!
        </div>
        <div style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.4 }}>
          $5,385.00 collected. Job complete.<br/>
          Receipt sent automatically.
        </div>
        {/* Mini receipt */}
        <div style={{
          background: '#fff', borderRadius: 10, padding: '8px 10px', width: '100%', maxWidth: 180,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <div style={{ fontSize: 7, fontWeight: 800, color: '#0f172a' }}>Receipt #147</div>
            <div style={{ fontSize: 6, fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '1px 5px', borderRadius: 4 }}>PAID</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: '#64748b', marginBottom: 3 }}>
            <span>Gutter Installation</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>$5,385.00</span>
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
// Cycling phone wrapper — now with phase animations per screen
// ─────────────────────────────────────────────────────────────────────────────
const SLIDES = [
  { label: 'Dashboard', caption: 'Every lead lands instantly' },
  { label: 'Schedule',  caption: 'Assign crew & confirm arrival' },
  { label: 'Quote',     caption: 'Build & email the quote' },
  { label: 'Payment',   caption: 'Collect payment & close out' },
];

interface MockupProps {
  visible?: boolean;
  hideIndicators?: boolean;
  activeTab?: number | null;
  phase?: number; // <--- ADD THIS LINE
}

export function CyclingPhoneMockup({ 
  visible = true, 
  hideIndicators = false,
  activeTab = null
}: MockupProps) {
  const [internalIdx, setInternalIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [phase, setPhase] = useState(0); // 0=initial, 1=button press, 2=confirmation
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentIdx = activeTab !== null ? activeTab % SLIDES.length : internalIdx;

  // Clear phase timers helper
  const clearPhaseTimers = () => {
    phaseTimerRef.current.forEach(t => clearTimeout(t));
    phaseTimerRef.current = [];
  };

  // When the active screen changes, reset phase and start the animation sequence
  useEffect(() => {
    setPhase(0);
    clearPhaseTimers();

    if (activeTab !== null) {
      setFading(true);
      const fadeTimeout = setTimeout(() => setFading(false), 250);
      phaseTimerRef.current.push(fadeTimeout);
    }

    // Animate phases for all screens
    // Phase 1: action animation after 1.2s
    const t1 = setTimeout(() => setPhase(1), 1200);
    // Phase 2: confirmation/settled state after 2s  
    const t2 = setTimeout(() => setPhase(2), 2000);
    phaseTimerRef.current.push(t1, t2);

    return () => clearPhaseTimers();
  }, [activeTab, currentIdx]);

  // Auto-cycle logic (only runs if no activeTab is provided)
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
      }, 300);
    };

    timerRef.current = setTimeout(cycle, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible, internalIdx, activeTab]);

  function goTo(i: number) {
    setFading(true);
    setTimeout(() => {
      setInternalIdx(i);
      setFading(false);
    }, 300);
  }

  // Render the correct screen component with phase
  const renderScreen = () => {
    switch (currentIdx) {
      case 0: return <ScreenDashboard phase={phase} />;
      case 1: return <ScreenSchedule phase={phase} />;
      case 2: return <ScreenQuote phase={phase} />;
      case 3: return <ScreenPayment phase={phase} />;
      // Fix: Added phase={phase} here to satisfy TypeScript
      default: return <ScreenDashboard phase={phase} />;
    }
  };

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
              transition: 'opacity 0.25s ease',
              overflow: 'hidden',
              paddingTop: 22,
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
          >
            {renderScreen()}
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

      {/* Indicators */}
      {!hideIndicators && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
          {SLIDES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => goTo(i)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ width: i === currentIdx ? 22 : 6, height: 6, borderRadius: 3, background: i === currentIdx ? '#4ade80' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s ease' }} />
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: i === currentIdx ? '#4ade80' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Caption */}
      {!hideIndicators && (
        <p style={{ marginTop: 8, fontSize: 11, fontWeight: 600, color: '#64748b', opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          {SLIDES[currentIdx].caption}
        </p>
      )}
    </div>
  );
}