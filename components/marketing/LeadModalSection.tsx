'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, Zap, Sparkles } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const STEPS = [
  {
    title: 'Lead Lands',
    fullTitle: 'Lead lands on your board',
    desc: 'Name, contact, and job photos captured instantly. No manual entry.',
    color: '#10b981',
    icon: <Zap size={18} />,
    screenIdx: 0
  },
  {
    title: 'Schedule',
    fullTitle: 'Schedule with one click',
    desc: 'Pick a date and assign your crew. Branded confirmation goes out automatically.',
    color: '#3b82f6',
    icon: <Calendar size={18} />,
    screenIdx: 1
  },
  {
    title: 'Quote',
    fullTitle: 'Send a professional quote',
    desc: 'One tap sends a branded quote. Customers can accept right from their inbox.',
    color: '#8b5cf6',
    icon: <FileText size={18} />,
    screenIdx: 2
  },
  {
    title: 'Payment',
    fullTitle: 'Collect payment & close',
    desc: 'Automated reminders for unpaid balances. Mark paid in one tap.',
    color: '#f59e0b',
    icon: <Wallet size={18} />,
    screenIdx: 3
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-12 lg:py-36 bg-slate-50 overflow-hidden">

      {/* ─── BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />

        {/* Main dynamic spotlight behind phone */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[120px] opacity-20 transition-colors duration-700"
          style={{ backgroundColor: STEPS[activeTab].color }}
        />

        {/* Ambient glow top-right */}
        <div className="absolute -top-40 right-[-200px] w-[520px] h-[520px] bg-blue-500/10 blur-[140px] rounded-full" />

        {/* Ambient glow bottom-left */}
        <div className="absolute -bottom-60 left-[-200px] w-[620px] h-[620px] bg-purple-500/10 blur-[160px] rounded-full" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* ─── HEADLINE ─── */}
        <div className="max-w-3xl mb-10 lg:mb-20 text-center lg:text-left">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest mb-4">
            Operations
          </div>

          <h2 className="text-4xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-6">
            From first scan <br />
            <span className="text-emerald-600 italic font-serif">
              to final payday.
            </span>
          </h2>
        </div>

        {/* ─── MOBILE TAB ROW ─── */}
        <div className="flex lg:hidden justify-between items-center bg-white p-2 rounded-3xl border border-slate-200 shadow-sm mb-8">
          {STEPS.map((step, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${
                activeTab === i
                  ? 'bg-slate-900 text-white shadow-lg scale-105'
                  : 'text-slate-400'
              }`}
            >
              <div style={{ color: activeTab === i ? '#fff' : step.color }}>
                {step.icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">
                {step.title}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 items-start">

          {/* ─── LEFT CONTENT ─── */}
          <div className="lg:col-span-6 order-2 lg:order-1">

            {/* Mobile text */}
            <div className="lg:hidden text-center mb-4 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                {STEPS[activeTab].fullTitle}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {STEPS[activeTab].desc}
              </p>
            </div>

            {/* Desktop accordion */}
            <div className="hidden lg:flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveTab(i)}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-8 rounded-[2.5rem] transition-all duration-500 border ${
                    activeTab === i
                      ? 'bg-white border-slate-200 shadow-xl translate-x-4 scale-[1.02]'
                      : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-6">

                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 ${
                        activeTab === i
                          ? 'text-white shadow-lg rotate-6'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                      style={{
                        backgroundColor: activeTab === i ? step.color : ''
                      }}
                    >
                      {step.icon}
                    </div>

                    <div className="flex-1">
                      <h4 className={`text-2xl font-black tracking-tight ${
                        activeTab === i ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {step.fullTitle}
                      </h4>

                      <div className={`grid transition-all duration-500 ${
                        activeTab === i
                          ? 'grid-rows-[1fr] opacity-100 mt-3'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <p className="text-slate-500 text-base font-medium leading-relaxed overflow-hidden">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── PHONE ─── */}
          <div className="lg:col-span-6 flex justify-center order-1 lg:order-2 lg:sticky lg:top-32">

            <div className="relative w-full max-w-[280px] sm:max-w-[320px]">

              {/* glow tied to active step */}
              <div
                className="absolute inset-0 blur-[90px] opacity-25 transition-colors duration-700"
                style={{ backgroundColor: STEPS[activeTab].color }}
              />

              {/* phone shell */}
              <div className="relative bg-[#020617] p-4 sm:p-8 rounded-[3rem] sm:rounded-[4rem] shadow-2xl border border-slate-800">

                <div className="flex flex-col items-center">

                  {/* badge */}
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 mb-6">
                    <Sparkles size={10} className="text-emerald-400" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">
                      Preview: {STEPS[activeTab].title}
                    </span>
                  </div>

                  {/* mockup */}
                  <div className="scale-[0.85] sm:scale-100 origin-top transition-transform duration-500">
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