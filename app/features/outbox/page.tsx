'use client';

import Link from 'next/link';
import {
  ArrowRight, Mail, Search, CheckCircle, FileText, Calendar,
  DollarSign, Bell, AlertTriangle, Sunrise, Clock, ListChecks
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export default function OutboxPage() {
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
          style={{ background: 'radial-gradient(ellipse at top left, #2563eb, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#60a5fa' }}>
                <Mail size={11} strokeWidth={2.5} />
                Outbox & Daily Digest
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                Every email.<br />
                <span className="text-blue-400">Never lost.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Every quote, schedule, and payment reminder you've ever sent lives in one searchable place. And every morning, a digest tells you exactly what needs attention today.
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

            {/* Right — outbox row mockup */}
            <div className="rounded-2xl p-5 bg-slate-900 border border-white/10">
              <div className="flex items-center gap-3 mb-4 px-1">
                <Search size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500 font-medium">Search by name or email...</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Quote', name: 'Sarah Johnson', detail: '$450.00', color: '#f97316', icon: <DollarSign size={14} /> },
                  { label: 'Schedule', name: 'Mike Torres', detail: 'Jun 24', color: '#60a5fa', icon: <Calendar size={14} /> },
                  { label: 'Reminder', name: 'Dana Price', detail: '$1,200 due', color: '#fb923c', icon: <Bell size={14} /> },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${row.color}1a`, color: row.color }}>
                      {row.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold" style={{ color: row.color }}>{row.label}</p>
                      <p className="text-xs font-semibold text-white truncate">{row.name}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-300 shrink-0">{row.detail}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── OUTBOX: HOW IT WORKS ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-3">Outbox</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Every sent email, in one place.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search size={20} className="text-blue-500" />,
                title: 'Search and filter',
                desc: 'Find any email by customer name, email address, or date range. Filter by type — quotes, schedules, or payment reminders.',
              },
              {
                icon: <FileText size={20} className="text-orange-500" />,
                title: 'See the full breakdown',
                desc: 'Click any email to see exactly what was sent — quote line items, scheduled date and time, or amount due — plus who sent it and when.',
              },
              {
                icon: <CheckCircle size={20} className="text-emerald-500" />,
                title: 'Catch problems early',
                desc: 'Failed sends are flagged clearly. Possible accidental duplicates are flagged too, so nothing slips through unnoticed.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-slate-50 border border-slate-100"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white shadow-sm mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DAILY DIGEST ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#f97316' }}>
                <Sunrise size={11} />
                Pro Feature
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                One email.<br />
                <span className="text-slate-400">Everything that needs you today.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed">
                Every morning, the daily digest scans your entire business and tells you exactly what needs attention — so you start the day knowing, not guessing.
              </p>
            </div>

            {/* Right — digest mockup */}
            <div className="rounded-2xl p-6 bg-white shadow-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Sunrise size={16} className="text-orange-500" />
                <span className="text-xs font-black text-slate-900">Your morning digest</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: '3 jobs scheduled today', color: '#3b82f6' },
                  { label: '2 leads gone quiet', color: '#94a3b8' },
                  { label: '1 quote sent, no response yet', color: '#f97316' },
                  { label: '2 overdue payments', color: '#ef4444' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                    <span className="text-xs font-semibold text-slate-700">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Digest detail grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Calendar size={18} />, title: "Today's jobs", desc: 'Every job scheduled for today, with assigned crew and time.', color: '#3b82f6' },
              { icon: <Clock size={18} />, title: 'Stale leads', desc: 'Leads that have gone quiet with no recent activity or response.', color: '#94a3b8' },
              { icon: <FileText size={18} />, title: 'Unanswered quotes', desc: 'Quotes sent that haven\'t been accepted or declined yet.', color: '#f97316' },
              { icon: <DollarSign size={18} />, title: 'Completed, unpaid', desc: 'Jobs finished where payment status is still unpaid.', color: '#f59e0b' },
              { icon: <AlertTriangle size={18} />, title: 'Overdue payments', desc: 'Anything past its payment due date, flagged immediately.', color: '#ef4444' },
              { icon: <Bell size={18} />, title: 'Due this week', desc: 'Payments coming due within the next seven days.', color: '#fb923c' },
              { icon: <ListChecks size={18} />, title: 'Follow-up reminders', desc: 'Any follow-up you scheduled for today, surfaced automatically.', color: '#10b981' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-100">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 mb-0.5">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-white py-16 sm:py-24 border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Stop wondering what you sent.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Outbox and Daily Digest are both included on the Pro plan.
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