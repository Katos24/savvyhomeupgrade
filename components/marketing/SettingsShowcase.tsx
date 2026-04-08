'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LayoutGrid, Mail, FileText, SlidersHorizontal } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ── Cards ─────────────────────────────────────────────────────────────────────

function CategoryCard() {
  const tasks = ['Inspect shingles & underlayment', 'Check flashing and seals', 'Photo documentation', 'Measure sq footage'];
  const items = [{ name: 'Shingle Replacement', price: '$4,200' }, { name: 'Flashing Repair', price: '$380' }, { name: 'Removal & Disposal', price: '$350' }, { name: 'Labor', price: '$1,200' }];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden w-full" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: 380 }}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Service Category</p>
          <p className="text-[13px] font-black text-slate-900">Roofing</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {['Roofing','Gutters','Siding'].map((c,i) => (
            <div key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${i===0?'bg-indigo-50 border-indigo-200 text-indigo-600':'bg-slate-50 border-slate-200 text-slate-400'}`}>{c}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <div className="px-3 py-3">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center"><Check size={8} className="text-indigo-600" /></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tasks</p>
            <span className="ml-auto text-[8px] font-black text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded-full">4</span>
          </div>
          {tasks.map((t,i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <div className="w-2.5 h-2.5 rounded border-2 border-indigo-200 flex items-center justify-center mt-0.5 shrink-0"><div className="w-1 h-1 rounded-sm bg-indigo-400" /></div>
              <p className="text-[10px] text-slate-600 leading-tight">{t}</p>
            </div>
          ))}
        </div>
        <div className="px-3 py-3">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center"><span className="text-[8px] font-black text-emerald-600">$</span></div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Items</p>
            <span className="ml-auto text-[8px] font-black text-emerald-500 bg-emerald-50 px-1 py-0.5 rounded-full">4</span>
          </div>
          {items.map((item,i) => (
            <div key={i} className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-slate-600 truncate flex-1 mr-1">{item.name}</p>
              <p className="text-[10px] font-black text-emerald-600 shrink-0">{item.price}</p>
            </div>
          ))}
          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-[11px] font-black text-slate-900">$6,130</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-medium">Category selected → tasks & pricing load instantly</p>
      </div>
    </div>
  );
}

function EmailCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden w-full" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: 380 }}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Branded Email</p>
          <p className="text-[13px] font-black text-slate-900">Quote Sent</p>
        </div>
        <div className="flex gap-1.5">
          {['Quote','Schedule','Reminder'].map((t,i) => (
            <div key={i} className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${i===0?'bg-blue-50 border-blue-200 text-blue-600':'bg-slate-50 border-slate-200 text-slate-400'}`}>{t}</div>
          ))}
        </div>
      </div>
      <div className="mx-3 my-3 rounded-xl overflow-hidden border border-slate-100">
        <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
              <img src="/images/ridgelinelogo.png" alt="" className="w-4 h-4 object-contain" />
            </div>
            <p className="text-[10px] font-black text-white">Ridge Line Roofing</p>
          </div>
          <p className="text-[14px] font-black text-white leading-tight">Your quote is ready</p>
          <p className="text-[9px] text-white/60 mt-0.5">Review and accept below</p>
        </div>
        <div className="bg-white px-4 py-3">
          <p className="text-[10px] text-slate-600 mb-1">Hi <span className="font-black text-indigo-600">Curtis</span>,</p>
          <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">We've prepared your roofing quote. Review the details and accept when ready.</p>
          <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quote Total</p>
            <p className="text-[14px] font-black text-slate-900">$6,130.00</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="py-2 rounded-lg text-center text-[10px] font-black text-white" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>Accept Quote</div>
            <div className="py-2 rounded-lg text-center text-[10px] font-black text-slate-400 border border-slate-200">Decline</div>
          </div>
          <p className="text-[8px] text-slate-300 text-center mt-2">Powered by Lead2Project</p>
        </div>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-medium">Fully branded · Sent in one click · Tracked in outbox</p>
      </div>
    </div>
  );
}

