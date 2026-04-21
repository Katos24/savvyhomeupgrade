'use client';

import { useRef, useState } from 'react';
import { 
  FileText, Plus, CheckCircle2, QrCode as QrIcon, 
  ChevronRight, ImageIcon, MapPin, Calendar, Upload, X, Settings2, Smartphone
} from 'lucide-react';
import { DashboardLaptopMockup } from './DashboardLaptopMockup';

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

// ─── STEP 2: SMART INTAKE ─────────────────────────────────────────────────────

export function FormCard() {
  const [addressEnabled, setAddressEnabled] = useState(true);
  const [filesEnabled, setFilesEnabled] = useState(true);

  return (
    <div className="w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-[#0f172a] shadow-2xl flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/5 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Settings2 size={13} className="text-blue-400" />
          </div>
          <p className="text-[11px] sm:text-[12px] font-black text-white uppercase tracking-tight">Intake Builder</p>
        </div>
       <div className="hidden sm:flex px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
  <span className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-tighter">
    Live Preview
  </span>
</div>
      </div>

      {/* MOBILE: Compact single-column layout */}
      {/* DESKTOP: Side-by-side settings + phone preview */}
      <div className="flex-1 overflow-hidden flex flex-col md:grid md:grid-cols-2">
        
        {/* LEFT: SETTINGS */}
        <div className="p-4 sm:p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-4 sm:space-y-5 bg-slate-900/50">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Core Fields</p>
          
          <div className="space-y-2.5 sm:space-y-3">
            {[
              { label: 'Address Lookup', icon: <MapPin size={14} />, state: addressEnabled, setter: setAddressEnabled },
              { label: 'Photo/Video Upload', icon: <ImageIcon size={14} />, state: filesEnabled, setter: setFilesEnabled },
            ].map((field, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => field.setter(!field.state)}>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${field.state ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                    {field.icon}
                  </div>
                  <span className={`text-[11px] sm:text-xs font-bold ${field.state ? 'text-slate-200' : 'text-slate-500'}`}>{field.label}</span>
                </div>
                <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${field.state ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${field.state ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>

     <div className="pt-3 sm:pt-4 border-t border-white/5">
  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 sm:mb-3">
    Custom Questions
  </p>
  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-2.5 sm:p-3 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-white italic">
        &quot;How old is your roof?&quot;
      </span>
      <span className="text-[7px] font-black bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
        SELECT
      </span>
    </div>
    {/* flex-row ensures same line, gap-1.5 for spacing */}
    <div className="flex flex-row gap-1.5">
      {['0-5yrs', '5-15yrs', '15+'].map((opt) => (
        <div 
          key={opt} 
          className="flex-1 py-1 bg-slate-800 rounded-md text-[8px] font-bold text-slate-400 border border-white/5 text-center"
        >
          {opt}
        </div>
      ))}
    </div>
  </div>
  <button className="w-full mt-2.5 sm:mt-3 py-2 border border-dashed border-slate-700 rounded-xl text-[9px] font-black text-slate-500 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
    <Plus size={10} /> Add Question
  </button>
</div>
        </div>

       {/* RIGHT: PHONE PREVIEW */}
<div className="hidden md:flex p-6 bg-[#020617] items-center justify-center">
  <div className="w-full max-w-[230px] bg-white rounded-[2.5rem] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col h-[320px] text-left">
    <div className="h-4 bg-slate-800 w-1/3 mx-auto rounded-b-xl mb-1 shrink-0" />
    
    <div className="p-4 flex-1 space-y-3 overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Project Intake</p>
        <Smartphone size={12} className="text-slate-300" />
      </div>

      {addressEnabled && (
        <div className="w-full h-8 bg-slate-50 border border-slate-100 rounded-lg px-2 flex items-center gap-2">
          <MapPin size={10} className="text-blue-500" />
          <span className="text-[9px] text-slate-400 font-medium">Property Address...</span>
        </div>
      )}

      {filesEnabled && (
        <div className="w-full h-14 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-1">
          <Upload size={12} className="text-slate-300" />
          <span className="text-[8px] font-bold text-slate-400">Add Photos</span>
        </div>
      )}

      <div className="w-full h-8 bg-slate-50 border border-slate-100 rounded-lg px-2 flex items-center justify-between">
        <span className="text-[9px] text-slate-400 font-medium">Roof Age?</span>
        <ChevronRight size={10} className="text-slate-300" />
      </div>

      <div className="w-full py-2.5 rounded-xl bg-blue-600 text-[9px] font-black text-white text-center shadow-md mt-2 uppercase tracking-widest">
        Submit
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

// ─── STEP 3: CAPTURE CARD ────────────────────────────────────────────────────

function CaptureCard() {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 shadow-2xl h-[220px] sm:h-[300px] text-left">
      <div className="absolute top-0 right-0 w-[50%] h-full">
        <img src="/images/qr-scan-2.webp" className="w-full h-full object-cover object-left opacity-60" alt="Scanning" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
      </div>
      <div className="absolute inset-y-0 left-0 w-[65%] flex items-center justify-center pl-4 sm:pl-5">
        <div className="w-full max-w-[140px] sm:max-w-[180px] rounded-xl sm:rounded-2xl overflow-hidden bg-white p-3 sm:p-4 shadow-2xl transform -rotate-2">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 size={18} className="text-[#1a6645] sm:w-[22px] sm:h-[22px]" />
            </div>
            <p className="text-[12px] sm:text-[13px] font-black text-slate-900">Received!</p>
            <div className="w-full h-px bg-slate-100 my-2 sm:my-3" />
            <div className="w-full py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-black text-white bg-[#1a6645]">View Lead</div>
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
      title: 'Smart Intake',
      desc: 'Toggle fields and require job site photos.',
      card: <FormCard />,
      popColor: 'border-blue-500/20',
      glow: 'from-blue-600/20'
    },
    {
      number: '3',
      title: 'Auto Capture',
      desc: 'Leads land on your board instantly via scan.',
      card: <CaptureCard />,
      popColor: 'border-blue-500/20',
      glow: 'from-blue-600/20'
    },
    {
      number: '4',
      title: 'Contractor OS',
      desc: 'Track every payday from one screen.',
      card: <DashboardLaptopMockup />,
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

        {/* Dots + swipe hint ABOVE the cards so they're always visible */}
        <div className="flex items-center justify-center gap-3 mb-5 px-4">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === i ? 'w-8 bg-emerald-500' : 'w-1.5 bg-white/10'}`} 
              />
            ))}
          </div>
<span className="text-white/80 text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-1">            Swipe <ChevronRight size={10} />
          </span>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 px-4 pb-4"
        >
          {steps.map((step, i) => (
            <div key={i} className="min-w-[88%] snap-center flex flex-col">
              <div className={`relative overflow-hidden rounded-2xl p-4 border ${step.popColor} bg-[#020617] shadow-xl flex flex-col`}>
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${step.glow} to-transparent opacity-30 pointer-events-none`} />
                
                <div className="relative z-10 flex flex-col">
                  {/* Step header — compact row */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-black shadow-lg shrink-0">
                      {step.number}
                    </div>
                    <h3 className="text-base font-black text-white tracking-tight">{step.title}</h3>
                  </div>
<p className="text-white/70 text-xs font-medium mb-4 leading-snug">{step.desc}</p>                  <div>{step.card}</div>
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
<p className="text-white/70 text-lg font-medium mb-12 max-w-sm">{step.desc}</p>              <div className="mt-auto transition-transform duration-500 group-hover:scale-[1.02]">
                {step.card}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}