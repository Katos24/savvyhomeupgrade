'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, LayoutDashboard, CheckCircle2 } from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import HeroDispatchCards, { DispatchViewSwitcher, type ViewKey } from '@/components/marketing/HeroDispatchCards';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'green' },
  { value: 'contacted', label: 'Dispatched', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Job Completed', color: 'blue' },
];

export default function DashboardShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  const [view, setView] = useState<ViewKey>('cards');
  const [isPaused, setIsPaused] = useState(false);

  const current = TRADE_EXAMPLES[activeExample];

  // Auto-rotate trade examples unless the user interacts
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-32 border-b border-slate-200 text-slate-900"
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient Radial Lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-100/50 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-4 justify-center"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white shadow-md">
              3
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500">
              Form lands, ready to track
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.08] mb-4">
            Every submission lands
            <span className="block pt-1 text-[#0A3A66]"> already organized on your board.</span>
          </h2>

          <p className="text-slate-600 font-bold text-base sm:text-lg max-w-xl mx-auto">
            No endless email threads or lost sticky notes. Watch leads drop directly into your pipeline with complete job details ready for action.
          </p>
        </div>

        {/* Interactive Trade Example Switches */}
        <div 
          className="flex flex-wrap items-center justify-center gap-2 mb-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {TRADE_EXAMPLES.map((item, idx) => {
            const isActive = idx === activeExample;
            return (
              <button
                key={item.trade}
                type="button"
                onClick={() => {
                  setActiveExample(idx);
                  setIsPaused(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                {item.trade}
              </button>
            );
          })}
        </div>

        {/* View Switcher & Mockup Container */}
        <div className="w-full relative">
          
          {/* Glass Backing Panel */}
          <div className="relative p-3 sm:p-6 bg-white/70 border border-slate-200/90 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            
            {/* Top Right Live Badge */}
            <div className="absolute -top-4 right-6 sm:right-8 bg-slate-900 text-teal-300 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
              <Sparkles size={13} className="text-teal-400" />
              <span>Real-Time Dispatch Board</span>
            </div>

            {/* View Switcher Controls */}
            <div className="mb-4 flex justify-center">
              <DispatchViewSwitcher view={view} onChange={setView} isDark={false} />
            </div>

            {/* Laptop Frame Preview */}
            <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900 overflow-hidden shadow-2xl">
              
              {/* Mock Mac Browser Header Bar */}
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-md text-[10px] font-bold text-slate-400">
                  <LayoutDashboard size={12} className="text-teal-400" />
                  <span>app.workrequest.com/dispatch</span>
                </div>
                <div className="w-12" /> {/* Spacer */}
              </div>

              {/* Board Screen Content */}
              <div className="relative flex flex-col w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[520px]">
                <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto flex flex-col space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.trade}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="flex flex-col flex-1 min-h-0 space-y-4"
                    >
                      <DashboardHeader
                        company={current.company}
                        isDark={true}
                        isRefreshing={false}
                        planTier="pro"
                        onSidebarOpen={() => {}}
                        onCreateLead={() => {}}
                        onLockedFeature={() => {}}
                        onRefresh={() => {}}
                        accentColor={current.color}
                      />

                      <DashboardStats
                        globalStats={current.stats}
                        allLeads={current.leads}
                        isDark={true}
                      />

                      <HeroDispatchCards
                        leads={current.leads}
                        statusOptions={STATUS_OPTIONS}
                        trade={current.trade}
                        view={view}
                        isDark={true}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Bottom Trust Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
              <CheckCircle2 size={15} className="text-teal-600" />
              <span>Instant lead notifications sent straight to your phone & email</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}