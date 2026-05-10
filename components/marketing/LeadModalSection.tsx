'use client';

import { useState } from 'react';
import { Calendar, FileText, Wallet, Zap, Sparkles } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'Lead',
    fullTitle: 'Leads Hit Your Board',
    desc: 'Instant capture from QR scans or forms. No manual typing required.',
    color: '#06b6d4',
    icon: <Zap size={20} strokeWidth={3} />,
    screenIdx: 0
  },
  {
    title: 'Schedule',
    fullTitle: 'One-Tap Dispatch',
    desc: 'Assign your crew and lock the date. The system sends confirmations.',
    color: '#3b82f6',
    icon: <Calendar size={20} strokeWidth={3} />,
    screenIdx: 1
  },
  {
    title: 'Quote',
    fullTitle: 'High-Speed Quoting',
    desc: 'Send professional quotes before you even leave the driveway.',
    color: '#10b981',
    icon: <FileText size={20} strokeWidth={3} />,
    screenIdx: 2
  },
  {
    title: 'Pay',
    fullTitle: 'Automated Collections',
    desc: 'Stop chasing checks. Automated reminders ensure you get paid.',
    color: '#eab308',
    icon: <Wallet size={20} strokeWidth={3} />,
    screenIdx: 3
  },
];

export default function LeadModalSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
  
  {/* Floating background elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
    <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20" />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6">

    {/* Header */}
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16 lg:mb-24"
    >

      
      <h2 
        className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        From First Scan to
        <br />
        <span className="text-yellow-300">Final Payment</span>
      </h2>
      
      <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-bold leading-relaxed">
        Track every job from lead capture to payment—all in one{' '}
        <span className="text-yellow-300 font-black">beautiful dashboard.</span>
      </p>
    </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* Desktop: Step List */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
            {STEPS.map((step, i) => {
              const isActive = activeTab === i;
              return (
                <motion.button
                  key={i}
                  onMouseEnter={() => setActiveTab(i)}
                  whileHover={{ scale: 1.02 }}
                  className={`group relative w-full text-left px-6 py-6 rounded-2xl transition-all duration-300 border-4 ${
                    isActive
                      ? 'bg-white shadow-2xl border-emerald-500 scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-lg ${
                        isActive ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 
                        className={`text-xl font-black ${isActive ? 'text-slate-900' : 'text-slate-600'}`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {step.fullTitle}
                      </h4>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-slate-600 text-sm font-bold mt-2 leading-relaxed"
                          >
                            {step.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Mobile: Tabs */}
          <div className="lg:hidden w-full space-y-6">
            <div className="grid grid-cols-4 bg-slate-100 p-2 rounded-2xl gap-2 border-2 border-slate-200">
              {STEPS.map((step, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl transition-all ${
                    activeTab === i 
                      ? 'bg-emerald-500 text-white shadow-xl scale-105' 
                      : 'text-slate-400 bg-white'
                  }`}
                >
                  {step.icon}
                  <span className="text-xs font-black uppercase">{step.title}</span>
                </motion.button>
              ))}
            </div>
            
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-4 border-emerald-500"
            >
              <h3 
                className="text-2xl font-black text-slate-900 mb-3 leading-tight"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {STEPS[activeTab].fullTitle}
              </h3>
              <p className="text-slate-600 font-bold leading-relaxed">
                {STEPS[activeTab].desc}
              </p>
            </motion.div>
          </div>

          {/* Phone Mockup */}
          <div className="lg:col-span-7 flex justify-center relative">
            <div className="absolute inset-0 bg-emerald-200 blur-3xl rounded-full opacity-30 pointer-events-none" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10 scale-110 lg:scale-125"
            >
              <CyclingPhoneMockup
                visible={true}
                hideIndicators={true}
                activeTab={STEPS[activeTab].screenIdx}
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}