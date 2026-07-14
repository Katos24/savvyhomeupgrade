'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X, 
  Send, 
  UserPlus, 
  User, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  Activity,
  Clock,
  Wrench,
  ShieldCheck,
  FileText
} from 'lucide-react';
import Link from 'next/link';

import CardsView from '@/components/dashboard/views/CardsView';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { TRADE_EXAMPLES, type TradeExample } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'green' },
  { value: 'contacted', label: 'Dispatched', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Job Completed', color: 'blue' },
];

// ==========================================
// Trade-Focused Tactical Intake Ticket (Mobile-Optimized)
// ==========================================
function TradeJobIntakeCard({
  example,
  compact = false,
}: {
  example: TradeExample;
  compact?: boolean;
}) {
  const questions = compact ? example.questions.slice(0, 1) : example.questions;
  
  const primaryLead = example.leads?.[0] as any; 
  const customerName = primaryLead?.name || "Dave Miller";
  const customerPhone = primaryLead?.phone || "(516) 555-0192";
  const customerAddress = 
    primaryLead?.address || 
    primaryLead?.location || 
    primaryLead?.streetAddress || 
    "42 Oak Rd, Huntington NY";

  return (
    <div className="w-full relative group">
      <div 
        className="absolute -inset-1 rounded-2xl opacity-10 blur-md transition-all duration-700"
        style={{ backgroundColor: example.color }}
      />

      <div className="relative bg-white rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] sm:shadow-[6px_6px_0px_0px_#0f172a] overflow-hidden w-full text-left">
   {/* Job Card Header */}
<div className="px-3 py-2.5 flex items-center justify-between border-b-2 border-slate-900 bg-slate-50">
  <div className="flex items-center gap-2 min-w-0">
    {/* Restored: White background border frame for the original colorful logo */}
    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 p-1 shadow-sm">
      <img 
        src={example.logo} 
        className="w-full h-full object-contain" 
        alt={example.company.name} 
      />
    </div>
    <div className="min-w-0">
      <h4 className="text-slate-900 leading-tight font-black text-xs tracking-tight truncate">
        {example.company.name}
      </h4>
      <p className="text-slate-500 uppercase tracking-wider font-extrabold text-[8px] mt-0.5">
        Work Request Form
      </p>
    </div>
  </div>
  
  <div className="flex items-center gap-1 bg-white border border-slate-950 px-2 py-0.5 rounded-full shrink-0">
    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: example.color }} />
    <span className="text-[8px] font-black text-slate-900 uppercase tracking-wider">Online</span>
  </div>
