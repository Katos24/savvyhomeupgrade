'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Sparkles, LayoutDashboard, CheckCircle2, ChevronDown, Lock } from 'lucide-react';

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

const TRADE_THEMES: Record<string, { isDark: boolean; glow: string; badge: string }> = {
  Roofing: { 
    isDark: true, 
    glow: 'from-emerald-500/20 via-teal-500/10', 
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
  },
  Electrical: { 
    isDark: false, 
    glow: 'from-amber-500/20 via-yellow-500/10', 
    badge: 'bg-amber-100 text-amber-800 border-amber-300' 
  },
  Plumbing: { 
    isDark: true, 
    glow: 'from-blue-600/20 via-cyan-500/10', 
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
  },
  HVAC: { 
    isDark: false, 
    glow: 'from-sky-500/20 via-indigo-500/10', 
    badge: 'bg-sky-100 text-sky-800 border-sky-300' 
  },
  Landscaping: { 
    isDark: false, 
    glow: 'from-emerald-500/20 via-green-500/10', 
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' 
  },
};

export default function DashboardShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  const [view, setView] = useState<ViewKey>('cards');
  const [isPaused, setIsPaused] = useState(false);

  const current = TRADE_EXAMPLES[activeExample];
  const theme = TRADE_THEMES[current.trade] || {
    isDark: false,
    glow: 'from-blue-500/15 via-teal-500/10',
    badge: 'bg-slate-200 text-slate-800 border-slate-300',
  };

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
      className="relative overflow-hidden bg-slate-50 py-16 sm:py-24 text-slate-900 border-b border-slate-200"
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-3 justify-center"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-xs font-black text-white shadow-sm">
              3
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-teal-800">
              Instant Dispatch Pipeline
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.08] mb-4">
            Every submission lands
            <span className="block text-teal-700"> directly on your board.</span>
          </h2>

          <p className="text-slate-600 font-bold text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            No endless email chains. Watch new customer submissions populate instantly into your trade-specific workspace.
          </p>
        </div>

        {/* Main Dashboard Container */}
        <div className="relative">
          
          {/* Soft Glow Effect */}
          <motion.div
            key={`glow-${current.trade}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`absolute -inset-4 rounded-[2.5rem] bg-gradient-to-r ${theme.glow} to-transparent blur-3xl pointer-events-none z-0`}
          />

          {/* Glass Outer Wrapper Frame */}
          <div className="relative z-10 p-3 sm:p-6 bg-white/90 border border-slate-200/90 rounded-2xl sm:rounded-[2.5rem] shadow-2xl backdrop-blur-md">
            
            {/* Top Toolbar: Trade Selector Tabs + View Switcher */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 bg-slate-100/90 p-2 rounded-xl sm:rounded-2xl border border-slate-200/80">
              
              {/* Trade Selector Tabs */}
              <LayoutGroup id="trade-tabs">
                <div 
                  className="flex items-center justify-start overflow-x-auto no-scrollbar gap-1 pb-1 md:pb-0"
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
                        className={`relative shrink-0 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive ? 'text-white' : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeTradeTab"
                            className="absolute inset-0 bg-slate-900 rounded-xl shadow-md"
                            transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                          />
                        )}
                        <span className="relative z-10">{item.trade}</span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>

              {/* View Switcher Buttons */}
              <div className="shrink-0 flex items-center justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200/60">
                <DispatchViewSwitcher view={view} onChange={setView} isDark={theme.isDark} />
              </div>
            </div>

            {/* Dashboard Window Display */}
            <div className={`relative rounded-xl sm:rounded-2xl border transition-all duration-300 overflow-hidden shadow-xl ${
              theme.isDark 
                ? 'bg-slate-950 border-slate-800 text-white' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* Mock Browser Header Bar */}
              <div className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 transition-colors duration-300 ${
                theme.isDark 
                  ? 'bg-slate-900/90 border-slate-800' 
                  : 'bg-slate-100/90 border-slate-200'
              }`}>
                
                {/* Traffic Lights */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                
                {/* Responsive Browser URL Input Box */}
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold border transition-colors max-w-md flex-1 justify-center mx-2 ${
                  theme.isDark
                    ? 'bg-slate-950 text-slate-300 border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 shadow-2xs'
                }`}>
                  <Lock size={12} className="text-teal-600 shrink-0" />
<span className="truncate">lead2project.com/{current.company.slug}/dashboard</span>
                </div>

                {/* Trade Badge Tag */}
                <motion.div 
                  key={`badge-${current.trade}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 ${theme.badge}`}
                >
                  {current.trade} Live
                </motion.div>
              </div>

              {/* Main Board Interactive Canvas */}
              <div className={`relative flex flex-col w-full min-h-[400px] sm:min-h-[460px] transition-colors duration-300 ${
                theme.isDark ? 'bg-slate-900/40' : 'bg-slate-50/60'
              }`}>
                <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.trade}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col space-y-4"
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

            {/* Bottom Proof Note */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-slate-500 text-xs font-bold text-center">
              <CheckCircle2 size={15} className="text-teal-700 shrink-0" />
              <span>Instant SMS & email alerts dispatched on every new submission</span>
              <Sparkles size={14} className="text-amber-500 shrink-0 ml-0.5" />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}