'use client';

import { useRef, useState } from 'react';
import { 
  FileText, Plus, CheckCircle2, QrCode as QrIcon, 
  ChevronRight, ImageIcon, MapPin, Calendar, Upload, X, Settings2, Smartphone
} from 'lucide-react';
import { LeadModalMockup } from './LeadModalMockup';

// ─── STEP 1: QR CARD ─────────────────────────────────────────────────────────

function QRCard() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-[1.75rem] overflow-hidden bg-gradient-to-br from-[#1a6645] to-[#15803d] shadow-2xl">
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl px-3 py-2 mb-4 sm:mb-5 inline-flex">
          <QrIcon size={13} className="text-emerald-300" />
          <p className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-widest">Branded Link</p>
        </div>
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center p-3 sm:p-4">
          <img src="/images/qrcode-ridgeline.webp" alt="QR Code" className="w-full h-auto max-h-[150px] sm:max-h-[220px] object-contain rounded-lg sm:rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {['Truck wrap', 'Yard sign', 'Bio link'].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg sm:rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[8px] sm:text-[9px] font-black text-white/70 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: CUSTOMER FORM ────────────────────────────────────────────────────

export function FormCard() {
  return (
    <div className="w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-white shadow-2xl flex flex-col text-left">
      
      {/* Branded header */}
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2.5"
        style={{ background: 'linear-gradient(135deg, #1a6645, #15803d)' }}>
        <img src="/images/ridgelinelogo.webp" alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-contain bg-white/20 p-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[12px] font-black text-white leading-tight truncate">Ridge Line Roofing</p>
          <p className="text-[7px] sm:text-[8px] text-white/50 font-bold">Submit Your Request</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">

        <div className="grid grid-cols-2 gap-2">
          <div className="px-2.5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Name</p>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-900 truncate">Jason Merritt</p>
          </div>
          <div className="px-2.5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-900">(555) 482-9301</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="px-2.5 py-1.5 sm:py-2 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
            <p className="text-[7px] font-bold text-blue-400 uppercase tracking-wider">Service</p>
            <p className="text-[10px] sm:text-[11px] font-bold text-blue-700">Roofing</p>
          </div>
          <div className="px-2.5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-900 truncate">42 Maple Ave</p>
          </div>
        </div>

        {/* Description + photo side by side */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0 px-2.5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Description</p>
            <p className="text-[9px] sm:text-[10px] text-gray-600 leading-snug line-clamp-2">Storm damaged roof, shingles missing. Leak through bedroom ceiling.</p>
          </div>
          <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl overflow-hidden border-2 border-emerald-200">
            <img src="/images/roof-damage.webp" alt="Roof damage" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Custom question */}
        <div className="px-2.5 py-2 bg-indigo-50 border border-indigo-200 rounded-lg sm:rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[7px] font-bold text-indigo-400 uppercase tracking-wider">Custom Question</p>
            <span className="text-[6px] font-black bg-indigo-200 text-indigo-600 px-1 py-0.5 rounded">YOU CONFIGURE</span>
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold text-indigo-900 mb-1.5">"How old is your roof?"</p>
          <div className="flex gap-1">
            {['0-5 yrs', '5-15 yrs', '15+'].map((opt, i) => (
              <div
                key={opt}
                className={`flex-1 py-1 rounded-md text-[8px] font-bold text-center transition-all ${
                  i === 2
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-indigo-100 text-indigo-400'
                }`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="w-full py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black text-white text-center uppercase tracking-widest"
          style={{ background: 'linear-gradient(135deg, #1a6645, #15803d)' }}>
          Submit Request
        </div>
      </div>

      {/* Customization footer */}
      <div className="px-3 sm:px-5 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-1.5">
        <Settings2 size={9} className="text-blue-400" />
        <p className="text-[7px] sm:text-[8px] font-bold text-gray-400">Your logo, colors, fields & custom questions</p>
      </div>
    </div>
  );
}

// ─── STEP 3: CAPTURE CARD ────────────────────────────────────────────────────

function CaptureCard() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl h-[240px] sm:h-[440px] text-left">
      <div className="absolute inset-y-0 right-0 w-[50%]">
        <img src="/images/qr-scan-2.webp" className="w-full h-full object-cover object-center opacity-60" alt="Scanning" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
      </div>
      <div className="absolute inset-y-0 left-0 w-[65%] flex items-center justify-center pl-4 sm:pl-5">
        <div className="w-full max-w-[140px] sm:max-w-[220px] rounded-xl sm:rounded-2xl overflow-hidden bg-white p-3 sm:p-5 shadow-2xl transform -rotate-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={18} className="text-[#1a6645] sm:w-[24px] sm:h-[24px]" />
            </div>
            <p className="text-[12px] sm:text-[15px] font-black text-slate-900">Lead Received!</p>
            <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">Jason Merritt · Roofing</p>
            <div className="w-full h-px bg-slate-100 my-2 sm:my-3" />
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
              <img src="/images/roof-damage.webp" alt="Roof damage" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-slate-200" />
              <div className="text-left">
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">1 photo attached</p>
                <p className="text-[8px] sm:text-[9px] text-slate-500 leading-tight">Storm damaged roof...</p>
              </div>
            </div>
            <div className="w-full py-1.5 sm:py-2.5 rounded-lg text-[9px] sm:text-[10px] font-black text-white bg-[#1a6645]">View Lead</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function HeroStoryStrip() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '1',
      title: 'Branded Link',
      desc: 'Get a custom QR code for trucks and yard signs.',
      card: <QRCard />,
      popColor: 'border-emerald-500/20',
      glow: 'from-emerald-600/20'
    },
    {
      number: '2',
      title: 'Customer Submits',
      desc: 'They fill out your branded form with photos. Fully customizable.',
      card: <FormCard />,
      popColor: 'border-blue-500/20',
      glow: 'from-blue-600/20'
    },
    {
      number: '3',
      title: 'Lead Lands',
      desc: 'Name, photos, and details hit your board instantly.',
      card: <CaptureCard />,
      popColor: 'border-emerald-500/20',
      glow: 'from-emerald-600/20'
    },
    {
      number: '4',
      title: 'Manage the Job',
      desc: 'Tasks, quotes, scheduling, and payments — all in one view.',
      card: <LeadModalMockup />,
      popColor: 'border-slate-500/20',
      glow: 'from-slate-600/20'
    },
  ];

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    setActiveStep(Math.round(scrollLeft / offsetWidth));
  };

  return (
    <div id="how-it-works" className="w-full max-w-6xl mx-auto scroll-mt-24">
      
      {/* MOBILE: SWIPE CAROUSEL */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-3 mb-5 px-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === i ? 'w-8 bg-emerald-500' : 'w-1.5 bg-white/10'}`} 
              />
            ))}
          </div>
          <span className="text-white/80 text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1">
            Swipe <ChevronRight size={10} />
          </span>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-4 pb-4"
        >
          {steps.map((step, i) => (
            <div key={i} className="min-w-[88%] snap-center flex flex-col">
              <div className={`relative overflow-hidden rounded-2xl p-3 border ${step.popColor} bg-[#020617] shadow-xl flex flex-col`}>
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${step.glow} to-transparent opacity-30 pointer-events-none`} />
                <div className="relative z-10 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
                      {step.number}
                    </div>
                    <h3 className="text-sm font-black text-white tracking-tight">{step.title}</h3>
                  </div>
                  <p className="text-white/60 text-[11px] font-medium mb-3 leading-snug">{step.desc}</p>
                  <div>{step.card}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: BENTO GRID */}
      <div className="hidden md:grid grid-cols-2 gap-8 lg:gap-12">
        {steps.map((step, i) => (
          <div 
            key={i} 
            className={`group relative overflow-hidden rounded-[3.5rem] p-10 lg:p-14 border-2 ${step.popColor} bg-[#020617] transition-all duration-500 hover:scale-[1.01] hover:border-white/20 shadow-2xl flex flex-col`}
          >
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${step.glow} to-transparent opacity-20 pointer-events-none`} />
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-xl">
                  {step.number}
                </div>
                <h3 className="text-4xl font-black text-white tracking-tight">{step.title}</h3>
              </div>
              <p className="text-white/70 text-lg font-medium mb-6 max-w-sm">{step.desc}</p>
              <div className="mt-auto transition-transform duration-500 group-hover:scale-[1.02]">
                {step.card}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}