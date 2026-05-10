'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, Camera, Clock, Calendar, DollarSign } from 'lucide-react';

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
    badge: 'Morning Brief',
    title: 'Daily Digest',
    subtitle: '3 Jobs Scheduled Today',
    icon: <Clock size={20} />,
    accent: 'bg-blue-500',
  },

  {
    imageSrc: '/images/fence-damage.webp',
    badge: 'Site Photo',
    title: 'Photos Uploaded',
    subtitle: '2 Photos • Job #4421',
    icon: <Camera size={20} />,
    accent: 'bg-yellow-500',
  },
  {
    imageSrc: '/images/quote-send-tablet.webp',
    badge: 'Conversion',
    title: 'Quote Accepted',
    subtitle: '$7,950 • Roof Repair',
    icon: <Check size={20} />,
    accent: 'bg-purple-500',
  },
  {
    imageSrc: '/images/roof-onsite.webp',
    badge: 'In Progress',
    title: 'Crew On Site',
    subtitle: 'Main St. • Crew Alpha',
    icon: <Calendar size={20} />,
    accent: 'bg-orange-500',
  },
  {
    imageSrc: '/images/get-paid.webp',
    badge: 'Payment',
    title: 'Marked As Paid',
    subtitle: '$7,950 • Complete',
    icon: <DollarSign size={20} />,
    accent: 'bg-emerald-500',
  },
];

export default function HeroCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  // Auto-scroll
  useEffect(() => {
    if (paused) return;
    const container = scrollRef.current;
    if (!container) return;

    const speed = 0.5;
    let animId: number;

    const step = () => {
      if (!paused && container) {
        container.scrollLeft += speed;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 5) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [paused]);

  // Track active card
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cardEl = container.firstElementChild as HTMLElement;
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth + 24;
      const index = Math.round(container.scrollLeft / cardWidth);
      setActiveIndex(index % SLIDES.length);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCard = (index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardEl = container.firstElementChild as HTMLElement;
    if (!cardEl) return;
    const cardWidth = cardEl.offsetWidth + 24;
    container.scrollTo({ left: cardWidth * index, behavior: 'smooth' });
  };

  return (
    <div className="w-full py-8 sm:py-12 relative overflow-hidden">
      {/* Subtle glowing orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-10" />

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-6 sm:px-[35vw] py-12 cursor-grab active:cursor-grabbing select-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          isDragging.current = false;
        }}
        onMouseDown={(e) => {
          isDragging.current = true;
          startX.current = e.pageX;
          scrollLeftStart.current = scrollRef.current?.scrollLeft || 0;
        }}
        onMouseMove={(e) => {
          if (!isDragging.current || !scrollRef.current) return;
          e.preventDefault();
          const diff = e.pageX - startX.current;
          scrollRef.current.scrollLeft = scrollLeftStart.current - diff;
        }}
        onMouseUp={() => (isDragging.current = false)}
      >
        {SLIDES.map((slide, i) => (
          <motion.div
            key={i}
            onClick={() => scrollToCard(i)}
            whileHover={{ scale: activeIndex === i ? 1.08 : 0.95 }}
            className="shrink-0 snap-center transition-all duration-500"
            style={{ width: 'min(320px, 75vw)' }}
          >
            <div
              className={`relative overflow-hidden rounded-3xl transition-all duration-700 border-4 cursor-pointer
                ${activeIndex === i
                  ? 'scale-105 shadow-2xl border-white opacity-100 grayscale-0'
                  : 'scale-90 opacity-40 grayscale border-slate-700'
                }
              `}
              style={{ aspectRatio: '4/5' }}
            >
              {/* Image */}
              {slide.imageSrc && (
                <>
                  <img
                    src={slide.imageSrc}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                </>
              )}

              {/* Content overlays */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between">
                {/* Top badge */}
                <div className="self-start">
                  <div 
                    className="bg-white/90 backdrop-blur-sm text-slate-900 px-4 py-2 font-black text-xs rounded-full shadow-lg"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {slide.badge}
                  </div>
                </div>

                {/* Bottom card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-slate-900">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 shrink-0 flex items-center justify-center text-white rounded-xl shadow-lg ${slide.accent}`}>
                      {slide.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 
                        className="font-black text-slate-900 text-base leading-tight mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {slide.title}
                      </h4>
                      <p className="text-xs font-bold text-slate-500">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {/* End spacer */}
        <div className="shrink-0 w-[10vw] sm:w-[35vw]" aria-hidden />
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {SLIDES.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => scrollToCard(i)}
            whileHover={{ scale: 1.2 }}
            className={`h-2 rounded-full transition-all duration-500 ${
              activeIndex === i ? 'bg-emerald-400 w-12' : 'bg-slate-600 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}