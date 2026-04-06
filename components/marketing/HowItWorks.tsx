
// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 ANIMATED DEMO — address + date/time + photo drop, loops cleanly
// Replace the existing FastDemoForm function with this entire block
// ─────────────────────────────────────────────────────────────────────────────

'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, MapPin, Truck, Instagram, Calendar, Clock, Mail, Phone, User, LayoutGrid, AlignLeft, Upload, Image, Home as ImageIcon, HomeIcon } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

function FastDemoForm() {
  type Phase = 
    'idle'|
    'step1-typing-name'|'step1-typing-email'|'step1-typing-phone'|'step1-typing-category'|'step1-typing-desc'|'step1-done'|
    'transitioning'|
    'typing-address'|'typing-zip'|'pick-date'|'pick-time'|'dropping-photo'|'done';

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

  const ADDRESS = '42 Maple Ave, Brooklyn NY';
  const ZIP = '11201';

  useEffect(() => {
    let running = true;
    function go(fn: () => void, ms: number) {
      if (!running) return;
      timerRef.current = setTimeout(fn, ms);
    }
    function typeStr(target: string, setter: (v: string) => void, speed: number, onDone: () => void) {
      let i = 0;
      function step() {
        if (!running) return;
        i++;
        setter(target.slice(0, i));
        if (i < target.length) timerRef.current = setTimeout(step, speed + Math.random() * 12);
        else go(onDone, 350);
      }
      go(step, 280);
    }

    function run() {
  setPhase('idle');
  setShowStep1(true);
  // Pre-fill step 1
  setName('Marcus Rivera');
  setEmail('marcus@email.com');
  setPhone('(555) 482-9301');
  setDesc('Damaged roof after storm, needs full inspection');
  // Pre-fill step 2
  setAddress('42 Maple Ave, Brooklyn NY');
  setZip('11201');
  setDate('Apr 12');
  setTime('Morning');
  setPhotoVisible(false);
  setPhotoDrop(false);

  // Show step 1 pre-filled briefly
  go(() => {
    setPhase('step1-done');
    go(() => {
      setPhase('transitioning');
      go(() => {
        // Switch to step 2 — already pre-filled
        setShowStep1(false);
        setPhase('pick-date'); // any non-idle phase so fields show as filled
        go(() => {
          // Pause so user sees step 2 filled out
          setPhase('dropping-photo');
          go(() => {
            setPhotoVisible(true);
            go(() => {
              setPhotoDrop(true);
              setPhase('done');
              go(run, 3000);
            }, 550);
          }, 480);
        }, 1200); // pause on step 2 pre-filled before photo drop
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
    phase === 'step1-done' ? 18 :
    phase === 'step1-typing-desc' ? 14 :
    phase === 'step1-typing-phone' ? 10 :
    phase === 'step1-typing-email' ? 6 :
    phase === 'step1-typing-name' ? 2 : 0;

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden w-full">

      {/* App header */}
<div className="bg-[#f4f5f9] px-4 py-2.5 border-b border-slate-200/70 flex items-center gap-2">
        <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
          <img
            src="/images/ridgelinelogo.png"
            alt="Ridge Line Roofing"
            style={{ width: 28, height: 28, objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:9px;font-weight:900;color:#334155">RL</span>';
            }}
          />
        </div>
        <p className="text-[12px] font-bold text-slate-800">Ridge Line Roofing</p>
      </div>

      {/* Step indicator */}
<div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
            !showStep1 ? 'bg-emerald-500' : 'bg-blue-600'
          }`}>
            {!showStep1
              ? <Check size={12} className="text-white" strokeWidth={3} />
              : <span className="text-[11px] font-black text-white">1</span>
            }
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${
            !showStep1 ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900'
          }`}>Your Info</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
            !showStep1 ? 'bg-blue-600' : 'bg-slate-200'
          }`}>
            <span className={`text-[11px] font-black ${!showStep1 ? 'text-white' : 'text-slate-400'}`}>2</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            !showStep1 ? 'text-slate-900' : 'text-slate-400'
          }`}>Details</span>
        </div>
        <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* STEP 1 */}
      {showStep1 ? (
<div className="px-4 pb-4 space-y-2">
          {/* Full Name */}
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

          {/* Email */}
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Email</label>
            <div className={box(phase === 'step1-typing-email', email.length > 0)}>
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="text-[13px] font-medium text-slate-800 min-h-[18px] flex-1 truncate">
                {email || <span className="text-slate-300">your@email.com</span>}
                {cursor(phase === 'step1-typing-email')}
              </span>
            </div>
          </div>

          {/* Phone */}
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

         {/* Service Needed */}
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Service Needed</label>
                <div className={box(false, true)}>
                  <LayoutGrid size={14} className="text-slate-400 shrink-0" />
                  <span className="text-[13px] font-medium text-slate-800">Select your service...</span>
                </div>
              </div>

          {/* Project Description */}
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

          {/* Continue button */}
          <button className={`w-full py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all duration-300 ${
            phase === 'step1-done' || phase === 'transitioning'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-400'
          }`}>
            {phase === 'transitioning'
              ? <><Check size={14} strokeWidth={3} /> Moving to Details...</>
              : <>Continue <ChevronRight size={14} /></>
            }
          </button>
          <p className="text-center text-[5px] font-bold text-slate-400 uppercase tracking-widest">
            Continue to additional details (optional)
          </p>
        </div>
      ) : (

      /* STEP 2 */
<div className="px-4 pb-4 space-y-2">

        {/* Address field */}
        <div>
          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Address</label>
          <div className={box(phase === 'typing-address', address.length > 0)}>
            <MapPin size={13} className="text-red-400 shrink-0" />
            <span className="text-[12px] font-medium text-slate-800 min-h-[16px] flex-1 truncate">
              {address || <span className="text-slate-300">Start typing your address...</span>}
              {cursor(phase === 'typing-address')}
            </span>
          </div>
        </div>

        {/* Zip + Apt */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Zip Code</label>
            <div className={box(phase === 'typing-zip', zip.length > 0)}>
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span className="text-[12px] font-medium text-slate-800 min-h-[16px]">
                {zip || <span className="text-slate-300">12345</span>}
                {cursor(phase === 'typing-zip')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Unit / Apt</label>
            <div className={box(false, false)}>
              <HomeIcon size={13} className="text-slate-300 shrink-0" />
              <span className="text-[12px] text-slate-300">Apt 4B</span>
            </div>
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Preferred Date</label>
            <div className={box(phase === 'pick-date', date.length > 0)}>
              <Calendar size={13} className="text-emerald-500 shrink-0" />
              <span className={`text-[12px] font-medium min-h-[16px] transition-all ${date ? 'text-slate-800' : 'text-slate-300'}`}>
                {date || 'Pick date'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Preferred Time</label>
            <div className={box(phase === 'pick-time', time.length > 0)}>
              <Clock size={13} className="text-blue-400 shrink-0" />
              <span className={`text-[12px] font-medium min-h-[16px] transition-all ${time ? 'text-slate-800' : 'text-slate-300'}`}>
                {time || 'Morning...'}
              </span>
            </div>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
            Photos <span className="font-normal text-slate-400 normal-case">— helps us quote faster</span>
          </label>
          <div className={`border-2 border-dashed rounded-xl transition-all duration-400 ${
            photoDrop ? 'border-blue-400 bg-blue-50' :
            photoVisible ? 'border-blue-300 bg-blue-50/40' :
            'border-slate-200 bg-slate-50'
          }`}>
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
                <p className="text-[8px] text-slate-400 mt-0.5">Max 50MB per file</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
       <button className={`w-full py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-2 transition-all duration-500 shadow-sm ${
          phase === 'done' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
        }`}>
          {phase === 'done'
            ? <><Check size={14} strokeWidth={3} /> Details Submitted!</>
            : <><Upload size={14} /> Submit Details</>
          }
        </button>
      </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — HOW IT WORKS (combined: QR everywhere + 3 step cards)
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useFadeIn();

  const steps = [
    {
      number: '01',
      tag: 'Your Link',
      title: 'Share your link everywhere',
      desc: 'Sign up and instantly get a custom link and QR code. Put it on your truck, yard sign, Instagram, Facebook, email signature — anywhere customers can find you. One scan, no app, no login needed.',
      visual: 'image',
      image: '/images/qr-scan-2.png',
      color: 'from-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-blue-500/40',
      badge: 'Yard Sign QR',
    },
    {
      number: '02',
      tag: 'Your Form',
      title: 'Customers fill your custom form',
      desc: 'They submit through your branded intake form — you control every field. Name, address, job type, preferred date, custom questions, photos. You get exactly what you need, nothing you don\'t.',
      visual: 'demo-form',
      color: 'from-indigo-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/40',
      badge: null,
    },
    {
      number: '03',
      tag: 'Your Dashboard',
      title: 'Manage everything in one place',
      desc: 'Every lead lands on your dashboard instantly. Quote, schedule, track payments, send one-click branded emails, assign tasks to your team, and export your data anytime. No more sticky notes or lost jobs.',
      visual: 'image',
      image: '/images/dashboard-jobsite.png',
      color: 'from-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      badge: 'Lead Dashboard',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 px-6 overflow-hidden"
      style={{ backgroundColor: '#06080F', borderTop: '1px solid rgba(255,255,255,0.03)' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── PART 1 — Text left, image right ── */}
        <div
          ref={ref}
          className="mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT — copy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-px" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: '#6366f1' }}>
                  The Workflow
                </span>
                <div className="w-12 h-px" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)' }} />
              </div>

              <h2
                className="font-black tracking-tight leading-none mb-6 text-white"
                style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}
              >
                One link.<br />
                <span className="font-medium italic" style={{ color: '#374151' }}>Everything else</span><br />
                takes care of itself.
              </h2>

              <p className="text-base font-medium leading-relaxed mb-10" style={{ color: '#64748b', maxWidth: 480 }}>
                Share your link anywhere customers can find you. They fill out your form, it lands on your dashboard, and you manage the whole job from there.
              </p>

              {/* Channel pills */}
              <div className="flex flex-col gap-3">
                {[
                  { icon: <Truck size={14} />, label: 'Truck wrap & decals' },
                  { icon: <Instagram size={14} />, label: 'Instagram & Facebook' },
                  { icon: <MapPin size={14} />, label: 'Yard signs & door hangers' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-bold w-fit"
                    style={{
                      borderColor: 'rgba(255,255,255,0.06)',
                      color: '#64748b',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <span style={{ color: '#6366f1' }}>{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — image */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(24px)',
                transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s',
              }}
            >
              <img
                src="/images/qrfeature.png"
                alt="QR code on truck, yard sign, and social media"
                className="w-full h-auto block"
              />
            </div>

          </div>
        </div>

        {/* ── PART 2 — 3 step cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`group relative flex flex-col rounded-[2.5rem] overflow-hidden transition-all duration-700 ${step.borderColor} ${
                i === 1 ? 'lg:scale-[1.05] z-10' : ''
              } ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              style={{
                background: '#0B0F1A',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: i === 1 ? '0 0 50px rgba(0,0,0,0.5)' : 'none',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : `translateY(${40 + i * 20}px)`,
                transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`,
              }}
            >
              {/* Hover glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
              />

              <div className="relative p-8 md:p-10 flex flex-col h-full">
                {/* Step tag */}
                <div className="flex items-center justify-between mb-8">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full"
                    style={{
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#9ca3af',
                    }}
                  >
                    Step {step.number}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:text-white/40"
                    style={{ color: '#4b5563' }}
                  >
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p
                  className="text-[15px] font-medium leading-relaxed mb-10"
                  style={{ color: '#6b7280' }}
                >
                  {step.desc}
                </p>

                {/* Visual */}
                <div className="mt-auto relative">
                  {step.visual === 'demo-form' ? (
                    <div className="relative pt-4 flex justify-center">
                      <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full"
                        style={{ background: 'rgba(99,102,241,0.1)', filter: 'blur(80px)' }}
                      />
                      <div
                        className="relative w-full shadow-2xl overflow-hidden"
                        style={{
                          maxWidth: 280,
                          height: 520,
                          borderRadius: '2.5rem',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        <FastDemoForm />
                      </div>
                    </div>
                  ) : (
                    <div
                      className="relative mx-auto overflow-hidden transition-all duration-500 shadow-2xl"
                      style={{
                        maxWidth: 280,
                        height: 520,
                        borderRadius: '2.5rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: '#030712',
                      }}
                    >
                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          background: 'linear-gradient(to tr, transparent, rgba(255,255,255,0.02), rgba(255,255,255,0.05))',
                        }}
                      />
                      <div
                        className="absolute inset-x-0 bottom-0 z-10"
                        style={{
                          height: 128,
                          background: 'linear-gradient(to top, #030712, transparent)',
                          opacity: 0.9,
                        }}
                      />
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                        style={{ opacity: 0.6 }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      />
                      {step.badge && (
                        <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center">
                          <div
                            className="px-4 py-2 rounded-full"
                            style={{
                              background: 'rgba(0,0,0,0.4)',
                              backdropFilter: 'blur(12px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <span
                              className="text-[10px] font-black uppercase tracking-widest italic"
                              style={{ color: 'rgba(255,255,255,0.6)' }}
                            >
                              {step.badge}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}



export default HowItWorks;