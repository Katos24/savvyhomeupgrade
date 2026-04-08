'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Check, ChevronRight, Image as ImageIcon,
  User, Mail, Phone, AlignLeft, Upload,
  MapPin, Home,
} from 'lucide-react';

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

function Pill({ label, selected, tapping }: { label: string; selected: boolean; tapping?: boolean }) {
  return (
    <div
      className="px-2 py-1 rounded-xl text-[8px] font-bold border transition-all duration-200"
      style={selected
        ? { background: 'linear-gradient(135deg,#f97316,#c2410c,#1c1917)', color: '#fff', borderColor: 'transparent', transform: 'scale(1.05)' }
        : tapping
          ? { background: '#fff7ed', color: '#f97316', borderColor: '#fed7aa', transform: 'scale(0.95)' }
          : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }
      }
    >
      {label}
    </div>
  );
}

function LogoBar() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 shrink-0 bg-white mt-2">
      <img src="/images/ridgelinelogo.png" alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
<span className="text-[9px] font-black text-slate-800">Ridge Line Roofing</span>    </div>
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
          : { background: '#e5e7eb', color: '#9ca3af' }
        }>
        2
      </div>
      <span className={`text-[7px] font-black uppercase tracking-widest ${s2active ? 'text-slate-800' : 'text-slate-400'}`}>Details</span>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-3 py-4" style={{ background: '#f5f4f0' }}>
      <div className="bg-white rounded-3xl p-4 w-full shadow-lg flex flex-col items-center">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
          <img src="/images/ridgelinelogo.png" alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
        </div>
        <p className="text-[13px] font-black text-slate-900 mb-0.5">Request Received!</p>
        <p className="text-[8px] text-slate-500 text-center mb-3">We'll be in touch about your roofing project.</p>
        {[
          { icon: <Mail size={12} className="text-blue-500" />, t: 'Check your email', s: 'Confirmation sent to your inbox' },
          { icon: <Check size={12} className="text-emerald-500" />, t: "We'll reach out shortly", s: 'Our team reviews every request' },
        ].map(i => (
          <div key={i.t} className="flex items-center gap-2 bg-slate-50 rounded-2xl p-2 w-full mb-1.5">
            <div className="w-6 h-6 bg-white rounded-xl flex items-center justify-center shadow-sm">{i.icon}</div>
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
  );
}

export function FastDemoForm({ autoPlay = false }: { autoPlay?: boolean }) {
  type Phase = 'idle' | 's1-done' | 's1-exit' | 's2-enter' | 's2-q1' | 's2-photo' | 's2-drop' | 's2-done' | 'success';

  const [phase, setPhase] = useState<Phase>('idle');
  const name = 'Curtis Wilson';
  const email = 'curtisw@email.com';
  const phone = '(555) 482-9301';
  const desc = 'Damaged roof after storm, full inspection needed';
  const addr = '42 Maple Ave';
  const city = 'Brooklyn';
  const zip = '11201';
  const [q1, setQ1] = useState('');
  const [tapping, setTapping] = useState(false);
  const [photoDrop, setPhotoDrop] = useState(false);
  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    let running = true;
    const go = (fn: () => void, ms: number) => { if (running) timerRef.current = setTimeout(fn, ms); };

   function reset() {
  setPhase('idle'); setStep(1); setQ1(''); setTapping(false); setPhotoDrop(false);
}

    function run() {
      reset();
      go(() => setPhase('s1-done'), 800);
      go(() => setPhase('s1-exit'), 1600);
      go(() => { setStep(2); setPhase('s2-enter'); }, 2200);
go(() => { setTapping(true); setPhase('s2-q1'); }, 3000);
go(() => { setQ1('Under 10 yrs'); setTapping(false); }, 3350);      go(() => setPhase('s2-photo'), 3800);
      go(() => { setPhotoDrop(true); setPhase('s2-drop'); }, 4500);
      go(() => setPhase('s2-done'), 5200);
      go(() => { setStep('success'); setPhase('success'); }, 5900);
      go(run, 9000);
    }

    run();
    return () => { running = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoPlay]);

  return (
    <div className="relative" style={{ width: 260, height: 480 }}>
      <div className="absolute inset-0 blur-2xl bg-orange-500/10 rounded-[3rem]" />
      <div className="relative w-full h-full rounded-[3rem] border-[6px] border-[#1e293b] bg-[#0f172a] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-end z-30">
<div className="w-14 h-3 bg-black rounded-b-lg mb-1" />
</div>
<div className="absolute inset-0 pt-12 overflow-hidden">
          {/* SUCCESS */}
          <div className={`absolute inset-0 transition-all duration-700 ${step === 'success' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <SuccessScreen />
          </div>

          {/* STEP 1 */}
          <div className={`absolute inset-0 flex flex-col bg-white transition-all duration-700 ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
            <LogoBar />
            <div className="shrink-0 px-3 py-2.5" style={{ background: 'linear-gradient(135deg,#f97316 0%,#c2410c 40%,#1c1917 100%)' }}>
              <p className="text-[12px] font-black text-white">Submit Your Request</p>
              <p className="text-[8px] text-orange-100/80">Takes less than 2 minutes.</p>
            </div>
            <StepBar step={step} />
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">
              <div><Label>Full Name</Label><Field active={false} filled icon={<User size={10} />} value={name} placeholder="" /></div>
              <div><Label>Email</Label><Field active={false} filled icon={<Mail size={10} />} value={email} placeholder="" /></div>
              <div><Label>Phone</Label><Field active={false} filled icon={<Phone size={10} />} value={phone} placeholder="" /></div>
              <div><Label>Service Needed</Label><Field active={false} filled icon={<MapPin size={10} className="text-slate-400" />} value="Roofing" placeholder="" /></div>
              <div>
                <Label right="0/500">Project Description</Label>
                <div className="flex items-start gap-2 px-2.5 py-2 rounded-2xl border border-slate-200 bg-white min-h-[40px]">
                  <AlignLeft size={10} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[9px] text-slate-800 flex-1 leading-relaxed">{desc}</span>
                </div>
              </div>
              <div className="pt-1">
                <OrangeBtn done={phase === 's1-done' || phase === 's1-exit'}>
                  {phase === 's1-exit' ? <><Check size={11} strokeWidth={3} /> Saved!</> : <>Continue <ChevronRight size={11} /></>}
                </OrangeBtn>
              </div>
            </div>
          </div>

          {/* STEP 2 — condensed: address + ONE question + photo */}
          <div className={`absolute inset-0 flex flex-col bg-white transition-all duration-700 ${step === 2 ? 'opacity-100 translate-x-0' : step === 'success' ? 'opacity-0 -translate-x-8 pointer-events-none' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
            <LogoBar />
            <div className="shrink-0 px-3 py-2" style={{ background: 'linear-gradient(135deg,#f97316 0%,#c2410c 40%,#1c1917 100%)' }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-4 h-4 rounded-full bg-white/20 border border-white/30 flex items-center justify-center"><Check size={8} className="text-white" strokeWidth={3} /></div>
                <ChevronRight size={8} className="text-white/50" />
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center"><span className="text-[7px] font-black text-orange-600">2</span></div>
              </div>
              <p className="text-[10px] font-black text-white">Request saved!</p>
              <p className="text-[7px] text-orange-100/80">A few more details — all optional.</p>
            </div>
            <StepBar step={step} />
            <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-1.5">

              {/* Address row */}
              <div><Label>Address</Label><Field active={false} filled icon={<MapPin size={10} className="text-red-400" />} value={addr} placeholder="" /></div>
              <div className="grid grid-cols-2 gap-1.5">
                <div><Label>City</Label><Field active={false} filled icon={<MapPin size={10} className="text-slate-300" />} value={city} placeholder="" /></div>
                <div><Label>Zip</Label><Field active={false} filled icon={<MapPin size={10} className="text-emerald-400" />} value={zip} placeholder="" /></div>
              </div>

              {/* ONE question only */}
              <div className="pt-1">
                <Label>How old is your roof?</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                 {['Under 10 yrs', '10–20 yrs', '20+ yrs', 'Unknown'].map(o => (
  <Pill key={o} label={o} selected={q1 === o} tapping={tapping && o === 'Under 10 yrs'} />
))}
                </div>
              </div>

              {/* Photo upload */}
              <div>
                <Label>Photos or Videos <span className="text-slate-400 ml-1 normal-case font-normal">optional</span></Label>
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
                    <div className="py-2.5 flex flex-col items-center">
                      <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mb-0.5"><ImageIcon size={13} className="text-blue-400" /></div>
                      <p className="text-[8px] font-semibold text-slate-500">Click or drag photos here</p>
                    </div>
                  )}
                </div>
              </div>

              <OrangeBtn done={phase === 's2-done' || phase === 'success'}>
                {phase === 's2-done' || phase === 'success' ? <><Check size={11} strokeWidth={3} /> Submitted!</> : <><Upload size={11} /> Submit Details</>}
              </OrangeBtn>
            </div>
          </div>

        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full z-30" />
      </div>
    </div>
  );
}