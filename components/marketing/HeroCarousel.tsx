'use client';

import { useEffect, useRef, useState } from 'react';
import { QrCode, Check, Camera, Clock, DollarSign } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   HERO CAROUSEL — V2 (FieldPulse style)
   ─────────────────────────────────────────────────────────
   • Big rounded images — real photos or placeholders
   • Small floating UI overlays on top (badges, mini cards)
   • No text blocks below — images tell the story
   • Auto-scrolls, swipeable on mobile, dots navigation
   
   IMAGE SETUP:
   Drop your images in /public/images/ and update imageSrc.
   Ideal size: 600x600 or 600x700, .webp format.
   Mix of: real contractor photos + product screenshots.
   ───────────────────────────────────────────────────────── */

interface CarouselSlide {
  imageSrc?: string;
  placeholderGradient: string;
  overlays: React.ReactNode;
}

/* ── FLOATING UI OVERLAY COMPONENTS ── */

function Badge({ text, color = 'emerald' }: { text: string; color?: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/90 text-white',
    blue: 'bg-blue-500/90 text-white',
    amber: 'bg-amber-400/90 text-black',
    white: 'bg-white/90 text-slate-800',
    violet: 'bg-violet-500/90 text-white',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide shadow-lg ${colors[color] || colors.white}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {text}
    </span>
  );
}

function MiniCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-2xl"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </div>
  );
}

/* ── SLIDE DATA ── */

const SLIDES: CarouselSlide[] = [
  {
    // Slide 1: QR code scanning — contractor truck / yard sign
    imageSrc: '/images/qr-scan-2.webp',
    placeholderGradient: 'from-emerald-900/40 to-teal-900/60',
    overlays: (
      <>
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge text="QR Scanned" color="emerald" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <MiniCard>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <QrCode size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-800">New Lead Received</p>
                <p className="text-[10px] text-slate-400">via QR Code · Just now</p>
              </div>
            </div>
          </MiniCard>
        </div>
      </>
    ),
  },
  {
    // Slide 2: Photo/video upload — damage photo
    imageSrc: '/images/fence-damage.webp',
    placeholderGradient: 'from-sky-900/40 to-blue-900/60',
    overlays: (
      <>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge text="Photo Received" color="blue" />
        </div>
        <div className="absolute bottom-4 right-4">
          <MiniCard>
            <div className="flex items-center gap-2">
              <Camera size={14} className="text-sky-500" />
              <p className="text-[11px] font-bold text-slate-700">1 photo attached</p>
            </div>
          </MiniCard>
        </div>
      </>
    ),
  },
  {
    // Slide 3: Quote sent — show accept/decline overlay
    imageSrc: '/images/quote-send-tablet.webp',
    placeholderGradient: 'from-amber-900/40 to-orange-900/60',
    overlays: (
      <>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge text="Quote Sent" color="white" />
          <Badge text="Accepted" color="emerald" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <MiniCard>
            <p className="text-[12px] font-bold text-slate-800">Roof Replacement</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Sent Apr 18 · $7,950</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={10} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Customer Accepted</span>
            </div>
          </MiniCard>
        </div>
      </>
    ),
  },
  {
    // Slide 4: Daily digest — morning routine
    imageSrc: '/images/og-image.webp',
    placeholderGradient: 'from-violet-900/40 to-purple-900/60',
    overlays: (
      <>
        <div className="absolute top-4 right-4">
          <Badge text="6:00 AM" color="violet" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <MiniCard>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Clock size={16} className="text-violet-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-800">Daily Digest</p>
                <p className="text-[10px] text-slate-400">3 jobs today · $12,400 pending</p>
              </div>
            </div>
          </MiniCard>
        </div>
      </>
    ),
  },
  {
    // Slide 5: Get paid — payment tracking
    imageSrc: '/images/settings-view.webp',
    placeholderGradient: 'from-rose-900/40 to-pink-900/60',
    overlays: (
      <>
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge text="Payment Reminder Sent" color="white" />
        </div>
        <div className="absolute bottom-4 right-4">
          <MiniCard>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-800">$7,950.00</p>
                <p className="text-[10px] text-slate-400">Marked Paid · Just now</p>
              </div>
            </div>
          </MiniCard>
        </div>
      </>
    ),
  },
];

export default function HeroCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardEl = container.firstElementChild as HTMLElement | null;
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth + 16;
      const nextIndex = (activeIndex + 1) % SLIDES.length;

      if (nextIndex === 0) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollTo({ left: cardWidth * nextIndex, behavior: 'smooth' });
      }
      setActiveIndex(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [paused, activeIndex]);

  // Track scroll position
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardEl = container.firstElementChild as HTMLElement | null;
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth + 16;
      const index = Math.round(container.scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, SLIDES.length - 1));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardEl = container.firstElementChild as HTMLElement | null;
    if (!cardEl) return;
    const cardWidth = cardEl.offsetWidth + 16;
    container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
    setActiveIndex(index);
  };

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 5000)}
    >
      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-5 sm:px-8 lg:px-12 pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="snap-center shrink-0 group cursor-pointer"
            style={{ width: 'min(320px, 80vw)' }}
            onClick={() => scrollToIndex(i)}
          >
            <div
              className="relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px]"
              style={{
                aspectRatio: '4/5',
                boxShadow: activeIndex === i
                  ? '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)'
                  : '0 8px 24px rgba(0,0,0,0.3)',
                transform: activeIndex === i ? 'scale(1)' : 'scale(0.97)',
                opacity: activeIndex === i ? 1 : 0.7,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Image or gradient placeholder */}
              {slide.imageSrc ? (
                <img
                  src={slide.imageSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${slide.placeholderGradient}`} />
              )}

              {/* Dark overlay for contrast with UI elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/20" />

              {/* Floating UI overlays */}
              <div className="absolute inset-0">
                {slide.overlays}
              </div>
            </div>
          </div>
        ))}

        {/* End spacer for mobile scroll */}
        <div className="shrink-0 w-4 sm:w-8" aria-hidden />
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className="transition-all duration-300"
            style={{
              width: activeIndex === i ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: activeIndex === i ? '#34d399' : 'rgba(255,255,255,0.15)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}