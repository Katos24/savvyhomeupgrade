'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, ChevronRight, Zap } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

interface FeatureStep {
  title: string;
  desc: string;
  color: string;
  image?: string;
  icon: React.ReactNode;
}

const STEPS: FeatureStep[] = [
  { 
    title: 'Lead lands on your board',  
    desc: 'Name, contact, and job photos captured instantly. No manual entry, no hunting through messy text threads.', 
    color: '#22c55e',
    icon: <Zap size={18} />
  },
  { 
    title: 'Schedule with one click',   
    desc: 'Pick a date and assign your crew. Send a branded confirmation so the customer knows when you\'re coming.', 
    color: '#3b82f6',
    image: '/images/schedule-send.webp', 
    icon: <Calendar size={18} />
  },
  { 
    title: 'Send a professional quote',   
    desc: 'One tap sends a branded quote. Customers can accept or decline right from their inbox.', 
    color: '#10b981',
    image: '/images/quote-send-tablet.webp', 
    icon: <FileText size={18} />
  },
  { 
    title: 'Collect payment & close',   
    desc: 'Automated reminders for unpaid balances. Every email is logged so you know exactly what\'s outstanding.', 
    color: '#f59e0b',
    image: '/images/payment-send.webp', 
    icon: <Wallet size={18} />
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);
  const isPhoneHero = activeTab === 0;

  return (
    <section className="py-12 lg:py-24 px-4 sm:px-6 bg-[#020617] border-y border-white/5">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* VISUAL STAGE */}
          <div className="w-full flex items-center justify-center order-1 min-h-[320px] sm:min-h-[480px]">

            {isPhoneHero && (
              <div className="flex justify-center w-full">
                <CyclingPhoneMockup visible={true} hideIndicators={false} />
              </div>
            )}

            {!isPhoneHero && STEPS[activeTab].image && (
              <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f172a] shadow-xl shadow-black/40 group cursor-pointer">
                <img
                  key={activeTab}
                  src={STEPS[activeTab].image}
                  alt={STEPS[activeTab].title}
                  className="w-full h-auto object-cover aspect-[4/3] animate-in fade-in zoom-in-95 duration-500 transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
            )}
          </div>

          {/* ACCORDION */}
          <div className="w-full space-y-3 order-2">
            {STEPS.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left p-5 lg:p-7 rounded-2xl border transition-all duration-300 outline-none ${
                    isActive
                      ? 'bg-white border-white/20 shadow-lg shadow-black/30 translate-x-1 lg:translate-x-2'
                      : 'bg-white/8 border-white/5 hover:border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4 lg:gap-6">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isActive ? 'text-white' : 'bg-white/5 text-white/30'
                      }`}
                      style={{ background: isActive ? item.color : '' }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-lg lg:text-xl font-black tracking-tight transition-colors ${
                          isActive ? 'text-slate-900' : 'text-white/30'
                        }`}>
                          {item.title}
                        </h3>
                        <ChevronRight
                          className={`transition-transform duration-300 shrink-0 ml-2 ${
                            isActive ? 'rotate-90 text-[#1a6645]' : 'text-white/10'
                          }`}
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