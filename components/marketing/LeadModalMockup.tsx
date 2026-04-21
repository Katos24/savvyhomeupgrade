'use client';

import {
  CheckCircle2, Circle, Calendar, DollarSign, User,
  Phone, Mail, MapPin, MessageCircle, ChevronDown,
  Camera, Clock, CreditCard, Sparkles, FileText,
  ChevronRight, Image, Lock,
} from 'lucide-react';

export function LeadModalMockup() {
  return (
    <div
      className="w-full rounded-2xl sm:rounded-[2rem] overflow-hidden border border-white/10 bg-white shadow-2xl flex flex-col text-left"
      style={{ maxHeight: '440px' }}
    >

      {/* ── HERO HEADER ── */}
      <div className="shrink-0 relative overflow-hidden" style={{ background: '#1e3a5f' }}>
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="relative z-10 p-4 sm:p-5 pb-0">

          {/* Top row */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-semibold text-white/30">#PRJ-1042</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight tracking-tight mt-0.5">Jason Merritt</h2>
              <p className="text-[10px] text-white/35 mt-0.5">Submitted Apr 18, 2026</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Sparkles size={13} className="text-blue-300/70" />
              </div>
            </div>
          </div>

          {/* Status chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
              style={{ background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Scheduled
              <ChevronDown size={9} />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
              <Calendar size={9} />
              Apr 22 · 9:00 AM
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }}>
              <User size={9} />
              Mike T.
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <CreditCard size={9} />
              $7,950 due
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
            {[
              { label: 'Overview', active: true },
              { label: 'Tasks', active: false },
              { label: 'Quote', active: false },
              { label: 'Schedule', active: false },
              { label: 'AI Brief', active: false, ai: true },
            ].map((tab) => (
              <div
                key={tab.label}
                className="flex items-center gap-1 px-3 py-2.5 text-[10px] font-semibold border-b-2 whitespace-nowrap"
                style={{
                  color: tab.active ? (tab.ai ? '#93c5fd' : 'white') : (tab.ai ? 'rgba(147,197,253,0.4)' : 'rgba(255,255,255,0.3)'),
                  borderBottomColor: tab.active ? '#60a5fa' : 'transparent',
                }}
              >
                {tab.ai && <Sparkles size={9} />}
                {tab.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 overflow-hidden" style={{ background: '#f6f6fa' }}>
        <div className="p-4 sm:p-5 space-y-3">

          {/* Client + Message combined card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3.5 py-2 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-blue-50 flex items-center justify-center">
                  <User size={9} className="text-blue-400" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Client</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-amber-500 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">Repeat</span>
                {[
                  { icon: <Mail size={9} />, color: '#3b82f6' },
                  { icon: <Phone size={9} />, color: '#22c55e' },
                  { icon: <MessageCircle size={9} />, color: '#a855f7' },
                  { icon: <MapPin size={9} />, color: '#ef4444' },
                ].map((btn, i) => (
                  <div key={i} className="w-5 h-5 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center">
                    <span style={{ color: btn.color }}>{btn.icon}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-3.5 py-2 flex items-center gap-4 border-b border-gray-50 text-[10px]">
              <span className="font-semibold text-gray-900">Jason Merritt</span>
              <span className="text-blue-600 font-medium">(555) 482-9301</span>
              <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 rounded-full text-[8px] font-bold text-blue-600">Roofing</span>
            </div>

            {/* Message + photo side by side */}
            <div className="px-3.5 py-2.5 flex gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3">
                  Storm damaged roof, multiple shingles missing after last night. Need estimate for full replacement. Leak through master bedroom ceiling.
                </p>
                <div className="flex items-center gap-2.5 mt-1.5 text-[9px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={9} className="text-emerald-500" />
                    Mon, Apr 21
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={9} className="text-blue-500" />
                    Morning
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                <img src="/images/roof-damage.webp" alt="Roof damage" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

       

          {/* Tasks preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-violet-50 flex items-center justify-center">
                  <FileText size={9} className="text-violet-500" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tasks</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">2/5 done</span>
            </div>
            <div className="p-3.5 space-y-2">
              {[
                { label: 'Call customer to confirm details', done: true },
                { label: 'Send quote for approval', done: true },
                { label: 'Schedule job date', done: false },
                { label: 'Complete the work', done: false },
                { label: 'Collect payment', done: false },
              ].map((task, i) => (
                <div key={i} className={`flex items-center gap-2 ${i >= 4 ? 'opacity-40' : ''}`}>
                  {task.done
                    ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    : <Circle size={14} className="text-gray-300 shrink-0" />
                  }
                  <span className={`text-[11px] font-medium ${task.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote preview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3.5 py-2.5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md bg-amber-50 flex items-center justify-center">
                  <DollarSign size={9} className="text-amber-500" />
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Quote</span>
              </div>
              <span className="text-[8px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Unpaid</span>
            </div>
            <div className="p-3.5 space-y-1.5">
              {[
                { item: 'Tear-off existing shingles', amount: '$2,400' },
                { item: 'Architectural shingles (30 sq)', amount: '$3,600' },
                { item: 'Flashing & underlayment', amount: '$1,200' },
                { item: 'Cleanup & haul away', amount: '$750' },
              ].map((line, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">{line.item}</span>
                  <span className="text-[10px] font-bold text-gray-800">{line.amount}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-gray-100">
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Total</span>
                <span className="text-[13px] font-black text-gray-900">$7,950.00</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="shrink-0 px-4 sm:px-5 py-3 bg-white border-t border-gray-100 flex gap-2">
        <div className="flex-1 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-bold text-gray-500 text-center">
          Close
        </div>
        <div className="flex-[2] py-2 rounded-xl text-[10px] font-bold text-white text-center"
          style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}>
          Send Quote Email
        </div>
      </div>
    </div>
  );
}