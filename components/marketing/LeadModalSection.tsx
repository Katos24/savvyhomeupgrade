'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, Zap, ChevronRight, Activity } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const STEPS = [
  {
    title: 'Lead',
    fullTitle: 'Leads Hit Your Board',
    desc: 'Instant capture from QR scans or forms. No manual typing required.',
    color: '#fbbf24', 
    icon: <Zap size={20} strokeWidth={3} />,
    screenIdx: 0
  },
  {
    title: 'Schedule',
    fullTitle: 'One-Tap Dispatch',
    desc: 'Assign your crew and lock the date. The system blasts confirmations.',
    color: '#3b82f6', 
    icon: <Calendar size={20} strokeWidth={3} />,
    screenIdx: 1
  },
  {
    title: 'Quote',
    fullTitle: 'High-Speed Quoting',
    desc: 'Send professional quotes before you even leave the driveway.',
    color: '#a855f7', 
    icon: <FileText size={20} strokeWidth={3} />,
    screenIdx: 2
  },
  {
    title: 'Pay',
    fullTitle: 'Automated Collections',
    desc: 'Stop chasing checks. Automated reminders ensure you get paid.',
    color: '#10b981', 
    icon: <Wallet size={20} strokeWidth={3} />,
    screenIdx: 3
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-12 lg:py-20 bg-white overflow-hidden border-t-[12px] border-slate-950">
      
      {/* Industrial Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `radial-gradient(#000 2px, transparent 2px)`, backgroundSize: '24px 24px' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ─── TIGHTENED TOP NAV / STATUS BAR ─── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 border-b-4 border-slate-950 pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-3 py-1 mb-4 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              <Activity size={12} strokeWidth={3} />
              <p className="text-[10px] font-[1000] uppercase tracking-widest italic">System Workflow</p>
            </div>
            <h2 className="text-4xl lg:text-7xl font-[1000] text-slate-950 tracking-tighter uppercase italic leading-[0.85]">
              First Scan <span className="text-slate-300">to</span> Final Payday.
            </h2>
          </div>
          
          <div className="hidden lg:block text-right">
            <p className="text-sm font-black text-emerald-500 uppercase italic tracking-tighter">Optimized & Active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">

          {/* ─── MOBILE: COMPACT TABS ─── */}
          <div className="lg:hidden w-full space-y-6">
            <div className="grid grid-cols-4 bg-slate-950 p-1 border-2 border-slate-950 shadow-[4px_4px_0px_#000]">
              {STEPS.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex flex-col items-center gap-1 py-3 transition-all ${
                    activeTab === i ? 'bg-yellow-400 text-slate-950' : 'text-slate-500'
                  }`}
                >
                  {step.icon}
                  <span className="text-[8px] font-black uppercase tracking-tighter">{step.title}</span>
                </button>
              ))}
            </div>
            <div className="bg-slate-50 border-2 border-slate-950 p-5 rounded-2xl">
               <h3 className="text-xl font-[1000] text-slate-950 uppercase italic mb-1">{STEPS[activeTab].fullTitle}</h3>
               <p className="text-slate-600 text-sm font-bold leading-tight italic">"{STEPS[activeTab].desc}"</p>
            </div>
          </div>

          {/* ─── DESKTOP: LIST ─── */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
            {STEPS.map((step, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onMouseEnter={() => setActiveTab(i)}
                  className={`group relative w-full text-left px-6 py-5 transition-all duration-200 border-l-[6px] ${
                    isActive
                      ? 'bg-slate-950 border-yellow-400 translate-x-2'
                      : 'bg-white border-slate-200 opacity-60 hover:opacity-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`${isActive ? 'text-yellow-400' : 'text-slate-400'}`}>
                      {step.icon}
                    </div>
                    <div>
                      <h4 className={`text-xl font-[1000] uppercase italic tracking-tighter leading-none ${isActive ? 'text-white' : 'text-slate-950'}`}>
                        {step.fullTitle}
                      </h4>
                      {isActive && (
                        <p className="text-slate-400 text-xs font-bold mt-2 leading-snug max-w-[280px]">
                          {step.desc}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ─── PHONE VISUAL (LOWERED & INTEGRATED) ─── */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end lg:pr-12">
            <div className="relative w-full max-w-[300px] lg:max-w-[360px]">
              
              {/* Device Frame */}
              <div className="relative bg-slate-950 p-4 lg:p-6 rounded-[3rem] shadow-[20px_20px_0px_#facc15] border-[6px] border-slate-900">
                
                {/* Internal HUD */}
                <div className="flex items-center justify-between mb-4 px-4">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-600" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                        DEVICE_LINK::ESTABLISHED
                    </span>
                </div>

                {/* Mockup Screen */}
                <div className="bg-white rounded-[1.8rem] overflow-hidden border-4 border-slate-950">
                    <div className="scale-95 origin-top transition-all duration-500">
                        <CyclingPhoneMockup
                            visible={true}
                            hideIndicators={true}
                            activeTab={STEPS[activeTab].screenIdx}
                        />
                    </div>
                </div>
              </div>

              {/* Background Detail */}
              <div className="absolute -top-6 -right-6 w-24 h-24 opacity-5 pointer-events-none" 
                   style={{ backgroundImage: `repeating-linear-gradient(0deg, #000, #000 2px, transparent 2px, transparent 8px)` }} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}