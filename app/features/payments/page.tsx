'use client';

import Link from 'next/link';
import { ArrowRight, CreditCard, FileText, Bell, CheckCircle, Download, Send, Clock, DollarSign, AlertCircle } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';

export default function PaymentPage() {

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
          className="absolute top-0 right-0 w-[600px] h-[400px] opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, #f59e0b, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                <CreditCard size={11} strokeWidth={2.5} />
                Payments & Invoicing
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                Get paid.<br />
                <span className="text-amber-400">Stay on top of it.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Track payment status on every job. Generate a branded invoice PDF and email it with a payment link in one click. Send reminders for anything still outstanding.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
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

            {/* Right — payment screen screenshot */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src="/images/payment-screen.png"
                alt="Payment hub in Lead2Project"
                className="w-full h-auto"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── PAYMENT HUB ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Payment Hub</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Every job has a payment status.
            </h2>
            <p className="text-base text-slate-500 font-medium mt-4 max-w-2xl mx-auto">
              Record how much was collected, which method they used, and when it was paid. The progress bar shows settlement at a glance — no digging through notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <DollarSign size={20} className="text-amber-500" />,
                title: 'Record any payment',
                desc: 'Log the amount collected, payment method — cash, check, Venmo, Zelle, CashApp — and the date paid. Supports partial payments too.',
                color: 'rgba(245,158,11,0.08)',
                border: 'rgba(245,158,11,0.2)',
              },
              {
                icon: <CheckCircle size={20} className="text-emerald-500" />,
                title: 'Mark as paid in full',
                desc: 'One click marks the job settled. The progress bar goes green, the job card updates, and it shows as paid in your financials export.',
                color: 'rgba(16,185,129,0.08)',
                border: 'rgba(16,185,129,0.2)',
              },
              {
                icon: <Clock size={20} className="text-blue-500" />,
                title: 'Set a due date',
                desc: 'Assign a payment due date to any job. Outstanding jobs past their due date surface automatically so nothing slips through.',
                color: 'rgba(59,130,246,0.08)',
                border: 'rgba(59,130,246,0.2)',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: item.color, border: `1px solid ${item.border}` }}>
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

      {/* ── INVOICE ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Invoicing</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Professional invoice.<br />
                <span className="text-slate-400">Sent in one click.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Generate a branded PDF invoice from the job and email it to your customer automatically. Your logo, your colors, every line item listed cleanly. The PDF attaches to the email so they can save and pay it on their own time.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Your logo and brand colors on every invoice',
                  'Auto-numbered invoice IDs — INV-001, INV-002',
                  'Full line item breakdown from your quote',
                  'Due date shown clearly if set',
                  'PDF attached to email for easy saving',
                  'Payment link button included in the email',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — invoice PDF preview */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">Invoice-INV-008.pdf</span>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500">
                  <Download size={11} />
                  <span>Download</span>
                </div>
              </div>
              {/* Invoice mockup matching real PDF style */}
              <div className="bg-white p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-2 border border-slate-200">
                      <span className="text-xs font-black text-slate-500">LOGO</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">Peak Pro Roofing</p>
                    <p className="text-xs text-slate-400">(631) 555-0182</p>
                    <p className="text-xs text-slate-400">hello@peakproroofing.com</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 mb-2">INVOICE</p>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-4 justify-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Invoice #</span>
                        <span className="text-xs font-black text-slate-900">INV-008</span>
                      </div>
                      <div className="flex items-center gap-4 justify-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</span>
                        <span className="text-xs font-bold text-slate-900">June 11, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill To</p>
                  <p className="text-xs font-black text-slate-900">Sarah Johnson</p>
                  <p className="text-[11px] text-slate-400">sarah.j@email.com</p>
                </div>

                <div className="rounded-lg overflow-hidden border border-slate-100 mb-4">
                  <div className="grid grid-cols-12 px-3 py-2 bg-slate-50">
                    <div className="col-span-6 text-[9px] font-black text-slate-500 uppercase tracking-wider">Description</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-500 uppercase tracking-wider text-center">Qty</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right">Price</div>
                    <div className="col-span-2 text-[9px] font-black text-slate-500 uppercase tracking-wider text-right">Total</div>
                  </div>
                  {[
                    { desc: 'Roof inspection & report', qty: 1, price: '$250.00', total: '$250.00' },
                    { desc: 'Labor — detailed scope', qty: 1, price: '$150.00', total: '$150.00' },
                    { desc: 'Materials & supplies', qty: 1, price: '$50.00', total: '$50.00' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 px-3 py-2 border-t border-slate-50">
                      <div className="col-span-6 text-[11px] text-slate-700 font-medium">{row.desc}</div>
                      <div className="col-span-2 text-[11px] text-slate-500 text-center">{row.qty}</div>
                      <div className="col-span-2 text-[11px] text-slate-500 text-right">{row.price}</div>
                      <div className="col-span-2 text-[11px] font-bold text-slate-900 text-right">{row.total}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 px-3 py-2.5 bg-slate-900 mt-1">
                    <div className="col-span-10 text-[10px] font-black text-white uppercase tracking-wider">Total Due</div>
                    <div className="col-span-2 text-sm font-black text-amber-400 text-right">$450.00</div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">Thank you for your business.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PAYMENT LINK IN EMAIL ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — email mockup */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">Invoice from Peak Pro Roofing</span>
              </div>
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-sm">P</div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Peak Pro Roofing</p>
                    <p className="text-[11px] text-slate-400">Invoice INV-008 — $450.00</p>
                  </div>
                </div>

                {/* Pay now button */}
                <div className="rounded-xl p-4 text-center mb-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pay securely online</p>
                  <button className="w-full py-3 rounded-xl text-sm font-black text-white mb-2" style={{ background: '#f59e0b' }}>
                    Pay with Venmo — $450.00
                  </button>
                  <button className="w-full py-2.5 rounded-xl text-xs font-black text-slate-700" style={{ background: '#f1f5f9' }}>
                    Download Invoice PDF
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-medium mb-1">Hi Sarah,</p>
                <p className="text-xs text-slate-500 font-medium mb-3">Please find your invoice <strong className="text-slate-800">INV-008</strong> from Peak Pro Roofing attached below.</p>

                <div className="rounded-lg px-3 py-2.5 mb-3" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <p className="text-[11px] font-bold text-amber-800">Payment Due: June 25, 2026</p>
                </div>

                <p className="text-[11px] text-slate-400">Questions? Call us at (631) 555-0182</p>
              </div>
            </div>

            {/* Right — text */}
            <div>
              <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Payment Link</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Invoice email includes<br />
                <span className="text-slate-400">a pay now button.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                If you have a Venmo, Zelle, CashApp, or PayPal link set up, it appears as a prominent pay button inside the invoice email. Customer clicks it and pays directly. No back and forth, no awkward money conversations.
              </p>
              <div className="space-y-3">
                {[
                  'Venmo, Zelle, CashApp, PayPal supported',
                  'Pay button sits above the invoice in the email',
                  'PDF invoice attached for their records',
                  'Due date highlighted if set',
                  'All emails tracked in your outbox',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── PAYMENT REMINDERS ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">Payment Reminders</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Stop chasing payments<br />
                <span className="text-slate-400">by text.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Any job that is unpaid or partial gets a one-click payment reminder. A professional email goes to the customer with the outstanding balance and your payment link. Rate limited to once every 24 hours so you never over-send.
              </p>
              <div className="space-y-3">
                {[
                  'One click sends a branded reminder email',
                  'Shows outstanding balance clearly',
                  'Includes payment link for instant pay',
                  'Rate limited — max once per 24 hours per job',
                  'Sent status tracked in your outbox',
                  'Works from the job card or financials page',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — reminder email mockup */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-slate-400 font-medium">Payment Reminder</span>
              </div>
              <div className="bg-white p-6">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-sm">P</div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Peak Pro Roofing</p>
                    <p className="text-[11px] text-slate-400">Friendly payment reminder</p>
                  </div>
                </div>

                <div className="rounded-xl p-4 mb-4 text-center" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                  <p className="text-2xl font-black text-slate-900">$450.00</p>
                  <p className="text-[11px] text-slate-400 mt-1">Invoice INV-008 · Due June 25, 2026</p>
                </div>

                <p className="text-xs text-slate-500 mb-3">Hi Sarah, this is a friendly reminder that your payment of <strong className="text-slate-800">$450.00</strong> for your recent service is still outstanding.</p>

                <button className="w-full py-3 rounded-xl text-sm font-black text-white mb-3" style={{ background: '#f59e0b' }}>
                  Pay with Venmo — $450.00
                </button>

                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <Bell size={12} className="text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-slate-500">Reminder sent · tracked in your outbox</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Everything in one payment hub.
            </h2>
            <p className="text-slate-400 font-medium text-base max-w-xl mx-auto">
              All payment tools live on the job card. No separate invoicing app. No chasing people by text.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <CreditCard size={16} />, label: 'Paid, partial, unpaid status', color: '#f59e0b' },
              { icon: <DollarSign size={16} />, label: 'Record payment amount and method', color: '#10b981' },
              { icon: <Clock size={16} />, label: 'Payment due date tracking', color: '#3b82f6' },
              { icon: <FileText size={16} />, label: 'Branded PDF invoice generation', color: '#f97316' },
              { icon: <Send size={16} />, label: 'One-click invoice email', color: '#8b5cf6' },
              { icon: <Download size={16} />, label: 'PDF attached to email', color: '#10b981' },
              { icon: <CheckCircle size={16} />, label: 'Venmo, Zelle, CashApp, PayPal link', color: '#f59e0b' },
              { icon: <Bell size={16} />, label: 'Payment reminder emails', color: '#ef4444' },
              { icon: <AlertCircle size={16} />, label: 'Outstanding jobs surfaced automatically', color: '#3b82f6' },
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
            Know exactly who owes you money.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Set up in 2 minutes. Send your first invoice today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-white font-black text-sm hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
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