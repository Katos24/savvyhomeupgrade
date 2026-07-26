'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Trash2, Download, Paperclip, Mail, Sparkles, FileText, Send, Database } from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

function StripeWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`} style={{ color: '#635BFF' }}>
      stripe
    </span>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

const TEMPLATE_ITEMS = [
  { label: 'Tear-off & Disposal (per sq.)', price: 85 },
  { label: 'Architectural Shingles', price: 165 },
  { label: 'Synthetic Underlayment', price: 88 },
  { label: 'Ice & Water Shield (Rolls)', price: 120 },
  { label: 'Drip Edge (10ft Sections)', price: 18 },
];

/* ── Section Block Container ─────────────────────────────────────────────── */

function FeatureBlock({
  badgeIcon,
  badgeText,
  title,
  subtitle,
  children,
}: {
  badgeIcon?: React.ReactNode;
  badgeText: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55 }}
      className="border-t border-white/10 pt-14 sm:pt-16 first:border-t-0 first:pt-0"
    >
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-white/10 px-3.5 py-1.5 rounded-full mb-3.5 shadow-sm">
          {badgeIcon}
          <span className="text-xs font-black uppercase tracking-widest text-teal-300">
            {badgeText}
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3">
          {title}
        </h3>
        <p className="text-slate-300 font-semibold text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl">
        {children}
      </div>
    </motion.div>
  );
}

/* ── Visual Sub-Components ────────────────────────────────────────────────── */

const QuoteCollage = () => (
  <div className="relative w-full py-4">
    <div className="relative ml-auto w-[78%] sm:w-[68%] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white">
      <Image
        src="/images/invoice_full.webp"
        alt="A finished branded estimate ready to send"
        width={800}
        height={1040}
        className="w-full h-auto object-cover object-top"
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/70 to-transparent pointer-events-none" />
    </div>

    <div className="absolute left-0 bottom-2 sm:bottom-6 w-[62%] sm:w-[54%] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden -rotate-2">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-teal-400">
          <Zap className="w-3 h-3 fill-teal-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Saved template</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {TEMPLATE_ITEMS.slice(0, 4).map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-white text-[10px] font-bold truncate flex-1">{item.label}</span>
            <span className="text-teal-400 text-[10px] font-black shrink-0">${item.price}</span>
            <Trash2 className="w-2.5 h-2.5 text-slate-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const OutboxStrip = () => {
  const rows = [
    { t: 'Estimate EST-019 sent', to: 'jennifer@example.com', time: '9:14a' },
    { t: 'Appointment confirmed', to: 'jennifer@example.com', time: '9:15a' },
    { t: 'Payment reminder', to: 'marcus@example.com', time: '2:02p' },
    { t: 'Review request', to: 'dana@example.com', time: '4:48p' },
  ];
  return (
    <div className="w-full rounded-2xl border border-white/10 overflow-hidden bg-slate-950/70 shadow-xl">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-slate-900/90">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outbox History</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-teal-300">Today</span>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((r) => (
          <div key={r.t} className="flex items-center gap-3 px-4 sm:px-5 py-3">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-teal-300" strokeWidth={4} />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white flex-1 truncate">{r.t}</span>
            <span className="hidden sm:block text-[11px] font-medium text-slate-400 truncate max-w-[160px]">
              {r.to}
            </span>
            <span className="text-[11px] font-bold text-slate-500 shrink-0">{r.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExportStrip = () => {
  const cols = ['Customer', 'Job', 'Status', 'Total'];
  return (
    <div className="w-full space-y-4">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/70 shadow-xl">
        <div className="grid grid-cols-4 bg-slate-900/90 px-4 sm:px-5 py-2.5 gap-4 border-b border-white/5">
          {cols.map((c) => (
            <span key={c} className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
              {c}
            </span>
          ))}
        </div>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="grid grid-cols-4 px-4 sm:px-5 py-3 gap-4 border-t border-white/5 first:border-t-0">
            {cols.map((c, ci) => (
              <span
                key={c}
                className={`h-2 rounded-full ${r === 0 ? 'bg-slate-400' : 'bg-slate-600'}`}
                style={{ width: `${55 + ((r + ci) % 4) * 12}%` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2 text-[11px] font-black text-slate-200 shadow-md">
          <Download className="w-3.5 h-3.5 text-teal-400" /> Export CSV
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2 text-[11px] font-black text-slate-200 shadow-md">
          <Paperclip className="w-3.5 h-3.5 text-teal-400" /> QuickBooks Format
        </span>
      </div>
    </div>
  );
};

/* ── Main Features Section ───────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10"
    >
      <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]">
            You saw the lead land.{' '}
            <span className="text-teal-300">Here&apos;s the rest of the job.</span>
          </h2>
        </div>

      {/* 1. Instant Quotes */}
<FeatureBlock
  badgeIcon={<FileText className="w-3.5 h-3.5 text-teal-400" />}
  badgeText="Instant Quotes"
  title="Build the quote once. Reuse it forever."
  subtitle="Save standard line items per job category, adjust quantities on site, and calculate totals automatically into branded estimates."
>
  <div className="grid md:grid-cols-12 gap-8 items-start pt-2">
    {/* Left Side: Top-Aligned Bullet Points & Interactive Saved Template Builder */}
    <div className="md:col-span-5 space-y-6 pt-1">
      <ul className="space-y-4">
        <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
          <Check size={18} className="text-teal-400 stroke-[3] shrink-0 mt-0.5" />
          <span>Customer accepts or declines directly in email</span>
        </li>
        <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
          <Check size={18} className="text-teal-400 stroke-[3] shrink-0 mt-0.5" />
          <span>Collect deposits instantly with <StripeWordmark className="text-xs" /></span>
        </li>
        <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
          <Check size={18} className="text-teal-400 stroke-[3] shrink-0 mt-0.5" />
          <span>Automatic follow-ups for unpaid balances</span>
        </li>
      </ul>

      {/* Saved Template Card with Action Buttons & Quantity Column */}
      <div className="w-full rounded-xl border border-slate-700 bg-slate-950/90 shadow-xl overflow-hidden mt-4">
        <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-1.5 text-teal-400">
            <Zap className="w-3.5 h-3.5 fill-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Build Template</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 px-3.5 py-1.5 bg-slate-900/40 text-[10px] font-bold text-slate-400 border-b border-white/5 uppercase tracking-wider">
          <span className="col-span-6">Item</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-3 text-right">Price</span>
          <span className="col-span-1"></span>
        </div>

        {/* Items List */}
        <div className="divide-y divide-white/5">
          {[
            { label: 'Tear-off & Disposal', qty: 25, price: 85 },
            { label: 'Architectural Shingles', qty: 25, price: 165 },
            { label: 'Synthetic Underlayment', qty: 5, price: 88 },
            { label: 'Ice & Water Shield', qty: 4, price: 120 },
          ].map((item) => (
            <div key={item.label} className="grid grid-cols-12 items-center px-3.5 py-2 text-xs">
              <span className="col-span-6 text-slate-200 font-semibold truncate">{item.label}</span>
              <div className="col-span-2 flex justify-center">
                <span className="bg-slate-900 border border-white/10 text-slate-300 font-bold px-1.5 py-0.5 rounded text-[11px]">
                  {item.qty}
                </span>
              </div>
              <span className="col-span-3 text-right text-teal-400 font-black">${item.price}</span>
              <div className="col-span-1 flex justify-end">
                <Trash2 className="w-3 h-3 text-slate-600 hover:text-rose-400 cursor-pointer transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls: Save & Close */}
        <div className="px-3.5 py-2.5 bg-slate-900/60 border-t border-white/10 flex items-center justify-between gap-3">
          <button className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
            Close
          </button>
          <button className="inline-flex items-center gap-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow transition-colors">
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Save Template
          </button>
        </div>
      </div>
    </div>

    {/* Right Side: Full-Sized Invoice Image */}
    <div className="md:col-span-7 relative w-full">
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white">
        <Image
          src="/images/invoice_full.webp"
          alt="A finished branded estimate ready to send"
          width={1000}
          height={1300}
          className="w-full h-auto object-cover object-top"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
      </div>
    </div>
  </div>
</FeatureBlock>



        {/* 2. Automated Messaging */}
        <FeatureBlock
          badgeIcon={<Send className="w-3.5 h-3.5 text-teal-400" />}
          badgeText="Automated Messaging"
          title="One click to send. A receipt for every message."
          subtitle="Schedule confirmations, estimates, and payment reminders go out straight from the job card with full tracking in your outbox."
        >
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
                Keep clients informed throughout every step of the project automatically while maintaining an exact audit trail of communications.
              </p>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-400 pt-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pre-built email templates included</span>
              </div>
            </div>
            <div className="md:col-span-7">
              <OutboxStrip />
            </div>
          </div>
        </FeatureBlock>

        {/* 3. Grow with Google */}
        <FeatureBlock
          badgeIcon={<GoogleLogo className="w-3.5 h-3.5" />}
          badgeText="Grow with Google"
          title="Turn every completed job into 5-star reviews"
          subtitle="Mark a job complete and an automated review request sends straight to your customer, directing top feedback right to your profile."
        >
          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Mail className="w-4 h-4 text-teal-400" />
                  <span>Automated Review Email Preview</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                  Auto-sent on completion
                </span>
              </div>

              <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-xl text-slate-900 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <GoogleLogo className="w-4 h-4" />
                    <span className="font-bold text-xs text-slate-800">Ridge Line Roofing</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-black text-slate-900">How did we do?</p>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Hi Jennifer, thanks for choosing us! Could you leave us a quick review on Google?
                  </p>
                </div>

                <div className="pt-1">
                  <div className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-black text-[11px] px-4 py-2.5 rounded-lg shadow-md">
                    <GoogleLogo className="w-3.5 h-3.5" />
                    Leave a Google Review
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950 group hover:scale-[1.02] transition-transform duration-300">
                <img
                  src="/images/GoogleReview.png"
                  alt="Google Automated Review Requests on Mobile"
                  className="w-full h-auto max-w-[280px] object-contain block"
                />
              </div>
            </div>
          </div>
        </FeatureBlock>

        {/* 4. Data Control */}
        <FeatureBlock
          badgeIcon={<Database className="w-3.5 h-3.5 text-teal-400" />}
          badgeText="Data Control"
          title="It's your business data. Take it whenever."
          subtitle="Export leads, jobs, and payments to CSV at any time, formatted for quick bulk edits or seamless QuickBooks import."
        >
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 space-y-2">
              <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
                Never lock your information away. Access full export options anytime and stay completely flexible across your accounting workflow.
              </p>
            </div>
            <div className="md:col-span-7">
              <ExportStrip />
            </div>
          </div>
        </FeatureBlock>

      </div>
    </section>
  );
}