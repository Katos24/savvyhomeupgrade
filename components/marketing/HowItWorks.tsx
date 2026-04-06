'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, ChevronRight, MapPin, Truck, Instagram, Calendar, Clock, Mail, Phone, User, LayoutGrid, AlignLeft, Upload, Image as ImageIcon, Home } from 'lucide-react';
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
// Main section
// ─────────────────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const { ref, visible } = useFadeIn();
  const [leadVisible, setLeadVisible] = useState(false);

  return (
    <section
      id="how-it-works"
      className="py-24 px-6 overflow-hidden"
      style={{ backgroundColor: '#06080F', borderTop: '1px solid rgba(255,255,255,0.03)' }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ── Part 1: QR / link section ── */}
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: '#6366f1' }}>The Workflow</span>
              <div className="w-12 h-px" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
            </div>

            <h2 className="font-black tracking-tight leading-none mb-6 text-white" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              One link.<br />
              <span className="font-medium italic" style={{ color: '#374151' }}>Everything else</span><br />
              takes care of itself.
            </h2>

            <p className="text-base font-medium leading-relaxed mb-10" style={{ color: '#64748b', maxWidth: 480 }}>
              Share your link anywhere customers can find you. They fill out your form, it lands on your dashboard instantly.
            </p>

            <div className="flex flex-col gap-3">
              {[
                { icon: <Truck size={14} />, label: 'Truck wrap & decals' },
                { icon: <Instagram size={14} />, label: 'Instagram & Facebook' },
                { icon: <MapPin size={14} />, label: 'Yard signs & door hangers' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-bold w-fit"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#64748b', background: 'rgba(255,255,255,0.02)' }}
                >
                  <span style={{ color: '#6366f1' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — QR image */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(24px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s',
            }}
          >
            <img src="/images/qrfeature.png" alt="QR code on truck, yard sign, and social media" className="w-full h-auto block" />
          </div>
        </div>

        {/* ── Part 2: Form → Lead card ── */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          {/* Label */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: '#64748b' }}>
              What your customers see
            </p>
            <h3 className="font-black text-white tracking-tight" style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}>
              They fill it out.{' '}
              <span style={{ color: '#1a6645' }}>You see it instantly.</span>
            </h3>
          </div>

          {/* Split: form + arrow + lead card */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center max-w-4xl mx-auto">

            {/* Form */}
            <div style={{ maxWidth: 340, margin: '0 auto', width: '100%' }}>
              <FastDemoForm onSubmit={() => setLeadVisible(true)} />
            </div>

            {/* Arrow */}
            <div className="hidden lg:flex flex-col items-center gap-2">
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <path d="M10 16h12M18 12l4 4-4 4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Lead card */}
            <div style={{ maxWidth: 340, margin: '0 auto', width: '100%' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#475569' }}>
                Your dashboard
              </p>
              <LeadCard visible={leadVisible} />
              {!leadVisible && (
                <div className="mt-4 text-center">
                  <p className="text-[11px] font-medium" style={{ color: '#334155' }}>
                    Waiting for submission...
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}