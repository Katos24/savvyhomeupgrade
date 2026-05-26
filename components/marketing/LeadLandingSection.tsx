'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, FileText, Calendar, DollarSign } from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const STEPS = [
  {
    id: 'overview',
    icon: Eye,
    title: 'Zero Data Entry',
    phase: 'Phase 01: Lead Intake',
    desc: 'Every piece of data—photos, exact map dimensions, and custom fields—lands perfectly populated. Zero re-typing required.',
    image: '/images/overview-screen.png',
    accent: '#3b82f6',
  },
  {
    id: 'quote',
    icon: FileText,
    title: 'One-Click Quotes',
    phase: 'Phase 02: Estimation',
    desc: 'Pull from your custom presets to draft structural line-item estimates, then shoot a clean, web-based quote directly to their phone.',
    image: '/images/quote-send-tablet.webp',
    accent: '#10b981',
  },
  {
    id: 'schedule',
    icon: Calendar,
    title: 'Smart Dispatching',
    phase: 'Phase 03: Scheduling',
    desc: 'Lock in operational time slots, assign specific crews, and instantly fire off custom text or email confirmations automatically.',
    image: '/images/schedule-screen.webp',
    accent: '#6366f1',
  },
  {
    id: 'payment',
    icon: DollarSign,
    title: 'Instant Draw Tracking',
    phase: 'Phase 04: Retainers & Ledger',
    desc: 'Track deposit milestones, check real-time balances, and set up automatic friendly payment reminders without leaving the pipeline.',
    image: '/images/payment-send.webp',
    accent: '#f59e0b',
  },
];

export default function WorkflowCardSection() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentStep = STEPS[activeTab];

  return (
    <section id="workflow" className="relative bg-slate-900 py-24 sm:py-28 lg:py-36 overflow-hidden">
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        
        <div className="max-w-3xl mb-16 lg:mb-24">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4" style={{ fontFamily: font }}>
            Inside the pipeline
          </p>
          <h2 className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight" style={{ fontFamily: font }}>
            Run the entire lifecycle <br />
            <span className="text-emerald-500">from one single card.</span>
          </h2>
          <p className="text-slate-400 font-bold text-base sm:text-lg mt-5 max-w-xl leading-relaxed" style={{ fontFamily: font }}>
            Stop jumping between fragmented group threads and messy text logs. Keep everything tethered to a living job record.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-12 items-center">
          
          <div className="space-y-3 order-2 lg:order-1">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = activeTab === idx;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveTab(idx)}
                  className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected ? 'bg-white/[0.03] border-white/[0.1]' : 'bg-transparent border-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  {isSelected && <motion.div layoutId="activeBorder" className="absolute inset-y-0 left-0 w-1 rounded-full" style={{ backgroundColor: step.accent }} />}

                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300`} style={{ backgroundColor: isSelected ? `${step.accent}20` : 'rgba(255,255,255,0.02)', border: isSelected ? `1px solid ${step.accent}40` : '1px solid rgba(255,255,255,0.05)' }}>
                      <Icon size={16} style={{ color: isSelected ? step.accent : '#94a3b8' }} />
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block mb-0.5">{step.phase}</span>
                      <h3 className={`text-base font-black tracking-tight mb-1.5 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: font }}>{step.title}</h3>
                      <div className={`grid transition-all duration-300 ease-in-out ${isSelected ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
                        <p className="overflow-hidden text-xs text-slate-400 font-bold leading-relaxed pr-4">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT IMAGE FRAME: Clean and minimal */}
          <div className="order-1 lg:order-2 w-full relative">
            <motion.div animate={{ backgroundColor: currentStep.accent }} transition={{ duration: 0.8 }} className="absolute inset-10 opacity-10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative aspect-[4/3] w-full flex items-center justify-center p-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden border border-white/10"
                >
                  <Image
                    src={currentStep.image}
                    alt={currentStep.title}
                    fill
                    priority
                    className="object-contain bg-slate-950"
                    sizes="(max-width: 1024px) 100vw, 800px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}