'use client';

import React, { useState } from 'react';
import { useFadeIn } from '@/components/marketing/hooks';
import { SlidersHorizontal, LayoutGrid, Mail, Check, Plus, Pencil } from 'lucide-react';

function PipelineBento() {
  const stages = [
    { label: 'New',         color: '#10b981', required: true,  bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'Contacted',   color: '#f59e0b', required: false, bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'In Progress', color: '#3b82f6', required: false, bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700'    },
    { label: 'Quoted',      color: '#3b82f6', required: false, bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'Completed',   color: '#10b981', required: true,  bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={15} className="text-amber-600" />
          </div>
          <p className="text-[13px] font-black text-slate-900">Pipeline Stages</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          <Plus size={8} /> Add Stage
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {stages.map((s, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${s.bg} ${s.border}`}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <p className={`text-[11px] font-semibold flex-1 ${s.text}`}>{s.label}</p>
            {s.required
              ? <span className="text-[9px] font-bold text-slate-300">Required</span>
              : <div className="w-6 h-6 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:border-blue-300 transition-colors">
                  <Pencil size={9} className="text-slate-400" />
                </div>
            }
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 font-semibold mt-4">Rename & reorder to match your workflow</p>
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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <LayoutGrid size={15} className="text-blue-600" />
          </div>
          <p className="text-[13px] font-black text-slate-900">Categories</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <Plus size={8} /> Add
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {cats.map((cat, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${i === 0 ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
            <p className={`text-[11px] font-semibold flex-1 truncate ${i === 0 ? 'text-blue-700' : 'text-slate-700'}`}>{cat.label}</p>
            <span className="text-[9px] font-black text-blue-400 hidden sm:inline">{cat.tasks} tasks</span>
            <span className="text-[9px] font-black text-emerald-500">{cat.items} items</span>
          </div>
        ))}
      </div>

      <div className="hidden sm:block rounded-xl border border-blue-100 overflow-hidden flex-1">
        <div className="px-3 py-2 border-b border-blue-100 bg-blue-50">
          <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Auto-loads on select</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          <div className="px-3 py-2.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Tasks</p>
            <div className="flex flex-col gap-1.5">
              {expandedTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <p className="text-[9px] text-slate-600 leading-tight">{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Quote Items</p>
            <div className="flex flex-col gap-1.5">
              {expandedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-1">
                  <p className="text-[9px] text-slate-600 truncate">{item.label}</p>
                  <p className="text-[9px] font-black text-emerald-600 shrink-0">{item.price}</p>
                </div>
              ))}
              <div className="border-t border-slate-100 mt-1.5 pt-1.5 flex justify-between">
                <p className="text-[9px] font-black text-slate-500">Total</p>
                <p className="text-[9px] font-black text-slate-900">$6,130</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 font-semibold mt-4">Custom tasks & quote templates per category</p>
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
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Mail size={15} className="text-blue-600" />
        </div>
        <p className="text-white text-[13px] font-black">Branded Emails</p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden flex flex-col border border-white/8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="px-3 py-3" style={{ background: 'linear-gradient(135deg, #1d4ed8, #0369a1)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded bg-white/20 overflow-hidden flex items-center justify-center shrink-0">
              <img src="/images/ridgelinelogo.webp" alt="" className="w-4 h-4 object-contain" />
            </div>
            <p className="text-[10px] font-black text-white">Ridge Line Roofing</p>
            <span className="ml-auto text-[8px] text-white/50">hello@ridgeline.com</span>
          </div>
          <p className="text-[13px] font-black text-white leading-tight">Your quote is ready</p>
          <p className="text-[9px] text-white/60 mt-0.5">Quote #1042 · Sent Apr 9, 2026</p>
        </div>

        <div className="px-3 pt-3 pb-2.5 flex-1 flex flex-col" style={{ background: '#1e293b' }}>
          <p className="text-[9px] text-white/50 leading-relaxed mb-3">
            Hi <span className="font-black text-white/90">Curtis</span>, thanks for choosing Ridge Line Roofing. Here's your quote for the roof replacement at <span className="text-white/70">42 Maple Ave, Brooklyn NY</span>.
          </p>

          <div className="rounded-lg overflow-hidden mb-3" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-2.5 py-1.5 grid grid-cols-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Item</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-right text-white/30">Price</p>
            </div>
            {lineItems.map((item, i) => (
              <div key={i} className={`px-2.5 py-1.5 grid grid-cols-2 ${i < lineItems.length - 1 ? 'border-b border-white/5' : ''}`}>
                <p className="text-[9px] text-white/50">{item.label}</p>
                <p className="text-[9px] font-semibold text-right text-white/80">{item.price}</p>
              </div>
            ))}
            <div className="px-2.5 py-1.5 grid grid-cols-2" style={{ background: 'rgba(255,255,255,0.05)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[9px] font-black text-white/70">Total</p>
              <p className="text-[9px] font-black text-emerald-400 text-right">$6,130.00</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto">
            <div className="py-2 rounded-lg text-center text-[10px] font-black text-white" style={{ background: 'linear-gradient(135deg, #1d4ed8, #0369a1)' }}>
              Accept Quote
            </div>
            <div className="py-2 rounded-lg text-center text-[10px] font-black text-white/30" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              Decline
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-white/60 font-semibold mt-4">Fully branded · One click · Tracked in outbox</p>
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
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(16px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}
    >
      {/* Tab bar */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              active === t.id
                ? 'bg-[#0F1F3D] text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div
        key={active}
        className="rounded-2xl p-6 sm:p-8 w-full max-w-2xl mx-auto border transition-all"
        style={{
          background: current.dark ? '#0f172a' : '#ffffff',
          borderColor: current.dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
          boxShadow: current.dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.06)',
          animation: 'fadeUp 0.3s ease',
        }}
      >
        {card}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>
    </div>
  );
}

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b overflow-hidden"
      style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}
    >
      <div className="max-w-7xl mx-auto">

        <div
          ref={ref}
          className="text-center mb-10 sm:mb-14"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'none' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: '#1a6645' }}>
            Built around your business
          </p>
          <h2
            className="font-black text-slate-900"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}
          >
            Your rules.<br className="sm:hidden" /> Your workflow.
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-3 max-w-sm mx-auto leading-relaxed">
            Customize your pipeline, categories, and emails to match exactly how you run your business.
          </p>
        </div>

       <TabShowcase visible={visible} />

      </div>
    </section>
  );
}