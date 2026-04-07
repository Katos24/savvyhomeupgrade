'use client';

// DashboardMockup.tsx
// Fully coded phone mockup — no screenshots needed.
// Uses the Ridge Line Roofing logo from /public/images/ridgelinelogo.png
// Drop into your HowItWorks or Hero section as the right-side visual.

export function DashboardMockup() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem 1rem' }}>

      {/* ── Phone shell ── */}
      <div
        style={{
          position: 'relative',
          width: 260,
          background: '#0a0a0f',
          borderRadius: 42,
          border: '6px solid #1e1e2e',
          boxShadow: '0 0 0 1px #2a2a3e, 0 48px 80px rgba(0,0,0,0.65)',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Side buttons */}
        <div style={{ position:'absolute', left:-3, top:80,  width:3, height:26, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', left:-3, top:116, width:3, height:44, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', left:-3, top:168, width:3, height:44, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', right:-3, top:104, width:3, height:56, background:'#1e1e2e', borderRadius:'0 2px 2px 0' }} />

        {/* Notch */}
        <div style={{ width: 88, height: 22, background: '#0a0a0f', borderRadius: '0 0 16px 16px', margin: '0 auto', position: 'relative', zIndex: 10 }} />

        {/* ── Screen ── */}
        <div style={{ background: '#0d0d1a', paddingBottom: 12 }}>

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Hamburger */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 16, height: 1.5, background: '#6b7280', borderRadius: 2 }} />
                ))}
              </div>

              {/* Logo bubble — Ridge Line logo */}
              <div style={{
                width: 30, height: 30,
                background: '#111827',
                borderRadius: 9,
                border: '1px solid #1f2937',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <img
                  src="/images/ridgelinelogo.png"
                  alt="Ridge Line Roofing"
                  style={{ width: 26, height: 26, objectFit: 'contain' }}
                />
              </div>

              {/* Brand name */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#f9fafb', letterSpacing: '-0.3px', lineHeight: 1.15 }}>
                  Ridge Line Roofing
                </div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#4b5563', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  Dashboard
                </div>
              </div>
            </div>

            {/* + button */}
            <div style={{ width: 26, height: 26, background: '#1d4ed8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 2v7M2 5.5h7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Stats grid 2×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, padding: '0 12px 8px' }}>
            {[
              { label: 'Total Leads',   value: '167',      color: '#f9fafb',  small: false },
              { label: 'Active Jobs',   value: '62',       color: '#10b981',  small: false },
              { label: 'Total Revenue', value: '$102,671', color: '#10b981',  small: true  },
              { label: 'Total Pending', value: '$122,880', color: '#f59e0b',  small: true  },
            ].map(s => (
              <div key={s.label} style={{ background: '#111827', borderRadius: 10, padding: '8px 10px', border: '1px solid #1f2937' }}>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: s.small ? 12 : 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px 6px' }}>
            <div style={{ flex: 1, background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="#374151" strokeWidth="1.5"/>
                <path d="M11 11l2.5 2.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 9, color: '#374151' }}>Search by name...</span>
            </div>
            {/* View toggle icons */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[false, true, false].map((active, i) => (
                <div key={i} style={{
                  width: 24, height: 24,
                  background: active ? '#1d4ed8' : '#111827',
                  border: `1px solid ${active ? '#1d4ed8' : '#1f2937'}`,
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i === 0 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="4" r="1.5" fill="#4b5563"/><circle cx="8" cy="8" r="1.5" fill="#4b5563"/><circle cx="8" cy="12" r="1.5" fill="#4b5563"/></svg>}
                  {i === 1 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#fff"/></svg>}
                  {i === 2 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
              ))}
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 5, padding: '0 12px 8px', overflow: 'hidden' }}>
            {[
              { label: '⊙ Today',    bg: 'transparent',  border: '#1f2937', color: '#6b7280' },
              { label: '$ Unpaid',   bg: '#064e3b',      border: '#065f46', color: '#10b981' },
              { label: '✦ New (17)', bg: '#1e3a5f',      border: '#1d4ed8', color: '#60a5fa' },
              { label: '⊟ Filters',  bg: 'transparent',  border: '#1f2937', color: '#6b7280' },
            ].map(c => (
              <div key={c.label} style={{
                padding: '3px 7px',
                borderRadius: 20,
                fontSize: 8,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.color,
              }}>
                {c.label}
              </div>
            ))}
          </div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 4px' }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '.1em' }}>Today</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: '#1d4ed8' }}>1 job</span>
          </div>

          {/* ── Lead card ── */}
          <div style={{ margin: '0 10px', background: '#111827', borderRadius: 12, border: '1px solid #1f2937', overflow: 'hidden' }}>

            {/* Card top bar */}
            <div style={{ background: '#0d1526', padding: '7px 10px 6px', borderBottom: '1px solid #1a2535', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#064e3b', padding: '2px 7px', borderRadius: 5, border: '1px solid #065f46' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 7, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.06em' }}>New</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2l1.5 3.5 3.5.5-2.5 2.5.6 3.5L8 10.5l-3.1 1.5.6-3.5L3 6l3.5-.5z" stroke="#374151" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Card body */}
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#f9fafb', marginBottom: 1 }}>Curtis Wilson</div>
              <div style={{ fontSize: 8.5, color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>Unassigned · Submitted Mar 31</div>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
                {[
                  { label: 'Job Date',  val: 'TBD',     icon: 'calendar', color: '#374151' },
                  { label: 'Arrival',   val: 'TBD',     icon: 'clock',    color: '#374151' },
                  { label: 'Category',  val: 'Roofing', icon: 'tag',      color: '#6366f1' },
                  { label: 'Photos',    val: '2 files', icon: 'photo',    color: '#10b981' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#0d0d1a', borderRadius: 6, padding: '4px 6px' }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: m.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {m.icon === 'calendar' && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="#374151" strokeWidth="1.5"/><path d="M5 1v3M11 1v3M2 7h12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      {m.icon === 'clock'    && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#374151" strokeWidth="1.5"/><path d="M8 5v3.5l2 1.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      {m.icon === 'tag'      && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 12L8 3l5 9H3z" stroke="#6366f1" strokeWidth="1.2"/></svg>}
                      {m.icon === 'photo'    && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#10b981" strokeWidth="1.2"/><circle cx="8" cy="8.5" r="2" stroke="#10b981" strokeWidth="1.2"/></svg>}
                      {m.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #1a2535' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#6b7280' }}>$0</div>
                  <div style={{ fontSize: 7.5, color: '#374151', fontWeight: 600 }}>+ UNPAID</div>
                </div>
                {/* AI brief button */}
                <div style={{ width: 28, height: 28, background: '#312e81', borderRadius: 9, border: '1px solid #3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#818cf8"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Home indicator */}
        <div style={{ width: 72, height: 4, background: '#1f2937', borderRadius: 4, margin: '8px auto 6px' }} />
      </div>
    </div>
  );
}