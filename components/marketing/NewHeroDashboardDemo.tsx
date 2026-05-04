'use client';

import React, { useEffect, useState } from 'react';
import { QrCode, ChevronRight, ArrowRight, Camera, Terminal, Zap, Activity } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENT: DASHBOARD PHONE MOCKUP (Industrial Style)
   ───────────────────────────────────────────────────────── */
function DashboardPhone({ leadVisible }: { leadVisible: boolean }) {
  const existingLeads = [
    { name: 'Marcus Thornton', status: 'Contacted', color: '#f59e0b', amount: '$7,950' },
    { name: 'David Reyes', status: 'Scheduled', color: '#3b82f6', amount: '$2,400' },
    { name: 'Sarah Kim', status: 'Won', color: '#10b981', amount: '$5,200' },
  ];

  const phoneFrameStyle: React.CSSProperties = { width: 260, height: 480 };
  
  const leadCardStyle: React.CSSProperties = {
    background: leadVisible ? 'rgba(16,185,129,0.08)' : 'transparent',
    borderColor: leadVisible ? '#10b981' : 'rgba(255,255,255,0.05)',
    borderWidth: '2px',
    opacity: leadVisible ? 1 : 0,
    transform: leadVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
    boxShadow: leadVisible ? '0 0 20px rgba(16,185,129,0.2)' : 'none',
  };

  return (
    <div className="relative" style={phoneFrameStyle}>
      <div className="relative w-full h-full rounded-[3rem] border-[8px] border-[#111] bg-[#050505] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-start z-30 pt-1.5">
          <div className="w-16 h-4 bg-black rounded-full" />
        </div>

        <div className="absolute inset-0 pt-8 flex flex-col">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">System.Live</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-500 text-black">
                <Activity size={8} className="animate-pulse" />
                <span className="text-[8px] font-black uppercase">Active</span>
              </div>
            </div>
            <p className="text-lg font-black text-white tracking-tighter italic uppercase leading-none">Command_Center</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 border-b border-white/10">
            <div className="px-2 py-4 text-center border-r border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5" />
              <p className={`text-xl font-black transition-all duration-500 relative ${leadVisible ? 'text-emerald-400' : 'text-white/40'}`}>
                {leadVisible ? '169' : '168'}
              </p>
              <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mt-1 relative">Total_Leads</p>
            </div>
            <div className="px-2 py-4 text-center">
              <p className="text-xl font-black text-white">$102k</p>
              <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Revenue_YTD</p>
            </div>
          </div>

          {/* Feed */}
          <div className="px-3 pt-4 pb-1 space-y-2 flex-1 overflow-hidden">
            {/* New Lead (The one that appears) */}
            <div className="rounded-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden" style={leadCardStyle}>
              {leadVisible && (
                <div className="relative w-full h-14 border-b border-emerald-500/30">
                  <img src="/images/roof-damage.webp" className="w-full h-full object-cover grayscale brightness-50" alt="" />
                  <div className="absolute inset-0 bg-emerald-900/20" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-emerald-500 text-[7px] font-black text-black italic">NEW_ENTRY</div>
                </div>
              )}
              <div className="flex items-center gap-3 px-3 py-3 bg-black">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white uppercase tracking-tight">Jason Merritt</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Zap size={8} className="text-emerald-500" />
                    <span className="text-[8px] text-emerald-500/70 font-black uppercase tracking-tighter italic">Roofing Request</span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-white/20" />
              </div>
            </div>

            {/* Static Existing Leads */}
            {existingLeads.map((lead, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-white/5 bg-white/[0.02] grayscale opacity-30">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white uppercase">{lead.name}</p>
                  <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">{lead.status}</p>
                </div>
                <p className="text-[10px] font-black text-white/40">{lead.amount}</p>
              </div>
            ))}
          </div>

          {/* Footer UI */}
          <div className="p-4 bg-emerald-500/5 border-t border-white/5">
             <div className="flex justify-between items-center opacity-40">
                <div className="h-1 w-12 bg-white/20 rounded-full" />
                <div className="h-1 w-4 bg-white/20 rounded-full" />
                <div className="h-1 w-4 bg-white/20 rounded-full" />
             </div>
          </div>
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/10 rounded-full z-30" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN DEMO COMPONENT
   ───────────────────────────────────────────────────────── */
export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'form' | 'board'>('form');

  useEffect(() => {
    let timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setLeadVisible(false);
      setSyncing(false);
      setMobileTab('form');
      
      timers.push(setTimeout(() => setSyncing(true), 3800));
      timers.push(setTimeout(() => {
        setLeadVisible(true);
        setSyncing(false);
        setMobileTab('board');
      }, 4600));
      
      timers.push(setTimeout(run, 10000));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  const mobileFrameStyle: React.CSSProperties = { width: 260, height: 480 };

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: 850 }}>
      {/* Industrial Progress Stepper */}
      <div className="flex justify-center items-center gap-0 mb-12">
        <div className={`px-6 py-3 border-2 transition-all duration-500 ${!leadVisible ? 'bg-orange-600 border-orange-600 text-white' : 'bg-transparent border-white/10 text-white/20'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">01. Source_Capture</p>
        </div>
        <div className={`w-12 h-[2px] transition-colors duration-500 ${leadVisible ? 'bg-emerald-500' : 'bg-white/10'}`} />
        <div className={`px-6 py-3 border-2 transition-all duration-500 ${leadVisible ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-transparent border-white/10 text-white/20'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">02. Instant_Routing</p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-center gap-12">
        <div className="relative group">
            <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full" />
            <FastDemoForm autoPlay />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-none flex items-center justify-center transition-all duration-500 border-2 ${syncing ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] rotate-90' : 'bg-transparent border-white/10'}`}>
            <ArrowRight size={28} className={syncing ? 'text-black' : 'text-white/10'} strokeWidth={3} />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${syncing ? 'text-emerald-500 animate-pulse' : 'text-white/10'}`}>
            {syncing ? 'Pushing_Data' : 'Waiting'}
          </p>
        </div>

        <div className="relative">
            <div className={`absolute -inset-10 bg-emerald-500/10 blur-[100px] transition-opacity duration-1000 ${leadVisible ? 'opacity-100' : 'opacity-0'}`} />
            <DashboardPhone leadVisible={leadVisible} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-col items-center">
        <div className="relative" style={mobileFrameStyle}>
          <div className={`absolute inset-0 transition-all duration-500 ${mobileTab === 'form' ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <FastDemoForm autoPlay />
          </div>
          <div className={`absolute inset-0 transition-all duration-500 ${mobileTab === 'board' ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
            <DashboardPhone leadVisible={leadVisible} />
          </div>
        </div>
        
        {/* Status Indicator for Mobile */}
        <div className="mt-10 flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${leadVisible ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-orange-500 animate-pulse'}`} />
          <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">
            {mobileTab === 'form' ? 'Waiting_For_Submission' : 'Lead_Routed_To_Mobile'}
          </p>
        </div>
      </div>
    </div>
  );
}