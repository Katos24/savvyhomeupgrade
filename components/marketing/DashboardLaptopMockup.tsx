'use client';

import { useState, useEffect } from 'react';
import { DashboardMockupLight } from '@/components/marketing/DashboardMockupLight';

export function DashboardLaptopMockup() {
  const [cardVisible, setCardVisible] = useState(false);
  const [ping, setPing] = useState(false);

  useEffect(() => {
    // Curtis Wilson card drops in after 1s
    const t1 = setTimeout(() => setCardVisible(true), 1000);
    // Ping the stat counter after 1.4s
    const t2 = setTimeout(() => setPing(true), 1400);
    const t3 = setTimeout(() => setPing(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative flex items-end justify-center">

      {/* ── Laptop ── */}
      <div className="relative" style={{ width: 480 }}>

        {/* Screen bezel */}
        <div className="rounded-t-xl overflow-hidden border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
          style={{ background: '#0d1117' }}>

          {/* Menu bar */}
          <div className="flex items-center px-3 gap-1.5 border-b border-white/5" style={{ height: 22, background: '#090d12' }}>
            <div className="w-2 h-2 rounded-full bg-red-500/80" />
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <div className="flex-1 mx-3 h-3 rounded-sm" style={{ background: '#1e293b' }} />
          </div>

          {/* Dashboard screen */}
          <div style={{ background: '#0d1117', padding: '10px 12px 12px' }}>

            {/* Top bar */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3" style={{ background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  {[0,1,2].map(i => <div key={i} className="rounded-full" style={{ width: 10, height: 1.5, background: '#4b5563' }} />)}
                </div>
                <div className="flex items-center justify-center rounded-lg overflow-hidden" style={{ width: 22, height: 22, background: '#fff' }}>
                  <img src="/images/ridgelinelogo.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.2px' }}>Ridge Line Roofing</div>
                  <div style={{ fontSize: 6, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dashboard</div>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-lg" style={{ width: 22, height: 22, background: '#1d4ed8' }}>
                <svg width="9" height="9" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: 'Total Leads',   value: ping ? '168' : '167', color: '#f9fafb' },
                { label: 'Active Jobs',   value: '63',       color: '#3b82f6' },
                { label: 'Total Revenue', value: '$102,671.96', color: '#10b981' },
                { label: 'Total Pending', value: '$122,880', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-2.5 py-2 transition-all duration-500"
                  style={{ background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 6, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{s.label}</div>
                  <div className="transition-all duration-300" style={{ fontSize: s.value.length > 6 ? 10 : 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search + filters row */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#374151" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize: 8, color: '#374151' }}>Search by name, email or phone...</span>
              </div>
              <div className="flex gap-1">
                {[false, true, false, false].map((active, i) => (
                  <div key={i} className="flex items-center justify-center rounded-md" style={{ width: 22, height: 22, background: active ? '#4f46e5' : '#161d2f', border: `1px solid ${active ? '#4f46e5' : 'rgba(255,255,255,0.05)'}` }}>
                    {i === 0 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#4b5563"/><circle cx="8" cy="8" r="1.5" fill="#4b5563"/><circle cx="8" cy="12" r="1.5" fill="#4b5563"/></svg>}
                    {i === 1 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#fff"/></svg>}
                    {i === 2 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    {i === 3 && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="1.5" stroke="#4b5563" strokeWidth="1.5"/><path d="M2 6h12" stroke="#4b5563" strokeWidth="1.5"/></svg>}
                  </div>
                ))}
              </div>
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 mb-3">
              {[
                { label: 'Scheduled Today', color: '#6b7280', bg: 'transparent',  border: 'rgba(255,255,255,0.07)' },
                { label: '$ Unpaid',        color: '#10b981', bg: '#064e3b22',    border: '#065f4640' },
                { label: 'New (18)',         color: '#10b981', bg: '#064e3b22',    border: '#065f4640' },
                { label: 'Filters',         color: '#6b7280', bg: 'transparent',  border: 'rgba(255,255,255,0.07)' },
              ].map(c => (
                <div key={c.label} className="rounded-full px-2 py-0.5" style={{ fontSize: 7, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
                  {c.label}
                </div>
              ))}
            </div>

            {/* TODAY section */}
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 8, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Today</span>
              <span style={{ fontSize: 7, fontWeight: 700, color: '#374151' }}>2</span>
            </div>

            {/* Lead cards row */}
            <div className="grid grid-cols-2 gap-2">

              {/* Existing card — Curtis W / Contacted */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ borderLeft: '3px solid #f59e0b' }}>
                  <div className="px-1.5 py-0.5 rounded" style={{ background: '#78350f33', border: '1px solid #92400e66', fontSize: 6, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase' }}>Contacted</div>
                </div>
                <div className="px-2.5 pb-2.5">
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f9fafb', marginBottom: 1 }}>Curtis Wilson</div>
                  <div style={{ fontSize: 7, color: '#4b5563', marginBottom: 8 }}>ASSIGNED: JAMES</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[{ l: 'Job Date', v: 'Apr 11', c: '#60a5fa' }, { l: 'Arrival', v: '9:00 AM', c: '#f9fafb' }].map(m => (
                      <div key={m.l} className="rounded-md px-1.5 py-1" style={{ background: '#0d1117' }}>
                        <div style={{ fontSize: 6, color: '#374151', textTransform: 'uppercase', marginBottom: 1 }}>{m.l}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: m.c }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 7, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roofing</div>
                  <div className="flex justify-between items-center pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981' }}>$4,200</div>
                      <div style={{ fontSize: 6, color: '#374151', textTransform: 'uppercase' }}>Quote Sent</div>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

              {/* New lead dropping in */}
              <div
                className="rounded-xl overflow-hidden transition-all duration-700"
                style={{
                  background: '#161d2f',
                  border: '1px solid rgba(255,255,255,0.05)',
                  opacity: cardVisible ? 1 : 0,
                  transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
                  boxShadow: cardVisible ? '0 0 0 1px #4f46e5, 0 8px 24px rgba(79,70,229,0.25)' : 'none',
                }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ borderLeft: '3px solid #10b981' }}>
                  <div className="px-1.5 py-0.5 rounded" style={{ background: '#064e3b', border: '1px solid #065f46', fontSize: 6, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>New</div>
                </div>
                <div className="px-2.5 pb-2.5">
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#f9fafb', marginBottom: 1 }}>David Reyes</div>
                  <div style={{ fontSize: 7, color: '#4b5563', marginBottom: 8 }}>UNASSIGNED</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[{ l: 'Job Date', v: 'TBD', c: '#374151' }, { l: 'Arrival', v: 'TBD', c: '#374151' }].map(m => (
                      <div key={m.l} className="rounded-md px-1.5 py-1" style={{ background: '#0d1117' }}>
                        <div style={{ fontSize: 6, color: '#374151', textTransform: 'uppercase', marginBottom: 1 }}>{m.l}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: m.c }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 7, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gutters</div>
                  <div className="flex justify-between items-center pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#4b5563' }}>Pending Quote</div>
                      <div style={{ fontSize: 6, color: '#374151', textTransform: 'uppercase' }}>Unpaid</div>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Keyboard base */}
        <div className="rounded-b-xl border-t-0" style={{ height: 10, background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }} />
        <div className="rounded-b-lg mx-auto" style={{ width: '38%', height: 6, background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />
      </div>

      {/* ── Phone overlay — bottom-right corner ── */}
      <div
        className="absolute transition-all duration-700 delay-300"
        style={{
          bottom: 16,
          right: -20,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateY(0)' : 'translateY(16px)',
          zIndex: 10,
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