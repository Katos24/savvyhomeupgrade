// app/pricing/page.tsx

import { Check, X, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing | Lead2Project',
  description: 'Simple, transparent pricing. Start free, upgrade when you\'re ready.',
};

export default function PricingPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom, #0B3C6D, #0f172a)',
      }}
    >

      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">
          Lead2Project
        </Link>
        <Link
          href="/login"
          className="text-sm text-slate-400 hover:text-white transition font-medium"
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 px-4 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-6"
          style={{
            borderColor: 'rgba(92,203,58,0.4)',
            background: 'rgba(92,203,58,0.1)',
            color: '#5CCB3A',
          }}
        >
          <Sparkles className="w-3 h-3" /> Start free. No credit card required.
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
          One job pays for
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #1F5F8F, #5CCB3A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            the whole year
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-3">
          Stop losing leads to disorganization. Start running your business like a pro.
        </p>
        <p className="text-sm text-slate-500">
          Sign up in minutes · No demo needed · Cancel anytime
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">

          {/* Free */}
          <div
            className="border border-slate-700 p-8 flex flex-col"
            style={{ background: '#1e293b' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Free
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-white">$0</span>
              <span className="text-slate-400 text-sm">/forever</span>
            </div>

            <p className="text-slate-400 text-sm mb-8">
              See your leads come in. Upgrade when you're ready.
            </p>

            <Link
              href="/signup"
              className="block w-full py-3 text-center text-sm font-bold text-white transition mb-8"
              style={{ background: '#475569' }}
            >
              Get Started Free
            </Link>

            <div className="space-y-3 flex-1">
              {[
                'Booking link & QR code',
                'Basic form (name, email, phone)',
                'Lead dashboard (card view)',
                'View lead details',
                'Create leads manually',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#5CCB3A] flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Basic */}
          <div
            className="border border-slate-700 p-8 flex flex-col"
            style={{ background: '#1e293b' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Basic
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-white">$49.99</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>

            <p className="text-slate-400 text-sm mb-8">
              Full job management for growing crews
            </p>

            <Link
              href="/signup"
              className="block w-full py-3 text-center text-sm font-bold text-white transition mb-8"
              style={{ background: '#5CCB3A' }}
            >
              Start 14-Day Free Trial
            </Link>

            <div className="space-y-3 flex-1">
              {[
                'Custom booking form & branding',
                'Photo & doc uploads on cards',
                'Payment status tracking',
                'Custom pipeline stages',
                'Job categories, tasks & quote templates',
                'Job scheduling & quote builder',
                'Customer photo & video uploads',
                'CSV export for bookkeeping',
                'Unlimited team members',
                'Role-based permissions',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#5CCB3A] flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-700 space-y-3">
                {[
                  'One-click emails',
                  'AI Brief & Assistant',
                  'Custom email templates',
                  'Daily digest email',
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
          <div
            className="border-2 p-8 flex flex-col relative"
            style={{
              borderColor: '#5CCB3A',
              background: '#1e293b',
            }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span
                className="px-3 py-1 text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #1F5F8F, #5CCB3A)',
                }}
              >
                MOST POPULAR
              </span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-[#5CCB3A]" />
              <span className="text-xs font-bold text-[#5CCB3A] uppercase tracking-widest">
                Pro
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-white">$79.99</span>
              <span className="text-slate-400 text-sm">/month</span>
            </div>

            <p className="text-slate-400 text-sm mb-8">
              Automation + AI for serious contractors
            </p>

            <Link
              href="/signup"
              className="block w-full py-3 text-center text-sm font-bold text-white transition mb-8"
              style={{
                background: 'linear-gradient(135deg, #1F5F8F, #5CCB3A)',
              }}
            >
              Start 14-Day Free Trial
            </Link>

            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#5CCB3A] flex-shrink-0" />
                <span className="text-slate-300 text-sm font-semibold">
                  Everything in Basic
                </span>
              </div>

              {[
                'One-click emails (quote, schedule, reminder)',
                'Email outbox — full sent history',
                'Custom email templates',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#5CCB3A] flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{f}</span>
                </div>
              ))}

              <div
                className="pt-4 space-y-3"
                style={{
                  borderTop: '1px solid rgba(92,203,58,0.3)',
                }}
              >
                <p className="text-xs font-bold text-[#5CCB3A] uppercase tracking-widest">
                  AI Features
                </p>

                {[
                  'AI Brief on every lead',
                  'AI quote generator',
                  'AI Assistant — knows your whole business',
                  'AI photo & text analysis',
                  'Daily digest email',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#5CCB3A] flex-shrink-0" />
                    <span className="text-green-200 text-sm font-medium">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { stat: '$60K', label: 'Lost yearly from missed leads' },
            { stat: '1 job', label: 'Pays for an entire year' },
            { stat: '2 min', label: 'To set up — no demo needed' },
          ].map(({ stat, label }) => (
            <div
              key={stat}
              className="py-5 border border-slate-700"
              style={{ background: '#1e293b' }}
            >
              <div className="text-2xl font-extrabold text-[#5CCB3A] mb-1">
                {stat}
              </div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div
          className="max-w-2xl mx-auto text-center p-12 border"
          style={{
            borderColor: 'rgba(92,203,58,0.3)',
            background: 'rgba(92,203,58,0.05)',
          }}
        >
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Ready to get organized?
          </h2>

          <p className="text-slate-400 mb-8">
            Sign up free in 2 minutes. No credit card required. Upgrade when you're ready.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3 text-sm font-bold text-white transition inline-flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #1F5F8F, #5CCB3A)',
              }}
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="px-8 py-3 text-sm font-bold text-slate-300 border border-slate-600 hover:border-slate-400 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}