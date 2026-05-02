'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   WHY LEAD2PROJECT — MOBILE OPTIMIZED
   ─────────────────────────────────────────────────────────
   Mobile: stacked vertically, no dashed lines, 
           smaller fonts, full-width images
   Desktop: alternating grid, dashed SVG connectors
   No purple anywhere.
   ───────────────────────────────────────────────────────── */

interface StoryBlock {
  badge: string;
  headline: string;
  desc: string;
  bullets: string[];
  imageSrc?: string;
  imageAlt: string;
  reverse?: boolean;
}

const BLOCKS: StoryBlock[] = [
  {
    badge: 'Lead Capture',
    headline: 'Your Truck Is Now a Lead Machine.',
    desc: 'Most yard signs get eyeballs but not calls. With a custom QR code and booking link, every truck, sign, and business card becomes a self-service intake form.',
    bullets: [
      'Custom branded QR code decals',
      'Photo & video uploads from customers',
      'Zero missed leads while on site',
    ],
    imageAlt: 'QR code scanning on contractor truck',
    imageSrc: '/images/qrbranded2.webp',
  },
  {
    badge: 'Job Management',
    headline: 'From First Scan to Final Payday.',
    desc: 'Every lead lands on your board with photos and details. Schedule the job, send a quote, track payment — all from one screen.',
    bullets: [
      'Visual pipeline board',
      'One-click quote emails with Accept/Decline',
      'Payment tracking and reminders',
    ],
    imageAlt: 'Lead2Project dashboard showing project management',
    imageSrc: '/images/og-image.webp',
    reverse: true,
  },
  {
    badge: 'Stay Professional',
    headline: 'Stop Chasing. Start Owning Your Time.',
    desc: 'Your competitor is still texting quotes at 9 PM. You send branded emails in one click and your outbox tracks every message automatically.',
    bullets: [
      'Branded email templates',
      '6AM daily digest',
      'Full email outbox tracking',
    ],
    imageAlt: 'Contractor relaxing while system handles leads',
    imageSrc: '/images/quote-send-tablet.webp',
  },
];

export default function NewWhySection() {
  return (
    <section style={{ background: '#eef2ff' }}>
      <div className="max-w-6xl mx-auto px-5 sm:px-10 py-16 sm:py-28">

        {/* Headline */}
        <div className="text-center mb-12 sm:mb-24">
          <h2
            className="font-black text-slate-900 leading-[1.08] tracking-tight"
            style={{
              fontSize: 'clamp(1.6rem, 5.5vw, 3.5rem)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            So, Why Lead2Project?
          </h2>
          <p className="text-sm sm:text-lg text-slate-500 font-medium mt-3 sm:mt-4">
            Built to adapt. Simple to run. You own everything.
          </p>
        </div>

        {/* Story blocks */}
        <div className="flex flex-col gap-12 sm:gap-20">
          {BLOCKS.map((block, i) => (
            <div key={i}>

              {/* Dashed connector — desktop only */}
              {i > 0 && (
                <div className="hidden sm:flex justify-center mb-12 sm:mb-16">
                  <svg
                    width="120"
                    height="80"
                    viewBox="0 0 120 80"
                    fill="none"
                    className="text-slate-300"
                  >
                    <path
                      d={
                        block.reverse
                          ? 'M60 0 C60 30, 100 30, 100 80'
                          : 'M60 0 C60 30, 20 30, 20 80'
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Text */}
                <div className={block.reverse ? 'lg:order-2' : 'lg:order-1'}>
                  <div
                    className="inline-flex items-center px-4 py-1.5 rounded-full mb-5"
                    style={{ background: '#dde5f0', border: '1px solid #c8d3e3' }}
                  >
                    <span
                      className="text-[11px] sm:text-xs font-bold text-slate-800 tracking-wide"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                      {block.badge}
                    </span>
                  </div>

                  <h3
                    className="font-black text-slate-900 leading-[1.15] tracking-tight mb-4"
                    style={{
                      fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {block.headline}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">
                    {block.desc}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {block.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-[13px] sm:text-sm font-semibold text-slate-700">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Image */}
                <div className={block.reverse ? 'lg:order-1' : 'lg:order-2'}>
                  <div
                    className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                      aspectRatio: '4/3',
                    }}
                  >
                    {block.imageSrc ? (
                      <img
                        src={block.imageSrc}
                        alt={block.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: '#dde5f0' }}
                      >
                        <p className="text-sm font-bold text-slate-400">
                          Image Coming Soon
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}