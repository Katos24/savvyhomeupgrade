'use client';

import { useEffect, useState } from 'react';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';

interface CheckoutLoadingModalProps {
  isOpen: boolean;
  planLabel?: string;
  planPrice?: string;
}

const STEPS = [
  { icon: Lock, label: 'Securing your session…' },
  { icon: CreditCard, label: 'Connecting to Stripe…' },
  { icon: ShieldCheck, label: 'Opening checkout…' },
];

export default function CheckoutLoadingModal({
  isOpen,
  planLabel = 'Pro',
  planPrice = '$49.99/month',
}: CheckoutLoadingModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1C1F23]/70 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Card */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
        <div className="h-1.5 bg-[#00828A]" />

        <div className="p-7">
          {/* Spinner */}
          <div className="flex justify-center mb-5">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-[#00828A]/15" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#00828A] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#00828A]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-[#1C1F23]">Preparing your checkout</h2>
            <p className="mt-1 text-sm text-slate-500">
              {planLabel} plan · <span className="font-semibold text-slate-700">{planPrice}</span>
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2.5 mb-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = step > i;
              const isActive = step === i;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-md px-3.5 py-2.5 transition-colors duration-300 ${
                    isDone ? 'bg-emerald-50' : isActive ? 'bg-[#00828A]/[0.08]' : 'bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-[#00828A] text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <span
                    className={`text-sm font-semibold ${
                      isDone ? 'text-emerald-700' : isActive ? 'text-[#006e75]' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>

                  {isActive && (
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          className="w-1.5 h-1.5 rounded-full bg-[#00828A]/60 animate-bounce"
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
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Secure checkout by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
}