</div>

        {/* Job Card Fields */}
        <div className="p-3.5 space-y-3">
          {/* Contact Details */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              Customer Details
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 flex items-center gap-1.5 truncate">
                <User size={11} className="text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold text-slate-800 truncate">{customerName}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 flex items-center gap-1.5 truncate">
                <Phone size={11} className="text-slate-500 shrink-0" />
                <span className="text-[10px] font-bold text-slate-800 truncate">{customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Location Field */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              Jobsite Address
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 flex items-center gap-1.5">
              <MapPin size={11} className="text-slate-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-800 truncate">{customerAddress}</span>
            </div>
          </div>

          {/* Specific Trade Questions */}
          <div className="space-y-1.5 min-h-[85px] sm:min-h-[95px]">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              Job Requirements
            </label>
            <AnimatePresence mode="wait">
              <motion.div
                key={example.trade}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                {questions.map((q, qi) => (
                  <div key={qi} className="space-y-1">
                    <p className="text-[10px] font-black text-slate-900">{q.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {q.options.map((option, oi) => {
                        const isActive = oi === q.selected;
                        return (
                          <div
                            key={option}
                            className={`rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-wide transition-all duration-150 border-2 cursor-default select-none ${
                              isActive
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isActive && (
                                <span className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: example.color }} />
                              )}
                              {option}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Job Photos */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
              Jobsite Photos (Optional)
            </label>
            {example.uploadPreview ? (
              <div className="flex gap-2 items-center p-1.5 bg-slate-50 border border-slate-205 rounded">
                <img src={example.uploadPreview} className="w-8 h-8 object-cover rounded border border-slate-300" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-800 truncate">{example.uploadFileName}</p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                    ✓ Attached successfully
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center border border-dashed border-slate-300 rounded bg-slate-50 py-2.5 text-slate-400 flex flex-col items-center justify-center">
                <ImageIcon size={14} className="mb-0.5 text-slate-400" />
                <span className="text-[9px] font-bold">Tap to upload photos</span>
              </div>
            )}
          </div>

          {/* Dispatch Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full text-white font-black uppercase tracking-wider py-2.5 rounded-lg text-[9px] border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] cursor-pointer"
            style={{ backgroundColor: example.color }}
          >
            Submit Service Request
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Trade-Optimized Architect Hero
// ==========================================
export default function ArchitectHero() {
  const [showCreateLeadInfo, setShowCreateLeadInfo] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const current = TRADE_EXAMPLES[activeExample];

  // Forces CardsView desktop columns
  useEffect(() => {
    const gridEl = cardsWrapperRef.current?.querySelector<HTMLElement>('[class*="sm:grid"]');
    gridEl?.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
  }, [activeExample]);

  // Auto cycle trades
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-[#fcfcfc] pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 border-b-2 border-slate-200 z-10"
    >
      {/* Blueprint grid subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Responsive main layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* LEFT COLUMN: Contractor Copy & Real-time Booking Form */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8">
            
            {/* Header copy configured for trades */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-900 bg-white px-3 py-1 shadow-[2px_2px_0px_0px_#0f172a]">
                <Wrench className="w-3.5 h-3.5 text-slate-900" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-950">
                  Built for Contractors & Local Trades
                </span>
              </div>

              <h1 className="tracking-tighter leading-[1.0] text-slate-950 text-4xl sm:text-5xl lg:text-[52px] font-black">
                Simple dispatch.<br />
                No missed calls.
              </h1>

              <p className="max-w-md text-slate-600 font-bold text-sm leading-relaxed">
                Send customers your clean, custom job link. Leads, site conditions, and field photos land right onto your dispatch board to quote and schedule.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-1.5 bg-slate-950 text-white px-5 py-3 rounded-xl font-black uppercase tracking-wider text-xs border-2 border-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,0.15)] hover:shadow-none transition-all cursor-pointer"
                  >
                    Start Free Intake Board
                    <ArrowRight size={14} strokeWidth={3} />
                  </motion.div>
                </Link>
              </div>
            </div>

            {/* Quick Switcher Filter (Horizontal Scrollable on Mobile) */}
            <div className="space-y-2">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-wider">
                Select Your Trade:
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory max-w-full lg:grid lg:grid-cols-2 lg:gap-1.5 lg:max-w-[370px]">
                {TRADE_EXAMPLES.map((example, i) => {
                  const isActive = activeExample === i;
                  return (
                    <button
                      key={example.trade}
                      onClick={() => setActiveExample(i)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 border-2 shrink-0 snap-center ${
                        isActive
                          ? 'bg-slate-950 border-slate-950 text-white shadow-[1.5px_1.5px_0px_0px_#0f172a]'
                          : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 shadow-sm'
                      }`}
                    >
                      <span>{example.trade}</span>
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: example.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Local Intake Preview Form */}
            <div className="w-full max-w-[380px]">
              <TradeJobIntakeCard example={current} />
            </div>

       

          </div>

          {/* RIGHT COLUMN: The Dispatch Board (Modern, high-visibility layout for busy workspaces) */}
          <div className="relative lg:col-span-7 rounded-2xl overflow-hidden border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] lg:shadow-[8px_8px_0px_0px_#0f172a] bg-slate-950 flex flex-col w-full min-h-[540px] sm:min-h-[580px] lg:min-h-[660px]">
            
            {/* Field Dashboard Nav bar */}
            <div className="px-4 py-3 bg-slate-900 border-b-2 border-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">
                  Live Dispatch Control
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5">
                <ShieldCheck size={11} className="text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Sync Connected</span>
              </div>
            </div>

            {/* Kanban Workspace */}
            <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.trade}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col flex-1 min-h-0 space-y-4"
                >
                  <DashboardHeader
                    company={current.company}
                    isDark={true}
                    isRefreshing={false}
                    planTier="pro"
                    onSidebarOpen={() => {}}
                    onCreateLead={() => setShowCreateLeadInfo(true)}
                    onLockedFeature={() => {}}
                    onRefresh={() => {}}
                    accentColor={current.color}
                  />

                  <DashboardStats
                    globalStats={current.stats}
                    allLeads={current.leads}
                    isDark={true}
                  />

                  <div ref={cardsWrapperRef} className="flex-1 min-h-0 relative z-10">
                    <CardsView
                      leads={current.leads}
                      onSelectLead={() => {}}
                      statusOptions={STATUS_OPTIONS}
                      isDark={true}
                      planTier="pro"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

      {/* Manual Dispatch Info Modal Overlay */}
      <AnimatePresence>
        {showCreateLeadInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setShowCreateLeadInfo(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative w-full max-w-md rounded-xl bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_#000] p-5 text-slate-900"
              style={{ fontFamily: font }}
            >
              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="absolute top-4 right-4 w-6 h-6 rounded bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-750 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>

              <h3 className="text-sm font-black tracking-tight mb-1">
                How leads get assigned:
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Your dispatch board coordinates tasks seamlessly from two sources:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <Send size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">01. Direct Customer Submission</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-relaxed">
                      Clients access your secure link, pick services, snap site photos, and submit. The details populate instantly on your active dispatch board.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded bg-slate-950 text-white flex items-center justify-center shrink-0">
                    <UserPlus size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-black">02. Phone Inquiries / Over the Phone</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-relaxed">
                      For walk-ins, phone calls, or emergencies, open manual intake. Input parameters yourself inside the dashboard in seconds.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="w-full mt-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-slate-950"
              >
                Go back to Dispatch
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}