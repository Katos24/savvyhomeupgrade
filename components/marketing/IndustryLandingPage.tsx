// components/marketing/IndustryLandingPage.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { IndustryContent } from '@/lib/industry-content';

export default function IndustryLandingPage({ content }: { content: IndustryContent }) {
  const [annual, setAnnual] = useState(false);

  const c = content.color;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: '#0d0d0d', color: '#fff' }}>

      {/* ── NAV ── */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15, color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Lead2Project
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', border: `1px solid ${c}40`, color: c, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {content.badge}
            </span>
            <Link href="/signup" style={{ padding: '8px 18px', background: c, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)', padding: '80px 24px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: `1px solid ${c}30`, background: `${c}10`, marginBottom: 28, fontSize: 12, fontWeight: 700, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {content.emoji} {content.badge}
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
            {content.hero.headline}
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 40px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            {content.hero.sub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ padding: '14px 28px', background: c, color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}>
              {content.hero.cta}
            </Link>
            <a href="#how-it-works" style={{ padding: '14px 28px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
              {content.hero.demoLabel} →
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#111', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {content.stats.map((stat, i) => (
            <div key={i} style={{ padding: '28px 20px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 700, color: c, letterSpacing: '-0.02em' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{stat.label}</div>
              {stat.note && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2, fontStyle: 'italic' }}>{stat.note}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section style={{ background: '#f8fafc', padding: '72px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 32, textAlign: 'center' }}>
            {content.pain.headline}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {content.pain.points.map((point, i) => (
              <div key={i} style={{ padding: '20px 24px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>😬</span>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>{point}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              Lead2Project fixes all of this. With one link.
            </p>
          </div>
        </div>
      </section>

      {/* ── FORM DEMO ── */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              What your customers see
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
              They fill it out. You see it instantly.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
            {/* Form mockup */}
            <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  lead2project.app/your-business
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>New {content.name} Request</div>
              </div>
              {content.formFields.map((field, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field.label}</div>
                  {field.type === 'textarea' ? (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.3)', minHeight: 60, lineHeight: 1.5 }}>
                      {field.placeholder}
                    </div>
                  ) : (
                    <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                      {field.placeholder}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ padding: '12px', background: c, textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#fff', marginTop: 8 }}>
                Submit Request →
              </div>
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 28 }}>→</div>

            {/* Board card mockup */}
            <div style={{ background: '#1c2a3a', border: `1px solid ${c}40`, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', background: `${c}20`, color: c, border: `1px solid ${c}40`, letterSpacing: '0.06em' }}>NEW LEAD</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono', monospace" }}>just now</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{content.formFields[0].placeholder.split(' ').slice(0, 2).join(' ')}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12, lineHeight: 1.5 }}>
                {content.formFields[content.formFields.length - 1].placeholder.slice(0, 80)}...
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{content.name}</span>
                <button style={{ padding: '5px 10px', background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>✦ Brief</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: '#fff', padding: '80px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Up and running in 3 steps.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {content.howItWorks.map((step, i) => (
              <div key={i}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, color: c, opacity: 0.3, marginBottom: 12 }}>{step.step}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background: '#f8fafc', padding: '80px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Everything included</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>Built for how you actually work.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {content.features.map((feature, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '24px 28px' }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{feature.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.01em' }}>{feature.title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 24, opacity: 0.4 }}>"</div>
          <blockquote style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 600, lineHeight: 1.5, color: 'rgba(255,255,255,0.9)', margin: '0 0 32px', fontStyle: 'italic' }}>
            {content.testimonial.quote}
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, background: `${content.testimonial.color}20`, border: `2px solid ${content.testimonial.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: content.testimonial.color, fontFamily: "'DM Mono', monospace" }}>
              {content.testimonial.initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{content.testimonial.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>{content.testimonial.trade} · {content.testimonial.location}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMAIL PREVIEW ── */}
      <section style={{ background: '#f8fafc', padding: '80px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Branded emails</p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
              Customers think you have a whole office.
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>
              Every submission triggers a professional confirmation email with your business name. No extra setup required.
            </p>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 24, fontFamily: "'DM Mono', monospace" }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
              <span style={{ color: '#0f172a', fontWeight: 700 }}>Subject:</span> {content.emailPreview.subject}
            </div>
<div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
              {content.emailPreview.bodyLines.map((line, i) => (
                <p key={i} style={{ fontSize: 12, color: i === 0 ? '#0f172a' : '#64748b', margin: '0 0 8px', lineHeight: 1.6 }}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: '#fff', padding: '80px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: c, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 8 }}>{content.pricing.headline}</h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>{content.pricing.sub}</p>
            {/* Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: !annual ? '#0f172a' : '#94a3b8' }}>Monthly</span>
              <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, background: annual ? '#22c55e' : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: annual ? 22 : 3, width: 18, height: 18, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: annual ? '#0f172a' : '#94a3b8' }}>Annual</span>
              {annual && <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', padding: '2px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>SAVE 20%</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 700, margin: '0 auto' }}>
            {[
              { name: 'Basic', monthly: 49, annual: 39, features: ['1 booking link', 'Unlimited leads', 'Job board', 'Email notifications', 'Basic analytics'] },
              { name: 'Pro', monthly: 99, annual: 79, features: ['Everything in Basic', 'AI job briefs', 'Photo analysis', 'Quote builder', 'Priority support'], highlight: true },
            ].map((plan) => (
              <div key={plan.name} style={{ border: plan.highlight ? `2px solid ${c}` : '1px solid #e2e8f0', padding: '28px 24px', position: 'relative' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: c, color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 12px', letterSpacing: '0.08em' }}>
                    MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{plan.name}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em' }}>${annual ? plan.annual : plan.monthly}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>/mo</span>
                  {annual && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>billed annually</div>}
                </div>
<ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>                  {plan.features.map((f, i) => (
                    <li key={i} style={{ fontSize: 13, color: '#475569', padding: '5px 0', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#22c55e', flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', padding: '12px', background: plan.highlight ? c : '#0f172a', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  Get Started Free
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: '#0d0d0d', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Ready to stop losing leads?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 36, lineHeight: 1.6 }}>
            Set up your {content.name.toLowerCase()} booking link in 60 seconds. Free to start.
          </p>
          <Link href="/signup" style={{ padding: '16px 36px', background: c, color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>
            Get Your Free Booking Link →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '40px 24px', color: '#0f172a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14 }}>Lead2Project</div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#64748b' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</Link>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>
            © 2025 Lead2Project
          </div>
        </div>
      </footer>

    </div>
  );
}