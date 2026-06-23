'use client';

import Link from 'next/link';
import {
  ArrowRight, LayoutDashboard, FileText, CalendarDays, CreditCard,
  CheckCircle, Send, Clock, Table, Grid3X3,
  DollarSign, CheckCircle2, ArrowRightLeft, Bell
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

/* ─────────────────────────────────────────────────────────
   /features/operations
   SEO: contractor job management, quote software contractors,
        contractor scheduling app, payment tracking contractors,
        contractor CRM alternative, roofing job management
   ───────────────────────────────────────────────────────── */

export default function OperationsPage() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative bg-slate-950 pt-24 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute top-0 left-0 w-[600px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, #3b82f6, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                <LayoutDashboard size={11} strokeWidth={2.5} />
                Operations
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                From first lead<br />
                <span className="text-blue-400">to final payday.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Every lead on one board. Quote in one click. Schedule with a tap. Track payments without a spreadsheet — your entire operation in one dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  Start Free
                  <ArrowRight size={15} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-slate-300 hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  See Demo
                </Link>
              </div>
            </div>

            {/* Right — Dashboard screenshot */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src="/images/dashboard-jason.webp"
                alt="Lead2Project contractor dashboard with project board"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE BOARD ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">The Board</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Every lead.<br />
                <span className="text-slate-400">One screen.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Stop flipping between tabs, texts, and sticky notes. Every lead lives on a board you can switch between card, table, and calendar view. Bulk-edit from the table to update dozens of leads in seconds.
              </p>
              <div className="space-y-3">
                {[
                  { icon: <Grid3X3 size={15} />, text: 'Card view — visual pipeline at a glance' },
                  { icon: <Table size={15} />, text: 'Table view — bulk edit, sort, filter everything' },
                  { icon: <CalendarDays size={15} />, text: 'Calendar view — see all scheduled jobs' },
                  { icon: <ArrowRightLeft size={15} />, text: 'Custom pipeline stages per category' },
                  { icon: <Bell size={15} />, text: 'New leads flagged live as they come in' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-blue-500 shrink-0">{item.icon}</div>
                    <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Board screenshot */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="/images/mobilelaptophero2.webp"
                alt="Lead2Project board with card and table views"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ONE-CLICK QUOTES ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — Screenshot */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 order-2 lg:order-1">
              <img
                src="/images/quote-builder.webp"
                alt="Lead2Project one-click quote builder with accept decline"
                className="w-full h-auto"
              />
            </div>

            {/* Right — text */}
            <div className="order-1 lg:order-2">
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Quotes</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                One click.<br />
                <span className="text-slate-400">Professional quote.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Stop texting estimates from your personal number at 9pm. Build quotes from custom templates by category and send a branded email with Accept and Decline buttons — customers click to approve, no back and forth.
              </p>
              <div className="space-y-3">
                {[
                  'Custom quote templates by service category',
                  'Branded email with your logo and colors',
                  'Accept / Decline buttons for customers',
                  'Every quote tracked in your outbox',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-blue-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULING ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Scheduling</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Schedule the job.<br />
                <span className="text-slate-400">Confirm automatically.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Pick a date, assign a crew member. One click sends a branded confirmation email to the customer with all the details — no phone call needed.
              </p>
              <div className="space-y-3">
                {[
                  'Pick date and time from the lead card',
                  'Assign crew members to jobs',
                  'Branded confirmation email sent automatically',
                  'All scheduled jobs visible on calendar view',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-blue-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Schedule screenshot */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="/images/schedule-send.webp"
                alt="Lead2Project job scheduling with branded confirmation"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PAYMENT TRACKING ── */}
      <section className="bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Payments</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Stop chasing checks.
            </h2>
            <p className="text-slate-400 font-medium text-base max-w-xl mx-auto">
              Track payment status on every job. Send one-click reminders. Mark paid when the money hits — no spreadsheet required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <DollarSign size={18} />, title: 'Payment status', desc: 'See paid vs. unpaid at a glance on every lead card', color: '#10b981' },
              { icon: <Send size={18} />, title: 'One-click reminders', desc: 'Send branded payment reminder emails with one tap', color: '#3b82f6' },
              { icon: <CheckCircle2 size={18} />, title: 'Mark as paid', desc: 'Update payment status instantly when money comes in', color: '#f59e0b' },
              { icon: <Clock size={18} />, title: 'Pending overview', desc: 'See total pending revenue across all active jobs', color: '#f97316' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.08)', color: item.color }}>
                  {item.icon}
                </div>
                <h3 className="text-sm font-black text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE FULL FLOW ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">The Full Pipeline</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-10 sm:mb-14">
            One dashboard. Every stage.
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {[
              { label: 'Lead In', bg: '#10b981' },
              { label: 'Quote Sent', bg: '#3b82f6' },
              { label: 'Scheduled', bg: '#f59e0b' },
              { label: 'In Progress', bg: '#f97316' },
              { label: 'Paid', bg: '#10b981' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="px-5 py-3 rounded-xl font-black text-xs text-white"
                  style={{ background: step.bg }}
                >
                  {step.label}
                </div>
                {i < 4 && (
                  <ArrowRight size={16} className="text-slate-300 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 font-medium mt-10 max-w-lg mx-auto">
            Every stage is customizable. Add your own pipeline steps per service category — rename them, reorder them, make them yours.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Your entire operation. One login.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Stop juggling five apps and a spreadsheet.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-400 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
          >
            Start Free
            <ArrowRight size={15} strokeWidth={2.5} />
          </Link>
          <p className="mt-4 text-xs text-slate-400 font-medium">No credit card on free plan · Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}