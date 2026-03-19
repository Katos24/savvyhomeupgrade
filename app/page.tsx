'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Star, Menu, X, Play,
  MapPin, Calendar, Clock, HelpCircle, Eye, Image as ImageIcon,
  ChevronRight, User, Mail, Phone, Building, FileText,
  Send, CheckCircle, Bot, DollarSign, CalendarDays,
  BarChart2, Inbox, Users, Link2, QrCode,
} from 'lucide-react';
import { Image } from 'lucide-react';

// ─── ANIMATED FORM → BOARD DEMO (kept from original) ──────────────────────────
function FormToBoardDemo() {
  const [phase, setPhase] = useState<'filling' | 'flying' | 'board' | 'pause'>('filling');
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedValues, setDisplayedValues] = useState<string[]>(['', '', '', '']);
  const [newCardVisible, setNewCardVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = [
    { label: 'Full Name',  value: 'Mike Torres',                                 isSelect: false },
    { label: 'Phone',      value: '(555) 482-1930',                              isSelect: false },
    { label: 'Service',    value: 'Roofing Repair',                              isSelect: true  },
    { label: 'Details',    value: 'Storm damage — shingles missing, south side.',isSelect: false },
  ];

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (phase === 'filling') {
      if (fieldIndex < fields.length) {
        const f = fields[fieldIndex];
        if (f.isSelect) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value; return n; });
            timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 300);
          }, 300);
        } else if (charIndex < f.value.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value.slice(0, charIndex + 1); return n; });
            setCharIndex(c => c + 1);
          }, fieldIndex === 3 ? 22 : 38 + Math.random() * 14);
        } else {
          timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 220);
        }
      } else {
        timeoutRef.current = setTimeout(() => setPhase('flying'), 500);
      }
    }
    if (phase === 'flying') {
      timeoutRef.current = setTimeout(() => { setPhase('board'); setTimeout(() => setNewCardVisible(true), 200); }, 800);
    }
    if (phase === 'board') {
      timeoutRef.current = setTimeout(() => setPhase('pause'), 3500);
    }
    if (phase === 'pause') {
      timeoutRef.current = setTimeout(() => {
        setPhase('filling'); setFieldIndex(0); setCharIndex(0);
        setDisplayedValues(['', '', '', '']); setNewCardVisible(false);
      }, 800);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fieldIndex, charIndex]);

  const isBoard = phase === 'board' || phase === 'pause';
  const existingLeads = [
    { name: 'Sarah Kim',   status: 'Quoted',       sc: 'bg-orange-50 text-orange-700 border-orange-200', cat: 'Renovation', quote: '$18,500' },
    { name: 'James Park',  status: 'Scheduled',    sc: 'bg-green-50 text-green-700 border-green-200',    cat: 'HVAC',       quote: '$890'    },
    { name: 'Lisa Morgan', status: 'In Progress',  sc: 'bg-purple-50 text-purple-700 border-purple-200', cat: 'Fencing',    quote: '$3,100'  },
  ];

  return (
    <div className="relative">
      <style>{`
        @keyframes flyAcross { 0%{transform:translate(0,0) rotate(0deg);opacity:1} 50%{transform:translate(35vw,-30px) rotate(12deg);opacity:1} 100%{transform:translate(70vw,0) rotate(0deg);opacity:0} }
        @keyframes cardDrop  { 0%{opacity:0;transform:translateY(-10px) scale(0.96)} 60%{transform:translateY(2px) scale(1.01)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        .plane-anim { animation:flyAcross 0.8s cubic-bezier(.25,.46,.45,.94) forwards;position:absolute;top:36%;left:6%;z-index:20;pointer-events:none; }
        .card-drop  { animation:cardDrop 0.35s ease forwards; }
      `}</style>
      <div className="flex justify-between mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400" style={{ opacity: isBoard ? 0 : 1, transition: 'opacity 0.3s' }}>● Customer sees this</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500" style={{ opacity: isBoard ? 1 : 0, transition: 'opacity 0.3s ease 0.4s' }}>● You see this — instantly</span>
      </div>
      <div className="grid grid-cols-2 gap-3 relative overflow-hidden">
        {phase === 'flying' && (
          <div className="plane-anim">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <path d="M4 20 L36 4 L28 20 L36 36 Z" fill="white" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M28 20 L4 20" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        {/* FORM */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" style={{ opacity: isBoard ? 0.15 : 1, transition: 'opacity 0.5s' }}>
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5">
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }}/>)}
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-auto">Get a Quote</span>
          </div>
          <div className="p-4 space-y-3">
            {fields.map((f, i) => (
              <div key={f.label}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
                <div className={`border rounded-lg px-2.5 py-1.5 text-xs transition-colors ${fieldIndex === i && !isBoard ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'} ${i === 3 ? 'min-h-[40px]' : ''}`}>
                  <span className={displayedValues[i] ? 'text-slate-800' : 'text-slate-300'}>{displayedValues[i] || '—'}</span>
                  {fieldIndex === i && !isBoard && phase === 'filling' && (
                    <span className="inline-block w-[1px] h-3 bg-blue-500 ml-0.5 align-middle" style={{ animation: 'blink 1s step-end infinite' }}/>
                  )}
                </div>
              </div>
            ))}
            <div className={`text-center py-2 rounded-xl text-xs font-bold transition-all ${fieldIndex >= fields.length && !isBoard ? 'bg-blue-600 text-white' : isBoard ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {phase === 'flying' ? <span className="flex items-center justify-center gap-1"><Send size={10}/> Sending…</span>
               : isBoard ? <span className="flex items-center justify-center gap-1"><CheckCircle size={10}/> Submitted!</span>
               : 'Submit Request'}
            </div>
          </div>
        </div>
        {/* BOARD */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" style={{ opacity: isBoard ? 1 : 0.1, transition: 'opacity 0.5s ease 0.3s' }}>
          <div className="bg-slate-900 px-3 py-2 flex items-center gap-1.5">
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }}/>)}
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-auto">Lead Board</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 ml-1" style={{ boxShadow:'0 0 5px rgba(74,222,128,0.7)' }}/>
          </div>
          <div className="p-2 space-y-1.5 bg-slate-50">
            {newCardVisible && (
              <div className="card-drop bg-white border-2 border-blue-500 rounded-xl overflow-hidden shadow-md">
                <div className="h-1 bg-blue-500"/>
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[8px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded">NEW</span>
                    <span className="text-[8px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded ml-auto">Roofing</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">Mike Torres</div>
                  <div className="text-[10px] text-slate-500 leading-snug">Storm damage — shingles missing</div>
                  <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="text-[9px] font-bold text-blue-600">Just now ✦</span>
                    <span className="text-[9px] text-slate-400 ml-auto">(555) 482-1930</span>
                  </div>
                </div>
              </div>
            )}
            {existingLeads.map((lead, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${lead.sc}`}>{lead.status}</span>
                    <span className="text-[8px] text-slate-400 ml-auto">{lead.cat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{lead.name}</span>
                    <span className="text-xs font-bold text-green-600">{lead.quote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {[
          { label: 'Customer fills form', active: phase === 'filling' },
          { label: 'Submitting',          active: phase === 'flying'  },
          { label: 'Live on your board',  active: isBoard             },
        ].map((s, i) => (
          <span key={i} className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${s.active ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-400 bg-white'}`}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── INTERACTIVE FORM PREVIEW ──────────────────────────────────────────────────
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
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-4' : 'left-0.5'}`}/>
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
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Your form. Your rules.
          </h2>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">Toggle fields on and off — see exactly what your customers will see before you go live.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: toggles */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Turn fields on or off</p>

            <Toggle label="Custom Questions" desc="Ask anything — budget, gate code, pet at home" on={customQ} setOn={setCustomQ} color="indigo" />
            <Toggle label="Service Address"  desc="Street address with autocomplete"              on={address}  setOn={setAddress}  color="blue"   />
            <Toggle label="Photo & Video Upload" desc="Customers attach photos or short videos"   on={photos}   setOn={setPhotos}   color="pink"   />
            <Toggle label="Preferred Date"   desc="Lets customers suggest timing"                 on={prefDate} setOn={setPrefDate} color="emerald"/>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-500 mb-2">Always collected — no toggle needed</p>
              <div className="flex flex-wrap gap-2">
                {['Full Name','Email','Phone','Service Type','Description'].map(f => (
                  <span key={f} className="text-[10px] font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-600">{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: phone mockup */}
          <div className="flex justify-center">
            <div className="bg-slate-900 rounded-[2.5rem] p-3 border-[6px] border-slate-800 shadow-2xl w-[280px]">
              {/* notch */}
              <div className="bg-slate-800 w-20 h-5 rounded-full mx-auto mb-2"/>
              <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ maxHeight: '520px', overflowY: 'auto', scrollbarWidth: 'none' }}>
                {/* form header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
                  <div className="w-8 h-1 bg-white/20 rounded-full mx-auto mb-3"/>
                  <h3 className="text-sm font-bold">Request a Free Quote</h3>
                  <p className="text-white/60 text-[10px] mt-0.5">Fill out the form below</p>
                </div>
                <div className="p-4 space-y-3">
                  {/* always-on fields */}
                  {[
                    { label: 'Your Name',        placeholder: 'John Smith',           icon: <User size={10} className="text-blue-500"/> },
                    { label: 'Email',            placeholder: 'john@example.com',     icon: <Mail size={10} className="text-blue-500"/> },
                    { label: 'Phone',            placeholder: '(555) 123-4567',       icon: <Phone size={10} className="text-green-500"/> },
                    { label: 'Service Type',     placeholder: 'Select...',            icon: <Building size={10} className="text-amber-500"/> },
                    { label: 'Describe Project', placeholder: 'Tell us what you need',icon: <FileText size={10} className="text-purple-500"/> },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="flex items-center gap-1 mb-1">{f.icon}<span className="text-[9px] font-bold text-slate-600">{f.label}</span></div>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">{f.placeholder}</div>
                    </div>
                  ))}

                  {/* custom question — animated in/out */}
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: customQ ? '80px' : '0px', opacity: customQ ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><HelpCircle size={10} className="text-indigo-500"/><span className="text-[9px] font-bold text-slate-600">Budget range?</span></div>
                    <div className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-[10px] text-indigo-400 flex justify-between items-center">
                      <span>Select...</span><ChevronRight size={8} className="rotate-90"/>
                    </div>
                  </div>

                  {/* address — animated */}
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: address ? '80px' : '0px', opacity: address ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><MapPin size={10} className="text-red-500"/><span className="text-[9px] font-bold text-slate-600">Service Address</span></div>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-400">Start typing your address...</div>
                  </div>

                  {/* photo upload — animated */}
                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: photos ? '90px' : '0px', opacity: photos ? 1 : 0 }}>
                    <div className="flex items-center gap-1 mb-1"><ImageIcon size={10} className="text-pink-500"/><span className="text-[9px] font-bold text-slate-600">Photos / Videos</span></div>
                    <div className="border-2 border-dashed border-pink-200 bg-pink-50/50 rounded-lg p-3 text-center">
                      <ImageIcon size={14} className="text-pink-400 mx-auto mb-1"/>
                      <p className="text-[9px] font-semibold text-pink-400">Tap to attach</p>
                    </div>
                  </div>

                  {/* preferred date — animated */}
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
      features: ['Everything in Basic','Convert leads → full projects','Quotes & payment tracking','Tasks, scheduling & crew assignment','Photos, videos & docs per project','AI Brief on every lead','AI Assistant — ask anything','Repeat customer detection'],
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
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: annual ? 24 : 4 }}/>
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
        <p className="text-center text-xs text-slate-400 font-medium mt-6 uppercase tracking-widest">No credit card · Cancel anytime · 14-day free trial</p>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
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
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">How it works</a>
            <a href="#form-preview"  className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Features</a>
            <a href="#pricing"       className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Pricing</a>
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
            {[['#how-it-works','How it works'],['#form-preview','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
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
    Every job. Every customer.<br />
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
      Get Your Free Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
    </Link>
    
    <Link href="/demo" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-8 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
      <Eye className="w-5 h-5" /> See Live Demo
    </Link>
  </div>

  <p className="mt-3 text-xs text-slate-400 uppercase tracking-widest font-medium">
    14-day free trial · Cancel anytime · 2 min setup
  </p>
</header>

      {/* HOW IT WORKS — LIVE DEMO */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Customer submits.<br/><span className="text-blue-600">You see it instantly.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
              They fill out your form — name, job details, a photo or short video. It drops straight into your board.
            </p>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8">
            <FormToBoardDemo/>
          </div>
        </div>
      </section>

      {/* 3 PILLARS */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Everything You Need</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Three things that change your business.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Link2 size={24}/>,
                color: 'blue',
                title: 'Lead Capture',
                desc: 'One link or QR code. Customers submit their job, photos, and a short video — straight to your board. Nothing falls through the cracks.',
                points: ['Custom booking form','Photo & video uploads','Instant dashboard notification'],
              },
              {
                icon: <BarChart2 size={24}/>,
                color: 'indigo',
                title: 'Project Organization',
                desc: 'Every job tracked from first message to final payment. Quotes, schedules, tasks, and notes — all in one place per project.',
                points: ['Leads → projects in one click','Quotes, payments & scheduling','AI brief on every job'],
              },
              {
                icon: <Bot size={24}/>,
                color: 'purple',
                title: 'Your Brand',
                desc: 'Custom colors, your logo, your questions. Every email and form looks like it came from a real company — because it did.',
                points: ['Branded emails with your logo','Custom form questions','Your colors throughout'],
              },
            ].map((p, i) => (
              <div key={i} className={`bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group`}>
                <div className={`w-12 h-12 bg-${p.color}-50 rounded-xl flex items-center justify-center text-${p.color}-600 mb-5 group-hover:bg-${p.color}-600 group-hover:text-white transition-colors`}>
                  {p.icon}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">{p.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{p.desc}</p>
                <ul className="space-y-1.5">
                  {p.points.map(pt => (
                    <li key={pt} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0"/>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE FORM PREVIEW */}
      <div id="form-preview">
        <InteractiveFormPreview/>
      </div>

      {/* QR CODE SECTION */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Your Booking Link</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">One link.<br/>Share it anywhere.</h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  Every contractor gets a custom link and QR code. Put it in your Instagram bio, text it to customers, print it on your truck, or add it to your business card.
                </p>
                <ul className="space-y-3">
                  {['Instagram & Facebook bio','Email signature','Google Business profile','Business cards & truck wraps','SMS — just text it'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0"/>
                      <span className="text-sm font-medium text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-10 md:p-14 flex flex-col items-center justify-center gap-6">
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 flex flex-col items-center gap-4 w-full max-w-[260px]">
                  <div className="w-full bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1">{['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }}/>)}</div>
                    <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-slate-400 font-mono text-center truncate">l2p.com/torres-roofing</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
                      <rect x="8" y="8" width="36" height="36" rx="4" fill="#1e293b"/><rect x="14" y="14" width="24" height="24" rx="2" fill="white"/><rect x="20" y="20" width="12" height="12" rx="1" fill="#1e293b"/>
                      <rect x="96" y="8" width="36" height="36" rx="4" fill="#1e293b"/><rect x="102" y="14" width="24" height="24" rx="2" fill="white"/><rect x="108" y="20" width="12" height="12" rx="1" fill="#1e293b"/>
                      <rect x="8" y="96" width="36" height="36" rx="4" fill="#1e293b"/><rect x="14" y="102" width="24" height="24" rx="2" fill="white"/><rect x="20" y="108" width="12" height="12" rx="1" fill="#1e293b"/>
                      {[52,58,64,70,76,82,88].map((x,i) => i%2===0 && <rect key={x} x={x} y="52" width="6" height="6" rx="1" fill="#1e293b"/>)}
                      {[[52,60],[64,72],[76,60],[88,72],[52,78],[64,78],[76,90],[88,78],[58,96],[70,96],[82,108],[96,64],[108,70],[120,64],[132,70],[96,82],[108,76],[120,82]].map(([x,y],i) => <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#1e293b"/>)}
                      <rect x="62" y="62" width="16" height="16" rx="3" fill="#2563eb"/>
                      <text x="70" y="74" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">L2P</text>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-900">Torres Roofing</p>
                    <p className="text-[10px] text-blue-600 font-mono font-semibold">l2p.com/torres-roofing</p>
                  </div>
                  <div className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl text-center">Request a Quote →</div>
                </div>
                <p className="text-xs text-slate-400 text-center font-medium max-w-[220px]">Your link is ready the moment you sign up.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 STEPS */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Setup</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Up and running in 3 steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num:'01', title:'Share your link',  desc:'Put your booking link in your Instagram bio, email signature, or Google Business profile. Takes 60 seconds.' },
              { num:'02', title:'Customers submit', desc:'They fill out your form with contact info, job details, photos or a short video — everything upfront, organized.' },
              { num:'03', title:'Quote and close',  desc:'Lead lands on your board. Run an AI brief, send a quote, schedule the job, track payment — all in one place.' },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
                <div className="text-5xl font-extrabold text-blue-100 mb-5 tracking-tight">{s.num}</div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingSection/>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-slate-900 text-center">
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
              {[['Features','#form-preview'],['Pricing','/pricing'],['Sign Up','/signup'],['Login','/login']].map(([l,h]) => (
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