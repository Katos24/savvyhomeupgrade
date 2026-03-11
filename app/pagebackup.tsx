'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Link2, DollarSign, CalendarDays, Bot, BarChart2, Mail, Clipboard, FolderOpen, FileSpreadsheet, Layers, CheckSquare, FileText, User, Phone, HomeIcon, AlignLeft, Send, CheckCircle, LayoutDashboard, Clock, MapPin, MessageSquare, Lock, CreditCard, Image, Activity, Cpu } from 'lucide-react';

/* ── FORM → BOARD ANIMATED DEMO ── */
function Avatar({ blink, happy }: { blink: boolean; happy: boolean }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Face circle */}
      <circle cx="36" cy="36" r="34" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
      {/* Left eye */}
      {blink
        ? <line x1="22" y1="28" x2="28" y2="28" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
        : <ellipse cx="25" cy="28" rx="3.5" ry={happy ? 3 : 3.5} fill="#92400E"/>
      }
      {/* Right eye */}
      {blink
        ? <line x1="44" y1="28" x2="50" y2="28" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round"/>
        : <ellipse cx="47" cy="28" rx="3.5" ry={happy ? 3 : 3.5} fill="#92400E"/>
      }
      {/* Mouth */}
      {happy
        ? <path d="M24 44 Q36 54 48 44" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        : <path d="M26 45 Q36 50 46 45" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none"/>
      }
      {/* Eyebrows - subtle */}
      <path d="M21 22 Q25 19 29 22" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M43 22 Q47 19 51 22" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function PaperAirplane({ flying }: { flying: boolean }) {
  if (!flying) return null;
  return (
    <div className="paper-airplane" style={{
      position: 'absolute', top: '42%', left: '10%', zIndex: 20,
      pointerEvents: 'none',
    }}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M4 20 L36 4 L28 20 L36 36 Z" fill="white" stroke="#5CCB3A" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M28 20 L4 20" stroke="#5CCB3A" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M28 20 L20 26" stroke="#5CCB3A" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </div>
  );
}

