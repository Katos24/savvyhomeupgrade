'use client';

import React from 'react';
import { useFadeIn } from '@/components/marketing/hooks';
import { SlidersHorizontal, LayoutGrid, FileText, Mail, Check, Plus } from 'lucide-react';

// ── Bento cards ───────────────────────────────────────────────────────────────

function PipelineBento() {
  const stages = [
    { label: 'New',       color: '#10b981' },
    { label: 'Contacted', color: '#f59e0b' },
    { label: 'Quoted',    color: '#8b5cf6' },
    { label: 'Won',       color: '#3b82f6' },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <SlidersHorizontal size={15} className="text-amber-600" />
        </div>
        <p className="text-[13px] font-black text-slate-900">Pipeline Stages</p>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <p className="text-[11px] font-semibold text-slate-700 flex-1">{s.label}</p>
            {(i === 0 || i === stages.length - 1)
              ? <span className="text-[9px] text-slate-400 font-bold">Required</span>
              : <div className="w-4 h-4 rounded border border-slate-200 flex items-center justify-center"><Check size={8} className="text-indigo-500" /></div>
            }
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-3">Rename & reorder to match your workflow</p>
    </div>
  );
}

function CategoriesBento() {
  const cats = [
    { label: 'Full Roof Replacement', tasks: 4, items: 4, color: '#6366f1' },
    { label: 'Roof Repair',           tasks: 2, items: 4,  color: '#10b981' },
    { label: 'Gutter Installation',   tasks: 1, items: 6,  color: '#f59e0b' },
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <LayoutGrid size={15} className="text-purple-600" />
          </div>
          <p className="text-[13px] font-black text-slate-900">Categories</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          <Plus size={8} /> Add
        </div>
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-1.5 mb-3">
        {cats.map((cat, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${i === 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
            <p className={`text-[10px] font-semibold flex-1 truncate ${i === 0 ? 'text-indigo-700' : 'text-slate-700'}`}>{cat.label}</p>
            <span className="text-[8px] font-black text-blue-400">{cat.tasks} tasks</span>
            <span className="text-[8px] font-black text-emerald-500">{cat.items} items</span>
          </div>
        ))}
      </div>

      {/* Expanded view of first category */}
      <div className="rounded-xl border border-indigo-100 overflow-hidden flex-1">
        <div className="px-2.5 py-1.5 border-b border-indigo-100" style={{ background: '#eef2ff' }}>
          <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Auto-loads on select</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          {/* Tasks */}
          <div className="px-2.5 py-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tasks</p>
            <div className="flex flex-col gap-1">
              {expandedTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-1">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <p className="text-[8px] text-slate-600 leading-tight">{t}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Quote items */}
          <div className="px-2.5 py-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Quote Items</p>
            <div className="flex flex-col gap-1">
              {expandedItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-1">
                  <p className="text-[8px] text-slate-600 truncate">{item.label}</p>
                  <p className="text-[8px] font-black text-emerald-600 shrink-0">{item.price}</p>
                </div>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1 flex justify-between">
                <p className="text-[8px] font-black text-slate-500">Total</p>
                <p className="text-[8px] font-black text-slate-900">$6,130</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-medium mt-3">Custom tasks & quote templates per category</p>
    </div>
  );
}

function FormBento() {
  const fields = [
    { label: 'Service address',  on: true  },
    { label: 'Photo upload',     on: true  },
    { label: 'Budget range',     on: true  },
    { label: 'How urgent?',      on: true  },
    { label: 'Square footage',   on: false },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <FileText size={15} className="text-orange-600" />
        </div>
        <p className="text-[13px] font-black text-slate-900">Intake Form</p>
      </div>
      <div className="flex flex-col gap-2.5 flex-1">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <p className={`text-[11px] font-medium ${f.on ? 'text-slate-700' : 'text-slate-300'}`}>{f.label}</p>
            <div
              className="flex items-center px-0.5 rounded-full transition-all"
              style={{
                background: f.on ? '#4f46e5' : '#e2e8f0',
                width: 28,
                height: 16,
                justifyContent: f.on ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="rounded-full bg-white shadow-sm" style={{ width: 12, height: 12 }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-3">Toggle fields · Add custom questions</p>
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
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Mail size={15} className="text-blue-600" />
        </div>
        <p className="text-[13px] font-black text-slate-900">Branded Emails</p>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Email header */}
        <div className="px-3 py-2.5" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded bg-white/20 overflow-hidden flex items-center justify-center">
              <img src="/images/ridgelinelogo.png" alt="" className="w-3 h-3 object-contain" />
            </div>
            <p className="text-[9px] font-black text-white">Ridge Line Roofing</p>
          </div>
          <p className="text-[11px] font-black text-white">Your quote is ready</p>
          <p className="text-[8px] text-white/60 mt-0.5">Hi Curtis, review your quote below</p>
        </div>
        {/* Line items */}
        <div className="bg-white px-3 py-2.5 flex-1">
          <div className="flex flex-col gap-1 mb-2">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <p className="text-[8px] text-slate-500">{item.label}</p>
                <p className="text-[8px] font-black text-slate-700">{item.price}</p>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-1.5 mt-0.5 flex items-center justify-between">
              <p className="text-[9px] font-black text-slate-700">Total</p>
              <p className="text-[9px] font-black text-emerald-600">$6,130.00</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="py-1.5 rounded-lg text-center text-[9px] font-black text-white" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>Accept</div>
            <div className="py-1.5 rounded-lg text-center text-[9px] font-black text-slate-400 border border-slate-200">Decline</div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-3">Fully branded · One click · Tracked</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b overflow-hidden" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-10 sm:mb-12"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#1a6645' }}>
            Lead2Project is built around your business
          </p>
          <h2 className="font-black text-slate-900" style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
            Your rules. Your workflow.
          </h2>
        </div>

        {/* Bento grid — 1 col mobile, 2 col sm, 4 col lg */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s' }}
        >
          {([<PipelineBento />, <CategoriesBento />, <FormBento />, <EmailBento />] as React.ReactNode[]).map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 w-full"
              style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
            >
              {card}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}