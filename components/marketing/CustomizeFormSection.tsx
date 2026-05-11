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
    <section className="relative overflow-hidden py-14 sm:py-20 bg-slate-900">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">

        {/* MOBILE HEADER (cleaner + better spacing) */}
        <div className="block lg:hidden text-center mb-8 sm:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl text-white leading-snug"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Customize{' '}
            <motion.span animate={{ color: current.color }} transition={{ duration: 0.5 }}>
              Everything.
            </motion.span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 sm:gap-10 lg:gap-14 items-start">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >

            {/* TABS */}
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

            {/* FORM CARD */}
            <motion.div
              animate={{ borderColor: current.color }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl sm:rounded-3xl border-4 overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] max-w-lg mx-auto lg:max-w-none"
            >

              {/* HEADER */}
              <div className="relative h-16 sm:h-20 flex items-center px-4 gap-3 overflow-hidden">
                <motion.div
                  className="absolute inset-0 z-0"
                  animate={{ backgroundColor: current.color }}
                  transition={{ duration: 0.5 }}
                />

                <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
                  <img src={current.logo} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                </div>

                <div className="relative z-10">
                  <h4 className="text-sm sm:text-base text-white" style={{ fontFamily: font, fontWeight: 900 }}>
                    {current.company}
                  </h4>
                  <p className="text-[10px] text-white/70 uppercase tracking-widest">
                    Free Quote
                  </p>
                </div>
              </div>

              {/* BODY (mobile spacing improved only) */}
              <div className="px-3 sm:px-5 py-4 space-y-3 sm:space-y-4">

                {/* CONTACT ROW */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 text-[10px] flex items-center gap-1">
                    <User size={9} /> John Smith
                  </div>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 text-[10px] flex items-center gap-1">
                    <Phone size={9} /> (555) 000-0000
                  </div>
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 text-[10px] flex items-center gap-1 col-span-2 sm:col-span-1">
                    <Mail size={9} /> john@email.com
                  </div>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-2 text-[11px] flex items-center gap-1">
                  <MapPin size={9} /> 123 Main St, Anytown NY
                </div>

                {/* QUESTIONS */}
                <AnimatePresence mode="wait">
                  <motion.div key={current.trade} className="space-y-3">
                    {current.questions.map((q, qi) => (
                      <div key={qi}>
                        <label className="text-[11px] text-slate-900 uppercase tracking-wider font-black">
                          {q.label}
                        </label>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {q.options.map((option, oi) => (
                            <div
                              key={option}
                              className={`px-3 py-1.5 rounded-full text-[11px] border-2 ${
                                oi === q.selected
                                  ? 'text-white border-transparent'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                              style={{
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

                {/* UPLOAD */}
                <div>
                  <label className="text-[11px] font-black uppercase">Upload Photos</label>

                  {current.uploadPreview ? (
                    <div className="flex gap-2 p-2 bg-slate-50 border-2 border-slate-200 rounded-lg mt-1">
                      <img src={current.uploadPreview} className="w-10 h-10 object-cover rounded-md" />
                      <div className="text-[10px]">
                        <p>{current.uploadFileName}</p>
                        <p className="text-emerald-500">Uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center border-2 border-dashed border-slate-300 rounded-lg py-2 text-[10px] text-slate-400 mt-1">
                      Click to upload
                    </div>
                  )}
                </div>

                {/* CTA */}
                <button
                  className="w-full py-2.5 rounded-xl text-white text-sm border-3"
                  style={{ backgroundColor: current.color, fontFamily: font, fontWeight: 900 }}
                >
                  Get My Free Quote
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT (UNCHANGED) */}
          <div className="text-center lg:text-left">
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl lg:text-4xl text-white" style={{ fontFamily: font, fontWeight: 900 }}>
                Customize{' '}
                <span style={{ color: current.color }}>Everything.</span>
              </h2>
            </div>

            <div className="space-y-6">
              {[
                { step: 1, title: 'Add Your Brand', desc: 'Logo, colors, and company name — make it unmistakably yours.' },
                { step: 2, title: 'Create Custom Questions', desc: 'Shape the experience to match how your business works.' },
                { step: 3, title: 'Let Customers Upload Photos', desc: 'See the job site before you drive — save time on bad-fit leads.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white border-2"
                    style={{ backgroundColor: current.color }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p className="text-white font-bold">{item.title}</p>
                    <p className="text-slate-300 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}