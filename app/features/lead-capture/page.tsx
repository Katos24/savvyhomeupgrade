'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, Camera, FormInput, Smartphone, Check, Sparkles, Zap, MapPin, Wrench, FileText, CalendarDays, HelpCircle, Clock } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { FormCard } from '@/components/marketing/HeroStoryStrip';

/* ─────────────────────────────────────────────────────────
   /features/lead-capture
   SEO: QR code lead capture, contractor booking form,
        lead intake for roofers, contractor lead management
   ───────────────────────────────────────────────────────── */

export default function LeadCapturePage() {
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
                <QrCode size={14} className="text-yellow-400" />
                <span className="text-[9px] sm:text-[10px] font-black text-white tracking-[0.15em] uppercase">Lead Capture</span>
              </div>

              <h1 className={`${heavyFont} text-white italic text-3xl sm:text-5xl lg:text-7xl mb-6`}>
                Turn Every Truck Into a{' '}
                <span className="text-emerald-400">Lead Machine.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-bold leading-relaxed mb-8 max-w-lg">
                Your yard sign gets 200 looks and 3 calls. The rest drive by and forget your number.
                Lead2Project fixes that with one link and QR code that captures leads{' '}
                <span className="text-white underline decoration-emerald-500 decoration-3 underline-offset-4">while you're on the job.</span>
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

            {/* Right — QR Image */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/images/qrbranded2.webp"
                  alt="Branded QR code for contractor lead capture"
                  className="w-full max-w-[400px] rounded-none border-[3px] border-slate-950 shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="bg-slate-950 py-12 sm:py-20 border-y-4 border-yellow-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] sm:text-xs font-black text-yellow-400 uppercase tracking-[0.3em] mb-4">The Problem</p>
          <h2 className={`${heavyFont} text-white italic text-2xl sm:text-4xl lg:text-5xl mb-6`}>
            Your Signs Get Eyeballs.<br />
            <span className="text-slate-500">Not Calls.</span>
          </h2>
          <p className="text-sm sm:text-lg text-slate-400 font-bold leading-relaxed max-w-2xl mx-auto">
            Every truck you drive, every yard sign you plant — hundreds of people see your brand daily.
            But they don't write down your number. They don't remember your name by the time they get home.
            That's money driving past you every single day.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS — 3 STEPS ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#10b981]">
              <Zap size={12} strokeWidth={3} />
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">How It Works</span>
            </div>
            <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-5xl`}>
              Three Steps. <span className="text-emerald-600 italic">Zero Effort.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                num: '01',
                icon: <QrCode size={24} />,
                title: 'Blast Your Link',
                desc: 'Sign up and get a custom QR code and booking link instantly. Slap it on your truck, yard signs, business cards, social bios, door hangers — everywhere.',
                accent: 'bg-yellow-400 text-slate-950',
                shadow: 'shadow-[6px_6px_0px_#facc15]',
              },
              {
                num: '02',
                icon: <FormInput size={24} />,
                title: 'Customer Fills Your Form',
                desc: 'They scan or tap your link and fill out your branded form. Name, phone, service needed, photos of the job, preferred date — whatever you configure.',
                accent: 'bg-blue-600 text-white',
                shadow: 'shadow-[6px_6px_0px_#2563eb]',
              },
              {
                num: '03',
                icon: <Smartphone size={24} />,
                title: 'Lead Hits Your Board',
                desc: 'The lead lands on your dashboard instantly with all details and photos attached. No manual entry. No lost paper. No missed opportunities.',
                accent: 'bg-emerald-500 text-white',
                shadow: 'shadow-[6px_6px_0px_#10b981]',
              },
            ].map((step, i) => (
              <div
                key={i}
                className={`relative border-2 border-slate-950 bg-white p-5 sm:p-8 ${step.shadow}`}
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-slate-950 ${step.accent}`}>
                    {step.icon}
                  </div>
                  <span className="text-3xl sm:text-5xl font-[1000] italic text-slate-200">{step.num}</span>
                </div>
                <h3 className={`${heavyFont} text-lg sm:text-xl text-slate-950 mb-3`}>{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOM FORMS DEEP DIVE ── */}
      <section className="bg-white py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Form mockup */}
            <div className="max-w-[360px] mx-auto lg:mx-0">
              <FormCard />
            </div>

            {/* Right — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#3b82f6]">
                <FormInput size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">Custom Forms</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                Your Brand. Your Questions.{' '}
                <span className="text-emerald-600 italic">Your Rules.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Every form is fully customizable. Your logo, your colors, your service categories.
                Add custom questions, dropdown fields, and let customers upload photos and videos
                of the job before you even pick up the phone.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  'Your logo and brand colors',
                  'Custom questions and dropdowns',
                  'Photo and video uploads',
                  'Preferred date and time selection',
                  'Address and service category',
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
          </div>
        </div>
      </section>

      {/* ── QR CODE DEEP DIVE ── */}
      <section className="bg-[#f8fafc] py-12 sm:py-24 border-t-4 border-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Text */}
            <div className="lg:order-1">
              <div className="inline-flex items-center gap-2 bg-slate-950 text-yellow-400 px-3 py-1 mb-4 shadow-[3px_3px_0px_#facc15]">
                <QrCode size={12} strokeWidth={3} />
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase">QR Code</span>
              </div>

              <h2 className={`${heavyFont} text-slate-950 text-2xl sm:text-4xl mb-6`}>
                One Code.{' '}
                <span className="text-emerald-600 italic">Everywhere.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-bold leading-relaxed mb-8">
                Your custom QR code links directly to your branded booking form.
                Print it once, use it everywhere. Every scan is a potential job.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  'Truck wraps',
                  'Yard signs',
                  'Business cards',
                  'Social media bios',
                  'Door hangers',
                  'Estimate sheets',
                ].map((place, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 sm:p-3 bg-white border-2 border-slate-950 shadow-[3px_3px_0px_#000]">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45 shrink-0" />
                    <span className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-tight">{place}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Scanning image */}
            <div className="lg:order-2 flex justify-center">
              <img
                src="/images/qr-scan-2.webp"
                alt="Contractor scanning QR code on work truck"
                className="w-full max-w-[450px] border-[3px] border-slate-950 shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="bg-slate-950 py-12 sm:py-24 border-t-4 border-yellow-400">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className={`${heavyFont} text-white italic text-2xl sm:text-5xl mb-4`}>
              Every Lead Arrives{' '}
              <span className="text-emerald-400">Complete.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 font-bold max-w-xl mx-auto">
              No chasing details. No phone tag. Everything you need to quote the job lands on your board instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: <span className="text-blue-400"><Smartphone size={18} /></span>, label: 'Full Name & Phone' },
              { icon: <span className="text-red-400"><MapPin size={18} /></span>, label: 'Job Address' },
              { icon: <span className="text-emerald-400"><Wrench size={18} /></span>, label: 'Service Category' },
              { icon: <span className="text-yellow-400"><Camera size={18} /></span>, label: 'Photos & Videos' },
              { icon: <span className="text-slate-400"><FileText size={18} /></span>, label: 'Job Description' },
              { icon: <span className="text-blue-400"><CalendarDays size={18} /></span>, label: 'Preferred Date & Time' },
              { icon: <span className="text-amber-400"><HelpCircle size={18} /></span>, label: 'Custom Question Answers' },
              { icon: <span className="text-emerald-400"><Clock size={18} /></span>, label: 'Submission Timestamp' },
              { icon: <span className="text-yellow-400"><QrCode size={18} /></span>, label: 'QR or Link Source' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 sm:p-4 border-2 border-slate-800 bg-slate-900 shadow-[3px_3px_0px_#10b981]"
              >
                {item.icon}
                <span className="text-[11px] sm:text-xs font-black text-white uppercase tracking-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0a1628] py-16 sm:py-24 border-t-4 border-emerald-500">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className={`${heavyFont} text-white italic text-2xl sm:text-5xl mb-6`}>
            Stop Losing Leads to{' '}
            <span className="text-emerald-400">Forgotten Numbers.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-bold mb-10 max-w-lg mx-auto">
            Sign up in 2 minutes. Get your QR code. Put it on your truck tomorrow.
            Every scan is a lead you would have lost.
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