'use client';

import Link from 'next/link';
import {
  ArrowRight, Mail, Download, Sunrise, Sparkles,
  Check, Zap, Search, Clock, FileText, Bot,
  Send, Bell, BarChart3, Table, Shield
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

/* ─────────────────────────────────────────────────────────
   /features/tools
   SEO: contractor email tracking, CSV export contractor,
        daily digest contractor app, AI quote generator,
        contractor outbox, job management tools
   ───────────────────────────────────────────────────────── */

export default function ToolsPage() {
  const heavyFont = "font-[1000] tracking-tighter uppercase leading-[0.95]";

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0a1628] pt-20 sm:pt-32 lg:pt-36 pb-16 sm:pb-24">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, #1e3a8a 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 10% 10%, #1e40af 0%, transparent 40%),
              #0a1628
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-yellow-400 bg-slate-900/80 mb-6 shadow-[3px_3px_0px_#facc15]">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-[9px] sm:text-[10px] font-black text-white tracking-[0.15em] uppercase">Tools & Exports</span>
          </div>

          <h1 className={`${heavyFont} text-white italic text-3xl sm:text-5xl lg:text-7xl mb-6`}>
            The Power Tools{' '}
            <span className="text-emerald-400">Behind the Board.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-bold leading-relaxed mb-10 max-w-2xl mx-auto">
            Email tracking, data exports, morning briefings, and AI assistance.
            The tools that make you{' '}
            <span className="text-white underline decoration-emerald-500 decoration-3 underline-offset-4">look like a company of ten.</span>
          </p>

          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-3 bg-yellow-400 p-1 pr-6 sm:pr-8 transition-all hover:bg-white active:scale-95 shadow-[6px_6px_0px_#064e3b]"
          >
            <div className="bg-slate-950 text-yellow-400 p-3 sm:p-4">
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </div>
            <span className="text-base sm:text-lg font-[1000] text-slate-950 uppercase tracking-tighter">
              Start Free — 14 Days
            </span>
          </Link>
        </div>
      </section>

      {/* ── EMAIL OUTBOX ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#3b82f6]">
                <Mail size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">Email Outbox</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                Every Email.{' '}
                <span className="text-emerald-600 italic">Tracked.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Stop guessing if your quote went through or your reminder got delivered.
                Every email you send — quotes, schedule confirmations, payment reminders —
                lives on a dedicated outbox page. Full transparency on everything that left your system.
              </p>

              <div className="space-y-3">
                {[
                  { icon: <Send size={16} />, text: 'See every email sent and when' },
                  { icon: <Search size={16} />, text: 'Search and filter by client or type' },
                  { icon: <FileText size={16} />, text: 'Quote emails with Accept/Decline status' },
                  { icon: <Bell size={16} />, text: 'Payment reminder delivery confirmation' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center shrink-0 border border-slate-950 text-white">
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Outbox preview */}
            <div className="border-[3px] border-slate-950 bg-white shadow-[8px_8px_0px_#3b82f6] sm:shadow-[12px_12px_0px_#3b82f6] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-100">
                <Mail size={16} className="text-blue-600" />
                <span className="text-[11px] sm:text-xs font-[1000] uppercase italic tracking-tighter text-slate-950">Outbox — Recent</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { name: 'Torres Roofing', msg: 'Quote #4402 — $7,950', time: '2h ago', type: 'quote', color: 'bg-orange-500' },
                  { name: 'Kim Gutters', msg: 'Schedule Confirmed — Apr 13', time: '5h ago', type: 'schedule', color: 'bg-blue-500' },
                  { name: 'Apex Fencing', msg: 'Payment Reminder — $3,100', time: '1d ago', type: 'reminder', color: 'bg-amber-500' },
                  { name: 'Martinez Siding', msg: 'Quote #4398 — $5,200', time: '2d ago', type: 'quote', color: 'bg-orange-500' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 sm:p-3 border-2 border-slate-200 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${log.color}`}>
                      <Mail size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-[12px] font-black text-slate-900 truncate">{log.name}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold truncate">{log.msg}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[8px] sm:text-[9px] font-bold text-slate-400">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CSV EXPORT ── */}
      <section className="bg-white py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Table preview */}
            <div className="lg:order-2">
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
                <Download size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">CSV Export</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                Your Data.{' '}
                <span className="text-emerald-600 italic">Your Rules.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                We don't hold your data hostage. Export everything to CSV anytime — leads, quotes,
                payments, contacts. Use it in Excel, Google Sheets, or whatever you want.
                Bulk-edit from the table view for lightning-fast updates.
              </p>

              <div className="space-y-3">
                {[
                  'Export all leads and projects to CSV',
                  'Bulk-edit from table view',
                  'Full data portability — no lock-in',
                  'Works with Excel and Google Sheets',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0 border border-slate-950">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Export demo */}
            <div className="lg:order-1 border-[3px] border-slate-950 bg-white shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981]">
              <div className="bg-slate-950 text-white p-3 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Lead Database</span>
                <span className="text-[8px] font-bold text-slate-400">4 records</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-[7px] sm:text-[8px] font-black text-slate-500 uppercase tracking-wider">
                  <tr><th className="p-2 sm:p-3">Client</th><th className="p-2 sm:p-3">Category</th><th className="p-2 sm:p-3 text-right">Value</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Torres Roofing', cat: 'Roofing', val: '$7,950' },
                    { name: 'Kim Gutters', cat: 'Gutters', val: '$2,400' },
                    { name: 'Martinez Siding', cat: 'Siding', val: '$5,200' },
                    { name: 'ProClean Services', cat: 'Cleaning', val: '$1,800' },
                  ].map((row, i) => (
                    <tr key={i} className="text-[10px] sm:text-[11px] font-bold text-slate-700">
                      <td className="p-2 sm:p-3">{row.name}</td>
                      <td className="p-2 sm:p-3 text-[8px] sm:text-[9px] text-slate-400 uppercase">{row.cat}</td>
                      <td className="p-2 sm:p-3 text-right font-black">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 sm:p-4 border-t-2 border-slate-100">
                <div className="flex items-center justify-center gap-2 bg-emerald-500 text-white border-2 border-slate-950 p-2.5 sm:p-3 shadow-[3px_3px_0px_#000]">
                  <Download size={16} strokeWidth={3} />
                  <span className="text-[10px] sm:text-[12px] font-[1000] uppercase italic tracking-tighter">Export_Database.CSV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DAILY DIGEST ── */}
      <section className="bg-slate-950 py-12 sm:py-24 border-t-4 border-yellow-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Morning briefing card */}
            <div className="border-[3px] border-slate-800 bg-slate-900 shadow-[8px_8px_0px_#facc15] sm:shadow-[12px_12px_0px_#facc15] p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 text-slate-950 flex items-center justify-center border-2 border-slate-950">
                  <Sunrise size={22} />
                </div>
                <div>
                  <p className="text-[11px] sm:text-[13px] font-[1000] text-white uppercase italic tracking-tighter">Daily Digest</p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase">6:00 AM · Every Morning</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { label: 'Jobs Today', value: '3', color: 'text-emerald-400' },
                  { label: 'Quotes Pending', value: '5', color: 'text-yellow-400' },
                  { label: 'Payments Due', value: '$12,400', color: 'text-orange-400' },
                  { label: 'New Leads', value: '2', color: 'text-blue-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 sm:py-3 border-b border-slate-800">
                    <span className="text-[11px] sm:text-xs font-black text-slate-400 uppercase tracking-tight">{stat.label}</span>
                    <span className={`text-lg sm:text-xl font-[1000] italic ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
                <Sunrise size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">6AM Digest</span>
              </div>

              <h2 className={`${heavyFont} text-white italic text-2xl sm:text-4xl mb-6`}>
                Wake Up Ready.{' '}
                <span className="text-emerald-400">Every Morning.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-400 font-bold leading-relaxed mb-8">
                Every morning at 6:00 AM you get an email with your full daily briefing.
                Jobs scheduled today, quotes waiting for approval, payments due, and new leads
                that came in overnight. Coffee in hand, game plan ready, before your boots hit the floor.
              </p>

              <div className="space-y-3">
                {[
                  'Delivered at 6:00 AM every day',
                  'Today\'s scheduled jobs at a glance',
                  'Pending quotes and payment status',
                  'New leads received since yesterday',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0 border border-slate-800">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase italic tracking-wide">
                Available on Pro plan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI BRIEFS ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
                <Bot size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">AI Assistant</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                AI That Helps.{' '}
                <span className="text-emerald-600 italic">Not Replaces.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-6">
                Get AI-generated project briefs for your crew and use the AI chat assistant
                to ask questions about your pipeline. The AI quote generator helps you draft
                estimates faster — it's a powerful co-pilot, not a replacement for your expertise.
              </p>

              <div className="p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 mb-8">
                <p className="text-[10px] sm:text-xs font-black text-amber-700 uppercase tracking-tight">
                  Honest note: Our AI tools are helpful but not perfect. They speed up your workflow — they
                  don't run your business for you. We'll never oversell this.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'AI-generated project briefs',
                  'Chat assistant for pipeline questions',
                  'AI quote drafting co-pilot',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-500 flex items-center justify-center shrink-0 border border-slate-950">
                      <Check size={12} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{item}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase italic tracking-wide">
                Available on Pro plan
              </p>
            </div>

            {/* Right — AI preview card */}
            <div className="border-[3px] border-slate-950 bg-white shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-100">
                <Bot size={16} className="text-emerald-600" />
                <span className="text-[11px] sm:text-xs font-[1000] uppercase italic tracking-tighter text-slate-950">AI Brief — Torres Roofing</span>
              </div>

              <div className="space-y-3 sm:space-y-4 text-[11px] sm:text-xs text-slate-700 font-bold leading-relaxed">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Scope</p>
                  <p>Full roof replacement — 30 sq architectural shingles, tear-off existing, new underlayment and flashing. Customer reported storm damage with leaks in master bedroom.</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Key Details</p>
                  <p>2-story colonial, steep pitch. Roof age 15+ years. Customer prefers morning start times. Photos show 3 areas of missing shingles.</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Estimated Value</p>
                  <p className="text-emerald-600 font-black">$7,950 — based on similar jobs in your pipeline</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center gap-2">
                <Sparkles size={12} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-400 italic">Generated from lead submission data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0a1628] py-16 sm:py-24 border-t-4 border-emerald-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`${heavyFont} text-white italic text-2xl sm:text-5xl mb-6`}>
            Work Smarter.{' '}
            <span className="text-emerald-400">Not Harder.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-bold mb-10 max-w-lg mx-auto">
            Email tracking, daily briefings, data exports, and AI assistance — all built in.
            No add-ons. No extra fees on the Pro plan.
          </p>
          <Link
            href="/signup"
            className="group inline-flex items-center justify-center gap-3 bg-yellow-400 p-1 pr-6 sm:pr-8 transition-all hover:bg-white active:scale-95 shadow-[8px_8px_0px_#064e3b]"
          >
            <div className="bg-slate-950 text-yellow-400 p-3 sm:p-4">
              <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
            </div>
            <span className="text-base sm:text-xl font-[1000] text-slate-950 uppercase tracking-tighter">
              Start Free — 14 Days
            </span>
          </Link>
          <p className="mt-6 text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-wide">
            14-day free trial · Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}