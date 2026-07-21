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
  Bell,
  Trash2,
  Zap,
} from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const BRAND_NAVY = '#0B3C6D';
const ACCENT = '#0F766E';

function StripeWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`} style={{ color: '#635BFF' }}>
      stripe
    </span>
  );
}

const TEMPLATE_ITEMS = [
  { label: 'Tear-off & Disposal (per sq.)', price: 85 },
  { label: 'Architectural Shingles', price: 165 },
  { label: 'Synthetic Underlayment', price: 88 },
  { label: 'Ice & Water Shield (Rolls)', price: 120 },
  { label: 'Drip Edge (10ft Sections)', price: 18 },
  { label: 'Ridge Vent (4ft Sections)', price: 24 },
];

const PricingTemplateCard = () => (
  <div 
    style={{ fontFamily: font }}
    className="relative w-full min-h-[420px] sm:h-[480px] rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900 shadow-lg overflow-hidden flex flex-col text-left"
  >
    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-white/10 shrink-0">
      <div>
        <div className="flex items-center gap-1.5 text-teal-400 mb-0.5">
          <Zap className="w-3 h-3 fill-teal-400" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Speed Template</span>
        </div>
        <h4 className="text-white font-black text-xs sm:text-sm leading-none">Full Roof Replacement</h4>
      </div>
      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <X className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </div>

    {/* Responsive Fluid Grid Header */}
    <div className="px-3 sm:px-4 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-white/5 shrink-0">
      <span>Item Description</span>
      <span className="text-right min-w-[50px]">Unit Price</span>
      <span className="text-right min-w-[24px]">Qty</span>
      <span className="text-right min-w-[60px]">Total</span>
    </div>

    {/* Scrollable Items Container */}
    <div className="flex-1 overflow-y-auto divide-y divide-white/5">
      {TEMPLATE_ITEMS.map((item) => (
        <div key={item.label} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-3 items-center px-3 sm:px-4 py-2.5 sm:py-3">
          <span className="text-white text-[11px] sm:text-xs font-bold leading-tight truncate">{item.label}</span>
          <span className="text-slate-400 text-[11px] sm:text-xs font-semibold text-right min-w-[50px]">${item.price}</span>
          <span className="text-slate-400 text-[11px] sm:text-xs font-semibold text-right min-w-[24px]">1</span>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-[60px]">
            <span className="text-teal-400 text-[11px] sm:text-xs font-black">${item.price.toFixed(2)}</span>
            <Trash2 className="w-3 h-3 text-slate-600 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const INVOICE_ITEMS = [
  { label: 'Tear-off & Disposal (per sq.)', qty: 25, price: 85, total: 2125 },
  { label: 'Architectural Shingles', qty: 25, price: 165, total: 4125 },
  { label: 'Synthetic Underlayment', qty: 5, price: 88, total: 440 },
  { label: 'Ice & Water Shield (Rolls)', qty: 4, price: 120, total: 480 },
  { label: 'Drip Edge (10ft Sections)', qty: 20, price: 18, total: 360 },
];

const InvoiceCard = ({ onOpen }: { onOpen: () => void }) => (
  <div
    onClick={onOpen}
    style={{ fontFamily: font }}
    className="group relative w-full min-h-[420px] sm:h-[480px] rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-lg cursor-pointer transition-all duration-300 hover:border-slate-300 active:scale-[0.99] overflow-hidden flex flex-col text-left"
  >
    <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-[#0B3C6D] shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white flex items-center justify-center shrink-0 p-1 shadow-xs">
          <img src="/images/ridgelinelogo.webp" alt="Ridge Line Roofing" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-black text-[11px] sm:text-xs leading-tight truncate">RIDGE LINE ROOFING</p>
          <p className="text-teal-200/80 text-[8px] sm:text-[9px] font-semibold truncate">(555) 522-2444</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-black text-xs sm:text-sm leading-none">ESTIMATE</p>
        <p className="text-teal-200/70 text-[8px] sm:text-[9px] font-semibold mt-1">EST-019</p>
      </div>
    </div>

    <div className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between border-b border-slate-100 shrink-0">
      <div>
        <p className="text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Prepared For</p>
        <p className="text-slate-900 text-xs font-black mt-0.5">Jennifer L.</p>
      </div>
      <div className="text-right">
        <p className="text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">Estimated Total</p>
        <p className="text-[#0B3C6D] text-base sm:text-lg font-black mt-0.5">$9,290.00</p>
      </div>
    </div>

    <div className="px-4 sm:px-5 py-1.5 grid grid-cols-[1fr_28px_42px_54px] sm:grid-cols-[1fr_30px_46px_60px] gap-2 text-[8px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 shrink-0">
      <span>Description</span>
      <span className="text-right">Qty</span>
      <span className="text-right">Price</span>
      <span className="text-right">Amount</span>
    </div>

    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
      {INVOICE_ITEMS.map((item) => (
        <div key={item.label} className="grid grid-cols-[1fr_28px_42px_54px] sm:grid-cols-[1fr_30px_46px_60px] gap-2 items-center px-4 sm:px-5 py-2 sm:py-2.5">
          <span className="text-slate-700 text-[10px] sm:text-[11px] font-bold leading-tight truncate">{item.label}</span>
          <span className="text-slate-400 text-[10px] sm:text-[11px] text-right">{item.qty}</span>
          <span className="text-slate-400 text-[10px] sm:text-[11px] text-right">${item.price}</span>
          <span className="text-slate-900 text-[10px] sm:text-[11px] font-bold text-right">${item.total.toLocaleString()}</span>
        </div>
      ))}
      <div className="px-4 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] font-bold text-slate-400">+ 1 more line item</div>
    </div>

    {/* Mobile-Friendly Interactive Overlay & Badge Indicator */}
    <div className="absolute inset-0 bg-slate-950/0 transition-colors duration-300 group-hover:bg-slate-950/5 flex items-center justify-center pointer-events-none">
      <div className="translate-y-0 opacity-90 sm:opacity-0 sm:translate-y-2 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 shadow-xl border border-slate-200/80 transition-all">
        <Maximize2 className="text-teal-700 w-3 h-3 sm:w-3.5 sm:h-3.5" /> Preview Professional Layout
      </div>
    </div>
  </div>
);

const PaidCardInPhone = () => {
  const mockTime = "09:41";

  return (
    <div 
      style={{ fontFamily: font }}
      className="relative mx-auto w-full max-w-[270px] sm:max-w-[300px] h-[420px] sm:h-[480px] rounded-[36px] sm:rounded-[42px] border-[6px] sm:border-[8px] border-slate-900 bg-slate-950 p-1.5 sm:p-2 shadow-2xl ring-1 ring-white/10 overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 sm:h-4 w-16 sm:w-20 bg-black rounded-full z-30 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-slate-900/40 rounded-full ml-auto mr-2" />
      </div>

      <div className="relative flex-1 w-full h-full rounded-[28px] sm:rounded-[34px] bg-slate-50 overflow-hidden flex flex-col justify-between pt-5 sm:pt-6 pb-2.5 sm:pb-3 px-2.5 sm:px-3 select-none">

        <div className="flex justify-between items-center px-2 sm:px-3 py-0.5 text-slate-950 z-20 text-[8px] sm:text-[9px] font-black tracking-tight shrink-0">
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
          className="z-20 mt-1 sm:mt-2"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-md flex items-start gap-2 text-left">
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-900/20">
              <Bell size={11} strokeWidth={2.5} className="animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">Payment Alert</p>
                <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 leading-none">now</p>
              </div>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-900 mt-0.5 sm:mt-1 leading-tight">
                Deposit Received!
              </p>
              <p className="text-[8px] sm:text-[9px] font-bold text-slate-500 leading-relaxed truncate">
                $9,290.00 paid by Jennifer L.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,118,110,0.08),transparent_65%)] pointer-events-none" />

          <span className="mb-2 sm:mb-3 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 sm:px-2.5 py-0.5 shadow-xs">
            <Lock className="text-[#635BFF] w-2 h-2" />
            <span className="text-[7px] sm:text-[7.5px] font-black uppercase tracking-widest text-slate-500">Instant Card</span>
          </span>

          <div className="mb-2 sm:mb-3 text-emerald-600">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 shadow-inner">
                <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.5} />
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
            <p className="text-xl sm:text-3xl font-black leading-none text-slate-900 tracking-tight">$9,290.00</p>

            <p className="mt-1 sm:mt-1.5 inline-flex items-center justify-center gap-1 text-[8px] sm:text-[8.5px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-2.5 h-2.5" /> Deposit Paid
            </p>

            <div className="mt-4 sm:mt-6 flex flex-col items-center gap-0.5">
              <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest">Powered by</span>
              <StripeWordmark className="text-xs sm:text-sm" />
            </div>
          </motion.div>
        </div>

        <div className="w-16 sm:w-20 h-1 bg-slate-900/15 rounded-full mx-auto shrink-0 z-20 mt-0.5" />
      </div>
    </div>
  );
};

const SendInvoicePhone = () => {
  return (
    <div className="relative mx-auto w-full max-w-[270px] sm:max-w-[300px] h-[420px] sm:h-[480px] rounded-[36px] sm:rounded-[42px] border-[6px] sm:border-[8px] border-slate-900 bg-slate-950 p-1.5 sm:p-2 shadow-xl ring-1 ring-white/10 overflow-hidden flex flex-col justify-between">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 sm:h-4 w-16 sm:w-20 bg-black rounded-full z-30 flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-slate-900/40 rounded-full ml-auto mr-2" />
      </div>

      <div className="relative flex-1 w-full h-full rounded-[28px] sm:rounded-[34px] overflow-hidden bg-slate-50">
        <Image 
          src="/images/sendInvoice.webp" 
          alt="Instant Email Estimate Dispatch"
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
    <section 
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-[#fafafa] py-12 sm:py-24 text-left border-t border-slate-200/80"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">

        {/* Value-Driven Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <span 
              className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl text-base sm:text-lg font-black text-white shadow-md shadow-teal-900/20"
              style={{ backgroundColor: ACCENT }}
            >
              5
            </span>
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-teal-700 font-mono">
              Quote-to-Paid Workflow
            </span>
          </div>
          <h2 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Stop spending evenings on estimates.{' '}
            <span className="text-[#0B3C6D] underline underline-offset-4 decoration-teal-500/40">
              Get paid before you leave the driveway.
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base font-bold text-slate-500 max-w-xl mx-auto">
            Turn 3 hours of late-night paperwork into 30 seconds on site. Build estimates fast, email them instantly, and collect deposits on the spot.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 sm:gap-y-16">

          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PricingTemplateCard />
            <div className="mt-4 sm:mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 font-mono block mb-1">
                Step 1: Save Hours of Typing
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1.5 sm:mb-2">
                Build once, quote in seconds
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Save pre-loaded line items for your standard jobs — roofing, siding, tear-offs, or cleanups. Never re-type the same bid twice.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InvoiceCard onOpen={() => setIsModalOpen(true)} />
            <div className="mt-4 sm:mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500 font-mono block mb-1">
                Step 2: Eliminate Math Errors
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1.5 sm:mb-2">
                Zero math errors, instant professional PDFs
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Tweak quantities right from your truck. Lead2Project automatically calculates totals and generates a clean, branded estimate.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center min-h-[420px] sm:h-[480px]">
              <SendInvoicePhone />
            </div>
            <div className="mt-4 sm:mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-teal-700 font-mono block mb-1">
                Step 3: Beat Competitors to the Punch
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1.5 sm:mb-2">
                Win jobs while you're still top of mind
              </h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Deliver branded estimates directly to their email inbox before leaving the property. Homeowners approve faster when they receive quotes on the spot.
              </p>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center min-h-[420px] sm:h-[480px]">
              <PaidCardInPhone />
            </div>
            <div className="mt-4 sm:mt-5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-teal-700 font-mono block mb-1">
                Step 4: End Check-Chasing
              </span>
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1.5 sm:mb-2">
                Collect deposits on the spot
              </h3>
             <p className="text-xs sm:text-sm font-bold text-slate-500 leading-relaxed">
                Accept credit cards with built-in <StripeWordmark className="text-xs sm:text-sm" /> processing, or link your Venmo, Zelle, or PayPal.
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Mobile-Optimized Fullscreen Modal */}
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
              className="relative z-10 flex flex-col md:grid w-full max-w-5xl h-[90vh] sm:h-auto max-h-[90vh] md:max-h-[85vh] overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-100 bg-white shadow-2xl md:grid-cols-12"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3.5 top-3.5 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-900/10 text-slate-600 backdrop-blur-xs transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <div className="flex flex-col justify-center bg-slate-50 p-5 sm:p-8 md:p-12 md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200/60 shrink-0 text-left">
                <div className="mb-2 sm:mb-3.5 inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <Sparkles className="w-4 h-4" />
                </div>

                <h4 className="mb-2 sm:mb-3 text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  Look like a <span className="text-teal-700">$10M contractor</span> on every bid
                </h4>

                <p className="mb-3 sm:mb-4 text-xs sm:text-sm font-bold leading-relaxed text-slate-600">
                  First impressions win jobs. Send polished, custom-branded estimates that build trust before competitors even open their laptop.
                </p>

                <div className="space-y-2 border-t border-slate-200/80 pt-3 sm:pt-4">
                  {[
                    'Auto-attach your logo & company colors',
                    'Itemize materials, labor, and permits cleanly',
                    'One-tap digital approvals delivered via email',
                    'Direct Stripe payment link embedded in every quote'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] sm:text-xs font-bold text-slate-700">
                      <div className="mt-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white">
                        <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-100/70 p-4 sm:p-8 md:col-span-7 flex items-start sm:items-center justify-center min-h-0">
                <div className="w-full max-w-[380px] sm:max-w-[420px] overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md my-auto">
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