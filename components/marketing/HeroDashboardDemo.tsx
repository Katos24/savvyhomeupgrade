'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, Wifi, ArrowRight, Camera } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

// ── Dashboard phone ───────────────────────────────────────────────────────────

function DashboardPhone({ leadVisible }: { leadVisible: boolean }) {
  const existingLeads = [
    { name: 'Marcus Thornton', status: 'Contacted',  color: '#f59e0b', amount: '$7,950',  date: 'Apr 12' },
    { name: 'David Reyes',     status: 'Scheduled',  color: '#3b82f6', amount: '$2,400',  date: 'Apr 15' },    
    { name: 'Sarah Kim',       status: 'Won',        color: '#10b981', amount: '$5,200',  date: 'Apr 13' },
    { name: 'James Patel',     status: 'Quote Sent', color: '#0891b2', amount: '$11,400', date: 'Apr 18' },    
    { name: 'Linda Ortega',    status: 'New',        color: '#10b981', amount: '—',       date: 'Apr 9'  },
  ];

  return (
    <div className="relative" style={{ width: 260, height: 480 }}>
      {/* Background Glow behind phone */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative w-full h-full rounded-[3rem] border-[8px] border-[#0f172a] bg-[#0f172a] shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-start z-30 pt-1.5">
          <div className="w-16 h-4 bg-black rounded-full" />
        </div>

        <div className="absolute inset-0 pt-8 flex flex-col bg-[#020617]">
          {/* Header Area */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1a6645] flex items-center justify-center shadow-lg shadow-emerald-900/40">
<img src="/images/ridgelinelogo.webp" alt="" className="w-4 h-4 object-contain" />
                </div>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Board</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-500 uppercase">Live</span>
              </div>
            </div>
            <p className="text-base font-black text-white tracking-tight">Your Lead Pipeline</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 bg-white/[0.01] border-b border-white/5">
            {[
              { label: 'Leads',   val: leadVisible ? '169' : '168', highlight: leadVisible },
              { label: 'Active',  val: '63',    highlight: false },
              { label: 'Revenue', val: '$102k', highlight: false },
            ].map((s, i) => (
              <div key={i} className={`px-2 py-3 text-center ${i < 2 ? 'border-r border-white/5' : ''}`}>
                <p className={`text-sm font-black transition-all duration-500 ${s.highlight ? 'text-emerald-400 scale-110' : 'text-white'}`}>{s.val}</p>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Lead list */}
          <div className="px-3 pt-4 pb-1 space-y-2 flex-1 overflow-hidden">
            {/* New lead animates in */}
            <div
              className="rounded-2xl border-2 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: leadVisible ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                borderColor: leadVisible ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.05)',
                opacity: leadVisible ? 1 : 0,
                transform: leadVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                boxShadow: leadVisible ? '0 10px 25px -5px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              {leadVisible && (
                <div className="relative w-full h-12 overflow-hidden">
                  <img src="/images/roof-damage.webp" alt="damage" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/20" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-[7px] font-black text-white">NEW</div>
                  <div className="absolute bottom-1.5 left-2.5 flex items-center gap-1 text-white/90">
                    <Camera size={8} />
                    <span className="text-[8px] font-black uppercase tracking-tight">Image Received</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-1 h-7 rounded-full shrink-0 bg-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white truncate">Jason Merritt</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <QrCode size={8} className="text-emerald-500/50 shrink-0" />
                    <span className="text-[8px] text-white/40 font-bold uppercase tracking-tighter">via QR · Just Now</span>
                  </div>
                </div>
                <ChevronRight size={12} className="text-white/20 shrink-0" />
              </div>
            </div>

            {existingLeads.map((lead, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] opacity-60">
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: lead.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white/90 truncate">{lead.name}</p>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-white/5" style={{ color: lead.color }}>{lead.status}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-emerald-500/80">{lead.amount}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Alert Banner */}
          <div className="mx-3 mb-4 px-3 py-2 rounded-2xl flex items-center gap-3 border border-orange-500/20 bg-orange-500/5 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <div className="flex-1">
               <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none">Payments Due</p>
               <p className="text-[10px] font-black text-white/80">$34,200 pending</p>
            </div>
            <ArrowRight size={12} className="text-orange-500/50" />
          </div>
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full z-30" />
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
      timers.push(setTimeout(() => { 
        setLeadVisible(true); 
        setArrowPulse(false); 
      }, 4600));
      timers.push(setTimeout(run, 10000));
    }

    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full mx-auto lg:mx-0" style={{ maxWidth: 600 }}>
      {/* Step Labels */}
      <div className="flex justify-between mb-6 px-12">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${!leadVisible ? 'bg-[#1a6645] text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
            1. Customer scan
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${leadVisible ? 'bg-blue-600 text-white shadow-lg animate-bounce' : 'bg-slate-200 text-slate-400'}`}>
            2. Instant Board
          </div>
        </div>
      </div>

      <style>{`
        .phones-wrapper { transform-origin: top center; }
        @media (max-width: 480px) { .phones-wrapper { transform: scale(0.75); margin-bottom: -120px; } }
        @media (max-width: 380px) { .phones-wrapper { transform: scale(0.65); margin-bottom: -160px; } }
      `}</style>

      <div className="w-full flex justify-center">
        <div className="phones-wrapper flex items-center justify-center relative">
          
          {/* Form Phone */}
          <div className="relative z-20 group transition-transform duration-500 hover:scale-[1.02]">
            <FastDemoForm autoPlay />
            {/* Connection line effect */}
            {arrowPulse && (
              <div className="absolute top-1/2 -right-10 w-20 h-px bg-gradient-to-r from-emerald-500 to-transparent z-0 hidden lg:block" />
            )}
          </div>

          {/* Transfer Arrow */}
          <div
            className="flex items-center justify-center shrink-0 transition-all duration-700 z-30"
            style={{
              margin: '0 -20px',
              opacity: arrowPulse ? 1 : 0.2,
              transform: arrowPulse ? 'scale(1.4)' : 'scale(1)',
            }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${arrowPulse ? 'bg-[#1a6645] rotate-0' : 'bg-white border-2 border-slate-200 rotate-0'}`}
            >
              <ArrowRight size={20} className={arrowPulse ? 'text-white' : 'text-slate-300'} strokeWidth={3} />
            </div>
          </div>

          {/* Dashboard Phone */}
          <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
            <DashboardPhone leadVisible={leadVisible} />
          </div>

        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-slate-200" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Syncs in Real-Time
        </p>
        <div className="h-px w-12 bg-slate-200" />
      </div>
    </div>
  );
}