'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Sparkles, LayoutDashboard, CheckCircle2, ChevronDown } from 'lucide-react';

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

// Map trades to theme mode (isDark) and custom glow colors
const TRADE_THEMES: Record<string, { isDark: boolean; glow: string; badge: string }> = {
  Roofing: { 
    isDark: true, 
    glow: 'from-emerald-500/30 via-teal-500/20', 
    badge: 'bg-emerald-500 text-white' 
  },
  Electrical: { 
    isDark: false, 
    glow: 'from-amber-500/25 via-yellow-500/15', 
    badge: 'bg-amber-500 text-white' 
  },
  Plumbing: { 
    isDark: true, 
    glow: 'from-blue-600/30 via-cyan-500/20', 
    badge: 'bg-blue-500 text-white' 
  },
  HVAC: { 
    isDark: false, 
    glow: 'from-sky-500/25 via-indigo-500/15', 
    badge: 'bg-sky-600 text-white' 
  },
  Landscaping: { 
    isDark: false, 
    glow: 'from-emerald-500/25 via-green-500/15', 
    badge: 'bg-emerald-600 text-white' 
  },
};

export default function DashboardShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  const [view, setView] = useState<ViewKey>('cards');
  const [isPaused, setIsPaused] = useState(false);

  const current = TRADE_EXAMPLES[activeExample];
  const theme = TRADE_THEMES[current.trade] || {
    isDark: false,
    glow: 'from-blue-500/20 via-teal-500/10',
    badge: 'bg-slate-900 text-white',
  };

  // Auto-rotate trade examples unless paused
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
      className="relative overflow-hidden bg-slate-100/70 py-16 sm:py-24 text-slate-900 border-b border-slate-200"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Compact Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3 justify-center"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white shadow-sm">
              3
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
              Instant Dispatch Pipeline
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
            Every submission lands
            <span className="block text-sky-700"> already organized on your board.</span>
          </h2>

          <p className="text-slate-600 font-bold text-sm sm:text-base max-w-lg mx-auto">
            No endless email threads. Watch incoming leads populate directly into your trade-specific board.
          </p>
        </div>

        {/* Main Interface Wrapper */}
        <div className="relative">
          
          {/* Dynamic Trade Glow (Behind the Dashboard Card) */}
          <motion.div
            key={`glow-${current.trade}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`absolute -inset-4 rounded-[3.5rem] bg-gradient-to-r ${theme.glow} to-transparent blur-2xl pointer-events-none z-0`}
          />

          {/* Light Outer Glass Frame */}
          <div className="relative z-10 p-3 sm:p-5 bg-white/80 border border-slate-200/90 rounded-[2.5rem] shadow-xl backdrop-blur-md">
            
            {/* Top Controls: Trade Tabs + View Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 bg-slate-100/80 p-2 rounded-2xl border border-slate-200/60">
              
              {/* Interactive Trade Tabs */}
              <LayoutGroup id="trade-tabs">
                <div 
                  className="flex flex-wrap items-center gap-1"
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
                        className={`relative px-3.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeTradeTab"
                            className="absolute inset-0 bg-slate-900 rounded-xl shadow-sm"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className="relative z-10">{item.trade}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>

              {/* View Switcher Controls */}
              <div className="shrink-0">
                <DispatchViewSwitcher view={view} onChange={setView} isDark={theme.isDark} />
              </div>
            </div>

            {/* Dashboard Container (Switches Dark/Light per trade) */}
            <div className={`relative rounded-2xl border transition-colors duration-300 overflow-hidden shadow-xl ${
              theme.isDark 
                ? 'bg-slate-950 border-slate-800 text-white' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* Top Browser Header Bar */}
              <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors duration-300 ${
                theme.isDark 
                  ? 'bg-slate-900/90 border-slate-800' 
                  : 'bg-slate-100 border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${theme.isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  <div className={`w-2.5 h-2.5 rounded-full ${theme.isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                  <div className={`w-2.5 h-2.5 rounded-full ${theme.isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
                </div>
                
                {/* Specific URL display */}
                <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold border transition-colors ${
                  theme.isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
                }`}>
                  <LayoutDashboard size={12} className={theme.isDark ? 'text-teal-400' : 'text-sky-600'} />
                  <span>https://lead2project.com/ridge-line-roofing/dashboard</span>
                  <ChevronDown size={11} className="text-slate-400" />
                </div>

                <motion.div 
                  key={`badge-${current.trade}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.badge}`}
                >
                  {current.trade} Live
                </motion.div>
              </div>

              {/* Board Screen Content */}
              <div className={`relative flex flex-col w-full min-h-[380px] sm:min-h-[420px] transition-colors duration-300 ${
                theme.isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'
              }`}>
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.trade}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col space-y-3"
                    >
                      <DashboardHeader
                        company={current.company}
                        isDark={theme.isDark}
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
                        isDark={theme.isDark}
                      />

                      <HeroDispatchCards
                        leads={current.leads}
                        statusOptions={STATUS_OPTIONS}
                        trade={current.trade}
                        view={view}
                        isDark={theme.isDark}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Bottom Footer Note */}
            <div className="mt-3 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Instant lead notifications sent straight to your phone & email</span>
              <Sparkles size={13} className="text-amber-500 shrink-0" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}