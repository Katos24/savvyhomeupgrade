'use client';

import React from 'react';
import { useFadeIn } from '@/components/marketing/hooks';
import { SlidersHorizontal, LayoutGrid, FileText, Mail, Check, Plus } from 'lucide-react';

// ── Bento cards ───────────────────────────────────────────────────────────────

function PipelineBento() {
  const stages = [
    { label: 'New',         color: '#10b981' },
    { label: 'Contacted',   color: '#f59e0b' },
    { label: 'Quoted',      color: '#8b5cf6' },
    { label: 'Won',         color: '#3b82f6' },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
          <SlidersHorizontal size={12} className="text-amber-600" />
        </div>
        <p className="text-[11px] font-black text-slate-900">Pipeline Stages</p>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <p className="text-[10px] font-semibold text-slate-700 flex-1">{s.label}</p>
            {(i === 0 || i === stages.length - 1)
              ? <span className="text-[8px] text-slate-400 font-bold">Required</span>
              : <div className="w-3 h-3 rounded border border-slate-200 flex items-center justify-center"><Check size={7} className="text-indigo-500" /></div>
            }
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 font-medium mt-2">Rename & reorder to match your workflow</p>
    </div>
  );
}

function CategoriesBento() {
  const cats = [
    { label: 'Full Roof Replacement', tasks: 4, items: 11, color: '#6366f1' },
    { label: 'Roof Repair',           tasks: 2, items: 4,  color: '#10b981' },
    { label: 'Gutter Installation',   tasks: 1, items: 6,  color: '#f59e0b' },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
            <LayoutGrid size={12} className="text-purple-600" />
          </div>
          <p className="text-[11px] font-black text-slate-900">Categories</p>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
          <Plus size={7} /> Add
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {cats.map((cat, i) => (
          <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
            <p className="text-[9px] font-semibold text-slate-700 flex-1 truncate">{cat.label}</p>
            <span className="text-[8px] font-black text-blue-500">{cat.tasks}t</span>
            <span className="text-[8px] font-black text-emerald-500">{cat.items}$</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 font-medium mt-2">Tasks & pricing auto-load per category</p>
    </div>
  );
}

function FormBento() {
  const fields = [
    { label: 'Service address',      on: true  },
    { label: 'Preferred date',        on: true  },
    { label: 'Photo upload',          on: true  },
    { label: 'Insurance claim?',      on: true  },
    { label: 'Square footage',        on: false },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
          <FileText size={12} className="text-orange-600" />
        </div>
        <p className="text-[11px] font-black text-slate-900">Intake Form</p>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between">
            <p className={`text-[10px] font-medium ${f.on ? 'text-slate-700' : 'text-slate-300'}`}>{f.label}</p>
            <div className="flex items-center px-0.5 rounded-full"
              style={{ background: f.on ? '#4f46e5' : '#e2e8f0', width: 24, height: 13, justifyContent: f.on ? 'flex-end' : 'flex-start' }}>
              <div className="rounded-full bg-white shadow-sm" style={{ width: 10, height: 10 }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-slate-400 font-medium mt-2">Toggle fields · Add custom questions</p>
    </div>
  );
}

function EmailBento() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
          <Mail size={12} className="text-blue-600" />
        </div>
        <p className="text-[11px] font-black text-slate-900">Branded Emails</p>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden border border-slate-100">
        <div className="px-3 py-2" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-4 h-4 rounded bg-white/20 overflow-hidden flex items-center justify-center">
              <img src="/images/ridgelinelogo.png" alt="" className="w-3 h-3 object-contain" />
            </div>
            <p className="text-[8px] font-black text-white">Ridge Line Roofing</p>
          </div>
          <p className="text-[10px] font-black text-white">Your quote is ready</p>
        </div>
        <div className="bg-white px-3 py-2">
          <p className="text-[8px] text-slate-500 mb-2">Hi <span className="font-black text-indigo-600">Curtis</span>, your quote is $6,130.00</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="py-1 rounded text-center text-[8px] font-black text-white" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>Accept</div>
            <div className="py-1 rounded text-center text-[8px] font-black text-slate-400 border border-slate-200">Decline</div>
          </div>
        </div>
      </div>
      <p className="text-[9px] text-slate-400 font-medium mt-2">Fully branded · One click · Tracked</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-14 px-4 sm:px-6 border-b overflow-hidden" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-8"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: '#1a6645' }}>
            Lead2Project is built around your business
          </p>
          <h2 className="font-black text-slate-900" style={{ fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
            Your rules. Your workflow.
          </h2>
        </div>

        {/* Bento grid */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s' }}
        >
          {([<PipelineBento />, <CategoriesBento />, <FormBento />, <EmailBento />] as React.ReactNode[]).map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              {card}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}