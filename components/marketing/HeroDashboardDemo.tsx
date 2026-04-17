'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, Wifi, ArrowRight } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

// ── Dashboard phone ───────────────────────────────────────────────────────────

function DashboardPhone({ leadVisible }: { leadVisible: boolean }) {
  const existingLeads = [
    { name: 'Marcus Thornton', status: 'Contacted',  color: '#f59e0b', amount: '$7,950',  date: 'Apr 12' },
{ name: 'David Reyes',     status: 'Scheduled',  color: '#3b82f6', amount: '$2,400',  date: 'Apr 15' },    { name: 'Sarah Kim',       status: 'Won',        color: '#10b981', amount: '$5,200',  date: 'Apr 13' },
{ name: 'James Patel',     status: 'Quote Sent', color: '#0891b2', amount: '$11,400', date: 'Apr 18' },    { name: 'Linda Ortega',    status: 'New',        color: '#10b981', amount: '—',       date: 'Apr 9'  },
  ];

  return (
    <div className="relative" style={{ width: 260, height: 480 }}>
      <div className="absolute -top-4 -left-4 w-48 h-48 rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: 'linear-gradient(135deg,#3b82f6,#0F1F3D)' }} />

      <div className="relative w-full h-full rounded-[3rem] border-[6px] border-[#0f172a] bg-[#0f172a] shadow-[0_32px_64px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-end z-30">
          <div className="w-14 h-3 bg-black rounded-b-lg mb-1" />
        </div>

        <div className="absolute inset-0 pt-8 flex flex-col">
          {/* URL bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[7.5px] font-medium text-white/40 truncate flex-1">
              lead2project.com/<span className="text-white/80 font-black">ridgeline-roofing/dashboard</span>
            </span>
            <div className="w-3 h-3 rounded bg-white/10 shrink-0" />
          </div>

          {/* Header */}
          <div className="px-4 pt-2.5 pb-2.5 border-b border-white/10">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  <img src="/images/ridgelinelogo.png" alt="" className="w-3.5 h-3.5 object-contain" />
                </div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Dashboard</span>
              </div>
              <div className="flex items-center gap-1 text-[7px] font-bold text-emerald-500">
                <Wifi size={7} />
              </div>
            </div>
            <p className="text-[13px] font-black text-white">Your lead board</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 border-b border-white/10">
            {[
              { label: 'Leads',   val: leadVisible ? '169' : '168', highlight: leadVisible },
              { label: 'Active',  val: '63',    highlight: false },
              { label: 'Revenue', val: '$102k', highlight: false },
            ].map((s, i) => (
              <div key={i} className={`px-2 py-2 text-center ${i < 2 ? 'border-r border-white/10' : ''} transition-all duration-500`}>
                <p className={`text-[14px] font-black transition-all duration-300 ${s.highlight ? 'text-emerald-400' : 'text-white'}`}>{s.val}</p>
                <p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lead list */}
          <div className="px-3 pt-2.5 pb-1 space-y-1.5 flex-1 overflow-hidden">

            {/* New lead animates in — with photo thumbnail */}
            <div
              className="rounded-xl border overflow-hidden transition-all duration-700"
              style={{
                background: leadVisible ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                borderColor: leadVisible ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)',
                opacity: leadVisible ? 1 : 0,
                transform: leadVisible ? 'translateY(0)' : 'translateY(8px)',
                boxShadow: leadVisible ? '0 0 0 2px #bbf7d040' : 'none',
              }}
            >
              {/* Photo strip */}
              {leadVisible && (
                <div className="relative w-full overflow-hidden" style={{ height: 36 }}>
                  <img
                    src="/images/roof-damage.png"
                    alt="fence damage"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.7)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1 left-2 flex items-center gap-1">
                    <span className="text-[7px] font-black text-white/80">1 photo attached</span>
                  </div>
                  <div className="absolute top-1 right-2 flex items-center gap-1 bg-emerald-500/90 px-1.5 py-0.5 rounded-full">
                    <span className="text-[6px] font-black text-white">NEW</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-2.5 py-2">
                <div className="w-1 h-6 rounded-full shrink-0 bg-emerald-500" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-black text-white truncate">Jason Merritt</p>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <QrCode size={7} className="text-slate-400 shrink-0" />
<span className="text-[7px] text-white/40">via QR · just now · Roofing</span>
<span className="text-[6px] font-black text-pink-400 bg-pink-500/10 px-1 py-0.5 rounded-full">1 photo</span>
                  </div>
                </div>
                <ChevronRight size={10} className="text-slate-300 shrink-0" />
              </div>
            </div>

            {existingLeads.map((lead, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/5 bg-white/[0.03]">
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: lead.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-white/90 truncate">{lead.name}</p>
                  <span className="text-[6px] font-black px-1 py-0.5 rounded"
                    style={{ background: `${lead.color}15`, color: lead.color }}>{lead.status}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-black text-emerald-600">{lead.amount}</p>
                  <p className="text-[6px] text-slate-400">{lead.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unpaid banner */}
          <div className="mx-3 mb-2 px-2.5 py-1.5 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
            <p className="text-[7px] font-black text-orange-600 flex-1">15 Overdue · 1 Due Soon</p>
            <p className="text-[7px] font-bold text-orange-400">$34,200 pending</p>
          </div>

          <div className="px-3 pb-3">
            <p className="text-[7px] text-center text-white/30 font-medium">Schedule · Quote · Collect — one click</p>
          </div>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full z-30" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];

    function run() {
      setLeadVisible(false);
      setArrowPulse(false);
      timers.push(setTimeout(() => setArrowPulse(true), 3800));
      timers.push(setTimeout(() => { setLeadVisible(true); setArrowPulse(false); }, 4600));
      timers.push(setTimeout(run, 9200));
    }

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full mx-auto lg:mx-0" style={{ maxWidth: 580 }}>

      {/* Labels */}
      <div className="grid grid-cols-2 gap-4 mb-3 px-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-center text-[#1a6645]">
          ① Customer form
        </p>
        <p className="text-[9px] font-black uppercase tracking-widest text-center transition-colors duration-500"
        style={{ color: leadVisible ? '#3b82f6' : '#cbd5e1' }}>
                    ② Your dashboard
        </p>
      </div>

      <style>{`
        .phones-wrapper {
          transform-origin: top center;
          transform: scale(1);
        }
        @media (max-width: 360px)  { .phones-wrapper { transform: scale(0.62); margin-bottom: -174px; } }
        @media (min-width: 361px) and (max-width: 400px) { .phones-wrapper { transform: scale(0.68); margin-bottom: -154px; } }
        @media (min-width: 401px) and (max-width: 440px) { .phones-wrapper { transform: scale(0.75); margin-bottom: -120px; } }
        @media (min-width: 441px) and (max-width: 520px) { .phones-wrapper { transform: scale(0.85); margin-bottom: -72px; } }
        @media (min-width: 521px) and (max-width: 580px) { .phones-wrapper { transform: scale(0.93); margin-bottom: -34px; } }
      `}</style>

      <div className="w-full flex justify-center">
        <div className="phones-wrapper flex items-center justify-center relative">

          {/* Left — form phone */}
          <div style={{ zIndex: 2, flexShrink: 0 }}>
            <FastDemoForm autoPlay />
          </div>

          {/* Arrow */}
          <div
            className="flex items-center justify-center shrink-0 transition-all duration-500 z-10"
            style={{
              margin: '0 -8px',
              opacity: arrowPulse ? 1 : 0.2,
              transform: arrowPulse ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-400"
              style={{ background: arrowPulse ? 'linear-gradient(135deg,#1a6645,#059669)' : '#e2e8f0' }}
            >
              <ArrowRight size={15} className={arrowPulse ? 'text-white' : 'text-slate-400'} />
            </div>
          </div>

          {/* Right — dashboard phone */}
          <div style={{ zIndex: 1, flexShrink: 0 }}>
            <DashboardPhone leadVisible={leadVisible} />
          </div>

        </div>
      </div>

      <p className="text-center text-[9px] font-bold text-slate-400 mt-4">
        Your customer link is public · Your dashboard is private
      </p>
    </div>
  );
}