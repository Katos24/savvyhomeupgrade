'use client';

import React from 'react';
import { useFadeIn } from '@/components/marketing/hooks';
import { SlidersHorizontal, LayoutGrid, FileText, Mail, Check, Plus, MessageSquare, Pencil } from 'lucide-react';

// ── Bento cards ───────────────────────────────────────────────────────────────

function PipelineBento() {
  const stages = [
    { label: 'New',         color: '#10b981', required: true,  bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'Contacted',   color: '#f59e0b', required: false, bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'In Progress', color: '#3b82f6', required: false, bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700'    },
    { label: 'Quoted',      color: '#8b5cf6', required: false, bg: 'bg-slate-50',   border: 'border-slate-100',   text: 'text-slate-700'   },
    { label: 'Completed',   color: '#10b981', required: true,  bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <SlidersHorizontal size={15} className="text-amber-600" />
          </div>
          <p className="text-[13px] font-black text-slate-900">Pipeline Stages</p>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 cursor-pointer">
          <Plus size={8} /> Add Stage
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {stages.map((s, i) => (
          <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${s.bg} ${s.border}`}>
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <p className={`text-[10px] sm:text-[11px] font-semibold flex-1 ${s.text}`}>{s.label}</p>
            {s.required
              ? <span className="text-[8px] font-bold text-slate-300">Required</span>
              : <div className="w-5 h-5 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:border-indigo-300">
                  <Pencil size={8} className="text-slate-400" />
                </div>
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
            <p className={`text-[9px] sm:text-[10px] font-semibold flex-1 truncate ${i === 0 ? 'text-indigo-700' : 'text-slate-700'}`}>{cat.label}</p>
            <span className="hidden sm:inline text-[8px] font-black text-blue-400">{cat.tasks} tasks</span>
            <span className="text-[8px] font-black text-emerald-500">{cat.items} items</span>
          </div>
        ))}
      </div>

      {/* Expanded view of first category */}
      <div className="hidden sm:block rounded-xl border border-indigo-100 overflow-hidden flex-1">
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

function FormBento({ isDark = false }: { isDark?: boolean }) {
  const toggles = [
    { label: 'Service address',    desc: 'Autocomplete',          on: true  },
    { label: 'Preferred date',     desc: 'Suggest a date',        on: true  },
    { label: 'Preferred time',     desc: 'Morning / afternoon',   on: false },
    { label: 'How did you hear?',  desc: 'Google, referral, etc', on: false },
    { label: 'Photo / video',      desc: 'Job site photos',       on: true  },
  ];
  const customQs = [
    { label: 'How old is your roof?',  type: 'Dropdown', options: ['Under 10 yrs', '10–20 yrs', '20+ yrs'] },
    { label: 'Filing insurance claim?', type: 'Yes / No',  options: [] },
  ];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-orange-500/20" : "bg-orange-100"}`}>
          <FileText size={15} className={isDark ? "text-orange-400" : "text-orange-600"} />
        </div>
        <p className={`text-[13px] font-black ${isDark ? "text-white" : "text-slate-900"}`}>Intake Form</p>
      </div>

      {/* Standard toggles */}
      <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${isDark ? "text-white/40" : "text-slate-400"}`}>Standard Fields</p>
      <div className="flex flex-col gap-1.5 mb-3">
        {toggles.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[9px] sm:text-[9.5px] font-semibold leading-tight ${f.on ? (isDark ? "text-white/90" : "text-slate-700") : (isDark ? "text-white/20" : "text-slate-300")}`}>{f.label}</p>
              <p className={`text-[7.5px] leading-tight ${f.on ? (isDark ? "text-white/40" : "text-slate-400") : (isDark ? "text-white/10" : "text-slate-200")}`}>{f.desc}</p>
            </div>
            <div
              className="flex items-center px-0.5 rounded-full transition-all shrink-0"
              style={{
                background: f.on ? '#4f46e5' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                width: 28, height: 16,
                justifyContent: f.on ? 'flex-end' : 'flex-start',
              }}
            >
              <div className="rounded-full bg-white shadow-sm" style={{ width: 12, height: 12 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Custom questions */}
      <div className="flex items-center justify-between mb-1.5">
        <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Your Own Questions</p>
        <div className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
          <Plus size={7} /> Add
        </div>
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {customQs.map((q, i) => (
          <div key={i} className="rounded-xl px-2.5 py-2" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
            <div className="flex items-center justify-between mb-1">
              <p className={`text-[9px] font-black truncate flex-1 ${isDark ? "text-white/80" : "text-slate-700"}`}>{q.label}</p>
              <span className="text-[7px] font-black px-1.5 py-0.5 rounded-full ml-2 shrink-0"
                style={{ background: '#eef2ff', color: '#6366f1' }}>{q.type}</span>
            </div>
            {q.options.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {q.options.map((o, j) => (
                  <span key={j} className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.08)" : "#fff", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0", color: isDark ? "rgba(255,255,255,0.5)" : "#64748b" }}>{o}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className={`text-[10px] font-medium mt-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>Toggle fields · Build custom questions</p>
    </div>
  );
}

function EmailBento({ isDark = false }: { isDark?: boolean }) {
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
        <p className={`text-[13px] font-black ${isDark ? "text-white" : "text-slate-900"}`}>Branded Emails</p>
      </div>
      <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
        {/* Email header banner */}
        <div className="px-3 py-2.5" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded bg-white/20 overflow-hidden flex items-center justify-center">
              <img src="/images/ridgelinelogo.png" alt="" className="w-3 h-3 object-contain" />
            </div>
            <p className="text-[9px] font-black text-white">Ridge Line Roofing</p>
            <span className="ml-auto text-[7px] text-white/50">hello@ridgeline.com</span>
          </div>
          <p className="text-[12px] font-black text-white leading-tight">Your quote is ready</p>
          <p className="text-[8px] text-white/60 mt-0.5">Quote #1042 · Sent Apr 9, 2026</p>
        </div>

        {/* Email body */}
        <div className="px-3 pt-2.5 pb-2 flex-1 flex flex-col" style={{ background: isDark ? "#1e293b" : "#ffffff" }}>
          {/* Greeting */}
          <p className={`text-[8.5px] leading-relaxed mb-2 ${isDark ? "text-white/50" : "text-slate-600"}`}>
            Hi <span className={`font-black ${isDark ? "text-white/90" : "text-slate-800"}`}>Curtis</span>, thanks for choosing Ridge Line Roofing. Here's the quote for your roof replacement at <span className={`font-semibold ${isDark ? "text-white/70" : ""}`}>42 Maple Ave, Brooklyn NY</span>.
          </p>

          {/* Line items table */}
          <div className="rounded-lg overflow-hidden mb-2" style={{ border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
            <div className="px-2 py-1 grid grid-cols-2" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc" }}>
              <p className={`text-[7px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-slate-400"}`}>Item</p>
              <p className={`text-[7px] font-black uppercase tracking-widest text-right ${isDark ? "text-white/30" : "text-slate-400"}`}>Price</p>
            </div>
            {lineItems.map((item, i) => (
              <div key={i} className={`px-2 py-1 grid grid-cols-2 ${i < lineItems.length - 1 ? (isDark ? "border-b border-white/5" : "border-b border-slate-50") : ""}`}>
                <p className={`text-[8px] ${isDark ? "text-white/50" : "text-slate-600"}`}>{item.label}</p>
                <p className={`text-[8px] font-semibold text-right ${isDark ? "text-white/80" : "text-slate-700"}`}>{item.price}</p>
              </div>
            ))}
            <div className="px-2 py-1.5 grid grid-cols-2" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc", borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f1f5f9" }}>
              <p className={`text-[8px] font-black ${isDark ? "text-white/70" : "text-slate-700"}`}>Total</p>
              <p className="text-[8px] font-black text-emerald-600 text-right">$6,130.00</p>
            </div>
          </div>

          {/* Note */}
          <p className={`text-[7.5px] leading-relaxed mb-2.5 ${isDark ? "text-white/30" : "text-slate-400"}`}>
            Quote valid for 14 days. Questions? Reply to this email or call (718) 555-0192.
          </p>

          {/* CTA buttons */}
          <div className="grid grid-cols-2 gap-1.5 mt-auto">
            <div className="py-1.5 rounded-lg text-center text-[9px] font-black text-white" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>Accept Quote</div>
            <div className="py-1.5 rounded-lg text-center text-[9px] font-black" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#94a3b8", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0" }}>Decline</div>
          </div>
        </div>
      </div>
      <p className={`text-[10px] font-medium mt-3 ${isDark ? "text-white/30" : "text-slate-400"}`}>Fully branded · One click · Tracked in outbox</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b overflow-hidden" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">

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
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-7 [&>*:nth-child(n+3)]:col-span-2 [&>*:nth-child(n+3)]:lg:col-span-1"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s' }}
        >
          {([<PipelineBento />, <CategoriesBento />, <FormBento isDark />, <EmailBento isDark />] as React.ReactNode[]).map((card, i) => {
            const isDark = i >= 2;
            return (
              <div
                key={i}
                className="rounded-2xl p-3.5 sm:p-5 lg:p-6 w-full border"
                style={{
                  background: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
                  boxShadow: isDark ? '0 2px 16px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.06)',
                }}
              >
                {card}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}