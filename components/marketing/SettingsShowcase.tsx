'use client';

import React, { useState } from 'react';
import { useFadeIn } from '@/components/marketing/hooks';
import { SlidersHorizontal, LayoutGrid, Mail, Plus, Pencil } from 'lucide-react';

function PipelineBento() {
  const stages = [
    { label: 'New',         color: '#10b981', required: true,  bg: 'bg-emerald-50/50',   border: 'border-emerald-100/50',   text: 'text-emerald-900'   },
    { label: 'Contacted',   color: '#f59e0b', required: false, bg: 'bg-amber-50/50',     border: 'border-amber-100/50',     text: 'text-amber-900'   },
    { label: 'In Progress', color: '#3b82f6', required: false, bg: 'bg-blue-50/50',      border: 'border-blue-100/50',      text: 'text-blue-900'    },
    { label: 'Quoted',      color: '#3b82f6', required: false, bg: 'bg-slate-50',        border: 'border-slate-100',        text: 'text-slate-900'   },
    { label: 'Completed',   color: '#10b981', required: true,  bg: 'bg-emerald-50',      border: 'border-emerald-200',      text: 'text-emerald-900' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/50">
            <SlidersHorizontal size={18} className="text-amber-600" />
          </div>
          <p className="text-sm font-black text-slate-900 tracking-tight">Pipeline Stages</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-all active:scale-95">
          <Plus size={10} strokeWidth={3} /> Add Stage
        </button>
      </div>

      <div className="flex flex-col gap-2.5 flex-1">
        {stages.map((s, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 shadow-sm transition-all ${s.bg} ${s.border}`}>
            <div className="w-2.5 h-2.5 rounded-full shrink-0 ring-4 ring-white/50" style={{ background: s.color }} />
            <p className={`text-xs font-bold flex-1 tracking-tight ${s.text}`}>{s.label}</p>
            {s.required
              ? <span className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest">Required</span>
              : <div className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center shadow-sm hover:border-blue-400 transition-colors cursor-pointer">
                  <Pencil size={11} className="text-slate-500" />
                </div>
            }
          </div>
        ))}
      </div>

      <p className="text-[12px] text-slate-500 font-bold mt-6 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-slate-300" /> Rename & reorder to match your workflow
      </p>
    </div>
  );
}

function CategoriesBento() {
  const cats = [
    { label: 'Full Roof Replacement', tasks: 4, items: 4, color: '#3b82f6' },
    { label: 'Roof Repair',           tasks: 2, items: 4, color: '#10b981' },
    { label: 'Gutter Installation',   tasks: 1, items: 6, color: '#f59e0b' },
  ];
  const expandedTasks = ['Inspect shingles & underlayment', 'Check flashing & seals', 'Photo documentation', 'Measure sq footage'];
  const expandedItems = [
    { label: 'Shingle Replacement', price: '$4,200' },
    { label: 'Flashing Repair',     price: '$380'   },
    { label: 'Removal & Disposal',  price: '$350'   },
    { label: 'Labor',               price: '$1,200' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 shadow-sm border border-blue-200/50">
            <LayoutGrid size={18} className="text-blue-600" />
          </div>
          <p className="text-sm font-black text-slate-900 tracking-tight">Categories</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all">
          <Plus size={10} strokeWidth={3} /> Add
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        {cats.map((cat, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer ${i === 0 ? 'bg-blue-50 border-blue-600 shadow-md translate-x-1' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <p className={`text-xs font-bold flex-1 truncate tracking-tight ${i === 0 ? 'text-blue-900' : 'text-slate-700'}`}>{cat.label}</p>
            <div className="flex gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'} hidden sm:inline`}>{cat.tasks} tasks</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${i === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>{cat.items} items</span>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block rounded-[20px] border-2 border-blue-100 overflow-hidden flex-1 shadow-inner bg-slate-50/50">
        <div className="px-4 py-2.5 border-b border-blue-100 bg-blue-600">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Auto-loads on select</p>
        </div>
        <div className="grid grid-cols-2 divide-x-2 divide-blue-50">
          <div className="px-4 py-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tasks</p>
            <div className="flex flex-col gap-2.5">
              {expandedTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <p className="text-[10px] text-slate-700 font-medium leading-tight">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 py-4 bg-white/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quote Items</p>
            <div className="flex flex-col gap-2.5">
              {expandedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-slate-600 font-medium truncate">{item.label}</p>
                  <p className="text-[10px] font-black text-slate-900 shrink-0">{item.price}</p>
                </div>
              ))}
              <div className="border-t-2 border-blue-50 mt-2 pt-3 flex justify-between items-center">
                <p className="text-[10px] font-black text-slate-500">Total</p>
                <p className="text-xs font-black text-emerald-600">$6,130</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-slate-500 font-bold mt-6 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-slate-300" /> Custom tasks & quote templates per category
      </p>
    </div>
  );
}

function EmailBento() {
  const lineItems = [
    { label: 'Shingle Replacement', price: '$4,200' },
    { label: 'Flashing Repair',     price: '$380'   },
    { label: 'Removal & Disposal',  price: '$350'   },
    { label: 'Labor',               price: '$1,200' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-xl">
          <Mail size={18} className="text-white" />
        </div>
        <p className="text-white text-sm font-black tracking-tight">Branded Emails</p>
      </div>

      <div className="flex-1 rounded-[24px] overflow-hidden flex flex-col border-2 border-white/10 shadow-2xl bg-[#0f172a]">
        <div className="px-5 py-5" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-lg p-1">
              <img src="/images/ridgelinelogo.webp" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white tracking-tight">Ridge Line Roofing</p>
              <p className="text-[8px] text-white/60 font-bold uppercase tracking-widest">hello@ridgeline.com</p>
            </div>
          </div>
          <p className="text-lg font-black text-white leading-tight tracking-tight">Your quote is ready</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="px-1.5 py-0.5 rounded bg-white/10 text-[8px] font-black text-white uppercase tracking-widest">Quote #1042</span>
             <p className="text-[9px] text-white/50 font-bold">Sent Apr 9, 2026</p>
          </div>
        </div>

        <div className="px-5 pt-5 pb-5 flex-1 flex flex-col">
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-5">
            Hi <span className="font-black text-white">Curtis</span>, thanks for choosing Ridge Line Roofing. Here's your quote for the roof replacement at <span className="text-white/80 font-semibold underline decoration-blue-500 underline-offset-4">42 Maple Ave, Brooklyn NY</span>.
          </p>

          <div className="rounded-2xl overflow-hidden mb-5 border-2 border-white/5 bg-white/[0.02]">
            <div className="px-3 py-2 grid grid-cols-2 bg-white/5">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Item</p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-right text-white/30">Price</p>
            </div>
            <div className="divide-y divide-white/5">
              {lineItems.map((item, i) => (
                <div key={i} className="px-3 py-2.5 grid grid-cols-2 items-center">
                  <p className="text-[10px] text-slate-400 font-bold">{item.label}</p>
                  <p className="text-[10px] font-black text-right text-white/90">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="px-3 py-3 grid grid-cols-2 bg-emerald-500/10 border-t border-emerald-500/20">
              <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest">Total</p>
              <p className="text-[12px] font-black text-emerald-400 text-right tracking-tight">{lineItems.reduce((acc, curr) => acc + parseFloat(curr.price.replace('$', '').replace(',', '')), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <button className="py-3 rounded-xl text-center text-[11px] font-black text-white shadow-lg active:scale-95 transition-transform" style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
              Accept Quote
            </button>
            <button className="py-3 rounded-xl text-center text-[11px] font-black text-white/40 border-2 border-white/5 hover:bg-white/5 transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-white/40 font-bold mt-6 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-white/20" /> Fully branded · One click · Tracked in outbox
      </p>
    </div>
  );
}

const TABS = [
  { id: 'pipeline',   label: 'Pipeline',   dark: false },
  { id: 'categories', label: 'Categories', dark: false },
  { id: 'emails',     label: 'Emails',     dark: true  },
];

function TabShowcase({ visible }: { visible: boolean }) {
  const [active, setActive] = useState('pipeline');
  const current = TABS.find(t => t.id === active)!;

  const card =
    active === 'pipeline'   ? <PipelineBento />   :
    active === 'categories' ? <CategoriesBento /> :
                              <EmailBento />;

  return (
    <div
      className="transition-all duration-1000 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(40px)',
      }}
    >
      {/* Tab bar - Modern Pills */}
      <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        <div className="flex p-1.5 bg-white border-2 border-slate-200/60 rounded-[24px] shadow-sm">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-6 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${
                active === t.id
                  ? 'bg-slate-900 text-white shadow-xl'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card - Centered with fixed height logic */}
      <div className="relative max-w-2xl mx-auto group">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-[40px] blur-3xl opacity-5 group-hover:opacity-10 transition-opacity" />
        <div
          key={active}
          className="relative rounded-[32px] p-6 sm:p-10 w-full border-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
          style={{
            background: current.dark ? '#0f172a' : '#ffffff',
            borderColor: current.dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            boxShadow: current.dark ? '0 30px 60px -12px rgba(0,0,0,0.5)' : '0 30px 60px -12px rgba(0,0,0,0.08)',
          }}
        >
          {card}
        </div>
      </div>
    </div>
  );
}

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 border-b overflow-hidden relative"
      style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}
    >
      {/* Background detail */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#1a6645 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-7xl mx-auto relative z-10">

        <div
          ref={ref}
          className="text-center mb-16 sm:mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 border border-[#1a6645]/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a6645]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#1a6645' }}>
              Built around your business
            </p>
          </div>
          
          <h2
            className="font-black text-slate-900 mb-6"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 0.85, letterSpacing: '-0.05em' }}
          >
            Your rules.<br /> Your workflow.
          </h2>
          <p className="text-base sm:text-lg font-bold text-slate-500 max-w-md mx-auto leading-tight tracking-tight">
            Customize your pipeline, categories, and emails to match exactly how you run your business.
          </p>
        </div>

       <TabShowcase visible={visible} />

      </div>
    </section>
  );
}