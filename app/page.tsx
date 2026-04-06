'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardCycler from '@/components/marketing/DashboardCycler';
import {
  ArrowRight, Zap, Check, Menu, X,
  QrCode, Bot, Mail, BarChart2, ChevronDown, XCircle,
  Globe, User, Phone, FileText, ChevronRight, DollarSign,
  Search, LayoutGrid, AlignLeft, Sparkles, Workflow, Grid, Users,
  Calendar, Clock, Plus, SlidersHorizontal, Settings, Copy, ExternalLink, CreditCard, MessageCircle, Download,
  MapPin, HomeIcon, Image as ImageIcon, Upload, Truck, Instagram, Bell, List
} from 'lucide-react';
import SettingsPreviewCard from '@/components/demo/SettingsPreviewCard';

function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#F2EDE4]/95 backdrop-blur-xl border-b border-[#D9D2C8] shadow-sm' : 'bg-[#F2EDE4]/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/Lead2ProjectLogo.png" alt="L2P" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing']].map(([href,label]) => (
            <a key={href} href={href} className="text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95">
            Start Free Trial
          </Link>
          <button onClick={() => setOpen(o => !o)} className="md:hidden p-1 text-slate-400">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-[#F2EDE4] border-t border-[#D9D2C8] px-6 py-5 space-y-4">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block text-base font-semibold text-slate-700">{label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex flex-col overflow-hidden" style={{ backgroundColor: '#F2EDE4' }}>
      <Nav />

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-5 w-full pt-24 pb-16">

          {/* Copy — centered */}
          <div
            className="text-center space-y-6 max-w-3xl mx-auto"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(20px)',
              transition: 'all 0.7s ease',
            }}
          >
            {/* Eyebrow */}
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold border"
                style={{ background: '#E8F4EF', borderColor: '#A8D5C2', color: '#1a6645' }}
              >
                <Zap className="w-3 h-3" style={{ fill: '#1a6645' }} />
                Built for contractors & service businesses
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-black tracking-tight"
              style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: '#0F1F3D', lineHeight: 1.0 }}
            >
              Run your entire business<br />
              <span style={{ color: '#1a6645' }}>from one link.</span>
            </h1>

            {/* Sub */}
           <p
  className="font-medium leading-relaxed mx-auto max-w-[560px]"
  style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#4A5568' }}
>
  Stop writing quotes from scratch, chasing unpaid jobs, and losing leads to missed calls. Sign up in 2 minutes, get your custom booking link, and manage every lead, quote, schedule, and payment from one dashboard — with one-click emails that do the follow-up for you.
