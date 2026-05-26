'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Calendar, DollarSign, Send, Mail, Phone, MessageSquare, Clock, ChevronDown, Pencil, Sparkles, X, MoreVertical, User, CheckCircle2 } from 'lucide-react';

const font = "'Nunito', sans-serif";

/* ------------------------------------------------------------------ */
/*  SHARED: Lead Card Header (dark navy bar at top of every screen)   */
/* ------------------------------------------------------------------ */

function CardHeader({ activeTab }: { activeTab: string }) {
  const tabs = ['Overview', 'Schedule', 'Quote', 'Payment', 'Tasks', 'Media', 'Activity', 'Reminders'];
  
  return (
    <div className="bg-[#0f1a2e] rounded-t-xl overflow-hidden">
      {/* Top info */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-[9px] font-bold">#1</span>
          <div className="flex gap-1.5">
            <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center">
              <MoreVertical size={10} className="text-slate-400" />
            </div>
            <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center">
              <X size={10} className="text-slate-400" />
            </div>
          </div>
        </div>
        <h3 className="text-white text-sm font-black tracking-tight" style={{ fontFamily: font }}>Sarah Johnson</h3>
        <p className="text-slate-500 text-[9px]">Submitted May 19, 2026</p>
        
        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[8px] font-black text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">New</span>
          <span className="text-[8px] font-bold text-emerald-300 bg-emerald-600/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Calendar size={7} /> May 21 · 2:00 PM
          </span>
          <span className="text-[8px] font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <User size={7} /> Jack
          </span>
          <span className="text-[8px] font-bold text-slate-300 bg-slate-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <DollarSign size={7} /> $1,200.00 due
          </span>
          <span className="text-[8px] font-bold text-blue-300 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles size={7} /> AI Brief
          </span>
        </div>
      </div>
      
      {/* Tab bar */}
      <div className="flex gap-0 px-2 mt-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-2.5 py-2 text-[9px] font-bold whitespace-nowrap transition-colors ${
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

/* ------------------------------------------------------------------ */
/*  MOCKUP 1: Overview Tab                                            */
/* ------------------------------------------------------------------ */

function OverviewMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <CardHeader activeTab="Overview" />
      <div className="p-3 space-y-3">
        {/* Client Info Card */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <User size={8} className="text-emerald-600" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Client Info</span>
            </div>
            <span className="text-[9px] font-bold text-blue-500">Actions</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider">Name</p>
              <p className="text-[11px] font-black text-slate-900">James Henderson</p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider">Email</p>
              <p className="text-[11px] font-bold text-blue-500 truncate">jhenderson@test</p>
            </div>
            <div>
              <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider">Phone</p>
              <p className="text-[11px] font-bold text-blue-500">(213) 123-2313</p>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-[8px] uppercase text-slate-400 font-bold tracking-wider mb-1">Category</p>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Leak Repair</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600 bg-white hover:bg-slate-50">
              <Mail size={10} className="text-slate-400" /> Email
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600 bg-white hover:bg-slate-50">
              <Phone size={10} className="text-emerald-500" /> Call
            </button>
            <button className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600 bg-white hover:bg-slate-50">
              <MessageSquare size={10} className="text-slate-400" /> Text
            </button>
          </div>
        </div>
        
        {/* Customer Message + Internal Notes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl p-3 border border-slate-200/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <MessageSquare size={8} className="text-emerald-600" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600">Customer&apos;s Message</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              The main floor shower is draining incredibly slowly and started backing up this morning. Seeking a professional snaking service.
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-200/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Pencil size={8} className="text-amber-600" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">Internal Notes</span>
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg py-4 flex flex-col items-center justify-center">
              <Pencil size={12} className="text-slate-300 mb-1" />
              <p className="text-[9px] text-slate-400">Add internal notes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MOCKUP 2: Quote Tab                                               */
/* ------------------------------------------------------------------ */

function QuoteMockup() {
  const lineItems = [
    { desc: 'Labor - HVAC diagnostic and troubleshooting', price: 125, qty: 2, amount: 250 },
    { desc: 'Labor - AC system repair work', price: 150, qty: 4, amount: 600 },
    { desc: 'Materials - Standard HVAC components', price: 200, qty: 1, amount: 200 },
    { desc: 'Materials - Refrigerant and fluids', price: 150, qty: 1, amount: 150 },
  ];

  return (
    <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <CardHeader activeTab="Quote" />
      <div className="p-3">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          {/* Quote header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#0f1a2e] flex items-center justify-center">
                <FileText size={12} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Quote Sheet</p>
                <p className="text-[8px] text-slate-400">Line item breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-blue-500 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Sparkles size={8} /> AI
              </span>
              <Pencil size={12} className="text-slate-400" />
            </div>
          </div>
          
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_60px_30px_60px] gap-1 px-3.5 py-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <span>Line item</span>
            <span className="text-right">Unit price</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Amount</span>
          </div>
          
          {/* Line items */}
          <div className="divide-y divide-slate-50">
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_30px_60px] gap-1 px-3.5 py-2.5 items-center">
                <span className="text-[9px] text-slate-700 font-bold truncate pr-1">{item.desc}</span>
                <span className="text-[9px] text-slate-500 text-right">${item.price.toFixed(2)}</span>
                <span className="text-[9px] text-slate-900 font-black text-center">{item.qty}</span>
                <span className="text-[9px] text-slate-900 font-bold text-right">${item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          {/* Total bar */}
          <div className="bg-[#0f1a2e] px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Total</span>
              <span className="text-sm font-black text-white">$1,200.00</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="text-[9px] font-black text-white bg-slate-700 px-3 py-1.5 rounded-lg uppercase tracking-wide">Edit</button>
              <button className="text-[9px] font-black text-white bg-blue-600 px-3 py-1.5 rounded-lg uppercase tracking-wide flex items-center gap-1">
                <Send size={8} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MOCKUP 3: Schedule Tab                                            */
/* ------------------------------------------------------------------ */

function ScheduleMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <CardHeader activeTab="Schedule" />
      <div className="p-3">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          {/* Schedule header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sparkles size={12} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Schedule</span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1">
              <Calendar size={9} /> Calendar
            </span>
          </div>
          
          <div className="p-3.5 space-y-3">
            {/* Assigned To */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-blue-500 mb-1 flex items-center gap-1">
                <User size={8} /> Assigned To
              </p>
              <div className="border border-slate-200 rounded-lg px-3 py-2.5 flex items-center justify-between bg-white">
                <span className="text-[11px] font-black text-slate-900">Jack</span>
                <ChevronDown size={12} className="text-slate-400" />
              </div>
            </div>
            
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-500 mb-1">Date</p>
                <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
                  <span className="text-[11px] font-bold text-slate-900">05/21/2026</span>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-500 mb-1">Time</p>
                <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-900">2</span>
                  <span className="text-slate-400 text-[11px]">:</span>
                  <span className="text-[11px] font-bold text-slate-900">00</span>
                  <span className="text-[10px] font-bold text-blue-500 ml-auto">PM</span>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button className="flex-1 text-[9px] font-black text-slate-700 border border-slate-200 py-2.5 rounded-lg uppercase tracking-wide flex items-center justify-center gap-1">
                <Send size={9} /> Send Schedule
              </button>
              <button className="flex-1 text-[9px] font-black text-white bg-[#0f1a2e] py-2.5 rounded-lg uppercase tracking-wide">
                Save Schedule
              </button>
            </div>
            
            {/* Job Hours */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                # Job Hours
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MOCKUP 4: Payment Tab                                             */
/* ------------------------------------------------------------------ */

function PaymentMockup() {
  return (
    <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <CardHeader activeTab="Payment" />
      <div className="p-3">
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
          {/* Payment header */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <DollarSign size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Payment Hub</span>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Total Quote</p>
              <p className="text-sm font-black text-slate-900">$1,200.00</p>
            </div>
          </div>
          
          <div className="p-3.5 space-y-3">
            {/* Settled status */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-900">Settled</span>
              </div>
              <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-500 rounded-full" />
              </div>
            </div>
            
            {/* Amount */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Amount</p>
              <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
                <span className="text-[11px] font-black text-slate-900">1,200.00</span>
              </div>
            </div>
            
            {/* Method */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Method</p>
              <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Select...</span>
                <ChevronDown size={12} className="text-slate-400" />
              </div>
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Paid Date</p>
                <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
                  <span className="text-[11px] font-bold text-slate-900">05/26/2026</span>
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Due Date</p>
                <div className="border border-slate-200 rounded-lg px-3 py-2.5 bg-white">
                  <span className="text-[11px] font-bold text-slate-900">05/26/2026</span>
                </div>
              </div>
            </div>
            
            {/* Mark as Paid */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-700">Mark as Paid in Full</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">$1,200.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MOCKUP BONUS: Send Quote Modal (for the quote step visual)        */
/* ------------------------------------------------------------------ */

function SendQuoteModal() {
  return (
    <div className="bg-[#f0f2f5] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative">
      <CardHeader activeTab="Quote" />
      {/* Blurred background */}
      <div className="p-3 blur-[2px] opacity-40">
        <div className="bg-white rounded-xl border border-slate-200/60 p-4 h-32" />
      </div>
      
      {/* Modal overlay */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-4 w-[85%] max-w-[280px] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Send size={14} className="text-emerald-600" />
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
              <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white text-[9px] font-black">S</span>
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-900">Sarah Johnson</p>
                <p className="text-[9px] text-slate-400">sarah.j@email.com</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              <span className="text-[10px] font-bold text-slate-900">$1,200.00</span>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <Clock size={11} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">No email sent yet — first send.</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="text-[10px] font-bold text-slate-500 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
            <button className="text-[10px] font-black text-white bg-[#0f1a2e] py-2.5 rounded-xl flex items-center justify-center gap-1">
              <Send size={9} /> Send It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  STEP DATA                                                         */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    id: 'overview',
    icon: Eye,
    title: 'Every Detail, Already There',
    phase: 'Phase 01: Lead Lands',
    desc: 'Name, phone, email, photos, custom fields — everything the customer submitted shows up on one card. No re-typing.',
    accent: '#3b82f6',
    mockup: OverviewMockup,
  },
  {
    id: 'quote',
    icon: FileText,
    title: 'Build and Send Quotes',
    phase: 'Phase 02: Quote It',
    desc: 'Line-item estimates with your pricing. One tap sends a clean quote email straight to the customer.',
    accent: '#10b981',
    mockup: SendQuoteModal,
  },
  {
    id: 'schedule',
    icon: Calendar,
    title: 'Lock In the Schedule',
    phase: 'Phase 03: Schedule It',
    desc: 'Pick a date, assign a crew member, and fire off a confirmation email — all from the same card.',
    accent: '#3b82f6',
    mockup: ScheduleMockup,
  },
  {
    id: 'payment',
    icon: DollarSign,
    title: 'Track Every Dollar',
    phase: 'Phase 04: Get Paid',
    desc: 'Log payments, track balances, mark jobs as paid. Know exactly who owes what without a spreadsheet.',
    accent: '#10b981',
    mockup: PaymentMockup,
  },
];


/* ------------------------------------------------------------------ */
/*  MAIN SECTION                                                      */
/* ------------------------------------------------------------------ */

export default function WorkflowCardSection() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentStep = STEPS[activeTab];
  const MockupComponent = currentStep.mockup;

  return (
    <section id="workflow" className="relative bg-slate-900 py-24 sm:py-28 lg:py-36 overflow-hidden">
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4" style={{ fontFamily: font }}>
            Inside the pipeline
          </p>
          <h2 className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight" style={{ fontFamily: font }}>
            Run the entire job <br />
            <span className="text-emerald-500">from one card.</span>
          </h2>
          <p className="text-slate-400 font-bold text-base sm:text-lg mt-5 max-w-xl leading-relaxed" style={{ fontFamily: font }}>
            Overview. Quote. Schedule. Payment. Every tab lives on the same lead card — no jumping between apps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Step selector */}
          <div className="space-y-3 order-2 lg:order-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeTab === idx;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveTab(idx)}
                  className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-transparent border-transparent hover:bg-white/[0.01]'
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
                      <span className="text-[8px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">{step.phase}</span>
                      <h3
                        className={`text-sm font-black tracking-tight mb-1 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                        style={{ fontFamily: font }}
                      >
                        {step.title}
                      </h3>
                      <div className={`grid transition-all duration-300 ease-in-out ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                        <p className="overflow-hidden text-xs text-slate-400 font-bold leading-relaxed pr-2">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: CSS Mockup */}
          <div className="order-1 lg:order-2 w-full relative">
            <motion.div
              animate={{ backgroundColor: currentStep.accent }}
              transition={{ duration: 0.8 }}
              className="absolute inset-10 opacity-10 blur-[100px] rounded-full pointer-events-none"
            />

            <div className="relative w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <MockupComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}