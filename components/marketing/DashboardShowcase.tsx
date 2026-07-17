'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

const BRAND_NAVY = '#0B3C6D';

export default function DashboardShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  const [view, setView] = useState<ViewKey>('cards');
  const current = TRADE_EXAMPLES[activeExample];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-[#fcfcfc] py-20 sm:py-28 border-b-[3px] border-slate-900"
    >
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-5 justify-center"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xl font-black text-white">
            3
          </span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            Form lands, ready to track
          </span>
        </motion.div>

        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Every submission lands
            <span className="text-[#0A3A66]"> already organized on your board.</span>
          </h2>
        </div>

        <div className="w-full">
          <div className="mb-4 flex justify-center">
            <DispatchViewSwitcher view={view} onChange={setView} isDark={false} />
          </div>

          <div className="relative w-full">
            <div className="relative rounded-t-2xl border-[10px] border-b-0 border-slate-900 bg-slate-800 overflow-hidden shadow-[6px_6px_0px_0px_#0f172a] lg:shadow-[10px_10px_0px_0px_#0f172a]">
              <div className="relative flex flex-col w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[520px]">
                <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col space-y-4">
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

            <div className="relative h-4 bg-slate-800 border-2 border-t-0 border-slate-900 rounded-b-md" />
            <div className="relative h-1.5 mx-[10%] bg-slate-950 rounded-b-xl -mt-px" />
          </div>
        </div>
      </div>
    </section>
  );
}