</p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-black text-white transition-all active:scale-95 hover:-translate-y-0.5"
                style={{ backgroundColor: '#1a6645', boxShadow: '0 8px 24px rgba(26,102,69,0.25)' }}
              >
                Get Your Free Booking Link <ArrowRight size={18} />
              </Link>
              <a
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold border transition-all"
                style={{ background: 'white', borderColor: '#D1C9BD', color: '#0F1F3D' }}
              >
                See How It Works
              </a>
            </div>

            {/* Trust line */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              {['Setup in 2 minutes', '14-day free trial', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check size={11} strokeWidth={3} style={{ color: '#1a6645' }} />
                  <span className="text-[12px] font-bold" style={{ color: '#6B7280' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div
            className="mt-16"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(24px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
            }}
          >
            <img
              src="/images/heroimagefull.png"
              alt="Lead2Project dashboard"
              className="w-full h-auto mx-auto block"
              style={{
                borderRadius: 20,
                maxWidth: 900,
                filter: 'drop-shadow(0 24px 60px rgba(0,0,0,0.15))',
              }}
            />
          </div>

        </div>
      </div>

      {/* Pain points strip */}
      <div style={{ background: '#0F1F3D', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {[
  'Writing the same quote email over and over',
  'No idea which customers still owe you money',
  'Forgetting to follow up on unscheduled jobs',
  'Starting the day with no idea whats on the schedule',
].map((pain) => (
              <div key={pain} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.5" />
                    <path d="M5 5l4 4M9 5l-4 4" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <p className="text-[12px] font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {pain}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <p className="text-[14px] font-black text-white">
  Lead2Project fixes all of this.{' '}
  <span style={{ color: '#4ade80' }}>With one link.</span>
</p>
<p className="text-[11px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
  One-click quote, schedule & payment emails · Daily 6AM digest · Full job tracking
</p>
          </div>
        </div>
      </div>

      <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #D9D2C8, transparent)' }} />
    </section>
  );
}

export { useFadeIn, Nav, Hero };


// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 ANIMATED DEMO — address + date/time + photo drop, loops cleanly
// Replace the existing FastDemoForm function with this entire block
// ─────────────────────────────────────────────────────────────────────────────
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




function TheBoard() {
  const { ref, visible } = useFadeIn();
 
  const views = [
    {
      icon: <LayoutGrid size={16} />,
      label: 'Card view',
      desc: 'See every job as a visual card. Check dates, payment status, and photos at a glance. Your daily action list.',
    },
    {
      icon: <List size={16} />,
      label: 'Table view',
      desc: 'Need to update 20 jobs at once? Switch to table view for bulk edits and export everything to CSV in one click.',
    },
    {
      icon: <Calendar size={16} />,
      label: 'Calendar view',
      desc: "See your team's full schedule at a glance. Spot gaps, avoid double bookings, plan the week in seconds.",
    },
  ];
 
  return (
    <section className="py-24 px-6" style={{ backgroundColor: '#F7F5F0' }}>
      <div className="max-w-6xl mx-auto">
 
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-16 max-w-3xl mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Your command center
          </p>
          <h2
            className="font-black tracking-tight leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 52px)', color: '#0F1F3D' }}
          >
            Every lead. Every job. Every dollar.{' '}
            <span style={{ color: '#1a6645' }}>One screen.</span>
          </h2>
          <p className="text-lg font-medium leading-relaxed" style={{ color: '#4A5568' }}>
            See everything at a glance — total leads, active jobs, revenue, and what's still unpaid. Switch between three views depending on what you need.
          </p>
        </div>
 
        {/* Dashboard cycler — stats + chrome + auto-cycling views, includes dark/light toggle */}
        <div
          className="mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          <DashboardCycler />
        </div>
 
        {/* 3 view callouts */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(16px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
          }}
        >
          {views.map((view, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border"
              style={{ background: '#fff', borderColor: '#E5E0D8' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: '#E8F4EF' }}
              >
                <span style={{ color: '#1a6645' }}>{view.icon}</span>
              </div>
              <p className="text-sm font-black mb-2" style={{ color: '#0F1F3D' }}>{view.label}</p>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>{view.desc}</p>
            </div>
          ))}
        </div>
 
        {/* CSV callout */}
        <div
          className="mt-8 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{
            background: '#E8F4EF',
            border: '1px solid #A8D5C2',
            opacity: visible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}
        >
          <div className="flex items-center gap-3">
            <Download size={18} style={{ color: '#1a6645', flexShrink: 0 }} />
            <p className="text-sm font-bold" style={{ color: '#1a6645' }}>
              Your data is always yours — export everything to CSV in one click for bookkeeping, taxes, or reporting.
            </p>
          </div>
          <Link
            href="/signup"
            className="text-[12px] font-black px-4 py-2 rounded-xl whitespace-nowrap transition-all active:scale-95"
            style={{ background: '#1a6645', color: '#fff' }}
          >
            Get Started Free
          </Link>
        </div>
 
      </div>
    </section>
  );
}

// FEATURE BENTO — replaces the old tabbed LeadCapture section
// Drop-in replacement. Requires: lucide-react, useFadeIn hook from your file.
// Visuals are placeholder divs — swap each {/* VISUAL */} comment for your img.
// ─────────────────────────────────────────────────────────────────────────────
 
function FeatureBento() {
  const { ref, visible } = useFadeIn();
 
  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">
 
        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Built for the field, managed from the desk
          </p>
          <h2 className="font-black leading-tight tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5vw, 58px)', color: '#0F1F3D' }}>
            One tool. Zero gaps.<br />
            <span style={{ color: '#1a6645' }}>Leads in, money out.</span>
          </h2>
          <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: '#4A5568' }}>
            From the first QR scan to the final payment — no sticky notes, no missed jobs, no chasing clients.
          </p>
        </div>
 
        {/* Bento Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.15s' }}
        >
 
          {/* ── 01 Capture — wide */}
          <div className="lg:col-span-7 flex flex-col rounded-[1.5rem] overflow-hidden border" style={{ background: 'white', borderColor: '#E5E0D8' }}>
            {/* VISUAL — swap for: <img src="/images/qrfeature.png" className="w-full h-full object-cover object-top" alt="Intake form" /> */}
            <div className="flex-1 min-h-[220px]" style={{ background: '#E8F4EF' }} />
            <div className="p-6 border-t" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#1a6645' }}>01 — Capture</p>
              <h3 className="font-black text-xl mb-2 leading-tight" style={{ color: '#0F1F3D' }}>One form. Every lead.</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>
                Branded QR on your truck, yard signs, and social bio. Collect photos, videos, budget, and job details — lands instantly on your dashboard.
              </p>
            </div>
          </div>
 
          {/* ── 02 Schedule — narrow */}
          <div className="lg:col-span-5 flex flex-col rounded-[1.5rem] overflow-hidden border" style={{ background: 'white', borderColor: '#E5E0D8' }}>
            {/* VISUAL — swap for: <img src="/images/schedulefeature.png" className="w-full h-full object-cover object-top" alt="Schedule board" /> */}
            <div className="flex-1 min-h-[220px]" style={{ background: '#EEF2FF' }} />
            <div className="p-6 border-t" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#1a6645' }}>02 — Schedule</p>
              <h3 className="font-black text-xl mb-2 leading-tight" style={{ color: '#0F1F3D' }}>One click to confirm.</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>
                Assign crew and send a branded confirmation email instantly. No more "when are you coming?" texts.
              </p>
            </div>
          </div>
 
          {/* ── 03 Quote — narrow */}
          <div className="lg:col-span-4 flex flex-col rounded-[1.5rem] overflow-hidden border" style={{ background: 'white', borderColor: '#E5E0D8' }}>
            {/* VISUAL — swap for: <img src="/images/quotefeature.png" className="w-full h-full object-cover object-top" alt="Quote interface" /> */}
            <div className="flex-1 min-h-[220px]" style={{ background: '#FFF7ED' }} />
            <div className="p-6 border-t" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#1a6645' }}>03 — Quote &amp; Win</p>
              <h3 className="font-black text-xl mb-2 leading-tight" style={{ color: '#0F1F3D' }}>Quote from the driveway.</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>
                Templates + AI project brief. Clients accept with one tap. Your closing rate goes up because your speed does.
              </p>
            </div>
          </div>
 
          {/* ── 04 Get Paid — wide */}
          <div className="lg:col-span-8 flex flex-col rounded-[1.5rem] overflow-hidden border" style={{ background: 'white', borderColor: '#E5E0D8' }}>
            {/* VISUAL — swap for: <img src="/images/payment-tab.png" className="w-full h-full object-cover object-top" alt="Payment tracking" /> */}
            <div className="flex-1 min-h-[220px]" style={{ background: '#ECFDF5' }} />
            <div className="p-6 border-t" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: '#1a6645' }}>04 — Get Paid</p>
              <h3 className="font-black text-xl mb-2 leading-tight" style={{ color: '#0F1F3D' }}>See exactly who owes you money.</h3>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>
                Track deposits, finals, and your total outstanding balance in one view. Send payment reminders in one click. Export everything to CSV at tax time.
              </p>
            </div>
          </div>
 
          {/* ── 05 Stay Sharp — full width, horizontal on desktop */}
          <div className="lg:col-span-12 flex flex-col lg:flex-row rounded-[1.5rem] overflow-hidden border" style={{ background: 'white', borderColor: '#E5E0D8' }}>
            {/* VISUAL — swap for: <img src="/images/outboxfeature.png" className="w-full lg:w-[420px] h-64 lg:h-auto object-cover object-top flex-shrink-0" alt="Global outbox" /> */}
            <div className="w-full lg:w-[420px] h-64 lg:h-auto flex-shrink-0" style={{ background: '#F0EDE8' }} />
            <div className="p-8 flex flex-col justify-center border-t lg:border-t-0 lg:border-l" style={{ borderColor: '#F0EDE8' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#1a6645' }}>05 — Stay Sharp</p>
              <h3 className="font-black leading-tight mb-3" style={{ fontSize: 'clamp(22px, 3vw, 34px)', color: '#0F1F3D' }}>
                The Global Outbox &amp;<br />Daily Digest.
              </h3>
              <p className="text-base font-medium leading-relaxed mb-5" style={{ color: '#6B7280', maxWidth: 480 }}>
                6AM briefing with today's schedule, overdue tasks, and your outstanding balance. Every quote, confirmation, and reminder is logged — so when a client says "I never got it," you have proof.
              </p>
              <div className="px-4 py-3 text-sm font-bold" style={{ background: '#E8F4EF', borderLeft: '4px solid #1a6645', color: '#1a6645' }}>
                💡 Know your business status without opening the app
              </div>
            </div>
          </div>
 
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PREVIEW INLINE — full height, no scroll, paste above SettingsShowcase
// ─────────────────────────────────────────────────────────────────────────────

const SHOWCASE_CONFIG_ITEMS = [
  { icon: <Workflow className="w-5 h-5" />,   label: 'Pipeline',     desc: 'Customize your lead stages.', color: '#f59e0b', bg: '#fef3c7' },
  { icon: <Grid className="w-5 h-5" />,        label: 'Categories',   desc: 'Each gets its own checklist and pricing template.', color: '#8b5cf6', bg: '#ede9fe' },
  { icon: <FileText className="w-5 h-5" />,   label: 'Booking Form', desc: 'Control what customers fill out.', color: '#f97316', bg: '#ffedd5' },
  { icon: <Mail className="w-5 h-5" />,        label: 'Automations',  desc: 'Branded emails for every touchpoint.', color: '#3b82f6', bg: '#dbeafe' },
  { icon: <Users className="w-5 h-5" />,       label: 'Team',         desc: 'Invite crew and assign leads.', color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: <CreditCard className="w-5 h-5" />,  label: 'Billing',      desc: 'Manage your plan.', color: '#10b981', bg: '#d1fae5' },
];

function ShowcaseLogoInline({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0f172a"/>
      <polygon points="20,7 33,17 33,34 7,34 7,17" fill="#6366f1"/>
      <polygon points="20,5 34,16 6,16" fill="#818cf8"/>
      <rect x="25" y="9" width="4" height="8" rx="1" fill="#818cf8"/>
      <rect x="15" y="23" width="10" height="11" rx="1.5" fill="#1e1b4b"/>
      <rect x="7" y="21" width="7" height="7" rx="1" fill="#1e1b4b"/>
      <line x1="10.5" y1="21" x2="10.5" y2="28" stroke="#6366f1" strokeWidth="1"/>
      <line x1="7" y1="24.5" x2="14" y2="24.5" stroke="#6366f1" strokeWidth="1"/>
    </svg>
  );
}

function SettingsPreviewInline() {
  return (
    <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '122%' }}>
    <div className="bg-[#0f172a] rounded-[2rem] w-full shadow-2xl overflow-hidden border border-white/10">

      {/* Nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">LEAD2PROJECT</span>
        <span className="text-xs text-white/30 font-medium">Settings</span>
      </div>

      {/* Company card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        <div className="h-10 w-full" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }} />
        <div className="px-5 py-4">

          {/* Logo + edit */}
          <div className="flex items-start justify-between mb-4 -mt-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-white shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                <ShowcaseLogoInline size={40} />
              </div>
              <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Logo</p>
            </div>
            <button className="mt-8 flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">
              <Settings className="w-3 h-3" /> EDIT
            </button>
          </div>

          <p className="text-base font-black text-gray-900 mb-1">Torres Roofing & Construction</p>
          <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full text-white mb-4" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }}>
            PRO PLAN
          </span>

          {/* Booking link */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Your Booking Link</p>
                <p className="text-xs font-bold text-gray-700">lead2project.com/<span className="text-indigo-600">torres</span></p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <Copy className="w-3 h-3" /> COPY
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">torres@email.com</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Phone</p>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">(718) 555-0100</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Website</p>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">torresroofing.com</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand Colors</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#667eea' }} />
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#1c0866' }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl">
              <QrCode className="w-4 h-4 text-gray-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">QR Code</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">View Form</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 border border-indigo-200 bg-indigo-50 rounded-xl">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Digest On</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="px-4 pt-5 pb-6">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">System Configuration</p>
        <div className="grid grid-cols-2 gap-3">
          {SHOWCASE_CONFIG_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="text-sm font-black text-gray-900">{item.label}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SHOWCASE
// Left:  SettingsPreviewInline — full height, no scroll, always visible
// Right: 4 pill tabs — clicking shows ONLY the mock, no text below
// ─────────────────────────────────────────────────────────────────────────────

function PipelineTabMock() {
  const stages = [
    { label: 'New',         color: '#3b82f6', locked: true  },
    { label: 'Contacted',   color: '#eab308', locked: false },
    { label: 'Quoted',      color: '#8b5cf6', locked: false },
    { label: 'In Progress', color: '#f97316', locked: false },
    { label: 'Completed',   color: '#10b981', locked: true  },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={14} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 900, color: '#111827', margin: 0 }}>Pipeline stages</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>5 stages configured</p>
          </div>
        </div>
        <div style={{ background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800, padding: '6px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus size={10} /> Add stage
        </div>
      </div>
      <div>
        {stages.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < stages.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: stage.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: stage.locked ? '#9ca3af' : '#111827', margin: 0 }}>{stage.label}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {stage.locked ? '🔒 System required' : 'Custom stage'}
                </p>
              </div>
            </div>
            {!stage.locked && <ChevronDown size={13} style={{ color: '#d1d5db' }} />}
          </div>
        ))}
      </div>
      <div style={{ background: '#111827', padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Save Pipeline</span>
      </div>
    </div>
  );
}

function CategoriesTabMock() {
  const cats = [
    { label: 'Other',                 tasks: 2, items: 2  },
    { label: 'Full Roof Replacement',  tasks: 1, items: 11 },
    { label: 'Roof Repair',            tasks: 2, items: 2  },
    { label: 'Emergency Service',      tasks: 1, items: 3  },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: '#111827', margin: '0 0 2px' }}>Service Categories</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>Auto-load tasks and pricing when a category is selected.</p>
        <div style={{ background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '7px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Plus size={10} /> Add Category
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {cats.map((cat, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid size={14} style={{ color: '#6366f1' }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', margin: 0 }}>{cat.label}</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 800, background: '#1e3a5f', color: '#60a5fa', padding: '2px 7px', borderRadius: 6 }}>✓ {cat.tasks} TASKS</span>
              <span style={{ fontSize: 9, fontWeight: 800, background: '#14532d', color: '#4ade80', padding: '2px 7px', borderRadius: 6 }}>$ {cat.items} ITEMS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              <div style={{ background: '#1e293b', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: '#475569' }}>+ TASKS</div>
              <div style={{ background: '#1e293b', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: '#475569' }}>+ PRICING</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormTabMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 10 }}>
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #dc2626)', padding: '14px 12px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#fff', margin: 0 }}>Request received!</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>A few more details.</p>
        </div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Address...', 'Zip code', 'Preferred date'].map((ph, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 9, color: '#cbd5e1' }}>{ph}</div>
          ))}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #dc2626)', borderRadius: 6, padding: '7px', textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>Submit request</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 9 }}>🔒</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>Step 1 — always collected</span>
          </div>
          <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>Name · Email · Phone · Category</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0f172a' }}>Step 2</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: 4 }}>YOU CONTROL</span>
          </div>
          {[
            { label: 'Service address', on: true },
            { label: 'Preferred date', on: true },
            { label: 'Photo / video upload', on: true },
            { label: 'Preferred time', on: false },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: row.on ? '#0f172a' : '#94a3b8' }}>{row.label}</span>
              <div style={{ width: 26, height: 14, borderRadius: 7, background: row.on ? '#4f46e5' : '#cbd5e1', display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: row.on ? 'flex-end' : 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailsTabMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['Quote', 'Schedule', 'Payment'].map((tab, i) => (
            <div key={i} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: i === 1 ? '#0f172a' : 'transparent', color: i === 1 ? '#f1f5f9' : '#475569', border: i === 1 ? '1px solid #334155' : '1px solid transparent' }}>{tab}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {['{{company_name}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}'].map((v, i) => (
            <span key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '2px 5px', fontSize: 7, fontWeight: 600, color: '#94a3b8', fontFamily: 'monospace' }}>{v}</span>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 7, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Subject</p>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '4px 7px', fontSize: 8, color: '#cbd5e1' }}>Appointment Scheduled - {'{{company_name}}'}</div>
        </div>
        <div>
          <p style={{ fontSize: 7, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Body</p>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '5px 7px', fontSize: 7, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.6 }}>
            Hi {'{{customer_name}}'},<br />Your appointment is confirmed!<br /><br />Date: {'{{scheduled_date}}'}<br />Time: {'{{scheduled_time}}'}
          </div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 7, padding: '6px', textAlign: 'center', fontSize: 9, fontWeight: 800, color: '#f1f5f9' }}>
          Save Templates
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea, #1c0866)', padding: '12px', textAlign: 'center' }}>
          <div style={{ width: 26, height: 26, background: '#fff', borderRadius: 5, margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <ShowcaseLogoInline size={20} />
          </div>
          <p style={{ fontSize: 9, fontWeight: 900, color: '#fff', margin: 0 }}>Torres Roofing</p>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#111827', margin: 0 }}>Appointment Scheduled</p>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6, fontSize: 8, color: '#374151', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 2px' }}>Hi John Smith,</p>
            <p style={{ margin: '0 0 2px' }}>Your appointment is confirmed!</p>
            <p style={{ margin: 0, color: '#94a3b8' }}>Date: Apr 12, 2026<br />Time: 9:00 AM</p>
          </div>
          <p style={{ fontSize: 7, color: '#d1d5db', textAlign: 'center', margin: '4px 0 0' }}>Powered by Lead2Project</p>
        </div>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

function SettingsShowcase() {
  const { ref, visible } = useFadeIn();
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const tabs = [
    { label: 'Pipeline',    title: 'Pipeline stages',             mock: <PipelineTabMock />    },
    { label: 'Categories',  title: 'Service categories',          mock: <CategoriesTabMock />  },
    { label: 'Intake Form', title: 'Booking form settings',       mock: <FormTabMock />        },
    { label: 'Emails',      title: 'Email template editor',       mock: <EmailsTabMock />      },
  ];

  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Settings that actually matter
          </p>
          <h2 className="font-black tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5vw, 58px)', color: '#0F1F3D', lineHeight: 1.05 }}>
            Set it up once.<br />
            <span style={{ color: '#1a6645' }}>It works every time.</span>
          </h2>
          <p className="text-lg font-medium max-w-xl mx-auto leading-relaxed" style={{ color: '#4A5568' }}>
            Your booking form, emails, and pipeline configured exactly how your business works.
          </p>
        </div>

        {/* Split layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s' }}
        >

          {/* LEFT — full settings preview, no scroll, sticky */}
          <div className="lg:sticky lg:top-8">
            <SettingsPreviewInline />
          </div>

          {/* RIGHT — pills + modal below */}
          <div className="flex flex-col gap-4">

            {/* Instruction text */}
            <p className="text-sm font-bold" style={{ color: '#9CA3AF' }}>
              Tap a setting to see how it works →
            </p>

            {/* Pill tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(activeTab === i ? null : i)}
                  className="px-5 py-2.5 rounded-full text-[12px] font-black border transition-all duration-200"
                  style={activeTab === i ? {
                    background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D',
                  } : {
                    background: 'white', color: '#4A5568', borderColor: '#D1C9BD',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mock — only shows when a pill is active, no text below */}
            {activeTab !== null && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: '#fff', borderColor: '#E5E0D8', boxShadow: '0 4px 20px rgba(15,31,61,0.07)' }}
              >
                {/* Just the title, nothing else */}
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#1a6645' }}>
                  {tabs[activeTab].title}
                </p>
                {tabs[activeTab].mock}
              </div>
            )}

            {/* CTA */}
            <div className="p-6 rounded-2xl border mt-2" style={{ background: '#fff', borderColor: '#D9D2C8' }}>
              <p className="font-black text-sm mb-1" style={{ color: '#0F1F3D' }}>Ready to set it up?</p>
              <p className="text-sm font-medium mb-4" style={{ color: '#6B7280' }}>Takes 5 minutes. Free 14-day trial, no credit card needed.</p>
              <Link
                href="/signup"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#1a6645' }}
              >
                Get Started Free <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}


// AI Banner with 3 feature cards, appears after the 2x2 grid


function AIBanner() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className="px-6 py-16 border-y"
      style={{
        backgroundColor: '#080C14',
        borderColor: 'rgba(255,255,255,0.05)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3" /> AI Features — Pro Plan
          </span>
          <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* Headline + cards side by side on desktop */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-10 items-center">

          {/* Left — headline */}
          <div>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-[1.05] mb-3">
              AI that works<br />
              <span className="text-violet-400">before you do.</span>
            </h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Every lead gets analyzed the moment it arrives — no prompts, no setup, no extra steps.
            </p>
          </div>

          {/* Right — 3 feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Sparkles size={16} />,
                title: 'AI Project Brief',
                desc: 'Instant summary of every lead — photos, scope, and job details — ready before your first call.',
                color: '#8B5CF6',
                bg: 'rgba(139,92,246,0.08)',
                border: 'rgba(139,92,246,0.15)',
              },
              {
                icon: <MessageCircle size={16} />,
                title: 'AI Assistant',
                desc: 'Ask anything about your pipeline. Draft follow-ups, get job summaries, pull lead details fast.',
                color: '#6366F1',
                bg: 'rgba(99,102,241,0.08)',
                border: 'rgba(99,102,241,0.15)',
              },
              {
                icon: <FileText size={16} />,
                title: 'AI Quote Draft',
                desc: 'AI suggests line items from job details. You review every number before anything gets sent.',
                color: '#A78BFA',
                bg: 'rgba(167,139,250,0.08)',
                border: 'rgba(167,139,250,0.15)',
                note: 'You approve before sending',
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 16,
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(12px)',
                  transition: `all 0.6s ease ${0.1 + i * 0.1}s`,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}20`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#F1F5F9', margin: 0 }}>{item.title}</p>
                <p style={{ fontSize: 11, color: '#64748B', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
                {item.note && (
                  <p style={{ fontSize: 9, color: item.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>✓ {item.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — THE "ALL-IN-ONE" UPGRADE
// ─────────────────────────────────────────────────────────────────────────────
function Comparison() {
  const { ref, visible } = useFadeIn();

  const comparisons = [
    { 
      label: 'Digital Presence', 
      them: 'Expensive Website + Hosting', 
      us: 'One Link. Socials, QR, or Bio.' 
    },
    { 
      label: 'Lead Capture', 
      them: 'Contact forms that email you', 
      us: 'Smart Link that builds the job' 
    },
    { 
      label: 'Quoting', 
      them: 'Manual PDF creation', 
      us: 'AI-Drafted line items' 
    },
    { 
      label: 'Visibility', 
      them: 'Check 5 different apps', 
      us: 'Track everything in one board' 
    },
    { 
      label: 'Setup', 
      them: 'Weeks of web design', 
      us: 'Live in 2 minutes' 
    },
  ];

  return (
    <section id="compare" className="py-32 px-6 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="text-center mb-20"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s ease' }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4 block underline underline-offset-4">The New Standard</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            No Website? <br/>
            <span className="text-slate-400 font-medium">No Problem.</span>
          </h2>
          <p className="mt-8 text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            You don't need a $3,000 website. You need a **booking link** that works in your Instagram bio, Facebook page, and email signature. 
            One link to capture, quote, and track every single dollar.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="relative z-10 space-y-3">
          {comparisons.map((item, i) => (
            <div 
              key={i} 
              className="group grid grid-cols-1 md:grid-cols-3 items-center p-6 md:p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.1}s` }}
            >
              {/* Category Label */}
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-0">
                {item.label}
              </div>

              {/* The "Them" side */}
              <div className="flex items-center gap-3 text-slate-400 font-medium mb-4 md:mb-0 grayscale opacity-60">
                <XCircle size={18} className="text-slate-300 shrink-0" />
                <span className="text-sm line-through decoration-slate-300 underline-offset-2">{item.them}</span>
              </div>

              {/* The "Us" side */}
              <div className="flex items-center gap-4 bg-blue-50 md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none border border-blue-100 md:border-none shadow-sm md:shadow-none">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Zap size={14} className="text-white fill-current" />
                </div>
                <span className="text-slate-900 font-black text-lg md:text-2xl tracking-tighter leading-none">
                  {item.us}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="mt-16 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Globe size={120} className="text-white" />
           </div>
           <h3 className="text-white text-2xl font-black mb-4 relative z-10">Ready to own your digital storefront?</h3>
           <p className="text-slate-400 font-medium mb-8 relative z-10">Set up your link in under 2 minutes and start tracking jobs today.</p>
           <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all active:scale-95 relative z-10">
              Claim Your Link <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { ref, visible } = useFadeIn();

  const plans = [
    {
      name: 'Basic',
      price: 49.99,
      desc: 'Your entire digital storefront and job tracking in one link.',
      highlight: false,
      cta: 'Start 14-Day Free Trial',
      href: '/signup?plan=basic',
      features: [
        'Custom Booking Link (No Website Needed)',
        'Branded QR Code for Trucks & Signs',
        'Unlimited Lead Capture & Photo Uploads',
        'Visual Lead Board (Kanban & Table)',
        'Job Scheduling & Quote Builder',
        'Custom Pipeline Stages & Task Lists',
        'CSV Export for Bookkeeping',
        'Unlimited Team Members'
      ],
    },
    {
      name: 'Pro',
      price: 79.99,
      desc: 'The complete AI-powered office for contractors who want to scale.',
      highlight: true,
      cta: 'Go Pro — 14 Days Free',
      href: '/signup?plan=pro',
      features: [
        'Everything in Basic',
        'AI Quote Generator from Photos ✦',
        'AI Project Briefs for Crews ✦',
        '6AM Daily Digest Email Briefing ✦',
        'One-Click Email Sending (Quotes/Reminders)',
        'Full Email Outbox & Sent History',
        'Custom Email Templates & Branding',
        'AI Assistant — Ask Anything ✦'
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 bg-[#080C14] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div
          ref={ref}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">Simple Monthly Billing</span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 sm:mb-6">
              One job pays for<br/>
              <span className="text-slate-500">the whole year.</span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg font-medium max-w-xl mx-auto">
              Choose the plan that fits your stage. No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          {/* Plan Cards — always 2 columns */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`group rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 lg:p-10 border transition-all duration-500 relative ${
                  plan.highlight
                    ? 'bg-[#0F172A] border-blue-500 shadow-2xl shadow-blue-900/20'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 sm:-top-4 left-4 sm:left-10 bg-blue-600 text-white text-[7px] sm:text-[10px] font-black uppercase tracking-widest px-3 sm:px-5 py-1.5 sm:py-2 rounded-full shadow-xl whitespace-nowrap">
                    <span className="hidden sm:inline">Recommended for Growth</span>
                    <span className="sm:hidden">Most Popular</span>
                  </div>
                )}

                {/* Plan Name + Price */}
                <div className="mb-4 sm:mb-8 mt-2 sm:mt-0">
                  <h3 className={`text-[10px] sm:text-xl font-black uppercase tracking-widest ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-0.5 sm:gap-1 mt-1 sm:mt-2">
                    <span className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-xs sm:text-lg">/mo</span>
                  </div>
                </div>

                {/* Description — hidden on smallest screens */}
                <p className="hidden sm:block text-slate-400 font-medium mb-6 sm:mb-10 text-sm sm:text-lg leading-relaxed min-h-[60px]">
                  {plan.desc}
                </p>

                {/* CTA Button */}
                <Link
                  href={plan.href}
                  className={`block text-center w-full py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-[8px] sm:text-sm tracking-wider sm:tracking-widest uppercase transition-all active:scale-95 mb-4 sm:mb-10 ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="hidden sm:inline">{plan.cta}</span>
                  <span className="sm:hidden">Try Free</span>
                </Link>

                {/* Features */}
                <div className="space-y-2 sm:space-y-4">
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3 sm:mb-6 border-b border-white/5 pb-2">
                    What's included:
                  </p>
                  <ul className="grid gap-2 sm:gap-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 sm:gap-3">
                        <div className={`mt-0.5 w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 ${
                          f.includes('✦') ? 'bg-violet-500/20' : plan.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Check className={`w-2 h-2 sm:w-3 sm:h-3 ${
                            f.includes('✦') ? 'text-violet-400' : plan.highlight ? 'text-blue-400' : 'text-slate-400'
                          }`} strokeWidth={4} />
                        </div>
                        <span className={`text-[9px] sm:text-sm font-semibold tracking-tight leading-tight ${
                          f.includes('✦') ? 'text-violet-200' : 'text-slate-300'
                        }`}>
                          {f.replace(' ✦', '')}
                          {f.includes('✦') && (
                            <span className="ml-1 sm:ml-2 text-[7px] sm:text-[8px] bg-violet-500/20 text-violet-400 px-1 sm:px-1.5 py-0.5 rounded-md font-black border border-violet-500/30 uppercase tracking-tighter">
                              AI
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 sm:mt-20 flex flex-col items-center justify-center gap-6 sm:gap-8">
         
            
            <div className="flex items-center gap-6 sm:gap-10 opacity-30 grayscale pointer-events-none">
              <span className="text-white font-black tracking-tighter text-base sm:text-xl uppercase">Stripe Secure</span>
              <span className="text-white font-black tracking-tighter text-base sm:text-xl uppercase">256-Bit SSL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — FAQ
// Status: Ready. Add / remove questions as needed.
// ─────────────────────────────────────────────────────────────────────────────
function FAQ() {
  const { ref, visible } = useFadeIn();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'Do my customers need to download an app?', a: 'No. They scan your QR code and your form opens directly in their phone\'s browser. No download, no account, no friction.' },
    { q: 'Can I customize what the form asks?',       a: 'Yes. You control which fields are shown — service type, address, preferred date, photos, custom questions. Turn them on or off anytime.' },
    { q: 'How does the AI quote generator work?',     a: 'When a customer uploads photos of their project, our AI analyzes the images and drafts line items with estimated pricing based on your templates. You review every number before sending.' },
    { q: 'What\'s the difference between Starter and Pro?', a: 'Starter covers customer intake, lead tracking, and basic organization. Pro adds full project management, AI tools (quotes, briefs, assistant), scheduling, and the Daily Digest.' },
    { q: 'Can I cancel anytime?',                     a: 'Yes. No contracts, no cancellation fees. Cancel from your account settings with one click. Your data is yours and exportable anytime.' },
  ];

  return (
    <section className="py-28 px-6 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <div className="text-center mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">FAQ</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Quick answers.</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-[15px] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-500 text-[15px] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — FINAL CTA
// Status: Ready.
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-28 px-6 bg-[#080C14] border-t border-white/[0.06] text-center">
      <div
        ref={ref}
        className="max-w-2xl mx-auto"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
      >
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9] mb-6">
          One job pays for<br/>
          <span className="text-blue-500">the whole year.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
          Stop losing leads to disorganization. Get your QR code in 2 minutes.
        </p>
        <Link href="/signup"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl text-lg font-black shadow-[0_0_60px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">
          Start Free Trial <ArrowRight size={20}/>
        </Link>
        <p className="mt-5 text-[11px] text-slate-600 uppercase tracking-[0.2em] font-bold">
          14-day free trial · Cancel anytime · 2 min setup
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// Status: Ready.
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg"><Zap className="text-white w-4 h-4" strokeWidth={2.5}/></div>
              <span className="font-extrabold text-slate-900 tracking-tight">L2P</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">Job management built for small and mid-size businesses. One link. Every lead.</p>
          </div>
          {[
            { heading: 'Product', links: [['Pricing','#pricing'],['Sign Up','/signup'],['Login','/login']] },
            { heading: 'Solutions', links: [['Roofing','/solutions/roofing'],['Dog Grooming','/solutions/dog-grooming'],['Cleaning','/solutions/cleaning']] },
            { heading: 'Legal', links: [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','mailto:hello@lead2project.com']] },
          ].map(col => (
            <div key={col.heading}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{col.heading}</p>
              {col.links.map(([label, href]) => (
                <div key={label} className="mb-2.5">
                  <a href={href} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{label}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400 font-medium">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
          <p className="text-sm text-slate-400 font-medium">Built for Service Contractors.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE ASSEMBLY
// Each section is clearly labeled. Swap or skip sections as needed.
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased">

      {/* 1. HERO — dark, headline + visual */}
      <Hero />
      {/* 2. TRUST BAR — stats strip */}
            <HowItWorks />


<TheBoard />

<FeatureBento/>


      {/* 3. HOW IT WORKS — 3 steps, alternating layout */}


  <SettingsShowcase />


  <AIBanner />



  

      {/* 7. VS JOBBER — light section, two-column comparison */}
      <Comparison />

      {/* 8. PRICING — dark section, two plan cards */}
      <Pricing />

      {/* 9. FAQ — light section, accordion */}
      <FAQ />

      {/* 10. FINAL CTA — dark, big headline + signup button */}
      <FinalCTA />

      {/* FOOTER */}
      <Footer />

    </div>
  );
}