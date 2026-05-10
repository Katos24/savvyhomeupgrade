'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, MapPin, Phone, Mail, User } from 'lucide-react';

/*
  FONT: Nunito — add to layout.tsx:
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
*/

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
    uploadPreview: null,
    uploadFileName: null,
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
    uploadPreview: null,
    uploadFileName: null,
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
    uploadPreview: null,
    uploadFileName: null,
  },
];

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
    <section className="relative overflow-hidden py-14 sm:py-20 bg-slate-900">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
       <div className="block lg:hidden text-center mb-10">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-3xl sm:text-4xl text-white leading-snug"
    style={{ fontFamily: font, fontWeight: 900 }}
  >
    Customize{' '}
    <motion.span
      animate={{ color: current.color }}
      transition={{ duration: 0.5 }}
    >
      Everything.
    </motion.span>
    <br />
    Launch in Minutes.
  </motion.h2>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1"
          >
            <div className="flex gap-2 mb-4 flex-wrap justify-center lg:justify-start">
              {EXAMPLES.map((example, i) => (
                <button
                  key={example.trade}
                  onClick={() => setActiveExample(i)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all border-2 ${
                    activeExample === i
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-300'
                  }`}
                  style={{
                    fontFamily: font,
                    fontWeight: 800,
                    ...(activeExample === i ? { backgroundColor: example.color } : {}),
                  }}
                >
                  {example.trade}
                </button>
              ))}
            </div>

            <motion.div
              animate={{ borderColor: current.color }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl sm:rounded-3xl border-4 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] max-w-lg mx-auto lg:max-w-none"
            >
              <div className="relative h-16 sm:h-20 flex items-center overflow-hidden px-4 gap-3">
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ backgroundColor: current.color }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
                      backgroundSize: '18px 18px',
                    }}
                  />
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.logo}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-white/80 overflow-hidden shrink-0"
                  >
                    <img src={current.logo} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.company}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10"
                  >
                    <h4 className="text-sm sm:text-base text-white leading-tight" style={{ fontFamily: font, fontWeight: 900 }}>
                      {current.company}
                    </h4>
                    <p
                      className="text-[10px] text-white/70 uppercase tracking-widest"
                      style={{ fontFamily: font, fontWeight: 700 }}
                    >
                      Free Quote
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="px-4 sm:px-5 py-4" style={{ minHeight: '420px' }}>
                {/* Name + Email + Phone row - UPDATED FOR MOBILE FRIENDLY EMAIL */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
                  <div className="col-span-1">
                    <label className="block text-[9px] uppercase text-slate-400 mb-0.5 tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Name</label>
                    <div className="px-2 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 text-[10px] sm:text-[11px] flex items-center gap-1" style={{ fontFamily: font, fontWeight: 700 }}>
                      <User size={9} className="text-slate-400 shrink-0" />
                      John Smith
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[9px] uppercase text-slate-400 mb-0.5 tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Phone</label>
                    <div className="px-2 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 text-[10px] sm:text-[11px] flex items-center gap-1" style={{ fontFamily: font, fontWeight: 700 }}>
                      <Phone size={9} className="text-slate-400 shrink-0" />
                      (555) 000-0000
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[9px] uppercase text-slate-400 mb-0.5 tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Email</label>
                    <div className="px-2 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 text-[10px] sm:text-[11px] flex items-center gap-1" style={{ fontFamily: font, fontWeight: 700 }}>
                      <Mail size={9} className="text-slate-400 shrink-0" />
                      <span className="truncate">john@email.com</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label className="block text-[9px] uppercase text-slate-400 mb-0.5 tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Address</label>
                  <div className="px-2 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-900 text-[11px] flex items-center gap-1" style={{ fontFamily: font, fontWeight: 700 }}>
                    <MapPin size={9} className="text-slate-400 shrink-0" />
                    123 Main St, Anytown NY
                  </div>
                </div>

                {/* Questions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.trade}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 mb-3"
                  >
                    {current.questions.map((q, qi) => (
                      <div key={qi}>
                        <label className="block text-[11px] text-slate-900 mb-1.5 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>
                          {q.label}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map((option, oi) => (
                            <div
                              key={option}
                              className={`px-3 py-1.5 rounded-full text-[11px] cursor-pointer transition-all border-2 ${
                                oi === q.selected
                                  ? 'text-white border-transparent shadow-md'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'
                              }`}
                              style={{
                                fontFamily: font,
                                fontWeight: 800,
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

                {/* Project */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] text-slate-900 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>
                      Tell Us About Your Project
                    </label>
                    <span className="text-[9px] text-slate-400" style={{ fontFamily: font, fontWeight: 700 }}>0/500</span>
                  </div>
                  <div className="px-2.5 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg text-[11px] text-slate-400 leading-relaxed" style={{ fontFamily: font, fontWeight: 600, minHeight: '48px' }}>
                    e.g. Missing shingles after storm, possible leak in attic, roof is ~15 years old...
                  </div>
                </div>

                {/* Upload */}
                <div className="mb-4">
                  <label className="block text-[11px] text-slate-900 mb-1 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>
                    Upload Photos
                  </label>
                  <AnimatePresence mode="wait">
                    {current.uploadPreview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border-2 border-slate-200"
                      >
                        <div className="w-10 h-10 rounded-md overflow-hidden border-2 border-slate-200 shrink-0">
                          <img src={current.uploadPreview} alt="Uploaded photo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-slate-700 truncate" style={{ fontFamily: font, fontWeight: 700 }}>
                            {current.uploadFileName}
                          </p>
                          <p className="text-[10px] text-emerald-500" style={{ fontFamily: font, fontWeight: 700 }}>
                            Uploaded
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-2 border-dashed border-slate-300 rounded-lg py-2.5 bg-slate-50/50 text-center"
                      >
                        <ImageIcon className="mx-auto text-slate-300 mb-0.5" size={16} />
                        <p className="text-[10px] text-slate-400" style={{ fontFamily: font, fontWeight: 700 }}>Click to upload</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  className="w-full py-2.5 rounded-xl text-white text-sm border-3 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
                  animate={{ backgroundColor: current.color }}
                  transition={{ duration: 0.5 }}
                  style={{ fontFamily: font, fontWeight: 900, borderWidth: '3px' }}
                >
                  Get My Free Quote
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 text-center lg:text-left"
          >
            <div className="hidden lg:block mb-8">
            <motion.h2
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
className="text-3xl lg:text-4xl text-white leading-snug"
  style={{ fontFamily: font, fontWeight: 900 }}
>
  Customize{' '}
  <motion.span
    animate={{ color: current.color }}
    transition={{ duration: 0.5 }}
  >
    Everything.
  </motion.span>
  <br />
  Launch in Minutes.
</motion.h2>
            </div>

            <div className="space-y-6 sm:space-y-7 mb-10">
              {[
                {
                  step: 1,
                  title: 'Add Your Brand',
                  desc: 'Logo, colors, and company name — make it unmistakably yours.',
                },
                {
                  step: 2,
                  title: 'Create Custom Questions',
                  desc: 'Pill-select options, text fields, dropdowns — ask exactly what you need.',
                },
                {
                  step: 3,
                  title: 'Let Customers Upload Photos',
                  desc: 'See the job site before you drive — save time on bad-fit leads.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 text-left"
                >
                  <motion.div
                    animate={{
                      backgroundColor: current.color,
                      borderColor: current.color,
                    }}
                    transition={{ duration: 0.5 }}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base shrink-0 border-3"
                    style={{ fontFamily: font, fontWeight: 900, borderWidth: '3px' }}
                  >
                    {item.step}
                  </motion.div>
                  <div className="pt-0.5">
                    <h3 className="text-lg text-white mb-0.5" style={{ fontFamily: font, fontWeight: 900 }}>
                      {item.title}
                    </h3>
                    <p
                      className="text-slate-300 leading-relaxed text-[15px]"
                      style={{ fontFamily: font, fontWeight: 600 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{
                backgroundColor: current.color,
                borderColor: current.color,
              }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-2xl px-6 py-4 border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
              style={{ borderWidth: '3px' }}
            >
              <p
                className="text-base sm:text-lg text-white leading-snug"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Contractors using custom forms
                <br />
                see 3x more qualified leads.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}