'use client';

import { useRef, useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';

function useFadeUp() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function StepLabel({ number, title, caption }: { number: string; title: string; caption: string }) {
  const sentences = caption.split('.');
  const first = sentences[0].trim();
  const rest = sentences.slice(1).join('.').trim();

  return (
    <div className="mb-7 w-full">
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
        >
          {number}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">{title}</p>
      </div>
      <p
        className="text-white font-bold leading-snug mb-2"
        style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.4rem)', letterSpacing: '-0.02em' }}
      >
        {first}.
      </p>
      {rest && (
        <p className="text-slate-400 text-[13px] leading-relaxed font-light">{rest}</p>
      )}
    </div>
  );
}

function FormBento() {
  const toggles = [
    { label: 'Service address',   desc: 'Autocomplete',       on: true  },
    { label: 'Preferred date',    desc: 'Suggest a date',     on: true  },
    { label: 'Photo / video',     desc: 'Job site photos',    on: true  },
    { label: 'How did you hear?', desc: 'Google, referral…',  on: false },
  ];
  const customQs = [
    { label: 'How old is your roof?',   type: 'Dropdown' },
    { label: 'Filing insurance claim?', type: 'Yes / No'  },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl" style={{ background: '#0f172a' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-orange-400" />
        </div>
        <div>
          <p className="text-[12px] font-black text-white">Intake Form</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Configuration</p>
        </div>
      </div>

      {/* Toggle rows */}
      <div className="px-5 py-2">
        {toggles.map((f, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-3 ${i < toggles.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <div className="min-w-0 pr-4">
              <p className={`text-[13px] font-semibold leading-tight ${f.on ? 'text-white/90' : 'text-white/25'}`}>
                {f.label}
              </p>
              <p className={`text-[10px] mt-0.5 ${f.on ? 'text-white/35' : 'text-white/15'}`}>{f.desc}</p>
            </div>
            <div
              className="shrink-0 flex items-center px-0.5 rounded-full"
              style={{
                background: f.on ? '#2563eb' : 'rgba(255,255,255,0.08)',
                width: 30, height: 17,
                justifyContent: f.on ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="w-3 h-3 bg-white rounded-full shadow" />
            </div>
          </div>
        ))}
      </div>

      {/* Custom questions */}
      <div className="px-5 pt-3 pb-5 border-t border-white/5">
        <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-2.5">Your Questions</p>
        <div className="space-y-2">
          {customQs.map((q, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-[12px] font-semibold text-white/70 truncate">{q.label}</p>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full ml-3 shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}
              >
                {q.type}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-bold text-blue-400/60">
            <Plus size={11} /> Add question
          </div>
        </div>
      </div>
    </div>
  );
}

function SuccessCard() {
  return (
    <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ background: '#f5f4f0' }}>
      <div className="p-5">
        <div className="bg-white rounded-2xl p-5 shadow-md flex flex-col items-center text-center">
          <div className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <img src="/images/ridgelinelogo.png" alt="" style={{ width: 34, objectFit: 'contain' }} />
          </div>
          <p className="text-[14px] font-black text-slate-900 mb-1">Request Received!</p>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            We'll be in touch about your roofing project.
          </p>
          {[
            { icon: '✉️', t: 'Check your email',       s: 'Confirmation sent to inbox'    },
            { icon: '📷', t: 'Photos received',         s: '3 job site photos uploaded'    },
            { icon: '✓',  t: "We'll reach out shortly", s: 'Our team reviews every request' },
          ].map(item => (
            <div key={item.t} className="flex items-center gap-2.5 bg-slate-50 rounded-xl p-2.5 w-full mb-1.5">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[11px] shadow-sm shrink-0">
                {item.icon}
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] font-black text-slate-800">{item.t}</p>
                <p className="text-[9px] text-slate-400 truncate">{item.s}</p>
              </div>
            </div>
          ))}
          <div
            className="w-full mt-2 py-2.5 rounded-xl text-[11px] font-black text-white text-center"
            style={{ background: 'linear-gradient(135deg,#f97316,#c2410c)' }}
          >
            Visit Ridge Line Roofing →
          </div>
          <p className="text-[8px] text-slate-300 uppercase tracking-widest mt-2">Powered by Lead2Project</p>
        </div>
      </div>
    </div>
  );
}

export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  const panelStyle = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(24px)',
    transition: `all 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  return (
    <div ref={ref} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-10 lg:gap-14 items-start">

        {/* STEP 1 */}
        <div className="flex flex-col" style={panelStyle(0)}>
          <StepLabel
            number="1"
            title="Customize your form"
            caption="Set your questions and what you collect. Your brand, your rules — live in 2 minutes."
          />
          <FormBento />
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col" style={panelStyle(0.1)}>
          <StepLabel
            number="2"
            title="Your link everywhere"
            caption="Get a QR code instantly. Truck, yard sign, Instagram — customers scan and submit with photos. No app needed."
          />
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <img src="/images/qr-scan-2.png" className="w-full h-auto block" alt="Customer scanning QR code" />
          </div>
        </div>

        {/* STEP 3 */}
        <div className="flex flex-col" style={panelStyle(0.15)}>
          <StepLabel
            number="3"
            title="They fill it out"
            caption="Customers answer your questions and upload job site photos. You get a complete lead — no back and forth."
          />
          <SuccessCard />
        </div>

        {/* STEP 4 */}
        <div className="flex flex-col" style={panelStyle(0.2)}>
          <StepLabel
            number="4"
            title="You close the job"
            caption="Every lead lands on your dashboard. Schedule, quote, collect payment, and send branded emails — one click each."
          />
          <div className="w-full overflow-hidden">
            <style>{`
              .laptop-wrap { transform-origin: top center; transform: scale(0.88); margin-bottom: -12%; }
              @media (max-width: 400px) { .laptop-wrap { transform: scale(0.80); margin-bottom: -20%; } }
              @media (min-width: 401px) and (max-width: 640px) { .laptop-wrap { transform: scale(0.85); margin-bottom: -15%; } }
              @media (min-width: 641px) and (max-width: 1024px) { .laptop-wrap { transform: scale(0.78); margin-bottom: -22%; } }
            `}</style>
            <div className="laptop-wrap">
              <DashboardLaptopMockup />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}