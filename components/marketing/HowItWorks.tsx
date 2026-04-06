'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, ChevronDown, MapPin, Truck, Instagram, Calendar, Clock, Mail, Phone, User, LayoutGrid, AlignLeft, Upload, Image as ImageIcon, Home } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ─────────────────────────────────────────────────────────────────────────────
// Animated demo form
// ─────────────────────────────────────────────────────────────────────────────

function FastDemoForm({ onSubmit }: { onSubmit?: () => void }) {
  type Phase =
    'idle' |
    'step1-typing-name' | 'step1-typing-email' | 'step1-typing-phone' | 'step1-typing-desc' | 'step1-done' |
    'transitioning' |
    'typing-address' | 'typing-zip' | 'pick-date' | 'pick-time' | 'dropping-photo' | 'done';

  const [phase, setPhase] = useState<Phase>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [photoVisible, setPhotoVisible] = useState(false);
  const [photoDrop, setPhotoDrop] = useState(false);
  const [showStep1, setShowStep1] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let running = true;
    function go(fn: () => void, ms: number) {
      if (!running) return;
      timerRef.current = setTimeout(fn, ms);
    }

    function run() {
      setPhase('idle');
      setShowStep1(true);
      setName('Marcus Rivera');
      setEmail('marcus@email.com');
      setPhone('(555) 482-9301');
      setDesc('Damaged roof after storm, needs full inspection');
      setAddress('42 Maple Ave, Brooklyn NY');
      setZip('11201');
      setDate('Apr 12');
      setTime('Morning');
      setPhotoVisible(false);
      setPhotoDrop(false);

      go(() => {
        setPhase('step1-done');
        go(() => {
          setPhase('transitioning');
          go(() => {
            setShowStep1(false);
            setPhase('pick-date');
            go(() => {
              setPhase('dropping-photo');
              go(() => {
                setPhotoVisible(true);
                go(() => {
                  setPhotoDrop(true);
                  setPhase('done');
                  onSubmit?.();
                  go(run, 3000);
                }, 550);
              }, 480);
            }, 1200);
          }, 700);
        }, 1200);
      }, 300);
    }

    run();
    return () => { running = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const cursor = (active: boolean) =>
    active ? <span className="inline-block w-px h-3 bg-blue-500 ml-0.5 align-middle animate-pulse" /> : null;

  const box = (active: boolean, filled: boolean) =>
    `w-full border rounded-xl px-3 py-2 flex items-center gap-2 transition-all duration-150 bg-white ${
      active ? 'border-blue-400 ring-2 ring-blue-50' : filled ? 'border-slate-200' : 'border-slate-100 bg-slate-50'
    }`;

  const progress =
    phase === 'done' ? 100 :
    phase === 'dropping-photo' ? 85 :
    phase === 'pick-time' ? 70 :
    phase === 'pick-date' ? 55 :
    phase === 'typing-zip' ? 42 :
    phase === 'typing-address' ? 30 :
    phase === 'transitioning' ? 20 :
    phase === 'step1-done' ? 18 : 0;

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden w-full">
      {/* Header */}
      <div className="bg-[#f4f5f9] px-4 py-2.5 border-b border-slate-200/70 flex items-center gap-2">
        <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
          <img src="/images/ridgelinelogo.png" alt="Ridge Line Roofing" style={{ width: 28, height: 28, objectFit: 'contain' }} />
        </div>
        <p className="text-[12px] font-bold text-slate-800">Ridge Line Roofing</p>
      </div>

      {/* Step indicator */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${!showStep1 ? 'bg-emerald-500' : 'bg-blue-600'}`}>
            {!showStep1 ? <Check size={12} className="text-white" strokeWidth={3} /> : <span className="text-[11px] font-black text-white">1</span>}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${!showStep1 ? 'text-slate-400 line-through' : 'text-slate-900'}`}>Your Info</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${!showStep1 ? 'bg-blue-600' : 'bg-slate-200'}`}>
            <span className={`text-[11px] font-black ${!showStep1 ? 'text-white' : 'text-slate-400'}`}>2</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${!showStep1 ? 'text-slate-900' : 'text-slate-400'}`}>Details</span>
        </div>
        <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {showStep1 ? (
        <div className="px-4 pb-4 space-y-2">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
            <div className={box(phase === 'step1-typing-name', name.length > 0)}>
              <User size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-800 min-h-[16px] flex-1">
                {name || <span className="text-slate-300">John Smith</span>}
                {cursor(phase === 'step1-typing-name')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</label>
            <div className={box(phase === 'step1-typing-email', email.length > 0)}>
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-800 min-h-[16px] flex-1 truncate">
                {email || <span className="text-slate-300">your@email.com</span>}
                {cursor(phase === 'step1-typing-email')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone</label>
            <div className={box(phase === 'step1-typing-phone', phone.length > 0)}>
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-800 min-h-[16px] flex-1">
                {phone || <span className="text-slate-300">(555) 000-0000</span>}
                {cursor(phase === 'step1-typing-phone')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Service Needed</label>
            <div className={box(false, true)}>
              <LayoutGrid size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-800">Roofing</span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Tell us about your project</label>
            <div className={`${box(phase === 'step1-typing-desc', desc.length > 0)} items-start min-h-[48px]`}>
              <AlignLeft size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] font-medium text-slate-800 min-h-[16px] flex-1">
                {desc || <span className="text-slate-300">Describe the job...</span>}
                {cursor(phase === 'step1-typing-desc')}
              </span>
            </div>
          </div>
          <button className={`w-full py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all duration-300 ${phase === 'step1-done' || phase === 'transitioning' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            {phase === 'transitioning' ? <><Check size={14} strokeWidth={3} /> Moving to Details...</> : <>Continue <ChevronRight size={14} /></>}
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4 space-y-2">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Address</label>
            <div className={box(phase === 'typing-address', address.length > 0)}>
              <MapPin size={13} className="text-red-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-800 min-h-[16px] flex-1 truncate">
                {address || <span className="text-slate-300">Start typing your address...</span>}
                {cursor(phase === 'typing-address')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Zip Code</label>
              <div className={box(phase === 'typing-zip', zip.length > 0)}>
                <MapPin size={13} className="text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium text-slate-800 min-h-[16px]">
                  {zip || <span className="text-slate-300">12345</span>}
                  {cursor(phase === 'typing-zip')}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Unit / Apt</label>
              <div className={box(false, false)}>
                <Home size={13} className="text-slate-300 shrink-0" />
                <span className="text-[11px] text-slate-300">Apt 4B</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Preferred Date</label>
              <div className={box(phase === 'pick-date', date.length > 0)}>
                <Calendar size={13} className="text-emerald-500 shrink-0" />
                <span className={`text-[11px] font-medium min-h-[16px] ${date ? 'text-slate-800' : 'text-slate-300'}`}>{date || 'Pick date'}</span>
              </div>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Preferred Time</label>
              <div className={box(phase === 'pick-time', time.length > 0)}>
                <Clock size={13} className="text-blue-400 shrink-0" />
                <span className={`text-[11px] font-medium min-h-[16px] ${time ? 'text-slate-800' : 'text-slate-300'}`}>{time || 'Morning'}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
              Photos <span className="font-normal text-slate-400 normal-case">— helps us quote faster</span>
            </label>
            <div className={`border-2 border-dashed rounded-xl transition-all duration-400 ${photoDrop ? 'border-blue-400 bg-blue-50' : photoVisible ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50'}`}>
              {photoDrop ? (
                <div className="p-2">
                  <div className="relative w-full h-[48px] rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-slate-400 to-slate-600" />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-700" style={{ clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)' }} />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-[8px] font-medium">roof-photo.jpg</p>
                    </div>
                  </div>
                </div>
              ) : photoVisible ? (
                <div className="py-2 text-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 animate-bounce">
                    <ImageIcon size={14} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-blue-500">Drop photo here...</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                    <ImageIcon size={14} className="text-slate-400" />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500">Click or drag photos here</p>
                </div>
              )}
            </div>
          </div>
          <button className={`w-full py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all duration-500 shadow-sm ${phase === 'done' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
            {phase === 'done' ? <><Check size={14} strokeWidth={3} /> Details Submitted!</> : <><Upload size={14} /> Submit Details</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead card that appears after form submit
// ─────────────────────────────────────────────────────────────────────────────

function LeadCard({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}
      className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">New Lead</span>
        </div>
        <span className="text-[10px] text-slate-500 font-medium">just now</span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-black text-white">Marcus Rivera</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">42 Maple Ave, Brooklyn NY · 11201</p>
          </div>
          <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg" style={{ background: '#6366f125', color: '#818cf8' }}>Roofing</span>
        </div>

        <p className="text-[12px] text-slate-300 leading-relaxed mb-4">
          Damaged roof after storm, needs full inspection
        </p>

        {/* Details row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Date', value: 'Apr 12' },
            { label: 'Time', value: 'Morning' },
            { label: 'Photos', value: '1 file' },
          ].map(d => (
            <div key={d.label} className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{d.label}</p>
              <p className="text-[11px] font-bold text-white">{d.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 rounded-xl text-[11px] font-black text-white bg-indigo-600">
            Schedule →
          </button>
          <button className="py-2 rounded-xl text-[11px] font-black border border-white/10 text-slate-400">
            AI Brief ✦
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Updated Main section with better Readability & Colors
// ─────────────────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const { ref, visible } = useFadeIn();
  const [leadVisible, setLeadVisible] = useState(true);

  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 px-4 md:px-6 overflow-hidden"
      style={{ backgroundColor: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Section 1: The "One Link" Hook ── */}
        <div
          ref={ref}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-24 md:mb-32"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Left Side: Copy */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">The Workflow</span>
            </div>

            <h2 className="font-black tracking-tight leading-[1.1] mb-6 text-white text-4xl md:text-5xl lg:text-7xl">
              One link.<br />
              <span className="text-slate-500 italic font-serif">Everything else</span><br />
              <span className="text-blue-500">is automated.</span>
            </h2>

            <p className="text-base md:text-lg font-medium leading-relaxed mb-8 text-slate-400 max-w-md mx-auto lg:mx-0">
              Your unique QR code goes on trucks, yard signs, and social bios. Customers fill it out; you get the lead.
            </p>

            {/* Pills Container */}
<div className="flex flex-wrap justify-center lg:justify-start gap-3 max-w-xl mx-auto lg:mx-0">
  {[
    { icon: <Truck size={14} />, label: 'Truck Wraps', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: <Instagram size={14} />, label: 'Social Media', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { icon: <MapPin size={14} />, label: 'Yard Signs', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: <Mail size={14} />, label: 'Email Footers', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: <LayoutGrid size={14} />, label: 'Door Hangers', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ].map((item) => (
    <div
      key={item.label}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full 
        border border-white/10 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.5)]
        backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/20
        ${item.bg}
      `}
    >
      <span className={`${item.color} shrink-0`}>{item.icon}</span>
      <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-white/90">
        {item.label}
      </span>
    </div>
  ))}
</div>
          </div>

          {/* Right Side: Image/Visual */}
          <div className="relative order-1 lg:order-2 w-full max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-blue-600/20 blur-[80px] rounded-full" />
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="/images/qrfeature.png" alt="QR Feature" className="w-full h-auto block" />
            </div>
          </div>
        </div>

        {/* ── Section 2: The Form -> Lead Sync ── */}
        <div className="relative mt-20">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="font-black text-white tracking-tight mb-4 text-3xl md:text-5xl">
              From Lead <span className="text-slate-600">to</span> Project.
            </h3>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-[12px]">
              Watch it happen in real-time
            </p>
          </div>

          {/* THE SYNC INTERFACE */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-center max-w-5xl mx-auto">
            
            {/* 1. Customer Form */}
            <div className="w-full max-w-[360px] order-1">
               <div className="flex items-center justify-between mb-4 px-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Customer View</p>
                 <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Live Demo</span>
               </div>
               <FastDemoForm onSubmit={() => setLeadVisible(true)} />
            </div>

            {/* 2. The Connector (Rotates on Mobile) */}
            <div className="flex flex-col items-center justify-center py-4 lg:py-0 order-2">
               {/* Mobile Arrow (Points Down) */}
               <div className="lg:hidden flex flex-col items-center gap-2">
                 <div className="h-8 w-px bg-gradient-to-b from-blue-500/50 to-transparent" />
                 <div className="w-10 h-10 rounded-full border border-blue-500/30 flex items-center justify-center">
                    <ChevronDown className="text-blue-500 animate-bounce" size={20} />
                 </div>
               </div>

               {/* Desktop Arrow (Points Right) */}
               <div className="hidden lg:flex flex-col items-center gap-4">
                  <div className="h-24 w-px bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />
                  <div className="w-12 h-12 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center">
                     <ChevronRight className="text-blue-500" size={24} />
                  </div>
                  <div className="h-24 w-px bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />
               </div>
            </div>

            {/* 3. Business Dashboard Card */}
            <div className="w-full max-w-[360px] order-3">
               <div className="flex items-center justify-between mb-4 px-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Dashboard</p>
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Instant</span>
               </div>
               <LeadCard visible={leadVisible} />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}