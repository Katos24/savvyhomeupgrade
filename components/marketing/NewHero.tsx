'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X, 
  Send, 
  UserPlus, 
  ChevronDown,
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';

import CardsView from '@/components/dashboard/views/CardsView';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { TRADE_EXAMPLES, type TradeExample } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'green' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'blue' },
];

// ==========================================
// Modernized, Ultra-Clean Form Preview (Dynamic Lead Data)
// ==========================================
function LocalTradeFormCard({
  example,
  compact = false,
}: {
  example: TradeExample;
  compact?: boolean;
}) {
  const questions = compact ? example.questions.slice(0, 1) : example.questions;
  
  // Safely extract lead details with flexible type checks to prevent TypeScript compiler complaints
  const primaryLead = example.leads?.[0] as any; 
  const customerName = primaryLead?.name || "John Smith";
  const customerPhone = primaryLead?.phone || "(555) 0142";
  
  // Safely check common keys for address fields (address, location, streetAddress)
  const customerAddress = 
    primaryLead?.address || 
    primaryLead?.location || 
    primaryLead?.streetAddress || 
    "123 Main St, Anytown NY";

  return (
    <div className="w-full max-w-[370px] relative">
      {/* Dynamic color glow behind the form */}
      <motion.div
        animate={{ backgroundColor: example.color }}
        transition={{ duration: 0.8 }}
        className="absolute -inset-6 opacity-[0.12] blur-[50px] rounded-[32px] pointer-events-none"
      />

      {/* Sharp slate-950 border with a deep premium shadow */}
      <div className="relative bg-white rounded-2xl border-2 border-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.1)] overflow-hidden w-full text-left">
        
        {/* Brand Banner Header */}
        <div className="relative h-14 px-4 flex items-center gap-3 border-b border-slate-100">
          <motion.div
            className="absolute inset-0 opacity-[0.03] z-0"
            animate={{ backgroundColor: example.color }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative z-10 w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
            <img src={example.logo} className="w-5 h-5 object-contain" alt="" />
          </div>
          <div className="relative z-10 min-w-0">
            <h4 className="text-slate-900 leading-tight font-black text-xs tracking-tight truncate">
              {example.company.name}
            </h4>
            <p className="text-slate-400 uppercase tracking-widest font-black text-[8px] mt-0.5">
              Project Request Form
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: example.color }} />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Form</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4">
          
          {/* Contact Inputs */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              Contact Information
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50/60 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2 truncate">
                <User size={11} className="text-slate-400 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-700 truncate">{customerName}</span>
              </div>
              <div className="bg-slate-50/60 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2 truncate">
                <Phone size={11} className="text-slate-400 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-700 truncate">{customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              Service Address
            </label>
            <div className="bg-slate-50/60 border border-slate-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
              <MapPin size={11} className="text-slate-400 shrink-0" />
              <span className="text-[10px] font-semibold text-slate-700 truncate">{customerAddress}</span>
            </div>
          </div>

          {/* Dynamic Builder Questions */}
          <div className="space-y-3.5 min-h-[105px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={example.trade}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                {questions.map((q, qi) => (
                  <div key={qi} className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                      {q.label}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((option, oi) => {
                        const isActive = oi === q.selected;
                        return (
                          <motion.div
                            key={option}
                            className={`rounded-lg px-2.5 py-1.5 text-[9px] font-extrabold transition-all duration-200 border cursor-default select-none ${
                              isActive
                                ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                                : 'bg-white text-slate-600 border-slate-150 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              {isActive && (
                                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: example.color }} />
                              )}
                              {option}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Attachment Zone */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
              Photos & Documentation
            </label>
            {example.uploadPreview ? (
              <div className="flex gap-2.5 items-center p-1.5 bg-slate-50/50 border border-slate-100 rounded-lg">
                <img src={example.uploadPreview} className="w-9 h-9 object-cover rounded border border-slate-200/60" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-800 truncate" style={{ fontFamily: font }}>
                    {example.uploadFileName}
                  </p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Ready to Upload</p>
                </div>
              </div>
            ) : (
              <div className="text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/40 py-3 text-slate-400 flex flex-col items-center justify-center">
                <ImageIcon size={13} className="mb-1 text-slate-400" />
                <span className="text-[9px] font-bold">Drop site photos here</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            animate={{ backgroundColor: example.color }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.3 }}
            className="w-full rounded-lg text-white font-black uppercase tracking-wider shadow-sm py-2 text-[10px] cursor-pointer"
          >
            Submit Request
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Hero Export
// ==========================================
export default function ArchitectHero() {
  const [showCreateLeadInfo, setShowCreateLeadInfo] = useState(false);
  const [activeExample, setActiveExample] = useState(0);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);
  const current = TRADE_EXAMPLES[activeExample];

  // Forces CardsView's desktop grid to 2 columns inside this hero panel only.
  useEffect(() => {
    const gridEl = cardsWrapperRef.current?.querySelector<HTMLElement>('[class*="sm:grid"]');
    gridEl?.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
  }, []);

  // Auto-cycles through trades
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 border-b border-slate-200/60 z-10"
    >
      {/* High-end micro dot-mesh visual texture */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 60%, transparent 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Headline section */}
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5 mb-14 lg:mb-20">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
              Built for trade contractors
            </span>
          </div>

          <h1 className="text-slate-900 tracking-tighter leading-[1.02] text-4xl sm:text-5xl md:text-6xl">
            <span className="font-extrabold block bg-gradient-to-r from-slate-950 to-slate-800 bg-clip-text text-transparent">One link.</span>
            <span className="font-black text-slate-900 block mt-1">
              Every lead, tracked <span className="text-slate-900 underline decoration-slate-300 decoration-wavy underline-offset-4">to paid.</span>
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg font-medium leading-relaxed text-slate-500">
            Customers complete your beautifully custom-branded interactive form. The job lands instantly on your dark-dashboard board to schedule, quote, and map.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-lg shadow-slate-950/10 transition-colors cursor-pointer"
              >
                Get Started Free
                <ArrowRight size={16} strokeWidth={3} />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Split Screen Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* LEFT CONTAINER - Frameless & open with creative industry matrix */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center w-full">
            
            {/* Highly Styled Industry Matrix */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2 max-w-[390px] mb-8 w-full">
              {TRADE_EXAMPLES.map((example, i) => {
                const isActive = activeExample === i;
                return (
                  <button
                    key={example.trade}
                    onClick={() => setActiveExample(i)}
                    className={`relative px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
                      isActive
                        ? 'bg-slate-950 border-slate-950 text-white shadow-md shadow-slate-950/10'
                        : 'bg-white border-slate-200/60 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <span 
                      className={`w-2 h-2 rounded-full transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-70'}`} 
                      style={{ backgroundColor: example.color }}
                    />
                    <span>{example.trade}</span>
                    
                    {isActive && (
                      <motion.span 
                        layoutId="activeIndicator"
                        className="absolute -top-1 -right-1 flex h-2 w-2"
                      >
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Card displaying the same customer details as the dashboard */}
            <LocalTradeFormCard example={current} />
          </div>

          {/* RIGHT CONTAINER - Sleek Dark Admin Dashboard */}
          <div className="relative h-[610px] lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_40px_80px_rgba(15,23,42,0.12)] bg-[#0A0C14] flex flex-col w-full">
            <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.trade}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col flex-1 min-h-0"
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

        {/* Scroll signal indicator */}
        <motion.div
          className="flex flex-col items-center gap-1.5 mt-16 lg:mt-24"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            See what it&apos;s capable of
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>

      </div>

      {/* Info Backdrop Overlay */}
      <AnimatePresence>
        {showCreateLeadInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateLeadInfo(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6"
              style={{ fontFamily: font }}
            >
              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>

              <h3 className="text-lg font-black tracking-tight text-slate-900 mb-1">
                Two ways leads land here
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-5">
                Every job on your board gets there one of two ways.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Send size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Customer scans &amp; submits</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                      QR code on your truck, sign, or card opens your form. Photos and all, it lands on your board automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <UserPlus size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">You add one manually</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                      Phone call, walk-in, referral. Enter it yourself in a few taps and it shows up the same way.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="w-full mt-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}