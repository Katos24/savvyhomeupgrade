'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sunrise, MailCheck, QrCode, SlidersHorizontal, 
  Send, Bot, FileSpreadsheet, ChevronDown
} from 'lucide-react';

const FEATURES = [
  { 
    id: 'intake',
    icon: <QrCode size={24} />, 
    title: 'The Lead Magnet', 
    desc: 'QR & Custom Forms', 
    accent: 'bg-yellow-400',
    details: 'Blast your custom link or QR everywhere. Customize the form with your branding, specific questions, and preferred dates. It\'s your digital storefront that never sleeps.'
  },
  { 
    id: 'pipeline',
    icon: <SlidersHorizontal size={24} />, 
    title: 'Command Center', 
    desc: 'Visual Pipelines', 
    accent: 'bg-emerald-500',
    details: 'Manage leads on a visual board. Customize categories, set up unique workflows, and move jobs from "Quote" to "Paid." Add photos, docs, and short vids directly to the job card.'
  },
  { 
    id: 'automation',
    icon: <Send size={24} />, 
    title: 'One-Click Ops', 
    desc: 'Branded Comms', 
    accent: 'bg-blue-500',
    details: 'Send professional quotes with "Accept/Decline" buttons, schedule confirmations, and payment reminders in one click. Every move is logged in a dedicated Outbox for 100% transparency.'
  },
  { 
    id: 'ai-intel',
    icon: <Bot size={24} />, 
    title: 'AI Assistant', 
    desc: 'Briefs & Drafting', 
    accent: 'bg-purple-500',
    details: 'Get AI-generated project briefs and chat assistance to speed up your workflow. Our AI quote generator helps you draft faster (it\'s a powerful co-pilot, not a replacement).'
  },
];

export default function NewTrustStrip() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 
            className="text-3xl sm:text-5xl font-black text-slate-900 mb-4"
            style={{ fontFamily: 'Fredoka, sans-serif' }}
          >
            Built to <span className="text-emerald-600">Scale</span>
          </h2>
          <p className="text-slate-600 font-bold text-base sm:text-lg">
            Click any card to see how we handle the heavy lifting
          </p>
        </div>

        {/* Interactive Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {FEATURES.map((item) => (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() => setActiveTab(activeTab === item.id ? null : item.id)}
                className={`relative flex flex-col items-start p-6 border-4 border-slate-900 rounded-2xl transition-all text-left
                  ${activeTab === item.id 
                    ? 'bg-white shadow-lg translate-y-0' 
                    : 'bg-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
                  }
                `}
              >
                <div className={`w-14 h-14 mb-4 flex items-center justify-center text-white rounded-xl shadow-lg ${item.accent}`}>
                  {item.icon}
                </div>
                <h3 
                  className="text-lg font-black text-slate-900 mb-1"
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm font-bold text-slate-500">{item.desc}</p>
                
                {/* Arrow indicator */}
                <div className={`absolute bottom-4 right-4 transition-transform duration-300 ${activeTab === item.id ? 'rotate-180' : ''}`}>
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <ChevronDown size={16} className="text-slate-600" strokeWidth={3} />
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
                    className="overflow-hidden bg-slate-900 text-white border-x-4 border-b-4 border-slate-900 rounded-b-2xl shadow-xl"
                  >
                    <div className="p-6 text-sm font-medium leading-relaxed">
                      {item.details}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Value Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 border-t-4 border-slate-200 pt-12">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <Sunrise className="text-yellow-600" size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 mb-1">6AM Daily Digest</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Wake up to your daily briefing. Every lead, every quote, every dollar pending.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <FileSpreadsheet className="text-blue-600" size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 mb-1">Total Data Ownership</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Export CSVs anytime. Bulk edit tables for lightning-fast project updates.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <MailCheck className="text-emerald-600" size={24} />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 mb-1">Outbox Tracking</h4>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Stop guessing. See every email sent, when it was delivered, and to whom.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}