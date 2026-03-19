'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Menu, X, Eye,
  MapPin, Calendar, HelpCircle, Image as ImageIcon,
  ChevronRight, User, Mail, Phone, Building, FileText,
  CheckCircle, Bot, BarChart2, Link2, Camera,
  Sparkles, Send, Loader2,
} from 'lucide-react';

// ─── FORM FILLING DEMO ────────────────────────────────────────────────────────
function FormFillingDemo() {
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedValues, setDisplayedValues] = useState<string[]>(['', '', '', '', '']);
  const [submitted, setSubmitted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = [
    { label: 'Full Name',       value: 'Mike Torres',                               isSelect: false },
    { label: 'Phone',           value: '(555) 482-1930',                            isSelect: false },
    { label: 'Service Type',    value: 'Fence Repair',                              isSelect: true  },
    { label: 'Project Details', value: 'Post snapped at base, panel leaning badly.',isSelect: false },
    { label: 'Service Address', value: '142 Oak St, Brooklyn',                      isSelect: false },
  ];

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (submitted) {
      timeoutRef.current = setTimeout(() => {
        setFieldIndex(0); setCharIndex(0);
        setDisplayedValues(['', '', '', '', '']);
        setSubmitted(false);
      }, 2800);
      return;
    }
    if (fieldIndex < fields.length) {
      const f = fields[fieldIndex];
      if (f.isSelect) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value; return n; });
          timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 400);
        }, 400);
      } else if (charIndex < f.value.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value.slice(0, charIndex + 1); return n; });
          setCharIndex(c => c + 1);
        }, fieldIndex === 3 ? 20 : 42);
      } else {
        timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 320);
      }
    } else {
      timeoutRef.current = setTimeout(() => setSubmitted(true), 500);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [fieldIndex, charIndex, submitted]);

  return (
    <div className="w-full max-w-[210px] mx-auto">
      <div className="bg-slate-950 rounded-[2rem] p-2 border-4 border-slate-700 shadow-2xl">
        <div className="bg-slate-800 w-14 h-3 rounded-full mx-auto mb-2" />
        <div className="bg-white rounded-[1.4rem] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
            <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">L2P</p>
            <p className="text-xs font-bold text-white">Request a Quote</p>
          </div>
          {submitted ? (
            <div className="p-5 flex flex-col items-center justify-center min-h-[260px] text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-black text-slate-900 mb-1">Request Sent!</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">We'll be in touch within 24 hours.</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {fields.map((f, i) => (
                <div key={i} className={`transition-all duration-300 ${i > fieldIndex ? 'opacity-30' : 'opacity-100'}`}>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                  <div className={`h-7 border rounded-lg px-2 flex items-center text-[10px] transition-all ${
                    fieldIndex === i ? 'border-blue-500 ring-1 ring-blue-100 bg-blue-50/30' :
                    i < fieldIndex ? 'border-slate-200 bg-slate-50' : 'border-slate-100'
                  }`}>
                    <span className={i < fieldIndex ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                      {displayedValues[i] || '—'}
                    </span>
                    {fieldIndex === i && !submitted && (
                      <span className="w-0.5 h-3 bg-blue-500 ml-0.5 animate-pulse inline-block" />
                    )}
                  </div>
                </div>
              ))}
              <div className={`transition-all duration-300 ${fieldIndex < fields.length ? 'opacity-30' : 'opacity-100'}`}>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Photos / Videos</p>
                <div className="border border-dashed border-pink-200 bg-pink-50/50 rounded-lg p-2 flex items-center gap-2">
                  <Camera size={10} className="text-pink-400 shrink-0" />
                  <span className="text-[9px] text-pink-400">Tap to attach</span>
                </div>
              </div>
              <button className={`w-full py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                fieldIndex >= fields.length ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
              }`}>
                Submit Request →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI QUOTE MOCKUP ──────────────────────────────────────────────────────────
function AIQuoteMockup() {
  const [phase, setPhase] = useState<'photo' | 'analyzing' | 'result'>('photo');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase === 'photo')     { timeoutRef.current = setTimeout(() => setPhase('analyzing'), 2200); }
    if (phase === 'analyzing') { timeoutRef.current = setTimeout(() => setPhase('result'),    2800); }
    if (phase === 'result')    { timeoutRef.current = setTimeout(() => setPhase('photo'),     4500); }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [phase]);

  const items = [
    { desc: 'Remove & dispose damaged section', qty: 1, amount: 280 },
    { desc: 'New cedar fence post — 4×4×8',    qty: 2, amount: 90  },
    { desc: 'Fence panel replacement — 6ft',   qty: 1, amount: 180 },
    { desc: 'Concrete footings',                qty: 2, amount: 70  },
    { desc: 'Labor — installation',             qty: 3, amount: 285 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">AI Quote Generator</span>
        </div>
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
          phase === 'analyzing' ? 'bg-amber-100 text-amber-700 animate-pulse' :
          phase === 'result'    ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-slate-100 text-slate-500'
        }`}>
          {phase === 'photo' ? 'Ready' : phase === 'analyzing' ? 'Analyzing...' : 'Quote ready'}
        </span>
      </div>
      <div className="relative">
        <img
          src="/images/fence-damage.png"
          alt="Damaged fence"
          className={`w-full h-40 object-cover transition-all duration-500 ${phase === 'analyzing' ? 'brightness-75' : ''}`}
        />
        {phase === 'analyzing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-white text-xs font-bold">Reading photo...</p>
          </div>
        )}
        {phase === 'photo' && (
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Camera size={10} /> Customer uploaded
          </div>
        )}
        {phase === 'result' && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">✓ Analyzed</div>
        )}
      </div>
      <div className={`transition-all duration-500 ${phase === 'result' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="px-4 py-2 bg-violet-50 border-b border-violet-100">
          <p className="text-[10px] font-black text-violet-700 flex items-center gap-1.5">
            <Bot size={11} /> AI detected: post rot + panel damage
          </p>
        </div>
        <div className="divide-y divide-slate-50">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 flex-shrink-0 flex items-center justify-center">
                  <Check size={8} className="text-emerald-600" strokeWidth={3} />
                </div>
                <span className="text-[11px] text-slate-700 truncate">{item.desc}</span>
              </div>
              <span className="text-[11px] font-black text-slate-900 shrink-0">${item.amount}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 bg-slate-900 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
          <span className="text-lg font-black text-white">$905</span>
        </div>
      </div>
      {phase !== 'result' && (
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-slate-300 font-medium">
            {phase === 'photo' ? 'Waiting for AI analysis...' : 'Generating line items...'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── INTERACTIVE FORM PREVIEW ─────────────────────────────────────────────────
function InteractiveFormPreview() {
  const [address, setAddress]   = useState(true);
  const [photos, setPhotos]     = useState(true);
  const [customQ, setCustomQ]   = useState(false);
  const [prefDate, setPrefDate] = useState(true);

  const Toggle = ({ label, desc, on, setOn, color }: { label: string; desc: string; on: boolean; setOn: (v: boolean) => void; color: string }) => (
    <button
      onClick={() => setOn(!on)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${on ? `border-${color}-200 bg-${color}-50/50` : 'border-slate-100 bg-white'}`}
    >
      <div className={`w-9 h-5 rounded-full relative transition-colors flex-shrink-0 ${on ? `bg-${color}-500` : 'bg-slate-200'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-4' : 'left-0.5'}`} />
      </div>
      <div>
        <p className={`text-sm font-bold transition-colors ${on ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
        <p className="text-[10px] text-slate-400">{desc}</p>
      </div>
    </button>
  );

  return (
    <section className="py-24 px-6 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Custom Booking Form</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Your form. Your rules.</h2>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">Toggle fields on and off — see exactly what your customers will see.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Turn fields on or off</p>
            <Toggle label="Custom Questions"     desc="Ask anything — budget, gate code, pet at home" on={customQ}  setOn={setCustomQ}  color="indigo" />
            <Toggle label="Service Address"      desc="Street address with autocomplete"               on={address}  setOn={setAddress}  color="blue"   />
            <Toggle label="Photo & Video Upload" desc="Customers attach photos or short videos"        on={photos}   setOn={setPhotos}   color="pink"   />
            <Toggle label="Preferred Date"       desc="Lets customers suggest timing"                  on={prefDate} setOn={setPrefDate} color="emerald"/>
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 mb-2">Always collected — no toggle needed</p>
              <div className="flex flex-wrap gap-2">
                {['Full Name','Email','Phone','Service Type','Description'].map(f => (
                  <span key={f} className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">{f}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-slate-900 rounded-[2.5rem] p-3 border-[6px] border-slate-800 shadow-2xl w-[280px]">
              <div className="bg-slate-800 w-20 h-5 rounded-full mx-auto mb-2" />
              <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ maxHeight: '520px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
                  <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-3" />
                  <h3 className="text-sm font-bold">Request a Free Quote</h3>
                  <p className="text-white/60 text-[10px] mt-0.5">Fill out the form below</p>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'Your Name',        placeholder: 'John Smith',            icon: <User size={10} className="text-blue-500"/>      },
                    { label: 'Email',            placeholder: 'john@example.com',      icon: <Mail size={10} className="text-blue-500"/>      },
                    { label: 'Phone',            placeholder: '(555) 123-4567',        icon: <Phone size={10} className="text-green-500"/>    },
                    { label: 'Service Type',     placeholder: 'Select...',             icon: <Building size={10} className="text-amber-500"/> },
                    { label: 'Describe Project', placeholder: 'Tell us what you need', icon: <FileText size={10} className="text-purple-500"/>},
                  ].map(f => (
                    <div key={f.label}>
                      <div className="flex items-center gap-1 mb-1">{f.icon}<span className="text-[9px] font-bold text-slate-600">{f.label}</span></div>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">{f.placeholder}</div>
                    </div>
                  ))}
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: customQ ? '80px' : '0px', opacity: customQ ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><HelpCircle size={10} className="text-indigo-500"/><span className="text-[9px] font-bold text-slate-600">Budget range?</span></div>
                    <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-[10px] text-indigo-400 flex justify-between items-center">
                      <span>Select...</span><ChevronRight size={8} className="rotate-90"/>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: address ? '80px' : '0px', opacity: address ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><MapPin size={10} className="text-red-500"/><span className="text-[9px] font-bold text-slate-600">Service Address</span></div>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">Start typing your address...</div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: photos ? '90px' : '0px', opacity: photos ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><ImageIcon size={10} className="text-pink-500"/><span className="text-[9px] font-bold text-slate-600">Photos / Videos</span></div>
                    <div className="border-2 border-dashed border-pink-200 bg-pink-50/50 rounded-lg p-3 text-center">
                      <ImageIcon size={14} className="text-pink-400 mx-auto mb-1"/>
                      <p className="text-[9px] font-semibold text-pink-400">Tap to attach</p>
                    </div>
                  </div>
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: prefDate ? '70px' : '0px', opacity: prefDate ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><Calendar size={10} className="text-emerald-500"/><span className="text-[9px] font-bold text-slate-600">Preferred Date</span></div>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">mm/dd/yyyy</div>
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[11px] font-bold mt-2">
                    Submit Request →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    {
      name: 'Basic', monthly: 49, annual: 39,
      desc: 'Perfect for solo operators',
      features: ['Custom booking link','Unlimited lead capture','Photo & video uploads','Lead board — cards + table view','Status tracking & notes','Branded confirmation emails','CSV export'],
      cta: 'Start Free Trial', highlight: false, href: '/signup?plan=basic',
    },
    {
      name: 'Pro', monthly: 99, annual: 79,
      desc: 'Full job management + AI tools',
      features: ['Everything in Basic','Convert leads → full projects','Quotes & payment tracking','Tasks, scheduling & crew assignment','Photos, videos & docs per project','AI Brief on every lead','AI quote generator from photos','AI Assistant — ask anything'],
      cta: 'Start Free Trial', highlight: true, href: '/signup?plan=pro',
    },
  ];
  return (
    <section id="pricing" className="bg-white py-24 px-6 border-t border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">One job pays for the whole year.</h2>
          <p className="text-slate-500 text-lg mb-8">14-day free trial. Cancel anytime.</p>
          <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full px-4 py-2">
            <span className={`text-sm font-bold transition-colors ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(a => !a)} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: annual ? '#2563eb' : '#cbd5e1' }}>
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: annual ? 24 : 4 }} />
            </button>
            <span className={`text-sm font-bold transition-colors ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${annual ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-400'}`}>SAVE 20%</span>
            </span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map(plan => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div key={plan.name} className={`rounded-[2rem] p-10 border-2 relative ${plan.highlight ? 'bg-slate-900 border-blue-600 shadow-2xl shadow-blue-500/20' : 'bg-white border-slate-200'}`}>
                {plan.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full whitespace-nowrap">Most Popular</div>}
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>{plan.name}</p>
                <div className={`flex items-baseline gap-1 mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  <span className="text-5xl font-extrabold tracking-tight">${price}</span>
                  <span className="font-bold text-slate-400">/mo</span>
                </div>
                {annual && <p className="text-xs font-bold text-green-400 mb-1">billed annually</p>}
                <p className={`text-sm mb-8 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                <Link href={plan.href} className={`block text-center w-full py-4 rounded-2xl font-bold text-sm transition mb-8 ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30' : 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>
                  {plan.cta}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-3 text-sm font-medium ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-green-500'}`}/>{f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-400 font-medium mt-6 uppercase tracking-widest">14-day free trial · Cancel anytime</p>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/Lead2ProjectLogo.png" alt="Lead2Project" className="h-12 w-auto" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#the-flow"     className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">How it works</a>
            <a href="#capabilities" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Features</a>
            <a href="#pricing"      className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"  className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition">Login</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95">Start Free Trial</Link>
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-1 text-slate-600">
              {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4">
            {[['#the-flow','How it works'],['#capabilities','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700">{label}</a>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          Built for Service Contractors
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-4">
          Every job. Every customer.<br/>
          <span className="text-blue-600">One place.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 mb-3 max-w-xl mx-auto font-medium">
          Year-end used to be chaos. Not anymore.
        </p>
        <p className="text-base text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
          Share one link. Customers submit their job details, photos, and videos. Everything lands on your board — organized, tracked, ready to close.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/signup" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2 group">
            Get Your Free Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition"/>
          </Link>
          <Link href="/demo" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-8 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" /> See Live Demo
          </Link>
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
          14-day free trial · Cancel anytime · 2 min setup
        </p>
      </header>

      {/* ── THE FLOW ── */}
      <section id="the-flow" className="py-24 px-6 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">The Flow</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              From "can you help?" to <span className="text-blue-600">booked.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">

            {/* Step 1 */}
            <div className="flex flex-col">
              <div className="relative rounded-3xl overflow-hidden mb-5 aspect-square">
                <img src="/images/qr-scan.png" alt="Customer scanning QR code on contractor truck" className="w-full h-full object-cover"/>
                <div className="absolute top-4 left-4 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">1</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <p className="text-white font-bold text-sm">They scan or click</p>
                  <p className="text-white/70 text-xs mt-0.5">QR on your truck, link in your bio — no app needed</p>
                </div>
              </div>
            </div>

            {/* Step 2 — isolated form */}
            <div className="flex flex-col">
              <div className="relative rounded-3xl overflow-hidden mb-5 aspect-square bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="absolute top-4 left-4 w-10 h-10 bg-slate-700 border-2 border-white/20 rounded-2xl flex items-center justify-center shadow-xl z-10">
                  <span className="text-white font-black text-lg">2</span>
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
                <FormFillingDemo />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                  <p className="text-white font-bold text-sm">They submit their job</p>
                  <p className="text-white/70 text-xs mt-0.5">Details, photos, videos — straight to your board</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col">
              <div className="relative rounded-3xl overflow-hidden mb-5 aspect-square">
                <img src="/images/dashboard-jobsite.png" alt="Contractor viewing dashboard on job site" className="w-full h-full object-cover"/>
                <div className="absolute top-4 left-4 w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">3</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                  <p className="text-white font-bold text-sm">You quote and close</p>
                  <p className="text-white/70 text-xs mt-0.5">Quote, schedule, collect payment — from your phone</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

  {/* ── DASHBOARD CAPABILITIES ── */}
<section id="capabilities" className="py-24 px-6 bg-slate-900">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-20">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Inside the Product</p>
      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
        Everything happens here.
      </h2>
      <p className="text-slate-400 text-lg max-w-lg mx-auto">
        One place for every lead, quote, schedule, and payment. Nothing falls through.
      </p>
    </div>

    <div className="space-y-24">

      {/* Row 1 — Dashboard */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-blue-600/10 rounded-3xl blur-2xl" />
          <img
            src="/images/dashboard-screenshot.png"
            alt="Lead2Project dashboard"
            className="relative w-full rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Lead Board</p>
          <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Every job organized,<br/>nothing missed.
          </h3>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Every lead lands on your board the moment a customer submits. Stats, status filters, and lead cards — your whole pipeline visible at a glance.
          </p>
          <ul className="space-y-4">
            {[
              { label: 'Stats bar',           desc: 'Total leads, active jobs, revenue collected, pending payment' },
              { label: 'Status filter pills', desc: 'One tap to see New, Quoted, Scheduled, or In Progress'        },
              { label: 'Lead cards',          desc: 'Name, category, date, assignee, quote amount, payment status' },
              { label: 'AI assistant',        desc: "Ask \"who hasn't paid?\" and get an instant answer"           },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/demo" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-blue-50 transition shadow-lg">
              <Eye className="w-4 h-4" /> See it live
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2 — Quote + AI */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-4">AI Quote Generator</p>
          <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Build quotes in seconds.<br/>AI does the heavy lifting.
          </h3>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Customer uploads a photo of the damage. AI reads it, generates line items with estimated pricing. You review, adjust, and send — all without leaving the job file.
          </p>
          <ul className="space-y-4">
            {[
              { label: 'AI reads customer photos',       desc: 'Detects damage, materials needed, and scope of work'         },
              { label: 'Line items generated instantly', desc: 'Description, unit price, qty, and total — ready to edit'     },
              { label: 'Send with one click',            desc: 'Customer gets a branded email with Accept / Decline buttons'  },
              { label: 'Full sent history',              desc: 'Every quote email logged in your outbox with timestamps'      },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="absolute -inset-4 bg-violet-600/10 rounded-3xl blur-2xl" />
          <img
            src="/images/modal-quote.png"
            alt="AI-generated quote sheet"
            className="relative w-full rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
          />
        </div>
      </div>

      {/* Row 3 — Settings + QR */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-600/10 rounded-3xl blur-2xl" />
          <img
            src="/images/settings-screenshot.png"
            alt="Lead2Project settings — branding, QR code, booking form"
            className="relative w-full rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
          />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4">Your Brand</p>
          <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Your logo. Your colors.<br/>Your booking link.
          </h3>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Set up your company identity once — it flows through every customer email, your booking form, and your QR code. Looks like a real company, because it is.
          </p>
          <ul className="space-y-4">
            {[
              { label: 'Branded booking form',   desc: 'Your logo and colors on every customer touchpoint'            },
              { label: 'QR code generator',      desc: 'Download a print-ready QR with your logo embedded inside'    },
              { label: 'Custom form questions',  desc: 'Ask exactly what you need before the first call'              },
              { label: 'Email templates',        desc: 'Personalize every quote, schedule, and payment reminder email'},
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 4 — QR Code */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4">QR Code</p>
          <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Print it. Stick it.<br/>Get leads from anywhere.
          </h3>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Every account gets a custom QR code. Download it in seconds, stick it on your truck, yard sign, or business card — customers scan and submit a job request instantly.
          </p>
          <ul className="space-y-4">
            {[
              { label: 'Logo embedded inside',   desc: 'Your company logo sits in the center of the QR code'          },
              { label: '3 style options',        desc: 'Standard, brand colors, or dark — matches your aesthetic'     },
              { label: 'Export as PNG',          desc: 'Print-ready high resolution file, download in one click'      },
              { label: 'Always up to date',      desc: 'Same QR forever — update your form without reprinting'        },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative order-1 md:order-2 flex justify-center">
          <div className="absolute -inset-4 bg-amber-600/10 rounded-3xl blur-2xl" />
          <img
            src="/images/qr-screenshot.png"
            alt="QR code generator with logo embedded"
            className="relative w-2/3 rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
          />
        </div>
      </div>

    </div>
  </div>
</section>

      {/* FORM CUSTOMIZER */}
      <div id="form-preview">
        <InteractiveFormPreview/>
      </div>

      {/* PRICING */}
      <PricingSection/>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-slate-900 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            One job pays for<br/><span className="text-blue-400">the whole year.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">Stop losing leads to disorganization. Get your booking link in 2 minutes.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-extrabold shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition active:scale-95">
            Start Free Trial <ArrowRight size={18}/>
          </Link>
          <p className="mt-5 text-xs text-slate-600 uppercase tracking-widest font-medium">14-day free trial · Cancel anytime · 2 min setup</p>
        </div>
      </section>

      {/* FOOTER */}
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
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Product</p>
              {[['Features','#capabilities'],['Pricing','/pricing'],['Sign Up','/signup'],['Login','/login']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><a href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</a></div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Solutions</p>
              {[['Roofing','/solutions/roofing'],['Dog Grooming','/solutions/dog-grooming'],['Cleaning','/solutions/cleaning']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><a href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</a></div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legal</p>
              {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','mailto:hello@lead2project.com']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><a href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</a></div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-400 font-medium">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
            <p className="text-sm text-slate-400 font-medium">Built for Service Contractors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}