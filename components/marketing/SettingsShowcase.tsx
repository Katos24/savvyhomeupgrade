'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, SlidersHorizontal, LayoutGrid, FileText, Mail, Plus, Check, Settings, Globe, Copy, Phone, QrCode, ExternalLink, Users, CreditCard } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

// ── Settings preview components ───────────────────────────────────────────────

const SHOWCASE_CONFIG_ITEMS = [
  { icon: <SlidersHorizontal className="w-4 h-4" />, label: 'Pipeline',     desc: 'Customize your lead stages.',                       color: '#f59e0b', bg: '#fef3c7' },
  { icon: <LayoutGrid className="w-4 h-4" />,        label: 'Categories',   desc: 'Each gets its own checklist and pricing template.', color: '#8b5cf6', bg: '#ede9fe' },
  { icon: <FileText className="w-4 h-4" />,          label: 'Booking Form', desc: 'Control what customers fill out.',                  color: '#f97316', bg: '#ffedd5' },
  { icon: <Mail className="w-4 h-4" />,              label: 'Automations',  desc: 'Branded emails for every touchpoint.',             color: '#3b82f6', bg: '#dbeafe' },
  { icon: <Users className="w-4 h-4" />,             label: 'Team',         desc: 'Invite crew and assign leads.',                    color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: <CreditCard className="w-4 h-4" />,        label: 'Billing',      desc: 'Manage your plan and usage.',                     color: '#10b981', bg: '#d1fae5' },
];

