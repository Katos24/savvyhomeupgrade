'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, Clock, User, Mail, CheckCircle, ChevronRight } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export default function SchedulingPage() {

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
      <Nav />

      {/* ── HERO ── */}
      <section className="relative bg-slate-950 pt-24 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Emerald glow */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #10b981, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                <Calendar size={11} strokeWidth={2.5} />
                Scheduling
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                Every job.<br />
                <span className="text-emerald-400">A time and a place.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-10">
                Assign a date, time, and technician to any job in seconds. Customer gets a notification automatically. No back and forth. No missed appointments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
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

            {/* Right — screenshot */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src="/images/schedule-screen.webp"
                alt="Scheduling a job in Lead2Project"
                className="w-full h-auto"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── WHAT SCHEDULING LOOKS LIKE ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Schedule a job in under a minute.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                icon: <Calendar size={20} className="text-emerald-500" />,
                title: 'Pick a date and time',
                desc: 'Open any job card and set the scheduled date, arrival window, and estimated hours. Done in 10 seconds.',
                color: 'rgba(16,185,129,0.08)',
                border: 'rgba(16,185,129,0.2)',
              },
              {
                step: '2',
                icon: <User size={20} className="text-blue-500" />,
                title: 'Assign to a tech',
                desc: 'Pick who is doing the job from your team list. Every team member sees their assigned jobs in one place.',
                color: 'rgba(59,130,246,0.08)',
                border: 'rgba(59,130,246,0.2)',
              },
              {
                step: '3',
                icon: <Mail size={20} className="text-violet-500" />,
                title: 'Customer gets notified',
                desc: 'One click sends a branded scheduling email to the customer — date, time, who is coming. They are informed, you move on.',
                color: 'rgba(139,92,246,0.08)',
                border: 'rgba(139,92,246,0.2)',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ background: item.color, border: `1px solid ${item.border}` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Step {item.step}</span>
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE NOTIFICATION EMAIL ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Customer Email</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                They know when you're coming.<br />
                <span className="text-slate-400">Without you making a call.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-8">
                One click sends a clean, branded notification to your customer with the job date, arrival time, and who is assigned. It comes from your business name, not a generic sender. No customer confirmation needed — it is purely informational so they are ready for you.
              </p>
              <div className="space-y-3">
                {[
                  'Branded with your company name',
                  'Shows scheduled date and time',
                  'Shows assigned technician name',
                  'Sent from your outbox — fully tracked',
                  'No customer action required',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — email mockup */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              {/* Email header bar */}
              <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">Schedule Confirmation</span>
              </div>
              {/* Email body */}
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Peak Pro Roofing</p>
                    <p className="text-[11px] text-slate-400">hello@peakproroofing.com</p>
                  </div>
                </div>
                <p className="text-sm font-black text-slate-900 mb-1">Your appointment is confirmed</p>
                <p className="text-xs text-slate-500 mb-5">Hi Sarah — here are the details for your upcoming service.</p>

                <div className="rounded-xl p-4 space-y-3 mb-5" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  {[
                    { icon: <Calendar size={13} className="text-emerald-500" />, label: 'Date', value: 'Tuesday, June 17, 2026' },
                    { icon: <Clock size={13} className="text-blue-500" />, label: 'Time', value: '9:00 AM – 11:00 AM' },
                    { icon: <User size={13} className="text-violet-500" />, label: 'Technician', value: 'Mike Castellano' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                        {row.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.label}</p>
                        <p className="text-xs font-bold text-slate-800">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 font-medium">Questions? Call us at (631) 555-0182</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALENDAR VIEW ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — calendar mockup */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
              <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-black text-white">June 2026</span>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <ChevronRight size={12} className="text-white rotate-180" />
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <ChevronRight size={12} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4">
                {/* Days of week */}
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty first cells */}
                  {[...Array(0)].map((_, i) => <div key={`e${i}`} />)}
                  {[...Array(30)].map((_, i) => {
                    const day = i + 1;
                    const hasJob = [3, 7, 10, 11, 14, 17, 18, 22, 24, 28].includes(day);
                    const isToday = day === 11;
                    return (
                      <div
                        key={day}
                        className={`relative aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all
                          ${isToday ? 'bg-emerald-500 text-white' : hasJob ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {day}
                        {hasJob && !isToday && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500">Today</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-900" />
                    <span className="text-[10px] font-bold text-slate-500">Jobs scheduled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — text */}
            <div>
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3">Calendar View</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                See your whole week at a glance.
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Switch from board view to calendar view any time. Every scheduled job shows on the date it is assigned. No more double booking. No more wondering who is where on Tuesday.
              </p>
              <div className="space-y-3">
                {[
                  'All jobs plotted by scheduled date',
                  'Click any day to see job details',
                  'Spot gaps and openings instantly',
                  'Switch between board and calendar freely',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN SET ── */}
      <section className="bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Everything you need to set a job.
            </h2>
            <p className="text-slate-400 font-medium text-base max-w-xl mx-auto">
              All scheduling fields live on the job card. No separate calendar app. No switching tools.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Calendar size={16} />, label: 'Scheduled Date', color: '#10b981' },
              { icon: <Clock size={16} />, label: 'Arrival Time', color: '#3b82f6' },
              { icon: <User size={16} />, label: 'Assigned Technician', color: '#8b5cf6' },
              { icon: <Clock size={16} />, label: 'Estimated Hours', color: '#f59e0b' },
              { icon: <Mail size={16} />, label: 'One-Click Customer Email', color: '#10b981' },
              { icon: <CheckCircle size={16} />, label: 'Outbox Confirmation', color: '#3b82f6' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div style={{ color: item.color }}>{item.icon}</div>
                <span className="text-xs font-bold text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-white py-16 sm:py-24 border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">
            Stop scheduling by text.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Set up in 2 minutes. Your first scheduled job goes out today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
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