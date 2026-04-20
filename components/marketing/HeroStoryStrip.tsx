'use client';

import { useRef, useEffect, useState } from 'react';
import { FileText, Plus, CheckCircle2, QrCode, Smartphone } from 'lucide-react';
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

function StepBadge({ number }: { number: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1a6645, #22c55e)' }}
      >
        {number}
      </div>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function StepTitle({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-white/50 text-sm sm:text-base font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── STEP 1: QR CARD ─────────────────────────────────────────────────────────
function QRCard() {
  return (
    
    <div
      className="relative w-full rounded-[1.75rem] overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f4c2a 0%, #1a6645 60%, #15803d 100%)' }}
    >
      {/* blobs */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #86efac, transparent)' }} />

      <div className="relative p-5">
        {/* top badge */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 self-start inline-flex mb-5">
          <QrCode size={13} className="text-emerald-300" />
          <p className="text-[11px] font-black text-white uppercase tracking-widest">Your branded link</p>
        </div>

        {/* QR image */}
        <div className="relative rounded-2xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center p-4">
          <img
            src="/images/qrcode-ridgeline.webp"
            alt="QR Code"
            className="w-full h-auto max-h-[220px] object-contain rounded-xl"
          />
        </div>

        {/* bottom stat row */}
        <div className="flex items-center gap-3 mt-4">
          {[
            { label: 'Truck wrap', dot: '#4ade80' },
            { label: 'Yard sign', dot: '#60a5fa' },
            { label: 'Bio link', dot: '#f472b6' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.dot }} />
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: FORM CARD ───────────────────────────────────────────────────────
function FormCard() {
  const toggles = [
    { label: 'Service address', desc: 'Autocomplete' },
    { label: 'Photo / video', desc: 'Job site photos' },
    { label: 'How old is your roof?', desc: 'Custom dropdown' },
  ];

  return (
    <div className="w-full rounded-[1.75rem] overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl">
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-[12px] font-black text-white">Intake Form</p>
          <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Configuration</p>
        </div>
      </div>

      {/* toggles */}
      <div className="px-5 py-3">
        {toggles.map((f, i) => (
          <div key={i} className={`flex items-center justify-between py-3.5 ${i < toggles.length - 1 ? 'border-b border-white/5' : ''}`}>
            <div className="min-w-0 pr-4">
              <p className="text-[13px] font-semibold text-white leading-tight">{f.label}</p>
              <p className="text-[10px] mt-0.5 text-white/30">{f.desc}</p>
            </div>
            <div className="shrink-0 flex items-center rounded-full p-0.5 bg-emerald-500 w-[30px] h-[17px] justify-end">
              <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center gap-1.5 py-3 mt-1 text-[11px] font-bold text-emerald-400 border border-dashed border-emerald-500/30 rounded-xl bg-emerald-500/5">
          <Plus size={11} /> Add question
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3: CAPTURE ─────────────────────────────────────────────────────────
function CaptureCard() {
  return (
    <div className="relative w-full rounded-[1.75rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl h-[320px] sm:h-[380px]">

      {/* Photo strip — right 45%, full height */}
      <div className="absolute top-0 right-0 w-[45%] h-full">
        <img
          src="/images/qr-scan-2.webp"
          className="w-full h-full object-cover object-left"
          alt="Customer scanning QR on truck"
        />
        {/* Fade left into dark bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
        {/* Fade bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
      </div>

      {/* Dark bg covers left 60% cleanly */}
      <div className="absolute inset-0 right-[40%] bg-slate-900" />

      {/* Modal — pinned left, vertically centered */}
      <div className="absolute inset-y-0 left-0 w-[58%] flex items-center justify-center pl-4 sm:pl-5">
        <div className="w-full max-w-[200px] rounded-2xl overflow-hidden bg-white p-3.5 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
              <CheckCircle2 size={20} className="text-[#1a6645]" />
            </div>
            <p className="text-[12px] font-black text-slate-900 mb-0.5">Request Received!</p>
            <p className="text-[10px] text-slate-400 mb-3 leading-tight">Ridge Line Roofing is on it.</p>
            <div className="w-full space-y-1 mb-3">
              {['Check email', 'Photos saved'].map(t => (
                <div key={t} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-md flex items-center justify-center text-[8px] text-white shrink-0">✓</div>
                  <p className="text-[9px] font-black text-slate-800">{t}</p>
                </div>
              ))}
            </div>
            <div className="w-full py-2 rounded-lg text-[10px] font-black text-white bg-[#1a6645]">
              Visit Site →
            </div>
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 px-5 pb-4">
        <div className="flex items-center gap-2">
          <Smartphone size={13} className="text-emerald-400" />
          <p className="text-[11px] font-black text-white/60 uppercase tracking-widest">Instant mobile capture</p>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4: DASHBOARD ───────────────────────────────────────────────────────
function DashboardCard() {
  return (
    <div className="w-full overflow-hidden bg-[#0F172A] rounded-[1.75rem] border border-white/5 pt-6 relative h-[300px] sm:h-[360px]">
      <div className="absolute inset-x-0 top-6 scale-[0.72] sm:scale-[0.88] origin-top">
        <DashboardLaptopMockup />
      </div>
      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#0F172A] to-transparent" />
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export function HeroStoryStrip() {
  const { ref, visible } = useFadeUp();

  const panelStyle = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `all 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  });

  const steps = [
    {
      number: '1',
      title: 'Get your branded link',
      desc: 'Sign up and instantly get a custom QR code and booking link. Stick it everywhere — truck wraps, yard signs, Instagram bio.',
      card: <QRCard />,
    },
    {
      number: '2',
      title: 'Set up your intake form',
      desc: 'Toggle fields on or off, add custom questions, require job photos. Your form, your rules.',
      card: <FormCard />,
    },
    {
      number: '3',
      title: 'Customer scans & submits',
      desc: 'They fill out your form, upload photos, and hit submit. Lead lands on your board in under 2 seconds.',
      card: <CaptureCard />,
    },
    {
      number: '4',
      title: 'Quote, schedule & close',
      desc: 'Every lead becomes a job card. Schedule the crew, send a quote, track payment — all in one place.',
      card: <DashboardCard />,
    },
  ];

 return (
  <section id="how-it-works" className="py-20 sm:py-32">
    <div ref={ref} className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col" style={panelStyle(i * 0.1)}>
            <StepBadge number={step.number} />
            <StepTitle title={step.title} desc={step.desc} />
            {step.card}
          </div>
        ))}
      </div>
    </div>
  </section>
);
}