function FormToBoardDemo() {
  const [phase, setPhase] = useState<'filling' | 'flying' | 'board' | 'pause'>('filling');
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedValues, setDisplayedValues] = useState<string[]>(['', '', '', '', '']);
  const [blink, setBlink] = useState(false);
  const [newCardVisible, setNewCardVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkRef = useRef<NodeJS.Timeout | null>(null);

  const fields: { label: string; value: string; icon: React.ReactNode; isSelect: boolean }[] = [
    { label: 'Name',    value: 'Mike Torres',                              icon: <User    size={10} />, isSelect: false },
    { label: 'Email',   value: 'mike@torresco.com',                        icon: <Mail    size={10} />, isSelect: false },
    { label: 'Phone',   value: '(555) 482-1930',                           icon: <Phone   size={10} />, isSelect: false },
    { label: 'Service', value: 'Roofing',                                  icon: <HomeIcon  size={10} />, isSelect: true  },
    { label: 'Details', value: 'Storm damage, shingles missing on south side.', icon: <AlignLeft size={10} />, isSelect: false },
  ];

  // Blink loop
  useEffect(() => {
    const scheduleBlink = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true);
        blinkRef.current = setTimeout(() => {
          setBlink(false);
          scheduleBlink();
        }, 120);
      }, 2500 + Math.random() * 2000);
    };
    scheduleBlink();
    return () => { if (blinkRef.current) clearTimeout(blinkRef.current); };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (phase === 'filling') {
      if (fieldIndex < fields.length) {
        const f = fields[fieldIndex];
        if (f.isSelect) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value; return n; });
            timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 300);
          }, 300);
        } else if (charIndex < f.value.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => { const n = [...prev]; n[fieldIndex] = f.value.slice(0, charIndex + 1); return n; });
            setCharIndex(c => c + 1);
          }, fieldIndex === 4 ? 18 : 30 + Math.random() * 15);
        } else {
          timeoutRef.current = setTimeout(() => { setFieldIndex(i => i + 1); setCharIndex(0); }, 220);
        }
      } else {
        timeoutRef.current = setTimeout(() => setPhase('flying'), 500);
      }
    }

    if (phase === 'flying') {
      timeoutRef.current = setTimeout(() => {
        setPhase('board');
        setNewCardVisible(false);
        setTimeout(() => setNewCardVisible(true), 300);
      }, 950);
    }

    if (phase === 'board') {
      timeoutRef.current = setTimeout(() => setPhase('pause'), 3500);
    }

    if (phase === 'pause') {
      timeoutRef.current = setTimeout(() => {
        setPhase('filling');
        setFieldIndex(0);
        setCharIndex(0);
        setDisplayedValues(['', '', '', '', '']);
        setNewCardVisible(false);
      }, 900);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fieldIndex, charIndex]);

  const isBoard = phase === 'board' || phase === 'pause';
  const isHappy = phase === 'flying' || isBoard;

  const existingLeads = [
    { name: 'Sarah Kim', desc: 'Full kitchen remodel — cabinets, countertops', status: 'Quoted', statusHex: '#f97316', cat: 'Renovation', time: '1h ago', quote: '$18,500' },
    { name: 'James Park', desc: 'AC unit not cooling, making rattling noise', status: 'Scheduled', statusHex: '#22c55e', cat: 'HVAC', time: '3h ago', quote: '$890' },
    { name: 'Lisa Morgan', desc: 'Backyard fence, 60 linear ft cedar', status: 'In Progress', statusHex: '#a855f7', cat: 'Fencing', time: 'Yesterday', quote: '$3,100' },
    { name: 'David Chen', desc: 'Electrical panel upgrade 200→400 amp', status: 'Quoted', statusHex: '#f97316', cat: 'Electrical', time: '4h ago', quote: '$2,450' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
      <style>{`
        @keyframes flyAcross {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          40%  { transform: translate(280px, -60px) rotate(15deg); opacity: 1; }
          80%  { transform: translate(580px, 20px) rotate(-5deg); opacity: 0.7; }
          100% { transform: translate(720px, 0px) rotate(0deg); opacity: 0; }
        }
        @keyframes flyDown {
          0%   { transform: translate(0, 0) rotate(90deg); opacity: 1; }
          50%  { transform: translate(20px, 160px) rotate(100deg); opacity: 1; }
          100% { transform: translate(0px, 300px) rotate(90deg); opacity: 0; }
        }
        .paper-airplane { animation: flyAcross 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

        @media (max-width: 768px) {
          .paper-airplane { animation: flyDown 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; top: 30% !important; left: 45% !important; }
        }
        @keyframes cardDrop {
          0%   { opacity: 0; transform: translateY(-16px) scale(0.96); }
          60%  { transform: translateY(3px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes highlightPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(92,203,58,0); border-color: #5CCB3A; }
          50%       { box-shadow: 0 0 0 6px rgba(92,203,58,0.15); border-color: #5CCB3A; }
        }
      `}</style>

      {/* Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 8, gap: 16 }} className="demo-label-grid">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isBoard ? 0 : 1, transition: 'opacity 0.3s' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5CCB3A' }} />
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Customer sees this</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: isBoard ? 1 : 0, transition: 'opacity 0.3s ease 0.4s', justifyContent: 'flex-end' }} className="demo-label-right">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>You see this — instantly</span>
        </div>
      </div>

      {/* Main container */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, overflow: 'hidden' }} className="demo-grid">

        {/* Paper airplane */}
        <PaperAirplane flying={phase === 'flying'} />

        {/* LEFT: Form side */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          opacity: isBoard ? 0.15 : 1,
          transition: 'opacity 0.5s ease',
          overflow: 'hidden',
        }}>
          {/* Chrome bar */}
          <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: '#94a3b8', letterSpacing: '0.08em' }}>GET A QUOTE</span>
            <div style={{ width: 36 }} />
          </div>

          <div style={{ padding: '16px 16px 20px' }}>
            {/* Avatar + greeting */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
              <Avatar blink={blink} happy={isHappy} />
              <div style={{ marginTop: 8, fontFamily: 'DM Mono', fontSize: 9, color: '#94a3b8', letterSpacing: '0.05em' }}>
                {isHappy ? 'Submitted!' : 'Mike Torres'}
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.map((f, i) => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <label style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', fontFamily: 'DM Mono', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.label}</label>
                  <div style={{
                    border: `1px solid ${fieldIndex === i && !isBoard ? '#5CCB3A' : '#e2e8f0'}`,
                    borderRadius: 4, padding: '5px 8px',
                    fontSize: 11, color: displayedValues[i] ? '#1e293b' : '#cbd5e1',
                    background: i < fieldIndex || isBoard ? '#f8fafc' : 'white',
                    minHeight: i === 4 ? 36 : 'auto',
                    transition: 'border-color 0.2s',
                    display: 'flex', alignItems: i === 4 ? 'flex-start' : 'center',
                  }}>
                    {displayedValues[i] || <span style={{ color: '#cbd5e1', fontSize: 10 }}>{f.label}...</span>}
                    {fieldIndex === i && !isBoard && phase === 'filling' && (
                      <span style={{ display: 'inline-block', width: 1, height: 11, background: '#5CCB3A', marginLeft: 1, animation: 'blink 1s step-end infinite' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit button */}
            <div style={{ marginTop: 14 }}>
              <div style={{
                background: phase === 'flying' || isBoard ? '#3FAE2A' : fieldIndex >= fields.length ? '#5CCB3A' : '#e2e8f0',
                color: fieldIndex >= fields.length ? 'white' : '#94a3b8',
                textAlign: 'center', padding: '8px', borderRadius: 4,
                fontSize: 11, fontWeight: 700, transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {phase === 'flying'
                  ? <><Send size={11} style={{ flexShrink: 0 }} /> Sending...</>
                  : isBoard
                  ? <><CheckCircle size={11} style={{ flexShrink: 0 }} /> Sent!</>
                  : 'Submit Request'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Dashboard side */}
        <div style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          opacity: isBoard ? 1 : 0.12,
          transition: 'opacity 0.5s ease 0.3s',
          overflow: 'hidden',
        }}>
          {/* Chrome */}
          <div style={{ background: '#1e293b', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>LEAD BOARD</span>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5CCB3A', boxShadow: '0 0 6px rgba(92,203,58,0.6)' }} />
          </div>

          {/* Filter tabs */}
          <div style={{ padding: '8px 10px 0', display: 'flex', gap: 4, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {['All (9)', 'New (1)', 'Quoted', 'Scheduled'].map((f, i) => (
              <span key={f} style={{
                fontSize: 9, fontWeight: 700, padding: '4px 8px', fontFamily: 'DM Mono',
                background: i === 0 ? '#1e293b' : 'transparent',
                color: i === 0 ? 'white' : '#94a3b8',
                borderRadius: '3px 3px 0 0',
                borderBottom: i === 0 ? '2px solid #5CCB3A' : '2px solid transparent',
              }}>{f}</span>
            ))}
          </div>

          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {/* New card — drops in */}
            <div style={{
              background: newCardVisible ? '#f0fdf4' : 'transparent',
              border: `2px solid ${newCardVisible ? '#5CCB3A' : 'transparent'}`,
              borderRadius: 6, overflow: 'hidden',
              animation: newCardVisible ? 'cardDrop 0.4s ease forwards, highlightPulse 1.2s ease 0.4s 3' : 'none',
              opacity: newCardVisible ? 1 : 0,
              transition: 'opacity 0.2s',
            }}>
              {newCardVisible && (
                <>
                  <div style={{ height: 3, background: '#5CCB3A' }} />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', background: 'rgba(92,203,58,0.15)', color: '#16a34a', border: '1px solid rgba(92,203,58,0.3)', borderRadius: 2 }}>NEW</span>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', background: '#0ea5e9', color: 'white', borderRadius: 2 }}>Roofing</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>Mike Torres</div>
                    <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4 }}>Storm damage, shingles missing on south side</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, paddingTop: 5, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 9, color: '#5CCB3A', fontFamily: 'DM Mono', fontWeight: 700 }}>Just now ✦</span>
                      <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'DM Mono' }}>(555) 482-1930</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Existing leads */}
            {existingLeads.map((lead, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ height: 2, background: lead.statusHex }} />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', background: `${lead.statusHex}18`, color: lead.statusHex, border: `1px solid ${lead.statusHex}30`, borderRadius: 2 }}>{lead.status}</span>
                    <span style={{ fontSize: 8, padding: '1px 5px', background: '#0ea5e9', color: 'white', fontWeight: 700, borderRadius: 2 }}>{lead.cat}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{lead.name}</div>
                  <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{lead.desc}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 5, borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'DM Mono' }}>{lead.time}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', fontFamily: 'DM Mono' }}>{lead.quote}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Filling out form', active: phase === 'filling' },
          { label: 'Submitting', active: phase === 'flying' },
          { label: 'Live on your board', active: isBoard },
        ].map((s, i) => (
          <span key={i} style={{
            fontFamily: 'DM Mono', fontSize: 10, padding: '5px 10px',
            border: `1px solid ${s.active ? 'rgba(92,203,58,0.5)' : '#e2e8f0'}`,
            background: s.active ? 'rgba(92,203,58,0.08)' : 'white',
            color: s.active ? '#16a34a' : '#94a3b8',
            borderRadius: 4, transition: 'all 0.3s',
          }}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}


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
      answer: `3 unpaid jobs totaling $4,200:\n\n• Sarah Kim — Kitchen Remodel — $1,850\n  Quoted Mar 4, no payment received\n\n• James Park — HVAC Repair — $890\n  Completed Mar 6, invoice sent Mar 7\n\n• David Chen — Electrical Panel — $1,460\n  Completed Feb 28, 14 days overdue\n\n→ Recommend: Send payment reminders.`,
      color: '#6366f1', colorDim: 'rgba(99,102,241,0.7)',
    },
    {
      question: "What's on the schedule this week?",
      answer: `2 jobs scheduled this week:\n\nThu, Mar 6 · 9:00 AM\n  James Park — HVAC Repair\n  Quote: $890 · Confirmed\n\nSat, Mar 8 · 8:00 AM\n  Amanda Rodriguez — Deck Staining\n  Quote: $1,850 · Confirmed\n\n→ No conflicts detected.`,
      color: '#22c55e', colorDim: 'rgba(34,197,94,0.7)',
    },
    {
      question: "Which leads went cold?",
      answer: `5 leads inactive 7+ days:\n\n[!] Mike Torres — Roofing — 14 days\n   Never responded to quote.\n\n[~] Jennifer Mills — Tile — 9 days\n   Opened quote, no reply.\n\n[~] Thomas Wright — Plumbing — 8 days\n   Called once, voicemail.\n\n→ Follow up with Mike & Jennifer first.`,
      color: '#f87171', colorDim: 'rgba(248,113,113,0.7)',
    },
  ];

  const demo = demos[activeDemo];

  useEffect(() => {
    setPhase('typing-q');
    setDisplayedQ('');
    setDisplayedA('');
    setDotCount(1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let i = 0;
    const q = demos[activeDemo].question;
    const a = demos[activeDemo].answer;

    const typeQ = () => {
      if (i < q.length) {
        setDisplayedQ(q.slice(0, i + 1));
        i++;
        timeoutRef.current = setTimeout(typeQ, 30 + Math.random() * 40);
      } else {
        setPhase('thinking');
        i = 0;
        timeoutRef.current = setTimeout(typeA, 1200);
      }
    };

    const typeA = () => {
      setPhase('typing-a');
      const typeNext = () => {
        if (i < a.length) {
          const chunk = Math.min(3, a.length - i);
          setDisplayedA(a.slice(0, i + chunk));
          i += chunk;
          timeoutRef.current = setTimeout(typeNext, 12 + Math.random() * 18);
        } else {
          setPhase('done');
          timeoutRef.current = setTimeout(() => {
            setActiveDemo(prev => (prev + 1) % demos.length);
          }, 4000);
        }
      };
      typeNext();
    };

    timeoutRef.current = setTimeout(typeQ, 600);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDemo]);

  useEffect(() => {
    if (phase !== 'thinking') return;
    const interval = setInterval(() => setDotCount(prev => (prev % 3) + 1), 400);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{
        background: 'white', border: '1px solid #e2e8f0', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>✦</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#94a3b8', letterSpacing: '0.08em' }}>AI ASSISTANT</span>
          </div>
          <div style={{ width: 50 }} />
        </div>

        {/* Fixed height — no expansion */}
        <div style={{ padding: '24px 20px', height: 260, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              background: demo.color, color: 'white', padding: '10px 16px',
              borderRadius: '16px 16px 4px 16px', fontSize: 14, fontWeight: 600, maxWidth: '80%', minHeight: 20,
            }}>
              {displayedQ}
              {phase === 'typing-q' && <span style={{ opacity: 0.7, animation: 'blink 0.8s infinite' }}>|</span>}
            </div>
          </div>

          {(phase === 'thinking' || phase === 'typing-a' || phase === 'done') && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                color: '#334155', padding: '14px 18px',
                borderRadius: '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.65,
                maxWidth: '90%', whiteSpace: 'pre-wrap', minWidth: 60,
              }}>
                {phase === 'thinking' && (
                  <span style={{ color: demo.colorDim, fontFamily: 'DM Mono', fontSize: 12, letterSpacing: '0.05em' }}>
                    Searching your pipeline{'.'.repeat(dotCount)}
                  </span>
                )}
                {(phase === 'typing-a' || phase === 'done') && (
                  <>
                    {displayedA}
                    {phase === 'typing-a' && <span style={{ opacity: 0.5, animation: 'blink 0.8s infinite' }}>▊</span>}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#94a3b8', fontFamily: 'DM Mono' }}>
            Ask anything about your business...
          </div>
          <div style={{ width: 36, height: 36, background: demo.color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.3s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Demo pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {demos.map((d, i) => (
          <button key={i} onClick={() => setActiveDemo(i)} style={{
            fontFamily: 'DM Mono', fontSize: 10, padding: '5px 12px',
            border: `1px solid ${i === activeDemo ? d.color + '60' : '#e2e8f0'}`,
            background: i === activeDemo ? d.color + '10' : 'white',
            color: i === activeDemo ? d.color : '#64748b',
            borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s',
          }}>
            {d.question}
          </button>
        ))}
      </div>
    </div>
  );
}


/* ── BRANDED EMAIL PREVIEW DEMO ── */
function EmailPreviewDemo() {
  const [activeEmail, setActiveEmail] = useState(0);

  const emails = [
    {
      type: 'Quote', icon: <DollarSign size={14} />, color: '#22c55e',
      subject: 'Your Quote from Acme Roofing',
      lines: ['Hi Mike,', '', "Thank you for your inquiry! We've prepared a quote for your roofing project.", '', 'Quote Total: $4,850.00', '', 'Please review and let us know if you have any questions.', '', 'Best regards,', 'Acme Roofing', '(555) 234-5678'],
    },
    {
      type: 'Schedule', icon: <CalendarDays size={14} />, color: '#3b82f6',
      subject: 'Appointment Scheduled — Acme Roofing',
      lines: ['Hi Mike,', '', 'Your appointment has been scheduled!', '', 'Date: Thursday, March 6, 2025', 'Time: 9:00 AM', 'Address: 142 Oak Street, Anytown', '', 'We look forward to serving you!', '', 'Best regards,', 'Acme Roofing'],
    },
    {
      type: 'Payment', icon: <CreditCard size={14} />, color: '#a855f7',
      subject: 'Payment Reminder — Acme Roofing',
      lines: ['Hi Mike,', '', 'This is a friendly reminder about your upcoming payment.', '', 'Amount Due: $4,850.00', 'Due Date: March 20, 2025', '', 'Please contact us if you have any questions.', '', 'Best regards,', 'Acme Roofing'],
    },
  ];

  const email = emails[activeEmail];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {emails.map((e, i) => (
          <button key={e.type} onClick={() => setActiveEmail(i)} style={{
            fontSize: 12, fontWeight: 600, padding: '8px 16px',
            background: i === activeEmail ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'white',
            border: `1px solid ${i === activeEmail ? 'transparent' : '#e2e8f0'}`,
            color: i === activeEmail ? 'white' : '#475569',
            borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: i === activeEmail ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
          }}>
            <span style={{ fontSize: 14 }}>{e.icon}</span> {e.type} Email
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#94a3b8', letterSpacing: '0.08em' }}>EMAIL PREVIEW</span>
          <div style={{ width: 50 }} />
        </div>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: 16, fontWeight: 700, color: 'white' }}>AR</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Acme Roofing</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>(555) 234-5678</div>
        </div>
        <div style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>From:</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Acme Roofing</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8' }}>To:</div>
              <div style={{ fontSize: 13, color: '#475569' }}>mike.torres@email.com</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>Subject:</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{email.subject}</div>
          </div>
        </div>
        <div style={{ background: 'white', padding: '24px 20px', minHeight: 180 }}>
          {email.lines.map((line, i) => (
            <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, minHeight: line === '' ? 12 : 'auto' }}>{line}</div>
          ))}
        </div>
        <div style={{ background: '#f8fafc', padding: '10px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Sent via Lead2Project</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 6 }}>
          <span style={{ fontSize: 14 }}>🎨</span>
          <span style={{ fontSize: 12, color: '#64748b' }}>Choose your gradient colors, upload your logo, customize every template</span>
        </div>
      </div>
    </div>
  );
}


/* ── LEAD → PROJECT DEMO ── */
function LeadToProjectDemo() {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'photos' | 'activity'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={11} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarDays    size={11} /> },
    { id: 'quote',    label: 'Quote',    icon: <DollarSign      size={11} /> },
    { id: 'payment',  label: 'Payment',  icon: <CreditCard      size={11} /> },
    { id: 'tasks',    label: 'Tasks',    icon: <CheckSquare     size={11} /> },
    { id: 'photos',   label: 'Media',    icon: <Image           size={11} /> },
    { id: 'activity', label: 'Activity', icon: <Activity        size={11} /> },
  ] as const;

  const quoteItems = [
    { desc: 'Tear-off & disposal',    qty: 1,  unitPrice: 850,  amount: 850  },
    { desc: 'Underlayment install',   qty: 1,  unitPrice: 450,  amount: 450  },
    { desc: 'Architectural shingles', qty: 24, unitPrice: 120,  amount: 2880 },
    { desc: 'Ridge vent install',     qty: 30, unitPrice: 12,   amount: 360  },
  ];
  const quoteTotal = quoteItems.reduce((s, i) => s + i.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const tasks = [
    { text: 'Inspect roof & document damage', done: true  },
    { text: 'Take before photos',             done: true  },
    { text: 'Send quote to customer',         done: true  },
    { text: 'Order materials',                done: false },
    { text: 'Schedule crew',                  done: false },
    { text: 'Final walkthrough & photos',     done: false },
  ];

  const notes = [
    { user: 'J', name: 'Jake R.',  time: 'Mar 6 · 9:14 AM',  text: 'Customer confirmed appointment for Mar 10. Prefers morning.' },
    { user: 'S', name: 'System',   time: 'Mar 5 · 3:02 PM',  text: 'Status changed from "New" to "Quoted"' },
    { user: 'J', name: 'Jake R.',  time: 'Mar 4 · 11:30 AM', text: 'Called Mike — storm damage confirmed on south slope. Insurance claim in progress.' },
  ];

  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'white', border: '1px solid #f1f5f9', overflow: 'hidden', ...style }}>{children}</div>
  );

  const SectionHeader = ({ icon, label, bg = '#eef2ff', extra }: { icon: React.ReactNode; label: string; bg?: string; extra?: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 20, height: 20, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      {extra}
    </div>
  );

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', maxHeight: 620 }}>
      <div style={{ background: '#312e81', flexShrink: 0 }}>
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 4, fontFamily: 'DM Mono' }}>#PRJ-0013</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Mike Torres</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Submitted Mar 2, 2025</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {['⋮', '✕'].map(icon => (
                <div key={icon} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{icon}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', background: 'rgba(234,179,8,0.2)', color: '#fde047', border: '1px solid rgba(234,179,8,0.3)' }}>Quoted</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc', display: 'flex', alignItems: 'center', gap: 4 }}><CalendarDays size={10} /> Mar 10 · 9:00 AM</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}><User size={10} /> Jake R.</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}><CreditCard size={10} /> {fmt(quoteTotal)} due</span>
          </div>
          <div style={{ display: 'flex', gap: 0, marginLeft: -20, marginRight: -20, paddingLeft: 20, overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                padding: '10px 14px', fontSize: 11, fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.38)',
                borderBottom: `2px solid ${activeTab === tab.id ? '#a5b4fc' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 11 }}>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#f6f6fa', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeTab === 'overview' && (
          <>
            <Card>
              <SectionHeader icon={<User size={11} />} label="Client Info" bg="#eef2ff" />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
                  {[
                    { l: 'Name', v: 'Mike Torres', link: false }, { l: 'Phone', v: '(555) 482-1930', link: true },
                    { l: 'Email', v: 'mike@email.com', link: true }, { l: 'Address', v: '142 Oak St', link: false },
                    { l: 'City', v: 'Anytown', link: false }, { l: 'Category', v: 'Roofing', link: false },
                  ].map(f => (
                    <div key={f.l}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{f.l}</div>
                      {f.l === 'Category'
                        ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: '#eef2ff', border: '1px solid #e0e7ff', color: '#6366f1' }}>Roofing</span>
                        : <div style={{ fontSize: 12, fontWeight: 600, color: f.link ? '#6366f1' : '#0f172a' }}>{f.v}</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[['✉️','Email'],['📞','Call'],['💬','Text'],['📍','Directions']].map(([icon,label]) => (
                    <div key={label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px 4px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 10, fontWeight: 600, color: '#64748b' }}>
                      <span style={{ fontSize: 11 }}>{icon}</span> {label}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Card>
                <SectionHeader icon={<MessageSquare size={11} />} label="Customer's Message" bg="#ecfdf5" />
                <div style={{ padding: '14px 16px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  Storm damage on south side, multiple shingles missing. Needs full inspection and repair estimate.
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
                    <CalendarDays size={10} style={{ flexShrink: 0, color: '#94a3b8' }} /> <span style={{ fontWeight: 700, color: '#94a3b8' }}>Preferred:</span> Mar 10
                  </div>
                </div>
              </Card>
              <Card>
                <SectionHeader icon={<Lock size={11} />} label="Internal Notes" bg="#fffbeb" />
                <div style={{ padding: '14px 16px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  Insurance adjuster visit scheduled for Mar 8. Customer wants full replacement quote.
                  <div style={{ marginTop: 10 }}><span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>Edit Notes</span></div>
                </div>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'schedule' && (
          <Card>
            <SectionHeader icon={<CalendarDays size={11} />} label="Schedule" bg="#ecfdf5" />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'Date', value: 'March 10, 2025', icon: <CalendarDays size={11} /> }, { label: 'Time', value: '9:00 AM', icon: <Clock size={11} /> }, { label: 'Assigned To', value: 'Jake R.', icon: <User size={11} /> }, { label: 'Est. Hours', value: '6 hours', icon: <Clock size={11} /> }].map(f => (
                  <div key={f.label} style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}><span>{f.icon}</span> {f.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>✅</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Confirmation email sent</div>
                  <div style={{ fontSize: 11, color: '#4ade80' }}>Mar 6 · 3:15 PM — mike@email.com</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'quote' && (
          <Card>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 20, height: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>💰</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Quote</span>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', background: '#dbeafe', color: '#2563eb' }}>{fmt(quoteTotal)}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Accepted</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: '#f1f5f9', color: '#475569' }}>Edit</span>
            </div>
            <div style={{ borderBottom: '1px solid #f8fafc' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 80px 80px', padding: '8px 16px', background: '#f8fafc' }}>
                {['ITEM','QTY','UNIT','AMOUNT'].map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: h !== 'ITEM' ? 'right' : 'left' }}>{h}</span>
                ))}
              </div>
              {quoteItems.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px 80px 80px', padding: '10px 16px', borderTop: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{item.desc}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right', fontFamily: 'DM Mono' }}>{item.qty}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'right', fontFamily: 'DM Mono' }}>{fmt(item.unitPrice)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', textAlign: 'right', fontFamily: 'DM Mono' }}>{fmt(item.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #d1fae5' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#059669', fontFamily: 'DM Mono' }}>{fmt(quoteTotal)}</span>
            </div>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card>
            <SectionHeader icon={<CreditCard size={11} />} label="Payment" bg="#fffbeb" />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 14, background: '#fef9ee', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Partial Payment</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#b45309', fontFamily: 'DM Mono', marginTop: 2 }}>{fmt(1000)} <span style={{ fontSize: 13, color: '#d97706', fontWeight: 500 }}>of {fmt(quoteTotal)}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#92400e' }}>Remaining</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', fontFamily: 'DM Mono' }}>{fmt(quoteTotal - 1000)}</div>
                </div>
              </div>
              <div style={{ height: 6, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(1000/quoteTotal)*100}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', borderRadius: 99 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ label: 'Quote Total', value: fmt(quoteTotal) }, { label: 'Amount Paid', value: fmt(1000) }, { label: 'Payment Date', value: 'Mar 5, 2025' }, { label: 'Method', value: 'Check #1042' }].map(f => (
                  <div key={f.label} style={{ padding: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'tasks' && (
          <Card>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 20, height: 20, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><CheckSquare size={11} /></span>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Tasks</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: '#eef2ff', color: '#6366f1' }}>{tasks.filter(t => !t.done).length} remaining</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1' }}>+ Add Task</span>
            </div>
            <div>
              {tasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: '1px solid #fafafa', background: task.done ? '#fafafa' : 'white' }}>
                  <div style={{ width: 18, height: 18, flexShrink: 0, border: task.done ? 'none' : '2px solid #e2e8f0', background: task.done ? '#6366f1' : 'white', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: task.done ? '#94a3b8' : '#334155', textDecoration: task.done ? 'line-through' : 'none', fontWeight: task.done ? 400 : 500 }}>{task.text}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'photos' && (
          <Card>
            <SectionHeader icon={<Image size={11} />} label="Media" bg="#fdf4ff" />
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[{ label: 'Before Photos', color: '#fef2f2', border: '#fecaca', count: 3 }, { label: 'After Photos', color: '#f0fdf4', border: '#bbf7d0', count: 3 }].map(section => (
                <div key={section.label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{section.label}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Array.from({ length: section.count }).map((_, i) => (
                      <div key={i} style={{ width: 72, height: 72, background: section.color, border: `1.5px solid ${section.border}`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: section.border }}><Image size={22} strokeWidth={1.5} /></div>
                    ))}
                    <div style={{ width: 72, height: 72, border: '2px dashed #e2e8f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>+</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 20, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><MessageSquare size={11} /></span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Activity Log</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', background: '#f1f5f9', color: '#64748b', marginLeft: 'auto' }}>{notes.length}</span>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc' }}>
              <div style={{ height: 60, background: '#f8fafc', border: '2px solid #f1f5f9', borderRadius: 4, padding: '8px 12px', fontSize: 12, color: '#94a3b8' }}>Add a note...</div>
              <div style={{ marginTop: 8, background: '#6366f1', color: 'white', textAlign: 'center', padding: '8px', fontSize: 12, fontWeight: 700 }}>Add Note</div>
            </div>
            <div>
              {notes.map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 28, height: 28, background: '#eef2ff', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#6366f1', flexShrink: 0 }}>{note.user}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{note.name}</span>
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>{note.time}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.5 }}>{note.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '12px 16px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, border: '2px solid #f1f5f9', background: 'white', textAlign: 'center', padding: '10px', fontSize: 13, fontWeight: 700, color: '#64748b' }}>Close</div>
      </div>
    </div>
  );
}


/* ── CUSTOMIZE SECTION ── */
function CustomizeDemo() {
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 12 }}>
          Customization
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 12 }}>
          Set it up once.{' '}
          <span style={{ color: '#5CCB3A' }}>Every lead gets it.</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#64748b', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Configure tasks and quote templates per service category. When a lead comes in, everything's ready — just review and send.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left' }}>
          {[
            { num: '01', icon: <Layers     size={20} strokeWidth={2} />, title: 'Create your categories', desc: 'Add the services you offer — Roofing, HVAC, Plumbing, anything.' },
            { num: '02', icon: <CheckSquare size={20} strokeWidth={2} />, title: 'Add tasks per category', desc: 'A checklist auto-creates every time a lead converts to a project.' },
            { num: '03', icon: <FileText    size={20} strokeWidth={2} />, title: 'Build a quote template', desc: 'Pre-fill line items and prices. Edit per job, or send as-is.' },
          ].map((step) => (
            <div key={step.num} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: 'clamp(16px, 2.5vw, 24px)' }}>
              <div style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 500, color: '#5CCB3A', marginBottom: 10, letterSpacing: '0.05em' }}>{step.num}</div>
              <div style={{ width: 44, height: 44, background: 'rgba(92,203,58,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5CCB3A', marginBottom: 10 }}>{step.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ── PRICING SECTION ── */
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 49,
      annualPrice: 39,
      desc: 'Lead tracking for solo contractors',
      features: ['Unlimited leads', 'Cards + table view', 'Status management', 'Customer booking form', 'Email / call / text actions', 'CSV export', 'Mobile friendly'],
      cta: 'Start Free Trial',
      href: '/signup?plan=basic',
      highlight: false,
    },
    {
      name: 'Pro',
      monthlyPrice: 99,
      annualPrice: 79,
      desc: 'Full job management + AI',
      features: ['Everything in Basic', 'Convert leads to projects', 'Quotes & payment tracking', 'Tasks & scheduling', 'Photo & doc management', 'Repeat customer detection', 'AI Brief on every lead', 'AI Assistant chat'],
      cta: 'Start Free Trial',
      href: '/signup?plan=pro',
      highlight: true,
    },
  ];

  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: !annual ? '#0f172a' : '#94a3b8', transition: 'color 0.2s' }}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            style={{
              width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', position: 'relative',
              background: annual ? '#5CCB3A' : '#e2e8f0', transition: 'background 0.25s', padding: 0, flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: annual ? 23 : 3,
              width: 18, height: 18, borderRadius: '50%', background: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.25s',
            }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: annual ? '#0f172a' : '#94a3b8', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Annual
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: annual ? '#5CCB3A' : '#e2e8f0', color: annual ? 'white' : '#94a3b8',
              fontFamily: 'DM Mono', letterSpacing: '0.04em', transition: 'all 0.25s',
            }}>SAVE 20%</span>
          </span>
        </div>

        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {plans.map(plan => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div key={plan.name} style={{
                border: plan.highlight ? '2px solid rgba(92,203,58,0.4)' : '1px solid #e2e8f0',
                background: 'white', borderRadius: 8, padding: 'clamp(20px, 4vw, 32px)', position: 'relative',
                boxShadow: plan.highlight ? '0 8px 32px rgba(92,203,58,0.12)' : 'none',
              }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #5CCB3A, transparent)', borderRadius: '8px 8px 0 0' }} />}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', color: plan.highlight ? '#5CCB3A' : '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'DM Mono', lineHeight: 1, color: '#0f172a' }}>
                      ${price}
                    </div>
                    <div style={{ paddingBottom: 6 }}>
                      <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 400 }}>/mo</span>
                      {annual && (
                        <div style={{ fontSize: 10, color: '#5CCB3A', fontFamily: 'DM Mono', fontWeight: 700 }}>billed annually</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{plan.desc}</div>
                </div>
                <Link href={plan.href} className="cta-primary" style={{ display: 'block', textAlign: 'center', padding: '11px 20px', fontSize: 14, fontWeight: 600, borderRadius: 4, marginBottom: 24, background: plan.highlight ? '#5CCB3A' : '#1e293b' }}>
                  {plan.cta}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2 6L5 9L10 3" stroke={plan.highlight ? '#5CCB3A' : '#64748b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: '#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono', letterSpacing: '0.08em' }}>
          14-DAY FREE TRIAL · NO CREDIT CARD · CANCEL ANYTIME
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#0d0d0d' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

        html, body { background: #0d0d0d !important; margin: 0; }
        * { box-sizing: border-box; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } 50% { box-shadow: 0 0 20px 4px rgba(59,130,246,0.2); } }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .stat-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, background 0.2s;
        }
        .stat-card:hover { border-color: rgba(92,203,58,0.3); background: rgba(92,203,58,0.04); }

        .feature-card {
          border: 1px solid #e2e8f0; background: white;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #5CCB3A, transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }

        .section-label {
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: #94a3b8; margin-bottom: 12px;
        }

        .badge {
          font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(92,203,58,0.95);
          border: 1px solid rgba(92,203,58,0.25); background: rgba(92,203,58,0.08);
          padding: 4px 12px; display: inline-block;
        }

        .ai-pill {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
          border: 1px solid rgba(99,102,241,0.2); color: #a78bfa;
          font-size: 12px; font-weight: 600; padding: 4px 10px;
          display: inline-flex; align-items: center; gap: 5px;
        }

        .cta-primary {
          background: #5CCB3A; color: white; font-weight: 700;
          letter-spacing: 0.01em; transition: background 0.15s, transform 0.1s;
          text-decoration: none; display: inline-block;
        }
        .cta-primary:hover { background: #3FAE2A; transform: translateY(-1px); }

        .cta-secondary {
          border: 1px solid #cbd5e1; color: #475569;
          font-weight: 500; transition: all 0.15s; text-decoration: none; display: inline-block;
        }
        .cta-secondary:hover { border-color: #94a3b8; color: #1e293b; }

        .industry-tag {
          border: 1px solid #e2e8f0; background: white;
          color: #475569; font-size: 13px; font-weight: 500;
          transition: all 0.15s; padding: 10px 20px; white-space: nowrap;
        }
        .industry-tag:hover { border-color: rgba(92,203,58,0.4); background: rgba(92,203,58,0.05); color: #1e293b; }

        .nav-link { color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500; transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: white; }

        .orange { color: #5CCB3A; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.4s; opacity: 0; }

        @media (max-width: 768px) {
          .industry-tag { font-size: 12px; padding: 8px 14px; }

          /* Mobile: stack form demo side by side → single column */
          .demo-grid { grid-template-columns: 1fr !important; }
          .demo-label-grid { grid-template-columns: 1fr !important; }
          .demo-label-right { justify-content: flex-start !important; }

          /* Mobile: LeadToProject demo */
          .l2p-grid { grid-template-columns: 1fr !important; }
          .l2p-arrow { display: none !important; }

          /* Mobile: features grid single col */
          .features-grid { grid-template-columns: 1fr !important; }

          /* Mobile: pricing grid single col */
          .pricing-grid { grid-template-columns: 1fr !important; }

          /* Mobile: steps list */
          .steps-row { flex-direction: column !important; gap: 8px !important; }

          /* Mobile: explainer grid single col */
          .explainer-grid { grid-template-columns: 1fr !important; }
          .explainer-grid > div { border-radius: 8px !important; }

          /* Mobile: footer grid */
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }

        @media (max-width: 480px) {
          .hero-badges { flex-direction: column; align-items: flex-start !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <div className="grain" />

      <header className="fixed top-0 w-full z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#5CCB3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>L2P</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Lead2Project</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="#features" className="nav-link hidden md:inline">Features</Link>
            <Link href="/login" className="nav-link hidden sm:inline" style={{ padding: '6px 10px' }}>Sign in</Link>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: '8px 16px', fontSize: 14 }}>Start Free</Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ paddingTop: 'clamp(100px, 20vw, 144px)', paddingBottom: 'clamp(48px, 10vw, 112px)', paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(92,203,58,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 40% at 20% 80%, rgba(99,102,241,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap' }} className="fade-up fade-up-1 hero-badges">
            <span className="ai-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              AI-Powered for Service Contractors
            </span>
          </div>

          <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(32px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 'clamp(16px, 3vw, 24px)' }}>
            Stop losing jobs<br />
            <span className="orange">to disorganization.</span>
          </h1>

          <p className="fade-up fade-up-3" style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.5)', maxWidth: 480, lineHeight: 1.7, marginBottom: 'clamp(24px, 4vw, 36px)', fontWeight: 300 }}>
            Share one link. Customers submit their info, photos, and job details. It lands on your board — ready to quote, track, and close.
          </p>

          <div className="fade-up fade-up-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 14px) clamp(20px, 4vw, 32px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              Start Free — 14 Days →
            </Link>
            <Link href="#how-it-works" style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}>
              See how it works ↓
            </Link>
          </div>

          {/* Social proof */}
          <div className="fade-up fade-up-4 social-proof" style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['#F97316','#6366F1','#22C55E','#F59E0B','#EC4899'].map((color, i) => (
                <div key={i} style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  border: '2px solid #0d0d0d', marginLeft: i === 0 ? 0 : -8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'white',
                }}>
                  {['JR','MK','AL','SC','TW'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 3 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono', letterSpacing: '0.04em' }}>
                Trusted by <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>500+ contractors</span>
              </div>
            </div>
          </div>

          <p className="fade-up fade-up-4" style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>
            NO CREDIT CARD · CANCEL ANYTIME · 2 MIN SETUP
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="stat-grid" style={{ maxWidth: 1152, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { num: '$60K', label: 'Lost yearly from missed leads', sub: 'industry estimate' },
            { num: '1 job', label: 'Pays for an entire year', sub: 'at $99/mo' },
            { num: '2 min', label: 'To set up your booking link', sub: 'no tech skills needed' },
            { num: '100%', label: 'Leads captured & organized', sub: 'nothing falls through' },
          ].map(s => (
            <div key={s.num} className="stat-card" style={{ padding: 'clamp(12px, 2vw, 20px)', borderRadius: 8 }}>
              <div style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#5CCB3A', fontFamily: 'DM Mono' }}>{s.num}</div>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'rgba(255,255,255,0.55)', fontWeight: 400, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: 'rgba(255,255,255,0.25)', marginTop: 2, fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── YOUR LINK EXPLAINER ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
            <div className="section-label">The Big Picture</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, color: '#0f172a' }}>
              One link. <span className="orange">Replaces the chaos.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: '#64748b', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              Put it on your website, replace your contact form, drop it in your email signature or Instagram bio. From there, everything runs itself.
            </p>
          </div>

          <div className="explainer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

            {/* Card 01 — Link + QR */}
            <div style={{
              padding: 'clamp(24px, 4vw, 36px)', background: 'white',
              border: '1px solid #e2e8f0', borderRadius: 12, position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #5CCB3A, transparent)' }} />
              <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#cbd5e1', letterSpacing: '0.15em', marginBottom: 16 }}>01</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, background: 'rgba(92,203,58,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5CCB3A', flexShrink: 0 }}><Link2 size={20} strokeWidth={2} /></div>
                <h3 style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0f172a' }}>Your link goes everywhere</h3>
              </div>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#64748b', lineHeight: 1.75, marginBottom: 20 }}>
                Replace your website's contact form. Add it to your email signature, Google Business profile, or Instagram bio. Anywhere a customer might reach out — your link handles it.
              </p>

              {/* Link + QR visual */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                {/* QR code SVG — simplified pixel art style */}
                <div style={{ flexShrink: 0, padding: 6, background: 'white', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    {/* Top-left finder */}
                    <rect x="2" y="2" width="18" height="18" rx="2" fill="#0f172a"/>
                    <rect x="5" y="5" width="12" height="12" rx="1" fill="white"/>
                    <rect x="8" y="8" width="6" height="6" rx="0.5" fill="#0f172a"/>
                    {/* Top-right finder */}
                    <rect x="32" y="2" width="18" height="18" rx="2" fill="#0f172a"/>
                    <rect x="35" y="5" width="12" height="12" rx="1" fill="white"/>
                    <rect x="38" y="8" width="6" height="6" rx="0.5" fill="#0f172a"/>
                    {/* Bottom-left finder */}
                    <rect x="2" y="32" width="18" height="18" rx="2" fill="#0f172a"/>
                    <rect x="5" y="35" width="12" height="12" rx="1" fill="white"/>
                    <rect x="8" y="38" width="6" height="6" rx="0.5" fill="#0f172a"/>
                    {/* Data pixels - scattered pattern */}
                    <rect x="22" y="2" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="28" y="2" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="22" y="8" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="22" y="14" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="28" y="10" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="2" y="22" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="8" y="22" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="14" y="22" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="22" y="22" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="28" y="22" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="34" y="22" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="46" y="22" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="22" y="28" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="34" y="28" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="40" y="28" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="46" y="28" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="22" y="34" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="28" y="34" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="40" y="34" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="22" y="40" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="34" y="40" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="46" y="40" width="4" height="4" rx="0.5" fill="#5CCB3A"/>
                    <rect x="28" y="46" width="4" height="4" rx="0.5" fill="#0f172a"/>
                    <rect x="40" y="46" width="4" height="4" rx="0.5" fill="#0f172a"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#5CCB3A', fontWeight: 600, marginBottom: 4, letterSpacing: '0.02em' }}>lead2project.com/torres-roofing</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>Share the link <span style={{ color: '#cbd5e1' }}>or</span> print the QR code — job sites, trucks, invoices, flyers</div>
                </div>
              </div>
            </div>

            {[
              {
                num: '02', icon: <Clipboard size={20} strokeWidth={2} />, accent: '#3b82f6',
                title: 'They submit everything at once',
                body: 'Name, phone, photos, job description — all in one form. No more texting back and forth asking for pictures. No more "can you send me more info?" emails.',
                detail: 'No more chasing', detailLabel: 'photos via text',
              },
              {
                num: '03', icon: <FolderOpen size={20} strokeWidth={2} />, accent: '#a855f7',
                title: 'Instant project. Full paper trail.',
                body: "The moment they submit, a job card lands on your board. Add notes, quotes, tasks, and payments as the job progresses — tied to one place forever. You can also create jobs manually yourself.",
                detail: 'Customer submits or', detailLabel: 'you create manually',
              },
              {
                num: '04', icon: <FileSpreadsheet size={20} strokeWidth={2} />, accent: '#f97316',
                title: 'Reconcile in seconds',
                body: "Every job, quote, and payment is logged automatically. At month end, download a CSV of everything — dates, amounts, statuses. Hand it to your accountant or keep it for records.",
                detail: 'Export to CSV', detailLabel: 'anytime',
              },
            ].map((card, i) => (
              <div key={i} style={{
                padding: 'clamp(24px, 4vw, 36px)', background: 'white',
                border: '1px solid #e2e8f0', borderRadius: 12, position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${card.accent}, transparent)` }} />
                <div style={{ fontFamily: 'DM Mono', fontSize: 11, color: '#cbd5e1', letterSpacing: '0.15em', marginBottom: 16 }}>{card.num}</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, background: `${card.accent}12`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.accent, flexShrink: 0 }}>{card.icon}</div>
                  <h3 style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#0f172a' }}>{card.title}</h3>
                </div>
                <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#64748b', lineHeight: 1.75, marginBottom: 20 }}>{card.body}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: `${card.accent}0f`, border: `1px solid ${card.accent}30`, borderRadius: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: card.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: card.accent, letterSpacing: '0.05em' }}>{card.detail}</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: '#94a3b8', letterSpacing: '0.05em' }}>— {card.detailLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM → BOARD DEMO ── */}
      <section id="how-it-works" style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">How It Works</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Customer submits. <span className="orange">You see it instantly.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6 }}>
              Share your link. They fill out the form. The lead lands on your board — organized, tagged, and ready to quote.
            </p>
          </div>
          <FormToBoardDemo />
        </div>
      </section>

      {/* ── LEAD → PROJECT CONVERSION ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
            <div className="section-label">The Core Flow</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              One click. <span className="orange">Full job record.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '12px auto 0', lineHeight: 1.6 }}>
              One click converts a lead into a full project — with auto-created tasks, quote templates, and a project number. That's the whole idea.
            </p>
          </div>
          <LeadToProjectDemo />
        </div>
      </section>

      {/* ── AI ASSISTANT LIVE DEMO ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1152, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">AI Assistant</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Your business, on call <span style={{ color: '#6366f1' }}>24/7.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
              Ask plain-English questions about your jobs and get real answers instantly — who owes you money, what's scheduled, which leads went cold.
            </p>
          </div>

          <AIChatDemo />

          <div style={{ marginTop: 'clamp(24px, 4vw, 40px)', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(10px, 1.5vw, 13px)', color: 'rgba(255,255,255,0.2)', marginBottom: 14, fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>AND HUNDREDS MORE...</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {['"Summarize the Johnson job"', '"How much have I quoted this month?"', '"Who\'s my biggest customer?"', '"What\'s the pipeline total?"', '"Which jobs need follow-ups?"'].map(q => (
                <span key={q} style={{ fontFamily: 'DM Mono', fontSize: 'clamp(9px, 1.2vw, 10px)', padding: '4px 8px', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', color: '#6366f1', borderRadius: 3 }}>{q}</span>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/signup?plan=pro" className="cta-primary" style={{ borderRadius: 4, padding: '12px 28px', fontSize: 14 }}>Unlock AI Assistant →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">Features</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', maxWidth: 560, color: '#0f172a' }}>
              Everything a service pro needs.<br />
              <span style={{ color: '#94a3b8', fontWeight: 300 }}>Nothing they don't.</span>
            </h2>
          </div>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { icon: <Link2 size={20} strokeWidth={2} />, title: 'Custom Booking Link', desc: 'One shareable link. Customers submit photos, describe the job, and enter their contact info — straight to your board.', tag: null },
              { icon: <DollarSign size={20} strokeWidth={2} />, title: 'Quotes & Payments', desc: 'Build line-item quotes, send them via email, track payment status. Know exactly what\'s owed across every job.', tag: null },
              { icon: <CalendarDays size={20} strokeWidth={2} />, title: 'Scheduling & Calendar', desc: 'Assign jobs, set dates and times, send confirmations. See your whole week at a glance in calendar view.', tag: null },
              { icon: <Bot size={20} strokeWidth={2} />, title: 'AI Assistant', desc: "Ask it anything — \"who hasn't paid?\", \"what's scheduled this week?\", \"summarize this job.\" Real answers instantly.", tag: 'Pro' },
              { icon: <BarChart2 size={20} strokeWidth={2} />, title: 'Job Status Board', desc: 'See every job at a glance — New, Quoted, Scheduled, Done. Move cards as work progresses. Nothing falls through the cracks.', tag: null },
              { icon: <Mail size={20} strokeWidth={2} />, title: 'Branded Emails', desc: 'Quote, schedule, and payment emails sent with your logo and brand colors. Professional and automatic.', tag: null },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>{f.icon}</div>
                  {f.tag && (
                    <span style={{ fontFamily: 'DM Mono', fontSize: 9, letterSpacing: '0.12em', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', padding: '2px 7px' }}>{f.tag}</span>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em', color: '#0f172a' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, fontWeight: 400 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUSTOMIZE PER CATEGORY ── */}
      <CustomizeDemo />

      {/* ── HOW IT WORKS (STEPS) ── */}
      <section id="how-it-works" style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">Setup</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>Up and running in minutes.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up, set your company name, upload a logo, pick your brand colors. Done in under 2 minutes.', detail: 'No technical setup required.' },
              { step: '02', title: 'Share your booking link', desc: 'You get a unique URL — put it in your Instagram bio, email signature, website, or business card QR code.', detail: 'lead2project.com/yourcompany' },
              { step: '03', title: 'Customers submit leads', desc: 'They fill out a 2-step form — contact info, service type, description, photos, address, preferred dates.', detail: 'Saved instantly, even if they stop at step 1.' },
              { step: '04', title: 'You work your pipeline', desc: 'Leads land on your board. AI brief ready. Quote, schedule, track, and close — all in one place.', detail: 'Ask the AI anything about your jobs.' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'clamp(40px, 8vw, 64px) 1fr', gap: 'clamp(12px, 3vw, 24px)', padding: 'clamp(20px, 4vw, 32px) 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 500, color: 'rgba(92,203,58,0.5)', lineHeight: 1 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', color: '#0f172a' }}>{s.title}</h3>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: '#64748b', lineHeight: 1.7, marginBottom: 8 }}>{s.desc}</p>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 'clamp(10px, 1.5vw, 11px)', color: '#5CCB3A', letterSpacing: '0.05em' }}>{s.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDED EMAIL PREVIEW ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
            <div className="section-label">Professional Emails</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
              Customers think you have <span className="orange">a whole office.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#64748b', maxWidth: 520, margin: '12px auto 0', lineHeight: 1.6 }}>
              Quotes, confirmations, and payment reminders go out automatically — with your logo, brand colors, and name on every one.
            </p>
          </div>
          <EmailPreviewDemo />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: 'clamp(40px, 6vw, 72px) 16px', background: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 48px)' }}>
            <div className="section-label">From the Field</div>
            <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0f172a' }}>
              Contractors who stopped <span className="orange">losing jobs to chaos.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              {
                quote: "Used to chase customers for photos over text for 3 days. Now they show up to the job already knowing the scope. No surprises on-site, no back-and-forth — it just works.",
                name: 'Jake R.',
                trade: 'Roofing Contractor',
                location: 'Phoenix, AZ',
                initials: 'JR',
                color: '#5CCB3A',
              },
              {
                quote: "I was using a notebook and spreadsheets. A customer asked me for a quote I sent 3 weeks ago and I had no idea where it was. Lead2Project fixed that in the first week.",
                name: 'Maria C.',
                trade: 'HVAC & Plumbing',
                location: 'Dallas, TX',
                initials: 'MC',
                color: '#3b82f6',
              },
              {
                quote: "The AI assistant is wild. I asked it who hasn't paid and it gave me a list with amounts and how many days overdue. That used to take me 20 minutes to figure out.",
                name: 'Darnell W.',
                trade: 'General Contractor',
                location: 'Atlanta, GA',
                initials: 'DW',
                color: '#a855f7',
              },
            ].map((t, i) => (
              <div key={i} style={{ padding: 'clamp(20px, 3vw, 28px)', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                {/* Quote mark */}
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: 'Georgia, serif', fontSize: 48, color: '#f1f5f9', lineHeight: 1, userSelect: 'none' }}>"</div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                {/* Quote */}
                <p style={{ fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#334155', lineHeight: 1.75, fontStyle: 'italic', flex: 1, position: 'relative', zIndex: 1 }}>"{t.quote}"</p>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${t.color}20`, border: `2px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'DM Mono', fontSize: 10, fontWeight: 700, color: t.color }}>{t.initials}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono', letterSpacing: '0.04em' }}>{t.trade} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection />

      {/* ── FINAL CTA ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px', textAlign: 'center', background: 'white' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="section-label">Get Started</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 16, color: '#0f172a' }}>
            One job pays for<br />
            <span className="orange">the whole year.</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#64748b', marginBottom: 28 }}>
            Stop losing leads to disorganization. Start running your business like a pro.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>Start Free Trial →</Link>
            <Link href="/pricing" className="cta-secondary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>View Pricing</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) 16px 24px' }}>

          {/* Top row: brand + nav columns */}
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 'clamp(24px, 4vw, 48px)', marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#5CCB3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 9, fontWeight: 700, color: 'white' }}>L2P</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Lead2Project</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, maxWidth: 260, marginBottom: 16 }}>
                The job management tool built for service contractors. One link. Every lead. Full paper trail.
              </p>
              {/* Social links */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'X', href: 'https://x.com', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.717-8.813L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
                  { label: 'Instagram', href: 'https://instagram.com', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#5CCB3A')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b"><path d={s.path}/></svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono', marginBottom: 14 }}>Product</div>
              {[['Features', '#features'], ['Pricing', '/pricing'], ['Sign Up', '/signup'], ['Login', '/login']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{label}</Link>
                </div>
              ))}
            </div>

            {/* Company */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono', marginBottom: 14 }}>Company</div>
              {[['About', '/about'], ['Contact', 'mailto:hello@lead2project.com'], ['Blog', '/blog']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{label}</Link>
                </div>
              ))}
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Mono', marginBottom: 14 }}>Legal</div>
              {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, href]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0f172a')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{label}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: '#cbd5e1', fontFamily: 'DM Mono', letterSpacing: '0.05em', margin: 0 }}>
              © {new Date().getFullYear()} LEAD2PROJECT · BUILT FOR SERVICE PROS
            </p>
            <p style={{ fontSize: 12, color: '#cbd5e1', fontFamily: 'DM Mono', letterSpacing: '0.05em', margin: 0 }}>
              MADE WITH ♥ FOR CONTRACTORS
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}