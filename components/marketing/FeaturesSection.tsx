'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Zap,
  Trash2,
  Download,
  FileSpreadsheet,
  Mail,
  FileText,
  Database,
  ArrowUpRight,
  Star,
  Plus,
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

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}

/* ── Reusable Feature Container ─────────────────────────────────────────── */

function FeatureSection({
  tag,
  title,
  description,
  children,
}: {
  tag: string;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45 }}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl"
    >
      <div className="max-w-2xl mb-8">
        <span className="text-teal-400 font-mono text-[11px] font-black uppercase tracking-widest bg-teal-950/80 border border-teal-800/50 px-3 py-1 rounded-md inline-block mb-3">
          {tag}
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight mb-3">
          {title}
        </h3>
        <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      </div>

      {children}
    </motion.div>
  );
}

/* ── Sub-Components ───────────────────────────────────────────────────────── */

const TemplateBuilder = () => {
  const items = [
    { label: 'Tear-off & Disposal', qty: '25 sq', price: '$2,125' },
    { label: 'Architectural Shingles', qty: '25 sq', price: '$4,125' },
    { label: 'Synthetic Underlayment', qty: '5 rolls', price: '$440' },
  ];

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-inner">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            Roof Replacement Template
          </span>
        </div>
        <span className="text-[10px] font-bold text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded">
          Active
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {items.map((i) => (
          <div
            key={i.label}
            className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 px-3 py-2 rounded-xl text-xs"
          >
            <div className="min-w-0 pr-2">
              <p className="text-slate-200 font-bold truncate">{i.label}</p>
              <p className="text-[10px] text-slate-500 font-mono">{i.qty}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-teal-400 font-black font-mono">{i.price}</span>
              <button type="button" aria-label="Remove item" className="text-slate-600 hover:text-rose-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Add Line Item
        </button>
        <button
          type="button"
          className="bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ExportPreview = () => {
  const rows = [
    { name: 'Jennifer L.', type: 'Roof Repair', status: 'Paid', total: '$9,290.00' },
    { name: 'Marcus K.', type: 'Gutter Guard', status: 'Pending', total: '$1,450.00' },
    { name: 'Dana R.', type: 'Shingle Patch', status: 'Draft', total: '$620.00' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
        <div className="grid grid-cols-12 bg-slate-900 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <span className="col-span-4">Client</span>
          <span className="col-span-3">Job Type</span>
          <span className="col-span-2 text-center">Status</span>
          <span className="col-span-3 text-right">Amount</span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {rows.map((r) => (
            <div key={r.name} className="grid grid-cols-12 px-4 py-3 text-xs items-center">
              <span className="col-span-4 font-bold text-slate-200 truncate">{r.name}</span>
              <span className="col-span-3 text-slate-400 truncate">{r.type}</span>
              <div className="col-span-2 text-center">
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    r.status === 'Paid'
                      ? 'bg-teal-950 text-teal-400 border border-teal-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <span className="col-span-3 text-right font-mono font-bold text-slate-200">
                {r.total}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
        >
          <Download size={14} className="text-teal-400" /> Export CSV
        </button>
      
      </div>
    </div>
  );
};

/* ── Main Export Component ────────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section
      style={{ fontFamily: font }}
      className="bg-slate-950 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 text-white border-t border-slate-800"
    >
      <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-teal-400 font-mono text-xs font-black uppercase tracking-widest block mb-3">
            Workflow & Automation
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08] mb-4">
            You saw the lead land.{' '}
            <span className="text-teal-400">Here is how you close it.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed">
            From field estimate to bank deposit—no duplicate data entry, no missing attachments, and zero manual spreadsheet updates.
          </p>
        </div>

        {/* Feature 1: Estimates */}
        <FeatureSection
          tag="01 · ESTIMATES & INVOICING"
          title={
            <>
              Build the quote once.{' '}
              <span className="text-teal-400">Reuse standard templates in seconds.</span>
            </>
          }
          description="Save line items for roof replacements, tear-offs, or repairs. Select quantities in the field and generate a clean customer estimate on the spot."
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <TemplateBuilder />
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-300">
                  <Check size={16} className="text-teal-400 shrink-0" strokeWidth={3} />
                  <span>Clients approve quotes digitally with one click</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-300">
                  <Check size={16} className="text-teal-400 shrink-0" strokeWidth={3} />
                  <span>
                    Collect job deposits directly via <StripeWordmark className="text-xs" />
                  </span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
                <Image
                  src="/images/invoice_full.webp"
                  alt="A branded PDF estimate ready to send to a homeowner"
                  width={900}
                  height={1150}
                  className="w-full h-auto object-cover object-top max-h-[480px]"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </FeatureSection>

        {/* Feature 2: Google Reviews */}
        <FeatureSection
          tag="02 · REPUTATION ENGINE"
          title={
            <>
              Turn every completed job into{' '}
              <span className="text-teal-400">5-star Google reviews.</span>
            </>
          }
          description="Mark a job complete on your phone and an automated SMS or email review prompt goes directly to the homeowner before you leave the driveway."
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-teal-400" />
                    <span className="text-xs font-bold text-slate-300">Automated Review Request</span>
                  </div>
                  <span className="text-[10px] font-black text-teal-400 bg-teal-950 border border-teal-800/80 px-2 py-0.5 rounded">
                    Trigger: Job Completed
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 text-slate-900 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <GoogleLogo className="w-4 h-4" />
                      <span className="font-bold text-xs">Ridge Line Roofing</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Hi Jennifer, thanks for trusting us with your roof repair! Would you mind leaving us a 30-second review on Google?
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-2 bg-slate-900 text-white font-black text-[11px] px-3.5 py-2 rounded-lg shadow-sm">
                      <GoogleLogo className="w-3.5 h-3.5" /> Leave Review
                      <ArrowUpRight size={12} className="text-slate-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 max-w-[320px] shadow-2xl">
                <img
                  src="/images/GoogleReview.png"
                  alt="Google Automated Review Requests interface preview"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </FeatureSection>

        {/* Feature 3: Data Export */}
        <FeatureSection
          tag="03 · DATA CONTROL"
          title={
            <>
              Your customer data belongs to you.{' '}
              <span className="text-teal-400">Export anytime.</span>
            </>
          }
          description="Export full records of leads, jobs, estimates, and payment statuses to standard formats whenever you need to sync with your accountant or CRM."
        >
          <div className="max-w-3xl">
            <ExportPreview />
          </div>
        </FeatureSection>
      </div>
    </section>
  );
}