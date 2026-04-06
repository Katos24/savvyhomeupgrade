
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 10 — FINAL CTA
// Status: Ready.
// ─────────────────────────────────────────────────────────────────────────────

'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

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

export default FinalCTA;