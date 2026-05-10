'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronRight, Image as ImageIcon,
  User, Mail, Phone, AlignLeft, Upload,
  MapPin,
} from 'lucide-react';

// --- Components ---

function OrangeBtn({ children, done, active }: { children: React.ReactNode; done?: boolean; active?: boolean }) {
  return (
    <motion.button
      animate={{ scale: active ? 0.96 : 1 }}
      className="w-full py-2.5 rounded-2xl text-[11px] font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all duration-500"
      style={{ 
        background: done 
          ? 'linear-gradient(135deg,#10b981,#059669)' 
          : 'linear-gradient(135deg,#f97316 0%,#ea580c 50%,#c2410c 100%)' 
      }}
    >
      {children}
    </motion.button>
  );
}

function Field({ active, icon, value, placeholder }: {
  active: boolean; icon: React.ReactNode; value: string; placeholder: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border transition-all duration-300 ${
      active ? 'border-orange-500 bg-white shadow-md ring-4 ring-orange-500/10' : 'border-slate-200 bg-slate-50/50'
    }`}>
      <span className={active ? 'text-orange-500' : 'text-slate-400'}>{icon}</span>
      <span className="text-[10px] font-bold text-slate-800 flex-1 truncate">
        {value || <span className="text-slate-300 font-medium">{placeholder}</span>}
        {active && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-0.5 h-3 bg-orange-500 ml-0.5 align-middle" />}
      </span>
    </div>
  );
}

// --- Main Demo ---

export function FastDemoForm({ autoPlay = true, showSuccess = true }) {
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [q1, setQ1] = useState('');

  useEffect(() => {
    if (!autoPlay) return;
    let timer: NodeJS.Timeout;

    const sequence = async () => {
      // Step 1: Entry
      setStep(1); setPhase('typing');
      await new Promise(r => timer = setTimeout(r, 1200));
      
      // Step 1: Submit
      setPhase('s1-done');
      await new Promise(r => timer = setTimeout(r, 800));
      
      // Step 2: Transition
      setStep(2); setPhase('idle');
      await new Promise(r => timer = setTimeout(r, 1000));
      
      // Step 2: Select Option
      setPhase('tapping-pill');
      await new Promise(r => timer = setTimeout(r, 600));
      setQ1('5–10 yrs');
      
      // Step 2: Photo Upload
      await new Promise(r => timer = setTimeout(r, 800));
      setPhase('uploading');
      for (let i = 0; i <= 100; i += 5) {
        setUploadProgress(i);
        await new Promise(r => timer = setTimeout(r, 50));
      }
      setPhase('s2-done');
      
      // Success
      await new Promise(r => timer = setTimeout(r, 1000));
      if (showSuccess) setStep(3);
      
      await new Promise(r => timer = setTimeout(r, 4000));
      setQ1(''); setUploadProgress(0); sequence();
    };

    sequence();
    return () => clearTimeout(timer);
  }, [autoPlay, showSuccess]);

  return (
    <div className="relative group" style={{ width: 280, height: 500 }}>
      {/* Phone Shell */}
      <div className="absolute inset-0 bg-slate-950 rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-t border-white/10">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-10 h-1 bg-white/10 rounded-full" />
        </div>

        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1 flex flex-col pt-8"
              >
                <header className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-orange-500/20 shadow-lg">
                    <img src="/images/ridgelinelogo.webp" className="w-5 h-5 object-contain invert brightness-0" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900 leading-none">Ridge Line</h3>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Roofing Specialists</p>
                  </div>
                </header>

                <div className="flex-1 p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Details</p>
                    <Field active={phase === 'typing'} icon={<User size={12}/>} value="Jason Merritt" placeholder="Name" />
                    <Field active={false} icon={<Mail size={12}/>} value="jasonm@email.com" placeholder="Email" />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest px-1">Project</p>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-h-[60px]">
                      <p className="text-[10px] font-bold text-slate-800 leading-relaxed">Storm damage, need an inspection ASAP.</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <OrangeBtn active={phase === 's1-done'} done={phase === 's1-done'}>
                      {phase === 's1-done' ? <Check size={14} strokeWidth={3}/> : 'Continue'}
                    </OrangeBtn>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex-1 flex flex-col pt-8"
              >
                <div className="px-5 py-4 bg-slate-900 text-white">
                  <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em]">Step 02</p>
                  <h3 className="text-sm font-black mt-1">Final Details</h3>
                </div>

                <div className="flex-1 p-5 space-y-5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-800">How old is your roof?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['New', '5–10 yrs', '10–20 yrs', 'Unknown'].map(opt => (
                        <motion.div
                          key={opt}
                          animate={{ 
                            scale: phase === 'tapping-pill' && opt === '5–10 yrs' ? 0.95 : 1,
                            backgroundColor: q1 === opt ? '#f97316' : '#fff',
                            borderColor: q1 === opt ? '#f97316' : '#e2e8f0',
                            color: q1 === opt ? '#fff' : '#475569'
                          }}
                          className="py-2 px-3 rounded-xl border text-[9px] font-bold text-center transition-colors"
                        >
                          {opt}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-800">Upload Photos</p>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center">
                      {uploadProgress > 0 ? (
                        <div className="w-full space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                               <img src="/images/roof-damage.webp" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[8px] font-black text-slate-800 truncate">damage_01.jpg</p>
                              <div className="h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <motion.div 
                                  className="h-full bg-orange-500" 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${uploadProgress}%` }} 
                                />
                              </div>
                            </div>
                            {uploadProgress === 100 && <Check size={12} className="text-emerald-500" />}
                          </div>
                        </div>
                      ) : (
                        <ImageIcon className="text-slate-300 mb-1" size={24} />
                      )}
                    </div>
                  </div>

                  <OrangeBtn active={phase === 's2-done'} done={phase === 's2-done'}>
                    {phase === 's2-done' ? 'Submitted' : 'Submit Request'}
                  </OrangeBtn>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-4"
                >
                  <Check size={32} className="text-white" strokeWidth={4} />
                </motion.div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">Got it, Jason!</h2>
                <p className="text-[10px] font-medium text-slate-500 mt-2">Our team is reviewing your roof photos and will text you shortly.</p>
                
                <div className="mt-8 w-full space-y-2">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <Mail size={14} className="text-orange-500" />
                    <p className="text-[9px] font-bold text-slate-700">Email Confirmation Sent</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Home Bar */}
          <div className="h-1.5 w-20 bg-slate-200 rounded-full mx-auto mb-2 shrink-0" />
        </div>
      </div>
    </div>
  );
}