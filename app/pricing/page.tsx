// app/pricing/page.tsx

import { Check, X, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing | Lead2Project',
  description: 'Simple, transparent pricing. Choose the plan that fits your business.',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-white font-bold text-lg tracking-tight">Lead2Project</span>
        <Link href="/login" className="text-sm text-slate-400 hover:text-white transition font-medium">
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3 h-3" /> Now with AI Assistant
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
          One job pays for<br />
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            the whole year
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-3">
          Stop losing leads to disorganization. Start running your business like a pro.
        </p>
        <p className="text-sm text-slate-500">14-day free trial · No credit card required · Cancel anytime</p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

          {/* Basic */}
          <div className="border border-slate-700 p-8 flex flex-col" style={{ background: '#1e293b' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Basic</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-white">$49</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Lead tracking for solo contractors</p>

            <Link href="/signup?plan=basic"
              className="block w-full py-3 text-center text-sm font-bold text-white border border-slate-600 hover:border-slate-400 hover:bg-white/5 transition mb-8">
              Start Free Trial
            </Link>

            <div className="space-y-3 flex-1">
              {[
                'Unlimited leads',
                'Cards + table view',
                'Status management',
                'Customer contact form',
                'Email / call / text actions',
                'Activity log & notes',
                'CSV export',
                'Mobile friendly',
                'Email support',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-700 space-y-3">
                {[
                  'AI Brief on every job',
                  'AI Assistant chat',
                  'Projects, quotes & payments',
                  'Repeat customer detection',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 opacity-40">
                    <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 text-sm">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro */}
          <div className="border-2 border-indigo-500 p-8 flex flex-col relative" style={{ background: '#1e293b' }}>
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                ⭐ MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Pro</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-white">$99</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>
            <p className="text-slate-400 text-sm mb-8">Full job management + AI</p>

            <Link href="/signup?plan=pro"
              className="block w-full py-3 text-center text-sm font-bold text-white transition mb-8"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Start Free Trial
            </Link>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 text-sm font-semibold">Everything in Basic</span>
              </div>
              {[
                'Convert leads to projects',
                'Quotes & payment tracking',
                'Tasks & scheduling',
                'Docs & photo management',
                'Repeat customer detection',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-indigo-500/30 space-y-3">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">AI Features</p>
                {[
                  'AI Brief on every job card',
                  'AI Assistant — knows your whole business',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-indigo-200 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-3xl mx-auto mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { stat: '$60K', label: 'Lost yearly from missed leads' },
            { stat: '1 job', label: 'Pays for an entire year' },
            { stat: '30 sec', label: 'AI brief on any job' },
          ].map(({ stat, label }) => (
            <div key={stat} className="py-5 border border-slate-700" style={{ background: '#1e293b' }}>
              <div className="text-2xl font-extrabold text-white mb-1">{stat}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24 px-4 border-t border-slate-800">
        <div className="max-w-2xl mx-auto pt-16">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Common questions</h2>
          <div className="space-y-3">
            {[
              {
                q: 'Is there a free trial?',
                a: '14 days free on both plans. No credit card required to start.',
              },
              {
                q: 'Can I switch plans later?',
                a: 'Yes — upgrade or downgrade anytime. Changes take effect immediately.',
              },
              {
                q: "What's the AI Assistant?",
                a: "A chat window on your dashboard that knows all your jobs. Ask it things like \"who hasn't paid?\" or \"what's scheduled this week?\" and it answers instantly using your real data.",
              },
              {
                q: 'Are there contracts?',
                a: 'Month-to-month only. Cancel anytime, no questions asked.',
              },
              {
                q: 'What if I just need lead tracking?',
                a: 'Basic is a solid lead tracker — unlimited leads, status management, contact actions. When you want full projects with quotes and AI, upgrade to Pro.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="border border-slate-700 group" style={{ background: '#1e293b' }}>
                <summary className="px-5 py-4 text-sm font-semibold text-white cursor-pointer list-none flex justify-between items-center">
                  {q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center border border-indigo-500/30 p-12"
          style={{ background: 'rgba(99,102,241,0.05)' }}>
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to get organized?</h2>
          <p className="text-slate-400 mb-8">Start your free trial today. No credit card needed.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/signup?plan=pro"
              className="px-8 py-3 text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Start Free Trial
            </Link>
            <Link href="/login"
              className="px-8 py-3 text-sm font-bold text-slate-300 border border-slate-600 hover:border-slate-400 transition">
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}