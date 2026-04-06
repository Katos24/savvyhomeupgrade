// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS SHOWCASE
// Left:  SettingsPreviewInline — full height, no scroll, always visible
// Right: 4 pill tabs — clicking shows ONLY the mock, no text below
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PREVIEW INLINE — full height, no scroll, paste above SettingsShowcase
// ─────────────────────────────────────────────────────────────────────────────

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Workflow, Grid, FileText, Mail, Users, CreditCard, Settings, Globe, Copy, Phone, QrCode, ExternalLink, SlidersHorizontal, Plus, ChevronDown, LayoutGrid, Check, ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const SHOWCASE_CONFIG_ITEMS = [
  { icon: <Workflow className="w-5 h-5" />,   label: 'Pipeline',     desc: 'Customize your lead stages.', color: '#f59e0b', bg: '#fef3c7' },
  { icon: <Grid className="w-5 h-5" />,        label: 'Categories',   desc: 'Each gets its own checklist and pricing template.', color: '#8b5cf6', bg: '#ede9fe' },
  { icon: <FileText className="w-5 h-5" />,   label: 'Booking Form', desc: 'Control what customers fill out.', color: '#f97316', bg: '#ffedd5' },
  { icon: <Mail className="w-5 h-5" />,        label: 'Automations',  desc: 'Branded emails for every touchpoint.', color: '#3b82f6', bg: '#dbeafe' },
  { icon: <Users className="w-5 h-5" />,       label: 'Team',         desc: 'Invite crew and assign leads.', color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: <CreditCard className="w-5 h-5" />,  label: 'Billing',      desc: 'Manage your plan.', color: '#10b981', bg: '#d1fae5' },
];

function ShowcaseLogoInline({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0f172a"/>
      <polygon points="20,7 33,17 33,34 7,34 7,17" fill="#6366f1"/>
      <polygon points="20,5 34,16 6,16" fill="#818cf8"/>
      <rect x="25" y="9" width="4" height="8" rx="1" fill="#818cf8"/>
      <rect x="15" y="23" width="10" height="11" rx="1.5" fill="#1e1b4b"/>
      <rect x="7" y="21" width="7" height="7" rx="1" fill="#1e1b4b"/>
      <line x1="10.5" y1="21" x2="10.5" y2="28" stroke="#6366f1" strokeWidth="1"/>
      <line x1="7" y1="24.5" x2="14" y2="24.5" stroke="#6366f1" strokeWidth="1"/>
    </svg>
  );
}

function SettingsPreviewInline() {
  return (
    <div style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '122%' }}>
    <div className="bg-[#0f172a] rounded-[2rem] w-full shadow-2xl overflow-hidden border border-white/10">

      {/* Nav */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">LEAD2PROJECT</span>
        <span className="text-xs text-white/30 font-medium">Settings</span>
      </div>

      {/* Company card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden">
        <div className="h-10 w-full" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }} />
        <div className="px-5 py-4">

          {/* Logo + edit */}
          <div className="flex items-start justify-between mb-4 -mt-8">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-white shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
                <ShowcaseLogoInline size={40} />
              </div>
              <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Logo</p>
            </div>
            <button className="mt-8 flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl">
              <Settings className="w-3 h-3" /> EDIT
            </button>
          </div>

          <p className="text-base font-black text-gray-900 mb-1">Torres Roofing & Construction</p>
          <span className="inline-block text-[10px] font-black px-3 py-1 rounded-full text-white mb-4" style={{ background: 'linear-gradient(to right, #667eea, #1c0866)' }}>
            PRO PLAN
          </span>

          {/* Booking link */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Your Booking Link</p>
                <p className="text-xs font-bold text-gray-700">lead2project.com/<span className="text-indigo-600">torres</span></p>
              </div>
            </div>
            <button className="flex items-center gap-1 text-[10px] font-black text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg">
              <Copy className="w-3 h-3" /> COPY
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Support Email</p>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">torres@email.com</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Business Phone</p>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">(718) 555-0100</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Company Website</p>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-700 font-medium">torresroofing.com</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand Colors</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#667eea' }} />
                <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: '#1c0866' }} />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl">
              <QrCode className="w-4 h-4 text-gray-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">QR Code</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 border border-gray-200 rounded-xl">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">View Form</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 py-3 border border-indigo-200 bg-indigo-50 rounded-xl">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Digest On</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="px-4 pt-5 pb-6">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">System Configuration</p>
        <div className="grid grid-cols-2 gap-3">
          {SHOWCASE_CONFIG_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bg }}>
                <span style={{ color: item.color }}>{item.icon}</span>
              </div>
              <p className="text-sm font-black text-gray-900">{item.label}</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
    </div>
  );
}

