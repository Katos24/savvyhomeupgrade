'use client';

import { useEffect, useRef, useState } from 'react';
import { QrCode, Check, Camera, Clock } from 'lucide-react';

interface CarouselSlide {
  imageSrc?: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}

const SLIDES: CarouselSlide[] = [
  {
    imageSrc: '/images/morning-brief.webp',
    badge: 'MORNING BRIEF',
    title: 'Daily Digest',
    subtitle: '3 Jobs Scheduled',
    icon: <Clock size={16} />,
    accent: 'bg-slate-900',
  },
  {
    imageSrc: '/images/qr-scan-2.webp',
    badge: 'NEW SCAN',
    title: 'Lead Received',
    subtitle: 'via Truck QR • Just now',
    icon: <QrCode size={16} />,
    accent: 'bg-emerald-500',
  },
  {
    imageSrc: '/images/fence-damage.webp',
    badge: 'SITE SURVEY',
    title: 'Media Uploaded',
    subtitle: '2 Photos • Job #4421',
    icon: <Camera size={16} />,
    accent: 'bg-yellow-400',
  },
  {
    imageSrc: '/images/quote-send-tablet.webp',
    badge: 'CONVERSION',
    title: 'Quote Accepted',
    subtitle: '$7,950 • Roof Repair',
    icon: <Check size={16} />,
    accent: 'bg-emerald-500',
  },
  {
    imageSrc: '/images/roof-onsite.webp',
    badge: 'ON SITE',
    title: 'Job In Progress',
    subtitle: 'Roof Repair • Mike T.',
    icon: <Camera size={16} />,
    accent: 'bg-yellow-400',
  },
  {
    imageSrc: '/images/get-paid.webp',
    badge: 'CLOSED',
    title: 'Payment Received',
    subtitle: '$7,950 • Complete',
    icon: <Check size={16} />,
    accent: 'bg-emerald-500',
  },
];

export default function IndustrialScrollCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Drag state refs (not state — avoids re-renders during drag)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged = useRef(false);

  // ── Slow continuous auto-scroll ──
  useEffect(() => {
    if (paused) return;
    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.5;
    let animId: number;

    const step = () => {
      container.scrollLeft += speed;
     if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
        setPaused(true);
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [paused]);

  // ── Track active card index on scroll ──
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardEl = container.firstElementChild as HTMLElement;
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth + 16;
      const index = Math.round(container.scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, SLIDES.length - 1));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Desktop: click and drag ──
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX;
    scrollStart.current = scrollRef.current?.scrollLeft || 0;
    setPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const diff = e.pageX - startX.current;
    if (Math.abs(diff) > 5) hasDragged.current = true;
    scrollRef.current.scrollLeft = scrollStart.current - diff;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setTimeout(() => setPaused(false), 3000);
  };

  // ── Mobile: touch pause + resume ──
  const handleTouchStart = () => {
    setPaused(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setPaused(false), 3000);
  };

  return (
    <div className="w-full py-6 sm:py-8">
      {/* Scrollable Track */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-24 pb-6 sm:pb-10 cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); isDragging.current = false; }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{ width: 'min(280px, 72vw)' }}
            onClick={() => {
              if (hasDragged.current) return;
              const container = scrollRef.current;
              if (!container) return;
              const cardEl = container.firstElementChild as HTMLElement;
              if (!cardEl) return;
              const cardWidth = cardEl.offsetWidth + 16;
              container.scrollTo({ left: cardWidth * i, behavior: 'smooth' });
              setActiveIndex(i);
            }}
          >
            <div
              className={`relative overflow-hidden border-[3px] sm:border-[4px] border-slate-950 transition-all duration-500 bg-white
                ${activeIndex === i
                  ? 'shadow-[8px_8px_0px_#10b981] sm:shadow-[12px_12px_0px_#10b981] scale-100'
                  : 'shadow-[4px_4px_0px_#1e3a8a] sm:shadow-[6px_6px_0px_#1e3a8a] scale-[0.96] opacity-50'
                }
              `}
              style={{ aspectRatio: '4/5' }}
            >
              {/* Image */}
              {slide.imageSrc ? (
                <img
                  src={slide.imageSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 bg-slate-200" />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />

              {/* Content overlays */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between pointer-events-none">
                {/* Top badge */}
                <div className="self-start">
                  <div className="bg-yellow-400 text-slate-950 px-2.5 sm:px-3 py-1 font-[1000] text-[9px] sm:text-[10px] tracking-widest italic border-2 border-slate-950 shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
                    {slide.badge}
                  </div>
                </div>

                {/* Bottom info card */}
                <div className="bg-white border-2 border-slate-950 p-2.5 sm:p-3 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center text-white border-2 border-slate-950 ${slide.accent}`}>
                      {slide.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-[1000] text-slate-950 text-[12px] sm:text-[13px] leading-tight uppercase tracking-tighter truncate">
                        {slide.title}
                      </h4>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase truncate">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* End spacer so last card isn't cut off */}
        <div className="shrink-0 w-4 sm:w-24" aria-hidden />
      </div>
    </div>
  );
}