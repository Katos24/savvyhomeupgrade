'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, Wifi, ArrowRight, Camera } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

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
      <div className="relative w-full h-full rounded-[3rem] border-[8px] border-[#0f172a] bg-[#0f172a] shadow-[0_40px_80px_rgba(0,0,0,0.4)] overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-start z-30 pt-1.5">
          <div className="w-16 h-4 bg-black rounded-full" />
        </div>
        <div className="absolute inset-0 pt-8 flex flex-col bg-[#020617]">
          <div className="px-4 pt-4 pb-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#1a6645] flex items-center justify-center">
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
          <div className="px-3 pt-4 pb-1 space-y-2 flex-1 overflow-hidden">
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
          <div className="mx-3 mb-4 px-3 py-2 rounded-2xl flex items-center gap-3 border border-orange-500/20 bg-orange-500/5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
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

export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);
  // Mobile tab: 'form' | 'board'
  const [mobileTab, setMobileTab] = useState<'form' | 'board'>('form');

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    function run() {
      setLeadVisible(false);
      setArrowPulse(false);
      timers.push(setTimeout(() => setArrowPulse(true), 3800));
      timers.push(setTimeout(() => {
        setLeadVisible(true);
        setArrowPulse(false);
        // On mobile, auto-flip to board tab when lead fires
        setMobileTab('board');
      }, 4600));
      // Reset mobile tab after showing board
      timers.push(setTimeout(() => setMobileTab('form'), 8500));
      timers.push(setTimeout(run, 10000));
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative w-full mx-auto lg:mx-0" style={{ maxWidth: 600 }}>

      {/* Step labels */}
      <div className="flex justify-between mb-6 px-4 sm:px-12">
        <button
          onClick={() => setMobileTab('form')}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 lg:cursor-default
            ${mobileTab === 'form' || true
              ? (!leadVisible ? 'bg-[#1a6645] text-white shadow-lg' : 'bg-slate-200 text-slate-400')
              : 'bg-slate-200 text-slate-400'
            }`}
          style={{ background: !leadVisible ? '#1a6645' : undefined, color: !leadVisible ? 'white' : undefined }}
        >
          1. Customer scan
        </button>
        <button
          onClick={() => setMobileTab('board')}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 lg:cursor-default
            ${leadVisible ? 'bg-blue-600 text-white shadow-lg animate-bounce' : 'bg-slate-200 text-slate-400'}`}
        >
          2. Instant Board
        </button>
      </div>

      {/* ── DESKTOP: side-by-side ── */}
      <div className="hidden lg:flex items-center justify-center">
        <div className="transition-transform duration-500 hover:scale-[1.02]">
          <FastDemoForm autoPlay />
        </div>
        <div
          className="flex items-center justify-center shrink-0 mx-[-20px] z-30 transition-all duration-700"
          style={{ opacity: arrowPulse ? 1 : 0.2, transform: arrowPulse ? 'scale(1.4)' : 'scale(1)' }}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${arrowPulse ? 'bg-[#1a6645]' : 'bg-white border-2 border-slate-200'}`}>
            <ArrowRight size={20} className={arrowPulse ? 'text-white' : 'text-slate-300'} strokeWidth={3} />
          </div>
        </div>
        <div className="transition-transform duration-500 hover:scale-[1.02]">
          <DashboardPhone leadVisible={leadVisible} />
        </div>
      </div>

      {/* ── MOBILE: single phone, tab-switched ── */}
      <div className="flex lg:hidden flex-col items-center">
        {/* Tab indicator dots */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMobileTab('form')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${mobileTab === 'form' ? 'bg-emerald-500 w-6' : 'bg-slate-300'}`}
          />
          <button
            onClick={() => setMobileTab('board')}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${mobileTab === 'board' ? 'bg-blue-500 w-6' : 'bg-slate-300'}`}
          />
        </div>

        {/* Phones: slide between them */}
        <div className="relative overflow-hidden" style={{ width: 260, height: 480 }}>
          {/* Form phone */}
          <div
            className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mobileTab === 'form' ? 1 : 0,
              transform: mobileTab === 'form' ? 'translateX(0)' : 'translateX(-30px)',
              pointerEvents: mobileTab === 'form' ? 'auto' : 'none',
            }}
          >
            <FastDemoForm autoPlay />
          </div>
          {/* Dashboard phone */}
          <div
            className="absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: mobileTab === 'board' ? 1 : 0,
              transform: mobileTab === 'board' ? 'translateX(0)' : 'translateX(30px)',
              pointerEvents: mobileTab === 'board' ? 'auto' : 'none',
            }}
          >
            <DashboardPhone leadVisible={leadVisible} />
          </div>
        </div>

        {/* Tap hint on form view */}
        {mobileTab === 'form' && !leadVisible && (
          <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Submitting → board updates live
          </p>
        )}
        {mobileTab === 'board' && leadVisible && (
          <p className="mt-4 text-[11px] text-emerald-500 font-bold uppercase tracking-widest">
            New lead landed in 2 seconds
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="h-px w-12 bg-slate-200" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncs in Real-Time</p>
        <div className="h-px w-12 bg-slate-200" />
      </div>
    </div>
  );
}