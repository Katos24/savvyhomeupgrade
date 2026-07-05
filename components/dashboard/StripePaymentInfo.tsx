'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X, Mail, FileText, MousePointerClick, AlertCircle } from 'lucide-react';

export default function StripePaymentInfo({ accountStatus }: { accountStatus: 'active' | 'restricted' | 'pending' | null }) {
    const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isPending = accountStatus === 'pending';
  const needsAttention = accountStatus === 'restricted';

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold underline decoration-dotted underline-offset-2">
          How does this work?
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-[1.5rem] shadow-xl p-5 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-slate-900">Where the payment link shows up</p>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-300 hover:text-slate-500 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

           {needsAttention && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-800 font-medium leading-relaxed">
                  Your Stripe account needs more information before payment links will work — check the details above.
                </p>
              </div>
            )}
            {isPending && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Finish setup on Stripe first — payment links won't work for customers until your account is fully active.
                </p>
              </div>
            )}

            <ul className="space-y-3">
  <li className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
      <Mail className="w-3.5 h-3.5 text-indigo-600" />
    </div>
    <p className="text-xs text-slate-600 font-medium leading-relaxed">
      When you click <span className="font-black text-slate-900">Send</span> on an invoice, the email includes a Stripe payment link automatically.
    </p>
  </li>
  <li className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
      <FileText className="w-3.5 h-3.5 text-indigo-600" />
    </div>
    <p className="text-xs text-slate-600 font-medium leading-relaxed">
      The attached invoice PDF also includes the same payment link, so customers can pay even if they only have the file.
    </p>
  </li>
  <li className="flex items-start gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
      <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
    </div>
    <p className="text-xs text-slate-600 font-medium leading-relaxed">
      Customers click the link, pay by card, and the payment status updates on your dashboard — no extra steps for you.
    </p>
  </li>
</ul>

            <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                {needsAttention
                  ? 'Resolve the items above on Stripe, then this works automatically.'
                  : isPending
                  ? 'Once Stripe shows your account is fully set up, this works automatically — nothing else to configure.'
                  : 'Nothing to set up beyond connecting Stripe — this works automatically.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}