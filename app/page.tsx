'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Check, Menu, X, Star, Layout,
  QrCode, Bot, Mail, BarChart2, ChevronDown, XCircle,
  Truck, Instagram, Facebook, AtSign, Globe,
  User, Phone, FileText, ChevronRight, MailCheck,
  Search, LayoutGrid, List, Plus, AlignLeft, Sparkles,
  Calendar, Clock, SlidersHorizontal, Filter, CreditCard, MessageCircle,
  MapPin, HomeIcon, Image as ImageIcon, Upload, Camera, PhoneOff, Database, CheckCircle2, Bell, CheckSquare
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
                { label: 'REVENUE COLLECTED', value: '$51,200',     vc: '#34d399' },
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
{/* Lead cards — 3 cols, accurate status colors */}
            <div style={{ padding: '0 10px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, flex: 1 }}>

              {[
                { name: 'John Simpson',  status: 'New',         statusBg: 'rgba(16,185,129,0.15)',  statusColor: '#34d399', borderColor: '#10b981', cardBg: '#080f08', cat: 'Roofing',  assign: 'Unassigned', date: 'Mar 31', time: '8:15 AM',  amount: '$74',     amountColor: '#fff',     amountLabel: 'Unpaid'  },
                { name: 'Jack Thomas',   status: 'New',         statusBg: 'rgba(16,185,129,0.15)',  statusColor: '#34d399', borderColor: '#10b981', cardBg: '#080f08', cat: 'Roofing',  assign: 'Alex K', date: 'Apr 8',  time: '8:30 AM',  amount: '$3,550', amountColor: '#fbbf24', amountLabel: 'Partial' },
                { name: 'Maria Reyes',   status: 'Contacted',   statusBg: 'rgba(99,102,241,0.15)',  statusColor: '#818cf8', borderColor: '#6366f1', cardBg: '#09090f', cat: 'Gutters',  assign: 'Tony',       date: 'Apr 2',  time: '10:00 AM', amount: '$1,200', amountColor: '#fff',     amountLabel: 'Unpaid'  },
                { name: 'Tony Marino',   status: 'In Progress', statusBg: 'rgba(245,158,11,0.15)',  statusColor: '#fbbf24', borderColor: '#f59e0b', cardBg: '#0f0d07', cat: 'Siding',   assign: 'Mike',       date: 'Apr 5',  time: '9:00 AM',  amount: '$6,400', amountColor: '#fbbf24', amountLabel: 'Partial' },
                { name: 'Carl Bennett',  status: 'Quoted',      statusBg: 'rgba(139,92,246,0.15)',  statusColor: '#a78bfa', borderColor: '#8b5cf6', cardBg: '#0a0810', cat: 'Windows',  assign: 'Unassigned', date: 'Apr 10', time: '1:00 PM',  amount: '$2,800', amountColor: '#fff',     amountLabel: 'Unpaid'  },
                { name: 'Diana Cole',    status: 'Completed',   statusBg: 'rgba(107,114,128,0.15)', statusColor: '#9ca3af', borderColor: '#6b7280', cardBg: '#090909', cat: 'Plumbing', assign: 'Tony',       date: 'Mar 27', time: '—',        amount: '$4,200', amountColor: '#34d399', amountLabel: 'Paid'    },
              ].map((lead, i) => (
                <div key={i} style={{ background: lead.cardBg, border: '1px solid rgba(255,255,255,0.05)', borderLeft: `2.5px solid ${lead.borderColor}`, borderRadius: 9, padding: '6px 7px', display: 'flex', flexDirection: 'column', gap: 3 }}>

                  <div style={{ display: 'inline-flex', background: lead.statusBg, color: lead.statusColor, fontSize: 5, fontWeight: 900, padding: '1.5px 5px', borderRadius: 4, textTransform: 'uppercase', alignSelf: 'flex-start', letterSpacing: '0.04em' }}>
                    {lead.status}
                  </div>

                  <div style={{ fontSize: 9, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{lead.name}</div>

                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <span style={{ fontSize: 5.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{lead.cat}</span>
                    <span style={{ fontSize: 5.5, color: '#374151' }}>·</span>
                    <span style={{ fontSize: 5.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 38 }}>{lead.assign}</span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 5, padding: '4px 5px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <div>
                      <div style={{ fontSize: 4.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Date</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Calendar size={6} color="#60a5fa" />
                        <span style={{ fontSize: 6, color: '#60a5fa', fontWeight: 700 }}>{lead.date}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 4.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 1 }}>Arrival</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Clock size={6} color="#6b7280" />
                        <span style={{ fontSize: 6, color: '#9ca3af', fontWeight: 700 }}>{lead.time}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, color: lead.amountColor }}>{lead.amount}</div>
                      <div style={{ fontSize: 4.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{lead.amountLabel}</div>
                    </div>
                    <div style={{ width: 14, height: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={7} color="#6b7280" />
                    </div>
                  </div>

                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Laptop chin */}
        <div style={{ background: '#1a1f2b', height: 10, borderRadius: '0 0 2px 2px', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none' }} />
        <div style={{ background: '#111520', height: 5, borderRadius: '0 0 8px 8px', border: '1px solid rgba(255,255,255,0.04)', borderTop: 'none' }} />
      </div>

     {/* ── PHONE — short, clean, bottom-right ── */}
      <div style={{
        position: 'absolute',
        bottom: -12,
        right: -8,
        zIndex: 30,
        width: 148,
        background: '#f9f9fb',
        borderRadius: 20,
        border: '5px solid #16181f',
        boxShadow: '0 24px 56px rgba(0,0,0,0.75)',
        overflow: 'hidden',
      }}>

        {/* App header */}
        <div style={{ background: '#e8e8f0', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ width: 16, height: 16, background: '#fff', borderRadius: 5, border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 5, fontWeight: 900, color: '#374151' }}>RL</span>
          </div>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#111827' }}>Ridge Line Roofing</span>
        </div>

        {/* Step indicator */}
        <div style={{ background: '#fff', padding: '6px 10px 5px', display: 'flex', alignItems: 'center', gap: 5, borderBottom: '1px solid #f1f1f1' }}>
          <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 7.5, fontWeight: 900, color: '#fff' }}>1</span>
          </div>
          <span style={{ fontSize: 6, fontWeight: 900, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Info</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: '#9ca3af' }}>2</span>
          </div>
          <span style={{ fontSize: 6, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</span>
        </div>

        {/* Fields */}
        <div style={{ background: '#fff', padding: '6px 10px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>

          {/* Full Name */}
          <div>
            <p style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Full Name</p>
            <div style={{ background: '#f3f4f6', borderRadius: 7, padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <User size={7} color="#9ca3af" />
              <span style={{ fontSize: 8, color: '#111827', fontWeight: 500 }}>John Simpson</span>
            </div>
          </div>

          {/* Email */}
          <div>
            <p style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Email</p>
            <div style={{ background: '#f3f4f6', borderRadius: 7, padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Mail size={7} color="#9ca3af" />
              <span style={{ fontSize: 8, color: '#111827', fontWeight: 500 }}>johns@gmail.com</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <p style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Phone</p>
            <div style={{ background: '#f3f4f6', borderRadius: 7, padding: '4px 7px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Phone size={7} color="#9ca3af" />
              <span style={{ fontSize: 8, color: '#111827', fontWeight: 500 }}>(555) 704-5325</span>
            </div>
          </div>

          {/* Service Needed */}
          <div>
            <p style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Service Needed</p>
            <div style={{ background: '#f3f4f6', borderRadius: 7, padding: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <QrCode size={7} color="#9ca3af" />
                <span style={{ fontSize: 8, color: '#111827', fontWeight: 600 }}>Roofing</span>
              </div>
              <ChevronDown size={7} color="#9ca3af" />
            </div>
          </div>

          {/* About Your Project — single clean line, no textarea weirdness */}
          <div>
            <p style={{ fontSize: 5.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>About Your Project</p>
            <div style={{ background: '#f3f4f6', borderRadius: 7, padding: '4px 7px' }}>
              <p style={{ fontSize: 7.5, color: '#6b7280', fontStyle: 'italic', margin: 0, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"Seeing a leak in my bedroom ceiling..."</p>
            </div>
          </div>

          {/* Continue button */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)', borderRadius: 9, padding: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#fff' }}>Continue</span>
            <ChevronRight size={9} color="#fff" />
          </div>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 6, color: '#9ca3af', margin: 0 }}>lead2project.com — Private</p>

        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — light bg, emotional urgency, sell against spreadsheets
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen bg-slate-50 flex flex-col overflow-hidden">

      {/* Subtle texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      {/* Blue ambient top */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-blue-100/60 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-indigo-100/40 blur-[100px] rounded-full pointer-events-none" />

      <Nav />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full pt-28 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT — copy */}
            <div className="space-y-8">

              {/* Badge */}
              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(12px)', transition:'all 0.6s ease' }}>
                <span className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 text-blue-700 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.18em]">
                  <Zap className="w-3 h-3 fill-current" /> Built for contractors
                </span>
              </div>

              {/* Headline — High impact, sharp focus */}
<div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.08s' }}>
  <h1 className="text-[52px] md:text-[72px] font-[1000] text-slate-900 leading-[0.85] tracking-[-0.05em]">
    Stop running your<br/>
    business out of<br/>
    <span className="text-blue-600">a spreadsheet.</span>
  </h1>
</div>

{/* Sub — The "Transformation" Copy */}
<div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.16s' }}>
  <p className="text-[19px] text-slate-600 leading-relaxed max-w-[480px] font-medium">
    Spreadsheets don't send reminders or draft quotes. 
    Lead2Project automates your office work so you can focus on the job site. 
    <span className="text-slate-900 font-bold italic"> One link, one dashboard, done.</span>
  </p>

  {/* Refined Outcome Pills — More "Result" focused */}
  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[500px]">
    {[
      { stat: 'No More', thing: 'leads lost to missed calls', icon: <PhoneOff className="w-3 h-3"/> },
      { stat: '60 Sec',  thing: 'AI quotes from job photos', icon: <Sparkles className="w-3 h-3"/> },
      { stat: '1 Click', thing: 'to send & track follow-ups', icon: <Zap className="w-3 h-3"/> },
      { stat: 'Daily',   thing: '6AM briefing on your day', icon: <Calendar className="w-3 h-3"/> },
    ].map(({ stat, thing, icon }) => (
      <div key={thing} className="group flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-300">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{stat}</p>
          <p className="text-[11px] text-slate-500 font-bold leading-none">{thing}</p>
        </div>
      </div>
    ))}
  </div>
</div>
              {/* CTAs */}
              <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(16px)', transition:'all 0.7s ease 0.24s' }}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/signup"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[15px] font-black shadow-xl shadow-blue-600/25 hover:-translate-y-0.5 transition-all active:scale-95">
                    Get Started Free <ArrowRight size={17}/>
                  </Link>
                  <Link href="/demo"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl text-[15px] font-bold transition-all shadow-sm">
                    <Layout className="w-4 h-4 text-slate-400" /> See Live Demo
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-6 flex items-center gap-4 pt-6 border-t border-slate-200">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-slate-50 bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-amber-400 mb-1">
                      {[...Array(5)].map((_,i) => <Star key={i} size={12} fill="currentColor"/>)}
                    </div>
                    <p className="text-[12px] text-slate-500 font-bold">"Set up in 2 minutes. Closed a job the same afternoon."</p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">14-day free trial</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No credit card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — mockup with mobile scale */}
            <div style={{ opacity: mounted?1:0, transform: mounted?'none':'translateY(24px) scale(0.97)', transition:'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s', position: 'relative' }}
              className="pb-10">
              <div className="scale-[0.52] origin-top-left sm:scale-[0.72] md:scale-[0.88] lg:scale-100 -mb-72 sm:-mb-44 md:-mb-20 lg:mb-0">
                <HeroMockup />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// TRUST BAR — THE "SYSTEM IMPACT" EDITION
// ─────────────────────────────────────────────────────────────────────────────
function TrustBar() {
  const { ref, visible } = useFadeIn();

  const stats = [
    { 
      value: '10+ Hours', 
      label: 'Admin saved weekly', 
      sub: 'Per contractor',
      icon: <Clock className="w-4 h-4 text-blue-600" />
    },
    { 
      value: '60 Seconds', 
      label: 'To draft a quote', 
      sub: 'AI-powered speed',
      icon: <Zap className="w-4 h-4 text-amber-500" />
    },
    { 
      value: 'Zero', 
      label: 'Forgotten leads', 
      sub: 'Automated follow-ups',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    },
    { 
      value: '100%', 
      label: 'Data Ownership', 
      sub: 'Easy CSV exports',
      icon: <Database className="w-4 h-4 text-indigo-600" />
    },
  ];

  return (
    <div className="bg-white border-y border-slate-100 py-16 px-6 relative overflow-hidden">
      {/* Subtle background wash */}
      <div className="absolute inset-0 bg-slate-50/30 pointer-events-none" />

      <div 
        ref={ref} 
        className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10"
        style={{ 
          opacity: visible ? 1 : 0, 
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
        }}
      >
        {stats.map((s, i) => (
          <div key={i} className="group flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {s.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
            </div>
            
            <p className="text-4xl md:text-5xl font-[1000] text-slate-900 tracking-tighter leading-none mb-2">
              {s.value}
            </p>
            
            <p className="text-[12px] text-slate-500 font-bold italic opacity-70 group-hover:opacity-100 transition-opacity">
              {s.sub}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


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
// HOW IT WORKS — DARK MODE EDITION
// ─────────────────────────────────────────────────────────────────────────────
function HowItWorks() {
  const { ref, visible } = useFadeIn();
  
  const steps = [
    { 
      number: '01', 
      color: 'blue', 
      title: 'Customer scans QR or clicks link', 
  desc: 'Print it on your truck, stick it on a yard sign, or drop link in your Instagram bio. One scan opens your booking form directly in their browser — no app, no login, no friction. You get the lead whether you answered the phone or not.',
      image: '/images/qr-scan-2.png', 
      visual: null 
    },
    { 
      number: '02', 
      color: 'indigo', 
      title: 'Fills out form', 
      desc: 'They enter their info, describe the job, and pick a service. You get everything you need — name, phone, photos, and project details — before the first call.', 
      image: null, 
      visual: 'demo-form' 
    },
    { 
      number: '03', 
      color: 'emerald', 
      title: 'It lands on your dashboard', 
      desc: 'The lead lands on your dashboard instantly. AI drafts the quote. Review, click once, and it’s in their inbox.', 
      image: '/images/dashboard-jobsite.png', 
      visual: null 
    },
  ];

  // Dark mode color mappings
  const colorMap: Record<string, string> = { 
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400', 
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', 
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
  };
  
  const glowMap: Record<string, string> = { 
    blue: 'bg-blue-600', 
    indigo: 'bg-indigo-600', 
    emerald: 'bg-emerald-600' 
  };

  return (
    <section id="how-it-works" className="py-32 px-6 bg-[#080C14] overflow-hidden border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto">
        <div ref={ref} className="text-center mb-32 transition-all duration-1000"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)' }}>
          <p className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-500 mb-5">The Workflow</p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
            Three steps.<br/>
            <span className="text-slate-600 font-medium italic">That’s all it takes.</span>
          </h2>
        </div>
        
        <div className="space-y-40">
          {steps.map((step, i) => (
            <StepRow 
              key={i} 
              step={step} 
              isEven={i % 2 === 1} 
              colorClass={colorMap[step.color]} 
              glowClass={glowMap[step.color]} 
            />
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
      className={`grid md:grid-cols-2 gap-16 lg:gap-24 items-center transition-all duration-1000 ${isEven ? 'md:grid-flow-dense' : ''}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)' }}>
      
      <div className={isEven ? 'md:col-start-2' : ''}>
        <div className={`inline-flex items-center px-5 py-2 rounded-2xl border text-[12px] font-black uppercase tracking-[0.2em] mb-8 ${colorClass}`}>
          Step {step.number}
        </div>
        <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8 leading-none">
          {step.title}
        </h3>
        <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-md">
          {step.desc}
        </p>
      </div>

      <div className={`${isEven ? 'md:col-start-1 md:row-start-1' : ''} relative`}>
        {/* Neon Back-glow */}
        <div className={`absolute -inset-10 rounded-full opacity-10 blur-[100px] ${glowClass} animate-pulse`} />
        
        {step.visual === 'demo-form' ? (
          <div className="relative transform hover:scale-[1.02] transition-transform duration-500">
             <FastDemoForm />
          </div>
        ) : step.image ? (
          <div className="relative bg-[#111827] rounded-[32px] p-3 shadow-2xl border border-white/[0.08] overflow-hidden group">
            <img 
              src={step.image} 
              alt={step.title} 
              className="w-full h-auto rounded-[24px] object-cover aspect-[4/3] opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="relative bg-[#111827] rounded-[32px] p-3 shadow-2xl border border-white/[0.08]">
            <div className="bg-[#080C14] rounded-[24px] aspect-[4/3] flex flex-col items-center justify-center border border-dashed border-white/10">
              <Sparkles className="text-white/10 mb-4" size={40} />
              <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Visual Experience Loading</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — THE PROJECT HUB (Clean Light Mode)
// ─────────────────────────────────────────────────────────────────────────────
function ProjectHub() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-24 px-6 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* LEFT: THE VALUE PROMISE */}
          <div className="max-w-xl">
            <span className="text-[10px] font-[1000] uppercase tracking-[0.25em] text-blue-600 mb-6 block">
              The Digital Job Folder
            </span>
            <h2 className="text-5xl md:text-6xl font-[1000] text-slate-900 leading-[0.9] tracking-tighter mb-8">
              Every job detail.<br/>
              <span className="text-slate-400">Zero search time.</span>
            </h2>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">
              Stop digging through text threads and paper stacks. Lead2Project organizes every lead into a "Smart Card" that tracks the job from the first QR scan to the final payment.
            </p>

            <div className="space-y-4">
              {[
                { t: 'One-Click Outbox', d: 'Send quotes & schedules instantly. We track when they open them.' },
                { t: 'Media & Activity', d: 'Upload site photos and track every internal update in real-time.' },
                { t: 'AI Job Briefing', d: 'Your messy notes turned into clear crew instructions automatically.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.t}</p>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: THE TABBED CARD UI (Reflecting your code) */}
          <div ref={ref} className="relative pt-12"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
            
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-full h-full bg-slate-100 rounded-[3rem] -rotate-2 scale-105" />

            {/* The Main Card */}
            <div className="relative z-10 bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
              
              {/* Header (Light Mode) */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Project #1024 • Roofing</p>
                  <h3 className="text-3xl font-[1000] text-slate-900 tracking-tight">Marcus Rivera</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
              </div>

              {/* TABS (Directly reflecting your UI logic) */}
              <div className="flex bg-slate-50/80 px-4 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {[
                  { id: 'overview', label: 'Overview', icon: <Layout size={14} />, active: true },
                  { id: 'schedule', label: 'Schedule', icon: <Calendar size={14} /> },
                  { id: 'quote',    label: 'Quote',    icon: <CreditCard size={14} /> },
                  { id: 'media',    label: 'Media',    icon: <ImageIcon size={14} /> },
                  { id: 'ai',       label: 'AI Brief', icon: <Sparkles size={14} /> },
                ].map((tab) => (
                  <div key={tab.id} className={`
                    flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all
                    ${tab.active ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}
                  `}>
                    {tab.icon} {tab.label}
                  </div>
                ))}
              </div>

              {/* Content Area */}
              <div className="p-8 space-y-6 min-h-[300px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Phone</p>
                    <p className="text-xs font-black text-slate-900">(555) 123-4567</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Job Category</p>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase border border-blue-100">Shingle Roof</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageCircle size={12} className="text-emerald-500" /> Customer Message
                  </p>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "I have a leak in the back porch area. Seems to be getting worse after every rain. Need a quote ASAP."
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-lg bg-slate-200 border-2 border-white overflow-hidden shadow-sm" />
                    ))}
                  </div>
                  <button className="h-10 px-6 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all">
                    One-Click Quote
                  </button>
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
// SECTION 4 — FEATURES BENTO GRID (Light BG + Dark Cards + Original QR)
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
        <div className="absolute right-[-20px] bottom-[-20px] w-56 bg-white rounded-[28px] p-4 shadow-2xl hidden lg:block rotate-6 group-hover:rotate-3 group-hover:-translate-y-2 transition-all duration-500 border border-slate-100">
          {/* QR panel - YOUR ORIGINAL QR CODE */}
          <div className="bg-[#0d1117] rounded-2xl p-3 mb-3">
            <svg viewBox="0 0 200 200" className="w-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" fill="#0d1117"/>
              <rect x="10" y="10" width="50" height="50" rx="6" fill="#fff"/><rect x="17" y="17" width="36" height="36" rx="3" fill="#0d1117"/><rect x="23" y="23" width="24" height="24" rx="2" fill="#fff"/>
              <rect x="140" y="10" width="50" height="50" rx="6" fill="#fff"/><rect x="147" y="17" width="36" height="36" rx="3" fill="#0d1117"/><rect x="153" y="23" width="24" height="24" rx="2" fill="#fff"/>
              <rect x="10" y="140" width="50" height="50" rx="6" fill="#fff"/><rect x="17" y="147" width="36" height="36" rx="3" fill="#0d1117"/><rect x="23" y="153" width="24" height="24" rx="2" fill="#fff"/>
              <g fill="#fff">
                <rect x="72" y="10" width="7" height="7" rx="1"/><rect x="82" y="10" width="7" height="7" rx="1"/><rect x="99" y="10" width="7" height="7" rx="1"/><rect x="109" y="10" width="7" height="7" rx="1"/><rect x="126" y="10" width="7" height="7" rx="1"/>
                <rect x="72" y="20" width="7" height="7" rx="1"/><rect x="92" y="20" width="7" height="7" rx="1"/><rect x="116" y="20" width="7" height="7" rx="1"/><rect x="126" y="20" width="7" height="7" rx="1"/>
                <rect x="82" y="30" width="7" height="7" rx="1"/><rect x="99" y="30" width="7" height="7" rx="1"/><rect x="109" y="30" width="7" height="7" rx="1"/>
                <rect x="72" y="40" width="7" height="7" rx="1"/><rect x="92" y="40" width="7" height="7" rx="1"/><rect x="99" y="40" width="7" height="7" rx="1"/><rect x="119" y="40" width="7" height="7" rx="1"/>
                <rect x="72" y="50" width="7" height="7" rx="1"/><rect x="82" y="50" width="7" height="7" rx="1"/><rect x="109" y="50" width="7" height="7" rx="1"/><rect x="126" y="50" width="7" height="7" rx="1"/>
                <rect x="10" y="65" width="7" height="7" rx="1"/><rect x="24" y="65" width="7" height="7" rx="1"/><rect x="38" y="65" width="7" height="7" rx="1"/><rect x="52" y="65" width="7" height="7" rx="1"/><rect x="150" y="65" width="7" height="7" rx="1"/><rect x="164" y="65" width="7" height="7" rx="1"/><rect x="178" y="65" width="7" height="7" rx="1"/>
                <rect x="10" y="75" width="7" height="7" rx="1"/><rect x="30" y="75" width="7" height="7" rx="1"/><rect x="50" y="75" width="7" height="7" rx="1"/><rect x="72" y="75" width="7" height="7" rx="1"/><rect x="89" y="75" width="7" height="7" rx="1"/><rect x="150" y="75" width="7" height="7" rx="1"/><rect x="170" y="75" width="7" height="7" rx="1"/>
                <rect x="20" y="85" width="7" height="7" rx="1"/><rect x="40" y="85" width="7" height="7" rx="1"/><rect x="72" y="85" width="7" height="7" rx="1"/><rect x="160" y="85" width="7" height="7" rx="1"/><rect x="178" y="85" width="7" height="7" rx="1"/>
                <rect x="10" y="95" width="7" height="7" rx="1"/><rect x="30" y="95" width="7" height="7" rx="1"/><rect x="50" y="95" width="7" height="7" rx="1"/><rect x="150" y="95" width="7" height="7" rx="1"/><rect x="168" y="95" width="7" height="7" rx="1"/>
                <rect x="20" y="105" width="7" height="7" rx="1"/><rect x="44" y="105" width="7" height="7" rx="1"/><rect x="72" y="105" width="7" height="7" rx="1"/><rect x="155" y="105" width="7" height="7" rx="1"/><rect x="178" y="105" width="7" height="7" rx="1"/>
                <rect x="72" y="140" width="7" height="7" rx="1"/><rect x="89" y="140" width="7" height="7" rx="1"/><rect x="106" y="140" width="7" height="7" rx="1"/><rect x="150" y="140" width="7" height="7" rx="1"/><rect x="168" y="140" width="7" height="7" rx="1"/><rect x="183" y="140" width="7" height="7" rx="1"/>
                <rect x="72" y="150" width="7" height="7" rx="1"/><rect x="99" y="150" width="7" height="7" rx="1"/><rect x="116" y="150" width="7" height="7" rx="1"/><rect x="155" y="150" width="7" height="7" rx="1"/><rect x="178" y="150" width="7" height="7" rx="1"/>
                <rect x="82" y="160" width="7" height="7" rx="1"/><rect x="106" y="160" width="7" height="7" rx="1"/><rect x="123" y="160" width="7" height="7" rx="1"/><rect x="150" y="160" width="7" height="7" rx="1"/><rect x="165" y="160" width="7" height="7" rx="1"/><rect x="183" y="160" width="7" height="7" rx="1"/>
                <rect x="72" y="170" width="7" height="7" rx="1"/><rect x="89" y="170" width="7" height="7" rx="1"/><rect x="113" y="170" width="7" height="7" rx="1"/><rect x="155" y="170" width="7" height="7" rx="1"/><rect x="175" y="170" width="7" height="7" rx="1"/>
                <rect x="82" y="180" width="7" height="7" rx="1"/><rect x="99" y="180" width="7" height="7" rx="1"/><rect x="123" y="180" width="7" height="7" rx="1"/><rect x="150" y="180" width="7" height="7" rx="1"/><rect x="165" y="180" width="7" height="7" rx="1"/><rect x="183" y="180" width="7" height="7" rx="1"/>
              </g>
              <circle cx="100" cy="100" r="22" fill="#fff"/>
              <polygon points="100,85 90,104 110,104" fill="#c0392b"/>
              <polygon points="93,90 84,106 102,106" fill="#e74c3c" opacity="0.8"/>
              <polygon points="107,90 98,106 116,106" fill="#c0392b" opacity="0.7"/>
              <text x="100" y="114" textAnchor="middle" fontSize="5" fontWeight="700" fill="#1a1a2e" fontFamily="system-ui">RIDGE LINE</text>
              <text x="100" y="120" textAnchor="middle" fontSize="4" fill="#6b7280" fontFamily="system-ui">ROOFING</text>
            </svg>
          </div>
          {/* Controls */}
          <div className="grid grid-cols-3 gap-1 mb-2">
            {['Standard','Brand','Dark'].map((t,i) => (
              <div key={t} className={`text-center py-1.5 rounded-lg text-[8px] font-black border ${i===2?'border-indigo-500 text-indigo-600 bg-indigo-50':'border-slate-200 text-slate-400'}`}>{t.toUpperCase()}</div>
            ))}
          </div>
          <div className="bg-[#0d1117] rounded-xl py-2 flex items-center justify-center">
            <span className="text-[8px] font-black text-white uppercase tracking-wider">Export PNG</span>
          </div>
        </div>
      )
    },
    // ... all other tiles stay exactly as you had them
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
      icon: <Layout className="w-6 h-6 text-slate-400" />,
      badge: 'Lead Board',
      title: 'Every job. One place.',
      desc: 'Your whole pipeline visible at a glance. Status filters, AI assistance, and real-time stats — nothing falls through the cracks.',
      accent: 'slate',
      visual: (
        <div className="absolute right-6 top-6 bottom-6 w-1/2 hidden lg:flex flex-col gap-3 pl-12 pointer-events-none">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 transform translate-x-4 group-hover:translate-x-0 transition-transform duration-700">
            <div className="flex justify-between mb-2">
               <div className="w-12 h-1.5 bg-blue-500/40 rounded-full" />
               <div className="w-4 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="w-20 h-2 bg-white/20 rounded-full" />
          </div>
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
    <section id="features" className="py-28 px-6 bg-slate-50 border-t border-slate-200">
      <style jsx global>{`
        @keyframes scan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* Header - Light mode background, dark text */}
        <div ref={ref} className="mb-16 max-w-2xl"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">Inside the product</p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[0.92]">
            Everything happens here.
          </h2>
          <p className="text-slate-600 text-lg mt-4 font-medium leading-relaxed">
            One place for every lead, quote, schedule, and payment. Built for the speed of the job site.
          </p>
        </div>

        {/* Bento grid - Cards remain DARK (#0d1117) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile, i) => {
            const { ref: tRef, visible: tVis } = useFadeIn();
            return (
              <div
                key={i} ref={tRef}
                className={`md:${tile.size} relative overflow-hidden bg-[#0d1117] border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-10 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group`}
                style={{ opacity: tVis ? 1 : 0, transform: tVis ? 'none' : 'translateY(20px)', transition: `all 0.6s ease ${i * 0.08}s` }}
              >
                {tile.visual}

                <div className="relative z-10">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest mb-8 ${accentMap[tile.accent]}`}>
                    {tile.icon}
                    {tile.badge}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 group-hover:text-blue-400 transition-colors tracking-tight">{tile.title}</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-medium max-w-[280px]">{tile.desc}</p>
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
// SECTION 5 — AI CO-PILOT (Position: Above Workflow Bento)
// ─────────────────────────────────────────────────────────────────────────────
function AiSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section id="ai" className="py-32 px-6 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      {/* Soft Ambient Glows - Subtle for Light Mode */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-400/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div
          ref={ref}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          style={{ 
            opacity: visible ? 1 : 0, 
            transform: visible ? 'none' : 'translateY(32px)', 
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
          }}
        >
          {/* LEFT — THE AI INTERFACE */}
          <div className="relative group order-2 lg:order-1">
            {/* The Main AI Card */}
            <div className="relative bg-white border border-slate-200 rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Lead2Project AI</p>
                    <p className="text-slate-900 font-black text-base">Drafting Quote #2044</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full text-[10px] text-indigo-600 font-black border border-indigo-100 uppercase tracking-widest animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Analyzing
                </div>
              </div>

              {/* AI Typing Simulation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="text-slate-800 text-[15px] font-bold">Roof Shingle Replacement</span>
                  <span className="text-indigo-600 font-black text-[15px]">$2,400.00</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl opacity-60">
                  <span className="text-slate-800 text-[15px] font-bold">Flashing & Sealant</span>
                  <span className="text-indigo-600 font-black text-[15px]">$450.00</span>
                </div>
                <div className="flex justify-between items-center p-5 bg-slate-50 border border-slate-100 rounded-2xl opacity-30">
                  <span className="text-slate-800 text-[15px] font-bold">Debris Removal</span>
                  <span className="text-indigo-600 font-black text-[15px]">$300.00</span>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="mt-10 pt-8 border-t border-slate-100 flex items-end justify-between">
                 <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Estimated</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">$3,150.00</p>
                 </div>
                 <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">
                    Review & Send
                 </button>
              </div>
            </div>

            {/* Floating Photo Annotation */}
            <div className="absolute -top-6 -right-6 bg-amber-50 border border-amber-200 px-5 py-4 rounded-[2rem] shadow-2xl -rotate-3 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center border border-amber-200">
                    <Camera size={18} className="text-amber-700" />
                </div>
                <div>
                   <p className="text-amber-900 font-black text-[11px] uppercase tracking-tighter">Photo Scan</p>
                   <p className="text-amber-700/70 text-[10px] font-bold leading-none">3 Images Found</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — COPY */}
          <div className="order-1 lg:order-2 space-y-8">
            <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em]">
              <Bot className="w-4 h-4" /> AI Intelligence
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9]">
              Quotes that <br/>
              <span className="text-slate-400 font-medium italic">write themselves.</span>
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Lead2Project doesn't just manage leads—it understands them. Our AI reads customer photos and job descriptions to draft professional, line-item quotes before you even pick up the phone.
            </p>
            
            <div className="space-y-4 pt-4">
              {[
                { t: 'Instant Line Items', d: 'AI identifies materials and labor from lead photos.' },
                { t: 'Project Summaries', d: 'Automatically boils down job notes for your crew.' },
                { t: 'One Click Emails', d: 'Send professional emails with a single click.' }
              ].map((item, idx) => (
                <div key={idx} className="group flex gap-5 p-6 rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-transparent hover:border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-slate-900 font-black text-lg leading-tight mb-1">{item.t}</p>
                    <p className="text-slate-500 text-sm font-medium leading-snug">{item.d}</p>
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
// SECTION 4B — WORKFLOW BENTO (Light BG + Dark Cards)
// ─────────────────────────────────────────────────────────────────────────────
function WorkflowFeatures() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="pb-32 px-6 bg-slate-50 overflow-hidden border-b border-slate-200">
      <div className="max-w-6xl mx-auto">

        {/* Section label — Updated for Light Mode */}
        <div ref={ref} className="mb-12 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-3">Your workflow, your rules</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Built to fit how<br/>
            <span className="text-slate-400 font-medium italic">you already work.</span>
          </h2>
        </div>

        {/* Bento grid — Cards stay Dark (#0d1117) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Tile 1 — Pipeline Stages */}
          <BentoTile
            badge="Pipeline"
            accent="blue"
            title="Your stages. Your flow."
            desc="Move leads through custom stages that match how you actually close jobs."
            delay={0}
          >
            <div className="mt-8 space-y-3">
              {[
                { label: 'New',       w: '100%', color: '#3b82f6' },
                { label: 'Quoted',    w: '65%',  color: '#f59e0b' },
                { label: 'Scheduled', w: '40%',  color: '#10b981' },
                { label: 'Closed',    w: '20%',  color: '#6b7280' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 w-14 shrink-0 uppercase tracking-tighter">{s.label}</span>
                  <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: s.w, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Tile 2 — Custom Categories */}
          <BentoTile
            badge="Categories"
            accent="violet"
            title="Tag every lead."
            desc="Roofing, HVAC, Plumbing—tag every lead to filter and quote without digging."
            delay={0.1}
          >
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { label: 'Roofing',    color: '#3b82f6' },
                { label: 'Gutters',    color: '#8b5cf6' },
                { label: 'Siding',     color: '#10b981' },
                { label: 'Repair',     color: '#f59e0b' },
                { label: '+ Add New',  color: '#374151', dashed: true },
              ].map((c, i) => (
                <div key={i} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold ${
                  c.dashed
                    ? 'border border-dashed border-white/20 text-slate-500'
                    : 'bg-white/[0.06] border border-white/[0.08] text-slate-300'
                }`}>
                  {!c.dashed && <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />}
                  {c.label}
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Tile 3 — Custom Form Questions */}
          <BentoTile
            badge="Custom Form"
            accent="amber"
            title="Ask exactly what you need."
            desc="Add questions for budget, gate codes, or pets before the first call."
            delay={0.2}
          >
            <div className="mt-8 space-y-2">
              {[
                { q: 'Budget range?',        type: 'Select' },
                { q: 'Pet on property?',     type: 'Yes/No' },
                { q: 'Gate access?',         type: 'Text'   },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-3">
                  <span className="text-[11px] font-medium text-slate-300 truncate">{item.q}</span>
                  <span className="text-[8px] font-black text-slate-600 bg-white/[0.05] px-2 py-0.5 rounded-lg uppercase tracking-widest">{item.type}</span>
                </div>
              ))}
            </div>
          </BentoTile>

          {/* Tile 4 — Quotes (col-span-2) */}
          <BentoTile
            badge="Quotes"
            accent="emerald"
            title="Line-item quotes. Sent in seconds."
            desc="AI drafts line items from photos and notes. Review, adjust, and send—all without leaving the dashboard."
            delay={0.3}
            wide
          >
            <div className="mt-8 bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                <div>
                  <p className="text-[12px] font-black text-white">Quote #2044 — Marcus Rivera</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Roofing · AI Drafted</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Check size={14} className="text-emerald-400" />
                </div>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[
                  { item: 'Shingle Replacement', price: '$2,400' },
                  { item: 'Flashing & Sealant',  price: '$450'  },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[13px] text-slate-400 font-medium">{row.item}</span>
                    <span className="text-[13px] font-black text-white">{row.price}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-emerald-500/5 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Total</span>
                <span className="text-[18px] font-black text-emerald-400 tracking-tighter">$2,850.00</span>
              </div>
            </div>
          </BentoTile>

          {/* Tile 5 — Tasks */}
          <BentoTile
            badge="Tasks"
            accent="slate"
            title="Nothing falls through."
            desc="Attach tasks to any lead. Follow ups, permits, or material orders."
            delay={0.4}
          >
            <div className="mt-8 space-y-3">
              {[
                { label: 'Call to confirm', done: true  },
                { label: 'Send estimate',   done: true  },
                { label: 'Pull city permit', done: false },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                    task.done ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'border-white/20 bg-transparent'
                  }`}>
                    {task.done && <Check size={10} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className={`text-[12px] font-bold tracking-tight ${
                    task.done ? 'text-slate-600' : 'text-slate-300'
                  }`}>{task.label}</span>
                </div>
              ))}
            </div>
          </BentoTile>

        </div>
      </div>
    </section>
  );
}

// ── Shared tile wrapper ──────────────────────────────────────────────────────
function BentoTile({
  badge, accent, title, desc, delay, wide, children,
}: {
  badge: string; accent: string; title: string; desc: string;
  delay: number; wide?: boolean; children?: React.ReactNode;
}) {
  const { ref, visible } = useFadeIn();

  const accentMap: Record<string, string> = {
    blue:    'bg-blue-500/10 border-blue-500/20 text-blue-400',
    violet:  'bg-violet-500/10 border-violet-500/20 text-violet-400',
    amber:   'bg-amber-500/10 border-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    slate:   'bg-white/5 border-white/10 text-slate-400',
  };

  return (
    <div
      ref={ref}
      className={`${wide ? 'md:col-span-2' : 'col-span-1'} relative bg-[#0d1117] border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-9 hover:border-blue-500/30 transition-all duration-500 group overflow-hidden`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(24px)',
        transition: `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${delay}s`,
      }}
    >
      <div className={`inline-flex items-center px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest mb-6 ${accentMap[accent]}`}>
        {badge}
      </div>
      <h3 className="text-2xl font-black text-white tracking-tight mb-3 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-slate-500 text-[15px] leading-relaxed font-medium max-w-[280px]">{desc}</p>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — DAILY DIGEST (rebuilt to match real digest content)
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
              Every morning at 6:00 AM — your jobs, overdue payments, stale leads, and follow-up reminders in one email. No login required.
            </p>

            <div className="grid gap-4">
              {[
                { t: "Today's Schedule",    d: 'Every job on your plate today — customer, time, and category.' },
                { t: 'Overdue Payments',    d: 'Who owes you money. How much. How overdue. No surprises.' },
                { t: 'Stale Leads',         d: 'Leads that went quiet — flagged before they go cold for good.' },
                { t: 'Quote Follow-Ups',    d: 'Quotes sent but not accepted. Time to nudge.' },
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

          {/* RIGHT — EMAIL MOCKUP */}
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500/8 blur-[120px] rounded-full pointer-events-none" />

            {/* Email card — looks like a real rendered email */}
            <div className="relative z-10 bg-white rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] max-w-sm mx-auto group-hover:-translate-y-1 transition-transform duration-700">

              {/* Email client chrome */}
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-[9px] text-slate-400 font-mono ml-2">
                  From: digest@lead2project.com
                </div>
              </div>

              {/* Email header */}
              <div className="bg-[#0d1117] px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                      <span className="text-[8px] font-black text-white">L</span>
                    </div>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Lead2Project</span>
                  </div>
                  <span className="text-[9px] text-slate-600">6:00 AM · Fri Mar 28</span>
                </div>
                <p className="text-white font-black text-sm mt-3">Ridge Line Roofing — Morning Briefing</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Here's everything you need to start the day.</p>
              </div>

              {/* Pending revenue banner */}
              <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Pending Revenue</p>
                  <p className="text-2xl font-black text-amber-500 tracking-tight mt-0.5">$37,194</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">New Leads</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">+3</p>
                </div>
              </div>

              {/* Today's jobs */}
              <div className="px-6 pt-4 pb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Today's Schedule</p>
                <div className="space-y-2">
                  {[
                    { name: 'Marcus Rivera',  time: '8:15 AM',  cat: 'Roofing',  dot: '#10b981' },
                    { name: 'Diane Holloway', time: '11:30 AM', cat: 'Plumbing', dot: '#3b82f6' },
                  ].map((job, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: job.dot }} />
                        <span className="text-[11px] font-bold text-slate-800">{job.name}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{job.cat}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-500">{job.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overdue payments */}
              <div className="px-6 pt-3 pb-2">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-3">Overdue Payments</p>
                <div className="space-y-2">
                  {[
                    { name: 'Jack Thomas',  amount: '$3,550', days: '5 days overdue' },
                    { name: 'Tony Marino',  amount: '$1,200', days: '12 days overdue' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <div>
                        <span className="text-[11px] font-bold text-slate-800">{p.name}</span>
                        <span className="text-[9px] text-red-400 font-bold ml-2">{p.days}</span>
                      </div>
                      <span className="text-[11px] font-black text-red-500">{p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stale leads */}
              <div className="px-6 pt-3 pb-4">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3">Needs Follow-Up</p>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Mitchell', days: '4 days ago', cat: 'Roofing' },
                    { name: 'Carl Bennett',   days: '6 days ago', cat: 'Gutters' },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50">
                      <span className="text-[11px] font-bold text-slate-800">{l.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-400">{l.cat}</span>
                        <span className="text-[9px] font-bold text-amber-500">{l.days}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-5">
                <div className="w-full bg-[#0d1117] rounded-xl py-3 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest">Open Dashboard</span>
                  <ChevronRight size={12} className="text-slate-500" />
                </div>
                <p className="text-center text-[9px] text-slate-400 mt-3">
                  lead2project.com · Unsubscribe
                </p>
              </div>
            </div>

            {/* Floating phone notification */}
            <div className="absolute -top-4 -right-4 md:-right-8 z-20 bg-[#1C1C1E] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl w-[200px] group-hover:-translate-y-1 group-hover:rotate-1 transition-all duration-700">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
                  <span className="text-[7px] font-black text-white">L</span>
                </div>
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Lead2Project</span>
                <span className="text-[9px] text-slate-600 ml-auto">now</span>
              </div>
              <p className="text-white text-[11px] font-bold leading-snug">Your 6AM digest is ready</p>
              <p className="text-slate-500 text-[10px] mt-0.5">3 new leads · $3,550 overdue</p>
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

      <ProjectHub />

      {/* 4. FEATURES BENTO — dark section, grid of capabilities */}
      <Features />



      {/* 5. AI CO-PILOT — light section, screenshot + bullet points */}
      <AiSection />



      {/* 6. DAILY DIGEST + OUTBOX — dark section, email preview + copy */}
      <DigestSection />

                  <WorkflowFeatures />


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