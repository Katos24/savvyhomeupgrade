'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── AI Chat Demo Component ── */
function AIChatDemo() {
  const [activeDemo, setActiveDemo] = useState(0);
  const [phase, setPhase] = useState<'typing-q' | 'thinking' | 'typing-a' | 'done'>('typing-q');
  const [displayedQ, setDisplayedQ] = useState('');
  const [displayedA, setDisplayedA] = useState('');
  const [dotCount, setDotCount] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  const demos = [
    {
      question: "Who hasn't paid yet?",
      answer: `3 unpaid jobs totaling $4,200:

• Sarah Kim — Kitchen Remodel — $1,850
  Quoted Mar 4, no payment received

• James Park — HVAC Repair — $890
  Completed Mar 6, invoice sent Mar 7

• David Chen — Electrical Panel — $1,460
  Completed Feb 28, 14 days overdue

→ Recommend: Send payment reminders to all three.`,
      color: '#6366f1',
      colorDim: 'rgba(99,102,241,0.7)',
    },
    {
      question: "What's on the schedule this week?",
      answer: `2 jobs scheduled this week:

📅 Thu, Mar 6 · 9:00 AM
  James Park — HVAC Repair
  AC unit rattling, not cooling. Home warranty.
  Quote: $890 · Status: Confirmed

📅 Sat, Mar 8 · 8:00 AM
  Amanda Rodriguez — Deck Staining
  800 sq ft pressure-treated wood
  Quote: $1,850 · Status: Confirmed

→ No scheduling conflicts detected.`,
      color: '#22c55e',
      colorDim: 'rgba(34,197,94,0.7)',
    },
    {
      question: "Which leads went cold?",
      answer: `5 leads inactive for 7+ days:

🔴 Mike Torres — Roofing — 14 days
   Storm damage, 3 photos. Never responded to quote.

🟠 Jennifer Mills — Tile Work — 9 days
   Bathroom shower surround. Opened quote email, no reply.

🟠 Thomas Wright — Plumbing — 8 days
   Kitchen leak detection. Called once, voicemail.

🟡 Patricia Lee — Painting — 7 days
   Exterior 2-story. Waiting on color selection.

🟡 Elizabeth Davis — HVAC — 7 days
   Water heater replacement. New lead, uncontacted.

→ Recommend: Follow up with Mike & Jennifer first.`,
      color: '#f87171',
      colorDim: 'rgba(248,113,113,0.7)',
    },
  ];

  const demo = demos[activeDemo];

  useEffect(() => {
    // Reset on demo change
    setPhase('typing-q');
    setDisplayedQ('');
    setDisplayedA('');
    setDotCount(1);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let i = 0;
    const q = demos[activeDemo].question;
    const a = demos[activeDemo].answer;

    // Phase 1: Type question
    const typeQ = () => {
      if (i < q.length) {
        setDisplayedQ(q.slice(0, i + 1));
        i++;
        timeoutRef.current = setTimeout(typeQ, 30 + Math.random() * 40);
      } else {
        // Phase 2: Thinking
        setPhase('thinking');
        i = 0;
        timeoutRef.current = setTimeout(typeA, 1200);
      }
    };

    // Phase 3: Type answer
    const typeA = () => {
      setPhase('typing-a');
      const typeNext = () => {
        if (i < a.length) {
          // Type in chunks for speed
          const chunk = Math.min(3, a.length - i);
          setDisplayedA(a.slice(0, i + chunk));
          i += chunk;
          timeoutRef.current = setTimeout(typeNext, 12 + Math.random() * 18);
        } else {
          setPhase('done');
          // Auto-advance after pause
          timeoutRef.current = setTimeout(() => {
            setActiveDemo(prev => (prev + 1) % demos.length);
          }, 4000);
        }
      };
      typeNext();
    };

    timeoutRef.current = setTimeout(typeQ, 600);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDemo]);

  // Thinking dots animation
  useEffect(() => {
    if (phase !== 'thinking') return;
    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Chat Window */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.06)',
      }}>
        {/* Window bar */}
        <div style={{
          background: '#111',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>✦</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>AI ASSISTANT</span>
          </div>
          <div style={{ width: 50 }} />
        </div>

        {/* Chat body */}
        <div style={{ padding: '24px 20px', minHeight: 340, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* User message */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              background: demo.color,
              color: 'white',
              padding: '10px 16px',
              borderRadius: '16px 16px 4px 16px',
              fontSize: 14,
              fontWeight: 600,
              maxWidth: '80%',
              minHeight: 20,
            }}>
              {displayedQ}
              {phase === 'typing-q' && (
                <span style={{ opacity: 0.7, animation: 'blink 0.8s infinite' }}>|</span>
              )}
            </div>
          </div>

          {/* AI response */}
          {(phase === 'thinking' || phase === 'typing-a' || phase === 'done') && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.75)',
                padding: '14px 18px',
                borderRadius: '16px 16px 16px 4px',
                fontSize: 13,
                lineHeight: 1.65,
                maxWidth: '90%',
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: 'pre-wrap',
                minWidth: 60,
              }}>
                {phase === 'thinking' && (
                  <span style={{ color: demo.colorDim, fontFamily: 'DM Mono', fontSize: 12, letterSpacing: '0.05em' }}>
                    Searching your pipeline{'.'.repeat(dotCount)}
                  </span>
                )}
                {(phase === 'typing-a' || phase === 'done') && (
                  <>
                    {displayedA}
                    {phase === 'typing-a' && (
                      <span style={{ opacity: 0.5, animation: 'blink 0.8s infinite' }}>▊</span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: 'rgba(255,255,255,0.2)',
            fontFamily: 'DM Mono',
          }}>
            Ask anything about your business...
          </div>
          <div style={{
            width: 36, height: 36,
            background: demo.color,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.3s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Demo selector pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
        {demos.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDemo(i)}
            style={{
              fontFamily: 'DM Mono',
              fontSize: 11,
              padding: '6px 14px',
              border: `1px solid ${i === activeDemo ? d.color + '60' : 'rgba(255,255,255,0.08)'}`,
              background: i === activeDemo ? d.color + '15' : 'rgba(255,255,255,0.02)',
              color: i === activeDemo ? d.color : 'rgba(255,255,255,0.35)',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {d.question}
          </button>
        ))}
      </div>
    </div>
  );
}


export default function Home() {
  const [mockView, setMockView] = useState<'cards' | 'table'>('cards');
  
  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#0d0d0d' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        html, body { background: #0d0d0d !important; margin: 0; }
        * { box-sizing: border-box; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
background: radial-gradient(circle, rgba(92,203,58,0.15) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none;
        }

        .hero-glow-2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          bottom: 0; left: -50px;
          pointer-events: none;
        }

        .stat-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, background 0.2s;
        }
        .stat-card:hover {
  border-color: rgba(92,203,58,0.3);
  background: rgba(92,203,58,0.04);
}

        .feature-card {
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
background: linear-gradient(90deg, transparent, rgba(92,203,58,0.5), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transform: translateY(-2px);
        }

        .step-number {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
color: rgba(92,203,58,0.9);
          text-transform: uppercase;
        }

        .divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .badge {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(92,203,58,0.95);
  border: 1px solid rgba(92,203,58,0.25);
  background: rgba(92,203,58,0.08);
  padding: 4px 12px;
  display: inline-block;
}

        .cta-primary {
          background: #5CCB3A
          color: white;
          font-weight: 700;
          letter-spacing: 0.01em;
          transition: background 0.15s, transform 0.1s;
        }
        .cta-primary:hover {
  background: #3FAE2A;
          transform: translateY(-1px);
        }

        .cta-secondary {
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          transition: all 0.15s;
        }
        .cta-secondary:hover {
          border-color: rgba(255,255,255,0.35);
          color: white;
        }

        .industry-tag {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
          padding: 10px 20px;
          white-space: nowrap;
        }
        .industry-tag:hover {
          border-color: rgba(92,203,58,0.3);
  background: rgba(92,203,58,0.05);
          color: white;
        }

        .testimonial-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
        }

        .nav-link {
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.15s;
        }
        .nav-link:hover { color: white; }

        .mono { font-family: 'DM Mono', monospace; }

        .orange { color: #5CCB3A; }
.orange-dim { color: rgba(92,203,58,0.7); }

        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
        }

        .ai-pill {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
          border: 1px solid rgba(99,102,241,0.2);
          color: #a78bfa;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.4s; opacity: 0; }

        .mock-dashboard {
          background: #111;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          overflow: hidden;
        }
        .mock-bar {
          background: #1a1a1a;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mock-dot {
          width: 8px; height: 8px; border-radius: 50%;
        }
        .mock-lead {
          padding: 10px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }
        .status-pill {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 20px;
          font-family: 'DM Mono', monospace;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="grain" />

      {/* ── NAV ── */}
      <header className="fixed top-0 w-full z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, background: '#5CCB3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>L2P</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Lead2Project</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#how-it-works" className="nav-link">How It Works</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="nav-link hidden sm:block px-3 py-2">Sign in</Link>
            <Link href="/signup" className="cta-primary px-5 py-2 text-sm" style={{ borderRadius: 4 }}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8 fade-up fade-up-1">
            <span className="badge">CRM for Service Contractors</span>
            <span className="ai-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              AI-Powered
            </span>
          </div>

          <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 24 }}>
            Stop losing jobs<br />
            <span className="orange">to disorganization.</span>
          </h1>

          <p className="fade-up fade-up-3" style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', maxWidth: 520, lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
            One link. Customers submit photos, details, and their info. You get a clean lead board, instant quotes, AI briefs, and full job tracking — without the chaos.
          </p>

          <div className="fade-up fade-up-4 flex flex-wrap gap-3 items-center">
            <Link href="/signup" className="cta-primary px-8 py-3.5 text-base" style={{ borderRadius: 4 }}>
              Start Free — 14 Days →
            </Link>
            <Link href="/demo" className="cta-secondary px-8 py-3.5 text-base" style={{ borderRadius: 4 }}>
              See a Live Demo
            </Link>
          </div>

          <p className="fade-up fade-up-4 mt-4" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>
            NO CREDIT CARD · CANCEL ANYTIME · 2 MIN SETUP
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '$60K', label: 'Lost yearly from missed leads', sub: 'avg. contractor' },
            { num: '1 job', label: 'Pays for an entire year', sub: 'at $99/mo' },
            { num: '30s', label: 'AI brief on any lead', sub: 'instant context' },
            { num: '100%', label: 'Leads captured & organized', sub: 'nothing falls through' },
          ].map(s => (
            <div key={s.num} className="stat-card p-5">
              <div style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#5CCB3A', fontFamily: 'DM Mono' }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2, fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

{/* ── MOCK DASHBOARD ── */}
<section className="py-24 px-6">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <div className="section-label">The Dashboard</div>
      <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', color: 'white' }}>
        Everything in one place.<br />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Nothing scattered.</span>
      </h2>
    </div>

    {/* Browser chrome */}
    <div className="mock-dashboard">
      {/* Browser bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', flexShrink: 0 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840', flexShrink: 0 }} />
        <div style={{ flex: 1, margin: '0 12px', background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 4, padding: '3px 10px', fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(0,0,0,0.35)', textAlign: 'center' }}>
          lead2project.com/acme-roofing/dashboard
        </div>
        <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'rgba(234,88,12,0.7)', letterSpacing: '0.08em', flexShrink: 0 }}>$26,690 PIPELINE</div>
      </div>

      {/* Sidebar + Content layout */}
      <div style={{ display: 'flex', minHeight: 480 }}>

        {/* Sidebar */}
        <div style={{ width: 52, background: '#f8fafc', borderRight: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 12, gap: 8 }}>
          {['📋', '📅', '💬', '⚙️'].map((icon, i) => (
            <div key={i} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: i === 0 ? 'rgba(99,102,241,0.1)' : 'transparent', borderRadius: 4 }}>
              {icon}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Toolbar */}
          <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['All (47)', 'New (12)', 'Quoted (8)', 'Scheduled (6)', 'Completed (21)'].map((f, i) => (
                <span key={f} style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px',
                  fontFamily: 'DM Mono', letterSpacing: '0.02em',
                  background: i === 0 ? '#6366f1' : 'rgba(0,0,0,0.04)',
                  color: i === 0 ? 'white' : 'rgba(0,0,0,0.5)',
                  border: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.07)',
                }}>
                  {f}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 110, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', padding: '3px 7px', fontSize: 10, color: 'rgba(0,0,0,0.3)', fontFamily: 'DM Mono' }}>🔍 Search...</div>
              {/* INTERACTIVE BUTTONS */}
              <button
                onClick={() => setMockView('cards')}
                className="mock-view-toggle"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  background: mockView === 'cards' ? '#6366f1' : 'rgba(0,0,0,0.04)',
                  color: mockView === 'cards' ? 'white' : 'rgba(0,0,0,0.5)',
                  border: mockView === 'cards' ? 'none' : '1px solid rgba(0,0,0,0.07)',
                  fontFamily: 'DM Mono',
                  cursor: 'pointer',
                }}
              >
                Cards
              </button>
              <button
                onClick={() => setMockView('table')}
                className="mock-view-toggle"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 8px',
                  background: mockView === 'table' ? '#6366f1' : 'rgba(0,0,0,0.04)',
                  color: mockView === 'table' ? 'white' : 'rgba(0,0,0,0.5)',
                  border: mockView === 'table' ? 'none' : '1px solid rgba(0,0,0,0.07)',
                  fontFamily: 'DM Mono',
                  cursor: 'pointer',
                }}
              >
                Table
              </button>
            </div>
          </div>

          {/* Cards View */}
          {mockView === 'cards' && (
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, background: '#f8fafc' }}>
             {[
  { name: 'Mike Torres', desc: 'Roof damage after storm, shingles missing on south side. 3 photos uploaded.', cat: 'Roofing', status: 'New', statusHex: '#3b82f6', time: '2m ago', quote: null, isProject: false, scheduled: null, projectNum: null },
  { name: 'Sarah Kim', desc: 'Full kitchen remodel — cabinets, countertops, tile backsplash. Budget flexible.', cat: 'Renovation', status: 'Quoted', statusHex: '#f97316', time: '1h ago', quote: '$18,500', isProject: true, scheduled: null, projectNum: 12 },
  { name: 'James Park', desc: 'AC unit not cooling, making rattling noise. Has home warranty.', cat: 'HVAC', status: 'Scheduled', statusHex: '#22c55e', time: '3h ago', quote: '$890', isProject: true, scheduled: 'Thu Mar 6 · 9:00 AM', projectNum: 11 },
  { name: 'Lisa Morgan', desc: 'Backyard fence, 60 linear ft cedar. Wants matching gate.', cat: 'Fencing', status: 'In Progress', statusHex: '#a855f7', time: 'Yesterday', quote: '$3,100', isProject: true, scheduled: null, projectNum: 10 },
  { name: 'David Chen', desc: 'Electrical panel upgrade needed. 200 amp to 400 amp service.', cat: 'Electrical', status: 'Quoted', statusHex: '#f97316', time: '4h ago', quote: '$2,450', isProject: true, scheduled: null, projectNum: 9 },
  { name: 'Jennifer Mills', desc: 'Bathroom tile work - shower surround and floor. 2 sketches included.', cat: 'Tile Work', status: 'New', statusHex: '#3b82f6', time: '6h ago', quote: null, isProject: false, scheduled: null, projectNum: null },
  { name: 'Robert Jackson', desc: 'Gutter replacement and downspout installation. Full house.', cat: 'Gutters', status: 'Completed', statusHex: '#22c55e', time: '1d ago', quote: '$1,200', isProject: true, scheduled: 'Mar 1', projectNum: 8 },
  { name: 'Amanda Rodriguez', desc: 'Deck staining - 800 sq ft pressure treated wood. Spring cleanup.', cat: 'Decks', status: 'In Progress', statusHex: '#a855f7', time: '3d ago', quote: '$1,850', isProject: true, scheduled: 'Mar 8', projectNum: 7 },
  { name: 'Thomas Wright', desc: 'Plumbing inspection and leak detection. Kitchen sink area.', cat: 'Plumbing', status: 'New', statusHex: '#3b82f6', time: '5h ago', quote: null, isProject: false, scheduled: null, projectNum: null },
  { name: 'Patricia Lee', desc: 'Exterior paint job - 2 story home. All trim and siding included.', cat: 'Painting', status: 'Quoted', statusHex: '#f97316', time: '2d ago', quote: '$4,200', isProject: true, scheduled: null, projectNum: 6 },
  { name: 'Christopher Brown', desc: 'Landscape design and hardscaping. New patio and planting beds.', cat: 'Landscaping', status: 'Scheduled', statusHex: '#22c55e', time: '4d ago', quote: '$3,600', isProject: true, scheduled: 'Mar 10', projectNum: 5 },
  { name: 'Elizabeth Davis', desc: 'Water heater replacement. Current unit 12 years old, needs upgrade.', cat: 'HVAC', status: 'New', statusHex: '#3b82f6', time: '30m ago', quote: null, isProject: false, scheduled: null, projectNum: null },
].map((lead, i) => (
                <div key={i} style={{
                  background: lead.isProject ? '#f0fdf4' : '#eff6ff',
                  border: `1px solid ${lead.isProject ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)'}`,
                  overflow: 'hidden',
                }}>
                  {/* Color bar */}
                  <div style={{ height: 3, background: lead.statusHex }} />
                  <div style={{ padding: '10px 10px 10px' }}>
                    {/* Status + project number */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${lead.statusHex}20`, color: lead.statusHex, border: `1px solid ${lead.statusHex}40` }}>
                        {lead.status}
                      </span>
                      {lead.isProject && lead.projectNum && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a' }}>
                          #{lead.projectNum}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>

                    {/* Description */}
                    <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.55)', lineHeight: 1.5, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {lead.desc}
                    </div>

                    {/* Scheduled date */}
                    {lead.scheduled && (
                      <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.4)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 3 }}>
                        📅 <span>{lead.scheduled}</span>
                      </div>
                    )}

                    {/* Footer row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 7, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                        <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.3)', fontFamily: 'DM Mono', flexShrink: 0 }}>{lead.time}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                          🏷 {lead.cat}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                        {lead.quote && <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', fontFamily: 'DM Mono' }}>{lead.quote}</span>}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', background: '#7c3aed', color: 'white' }}>✦</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {mockView === 'table' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9, background: '#f8fafc' }}>
                <thead>
                  <tr style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    {['Project #', 'Name', 'Contact', 'Category', 'Status', 'Scheduled', 'Quote', 'Payment', 'Media', 'Created'].map(h => (
                      <th key={h} style={{ padding: '5px 8px', textAlign: 'left', fontFamily: 'DM Mono', fontSize: 8, color: 'rgba(0,0,0,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { proj: '#12', name: 'Sarah Kim', contact: '(555) 201-3847', cat: 'Renovation', status: 'Quoted', statusHex: '#f97316', scheduled: '—', quote: '$18,500', payment: '—', media: '2 photos', created: 'Mar 4' },
                    { proj: '#11', name: 'James Park', contact: '(555) 948-2210', cat: 'HVAC', status: 'Scheduled', statusHex: '#22c55e', scheduled: 'Mar 6', quote: '$890', payment: 'Pending', media: '1 photo', created: 'Mar 3' },
                  ].map((row, i) => (
                    <tr key={i} style={{ background: '#ffffff', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '5px 8px', color: '#16a34a', fontWeight: 700, fontFamily: 'DM Mono' }}>{row.proj}</td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.85)', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.name}</td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{row.contact}</td>
                      <td style={{ padding: '5px 8px' }}><span style={{ padding: '1px 5px', background: 'rgba(14,165,233,0.1)', color: '#0284c7', fontWeight: 700, fontSize: 8 }}>{row.cat}</span></td>
                      <td style={{ padding: '5px 8px' }}><span style={{ padding: '1px 5px', background: row.statusHex + '20', color: row.statusHex, fontWeight: 700, fontSize: 8 }}>{row.status}</span></td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>{row.scheduled}</td>
                      <td style={{ padding: '5px 8px', color: '#16a34a', fontWeight: 700, fontFamily: 'DM Mono' }}>{row.quote}</td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.35)' }}>{row.payment}</td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.5)' }}>{row.media}</td>
                      <td style={{ padding: '5px 8px', color: 'rgba(0,0,0,0.35)', whiteSpace: 'nowrap' }}>{row.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      <div style={{ padding: '7px 16px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(0,0,0,0.25)', letterSpacing: '0.1em' }}>SHOWING 4 OF 47 LEADS · {mockView === 'cards' ? 'CARDS' : 'TABLE'} VIEW</span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(92,203,58,0.8)', letterSpacing: '0.05em' }}>✦ AI BRIEF ON EVERY LEAD</span>
      </div>
    </div>
  </div>
</section>

      {/* ── AI ASSISTANT LIVE DEMO ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px', background: 'rgba(255,255,255,0.005)', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="section-label">AI Assistant</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Ask it anything. <span style={{ color: '#a78bfa' }}>Watch it work.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6, fontWeight: 300 }}>
              The AI has full context of your pipeline — every lead, quote, and note. Ask a question, get a real answer in seconds using your actual data.
            </p>
          </div>

          <AIChatDemo />

          {/* More example questions */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 14, fontWeight: 300, fontFamily: 'DM Mono', letterSpacing: '0.05em'}}>
              AND HUNDREDS MORE...
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[
                '"Summarize the Johnson job"',
                '"How much have I quoted this month?"',
                '"Who\'s my biggest customer?"',
                '"What\'s the pipeline total?"',
                '"Which jobs need follow-ups?"',
                '"Show me last week\'s activity"',
              ].map(q => (
                <span key={q} style={{
                  fontFamily: 'DM Mono', fontSize: 10, padding: '5px 10px',
                  border: '1px solid rgba(167,139,250,0.15)',
                  background: 'rgba(167,139,250,0.04)',
                  color: 'rgba(167,139,250,0.6)',
                  borderRadius: 3,
                }}>
                  {q}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/signup?plan=pro" className="cta-primary px-8 py-3.5 text-base" style={{ borderRadius: 4, display: 'inline-block' }}>
              Unlock AI Assistant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="section-label">Features</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', maxWidth: 560 }}>
              Everything a service pro needs.<br />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Nothing they don't.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: '🔗',
                title: 'Custom Booking Link',
                desc: 'One shareable link. Customers submit photos, describe the job, and enter their contact info. Goes straight to your board.',
                tag: null,
              },
              {
                icon: '🤖',
                title: 'AI Assistant',
                desc: 'Ask it anything about your business — "who hasn\'t paid?", "what\'s scheduled this week?", "summarize this job." It knows your whole pipeline.',
                tag: 'Pro',
              },
              {
                icon: '⚡',
                title: 'Instant AI Brief',
                desc: 'Every new lead gets a 30-second AI summary. Condition, urgency, what\'s needed — before you even pick up the phone.',
                tag: 'Pro',
              },
              {
                icon: '💰',
                title: 'Quotes & Payments',
                desc: 'Build line-item quotes, send them via email, track payment status. Know exactly what\'s owed across every job.',
                tag: null,
              },
              {
                icon: '📅',
                title: 'Scheduling',
                desc: 'Assign jobs, set dates and times, send schedule confirmations directly to customers from the dashboard.',
                tag: null,
              },
              {
                icon: '📊',
                title: 'Pipeline Tracking',
                desc: 'Custom status stages. Move leads from New → Quoted → Scheduled → Completed. See your whole business at a glance.',
                tag: null,
              },
              {
                icon: '📸',
                title: 'Photo & Doc Management',
                desc: 'Customers upload photos and videos when they submit. Everything is attached to the lead — no more hunting through texts.',
                tag: null,
              },
              {
                icon: '🔁',
                title: 'Repeat Customer Detection',
                desc: 'Automatically flags when a returning customer submits a new lead. See their history instantly.',
                tag: 'Pro',
              },
              {
                icon: '📤',
                title: 'Outbox',
                desc: 'Full log of every quote and schedule email ever sent. Spot duplicates, track what went out and when.',
                tag: null,
              },
            ].map((f, i) => (
              <div key={i} className="feature-card p-6" style={{ borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{f.icon}</span>
                  {f.tag && (
                    <span style={{ fontFamily: 'DM Mono', fontSize: 9, letterSpacing: '0.12em', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.06)', padding: '2px 7px' }}>
                      {f.tag}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label">How It Works</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Up and running in minutes.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Sign up, set your company name, upload a logo, pick your brand colors. Done in under 2 minutes.',
                detail: 'No technical setup required.',
              },
              {
                step: '02',
                title: 'Share your booking link',
                desc: 'You get a unique URL — put it in your Instagram bio, email signature, website, or business card QR code.',
                detail: 'yourcompany.lead2project.com',
              },
              {
                step: '03',
                title: 'Customers submit leads',
                desc: 'They fill out a 2-step form — contact info, service type, description, photos, address, preferred dates.',
                detail: 'Saved instantly, even if they stop at step 1.',
              },
              {
                step: '04',
                title: 'You work your pipeline',
                desc: 'Leads land on your board. AI brief ready. Quote, schedule, track, and close — all in one place.',
                detail: 'Ask the AI anything about your jobs.',
              },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: 24,
                padding: '32px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 28, fontWeight: 500, color: 'rgba(234,88,12,0.3)', lineHeight: 1 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 8, fontWeight: 300 }}>{s.desc}</p>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(234,88,12,0.55)', letterSpacing: '0.05em' }}>{s.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI CALLOUT ── */}
      <section style={{ padding: '80px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{
            border: '1px solid rgba(99,102,241,0.2)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
            borderRadius: 8,
            padding: 'clamp(32px, 5vw, 56px)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ maxWidth: 580, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', color: '#a78bfa', textTransform: 'uppercase' }}>AI Assistant — Pro Feature</span>
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
                Ask your business anything.<br />
                <span style={{ color: '#a78bfa' }}>Get a real answer.</span>
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>
                The AI Assistant has full context of your pipeline. Every lead, every quote, every note. Ask it anything — it answers in plain English using your real data.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {[
                  '"Who hasn\'t paid yet?"',
                  '"What\'s on the schedule this week?"',
                  '"Summarize the Johnson job"',
                  '"Which leads went cold?"',
                  '"How much have I quoted this month?"',
                ].map(q => (
                  <span key={q} style={{
                    fontFamily: 'DM Mono', fontSize: 11, padding: '6px 12px',
                    border: '1px solid rgba(167,139,250,0.2)',
                    background: 'rgba(167,139,250,0.05)',
                    color: 'rgba(167,139,250,0.8)',
                    borderRadius: 4,
                  }}>{q}</span>
                ))}
              </div>

              <Link href="/signup?plan=pro" className="cta-primary px-7 py-3 text-sm inline-block" style={{ borderRadius: 4 }}>
                Unlock AI Features →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '64px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="section-label text-center">Industries</div>
          <p style={{ textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.35)', marginBottom: 32, fontWeight: 300 }}>
            Built for anyone who does service work.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['General Contractors', 'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'Cleaning', 'Painting', 'Flooring', 'Fencing', 'Handyman', 'Pest Control', 'Pool Service', 'Solar', 'Remodeling', 'Moving'].map(ind => (
              <span key={ind} className="industry-tag" style={{ borderRadius: 4 }}>{ind}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CALLOUT ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'Basic',
                price: '$49',
                desc: 'Lead tracking for solo contractors',
                features: ['Unlimited leads', 'Cards + table view', 'Status management', 'Customer booking form', 'Email / call / text actions', 'CSV export', 'Mobile friendly'],
                cta: 'Start Free Trial',
                href: '/signup?plan=basic',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$99',
                desc: 'Full job management + AI',
                features: ['Everything in Basic', 'Convert leads to projects', 'Quotes & payment tracking', 'Tasks & scheduling', 'Photo & doc management', 'Repeat customer detection', 'AI Brief on every lead', 'AI Assistant chat'],
                cta: 'Start Free Trial',
                href: '/signup?plan=pro',
                highlight: true,
              },
            ].map(plan => (
              <div key={plan.name} style={{
                border: plan.highlight ? '1px solid rgba(234,88,12,0.35)' : '1px solid rgba(255,255,255,0.07)',
                background: plan.highlight ? 'rgba(234,88,12,0.04)' : 'rgba(255,255,255,0.02)',
                borderRadius: 6,
                padding: 32,
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #ea580c, transparent)' }} />
                )}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', color: plan.highlight ? '#ea580c' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'DM Mono', lineHeight: 1 }}>{plan.price}<span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/mo</span></div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{plan.desc}</div>
                </div>

                <Link href={plan.href} className={plan.highlight ? 'cta-primary' : 'cta-secondary'} style={{
                  display: 'block', textAlign: 'center', padding: '11px 20px',
                  fontSize: 14, fontWeight: 600, borderRadius: 4, marginBottom: 24,
                  textDecoration: 'none',
                }}>
                  {plan.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 16, height: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6L5 9L10 3" stroke={plan.highlight ? '#ea580c' : 'rgba(255,255,255,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono', letterSpacing: '0.08em' }}>
            14-DAY FREE TRIAL · NO CREDIT CARD · CANCEL ANYTIME
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px', textAlign: 'center' }}>
        <div className="max-w-2xl mx-auto">
          <div className="section-label">Get Started</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 16 }}>
            One job pays for<br />
            <span className="orange">the whole year.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontWeight: 300 }}>
            Stop losing leads to disorganization. Start running your business like a pro.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="cta-primary px-10 py-4 text-base" style={{ borderRadius: 4 }}>
              Start Free Trial →
            </Link>
            <Link href="/pricing" className="cta-secondary px-10 py-4 text-base" style={{ borderRadius: 4 }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, background: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: 8, fontWeight: 700, color: 'white' }}>L2P</span>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Lead2Project</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Pricing', '/pricing'], ['Login', '/login'], ['Sign Up', '/signup']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 400, textDecoration: 'none' }}
                className="hover:text-white transition-colors">{label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} LEAD2PROJECT
          </p>
        </div>
      </footer>

    </div>
  );
}