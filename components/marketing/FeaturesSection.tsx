'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Trash2, Star, Download, Paperclip } from 'lucide-react';
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

/* ── Row scaffold ───────────────────────────────────────────────────────────
   No card. Just a rule, an eyebrow, and type. The visual bleeds free of any
   container, which is what keeps this from reading as a grid of boxes.       */

function Row({
  eyebrow,
  title,
  body,
  bullets,
  flip = false,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  body: React.ReactNode;
  bullets?: React.ReactNode[];
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center border-t border-white/10 py-14 sm:py-20 first:border-t-0 first:pt-0">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className={`lg:col-span-5 ${flip ? 'lg:order-last' : ''}`}
      >
        <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-teal-300 mb-4">
          {eyebrow}
        </span>
        <h3 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-black text-white tracking-tight leading-[1.1] mb-4">
          {title}
        </h3>
        <p className="text-base text-slate-300 font-semibold leading-relaxed">{body}</p>

        {bullets && (
          <ul className="mt-6 space-y-2.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200 font-semibold">
                <Check size={15} className="text-teal-400 stroke-[3] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="lg:col-span-7"
      >
        {children}
      </motion.div>
    </article>
  );
}

/* ── Visuals ───────────────────────────────────────────────────────────── */

/**
 * Signature moment: the reusable template overlapping the finished estimate.
 * Two artifacts, one relationship — this is the only place on the page where
 * anything overlaps, so it carries the weight.
 */
const QuoteCollage = () => (
  <div className="relative w-full">
    <div className="relative ml-auto w-[78%] sm:w-[68%] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white">
      <Image
        src="/images/invoice_full.webp"
        alt="A finished branded estimate ready to send"
        width={800}
        height={1040}
        className="w-full h-auto object-cover object-top"
      />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/70 to-transparent pointer-events-none" />
    </div>

    <div className="absolute left-0 bottom-6 sm:bottom-10 w-[62%] sm:w-[54%] rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden -rotate-2">
      <div className="px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-1.5 text-teal-400 mb-1">
          <Zap className="w-3 h-3 fill-teal-400" />
          <span className="text-[9px] font-black uppercase tracking-widest">Saved template</span>
        </div>
        <h4 className="text-white font-black text-xs leading-none">Full Roof Replacement</h4>
      </div>
      <div className="divide-y divide-white/5">
        {TEMPLATE_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 px-3 py-2">
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
    <div className="w-full rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60 shadow-xl">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outbox</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-teal-300">Today</span>
      </div>
      {rows.map((r) => (
        <div
          key={r.t}
          className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-t border-white/5 first:border-t-0"
        >
          <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-teal-300" strokeWidth={4} />
          </span>
          <span className="text-xs sm:text-sm font-black text-white flex-1 truncate">{r.t}</span>
          <span className="hidden sm:block text-[11px] font-semibold text-slate-500 truncate max-w-[180px]">
            {r.to}
          </span>
          <span className="text-[11px] font-bold text-slate-500 shrink-0">{r.time}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewStrip = () => (
  <div className="w-full rounded-2xl border border-white/10 bg-white shadow-xl p-5 sm:p-7">
    <div className="flex items-center gap-3 mb-4">
      <GoogleLogo className="w-7 h-7" />
      <div className="min-w-0">
        <p className="text-sm font-black text-slate-900 truncate">Ridge Line Roofing</p>
        <div className="flex items-center gap-1 mt-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={11} className="text-amber-400" fill="currentColor" />
          ))}
          <span className="text-[11px] font-bold text-slate-500 ml-1">4.9 · 124 reviews</span>
        </div>
      </div>
    </div>
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
        Sent automatically on job close
      </p>
      <p className="text-sm font-semibold text-slate-700 leading-relaxed">
        Thanks again, Jennifer. If you have a minute, a quick review helps other
        homeowners find us.
      </p>
      <span className="inline-flex items-center gap-1.5 mt-3 rounded-lg bg-teal-700 text-white text-[11px] font-black px-3 py-2">
        Leave a review
      </span>
    </div>
  </div>
);

const ExportStrip = () => {
  const cols = ['Customer', 'Job', 'Status', 'Total'];
  return (
    <div className="w-full">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/60 shadow-xl">
        <div className="grid grid-cols-4 bg-slate-900/80 px-4 sm:px-5 py-2.5 gap-4">
          {cols.map((c) => (
            <span
              key={c}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate"
            >
              {c}
            </span>
          ))}
        </div>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="grid grid-cols-4 px-4 sm:px-5 py-3.5 gap-4 border-t border-white/5">
            {cols.map((c, ci) => (
              <span
                key={c}
                className={`h-2 rounded-full ${r === 0 ? 'bg-slate-500' : 'bg-slate-600'}`}
                style={{ width: `${55 + ((r + ci) % 4) * 12}%` }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5 mt-4">
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2 text-[11px] font-black text-slate-200">
          <Download className="w-3.5 h-3.5 text-teal-400" /> Export CSV
        </span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2 text-[11px] font-black text-slate-200">
          <Paperclip className="w-3.5 h-3.5 text-teal-400" /> QuickBooks format
        </span>
      </div>
    </div>
  );
};

/* ── Section ────────────────────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10"
    >
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08]">
            You saw the lead land.{' '}
            <span className="text-teal-300">Here&apos;s the rest of the job.</span>
          </h2>
        </div>

        <Row
          eyebrow="Quotes"
          title="Build the quote once. Reuse it forever."
          body="Save your standard line items per job category, then adjust quantities on site. Totals calculate themselves and the estimate comes out branded."
          bullets={[
            'Customer accepts or declines right in the email',
            <>Take the deposit by card through <StripeWordmark className="text-sm" /></>,
            'Reminders go out on unpaid balances',
          ]}
        >
          <QuoteCollage />
        </Row>

        <Row
          eyebrow="Email"
          title="One click to send. A receipt for every one."
          body="Schedule confirmations, estimates, and payment reminders go out from the job card using your own templates. The Outbox keeps a record of exactly what was sent and when."
          flip
        >
          <OutboxStrip />
        </Row>

        <Row
          eyebrow="Reviews"
          title="The ask that always gets forgotten."
          body="Mark a job complete and the review request sends itself, pointing customers straight at your Google Business Profile. Recent reviews are the ones that count."
        >
          <ReviewStrip />
        </Row>

        <Row
          eyebrow="Your data"
          title="It's yours. Take it whenever."
          body="Export leads, jobs, and payments to CSV any time, including a version formatted for QuickBooks import. Bulk edit from the table instead of opening cards one at a time."
          flip
        >
          <ExportStrip />
        </Row>
      </div>
    </section>
  );
}