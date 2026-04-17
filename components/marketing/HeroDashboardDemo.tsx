'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, ArrowRight, Camera } from 'lucide-react';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

function DashboardPhone({ leadVisible }: { leadVisible: boolean }) {
  const existingLeads = [
    { name: 'Marcus Thornton', status: 'Contacted', color: '#f59e0b', amount: '$7,950' },
    { name: 'David Reyes', status: 'Scheduled', color: '#3b82f6', amount: '$2,400' },
    { name: 'Sarah Kim', status: 'Won', color: '#10b981', amount: '$5,200' },
  ];

  return (
    <div className="relative w-[260px] h-[480px]">
      <div className="relative w-full h-full rounded-[3rem] border-[8px] border-[#0f172a] bg-[#020617] shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center pt-1.5 z-30">
          <div className="w-16 h-4 bg-black rounded-full" />
        </div>

        <div className="absolute inset-0 pt-8 flex flex-col">
          {/* Dashboard Header */}
          <div className="px-4 pt-4 pb-3 border-b border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Live Board</p>
            <p className="text-base font-black text-white">Inbound Pipeline</p>
          </div>

          {/* Lead list */}
          <div className="px-3 pt-4 space-y-2 flex-1 overflow-hidden">
            {/* The "New" Lead that pops in */}
            <div
              className="rounded-2xl border-2 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: leadVisible ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                borderColor: leadVisible ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.05)',
                opacity: leadVisible ? 1 : 0,
                transform: leadVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              }}
            >
              {leadVisible && (
                <div className="relative w-full h-12 overflow-hidden">
                  <img src="/images/roof-damage.webp" alt="damage" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-[7px] font-black text-white">NEW</div>
                </div>
              )}
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="w-1 h-7 rounded-full shrink-0 bg-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white truncate">Jason Merritt</p>
                  <p className="text-[8px] text-white/40 font-bold uppercase">Just Now</p>
                </div>
              </div>
            </div>

            {existingLeads.map((lead, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.03] opacity-40">
                <div className="w-1 h-5 rounded-full shrink-0" style={{ background: lead.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">{lead.name}</p>
                </div>
                <p className="text-[10px] font-black text-white/40">{lead.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroDashboardDemo() {
  const [leadVisible, setLeadVisible] = useState(false);
  const [arrowPulse, setArrowPulse] = useState(false);

  useEffect(() => {
    const run = () => {
      setLeadVisible(false);
      setArrowPulse(false);
      setTimeout(() => setArrowPulse(true), 3000);
      setTimeout(() => { setLeadVisible(true); setArrowPulse(false); }, 4000);
      setTimeout(run, 9000);
    };
    run();
  }, []);

  return (
    <div className="relative w-full max-w-[600px] flex flex-col items-center">
      <div className="flex justify-between w-full mb-8 px-8">
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!leadVisible ? 'text-emerald-600' : 'text-slate-400'}`}>1. Scan</span>
        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${leadVisible ? 'text-blue-500 animate-bounce' : 'text-slate-400'}`}>2. Win</span>
      </div>

      <div className="flex items-center justify-center scale-[0.8] sm:scale-100 origin-center">
        <div className="relative z-20"><FastDemoForm autoPlay /></div>
        <div className={`mx-[-20px] z-30 transition-all duration-500 ${arrowPulse ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}>
          <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-2xl">
            <ArrowRight size={24} className="text-white" />
          </div>
        </div>
        <div className="relative z-10"><DashboardPhone leadVisible={leadVisible} /></div>
      </div>
    </div>
  );
}