function PipelineTabMock() {
  const stages = [
    { label: 'New',         color: '#3b82f6', locked: true  },
    { label: 'Contacted',   color: '#eab308', locked: false },
    { label: 'Quoted',      color: '#8b5cf6', locked: false },
    { label: 'In Progress', color: '#f97316', locked: false },
    { label: 'Completed',   color: '#10b981', locked: true  },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SlidersHorizontal size={14} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 900, color: '#111827', margin: 0 }}>Pipeline stages</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>5 stages configured</p>
          </div>
        </div>
        <div style={{ background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 800, padding: '6px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Plus size={10} /> Add stage
        </div>
      </div>
      <div>
        {stages.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: i < stages.length - 1 ? '1px solid #f9fafb' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: stage.color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 800, color: stage.locked ? '#9ca3af' : '#111827', margin: 0 }}>{stage.label}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {stage.locked ? '🔒 System required' : 'Custom stage'}
                </p>
              </div>
            </div>
            {!stage.locked && <ChevronDown size={13} style={{ color: '#d1d5db' }} />}
          </div>
        ))}
      </div>
      <div style={{ background: '#111827', padding: '12px 16px', textAlign: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Save Pipeline</span>
      </div>
    </div>
  );
}

function CategoriesTabMock() {
  const cats = [
    { label: 'Other',                 tasks: 2, items: 2  },
    { label: 'Full Roof Replacement',  tasks: 1, items: 11 },
    { label: 'Roof Repair',            tasks: 2, items: 2  },
    { label: 'Emergency Service',      tasks: 1, items: 3  },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: '#111827', margin: '0 0 2px' }}>Service Categories</p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 12px' }}>Auto-load tasks and pricing when a category is selected.</p>
        <div style={{ background: '#16a34a', color: '#fff', fontSize: 10, fontWeight: 800, padding: '7px 14px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Plus size={10} /> Add Category
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {cats.map((cat, i) => (
          <div key={i} style={{ background: '#0f172a', borderRadius: 12, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutGrid size={14} style={{ color: '#6366f1' }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', margin: 0 }}>{cat.label}</p>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 800, background: '#1e3a5f', color: '#60a5fa', padding: '2px 7px', borderRadius: 6 }}>✓ {cat.tasks} TASKS</span>
              <span style={{ fontSize: 9, fontWeight: 800, background: '#14532d', color: '#4ade80', padding: '2px 7px', borderRadius: 6 }}>$ {cat.items} ITEMS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              <div style={{ background: '#1e293b', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: '#475569' }}>+ TASKS</div>
              <div style={{ background: '#1e293b', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 8, fontWeight: 800, color: '#475569' }}>+ PRICING</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormTabMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 10 }}>
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #dc2626)', padding: '14px 12px 12px' }}>
          <p style={{ fontSize: 11, fontWeight: 900, color: '#fff', margin: 0 }}>Request received!</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0' }}>A few more details.</p>
        </div>
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Address...', 'Zip code', 'Preferred date'].map((ph, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: 9, color: '#cbd5e1' }}>{ph}</div>
          ))}
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #dc2626)', borderRadius: 6, padding: '7px', textAlign: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>Submit request</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 9 }}>🔒</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>Step 1 — always collected</span>
          </div>
          <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>Name · Email · Phone · Category</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0f172a' }}>Step 2</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: '#4f46e5', background: '#eef2ff', padding: '2px 6px', borderRadius: 4 }}>YOU CONTROL</span>
          </div>
          {[
            { label: 'Service address', on: true },
            { label: 'Preferred date', on: true },
            { label: 'Photo / video upload', on: true },
            { label: 'Preferred time', on: false },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: row.on ? '#0f172a' : '#94a3b8' }}>{row.label}</span>
              <div style={{ width: 26, height: 14, borderRadius: 7, background: row.on ? '#4f46e5' : '#cbd5e1', display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: row.on ? 'flex-end' : 'flex-start' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmailsTabMock() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div style={{ background: '#1e293b', borderRadius: 12, padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['Quote', 'Schedule', 'Payment'].map((tab, i) => (
            <div key={i} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: i === 1 ? '#0f172a' : 'transparent', color: i === 1 ? '#f1f5f9' : '#475569', border: i === 1 ? '1px solid #334155' : '1px solid transparent' }}>{tab}</div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {['{{company_name}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}'].map((v, i) => (
            <span key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '2px 5px', fontSize: 7, fontWeight: 600, color: '#94a3b8', fontFamily: 'monospace' }}>{v}</span>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 7, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Subject</p>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '4px 7px', fontSize: 8, color: '#cbd5e1' }}>Appointment Scheduled - {'{{company_name}}'}</div>
        </div>
        <div>
          <p style={{ fontSize: 7, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Body</p>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 5, padding: '5px 7px', fontSize: 7, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 1.6 }}>
            Hi {'{{customer_name}}'},<br />Your appointment is confirmed!<br /><br />Date: {'{{scheduled_date}}'}<br />Time: {'{{scheduled_time}}'}
          </div>
        </div>
        <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 7, padding: '6px', textAlign: 'center', fontSize: 9, fontWeight: 800, color: '#f1f5f9' }}>
          Save Templates
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea, #1c0866)', padding: '12px', textAlign: 'center' }}>
          <div style={{ width: 26, height: 26, background: '#fff', borderRadius: 5, margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <ShowcaseLogoInline size={20} />
          </div>
          <p style={{ fontSize: 9, fontWeight: 900, color: '#fff', margin: 0 }}>Torres Roofing</p>
        </div>
        <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: '#111827', margin: 0 }}>Appointment Scheduled</p>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 6, fontSize: 8, color: '#374151', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 2px' }}>Hi John Smith,</p>
            <p style={{ margin: '0 0 2px' }}>Your appointment is confirmed!</p>
            <p style={{ margin: 0, color: '#94a3b8' }}>Date: Apr 12, 2026<br />Time: 9:00 AM</p>
          </div>
          <p style={{ fontSize: 7, color: '#d1d5db', textAlign: 'center', margin: '4px 0 0' }}>Powered by Lead2Project</p>
        </div>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

function SettingsShowcase() {
  const { ref, visible } = useFadeIn();
const [activeTab, setActiveTab] = useState<number | null>(0);

  const tabs = [
    { label: 'Pipeline',    title: 'Pipeline stages',             mock: <PipelineTabMock />    },
    { label: 'Categories',  title: 'Service categories',          mock: <CategoriesTabMock />  },
    { label: 'Intake Form', title: 'Booking form settings',       mock: <FormTabMock />        },
    { label: 'Emails',      title: 'Email template editor',       mock: <EmailsTabMock />      },
  ];

  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div
          ref={ref}
          className="text-center mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Settings that actually matter
          </p>
          <h2 className="font-black tracking-tight mb-4" style={{ fontSize: 'clamp(32px, 5vw, 58px)', color: '#0F1F3D', lineHeight: 1.05 }}>
            Set it up once.<br />
            <span style={{ color: '#1a6645' }}>It works every time.</span>
          </h2>
          <p className="text-lg font-medium max-w-xl mx-auto leading-relaxed" style={{ color: '#4A5568' }}>
            Your booking form, emails, and pipeline configured exactly how your business works.
          </p>
        </div>

        {/* Split layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s' }}
        >

          {/* LEFT — full settings preview, no scroll, sticky */}
          <div className="lg:sticky lg:top-8">
            <SettingsPreviewInline />
          </div>

          {/* RIGHT — pills + modal below */}
          <div className="flex flex-col gap-4">

            {/* Instruction text */}
            <p className="text-sm font-bold" style={{ color: '#9CA3AF' }}>
              Tap a setting to see how it works →
            </p>

            {/* Pill tabs */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(activeTab === i ? null : i)}
                  className="px-5 py-2.5 rounded-full text-[12px] font-black border transition-all duration-200"
                  style={activeTab === i ? {
                    background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D',
                  } : {
                    background: 'white', color: '#4A5568', borderColor: '#D1C9BD',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mock — only shows when a pill is active, no text below */}
            {activeTab !== null && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: '#fff', borderColor: '#E5E0D8', boxShadow: '0 4px 20px rgba(15,31,61,0.07)' }}
              >
                {/* Just the title, nothing else */}
                <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: '#1a6645' }}>
                  {tabs[activeTab].title}
                </p>
                {tabs[activeTab].mock}
              </div>
            )}

            {/* CTA */}
            <div className="p-6 rounded-2xl border mt-2" style={{ background: '#fff', borderColor: '#D9D2C8' }}>
              <p className="font-black text-sm mb-1" style={{ color: '#0F1F3D' }}>Ready to set it up?</p>
              <p className="text-sm font-medium mb-4" style={{ color: '#6B7280' }}>Takes 5 minutes. Free 14-day trial, no credit card needed.</p>
              <Link
                href="/signup"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#1a6645' }}
              >
                Get Started Free <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsShowcase;