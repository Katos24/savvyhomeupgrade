'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Menu, X, Eye,
  MapPin, Calendar, HelpCircle, Image as ImageIcon,
  ChevronRight, User, Mail, Phone, Building, FileText,
  CheckCircle, Bot, BarChart2, Link2, Camera,
  Sparkles, Send, Loader2, Clock9,
  Settings2, XCircle, CheckCircle2,
  QrCode, Layout, Star
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

function DailyDigestPreview() {
  return (
<div style={{ background: '#f1f5f9', padding: '14px 12px', borderRadius: '12px' }}>
      <div style={{ background: '#ffffff', borderRadius: '12px', overflow: 'hidden', maxWidth: '540px', margin: '0 auto', border: '0.5px solid #e2e8f0' }}>

        {/* Header */}
<div style={{ background: '#0f172a', padding: '16px 20px' }}>
          <p style={{ margin: '0 0 3px', color: '#94a3b8', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Monday, March 24</p>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>Good morning — here's your day</h2>
          <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '13px' }}>Torres Roofing &amp; Construction · 5 items need attention</p>
        </div>

<div style={{ padding: '16px 20px' }}>

          {/* Today's Jobs */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '2px solid #22c55e40', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px' }}>📅</span>
              <span style={{ color: '#16a34a', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.6px' }}>
                Today's Jobs <span style={{ fontWeight: 400, color: '#94a3b8' }}>(2)</span>
              </span>
            </div>
            {[
              { name: 'Michael Johnson', meta: '· Roofing', right: '9:00 AM · Carlos T.' },
              { name: 'Sarah Kim', meta: '· Renovation', right: '1:30 PM · Unassigned' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: i === 0 ? '0.5px solid #f1f5f9' : 'none', background: '#f8fafc', fontSize: '13px' }}>
                <div><span style={{ color: '#334155', fontWeight: 500 }}>{r.name}</span><span style={{ color: '#94a3b8', marginLeft: '4px' }}>{r.meta}</span></div>
                <span style={{ color: '#64748b', whiteSpace: 'nowrap' as const }}>{r.right}</span>
              </div>
            ))}
          </div>

          {/* Overdue Payments */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '2px solid #ef444430', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px' }}>🔴</span>
              <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.6px' }}>
                Overdue Payments <span style={{ fontWeight: 400, color: '#94a3b8' }}>(2)</span>
              </span>
            </div>
            {[
              { name: 'Robert Torres', meta: '#21', amount: '$1,475', due: 'due Mar 18' },
              { name: 'Lisa Morgan', meta: '#30', amount: '$3,100', due: 'due Mar 20' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: i === 0 ? '0.5px solid #fee2e2' : 'none', background: '#fff5f5', fontSize: '13px' }}>
                <div><span style={{ color: '#334155', fontWeight: 500 }}>{r.name}</span><span style={{ color: '#94a3b8', marginLeft: '4px' }}>{r.meta}</span></div>
                <span style={{ whiteSpace: 'nowrap' as const, color: '#64748b' }}><span style={{ color: '#ef4444', fontWeight: 600 }}>{r.amount}</span> · {r.due}</span>
              </div>
            ))}
          </div>

          {/* Quote Follow-up */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '2px solid #eab30830', marginBottom: '10px' }}>
              <span style={{ fontSize: '15px' }}>📬</span>
              <span style={{ color: '#d97706', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.6px' }}>
                Quote Follow-up <span style={{ fontWeight: 400, color: '#94a3b8' }}>(1)</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#f8fafc', fontSize: '13px' }}>
              <div><span style={{ color: '#334155', fontWeight: 500 }}>David Chen</span><span style={{ color: '#94a3b8', marginLeft: '4px' }}>#27 · Electrical</span></div>
              <span style={{ color: '#64748b', whiteSpace: 'nowrap' as const }}>$2,450 · sent Mar 19</span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center' as const, marginTop: '20px', paddingTop: '20px', borderTop: '0.5px solid #e2e8f0' }}>
            <span style={{ display: 'inline-block', background: '#6366f1', color: '#ffffff', padding: '12px 28px', borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
              Open Dashboard →
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '14px 28px', borderTop: '0.5px solid #e2e8f0', textAlign: 'center' as const, fontSize: '12px', color: '#94a3b8' }}>
          Torres Roofing &amp; Construction · Daily Digest
        </div>
      </div>
    </div>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function PricingSection() {
  const plans = [
    {
      name: 'Basic', 
      price: 49,
      desc: 'Perfect for solo operators',
      features: [
        'Custom booking link',
        'Unlimited lead capture',
        'Photo & video uploads',
        'Lead board — cards + table view',
        'Status tracking & notes',
        'Branded confirmation emails',
        'CSV export'
      ],
      cta: 'Start Free Trial', 
      highlight: false, 
      href: '/signup?plan=basic',
    },
    {
      name: 'Pro', 
      price: 99,
      desc: 'Full job management + AI tools',
      features: [
        'Everything in Basic',
        'Convert leads → full projects',
        'Quotes & payment tracking',
        'Tasks, scheduling & crew assignment',
        'Photos, videos & docs per project',
        'AI Brief on every lead',
        'AI quote generator from photos',
        'AI Assistant — ask anything'
      ],
      cta: 'Start Free Trial', 
      highlight: true, 
      href: '/signup?plan=pro',
    },
  ];

  return (
    <section id="pricing" className="bg-white py-24 px-6 border-t border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            One job pays for<br className="md:hidden" /> the whole year.
          </h2>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Simple, transparent monthly pricing. No setup fees. 14-day free trial on all plans.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`rounded-[2.5rem] p-10 border-2 relative transition-all duration-300 ${
                plan.highlight 
                  ? 'bg-slate-900 border-blue-600 shadow-2xl shadow-blue-500/20 scale-105 z-10' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full whitespace-nowrap shadow-lg">
                  Recommended for Growth
                </div>
              )}
              
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                {plan.name}
              </p>
              
              <div className={`flex items-baseline gap-1 mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                <span className="text-6xl font-extrabold tracking-tighter">${plan.price}</span>
                <span className="font-bold text-slate-400">/mo</span>
              </div>
              
              <p className={`text-sm mb-8 font-medium ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.desc}
              </p>
              
              <Link 
                href={plan.href} 
                className={`block text-center w-full py-4.5 rounded-2xl font-black text-sm transition-all active:scale-95 mb-10 ${
                  plan.highlight 
                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30' 
                    : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                {plan.cta}
              </Link>
              
              <ul className="space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-sm font-bold ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.highlight ? 'bg-blue-500/20 text-blue-400' : 'bg-green-100 text-green-600'}`}>
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            Secure checkout via Stripe · No credit card required to start
          </p>
        </div>
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
<header className="pt-24 pb-16 px-6 text-center max-w-6xl mx-auto">
  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-blue-100 shadow-sm">
    <Zap className="w-4 h-4 fill-current" />
    <span>Built for the Trades</span>
  </div>
  
  <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 leading-[0.9] tracking-tighter mb-6 text-balance">
    Stop Chasing Leads.<br/>
    <span className="text-blue-600 font-black italic">Start Closing Jobs.</span>
  </h1>
  
  <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-tight">
    Lead2Project is the "silent partner" for contractors. One QR code on your truck or lawn sign turns tire-kickers into <span className="text-slate-900 font-bold underline decoration-blue-500 italic">ready-to-work projects</span> while you’re busy on the tools.
  </p>
  
  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
    <Link href="/signup" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-black shadow-[0_20px_50px_rgba(37,_99,_235,_0.3)] hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
      Claim My Free QR Code <ArrowRight size={20}/>
    </Link>
    <Link href="/demo" className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-700 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
      <Layout className="w-5 h-5 text-slate-400" />
      Try The Live Demo
    </Link>
  </div>

  <div className="flex flex-col items-center gap-2 text-slate-500 text-sm font-medium">
    <div className="flex gap-1 text-orange-400">
      <Star size={16} fill="currentColor" />
      <Star size={16} fill="currentColor" />
      <Star size={16} fill="currentColor" />
      <Star size={16} fill="currentColor" />
      <Star size={16} fill="currentColor" />
    </div>
    <p>"Finally, a tool that actually understands a job site."</p>
  </div>
</header>
{/* END HERO */}

  {/* THE HERO IMAGE / DASHBOARD PREVIEW */}
  <div className="relative mt-12 mx-auto max-w-5xl group">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
    <div className="relative bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden">
      {/* PRO TIP: For this image, show your dashboard on the screen 
        with a smartphone floating next to it showing the QR code 
        on a truck magnet or a business card.
      */}
      <img 
        src="/images/dashboard-screenshot.png" 
        alt="Lead2Project One-Place Dashboard" 
        className="w-full object-cover shadow-inner"
      />
    </div>
  </div>

  {/* THE "ALL IN ONE PLACE" STAT BAR */}
  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-100 pt-12">
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="bg-blue-50 p-2 rounded-lg mb-4 text-blue-600 font-black uppercase text-[10px] tracking-widest border border-blue-100">
        Customer Intake
      </div>
      <h4 className="text-slate-900 font-black text-xl">Custom QR Codes</h4>
      <p className="text-slate-500 text-sm font-medium mt-2">Slap it on your truck or cards. Customers scan, fill the info, and it hits your dashboard instantly.</p>
    </div>
    
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
       <div className="bg-blue-50 p-2 rounded-lg mb-4 text-blue-600 font-black uppercase text-[10px] tracking-widest border border-blue-100">
        Daily Command
      </div>
      <h4 className="text-slate-900 font-black text-xl">Your Daily Digest</h4>
      <p className="text-slate-500 text-sm font-medium mt-2">Every morning at 6AM, get one email with every new request, overdue payment, and today's schedule.</p>
    </div>
    
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
       <div className="bg-blue-50 p-2 rounded-lg mb-4 text-blue-600 font-black uppercase text-[10px] tracking-widest border border-blue-100">
        Full Tracking
      </div>
      <h4 className="text-slate-900 font-black text-xl">One Central Inbox</h4>
      <p className="text-slate-500 text-sm font-medium mt-2">No more sticky notes or unread texts. Track every lead and every dollar in your personal command center.</p>
    </div>
  </div>

      {/* ── THE FLOW: THE MODERN FRONT DOOR ── */}
<section id="the-flow" className="py-24 px-6 bg-white border-t border-slate-100">
  <div className="max-w-6xl mx-auto text-center mb-16">
    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-3">The Workflow</p>
    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
      Capture leads while <span className="text-blue-600 font-black">you sleep.</span>
    </h2>
  </div>
  
  <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
    {/* Step 1: QR & Branding */}
    <div className="group">
      <div className="relative rounded-[2.5rem] overflow-hidden mb-6 aspect-square shadow-lg group-hover:shadow-2xl transition-all">
        <img src="/images/qr-scan.png" alt="QR" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
        <div className="absolute top-6 left-6 w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20">
          <span className="text-white font-black text-xl">1</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Your Branded QR</h3>
      <p className="text-slate-500 text-sm text-center font-medium px-4">Stick it on your truck or lawn signs. One scan opens your custom form—no app download required.</p>
    </div>

    {/* Step 2: Custom Data Capture */}
    <div className="group">
      <div className="relative rounded-[2.5rem] overflow-hidden mb-6 aspect-square bg-slate-900 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all">
        <div className="absolute top-6 left-6 w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/10 z-10">
          <span className="text-white font-black text-xl">2</span>
        </div>
        <div className="scale-90"><FormFillingDemo /></div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">They Feed the AI</h3>
      <p className="text-slate-500 text-sm text-center font-medium px-4">Customers choose their category, upload photos, and answer your specific custom questions instantly.</p>
    </div>

    {/* Step 3: AI Output */}
    <div className="group">
      <div className="relative rounded-[2.5rem] overflow-hidden mb-6 aspect-square shadow-lg group-hover:shadow-2xl transition-all">
        <img src="/images/dashboard-jobsite.png" alt="Dashboard" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
        <div className="absolute top-6 left-6 w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20">
          <span className="text-white font-black text-xl">3</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">You Quote & Close</h3>
      <p className="text-slate-500 text-sm text-center font-medium px-4">AI generates the line items. You review the brief and send the quote with one tap. Job done.</p>
    </div>
  </div>
</section>


{/* ── THE ADVANTAGE: WHY WE BEAT THE LEGACY APPS ── */}
<section className="py-24 px-6 bg-slate-950 relative overflow-hidden">
  {/* Modern Glow Effect */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />

 <div className="max-w-6xl mx-auto relative z-10">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div className="order-2 lg:order-1 relative">
  <DailyDigestPreview />
</div>
      <div className="order-1 lg:order-2">
        <span className="text-blue-400 font-black uppercase tracking-[0.25em] text-[10px] border border-blue-400/30 px-3 py-1 rounded-full bg-blue-400/5">The AI Edge</span>
        <h2 className="text-4xl md:text-5xl font-black text-white mt-6 mb-6 leading-tight">
          Your Office on <span className="text-blue-500">Autopilot.</span>
        </h2>
        <div className="space-y-8">
          <div className="flex gap-4">
             <div className="p-3 bg-white/5 rounded-2xl h-fit border border-white/10 text-blue-400"><Clock9 size={24}/></div>
             <div>
               <h4 className="text-white font-bold text-lg">Morning Daily Digest</h4>
               <p className="text-slate-400 text-sm">Every morning at 6AM, get a summary of your leads, today's schedule, and payment status before you leave for the first job.</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="p-3 bg-white/5 rounded-2xl h-fit border border-white/10 text-emerald-400"><Mail size={24}/></div>
             <div>
               <h4 className="text-white font-bold text-lg">Branded Email Automations</h4>
               <p className="text-slate-400 text-sm">Professional templates for quotes and reminders. 1-click outbox lets you verify exactly what was sent and when.</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="p-3 bg-white/5 rounded-2xl h-fit border border-white/10 text-indigo-400"><Settings2 size={24}/></div>
             <div>
               <h4 className="text-white font-bold text-lg">Custom Task Templates</h4>
               <p className="text-slate-400 text-sm">Assign specific labor costs and materials to categories. AI uses <strong>your</strong> pricing to build quotes, not generic averages.</p>
             </div>
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
  The End of Blank-Page<br/>Estimating.
</h3>
<p className="text-slate-400 text-base leading-relaxed mb-8">
  Stop starting from scratch. AI analyzes customer photos to draft your job scope and line items. You keep the final say on every dollar.
</p>
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


{/* ── THE COMPARISON: WHY WE BEAT THE LEGACY APPS ── */}
<section className="py-24 px-6 bg-white">
  <div className="max-w-5xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
        Built for the <span className="text-blue-600">Truck</span>,<br/>Not the Office.
      </h2>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      {/* The "Other" Guys */}
      <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 opacity-80">
        <h4 className="text-xl font-bold text-slate-400 mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5" /> Legacy CRMs (Jobber, etc.)
        </h4>
        <ul className="space-y-4">
          {["Manual data entry for every lead", "Steep learning curve (days of training)", "Overwhelming features you never use", "High monthly cost + hidden fees"].map((item, i) => (
            <li key={i} className="flex gap-3 text-slate-500 text-sm font-medium">
              <span className="text-red-400">—</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Lead2Project */}
      <div className="p-8 rounded-[2rem] bg-blue-600 shadow-2xl shadow-blue-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={120} className="text-white" />
        </div>
        <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-200" /> Lead2Project
        </h4>
        <ul className="space-y-4 relative z-10">
          {[
            "Customers enter their own data via QR",
            "AI-drafted quotes in 60 seconds",
            "Zero training required. 2-min setup.",
            "The 6AM Digest keeps you organized"
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-white text-sm font-bold">
              <span className="text-blue-300">✓</span> {item}
            </li>
          ))}
        </ul>
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
          <p className="text-slate-400 text-lg leading-relaxed mb-10">Stop losing leads to disorganization. Get your QR code in 2 minutes.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-extrabold shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition active:scale-95">
            Start Free Trial <ArrowRight size={18}/>
          </Link>
          <p className="mt-5 text-xs text-slate-600 uppercase tracking-widest font-medium">14-day free trial · Cancel anytime · 2 min setup</p>
        </div>
      </section>


 {/* FOOTER */}
<footer className="bg-white border-t border-slate-200 py-16 px-6">
  <div className="max-w-6xl mx-auto">

    {/* LINKS */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

      {/* BRAND */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Zap className="text-white w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight">
            L2P
          </span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">
          Job management built for service contractors. One link. Every lead.
        </p>
      </div>

      {/* PRODUCT */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Product
        </p>
        {[
          { label: 'Features', href: '#capabilities' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'Sign Up', href: '/signup' },
          { label: 'Login', href: '/login' },
        ].map((item) => (
          <div key={item.label} className="mb-2.5">
            <a
              href={item.href}
              className="text-sm text-slate-600 hover:text-blue-600 font-medium transition"
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>

      {/* SOLUTIONS */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Solutions
        </p>
        {[
          { label: 'Roofing', href: '/solutions/roofing' },
          { label: 'Dog Grooming', href: '/solutions/dog-grooming' },
          { label: 'Cleaning', href: '/solutions/cleaning' },
        ].map((item) => (
          <div key={item.label} className="mb-2.5">
            <a
              href={item.href}
              className="text-sm text-slate-600 hover:text-blue-600 font-medium transition"
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>

      {/* LEGAL */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
          Legal
        </p>
        {[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Contact', href: 'mailto:hello@lead2project.com' },
        ].map((item) => (
          <div key={item.label} className="mb-2.5">
            <a
              href={item.href}
              className="text-sm text-slate-600 hover:text-blue-600 font-medium transition"
            >
              {item.label}
            </a>
          </div>
        ))}
      </div>

    </div>

    {/* BOTTOM */}
    <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-slate-400 font-medium">
        © {new Date().getFullYear()} Lead2Project. All rights reserved.
      </p>
      <p className="text-sm text-slate-400 font-medium">
        Built for Service Contractors.
      </p>
    </div>

  </div>
</footer>
</div>   // ✅ THIS IS THE MISSING ONE
);
}