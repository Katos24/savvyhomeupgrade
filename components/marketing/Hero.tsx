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
  ShieldCheck
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-12 pb-16 lg:pt-32 lg:pb-24 px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT — CONTENT */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-green-100 text-green-700 border border-green-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Built for Professional Contractors
            </div>

            <h1 className="font-black leading-[1.1] tracking-tight mb-6 text-slate-900 text-4xl sm:text-5xl lg:text-7xl">
              Stop losing jobs to a missed <span className="text-[#1a6645]">text message.</span>
            </h1>

            <p className="text-lg sm:text-xl font-medium leading-relaxed mb-8 text-slate-600 max-w-xl mx-auto lg:mx-0">
              Get a branded booking link and QR code. Manage custom quotes, automated scheduling, and payment tracking in one powerful dashboard.
            </p>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-lg bg-[#1a6645] text-white transition-all hover:bg-[#144d34] active:scale-95 shadow-lg shadow-green-900/20"
              >
                Get Link Today
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-slate-200 text-slate-700 bg-white transition-all hover:bg-slate-50"
              >
                See how it works
              </Link>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <QrCode size={18} className="text-green-600" /> Branded QR Booking
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <MailCheck size={18} className="text-green-600" /> Outbox Tracking
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <Zap size={18} className="text-green-600" /> AI Project Briefs
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <FileSpreadsheet size={18} className="text-green-600" /> CSV Data Export
              </div>
            </div>
          </div>

          {/* RIGHT — DASHBOARD VISUAL */}
          <div className="order-1 lg:order-2 relative w-full">
            {/* Main Browser Frame */}
            <div className="rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-slate-200 bg-white">
              {/* Toolbar */}
              <div className="bg-slate-900 px-4 py-3 flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-slate-800 rounded-md py-1 px-3 flex items-center gap-2 border border-white/5">
                  <ShieldCheck size={12} className="text-green-400" />
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    lead2project.com/your-business/dashboard
                  </span>
                </div>
              </div>
              
              {/* Dashboard Content Placeholder */}
              <div className="relative">
                <img
                  src="/images/dashboard-screenshot-ridgeline.png"
                  alt="Lead2Project Dashboard"
                  className="w-full h-auto block"
                />
                
                {/* Floating "Outbox" Notification (Desktop Only) */}
                <div className="hidden md:flex absolute top-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 items-center gap-3 animate-bounce-slow">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <MailCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Outbox</p>
                    <p className="text-xs font-bold text-slate-900 text-nowrap">Quote Sent & Tracked</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Digest / Plan Info Pill */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <Clock size={14} className="text-slate-500" />
                <span className="text-[11px] font-bold text-slate-600 uppercase">Daily Digest 6:00 AM</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <LayoutDashboard size={14} className="text-slate-500" />
                <span className="text-[11px] font-bold text-slate-600 uppercase">Custom Pipelines</span>
              </div>
            </div>

            {/* Mobile Lead Notification */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-left-6 bg-white p-4 rounded-xl shadow-2xl border border-slate-100 w-[90%] sm:w-[280px]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">New Lead</p>
                <QrCode size={14} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Ridge Line — Roof Repair</p>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-[10px] font-medium tracking-tight text-nowrap italic">Category: Custom Quote Sent</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}