'use client';

import Link from 'next/link';
import {
  ArrowRight,
  QrCode,
  LayoutDashboard,
  MailCheck,
  Zap,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-6 pb-12 lg:pt-28 lg:pb-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">

          {/* ── CONTENT ── */}
          <div className="text-center lg:text-left z-10 w-full">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-5 bg-green-100 text-green-700 border border-green-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Built for Professional Contractors
            </div>

            <h1 className="font-black leading-[1.1] tracking-tight mb-5 text-slate-900 text-[clamp(2rem,8vw,4.5rem)]">
              Stop losing jobs to a missed{' '}
              <span className="text-[#1a6645]">text message.</span>
            </h1>

            <p className="text-base sm:text-lg font-medium leading-relaxed mb-7 text-slate-600 max-w-xl mx-auto lg:mx-0">
              Get a branded booking link and QR code. Manage custom quotes,
              automated scheduling, and payment tracking in one powerful
              dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black text-base sm:text-lg bg-[#1a6645] text-white transition-all hover:bg-[#144d34] active:scale-95 shadow-lg shadow-green-900/20"
              >
                Get Link Today
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base sm:text-lg border-2 border-slate-200 text-slate-700 bg-white transition-all hover:bg-slate-50"
              >
                See Demo
              </Link>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto lg:mx-0 sm:max-w-sm">
              {[
                { icon: QrCode,          label: 'Branded QR' },
                { icon: MailCheck,       label: 'Outbox Tracking' },
                { icon: Zap,             label: 'AI Project Briefs' },
                { icon: FileSpreadsheet, label: 'CSV Data Export' },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500"
                >
                  <feat.icon size={15} className="text-green-600 shrink-0" />
                  {feat.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── DASHBOARD VISUAL ── */}
          <div className="w-full">

            {/* Browser frame */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-white">

              {/* Toolbar */}
              <div className="bg-slate-900 px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 min-w-0 bg-slate-800 rounded py-1 px-2 flex items-center gap-2 border border-white/5">
                  <ShieldCheck size={10} className="text-green-400 shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 truncate">
                    lead2project.com/ridge-line/dashboard
                  </span>
                </div>
              </div>

              {/* Screenshot */}
              <div className="bg-slate-50">
                <img
                  src="/images/dashboard-screenshot-ridgeline.png"
                  alt="Dashboard Preview"
                  className="w-full h-auto block opacity-90"
                />
              </div>
            </div>

            {/* ── Cards row — stacks on mobile, side-by-side on sm+ ── */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">

              {/* New Lead card */}
              <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                    New Lead
                  </p>
                  <QrCode size={13} className="text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  Ridge Line — Roof Repair
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle2 size={12} className="text-green-500" />
                  <span className="text-[10px] font-medium text-slate-500 italic">
                    Custom Quote Sent
                  </span>
                </div>
              </div>

              {/* Outbox card */}
              <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-md p-4 flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg text-green-600 shrink-0">
                  <MailCheck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">
                    Outbox
                  </p>
                  <p className="text-xs font-bold text-slate-900">Quote Sent</p>
                </div>
              </div>
            </div>

            {/* ── Status pills ── */}
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <Clock size={11} className="text-slate-500" />
                <span className="text-[9px] font-bold text-slate-600 uppercase">
                  Digest 6:00 AM
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <LayoutDashboard size={11} className="text-slate-500" />
                <span className="text-[9px] font-bold text-slate-600 uppercase">
                  Pipelines
                </span>
              </div>
            </div>

          </div>
          {/* end dashboard visual */}

        </div>
      </div>
    </section>
  );
}