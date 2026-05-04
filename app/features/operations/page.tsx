'use client';

import Link from 'next/link';
import {
  ArrowRight, LayoutDashboard, FileText, CalendarDays, CreditCard,
  Check, Zap, MousePointerClick, Send, Clock, Table, Grid3X3,
  DollarSign, CheckCircle2, ArrowRightLeft
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-yellow-400 bg-slate-900/80 mb-6 shadow-[3px_3px_0px_#facc15]">
                <LayoutDashboard size={14} className="text-yellow-400" />
                <span className="text-[9px] sm:text-[10px] font-black text-white tracking-[0.15em] uppercase">Operations</span>
              </div>

              <h1 className={`${heavyFont} text-white italic text-3xl sm:text-5xl lg:text-7xl mb-6`}>
                From First Scan to{' '}
                <span className="text-emerald-400">Final Payday.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-bold leading-relaxed mb-8 max-w-lg">
                Every lead on one board. Quote in one click. Schedule with a tap.
                Track payments without a spreadsheet.{' '}
                <span className="text-white underline decoration-emerald-500 decoration-3 underline-offset-4">Your entire operation in one dashboard.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup"
                  className="group flex items-center justify-center gap-3 bg-yellow-400 p-1 pr-6 sm:pr-8 transition-all hover:bg-white active:scale-95 shadow-[6px_6px_0px_#064e3b]"
                >
                  <div className="bg-slate-950 text-yellow-400 p-3 sm:p-4">
                    <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                  <span className="text-base sm:text-lg font-[1000] text-slate-950 uppercase tracking-tighter">
                    Start Free — 14 Days
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wide flex-wrap">
                <span>2 Min Setup</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
                <span>No Credit Card</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
                <span>Cancel Anytime</span>
              </div>
            </div>

            {/* Right — Dashboard screenshot */}
            <div className="flex justify-center">
              <img
                src="/images/dashboard-jason.png"
                alt="Lead2Project contractor dashboard with project board"
                className="w-full max-w-[500px] border-[3px] border-slate-950 shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE BOARD ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
                <LayoutDashboard size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">The Board</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                Every Lead.{' '}
                <span className="text-emerald-600 italic">One Screen.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Stop flipping between tabs, texts, and sticky notes. Every lead lives on a visual board
                you can switch between card view, table view, and calendar view. Bulk-edit from the table
                to update 50 leads in seconds.
              </p>

              <div className="space-y-3">
                {[
                  { icon: <Grid3X3 size={16} />, text: 'Card view — visual pipeline at a glance' },
                  { icon: <Table size={16} />, text: 'Table view — bulk edit, sort, filter everything' },
                  { icon: <CalendarDays size={16} />, text: 'Calendar view — see all scheduled jobs' },
                  { icon: <ArrowRightLeft size={16} />, text: 'Custom pipeline stages per category' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center shrink-0 border border-slate-950 text-white">
                      {item.icon}
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Board screenshot */}
            <div className="flex justify-center">
              <img
                src="/images/mobilelaptophero2.webp"
                alt="Lead2Project board with card and table views"
                className="w-full max-w-[500px] border-[3px] border-slate-950 shadow-[8px_8px_0px_#facc15] sm:shadow-[12px_12px_0px_#facc15]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── ONE-CLICK QUOTES ── */}
      <section className="bg-white py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Screenshot */}
            <div className="lg:order-2">
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#3b82f6]">
                <FileText size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">Quotes</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                One Click.{' '}
                <span className="text-emerald-600 italic">Professional Quote.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Stop texting estimates from your personal number at 9 PM. Build quotes from custom
                templates by category and send branded emails with Accept and Decline buttons.
                Customers click to approve — no back and forth.
              </p>

              <div className="space-y-3">
                {[
                  'Custom quote templates by service category',
                  'Branded email with your logo and colors',
                  'Accept / Decline buttons for customers',
                  'Every quote tracked in your outbox',
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

            {/* Right — Quote screenshot */}
            <div className="lg:order-1 flex justify-center">
              <img
                src="/images/quote-builder.webp"
                alt="Lead2Project one-click quote builder with accept decline"
                className="w-full max-w-[500px] border-[3px] border-slate-950 shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULING ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#2563eb]">
                <CalendarDays size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">Scheduling</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                Schedule the Job.{' '}
                <span className="text-emerald-600 italic">Confirm Automatically.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Pick a date, assign a crew member. One click sends a branded confirmation email
                to the customer with all the details. No phone call needed.
              </p>

              <div className="space-y-3">
                {[
                  'Pick date and time from the lead card',
                  'Assign crew members to jobs',
                  'Branded confirmation email sent automatically',
                  'All scheduled jobs visible on calendar view',
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

            {/* Right — Schedule screenshot */}
            <div className="flex justify-center">
              <img
                src="/images/schedule-send.webp"
                alt="Lead2Project job scheduling with branded confirmation"
                className="w-full max-w-[500px] border-[3px] border-slate-950 shadow-[8px_8px_0px_#facc15] sm:shadow-[12px_12px_0px_#facc15]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PAYMENT TRACKING ── */}
      <section className="bg-slate-950 py-12 sm:py-24 border-t-4 border-yellow-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-950 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
              <CreditCard size={12} strokeWidth={3} />
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">Payments</span>
            </div>
            <h2 className={`${heavyFont} text-white italic text-2xl sm:text-5xl mb-4`}>
              Stop Chasing Checks.{' '}
              <span className="text-emerald-400">Get Paid.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-bold max-w-xl mx-auto">
              Track payment status on every job. Send one-click payment reminders.
              Mark paid when the money hits. No spreadsheet required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <DollarSign size={20} />, title: 'Payment Status', desc: 'See paid vs unpaid at a glance on every lead card', color: 'bg-emerald-500' },
              { icon: <Send size={20} />, title: 'One-Click Reminders', desc: 'Send branded payment reminder emails with one tap', color: 'bg-blue-600' },
              { icon: <CheckCircle2 size={20} />, title: 'Mark as Paid', desc: 'Update payment status instantly when money comes in', color: 'bg-yellow-400 text-slate-950' },
              { icon: <Clock size={20} />, title: 'Pending Overview', desc: 'See total pending revenue across all your active jobs', color: 'bg-orange-500' },
            ].map((item, i) => (
              <div
                key={i}
                className="border-2 border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-[3px_3px_0px_#10b981] sm:shadow-[4px_4px_0px_#10b981]"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-slate-950 mb-3 sm:mb-4 text-white ${item.color}`}>
                  {item.icon}
                </div>
                <h3 className="text-sm sm:text-base font-[1000] text-white uppercase italic tracking-tighter mb-2">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 font-bold leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE FULL FLOW ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-5xl mb-8 sm:mb-12`}>
            The Full Pipeline.{' '}
            <span className="text-emerald-600 italic">One Dashboard.</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {[
              { label: 'Lead In', color: 'bg-emerald-500 text-white' },
              { label: 'Quote Sent', color: 'bg-blue-600 text-white' },
              { label: 'Scheduled', color: 'bg-yellow-400 text-slate-950' },
              { label: 'In Progress', color: 'bg-orange-500 text-white' },
              { label: 'Paid', color: 'bg-emerald-500 text-white' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className={`px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-slate-950 font-[1000] text-[10px] sm:text-xs uppercase italic tracking-tighter shadow-[3px_3px_0px_#000] ${step.color}`}>
                  {step.label}
                </div>
                {i < 4 && (
                  <ArrowRight size={16} className="text-slate-300 shrink-0 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-bold mt-8 sm:mt-12 max-w-lg mx-auto">
            Every stage is customizable. Add your own pipeline steps per service category.
            Rename them, reorder them, make them yours.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0a1628] py-16 sm:py-24 border-t-4 border-emerald-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`${heavyFont} text-white italic text-2xl sm:text-5xl mb-6`}>
            Your Entire Operation.{' '}
            <span className="text-emerald-400">One Login.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-bold mb-10 max-w-lg mx-auto">
            Stop juggling 5 apps and a spreadsheet. Lead2Project handles leads, quotes,
            scheduling, and payments in one place.
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