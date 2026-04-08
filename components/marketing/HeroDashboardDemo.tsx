'use client';

import { useEffect, useState } from 'react';
import { QrCode, ChevronRight, Check, MapPin, Phone, Mail, User, Wifi } from 'lucide-react';

export default function HeroDashboardDemo() {
  const [newLeadVisible, setNewLeadVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNewLeadVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const leads = [
    { name: 'Marcus Thornton', status: 'Contacted', color: '#f59e0b', amount: '$7,950', date: 'Apr 12' },
    { name: 'David Reyes',     status: 'Scheduled', color: '#6366f1', amount: '$2,400', date: 'Apr 15' },
    { name: 'Sarah Kim',       status: 'Won',        color: '#10b981', amount: '$5,200', date: 'Apr 13' },
  ];

  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:mx-0">

      {/* Soft background shape like Calendly */}
      <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full opacity-30 pointer-events-none blur-3xl"
        style={{ background: 'linear-gradient(135deg, #1a6645, #0F1F3D)' }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* ── Card 1: Your branded form URL ── */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>

          {/* Card header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#1a6645]/10 flex items-center justify-center">
                <QrCode size={13} className="text-[#1a6645]" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Form Link</span>
            </div>
            <p className="text-[13px] font-black text-slate-900">Share it everywhere</p>
          </div>

          {/* URL pill */}
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
              <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                <Check size={8} className="text-white" strokeWidth={3} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 truncate flex-1">
                lead2project.com/<span className="text-[#1a6645] font-black">ridge-line</span>
              </p>
            </div>
          </div>

          {/* Mini form preview */}
          <div className="px-4 py-3 space-y-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer sees</p>

            {/* Form header mini */}
            <div className="rounded-xl overflow-hidden">
              <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'linear-gradient(135deg,#f97316,#c2410c)' }}>
                <img src="/images/ridgelinelogo.png" alt="" className="w-4 h-4 object-contain" />
                <span className="text-[9px] font-black text-white">Ridge Line Roofing</span>
              </div>
              <div className="bg-slate-50 px-3 py-2 space-y-1.5 border border-t-0 border-slate-100 rounded-b-xl">
                {[
                  { icon: <User size={9} />, val: 'Curtis Wilson' },
                  { icon: <Phone size={9} />, val: '(555) 482-9301' },
                  { icon: <MapPin size={9} />, val: 'Roofing · Brooklyn NY' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                    <span className="text-slate-400 shrink-0">{f.icon}</span>
                    <span className="text-[9px] font-medium text-slate-700">{f.val}</span>
                  </div>
                ))}
                <div className="w-full py-1.5 rounded-lg text-[9px] font-black text-white text-center"
                  style={{ background: 'linear-gradient(135deg,#f97316,#c2410c)' }}>
                  Submit Request
                </div>
              </div>
            </div>
          </div>

          {/* Placement hints */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-1">
              {['Truck wrap', 'Yard sign', 'Instagram', 'Email'].map(t => (
                <span key={t} className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[#1a6645]/8 text-[#1a6645] border border-[#1a6645]/15">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Card 2: Dashboard with leads ── */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>

          {/* Card header */}
          <div className="px-5 pt-5 pb-4 border-b border-slate-50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white border border-slate-100 flex items-center justify-center">
                  <img src="/images/ridgelinelogo.png" alt="" className="w-4 h-4 object-contain" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dashboard</span>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500">
                <Wifi size={8} /> Live
              </div>
            </div>
            <p className="text-[13px] font-black text-slate-900">Your lead board</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-0 border-b border-slate-50">
            {[{ label: 'Leads', val: '168' }, { label: 'Active', val: '63' }, { label: 'Revenue', val: '$102k' }].map((s, i) => (
              <div key={i} className={`px-3 py-2.5 text-center ${i < 2 ? 'border-r border-slate-50' : ''}`}>
                <p className="text-[14px] font-black text-slate-900">{s.val}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>

          {/* New lead drops in */}
          <div className="px-4 pt-3 pb-1">
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border mb-2 transition-all duration-700"
              style={{
                background: newLeadVisible ? '#f0fdf4' : '#f8fafc',
                borderColor: newLeadVisible ? '#86efac' : '#f1f5f9',
                opacity: newLeadVisible ? 1 : 0,
                transform: newLeadVisible ? 'translateY(0)' : 'translateY(8px)',
                boxShadow: newLeadVisible ? '0 0 0 2px #bbf7d040' : 'none',
              }}
            >
              <div className="w-1 h-8 rounded-full shrink-0 bg-emerald-500" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[12px] font-black text-slate-900">Curtis Wilson</p>
                  <span className="text-[7px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">NEW</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <QrCode size={8} className="text-slate-400" />
                  <span className="text-[8px] text-slate-400 font-medium">via QR scan · just now</span>
                </div>
              </div>
              <ChevronRight size={12} className="text-slate-300 shrink-0" />
            </div>

            {/* Existing leads */}
            {leads.map((lead, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-50 mb-1.5 bg-slate-50/50">
                <div className="w-1 h-6 rounded-full shrink-0" style={{ background: lead.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-800 truncate">{lead.name}</p>
                  <span className="text-[7px] font-black px-1.5 py-0.5 rounded" style={{ background: `${lead.color}15`, color: lead.color }}>{lead.status}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-black text-emerald-600">{lead.amount}</p>
                  <p className="text-[8px] text-slate-400">{lead.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <p className="text-[8px] text-center text-slate-400 font-medium">Schedule · Quote · Collect — one click each</p>
          </div>
        </div>

      </div>
    </div>
  );
}