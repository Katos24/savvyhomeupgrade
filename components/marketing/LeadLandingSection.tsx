'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Calendar, DollarSign, Send, Mail, Phone, MessageSquare, Clock, ChevronDown, Pencil, Sparkles, X, MoreVertical, User, CheckCircle2 } from 'lucide-react';

const font = "'Nunito', sans-serif";

function CardHeader({ activeTab }: { activeTab: string }) {
  const tabs = ['Overview', 'Schedule', 'Quote', 'Payment', 'Tasks', 'Media', 'Activity', 'Reminders'];
  return (
    <div className="bg-[#0f1a2e] rounded-t-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-[10px] font-bold">#1</span>
          <div className="flex gap-1.5">
            <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center">
              <MoreVertical size={12} className="text-slate-400" />
            </div>
            <div className="w-6 h-6 rounded bg-slate-700/50 flex items-center justify-center">
              <X size={12} className="text-slate-400" />
            </div>
          </div>
        </div>
        <h3 className="text-white text-base font-black tracking-tight" style={{ fontFamily: font }}>Sarah Johnson</h3>
        <p className="text-slate-500 text-[10px]">Submitted May 19, 2026</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span className="text-[9px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">New</span>
          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-600/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Calendar size={8} /> May 21 · 2:00 PM
          </span>
          <span className="text-[9px] font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <User size={8} /> Jack
          </span>
          <span className="text-[9px] font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <DollarSign size={8} /> $1,200.00 due
          </span>
          <span className="text-[9px] font-bold text-blue-300 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={8} /> AI Brief
          </span>
        </div>
      </div>
      <div className="flex gap-0 px-3 mt-1 overflow-x-auto scrollbar-hide border-t border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-3 py-2.5 text-[10px] font-bold whitespace-nowrap transition-colors ${
              tab === activeTab
                ? 'text-white border-b-2 border-blue-400'
                : 'text-slate-500 border-b-2 border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function OverviewMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-2xl overflow-hidden shadow-2xl">
      <CardHeader activeTab="Overview" />
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                <User size={10} className="text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Client Info</span>
            </div>
            <span className="text-[10px] font-bold text-blue-500">Actions</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Name</p>
              <p className="text-xs font-black text-slate-900">James Henderson</p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Email</p>
              <p className="text-xs font-bold text-blue-500 truncate">jhenderson@test</p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-0.5">Phone</p>
              <p className="text-xs font-bold text-blue-500">(213) 123-2313</p>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-1">Category</p>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Leak Repair</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['Mail', Mail, 'text-slate-400', 'Email'], ['Phone', Phone, 'text-emerald-500', 'Call'], ['MessageSquare', MessageSquare, 'text-slate-400', 'Text']].map(([, Icon, color, label]: any) => (
              <button key={label} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 bg-white">
                <Icon size={11} className={color} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <MessageSquare size={8} className="text-emerald-600" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Message</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">The main floor shower is draining incredibly slowly and started backing up this morning.</p>
          </div>
          <div className="bg-white rounded-xl p-3.5 border border-slate-200/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Pencil size={8} className="text-amber-600" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Notes</span>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg py-5 flex flex-col items-center justify-center">
              <Pencil size={14} className="text-slate-300 mb-1" />
              <p className="text-[9px] text-slate-400">Add internal notes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteMockup() {
  const lineItems = [
    { desc: 'Labor - HVAC diagnostic', price: 125, qty: 2, amount: 250 },
    { desc: 'Labor - AC system repair', price: 150, qty: 4, amount: 600 },
    { desc: 'Materials - HVAC components', price: 200, qty: 1, amount: 200 },
    { desc: 'Materials - Refrigerant', price: 150, qty: 1, amount: 150 },
  ];
  return (
    <div className="bg-[#f0f2f5] rounded-2xl overflow-hidden shadow-2xl relative">
      <CardHeader activeTab="Quote" />
      <div className="p-4 blur-[2px] opacity-50">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">Quote Sheet</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-500 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1"><Sparkles size={9} /> AI</span>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_70px_30px_70px] gap-1 px-4 py-3 items-center">
                <span className="text-[10px] text-slate-700 font-bold truncate">{item.desc}</span>
                <span className="text-[10px] text-slate-500 text-right">${item.price}</span>
                <span className="text-[10px] text-slate-900 font-black text-center">{item.qty}</span>
                <span className="text-[10px] text-slate-900 font-bold text-right">${item.amount}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#0f1a2e] px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-black text-white">$1,200.00</span>
            <button className="text-[10px] font-black text-white bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-1"><Send size={9} /> Send Quote</button>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl">
        <div className="bg-white rounded-2xl p-5 w-[80%] max-w-[300px] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
              <Send size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Send Quote?</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quote Email</p>
            </div>
            <X size={14} className="text-slate-400 ml-auto" />
          </div>
          <div className="border border-slate-100 rounded-xl p-3 mb-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-2">Sending To</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-black">S</span>
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Sarah Johnson</p>
                <p className="text-[10px] text-slate-400">sarah.j@email.com — $1,200.00</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <Clock size={11} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">No email sent yet.</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="text-[10px] font-bold text-slate-500 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
            <button className="text-[10px] font-black text-white bg-[#0f1a2e] py-2.5 rounded-xl flex items-center justify-center gap-1"><Send size={9} /> Send It</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduleMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-2xl overflow-hidden shadow-2xl">
      <CardHeader activeTab="Schedule" />
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sparkles size={14} className="text-blue-600" />
              </div>
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">Schedule</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1"><Calendar size={10} /> Calendar</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1"><User size={9} /> Assigned To</p>
              <div className="border border-slate-200 rounded-lg px-3 py-3 flex items-center justify-between bg-white">
                <span className="text-sm font-black text-slate-900">Jack</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1.5">Date</p>
                <div className="border border-slate-200 rounded-lg px-3 py-3 bg-white">
                  <span className="text-sm font-bold text-slate-900">05/21/2026</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500 mb-1.5">Time</p>
                <div className="border border-slate-200 rounded-lg px-3 py-3 bg-white flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-900">2:00</span>
                  <span className="text-sm font-bold text-blue-500 ml-auto">PM</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 text-[10px] font-black text-slate-700 border border-slate-200 py-3 rounded-lg uppercase tracking-wide flex items-center justify-center gap-1"><Send size={10} /> Send Confirmation</button>
              <button className="flex-1 text-[10px] font-black text-white bg-[#0f1a2e] py-3 rounded-lg uppercase tracking-wide">Save Schedule</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-2xl overflow-hidden shadow-2xl">
      <CardHeader activeTab="Payment" />
      <div className="p-4">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <DollarSign size={14} className="text-white" />
              </div>
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">Payment Hub</span>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" /> Paid
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Stripe row — the primary path, front and center */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
              <span className="text-sm font-black tracking-tight" style={{ color: '#635BFF' }}>stripe</span>
              <div className="flex items-center gap-1">
                <span
                  className="flex h-5 w-7 items-center justify-center rounded-[3px] bg-white text-[8px] font-black italic"
                  style={{ color: '#1A1F71' }}
                >
                  VISA
                </span>
                <span className="flex h-5 w-7 items-center justify-center rounded-[3px] bg-black text-[7px] font-bold text-white">
                  Pay
                </span>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5">Amount collected</p>
              <div className="border border-slate-200 rounded-lg px-3 py-3 bg-white flex items-baseline justify-between">
                <span className="text-lg font-black text-slate-900">$1,200.00</span>
                <span className="text-[10px] font-bold text-emerald-600">of $1,200.00</span>
              </div>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 flex items-start gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
                Tracked automatically the moment they pay — no follow-up needed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Paid</p>
                <div className="border border-slate-200 rounded-lg px-3 py-3 bg-white">
                  <span className="text-sm font-bold text-slate-900">05/26/2026</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Method</p>
                <div className="border border-slate-200 rounded-lg px-3 py-3 bg-white">
                  <span className="text-sm font-bold text-slate-900">Card via Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    id: 'overview',
    icon: Eye,
    title: 'Every Detail, Already There',
    mobileLabel: 'Overview',
    accent: '#3b82f6',
    mockup: OverviewMockup,
  },
  {
    id: 'quote',
    icon: FileText,
    title: 'Build and Send Quotes',
    mobileLabel: 'Quote',
    accent: '#10b981',
    mockup: QuoteMockup,
  },
  {
    id: 'schedule',
    icon: Calendar,
    title: 'Lock In the Schedule',
    mobileLabel: 'Schedule',
    accent: '#3b82f6',
    mockup: ScheduleMockup,
  },
 {
    id: 'payment',
    icon: DollarSign,
    title: 'Get Paid Without the Chase',
    mobileLabel: 'Payment',
    accent: '#10b981',
    mockup: PaymentMockup,
  },
];

export default function WorkflowCardSection() {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-cycle only on desktop (lg+), stop on mobile once user taps
  const [userTapped, setUserTapped] = useState(false);

  useEffect(() => {
    if (userTapped) return;
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [userTapped]);

  const currentStep = STEPS[activeTab];
  const MockupComponent = currentStep.mockup;

  return (
    <section id="workflow" className="relative bg-slate-900 py-24 sm:py-28 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section header — always visible */}
        <div className="mb-8 lg:hidden">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3" style={{ fontFamily: font }}>
            Inside the pipeline
          </p>
          <h2 className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight mb-4" style={{ fontFamily: font }}>
            Run the entire job <br />
            <span className="text-emerald-500">from one card.</span>
          </h2>
          <p className="text-white font-bold text-sm sm:text-base leading-relaxed" style={{ fontFamily: font }}>
                Overview. Quote. Schedule. Get paid. Every tab lives on the same card — no jumping between apps.
          </p>
        </div>

        {/* ── MOBILE LAYOUT (hidden on lg+) ── */}
        <div className="lg:hidden">
          {/* 4 badge pills in a row */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveTab(idx);
                    setUserTapped(true);
                  }}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? `${step.accent}18` : 'rgba(255,255,255,0.03)',
                    borderColor: isActive ? `${step.accent}50` : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
                    style={{
                      backgroundColor: isActive ? `${step.accent}25` : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Icon size={15} style={{ color: isActive ? step.accent : '#64748b' }} />
                  </div>
                  <span
                    className="text-[10px] font-black tracking-tight leading-none"
                    style={{ color: isActive ? '#fff' : '#64748b', fontFamily: font }}
                  >
                    {step.mobileLabel}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileDot"
                      className="w-1 h-1 rounded-full"
                      style={{ backgroundColor: step.accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mockup revealed below badges */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <MockupComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
        <div className="hidden lg:grid grid-cols-[38%_62%] gap-8 lg:gap-16 items-start">

          {/* LEFT: headline + accordion */}
          <div>
            <div className="mb-8">
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3" style={{ fontFamily: font }}>
                Inside the pipeline
              </p>
              <h2 className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight mb-4" style={{ fontFamily: font }}>
                Run the entire job <br />
                <span className="text-emerald-500">from one card.</span>
              </h2>
              <p className="text-white font-bold text-sm sm:text-base leading-relaxed" style={{ fontFamily: font }}>
                Overview. Quote. Schedule. Get paid. Every tab lives on the same card — no jumping between apps.
              </p>
            </div>

            <div className="space-y-2">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeTab === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      setActiveTab(idx);
                      setUserTapped(true);
                    }}
                    className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.04] border-white/[0.1]'
                        : 'bg-transparent border-transparent hover:bg-white/[0.02]'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeBorder"
                        className="absolute inset-y-0 left-0 w-1 rounded-full"
                        style={{ backgroundColor: step.accent }}
                      />
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                        style={{
                          backgroundColor: isSelected ? `${step.accent}20` : 'rgba(255,255,255,0.02)',
                          border: isSelected ? `1px solid ${step.accent}40` : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <Icon size={14} style={{ color: isSelected ? step.accent : '#94a3b8' }} />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={`text-sm font-black tracking-tight mb-1 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                          style={{ fontFamily: font }}
                        >
                          {step.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: sticky mockup */}
          <div className="lg:sticky lg:top-24 w-full relative">
            <motion.div
              animate={{ backgroundColor: currentStep.accent }}
              transition={{ duration: 0.8 }}
              className="absolute inset-10 opacity-10 blur-[100px] rounded-full pointer-events-none"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <MockupComponent />
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}