function ShowcaseLogoInline({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/images/ridgelinelogo.png"
      alt="Ridge Line Roofing"
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

function SettingsPreviewInline() {
  return (
    <div className="bg-[#0f172a] w-full overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">LEAD2PROJECT</span>
        <span className="text-[10px] text-white/30 font-medium">Settings</span>
      </div>

      <div className="p-3">
        {/* Company card — slimmer */}
        <div className="bg-white rounded-xl overflow-hidden mb-3">
          <div className="h-7 w-full" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }} />
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 -mt-5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow border border-gray-100 flex items-center justify-center shrink-0">
                <ShowcaseLogoInline size={28} />
              </div>
              <div className="pt-2">
                <p className="text-[13px] font-black text-gray-900 leading-tight">Ridge Line Roofing</p>
                <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }}>PRO PLAN</span>
              </div>
              <button className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg mt-2">
                <Settings className="w-3 h-3" /> EDIT
              </button>
            </div>

            {/* Booking link */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-[10px] font-bold text-gray-700">lead2project.com/<span className="text-indigo-600">ridgeline-Roofing</span></p>
              </div>
              <button className="flex items-center gap-1 text-[9px] font-black text-gray-500 bg-white border border-gray-200 px-2 py-1 rounded-md">
                <Copy className="w-2.5 h-2.5" /> COPY
              </button>
            </div>

            {/* Info grid — 4 col */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {[
                { label: 'Email',  icon: <Mail className="w-3 h-3 text-gray-400" />,  val: 'info@ridgelineroofing.com' },
                { label: 'Phone',  icon: <Phone className="w-3 h-3 text-gray-400" />, val: '(555) 482-9301'            },
                { label: 'Website',icon: <Globe className="w-3 h-3 text-gray-400" />, val: 'ridgelineroofing.com'      },
                { label: 'Colors', icon: null, val: null },
              ].map((f, i) => (
                <div key={i}>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{f.label}</p>
                  {f.val
                    ? <div className="flex items-center gap-1">{f.icon}<span className="text-[10px] text-gray-700 font-medium truncate">{f.val}</span></div>
                    : <div className="flex gap-1.5"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#667eea' }} /><div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1c0866' }} /></div>
                  }
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <QrCode className="w-3.5 h-3.5 text-gray-500" />,    label: 'QR Code',   style: {} },
                { icon: <ExternalLink className="w-3.5 h-3.5 text-gray-500" />, label: 'View Form', style: {} },
                { icon: <Mail className="w-3.5 h-3.5 text-indigo-500" />,    label: 'Digest On', style: { borderColor: '#c7d2fe', background: '#eef2ff' } },
              ].map((b, i) => (
                <button key={i} className="flex flex-col items-center gap-1 py-2 border border-gray-200 rounded-xl" style={b.style}>
                  {b.icon}
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Configuration — 3x2 grid */}
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">System Configuration</p>
        <div className="grid grid-cols-3 gap-2">
          {SHOWCASE_CONFIG_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="text-[11px] font-black text-gray-900">{item.label}</p>
              <p className="text-[9px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mocks ─────────────────────────────────────────────────────────────────────

function PipelineMock() {
  const stages = [
    { label: 'New',         color: '#10b981' },
    { label: 'Contacted',   color: '#f59e0b' },
    { label: 'Quoted',      color: '#8b5cf6' },
    { label: 'In Progress', color: '#f97316' },
    { label: 'Completed',   color: '#3b82f6' },
  ];
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-[12px] font-black text-slate-900">Pipeline Stages</p>
        <div className="flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
          <Plus size={9} /> Add Stage
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {stages.map((s, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <p className="text-[12px] font-bold text-slate-800 flex-1">{s.label}</p>
            {(i === 0 || i === stages.length - 1)
              ? <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Required</span>
              : <div className="w-5 h-5 rounded border border-slate-200 flex items-center justify-center"><Check size={10} className="text-indigo-500" /></div>
            }
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <div className="w-full py-2 bg-slate-900 text-white text-[11px] font-black text-center rounded-xl">Save Pipeline</div>
      </div>
    </div>
  );
}

function CategoriesMock() {
  const cats = [
    { label: 'Full Roof Replacement', tasks: 3, items: 11, color: '#6366f1' },
    { label: 'Roof Repair',           tasks: 2, items: 4,  color: '#10b981' },
    { label: 'Gutter Installation',   tasks: 1, items: 6,  color: '#f59e0b' },
    { label: 'Emergency Service',     tasks: 1, items: 3,  color: '#ef4444' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {cats.map((cat, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${cat.color}15` }}>
            <LayoutGrid size={14} style={{ color: cat.color }} />
          </div>
          <p className="text-[11px] font-black text-slate-900 mb-2 leading-tight">{cat.label}</p>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px] font-black">
              <span className="text-slate-500 uppercase tracking-widest">Tasks</span>
              <span className="text-blue-600">{cat.tasks}</span>
            </div>
            <div className="flex items-center justify-between text-[9px] font-black">
              <span className="text-slate-500 uppercase tracking-widest">Quote items</span>
              <span className="text-emerald-600">{cat.items}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormMock() {
  const fields = [
    { label: 'Service address',     on: true  },
    { label: 'Preferred date',      on: true  },
    { label: 'Photo / video upload',on: true  },
    { label: 'Preferred time',      on: false },
    { label: 'Sq footage',          on: false },
    { label: 'Insurance claim?',    on: true  },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Step 2 — You control</p>
        <p className="text-[12px] font-black text-slate-900">Custom questions & fields</p>
      </div>
      <div className="divide-y divide-slate-50">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5">
            <p className={`text-[12px] font-semibold ${f.on ? 'text-slate-800' : 'text-slate-400'}`}>{f.label}</p>
            <div className="w-8 h-4.5 rounded-full flex items-center px-0.5 transition-all" style={{ background: f.on ? '#4f46e5' : '#e2e8f0', justifyContent: f.on ? 'flex-end' : 'flex-start', height: 18, width: 32 }}>
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" style={{ width: 14, height: 14 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+ Add custom question</p>
      </div>
    </div>
  );
}

function EmailsMock() {
  return (
    <div className="flex flex-col gap-3">
      {/* Template picker */}
      <div className="flex gap-2">
        {['Quote', 'Schedule', 'Reminder'].map((t, i) => (
          <div key={i} className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${i === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>
            {t}
          </div>
        ))}
      </div>

      {/* Email preview */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #667eea, #1c0866)' }}>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Ridge Line Roofing</p>
          <p className="text-[13px] font-black text-white">Appointment Confirmed</p>
        </div>
        <div className="px-4 py-3 text-[11px] text-slate-600 leading-relaxed space-y-1">
          <p>Hi <span className="font-black text-indigo-600">{'{{customer_name}}'}</span>,</p>
          <p>Your appointment is confirmed for <span className="font-black text-slate-900">{'{{scheduled_date}}'}</span> at <span className="font-black text-slate-900">{'{{scheduled_time}}'}</span>.</p>
          <p className="text-slate-400 text-[10px]">— Ridge Line Roofing</p>
        </div>
        <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Powered by Lead2Project</span>
          <span className="text-[9px] font-black text-indigo-500">Preview →</span>
        </div>
      </div>

      {/* Variable chips */}
      <div className="flex flex-wrap gap-1.5">
        {['{{customer_name}}', '{{scheduled_date}}', '{{company_name}}', '{{quote_total}}'].map((v, i) => (
          <span key={i} className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg border border-slate-200">{v}</span>
        ))}
      </div>
    </div>
  );
}

function TeamMock() {
  const members = [
    { name: 'James Carter',  role: 'Admin',  leads: 12, avatar: 'JC', color: '#6366f1' },
    { name: 'Mike Torres',   role: 'Field',  leads: 8,  avatar: 'MT', color: '#10b981' },
    { name: 'Dave Reynolds', role: 'Field',  leads: 5,  avatar: 'DR', color: '#f59e0b' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-[12px] font-black text-slate-900">Team Members</p>
        <div className="flex items-center gap-1 bg-sky-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full">
          <Plus size={9} /> Invite
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0" style={{ background: m.color }}>
              {m.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-black text-slate-900">{m.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.role}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-black text-slate-700">{m.leads}</p>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest">leads</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign leads to any team member from the board</p>
      </div>
    </div>
  );
}

function BillingMock() {
  return (
    <div className="flex flex-col gap-3">
      {/* Current plan */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[12px] font-black text-slate-900">Current Plan</p>
          <span className="text-[9px] font-black px-2.5 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#667eea,#1c0866)' }}>PRO</span>
        </div>
        <div className="px-4 py-4">
          <p className="text-3xl font-black text-slate-900 mb-0.5">$49<span className="text-[14px] font-bold text-slate-400">/mo</span></p>
          <p className="text-[11px] text-slate-500 mb-4">Billed monthly · Cancel anytime</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Leads / month', val: 'Unlimited' },
              { label: 'Team members',  val: 'Up to 10'  },
              { label: 'Email outbox',  val: 'Included'  },
              { label: 'Daily digest',  val: 'Included'  },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Check size={10} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-600 font-medium">{f.label}: <span className="font-black text-slate-900">{f.val}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Next billing */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Next billing date</p>
          <p className="text-[12px] font-black text-slate-900">May 7, 2026</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Amount</p>
          <p className="text-[12px] font-black text-emerald-600">$49.00</p>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const TABS = [
  {
    icon: <SlidersHorizontal size={16} />,
    label: 'Pipeline',
    title: 'Your pipeline, your stages',
    desc: 'Add, remove, and rename pipeline stages to match exactly how your business tracks a job from first contact to final payment.',
    color: '#f59e0b',
    bg: '#fef3c7',
    mock: <PipelineMock />,
  },
  {
    icon: <LayoutGrid size={16} />,
    label: 'Categories',
    title: 'Categories with built-in templates',
    desc: 'Each service category auto-loads its own task checklist and quote line items. Set it once — every new job of that type is already prepped.',
    color: '#8b5cf6',
    bg: '#ede9fe',
    mock: <CategoriesMock />,
  },
  {
    icon: <FileText size={16} />,
    label: 'Intake Form',
    title: 'Control what customers fill out',
    desc: 'Toggle fields on or off, add custom questions, and control exactly what information you collect before a lead hits your board.',
    color: '#f97316',
    bg: '#ffedd5',
    mock: <FormMock />,
  },
  {
    icon: <Mail size={16} />,
    label: 'Emails',
    title: 'Branded emails, your words',
    desc: 'Write your own quote, schedule, and payment reminder templates. Use dynamic variables so every email feels personal — sent in one click.',
    color: '#3b82f6',
    bg: '#dbeafe',
    mock: <EmailsMock />,
  },
  {
    icon: <Users size={16} />,
    label: 'Team',
    title: 'Invite crew, assign leads',
    desc: 'Add team members with different roles. Assign leads and jobs to specific crew members directly from the dashboard.',
    color: '#0ea5e9',
    bg: '#e0f2fe',
    mock: <TeamMock />,
  },
  {
    icon: <CreditCard size={16} />,
    label: 'Billing',
    title: 'Simple, transparent pricing',
    desc: 'Manage your plan, see your next billing date, and track usage. No hidden fees, cancel anytime.',
    color: '#10b981',
    bg: '#d1fae5',
    mock: <BillingMock />,
  },
];

export default function SettingsShowcase() {
  const { ref, visible } = useFadeIn();
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section className="py-20 px-4 sm:px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={ref} className="text-center mb-12"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#1a6645' }}>
            Built around your business
          </p>
          <h2 className="font-black tracking-tight mb-4 text-slate-900" style={{ fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.05 }}>
            Set it up once.<br />
            <span style={{ color: '#1a6645' }}>It works every time.</span>
          </h2>
          <p className="text-base font-medium text-slate-500 max-w-lg mx-auto leading-relaxed">
            Your pipeline, categories, booking form, and emails — all configured to match how your business actually runs.
          </p>
        </div>

        {/* Full settings preview — overview visual */}
        <div className="mb-12 rounded-2xl overflow-hidden border shadow-lg max-w-2xl mx-auto" style={{ borderColor: '#E5E0D8' }}>
          <SettingsPreviewInline />
        </div>

        {/* Drill-in label */}
        <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-5">
          Explore each setting →
        </p>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-black border transition-all"
              style={active === i ? {
                background: t.bg, color: t.color, borderColor: t.color + '60',
              } : {
                background: '#fff', color: '#6b7280', borderColor: '#D1C9BD',
              }}>
              <span style={active === i ? { color: t.color } : { color: '#9ca3af' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content — 2 col on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — copy */}
          <div className="flex flex-col justify-center">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: tab.bg }}>
              <span style={{ color: tab.color }}>{tab.icon}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{tab.title}</h3>
            <p className="text-base font-medium text-slate-500 leading-relaxed mb-8">{tab.desc}</p>

            {/* CTA */}
            <div className="p-5 rounded-2xl border" style={{ background: '#fff', borderColor: '#D9D2C8' }}>
              <p className="font-black text-sm text-slate-900 mb-0.5">Ready to configure yours?</p>
              <p className="text-[13px] font-medium text-slate-500 mb-4">Free to start. No credit card needed.</p>
              <Link href="/signup"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90"
                style={{ background: '#1a6645' }}>
                Get Started Free <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right — mock */}
          <div
            key={active}
            style={{
              animation: 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            {tab.mock}
          </div>

        </div>
      </div>
    </section>
  );
}