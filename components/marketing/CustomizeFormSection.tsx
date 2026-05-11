'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, MapPin, Phone, Mail, User } from 'lucide-react';

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
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-slate-900">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── MOBILE HEADER ── */}
        <div className="block lg:hidden text-center mb-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
            style={{ fontFamily: font }}
          >
            Your form, your brand
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl text-white leading-snug"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Customize{' '}
            <motion.span animate={{ color: current.color }} transition={{ duration: 0.5 }}>
              Everything.
            </motion.span>
          </motion.h2>
        </div>

        {/* ── TRADE TABS ── */}
        <div className="flex gap-2 mb-6 sm:mb-8 flex-wrap justify-center lg:justify-start">
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

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-16 items-start">

          {/* ──── LEFT: FORM CARD ──── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1"
          >
            <motion.div
              animate={{ borderColor: current.color }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl sm:rounded-3xl border-4 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] max-w-lg mx-auto lg:max-w-none"
            >

              {/* Form header */}
              <div className="relative h-14 sm:h-[72px] flex items-center px-4 sm:px-5 gap-3 overflow-hidden">
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ backgroundColor: current.color }}
                  transition={{ duration: 0.5 }}
                />
                <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src={current.logo} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" alt="" />
                </div>
                <div className="relative z-10">
                  <h4
                    className="text-sm sm:text-base text-white leading-tight"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    {current.company}
                  </h4>
                  <p
                    className="text-[9px] sm:text-[10px] text-white/70 uppercase tracking-[0.15em] font-bold"
                    style={{ fontFamily: font }}
                  >
                    Free Quote
                  </p>
                </div>
              </div>

              {/* Form body */}
              <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">

                {/* Contact fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 flex items-center gap-2" style={{ fontFamily: font }}>
                    <User size={11} className="text-slate-400" /> John Smith
                  </div>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 flex items-center gap-2" style={{ fontFamily: font }}>
                    <Phone size={11} className="text-slate-400" /> (555) 000-0000
                  </div>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 flex items-center gap-2" style={{ fontFamily: font }}>
                    <Mail size={11} className="text-slate-400" /> john@email.com
                  </div>
                </div>

                {/* Address */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 flex items-center gap-2" style={{ fontFamily: font }}>
                  <MapPin size={11} className="text-slate-400" /> 123 Main St, Anytown NY
                </div>

                {/* Questions */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.trade}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {current.questions.map((q, qi) => (
                      <div key={qi}>
                        <label
                          className="text-[10px] sm:text-[11px] text-slate-900 uppercase tracking-wider font-black block mb-2"
                          style={{ fontFamily: font }}
                        >
                          {q.label}
                        </label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {q.options.map((option, oi) => (
                            <div
                              key={option}
                              className={`px-3 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold border-2 transition-all ${
                                oi === q.selected
                                  ? 'text-white border-transparent shadow-sm'
                                  : 'bg-white text-slate-500 border-slate-200'
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

                {/* Upload */}
                <div>
                  <label
                    className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-900 block mb-2"
                    style={{ fontFamily: font }}
                  >
                    Upload Photos
                  </label>
                  {current.uploadPreview ? (
                    <div className="flex gap-3 items-center p-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                      <img src={current.uploadPreview} className="w-11 h-11 object-cover rounded-lg border border-slate-200" alt="" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-700" style={{ fontFamily: font }}>{current.uploadFileName}</p>
                        <p className="text-[9px] font-bold text-emerald-500" style={{ fontFamily: font }}>Uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center border-2 border-dashed border-slate-300 rounded-xl py-4 text-[11px] text-slate-400 font-bold" style={{ fontFamily: font }}>
                      <ImageIcon size={18} className="mx-auto mb-1 text-slate-300" />
                      Click to upload
                    </div>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  animate={{ backgroundColor: current.color }}
                  transition={{ duration: 0.5 }}
                  className="w-full py-3 sm:py-3.5 rounded-xl text-white text-xs sm:text-sm tracking-wide uppercase shadow-lg"
                  style={{ fontFamily: font, fontWeight: 900 }}
                >
                  Get My Free Quote
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* ──── RIGHT: VALUE COPY ──── */}
          <div className="order-2 lg:sticky lg:top-32">

            {/* Desktop header */}
            <div className="hidden lg:block mb-10">
              <p
                className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
                style={{ fontFamily: font }}
              >
                Your form, your brand
              </p>
              <h2
                className="text-3xl lg:text-[2.75rem] text-white leading-tight"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Create{' '}
                <motion.span animate={{ color: current.color }} transition={{ duration: 0.5 }}>
                  Form.
                </motion.span>
              </h2>
              <h2
                className="text-3xl lg:text-[2.75rem] text-white leading-tight"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Customize{' '}
                <motion.span animate={{ color: current.color }} transition={{ duration: 0.5 }}>
                  Everything.
                </motion.span>
              </h2>
            </div>

            {/* Steps */}
            <div className="space-y-5 sm:space-y-6">
              {[
                {
                  step: 1,
                  title: 'Add Your Brand',
                  desc: '- Logo, colors, and company name — make it unmistakably yours.',
                },
                {
                  step: 2,
                  title: 'Create Custom Questions',
                  desc: '- Tailor exactly what info you need from each customer.',
                },
                {
                  step: 3,
                  title: 'Let Customers Upload Photos',
                  desc: '- See the job before you drive — save time on bad-fit leads.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className="flex gap-4 items-start"
                >
                  <motion.div
                    animate={{ backgroundColor: current.color }}
                    transition={{ duration: 0.5 }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0 shadow-md"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    {item.step}
                  </motion.div>
                  <div>
                    <p
                      className="text-white text-sm sm:text-base mb-0.5"
                      style={{ fontFamily: font, fontWeight: 900 }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-white text-xs sm:text-sm leading-relaxed font-semibold"
                      style={{ fontFamily: font }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Extra value line */}
            <div className="mt-8 sm:mt-10 p-4 sm:p-5 bg-white/[0.04] border border-white/[0.08] rounded-2xl">
              <p
                className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed"
                style={{ fontFamily: font }}
              >
                Every trade is different. A roofer needs to know roof age. A plumber needs urgency level. A solar company needs your electric bill.{' '}
                <span className="text-white font-black">Your form asks exactly what you need.</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}