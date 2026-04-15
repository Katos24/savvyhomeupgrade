'use client';

import { useRef, useEffect, useState } from 'react';
import { FileText, Plus, CheckCircle2, QrCode, Image as ImageIcon } from 'lucide-react';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';
import { Img } from '@react-email/components';

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
          style={{ background: 'linear-gradient(135deg, #1a6645, #22c55e)' }}
        >
          {number}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1a6645]">{title}</p>
      </div>
     <p
        className="text-white font-black leading-snug mb-2"
        style={{ fontSize: 'clamp(1.15rem, 2.4vw, 1.5rem)', letterSpacing: '-0.02em' }}
      >
        {first}.
      </p>
      {rest && (
        <p className="text-slate-300 text-[13px] leading-relaxed font-normal">{rest}</p>
      )}
    </div>
  );
}

function FormBento() {
  const toggles = [
    { label: 'Service address', desc: 'Autocomplete', on: true },
    { label: 'Photo / video', desc: 'Job site photos', on: true },
    { label: 'How old is your roof?', desc: 'Custom Dropdown', on: true },
  ];

  return (
    <div className="w-full rounded-2xl border border-white/5 overflow-hidden shadow-xl bg-[#0F172A]">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-[12px] font-black text-white">Intake Form</p>
          <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Configuration</p>
        </div>
      </div>
      <div className="px-5 py-3">
        {toggles.map((f, i) => (
          <div key={i} className={`flex items-center justify-between py-3 ${i < toggles.length - 1 ? 'border-b border-white/5' : ''}`}>
            <div className="min-w-0 pr-4">
              <p className="text-[13px] font-semibold text-white leading-tight">{f.label}</p>
              <p className="text-[10px] mt-0.5 text-slate-500">{f.desc}</p>
            </div>
            <div className="shrink-0 flex items-center rounded-full p-0.5 bg-emerald-500 w-[30px] h-[17px] justify-end">
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center gap-1.5 py-3 mt-1 text-[11px] font-bold text-emerald-500 border-2 border-dashed border-white/5 rounded-xl">
          <Plus size={11} /> Add question
        </div>
      </div>
    </div>
  );
}

function SuccessModal() {
  return (
    <div className="w-full max-w-[260px] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-white p-4 animate-in fade-in zoom-in duration-700">
      <div className="flex flex-col items-center text-center">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-2">
            <CheckCircle2 size={24} className="text-[#1a6645]" />
        </div>
        <p className="text-[13px] font-black text-slate-900 mb-0.5">Request Received!</p>
        <p className="text-[10px] text-slate-500 mb-3 leading-tight">Ridge Line Roofing is on it.</p>
        
        <div className="w-full space-y-1 mb-3">
          {['Check email', 'Photos saved'].map(t => (
            <div key={t} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 w-full">
              <div className="w-4 h-4 bg-emerald-500 rounded-md flex items-center justify-center text-[8px] text-white">✓</div>
              <p className="text-[9px] font-black text-slate-800">{t}</p>
            </div>
          ))}
        </div>
        
        <div className="w-full py-2 rounded-lg text-[10px] font-black text-white bg-[#1a6645]">
          Visit Site →
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
    <div ref={ref} className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">

        {/* STEP 1: GENERATE (IMAGE PLACEHOLDER) */}
        <div className="flex flex-col" style={panelStyle(0)}>
         <StepLabel
            number="1"
            title="Generate your link"
            caption="Sign up and instantly get two things: a custom booking link and a QR code. Blast them everywhere — truck wraps, yard signs, Instagram bio, email footer. Customers click or scan to submit a job request directly to you."
          />
          {/* YOUR IMAGE ADDS HERE */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-[#0F172A]">
            <img
              src="/images/qr-screenshot.png"
              alt="QR Code"
              className="w-full h-auto block max-h-[280px] object-contain object-center p-4"
            />
          </div>
        </div>

        {/* STEP 2: CUSTOMIZE INTAKE */}
        <div className="flex flex-col" style={panelStyle(0.1)}>
          <StepLabel
            number="2"
            title="Setup your link"
caption="Your form, your rules. Toggle address collection on or off, add custom questions, require photos or video. Customers see exactly what you want them to fill out — nothing more, nothing less."          />
          <FormBento />
        </div>

       {/* STEP 3: THE CAPTURE */}
        <div className="flex flex-col" style={panelStyle(0.2)}>
          <StepLabel
            number="3"
            title="Capture everywhere"
caption="Customer scans your truck, yard sign, or clicks your bio link. They fill out your form, upload photos, and hit submit. You get the lead on your dashboard in seconds — name, number, service, photos, all of it."          />
          <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl" style={{ minHeight: 320 }}>
            <img 
              src="/images/qr-scan-2.png" 
              className="absolute inset-0 w-full h-full object-cover opacity-70" 
              alt="Customer scanning" 
            />
           {/* Dark gradient so modal is readable */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/40" />
            {/* Success Modal — bottom right on mobile, top right on desktop */}
            <div className="absolute top-3 right-3 z-10 scale-[0.65] origin-top-right sm:scale-[0.82]">
              <SuccessModal />
            </div>
          </div>
        </div>

       {/* STEP 4: THE RESULT */}
        <div className="flex flex-col" style={panelStyle(0.3)}>
          <StepLabel
            number="4"
            title="Close the job"
caption="Every lead becomes a job card. Schedule the job, build a quote from your templates, send it to the customer with one click — they accept or decline right from their email. Track payment status, upload photos and docs, assign crew, and log every email sent. Your whole business in one place."          />
         <div className="w-full overflow-hidden bg-[#0F172A] rounded-2xl border border-white/5 pt-4 px-2" style={{ height: 380 }}>
            <div style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
                <DashboardLaptopMockup />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}