'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, FormInput, Smartphone, CheckCircle, MapPin, Wrench, FileText, CalendarDays, HelpCircle, Clock, Star } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { FormCard } from '@/components/marketing/HeroStoryStrip';

/* ─────────────────────────────────────────────────────────
   /features/lead-capture
   SEO: QR code lead capture, contractor booking form,
        lead intake for roofers, contractor lead management
   ───────────────────────────────────────────────────────── */

export default function LeadCapturePage() {
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
          style={{ background: 'radial-gradient(ellipse at top left, #10b981, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-[10px] font-black uppercase tracking-widest"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
                <QrCode size={11} strokeWidth={2.5} />
                Lead Capture
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[0.95] mb-6">
                Turn every truck<br />
                <span className="text-emerald-400">into a lead machine.</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-400 font-medium leading-relaxed max-w-xl mb-10">
                Your yard sign gets 200 looks and 3 calls. The rest drive by and forget your number. A booking link and QR code captures leads while you're on the job — no missed calls, no scrap paper.
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

            {/* Right — QR Image */}
            <div className="hidden lg:block rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <img
                src="/images/qrbranded2.webp"
                alt="Branded QR code for contractor lead capture"
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
            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Three steps. Zero effort.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <QrCode size={20} className="text-emerald-500" />,
                title: 'Blast your link',
                desc: 'Get a custom QR code and booking link instantly. Put it on your truck, yard signs, business cards, social bios, door hangers — everywhere.',
                color: 'rgba(16,185,129,0.08)',
                border: 'rgba(16,185,129,0.2)',
              },
              {
                icon: <FormInput size={20} className="text-blue-500" />,
                title: 'Customer fills your form',
                desc: 'They scan or tap your link and fill out your branded form — name, phone, service needed, photos, preferred date — whatever you configure.',
                color: 'rgba(59,130,246,0.08)',
                border: 'rgba(59,130,246,0.2)',
              },
              {
                icon: <Smartphone size={20} className="text-orange-500" />,
                title: 'Lead hits your board',
                desc: 'The lead lands on your dashboard instantly with every detail and photo attached. No manual entry, no lost paper, no missed jobs.',
                color: 'rgba(249,115,22,0.08)',
                border: 'rgba(249,115,22,0.2)',
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

      {/* ── CUSTOM FORMS ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Custom Forms</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Your brand.<br />
                <span className="text-slate-400">Your questions. Your rules.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Every form is fully customizable — your logo, your colors, your service categories. Add custom questions, dropdown fields, and let customers attach photos or video of the job before you even pick up the phone.
              </p>
              <div className="space-y-3">
                {[
                  'Your logo and brand colors',
                  'Custom questions and dropdowns',
                  'Photo and video uploads',
                  'Preferred date and time selection',
                  'Address and service category toggle',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <span className="text-sm font-semibold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form mockup */}
            <div className="max-w-[360px] mx-auto lg:mx-0">
              <FormCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── QR CODE ── */}
      <section className="bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">QR Code</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                One code.<br />
                <span className="text-slate-400">Everywhere.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-8">
                Your custom QR code links directly to your branded booking form. Print it once, use it everywhere. Every scan is a potential job.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Truck wraps',
                  'Yard signs',
                  'Business cards',
                  'Social media bios',
                  'Door hangers',
                  'Estimate sheets',
                ].map((place, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">{place}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="/images/qr-scan-2.webp"
                alt="Contractor scanning QR code on work truck"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── GOOGLE BUSINESS PROFILE ── */}
      <section className="bg-slate-50 py-16 sm:py-24 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — mockup */}
            <div className="rounded-2xl p-6 bg-white shadow-xl border border-slate-200 order-2 lg:order-1">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-sm">G</div>
                <div>
                  <p className="text-xs font-black text-slate-900">Peak Pro Roofing</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1">4.9 (128)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-500 mb-3">Booking link</p>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-700">lead2project.com/peak-pro</span>
                <ArrowRight size={14} className="text-emerald-600" />
              </div>
            </div>

            {/* Right — text */}
            <div className="order-1 lg:order-2">
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3">Google Business Profile</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-4">
                Capture leads<br />
                <span className="text-slate-400">straight from Google.</span>
              </h2>
              <p className="text-base text-slate-600 font-medium leading-relaxed mb-6">
                Add your booking link to your Google Business Profile so the people already searching for your service can book directly — no extra click to your website, no phone tag.
              </p>
              <div className="space-y-3">
                {[
                  'Add your link as the booking button on your profile',
                  'Capture leads from Google Search and Maps',
                  'Same branded form, same custom questions',
                  'Leads land on your board exactly like any other source',
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

      {/* ── WHAT YOU GET ── */}
      <section className="bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
              Every lead arrives complete.
            </h2>
            <p className="text-slate-400 font-medium text-base max-w-xl mx-auto">
              No chasing details. No phone tag. Everything you need to quote the job lands on your board instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: <Smartphone size={16} />, label: 'Full name & phone', color: '#3b82f6' },
              { icon: <MapPin size={16} />, label: 'Job address', color: '#ef4444' },
              { icon: <Wrench size={16} />, label: 'Service category', color: '#10b981' },
              { icon: <FormInput size={16} />, label: 'Photos & videos', color: '#f59e0b' },
              { icon: <FileText size={16} />, label: 'Job description', color: '#94a3b8' },
              { icon: <CalendarDays size={16} />, label: 'Preferred date & time', color: '#3b82f6' },
              { icon: <HelpCircle size={16} />, label: 'Custom question answers', color: '#f59e0b' },
              { icon: <Clock size={16} />, label: 'Submission timestamp', color: '#10b981' },
              { icon: <QrCode size={16} />, label: 'QR or link source', color: '#f59e0b' },
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
            Stop losing leads to forgotten numbers.
          </h2>
          <p className="text-base text-slate-500 font-medium mb-8">
            Set up in 2 minutes. Get your QR code today.
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