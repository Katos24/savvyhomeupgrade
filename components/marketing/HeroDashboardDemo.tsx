'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, Check, MapPin, Phone, User, Wifi, ArrowRight, Mail } from 'lucide-react';

// ── Phase timing ──────────────────────────────────────────────────────────────
// 0    — form idle, fields pre-filled
// 1800 — submit button pulses / "Submitted!"
// 3000 — transition: left fades, right activates
// 3600 — Curtis Wilson slides in on dashboard
// 8000 — reset and loop

export default function HeroDashboardDemo() {
  const [phase, setPhase] = useState<'form' | 'submitting' | 'dashboard' | 'reset'>('form');
  const [leadVisible, setLeadVisible] = useState(false);

  useEffect(() => {
    let timers: NodeJS.Timeout[] = [];

    function run() {
      setPhase('form');
      setLeadVisible(false);

      timers.push(setTimeout(() => setPhase('submitting'), 1800));
      timers.push(setTimeout(() => setPhase('dashboard'), 3000));
      timers.push(setTimeout(() => setLeadVisible(true), 3600));
      timers.push(setTimeout(run, 8000));
    }

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const formActive = phase === 'form' || phase === 'submitting';
  const dashActive = phase === 'dashboard';

  const existingLeads = [
    { name: 'Marcus Thornton', status: 'Contacted',  color: '#f59e0b', amount: '$7,950',  date: 'Apr 12' },
    { name: 'David Reyes',     status: 'Scheduled',  color: '#6366f1', amount: '$2,400',  date: 'Apr 15' },
    { name: 'Sarah Kim',       status: 'Won',         color: '#10b981', amount: '$5,200',  date: 'Apr 13' },
    { name: 'James Patel',     status: 'Quote Sent', color: '#8b5cf6', amount: '$11,400', date: 'Apr 18' },
    { name: 'Linda Ortega',    status: 'New',         color: '#10b981', amount: '—',       date: 'Apr 9'  },
    { name: 'Ray Nguyen',      status: 'Contacted',  color: '#f59e0b', amount: '$3,200',  date: 'Apr 10' },
  ];

  return (
    <div className="relative w-full max-w-[600px] mx-auto lg:mx-0">

      {/* Ambient glow */}
      <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: 'linear-gradient(135deg,#1a6645,#0F1F3D)' }} />

      {/* Label row */}
      <div className="grid grid-cols-2 gap-4 mb-2 px-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-center transition-all duration-500"
          style={{ color: formActive ? '#1a6645' : '#cbd5e1' }}>
          ① Customer form
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-center transition-all duration-500"
          style={{ color: dashActive ? '#6366f1' : '#cbd5e1' }}>
          ② Your dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 relative lg:items-stretch" style={{ minHeight: 'clamp(0px, 50vw, 600px)' }}>

        {/* Arrow connector */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700"
          style={{
            opacity: phase === 'submitting' ? 1 : 0,
            transform: `translateX(-50%) translateY(-50%) scale(${phase === 'submitting' ? 1 : 0.8})`
          }}>
          <div className="w-8 h-8 rounded-full bg-[#1a6645] flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>

        {/* ── LEFT: Customer form ── */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-700 flex flex-col"
          style={{
            boxShadow: formActive ? '0 8px 40px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
            opacity: dashActive ? 0.35 : 1,
            transform: dashActive ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#0F1F3D,#1a3a5c)' }}>
            <img src="/images/ridgelinelogo.png" alt="" className="w-4 h-4 object-contain" />
            <span className="text-[9px] font-black text-white">Ridge Line Roofing</span>
            <div className="ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            </div>
          </div>

          {/* URL bar */}
          <div className="px-3 py-2 border-b border-slate-50">
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <QrCode size={8} className="text-[#1a6645] shrink-0" />
              <p className="text-[8px] font-bold text-slate-400 truncate">
                lead2project.com/<span className="text-[#1a6645] font-black">ridge-line</span>
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div className="px-3 py-2.5 space-y-1.5 flex-1">

            {/* Name */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <User size={8} className="text-slate-400 shrink-0" />
              <span className="text-[9px] font-medium text-slate-700 flex-1">Curtis Wilson</span>
              <Check size={7} className="text-emerald-400 shrink-0" />
            </div>

            {/* Phone */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <Phone size={8} className="text-slate-400 shrink-0" />
              <span className="text-[9px] font-medium text-slate-700 flex-1">(555) 482-9301</span>
              <Check size={7} className="text-emerald-400 shrink-0" />
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <Mail size={8} className="text-slate-400 shrink-0" />
              <span className="text-[9px] font-medium text-slate-700 flex-1">jmerritt@email.com</span>
              <Check size={7} className="text-emerald-400 shrink-0" />
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <MapPin size={8} className="text-slate-400 shrink-0" />
              <span className="text-[9px] font-medium text-slate-700 flex-1">42 Maple Ave, Brooklyn NY</span>
              <Check size={7} className="text-emerald-400 shrink-0" />
            </div>

            {/* Description */}
            <div className="hidden lg:block bg-slate-50 rounded-lg px-2 py-1.5 border border-slate-100">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Project Description</p>
              <p className="text-[8px] text-slate-600 leading-relaxed">Damaged shingles after storm, full inspection needed. Some flashing issues near chimney.</p>
            </div>

            {/* Service category chips */}
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 px-0.5">Service Needed</p>
              <div className="flex gap-1 flex-wrap">
                {['Storm Damage', 'Full Replacement', 'Roof Repair', 'Gutters', 'Inspection', 'Skylights'].map((o, i) => (
                  <div key={o} className="px-2 py-0.5 rounded-full text-[7px] font-black border transition-all"
                    style={i === 0
                      ? { background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D' }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }
                    }>
                    {o}
                  </div>
                ))}
              </div>
            </div>

            {/* Budget range chips */}
            <div className="hidden lg:block">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 px-0.5">Budget Range</p>
              <div className="flex gap-1 flex-wrap">
                {['Under $2k', '$2k–$5k', '$5k–$15k', '$15k+'].map((o, i) => (
                  <div key={o} className="px-2 py-0.5 rounded-full text-[7px] font-black border transition-all"
                    style={i === 2
                      ? { background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D' }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }
                    }>
                    {o}
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency chips */}
            <div className="hidden lg:block">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 px-0.5">How Urgent?</p>
              <div className="flex gap-1 flex-wrap">
                {['Urgent', 'Within 2 weeks', 'Within a month'].map((o, i) => (
                  <div key={o} className="px-2 py-0.5 rounded-full text-[7px] font-black border transition-all"
                    style={i === 1
                      ? { background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D' }
                      : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }
                    }>
                    {o}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo upload */}
            <div className="hidden lg:block rounded-lg border border-dashed border-slate-200 bg-slate-50 px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gradient-to-b from-sky-300 via-slate-400 to-slate-600" />
                </div>
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gradient-to-b from-slate-300 to-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[7px] font-black text-slate-500">2 photos uploaded</p>
                  <p className="text-[6px] text-slate-400 truncate">roof-damage.jpg · chimney.jpg</p>
                </div>
                <Check size={8} className="text-emerald-400 shrink-0" />
              </div>
            </div>

          </div>

          {/* Submit button */}
          <div className="px-3 pb-3">
            <div
              className="w-full py-2 rounded-xl text-[9px] font-black text-white text-center transition-all duration-300"
              style={{
                background: phase === 'submitting'
                  ? 'linear-gradient(135deg,#10b981,#059669)'
                  : 'linear-gradient(135deg,#0F1F3D,#1a3a5c)',
                boxShadow: phase === 'submitting' ? '0 0 20px rgba(16,185,129,0.4)' : 'none',
                transform: phase === 'submitting' ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {phase === 'submitting' ? '✓ Submitted!' : 'Submit Request'}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Dashboard ── */}
        <div
          className="bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-700 flex flex-col"
          style={{
            boxShadow: dashActive ? '0 8px 40px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
            opacity: formActive ? 0.35 : 1,
            transform: formActive ? 'scale(0.98)' : 'scale(1)',
          }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-50">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
                  <img src="/images/ridgelinelogo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dashboard</span>
              </div>
              <div className="flex items-center gap-1 text-[7px] font-bold text-emerald-500">
                <Wifi size={7} /> Live
              </div>
            </div>
            <p className="text-[12px] font-black text-slate-900">Your lead board</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-b border-slate-50">
            {[
              { label: 'Leads',   val: leadVisible ? '169' : '168' },
              { label: 'Active',  val: '63' },
              { label: 'Revenue', val: '$102k' },
            ].map((s, i) => (
              <div key={i} className={`px-2 py-2 text-center ${i < 2 ? 'border-r border-slate-50' : ''} transition-all duration-500`}>
                <p className={`text-[13px] font-black transition-all duration-300 ${i === 0 && leadVisible ? 'text-emerald-600' : 'text-slate-900'}`}>{s.val}</p>
                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lead list */}
          <div className="px-3 pt-2.5 pb-1 space-y-1.5 flex-1 overflow-hidden">

            {/* New lead animates in */}
            <div
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-700"
              style={{
                background: leadVisible ? '#f0fdf4' : '#f8fafc',
                borderColor: leadVisible ? '#86efac' : '#f1f5f9',
                opacity: leadVisible ? 1 : 0,
                transform: leadVisible ? 'translateY(0)' : 'translateY(8px)',
                boxShadow: leadVisible ? '0 0 0 2px #bbf7d040' : 'none',
              }}
            >
              <div className="w-1 h-6 rounded-full shrink-0 bg-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-black text-slate-900">Jason Merritt</p>
                  <span className="text-[6px] font-black text-emerald-600 bg-emerald-100 px-1 py-0.5 rounded-full">NEW</span>
                </div>
                <div className="flex items-center gap-1">
                  <QrCode size={7} className="text-slate-400" />
                  <span className="text-[7px] text-slate-400">via QR · just now</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[8px] font-black text-emerald-600">Roofing</p>
                <p className="text-[6px] text-slate-400">Brooklyn NY</p>
              </div>
              <ChevronRight size={10} className="text-slate-300 shrink-0" />
            </div>

            {/* Existing leads — first 2 always visible, rest lg only */}
            {existingLeads.map((lead, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-50 bg-slate-50/50 transition-all duration-300 ${i >= 2 ? 'hidden lg:flex' : 'flex'}`}
              >
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: lead.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-800 truncate">{lead.name}</p>
                  <span className="text-[6px] font-black px-1 py-0.5 rounded" style={{ background: `${lead.color}15`, color: lead.color }}>{lead.status}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-black text-emerald-600">{lead.amount}</p>
                  <p className="text-[6px] text-slate-400">{lead.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unpaid banner */}
          <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-xl hidden lg:flex items-center gap-2"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
            <p className="text-[7px] font-black text-orange-600 flex-1">15 Overdue · 1 Due Soon</p>
            <p className="text-[7px] font-bold text-orange-400">$34,200 pending</p>
          </div>

          <div className="px-3 pb-3">
            <p className="text-[7px] text-center text-slate-400 font-medium">Schedule · Quote · Collect — one click</p>
          </div>
        </div>

      </div>

      {/* Bottom label */}
      <p className="text-center text-[9px] font-bold text-slate-400 mt-3">
        Your customer link is public · Your dashboard is private
      </p>
    </div>
  );
}