'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  Lock, 
  Settings, 
  Zap, 
  FileText,
  CreditCard,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Maximize2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
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
  <div className="relative flex h-[440px] w-full max-w-[400px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)]" />

    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-3 py-1.5 shadow-sm">
      <Lock size={12} className="text-emerald-600" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure</span>
    </span>
    
    <div className="relative z-10 mb-6 text-emerald-600">
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 size={56} strokeWidth={2.5} />
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
      <p className="text-5xl font-black leading-tight text-slate-900">$9,121.00</p>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
        <ShieldCheck size={16} /> Paid & Tracked
      </p>
      
      <div className="mt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
        Powered by <StripeWordmark className="text-base" />
      </div>
    </motion.div>
  </div>
);

export default function QuoteToPaidWorkflow() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 lg:py-32">
      {/* Subtle light grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* SECTION HEADER */}
        <div className="mb-20 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-emerald-600"
            style={{ fontFamily: font }}
          >
            The Complete Cycle
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
            style={{ fontFamily: font }}
          >
            From template to <span className="text-emerald-600">paid in full.</span>
          </motion.h2>
        </div>

        {/* TOP ROW: Quote Builder */}
        <div className="mb-24 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 flex flex-col justify-center"
          >
            <h3 className="mb-6 text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: font }}>
              Build pricing templates <br className="hidden sm:block" />
              <span className="text-slate-500">ahead of time.</span>
            </h3>
            <p className="mb-8 text-lg font-bold leading-relaxed text-slate-600">
              Stop typing out the same lines over and over. Create standard templates for your most common projects, load them into a new estimate instantly, and easily adapt the details to match the job.
            </p>
            
            <ul className="mb-10 space-y-5">
              {[
                { icon: Settings, text: 'Pre-configure your standard items, labor rates, and base costs.' },
                { icon: Zap, text: 'Instantly populate your line items with a single tap.' },
                { icon: SlidersHorizontal, text: 'Adjust quantities up or down on the fly to fit the project scale.' },
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-700">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm">
                    <point.icon size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-base font-bold">{point.text}</span>
                </li>
              ))}
            </ul>

            <div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition-all hover:bg-emerald-500 shadow-md hover:shadow-emerald-600/10"
              >
                Create a Template <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_70px_rgba(0,0,0,0.08)]">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="ml-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Editor</div>
              </div>
              <Image 
                src="/images/quote-template.webp" 
                alt="Pricing Template Setup"
                width={800}
                height={800}
                className="w-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* TRANSITION DOWN ARROW */}
        <div className="flex justify-center pb-24">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm"
          >
            <ArrowDown size={28} />
          </motion.div>
        </div>

        {/* BOTTOM SECTION: Invoice -> Paid */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black text-slate-900 sm:text-4xl" style={{ fontFamily: font }}>
            Tweak quantities. Send invoice. <span className="text-emerald-600">Get paid.</span>
          </h3>
          <p className="mt-4 text-lg font-bold text-slate-500 max-w-2xl mx-auto">
            Once your template is loaded, adjust any quantity or price to perfectly mirror the real-world scope, click send, and watch the automated payment clear.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          
          {/* Larger Invoice Image Wrapper (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-[460px]"
          >
            <div 
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-300 hover:shadow-[0_40px_80px_rgba(0,0,0,0.12)] hover:border-slate-300"
            >
              <Image 
                src="/images/invoice_full.webp" 
                alt="Professional Invoice PDF"
                width={900}
                height={1170}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              />
              
              {/* Interactive Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/5 flex items-center justify-center">
                <div className="translate-y-4 opacity-0 scale-95 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-900 shadow-xl">
                  <Maximize2 size={14} className="text-emerald-600" /> Preview Branding
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
              <FileText size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Click to view branding options</span>
            </div>
          </motion.div>

          {/* Right/Down Connector Arrow (Middle) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center py-6 lg:py-0"
          >
            <div className="hidden lg:flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowRight size={32} strokeWidth={2.5} />
            </div>
            <div className="flex lg:hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowDown size={28} strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Paid Confirmation Card (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-[400px]"
          >
            <PaidCard />
            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
              <CreditCard size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Instant Cards & ACH Sync</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* BRANDING PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Modal Content Window */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl md:grid-cols-[42%_58%]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              {/* LEFT COLUMN: Info & Selling Points */}
              <div className="flex flex-col justify-center bg-slate-50 p-8 sm:p-10 md:p-12">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Sparkles size={18} />
                </div>
                
                <h4 className="mb-4 text-3xl font-black tracking-tight text-slate-900" style={{ fontFamily: font }}>
                  Hey, create invoices with <span className="text-emerald-600">your branding</span> and your logo!
                </h4>
                
                <p className="mb-6 text-base font-bold leading-relaxed text-slate-600">
                  Make every dollar look professional. Your estimates and invoices are fully responsive web pages customized with your exact business identity.
                </p>

                <div className="space-y-4 border-t border-slate-200 pt-6">
                  {[
                    'Upload your custom business logo instantly',
                    'Match header styles with your brand color scheme',
                    'Display customized itemized payment totals dynamically',
                    'Integrated scannable QR codes sync back directly to your dashboard'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Zoomed Top 3/4 Image Preview */}
              <div className="max-h-[60vh] overflow-y-auto bg-slate-200/40 p-6 md:max-h-none md:p-12 flex items-center justify-center">
                <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  {/* Aspect ratio math: Base width 800px. 75% of 1040px height is 780px. Aspect-[800/780] perfectly hides the bottom quarter */}
                  <div className="relative w-full aspect-[800/780] overflow-hidden">
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