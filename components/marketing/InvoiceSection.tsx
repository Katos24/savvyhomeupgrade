'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const SCREENS = [
  { id: 'send', label: 'Send it' },
  { id: 'pdf', label: 'The invoice' },
  { id: 'paid', label: 'Got paid' },
] as const;

const POINTS = [
  { title: 'Real PDFs', detail: 'Generated automatically' },
  { title: 'Stripe or manual', detail: 'Card, Venmo, Zelle, Cash App' },
  { title: 'Tracked for you', detail: 'Dashboard updates itself' },
];

function SendScreen() {
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
      {/* Replace with a real screenshot of the Payment tab / send action */}
      <Image
        src="/images/invoice_send.webp"
        alt="Payment tab showing the Send PDF and Download PDF actions"
        width={640}
        height={830}
        className="w-full object-cover"
      />
    </div>
  );
}

function PdfScreen() {
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
      {/* Replace with a real screenshot of a generated invoice */}
      <Image
        src="/images/invoice_full.webp"
        alt="Sample invoice with line items, total due, and a Pay Now button"
        width={640}
        height={830}
        className="w-full object-cover"
      />
    </div>
  );
}

function PaidScreen() {
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-white/10 bg-white p-10 text-center shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
      <CheckCircle2 size={36} className="mx-auto mb-4 text-emerald-600" />
      <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Just now</p>
      <p className="text-3xl font-black leading-tight text-slate-900">You got paid $505.00</p>
      <p className="mt-2 text-[12px] font-bold uppercase tracking-wide text-emerald-600">Tracked automatically</p>
    </div>
  );
}

export default function InvoiceSection() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setStep((s) => (s + 1) % SCREENS.length), 3500);
    return () => clearInterval(t);
  }, [paused]);

  const advance = () => {
    setStep((s) => (s + 1) % SCREENS.length);
    setPaused(true);
  };

  return (
    <section className="relative overflow-hidden bg-slate-800 py-16 sm:py-24 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center lg:mb-14"
        >
          <p
            className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 sm:text-xs"
            style={{ fontFamily: font }}
          >
            Get paid
          </p>
          <h2
            className="mx-auto max-w-2xl text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: font }}
          >
            Send the invoice. <span className="text-emerald-500">Get paid.</span> Done.
          </h2>

          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3">
            {POINTS.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left">
                <p className="text-[11px] font-black text-white">{p.title}</p>
                <p className="text-[10px] font-bold text-slate-500">{p.detail}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive loop — full width, centered, no side image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          <button
            type="button"
            onClick={advance}
            className="w-full max-w-[420px] cursor-pointer"
            style={{ perspective: '1600px' }}
            aria-label="Show next screen"
          >
            <div style={{ transformStyle: 'preserve-3d' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={SCREENS[step].id}
                  initial={{ opacity: 0, rotateY: 35, scale: 0.94 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -35, scale: 0.94 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 0 && <SendScreen />}
                  {step === 1 && <PdfScreen />}
                  {step === 2 && <PaidScreen />}
                </motion.div>
              </AnimatePresence>
            </div>
          </button>

          <div className="mt-6 flex items-center gap-2">
            {SCREENS.map((s, i) => (
              <button
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setStep(i);
                  setPaused(true);
                }}
                aria-label={s.label}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-500"
          >
            Get started free <ArrowRight size={16} />
          </Link>

          <Link
            href="/features/payments"
            className="mt-4 text-[12px] font-bold text-slate-400 underline transition-colors hover:text-white"
          >
            See everything payments can do
          </Link>
        </motion.div>
      </div>
    </section>
  );
}