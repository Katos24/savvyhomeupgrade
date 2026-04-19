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
    icon: <Zap size={18} />,
  },
  {
    title: 'Schedule with one click',
    desc: "Pick a date and assign your crew. Send a branded confirmation so the customer knows when you're coming.",
    color: '#3b82f6',
    image: '/images/schedule-send.webp',
    icon: <Calendar size={18} />,
  },
  {
    title: 'Send a professional quote',
    desc: 'One tap sends a branded quote. Customers can accept or decline right from their inbox.',
    color: '#10b981',
    image: '/images/quote-send-tablet.webp',
    icon: <FileText size={18} />,
  },
  {
    title: 'Collect payment & close',
    desc: "Automated reminders for unpaid balances. Every email is logged so you know exactly what's outstanding.",
    color: '#f59e0b',
    image: '/images/payment-send.webp',
    icon: <Wallet size={18} />,
  },
];

function PhoneBackground({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className="relative w-full flex items-center justify-center overflow-hidden rounded-[2rem]"
      style={{ minHeight: compact ? 420 : 560 }}
    >
      {/* Base */}
      <div className="absolute inset-0 bg-[#060d18]" />

      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="rounded-full"
          style={{
            width: compact ? 260 : 340,
            height: compact ? 260 : 340,
            background: 'radial-gradient(ellipse at center, rgba(26,102,69,0.45) 0%, rgba(16,185,129,0.12) 50%, transparent 72%)',
            animation: 'pulsering 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.18,
          backgroundImage: 'radial-gradient(circle, #86efac 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Rotating dashed ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '50%', left: '50%',
          width: compact ? 220 : 300,
          height: compact ? 220 : 300,
          marginTop: compact ? -110 : -150,
          marginLeft: compact ? -110 : -150,
          border: '1px dashed rgba(255,255,255,0.06)',
          animation: 'rotatering 20s linear infinite',
        }}
      />

      {/* Teal circle ring — top left */}
      <div className="absolute pointer-events-none rounded-full" style={{ top: -20, left: -20, width: 140, height: 140, border: '2px solid rgba(20,184,166,0.25)', animation: 'float1 7s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none rounded-full" style={{ top: 0, left: 0, width: 90, height: 90, border: '1px solid rgba(20,184,166,0.15)', animation: 'float1 7s ease-in-out infinite' }} />

      {/* Emerald circle — top right */}
      <div className="absolute pointer-events-none rounded-full" style={{ top: 24, right: 36, width: 44, height: 44, background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.35)', animation: 'float2 6s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none rounded-full" style={{ top: 36, right: 50, width: 16, height: 16, background: 'rgba(16,185,129,0.35)', animation: 'float2 6s ease-in-out infinite' }} />

      {/* Blue rotating square — top right */}
      <div className="absolute pointer-events-none" style={{ top: 52, right: 16, width: 30, height: 30, border: '2px solid rgba(59,130,246,0.35)', borderRadius: 5, animation: 'float3 9s ease-in-out infinite' }} />

      {/* Blue diamond — mid right */}
      <div className="absolute pointer-events-none" style={{ top: '45%', right: 20, width: 24, height: 24, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', transform: 'rotate(45deg)', animation: 'float4 8s ease-in-out infinite' }} />

      {/* Amber dots — bottom right */}
      <div className="absolute pointer-events-none flex gap-[6px]" style={{ bottom: 60, right: 32, animation: 'float2 5s ease-in-out infinite' }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(245,158,11,0.5)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(245,158,11,0.3)', marginTop: 3 }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(245,158,11,0.4)' }} />
      </div>

      {/* Large faint ring — bottom left */}
      <div className="absolute pointer-events-none rounded-full" style={{ bottom: -50, left: -30, width: 180, height: 180, border: '1.5px solid rgba(99,102,241,0.2)', animation: 'float5 11s ease-in-out infinite' }} />

      {/* Purple square — bottom left */}
      <div className="absolute pointer-events-none" style={{ bottom: 80, left: 24, width: 18, height: 18, border: '2px solid rgba(139,92,246,0.45)', borderRadius: 4, animation: 'float3 10s ease-in-out infinite 1s' }} />

      {/* Emerald pill — left */}
      <div className="absolute pointer-events-none" style={{ left: 18, top: '50%', transform: 'translateY(-50%)', width: 8, height: 38, borderRadius: 8, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', animation: 'float1 8s ease-in-out infinite 0.5s' }} />

      {/* Scan line */}
      <div
        className="absolute inset-x-0 h-[1px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.4), transparent)', animation: 'scanline 5s ease-in-out infinite' }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(4,8,18,0.8) 100%)' }} />

      <style>{`
        @keyframes pulsering { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:0.5} }
        @keyframes rotatering { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(14px,-18px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-12px,14px)} }
        @keyframes float3 { 0%,100%{transform:rotate(0deg)} 50%{transform:translate(16px,10px) rotate(55deg)} }
        @keyframes float4 { 0%,100%{transform:rotate(45deg) translate(0,0)} 50%{transform:rotate(58deg) translate(-12px,-8px)} }
        @keyframes float5 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-12px)} 66%{transform:translate(-6px,8px)} }
        @keyframes scanline { 0%{top:8%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:92%;opacity:0} }
      `}</style>

      {/* Content — no scale, natural size */}
      <div className="relative z-10 py-8">
        {children}
      </div>
    </div>
  );
}

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);
  const isPhoneHero = activeTab === 0;

  return (
    <section className="py-12 lg:py-24 px-4 sm:px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 items-center">

          {/* Visual — left */}
          <div className="w-full">
            {isPhoneHero ? (
              <PhoneBackground>
                <CyclingPhoneMockup visible={true} hideIndicators={false} />
              </PhoneBackground>
            ) : (
              STEPS[activeTab].image && (
                <div className="w-full rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200 group cursor-pointer bg-white">
                  <img
                    key={activeTab}
                    src={STEPS[activeTab].image}
                    alt={STEPS[activeTab].title}
                    className="w-full h-auto object-cover aspect-[4/3] animate-in fade-in zoom-in-95 duration-500 transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              )
            )}
          </div>

          {/* Accordion — right */}
          <div className="w-full space-y-2">
            {STEPS.map((item, i) => {
              const isActive = activeTab === i;
              return (
                <button key={i} onClick={() => setActiveTab(i)} className="w-full text-left outline-none group">
                  <div className={`flex items-start gap-5 py-6 px-6 rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-50 opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: isActive ? item.color : '#e2e8f0', boxShadow: isActive ? `0 10px 15px -3px ${item.color}40` : 'none' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 leading-snug">{item.title}</h3>
                        <ChevronRight className={`transition-all duration-300 shrink-0 ml-3 ${isActive ? 'rotate-90 text-slate-900' : 'text-slate-300'}`} size={20} />
                      </div>
                      <div className={`grid transition-all duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="text-slate-500 text-base font-medium leading-relaxed overflow-hidden">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE */}
        <div className="lg:hidden space-y-3">
          {STEPS.map((item, i) => {
            const isActive = activeTab === i;
            return (
              <div key={i} className={`rounded-2xl transition-all duration-300 ${isActive ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}>
                <button onClick={() => setActiveTab(i)} className="w-full text-left outline-none p-4">
                  <div className={`flex items-center gap-4 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isActive ? item.color : '#f1f5f9' }}
                    >
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    </div>
                    <h3 className="text-base font-bold tracking-tight text-slate-900 flex-1 leading-snug">{item.title}</h3>
                    <ChevronRight className={`transition-transform duration-300 text-slate-300 shrink-0 ${isActive ? 'rotate-90' : ''}`} size={18} />
                  </div>
                </button>

                <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden px-4 pb-4">
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.desc}</p>

                    {i === 0 ? (
                      <PhoneBackground compact>
                        <div className="scale-[0.78] origin-center">
                          <CyclingPhoneMockup visible={isActive} hideIndicators={true} />
                        </div>
                      </PhoneBackground>
                    ) : (
                      item.image && (
                        <div className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-md">
                          <img src={item.image} alt={item.title} className="w-full h-auto object-cover aspect-[4/3]" />
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