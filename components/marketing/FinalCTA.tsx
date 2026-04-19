'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

export default function FinalCTA() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="relative py-24 px-6 text-center overflow-hidden" style={{ background: '#020617' }}>

      {/* Top accent */}
      <div className="absolute top-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(26,102,69,0.6), transparent)' }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, #1a6645, transparent 70%)' }} />
      </div>

      <div
        ref={ref}
        className="relative z-10 max-w-2xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease',
        }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-5">
          Stop bleeding leads.<br />
          <span className="text-emerald-400">One win pays for the year.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed max-w-md mx-auto">
          Your competitor down the street is still texting quotes from his
          personal number. You don't have to be.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2.5 text-white px-10 py-4 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: '#1a6645', boxShadow: '0 0 60px rgba(26,102,69,0.4)' }}
        >
          Start Free Trial
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="mt-5 text-[11px] text-slate-600 uppercase tracking-[0.2em] font-bold">
          14-day free trial · Cancel anytime · 2 min setup
        </p>
      </div>
    </section>
  );
}