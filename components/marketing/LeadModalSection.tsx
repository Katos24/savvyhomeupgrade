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
    color: '#1a6645',
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
    <section className="py-8 lg:py-14 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-20 items-center">

          {/* Visual — left */}
          <div className="w-full flex items-center justify-center min-h-[420px]">
            {isPhoneHero ? (
              <CyclingPhoneMockup visible={true} hideIndicators={false} />
            ) : (
              STEPS[activeTab].image && (
                <div className="w-full rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200 group cursor-pointer">
                  <img
                    key={activeTab}
                    src={STEPS[activeTab].image}
                    alt={STEPS[activeTab].title}
                    className="w-full h-auto object-cover aspect-[4/3] animate-in fade-in zoom-in-75 duration-500 transition-transform duration-700 ease-out group-hover:scale-110 scale-110"
                  />
                </div>
              )
            )}
          </div>

          {/* Accordion — right */}
          <div className="w-full space-y-1">
            {STEPS.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className="w-full text-left outline-none group"
                >
                  <div className={`flex items-start gap-5 py-5 border-b border-slate-100 transition-all duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-40 hover:opacity-60'
                  }`}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white mt-0.5"
                      style={{ background: isActive ? item.color : '#e2e8f0' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <ChevronRight
                          className={`transition-transform duration-300 shrink-0 ml-3 text-slate-300 ${isActive ? 'rotate-90' : ''}`}
                          size={18}
                        />
                      </div>
                      {isActive && (
                        <div className="h-0.5 w-10 rounded-full mt-1 mb-3" style={{ background: item.color }} />
                      )}
                      <div className={`grid transition-all duration-500 ${
                        isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}>
                        <p className="text-slate-500 text-base font-normal leading-relaxed overflow-hidden">
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

        {/* MOBILE */}
        <div className="lg:hidden space-y-0">
          {STEPS.map((item, i) => {
            const isActive = activeTab === i;
            return (
              <div key={i} className="border-b border-slate-100">
                <button
                  onClick={() => setActiveTab(i)}
                  className="w-full text-left outline-none py-4"
                >
                  <div className={`flex items-center gap-4 transition-opacity duration-200 ${
                    isActive ? 'opacity-100' : 'opacity-40'
                  }`}>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isActive ? item.color : '#e2e8f0' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 flex-1 leading-snug">
                      {item.title}
                    </h3>
                    <ChevronRight
                      className={`transition-transform duration-300 shrink-0 text-slate-300 ${isActive ? 'rotate-90' : ''}`}
                      size={18}
                    />
                  </div>
                </button>

                <div className={`grid transition-all duration-500 ${
                  isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}>
                  <div className="overflow-hidden">
                    {isActive && (
                      <div className="h-0.5 w-8 rounded-full mb-3" style={{ background: item.color }} />
                    )}
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                      {item.desc}
                    </p>
                    {i === 0 ? (
                      <div className="flex justify-center pb-5">
                        <div className="scale-90 origin-top">
                          <CyclingPhoneMockup visible={isActive} hideIndicators={false} />
                        </div>
                      </div>
                    ) : (
                      item.image && (
                        <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-lg mb-5 group">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-auto object-cover aspect-[4/3] scale-110 transition-transform duration-700 ease-out group-hover:scale-125"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}