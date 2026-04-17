'use client';

import { useState } from 'react';
import { 
  Calendar, 
  FileText, 
  Wallet, 
  ChevronRight,
  Zap
} from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

// Define the type for our steps to keep TS happy
interface FeatureStep {
  title: string;
  desc: string;
  color: string;
  image?: string; // Optional string, avoids the 'null' error
  icon: React.ReactNode;
}

const STEPS: FeatureStep[] = [
  { 
    title: 'Lead lands on your board',  
    desc: 'Name, contact, and job photos captured instantly. No manual entry, no hunting through messy text threads.', 
    color: '#1a6645',
    image: undefined, // Phone is the hero for step 1
    icon: <Zap size={18} />
  },
  { 
    title: 'Schedule with one click',   
    desc: 'Pick a date and assign your crew. Send a branded confirmation so the customer knows when you’re coming.', 
    color: '#3b82f6',
    image: '/images/schedule-send.webp', 
    icon: <Calendar size={18} />
  },
  { 
    title: 'Send a professional quote',   
    desc: 'One tap sends a branded quote. Customers can accept or decline right from their inbox. No more PDF hunting.', 
    color: '#10b981',
    image: '/images/quote-send-tablet.webp', 
    icon: <FileText size={18} />
  },
  { 
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
    <section className="py-12 lg:py-24 px-4 sm:px-6 bg-[#F7F5F0] border-y border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Tight & Impactful */}
        <div className="text-center mb-12 lg:mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[0.9] text-slate-900 tracking-[-0.05em]">
            The only job card<br />
            <span className="text-[#1a6645]">you'll ever need.</span>
          </h2>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* VISUAL STAGE */}
          <div className="w-full relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex items-center justify-center order-1">
            
            {/* SaaS UI Panel (Steps 2, 3, 4) */}
            <div className={`relative w-full transition-all duration-700 ease-in-out ${
              activeTab === 0 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            }`}>
              <div className="rounded-[2rem] lg:rounded-[3rem] overflow-hidden border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                {STEPS[activeTab].image && (
                  <img 
                    key={activeTab} 
                    src={STEPS[activeTab].image} 
                    alt={STEPS[activeTab].title} 
                    className="w-full h-auto object-cover object-center scale-110 animate-in fade-in zoom-in-95 duration-500 aspect-[4/3]" 
                  />
                )}
              </div>
            </div>

            {/* CYCLING PHONE - Dynamic Positioning */}
            <div 
              className={`absolute z-20 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
                activeTab === 0 
                  ? 'scale-[1.1] sm:scale-[1.3] lg:scale-[1.4] translate-x-0 translate-y-0' 
                  : 'scale-[0.5] sm:scale-[0.6] lg:scale-[0.7] -bottom-10 -left-6 lg:-bottom-12 lg:-left-12 origin-bottom-left'
              }`}
            >
              <CyclingPhoneMockup visible={true} hideIndicators={activeTab !== 0} />
            </div>

            {/* Decorative Atmosphere Glow for Phone Hero */}
            {activeTab === 0 && (
              <div className="absolute inset-0 bg-[#1a6645]/5 blur-[100px] rounded-full animate-pulse -z-10" />
            )}
          </div>

          {/* INTERACTIVE ACCORDION */}
          <div className="w-full space-y-3 order-2">
            {STEPS.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-5 lg:p-7 rounded-2xl border-2 transition-all duration-300 outline-none ${
                    isActive 
                    ? 'bg-white border-[#1a6645] shadow-xl translate-x-1 lg:translate-x-2' 
                    : 'bg-white/40 border-transparent hover:border-slate-200 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-start gap-4 lg:gap-6">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isActive ? 'text-white rotate-[360deg]' : 'bg-slate-100 text-slate-400'
                      }`}
                      style={{ background: isActive ? item.color : '' }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-lg lg:text-xl font-black tracking-tight transition-colors ${
                          isActive ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          {item.title}
                        </h3>
                        <ChevronRight 
                          className={`transition-transform duration-300 ${isActive ? 'rotate-90 text-[#1a6645]' : 'text-slate-300'}`} 
                          size={20} 
                        />
                      </div>
                      <div className={`grid transition-all duration-500 ${
                        isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <p className="text-slate-600 text-sm lg:text-base font-medium leading-relaxed overflow-hidden">
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