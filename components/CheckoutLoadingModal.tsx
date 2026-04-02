'use client';

import { useEffect, useState } from 'react';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';

interface CheckoutLoadingModalProps {
  isOpen: boolean;
  planLabel?: string;
  planPrice?: string;
}

const STEPS = [
  { icon: Lock,        label: 'Securing your session...' },
  { icon: CreditCard,  label: 'Connecting to Stripe...'  },
  { icon: ShieldCheck, label: 'Opening checkout...'      },
];

export default function CheckoutLoadingModal({
  isOpen,
  planLabel = 'Starter',
  planPrice = '$29/month',
}: CheckoutLoadingModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) { setStep(0); return; }
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-6 duration-300">
        {/* Top accent bar */}
        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full" />

        {/* Spinner */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow">
                <CreditCard className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-black text-slate-900 tracking-tight mb-1">
            Preparing your checkout
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {planLabel} Plan · <span className="text-slate-600 font-bold">{planPrice}</span>
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isDone   = step > i;
            const isActive = step === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 ${
                  isDone   ? 'bg-emerald-50' :
                  isActive ? 'bg-indigo-50'  : 'bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isDone   ? 'bg-emerald-500 text-white' :
                  isActive ? 'bg-indigo-600 text-white'  : 'bg-slate-200 text-slate-400'
                }`}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <span className={`text-sm font-bold ${
                  isDone   ? 'text-emerald-700' :
                  isActive ? 'text-indigo-700'  : 'text-slate-400'
                }`}>
                  {s.label}
                </span>

                {isActive && (
                  <div className="ml-auto flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <div
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                        style={{ animationDelay: `${dot * 150}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Lock className="w-3 h-3" />
          <span className="text-[11px] font-bold uppercase tracking-widest">256-bit SSL · Powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}