'use client';

import { useRef, useState } from 'react';
import { 
  Plus, CheckCircle2, QrCode as QrIcon, 
  Settings2, Smartphone, Mail, FileSpreadsheet 
} from 'lucide-react';
import { LeadModalMockup } from './LeadModalMockup';

/* ─────────────────────────────────────────────────────────
   AGENCY-GRADE INDUSTRIAL STORY STRIP (V8 - FINAL MOBILE)
   - Step 3: Notification Toast floating TOP-RIGHT
   - Original Form Details & Images Restored
   - Fluid Grid & Touch-Safe Spacing
   ───────────────────────────────────────────────────────── */

// ─── STEP 1: THE SCAN ────────────────────────────────────────
function QRCard() {
  return (
    <div className="relative w-full rounded-none border-[3px] border-slate-950 bg-white shadow-[8px_8px_0px_#10b981] overflow-hidden">
      <div className="absolute top-0 right-0 bg-slate-950 text-emerald-400 px-3 py-1 font-[1000] text-[10px] tracking-widest uppercase italic z-10">LIVE_LINK</div>
<div className="p-5 sm:p-6 flex flex-col items-center justify-start bg-slate-50/50">
        <div className="relative p-3 sm:p-4 bg-white border-2 border-slate-950 shadow-[4px_4px_0px_#000] mb-4">
          <img src="/images/qrcode-ridgeline.webp" alt="QR Code" className="w-28 h-28 sm:w-44 sm:h-44 object-contain" />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          {['Truck wrap', 'Yard sign', 'Bio link'].map((label) => (
            <span key={label} className="text-[8px] sm:text-[9px] font-black bg-slate-950 text-white px-2 py-1 uppercase tracking-tighter">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: FULL CUSTOMER FORM ─────────────────────────────
export function FormCard() {
  return (
    <div className="w-full rounded-none border-[3px] border-slate-950 bg-white shadow-[8px_8px_0px_#3b82f6] overflow-hidden text-left">
      <div className="px-3 py-3 flex items-center gap-2.5 border-b-2 border-slate-950"
        style={{ background: 'linear-gradient(135deg, #1a6645, #15803d)' }}>
        <img src="/images/ridgelinelogo.webp" alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-white/20 p-0.5 border border-white/20 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-[12px] font-[1000] text-white leading-tight uppercase italic tracking-tighter truncate">Ridge Line Roofing</p>
          <p className="text-[7px] sm:text-[8px] text-white/70 font-bold uppercase tracking-widest">Submit Your Request</p>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="px-2 py-2 bg-slate-50 border border-slate-200 min-w-0">
            <p className="text-[7px] font-[1000] text-slate-400 uppercase tracking-wider">Name</p>
            <p className="text-[10px] font-bold text-slate-900 truncate">Jason Merritt</p>
          </div>
          <div className="px-2 py-2 bg-slate-50 border border-slate-200 min-w-0">
            <p className="text-[7px] font-[1000] text-slate-400 uppercase tracking-wider">Phone</p>
            <p className="text-[10px] font-bold text-slate-900 truncate">(555) 482-9301</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="px-2 py-2 bg-blue-50 border border-blue-200">
            <p className="text-[7px] font-[1000] text-blue-500 uppercase tracking-wider">Service</p>
            <p className="text-[10px] font-black text-blue-700 uppercase italic">Roofing</p>
          </div>
          <div className="px-2 py-2 bg-slate-50 border border-slate-200 truncate">
            <p className="text-[7px] font-[1000] text-slate-400 uppercase tracking-wider">Address</p>
            <p className="text-[10px] font-bold text-slate-900 truncate">42 Maple Ave</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 min-w-0 px-2 py-2 bg-slate-50 border border-slate-200">
            <p className="text-[7px] font-[1000] text-slate-400 uppercase tracking-wider mb-0.5">Description</p>
            <p className="text-[9px] text-slate-600 leading-snug line-clamp-2 font-medium italic">Storm damaged roof, shingles missing...</p>
          </div>
          <div className="shrink-0 w-12 h-12 border-2 border-slate-950 shadow-[3px_3px_0px_#10b981] overflow-hidden">
            <img src="/images/roof-damage.webp" alt="Roof damage" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="px-2 py-2 bg-indigo-50 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[7px] font-[1000] text-indigo-400 uppercase tracking-wider">Custom Question</p>
            <span className="text-[6px] font-black bg-indigo-200 text-indigo-700 px-1 py-0.5 rounded-none uppercase">CONFIGURABLE</span>
          </div>
          <p className="text-[10px] font-black text-indigo-900 mb-2 truncate">"How old is your roof?"</p>
          <div className="flex gap-1">
            {['0-5', '5-15', '15+'].map((opt, i) => (
              <div key={opt} className={`flex-1 py-1.5 text-[8px] font-black text-center border-2 transition-all ${
                i === 2 ? 'bg-indigo-600 text-white border-slate-950' : 'bg-white border-indigo-100 text-indigo-300'
              }`}>
                {opt}
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 bg-slate-950 text-white text-[10px] font-[1000] text-center uppercase tracking-widest italic shadow-[4px_4px_0px_#10b981]">
          Submit Request
        </button>
      </div>

      <div className="px-3 py-2 border-t-2 border-slate-100 bg-slate-50 flex items-center justify-center gap-1.5">
        <Settings2 size={10} className="text-blue-500" />
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Your logo, colors, and questions</p>
      </div>
    </div>
  );
}

// ─── STEP 3: THE BOARD (NOTIF OVERLAY TOP-RIGHT) ────────────
function CaptureCard() {
  return (
    <div className="relative w-full rounded-none border-[3px] border-slate-950 bg-slate-900 shadow-[8px_8px_0px_#10b981] overflow-hidden">
      <img
        src="/images/dashboard-jason.png"
        alt="Lead2Project Dashboard"
        className="w-full h-auto object-contain -mt-4 sm:-mt-8"
      />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────

export function HeroStoryStrip() {
  const steps = [
    {
      number: '01',
      title: 'THE BLAST',
      desc: 'One QR code for trucks and yard signs. Turn your physical presence into digital leads.',
      card: <QRCard />,
      accent: 'text-yellow-400'
    },
    {
      number: '02',
      title: 'THE CAPTURE',
      desc: 'Customers scan and fill out your customized form. Photos and site details captured instantly.',
      card: <FormCard />,
      accent: 'text-blue-400'
    },
    {
      number: '03',
      title: 'THE BOARD',
      desc: 'Leads land on your visual command center. No manual entry. No lost paper scraps.',
      card: <CaptureCard />,
      accent: 'text-emerald-400'
    },
    {
      number: '04',
      title: 'THE OPS',
      desc: 'One-click quotes, automated reminders, and full CSV exports. Own your business data.',
      card: <LeadModalMockup />,
      accent: 'text-slate-300'
    },
  ];

 return (
    /* ADD ID="how-it-works" AND scroll-mt-20 TO THIS DIV */
    <div 
      id="how-it-works" 
      className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-14 pt-8 md:pt-12 px-4 sm:px-0 scroll-mt-20"
    >
      {steps.map((step, i) => (
       <div 
  key={i} 
  className={`group relative flex flex-col bg-[#0f172a]/40 border border-slate-800 p-6 sm:p-12 transition-all hover:border-slate-600
    ${i % 2 === 0 ? 'md:-translate-y-12' : 'md:translate-y-12'}
    ${i === 0 || i === 2 || i === 3 ? 'md:self-start' : ''}
  `}
>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <span className={`text-5xl sm:text-8xl font-[1000] italic leading-none ${step.accent} opacity-20 group-hover:opacity-100 transition-opacity`}>
              {step.number}
            </span>
            <div className="h-[2px] sm:h-[4px] flex-1 bg-slate-800" />
          </div>

          {/* Text */}
          <div className="relative z-10 mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-5xl font-[1000] text-white uppercase tracking-tighter mb-3 sm:mb-4 italic leading-none">
              {step.title}
            </h3>
            <p className="text-slate-400 font-bold text-xs sm:text-lg leading-relaxed max-w-sm">
              {step.desc}
            </p>
          </div>

         {/* Card */}
<div className={`transform transition-transform duration-500 group-hover:translate-y-[-8px] ${i === 0 || i === 3 ? 'mt-4' : 'mt-auto'}`}>
  {step.card}
</div>

          {/* Corner Decals */}
          <div className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-t-4 border-r-4 border-slate-800/50 group-hover:border-slate-500 transition-colors" />
          <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-b-4 border-l-4 border-slate-800/50 group-hover:border-slate-500 transition-colors" />
        </div>
      ))}
    </div>
  );
}