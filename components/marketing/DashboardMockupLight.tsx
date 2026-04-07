'use client';

export function DashboardMockupLight() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem 1rem' }}>

      {/* Phone shell */}
      <div style={{
        position: 'relative',
        width: 260,
        background: '#f1f5f9',
        borderRadius: 42,
        border: '6px solid #1e1e2e',
        boxShadow: '0 0 0 1px #2a2a3e, 0 48px 80px rgba(0,0,0,0.65)',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>
        {/* Side buttons */}
        <div style={{ position:'absolute', left:-3, top:80,  width:3, height:26, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', left:-3, top:116, width:3, height:44, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', left:-3, top:168, width:3, height:44, background:'#1e1e2e', borderRadius:'2px 0 0 2px' }} />
        <div style={{ position:'absolute', right:-3, top:104, width:3, height:56, background:'#1e1e2e', borderRadius:'0 2px 2px 0' }} />

        {/* Notch */}
        <div style={{ width: 88, height: 22, background: '#1e1e2e', borderRadius: '0 0 16px 16px', margin: '0 auto', position: 'relative', zIndex: 10 }} />

        {/* Screen */}
        <div style={{ background: '#f1f5f9', paddingBottom: 12 }}>

          {/* Overdue banner */}
          <div style={{ margin: '6px 10px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: 8, fontWeight: 800, color: '#dc2626' }}>15 Overdue</span>
            <span style={{ fontSize: 8, color: '#94a3b8', margin: '0 2px' }}>·</span>
            <span style={{ fontSize: 8, fontWeight: 700, color: '#f97316' }}>1 Due Soon</span>
          </div>

          {/* Top bar */}
          <div style={{ margin: '6px 10px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '4px' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 14, height: 1.5, background: '#94a3b8', borderRadius: 2 }} />)}
              </div>
              <div style={{ width: 30, height: 30, background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <img src="/images/ridgelinelogo.png" alt="logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', lineHeight: 1.15 }}>Ridge Line Roofing</div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#6366f1', letterSpacing: '.1em', textTransform: 'uppercase' }}>Dashboard</div>
              </div>
            </div>
            <div style={{ width: 26, height: 26, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* Stats 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '0 10px 8px' }}>
            {[
              { label: 'Total Leads',   value: '168',         color: '#0f172a' },
              { label: 'Active Jobs',   value: '63',          color: '#2563eb' },
              { label: 'Total Revenue', value: '$102,671.96', color: '#16a34a', small: true },
              { label: 'Total Pending', value: '$122,880',    color: '#d97706', small: true },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '8px 10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: s.small ? 11 : 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 10px 6px' }}>
            <div style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#94a3b8" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span style={{ fontSize: 9, color: '#94a3b8' }}>Search by name...</span>
            </div>
            {/* View toggles */}
            <div style={{ display: 'flex', gap: 3 }}>
              {[false, true, false, false].map((active, i) => (
                <div key={i} style={{ width: 24, height: 24, background: active ? '#4f46e5' : '#fff', border: `1px solid ${active ? '#4f46e5' : '#e2e8f0'}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? 'none' : '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {i === 1 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="2" width="5" height="5" rx="1" fill="#fff"/><rect x="2" y="9" width="5" height="5" rx="1" fill="#fff"/><rect x="9" y="9" width="5" height="5" rx="1" fill="#fff"/></svg>}
                  {i !== 1 && <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke={active ? '#fff' : '#94a3b8'} strokeWidth="1.5" strokeLinecap="round"/></svg>}
                </div>
              ))}
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 5, padding: '0 10px 8px' }}>
            {[
              { label: 'Today',    icon: '○' },
              { label: 'Unpaid',  icon: '$' },
              { label: 'New (18)', icon: '✦' },
              { label: 'Filters', icon: '⊟' },
            ].map(c => (
              <div key={c.label} style={{ padding: '3px 7px', borderRadius: 20, fontSize: 8, fontWeight: 700, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', whiteSpace: 'nowrap', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                {c.label}
              </div>
            ))}
          </div>

          {/* TODAY label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 12px 6px' }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '.12em' }}>Today</span>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: '#94a3b8' }}>2</span>
          </div>

          {/* Lead card — light version */}
          <div style={{ margin: '0 10px', background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Green left border + NEW badge */}
            <div style={{ borderLeft: '4px solid #10b981', padding: '7px 10px 6px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 7px', fontSize: 7, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.06em' }}>New</div>
              <span style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600 }}>just now</span>
            </div>
            <div style={{ padding: '8px 10px 10px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 1 }}>David Reyes</div>
              <div style={{ fontSize: 8.5, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>Unassigned · via QR scan</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 8 }}>
                {[
                  { label: 'Job Date', val: 'TBD',     color: '#94a3b8' },
                  { label: 'Arrival',  val: 'TBD',     color: '#94a3b8' },
                  { label: 'Category', val: 'Gutters', color: '#6366f1' },
                  { label: 'Photos',   val: '2 files', color: '#10b981' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '4px 7px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: m.color }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 7, borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>$0</div>
                  <div style={{ fontSize: 7, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Unpaid</div>
                </div>
                <div style={{ width: 28, height: 28, background: '#ede9fe', borderRadius: 9, border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#7c3aed"/></svg>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Home indicator */}
        <div style={{ width: 72, height: 4, background: '#cbd5e1', borderRadius: 4, margin: '8px auto 6px' }} />
      </div>
    </div>
  );
}