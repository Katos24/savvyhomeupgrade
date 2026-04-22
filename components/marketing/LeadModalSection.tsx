'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, Zap, Sparkles } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const STEPS = [
  {
    title: 'Lead',
    fullTitle: 'Lead lands on your board',
    desc: 'Name, contact, and job photos captured instantly. No manual entry required.',
    color: '#10b981',
    icon: <Zap size={16} />,
    screenIdx: 0
  },
  {
    title: 'Schedule',
    fullTitle: 'Schedule with one click',
    desc: 'Pick a date and assign your crew. Branded confirmation goes out automatically.',
    color: '#3b82f6',
    icon: <Calendar size={16} />,
    screenIdx: 1
  },
  {
    title: 'Quote',
    fullTitle: 'Send a professional quote',
    desc: 'One tap sends a branded quote. Customers can accept right from their inbox.',
    color: '#8b5cf6',
    icon: <FileText size={16} />,
    screenIdx: 2
  },
  {
    title: 'Pay',
    fullTitle: 'Collect payment & close',
    desc: 'Automated reminders for unpaid balances. Mark paid in one tap.',
    color: '#f59e0b',
    icon: <Wallet size={16} />,
    screenIdx: 3
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-12 lg:py-36 bg-slate-50 overflow-hidden">
      
      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        {/* Rapid color transition for background spotlight */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square rounded-full blur-[100px] opacity-10 transition-colors duration-300"
          style={{ backgroundColor: STEPS[activeTab].color }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-6 relative z-10">

        {/* ─── HEADLINE ─── */}
        <div className="max-w-3xl mb-8 lg:mb-20 text-center lg:text-left">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest mb-4">
            Operations
          </div>
          <h2 className="text-[2.5rem] lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4 sm:mb-6">
            From first scan <br />
            <span className="text-emerald-600 italic font-serif">to final payday.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-24 items-start">

          {/* ─── MOBILE: TAB CONTROL + TEXT (ORDER 1) ─── */}
          <div className="lg:hidden order-1 w-full space-y-6">
            {/* Nav Row */}
            <div className="flex justify-between items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              {STEPS.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
                    activeTab === i ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'
                  }`}
                >
                  <div 
                    style={{ color: activeTab === i ? '#fff' : step.color }} 
                    className="transition-colors duration-200"
                  >
                    {step.icon}
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-tighter">{step.title}</span>
                </button>
              ))}
            </div>

            {/* Description Area (Min-height keeps phone from jumping) */}
            <div className="text-center min-h-[90px] flex flex-col justify-center">
              <h3 className="text-xl font-black text-slate-900 mb-1 transition-all duration-200">
                {STEPS[activeTab].fullTitle}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                {STEPS[activeTab].desc}
              </p>
            </div>
          </div>

          {/* ─── DESKTOP: ACCORDION (ORDER 1) ─── */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-3 order-1">
            {STEPS.map((step, i) => (
              <button
                key={i}
                onMouseEnter={() => setActiveTab(i)}
                className={`w-full text-left p-7 rounded-[2.5rem] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] border ${
                  activeTab === i
                    ? 'bg-white border-slate-200 shadow-xl translate-x-6 scale-[1.03]'
                    : 'bg-transparent border-transparent opacity-30 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      activeTab === i ? 'text-white shadow-lg rotate-3' : 'bg-slate-200 text-slate-500'
                    }`}
                    style={{ backgroundColor: activeTab === i ? step.color : '' }}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-black tracking-tight transition-colors duration-200 ${activeTab === i ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.fullTitle}
                    </h4>
                    <div className={`grid transition-all duration-300 ${activeTab === i ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed overflow-hidden">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ─── PHONE VISUAL (ORDER 2) ─── */}
          <div className="lg:col-span-6 flex justify-center order-2 lg:sticky lg:top-32 mt-4 lg:mt-0">
            <div className="relative w-full max-w-[260px] sm:max-w-[320px]">
              
              {/* Faster Glow Response */}
              <div
                className="absolute inset-0 blur-[60px] opacity-20 transition-colors duration-300"
                style={{ backgroundColor: STEPS[activeTab].color }}
              />

              <div className="relative bg-[#020617] p-5 lg:p-7 rounded-[3rem] lg:rounded-[4rem] shadow-2xl border border-slate-800">
                <div className="flex flex-col items-center">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-6">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-pulse" 
                      style={{ backgroundColor: STEPS[activeTab].color }}
                    />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                      Live Preview
                    </span>
                  </div>

                  {/* Mockup - duration reduced for snapiness */}
                  <div className="scale-[0.9] sm:scale-100 origin-top transition-transform duration-300">
                    <CyclingPhoneMockup
                      visible={true}
                      hideIndicators={true}
                      activeTab={STEPS[activeTab].screenIdx}
                      phase={activeTab}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}