function FormCard() {
  const fields = [
    { label: 'Service address',     on: true  },
    { label: 'Preferred date',      on: true  },
    { label: 'Photo / video upload',on: true  },
    { label: 'Insurance claim?',    on: true  },
    { label: 'Preferred time',      on: false },
    { label: 'Square footage',      on: false },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden w-full" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: 380 }}>
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Intake Form</p>
          <p className="text-[13px] font-black text-slate-900">Step 2 — You control</p>
        </div>
        <div className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-50 border border-orange-200 text-orange-600">Custom fields</div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Toggle fields on or off</p>
        <div className="space-y-2">
          {fields.map((f,i) => (
            <div key={i} className="flex items-center justify-between">
              <p className={`text-[11px] font-semibold ${f.on?'text-slate-800':'text-slate-300'}`}>{f.label}</p>
              <div className="flex items-center px-0.5 rounded-full shrink-0"
                style={{ background: f.on?'#4f46e5':'#e2e8f0', width:28, height:16, justifyContent: f.on?'flex-end':'flex-start' }}>
                <div className="rounded-full bg-white shadow-sm" style={{ width:12, height:12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-4 mb-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
        <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">+ Custom question</p>
        <p className="text-[10px] text-slate-700 font-medium mb-1.5">Do you have an HOA?</p>
        <div className="flex gap-1.5">
          {['Yes','No','Not sure'].map((o,i) => (
            <div key={i} className={`px-2 py-0.5 rounded text-[9px] font-black border ${i===0?'bg-orange-500 text-white border-orange-500':'bg-white text-slate-400 border-slate-200'}`}>{o}</div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <p className="text-[9px] text-slate-400 font-medium">Add questions · Toggle fields · Control every step</p>
      </div>
    </div>
  );
}

// ── Stacked cycling cards ─────────────────────────────────────────────────────

const CARDS = [
  { label: 'Categories',  color: '#6366f1', component: <CategoryCard /> },
  { label: 'Emails',      color: '#3b82f6', component: <EmailCard />    },
  { label: 'Intake Form', color: '#f97316', component: <FormCard />     },
];

function StackedCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % CARDS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full">
      {/* Blobs */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }} />

      {/* Stack wrapper — fixed height matching all cards */}
      <div className="relative" style={{ paddingBottom: 24 }}>
        {/* Ghost div sets container height */}
        <div className="invisible pointer-events-none" style={{ minHeight: 380 }} />

        {/* Real stacked cards — absolutely positioned */}
        {CARDS.map((card, i) => {
          const offset = (i - active + CARDS.length) % CARDS.length;
          const isActive = offset === 0;
          const isNext = offset === 1;

          return (
            <div
              key={i}
              className="absolute inset-x-0 top-0"
              style={{
                zIndex: isActive ? 30 : isNext ? 20 : 10,
                transform: isActive
                  ? 'scale(1) translateY(0px)'
                  : isNext
                    ? 'scale(0.97) translateY(10px)'
                    : 'scale(0.94) translateY(20px)',
                opacity: isActive ? 1 : isNext ? 0.55 : 0.25,
                transition: 'all 0.65s cubic-bezier(0.16,1,0.3,1)',
                filter: isActive ? 'none' : 'blur(0.5px)',
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              {card.component}
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2 mt-4">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === active ? 20 : 6,
              height: 6,
              background: i === active ? CARDS[active].color : '#cbd5e1',
            }}
          />
        ))}
        <p className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">
          {CARDS[active].label}
        </p>
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <LayoutGrid size={14} />,        color: '#8b5cf6', bg: '#ede9fe', title: 'Category templates',   desc: 'Tasks and quote items auto-load the moment a category is selected.' },
  { icon: <Mail size={14} />,              color: '#3b82f6', bg: '#dbeafe', title: 'Branded email outbox',  desc: 'Quotes, schedules, reminders sent under your brand in one click.'     },
  { icon: <FileText size={14} />,          color: '#f97316', bg: '#ffedd5', title: 'Custom intake form',    desc: 'Toggle fields on or off. Add custom questions. Your form, your rules.'  },
  { icon: <SlidersHorizontal size={14} />, color: '#f59e0b', bg: '#fef3c7', title: 'Pipeline your way',    desc: 'Rename and reorder stages to match exactly how you close jobs.'         },
];

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 border-b overflow-hidden" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >

          {/* LEFT — copy */}
          <div className="flex flex-col">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
              Built around your business
            </p>
            <h2 className="font-black tracking-tight mb-5 text-slate-900" style={{ fontSize: 'clamp(26px, 5vw, 48px)', lineHeight: 1.05 }}>
              Your business rules.<br />
              <span style={{ color: '#1a6645' }}>Our infrastructure.</span>
            </h2>
            <p className="text-base font-medium text-slate-500 leading-relaxed mb-8 max-w-md">
              Set up Lead2Project once to match your workflow. Categories, templates, branded emails, and your intake form — all configured your way.
            </p>

            <div className="space-y-4 mb-8">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: f.bg }}>
                    <span style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900 mb-0.5">{f.title}</p>
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 self-start"
              style={{ background: '#1a6645' }}
            >
              Set it up free <ArrowRight size={15} />
            </Link>
          </div>

          {/* RIGHT — stacked cycling cards */}
          <div className="w-full min-w-0">
            <StackedCards />
          </div>

        </div>
      </div>
    </section>
  );
}