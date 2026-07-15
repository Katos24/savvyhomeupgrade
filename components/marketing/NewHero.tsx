'use client';

import React, { useState, useEffect } from 'react';
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
Wrench,
ChevronDown,
FileSpreadsheet,
Zap as QuickZap
} from 'lucide-react';
import Link from 'next/link';

import HeroDispatchCards from '@/components/marketing/HeroDispatchCards';
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
// Trade-Focused Tactical Intake Ticket
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
className="absolute -inset-1.5 rounded-2xl opacity-[0.08] blur-xl transition-all duration-750 group-hover:opacity-15"
style={{ backgroundColor: example.color }}
/>

<div className="relative bg-white rounded-2xl border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] overflow-hidden w-full text-left transition-all duration-200">
{/* Dynamic Branded Top Bar */}
<div 
className="px-4 py-4 flex items-center justify-between border-b-[3px] border-slate-900 transition-all duration-300"
style={{ backgroundColor: `${example.color}15` }}
>
<div className="flex items-center gap-3.5 min-w-0">
<div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shrink-0 p-2 shadow-xs">
<img 
src={example.logo} 
className="w-full h-full object-contain" 
alt={example.company.name} 
/>
</div>
<div className="min-w-0">
<h4 className="text-slate-900 leading-none font-black text-base sm:text-lg tracking-tight truncate">
{example.company.name}
</h4>
<p className="text-slate-600 uppercase tracking-widest font-extrabold text-[8px] mt-1.5 leading-none">
Work Request Form
</p>
</div>
</div>
<div className="flex items-center gap-1.5 bg-white border-2 border-slate-900 px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
<span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: example.color }} />
<span className="text-[8px] font-black text-slate-900 uppercase tracking-wider">Online</span>
</div>
</div>

<div className="p-5 space-y-4.5">
<div className="space-y-1.5">
<label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
Customer Details
</label>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
<div className="bg-slate-50/50 border-2 border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2 truncate">
<User size={13} className="text-slate-400 shrink-0" strokeWidth={2.5} />
<span className="text-[11px] font-bold text-slate-800 truncate">{customerName}</span>
</div>
<div className="bg-slate-50/50 border-2 border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2 truncate">
<Phone size={13} className="text-slate-400 shrink-0" strokeWidth={2.5} />
<span className="text-[11px] font-bold text-slate-800 truncate">{customerPhone}</span>
</div>
</div>
</div>

<div className="space-y-1.5">
<label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
Jobsite Address
</label>
<div className="bg-slate-50/50 border-2 border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
<MapPin size={13} className="text-slate-400 shrink-0" strokeWidth={2.5} />
<span className="text-[11px] font-bold text-slate-800 truncate">{customerAddress}</span>
</div>
</div>

