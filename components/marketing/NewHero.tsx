'use client';

import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, CheckCircle2, Check, Sparkles, 
  UserPlus, FileText, Briefcase, DollarSign 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

function TicketCard({
  icon: Icon,
  eyebrow,
  title,
  detail,
  accent,
  className = '',
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  detail: string;
  accent: string;
  className?: string;
}) {
  return (
    <div className={`w-60 sm:w-64 overflow-hidden rounded-xl bg-white border border-slate-100 shadow-[0_15px_35px_rgba(15,23,42,0.12)] ${className}`}>
      <div
        className="h-2 w-full"
        style={{
          backgroundImage: 'radial-gradient(circle at center, transparent 2px, white 2.5px)',
          backgroundSize: '10px 100%',
          backgroundColor: accent,
        }}
      />
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{eyebrow}</p>
          <p className="mt-0.5 text-[13px] sm:text-[14px] font-extrabold leading-tight text-slate-900 truncate">{title}</p>
          <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 truncate">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export default function ArchitectHero() {
  // Real product workflow states to show progression instead of static text
  const workflowSteps = [
    { label: 'Lead',    status: 'Captured', icon: UserPlus,  color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Quote',   status: 'Approved', icon: FileText,  color: 'text-indigo-600',bg: 'bg-indigo-50' },
    { label: 'Project', status: 'Active',   icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Paid',    status: 'Cleared',  icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', active: true },
  ];

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-50 pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 border-b border-slate-200/60 z-10"
    >
      {/* Blueprint Grid & Soft Radial Glow Background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none absolute -right-20 top-0 h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[48%_52%]">
          
          {/* LEFT COLUMN: Core Value Propositions */}
          <div className="relative z-20 flex flex-col gap-5 sm:gap-6 text-left">
            
            {/* Tag Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Built for trade businesses
              </span>
            </div>

            {/* Main Typographic Hook */}
            <h1 className="text-slate-900 tracking-tighter leading-[1.02] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="font-extrabold block text-slate-900">From first inquiry</span>
              <span className="font-black text-emerald-600 block mt-1">to final invoice.</span>
            </h1>

            {/* INLINE MOBILE GRAPHIC: Fallback visual on smaller viewports */}
            <div className="lg:hidden relative w-full my-2">
              <div className="relative rounded-2xl border border-slate-200/60 bg-white/40 p-2 shadow-sm">
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard Showcase"
                  width={720}
                  height={500}
                  priority
                  className="w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>

            {/* Subhead Context Description */}
            <p className="max-w-xl text-base sm:text-lg md:text-xl font-medium leading-relaxed tracking-tight text-slate-600">
              The all-in-one operating system for trade businesses. Capture
              leads and build estimates in minutes with pre-set pricing —
              so you can send a quote before the customer moves on.
            </p>

            {/* UPGRADED WORKFLOW PIPELINE TRACKER */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs max-w-xl w-full">
              <div className="grid grid-cols-4 items-center relative">
                {workflowSteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center relative group">
                      {/* Connecting progress lines */}
                      {idx < workflowSteps.length - 1 && (
                        <div className="absolute top-[18px] left-[calc(50%+18px)] w-[calc(100%-36px)] h-[2px] bg-slate-100 z-0">
                          <div className={`h-full bg-emerald-500/40 transition-all duration-500 ${step.active || idx < 3 ? 'w-full' : 'w-0'}`} />
                        </div>
                      )}

                      {/* Icon Hex/Circle Badge */}
                      <div className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-xl border transition-all shadow-xs ${
                        step.active 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10 scale-105' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        <StepIcon className={`h-4 w-4 ${step.active ? 'text-white' : step.color}`} strokeWidth={2.5} />
                      </div>

                      {/* Label metadata text */}
                      <span className="mt-2 text-[12px] font-black text-slate-900 leading-none">
                        {step.label}
                      </span>
                      <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${step.active ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}`}>
                        {step.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Operational Structural Checklist */}
            <ul className="flex flex-col gap-2.5 my-1">
              {[
                'A branded booking form that turns visitors into leads',
                'Pricing templates by job type — quotes build themselves',
                'Send invoices and track every payment automatically',
              ].map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-[14px] font-bold text-slate-700">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-2.5 w-2.5" strokeWidth={4} />
                  </span>
                  <span className="leading-tight text-slate-600 font-medium">{line}</span>
                </li>
              ))}
            </ul>

            {/* Strategic Action Targets Call-To-Actions (CTAs) */}
            <div className="flex flex-col space-y-5 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/signup" className="flex-1 sm:flex-none">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-lg shadow-slate-950/10 transition-colors cursor-pointer text-center"
                  >
                    Get Started Free
                    <ArrowRight size={16} strokeWidth={3} />
                  </motion.div>
                </Link>

                <Link href="/demo" className="flex-1 sm:flex-none">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-6 py-4 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer text-center"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
                      <Play className="h-2 w-2 fill-slate-600 text-slate-600 ml-0.5" />
                    </span>
                    See it in action
                  </motion.div>
                </Link>
              </div>

              {/* Dynamic Ecosystem Badges Block */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60">
                <Image
                  src="/images/quickbooks-export-badge.webp"
                  alt="QuickBooks Integration Ecosystem"
                  width={100}
                  height={45}
                  className="h-6 w-auto opacity-75 object-contain grayscale hover:grayscale-0 transition-all"
                />
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-200/50 border border-slate-200/40 text-[11px]">
                  <span className="font-medium text-slate-500">Payments via</span>
                  <span className="font-black text-slate-700 tracking-tight">Stripe</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold tracking-normal">
                  No credit card required · 2 min setup
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Isometric Viewport Presentation (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative w-full h-full min-h-[480px]"
          >
            {/* Tilted Workspace Wrapper */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[130%] origin-left -ml-12"
              style={{ perspective: '1600px' }}
            >
              <motion.div
                animate={{ rotateY: -16, rotateX: 5, rotateZ: 1 }}
                className="rounded-2xl shadow-[0_35px_70px_rgba(15,23,42,0.15)] border border-slate-200 overflow-hidden bg-white"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 10%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%)',
                }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Operations Management Dashboard"
                  width={1400}
                  height={1000}
                  priority
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>

            {/* Floating Token: Estimate Dispatch Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -left-4 top-16 z-30"
            >
              <TicketCard
                icon={Sparkles}
                eyebrow="Estimate QT-014"
                title="$8,200.00 — Sent"
                detail="Built from a pricing template"
                accent="#4f46e5"
              />
            </motion.div>

            {/* Floating Token: Cleared Payment Confirmation Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute right-4 bottom-12 z-30"
            >
              <TicketCard
                icon={CheckCircle2}
                eyebrow="Invoice INV-004"
                title="$8,200.00 — Paid"
                detail="Tracked automatically via Stripe"
                accent="#10b981"
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}