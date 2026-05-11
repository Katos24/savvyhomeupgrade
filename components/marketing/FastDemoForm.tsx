'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Image as ImageIcon,
  User, Mail, Phone,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

// ---------------- BUTTON ----------------

function SubmitBtn({ children, done, active }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      animate={{ scale: active ? 0.98 : 1 }}
      className="w-full py-3 rounded-2xl text-[11px] font-black text-white shadow-lg tracking-wide uppercase"
      style={{
        fontFamily: font,
        background: done
          ? 'linear-gradient(135deg,#10b981,#059669)'
          : 'linear-gradient(135deg,#f97316,#ea580c,#c2410c)',
      }}
    >
      {children}
    </motion.button>
  );
}

// ---------------- FIELD ----------------

function Field({ active, icon, value, placeholder }: any) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-300 ${
        active
          ? 'border-orange-500 bg-white shadow-md ring-2 ring-orange-500/10'
          : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <span className={active ? 'text-orange-500' : 'text-slate-400'}>
        {icon}
      </span>

      <span
        className="text-[11px] font-bold flex-1 truncate text-slate-800"
        style={{ fontFamily: font }}
      >
        {value || <span className="text-slate-300">{placeholder}</span>}
      </span>

      {active && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-0.5 h-3 bg-orange-500 rounded-full"
        />
      )}
    </div>
  );
}

// ---------------- MAIN ----------------

export function FastDemoForm({ autoPlay = true }: { autoPlay?: boolean }) {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [q1, setQ1] = useState('');

  useEffect(() => {
    if (!autoPlay) return;

    let alive = true;

    const sleep = (ms: number) =>
      new Promise((res) => setTimeout(res, ms));

    const run = async () => {
      while (alive) {
        // RESET
        setStep(1);
        setPhase('typing');
        setUploadProgress(0);
        setQ1('');

        await sleep(1100);

        setPhase('s1-done');
        await sleep(700);

        setStep(2);
        setPhase('idle');

        await sleep(900);

        setPhase('select');
        await sleep(600);
        setQ1('5–10 yrs');

        await sleep(800);

        setPhase('upload');

        for (let i = 0; i <= 100; i += 4) {
          if (!alive) return;
          setUploadProgress(i);
          await sleep(35);
        }

        setPhase('done');
        await sleep(1200);

        setStep(3);
        await sleep(3500);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [autoPlay]);

  return (
    <div className="relative mx-auto" style={{ width: 290, height: 540 }}>

      {/* PHONE SHELL */}
      <div className="absolute inset-0 bg-slate-950 rounded-[3.5rem] p-[10px] shadow-2xl border border-white/[0.08]">

        {/* Dynamic island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-8 h-1 bg-white/10 rounded-full" />
        </div>

        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">

          <AnimatePresence mode="wait">

            {/* ──────── STEP 1 ──────── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="flex-1 flex flex-col pt-8"
              >
                {/* Header with logo */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src="/images/ridgelinelogo.webp"
                      alt="Company logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p
                      className="text-[12px] font-black text-slate-900"
                      style={{ fontFamily: font }}
                    >
                      Ridge Line Roofing
                    </p>
                    <p
                      className="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-bold"
                      style={{ fontFamily: font }}
                    >
                      Service Request Form
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-3.5 flex-1 flex flex-col">
                  <Field
                    active={phase === 'typing'}
                    icon={<User size={13} />}
                    value="Jason Merritt"
                    placeholder="Full name"
                  />

                  <Field
                    active={false}
                    icon={<Mail size={13} />}
                    value="jason@email.com"
                    placeholder="Email address"
                  />

                  <Field
                    active={false}
                    icon={<Phone size={13} />}
                    value="(555) 234-8891"
                    placeholder="Phone number"
                  />

                  {/* Description */}
                  <div
                    className={`px-3.5 py-2.5 rounded-xl border transition-all ${
                      false
                        ? 'border-orange-500 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1" style={{ fontFamily: font }}>
                      Description
                    </p>
                    <p className="text-[11px] font-bold text-slate-700" style={{ fontFamily: font }}>
                      Storm damage — missing shingles on the north side of the roof.
                    </p>
                  </div>

                  <div className="flex-1" />

                  <SubmitBtn active={phase === 's1-done'} done={phase === 's1-done'}>
                    {phase === 's1-done' ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check size={14} /> Next Step
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </SubmitBtn>
                </div>
              </motion.div>
            )}

            {/* ──────── STEP 2 ──────── */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="flex-1 flex flex-col pt-8"
              >
                {/* Dark step header */}
                <div className="px-5 py-4 bg-slate-900 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    <img
                      src="/images/ridgelinelogo.webp"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p
                      className="text-[8px] text-orange-400 uppercase tracking-[0.2em] font-black"
                      style={{ fontFamily: font }}
                    >
                      Step 2 of 2
                    </p>
                    <p
                      className="text-[13px] text-white font-black"
                      style={{ fontFamily: font }}
                    >
                      Final Details
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-5 flex-1 flex flex-col">

                  {/* Options */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500" style={{ fontFamily: font }}>
                      How old is your roof?
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {['New', '5–10 yrs', '10–20 yrs', 'Unknown'].map((opt) => (
                        <motion.div
                          key={opt}
                          animate={q1 === opt ? { scale: [1, 1.05, 1] } : {}}
                          transition={{ duration: 0.2 }}
                          className={`text-[10px] font-bold text-center py-2.5 rounded-xl border-2 transition-all cursor-default ${
                            q1 === opt
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                          style={{ fontFamily: font }}
                        >
                          {opt}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-500" style={{ fontFamily: font }}>
                      Upload photos
                    </p>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      {uploadProgress > 0 ? (
                        <div className="flex gap-3 items-center">
                          <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                            <img
                              src="/images/roof-damage.webp"
                              className="w-full h-full object-cover"
                              alt="Upload"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-black text-slate-700 truncate" style={{ fontFamily: font }}>
                              roof-damage.jpg
                            </p>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400"
                                animate={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>

                          {uploadProgress === 100 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"
                            >
                              <Check size={11} className="text-white" />
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-300">
                          <ImageIcon size={24} className="mx-auto" />
                          <p className="text-[8px] font-bold mt-1" style={{ fontFamily: font }}>
                            Tap to upload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <SubmitBtn active={phase === 'done'} done={phase === 'done'}>
                    {phase === 'done' ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check size={14} /> Submitted!
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </SubmitBtn>
                </div>
              </motion.div>
            )}

            {/* ──────── SUCCESS ──────── */}
            {step === 3 && (
              <motion.div
                key="done"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center p-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/30"
                >
                  <Check className="text-white" size={32} strokeWidth={3} />
                </motion.div>

                <p
                  className="text-base font-black text-slate-900"
                  style={{ fontFamily: font }}
                >
                  Request Sent!
                </p>
                <p
                  className="text-[11px] text-slate-500 mt-2 font-semibold"
                  style={{ fontFamily: font }}
                >
                  Ridge Line Roofing will contact you shortly.
                </p>

                {/* Logo at bottom of success */}
                <div className="mt-6 flex items-center gap-2 opacity-40">
                  <div className="w-5 h-5 rounded overflow-hidden">
                    <img
                      src="/images/ridgelinelogo.webp"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: font }}>
                    Powered by Lead2Project
                  </span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Home indicator */}
          <div className="h-1 w-16 bg-slate-200 rounded-full mx-auto mb-2" />
        </div>
      </div>
    </div>
  );
}