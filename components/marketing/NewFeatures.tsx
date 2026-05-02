'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Mail,
  FormInput,
  Sparkles,
  Download,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   FEATURES — MOBILE OPTIMIZED
   ─────────────────────────────────────────────────────────
   Mobile: horizontal scrollable pill tabs on top,
           screenshot below full width.
   Desktop: vertical tab list left, screenshot right.
   No purple. No whitespace-nowrap. Touch-friendly.
   ───────────────────────────────────────────────────────── */

interface Feature {
  icon: React.ReactNode;
  name: string;
  screenshot?: string;
}

const FEATURES: Feature[] = [
  {
    icon: <LayoutDashboard size={22} strokeWidth={1.8} />,
    name: 'Lead & Project Board',
    screenshot: '/images/mobilelaptophero2.webp',
  },
  {
    icon: <FileText size={22} strokeWidth={1.8} />,
    name: 'One-Click Quote Builder',
    screenshot: '/images/quote-builder.webp',
  },
  {
    icon: <CalendarDays size={22} strokeWidth={1.8} />,
    name: 'Job Scheduling',
    screenshot: '/images/schedule-send.webp',
  },
  {
    icon: <Mail size={22} strokeWidth={1.8} />,
    name: 'Email Outbox',
    // screenshot: '/images/feature-outbox.webp',
  },
  {
    icon: <FormInput size={22} strokeWidth={1.8} />,
    name: 'Custom Booking Forms',
    screenshot: '/images/form-builder.webp',
  },
  {
    icon: <Download size={22} strokeWidth={1.8} />,
    name: 'CSV Export',
    // screenshot: '/images/feature-export.webp',
  },
  {
    icon: <Sparkles size={22} strokeWidth={1.8} />,
    name: 'AI Briefs & Assistant',
    // screenshot: '/images/feature-ai.webp',
  },
];

export default function NewFeatures() {
  const [active, setActive] = useState(0);
  const current = FEATURES[active];

  return (
    <section style={{ background: '#f8fafc' }} id="features">
      <div className="max-w-7xl mx-auto px-5 sm:px-10 py-16 sm:py-28">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-20">
          <p className="text-sm font-semibold text-slate-500 tracking-wide mb-4">
            Our features
          </p>
          <h2
            className="font-black text-slate-900 leading-[1.1] tracking-tight"
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 3.2rem)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Everything You Need to
            <br className="hidden sm:block" />
            Run Your Business.
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed max-w-lg mx-auto mt-4">
            Built for solo contractors and small crews —
            not enterprises with office managers.
          </p>
        </div>

        {/* ── MOBILE: Horizontal scroll pills + screenshot below ── */}
        <div className="lg:hidden">
          {/* Scrollable pill tabs */}
          <div
            className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-5 px-5"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {FEATURES.map((f, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex items-center gap-2.5 shrink-0 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? '#0a1628' : '#ffffff',
                    border: isActive ? '1px solid #0a1628' : '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ color: isActive ? '#34d399' : '#94a3b8' }}>
                    {f.icon}
                  </div>
                  <span
                    className="text-[13px] font-bold whitespace-nowrap"
                    style={{ color: isActive ? '#ffffff' : '#475569' }}
                  >
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Screenshot */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
              minHeight: '250px',
              aspectRatio: '4/3',
            }}
          >
            {current.screenshot ? (
              <img
                src={current.screenshot}
                alt={current.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#0a1628', color: '#34d399' }}
                >
                  {current.icon}
                </div>
                <p className="text-base font-black text-slate-900 mb-2">
                  {current.name}
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.15em] font-bold mt-4">
                  Screenshot coming soon
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP: Vertical tabs left, screenshot right ── */}
        <div className="hidden lg:grid lg:grid-cols-[auto_1fr] gap-16 items-start">

          {/* Feature list */}
          <div className="flex flex-col">
            {FEATURES.map((f, i) => {
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex items-center gap-5 text-left transition-all duration-200"
                  style={{
                    padding: '18px 24px',
                    borderRadius: '16px',
                    background: isActive ? '#0a1628' : 'transparent',
                    marginBottom: '4px',
                  }}
                >
                  <div
                    className="shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? '#34d399' : '#94a3b8' }}
                  >
                    {f.icon}
                  </div>
                  <span
                    className="transition-colors duration-200"
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: isActive ? '#ffffff' : '#1e293b',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Screenshot */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
              minHeight: '420px',
            }}
          >
            {current.screenshot ? (
              <img
                src={current.screenshot}
                alt={current.name}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center" style={{ minHeight: '420px' }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: '#0a1628', color: '#34d399' }}
                >
                  {current.icon}
                </div>
                <p
                  className="text-xl font-black text-slate-900 mb-3"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  {current.name}
                </p>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Add a screenshot to bring this to life
                </p>
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.15em] font-bold mt-8">
                  Screenshot coming soon
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}