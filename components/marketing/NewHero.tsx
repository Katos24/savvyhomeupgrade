'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
ArrowRight, 
Send, 
Wrench,
FileSpreadsheet,
Zap as QuickZap
} from 'lucide-react';
import Link from 'next/link';

import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

// ==========================================
// Main Trade-Optimized Architect Hero
// Full-bleed dark hero (badge -> headline -> bullets -> CTA -> rotating
// trade line), full-width photo slideshow directly beneath it, then
// trust badges. No product mockup/form card in the hero itself — this
// was a deliberate layout decision: the reference this was modeled on
// (Housecall Pro's homepage) keeps the hero to text + CTA only and saves
// product imagery for the strip below, so that's what this matches.
// ==========================================
export default function ArchitectHero() {
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
className="relative overflow-hidden bg-[#0B1B33] pt-24 pb-14 sm:pt-24 sm:pb-16 lg:pt-28 border-b-[3px] border-[#7BC94F] z-10"
>
<div
className="absolute inset-0 opacity-[0.04] pointer-events-none"
style={{
backgroundImage: 'radial-gradient(#fff 1.2px, transparent 1.2px)',
backgroundSize: '28px 28px',
}}
/>

<div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
{/* STAGE 1: CENTERED HERO TEXT */}
<div className="flex flex-col items-center text-center space-y-8 mb-14 lg:mb-16">

<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 sm:px-4 whitespace-nowrap">
<Wrench className="w-4 h-4 text-[#7BC94F] shrink-0" />
<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest text-white">
<span className="sm:hidden">Built for Trades</span>
<span className="hidden sm:inline">Built for Contractors & Local Trades</span>
</span>
</div>

<h1 className="tracking-tight leading-[0.95] text-white text-5xl sm:text-6xl lg:text-[76px] font-black">
Your form. Your workflow.<br />
<span className="text-[#7BC94F]">Your brand.</span>
</h1>

<ul className="flex flex-col items-center gap-3">
{[
{ icon: Wrench, color: '#5B9BF0', text: 'Custom questions & quote templates, mapped cleanly to your trade' },
{ icon: Send, color: '#7BC94F', text: 'Branded invoices out the door in one click' },
{ icon: QuickZap, color: '#F5A524', text: 'Get paid instantly, then export it all straight to CSV' },
].map((item, i) => (
<motion.li
key={item.text}
initial={{ opacity: 0, y: 6 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35, delay: 0.08 * i }}
className="flex items-center gap-3 max-w-xl"
>
<span
className="flex items-center justify-center w-7 h-7 rounded-lg border border-white/15 shrink-0"
style={{ backgroundColor: `${item.color}25` }}
>
<item.icon size={13} strokeWidth={3} style={{ color: item.color }} />
</span>
<span className="text-slate-200 font-bold text-sm sm:text-base leading-snug text-left">
{item.text}
</span>
</motion.li>
))}
</ul>

<Link href="/signup">
<motion.div
whileHover={{ scale: 1.03 }}
whileTap={{ scale: 0.98 }}
className="flex items-center justify-center gap-2 bg-[#7BC94F] text-slate-950 px-9 py-4 rounded-full font-black uppercase tracking-wider text-sm transition-all cursor-pointer shadow-[0_8px_24px_-8px_rgba(123,201,79,0.6)] hover:shadow-[0_8px_28px_-6px_rgba(123,201,79,0.8)]"
>
Start Free
<ArrowRight size={16} strokeWidth={3} />
</motion.div>
</Link>

<div className="relative h-8 overflow-hidden w-full flex justify-center">
<AnimatePresence mode="wait">
<motion.p
key={current.trade}
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -8 }}
transition={{ duration: 0.2 }}
className="text-slate-400 text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
>
<span>Optimized for</span>
<span 
className="font-black px-2.5 py-1 rounded border border-white/10 transition-colors duration-300"
style={{ color: current.color, backgroundColor: `${current.color}20` }}
>
{current.trade}
</span>
<span className="hidden sm:inline">services, contracts & teams.</span>
</motion.p>
</AnimatePresence>
</div>

</div>
</div>

{/* FULL-WIDTH PHOTO SLIDESHOW — same dark surface as the hero above, no seam between them */}
<div className="w-full pb-10 lg:pb-14">
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
{/* FEATURE BADGES — kept as bright white chips so they pop against the dark hero, same way the reference floats a white widget over its navy background */}
<div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6">
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
</section>
);
}