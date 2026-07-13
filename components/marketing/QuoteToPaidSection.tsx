'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  FileText,
  CreditCard,
  ShieldCheck,
  X,
  Maximize2,
  Sparkles
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

const PaidCard = () => (
  <div className="relative flex h-[380px] sm:h-[440px] w-full max-w-[400px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 shadow-sm">
      <Lock className="text-emerald-600 w-3 h-3" />
      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Secure</span>
    </span>
    
    <div className="relative z-10 mb-5 sm:mb-6 text-emerald-600">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      >
        <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14" strokeWidth={2.5} />
        </div>
      </motion.div>
    </div>
    
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="relative z-10"
    >
      <p className="text-4xl sm:text-5xl font-black leading-tight text-slate-900">$9,121.00</p>
      <p className="mt-2.5 sm:mt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-widest text-emerald-600">
        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Paid & Tracked
      </p>
      
      <div className="mt-8 sm:mt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        Powered by <StripeWordmark className="text-base" />
      </div>
    </motion.div>
  </div>
);

export default function QuoteToPaidWorkflow() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 sm:gap-12">
          
          {/* Invoice Column (Left) */}
          <div className="w-full max-w-[440px] flex flex-col">
            <div className="mb-5 text-left">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 font-mono block mb-1">
                Professional Invoicing
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]" style={{ fontFamily: font }}>
                Generate professional invoices with <span className="text-emerald-600">your business branding.</span>
              </h2>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div 
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg cursor-pointer transition-all duration-300 hover:border-slate-300"
              >
                <Image 
                  src="/images/invoice_full.webp" 
                  alt="Professional Invoice PDF with lead2project branding"
                  width={900}
                  height={1170}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                />
                
                <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/5 flex items-center justify-center">
                  <div className="translate-y-2 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 shadow-xl transition-all">
                    <Maximize2 className="text-emerald-600 w-3.5 h-3.5" /> Preview Branding
                  </div>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-start gap-2 text-slate-400 px-1">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Tap to view branding choices</span>
              </div>
            </motion.div>
          </div>

          {/* Connector Arrow (Middle) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center self-center py-4 lg:py-0 lg:mt-28"
          >
            <div className="flex h-11 w-11 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
              <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 rotate-90 lg:rotate-0" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Paid Confirmation Column (Right) */}
          <div className="w-full max-w-[400px] flex flex-col">
            <div className="mb-5 text-left">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-600 font-mono block mb-1">
                Integrated Payouts
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.2]" style={{ fontFamily: font }}>
                Connect with <StripeWordmark className="text-2xl sm:text-4xl" /> to track payments and <span className="text-emerald-600">get paid faster.</span>
              </h3>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <PaidCard />
              <div className="mt-3.5 flex items-center justify-start gap-2 text-slate-400 px-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Instant Cards & ACH Sync</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* BRANDING PREVIEW OVERLAY MODAL */}
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