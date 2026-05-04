'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Download, Sunrise, MailCheck, SlidersHorizontal, 
  Wrench, Sparkles, QrCode, ClipboardList, Send, Bot, FileSpreadsheet
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   SILICON VALLEY "HEAVY-DUTY" TRUST STRIP
   Interactive Accordion System for High-Context Selling
   ───────────────────────────────────────────────────────── */

const FEATURES = [
  { 
    id: 'intake',
    icon: <QrCode size={24} />, 
    title: 'THE LEAD MAGNET', 
    desc: 'QR & Custom Forms', 
    accent: 'bg-yellow-400',
    details: 'Blast your custom link or QR everywhere. Customize the form with your branding, specific questions, and preferred dates. It\'s your digital storefront that never sleeps.'
  },
  { 
    id: 'pipeline',
    icon: <SlidersHorizontal size={24} />, 
    title: 'COMMAND CENTER', 
    desc: 'Visual Pipelines', 
    accent: 'bg-emerald-500',
    details: 'Manage leads on a visual board. Customize categories, set up unique workflows, and move jobs from "Quote" to "Paid." Add photos, docs, and short vids directly to the job card.'
  },
  { 
    id: 'automation',
    icon: <Send size={24} />, 
    title: 'ONE-CLICK OPS', 
    desc: 'Branded Comms', 
    accent: 'bg-blue-600',
    details: 'Send professional quotes with "Accept/Decline" buttons, schedule confirmations, and payment reminders in one click. Every move is logged in a dedicated Outbox for 100% transparency.'
  },
  { 
    id: 'ai-intel',
    icon: <Bot size={24} />, 
    title: 'AI ASSISTANT', 
    desc: 'Briefs & Drafting', 
    accent: 'bg-slate-900',
    details: 'Get AI-generated project briefs and chat assistance to speed up your workflow. Our AI quote generator helps you draft faster (it\'s a powerful co-pilot, not a replacement).'
  },
];

export default function NewTrustStrip() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const heavyFont = "font-[1000] tracking-tighter uppercase";

  return (
    <section className="relative overflow-hidden bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
      {/* Blueprint Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} 
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950 text-white mb-4 sm:mb-6 shadow-[4px_4px_0px_#10b981]">
            <Sparkles size={14} className="text-yellow-400" />
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">The Pro-Contractor Operating System</span>
          </div>
          <h2 className={`${heavyFont} text-3xl sm:text-6xl text-slate-950 mb-3 sm:mb-4`}>
            BUILT TO <span className="text-emerald-600 italic">SCALE</span>
          </h2>
          <p className="text-slate-500 font-bold uppercase text-xs sm:text-sm tracking-tight">Click a module to see how we handle your heavy lifting</p>
        </div>

        {/* Interactive Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-16">
          {FEATURES.map((item) => (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() => setActiveTab(activeTab === item.id ? null : item.id)}
                className={`relative flex flex-col items-start p-4 sm:p-6 border-2 border-slate-950 transition-all text-left
                  ${activeTab === item.id ? 'bg-white shadow-[0px_0px_0px_#000] translate-y-1' : 'bg-white shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] hover:-translate-y-1'}
                `}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 flex items-center justify-center text-white border-2 border-slate-950 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] ${item.accent}`}>
                  {item.icon}
                </div>
                <h3 className={`${heavyFont} text-base sm:text-lg text-slate-950`}>{item.title}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">{item.desc}</p>
                
                {/* Arrow indicator */}
                <div className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 transition-transform duration-300 ${activeTab === item.id ? 'rotate-180' : ''}`}>
                  <div className="w-6 h-6 border-2 border-slate-950 flex items-center justify-center bg-slate-50">
                    <span className="text-xs font-black">↓</span>
                  </div>
                </div>
              </button>

              {/* Accordion Details */}
              <AnimatePresence>
                {activeTab === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-slate-950 text-white border-x-2 border-b-2 border-slate-950 shadow-[4px_4px_0px_#10b981] sm:shadow-[6px_6px_0px_#10b981]"
                  >
                    <div className="p-4 sm:p-6 text-sm font-medium leading-relaxed italic">
                      {item.details}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Global Value Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 border-y-2 border-slate-200 py-8 sm:py-12">
          <div className="flex gap-3 sm:gap-4">
            <Sunrise className="text-yellow-500 shrink-0" size={24} />
            <div>
              <h4 className={`${heavyFont} text-xs sm:text-sm text-slate-950`}>6AM Daily Digest</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Wake up to your daily briefing. Every lead, every quote, every dollar pending.</p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <FileSpreadsheet className="text-blue-600 shrink-0" size={24} />
            <div>
              <h4 className={`${heavyFont} text-xs sm:text-sm text-slate-950`}>Total Data Ownership</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Export CSVs anytime. Bulk edit tables for lightning-fast project updates.</p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <MailCheck className="text-emerald-600 shrink-0" size={24} />
            <div>
              <h4 className={`${heavyFont} text-xs sm:text-sm text-slate-950`}>Outbox Tracking</h4>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Stop guessing. See every email sent, when it was delivered, and to whom.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}