<div className="space-y-2 min-h-[105px] sm:min-h-[115px]">
<label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
Job Requirements
</label>
<AnimatePresence mode="wait">
<motion.div
key={example.trade}
initial={{ opacity: 0, y: 5 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -5 }}
transition={{ duration: 0.18 }}
className="space-y-2.5"
>
{questions.map((q, qi) => (
<div key={qi} className="space-y-2">
<p className="text-[11px] font-black text-slate-900 leading-tight">{q.label}</p>
<div className="flex flex-wrap gap-2">
{q.options.map((option, oi) => {
const isActive = oi === q.selected;
return (
<div
key={option}
className={`rounded-lg px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-150 border-2 cursor-default select-none ${
isActive
? 'bg-slate-900 border-slate-900 text-white shadow-xs'
: 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
}`}
>
<div className="flex items-center gap-1.5">
{isActive && (
<span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: example.color }} />
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

{/* Jobsite Photos — always shown now, in compact and full mode alike. */}
<div className="space-y-1.5">
<label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
Jobsite Photos (Optional)
</label>
{example.uploadPreview ? (
<div className="flex gap-2.5 items-center p-2.5 bg-slate-50/50 border-2 border-slate-200 rounded-lg">
<img src={example.uploadPreview} className="w-10 h-10 object-cover rounded-md border-2 border-slate-300" alt="" />
<div className="min-w-0 flex-1">
<p className="text-[11px] font-black text-slate-800 truncate">{example.uploadFileName}</p>
<p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
✓ Attached successfully
</p>
</div>
</div>
) : (
<div className="text-center border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50/30 py-3.5 text-slate-400 flex flex-col items-center justify-center transition-colors">
<ImageIcon size={18} className="mb-1 text-slate-400" />
<span className="text-[9px] font-black uppercase tracking-wider">Tap to upload photos</span>
</div>
)}
</div>

<motion.button
whileHover={{ scale: 1.01, y: -1 }}
whileTap={{ scale: 0.99, y: 1 }}
className="w-full text-white font-black uppercase tracking-wider py-3.5 rounded-xl text-[10px] border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all cursor-pointer"
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
const current = TRADE_EXAMPLES[activeExample];

useEffect(() => {
const interval = setInterval(() => {
setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
}, 5000);
return () => clearInterval(interval);
}, []);

const [isDashboardDark, setIsDashboardDark] = useState(true);

useEffect(() => {
const interval = setInterval(() => {
setIsDashboardDark((prev) => !prev);
}, 6000);
return () => clearInterval(interval);
}, []);

return (
<section
style={{ fontFamily: font }}
className="relative overflow-hidden bg-[#fcfcfc] pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-28 border-b-[3px] border-slate-900 z-10"
>
<div
className="absolute inset-0 opacity-[0.045] pointer-events-none"
style={{
backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
backgroundSize: '28px 28px',
}}
/>

<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
{/* STAGE 1: TWO-COLUMN HERO */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-12 lg:mb-14">
<div className="lg:col-span-7 space-y-8 text-left lg:pr-10 xl:pr-14">
<div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)]">
<Wrench className="w-4 h-4 text-[#2B5C94]" />
<span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
Built for Contractors & Local Trades
</span>
</div>

<h1 className="tracking-tight leading-[0.95] text-slate-950 text-5xl sm:text-6xl lg:text-[72px] xl:text-[80px] font-black">
Your form. Your workflow.<br />
<span className="text-[#7BC94F]">Your brand.</span>
</h1>

<ul className="max-w-2xl space-y-2.5">
{[
{ icon: Wrench, color: '#2B5C94', text: 'Custom questions & quote templates, mapped cleanly to your trade' },
{ icon: Send, color: '#7BC94F', text: 'Branded invoices out the door in one click' },
{ icon: QuickZap, color: '#F5A524', text: 'Get paid instantly, then export it all straight to CSV' },
].map((item, i) => (
<motion.li
key={item.text}
initial={{ opacity: 0, x: -8 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.35, delay: 0.08 * i }}
whileHover={{ x: 2 }}
className="flex items-center gap-3"
>
<span
className="flex items-center justify-center w-7 h-7 rounded-lg border-2 border-slate-900 shrink-0 shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)]"
style={{ backgroundColor: `${item.color}15` }}
>
<item.icon size={13} strokeWidth={3} style={{ color: item.color }} />
</span>
<span className="text-slate-700 font-bold text-sm sm:text-base leading-snug">
{item.text}
</span>
</motion.li>
))}
</ul>

<div className="flex flex-wrap items-center gap-4">
<Link href="/signup">
<motion.div
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
className="flex items-center justify-center gap-2 bg-slate-950 text-white px-8 py-4.5 rounded-xl font-black uppercase tracking-wider text-sm border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#7BC94F] hover:shadow-none transition-all cursor-pointer"
>
Start Free
<ArrowRight size={16} strokeWidth={3} className="text-[#7BC94F]" />
</motion.div>
</Link>
</div>

<div className="relative h-8 overflow-hidden">
<AnimatePresence mode="wait">
<motion.p
key={current.trade}
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.2 }}
className="text-slate-400 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2"
>
<span>Optimized for</span>
<span 
className="font-black px-2.5 py-1 rounded border-2 border-slate-900/5 transition-colors duration-300"
style={{ color: current.color, backgroundColor: `${current.color}08` }}
>
{current.trade}
</span>
<span>services, contracts & teams.</span>
</motion.p>
</AnimatePresence>
</div>

</div>

<div className="lg:col-span-5 w-full max-w-[400px] lg:max-w-none justify-self-center lg:justify-self-end">
<div className="text-center lg:text-left mb-4">
<span className="inline-block bg-amber-100 text-amber-800 border-2 border-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)]">
Step 1: Customer submits request
</span>
</div>
<TradeJobIntakeCard example={current} compact />

<p className="text-center lg:text-left text-slate-400 text-[10px] font-bold leading-relaxed mt-3">
Shown here as an example — every question, and the photo upload, is fully customizable to your business.
</p>
</div>

</div>
</div>

{/* FULL-WIDTH PHOTO SLIDESHOW — edge-to-edge dark banner, breaks out of the max-w-7xl container above */}
<div className="w-full bg-slate-900 py-7 sm:py-9 mb-10 lg:mb-14 border-y-[3px] border-slate-900">
<p className="text-center text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-5">
Built for every trade
</p>
<div className="flex items-end justify-start lg:justify-center gap-3 overflow-x-auto scrollbar-none px-4 sm:px-8 lg:px-12">
{TRADE_EXAMPLES.map((example, index) => {
const isActive = index === activeExample;
return (
<button
key={example.trade}
onClick={() => setActiveExample(index)}
className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer"
>
<div
className={`relative rounded-xl border-2 overflow-hidden transition-all duration-400 ${
isActive
? 'w-44 h-32 sm:w-64 sm:h-44 lg:w-80 lg:h-52 border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]'
: 'w-24 h-20 sm:w-32 sm:h-24 border-slate-700 opacity-60 group-hover:opacity-90'
}`}
>
<img
src={example.heroPhoto}
alt={`${example.trade} example`}
className={`w-full h-full object-cover transition-all duration-400 ${
isActive ? 'blur-none grayscale-0' : 'blur-[3px] grayscale group-hover:blur-[1px] group-hover:grayscale-0'
}`}
/>
</div>
<span
className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-colors duration-300"
style={{ color: isActive ? example.color : '#64748b' }}
>
{example.trade}
</span>
</button>
);
})}
</div>
</div>

<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
{/* TRANSITION CONNECTOR */}
<div className="flex flex-col items-center justify-center gap-3 mb-10">
<div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-slate-900 bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] shrink-0 animate-bounce">
<ChevronDown className="w-5 h-5 text-slate-900" strokeWidth={3} />
</div>
<span className="inline-block bg-amber-100 text-amber-800 border-2 border-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)]">
Step 2: Populates Instantly on your main dispatch board
</span>
</div>

{/* STAGE 2: DASHBOARD MOCKUP */}
<div className="relative w-full max-w-5xl mx-auto">
<div className="relative rounded-t-2xl border-[10px] border-b-0 border-slate-900 bg-slate-800 overflow-hidden shadow-[6px_6px_0px_0px_#0f172a] lg:shadow-[12px_12px_0px_0px_#0f172a]">
<div className="relative flex flex-col w-full min-h-[480px] sm:min-h-[520px] lg:min-h-[580px]">
<div className={`flex-1 min-h-0 p-4 lg:p-6 overflow-y-auto flex flex-col space-y-4 transition-colors duration-500 ${isDashboardDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
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
isDark={isDashboardDark}
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
isDark={isDashboardDark}
/>

<HeroDispatchCards leads={current.leads} statusOptions={STATUS_OPTIONS} isDark={isDashboardDark} trade={current.trade} />
</motion.div>
</AnimatePresence>
</div>
</div>

</div>

<div className="relative h-4 bg-slate-800 border-2 border-t-0 border-slate-900 rounded-b-md" />
<div className="relative h-1.5 mx-[10%] bg-slate-950 rounded-b-xl -mt-px" />
</div>

{/* STAGE 3: FEATURE BADGES */}
<div className="mt-16 pt-8 border-t-[3px] border-slate-900/5 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
<div className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-3.5 py-2 shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)]">
<div className="p-1 rounded bg-[#e8f5e9] text-[#7BC94F] border border-slate-900/10">
<Send size={13} strokeWidth={3} />
</div>
<span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
1-Tap Invoices
</span>
</div>

<div className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-3.5 py-2 shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)]">
<div className="p-1 rounded bg-[#e3f2fd] text-blue-500 border border-slate-900/10">
<QuickZap size={13} strokeWidth={3} />
</div>
<span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
Get Paid Faster
</span>
</div>

<div className="inline-flex sm:inline-flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-3.5 py-2 shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)]">
<div className="p-1 rounded bg-[#f3e5f5] text-purple-500 border border-slate-900/10">
<FileSpreadsheet size={13} strokeWidth={3} />
</div>
<span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider whitespace-nowrap">
All-in-One Dashboard
</span>
</div>
</div>

</div>

{/* Manual Dispatch Info Modal */}
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
initial={{ opacity: 0, y: 12, scale: 0.97 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 12, scale: 0.97 }}
className="relative w-full max-w-md rounded-2xl bg-white border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] p-6 text-slate-900"
style={{ fontFamily: font }}
>
<button
onClick={() => setShowCreateLeadInfo(false)}
className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-750 flex items-center justify-center transition-colors cursor-pointer"
>
<X size={14} strokeWidth={2.5} />
</button>

<h3 className="text-base font-black tracking-tight mb-1">
How leads get assigned:
</h3>
<p className="text-xs font-bold text-slate-400 mb-5 leading-relaxed">
Your dispatch board coordinates tasks seamlessly from two sources:
</p>

<div className="space-y-4">
<div className="flex items-start gap-3.5 p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/50">
<div className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
<Send size={16} strokeWidth={2.5} />
</div>
<div>
<p className="text-xs font-black">01. Direct Customer Submission</p>
<p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">
Clients access your secure link, pick services, snap site photos, and submit. The details populate instantly on your active dispatch board.
</p>
</div>
</div>

<div className="flex items-start gap-3.5 p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50/50">
<div className="w-9 h-9 rounded-lg bg-slate-950 text-white flex items-center justify-center shrink-0 shadow-sm">
<UserPlus size={16} strokeWidth={2.5} />
</div>
<div>
<p className="text-xs font-black">02. Phone Inquiries / Over the Phone</p>
<p className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">
For walk-ins, phone calls, or emergencies, open manual intake. Input parameters yourself inside the dashboard in seconds.
</p>
</div>
</div>
</div>

<button
onClick={() => setShowCreateLeadInfo(false)}
className="w-full mt-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border-[3px] border-slate-950 shadow-sm"
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