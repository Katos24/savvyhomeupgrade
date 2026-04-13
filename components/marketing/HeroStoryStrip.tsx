'use client';

import { useRef, useEffect, useState } from 'react';
import { FileText, CheckCircle2, Mail, ArrowRight, Plus } from 'lucide-react';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';

/**
 * Fade animation hook
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
 * Label
 */
function StepLabel({
  number,
  title,
  caption,
}: {
  number: string;
  title: string;
  caption: string;
}) {
  return (
    <div className="mb-6 text-center lg:text-left">
      <div className="flex items-center gap-3 mb-3 justify-center lg:justify-start">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shadow-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          {number}
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
          {title}
        </p>
      </div>

      <p className="text-white text-xl lg:text-2xl font-bold mb-2">
        {caption.split('.')[0]}.
      </p>

      <p className="text-slate-400 text-sm leading-relaxed max-w-[420px] mx-auto lg:mx-0">
        {caption.split('.').slice(1).join('.')}
      </p>
    </div>
  );
}

/**
 * Step 1 UI
 */
function FormBento() {
  const toggles = [
    { label: 'Service address', desc: 'Autocomplete', on: true },
    { label: 'Preferred date', desc: 'Suggest a date', on: true },
    { label: 'Photo / video', desc: 'Job site photos', on: true },
  ];

  const customQs = [
    { label: 'How old is your roof?', type: 'Dropdown' },
    { label: 'Filing insurance claim?', type: 'Yes / No' },
  ];

  return (
    <div className="w-full max-w-[340px] rounded-2xl p-5 border border-white/10 bg-[#0f172a]/80 backdrop-blur-sm shadow-2xl">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <FileText size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Intake Form</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Configuration
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 mb-5">
        {toggles.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-white/90">
                {f.label}
              </p>
              <p className="text-[11px] text-white/40">{f.desc}</p>
            </div>

            <div
              className="w-9 h-5 flex items-center px-1 rounded-full transition"
              style={{
                background: f.on
                  ? '#2563eb'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <div
                className={`h-3 w-3 bg-white rounded-full shadow transition ${
                  f.on ? 'translate-x-4' : ''
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-4" />

      {/* Custom Questions */}
      <div className="space-y-2">
        {customQs.map((q, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-[11px] font-bold text-white/80">
              {q.label}
            </p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {q.type}
            </span>
          </div>
        ))}
      </div>

      {/* Add field button */}
      <div className="mt-4">
        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer transition">
          <Plus size={14} />
          Add question
        </div>
      </div>
    </div>
  );
}
/**
 * MAIN
 */
export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  const panelStyle = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(30px)',
    transition: `all 0.7s ease ${delay}s`,
  });

  return (
    <div
      ref={ref}
      className="w-full max-w-7xl mx-auto px-5 lg:px-8 py-16 lg:py-24"
    >
      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-x-16 lg:gap-y-24 items-stretch">

        {/* STEP 1 */}
        <div className="flex flex-col items-center lg:items-start h-full" style={panelStyle(0)}>
          <StepLabel
            number="1"
            title="Customize your form"
            caption="Set your questions and what you collect. Your form, your brand — live in minutes."
          />
          <FormBento />
        </div>

        {/* STEP 2 */}
        <div className="flex flex-col items-center lg:items-start h-full" style={panelStyle(0.1)}>
          <StepLabel
            number="2"
            title="Your link everywhere"
            caption="Get a QR code instantly. Put it on trucks, signs, or Instagram. No app needed."
          />

          <div className="w-full max-w-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <img
              src="/images/qr-scan-2.png"
              className="w-full h-auto"
              alt="QR"
            />
          </div>
        </div>

        {/* STEP 3 */}
        <div className="flex flex-col items-center lg:items-start h-full" style={panelStyle(0.2)}>
          <StepLabel
            number="3"
            title="They fill it out"
            caption="Customers submit details and photos. You get a complete lead instantly."
          />

          <div className="w-full max-w-[300px] bg-white rounded-3xl p-5 text-center shadow-xl">
            <CheckCircle2 className="mx-auto mb-3 text-blue-500" size={30} />
            <p className="font-bold text-slate-900">Request received</p>
            <p className="text-xs text-slate-500 mb-4">
              Confirmation sent via email
            </p>

            <div className="flex items-center gap-2 justify-center text-xs text-slate-600">
              <Mail size={14} />
              Check inbox
            </div>

            <div className="mt-5 bg-slate-900 text-white text-sm py-2 rounded-lg flex items-center justify-center gap-1">
              Visit <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* STEP 4 */}
        <div className="flex flex-col items-center lg:items-start h-full" style={panelStyle(0.3)}>
          <StepLabel
            number="4"
            title="You close the job"
            caption="Leads hit your dashboard. Quote, schedule, and get paid — all in one place."
          />

          <div className="w-full max-w-[520px]">
            <DashboardLaptopMockup />
          </div>
        </div>

      </div>
    </div>
  );
}