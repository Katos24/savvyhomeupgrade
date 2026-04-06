'use client';

// components/marketing/Hero.tsx

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section
      className="pt-32 pb-20 px-6"
      style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
              style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Built for contractors
            </div>

            <h1
              className="font-black leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(38px, 5.5vw, 64px)', color: '#0f172a' }}
            >
              Stop losing jobs<br />
              to a missed<br />
              <span style={{ color: '#1a6645' }}>text message.</span>
            </h1>

            <p
              className="text-lg font-medium leading-relaxed mb-8"
              style={{ color: '#4b5563', maxWidth: 460 }}
            >
              Lead2Project gives every contractor a branded booking link, a live dashboard, and the tools to quote, schedule, and get paid — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black text-base transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#1a6645', color: '#fff' }}
              >
                Start Free — No Card Needed
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base border transition-all hover:bg-gray-50"
                style={{ color: '#374151', borderColor: '#d1d5db' }}
              >
                See how it works
              </a>
            </div>

            <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
              14-day free trial · No credit card · Cancel anytime
            </p>
          </div>

          {/* RIGHT — dashboard in browser chrome */}
          <div className="relative">
            {/* Browser chrome */}
            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.06)',
            }}>
              {/* Chrome bar */}
              <div style={{ background: '#1a2234', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{ flex: 1, background: '#0d1520', borderRadius: 7, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 7, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><rect x="0.5" y="4.5" width="8" height="6" rx="1.5" fill="#4ade80"/><path d="M2.5 4.5V3a2 2 0 1 1 4 0v1.5" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#64748b' }}>
                    lead2project.com/<span style={{ color: '#818cf8', fontWeight: 800 }}>ridge-line-roofing</span>/dashboard
                  </span>
                </div>
              </div>
              {/* Screenshot */}
              <img
                src="/images/dashboard-screenshot-ridgeline.png"
                alt="Lead2Project dashboard"
                className="w-full h-auto block"
              />
            </div>

            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -left-4 px-4 py-3 rounded-2xl shadow-lg border"
              style={{ background: '#fff', borderColor: '#e5e7eb' }}
            >
              <p className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: '#16a34a' }}>New lead</p>
              <p className="text-sm font-bold" style={{ color: '#0f172a' }}>Torres Roofing — Roof Replace</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Just now via QR scan</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}