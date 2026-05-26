'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, MapPin, Phone, Mail, User, Camera, Palette, ListChecks } from 'lucide-react';

const font = "'Nunito', sans-serif";

const EXAMPLES = [
  {
    trade: 'Roofing',
    company: 'Ridge Line Roofing',
    color: '#f97316',
    logo: '/images/ridgelinelogo.webp',
    questions: [
      {
        label: 'Service Needed',
        type: 'pills' as const,
        options: ['Roof Repair', 'Roof Replacement', 'Leak Detection', 'Inspection', 'Gutter Work'],
        selected: 2,
      },
      {
        label: 'How old is your roof?',
        type: 'pills' as const,
        options: ['Under 10 yrs', '10-20 yrs', '20+ yrs', 'Not sure'],
        selected: 1,
      },
    ],
    uploadPreview: '/images/roof-damage.webp',
    uploadFileName: 'roof-damage.webp',
  },
  {
    trade: 'HVAC',
    company: 'Arctic Air HVAC',
    color: '#0ea5e9',
    logo: '/images/arctic-air-logo.webp',
    questions: [
      {
        label: 'System Type',
        type: 'pills' as const,
        options: ['Central AC', 'Heat Pump', 'Mini Split', 'Furnace', 'Full HVAC'],
        selected: 0,
      },
      {
        label: "What's the issue?",
        type: 'pills' as const,
        options: ['Blowing warm', 'No airflow', 'Strange noise', 'Routine maintenance'],
        selected: 3,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
  },
  {
    trade: 'Plumbing',
    company: 'Rapid Flow Plumbing',
    color: '#10b981',
    logo: '/images/rapid-flow-logo.webp',
    questions: [
      {
        label: 'Service Type',
        type: 'pills' as const,
        options: ['Leak Repair', 'Drain Cleaning', 'Water Heater', 'Pipe Burst', 'Remodel'],
        selected: 0,
      },
      {
        label: 'How urgent is this?',
        type: 'pills' as const,
        options: ['Emergency', 'This week', 'Flexible', 'Just a quote'],
        selected: 0,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
  },
  {
    trade: 'Solar',
    company: 'Sun Peak Solar',
    color: '#eab308',
    logo: '/images/sun-peak-logo.webp',
    questions: [
      {
        label: 'Interested In',
        type: 'pills' as const,
        options: ['Solar Panels', 'Battery Storage', 'EV Charger', 'Full System', 'Maintenance'],
        selected: 3,
      },
      {
        label: 'Monthly electric bill?',
        type: 'pills' as const,
        options: ['Under $100', '$100-$200', '$200-$300', 'Over $300'],
        selected: 2,
      },
    ],
    uploadPreview: '',
    uploadFileName: '',
  },
];

function CalloutTag({ icon: Icon, text, className = '' }: { icon: any; text: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md transition-all duration-300 hover:border-white/[0.12] ${className}`}
    >
      <Icon size={14} className="text-emerald-400" />
      <span className="text-xs font-bold text-slate-300" style={{ fontFamily: font }}>{text}</span>
    </motion.div>
  );
}

export default function CustomizeFormSection() {
  const [activeExample, setActiveExample] = useState(0);
  const current = EXAMPLES[activeExample];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-36 bg-slate-950">
      
      {/* Background Matrix Sync */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Subtle Color Aura Bleed */}
      <motion.div 
        animate={{ backgroundColor: `${current.color}10` }}
        transition={{ duration: 0.8 }}
        className="absolute right-0 top-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none" 
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">

          {/* LEFT — Typography & Matrix Links */}
          <div className="order-1 flex flex-col justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white mb-4"
              style={{ fontFamily: font }}
            >
              Your form, your brand
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: font }}
            >
             Custom forms <br />
              that win jobs.{' '}
              <motion.span 
                animate={{ color: current.color }} 
                transition={{ duration: 0.5 }}
                className="block pt-1"
              >
                Built by you.
              </motion.span>
            </motion.h2>

            <p
              className="text-slate-400 font-bold text-base sm:text-lg mb-8 max-w-sm leading-relaxed"
              style={{ fontFamily: font }}
            >
              Your logo. Your questions. Complete site status photos captured automatically before your team ever shows up.
            </p>

            {/* Premium Pill Badges */}
            <div className="flex flex-wrap gap-2.5 max-w-md">
              <CalloutTag icon={Palette} text="Your colors & logo" />
              <CalloutTag icon={ListChecks} text="Custom question logic" />
              <CalloutTag icon={Camera} text="Photo & video attachment" />
              <CalloutTag icon={MapPin} text="Clean address capture" />
            </div>
          </div>

          {/* RIGHT — Interactive Card Preview */}
          <div className="order-2 flex flex-col items-center w-full">

            {/* SELECTION TABS */}
            <div className="flex gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-8 flex-wrap justify-center backdrop-blur-sm">
              {EXAMPLES.map((example, i) => (
                <button
                  key={example.trade}
                  onClick={() => setActiveExample(i)}
                  className={`px-4 py-1.5 rounded-lg text-xs tracking-wide transition-all duration-300 ${
                    activeExample === i
                      ? 'text-white shadow-sm font-black'
                      : 'bg-transparent text-slate-400 font-bold hover:text-slate-200'
                  }`}
                  style={{
                    fontFamily: font,
                    ...(activeExample === i ? { backgroundColor: example.color } : {}),
                  }}
                >
                  {example.trade}
                </button>
              ))}
            </div>

            {/* LIVING APPLICATION WINDOW */}
            <div className="w-full max-w-[370px] relative group">
              
              {/* Soft Outer Halo Shadow */}
              <motion.div 
                animate={{ backgroundColor: current.color }}
                transition={{ duration: 0.6 }}
                className="absolute -inset-1 opacity-20 blur-xl rounded-2xl pointer-events-none transition-opacity group-hover:opacity-30"
              />
              
              <motion.div
                animate={{ borderColor: `${current.color}40` }}
                transition={{ duration: 0.5 }}
                className="relative bg-white rounded-2xl border-2 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)] w-full"
              >
                {/* Custom Branded Top Navigation Header */}
                <div className="relative h-14 flex items-center px-4 gap-3 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 z-0"
                    animate={{ backgroundColor: current.color }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="relative z-10 w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img src={current.logo} className="w-5 h-5 object-contain" alt="" />
                  </div>
                  <div className="relative z-10">
                    <h4 className="text-xs text-white leading-tight font-black tracking-tight">
                      {current.company}
                    </h4>
                    <p className="text-[8px] text-white/70 uppercase tracking-widest font-black">
                      Project Request Form
                    </p>
                  </div>
                </div>

                {/* Simulated Lead User Inputs Fields */}
                <div className="p-4 space-y-4">

                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1">
                      <User size={10} className="text-slate-400 flex-shrink-0" /> John Smith
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1">
                      <Phone size={10} className="text-slate-400 flex-shrink-0" /> (555) 0142
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1 truncate">
                      <Mail size={10} className="text-slate-400 flex-shrink-0" /> john@...
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin size={10} className="text-slate-400 flex-shrink-0" /> 123 Main St, Anytown NY
                  </div>

                  {/* Dynamic Custom Rules Display */}
                  <div className="min-h-[105px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.trade}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-3.5"
                      >
                        {current.questions.map((q, qi) => (
                          <div key={qi}>
                            <label className="text-[9px] text-slate-400 uppercase tracking-wider font-black block mb-1.5">
                              {q.label}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {q.options.map((option, oi) => (
                                <div
                                  key={option}
                                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold border-2 transition-all duration-300 ${
                                    oi === q.selected
                                      ? 'text-white border-transparent shadow-sm'
                                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                                  }`}
                                  style={{
                                    fontFamily: font,
                                    ...(oi === q.selected ? { backgroundColor: current.color } : {}),
                                  }}
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Attachment Management Section */}
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                      Site Conditions / Photos
                    </label>
                    {current.uploadPreview ? (
                      <div className="flex gap-2.5 items-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                        <img src={current.uploadPreview} className="w-10 h-10 object-cover rounded-lg border border-slate-200/60" alt="" />
                        <div>
                          <p className="text-[9px] font-black text-slate-800" style={{ fontFamily: font }}>{current.uploadFileName}</p>
                          <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">File Attached</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center border border-dashed border-slate-200 rounded-xl py-3.5 text-[9px] text-slate-400 font-bold bg-slate-50/50">
                        <ImageIcon size={14} className="mx-auto mb-1 text-slate-300" />
                        Tap to attach photos or files
                      </div>
                    )}
                  </div>

                  {/* Submission Action Anchor */}
                  <motion.button
                    animate={{ backgroundColor: current.color }}
                    transition={{ duration: 0.5 }}
                    className="w-full py-2.5 rounded-xl text-white text-[10px] font-black uppercase tracking-wider shadow-md transition-opacity hover:opacity-95"
                  >
                    Submit Intake Form
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}