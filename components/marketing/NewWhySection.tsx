'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   WHY LEAD2PROJECT
   ─────────────────────────────────────────────────────────
   FieldPulse "So, Why FieldPulse?" layout:
   • Big centered headline + subtitle
   • Alternating left-text/right-image blocks
   • Dashed line connector between blocks
   • Light background, dark text, no purple
   
   IMAGES:
   Save to /public/images/ and update imageSrc values.
   Ideal: ~700x500px .webp, mix of real photos + product UI overlays
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
    desc: 'Every lead lands on your board with photos and details. Schedule the job, send a quote, track payment — all from one screen. No spreadsheets, no texting quotes from your personal number.',
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
    desc: 'Your competitor is still texting quotes at 9 PM. You send branded emails in one click, get a 6AM daily digest, and your outbox tracks every message automatically.',
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
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20 sm:py-28">

        {/* ── BIG HEADLINE ── */}
        <div className="text-center mb-16 sm:mb-24">
          <h2
            className="font-black text-slate-900 leading-[1.08] tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.5rem)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            So, Why Lead2Project?
          </h2>
          <p className="text-base sm:text-lg text-slate-500 font-medium mt-4">
            Built to adapt. Simple to run. You own everything.
          </p>
        </div>

        {/* ── STORY BLOCKS ── */}
        <div className="flex flex-col gap-16 sm:gap-24">
          {BLOCKS.map((block, i) => (
            <div key={i}>
              {/* Dashed connector line (not on first block) */}
              {i > 0 && (
                <div className="flex justify-center mb-12 sm:mb-16">
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

              {/* Content block */}
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  block.reverse ? 'lg:direction-rtl' : ''
                }`}
                style={{
                  direction: 'ltr',
                }}
              >
                {/* Text side */}
                <div className={block.reverse ? 'lg:order-2' : 'lg:order-1'}>
                  {/* Badge */}
                  <div
                    className="inline-flex items-center px-5 py-2 rounded-full mb-6"
                    style={{ background: '#dde5f0', border: '1px solid #c8d3e3' }}
                  >
                    <span
                      className="text-xs font-bold text-slate-800 tracking-wide"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      {block.badge}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3
                    className="font-black text-slate-900 leading-[1.12] tracking-tight mb-5"
                    style={{
                      fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}
                  >
                    {block.headline}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-slate-600 leading-relaxed mb-6">
                    {block.desc}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-3 mb-8">
                    {block.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Image side */}
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