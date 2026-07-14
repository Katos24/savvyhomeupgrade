'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Camera, 
  Palette, 
  ListChecks, 
  User, 
  Phone, 
  Mail, 
  Image as ImageIcon 
} from 'lucide-react';
import { TRADE_EXAMPLES, type TradeExample } from './tradeExamples';

const font = "'Nunito', sans-serif";

// ==========================================
// Sub-components & Helpers
// ==========================================

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

function TradeFormCard({
  example,
  compact = false,
}: {
  example: TradeExample;
  compact?: boolean;
}) {
  // Compact (hero): name + phone only, one question, no photo preview.
  // Full (CustomizeFormSection): name + phone + email, address, both
  // questions, and a real photo preview when the trade has one.
  const questions = compact ? example.questions.slice(0, 1) : example.questions;

  return (
    <div className={`w-full relative ${compact ? 'max-w-[290px]' : 'max-w-[370px]'}`}>
      <motion.div
        animate={{ backgroundColor: example.color }}
        transition={{ duration: 0.6 }}
        className={`absolute -inset-1 opacity-20 blur-xl rounded-2xl pointer-events-none ${compact ? '' : 'group-hover:opacity-30'}`}
      />

      <motion.div
        animate={{ borderColor: `${example.color}40` }}
        transition={{ duration: 0.5 }}
        className={`relative bg-white rounded-2xl border-2 overflow-hidden w-full ${
          compact ? 'shadow-[0_20px_40px_rgba(0,0,0,0.35)]' : 'shadow-[0_30px_60px_rgba(0,0,0,0.4)]'
        }`}
      >
        <div className={`relative flex items-center overflow-hidden ${compact ? 'h-12 px-3.5 gap-2.5' : 'h-14 px-4 gap-3'}`}>
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ backgroundColor: example.color }}
            transition={{ duration: 0.5 }}
          />
          <div className={`relative z-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm ${compact ? 'w-7 h-7' : 'w-8 h-8'}`}>
            <img src={example.logo} className={compact ? 'w-4 h-4 object-contain' : 'w-5 h-5 object-contain'} alt="" />
          </div>
          <div className="relative z-10 min-w-0">
            <h4 className={`text-white leading-tight font-black tracking-tight truncate ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {example.company.name}
            </h4>
            <p className={`text-white/70 uppercase tracking-widest font-black ${compact ? 'text-[7px]' : 'text-[8px]'}`}>
              Project Request Form
            </p>
          </div>
        </div>

        <div className={compact ? 'p-3.5 space-y-3' : 'p-4 space-y-4'}>
          <div className={`grid gap-1.5 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div className={`bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800 flex items-center gap-1 ${compact ? 'px-2 py-1.5 text-[8px]' : 'px-2 py-2 text-[9px]'}`}>
              <User size={compact ? 9 : 10} className="text-slate-400 shrink-0" /> John Smith
            </div>
            <div className={`bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800 flex items-center gap-1 ${compact ? 'px-2 py-1.5 text-[8px]' : 'px-2 py-2 text-[9px]'}`}>
              <Phone size={compact ? 9 : 10} className="text-slate-400 shrink-0" /> (555) 0142
            </div>
            {!compact && (
              <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[9px] font-bold text-slate-800 flex items-center gap-1 truncate">
                <Mail size={10} className="text-slate-400 shrink-0" /> john@...
              </div>
            )}
          </div>

          <div className={`bg-slate-50 border border-slate-100 rounded-lg font-bold text-slate-800 flex items-center gap-1.5 ${compact ? 'px-2 py-1.5 text-[8px]' : 'px-2.5 py-2 text-[9px]'}`}>
            <MapPin size={compact ? 9 : 10} className="text-slate-400 shrink-0" /> 123 Main St, Anytown NY
          </div>

          <div className={compact ? 'min-h-[52px]' : 'min-h-[105px]'}>
            <AnimatePresence mode="wait">
              <motion.div
                key={example.trade}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className={compact ? '' : 'space-y-3.5'}
              >
                {questions.map((q, qi) => (
                  <div key={qi}>
                    <label className={`text-slate-400 uppercase tracking-wider font-black block mb-1 ${compact ? 'text-[8px]' : 'text-[9px] mb-1.5'}`}>
                      {q.label}
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {q.options.map((option, oi) => (
                        <div
                          key={option}
                          className={`rounded-lg font-extrabold border-2 transition-all duration-300 ${
                            compact ? 'px-2 py-1 text-[8px]' : 'px-2.5 py-1.5 text-[9px]'
                          } ${
                            oi === q.selected
                              ? 'text-white border-transparent shadow-sm'
                              : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
                          }`}
                          style={oi === q.selected ? { backgroundColor: example.color } : undefined}
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

          <div>
            {!compact && (
              <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                Site Conditions / Photos
              </label>
            )}
            {!compact && example.uploadPreview ? (
              <div className="flex gap-2.5 items-center p-2 bg-slate-50 border border-slate-100 rounded-xl">
                <img src={example.uploadPreview} className="w-10 h-10 object-cover rounded-lg border border-slate-200/60" alt="" />
                <div>
                  <p className="text-[9px] font-black text-slate-800" style={{ fontFamily: font }}>{example.uploadFileName}</p>
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-wider">File Attached</p>
                </div>
              </div>
            ) : (
              <div className={`text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 font-bold text-slate-400 ${compact ? 'py-2.5 text-[8px]' : 'py-3.5 text-[9px]'}`}>
                <ImageIcon size={compact ? 12 : 14} className="mx-auto mb-1 text-slate-300" />
                Tap to attach photos or files
              </div>
            )}
          </div>

          <motion.button
            animate={{ backgroundColor: example.color }}
            transition={{ duration: 0.5 }}
            className={`w-full rounded-xl text-white font-black uppercase tracking-wider shadow-md transition-opacity hover:opacity-95 ${
              compact ? 'py-2 text-[9px]' : 'py-2.5 text-[10px]'
            }`}
          >
            Submit Intake Form
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ==========================================
// Main Exported Component
// ==========================================

export default function CustomizeFormSection() {
  const [activeExample, setActiveExample] = useState(0);
  const current = TRADE_EXAMPLES[activeExample];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 lg:py-36 bg-slate-950">

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        animate={{ backgroundColor: `${current.color}10` }}
        transition={{ duration: 0.8 }}
        className="absolute right-0 top-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-16 items-center">

          {/* LEFT — headline always first on mobile, full copy on desktop */}
          <div className="order-1 lg:order-last flex flex-col justify-center">
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
              className="text-4xl sm:text-5xl text-white font-black leading-[1.05] tracking-tight mb-0 lg:mb-5"
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

            {/* Subtext + badges — desktop only */}
            <div className="hidden lg:block">
              <p
                className="text-slate-400 font-bold text-base sm:text-lg mb-8 mt-5 max-w-sm leading-relaxed"
                style={{ fontFamily: font }}
              >
                Build a form that feels like your business and gives customers confidence that you know your stuff.
              </p>
              <div className="flex flex-wrap gap-2.5 max-w-md">
                <CalloutTag icon={Palette} text="Your colors & logo" />
                <CalloutTag icon={ListChecks} text="Custom question logic" />
                <CalloutTag icon={Camera} text="Photo & video attachment" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
              </div>
            </div>
          </div>

          {/* RIGHT — Interactive Card Preview */}
          <div className="order-2 lg:order-first flex flex-col items-center w-full">

            {/* SELECTION TABS */}
            <div className="flex gap-1.5 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-8 flex-wrap justify-center backdrop-blur-sm">
              {TRADE_EXAMPLES.map((example, i) => (
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

            <div className="group w-full flex justify-center">
              <TradeFormCard example={current} />
            </div>

            {/* Subtext + badges — mobile only, below form */}
            <div className="block lg:hidden w-full mt-8">
              <p
                className="text-slate-400 font-bold text-base leading-relaxed mb-6"
                style={{ fontFamily: font }}
              >
                Build a form that feels like your business and gives customers confidence that you know your stuff.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <CalloutTag icon={Palette} text="Your colors & logo" />
                <CalloutTag icon={ListChecks} text="Custom question logic" />
                <CalloutTag icon={Camera} text="Photo & video attachment" />
                <CalloutTag icon={MapPin} text="Clean address capture" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}