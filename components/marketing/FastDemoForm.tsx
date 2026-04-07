'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, Image as ImageIcon } from 'lucide-react';

export function FastDemoForm({ autoPlay = false }: { autoPlay?: boolean }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Optional auto demo mode (for hero)
  useEffect(() => {
    if (!autoPlay) return;

    const t1 = setTimeout(() => setStep(2), 1500);
    const t2 = setTimeout(() => setSubmitted(true), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [autoPlay]);

  return (
    <div className="relative w-[260px] aspect-[9/19.5]">
      
      {/* Glow */}
      <div className="absolute inset-0 blur-2xl bg-blue-500/10 rounded-[3rem]" />

      {/* Phone shell */}
      <div className="relative w-full h-full rounded-[3rem] border-[6px] border-[#1e293b] bg-[#0f172a] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">

        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-end z-20">
          <div className="w-24 h-5 bg-black rounded-b-2xl" />
        </div>

        {/* Screen */}
        <div className="absolute inset-0 pt-6 bg-white flex flex-col">

          {/* Header */}
          <div className="px-4 pt-2 pb-1">
            <h2 className="text-xs font-bold text-slate-500">New Request</h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

            {!submitted && step === 1 && (
              <>
                <div className="p-3 bg-slate-100 rounded-xl text-sm">
                  Curtis Wilson
                </div>

                <div className="p-3 bg-blue-100 rounded-xl text-sm">
                  Roofing Category
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl flex justify-center items-center gap-2 text-sm font-semibold"
                >
                  Next Step <ChevronRight size={14} />
                </button>
              </>
            )}

            {!submitted && step === 2 && (
              <>
                <div className="p-3 bg-slate-100 rounded-xl text-sm">
                  42 Maple Ave, NY
                </div>

                <div className="border-2 border-dashed rounded-xl py-6 flex flex-col items-center text-slate-500 text-xs">
                  <ImageIcon size={18} />
                  <span className="mt-1">Photo Attached</span>
                </div>

                <button
                  onClick={() => setSubmitted(true)}
                  className="w-full py-3 bg-emerald-500 text-white rounded-xl flex justify-center items-center gap-2 text-sm font-semibold"
                >
                  <Check size={14} /> Submit
                </button>
              </>
            )}

            {submitted && (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <Check className="text-emerald-500 mb-2" />
                <p className="text-sm font-semibold">Submitted</p>
              </div>
            )}
          </div>
        </div>

        {/* Home bar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}