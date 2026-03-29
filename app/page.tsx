'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Check, Menu, X, Star, Layout,
  QrCode, Bot, Mail, BarChart2, ChevronDown, XCircle,
  Truck, Instagram, Facebook, AtSign, Globe,
  User, Phone, FileText, ChevronRight, MailCheck, Send, DollarSign,
  Search, LayoutGrid, List, Plus, AlignLeft, Sparkles, Target,
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
scrolled ? 'bg-[#F2EDE4]/95 backdrop-blur-xl border-b border-[#D9D2C8] shadow-sm' : 'bg-[#F2EDE4]/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/Lead2ProjectLogo.png" alt="L2P" className="h-10 w-auto" />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing']].map(([href,label]) => (
            <a key={href} href={href} className="hidden md:block text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden md:block text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
          <Link href="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-95">
            Start Free Trial
          </Link>
          <button onClick={() => setOpen(o => !o)} className="md:hidden p-1 text-slate-400">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>
      {open && (
<div className="md:hidden bg-[#F2EDE4] border-t border-[#D9D2C8] px-6 py-5 space-y-4">
          {[['#how-it-works','How it works'],['#features','Features'],['#pricing','Pricing'],['/login','Login']].map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block text-base font-semibold text-slate-700">{label}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

function HeroMockup() {
  return (
<div style={{ position: 'relative', width: '100%', maxWidth: 680, margin: '0 auto', userSelect: 'none' }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
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

          {/* Dashboard */}
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
                { label: 'TOTAL LEADS',      value: '20',      vc: '#fff' },
                { label: 'ACTIVE JOBS',      value: '20',      vc: '#60a5fa' },
                { label: 'REVENUE COLLECTED',value: '$51,200', vc: '#34d399' },
                { label: 'PENDING',          value: '$13,900', vc: '#fbbf24' },
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
            <div style={{ padding: '0 10px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, flex: 1 }}>
              {[
                { name: 'John Simpson',  status: 'New',         statusBg: 'rgba(16,185,129,0.15)',  statusColor: '#34d399', borderColor: '#10b981', cardBg: '#080f08', cat: 'Roofing',  assign: 'Unassigned', date: 'Mar 31', time: '8:15 AM',  amount: '$74',    amountColor: '#fff',     amountLabel: 'Unpaid'  },
                { name: 'Jack Thomas',   status: 'New',         statusBg: 'rgba(16,185,129,0.15)',  statusColor: '#34d399', borderColor: '#10b981', cardBg: '#080f08', cat: 'Roofing',  assign: 'Alex K',     date: 'Apr 8',  time: '8:30 AM',  amount: '$3,550', amountColor: '#fbbf24', amountLabel: 'Partial' },
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#F2EDE4' }}>
      <Nav />

      <div className="relative z-10 flex-1 flex items-center">
<div className="max-w-6xl mx-auto px-5 w-full pt-24 pb-8 lg:pb-16">
<div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-center">

            {/* LEFT — copy */}
            <div
              className="space-y-5 text-center lg:text-left"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
            >
              <div className="flex justify-center lg:justify-start">
                
              </div>

              <h1 className="font-black tracking-tight"
                style={{ fontSize: 'clamp(38px, 6vw, 64px)', color: '#0F1F3D', lineHeight: 1.0 }}>
                Everything to run<br />
                and grow your<br />
                <span style={{ color: '#1a6645' }}>home service business.</span>
              </h1>

              <p className="font-medium leading-relaxed mx-auto lg:mx-0 max-w-[440px]"
                style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#4A5568' }}>
                Win more jobs, get paid faster, and look more professional — all from one dashboard.
              </p>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {['QR lead capture', 'One-click quotes', 'Payment tracking', 'AI job briefs'].map(label => (
                  <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border"
                    style={{ background: 'white', borderColor: '#D1C9BD', color: '#0F1F3D' }}>
                    <Check size={11} strokeWidth={3} style={{ color: '#1a6645' }} />
                    {label}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-black text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ backgroundColor: '#1a6645', boxShadow: '0 8px 24px rgba(26,102,69,0.25)' }}>
                  Start Free Trial <ArrowRight size={16} />
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-bold border transition-all"
                  style={{ background: 'white', borderColor: '#D1C9BD', color: '#0F1F3D' }}>
                  <Layout className="w-4 h-4" style={{ color: '#6B7280' }} /> See Live Demo
                </Link>
              </div>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex gap-0.5">
                </div>
                <p className="text-[13px] font-medium" style={{ color: '#6B7280' }}>
                  14-day free trial · Cancel anytime · 2 min setup
                </p>
              </div>
            </div>

            {/* RIGHT — mockup */}
            <div
  className="w-full lg:flex items-center justify-center mt-8 lg:mt-0"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(24px) scale(0.97)',
                transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
              }}
            >
              <HeroMockup />
            </div>

          </div>
        </div>
      </div>

      <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #D9D2C8, transparent)' }} />
    </section>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// FEATURE TABS — Value focused, light gray bg (#F7F5F0)
// 5 tabs: Get Leads · Schedule · Quote & Win · Get Paid · Stay Sharp
// Replace the existing LeadCapture function with this entire block
// ─────────────────────────────────────────────────────────────────────────────
function LeadCapture() {
  const [active, setActive] = useState(0);
  const { ref, visible } = useFadeIn();

  const tabs = [
    {
      label: 'Get Leads',
      icon: <QrCode size={15} />,
      eyebrow: 'Never miss a lead',
      headline: 'Your truck is now\na lead machine.',
      desc: 'Print your branded QR code on your truck, yard signs, or drop the link in your Instagram bio. Customers fill out your custom form — name, job type, photos, budget, preferred date — and it lands on your dashboard instantly. You get the lead whether you answered the phone or not.',
      callout: 'Stop losing jobs to missed calls',
      points: [
        'Branded QR code — works on trucks, signs, social & business cards',
        'Fully customizable form — your colors, your questions, your order',
        'Collect address, preferred date & time, photos, budget range',
        'Lead hits your board the second they submit',
      ],
      quote: '"A neighbor scanned my yard sign while I was on the roof. Job was booked before I came down."',
      author: 'Mike T., Ridge Line Roofing',
      visual: (
        <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: '#1a2235' }}>
          <img
            src="/images/qrbranded.png"
            alt="QR on truck and yard sign"
            className="w-full h-full object-contain object-top"
          />
         
        </div>
      ),
    },
    {
      label: 'Schedule',
      icon: <Calendar size={15} />,
      eyebrow: 'Stop double-booking and no-shows',
      headline: 'Set the date.\nSend the confirmation.\nDone.',
      desc: 'Pick the job date, assign your crew, and send a professional confirmation email — all from the job card. No switching to a calendar app. No texting back and forth. One click and the customer knows exactly when you\'re coming.',
      callout: 'Customers who get confirmations cancel less',
      points: [
        'Set estimate date and job start date per card',
        'Assign jobs to any team member by name',
        'One-click confirmation email sent instantly',
        'Every email logged in the outbox — always reviewable',
      ],
      quote: '"I used to lose jobs because nobody confirmed the date. Now it\'s automatic."',
      author: 'Tony M., Shoreline Gutters',
visual: (
  <img
    src="/images/schedule-tab.png"
    alt="Schedule section"
    className="w-full h-full object-contain object-top"
    style={{ background: '#f8f9fb' }}
  />
),
    },
    {
      label: 'Quote & Win',
      icon: <FileText size={15} />,
      eyebrow: 'Stop losing bids to slow quotes',
      headline: 'Quote it fast.\nThey accept in one tap.',
      desc: 'Build a line-item quote right on the job card. Let AI draft it from the job description. Send it to the customer in one click — they get an email with an Accept or Decline button. Their answer updates your dashboard automatically. No chasing, no guessing.',
      callout: 'The faster you quote, the more jobs you win',
      points: [
        'Line-item quotes with auto totals',
        'AI quote generator — drafts from job description in seconds',
        'Customer gets Accept / Decline buttons in the email',
        'Custom quote templates per job category',
        'Quote status tracked — pending, accepted, declined',
      ],
      quote: '"I send quotes before I even leave the driveway. Customers love the speed."',
      author: 'Dave R., All-Pro Siding',
      visual: (
  <img
    src="/images/quotenew.png"
    alt="Quote section"
    className="w-full h-full object-cover"
    style={{ background: '#f8f9fb' }}
  />
),
    },
    {
      label: 'Get Paid',
      icon: <DollarSign size={15} />,
      eyebrow: 'Stop leaving money on the table',
      headline: 'Know who owes you.\nGet paid without the awkward text.',
      desc: 'Log deposits and final payments on every job. Send a payment request email in one click. See every job\'s payment status at a glance. Export everything to CSV for your bookkeeper — your data, always yours.',
      callout: 'Most contractors are owed $10K+ they haven\'t collected',
      points: [
        'Log deposit and final payment per job card',
        'One-click payment request email — professional, not awkward',
        'See outstanding balance across all jobs instantly',
        'Export all job and payment data to CSV anytime',
        'Custom payment reminder email templates',
      ],
      quote: '"I realized I had $14,000 sitting uncollected. The dashboard showed me in 10 seconds."',
      author: 'Carl B., ProClean Services',
      visual: (
        <div className="w-full h-full flex flex-col p-6 justify-center gap-3" style={{ background: '#111827' }}>
          {[
            { name: 'Marcus Rivera',  job: 'Roofing',  amount: '$8,400', status: 'Paid',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
            { name: 'Jack Thomas',   job: 'Siding',   amount: '$3,550', status: 'Deposit',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
            { name: 'Maria Reyes',   job: 'Gutters',  amount: '$1,200', status: 'Unpaid',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'  },
            { name: 'Tony Marino',   job: 'Windows',  amount: '$6,400', status: 'Deposit',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{row.name}</p>
                  <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>{row.job} · {row.amount}</p>
                </div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 20, background: row.bg, border: `1px solid ${row.border}`, color: row.color }}>{row.status}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Outstanding</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#ef4444' }}>$11,150</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Database size={12} color="#6b7280" />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Export all data as CSV</span>
          </div>
        </div>
      ),
    },
    {
      label: 'Stay Sharp',
      icon: <Bell size={15} />,
      eyebrow: 'Your 6AM morning briefing',
      headline: 'Know your day\nbefore it starts.',
      desc: 'Every morning at 6AM, Lead2Project sends you a digest of everything that needs attention — today\'s jobs, overdue payments, stale leads, unaccepted quotes, and reminders you set. No login required. Your whole business in one email.',
      callout: 'Stop starting your day reactive — start it informed',
      points: [
        "Today's scheduled jobs — who, where, what time",
        'New leads since yesterday',
        'Overdue payments — name, amount, days overdue',
        'Quotes sent but not yet accepted',
        'Reminders you set on any job card',
        'Stale leads that have gone quiet',
      ],
      quote: '"I check the digest before I get out of bed. I know my whole day before I touch my coffee."',
      author: 'James P., Peak Roofing Co.',
      visual: (
        <div className="w-full h-full flex flex-col p-5 justify-center" style={{ background: '#111827' }}>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center">
                <span style={{ fontSize: 7, fontWeight: 900, color: '#fff' }}>L</span>
              </div>
              <span style={{ fontSize: 9, color: '#6b7280', fontWeight: 700 }}>digest@lead2project.com</span>
              <span style={{ fontSize: 9, color: '#6b7280', marginLeft: 'auto' }}>6:00 AM</span>
            </div>
            <div className="px-4 py-3" style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: '#fff', marginBottom: 2 }}>Ridge Line Roofing — Morning Briefing</p>
              <p style={{ fontSize: 10, color: '#6b7280' }}>Friday, March 28 · Here's what needs your attention.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-4 py-3" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending Revenue</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>$37,194</p>
              </div>
              <div className="px-4 py-3">
                <p style={{ fontSize: 9, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Leads</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#60a5fa' }}>+3</p>
              </div>
            </div>
            {[
              { label: "Today's jobs",        value: '2 scheduled',      color: '#10b981' },
              { label: 'Overdue payments',     value: '2 · $4,750',       color: '#ef4444' },
              { label: 'Quotes not accepted',  value: '3 pending',        color: '#f59e0b' },
              { label: 'Stale leads',          value: '2 need follow-up', color: '#a78bfa' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 900, color: item.color }}>{item.value}</span>
              </div>
            ))}
            <div className="px-4 py-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Open Dashboard →</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 px-6 border-b" style={{ backgroundColor: '#F7F5F0', borderColor: '#E5E0D8' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={ref} className="text-center mb-12"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
            Built to save time & close more jobs
          </p>
          <h2 className="font-black leading-tight tracking-tight mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 60px)', color: '#0F1F3D' }}>
            The all-in-one solution<br />
            <span style={{ color: '#1a6645' }}>for home service pros.</span>
          </h2>
          <p className="text-lg font-medium max-w-2xl mx-auto" style={{ color: '#4A5568' }}>
            Stop running your business out of texts and a spreadsheet. Everything you need — leads, scheduling, quotes, payments, and your morning briefing — in one place.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-2 flex-wrap mb-12">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black border transition-all duration-300"
              style={active === i ? {
                background: '#0F1F3D', color: '#fff', borderColor: '#0F1F3D',
              } : {
                background: 'white', color: '#4A5568', borderColor: '#D1C9BD',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative" style={{ minHeight: 480 }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              className="grid lg:grid-cols-2 gap-12 items-center transition-all duration-500"
              style={{
                opacity: active === i ? 1 : 0,
                transform: active === i ? 'translateY(0)' : 'translateY(16px)',
                position: active === i ? 'relative' : 'absolute',
                inset: active === i ? 'auto' : 0,
                pointerEvents: active === i ? 'auto' : 'none',
                zIndex: active === i ? 10 : 0,
              }}
            >
              {/* LEFT — Visual */}
              <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden shadow-2xl">
                {tab.visual}
              </div>

              {/* RIGHT — Copy */}
              <div className="space-y-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#1a6645' }}>
                  {tab.eyebrow}
                </p>
                <h3 className="font-black leading-tight tracking-tight whitespace-pre-line"
                  style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', color: '#0F1F3D' }}>
                  {tab.headline}
                </h3>
                <p className="text-base font-medium leading-relaxed" style={{ color: '#4A5568' }}>
                  {tab.desc}
                </p>
                <div className="px-4 py-3 rounded-xl border-l-4 font-bold text-sm"
                  style={{ background: '#FFF8E1', borderLeftColor: '#F59E0B', color: '#92400E' }}>
                  ⚠ {tab.callout}
                </div>
                <div className="space-y-2.5">
                  {tab.points.map((pt, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: '#E8F4EF' }}>
                        <Check size={11} strokeWidth={4} style={{ color: '#1a6645' }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: '#374151' }}>{pt}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-5 border-t space-y-2" style={{ borderColor: '#E5E0D8' }}>
                  <p className="text-sm font-medium italic leading-relaxed" style={{ color: '#6B7280' }}>
                    "{tab.quote}"
                  </p>
                  <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#1a6645' }}>
                    — {tab.author}
                  </p>
                </div>
                <Link href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition-all active:scale-95 hover:-translate-y-0.5"
                  style={{ backgroundColor: '#1a6645', boxShadow: '0 6px 20px rgba(26,102,69,0.2)' }}>
                  Start Free Trial <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
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
        </div>

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

<LeadCapture />

      {/* 3. HOW IT WORKS — 3 steps, alternating layout */}
      <HowItWorks />






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