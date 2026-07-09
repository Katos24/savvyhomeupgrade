'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, Bell, CheckCircle2, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

// Small "job-ticket" style card — a torn/perforated top edge ties to the
// trade-industry work-order motif instead of a generic rounded toast.
// These show real product moments (a lead coming in, an invoice getting
// paid), not fabricated stats.
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
    <div className={`w-64 overflow-hidden rounded-xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)] ${className}`}>
      <div
        className="h-2 w-full"
        style={{
          backgroundImage: 'radial-gradient(circle at center, transparent 2.5px, white 3px)',
          backgroundSize: '12px 100%',
          backgroundColor: accent,
        }}
      />
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{eyebrow}</p>
          <p className="mt-0.5 text-[13.5px] font-extrabold leading-tight text-slate-900">{title}</p>
          <p className="text-[12px] font-medium text-slate-500">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export default function ArchitectHero() {
  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-slate-50 pt-24 pb-16 lg:pt-28 lg:pb-24"
    >
      {/* Background: a fine blueprint-style grid (ties to the trade/jobsite
          world) plus one soft glow behind the product shot — replaces the
          old near-invisible 2% dot grid that read as bare. */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="pointer-events-none absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-emerald-300/25 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:pl-12 lg:pr-0">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[46%_54%]">
          {/* LEFT CONTENT */}
          <div className="relative z-20 flex flex-col gap-6 lg:gap-7">
            {/* Eyebrow */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-bold uppercase tracking-wide text-emerald-700">
                Built for trade businesses
              </span>
            </div>

            {/* HEADLINE */}
            <h1 className="text-slate-900 tracking-tighter leading-[0.95] text-5xl sm:text-6xl lg:text-7xl">
              <span className="font-extrabold block mb-1 sm:mb-2">From first inquiry</span>
              <span className="font-black text-emerald-600 block">to final invoice.</span>
            </h1>

            {/* MOBILE IMAGE */}
            <div className="lg:hidden relative w-full">
              <div className="relative rounded-2xl overflow-hidden bg-slate-50/50">
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard"
                  width={1200}
                  height={900}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwMCIgaGVpZ2h0PSIxMzAwIiB4bWxucz0iaHR0cDovL3d3dy5zdmcub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
                  className="w-full h-auto object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* SUBHEAD */}
            <p className="max-w-lg text-xl font-medium leading-normal tracking-tight text-slate-600">
              The all-in-one operating system for trade businesses. Capture
              leads and build estimates in minutes with pre-set pricing —
              so you can send a quote before the customer moves on.
            </p>

            {/* BENEFIT CHECKLIST — real product claims, no invented stats */}
            <ul className="flex flex-col gap-2">
              {[
                'A branded booking form that turns visitors into leads',
                'Pricing templates by job type — quotes build themselves',
                'Send invoices and track every payment automatically',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[14.5px] font-semibold text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                  {line}
                </li>
              ))}
            </ul>

            {/* WORKFLOW PILLS */}
            <div className="flex items-center gap-2 flex-wrap">
              {['Lead', 'Quote', 'Project'].map((step) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] font-semibold text-slate-700">
                    {step}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300" strokeWidth={2} />
                </div>
              ))}
              <span className="px-4 py-2 rounded-lg bg-emerald-600 text-[13px] font-semibold text-white shadow-sm">
                Paid
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/signup">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-wide shadow-xl transition-all cursor-pointer text-center"
                  >
                    Get Started Free
                    <ArrowRight size={20} strokeWidth={3} />
                  </motion.div>
                </Link>

                <Link href="/demo">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2.5 border-2 border-slate-200 bg-white hover:border-slate-300 text-slate-700 px-7 py-5 rounded-2xl font-bold transition-all cursor-pointer text-center"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                      <Play className="h-3 w-3 fill-slate-600 text-slate-600" />
                    </span>
                    See it in action
                  </motion.div>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Image
                  src="/images/quickbooks-export-badge.webp"
                  alt="QuickBooks Export"
                  width={112}
                  height={56}
                  className="h-8 w-auto opacity-70"
                />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500">Payments powered by</span>
                  <span className="text-[12px] font-black text-slate-700">Stripe</span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-wide">
                  No credit card · 2 min setup · Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — Tilted laptop + floating job-ticket cards (Desktop Only) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block relative"
          >
            <div
              className="relative w-[125%] origin-left -ml-32"
              style={{ perspective: '2000px' }}
            >
              <motion.div
                animate={{ rotateY: -18, rotateX: 4, rotateZ: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="rounded-3xl shadow-[0_50px_100px_rgba(15,23,42,0.2)] border border-slate-200/50 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 15%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)',
                }}
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard"
                  width={1800}
                  height={1300}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwMCIgaGVpZ2h0PSIxMzAwIiB4bWxucz0iaHR0cDovL3d3dy5zdmcub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWUyOTNiIi8+PC9zdmc+"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>

            {/* Floating ticket: new lead */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-2 top-8 z-20"
            >
                <TicketCard
                icon={Sparkles}
                eyebrow="Quote QT-014"
                title="$8,200.00 — Sent"
                detail="Built from a pricing template"
                accent="#6366f1"
              />
            </motion.div>

            {/* Floating ticket: invoice paid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-4 right-6 z-20"
            >
              <TicketCard
                icon={CheckCircle2}
                eyebrow="Invoice INV-004"
                title="$8,200.00 — Paid"
                detail="Tracked automatically"
                accent="#10b981"
              />
            </motion.div>

         
          </motion.div>
        </div>
      </div>
    </section>
  );
}