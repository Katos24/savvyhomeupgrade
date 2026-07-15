'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Lock, 
  ShieldCheck,
  X,
  Maximize2,
  Sparkles,
  Wifi,
  Battery,
  Bell
} from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

function StripeWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`} style={{ color: '#635BFF' }}>
      stripe
    </span>
  );
}

// ==========================================
// Tighter, Custom-Height iPhone Frame (Payment Success) — unchanged
// ==========================================
const PaidCardInPhone = () => {
  const mockTime = "09:41";

  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px] h-[440px] sm:h-[480px] rounded-[42px] border-[8px] border-slate-900 bg-slate-950 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">

      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-black rounded-full z-30 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-slate-900/40 rounded-full ml-auto mr-2" />
      </div>

      <div className="relative flex-1 w-full h-full rounded-[34px] bg-slate-50 overflow-hidden flex flex-col justify-between pt-6 pb-3 px-3 select-none">

        <div className="flex justify-between items-center px-3 py-0.5 text-slate-950 z-20 text-[9px] font-black tracking-tight shrink-0">
          <span>{mockTime}</span>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-extrabold uppercase">5G</span>
            <Wifi size={9} strokeWidth={2.5} />
            <Battery size={11} className="ml-0.5" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', delay: 0.8, stiffness: 100 }}
          className="z-20 mt-2 mx-0.5"
        >
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 shadow-[0_8px_16px_rgba(0,0,0,0.06)] flex items-start gap-2.5 text-left">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Bell size={12} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Notification</p>
                <p className="text-[8px] font-bold text-slate-400 leading-none">now</p>
              </div>
              <p className="text-[10px] font-black text-slate-900 mt-1 leading-tight">
                Kevin Smith Paid
              </p>
              <p className="text-[9px] font-bold text-slate-500 leading-relaxed truncate">
                $9,121.00 via Ridge Line Roofing
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_65%)] pointer-events-none" />

          <span className="mb-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 shadow-sm">
            <Lock className="text-[#635BFF] w-2 h-2" />
            <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-500">Secure Stripe Checkout</span>
          </span>

          <div className="mb-3 text-emerald-600">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="z-10"
          >
            <p className="text-2xl sm:text-3xl font-black leading-none text-slate-900 tracking-tight">$9,121.00</p>

            <p className="mt-1.5 inline-flex items-center justify-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50/70 border border-emerald-100/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" /> Paid & Logged
            </p>

            <div className="mt-6 flex flex-col items-center gap-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Processed securely via</span>
              <StripeWordmark className="text-sm" />
            </div>
          </motion.div>
        </div>

        <div className="w-20 h-1 bg-slate-900/15 rounded-full mx-auto shrink-0 z-20 mt-1" />
      </div>
    </div>
  );
};

// ==========================================
// Send Invoice iPhone Frame — unchanged
// ==========================================
const SendInvoicePhone = () => {
  return (
    <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[300px] h-[440px] sm:h-[480px] rounded-[42px] border-[8px] border-slate-900 bg-slate-950 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">

      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 h-4 w-20 bg-black rounded-full z-30 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-slate-900/40 rounded-full ml-auto mr-2" />
      </div>

      <div className="relative flex-1 w-full h-full rounded-[34px] overflow-hidden bg-slate-50">
        <Image 
          src="/images/sendInvoice.webp" 
          alt="Resend Invoice Action Window"
          fill
          className="object-cover object-top"
          priority
        />
      </div>
    </div>
  );
};

export default function QuoteToPaidWorkflow() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#fafafa] py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">

        {/* Header Block */}
        <div className="text-center mb-14 sm:mb-16">
          <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-emerald-600 font-mono block mb-2">
            Automated Workflow
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto" style={{ fontFamily: font }}>
            From saved templates to <span className="text-emerald-600">secure payment</span>, automatically
          </h2>
        </div>

        {/* 2x2 STEP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-12 sm:gap-y-16">

          {/* STEP 1: Set up templates ahead of time */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg h-[300px] sm:h-[360px]">
              <Image 
                src="/images/quote-template.webp" 
                alt="Reusable pricing template with saved line items"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 font-mono block mb-1.5">
                Step 1: Reusable Templates
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2" style={{ fontFamily: font }}>
                Set up pricing templates ahead of time
              </h3>
              <p className="text-sm font-bold text-slate-500">
                Build out your common jobs once — tear-off, shingles, permits, whatever you quote often — and reuse them any time.
              </p>
            </div>
          </motion.div>

          {/* STEP 2: Adjust quantities, generate PDF */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div 
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg cursor-pointer transition-all duration-300 hover:border-slate-300 h-[300px] sm:h-[360px]"
            >
              <Image 
                src="/images/invoice_full.webp" 
                alt="Professional invoice PDF with adjustable line items"
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/5 flex items-center justify-center">
                <div className="translate-y-2 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 shadow-xl transition-all">
                  <Maximize2 className="text-emerald-600 w-3.5 h-3.5" /> Preview Branding
                </div>
              </div>
            </div>
            <div className="mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 font-mono block mb-1.5">
                Step 2: Adjust & Generate
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2" style={{ fontFamily: font }}>
                Adjust quantities, generate the PDF
              </h3>
              <p className="text-sm font-bold text-slate-500">
                Tweak line items and quantities for this specific job, then generate a clean, branded PDF in one click.
              </p>
            </div>
          </motion.div>

          {/* STEP 3: Send to customer */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center h-[300px] sm:h-[360px]">
              <SendInvoicePhone />
            </div>
            <div className="mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-blue-500 font-mono block mb-1.5">
                Step 3: Send To Customer
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2" style={{ fontFamily: font }}>
                Straight to their phone, instantly
              </h3>
              <p className="text-sm font-bold text-slate-500">
                Deliver via email, text, or a shareable link — they can view and approve from anywhere.
              </p>
            </div>
          </motion.div>

          {/* STEP 4: Paid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center h-[300px] sm:h-[360px]">
              <PaidCardInPhone />
            </div>
            <div className="mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-600 font-mono block mb-1.5">
                Step 4: Integrated Payouts
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-2" style={{ fontFamily: font }}>
                Get paid without chasing
              </h3>
              <p className="text-sm font-bold text-slate-500">
                Connect securely with <StripeWordmark className="text-sm" /> to accept instant ACH or card payments, tracked in real-time.
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* BRANDING PREVIEW OVERLAY MODAL — unchanged, now triggered from Step 2 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 flex flex-col md:grid w-full max-w-5xl h-[88vh] sm:h-auto max-h-[88vh] md:max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-100 bg-white shadow-2xl md:grid-cols-12"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/10 text-slate-600 backdrop-blur-xs transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <div className="flex flex-col justify-center bg-slate-50 p-6 sm:p-10 md:p-12 md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200/60 shrink-0 text-left">
                <div className="mb-3.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>

                <h4 className="mb-3 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight" style={{ fontFamily: font }}>
                  Invoices tailored to <span className="text-emerald-600">your business identity</span>
                </h4>

                <p className="mb-4 text-xs sm:text-sm font-bold leading-relaxed text-slate-600">
                  Deliver exceptional professionalism. Estimates and payment files scale as interactive, optimized digital templates formatted dynamically with your business logos.
                </p>

                <div className="space-y-2.5 border-t border-slate-200/80 pt-4">
                  {[
                    'Instantly append customized asset branding packages',
                    'Match signature color profiles cleanly across panels',
                    'Dynamic computing for broken-out project line items',
                    'Embedded secure processing gateways handle direct processing'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-8 md:col-span-7 flex items-start sm:items-center justify-center min-h-0">
                <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md my-auto">
                  <div className="relative w-full aspect-[800/880] overflow-hidden">
                    <Image 
                      src="/images/invoice_full.webp" 
                      alt="Branded Invoice Preview"
                      width={800}
                      height={1040}
                      className="w-full h-auto object-cover object-top"
                      priority
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}