'use client';

import Link from 'next/link';
import type { IndustryContent } from '@/lib/industry-content';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export default function IndustryLandingPage({ content }: { content: IndustryContent }) {
  return (
    <>
      <Nav />

      <main style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* HERO */}
        <section className="bg-slate-900 pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="inline-block text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border"
              style={{ color: content.color, borderColor: `${content.color}40`, background: `${content.color}15` }}
            >
              {content.badge}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
              {content.hero.headline}
            </h1>
            <p className="text-lg text-slate-400 font-bold max-w-2xl mx-auto mb-10 leading-relaxed">
              {content.hero.sub}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all active:scale-95 border-2 border-slate-700"
                style={{ background: content.color }}
              >
                {content.hero.cta}
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-700 text-white font-black text-sm hover:bg-slate-800 transition-all"
              >
                {content.hero.demoLabel}
              </a>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-slate-800 border-y-2 border-slate-700">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
            {content.stats.map((stat, i) => (
              <div
                key={i}
                className={`py-8 px-6 text-center ${i < content.stats.length - 1 ? 'border-r border-slate-700' : ''}`}
              >
                <div
                  className="text-3xl font-black mb-1 tracking-tight"
                  style={{ color: content.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-slate-300 mb-1">{stat.label}</div>
                {stat.note && <div className="text-xs text-slate-500 font-bold">{stat.note}</div>}
              </div>
            ))}
          </div>
        </section>

        {/* PAIN POINTS */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-center mb-12">
              {content.pain.headline}
            </h2>
            <div className="space-y-4">
              {content.pain.points.map((point, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-400 font-black text-xs">x</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">{point}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 font-bold text-sm mt-8">
              Lead2Project fixes all of this. With one link.
            </p>
          </div>
        </section>

        {/* FORM DEMO */}
        <section className="py-20 px-6 bg-slate-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: content.color }}
              >
                What your customers see
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                They fill it out. You see it instantly.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto items-start">
              {/* Form mockup */}
              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-6">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                  lead2project.com/your-business
                </p>
                <p className="text-sm font-black text-white mb-6">New {content.name} Request</p>
                {content.formFields.map((field, i) => (
                  <div key={i} className="mb-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      {field.label}
                    </p>
                    {field.type === 'textarea' ? (
                      <div className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-400 min-h-16 leading-relaxed">
                        {field.placeholder}
                      </div>
                    ) : (
                      <div className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-400">
                        {field.placeholder}
                      </div>
                    )}
                  </div>
                ))}
                <div
                  className="w-full py-3 rounded-xl text-center text-xs font-black text-white mt-2"
                  style={{ background: content.color }}
                >
                  Submit Request
                </div>
              </div>

              {/* Board card mockup */}
              <div className="bg-slate-800 border-2 rounded-2xl p-6" style={{ borderColor: `${content.color}40` }}>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-xs font-black px-3 py-1 rounded-full border"
                    style={{ color: content.color, borderColor: `${content.color}40`, background: `${content.color}15` }}
                  >
                    NEW LEAD
                  </span>
                  <span className="text-xs text-slate-500 font-bold">just now</span>
                </div>
                <p className="text-base font-black text-white mb-2">
                  {content.formFields[0].placeholder}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {content.formFields[content.formFields.length - 1].placeholder.slice(0, 80)}...
                </p>
                <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold">{content.name}</span>
                  <span
                    className="text-xs font-black px-3 py-1 rounded-lg text-white"
                    style={{ background: '#7c3aed' }}
                  >
                    AI Brief
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: content.color }}
              >
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Up and running in 3 steps.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {content.howItWorks.map((step, i) => (
                <div key={i}>
                  <p
                    className="text-4xl font-black mb-4 opacity-30"
                    style={{ color: content.color }}
                  >
                    {step.step}
                  </p>
                  <h3 className="text-base font-black text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: content.color }}
              >
                Everything included
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Built for how you actually work.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {content.features.map((feature, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-emerald-300 transition-all"
                >
                  <h3 className="text-sm font-black text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 font-bold leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EMAIL PREVIEW */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: content.color }}
              >
                Branded emails
              </p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                Customers think you have a whole office.
              </h2>
              <p className="text-slate-500 font-bold leading-relaxed">
                Every submission triggers a professional confirmation email with your business name. No extra setup required.
              </p>
            </div>
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-400 mb-4">
                <span className="text-slate-900 font-black">Subject:</span> {content.emailPreview.subject}
              </p>
              <div className="border-t border-slate-200 pt-4 space-y-2">
                {content.emailPreview.bodyLines.map((line, i) => (
                  <p key={i} className={`text-sm font-bold leading-relaxed ${i === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p
                className="text-xs font-black uppercase tracking-widest mb-3"
                style={{ color: content.color }}
              >
                Pricing
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                {content.pricing.headline}
              </h2>
              <p className="text-slate-500 font-bold">{content.pricing.sub}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {[
                {
                  name: 'Growth',
                  price: '$49.99',
                  desc: 'Full job management for growing crews',
                  features: ['Booking link and QR code', 'Unlimited leads', 'Job board and calendar', 'Quote builder', 'CSV export for bookkeeping', 'Unlimited team members'],
                  highlight: false,
                },
                {
                  name: 'Pro',
                  price: '$79.99',
                  desc: 'Automation and AI for serious contractors',
                  features: ['Everything in Growth', 'One-click emails', 'Full email outbox', 'Daily 6AM digest', 'AI job briefs', 'AI quote generator'],
                  highlight: true,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 border-2 ${plan.highlight ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                >
                  {plan.highlight && (
                    <p
                      className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: content.color }}
                    >
                      Most Popular
                    </p>
                  )}
                  <p className={`text-sm font-black mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </p>
                  <p className={`text-3xl font-black tracking-tight mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.price}<span className={`text-sm font-bold ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>/mo</span>
                  </p>
                  <p className={`text-xs font-bold mb-6 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.desc}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`text-xs font-bold flex items-center gap-2 ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="text-emerald-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`block text-center py-3 rounded-xl text-xs font-black transition-all ${plan.highlight ? 'text-white' : 'text-white'}`}
                    style={{ background: plan.highlight ? content.color : '#0f172a' }}
                  >
                    Start Free
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 px-6 bg-slate-900 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Ready to stop losing leads?
            </h2>
            <p className="text-slate-400 font-bold mb-10 leading-relaxed">
              Set up your {content.name.toLowerCase()} booking link in 60 seconds. Free to start.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all active:scale-95 border-2 border-slate-700"
              style={{ background: content.color }}
            >
              Get Your Free Booking Link
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}