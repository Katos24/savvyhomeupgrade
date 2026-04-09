'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

export default function FinalCTA() {
  const { ref, visible } = useFadeIn();
  return (
    <section className="py-24 px-6 bg-[#0F1F3D] border-t border-white/[0.06] text-center">
      <div
        ref={ref}
        className="max-w-2xl mx-auto"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-5">
          One job pays for<br />
          <span style={{ color: '#4ade80' }}>the whole year.</span>
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed max-w-md mx-auto">
          Stop losing leads to disorganization. Get your QR code and dashboard live in 2 minutes.
        </p>
        <Link
          href="/signup"
          className="group inline-flex items-center gap-2.5 text-white px-10 py-4 rounded-2xl text-base font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
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