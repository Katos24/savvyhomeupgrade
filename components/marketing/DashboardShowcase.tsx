'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';

import HeroDispatchCards from '@/components/marketing/HeroDispatchCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
{ value: 'new', label: 'New Lead', color: 'green' },
{ value: 'contacted', label: 'Dispatched', color: 'yellow' },
{ value: 'in-progress', label: 'In Progress', color: 'orange' },
{ value: 'completed', label: 'Job Completed', color: 'blue' },
];

// ==========================================
// Product showcase — light section, dark "screenshot" mockup floating in
// the middle. Goes directly below ArchitectHero. Reuses HeroDispatchCards
// (Cards/Table/Calendar, auto-cycled per trade) and DashboardHeader/
// DashboardStats, which were previously in the hero and got pulled out
// when the hero was simplified to text-only.
//
// NOTE: this is a standalone component, not part of ArchitectHero.tsx.
// I don't have your page.tsx, so I can't wire it in directly — render it
// right after <ArchitectHero /> in whatever file assembles your homepage.
// ==========================================
export default function DashboardShowcase() {
const [activeExample, setActiveExample] = useState(0);
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
className="relative overflow-hidden bg-white pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28 border-b-[3px] border-slate-900"
>
<div
className="absolute inset-0 opacity-[0.035] pointer-events-none"
style={{
backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
backgroundSize: '28px 28px',
}}
/>

<div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-12 lg:mb-16">
<div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)] mb-6">
<LayoutDashboard className="w-4 h-4 text-[#2B5C94]" />
<span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
Live Preview
</span>
</div>
<h2 className="tracking-tight leading-[0.95] text-slate-950 text-4xl sm:text-5xl lg:text-6xl font-black mb-5">
Every job, organized<br />
<span className="text-[#7BC94F]">automatically.</span>
</h2>
<p className="text-slate-600 font-bold text-base sm:text-lg max-w-xl mx-auto">
Switch between cards, a full table, or a calendar — same jobs, however you like to see them.
</p>
</div>

<div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
<div className="relative w-full">
<div className="relative rounded-t-2xl border-[10px] border-b-0 border-slate-900 bg-slate-800 overflow-hidden shadow-[6px_6px_0px_0px_#0f172a] lg:shadow-[12px_12px_0px_0px_#0f172a]">
<div className="relative flex flex-col w-full min-h-[480px] sm:min-h-[520px] lg:min-h-[580px]">
<div className="flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto flex flex-col space-y-4 bg-slate-900">
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

<HeroDispatchCards leads={current.leads} statusOptions={STATUS_OPTIONS} isDark={true} trade={current.trade} />
</motion.div>
</AnimatePresence>
</div>
</div>
</div>

<div className="relative h-4 bg-slate-800 border-2 border-t-0 border-slate-900 rounded-b-md" />
<div className="relative h-1.5 mx-[10%] bg-slate-950 rounded-b-xl -mt-px" />
</div>
</div>
</section>
);
}