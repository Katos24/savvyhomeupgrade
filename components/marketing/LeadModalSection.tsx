'use client';

import { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Wallet, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

const STEPS = [
  { 
    step: '01', 
    title: 'Lead lands on your board',  
    desc: 'Name, contact, and job photos captured instantly. No manual entry, no hunting through messy text threads.', 
    color: '#1a6645',
    image: '/images/modal-overview2.webp', // Use .webp for speed
    icon: <Zap size={18} />
  },
  { 
    step: '02', 
    title: 'Schedule with one click',   
    desc: 'Pick a date and assign your crew. Send a branded confirmation so the customer knows when you’re coming.', 
    color: '#3b82f6',
    image: '/images/schedule-send.webp', 
    icon: <Calendar size={18} />
  },
  { 
    step: '03', 
    title: 'Send a professional quote',   
    desc: 'One tap sends a branded quote. Customers can accept or decline right from their inbox. No more PDF hunting.', 
    color: '#10b981',
    image: '/images/quote-send-tablet.webp', 
    icon: <FileText size={18} />
  },
  { 
    step: '04', 
    title: 'Collect payment & close',   
    desc: 'Automated reminders for unpaid balances. Every email is logged so you know exactly what’s outstanding.', 
    color: '#f59e0b',
    image: '/images/payment-send.webp', 
    icon: <Wallet size={18} />
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section 
      id="features" 
      className="py-12 lg:py-24 px-4 sm:px-6 border-y"
      style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 mb-4">
            <CheckCircle2 size={12} className="text-green-700" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">The Field Command Center</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] lg:leading-[0.95] text-slate-900 mb-4 tracking-[-0.04em]">
            The only job card<br />
            <span className="text-[#1a6645]">you'll ever need.</span>
          </h2>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          
          {/* TOP (Mobile) / LEFT (Desktop) — DYNAMIC VISUALS */}
          <div className="w-full relative lg:sticky lg:top-24 h-fit order-1">
            <div className="absolute -inset-4 rounded-[32px] blur-2xl -z-10 bg-[#1a6645]/5" />
            
            <div className="relative rounded-xl lg:rounded-[2.5rem] overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all duration-500">
              <img 
                key={activeTab} 
                src={STEPS[activeTab].image} 
                alt={STEPS[activeTab].title} 
                className="w-full h-auto block animate-in fade-in slide-in-from-bottom-2 duration-500 aspect-[4/3] object-cover" 
              />
            </div>

            {/* Phone Mockup — Hidden on very small phones to avoid clutter, shown on Desktop */}
            <div 
              className={`absolute -bottom-6 -left-4 lg:-bottom-10 lg:-left-8 z-20 scale-[0.5] sm:scale-[0.6] lg:scale-[0.75] origin-bottom-left filter drop-shadow-2xl transition-all duration-500 ${
                activeTab === 0 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <CyclingPhoneMockup visible={activeTab === 0} hideIndicators />
            </div>

          
          </div>

          {/* BOTTOM (Mobile) / RIGHT (Desktop) — INTERACTIVE ACCORDION */}
          <div className="w-full flex flex-col gap-3 lg:gap-4 order-2 mt-8 lg:mt-0">
            {STEPS.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left group p-4 lg:p-6 rounded-xl lg:rounded-2xl border transition-all duration-300 outline-none ${
                    isActive 
                    ? 'bg-white border-slate-200 shadow-md translate-x-1 lg:translate-x-2' 
                    : 'bg-transparent border-transparent hover:bg-slate-200/50'
                  }`}
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div 
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isActive ? 'text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                      style={{ background: isActive ? item.color : '' }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-black text-[14px] lg:text-[16px] transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.title}
                        </p>
                        <ChevronRight 
                          className={`transition-all duration-300 ${isActive ? 'rotate-90 text-slate-900' : 'text-slate-300 group-hover:text-slate-400'}`} 
                          size={14} 
                        />
                      </div>
                      <div className={`grid transition-all duration-300 overflow-hidden ${
                        isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <p className="text-slate-500 text-[13px] lg:text-sm font-medium leading-relaxed overflow-hidden">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}