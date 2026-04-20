'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const STEPS = [
  {
    title: 'Lead lands on your board',
    desc: 'Name, contact, and job photos captured instantly. No manual entry, no hunting through messy text threads.',
    color: '#10b981', // Emerald
    icon: <Zap size={18} />,
    screenIdx: 0
  },
  {
    title: 'Schedule with one click',
    desc: "Pick a date and assign your crew. A branded confirmation email goes out automatically — the customer knows exactly when you're coming.",
    color: '#3b82f6', // Blue
    icon: <Calendar size={18} />,
    screenIdx: 1
  },
  {
    title: 'Send a professional quote',
    desc: 'One tap sends a branded quote with line items. Customers can accept or decline right from their inbox.',
    color: '#8b5cf6', // Violet
    icon: <FileText size={18} />,
    screenIdx: 2
  },
  {
    title: 'Collect payment & close',
    desc: "Automated reminders for unpaid balances. Mark paid in one tap, and a receipt goes out instantly. Every email is logged.",
    color: '#f59e0b', // Amber
    icon: <Wallet size={18} />,
    screenIdx: 3
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-24 lg:py-36 bg-slate-50 overflow-hidden">
      {/* ─── BACKGROUND ARCHITECTURE ─── */}
      {/* Subtle Grid Pattern to break the "All White" look */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")` }} 
      />
      
      {/* Dynamic Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-20 transition-colors duration-1000 pointer-events-none"
        style={{ backgroundColor: STEPS[activeTab].color }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* ─── LEFT: THE PHONE DISPLAY (The Dark Anchor) ─── */}
          <div className="lg:col-span-6 order-2 lg:order-1 flex justify-center">
            <div className="relative group">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-4 bg-gradient-to-b from-slate-200 to-transparent rounded-[5rem] blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
              
              {/* The "Command Center" Phone Housing */}
              <div className="relative bg-[#020617] p-6 sm:p-10 rounded-[4.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-800">
                 <div className="flex flex-col items-center">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-10">
                      <Sparkles size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        Workflow Stage {activeTab + 1}
                      </span>
                    </div>

                    <div className="scale-105 sm:scale-110 origin-center transition-transform duration-500">
                      <CyclingPhoneMockup 
                        visible={true} 
                        hideIndicators={true} 
                        activeTab={STEPS[activeTab].screenIdx}
                      />
                    </div>
                 </div>
              </div>

         
            </div>
          </div>

          {/* ─── RIGHT: THE CONTENT ACCORDION ─── */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="mb-14">
              <div className="inline-block px-3 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest mb-4">
                Operations
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">
                From first scan <br />
                <span className="text-emerald-600 italic font-serif">to final payday.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium max-w-lg leading-relaxed">
                We’ve automated the boring parts of contracting. No more messy paperwork or late-night manual data entry.
              </p>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveTab(i)}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-6 sm:p-8 rounded-[2.5rem] transition-all duration-500 border ${
                    activeTab === i 
                    ? 'bg-white border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] translate-x-4 scale-[1.02]' 
                    : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div 
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 ${activeTab === i ? 'text-white shadow-xl rotate-6 scale-110' : 'bg-slate-200 text-slate-500'}`}
                      style={{ backgroundColor: activeTab === i ? step.color : '' }}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-2xl font-black tracking-tight ${activeTab === i ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </h4>
                      <div className={`grid transition-all duration-500 ${activeTab === i ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="text-slate-500 text-base font-medium leading-relaxed overflow-hidden">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={24} className={`transition-all duration-500 ${activeTab === i ? 'rotate-90 text-slate-900' : 'text-slate-300 opacity-0'}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}