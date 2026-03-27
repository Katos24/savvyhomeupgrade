'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Check, Menu, X, Star, Layout,
  QrCode, Bot, Mail, BarChart2, ChevronDown, XCircle,
  Truck, Instagram, Facebook, AtSign, Globe,
  User, Phone, FileText, ChevronRight, CheckCircle,
  Search, LayoutGrid, List, Plus, AlignLeft, Sparkles,
  Calendar, Clock, SlidersHorizontal, Filter,
  MapPin, HomeIcon, Image as ImageIcon, Upload
} from 'lucide-react';

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
      scrolled ? 'bg-[#080C14]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/40' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/Lead2ProjectLogo.png" alt="L2P" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing']].map(([href,label]) => (
            <a key={href} href={href} className="text-[13px] font-semibold text-slate-400 hover:text-white transition-colors">{label}</a>
          ))}
        </div>
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
// HERO MOCKUP
// Laptop: full width, dominant. Phone: small 120px, bottom-right, just the form.
// ─────────────────────────────────────────────────────────────────────────────
function HeroMockup() {
  const D = { fontSize: 'inherit', lineHeight: 'inherit' }; // reset helper

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>

      {/* ── LAPTOP — full width, the hero ── */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Screen */}
        <div style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          aspectRatio: '16/10',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>

          {/* Browser chrome */}
          <div style={{ background: '#161b25', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(239,68,68,0.6)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(245,158,11,0.6)' }} />
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(52,211,153,0.6)' }} />
            <div style={{ flex: 1, margin: '0 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 4, height: 14, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
              <span style={{ fontSize: 6, color: '#4b5563', fontFamily: 'monospace' }}>app.lead2project.com/dashboard</span>
            </div>
          </div>

          {/* Dashboard — full width, no sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 27px)', overflow: 'hidden' }}>

            {/* Header pill */}
            <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '4px 8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 1.5, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />)}
                </div>
                <div style={{ width: 18, height: 18, background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 5, fontWeight: 900, color: 'rgba(255,255,255,0.7)' }}>RL</span>
                </div>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 900, color: '#fff', lineHeight: 1 }}>Ridge Line Roofing</div>
                  <div style={{ fontSize: 5.5, fontWeight: 700, color: '#6366f1', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>Dashboard</div>
                </div>
              </div>
              <div style={{ width: 22, height: 22, border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}>
                <Plus size={11} color="rgba(255,255,255,0.7)" />
              </div>
            </div>

            {/* 4 stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, padding: '0 10px 6px' }}>
              {[
                { label: 'TOTAL LEADS',      value: '20',     vc: '#fff' },
                { label: 'ACTIVE JOBS',       value: '20',     vc: '#60a5fa' },
                { label: 'REVENUE COLLECTED', value: '$0',     vc: '#34d399' },
                { label: 'PENDING',           value: '$13,900',vc: '#fbbf24' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 7px' }}>
                  <div style={{ fontSize: 5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: s.vc, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Search + controls */}
            <div style={{ padding: '0 10px 5px', display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, height: 18, display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6 }}>
                <Search size={8} color="#4b5563" />
                <span style={{ fontSize: 6, color: '#4b5563' }}>Search by name, email or phone...</span>
              </div>
              <div style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Filter size={8} color="#6b7280" />
              </div>
              <div style={{ width: 18, height: 18, background: '#4f46e5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={9} color="#fff" />
              </div>
              <div style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={8} color="#6b7280" />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 10px 5px', display: 'flex', gap: 4 }}>
              <div style={{ background: '#4f46e5', color: '#fff', fontSize: 6, fontWeight: 900, padding: '2px 7px', borderRadius: 99 }}>All (150)</div>
              {['New (23)','Contacted (11)','In Progress (20)','Completed (12)'].map(t => (
                <div key={t} style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280', fontSize: 6, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>{t}</div>
              ))}
            </div>

            {/* All Time */}
            <div style={{ padding: '0 10px 5px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }}>All Time</span>
                <ChevronDown size={8} color="#4b5563" />
              </div>
            </div>

            {/* TODAY */}
            <div style={{ padding: '0 10px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 7, fontWeight: 900, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Today</span>
              <span style={{ fontSize: 6, fontWeight: 700, color: '#6b7280', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: 99 }}>2</span>
            </div>

            {/* Lead cards */}
            <div style={{ padding: '0 10px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1 }}>

              {/* John Simpson — green */}
              <div style={{ background: '#080f08', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid #10b981', borderRadius: 10, padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'inline-flex', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: 6, fontWeight: 900, padding: '2px 6px', borderRadius: 5, textTransform: 'uppercase', alignSelf: 'flex-start' }}>New</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1 }}>John Simpson</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: 6, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Roofing</span>
                  <span style={{ fontSize: 6, color: '#374151' }}>·</span>
                  <span style={{ fontSize: 6, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Unassigned</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '5px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <div>
                    <div style={{ fontSize: 5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Date</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Calendar size={7} color="#60a5fa" />
                      <span style={{ fontSize: 7, color: '#60a5fa', fontWeight: 700 }}>Mar 31</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Arrival</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Clock size={7} color="#6b7280" />
                      <span style={{ fontSize: 7, color: '#9ca3af', fontWeight: 700 }}>8:15 AM</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>$74</div>
                    <div style={{ fontSize: 5.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Unpaid</div>
                  </div>
                  <div style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={9} color="#6b7280" />
                  </div>
                </div>
              </div>

              {/* Jack Thomas — blue */}
              <div style={{ background: '#08080f', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid #3b82f6', borderRadius: 10, padding: '7px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'inline-flex', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', fontSize: 6, fontWeight: 900, padding: '2px 6px', borderRadius: 5, textTransform: 'uppercase', alignSelf: 'flex-start' }}>New</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#fff', lineHeight: 1 }}>Jack Thomas</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: 6, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Roofing</span>
                  <span style={{ fontSize: 6, color: '#374151' }}>·</span>
                  <span style={{ fontSize: 6, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Alex Katos</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '5px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <div>
                    <div style={{ fontSize: 5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Date</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Calendar size={7} color="#60a5fa" />
                      <span style={{ fontSize: 7, color: '#60a5fa', fontWeight: 700 }}>Apr 8</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Arrival</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Clock size={7} color="#6b7280" />
                      <span style={{ fontSize: 7, color: '#9ca3af', fontWeight: 700 }}>8:30 AM</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#fbbf24' }}>$3,550</div>
                    <div style={{ fontSize: 5.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Partial</div>
                  </div>
                  <div style={{ width: 18, height: 18, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronRight size={9} color="#6b7280" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Laptop chin */}
        <div style={{ background: '#1a1f2b', height: 10, borderRadius: '0 0 2px 2px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />
        <div style={{ background: '#111520', height: 5, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none' }} />
      </div>

      {/* ── PHONE — small, bottom-right, just the form, no chrome ── */}
      <div style={{
        position: 'absolute',
        bottom: -16,
        right: -10,
        zIndex: 30,
        width: 130,
        background: '#f9f9fb',
        borderRadius: 16,
        border: '4px solid #1a1a1f',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}>

        {/* Tiny header strip */}
        <div style={{ background: '#e8e8f0', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div style={{ width: 14, height: 14, background: '#fff', borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 4.5, fontWeight: 900, color: '#374151' }}>RL</span>
          </div>
          <span style={{ fontSize: 7, fontWeight: 700, color: '#111827' }}>Ridge Line Roofing</span>
        </div>

        {/* Step bar */}
        <div style={{ background: '#fff', padding: '5px 8px 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 7, fontWeight: 900, color: '#fff' }}>1</span>
          </div>
          <span style={{ fontSize: 5.5, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Info</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 7, fontWeight: 700, color: '#9ca3af' }}>2</span>
          </div>
          <span style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Details</span>
        </div>

        {/* Form fields */}
        <div style={{ background: '#fff', padding: '3px 7px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {[
            { label: 'Full Name', val: 'John Simpson',    icon: <User size={6} color="#9ca3af" /> },
            { label: 'Email',     val: 'johns@gmail.com', icon: <Mail size={6} color="#9ca3af" /> },
            { label: 'Phone',     val: '(555) 704-5325',  icon: <Phone size={6} color="#9ca3af" /> },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: 5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{f.label}</div>
              <div style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
                {f.icon}
                <span style={{ fontSize: 7, color: '#111827', fontWeight: 500 }}>{f.val}</span>
              </div>
            </div>
          ))}

          {/* Service */}
          <div>
            <div style={{ fontSize: 5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Service Needed</div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <QrCode size={6} color="#9ca3af" />
                <span style={{ fontSize: 7, color: '#111827', fontWeight: 600 }}>Roofing</span>
              </div>
              <ChevronDown size={7} color="#9ca3af" />
            </div>
          </div>

          {/* Project notes */}
          <div>
            <div style={{ fontSize: 5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>About Your Project</div>
            <div style={{ background: '#f3f4f6', borderRadius: 6, padding: '3px 6px', minHeight: 22 }}>
              <span style={{ fontSize: 6.5, color: '#6b7280', fontStyle: 'italic', lineHeight: 1.3 }}>"Seeing a leak in my bedroom ceiling..."</span>
            </div>
          </div>

          {/* Continue button */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)', borderRadius: 8, padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: '#fff' }}>Continue</span>
            <ChevronRight size={8} color="#fff" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 5.5, color: '#9ca3af' }}>lead2project.com — Private</span>
          </div>

        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <section className="relative min-h-screen bg-[#080C14] flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-600/[0.12] blur-[140px] rounded-full" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#080C14] to-transparent" />
      </div>

      <Nav />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full pt-28 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT copy */}
            <div className="space-y-8">
              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(12px)', transition:'all 0.6s ease' }}>
                <span className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.15em]">
                  <Zap className="w-3 h-3 fill-current" /> Built for the Trades
                </span>
              </div>

              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.08s' }}>
                <h1 className="text-[56px] md:text-[72px] font-black text-white leading-[0.9] tracking-[-0.03em]">
                  From QR Scan<br/>
                  to Closed Job.<br/>
                  <em className="text-blue-500 not-italic">One flow.</em>
                </h1>
              </div>

              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.16s' }}>
                <p className="text-[17px] text-slate-400 leading-relaxed max-w-[440px] font-medium">
                  Your booking link works everywhere. No website? You don't need one —
                  just a link that turns every customer touchpoint into a job request.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { icon: <Truck className="w-3.5 h-3.5" />,     label: 'Truck wrap' },
                    { icon: <Instagram className="w-3.5 h-3.5" />, label: 'Instagram bio' },
                    { icon: <Facebook className="w-3.5 h-3.5" />,  label: 'Facebook page' },
                    { icon: <AtSign className="w-3.5 h-3.5" />,    label: 'Email signature' },
                    { icon: <Globe className="w-3.5 h-3.5" />,     label: 'No site needed' },
                  ].map(({ icon, label }) => (
                    <div key={label} className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] text-slate-400 px-3 py-1.5 rounded-lg text-[12px] font-semibold">
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.24s' }}>
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

            {/* RIGHT — mockup, extra bottom padding for phone overhang */}
            <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(24px) scale(0.97)', transition:'all 0.9s ease 0.2s', position: 'relative', paddingBottom: 24 }}>
              <HeroMockup />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR
// ─────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref} className="bg-[#080C14] border-y border-white/[0.06] py-10 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700"
        style={{ opacity: visible?1:0, transform: visible?'none':'translateY(16px)' }}>
        {[
          { value: '12,000+', label: 'Leads captured' },
          { value: '< 60 sec', label: 'Avg. quote time' },
          { value: '14 days', label: 'Free trial' },
          { value: '2 min', label: 'Setup time' },
        ].map((s,i) => (
          <div key={i} className="text-center">
            <p className="text-3xl font-black text-white tracking-tight">{s.value}</p>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
// ADD these to your existing lucide-react import line (merge with what you have):
// MapPin, Home, Calendar, Clock, ImageIcon (imported as "Image as ImageIcon"), Upload
//
// Full import line should include at minimum:
// import {
//   ArrowRight, Zap, Check, Menu, X, Star, Layout,
//   QrCode, Bot, Mail, BarChart2, ChevronDown,
//   Truck, Instagram, Facebook, AtSign, Globe,
//   User, Phone, FileText, ChevronRight, CheckCircle,
//   Search, LayoutGrid, List, Plus, AlignLeft,
//   Calendar, Clock, MapPin, Home, Image as ImageIcon, Upload
// } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 ANIMATED DEMO — address + date/time + photo drop, loops cleanly
// Replace the existing FastDemoForm function with this entire block
// ─────────────────────────────────────────────────────────────────────────────
function FastDemoForm() {
  type Phase = 'idle'|'typing-address'|'typing-zip'|'pick-date'|'pick-time'|'dropping-photo'|'done'|'reset';
  const [phase, setPhase] = useState<Phase>('idle');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [photoVisible, setPhotoVisible] = useState(false);
  const [photoDrop, setPhotoDrop] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const ADDRESS = '42 Maple Ave, Brooklyn NY';
  const ZIP = '11201';

  useEffect(() => {
    let running = true;

    function go(fn: () => void, ms: number) {
      if (!running) return;
      timerRef.current = setTimeout(fn, ms);
    }

    function typeStr(target: string, setter: (v: string) => void, speed: number, onDone: () => void) {
      let i = 0;
      function step() {
        if (!running) return;
        i++;
        setter(target.slice(0, i));
        if (i < target.length) timerRef.current = setTimeout(step, speed + Math.random() * 12);
        else go(onDone, 350);
      }
      go(step, 280);
    }

    function run() {
      setPhase('idle');
      setAddress(''); setZip(''); setDate(''); setTime('');
      setPhotoVisible(false); setPhotoDrop(false);

      go(() => {
        setPhase('typing-address');
        typeStr(ADDRESS, setAddress, 32, () => {
          setPhase('typing-zip');
          typeStr(ZIP, setZip, 50, () => {
            setPhase('pick-date');
            go(() => {
              setDate('Apr 12');
              setPhase('pick-time');
              go(() => {
                setTime('Morning');
                setPhase('dropping-photo');
                go(() => {
                  setPhotoVisible(true);
                  go(() => {
                    setPhotoDrop(true);
                    setPhase('done');
                    go(run, 3000);
                  }, 550);
                }, 480);
              }, 480);
            }, 480);
          });
        });
      }, 600);
    }

    run();
    return () => { running = false; if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const cursor = (active: boolean) =>
    active ? <span className="inline-block w-px h-3 bg-blue-500 ml-0.5 align-middle animate-pulse" /> : null;

  const box = (active: boolean, filled: boolean) =>
    `w-full border rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all duration-150 bg-slate-50 ${
      active ? 'border-blue-400 ring-2 ring-blue-50' : filled ? 'border-slate-200' : 'border-slate-100'
    }`;

  const progress =
    phase === 'done' ? 100 :
    phase === 'dropping-photo' ? 78 :
    phase === 'pick-time' ? 62 :
    phase === 'pick-date' ? 46 :
    phase === 'typing-zip' ? 30 :
    phase === 'typing-address' ? 12 : 0;

  return (
    <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden max-w-sm mx-auto">

      {/* App header */}
      <div className="bg-[#f4f5f9] px-5 py-3.5 border-b border-slate-200/70 flex items-center gap-3">
        <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-center">
          <span className="text-[9px] font-black text-slate-700">RL</span>
        </div>
        <p className="text-[12px] font-bold text-slate-800">Ridge Line Roofing</p>
      </div>

      {/* Step indicator — step 1 done, step 2 active */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest line-through decoration-slate-300">Your Info</span>
          <ChevronRight size={10} className="text-slate-300 shrink-0" />
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-white">2</span>
          </div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Details</span>
        </div>
        <div className="h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Saved confirmation banner */}
      <div className="mx-5 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
          <Check size={9} className="text-white" strokeWidth={3} />
        </div>
        <p className="text-[10px] font-bold text-emerald-700 leading-tight">Your request is saved! Add details for a faster quote.</p>
      </div>

      <div className="px-5 pb-5 space-y-2.5">

        {/* Address field */}
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Address <span className="text-red-400">*</span>
          </label>
          <div className={box(phase === 'typing-address', address.length > 0)}>
            <MapPin size={13} className="text-red-400 shrink-0" />
            <span className="text-[12px] font-medium text-slate-800 min-h-[16px] flex-1 truncate">
              {address || <span className="text-slate-300">Start typing your address...</span>}
              {cursor(phase === 'typing-address')}
            </span>
          </div>
        </div>

        {/* Zip + Apt row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Zip Code</label>
            <div className={box(phase === 'typing-zip', zip.length > 0)}>
              <MapPin size={13} className="text-emerald-400 shrink-0" />
              <span className="text-[12px] font-medium text-slate-800 min-h-[16px]">
                {zip || <span className="text-slate-300">12345</span>}
                {cursor(phase === 'typing-zip')}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Unit / Apt</label>
            <div className={box(false, false)}>
              <HomeIcon size={13} className="text-slate-300 shrink-0" />
              <span className="text-[12px] text-slate-300">Apt 4B</span>
            </div>
          </div>
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Preferred Date</label>
            <div className={box(phase === 'pick-date', date.length > 0)}>
              <Calendar size={13} className="text-emerald-500 shrink-0" />
              <span className={`text-[12px] font-medium min-h-[16px] transition-all ${date ? 'text-slate-800' : 'text-slate-300'}`}>
                {date || 'Pick date'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Preferred Time</label>
            <div className={box(phase === 'pick-time', time.length > 0)}>
              <Clock size={13} className="text-blue-400 shrink-0" />
              <span className={`text-[12px] font-medium min-h-[16px] transition-all ${time ? 'text-slate-800' : 'text-slate-300'}`}>
                {time || 'Morning...'}
              </span>
            </div>
          </div>
        </div>

        {/* Photo upload zone */}
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Photos <span className="font-normal text-slate-400 normal-case">— helps us quote faster</span>
          </label>
          <div className={`border-2 border-dashed rounded-xl transition-all duration-400 ${
            photoDrop
              ? 'border-blue-400 bg-blue-50'
              : photoVisible
              ? 'border-blue-300 bg-blue-50/40'
              : 'border-slate-200 bg-slate-50'
          }`}>
            {photoDrop ? (
              // Photo landed
              <div className="p-2">
                <div className="relative w-full h-[72px] rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-slate-400 to-slate-600" />
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-700" style={{ clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)' }} />
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                    <p className="text-white text-[8px] font-medium">roof-photo.jpg</p>
                  </div>
                </div>
              </div>
            ) : photoVisible ? (
              // Dragging in — bouncing icon
              <div className="py-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1.5 animate-bounce">
                  <ImageIcon size={14} className="text-blue-500" />
                </div>
                <p className="text-[10px] font-bold text-blue-500">Drop photo here...</p>
              </div>
            ) : (
              // Idle
              <div className="py-4 text-center">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                  <ImageIcon size={14} className="text-slate-400" />
                </div>
                <p className="text-[10px] font-semibold text-slate-500">Click or drag photos here</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Max 50MB per file</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button className={`w-full py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 transition-all duration-500 shadow-sm ${
          phase === 'done' ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
        }`}>
          {phase === 'done'
            ? <><Check size={14} strokeWidth={3} /> Details Submitted!</>
            : <><Upload size={14} /> Submit Details</>
          }
        </button>

        <div className="text-center">
          <button className="text-[10px] text-slate-400 underline underline-offset-2">Skip for now</button>
        </div>

        <p className="text-center text-[9px] text-slate-400">lead2project.com — Private</p>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useFadeIn();
  const steps = [
    { number: '01', color: 'blue',    title: 'Scan the QR',          desc: 'Your branded QR lives on your truck, yard sign, or business card. One scan opens your custom form — no app download required.',                                                                  image: '/images/qr-scan-2.png',          visual: null },
    { number: '02', color: 'indigo',  title: 'Customer fills it out', desc: 'They enter their info, describe the job, and pick a service. You get everything you need — name, phone, and project details — before the first call.',                                             image: null,                             visual: 'demo-form' },
    { number: '03', color: 'emerald', title: 'You quote and close',   desc: 'The lead lands on your dashboard instantly. AI drafts the quote. Review, click once, and it is in their inbox.',                                                                                    image: '/images/dashboard-screenshot.png', visual: null },
  ];
  const colorMap: Record<string,string> = { blue: 'bg-blue-50 border-blue-100 text-blue-600', indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600', emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600' };
  const glowMap:  Record<string,string> = { blue: 'bg-blue-300', indigo: 'bg-indigo-300', emerald: 'bg-emerald-300' };

  return (
    <section id="how-it-works" className="py-32 px-6 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="text-center mb-24 transition-all duration-1000"
          style={{ opacity: visible?1:0, transform: visible?'none':'translateY(30px)' }}>
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-600 mb-5">The Workflow</p>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            Three steps.<br/>
            <span className="text-slate-300 font-medium italic">That's all it takes.</span>
          </h2>
        </div>
        <div className="space-y-28">
          {steps.map((step, i) => (
            <StepRow key={i} step={step} isEven={i%2===1} colorClass={colorMap[step.color]} glowClass={glowMap[step.color]} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepRow({ step, isEven, colorClass, glowClass }: { step: any; isEven: boolean; colorClass: string; glowClass: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div ref={ref}
      className={`grid md:grid-cols-2 gap-16 items-center transition-all duration-700 ${isEven ? 'md:grid-flow-dense' : ''}`}
      style={{ opacity: visible?1:0, transform: visible?'none':'translateY(32px)' }}>
      <div className={isEven ? 'md:col-start-2' : ''}>
        <div className={`inline-flex items-center px-4 py-2 rounded-2xl border text-[11px] font-black uppercase tracking-widest mb-8 ${colorClass}`}>
          Step {step.number}
        </div>
        <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">{step.title}</h3>
        <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-md">{step.desc}</p>
      </div>
      <div className={`${isEven ? 'md:col-start-1 md:row-start-1' : ''} relative`}>
        <div className={`absolute -inset-6 rounded-[40px] opacity-15 blur-3xl ${glowClass}`} />
        {step.visual === 'demo-form' ? (
          <FastDemoForm />
        ) : step.image ? (
          <div className="relative bg-white rounded-[28px] p-2 shadow-[0_0_40px_-8px_rgba(0,0,0,0.10)] border border-slate-100 overflow-hidden">
            <img src={step.image} alt={step.title} className="w-full h-auto rounded-[20px] object-cover aspect-[4/3]" />
          </div>
        ) : (
          <div className="relative bg-white rounded-[28px] p-2 shadow-[0_0_40px_-8px_rgba(0,0,0,0.10)] border border-slate-100">
            <div className="bg-slate-50 rounded-[20px] aspect-[4/3] flex items-center justify-center">
              <p className="text-slate-300 font-bold uppercase tracking-tighter text-sm italic">Image Pending</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
/// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — FEATURES BENTO GRID
// Status: Fully Coded with Micro-UIs. No external images required.
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
      visual: (
        <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 bg-white rounded-3xl rotate-12 shadow-2xl p-3 hidden lg:block group-hover:rotate-[8deg] group-hover:-translate-y-4 transition-all duration-500">
          <div className="w-full h-full border-4 border-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2">
            <QrCode className="w-20 h-20 text-slate-900" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Scan to Book</span>
          </div>
        </div>
      )
    },
    {
      size: 'col-span-1',
      icon: <Bot className="w-6 h-6 text-violet-400" />,
      badge: 'AI Co-pilot',
      title: 'Quotes in 60 seconds',
      desc: 'AI reads customer photos and drafts line items. You review and send.',
      accent: 'violet',
      visual: (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-violet-500/10 to-transparent skew-x-12 group-hover:animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      )
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
      desc: 'Your whole pipeline visible at a glance. Status filters, AI assistance, and real-time stats — nothing falls through the cracks.',
      accent: 'slate',
      visual: (
        <div className="absolute right-6 top-6 bottom-6 w-1/2 hidden lg:flex flex-col gap-3 pl-12 pointer-events-none">
          {/* Mock Lead Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-700">
            <div className="flex justify-between mb-2">
               <div className="w-12 h-1.5 bg-blue-500/40 rounded-full" />
               <div className="w-4 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="w-20 h-2 bg-white/20 rounded-full" />
          </div>
          {/* Mock Lead Card 2 */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-3 shadow-xl transform translate-x-8 group-hover:translate-x-2 transition-transform duration-700 delay-75">
            <div className="flex justify-between mb-2">
               <div className="w-12 h-1.5 bg-blue-400 rounded-full" />
               <div className="w-4 h-1.5 bg-blue-400/30 rounded-full" />
            </div>
            <div className="w-24 h-2 bg-white/80 rounded-full" />
          </div>
        </div>
      )
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
      <style jsx global>{`
        @keyframes scan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={ref} className="mb-16 max-w-2xl"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Inside the product</p>
          <h2 className="text-5xl font-black text-white tracking-tight leading-[0.92]">
            Everything happens here.
          </h2>
          <p className="text-slate-400 text-lg mt-4 font-medium leading-relaxed">
            One place for every lead, quote, schedule, and payment. Built for the speed of the job site.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiles.map((tile, i) => {
            const { ref: tRef, visible: tVis } = useFadeIn();
            return (
              <div
                key={i} ref={tRef}
                className={`md:${tile.size} relative overflow-hidden bg-white/[0.03] border border-white/[0.07] rounded-[2.5rem] p-10 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-500 group`}
                style={{ opacity: tVis ? 1 : 0, transform: tVis ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.08}s` }}
              >
                {/* Visual Background Elements */}
                {tile.visual}

                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest mb-8 ${accentMap[tile.accent]}`}>
                    {tile.icon}
                    {tile.badge}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-200 transition-colors tracking-tight">{tile.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium max-w-[280px]">{tile.desc}</p>
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
// SECTION 5 — AI CO-PILOT (Light, Glassmorphism Feel)
// ─────────────────────────────────────────────────────────────────────────────
function AiSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section id="ai" className="py-32 px-6 bg-[#FAFAFB] relative overflow-hidden border-t border-slate-100">
      {/* Soft Blue/Violet Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-400/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid lg:grid-cols-2 gap-20 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* LEFT — THE AI INTERFACE (Visual Proof) */}
          <div className="relative group order-2 lg:order-1">
            {/* The "Quote Drafting" Card - High Contrast Light Mode */}
            <div className="relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">AI Engine</p>
                    <p className="text-slate-900 font-black text-sm">Drafting Quote #2044</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] text-slate-500 font-black border border-slate-200 uppercase tracking-tighter">
                  Generating...
                </div>
              </div>

              {/* AI Typing Simulation with Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse">
                  <span className="text-slate-700 text-sm font-bold">Roof Shingle Replacement</span>
                  <span className="text-violet-600 font-black text-sm">$2,400.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl opacity-60">
                  <span className="text-slate-700 text-sm font-bold">Flashing & Sealant</span>
                  <span className="text-violet-600 font-black text-sm">$450.00</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl opacity-30">
                  <span className="text-slate-700 text-sm font-bold">Debris Removal</span>
                  <span className="text-violet-600 font-black text-sm">$300.00</span>
                </div>
              </div>

              {/* Action Button Area */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Estimated</p>
                 <p className="text-3xl font-black text-slate-900 tracking-tighter">$3,150.00</p>
              </div>
            </div>

            {/* Floating Annotation (Yellow Note Style) */}
            <div className="absolute -top-4 -right-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-xl -rotate-2 hidden md:block">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-amber-900 font-black text-[11px] uppercase tracking-tighter">Analyzing Photos...</p>
              </div>
            </div>
          </div>

          {/* RIGHT — COPY */}
          <div className="order-1 lg:order-2 space-y-8">
            <span className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 text-violet-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
              <Bot className="w-3.5 h-3.5" /> Intelligence
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Quotes that <br/>
              <span className="text-slate-300">write themselves.</span>
            </h2>
            <p className="text-xl text-slate-500 leading-relaxed font-medium">
              Lead2Project understands your jobs. Our AI reads customer photos and job descriptions to draft professional, line-item quotes in seconds.
            </p>
            
            <div className="grid gap-3">
              {[
                { t: 'Instant Line Items', d: 'AI identifies materials and labor from lead photos.' },
                { t: 'Project Briefs', d: 'Automatically summarizes leads for your crew.' },
                { t: 'Smart Outbox', d: 'AI drafts the perfect follow-up email for every client.' }
              ].map((item, idx) => (
                <div key={idx} className="group flex gap-4 p-5 rounded-3xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-lg leading-none mb-1.5">{item.t}</p>
                    <p className="text-slate-500 text-sm font-medium">{item.d}</p>
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
// SECTION 6 — DAILY DIGEST + OUTBOX (Dark Mode Visual)
// ─────────────────────────────────────────────────────────────────────────────
function DigestSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section id="digest" className="py-32 px-6 bg-[#080C14] border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid lg:grid-cols-2 gap-20 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {/* LEFT — COPY */}
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
              <Mail className="w-3.5 h-3.5" /> Daily Command
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Know your day<br/>
              <span className="text-slate-500">before it starts.</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              Every morning at 6:00 AM — get your new leads, overdue payments, and today's schedule in one email. No login required.
            </p>
            
            <div className="grid gap-4">
              {[
                { t: 'Morning Digest', d: 'Your entire business health delivered at 6AM every day.' },
                { t: 'Outbox Paper Trail', d: 'Every quote and reminder logged. No "I never got that" excuses.' },
                { t: 'One-Click Sending', d: 'Send professional updates without leaving the lead board.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-3.5 h-3.5 text-amber-500" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg leading-none mb-2">{item.t}</p>
                    <p className="text-slate-500 text-sm font-medium">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — THE VISUAL (Smartphone + Email Preview) */}
          <div className="relative group">
            {/* Ambient Amber Glow */}
            <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Smartphone Lock Screen */}
            <div className="relative mx-auto w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden z-20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-700">
               {/* Lock Screen Header */}
               <div className="pt-12 px-6 text-center">
                  <p className="text-white/60 text-xs font-bold">Friday, March 27</p>
                  <h3 className="text-6xl font-black text-white tracking-tighter mt-2">6:00</h3>
               </div>

               {/* Notifications */}
               <div className="mt-12 px-4 space-y-3">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg animate-bounce-slow">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] text-white font-black">L</div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Lead2Project</p>
                    </div>
                    <p className="text-white font-bold text-sm leading-tight">Your Daily Digest is ready</p>
                    <p className="text-white/60 text-xs mt-1">3 new leads, 2 overdue payments...</p>
                  </div>
               </div>
            </div>

            {/* Email Preview Card (Floating behind phone) */}
            <div className="absolute top-20 -right-10 lg:-right-20 w-[380px] bg-[#161B26] border border-white/10 rounded-3xl shadow-2xl p-8 z-10 transform rotate-6 group-hover:rotate-3 transition-transform duration-700">
               <div className="flex items-center gap-3 mb-8">
                  <Mail className="w-5 h-5 text-amber-400" />
                  <p className="text-white font-black text-sm tracking-tight">Today's Briefing</p>
               </div>
               
               <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Pending Revenue</p>
                    <p className="text-4xl font-black text-amber-400 tracking-tighter">$37,194.00</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">New Leads</span>
                       <span className="text-white font-bold">+3</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Scheduled Today</span>
                       <span className="text-white font-bold">5</span>
                    </div>
                  </div>

                  <div className="pt-4">
                     <div className="w-full h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase tracking-widest">Open Dashboard</div>
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
// SECTION 7 — THE "ALL-IN-ONE" UPGRADE
// ─────────────────────────────────────────────────────────────────────────────
function Comparison() {
  const { ref, visible } = useFadeIn();

  const comparisons = [
    { 
      label: 'Digital Presence', 
      them: 'Expensive Website + Hosting', 
      us: 'One Link. Socials, QR, or Bio.' 
    },
    { 
      label: 'Lead Capture', 
      them: 'Contact forms that email you', 
      us: 'Smart Link that builds the job' 
    },
    { 
      label: 'Quoting', 
      them: 'Manual PDF creation', 
      us: 'AI-Drafted line items' 
    },
    { 
      label: 'Visibility', 
      them: 'Check 5 different apps', 
      us: 'Track everything in one board' 
    },
    { 
      label: 'Setup', 
      them: 'Weeks of web design', 
      us: 'Live in 2 minutes' 
    },
  ];

  return (
    <section id="compare" className="py-32 px-6 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div
          ref={ref}
          className="text-center mb-20"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s ease' }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4 block underline underline-offset-4">The New Standard</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            No Website? <br/>
            <span className="text-slate-400 font-medium">No Problem.</span>
          </h2>
          <p className="mt-8 text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            You don't need a $3,000 website. You need a **booking link** that works in your Instagram bio, Facebook page, and email signature. 
            One link to capture, quote, and track every single dollar.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="relative z-10 space-y-3">
          {comparisons.map((item, i) => (
            <div 
              key={i} 
              className="group grid grid-cols-1 md:grid-cols-3 items-center p-6 md:p-10 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
              style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.1}s` }}
            >
              {/* Category Label */}
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 md:mb-0">
                {item.label}
              </div>

              {/* The "Them" side */}
              <div className="flex items-center gap-3 text-slate-400 font-medium mb-4 md:mb-0 grayscale opacity-60">
                <XCircle size={18} className="text-slate-300 shrink-0" />
                <span className="text-sm line-through decoration-slate-300 underline-offset-2">{item.them}</span>
              </div>

              {/* The "Us" side */}
              <div className="flex items-center gap-4 bg-blue-50 md:bg-transparent p-5 md:p-0 rounded-2xl md:rounded-none border border-blue-100 md:border-none shadow-sm md:shadow-none">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                  <Zap size={14} className="text-white fill-current" />
                </div>
                <span className="text-slate-900 font-black text-lg md:text-2xl tracking-tighter leading-none">
                  {item.us}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callout */}
        <div className="mt-16 bg-slate-900 rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
             <Globe size={120} className="text-white" />
           </div>
           <h3 className="text-white text-2xl font-black mb-4 relative z-10">Ready to own your digital storefront?</h3>
           <p className="text-slate-400 font-medium mb-8 relative z-10">Set up your link in under 2 minutes and start tracking jobs today.</p>
           <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-500 transition-all active:scale-95 relative z-10">
              Claim Your Link <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8 — PRICING (Basic & Pro Focus)
// ─────────────────────────────────────────────────────────────────────────────
function Pricing() {
  const { ref, visible } = useFadeIn();

  const plans = [
    {
      name: 'Basic',
      price: 49,
      desc: 'Your entire digital storefront and job tracking in one link.',
      highlight: false,
      cta: 'Start 14-Day Free Trial',
      href: '/signup?plan=basic',
      features: [
        'Custom Booking Link (No Website Needed)',
        'Branded QR Code for Trucks & Signs',
        'Unlimited Lead Capture & Photo Uploads',
        'Visual Lead Board (Kanban & Table)',
        'Job Scheduling & Quote Builder',
        'Custom Pipeline Stages & Task Lists',
        'CSV Export for Bookkeeping',
        'Unlimited Team Members'
      ],
    },
    {
      name: 'Pro',
      price: 99,
      desc: 'The complete AI-powered office for contractors who want to scale.',
      highlight: true,
      cta: 'Go Pro — 14 Days Free',
      href: '/signup?plan=pro',
      features: [
        'Everything in Basic',
        'AI Quote Generator from Photos ✦',
        'AI Project Briefs for Crews ✦',
        '6AM Daily Digest Email Briefing ✦',
        'One-Click Email Sending (Quotes/Reminders)',
        'Full Email Outbox & Sent History',
        'Custom Email Templates & Branding',
        'AI Assistant — Ask Anything ✦'
      ],
    },
  ];

  return (
    <section id="pricing" className="py-32 px-6 bg-[#080C14] border-t border-white/[0.06] overflow-hidden">
      <div className="max-w-6xl mx-auto relative">
        {/* Decorative Glow */}
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />

        <div
          ref={ref}
          style={{ 
            opacity: visible ? 1 : 0, 
            transform: visible ? 'none' : 'translateY(24px)', 
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
        >
          <div className="text-center mb-20">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400 mb-4 block">Simple Monthly Billing</span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
              One job pays for<br/>
              <span className="text-slate-500">the whole year.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
              Choose the plan that fits your stage. No setup fees, no contracts, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan) => (
              <div key={plan.name}
                className={`group rounded-[3rem] p-10 border transition-all duration-500 relative ${
                  plan.highlight
                    ? 'bg-[#0F172A] border-blue-500 shadow-2xl shadow-blue-900/20 md:scale-105 z-10'
                    : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20'
                }`}>
                
                {plan.highlight && (
                  <div className="absolute -top-4 left-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-xl">
                    Recommended for Growth
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-xl font-black uppercase tracking-widest ${plan.highlight ? 'text-blue-400' : 'text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-7xl font-black text-white tracking-tighter">${plan.price}</span>
                    <span className="text-slate-500 font-bold text-lg">/mo</span>
                  </div>
                </div>

                <p className="text-slate-400 font-medium mb-10 text-lg leading-relaxed min-h-[60px]">
                  {plan.desc}
                </p>

                <Link href={plan.href}
                  className={`block text-center w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all active:scale-95 mb-10 ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30'
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}>
                  {plan.cta}
                </Link>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6 border-b border-white/5 pb-2">What's included:</p>
                  <ul className="grid gap-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          f.includes('✦') ? 'bg-violet-500/20' : plan.highlight ? 'bg-blue-500/20' : 'bg-white/10'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            f.includes('✦') ? 'text-violet-400' : plan.highlight ? 'text-blue-400' : 'text-slate-400'
                          }`} strokeWidth={4}/>
                        </div>
                        <span className={`text-sm font-semibold tracking-tight ${
                          f.includes('✦') ? 'text-violet-200' : 'text-slate-300'
                        }`}>
                          {f.replace(' ✦', '')}
                          {f.includes('✦') && (
                            <span className="ml-2 text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-md font-black border border-violet-500/30 uppercase tracking-tighter">
                              AI
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-20 flex flex-col items-center justify-center gap-8">
            <div className="flex -space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-[#080C14] bg-slate-800 overflow-hidden shadow-xl">
                  <img src={`https://i.pravatar.cc/100?img=${i+15}`} alt="contractor" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-[#080C14] bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-xl">+120</div>
            </div>
            <p className="text-slate-500 font-bold tracking-tight text-center">
              Join <span className="text-white">120+ contractors</span> switching to Lead2Project this month.
            </p>
            <div className="flex items-center gap-10 opacity-30 grayscale pointer-events-none">
               <span className="text-white font-black tracking-tighter text-xl uppercase">Stripe Secure</span>
               <span className="text-white font-black tracking-tighter text-xl uppercase">256-Bit SSL</span>
            </div>
          </div>
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