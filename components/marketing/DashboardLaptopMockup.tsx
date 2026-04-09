'use client';

import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MOCKUP LIGHT — Phone overlay (bottom-right of laptop)
// ─────────────────────────────────────────────────────────────────────────────
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
        {/* Side buttons */}
        {[{l:true,top:80,h:26},{l:true,top:116,h:44},{l:true,top:168,h:44},{l:false,top:104,h:56}].map((b,i) => (
          <div key={i} style={{ position:'absolute', [b.l?'left':'right']:-3, top:b.top, width:3, height:b.h, background:'#1e1e2e', borderRadius: b.l?'2px 0 0 2px':'0 2px 2px 0' }} />
        ))}

        {/* Notch */}
        <div style={{ width:88, height:22, background:'#1e1e2e', borderRadius:'0 0 16px 16px', margin:'0 auto', position:'relative', zIndex:10 }} />

        {/* Screen */}
        <div style={{ background:'#f1f5f9', paddingBottom:12 }}>

          {/* Overdue banner */}
          <div style={{ margin:'6px 10px', background:'#fff1f2', border:'1px solid #fecdd3', borderRadius:10, padding:'5px 10px', display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />
            <span style={{ fontSize:8, fontWeight:800, color:'#dc2626' }}>15 Overdue</span>
            <span style={{ fontSize:8, color:'#94a3b8', margin:'0 2px' }}>·</span>
            <span style={{ fontSize:8, fontWeight:700, color:'#f97316' }}>1 Due Soon</span>
          </div>

          {/* Top bar */}
          <div style={{ margin:'6px 10px', background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'8px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', flexDirection:'column', gap:3, padding:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:14, height:1.5, background:'#94a3b8', borderRadius:2 }} />)}
              </div>
              <div style={{ width:30, height:30, background:'#f8fafc', borderRadius:9, border:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                <img src="/images/ridgelinelogo.png" alt="" style={{ width:26, height:26, objectFit:'contain' }} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:800, color:'#0f172a', letterSpacing:'-0.3px' }}>Ridge Line Roofing</div>
                <div style={{ fontSize:7.5, fontWeight:700, color:'#6366f1', letterSpacing:'.1em', textTransform:'uppercase' }}>Dashboard</div>
              </div>
            </div>
            <div style={{ width:26, height:26, background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </div>
          </div>

          {/* Stats 2x2 */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, padding:'0 10px 8px' }}>
            {[
              { label:'Total Leads',   value:'168',         color:'#0f172a'  },
              { label:'Active Jobs',   value:'63',          color:'#2563eb'  },
              { label:'Total Revenue', value:'$102,671.96', color:'#16a34a', small:true },
              { label:'Total Pending', value:'$122,880',    color:'#d97706', small:true },
            ].map(s => (
              <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'8px 10px', border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:7, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{s.label}</div>
                <div style={{ fontSize:s.small?11:16, fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Filter chips */}
          <div style={{ display:'flex', gap:5, padding:'0 10px 8px' }}>
            {['Today','Unpaid','New (18)','Filters'].map(c => (
              <div key={c} style={{ padding:'3px 7px', borderRadius:20, fontSize:8, fontWeight:700, background:'#fff', border:'1px solid #e2e8f0', color:'#475569', whiteSpace:'nowrap' }}>{c}</div>
            ))}
          </div>

          {/* Lead card */}
          <div style={{ margin:'0 10px', background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', overflow:'hidden' }}>
            <div style={{ borderLeft:'4px solid #10b981', padding:'7px 10px 6px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ background:'#dcfce7', border:'1px solid #bbf7d0', borderRadius:6, padding:'2px 7px', fontSize:7, fontWeight:800, color:'#15803d', textTransform:'uppercase' }}>New</div>
              <span style={{ fontSize:7, color:'#94a3b8' }}>just now</span>
            </div>
            <div style={{ padding:'8px 10px 10px' }}>
              <div style={{ fontSize:14, fontWeight:800, color:'#0f172a', marginBottom:1 }}>David Reyes</div>
              <div style={{ fontSize:8.5, color:'#94a3b8', marginBottom:8 }}>Unassigned · via QR scan</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:5, marginBottom:8 }}>
                {[{label:'Category',val:'Gutters',color:'#6366f1'},{label:'Photos',val:'2 files',color:'#10b981'},{label:'Job Date',val:'TBD',color:'#94a3b8'},{label:'Arrival',val:'TBD',color:'#94a3b8'}].map(m => (
                  <div key={m.label} style={{ background:'#f8fafc', borderRadius:8, padding:'4px 7px', border:'1px solid #f1f5f9' }}>
                    <div style={{ fontSize:7, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginBottom:2 }}>{m.label}</div>
                    <div style={{ fontSize:9, fontWeight:700, color:m.color }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:7, borderTop:'1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color:'#0f172a' }}>$0</div>
                  <div style={{ fontSize:7, color:'#94a3b8', textTransform:'uppercase' }}>Unpaid</div>
                </div>
                <div style={{ width:28, height:28, background:'#ede9fe', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.2 3.8H13l-3.1 2.3 1.2 3.7L8 9.5l-3.1 2.3 1.2-3.7L3 5.8h3.8z" fill="#7c3aed"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ width:72, height:4, background:'#cbd5e1', borderRadius:4, margin:'8px auto 6px' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD LAPTOP MOCKUP — Main laptop shell with phone overlay
// Wider: 580px (was 480px)
// ─────────────────────────────────────────────────────────────────────────────
export function DashboardLaptopMockup() {
  const [cardVisible, setCardVisible] = useState(false);
  const [ping, setPing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCardVisible(true), 1000);
    const t2 = setTimeout(() => setPing(true), 1400);
    const t3 = setTimeout(() => setPing(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="relative flex items-end justify-center">

      {/* ── Laptop shell ── */}
      <div className="relative" style={{ width: 820 }}>

        {/* Screen bezel */}
        <div className="rounded-t-xl overflow-hidden border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.7)]"
          style={{ background: '#0d1117' }}>

          {/* Menu bar */}
          <div className="flex items-center px-3 gap-1.5 border-b border-white/5" style={{ height: 24, background: '#090d12' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <div className="flex-1 mx-3 h-3.5 rounded-sm" style={{ background: '#1e293b' }} />
          </div>

          {/* Dashboard screen */}
          <div style={{ background: '#0d1117', padding: '12px 14px 14px' }}>

            {/* ── Top nav bar ── */}
            <div className="flex items-center justify-between rounded-xl px-3 py-2 mb-3"
              style={{ background: '#161d2f', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  {[0,1,2].map(i => <div key={i} className="rounded-full" style={{ width:12, height:1.5, background:'#4b5563' }} />)}
                </div>
                <div className="flex items-center justify-center rounded-lg overflow-hidden" style={{ width:24, height:24, background:'#fff' }}>
                  <img src="/images/ridgelinelogo.png" alt="" style={{ width:20, height:20, objectFit:'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:800, color:'#f9fafb', letterSpacing:'-0.2px' }}>Ridge Line Roofing</div>
                  <div style={{ fontSize:7, fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.1em' }}>Dashboard</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Search bar */}
                <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5" style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.06)', minWidth:160 }}>
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#374151" strokeWidth="1.5"/><path d="M11 11l2.5 2.5" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:8, color:'#374151' }}>Search leads...</span>
                </div>
                <div className="flex items-center justify-center rounded-lg" style={{ width:24, height:24, background:'#1d4ed8' }}>
                  <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M5.5 2v7M2 5.5h7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label:'Total Leads',   value: ping ? '168' : '167', color:'#f9fafb'  },
                { label:'Active Jobs',   value:'63',          color:'#3b82f6'  },
                { label:'Total Revenue', value:'$102,671.96', color:'#10b981'  },
                { label:'Total Pending', value:'$122,880',    color:'#f59e0b'  },
              ].map(s => (
                <div key={s.label} className="rounded-xl px-3 py-2 transition-all duration-500"
                  style={{ background:'#161d2f', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:7, fontWeight:700, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}>{s.label}</div>
                  <div className="transition-all duration-300" style={{ fontSize: s.value.length > 6 ? 11 : 16, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* ── Filter chips ── */}
            <div className="flex gap-1.5 mb-3">
              {[
                { label:'Scheduled Today', color:'#6b7280', bg:'transparent',   border:'rgba(255,255,255,0.07)' },
                { label:'$ Unpaid',        color:'#10b981', bg:'#064e3b22',     border:'#065f4640' },
                { label:'New (18)',         color:'#10b981', bg:'#064e3b22',     border:'#065f4640' },
                { label:'Filters',         color:'#6b7280', bg:'transparent',   border:'rgba(255,255,255,0.07)' },
              ].map(c => (
                <div key={c.label} className="rounded-full px-2.5 py-0.5"
                  style={{ fontSize:8, fontWeight:700, color:c.color, background:c.bg, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>
                  {c.label}
                </div>
              ))}
            </div>

            {/* ── Today section label ── */}
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize:9, fontWeight:800, color:'#4f46e5', textTransform:'uppercase', letterSpacing:'0.15em' }}>Today</span>
              <span style={{ fontSize:8, fontWeight:700, color:'#374151' }}>2 jobs</span>
            </div>

            {/* ── Lead cards ── */}
            <div className="grid grid-cols-2 gap-2">

              {/* Existing card — Curtis Wilson  Contacted */}
              <div className="rounded-xl overflow-hidden" style={{ background:'#161d2f', border:'1px solid rgba(255,255,255,0.05)' }}>
               <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ borderLeft:'3px solid #10b981' }}>
  <div className="px-1.5 py-0.5 rounded" style={{ background:'#064e3b', border:'1px solid #065f46', fontSize:7, fontWeight:800, color:'#10b981', textTransform:'uppercase' }}>New</div>
</div>
<div className="px-2.5 pb-2.5">
  <div style={{ fontSize:13, fontWeight:800, color:'#f9fafb', marginBottom:1 }}>Curtis Wilson</div>
  <div style={{ fontSize:7.5, color:'#4b5563', marginBottom:8 }}>UNASSIGNED</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[{l:'Job Date',v:'Apr 12',c:'#60a5fa'},{l:'Arrival',v:'9:00 AM',c:'#f9fafb'}].map(m => (
                      <div key={m.l} className="rounded-md px-1.5 py-1" style={{ background:'#0d1117' }}>
                        <div style={{ fontSize:6.5, color:'#374151', textTransform:'uppercase', marginBottom:1 }}>{m.l}</div>
                        <div style={{ fontSize:9, fontWeight:700, color:m.c }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:7.5, color:'#4b5563', marginBottom:6, textTransform:'uppercase' }}>Roofing</div>
                  <div className="flex justify-between items-center pt-1.5" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:'#10b981' }}>$7,950</div>
                      <div style={{ fontSize:6.5, color:'#374151', textTransform:'uppercase' }}>Quote Sent</div>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

              {/* New lead dropping in — David Reyes */}
              <div className="rounded-xl overflow-hidden transition-all duration-700"
                style={{
                  background:'#161d2f', border:'1px solid rgba(255,255,255,0.05)',
                  opacity: cardVisible ? 1 : 0,
                  transform: cardVisible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
                  boxShadow: cardVisible ? '0 0 0 1px #4f46e5, 0 8px 24px rgba(79,70,229,0.25)' : 'none',
                }}>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5" style={{ borderLeft:'3px solid #f59e0b' }}>
                  <div className="px-1.5 py-0.5 rounded" style={{ background:'#78350f33', border:'1px solid #92400e66', fontSize:7, fontWeight:800, color:'#f59e0b', textTransform:'uppercase' }}>Contacted</div>
                </div>
                <div className="px-2.5 pb-2.5">
                  <div style={{ fontSize:13, fontWeight:800, color:'#f9fafb', marginBottom:1 }}>David Reyes</div>
                  <div style={{ fontSize:7.5, color:'#4b5563', marginBottom:8 }}>ASSIGNED: DAVE R.</div>
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    {[{l:'Job Date',v:'TBD',c:'#374151'},{l:'Arrival',v:'TBD',c:'#374151'}].map(m => (
                      <div key={m.l} className="rounded-md px-1.5 py-1" style={{ background:'#0d1117' }}>
                        <div style={{ fontSize:6.5, color:'#374151', textTransform:'uppercase', marginBottom:1 }}>{m.l}</div>
                        <div style={{ fontSize:9, fontWeight:700, color:m.c }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize:7.5, color:'#4b5563', marginBottom:6, textTransform:'uppercase' }}>Gutters</div>
                  <div className="flex justify-between items-center pt-1.5" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:800, color:'#4b5563' }}>Pending Quote</div>
                      <div style={{ fontSize:6.5, color:'#374151', textTransform:'uppercase' }}>Unpaid</div>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M5 8h6M8 5l3 3-3 3" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Laptop base ── */}
        <div className="rounded-b-xl border-t-0" style={{ height:12, background:'#161d2f', border:'1px solid rgba(255,255,255,0.05)' }} />
        <div className="rounded-b-lg mx-auto" style={{ width:'38%', height:7, background:'#0d1117', border:'1px solid rgba(255,255,255,0.05)', borderTop:'none' }} />
      </div>

     {/* ── Phone overlay — hidden on mobile, shows md+ ── */}
      <div className="hidden md:block absolute transition-all duration-700 delay-300"
        style={{
          bottom: 20, right: -28,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? 'translateY(0)' : 'translateY(16px)',
          zIndex: 10,
          filter: 'drop-shadow(0 24px 40px rgba(0,0,0,0.6))',
        }}>
        <div style={{ transform:'scale(0.62)', transformOrigin:'bottom right' }}>
          <DashboardMockupLight />
        </div>
      </div>

    </div>
  );
}