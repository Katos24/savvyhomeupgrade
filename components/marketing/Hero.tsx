'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, FileText, ListChecks, Check, ChevronRight, User, Mail, Phone, AlignLeft, MapPin, Home, Image as ImageIcon, Upload } from 'lucide-react';
import { DashboardLaptopMockup } from '@/components/marketing/DashboardLaptopMockup';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';

// ─── Reusable mini form primitives (inline, no phone shell) ──────────────────

function OrangeBtn({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return (
    <button
      className="w-full py-2.5 rounded-2xl text-[11px] font-black text-white flex items-center justify-center gap-2 shadow-md transition-all duration-300"
      style={{ background: done ? 'linear-gradient(135deg,#22c55e,#15803d)' : 'linear-gradient(135deg,#f97316 0%,#c2410c 50%,#1c1917 100%)' }}
    >
      {children}
    </button>
  );
}

function Label({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-0.5">
      <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{children}</p>
      {right && <span className="text-[7px] text-slate-400">{right}</span>}
    </div>
  );
}

function Field({ active, filled, icon, value, placeholder }: {
  active: boolean; filled: boolean; icon: React.ReactNode; value: string; placeholder: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-2.5 py-2 rounded-2xl border transition-all duration-150 ${
      active ? 'border-orange-400 ring-2 ring-orange-50 shadow-sm bg-white' : filled ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/80'
    }`}>
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-[10px] font-medium text-slate-800 flex-1 truncate">
        {value
          ? <>{value}{active && <span className="inline-block w-px h-3 bg-orange-500 ml-0.5 align-middle animate-pulse" />}</>
          : <><span className="text-slate-400">{placeholder}</span>{active && <span className="inline-block w-px h-3 bg-orange-500 ml-0.5 align-middle animate-pulse" />}</>
        }
      </span>
    </div>
  );
}

function Pill({ label, selected }: { label: string; selected: boolean }) {
  return (
    <div
      className="px-2 py-1 rounded-xl text-[8px] font-bold border transition-all duration-200"
      style={selected
        ? { background: 'linear-gradient(135deg,#f97316,#c2410c,#1c1917)', color: '#fff', borderColor: 'transparent' }
        : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }
      }
    >
      {label}
    </div>
  );
}

function LogoBar() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 shrink-0 bg-white">
      <img src="/images/ridgelinelogo.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
      <span className="text-[9px] font-black text-slate-800">Ridge Line Roofing</span>
    </div>
  );
}

function StepBar({ step }: { step: 1 | 2 | 'success' }) {
  const s1done = step !== 1;
  const s2active = step === 2 || step === 'success';
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 border-b border-slate-100 bg-white">
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black"
        style={{ background: 'linear-gradient(135deg,#f97316,#c2410c)', color: '#fff' }}>
        {s1done ? <Check size={9} strokeWidth={3} /> : '1'}
      </div>
      <span className={`text-[7px] font-black uppercase tracking-widest ${s1done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>Your Info</span>
      <div className="flex-1 h-px bg-slate-200" />
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-black transition-all"
        style={s2active
          ? { background: 'linear-gradient(135deg,#f97316,#c2410c)', color: '#fff' }
          : { background: '#e5e7eb', color: '#9ca3af' }}>
        2
      </div>
      <span className={`text-[7px] font-black uppercase tracking-widest ${s2active ? 'text-slate-800' : 'text-slate-400'}`}>Details</span>
    </div>
  );
}

// ─── The animated form screen content (no phone shell) ───────────────────────
function FormScreenContent() {
  type Phase =
    | 'idle'
    | 's1-done' | 's1-exit'
    | 's2-enter' | 's2-q1' | 's2-q3'
    | 's2-photo' | 's2-drop' | 's2-done' | 'success';

  const [phase, setPhase] = useState<Phase>('idle');
  const [q1, setQ1] = useState('');
  const [q3, setQ3] = useState('');
  const [photoDrop, setPhotoDrop] = useState(false);
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Step 1 — all pre-filled
  const name = 'Curtis Wilson';
  const email = 'curtisw@email.com';
  const phone = '(555) 482-9301';
  const desc = 'Damaged roof after storm, full inspection needed';

  // Step 2 — address pre-filled
  const addr = '42 Maple Ave';
  const city = 'Brooklyn';
  const zip = '11201';

  useEffect(() => {
    let running = true;
    const go = (fn: () => void, ms: number) => { if (running) timerRef.current = setTimeout(fn, ms); };

    function reset() {
      setPhase('idle'); setStep(1); setQ1(''); setQ3(''); setPhotoDrop(false);
    }

    function run() {
      reset();
      // Step 1 pre-filled — brief pause then continue
      go(() => { setPhase('s1-done'); }, 800);
      go(() => { setPhase('s1-exit'); }, 1600);
      go(() => { setStep(2); setPhase('s2-enter'); }, 2200);
      // Step 2 — animate pill picks + photo
      go(() => { setQ1('Under 10 years'); setPhase('s2-q1'); }, 3000);
      go(() => { setQ3('$5,000–$10,000'); setPhase('s2-q3'); }, 3800);
      go(() => { setPhase('s2-photo'); }, 4500);
      go(() => { setPhotoDrop(true); setPhase('s2-drop'); }, 5200);
      go(() => { setPhase('s2-done'); }, 5900);
      go(() => { setStep('success'); setPhase('success'); }, 6400);
      // no internal loop — Hero controls the cycle
    }

    run();
    return () => { running = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">

      {/* SUCCESS */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center px-3 py-4 transition-all duration-700 ${step === 'success' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
        style={{ background: '#f5f4f0' }}>
        <div className="bg-white rounded-3xl p-4 w-full shadow-lg flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <img src="/images/ridgelinelogo.png" alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
          </div>
          <p className="text-[13px] font-black text-slate-900 mb-0.5">Request Received!</p>
          <p className="text-[8px] text-slate-500 text-center mb-3">We'll be in touch about your roofing project.</p>
          {[
            { e: '📬', t: 'Check your email', s: 'Confirmation sent to your inbox' },
            { e: '⏳', t: "We'll reach out shortly", s: 'Our team reviews every request' },
          ].map(i => (
            <div key={i.t} className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 w-full mb-1.5">
              <div className="w-6 h-6 bg-white rounded-xl flex items-center justify-center text-[12px] shadow-sm">{i.e}</div>
              <div>
                <p className="text-[8px] font-black text-slate-800">{i.t}</p>
                <p className="text-[7px] text-slate-400">{i.s}</p>
              </div>
            </div>
          ))}
          <div className="w-full mt-2">
            <OrangeBtn>Visit Ridge Line Roofing <ChevronRight size={11} /></OrangeBtn>
          </div>
          <p className="text-[6px] text-slate-400 uppercase tracking-widest mt-2">Powered by Lead2Project</p>
        </div>
      </div>

      {/* STEP 1 */}
      <div className={`absolute inset-0 flex flex-col bg-white transition-all duration-700 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
        <LogoBar />
        <div className="shrink-0 px-3 py-2.5" style={{ background: 'linear-gradient(135deg,#f97316 0%,#c2410c 40%,#1c1917 100%)' }}>
          <p className="text-[12px] font-black text-white">Submit Your Request</p>
          <p className="text-[8px] text-orange-100/80">Takes less than 2 minutes. No account needed.</p>
        </div>
        <StepBar step={step} />
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
          <div><Label>Full Name</Label><Field active={false} filled icon={<User size={10} />} value={name} placeholder="" /></div>
          <div><Label>Email</Label><Field active={false} filled icon={<Mail size={10} />} value={email} placeholder="" /></div>
          <div><Label>Phone</Label><Field active={false} filled icon={<Phone size={10} />} value={phone} placeholder="" /></div>
          <div><Label>Service Needed</Label><Field active={false} filled icon={<span className="text-[9px]">🏠</span>} value="Roofing" placeholder="Select a service..." /></div>
          <div>
            <Label right="0/500">Tell us about your project</Label>
            <div className="flex items-start gap-2 px-2.5 py-2 rounded-2xl border border-slate-200 bg-white min-h-[44px]">
              <AlignLeft size={10} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[9px] text-slate-800 flex-1 leading-relaxed">{desc}</span>
            </div>
          </div>
          <div className="pt-1">
            <OrangeBtn done={phase === 's1-done' || phase === 's1-exit'}>
              {phase === 's1-exit' ? <><Check size={11} strokeWidth={3} /> Saved!</> : <>Continue <ChevronRight size={11} /></>}
            </OrangeBtn>
            <p className="text-[6px] text-slate-400 text-center mt-1 uppercase tracking-widest">Continue to additional details (optional)</p>
          </div>
        </div>
      </div>

      {/* STEP 2 */}
      <div className={`absolute inset-0 flex flex-col bg-white transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0' : step === 'success' ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
        <LogoBar />
        <div className="shrink-0 px-3 py-2" style={{ background: 'linear-gradient(135deg,#f97316 0%,#c2410c 40%,#1c1917 100%)' }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center"><Check size={8} className="text-white" strokeWidth={3} /></div>
            <ChevronRight size={8} className="text-white/50" />
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><span className="text-[7px] font-black text-orange-600">2</span></div>
          </div>
          <p className="text-[10px] font-black text-white">Your request is saved!</p>
          <p className="text-[7px] text-orange-100/80">Add a few more details to help us give you a better quote — all optional.</p>
        </div>
        <StepBar step={step} />
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
          <div><Label>Street Address</Label><Field active={false} filled icon={<MapPin size={10} className="text-red-400" />} value={addr} placeholder="" /></div>
          <div className="grid grid-cols-2 gap-1.5">
            <div><Label>City</Label><Field active={false} filled icon={<MapPin size={10} className="text-slate-300" />} value={city} placeholder="" /></div>
            <div><Label>Zip Code</Label><Field active={false} filled icon={<MapPin size={10} className="text-emerald-400" />} value={zip} placeholder="" /></div>
          </div>
          <div><Label>Unit / Apt</Label><Field active={false} filled={false} icon={<Home size={10} className="text-slate-300" />} value="" placeholder="Apt 4B" /></div>
          <div className="pt-1 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-800 mb-1.5">A few quick questions</p>
            <Label>How old is your roof?</Label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {['Under 10 years', '10–20 years', '20+ years', 'Unknown'].map(o => <Pill key={o} label={o} selected={q1 === o} />)}
            </div>
            <Label>What's your approximate budget?</Label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {['Under $5,000', '$5,000–$10,000', '$10,000–$20,000', '20,000+'].map(o => <Pill key={o} label={o} selected={q3 === o} />)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Photos or Videos</p>
              <span className="text-[7px] text-slate-400">helps us quote faster</span>
            </div>
            <div className={`border-2 border-dashed rounded-2xl transition-all duration-400 ${photoDrop ? 'border-orange-400 bg-orange-50' : phase === 's2-photo' ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50'}`}>
              {photoDrop ? (
                <div className="p-1.5">
                  <div className="relative w-full h-[36px] rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-slate-400 to-slate-600" />
                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-slate-700" style={{ clipPath: 'polygon(0 100%,50% 20%,100% 100%)' }} />
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-0.5"><p className="text-white text-[7px]">roof-damage.jpg</p></div>
                  </div>
                </div>
              ) : phase === 's2-photo' ? (
                <div className="py-3 flex flex-col items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mb-0.5 animate-bounce"><ImageIcon size={12} className="text-blue-500" /></div>
                  <p className="text-[8px] font-bold text-blue-500">Drop photo here...</p>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center">
                  <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center mb-0.5"><ImageIcon size={14} className="text-blue-400" /></div>
                  <p className="text-[8px] font-semibold text-slate-500">Click or drag photos/videos here</p>
                  <p className="text-[7px] text-slate-400">Max 50MB per file</p>
                </div>
              )}
            </div>
          </div>
          <OrangeBtn done={phase === 's2-done' || phase === 'success'}>
            {phase === 's2-done' || phase === 'success' ? <><Check size={11} strokeWidth={3} /> Details Submitted!</> : <><Upload size={11} /> Submit Details</>}
          </OrangeBtn>
        </div>
      </div>

    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export default function Hero() {
  // 3 phases: qr → form → dashboard (loops)
  const [currentPhase, setCurrentPhase] = useState<'qr' | 'form' | 'dashboard'>('qr');
  const [formKey, setFormKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let running = true;
    const go = (fn: () => void, ms: number) => { if (running) timerRef.current = setTimeout(fn, ms); };

    const run = () => {
      if (!running) return;
      // 1. QR scan — 3s
      setCurrentPhase('qr');
      go(() => {
        // 2. Form — increment key forces full remount + clean state
        setCurrentPhase('form');
        setFormKey(k => k + 1);
        go(() => {
          // 3. Dashboard — show for 5s then loop
          setCurrentPhase('dashboard');
          go(run, 5000);
        }, 6600);
      }, 3000);
    };

    run();
    return () => { running = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <section className="relative bg-[#020617] overflow-hidden pb-20" style={{ paddingTop: '120px' }}>
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-10%,#1e293b_0%,transparent_60%)] opacity-60" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-600/8 blur-[120px] rounded-full" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-600/8 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-7xl mx-auto px-6 z-10">

        {/* ── Centered headline block ── */}
        <div className="flex flex-col items-center text-center mb-10">

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-5">
            For home service contractors
          </p>

          <h1
            className="text-white font-black tracking-tight leading-[0.88] mb-5 max-w-3xl"
            style={{ fontSize: 'clamp(2.6rem, 6vw, 6.5rem)', fontWeight: 900 }}
          >
            One job pays{' '}
            <span
              className="italic"
              style={{
                background: 'linear-gradient(90deg, #60a5fa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              for the whole
            </span>{' '}
            year.
          </h1>

          <p className="text-slate-400 max-w-sm mb-8 leading-relaxed" style={{ fontSize: '1rem', fontWeight: 500 }}>
            Sign up and get two links — one for your customers, one for you.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
            style={{
              fontSize: '1.05rem',
              padding: '1rem 2.5rem',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              boxShadow: '0 8px 32px rgba(79,70,229,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            Get your link free <ArrowRight size={18} />
          </Link>
          <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">
            No credit card &nbsp;·&nbsp; Live in 2 minutes &nbsp;·&nbsp; Cancel anytime
          </p>

        </div>

        {/* ── Two links strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16 max-w-2xl mx-auto w-full">

          {/* Card 1 — Customer link */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-blue-500/20" style={{ background: 'rgba(37,99,235,0.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Customer link</p>
              <p className="text-white font-black text-sm">The form they fill out</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                'Branded form + QR code',
                'Custom questions you choose',
                'Leads land on your dashboard',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                  <p className="text-slate-400 text-[12px] font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 — Dashboard link */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-indigo-500/20" style={{ background: 'rgba(79,70,229,0.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Dashboard link</p>
              <p className="text-white font-black text-sm">Where you run everything</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                'Schedule · Quote · Collect payment',
                'One-click branded emails',
                'Custom pipelines & templates',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                  <p className="text-slate-400 text-[12px] font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Full-width story strip ── */}
        <HeroStoryStrip />

      </div>
    </section>
  );
}