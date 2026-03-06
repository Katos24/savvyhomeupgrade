'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── FORM → BOARD ANIMATED DEMO ── */
function FormToBoardDemo() {
  const [phase, setPhase] = useState<'filling' | 'submitting' | 'step2' | 'board' | 'pause'>('filling');
  const [fieldIndex, setFieldIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedValues, setDisplayedValues] = useState<string[]>(['', '', '', '', '']);
  const [photosShown, setPhotosShown] = useState(0);
  const [step2Answer, setStep2Answer] = useState('');
  const [step2Submitted, setStep2Submitted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fields = [
    { label: 'Name', value: 'Mike Torres', icon: '👤', isSelect: false },
    { label: 'Email', value: 'mike@email.com', icon: '✉️', isSelect: false },
    { label: 'Phone', value: '(555) 482-1930', icon: '📱', isSelect: false },
    { label: 'Service', value: 'Roofing', icon: '🏠', isSelect: true },
    { label: 'Details', value: 'Storm damage, shingles missing on south side. Need full inspection.', icon: '📝', isSelect: false },
  ];

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (phase === 'filling') {
      if (fieldIndex < fields.length) {
        const currentField = fields[fieldIndex];
        if (currentField.isSelect) {
          // Select fields: show value instantly after a brief pause
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => {
              const next = [...prev];
              next[fieldIndex] = currentField.value;
              return next;
            });
            timeoutRef.current = setTimeout(() => {
              setFieldIndex(f => f + 1);
              setCharIndex(0);
            }, 400);
          }, 500);
        } else if (charIndex < currentField.value.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayedValues(prev => {
              const next = [...prev];
              next[fieldIndex] = currentField.value.slice(0, charIndex + 1);
              return next;
            });
            setCharIndex(c => c + 1);
          }, fieldIndex === 4 ? 18 : 35 + Math.random() * 25);
        } else {
          timeoutRef.current = setTimeout(() => {
            setFieldIndex(f => f + 1);
            setCharIndex(0);
          }, 300);
        }
      } else {
        timeoutRef.current = setTimeout(() => setPhase('submitting'), 600);
      }
    }

    if (phase === 'submitting') {
      timeoutRef.current = setTimeout(() => setPhase('step2'), 1200);
    }

    if (phase === 'step2') {
      // Animate: photos drop in one by one, then answer types, then submit
      const step2Answer_full = 'Yes, home warranty covers it';
      if (photosShown < 3) {
        timeoutRef.current = setTimeout(() => setPhotosShown(p => p + 1), 500);
      } else if (step2Answer.length < step2Answer_full.length) {
        timeoutRef.current = setTimeout(() => {
          setStep2Answer(step2Answer_full.slice(0, step2Answer.length + 1));
        }, 30 + Math.random() * 30);
      } else if (!step2Submitted) {
        timeoutRef.current = setTimeout(() => setStep2Submitted(true), 500);
      } else {
        timeoutRef.current = setTimeout(() => setPhase('board'), 800);
      }
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
        setPhotosShown(0);
        setStep2Answer('');
        setStep2Submitted(false);
      }, 1500);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, fieldIndex, charIndex, photosShown, step2Answer, step2Submitted]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: phase === 'board' || phase === 'pause' ? '0fr 1fr' : '1fr 0fr',
        transition: 'grid-template-columns 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: 0,
        overflow: 'hidden',
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>

        {/* LEFT: Customer Form */}
        <div style={{
          minWidth: 0,
          overflow: 'hidden',
          opacity: phase === 'board' || phase === 'pause' ? 0 : 1,
          transition: 'opacity 0.4s',
          position: 'relative',
        }}>
          {/* Form chrome */}
          <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>CUSTOMER FORM</span>
            <div style={{ width: 50 }} />
          </div>

          <div style={{ padding: '20px 20px 24px', background: '#fafbfc' }}>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, background: '#5CCB3A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: 9, fontWeight: 700, color: 'white' }}>L2P</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Submit Your Project</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fields.map((field, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11 }}>{field.icon}</span> {field.label}
                  </div>
                  {field.isSelect ? (
                    /* Dropdown select field */
                    <div style={{
                      background: 'white',
                      border: `1.5px solid ${fieldIndex > i ? '#22c55e' : fieldIndex === i ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 12,
                      color: displayedValues[i] ? '#1a1a1a' : '#9ca3af',
                      transition: 'border-color 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span>{displayedValues[i] || 'Select a service...'}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M3 5L6 8L9 5" stroke={displayedValues[i] ? '#1a1a1a' : '#9ca3af'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : i === 4 ? (
                    <div style={{
                      background: 'white',
                      border: `1.5px solid ${fieldIndex === i ? '#3b82f6' : fieldIndex > i ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 12,
                      color: displayedValues[i] ? '#1a1a1a' : '#9ca3af',
                      minHeight: 48,
                      lineHeight: 1.5,
                      transition: 'border-color 0.2s',
                    }}>
                      {displayedValues[i] || 'Describe your project...'}
                      {fieldIndex === i && <span style={{ color: '#3b82f6', animation: 'blink 0.8s infinite' }}>|</span>}
                    </div>
                  ) : (
                    <div style={{
                      background: 'white',
                      border: `1.5px solid ${fieldIndex === i ? '#3b82f6' : fieldIndex > i ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 12,
                      color: displayedValues[i] ? '#1a1a1a' : '#9ca3af',
                      transition: 'border-color 0.2s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}>
                      {displayedValues[i] || (i === 3 ? 'Select a service...' : `Enter ${field.label.toLowerCase()}...`)}
                      {fieldIndex === i && <span style={{ color: '#3b82f6', animation: 'blink 0.8s infinite' }}>|</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit button */}
            <div style={{
              marginTop: 16,
              background: phase === 'submitting' || phase === 'step2' ? '#16a34a' : '#3b82f6',
              color: 'white',
              textAlign: 'center',
              padding: '10px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              transition: 'background 0.3s',
            }}>
              {phase === 'submitting' || phase === 'step2' ? '✓ Submitted!' : 'Submit Project →'}
            </div>
          </div>

          {/* ── Step 2 Overlay ── */}
          {phase === 'step2' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              zIndex: 10,
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{
                background: 'white',
                borderRadius: 12,
                width: '92%',
                maxWidth: 340,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}>
                {/* Step 2 header */}
                <div style={{
                  background: 'linear-gradient(to right, #2563eb, #3b82f6)',
                  padding: '12px 16px',
                  color: 'white',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>✓</div>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>→</span>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>2</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Add photos & details</div>
                  <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>Optional — helps us quote faster</div>
                </div>

                <div style={{ padding: '14px 16px' }}>
                  {/* Photo upload area */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      📸 Photos
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[
                        { color: '#fef2f2', border: '#fecaca', emoji: '🏠' },
                        { color: '#fef9ee', border: '#fed7aa', emoji: '🔨' },
                        { color: '#f0fdf4', border: '#bbf7d0', emoji: '📐' },
                      ].map((photo, i) => (
                        <div key={i} style={{
                          width: 56, height: 56,
                          background: photosShown > i ? photo.color : '#f9fafb',
                          border: `1.5px ${photosShown > i ? 'solid' : 'dashed'} ${photosShown > i ? photo.border : '#e5e7eb'}`,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: photosShown > i ? 20 : 14,
                          color: '#d1d5db',
                          transition: 'all 0.3s ease',
                          transform: photosShown > i ? 'scale(1)' : 'scale(0.85)',
                          opacity: photosShown > i ? 1 : 0.4,
                        }}>
                          {photosShown > i ? photo.emoji : '+'}
                        </div>
                      ))}
                      <div style={{
                        width: 56, height: 56,
                        border: '1.5px dashed #e5e7eb',
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: '#d1d5db',
                      }}>+</div>
                    </div>
                  </div>

                  {/* Custom question */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ❓ Is this covered by warranty?
                    </div>
                    <div style={{
                      background: 'white',
                      border: `1.5px solid ${step2Answer ? '#22c55e' : '#e5e7eb'}`,
                      borderRadius: 6,
                      padding: '8px 10px',
                      fontSize: 12,
                      color: step2Answer ? '#1a1a1a' : '#9ca3af',
                      transition: 'border-color 0.2s',
                      minHeight: 20,
                    }}>
                      {step2Answer || 'Your answer...'}
                      {step2Answer && step2Answer.length < 'Yes, home warranty covers it'.length && (
                        <span style={{ color: '#3b82f6', animation: 'blink 0.8s infinite' }}>|</span>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <div style={{
                    background: step2Submitted ? '#16a34a' : '#3b82f6',
                    color: 'white',
                    textAlign: 'center',
                    padding: '9px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    transition: 'background 0.3s',
                  }}>
                    {step2Submitted ? '✓ Details Saved!' : 'Submit Details'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Dashboard Board */}
        <div style={{
          minWidth: 0,
          overflow: 'hidden',
          opacity: phase === 'board' || phase === 'pause' ? 1 : 0,
          transition: 'opacity 0.4s ease 0.3s',
        }}>
          {/* Board chrome */}
          <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>YOUR DASHBOARD</span>
            <div style={{ width: 50 }} />
          </div>

          <div style={{ background: '#f8fafc', padding: 12 }}>
            {/* Status filters */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              {['All (8)', 'New (3)', 'Quoted (2)', 'Scheduled (2)', 'Done (1)'].map((f, i) => (
                <span key={f} style={{
                  fontSize: 9, fontWeight: 700, padding: '3px 8px',
                  fontFamily: 'DM Mono',
                  background: i === 1 ? '#3b82f6' : 'rgba(0,0,0,0.04)',
                  color: i === 1 ? 'white' : 'rgba(0,0,0,0.45)',
                  border: i === 1 ? 'none' : '1px solid rgba(0,0,0,0.07)',
                }}>
                  {f}
                </span>
              ))}
            </div>

            {/* Cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* NEW LEAD - animated highlight */}
              <div style={{
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                overflow: 'hidden',
                animation: 'pulseGlow 1.5s ease-in-out 3',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#3b82f6', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 6px', fontFamily: 'DM Mono' }}>NEW</div>
                <div style={{ height: 3, background: '#3b82f6' }} />
                <div style={{ padding: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>New</span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginTop: 6, marginBottom: 4 }}>Mike Torres</div>
                  <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>Storm damage, shingles missing on south side</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.3)', fontFamily: 'DM Mono' }}>Just now</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', background: '#0ea5e9', color: 'white' }}>Roofing</span>
                  </div>
                </div>
              </div>

              {/* Existing leads */}
              {[
                { name: 'Sarah Kim', desc: 'Full kitchen remodel — cabinets, countertops', status: 'Quoted', statusHex: '#f97316', cat: 'Renovation', time: '1h ago', quote: '$18,500' },
                { name: 'James Park', desc: 'AC unit not cooling, making rattling noise', status: 'Scheduled', statusHex: '#22c55e', cat: 'HVAC', time: '3h ago', quote: '$890' },
                { name: 'Lisa Morgan', desc: 'Backyard fence, 60 linear ft cedar', status: 'In Progress', statusHex: '#a855f7', cat: 'Fencing', time: 'Yesterday', quote: '$3,100' },
                { name: 'David Chen', desc: 'Electrical panel upgrade 200→400 amp', status: 'Quoted', statusHex: '#f97316', cat: 'Electrical', time: '4h ago', quote: '$2,450' },
                { name: 'Robert Jackson', desc: 'Gutter replacement full house', status: 'Completed', statusHex: '#22c55e', cat: 'Gutters', time: '1d ago', quote: '$1,200' },
              ].map((lead, i) => (
                <div key={i} style={{
                  background: 'white',
                  border: '1px solid rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{ height: 3, background: lead.statusHex }} />
                  <div style={{ padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: `${lead.statusHex}15`, color: lead.statusHex, border: `1px solid ${lead.statusHex}35` }}>{lead.status}</span>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 5px', background: '#0ea5e9', color: 'white' }}>{lead.cat}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{lead.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.5)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{lead.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: 9, color: 'rgba(0,0,0,0.3)', fontFamily: 'DM Mono' }}>{lead.time}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', fontFamily: 'DM Mono' }}>{lead.quote}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(0,0,0,0.25)', letterSpacing: '0.08em' }}>LIVE DASHBOARD</span>
            <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(92,203,58,0.8)', letterSpacing: '0.05em' }}>✦ AI BRIEF READY</span>
          </div>
        </div>
      </div>

      {/* Phase indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Customer fills form', active: phase === 'filling' },
          { label: 'Submitted', active: phase === 'submitting' },
          { label: 'Photos & details', active: phase === 'step2' },
          { label: 'On your board', active: phase === 'board' || phase === 'pause' },
        ].map((step, i) => (
          <span key={i} style={{
            fontFamily: 'DM Mono', fontSize: 10, padding: '5px 10px',
            border: `1px solid ${step.active ? 'rgba(92,203,58,0.4)' : 'rgba(255,255,255,0.08)'}`,
            background: step.active ? 'rgba(92,203,58,0.1)' : 'transparent',
            color: step.active ? '#5CCB3A' : 'rgba(255,255,255,0.3)',
            borderRadius: 4,
            transition: 'all 0.3s',
          }}>
            {step.label}
          </span>
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
      color: '#6366f1',
      colorDim: 'rgba(99,102,241,0.7)',
    },
    {
      question: "What's on the schedule this week?",
      answer: `2 jobs scheduled this week:\n\n📅 Thu, Mar 6 · 9:00 AM\n  James Park — HVAC Repair\n  Quote: $890 · Confirmed\n\n📅 Sat, Mar 8 · 8:00 AM\n  Amanda Rodriguez — Deck Staining\n  Quote: $1,850 · Confirmed\n\n→ No conflicts detected.`,
      color: '#22c55e',
      colorDim: 'rgba(34,197,94,0.7)',
    },
    {
      question: "Which leads went cold?",
      answer: `5 leads inactive 7+ days:\n\n🔴 Mike Torres — Roofing — 14 days\n   Never responded to quote.\n\n🟠 Jennifer Mills — Tile — 9 days\n   Opened quote, no reply.\n\n🟠 Thomas Wright — Plumbing — 8 days\n   Called once, voicemail.\n\n→ Follow up with Mike & Jennifer first.`,
      color: '#f87171',
      colorDim: 'rgba(248,113,113,0.7)',
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
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.06)',
      }}>
        <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
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

        <div style={{ padding: '24px 20px', minHeight: 280, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.75)', padding: '14px 18px',
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono' }}>
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
            border: `1px solid ${i === activeDemo ? d.color + '60' : 'rgba(255,255,255,0.08)'}`,
            background: i === activeDemo ? d.color + '15' : 'rgba(255,255,255,0.02)',
            color: i === activeDemo ? d.color : 'rgba(255,255,255,0.35)',
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
      type: 'Quote', icon: '💰', color: '#22c55e',
      subject: 'Your Quote from Acme Roofing',
      lines: [
        'Hi Mike,',
        '',
        "Thank you for your inquiry! We've prepared a quote for your roofing project.",
        '',
        'Quote Total: $4,850.00',
        '',
        'Please review and let us know if you have any questions.',
        '',
        'Best regards,',
        'Acme Roofing',
        '(555) 234-5678',
      ],
    },
    {
      type: 'Schedule', icon: '📅', color: '#3b82f6',
      subject: 'Appointment Scheduled — Acme Roofing',
      lines: [
        'Hi Mike,',
        '',
        'Your appointment has been scheduled!',
        '',
        '📅 Date: Thursday, March 6, 2025',
        '🕐 Time: 9:00 AM',
        '📍 Address: 142 Oak Street, Anytown',
        '',
        'We look forward to serving you!',
        '',
        'Best regards,',
        'Acme Roofing',
      ],
    },
    {
      type: 'Payment', icon: '💳', color: '#a855f7',
      subject: 'Payment Reminder — Acme Roofing',
      lines: [
        'Hi Mike,',
        '',
        'This is a friendly reminder about your upcoming payment.',
        '',
        '💵 Amount Due: $4,850.00',
        '📅 Due Date: March 20, 2025',
        '',
        'Please contact us if you have any questions.',
        '',
        'Best regards,',
        'Acme Roofing',
      ],
    },
  ];

  const email = emails[activeEmail];

  return (
    <div>
      {/* Email type selector — matches actual app template selector style */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {emails.map((e, i) => (
          <button key={e.type} onClick={() => setActiveEmail(i)} style={{
            fontSize: 12, fontWeight: 600, padding: '8px 16px',
            background: i === activeEmail ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${i === activeEmail ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            color: i === activeEmail ? 'white' : 'rgba(255,255,255,0.4)',
            borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: i === activeEmail ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
          }}>
            <span style={{ fontSize: 14 }}>{e.icon}</span> {e.type} Email
          </button>
        ))}
      </div>

      {/* Email preview — matches actual branded email from EmailTemplatesTab */}
      <div style={{
        maxWidth: 480, margin: '0 auto',
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Chrome bar */}
        <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>EMAIL PREVIEW</span>
          <div style={{ width: 50 }} />
        </div>

        {/* Branded gradient header — matches company email_brand_color gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '28px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, background: 'rgba(255,255,255,0.15)', borderRadius: 12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
          }}>
            <span style={{ fontFamily: 'DM Mono', fontSize: 16, fontWeight: 700, color: 'white' }}>AR</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Acme Roofing</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>(555) 234-5678</div>
        </div>

        {/* Email metadata — matches actual preview from/to/subject layout */}
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

        {/* Email body */}
        <div style={{ background: 'white', padding: '24px 20px', minHeight: 180 }}>
          {email.lines.map((line, i) => (
            <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", minHeight: line === '' ? 12 : 'auto' }}>
              {line}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ background: '#f8fafc', padding: '10px 20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Sent via Lead2Project</span>
        </div>
      </div>

      {/* Customization callout */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
          <span style={{ fontSize: 14 }}>🎨</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Choose your gradient colors, upload your logo, customize every template</span>
        </div>
      </div>
    </div>
  );
}


/* ── LEAD → PROJECT CONVERSION DEMO ── */
function LeadToProjectDemo() {
  const [converted, setConverted] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cycle = () => {
      setConverted(false); setShowTasks(false); setShowQuote(false);
      timeoutRef.current = setTimeout(() => {
        setConverted(true);
        timeoutRef.current = setTimeout(() => {
          setShowTasks(true);
          timeoutRef.current = setTimeout(() => {
            setShowQuote(true);
            timeoutRef.current = setTimeout(cycle, 4000);
          }, 800);
        }, 800);
      }, 2500);
    };
    cycle();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
    }}>
      {/* Header bar — matches LeadModal #312e81 header */}
      <div style={{ background: '#312e81', padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            {converted && (
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontFamily: 'DM Mono' }}>#PRJ-0013</div>
            )}
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Mike Torres</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Submitted Mar 2, 2025</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>⋮</span>
            </div>
            <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>✕</span>
            </div>
          </div>
        </div>

        {/* Status chips — matches LeadModal chip row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '4px 10px',
            background: converted ? 'rgba(34,197,94,0.2)' : 'rgba(59,130,246,0.2)',
            color: converted ? '#4ade80' : '#93c5fd',
            border: `1px solid ${converted ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`,
            transition: 'all 0.4s',
          }}>{converted ? '✓ Converted' : 'New'}</span>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📅 Not scheduled
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
            Roofing
          </span>
        </div>

        {/* Tab bar — matches LeadModal tabs */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.06)', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, paddingTop: 0 }}>
          {[
            { label: 'Overview', icon: '◉', active: !converted },
            { label: 'Tasks', icon: '✅', active: showTasks && !showQuote },
            { label: 'Quote', icon: '💰', active: showQuote },
            { label: 'Schedule', icon: '📅', active: false },
            { label: 'Activity', icon: '💬', active: false },
          ].map(tab => (
            <div key={tab.label} style={{
              padding: '10px 14px', fontSize: 11, fontWeight: 600,
              color: tab.active ? 'white' : 'rgba(255,255,255,0.35)',
              borderBottom: tab.active ? '2px solid #a5b4fc' : '2px solid transparent',
              transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 11 }}>{tab.icon}</span> {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Body — matches LeadModal #f6f6fa background */}
      <div style={{ background: '#f6f6fa', padding: 'clamp(16px, 3vw, 24px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'start' }}>

        {/* Left: Client card — matches actual Client Info card */}
        <div style={{ background: 'white', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 18, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>👤</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Client Info</span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { label: 'Name', value: 'Mike Torres' },
                { label: 'Phone', value: '(555) 482-1930', isLink: true },
                { label: 'Email', value: 'mike@email.com', isLink: true },
                { label: 'City', value: 'Anytown' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: f.isLink ? '#6366f1' : '#0f172a' }}>{f.value}</div>
                </div>
              ))}
            </div>
            {/* Quick action buttons — matches actual Email/Call/Text/Directions row */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { icon: '✉️', label: 'Email', color: '#3b82f6' },
                { icon: '📞', label: 'Call', color: '#22c55e' },
                { icon: '💬', label: 'Text', color: '#a855f7' },
                { icon: '📍', label: 'Map', color: '#ef4444' },
              ].map(b => (
                <div key={b.label} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '8px 4px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: 10, fontWeight: 600, color: '#64748b',
                }}>
                  <span style={{ fontSize: 11 }}>{b.icon}</span> {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Convert button */}
          <div style={{ padding: '0 16px 14px' }}>
            <div style={{
              background: converted ? '#22c55e' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', textAlign: 'center', padding: '10px 14px',
              fontSize: 12, fontWeight: 700, transition: 'all 0.4s',
              boxShadow: converted ? 'none' : '0 4px 12px rgba(99,102,241,0.25)',
            }}>
              {converted ? '✓ Converted to Project #13' : '⚡ Convert to Project'}
            </div>
          </div>
        </div>

        {/* Right: Auto-created items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Tasks card — matches actual TasksSection style */}
          <div style={{
            background: 'white', border: '1px solid #f1f5f9', overflow: 'hidden',
            opacity: showTasks ? 1 : 0.15, transform: showTasks ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease',
          }}>
            {/* Section header — matches "Project Planning" gradient header */}
            <div style={{ padding: '10px 14px', background: 'linear-gradient(to right, #f0fdf4, #f0fdf9)', borderBottom: '1px solid #dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11 }}>✅</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#166534', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tasks</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: '#eef2ff', color: '#6366f1' }}>4</span>
              </div>
              <span style={{ fontFamily: 'DM Mono', fontSize: 8, color: '#86efac', letterSpacing: '0.05em' }}>FROM TEMPLATE</span>
            </div>
            {['Inspect roof & document damage', 'Take before photos', 'Repair vs. replace recommendation', 'Check flashing & gutters'].map((task, i) => (
              <div key={i} style={{ padding: '8px 14px', borderBottom: '1px solid #fafafa', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, border: '2px solid #e2e8f0', borderRadius: 3, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#475569' }}>{task}</span>
              </div>
            ))}
          </div>

          {/* Quote card — matches actual QuoteSection style */}
          <div style={{
            background: 'white', border: '1px solid #f1f5f9', overflow: 'hidden',
            opacity: showQuote ? 1 : 0.15, transform: showQuote ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s ease',
          }}>
            <div style={{ padding: '10px 14px', background: 'linear-gradient(to right, #faf5ff, #fdf4ff)', borderBottom: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11 }}>💰</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#581c87', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Quote Draft</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', background: '#f5f3ff', color: '#7c3aed' }}>3</span>
              </div>
              <span style={{ fontFamily: 'DM Mono', fontSize: 8, color: '#c084fc', letterSpacing: '0.05em' }}>FROM TEMPLATE</span>
            </div>
            {/* Table header — matches actual quote table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px 60px', padding: '6px 14px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>ITEM</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'center' }}>QTY</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'right' }}>AMOUNT</span>
            </div>
            {[
              { item: 'Tear-off & disposal', qty: 1, price: '$850' },
              { item: 'Underlayment install', qty: 1, price: '$450' },
              { item: 'Architectural shingles', qty: 1, price: '$2,400' },
            ].map((line, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 50px 60px', padding: '8px 14px', borderBottom: '1px solid #fafafa' }}>
                <span style={{ fontSize: 12, color: '#475569' }}>{line.item}</span>
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'DM Mono', textAlign: 'center' }}>{line.qty}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', fontFamily: 'DM Mono', textAlign: 'right' }}>{line.price}</span>
              </div>
            ))}
            <div style={{ padding: '10px 14px', background: '#ecfdf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #d1fae5' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#059669', fontFamily: 'DM Mono' }}>$3,700</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.015)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
          ONE CLICK → TASKS + QUOTE DRAFT + PROJECT NUMBER
        </span>
        <span style={{ fontFamily: 'DM Mono', fontSize: 9, color: 'rgba(92,203,58,0.7)', letterSpacing: '0.05em' }}>
          ✦ READY TO SEND IN SECONDS
        </span>
      </div>
    </div>
  );
}


/* ── CUSTOMIZE PER CATEGORY DEMO ── */
function CustomizeDemo() {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    {
      name: 'Roofing', icon: '🏠', color: '#ef4444',
      tasks: [
        { task: 'Inspect roof & document damage', on: true },
        { task: 'Take before photos', on: true },
        { task: 'Provide repair vs. replace recommendation', on: true },
        { task: 'Check flashing & gutters', on: true },
        { task: 'File insurance claim paperwork', on: false },
      ],
      quoteItems: [
        { item: 'Tear-off & disposal', qty: 1, unitPrice: 850, amount: 850 },
        { item: 'Underlayment install', qty: 1, unitPrice: 450, amount: 450 },
        { item: 'Architectural shingles', qty: 24, unitPrice: 120, amount: 2880 },
        { item: 'Flashing replacement', qty: 4, unitPrice: 65, amount: 260 },
        { item: 'Ridge vent install', qty: 30, unitPrice: 12, amount: 360 },
      ],
    },
    {
      name: 'HVAC', icon: '❄️', color: '#3b82f6',
      tasks: [
        { task: 'Diagnose system issue', on: true },
        { task: 'Check refrigerant levels', on: true },
        { task: 'Inspect ductwork for leaks', on: true },
        { task: 'Test thermostat calibration', on: false },
        { task: 'Clean condenser coils', on: false },
      ],
      quoteItems: [
        { item: 'Diagnostic service call', qty: 1, unitPrice: 89, amount: 89 },
        { item: 'Refrigerant recharge', qty: 3, unitPrice: 55, amount: 165 },
        { item: 'Capacitor replacement', qty: 1, unitPrice: 180, amount: 180 },
        { item: 'Blower motor replacement', qty: 1, unitPrice: 450, amount: 450 },
      ],
    },
    {
      name: 'Electrical', icon: '⚡', color: '#f59e0b',
      tasks: [
        { task: 'Inspect electrical panel', on: true },
        { task: 'Test all circuits & breakers', on: true },
        { task: 'Check grounding system', on: true },
        { task: 'Document code violations', on: false },
        { task: 'Provide upgrade estimate', on: true },
      ],
      quoteItems: [
        { item: 'Panel upgrade (200A)', qty: 1, unitPrice: 1800, amount: 1800 },
        { item: 'Circuit breaker replacement', qty: 3, unitPrice: 120, amount: 360 },
        { item: 'Outlet install/replace', qty: 6, unitPrice: 85, amount: 510 },
        { item: 'Dedicated circuit run', qty: 2, unitPrice: 250, amount: 500 },
      ],
    },
  ];

  const cat = categories[activeCategory];
  const quoteTotal = cat.quoteItems.reduce((s, q) => s + q.amount, 0);
  const fmt = (n: number) => '$' + n.toLocaleString();

  return (
    <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
          <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Customization</div>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Set it up once. <span className="orange">Every lead gets it.</span>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)', maxWidth: 540, margin: '12px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
            Pre-configure tasks and quote templates per service category. When a new lead comes in, everything's ready — just review, adjust, and send.
          </p>
        </div>

        {/* Category tabs — matches CategoriesTab list style */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {categories.map((c, i) => (
            <button key={c.name} onClick={() => setActiveCategory(i)} style={{
              fontSize: 12, fontWeight: 600, padding: '8px 16px',
              background: i === activeCategory ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${i === activeCategory ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
              color: i === activeCategory ? 'white' : 'rgba(255,255,255,0.4)',
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: i === activeCategory ? '0 4px 12px rgba(99,102,241,0.25)' : 'none',
            }}>
              <span>{c.icon}</span> {c.name}
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 6px',
                background: i === activeCategory ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                borderRadius: 4,
              }}>{c.tasks.filter(t => t.on).length} tasks</span>
            </button>
          ))}
        </div>

        {/* Settings panel — matches actual settings white-bg card style */}
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}>
          {/* Header — matches #312e81 modal headers from actual app */}
          <div style={{ background: '#312e81', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>⚙️</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(165,180,252,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Settings → Categories</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{cat.name}</div>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
              {cat.tasks.length} templates · {cat.quoteItems.length} line items
            </span>
          </div>

          {/* Two-column layout on white bg — matches actual settings cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>

            {/* Left: Task Templates — matches CategoriesTab task list */}
            <div style={{ padding: 'clamp(16px, 3vw, 20px)', background: 'white', borderRight: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 20, height: 20, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✅</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Task Templates</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', background: '#eef2ff', color: '#6366f1' }}>
                  {cat.tasks.filter(t => t.on).length} active
                </span>
              </div>

              <div style={{ border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {cat.tasks.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderBottom: i < cat.tasks.length - 1 ? '1px solid #fafafa' : 'none',
                    background: t.on ? 'white' : '#fafafa',
                  }}>
                    {/* Checkbox — matches task checkbox from TasksSection */}
                    <div style={{
                      width: 16, height: 16, flexShrink: 0,
                      border: t.on ? 'none' : '2px solid #e2e8f0',
                      background: t.on ? '#6366f1' : 'white',
                      borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.on && <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 12, color: t.on ? '#1e293b' : '#94a3b8', fontWeight: t.on ? 500 : 400 }}>
                      {t.task}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: '#64748b' }}>Tip:</span> These auto-create when a {cat.name.toLowerCase()} lead converts to a project.
              </div>
            </div>

            {/* Right: Quote Template — matches QuoteTemplatesTab line item table */}
            <div style={{ padding: 'clamp(16px, 3vw, 20px)', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 20, height: 20, background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>💰</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Quote Template</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', background: '#f5f3ff', color: '#7c3aed' }}>
                  {cat.quoteItems.length} items
                </span>
              </div>

              {/* Quote table — matches actual QuoteTemplatesTab */}
              <div style={{ border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                {/* Table header */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 60px 70px', padding: '8px 12px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em' }}>ITEM</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'center' }}>QTY</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'right' }}>RATE</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'right' }}>AMOUNT</span>
                </div>
                {/* Rows */}
                {cat.quoteItems.map((q, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 40px 60px 70px', padding: '9px 12px',
                    borderBottom: i < cat.quoteItems.length - 1 ? '1px solid #fafafa' : 'none',
                  }}>
                    <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>{q.item}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono', textAlign: 'center' }}>{q.qty}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'DM Mono', textAlign: 'right' }}>{fmt(q.unitPrice)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#059669', fontFamily: 'DM Mono', textAlign: 'right' }}>{fmt(q.amount)}</span>
                  </div>
                ))}
                {/* Total — matches actual QuoteSection emerald total row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#ecfdf5', borderTop: '1px solid #d1fae5' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#059669', fontFamily: 'DM Mono' }}>{fmt(quoteTotal)}</span>
                </div>
              </div>

              {/* Add item hint — matches dashed border from QuoteTemplatesTab */}
              <div style={{
                marginTop: 8, padding: '8px 12px',
                border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: '#94a3b8', fontSize: 11,
              }}>
                <span style={{ fontSize: 14, color: '#6366f1' }}>+</span> Add custom line item
              </div>
            </div>
          </div>

          {/* Footer — matches settings save footer */}
          <div style={{
            padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#fafafa',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              Configure once → applied to every new {cat.name.toLowerCase()} lead
            </span>
            <div style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
              padding: '8px 16px', fontSize: 11, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
            }}>
              Save Categories
            </div>
          </div>
        </div>
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

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          50% { box-shadow: 0 0 20px 4px rgba(59,130,246,0.25); }
        }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .hero-glow {
          position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(92,203,58,0.15) 0%, transparent 70%);
          top: -100px; right: -100px; pointer-events: none;
        }
        .hero-glow-2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          bottom: 0; left: -50px; pointer-events: none;
        }

        .stat-card {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, background 0.2s;
        }
        .stat-card:hover { border-color: rgba(92,203,58,0.3); background: rgba(92,203,58,0.04); }

        .feature-card {
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(92,203,58,0.5), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-card:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); transform: translateY(-2px); }

        .section-label {
          font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 12px;
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
          border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.7);
          font-weight: 500; transition: all 0.15s; text-decoration: none; display: inline-block;
        }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.35); color: white; }

        .industry-tag {
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.6); font-size: 13px; font-weight: 500;
          transition: all 0.15s; padding: 10px 20px; white-space: nowrap;
        }
        .industry-tag:hover { border-color: rgba(92,203,58,0.3); background: rgba(92,203,58,0.05); color: white; }

        .nav-link { color: rgba(255,255,255,0.55); font-size: 14px; font-weight: 500; transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: white; }

        .orange { color: #5CCB3A; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
        .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
        .fade-up-4 { animation-delay: 0.4s; opacity: 0; }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .hero-glow { width: 300px; height: 300px; top: -50px; right: -50px; }
          .hero-glow-2 { width: 200px; height: 200px; }
          .industry-tag { font-size: 12px; padding: 8px 14px; }
        }
      `}</style>

      <div className="grain" />

      {/* ── NAV ── */}
      <header className="fixed top-0 w-full z-50" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#5CCB3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.05em' }}>L2P</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Lead2Project</span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/pricing"  style={{ display: 'none' }} className="nav-link hidden md:inline">Pricing</Link>
            <Link href="#features" className="nav-link hidden md:inline">Features</Link>
            <Link href="/login" className="nav-link hidden sm:inline" style={{ padding: '6px 10px' }}>Sign in</Link>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: '8px 16px', fontSize: 14 }}>
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ paddingTop: 'clamp(100px, 20vw, 144px)', paddingBottom: 'clamp(48px, 10vw, 112px)', paddingLeft: 16, paddingRight: 16 }}>
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap' }} className="fade-up fade-up-1">
            <span className="badge">No‑Chaos Project Tracking</span>
            <span className="ai-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              AI-Powered
            </span>
          </div>

          <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(32px, 7vw, 72px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 'clamp(16px, 3vw, 24px)' }}>
            Stop losing jobs<br />
            <span className="orange">to disorganization.</span>
          </h1>

          <p className="fade-up fade-up-3" style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.5)', maxWidth: 520, lineHeight: 1.7, marginBottom: 'clamp(24px, 4vw, 36px)', fontWeight: 300 }}>
            One link. Customers submit photos, details, and their info. You get a clean lead board, instant quotes, AI briefs, and full job tracking — without the chaos.
          </p>

          <div className="fade-up fade-up-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 14px) clamp(20px, 4vw, 32px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              Start Free — 14 Days →
            </Link>
            
          </div>

          <p className="fade-up fade-up-4" style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>
            NO CREDIT CARD · CANCEL ANYTIME · 2 MIN SETUP
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { num: '$60K', label: 'Lost yearly from missed leads', sub: 'avg. contractor' },
            { num: '1 job', label: 'Pays for an entire year', sub: 'at $99/mo' },
            { num: '30s', label: 'AI brief on any lead', sub: 'instant context' },
            { num: '100%', label: 'Leads captured & organized', sub: 'nothing falls through' },
          ].map(s => (
            <div key={s.num} className="stat-card" style={{ padding: 'clamp(12px, 2vw, 20px)' }}>
              <div style={{ fontSize: 'clamp(20px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#5CCB3A', fontFamily: 'DM Mono' }}>{s.num}</div>
              <div style={{ fontSize: 'clamp(11px, 1.5vw, 13px)', color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontSize: 'clamp(9px, 1vw, 11px)', color: 'rgba(255,255,255,0.25)', marginTop: 2, fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FORM → BOARD DEMO ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">How It Works</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Customer submits. <span className="orange">You see it instantly.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)', maxWidth: 500, margin: '12px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
              Share your link. They fill out the form. The lead lands on your board with an AI brief — ready to quote.
            </p>
          </div>

          <FormToBoardDemo />
        </div>
      </section>

      {/* ── AI ASSISTANT LIVE DEMO ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px', background: 'rgba(255,255,255,0.005)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1152, margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">AI Assistant</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Ask it anything. <span style={{ color: '#a78bfa' }}>Watch it work.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6, fontWeight: 300 }}>
              The AI has full context of your pipeline — every lead, quote, and note. Ask a question, get a real answer in seconds.
            </p>
          </div>

          <AIChatDemo />

          <div style={{ marginTop: 'clamp(24px, 4vw, 40px)', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(10px, 1.5vw, 13px)', color: 'rgba(255,255,255,0.3)', marginBottom: 14, fontFamily: 'DM Mono', letterSpacing: '0.05em' }}>AND HUNDREDS MORE...</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {['"Summarize the Johnson job"', '"How much have I quoted this month?"', '"Who\'s my biggest customer?"', '"What\'s the pipeline total?"', '"Which jobs need follow-ups?"'].map(q => (
                <span key={q} style={{
                  fontFamily: 'DM Mono', fontSize: 'clamp(9px, 1.2vw, 10px)', padding: '4px 8px',
                  border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(167,139,250,0.04)',
                  color: 'rgba(167,139,250,0.6)', borderRadius: 3,
                }}>{q}</span>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/signup?plan=pro" className="cta-primary" style={{ borderRadius: 4, padding: '12px 28px', fontSize: 14 }}>
                Unlock AI Assistant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">Features</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', maxWidth: 560 }}>
              Everything a service pro needs.<br />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Nothing they don't.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {[
              { icon: '🔗', title: 'Custom Booking Link', desc: 'One shareable link. Customers submit photos, describe the job, and enter their contact info. Goes straight to your board.', tag: null },
              { icon: '🤖', title: 'AI Assistant', desc: 'Ask it anything about your business — "who hasn\'t paid?", "what\'s scheduled this week?", "summarize this job."', tag: 'Pro' },
              { icon: '⚡', title: 'Instant AI Brief', desc: 'Every new lead gets a 30-second AI summary. Condition, urgency, what\'s needed — before you pick up the phone.', tag: 'Pro' },
              { icon: '💰', title: 'Quotes & Payments', desc: 'Build line-item quotes, send them via email, track payment status. Know exactly what\'s owed across every job.', tag: null },
              { icon: '📅', title: 'Scheduling & Calendar', desc: 'Assign jobs, set dates and times, send confirmations. See your whole week at a glance in calendar view.', tag: null },
              { icon: '📊', title: 'Pipeline Tracking', desc: 'Custom status stages. Move leads from New → Quoted → Scheduled → Completed. See your whole business at a glance.', tag: null },
              { icon: '👥', title: 'Team Management', desc: 'Invite your crew, assign roles and permissions. Assign leads to specific team members so nothing falls through.', tag: null },
              { icon: '✉️', title: 'Branded Emails', desc: 'Quote, schedule, and payment emails sent with your logo and brand colors. Professional and automatic.', tag: null },
              { icon: '📸', title: 'Photo & Doc Management', desc: 'Customers upload photos and videos when they submit. Everything is attached to the lead.', tag: null },
              { icon: '🔁', title: 'Repeat Customer Detection', desc: 'Automatically flags when a returning customer submits a new lead. See their history instantly.', tag: 'Pro' },
              { icon: '📤', title: 'Outbox', desc: 'Full log of every quote and schedule email ever sent. Spot duplicates, track what went out and when.', tag: null },
              { icon: '🔔', title: 'Instant Notifications', desc: 'Get alerted the moment a new lead comes in. Daily digest emails keep you on top of your pipeline.', tag: null },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: 6 }}>
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

      {/* ── CUSTOMIZE PER CATEGORY ── */}
      <CustomizeDemo />

      {/* ── HOW IT WORKS (STEPS) ── */}
      <section id="how-it-works" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)' }}>
            <div className="section-label">Setup</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Up and running in minutes.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up, set your company name, upload a logo, pick your brand colors. Done in under 2 minutes.', detail: 'No technical setup required.' },
              { step: '02', title: 'Share your booking link', desc: 'You get a unique URL — put it in your Instagram bio, email signature, website, or business card QR code.', detail: 'lead2project.com/yourcompany' },
              { step: '03', title: 'Customers submit leads', desc: 'They fill out a 2-step form — contact info, service type, description, photos, address, preferred dates.', detail: 'Saved instantly, even if they stop at step 1.' },
              { step: '04', title: 'You work your pipeline', desc: 'Leads land on your board. AI brief ready. Quote, schedule, track, and close — all in one place.', detail: 'Ask the AI anything about your jobs.' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: 'clamp(40px, 8vw, 64px) 1fr',
                gap: 'clamp(12px, 3vw, 24px)',
                padding: 'clamp(20px, 4vw, 32px) 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ fontFamily: 'DM Mono', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 500, color: 'rgba(92,203,58,0.3)', lineHeight: 1 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</h3>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 8, fontWeight: 300 }}>{s.desc}</p>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 'clamp(10px, 1.5vw, 11px)', color: 'rgba(92,203,58,0.55)', letterSpacing: '0.05em' }}>{s.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRANDED EMAIL PREVIEW ── */}
      <section style={{ padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Professional Emails</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Your brand. <span className="orange">Every email.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '12px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
              Quotes, schedule confirmations, and payment reminders — all sent automatically with your logo and brand colors.
            </p>
          </div>

          <EmailPreviewDemo />
        </div>
      </section>

      {/* ── LEAD → PROJECT CONVERSION ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 40px)' }}>
            <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>The Core Flow</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Lead in. <span className="orange">Project out.</span>
            </h2>
            <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '12px auto 0', lineHeight: 1.6, fontWeight: 300 }}>
              One click converts a lead into a full project — with auto-created tasks, quote templates, and a project number. That's the whole idea.
            </p>
          </div>

          <LeadToProjectDemo />
        </div>
      </section>

      {/* ── INDUSTRIES ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(40px, 6vw, 64px) 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div className="section-label" style={{ textAlign: 'center' }}>Industries</div>
          <p style={{ textAlign: 'center', fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.35)', marginBottom: 24, fontWeight: 300 }}>
            Built for anyone who does service work.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {['General Contractors', 'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping', 'Cleaning', 'Painting', 'Flooring', 'Fencing', 'Handyman', 'Pest Control', 'Pool Service', 'Solar', 'Remodeling', 'Moving'].map(ind => (
              <span key={ind} className="industry-tag" style={{ borderRadius: 4 }}>{ind}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              {
                name: 'Basic', price: '$49', desc: 'Lead tracking for solo contractors',
                features: ['Unlimited leads', 'Cards + table view', 'Status management', 'Customer booking form', 'Email / call / text actions', 'CSV export', 'Mobile friendly'],
                cta: 'Start Free Trial', href: '/signup?plan=basic', highlight: false,
              },
              {
                name: 'Pro', price: '$99', desc: 'Full job management + AI',
                features: ['Everything in Basic', 'Convert leads to projects', 'Quotes & payment tracking', 'Tasks & scheduling', 'Photo & doc management', 'Repeat customer detection', 'AI Brief on every lead', 'AI Assistant chat'],
                cta: 'Start Free Trial', href: '/signup?plan=pro', highlight: true,
              },
            ].map(plan => (
              <div key={plan.name} style={{
                border: plan.highlight ? '1px solid rgba(92,203,58,0.35)' : '1px solid rgba(255,255,255,0.07)',
                background: plan.highlight ? 'rgba(92,203,58,0.04)' : 'rgba(255,255,255,0.02)',
                borderRadius: 6, padding: 'clamp(20px, 4vw, 32px)', position: 'relative',
              }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #5CCB3A, transparent)' }} />}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'DM Mono', fontSize: 10, letterSpacing: '0.2em', color: plan.highlight ? '#5CCB3A' : 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', fontFamily: 'DM Mono', lineHeight: 1 }}>
                    {plan.price}<span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{plan.desc}</div>
                </div>

                <Link href={plan.href} className={plan.highlight ? 'cta-primary' : 'cta-secondary'} style={{
                  display: 'block', textAlign: 'center', padding: '11px 20px', fontSize: 14, fontWeight: 600, borderRadius: 4, marginBottom: 24,
                }}>
                  {plan.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M2 6L5 9L10 3" stroke={plan.highlight ? '#5CCB3A' : 'rgba(255,255,255,0.35)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'DM Mono', letterSpacing: '0.08em' }}>
            14-DAY FREE TRIAL · NO CREDIT CARD · CANCEL ANYTIME
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'clamp(48px, 8vw, 80px) 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="section-label">Get Started</div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 16 }}>
            One job pays for<br />
            <span className="orange">the whole year.</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontWeight: 300 }}>
            Stop losing leads to disorganization. Start running your business like a pro.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="cta-primary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              Start Free Trial →
            </Link>
            <Link href="/pricing" className="cta-secondary" style={{ borderRadius: 4, padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 40px)', fontSize: 'clamp(14px, 2vw, 16px)' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 16px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, background: '#5CCB3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'DM Mono', fontSize: 8, fontWeight: 700, color: 'white' }}>L2P</span>
            </div>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Lead2Project</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Pricing', '/pricing'], ['Login', '/login'], ['Sign Up', '/signup']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 400, textDecoration: 'none' }}>{label}</Link>
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