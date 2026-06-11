'use client';

import Link from 'next/link';
import { ArrowRight, FileText, CheckCircle, Sparkles, Send, ThumbsUp, ThumbsDown, Layers } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export default function QuotingPage() {

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
          style={{ background: 'radial-gradient(ellipse at top left, #f97316, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}>
                <FileText size={11} strokeWidth={2.5} />
                Quoting
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                Build a quote.<br />
                <span className="text-orange-400">Send it in seconds.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Add line items, set prices, and send a professional quote to your customer — all from the job card. They get an email where they can accept or decline. You see it instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
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
                src="/images/quote-send.webp"
                alt="Sending a quote in Lead2Project"
                className="w-full h-auto"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              From job to quoted in minutes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Layers size={20} className="text-orange-500" />,
                title: 'Build your line items',
                desc: 'Add labor, materials, and services with description, quantity, and unit price. The total calculates automatically.',
                color: 'rgba(249,115,22,0.08)',
                border: 'rgba(249,115,22,0.2)',
              },
              {
                icon: <Send size={20} className="text-blue-500" />,
                title: 'Send to customer',
                desc: 'One click sends a professional branded email to your customer with the full quote breakdown and total.',
                color: 'rgba(59,130,246,0.08)',
                border: 'rgba(59,130,246,0.2)',
              },
              {
                icon: <ThumbsUp size={20} className="text-emerald-500" />,
                title: 'They accept or decline',
                desc: 'Customer clicks Accept or Decline directly from their email. You see the response on the job card instantly.',
                color: 'rgba(16,185,129,0.08)',
                border: 'rgba(16,185,129,0.2)',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{ background: item.color, border: `1px solid ${item.border}` }}
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

      {/* ── QUOTE BUILDER ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3">Quote Builder</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Custom templates for<br />
                <span className="text-slate-400">every job type.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Build pricing templates for your most common job categories — roof replacement, AC install, drain cleaning. Next time that job comes in, your line items are already there. Just adjust quantities and send.
              </p>
              <div className="space-y-3">
                {[
                  'Templates saved per job category',
                  'Add, edit, or remove line items anytime',
                  'Unit price and quantity on every item',
                  'Total calculates automatically',
                  'Reuse across similar jobs instantly',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — screenshot */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="/images/quote-builder.webp"
                alt="Quote builder pricing template in Lead2Project"
                className="w-full h-auto"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── ACCEPT / DECLINE ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3">Customer Response</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Customer accepts.<br />
                <span className="text-slate-400">You get notified.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-8">
                Your customer receives a clean email with every line item laid out clearly. They click Accept or Decline — no account needed, no friction. The moment they respond the job card updates automatically so you always know where things stand.
              </p>
              <div className="space-y-3">
                {[
                  'Customer sees full line item breakdown',
                  'One click to accept or decline',
                  'No customer account required',
                  'Job card updates the moment they respond',
                  'Accepted quotes flow straight to invoicing',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — accept/decline mockup */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">Quote from Peak Pro Roofing</span>
              </div>
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm">P</div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Peak Pro Roofing</p>
                    <p className="text-[11px] text-slate-400">Your quote is ready to review</p>
                  </div>
                </div>

                <p className="text-sm font-black text-slate-900 mb-4">Quote for Sarah Johnson</p>

                <div className="rounded-xl overflow-hidden border border-slate-100 mb-4">
                  {[
                    { desc: 'Roof inspection & assessment', qty: 1, price: '$250.00' },
                    { desc: 'Labor — detailed scope', qty: 1, price: '$150.00' },
                    { desc: 'Materials & documentation', qty: 1, price: '$50.00' },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{row.desc}</p>
                        <p className="text-[10px] text-slate-400">Qty {row.qty}</p>
                      </div>
                      <p className="text-xs font-black text-slate-900">{row.price}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Total</p>
                    <p className="text-sm font-black text-orange-500">$450.00</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-slate-600 transition-all" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                    <ThumbsDown size={13} />
                    Decline
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-white transition-all" style={{ background: '#10b981' }}>
                    <ThumbsUp size={13} />
                    Accept Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI QUOTE GENERATOR ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — AI mockup */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Sparkles size={14} className="text-violet-500" />
                </div>
                <span className="text-xs font-black text-violet-500 uppercase tracking-widest">AI Suggestions</span>
                <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>Pro Plan</span>
              </div>

              <p className="text-xs font-bold text-slate-500 mb-4">Based on: Roof inspection — suspected leak near chimney flashing</p>

              <div className="space-y-2 mb-5">
                {[
                  { label: 'Chimney flashing repair', price: '$320.00' },
                  { label: 'Roof inspection & report', price: '$150.00' },
                  { label: 'Sealant & materials', price: '$85.00' },
                  { label: 'Labor (3 hours)', price: '$375.00' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border-2 border-violet-300 flex items-center justify-center">
                        <CheckCircle size={10} className="text-violet-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.price}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 rounded-xl text-xs font-black text-white" style={{ background: '#8b5cf6' }}>
                Add Selected to Quote
              </button>
            </div>

            {/* Right — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#8b5cf6' }}>
                <Sparkles size={11} />
                Pro Feature
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                AI suggests your line items.<br />
                <span className="text-slate-400">You decide what to add.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                On the Pro plan, AI reads the job description and suggests relevant line items for your quote. Review the suggestions, check the ones you want, and add them in one click. You stay in control — AI just saves you the setup time.
              </p>
              <div className="space-y-3">
                {[
                  'Suggestions based on the actual job description',
                  'Pick and choose what to include',
                  'Edit any item before adding',
                  'Custom quote templates also available',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU CAN DO ── */}
      <section className="bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Everything in one quote.
            </h2>
            <p className="text-slate-400 font-medium text-base max-w-xl mx-auto">
              All quote tools live on the job card. No separate app. No copy-pasting into email.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Layers size={16} />, label: 'Line items with qty and price', color: '#f97316' },
              { icon: <FileText size={16} />, label: 'Auto-calculated total', color: '#3b82f6' },
              { icon: <Send size={16} />, label: 'One-click email to customer', color: '#10b981' },
              { icon: <ThumbsUp size={16} />, label: 'Customer accept or decline', color: '#f59e0b' },
              { icon: <Sparkles size={16} />, label: 'AI line item suggestions (Pro)', color: '#8b5cf6' },
              { icon: <CheckCircle size={16} />, label: 'Custom quote templates', color: '#10b981' },
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
            Stop quoting by text message.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Set up in 2 minutes. Send your first quote today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
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