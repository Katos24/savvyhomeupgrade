'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Zap, ArrowRight, Check, Link2, DollarSign, CalendarDays,
  Bot, BarChart2, Mail, User, Phone, HomeIcon, AlignLeft,
  Send, CheckCircle, Menu, X, Play, Star, Video, FileText,
  Inbox, Users,
} from 'lucide-react';
import { Image } from 'lucide-react';

/* ─────────────────────────────────────────────
   ANIMATED FORM → BOARD DEMO
───────────────────────────────────────────── */
function FormToBoardDemo() {
  const [phase, setPhase] = useState<'filling' | 'flying' | 'board' | 'pause'>('filling');
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedValues, setDisplayedValues] = useState<string[]>(['', '', '', '']);
  const [newCardVisible, setNewCardVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = [
    { label: 'Full Name', value: 'Mike Torres',                                  isSelect: false },
    { label: 'Phone',     value: '(555) 482-1930',                               isSelect: false },
    { label: 'Service',   value: 'Roofing Repair',                               isSelect: true  },
    { label: 'Details',   value: 'Storm damage — shingles missing, south side.', isSelect: false },
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
      timeoutRef.current = setTimeout(() => {
        setPhase('board');
        setTimeout(() => setNewCardVisible(true), 200);
      }, 800);
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
    { name: 'Sarah Kim',   status: 'Quoted',      sc: 'bg-orange-50 text-orange-700 border-orange-200', cat: 'Renovation', quote: '$18,500' },
    { name: 'James Park',  status: 'Scheduled',   sc: 'bg-green-50 text-green-700 border-green-200',    cat: 'HVAC',       quote: '$890'    },
    { name: 'Lisa Morgan', status: 'In Progress',  sc: 'bg-purple-50 text-purple-700 border-purple-200', cat: 'Fencing',    quote: '$3,100'  },
  ];

  return (
    <div className="relative">
      <style>{`
        @keyframes flyAcross {
          0%   { transform:translate(0,0) rotate(0deg); opacity:1; }
          50%  { transform:translate(35vw,-30px) rotate(12deg); opacity:1; }
          100% { transform:translate(70vw,0) rotate(0deg); opacity:0; }
        }
        @keyframes cardDrop {
          0%   { opacity:0; transform:translateY(-10px) scale(0.96); }
          60%  { transform:translateY(2px) scale(1.01); }
          100% { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .plane-anim { animation:flyAcross 0.8s cubic-bezier(.25,.46,.45,.94) forwards; position:absolute; top:36%; left:6%; z-index:20; pointer-events:none; }
        .card-drop  { animation:cardDrop 0.35s ease forwards; }
        @media(max-width:560px){ .demo-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <div className="flex justify-between mb-2 px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400" style={{ opacity: isBoard ? 0 : 1, transition: 'opacity 0.3s' }}>● Customer sees this</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500" style={{ opacity: isBoard ? 1 : 0, transition: 'opacity 0.3s ease 0.4s' }}>● You see this — instantly</span>
      </div>

      <div className="demo-grid grid grid-cols-2 gap-3 relative overflow-hidden">
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
            {/* Upload hint */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Photos / Videos</div>
              <div className="border border-dashed border-slate-300 rounded-lg px-2.5 py-2 flex items-center gap-2">
                <Image size={10} className="text-slate-400"/>
                <Video size={10} className="text-slate-400"/>
                <span className="text-[10px] text-slate-400">Attach files</span>
                <span className="text-[9px] text-slate-300 ml-auto">optional</span>
              </div>
            </div>
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

/* ─────────────────────────────────────────────
   PRICING
───────────────────────────────────────────── */
function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    {
      name: 'Basic', monthly: 49, annual: 39,
      desc: 'Perfect for solo operators',
      features: [
        'Custom booking link',
        'Unlimited lead capture',
        'Photo & video uploads from customers',
        'Lead board — cards + table view',
        'Status tracking & notes',
        'Branded confirmation emails',
        'CSV export',
      ],
      cta: 'Start Free Trial', highlight: false, href: '/signup?plan=basic',
    },
    {
      name: 'Pro', monthly: 99, annual: 79,
      desc: 'Full job management + AI tools',
      features: [
        'Everything in Basic',
        'Convert leads → full projects',
        'Quotes & payment tracking',
        'Tasks, scheduling & crew assignment',
        'Add photos, videos & docs to projects',
        'AI Brief on every lead',
        'AI Assistant — ask anything',
        'Repeat customer detection',
      ],
      cta: 'Start Free Trial', highlight: true, href: '/signup?plan=pro',
    },
  ];

  return (
    <section id="pricing" className="bg-white py-24 px-6 border-t border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            One job pays for the whole year.
          </h2>
          <p className="text-slate-500 text-lg mb-8">14-day free trial. No credit card required.</p>
          <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full px-4 py-2">
            <span className={`text-sm font-bold transition-colors ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(a => !a)} className="relative w-11 h-6 rounded-full transition-colors" style={{ background: annual ? '#2563eb' : '#cbd5e1' }}>
              <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: annual ? 24 : 4 }}/>
            </button>
            <span className={`text-sm font-bold transition-colors ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual
              <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full transition-all ${annual ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-400'}`}>SAVE 20%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map(plan => {
            const price = annual ? plan.annual : plan.monthly;
            return (
              <div key={plan.name} className={`rounded-[2rem] p-10 border-2 relative ${plan.highlight ? 'bg-slate-900 border-blue-600 shadow-2xl shadow-blue-500/20' : 'bg-white border-slate-200'}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
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
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-green-500'}`}/>
                      {f}
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

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-slate-50 min-h-screen font-sans">

      {/* ── NAV ── */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="text-white w-5 h-5" strokeWidth={2.5}/>
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Lead2Project</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">How it works</Link>
            <Link href="#features"     className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Features</Link>
            <Link href="#pricing"      className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"  className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900 transition">Login</Link>
            <Link href="/signup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95">
              Start Free Trial
            </Link>
            <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-1 text-slate-600">
              {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-4">
            {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700">{label}</Link>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"/>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"/>
          </span>
          Built for Service Contractors
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
          Stop losing jobs to<br/>
          <span className="text-blue-600">disorganization.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Share one link. Customers submit their job details, photos, and short videos.
          It all lands on your board — organized, tracked, and ready to quote.
          Your whole business in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/signup" className="w-full sm:w-auto bg-slate-900 text-white px-8 py-5 rounded-2xl text-lg font-bold shadow-2xl hover:bg-slate-800 transition flex items-center justify-center gap-2 group">
            Get Your Free Link <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition"/>
          </Link>
          <Link href="#how-it-works" className="w-full sm:w-auto bg-white border border-slate-200 text-slate-900 px-8 py-5 rounded-2xl text-lg font-bold hover:bg-slate-50 transition">
            See How It Works
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex -space-x-2">
            {['#f97316','#6366f1','#22c55e','#f59e0b','#ec4899'].map((color, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ background: color }}>
                {['JR','MK','AL','SC','TW'][i]}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={13} className="text-amber-400 fill-amber-400"/>)}</div>
          <span className="text-sm text-slate-500 font-medium">Trusted by <strong className="text-slate-800">500+ contractors</strong></span>
        </div>
        <p className="mt-3 text-xs text-slate-400 uppercase tracking-widest font-medium">No credit card · 14-day free trial · 2 min setup</p>
      </header>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="px-6 mb-20 max-w-6xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-5 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }}/>)}
            </div>
            <div className="bg-slate-800 rounded px-3 py-1 text-[11px] text-slate-400 mx-auto font-mono">lead2project.com/dashboard</div>
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow:'0 0 6px rgba(74,222,128,0.8)' }}/>
          </div>

          <div className="border-b border-slate-200 bg-white flex gap-0 overflow-x-auto">
            {['All Leads (12)','New (3)','Quoted','Scheduled','Completed'].map((tab, i) => (
              <div key={tab} className={`px-5 py-3 text-xs font-bold whitespace-nowrap cursor-default border-b-2 ${i === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>
                {tab}
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-50 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name:'Mike Torres',   cat:'Roofing',    status:'New',         sc:'bg-blue-50 text-blue-700 border-blue-200',    quote:'—',       isNew:true,  media:['📷','🎥'] },
              { name:'Sarah Kim',     cat:'Renovation', status:'Quoted',      sc:'bg-orange-50 text-orange-700 border-orange-200',quote:'$18,500', isNew:false, media:['📷'] },
              { name:'James Park',    cat:'HVAC',       status:'Scheduled',   sc:'bg-green-50 text-green-700 border-green-200',   quote:'$890',    isNew:false, media:[] },
              { name:'Lisa Morgan',   cat:'Fencing',    status:'In Progress', sc:'bg-purple-50 text-purple-700 border-purple-200',quote:'$3,100',  isNew:false, media:['📷','📄'] },
              { name:'David Chen',    cat:'Electrical', status:'Quoted',      sc:'bg-orange-50 text-orange-700 border-orange-200',quote:'$2,450',  isNew:false, media:['🎥'] },
              { name:'Amy Nguyen',    cat:'Cleaning',   status:'New',         sc:'bg-blue-50 text-blue-700 border-blue-200',    quote:'—',       isNew:true,  media:['📷'] },
            ].map((lead, i) => (
              <div key={i} className={`bg-white rounded-2xl border p-4 shadow-sm ${lead.isNew ? 'border-blue-400 shadow-blue-100' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lead.sc}`}>{lead.status}</span>
                  <span className="text-[10px] font-semibold text-slate-400">{lead.cat}</span>
                </div>
                <div className="font-bold text-slate-900 text-sm mb-2">{lead.name}</div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">{lead.media.map((m, mi) => <span key={mi} className="text-[11px]">{m}</span>)}</div>
                  <span className={`text-sm font-bold ${lead.quote === '—' ? 'text-slate-300' : 'text-green-600'}`}>{lead.quote}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl p-5 border border-indigo-700/40">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={16} className="text-indigo-300"/>
              <span className="text-sm font-bold text-white">AI Brief — Mike Torres</span>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full uppercase tracking-widest ml-auto">High Priority</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Storm damage on south slope — approx 3 squares of missing shingles. Customer submitted a video walkthrough. Insurance claim in progress. <strong className="text-white">Schedule estimate before adjuster visit.</strong>
            </p>
            <div className="flex gap-4 mt-3">
              <span className="text-xs text-emerald-400 font-semibold">→ Call to confirm scope</span>
              <span className="text-xs text-emerald-400 font-semibold">→ Request insurance docs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-slate-200 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {[
            { num:'$60K+', label:'Lost yearly from missed leads', sub:'industry average' },
            { num:'1 job',  label:'Pays for an entire year',      sub:'at $99/mo Pro plan' },
            { num:'2 min',  label:'To set up your booking link',  sub:'no tech skills needed' },
            { num:'100%',   label:'Leads captured & tracked',     sub:'nothing falls through' },
          ].map((s, i) => (
            <div key={i} className="px-6 py-6 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600 tracking-tight mb-1">{s.num}</div>
              <div className="text-sm font-semibold text-slate-700 leading-snug mb-1">{s.label}</div>
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS — LIVE DEMO ── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
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

      {/* ── 3 STEPS ── */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Setup</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Up and running in 3 steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num:'01', title:'Share your link',    desc:'Put your booking link in your Instagram bio, email signature, or Google Business profile. Takes 60 seconds.' },
              { num:'02', title:'Customers submit',   desc:'They fill out your form with contact info, job details, and optional photos or a short video — everything upfront.' },
              { num:'03', title:'Quote and close',    desc:'Lead lands on your board. Run an AI brief, send a quote, schedule the job, collect payment — all in one place.' },
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

      {/* ── QR CODE SECTION ── */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">

              {/* Left: copy */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Your Booking Link</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                  One link.<br/>Share it anywhere.
                </h2>
                <p className="text-slate-500 text-base leading-relaxed mb-8">
                  Every contractor gets a custom link and QR code. Put it in your Instagram bio, text it to customers, print it on your truck wrap, or add it to your business card. Customers tap or scan — and you get a fully organized lead in seconds.
                </p>
                <div className="space-y-3">
                  {[
                    'Instagram & Facebook bio',
                    'Email signature',
                    'Google Business profile',
                    'Business cards & truck wraps',
                    'SMS — just text it to a customer',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0"/>
                      <span className="text-sm font-medium text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: QR mockup */}
              <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-10 md:p-14 flex flex-col items-center justify-center gap-6">
                {/* Phone mockup with QR */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl shadow-slate-200/80 p-6 flex flex-col items-center gap-4 w-full max-w-[260px]">
                  {/* Fake browser chrome */}
                  <div className="w-full bg-slate-100 rounded-xl px-3 py-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }}/>)}
                    </div>
                    <div className="flex-1 bg-white rounded px-2 py-0.5 text-[9px] text-slate-400 font-mono text-center truncate">
                      lead2project.com/torres-roofing
                    </div>
                  </div>

                  {/* QR code SVG — real scannable-looking pattern */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Top-left finder */}
                      <rect x="8" y="8" width="36" height="36" rx="4" fill="#1e293b"/>
                      <rect x="14" y="14" width="24" height="24" rx="2" fill="white"/>
                      <rect x="20" y="20" width="12" height="12" rx="1" fill="#1e293b"/>
                      {/* Top-right finder */}
                      <rect x="96" y="8" width="36" height="36" rx="4" fill="#1e293b"/>
                      <rect x="102" y="14" width="24" height="24" rx="2" fill="white"/>
                      <rect x="108" y="20" width="12" height="12" rx="1" fill="#1e293b"/>
                      {/* Bottom-left finder */}
                      <rect x="8" y="96" width="36" height="36" rx="4" fill="#1e293b"/>
                      <rect x="14" y="102" width="24" height="24" rx="2" fill="white"/>
                      <rect x="20" y="108" width="12" height="12" rx="1" fill="#1e293b"/>
                      {/* Data modules - timing + random */}
                      {[52,58,64,70,76,82,88].map((x,i) => i%2===0 && <rect key={x} x={x} y="52" width="6" height="6" rx="1" fill="#1e293b"/>)}
                      {[52,58,64,70,76,82,88].map((x,i) => i%2===0 && <rect key={x} x="52" y={x} width="6" height="6" rx="1" fill="#1e293b"/>)}
                      {/* scattered data dots */}
                      {[[52,60],[58,66],[64,60],[70,66],[76,60],[82,66],[88,60],
                        [52,72],[64,72],[76,72],[88,72],
                        [52,78],[58,84],[64,78],[70,84],[76,78],[82,84],[88,78],
                        [52,90],[58,90],[70,90],[82,90],[88,90],
                        [58,96],[64,102],[70,96],[82,96],
                        [52,108],[64,108],[76,102],[88,108],
                        [58,114],[70,114],[82,108],[88,114],
                        [52,120],[64,120],[76,120],[82,120],
                        [96,52],[102,58],[108,52],[114,58],[120,52],[126,58],[132,52],
                        [96,64],[108,64],[120,64],[132,64],
                        [96,70],[102,76],[114,70],[126,76],
                        [96,82],[108,82],[120,76],[132,82],
                        [96,88],[102,88],[114,88],[126,88],
                      ].map(([x,y],i) => <rect key={i} x={x} y={y} width="6" height="6" rx="1" fill="#1e293b"/>)}
                      {/* Center logo area */}
                      <rect x="62" y="62" width="16" height="16" rx="3" fill="#2563eb"/>
                      <text x="70" y="74" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">L2</text>
                    </svg>
                  </div>

                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-900">Torres Roofing</p>
                    <p className="text-[10px] text-blue-600 font-mono font-semibold">lead2project.com/torres-roofing</p>
                  </div>

                  <div className="w-full bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl text-center">
                    Request a Quote →
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center font-medium max-w-[220px]">
                  Your link is ready the moment you sign up. No setup required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO DEMO ── */}
      <section className="py-24 px-6 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">See It In Action</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Watch the 2-minute tour.
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            See how a contractor goes from new lead to signed quote — without touching a spreadsheet.
          </p>
          {/* ↓ Replace this div with an <iframe> embed when your video is ready */}
          <div className="relative bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl aspect-video flex items-center justify-center group cursor-pointer hover:border-blue-500 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"/>
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>
            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform">
                <Play className="w-9 h-9 text-white fill-white ml-1"/>
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">Lead2Project — Full Walkthrough</p>
                <p className="text-slate-500 text-sm">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight max-w-xl leading-tight">
              Everything you need.<br/>
              <span className="text-slate-400 font-light">Nothing you don't.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon:<Link2 size={22}/>,        title:'Custom Booking Link',    desc:'One link. Customers submit name, contact info, photos, and short videos — straight to your board. No app needed.',        tag:null  },
              { icon:<DollarSign size={22}/>,   title:'Quotes & Payments',      desc:'Build line-item quotes, send via email, collect deposits. Know exactly what\'s paid and pending across every job.',       tag:null  },
              { icon:<CalendarDays size={22}/>, title:'Scheduling',             desc:'Assign jobs to crew with dates and times. Confirmation emails go out automatically. Everyone knows what\'s next.',        tag:null  },
              { icon:<Bot size={22}/>,          title:'AI Brief + Assistant',   desc:'Every lead gets an AI summary — scope, urgency, next steps. Ask "Who hasn\'t paid?" and get an instant answer.',        tag:'Pro' },
              { icon:<BarChart2 size={22}/>,    title:'Lead & Project Board',   desc:'Cards view, table view. Track every job from New to Done. Add photos, videos, and docs directly to any project.',       tag:null  },
              { icon:<Inbox size={22}/>,        title:'Email Outbox',           desc:'See every email you\'ve ever sent — quotes, confirmations, payment requests, reminders. Full log, always there.',        tag:null  },
              { icon:<Users size={22}/>,        title:'Team & Crew Access',     desc:'Invite crew members, assign jobs, set permissions. Everyone sees what they need — nothing more.',                        tag:null  },
              { icon:<Mail size={22}/>,         title:'Branded Emails',         desc:'Every email goes out with your logo and colors. Customers think you have a whole front office.',                         tag:null  },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">{f.icon}</div>
                  {f.tag && <span className="text-[9px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full uppercase tracking-widest">{f.tag}</span>}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEDIA CALLOUT ── */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 md:p-14 text-white text-center shadow-2xl shadow-blue-300/20">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Photos. Videos. Documents.<br/>All in one job file.
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Customers can attach a photo of the damage or record a quick video walkthrough right on the intake form.
              Your team can upload photos, videos, and documents to the project as work progresses.
              No more "where's that pic you sent me?"
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { icon:<Image size={16}/>,    label:'Customer photo uploads'   },
                { icon:<Video size={16}/>,    label:'Short video walkthroughs' },
                { icon:<FileText size={16}/>, label:'Docs & contracts'         },
                { icon:<Bot size={16}/>,      label:'AI reads photos for brief'},
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2.5 rounded-full text-sm font-semibold backdrop-blur-sm">
                  {item.icon}{item.label}
                </div>
              ))}
            </div>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-2xl font-extrabold text-base hover:bg-blue-50 transition shadow-lg">
              Start Free — 14 Days <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ── OUTBOX CALLOUT ── */}
      <section className="py-20 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: copy */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">Email Outbox</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                  Every email, logged.<br/>Nothing goes missing.
                </h2>
                <p className="text-slate-500 text-base leading-relaxed mb-6">
                  See every email you've ever sent — quotes, booking confirmations, payment requests, and reminders. Know exactly what went out, when, and to who. No more "did that quote even send?"
                </p>
                <div className="space-y-3">
                  {[
                    'Quote sent confirmations',
                    'Appointment reminders',
                    'Payment request emails',
                    'Payment reminder follow-ups',
                    'Lead confirmation receipts',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0"/>
                      <span className="text-sm font-medium text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: outbox mockup */}
              <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 flex flex-col justify-center gap-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Outbox</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full">6 sent today</span>
                </div>
                {[
                  { type:'Quote Sent',             to:'Mike Torres',   sub:'Roofing Repair — $4,200',        time:'2:14 PM', color:'bg-blue-500',   dot:'bg-blue-100 text-blue-600'   },
                  { type:'Payment Request',        to:'Sarah Kim',     sub:'Renovation deposit — $3,000',    time:'11:52 AM', color:'bg-green-500',  dot:'bg-green-100 text-green-600' },
                  { type:'Payment Reminder',       to:'James Park',    sub:'Balance due — $890 overdue 5d',  time:'10:30 AM', color:'bg-orange-500', dot:'bg-orange-100 text-orange-600' },
                  { type:'Booking Confirmation',   to:'Lisa Morgan',   sub:'Job confirmed — Tue Mar 12',     time:'9:05 AM',  color:'bg-purple-500', dot:'bg-purple-100 text-purple-600' },
                  { type:'Quote Sent',             to:'David Chen',    sub:'Electrical panel — $2,450',      time:'Yesterday', color:'bg-blue-500',  dot:'bg-blue-100 text-blue-600'   },
                ].map((email, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 transition">
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${email.color}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${email.dot}`}>{email.type}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">{email.to}</div>
                      <div className="text-[10px] text-slate-400 truncate">{email.sub}</div>
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium flex-shrink-0">{email.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ── */}
      <section className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: team roster mockup */}
              <div className="p-10 md:p-14 border-b md:border-b-0 md:border-r border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Team Members</span>
                  <div className="text-[10px] font-bold px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-full">3 active</div>
                </div>
                <div className="space-y-3">
                  {[
                    { name:'Alex Torres',  role:'Owner',       status:'Online', color:'bg-orange-500', initials:'AT', perms:'Full access' },
                    { name:'Chris Mena',   role:'Field Tech',  status:'Online', color:'bg-blue-500',   initials:'CM', perms:'Assigned jobs only' },
                    { name:'Diana Ruiz',   role:'Office',      status:'Away',   color:'bg-purple-500', initials:'DR', perms:'Quotes & leads' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                      <div className={`w-9 h-9 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                        {member.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.role} · {member.perms}</div>
                      </div>
                      <div className={`flex items-center gap-1 text-[9px] font-bold ${member.status === 'Online' ? 'text-green-400' : 'text-slate-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Online' ? 'bg-green-400' : 'bg-slate-600'}`}/>
                        {member.status}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 border border-dashed border-white/20 rounded-2xl px-4 py-3 cursor-default hover:border-blue-500/50 transition">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <Users size={14}/>
                    </div>
                    <span className="text-sm text-slate-500">+ Invite team member</span>
                  </div>
                </div>
              </div>

              {/* Right: copy */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Team & Crew</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                  Invite your crew.<br/>Everyone stays aligned.
                </h2>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  Add team members and control exactly what they can see. Field techs see their assigned jobs. Office staff manage quotes and leads. You keep full control as the owner.
                </p>
                <div className="space-y-3">
                  {[
                    'Role-based permissions per member',
                    'Field techs see assigned jobs only',
                    'Owner keeps full admin control',
                    'Invite via email in seconds',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0"/>
                      <span className="text-sm font-medium text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">From the Field</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Contractors who got<br/>their time back.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote:"They show up to the job already knowing the scope. My crew stopped asking me what we're walking into.", name:'Jake R.', trade:'Roofing Contractor', loc:'Phoenix, AZ', initials:'JR', color:'bg-orange-500' },
              { quote:"A customer asked me for a quote from 3 weeks ago and I had no idea where it was. Fixed that in the first week.", name:'Maria C.', trade:'HVAC & Plumbing', loc:'Dallas, TX', initials:'MC', color:'bg-blue-500' },
              { quote:"I asked the AI who hasn't paid and it gave me a list with amounts and days overdue. That used to take 20 minutes.", name:'Darnell W.', trade:'General Contractor', loc:'Atlanta, GA', initials:'DW', color:'bg-purple-500' },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-md transition">
                <div className="flex gap-0.5 mb-5">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-amber-400 fill-amber-400"/>)}</div>
                <p className="text-sm text-slate-700 leading-relaxed italic flex-1 mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>{t.initials}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{t.trade} · {t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection/>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 bg-slate-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
            One job pays for<br/><span className="text-blue-400">the whole year.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Stop losing leads to disorganization. Get your booking link in 2 minutes.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-extrabold shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition active:scale-95">
            Start Free Trial <ArrowRight size={18}/>
          </Link>
          <p className="mt-5 text-xs text-slate-600 uppercase tracking-widest font-medium">No credit card · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg"><Zap className="text-white w-4 h-4" strokeWidth={2.5}/></div>
                <span className="font-extrabold text-slate-900 tracking-tight">Lead2Project</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">The job management tool built for service contractors. One link. Every lead.</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Product</p>
              {[['Features','#features'],['Pricing','/pricing'],['Sign Up','/signup'],['Login','/login']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><Link href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</Link></div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Solutions</p>
              {[['Roofing','/solutions/roofing'],['Dog Grooming','/solutions/dog-grooming'],['Cleaning','/solutions/cleaning']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><Link href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</Link></div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Legal</p>
              {[['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','mailto:hello@lead2project.com']].map(([l,h]) => (
                <div key={l} className="mb-2.5"><Link href={h} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{l}</Link></div>
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