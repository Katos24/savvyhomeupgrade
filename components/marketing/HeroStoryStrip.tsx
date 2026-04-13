'use client';

import { useRef, useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';

/**
 * Hook for fade-in animations on scroll
 */
function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/**
 * Reusable label for each step
 */
function StepLabel({ 
  number, 
  title, 
  caption 
}: { 
  number: string; 
  title: string; 
  caption: string;
}) {
  return (
    <div className="mb-6 text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black"
          style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff' }}
        >
          {number}
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">
          {title}
        </p>
      </div>
      <p className="text-slate-300 text-[14px] font-medium leading-relaxed max-w-[320px] mx-auto lg:mx-0">
        {caption}
      </p>
    </div>
  );
}

/**
 * Panel 1: Interactive Form UI
 */
function FormBento() {
  const toggles = [
    { label: 'Service address',    desc: 'Autocomplete',          on: true  },
    { label: 'Preferred date',     desc: 'Suggest a date',        on: true  },
    { label: 'Preferred time',     desc: 'Morning / afternoon',   on: false },
    { label: 'How did you hear?',  desc: 'Google, referral, etc', on: false },
    { label: 'Photo / video',      desc: 'Job site photos',       on: true  },
  ];
  
  const customQs = [
    { label: 'How old is your roof?',   type: 'Dropdown', options: ['Under 10 yrs', '10–20 yrs', '20+ yrs'] },
    { label: 'Filing insurance claim?', type: 'Yes / No',  options: [] },
  ];

  return (
    <div 
      className="rounded-2xl p-5 border border-white/10 shadow-2xl w-full max-w-[320px] mx-auto lg:mx-0"
      style={{ background: '#0f172a' }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-orange-400" />
        </div>
        <p className="text-[13px] font-black text-white">Intake Form</p>
      </div>

      <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">Standard Fields</p>
      <div className="flex flex-col gap-3 mb-4">
        {toggles.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[10px] font-semibold leading-tight ${f.on ? 'text-white/90' : 'text-white/20'}`}>{f.label}</p>
              <p className={`text-[8px] leading-tight ${f.on ? 'text-white/40' : 'text-white/10'}`}>{f.desc}</p>
            </div>
            <div 
              className="flex items-center px-0.5 rounded-full shrink-0"
              style={{
                background: f.on ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                width: 28, height: 16,
                justifyContent: f.on ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="rounded-full bg-white shadow-sm" style={{ width: 12, height: 12 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Your Own Questions</p>
        <div className="flex items-center gap-1 text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20 cursor-default">
          <Plus size={7} /> Add
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {customQs.map((q, i) => (
          <div key={i} className="rounded-xl px-2.5 py-2"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-black text-white/80 truncate flex-1">{q.label}</p>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full ml-2 shrink-0"
                style={{ background: '#eef2ff', color: '#6366f1' }}>{q.type}</span>
            </div>
            {q.options.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {q.options.map((o, j) => (
                  <span key={j} className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>{o}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Hero Story Section
 */
export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  const panelStyle = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div ref={ref} className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-12 overflow-hidden">
      {/* Grid System: 
          - Stacked on mobile (1 col)
          - 2 columns on large screens
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-x-12 lg:gap-y-24 items-start">

        {/* 1. Customize Form */}
        <div className="flex flex-col items-center lg:items-start" style={panelStyle(0)}>
          <StepLabel 
            number="1" 
            title="Customize your form"
            caption="Set your questions, categories, and what you collect. Your form, your brand — live in 2 minutes." 
          />
          <FormBento />
        </div>

        {/* 2. QR Code Mockup */}
        <div className="flex flex-col items-center lg:items-start" style={panelStyle(0.1)}>
          <StepLabel 
            number="2" 
            title="Your link. Everywhere."
            caption="Sign up and get a branded QR code instantly. Stick it on your truck, yard signs, or Instagram bio. No app required." 
          />
          <div className="w-full max-w-[420px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="/images/qr-scan-2.png"
              alt="QR Code Scanning"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* 3. Success Screen (Mobile Mockup) */}
        <div className="flex flex-col items-center lg:items-start" style={panelStyle(0.2)}>
          <StepLabel 
            number="3" 
            title="They fill it out"
            caption="Customers answer your questions and upload photos. You get a complete lead — ready to quote, instantly." 
          />
          <div 
            className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 w-full max-w-[300px] mx-auto lg:mx-0"
            style={{ background: '#f5f4f0' }}
          >
            <div className="flex flex-col items-center px-5 py-8">
              <div className="bg-white rounded-[2rem] p-5 w-full shadow-lg flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
                  <img src="/images/ridgelinelogo.png" alt="" className="w-9 h-9 object-contain" />
                </div>
                <p className="text-[14px] font-black text-slate-900 mb-1">Request Received!</p>
                <p className="text-[9px] text-slate-500 text-center mb-5 uppercase tracking-wide">Ridge Line Roofing</p>
                
                {[
                  { icon: '✉️', t: 'Check your email', s: 'Confirmation sent' },
                  { icon: '✓', t: "We'll reach out", s: 'Team reviews every request' },
                ].map((i, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 w-full mb-2">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm text-xs">{i.icon}</div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800">{i.t}</p>
                      <p className="text-[8px] text-slate-400">{i.s}</p>
                    </div>
                  </div>
                ))}
                
                <div 
                  className="w-full mt-4 py-3 rounded-2xl text-[10px] font-black text-white text-center cursor-default"
                  style={{ background: 'linear-gradient(135deg,#f97316,#c2410c,#1c1917)' }}
                >
                  Visit Website →
                </div>
                <p className="text-[6px] text-slate-400 uppercase tracking-[0.15em] mt-4">Powered by Lead2Project</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Dashboard (Laptop Mockup) */}
        <div className="flex flex-col items-center lg:items-start" style={panelStyle(0.3)}>
          <StepLabel 
            number="4" 
            title="You close the job"
            caption="Every lead lands on your dashboard. Schedule, quote, collect payment, and send branded emails — all in one place." 
          />
          <div className="w-full relative">
            <style>{`
              .laptop-scale-container {
                width: 100%;
                display: flex;
                justify-content: center;
                overflow: visible;
              }
              .laptop-inner {
                transform-origin: top center;
                transform: scale(0.85);
                margin-bottom: -10%;
              }
              @media (max-width: 640px) {
                .laptop-inner {
                  transform: scale(0.95);
                  margin-bottom: -15%;
                }
              }
              @media (min-width: 1024px) {
                .laptop-inner {
                  transform: scale(1);
                  transform-origin: top left;
                  margin-bottom: 0;
                }
              }
            `}</style>
            <div className="laptop-scale-container">
              <div className="laptop-inner w-full">
                <DashboardLaptopMockup />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}