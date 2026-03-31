'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Check, Menu, X, Star, Layout,
  QrCode, Bot, Mail, BarChart2, ChevronDown, XCircle,
  Truck, Instagram, Facebook, AtSign, Globe,
  User, Phone, FileText, ChevronRight, MailCheck, Send, DollarSign,
  Search, LayoutGrid, List, Plus, AlignLeft, Sparkles, Target,
  Calendar, Clock, SlidersHorizontal, Filter, CreditCard, MessageCircle, Download,
  MapPin, HomeIcon, Image as ImageIcon, Upload, Camera, PhoneOff, Database, CheckCircle2, Bell, CheckSquare
} from 'lucide-react';

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
            <a key={href} href={href} className="hidden md:block text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">{label}</a>
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
// ─────────────────────────────────────────────────────────────────────────────
// HERO — Remote estimation angle, Option A
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F2EDE4' }}>
      <Nav />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-5 w-full pt-24 pb-8 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-10 lg:gap-16 items-center">

            {/* LEFT — copy */}
            <div
              className="space-y-6 text-center lg:text-left"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
            >
              {/* Eyebrow */}
              <div className="flex justify-center lg:justify-start">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold border"
                  style={{ background: '#E8F4EF', borderColor: '#A8D5C2', color: '#1a6645' }}>
                  <Zap className="w-3 h-3" style={{ fill: '#1a6645' }} />
                  Built for home service pros
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-black tracking-tight"
                style={{ fontSize: 'clamp(40px, 6vw, 68px)', color: '#0F1F3D', lineHeight: 1.0 }}>
                Quote jobs without<br />
                <span style={{ color: '#1a6645' }}>leaving your desk.</span>
              </h1>

              {/* Sub */}
              <p className="font-medium leading-relaxed mx-auto lg:mx-0 max-w-[460px]"
                style={{ fontSize: 'clamp(16px, 2vw, 19px)', color: '#4A5568' }}>
                Customers scan your QR code, upload photos of the damage, and describe the job — before you ever pick up the phone. You get everything you need to send an accurate quote in minutes.
              </p>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[
                  'Photo & video uploads',
                  'Instant lead capture',
                  'Send emails with one click',
                  'Full job tracking',
                ].map(label => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shadow-sm"
                    style={{ background: 'white', borderColor: '#D1C9BD', color: '#0F1F3D' }}>
                    <Check size={11} strokeWidth={3} style={{ color: '#1a6645' }} />
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-black text-white transition-all active:scale-95 hover:-translate-y-0.5 shadow-lg"
                  style={{ backgroundColor: '#1a6645', boxShadow: '0 8px 24px rgba(26,102,69,0.2)' }}>
                  Start Free Trial <ArrowRight size={18} />
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[16px] font-bold border transition-all"
                  style={{ background: 'white', borderColor: '#D1C9BD', color: '#0F1F3D' }}>
                  See Live Demo
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border"
                  style={{ borderColor: '#D1C9BD' }}>
                  <Download size={13} style={{ color: '#1a6645' }} />
                  <span className="text-[12px] font-bold" style={{ color: '#0F1F3D' }}>Full CSV export</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border"
                  style={{ borderColor: '#D1C9BD' }}>
                  <Mail size={13} style={{ color: '#1a6645' }} />
                  <span className="text-[12px] font-bold" style={{ color: '#0F1F3D' }}>Daily email digest</span>
                </div>
                <p className="text-[12px] font-medium hidden xl:block" style={{ color: '#9CA3AF' }}>
                  14-day trial · Cancel anytime
                </p>
              </div>
            </div>

            {/* RIGHT — hero image */}
<div
  className="relative w-full lg:flex items-center justify-center mt-8 lg:mt-0"           
  style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(24px) scale(0.97)',
                transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
              }}
            >
              {/* Floating badge — top left */}
              <div className="absolute top-8 -left-4 z-20 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 hidden md:flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#E8F4EF' }}>
                  <Camera size={16} style={{ color: '#1a6645' }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>New lead received</p>
                  <p className="text-[13px] font-black" style={{ color: '#0F1F3D' }}>3 photos attached</p>
                </div>
              </div>

              <img
  src="/images/heroimagefull.png"
  alt="Customer submitting job photos — leads landing on your dashboard"
className="w-full h-auto px-4 lg:px-0"
  style={{
    borderRadius: 24,
    filter: 'drop-shadow(0 32px 80px rgba(0,0,0,0.18))',
    maxWidth: '100%',
    display: 'block',
  }}
/>

              {/* Floating badge — bottom right */}
              <div className="absolute -bottom-3 right-6 bg-[#0F1F3D] text-white px-4 py-2.5 rounded-xl text-[12px] font-bold shadow-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Quote sent in 4 minutes
              </div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #D9D2C8, transparent)' }} />
    </section>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// FEATURE TABS — Operational Focus (#F7F5F0 bg)
// ─────────────────────────────────────────────────────────────────────────────
function LeadCapture() {
  const [active, setActive] = useState(0);
  // Ensure useFadeIn or similar intersection observer hook is defined in your file
  const { ref, visible } = useFadeIn(); 

  const tabs = [
    {
      label: 'Unified Intake',
      icon: <QrCode size={15} />,
      eyebrow: 'Stop scribbling on scrap paper',
      headline: 'One form for customers.\nOne form for you.',
      desc: 'Whether a customer scans a QR on your truck or you are doing a site-walk, use your branded form to capture everything. Collect high-res photos, short videos, and specific job details that land instantly on your dashboard.',
      callout: 'Consistency is how you scale',
      points: [
        'Branded QR codes for trucks, yard signs, and social bio',
        'Contractor-mode for rapid site-walk data entry',
        'Accepts photos, short videos, and PDF documents',
        'Customizable questions: Address, budget, & preferred dates',
      ],
      quote: "I use the form myself during every estimate. It ensures I never forget to take a specific photo or ask about the budget.",
      author: 'Mike T., Ridge Line Roofing',
     visual: (
  <div className="relative w-full h-full">
    <img 
      src="/images/qrfeature.png" 
      alt="Mobile Intake" 
      className="w-full h-full object-cover object-top" 
    />
    {/* Optional: Add a subtle inner shadow to make it look embedded */}
    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] pointer-events-none" />
  </div>
),
    },
    {
      label: 'Schedule',
      icon: <Calendar size={15} />,
      eyebrow: 'Eliminate the "When are you coming?" texts',
      headline: 'Schedule in a click.\nNotify automatically.',
      desc: 'Move leads from "New" to "Scheduled" instantly. Assign team members and send a professional confirmation email with one tap. No more manual texting or calendar juggling.',
      callout: 'Automatic confirmations reduce no-shows by 40%',
      points: [
        'One-click scheduling directly from the job card',
        'Automated branded confirmation emails',
        'Assign jobs to specific crew members or subs',
        'Every confirmation tracked in your Global Outbox',
      ],
      quote: "The one-click confirmation saves me 30 minutes of texting every single evening.",
      author: 'Tony M., Shoreline Gutters',
      visual: (
  <div className="relative w-full h-full bg-[#f8f9fb]">
    <img 
      src="/images/schedulefeature.png" // The 4K upscale of your schedule board
      alt="Interactive Scheduling Dashboard" 
      className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105" 
    />
    {/* Subtle inner shadow and gradient for a "recessed" look */}
    <div className="absolute inset-0 shadow-[inset_0_2px_12px_rgba(0,0,0,0.03)] pointer-events-none" />
  </div>
),
    },
    {
      label: 'Quote & Win',
      icon: <FileText size={15} />,
      eyebrow: 'Stop losing bids to slow responses',
      headline: 'Professional quotes.\nSent from the driveway.',
      desc: 'Use custom templates to build quotes in seconds. Leverage the AI Project Brief to summarize customer videos and notes into a clean bid. Send it instantly—clients accept with one tap from their phone.',
      callout: 'Speed is the #1 reason customers choose a contractor',
      points: [
        'Custom quote templates based on your job categories',
        'AI-generated project briefs from intake media',
        'One-tap "Accept/Decline" buttons for customers',
        'Real-time status tracking: Pending, Accepted, or Declined',
      ],
      quote: "I send the quote before I even start my truck to leave the site. My closing rate has doubled.",
      author: 'Dave R., All-Pro Siding',
    visual: (
  <div className="relative w-full h-full bg-white">
    <img 
      src="/images/quotefeature.png" 
      alt="Professional Quote Interface" 
      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
    />
    {/* Subtle gradient overlay to make the transition to the UI feel smoother */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
  </div>
),
    },
    {
      label: 'Get Paid',
      icon: <DollarSign size={15} />,
      eyebrow: 'Stop leaving money on the table',
      headline: 'Track every dollar.\nExport every record.',
      desc: 'Log deposits and final payments directly on the job card. See exactly who owes you money at a glance. When it’s tax time, export your entire history to CSV in one click. Your data is always yours.',
      callout: 'Your data is portable. One-click CSV exports anytime.',
      points: [
        'Centralized dashboard for all unpaid balances',
        'Professional payment reminder emails in one click',
        'Full history of deposits and final payments per job',
        'One-click CSV export for bookkeeping and taxes',
      ],
      quote: "Seeing my outstanding balance in red made me realize I had $11k just sitting out there. I collected it all in two days.",
      author: 'Carl B., ProClean Services',
     visual: (
  <div className="relative w-full h-full bg-white">
    <img
      src="/images/payment-tab.png"
      alt="Payment tracking"
      className="w-full h-full object-cover object-top"
    />
  </div>
),
    },
    {
      label: 'Stay Sharp',
      icon: <Bell size={15} />,
      eyebrow: 'Total transparency',
      headline: 'The Global Outbox &\nDaily Digest.',
      desc: "Never wonder if a client got your email. Every quote, confirmation, and reminder is logged in your Global Outbox. Plus, get a 6AM briefing every morning with today's schedule and overdue tasks.",
      callout: 'Know your business status without opening the app',
      points: [
        'Global Outbox: Proof of every communication sent',
        '6AM Daily Digest: Your schedule & leads via email',
        'Follow-up reminders on stale leads',
        'Custom task templates for different job categories',
      ],
      quote: "The Outbox is a lifesaver. When a client says 'I never got the quote,' I can see exactly when it was sent.",
      author: 'James P., Peak Roofing Co.',
      visual: (
  <div className="relative w-full h-full bg-white">
    <img
      src="/images/outboxfeature.png"
      alt="Global outbox and daily digest"
      className="w-full h-full object-cover object-top"
    />
  </div>
),
    },
  ];

  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={ref} className="text-center mb-12"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Built for the field, managed from the desk
          </p>
          <h2 className="font-black leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 60px)', color: '#0F1F3D' }}>
            Everything to run your<br />
            <span style={{ color: '#1a6645' }}>business, in one place.</span>
          </h2>
          <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: '#4A5568' }}>
            No more lost sticky notes or scrolling through endless text threads. From unified intake to your morning briefing, Lead2Project keeps you organized.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 flex-wrap mb-12">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black border transition-all duration-300"
              style={active === i ? {
                background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D',
              } : {
                background: 'white', color: '#4A5568', borderColor: '#D1C9BD',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative" style={{ minHeight: 480 }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              className="grid lg:grid-cols-2 gap-12 items-center transition-all duration-500"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? 'translateY(0)' : 'translateY(16px)',
                position: active === i ? 'relative' : 'absolute',
                inset: active === i ? 'auto' : 0,
                pointerEvents: active === i ? 'auto' : 'none',
                zIndex: active === i ? 10 : 0,
              }}
            >
              {/* LEFT — Visual */}
              <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden shadow-2xl border border-white">
                {tab.visual}
              </div>

              {/* RIGHT — Copy */}
              <div className="space-y-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#1a6645' }}>
                  {tab.eyebrow}
                </p>
                <h3 className="font-black leading-tight tracking-tight whitespace-pre-line"
                  style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#0F1F3D' }}>
                  {tab.headline}
                </h3>
                <p className="text-base font-medium leading-relaxed" style={{ color: '#4A5568' }}>
                  {tab.desc}
                </p>
                <div className="px-4 py-3 rounded-xl border-l-4 font-bold text-sm"
                  style={{ background: '#E8F4EF', borderLeftColor: '#1a6645', color: '#1a6645' }}>
                  💡 {tab.callout}
                </div>
                <div className="space-y-2.5">
                  {tab.points.map((pt, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: '#E8F4EF' }}>
                        <Check size={11} strokeWidth={4} style={{ color: '#1a6645' }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#374151' }}>{pt}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t space-y-2" style={{ borderColor: '#E5E0D8' }}>
                  <p className="text-sm font-medium italic leading-relaxed" style={{ color: '#6B7280' }}>
                    "{tab.quote}"
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#1a6645' }}>
                    — {tab.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}


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
              <span className="text-[13px] font-medium text-slate-800">Roof Replacement</span>
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

function HowItWorks() {
  const { ref, visible } = useFadeIn();

  const steps = [
    {
      number: '01',
      tag: 'Distribution',
      title: 'Deploy your QR link',
      desc: 'Print it on yard signs, truck wraps, or your Instagram bio. One scan opens your portal — no app, no login, zero friction.',
      image: '/images/qr-scan-2.png',
      color: 'from-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-blue-500/40',
    },
    {
      number: '02',
      tag: 'Data Capture',
      title: 'Customer fills the form',
      desc: 'They provide the address, pick a time, and upload roof photos. You get a full project briefing before the first call.',
      visual: 'demo-form',
      color: 'from-indigo-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/40',
    },
    {
      number: '03',
      tag: 'Automation',
      title: 'Lands on your dashboard',
      desc: 'The lead arrives instantly. AI maps the category to your pricing templates. Review, click once, and the quote is sent.',
      image: '/images/dashboard-jobsite.png',
      color: 'from-emerald-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-[#06080F] overflow-hidden border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto">

        {/* --- HEADER --- */}
        <div
          ref={ref}
          className="max-w-4xl mb-24"
          style={{ 
            opacity: visible ? 1 : 0, 
            transform: visible ? 'none' : 'translateY(30px)', 
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500">The Workflow</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
            Simple. <span className="text-gray-800 italic font-medium">Automatic.</span><br />
            Built for Scale.
          </h2>
        </div>

        {/* --- STEPS GRID (RESPONSIVE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`group relative flex flex-col rounded-[2.5rem] border border-white/[0.06] bg-[#0B0F1A] overflow-hidden transition-all duration-700 ${step.borderColor} ${
                i === 1 ? 'lg:scale-[1.05] z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : ''
              } ${i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}`} // Centers 3rd item on tablet
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : `translateY(${40 + i * 20}px)`,
                transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
              }}
            >
              {/* Subtle Hover Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

              <div className="relative p-8 md:p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400">
                    Step {step.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-white/40 transition-colors">
                    {step.tag}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{step.title}</h3>
                <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-12">{step.desc}</p>

                {/* --- VISUAL AREA (HEIGHT SYNCED AT 520PX) --- */}
                <div className="mt-auto relative">
                  {step.visual === 'demo-form' ? (
                    <div className="relative pt-4 flex justify-center">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/10 blur-[80px] rounded-full" />
                      
                      {/* Fixed height 520px container */}
                      <div className="relative w-full max-w-[280px] h-[520px] shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/10">
                        <FastDemoForm />
                      </div>
                    </div>
                  ) : (
                    /* Step 1 & 3: Photos forced into matching 520px Vertical Ratio */
                    <div className="relative w-full max-w-[280px] h-[520px] mx-auto rounded-[2.5rem] overflow-hidden border border-white/[0.08] bg-gray-950 group-hover:border-white/20 transition-all duration-500 shadow-2xl">
                      {/* Glass Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.05] z-10" />
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-950 to-transparent z-10 opacity-90" />
                      
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center">
                        <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                           <span className="text-[10px] font-black text-white/60 uppercase tracking-widest italic">
                              {step.number === '01' ? 'Yard Sign QR' : 'Lead Dashboard'}
                           </span>
                        </div>
                      </div>
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
// ─────────────────────────────────────────────────────────────────────────────
// Settings showcase — 4 panels showing the most important settings: branding, intake form, emails, payments. Subtle fade/slide animation on scroll. Use the existing useFadeIn hook for this.
// ───────────────────────────────────────

function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  const screens = [
   {
  num: '01',
  title: 'Your business identity',
  desc: 'Logo, booking link, QR code, phone, and website — everything customers need to find and trust you.',
  src: null,
  alt: 'Company profile settings',
  visual: (
  <div style={{ background: '#0B0F1A', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
    {/* Gradient bar */}
    <div style={{ height: 5, borderRadius: 3, background: 'linear-gradient(to right, #6366f1, #8b5cf6, #dc2626)' }} />

    {/* Logo + name + edit */}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <img src="/images/ridgelinelogo.png" alt="logo" style={{ width: 44, height: 44, objectFit: 'contain' }} 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.01em' }}>Ridge Line Roofing</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#1E293B', border: '1px solid #334155', borderRadius: 8, padding: '5px 10px' }}>
            <span style={{ fontSize: 10, color: '#94A3B8' }}>lead2project.com/</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#818CF8' }}>ridge-line-roofing</span>
          </div>
          <p style={{ fontSize: 10, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>Your public booking link</p>
        </div>
      </div>
      <div style={{ background: '#1E293B', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #334155', flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#E2E8F0' }}>✏ EDIT</span>
      </div>
    </div>

    {/* Fields */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div>
        <p style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px' }}>Support Email</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mail size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0' }}>info@ridgelineroofing.com</span>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px' }}>Business Phone</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Phone size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0' }}>(555) 522-2444</span>
        </div>
      </div>
    </div>

    {/* Website */}
    <div>
      <p style={{ fontSize: 9, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 6px' }}>Company Website</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={13} style={{ color: '#818CF8', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0' }}>ridgelineroofing.com</span>
        </div>
        <ArrowRight size={13} style={{ color: '#475569' }} />
      </div>
    </div>

    {/* Action buttons */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {[
        { label: 'QR Code', icon: <QrCode size={16} />, bg: '#1E293B', border: '#334155', color: '#94A3B8' },
        { label: 'Copy Link', icon: <FileText size={16} />, bg: '#4F46E5', border: '#4F46E5', color: '#fff' },
        { label: 'View Form', icon: <ArrowRight size={16} />, bg: '#1E293B', border: '#334155', color: '#94A3B8' },
        { label: 'Digest On', icon: <Mail size={16} />, bg: '#1E2D4A', border: '#2D4A7A', color: '#818CF8' },
      ].map((btn, i) => (
        <div key={i} style={{ background: btn.bg, border: `1px solid ${btn.border}`, borderRadius: 12, padding: '12px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ color: btn.color }}>{btn.icon}</span>
          <span style={{ fontSize: 8, fontWeight: 800, color: btn.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{btn.label}</span>
        </div>
      ))}
    </div>
  </div>
),
},
    {
      num: '02',
      title: 'Everything configurable',
      desc: 'Pipeline, categories, forms, emails, team — all in one place.',
      src: '/images/system-config.png',
      alt: 'System configuration overview',
      visual: (
  <div style={{ background: '#0B0F1A', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    <p style={{ fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>System Configuration</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
      {[
        { label: 'Pipeline', desc: 'Customize your lead stages', icon: <SlidersHorizontal size={16} />, color: '#F59E0B', bg: '#FEF3C7' },
        { label: 'Categories', desc: 'Add your service types', icon: <LayoutGrid size={16} />, color: '#6366F1', bg: '#EEF2FF' },
        { label: 'Booking Form', desc: 'Control what customers fill out', icon: <FileText size={16} />, color: '#F97316', bg: '#FFF7ED' },
        { label: 'Automations', desc: 'Personalize customer emails', icon: <Mail size={16} />, color: '#3B82F6', bg: '#EFF6FF' },
        { label: 'Team', desc: 'Invite crew and assign leads', icon: <User size={16} />, color: '#06B6D4', bg: '#ECFEFF' },
        { label: 'Billing', desc: 'Manage your plan', icon: <CreditCard size={16} />, color: '#10B981', bg: '#ECFDF5' },
      ].map((item, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: item.color }}>{item.icon}</span>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>{item.label}</p>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
),
    },
    {
      num: '03',
      title: 'Your intake form',
      desc: 'Toggle address, photos, dates, and custom questions on or off.',
      src: '/images/booking-form.png',
      alt: 'Booking form settings',
      visual: (
  <div style={{ background: '#0B0F1A', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        <p style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', margin: '0 0 2px', background: '#fff', display: 'inline-block', padding: '0 4px', borderRadius: 4 }}>Booking Form</p>
        <p style={{ fontSize: 10, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>Control what customers fill out when they request a job.</p>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, color: '#475569' }}>Copy link</div>
        <div style={{ background: '#4F46E5', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, color: '#fff' }}>Save</div>
      </div>
    </div>

    {/* Two col layout */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
      {/* LEFT — phone preview */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
        {/* Gradient header */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #dc2626)', padding: '14px 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 7, color: '#fff', fontWeight: 900 }}>1</span>
            </div>
            <ArrowRight size={8} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 7, color: '#4F46E5', fontWeight: 900 }}>2</span>
            </div>
          </div>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#fff', margin: 0 }}>Request received!</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>A few more details — all optional.</p>
        </div>
        {/* Form fields */}
        <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Start typing your address...', 'Zip', 'Date'].map((ph, i) => (
            <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 8px', fontSize: 9, color: '#CBD5E1', fontWeight: 500 }}>{ph}</div>
          ))}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 8px' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: '#374151', margin: '0 0 3px' }}>What is your budget range?</p>
            <p style={{ fontSize: 9, color: '#CBD5E1', margin: 0 }}>Select one...</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #dc2626)', borderRadius: 6, padding: '7px', textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>Submit request</span>
          </div>
        </div>
      </div>

      {/* RIGHT — controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Step 1 locked */}
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9 }}>🔒</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>Step 1 — always collected</span>
          </div>
          <p style={{ fontSize: 9, color: '#94A3B8', margin: 0 }}>Full name · Email · Phone · Service category</p>
        </div>

        {/* Step 2 toggles */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0F172A' }}>Step 2 — extra details</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '2px 6px', borderRadius: 4 }}>YOU CONTROL THESE</span>
          </div>
          {[
            { label: 'Service address', on: true },
            { label: 'Preferred date', on: true },
            { label: 'Preferred time', on: false },
            { label: 'How did you hear about us?', on: false },
            { label: 'Photo / video upload', on: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: row.on ? '#0F172A' : '#94A3B8' }}>{row.label}</span>
              <div style={{ width: 28, height: 16, borderRadius: 8, background: row.on ? '#4F46E5' : '#CBD5E1', display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: row.on ? 'flex-end' : 'flex-start' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Custom questions */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#0F172A' }}>Your own questions</span>
          <div style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 8px', fontSize: 9, fontWeight: 700, color: '#475569' }}>+ Add</div>
        </div>
      </div>
    </div>
  </div>
),
    },
   {
  num: '04',
  title: 'Your customer emails',
  desc: 'Customize once — your customers receive branded, professional emails every time.',
  src: null, // two images side by side
  alt: 'Email template settings',
  visual: (
  <div style={{ background: '#0B0F1A', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {/* Header */}
    <div>
      <p style={{ fontSize: 15, fontWeight: 900, color: '#F1F5F9', margin: '0 0 2px' }}>Email templates</p>
      <p style={{ fontSize: 9, color: '#64748B', margin: 0, fontWeight: 500 }}>Customize what customers receive when you send a quote, schedule, or payment reminder.</p>
    </div>

    {/* Tabs */}
    <div style={{ display: 'flex', gap: 6 }}>
      {['Quote', 'Schedule', 'Payment'].map((tab, i) => (
        <div key={i} style={{
          padding: '5px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700,
          background: i === 1 ? '#1E293B' : 'transparent',
          color: i === 1 ? '#F1F5F9' : '#475569',
          border: i === 1 ? '1px solid #334155' : '1px solid transparent'
        }}>{tab}</div>
      ))}
    </div>

    {/* Two col */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

      {/* LEFT — editor */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Variables */}
        <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#F1F5F9' }}>✦ Available variables</span>
            <span style={{ fontSize: 9, color: '#475569' }}>Click to copy</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}', '{{customer_address}}'].map((v, i) => (
              <span key={i} style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 6, padding: '2px 6px', fontSize: 8, fontWeight: 600, color: '#94A3B8', fontFamily: 'monospace' }}>{v}</span>
            ))}
          </div>
        </div>

        {/* Edit template */}
        <div style={{ background: '#1E293B', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#F1F5F9' }}>✉ Edit template</span>
            <span style={{ fontSize: 9, color: '#475569' }}>↺ Reset</span>
          </div>
          <div>
            <p style={{ fontSize: 8, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Subject line</p>
            <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 6, padding: '5px 8px', fontSize: 9, color: '#CBD5E1' }}>
              Appointment Scheduled - {'{{company_name}}'}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 8, fontWeight: 800, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Email body</p>
            <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 6, padding: '6px 8px', fontSize: 8, color: '#94A3B8', fontFamily: 'monospace', lineHeight: 1.6 }}>
              Hi {'{{customer_name}}'},<br />
              Your appointment has been scheduled!<br /><br />
              Date: {'{{scheduled_date}}'}<br />
              Time: {'{{scheduled_time}}'}<br />
              Address: {'{{customer_address}}'}
            </div>
          </div>
          <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '7px', textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Save Templates</span>
          </div>
        </div>
      </div>

      {/* RIGHT — live preview */}
      <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Banner */}
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #dc2626)', padding: '14px 12px', textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 6, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
  <img src="/images/ridgelinelogo.png" alt="logo" style={{ width: 26, height: 26, objectFit: 'contain' }}
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
</div>
          <p style={{ fontSize: 10, fontWeight: 900, color: '#fff', margin: '0 0 1px' }}>Ridge Line Roofing</p>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', margin: 0 }}>(233) 333-3322</p>
        </div>
        {/* Email body */}
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', gap: 4, fontSize: 8 }}>
            <span style={{ color: '#94A3B8' }}>From</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>Ridge Line Roofing</span>
          </div>
          <div style={{ display: 'flex', gap: 4, fontSize: 8 }}>
            <span style={{ color: '#94A3B8' }}>To</span>
            <span style={{ color: '#475569' }}>john.smith@email.com</span>
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 5 }}>
            <p style={{ fontSize: 8, color: '#94A3B8', margin: '0 0 2px' }}>Subject</p>
            <p style={{ fontSize: 9, fontWeight: 800, color: '#0F172A', margin: 0 }}>Appointment Scheduled - Ridge Line Roofing</p>
          </div>
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 5, fontSize: 8, color: '#374151', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 3px' }}>Hi John Smith,</p>
            <p style={{ margin: '0 0 3px' }}>Your appointment has been scheduled!</p>
            <p style={{ margin: 0, color: '#64748B' }}>Date: March 15, 2024<br />Time: 10:00 AM<br />Address: 123 Main St, Anytown</p>
          </div>
          <p style={{ fontSize: 7, color: '#CBD5E1', textAlign: 'center', margin: '4px 0 0' }}>Powered by Lead2Project</p>
        </div>
      </div>
    </div>
  </div>
),
},
  ];

  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Settings that actually matter
          </p>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(32px, 5vw, 58px)', color: '#0F1F3D', lineHeight: 1.05 }}
          >
            Everything configured.<br />
            <span style={{ color: '#1a6645' }}>Nothing left to guess.</span>
          </h2>
          <p className="text-lg font-medium max-w-xl mx-auto leading-relaxed" style={{ color: '#4A5568' }}>
            Set it up once. Your booking form, emails, and payments work exactly how you want — every job, every time.
          </p>
        </div>

        {/* 2x2 Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(24px)',
            transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
         {screens.map((screen, i) => (
  <div key={i} className="flex flex-col gap-4">
    {/* Image */}
  {'visual' in screen && screen.visual ? (
  <div style={{ borderRadius: 16, border: '1px solid #D9D2C8', boxShadow: '0 8px 32px rgba(15,31,61,0.08)', overflow: 'hidden' }}>
    {screen.visual}
  </div>
) : screen.src ? (
  <div style={{ borderRadius: 16, border: '1px solid #D9D2C8', boxShadow: '0 8px 32px rgba(15,31,61,0.08)', overflow: 'hidden', background: '#EAE5DC' }}>
    <img src={screen.src} alt={screen.alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
  </div>
) : (
  <div style={{ borderRadius: 16, border: '1px solid #D9D2C8', boxShadow: '0 8px 32px rgba(15,31,61,0.08)', overflow: 'hidden', background: '#EAE5DC', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
    <img src="/images/email-templates.png" alt="Email template editor" style={{ width: '100%', height: 'auto', display: 'block' }} />
    <img src="/images/email-sent.png" alt="Email received by customer" style={{ width: '100%', height: 'auto', display: 'block' }} />
  </div>
)}
              {/* Caption */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest"
                    style={{ color: '#1a6645' }}
                  >
                    {screen.num}
                  </span>
                  <div style={{ height: 1, flex: 1, background: '#D9D2C8' }} />
                </div>
                <p className="font-black text-sm mb-1" style={{ color: '#0F1F3D' }}>
                  {screen.title}
                </p>
                <p className="text-sm font-medium leading-relaxed" style={{ color: '#6B7280' }}>
                  {screen.desc}
                </p>
              </div>
            </div>
          ))}
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — PRICING (Basic & Pro Focus)
// ─────────────────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useFadeIn();

  const plans = [
    {
      name: 'Basic',
      price: 49,
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
      price: 99,
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
    <section id="pricing" className="py-32 px-6 bg-[#080C14] border-t border-white/[0.06] overflow-hidden">
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
          <div className="text-center mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">Simple Monthly Billing</span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
              One job pays for<br/>
              <span className="text-slate-500">the whole year.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
              Choose the plan that fits your stage. No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`group rounded-[3rem] p-10 border transition-all duration-500 relative ${
                  plan.highlight
                    ? 'bg-[#0F172A] border-blue-500 shadow-2xl shadow-blue-900/20 md:scale-105 z-10'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}>
                
                {plan.highlight && (
                  <div className="absolute -top-4 left-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl">
                    Recommended for Growth
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-black uppercase tracking-widest ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-lg">/mo</span>
                  </div>
                </div>

                <p className="text-slate-400 font-medium mb-10 text-lg leading-relaxed min-h-[60px]">
                  {plan.desc}
                </p>

                <Link href={plan.href}
                  className={`block text-center w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 mb-10 ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}>
                  {plan.cta}
                </Link>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6 border-b border-white/5 pb-2">What's included:</p>
                  <ul className="grid gap-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          f.includes('✦') ? 'bg-violet-500/20' : plan.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            f.includes('✦') ? 'text-violet-400' : plan.highlight ? 'text-blue-400' : 'text-slate-400'
                          }`} strokeWidth={4}/>
                        </div>
                        <span className={`text-sm font-semibold tracking-tight ${
                          f.includes('✦') ? 'text-violet-200' : 'text-slate-300'
                        }`}>
                          {f.replace(' ✦', '')}
                          {f.includes('✦') && (
                            <span className="ml-2 text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-md font-black border border-violet-500/30 uppercase tracking-tighter">
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
          <div className="mt-20 flex flex-col items-center justify-center gap-8">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#080C14] bg-slate-800 overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/100?img=${i+15}`} alt="contractor" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#080C14] bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl">+120</div>
            </div>
            <p className="text-slate-500 font-bold tracking-tight text-center">
              Join <span className="text-white">120+ contractors</span> switching to Lead2Project this month.
            </p>
            <div className="flex items-center gap-10 opacity-30 grayscale pointer-events-none">
               <span className="text-white font-black tracking-tighter text-xl uppercase">Stripe Secure</span>
               <span className="text-white font-black tracking-tighter text-xl uppercase">256-Bit SSL</span>
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
            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">Job management built for service contractors. One link. Every lead.</p>
          </div>
          {[
            { heading: 'Product', links: [['Features','#features'],['Pricing','#pricing'],['Sign Up','/signup'],['Login','/login']] },
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



<LeadCapture />

      {/* 3. HOW IT WORKS — 3 steps, alternating layout */}
      <HowItWorks />


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