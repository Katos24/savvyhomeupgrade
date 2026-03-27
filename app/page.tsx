'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Check, Menu, X, Star,
  Layout, QrCode, Bot, Mail, BarChart2,
  ChevronDown, CheckCircle2, XCircle,
  Truck, Instagram, Facebook, AtSign, Globe,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL FADE HOOK — reusable for every section
// ─────────────────────────────────────────────────────────────────────────────
function useFadeIn(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-[#080C14]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/40'
        : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/Lead2ProjectLogo.png" alt="L2P" className="h-10 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing']].map(([href,label]) => (
            <a key={href} href={href} className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">{label}</a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[13px] font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95">
            Start Free Trial
          </Link>
          <button onClick={() => setOpen(o => !o)} className="md:hidden p-1 text-slate-400">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[#080C14]/95 backdrop-blur-xl border-t border-white/[0.06] px-6 py-5 space-y-4">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block text-base font-semibold text-slate-300">{label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — HERO
// Status: Foundation built. Replace placeholder image with real dashboard screenshot.
// TODO: swap /images/placeholder-dashboard.png with actual screenshot
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen bg-[#080C14] flex flex-col overflow-hidden">

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Blue glow */}
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/[0.12] blur-[140px] rounded-full" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080C14] to-transparent" />
      </div>

      <Nav />

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT — copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(12px)', transition: 'all 0.6s ease' }}>
                <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em]">
                  <Zap className="w-3 h-3 fill-current" /> Built for the Trades
                </span>
              </div>

              {/* Headline */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.7s ease 0.08s' }}>
                <h1 className="text-[56px] md:text-[72px] font-black text-white leading-[0.9] tracking-[-0.03em]">
                  From QR Scan<br/>
                  to Closed Job.<br/>
                  <em className="text-blue-500 not-italic">One flow.</em>
                </h1>
              </div>

              {/* Sub */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.7s ease 0.16s' }}>
                <p className="text-[17px] text-slate-400 leading-relaxed max-w-[440px] font-medium">
                  Your booking link works everywhere. No website? You don't need one —
                  just a link that turns every customer touchpoint into a job request.
                </p>

                {/* Link everywhere strip */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { icon: <Truck className="w-3.5 h-3.5" />,      label: 'Truck wrap'      },
                    { icon: <Instagram className="w-3.5 h-3.5" />,  label: 'Instagram bio'   },
                    { icon: <Facebook className="w-3.5 h-3.5" />,   label: 'Facebook page'   },
                    { icon: <AtSign className="w-3.5 h-3.5" />,     label: 'Email signature' },
                    { icon: <Globe className="w-3.5 h-3.5" />,      label: 'No site needed'  },
                  ].map(({ icon, label }) => (
                    <div key={label} className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] text-slate-400 px-3 py-1.5 rounded-lg text-[12px] font-semibold">
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.7s ease 0.24s' }}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[15px] font-black shadow-[0_0_50px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all active:scale-95">
                    Start Free Trial <ArrowRight size={17}/>
                  </Link>
                  <Link href="/demo"
                    className="inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl text-[15px] font-bold transition-all backdrop-blur-sm">
                    <Layout className="w-4 h-4 text-slate-400" /> Try Live Demo
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(5)].map((_,i) => <Star key={i} size={13} fill="currentColor"/>)}
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">"Finally a tool that gets how a job site works."</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-600 font-bold tracking-[0.18em] uppercase">
                  14-day free trial · No credit card · 2 min setup
                </p>
              </div>
            </div>

            {/* RIGHT — placeholder for hero visual */}
            {/* ─────────────────────────────────────────────────────────────
                TODO: Replace this placeholder with a real image.
                Best option: screenshot of dashboard with a phone mockup
                floating beside it showing the customer form.
                Size: ~600×460px, transparent or dark bg preferred.
            ───────────────────────────────────────────────────────────── */}
            <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(24px) scale(0.97)', transition: 'all 0.9s ease 0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-600/10 blur-[60px] rounded-3xl" />
                <div className="relative bg-white/[0.04] border border-white/10 rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center">
                  {/* PLACEHOLDER — swap with: <img src="/images/hero-visual.png" ... /> */}
                  <div className="text-center space-y-3 p-8">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                      <Layout className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Hero Visual</p>
                    <p className="text-slate-600 text-xs max-w-[200px] mx-auto leading-relaxed">
                      Replace with dashboard screenshot + phone mockup showing customer form
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — TRUST BAR
// Status: Ready. Update numbers when you have real data.
// ─────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  const { ref, visible } = useFadeIn();
  const stats = [
    { value: '12,000+', label: 'Leads captured' },
    { value: '< 60 sec', label: 'Avg. quote time' },
    { value: '14 days',  label: 'Free trial'     },
    { value: '2 min',    label: 'Setup time'     },
  ];
  return (
    <div ref={ref} className="bg-[#080C14] border-y border-white/[0.06] py-10 px-6">
      <div
        className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}
      >
        {stats.map((s,i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-black text-white tracking-tight">{s.value}</p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — HOW IT WORKS (3 steps)
// Status: Copy + structure ready. Replace step images with real screenshots.
// TODO: swap placeholder divs with actual step screenshots or short screen recordings
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useFadeIn();

  const steps = [
    {
      number: '01',
      color: 'blue',
      title: 'Scan the QR',
      desc: 'Your branded QR lives on your truck, yard sign, or business card. One scan opens your custom form — no app download.',
      // TODO: Replace placeholder with screenshot of QR code on a truck or business card
      image: null,
    },
    {
      number: '02',
      color: 'indigo',
      title: 'Customer fills it out',
      desc: 'They enter their info, describe the job, pick a service type, and upload photos. You get everything you need before the first call.',
      // TODO: Replace placeholder with phone screenshot of the customer form
      image: null,
    },
    {
      number: '03',
      color: 'emerald',
      title: 'You quote & close',
      desc: 'The lead lands on your dashboard instantly. AI drafts the quote. You review and send with one click.',
      // TODO: Replace placeholder with screenshot of the lead card + quote modal
      image: null,
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={ref} className="text-center mb-20"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">The Workflow</p>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.92]">
            Three steps.<br/>
            <span className="text-slate-400 font-medium">That's all it takes.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, i) => {
            const { ref: sRef, visible: sVis } = useFadeIn();
            const isEven = i % 2 === 1;
            const colors: Record<string, string> = {
              blue: 'bg-blue-50 border-blue-100 text-blue-600',
              indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
              emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
            };

            return (
              <div
                key={i} ref={sRef}
                className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-700 ${isEven ? 'md:grid-flow-dense' : ''}`}
                style={{ opacity: sVis ? 1 : 0, transform: sVis ? 'none' : 'translateY(28px)' }}
              >
                {/* Text */}
                <div className={isEven ? 'md:col-start-2' : ''}>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-widest mb-6 ${colors[step.color]}`}>
                    Step {step.number}
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{step.title}</h3>
                  <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-md">{step.desc}</p>
                </div>

                {/* Image */}
                {/* ─────────────────────────────────────────────────────
                    TODO: Replace this block with:
                    <img src="/images/step-{i+1}.png" alt="..." className="w-full rounded-3xl shadow-2xl border border-slate-100" />
                ───────────────────────────────────────────────────── */}
                <div className={isEven ? 'md:col-start-1 md:row-start-1' : ''}>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl aspect-[4/3] flex items-center justify-center">
                    <div className="text-center space-y-2 p-8">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto border ${colors[step.color]}`}>
                        <span className="font-black text-lg">{step.number}</span>
                      </div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Screenshot placeholder</p>
                      <p className="text-slate-300 text-xs max-w-[160px] mx-auto">{step.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — FEATURES BENTO GRID
// Status: Structure + copy ready. Icons in place. No images needed here.
// ─────────────────────────────────────────────────────────────────────────────
function Features() {
  const { ref, visible } = useFadeIn();

  const tiles = [
    {
      size: 'col-span-2',
      icon: <QrCode className="w-6 h-6 text-blue-400" />,
      badge: 'Customer Intake',
      title: 'Your branded QR code',
      desc: 'Stick it on your truck or yard signs. One scan opens your custom form. No app download, no friction. Customers do the data entry — you just receive the job.',
      accent: 'blue',
    },
    {
      size: 'col-span-1',
      icon: <Bot className="w-6 h-6 text-violet-400" />,
      badge: 'AI Co-pilot',
      title: 'Quotes in 60 seconds',
      desc: 'AI reads customer photos and drafts line items. You review and send.',
      accent: 'violet',
    },
    {
      size: 'col-span-1',
      icon: <Mail className="w-6 h-6 text-emerald-400" />,
      badge: 'One-Click Outbox',
      title: 'Every email logged',
      desc: 'Send quotes, reminders, and schedules with one click. Full sent history so nothing slips.',
      accent: 'emerald',
    },
    {
      size: 'col-span-1',
      icon: <BarChart2 className="w-6 h-6 text-amber-400" />,
      badge: 'Daily Digest',
      title: '6AM morning briefing',
      desc: 'New leads, overdue payments, today\'s schedule — in one email before you leave for the job.',
      accent: 'amber',
    },
    {
      size: 'col-span-2',
      icon: <Layout className="w-6 h-6 text-slate-300" />,
      badge: 'Lead Board',
      title: 'Every job. One place.',
      desc: 'Cards or table view. Status filters. AI assistant. Stats bar. Your whole pipeline visible at a glance — nothing falls through.',
      accent: 'slate',
    },
  ];

  const accentMap: Record<string, string> = {
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    emerald:'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
    slate:  'bg-white/5 border-white/10 text-slate-400',
  };

  return (
    <section id="features" className="py-28 px-6 bg-[#080C14]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div ref={ref} className="mb-16 max-w-2xl"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Inside the product</p>
          <h2 className="text-5xl font-black text-white tracking-tight leading-[0.92]">
            Everything happens here.
          </h2>
          <p className="text-slate-400 text-lg mt-4 font-medium leading-relaxed">
            One place for every lead, quote, schedule, and payment. Nothing falls through.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((tile, i) => {
            const { ref: tRef, visible: tVis } = useFadeIn();
            return (
              <div
                key={i} ref={tRef}
                className={`md:${tile.size} bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 group`}
                style={{ opacity: tVis ? 1 : 0, transform: tVis ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.08}s` }}
              >
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest mb-6 ${accentMap[tile.accent]}`}>
                  {tile.icon}
                  {tile.badge}
                </div>
                <h3 className="text-xl font-black text-white mb-3 group-hover:text-blue-100 transition-colors">{tile.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{tile.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — AI CO-PILOT (dark, premium feel)
// Status: Copy ready. Replace placeholder with AI brief / quote screenshot.
// TODO: swap placeholder with screenshot of AI quote generator or AI brief panel
// ─────────────────────────────────────────────────────────────────────────────
function AiSection() {
  const { ref, visible } = useFadeIn();

  const capabilities = [
    { title: 'AI Quote Generator',  desc: 'Customer uploads a photo. AI reads the damage, drafts line items with pricing. You review and send.' },
    { title: 'AI Project Brief',    desc: 'Every lead automatically summarized into a clear execution plan for you and your crew.' },
    { title: 'AI Assistant',        desc: 'Ask anything — "who hasn\'t paid?", "what\'s scheduled Tuesday?" — get instant answers.' },
  ];

  return (
    <section className="py-28 px-6 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid lg:grid-cols-2 gap-16 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease' }}
        >
          {/* Left — image placeholder */}
          {/* ─────────────────────────────────────────────────────────────
              TODO: Replace with screenshot of AI quote modal or AI brief panel.
              Ideal: show the AI generating line items from a photo.
          ───────────────────────────────────────────────────────────── */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl aspect-[4/3] flex items-center justify-center order-2 lg:order-1">
            <div className="text-center space-y-2 p-8">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6 text-violet-500" />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Screenshot placeholder</p>
              <p className="text-slate-300 text-xs max-w-[160px] mx-auto">AI quote generator or AI brief panel</p>
            </div>
          </div>

          {/* Right — copy */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 text-violet-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-6">
              <Bot className="w-3.5 h-3.5" /> AI Co-pilot
            </span>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[0.92] mb-6">
              Your office<br/>on autopilot.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-10 font-medium">
              Not a chatbot. A co-pilot that reads your jobs, drafts your quotes, and keeps your crew informed — automatically.
            </p>
            <div className="space-y-6">
              {capabilities.map((c, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3}/>
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-[15px]">{c.title}</p>
                    <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — DAILY DIGEST + OUTBOX
// Status: Copy ready. DailyDigestPreview component goes here.
// TODO: drop in <DailyDigestPreview /> from your existing code on the left side
// ─────────────────────────────────────────────────────────────────────────────
function DigestSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-28 px-6 bg-[#080C14]">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid lg:grid-cols-2 gap-16 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease' }}
        >
          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-6">
              Daily Command
            </span>
            <h2 className="text-5xl font-black text-white tracking-tight leading-[0.92] mb-6">
              Know your day<br/>before it starts.
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-10 font-medium">
              Every morning at 6AM — new leads, overdue payments, today's schedule. One email. No login required.
            </p>
            <div className="space-y-6">
              {[
                { title: 'Morning Digest',    desc: 'New leads, overdue payments, and today\'s jobs — delivered at 6AM every day.' },
                { title: 'Outbox Paper Trail',desc: 'Every quote, reminder, and schedule email logged. Searchable confirmation hub — no "I never got that" excuses.' },
                { title: 'One-Click Sending', desc: 'Send quotes and reminders without leaving the lead. Full sent history always visible.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={3}/>
                  </div>
                  <div>
                    <p className="text-white font-bold text-[15px]">{item.title}</p>
                    <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Daily Digest visual */}
          {/* ─────────────────────────────────────────────────────────────
              TODO: Replace this placeholder with <DailyDigestPreview />
              which already exists in your current page.tsx.
              Just import and drop it in here.
          ───────────────────────────────────────────────────────────── */}
          <div className="bg-white/[0.03] border-2 border-dashed border-white/10 rounded-3xl aspect-[4/3] flex items-center justify-center">
            <div className="text-center space-y-2 p-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Drop in DailyDigestPreview</p>
              <p className="text-slate-600 text-xs max-w-[160px] mx-auto">Component already exists in your codebase</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — VS JOBBER COMPARISON
// Status: Ready. No images needed.
// ─────────────────────────────────────────────────────────────────────────────
function Comparison() {
  const { ref, visible } = useFadeIn();

  const them = [
    'Manual data entry for every lead',
    'Days of onboarding and training',
    'Overwhelming features you never use',
    'High monthly cost + hidden fees',
    'Built for office managers, not tradespeople',
  ];
  const us = [
    'Customers enter their own data via QR',
    'Set up in 2 minutes, live the same day',
    'Focused tools that match how you work',
    'Simple flat pricing, no surprises',
    'Built specifically for service contractors',
  ];

  return (
    <section className="py-28 px-6 bg-white border-t border-slate-100">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[0.92]">
              Built for the truck,<br/>
              <span className="text-blue-600">not the office.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Them */}
            <div className="rounded-3xl p-8 bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="w-5 h-5 text-slate-400" />
                <h4 className="text-lg font-bold text-slate-400">Legacy CRMs (Jobber, etc.)</h4>
              </div>
              <ul className="space-y-4">
                {them.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                    <span className="text-red-400 mt-0.5 font-bold shrink-0">—</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Us */}
            <div className="rounded-3xl p-8 bg-slate-900 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-[0.06]"><Zap size={160} className="text-blue-400" /></div>
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-lg font-black text-white">Lead2Project</h4>
              </div>
              <ul className="space-y-4 relative z-10">
                {us.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-bold">
                    <span className="text-blue-400 mt-0.5 shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — PRICING
// Status: Ready. Update plan features / prices as needed.
// ─────────────────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useFadeIn();

  const plans = [
    {
      name: 'Starter',
      price: 29,
      desc: 'Perfect for solo operators just getting organized.',
      highlight: false,
      href: '/signup?plan=starter',
      features: ['Custom booking link & QR code', 'Unlimited lead capture', 'Photo & video uploads', 'Lead board — cards + table view', 'Status tracking & notes', 'Branded confirmation emails', 'CSV export'],
    },
    {
      name: 'Pro',
      price: 79,
      desc: 'Full job management + AI tools.',
      highlight: true,
      href: '/signup?plan=pro',
      features: ['Everything in Starter', 'Convert leads → full projects', 'Quotes & payment tracking', 'Tasks, scheduling & crew assignment', 'AI Brief on every lead ✦ PRO', 'AI quote generator from photos ✦ PRO', 'AI Assistant — ask anything ✦ PRO', 'Daily Digest email ✦ PRO'],
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6 bg-[#080C14] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <div className="text-center mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Pricing</p>
            <h2 className="text-5xl font-black text-white tracking-tight leading-[0.92] mb-4">
              One job pays for<br/>the whole year.
            </h2>
            <p className="text-slate-400 text-lg font-medium">Simple pricing. No setup fees. 14-day free trial.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map(plan => (
              <div key={plan.name}
                className={`rounded-3xl p-10 border relative transition-all ${
                  plan.highlight
                    ? 'bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/20'
                    : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.14]'
                }`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-[0.18em] px-5 py-1.5 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <p className={`text-[11px] font-black uppercase tracking-widest mb-4 ${plan.highlight ? 'text-blue-100' : 'text-slate-400'}`}>{plan.name}</p>
                <div className={`flex items-baseline gap-1 mb-2 ${plan.highlight ? 'text-white' : 'text-white'}`}>
                  <span className="text-6xl font-black tracking-tight">${plan.price}</span>
                  <span className={`font-bold ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>/mo</span>
                </div>
                <p className={`text-sm mb-8 font-medium ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>{plan.desc}</p>
                <Link href={plan.href}
                  className={`block text-center w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 mb-10 ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl'
                      : 'bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/10'
                  }`}>
                  Start Free Trial
                </Link>
                <ul className="space-y-3.5">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-start gap-3 text-sm font-medium ${plan.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                      <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-white/10'}`}>
                        <Check className="w-2.5 h-2.5" strokeWidth={3}/>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 text-[11px] text-slate-600 font-bold uppercase tracking-[0.18em]">
            Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — FAQ
// Status: Ready. Add / remove questions as needed.
// ─────────────────────────────────────────────────────────────────────────────
function FAQ() {
  const { ref, visible } = useFadeIn();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'Do my customers need to download an app?', a: 'No. They scan your QR code and your form opens directly in their phone\'s browser. No download, no account, no friction.' },
    { q: 'Can I customize what the form asks?',       a: 'Yes. You control which fields are shown — service type, address, preferred date, photos, custom questions. Turn them on or off anytime.' },
    { q: 'How does the AI quote generator work?',     a: 'When a customer uploads photos of their project, our AI analyzes the images and drafts line items with estimated pricing based on your templates. You review every number before sending.' },
    { q: 'What\'s the difference between Starter and Pro?', a: 'Starter covers customer intake, lead tracking, and basic organization. Pro adds full project management, AI tools (quotes, briefs, assistant), scheduling, and the Daily Digest.' },
    { q: 'Can I cancel anytime?',                     a: 'Yes. No contracts, no cancellation fees. Cancel from your account settings with one click. Your data is yours and exportable anytime.' },
  ];

  return (
    <section className="py-28 px-6 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <div className="text-center mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">FAQ</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Quick answers.</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-[15px] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-500 text-[15px] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — FINAL CTA
// Status: Ready.
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-28 px-6 bg-[#080C14] border-t border-white/[0.06] text-center">
      <div
        ref={ref}
        className="max-w-2xl mx-auto"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
      >
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[0.9] mb-6">
          One job pays for<br/>
          <span className="text-blue-500">the whole year.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
          Stop losing leads to disorganization. Get your QR code in 2 minutes.
        </p>
        <Link href="/signup"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-2xl text-lg font-black shadow-[0_0_60px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all active:scale-95">
          Start Free Trial <ArrowRight size={20}/>
        </Link>
        <p className="mt-5 text-[11px] text-slate-600 uppercase tracking-[0.2em] font-bold">
          14-day free trial · Cancel anytime · 2 min setup
        </p>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// Status: Ready.
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg"><Zap className="text-white w-4 h-4" strokeWidth={2.5}/></div>
              <span className="font-extrabold text-slate-900 tracking-tight">L2P</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">Job management built for service contractors. One link. Every lead.</p>
          </div>
          {[
            { heading: 'Product', links: [['Features','#features'],['Pricing','#pricing'],['Sign Up','/signup'],['Login','/login']] },
            { heading: 'Solutions', links: [['Roofing','/solutions/roofing'],['Dog Grooming','/solutions/dog-grooming'],['Cleaning','/solutions/cleaning']] },
            { heading: 'Legal', links: [['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Contact','mailto:hello@lead2project.com']] },
          ].map(col => (
            <div key={col.heading}>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{col.heading}</p>
              {col.links.map(([label, href]) => (
                <div key={label} className="mb-2.5">
                  <a href={href} className="text-sm text-slate-600 hover:text-blue-600 font-medium transition">{label}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-400 font-medium">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
          <p className="text-sm text-slate-400 font-medium">Built for Service Contractors.</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE ASSEMBLY
// Each section is clearly labeled. Swap or skip sections as needed.
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased">

      {/* 1. HERO — dark, headline + visual */}
      <Hero />

      {/* 2. TRUST BAR — stats strip */}
      <TrustBar />

      {/* 3. HOW IT WORKS — 3 steps, alternating layout */}
      <HowItWorks />

      {/* 4. FEATURES BENTO — dark section, grid of capabilities */}
      <Features />

      {/* 5. AI CO-PILOT — light section, screenshot + bullet points */}
      <AiSection />

      {/* 6. DAILY DIGEST + OUTBOX — dark section, email preview + copy */}
      <DigestSection />

      {/* 7. VS JOBBER — light section, two-column comparison */}
      <Comparison />

      {/* 8. PRICING — dark section, two plan cards */}
      <Pricing />

      {/* 9. FAQ — light section, accordion */}
      <FAQ />

      {/* 10. FINAL CTA — dark, big headline + signup button */}
      <FinalCTA />

      {/* FOOTER */}
      <Footer />

    </div>
  );
}