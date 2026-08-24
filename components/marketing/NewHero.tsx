'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Fraunces, Work_Sans, IBM_Plex_Mono, Caveat } from 'next/font/google';

// Font loading lives here for a self-contained drop-in. If Hero is the only
// place these fonts are used, this is fine as-is. If other pages will reuse
// Fraunces / Work Sans, move these four calls to app/layout.tsx instead and
// just keep the CSS variable names below in sync.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-fraunces',
});
const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-work',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});
const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-caveat',
});

// Palette (not in the Tailwind theme — arbitrary values throughout):
// paper #F5EFE1 · paper-deep #ECE1C8 · card #FBF7EC
// ink #262019 · ink-soft #6B6152 · ink-faint #A79A83
// amber #DE9138 · amber-deep #B5701F · rust #A8432A · line #DDD0B4

const TRADES = [
  { name: 'Roofing', caption: 'Roofing, sunrise', src: '/images/roofing.webp', rotate: -5 },
  { name: 'HVAC', caption: 'HVAC, attic install', src: '/images/hvac.webp', rotate: 3 },
  { name: 'Plumbing', caption: 'Plumbing, rough-in', src: '/images/plumbing.webp', rotate: -2 },
  { name: 'Electrical', caption: 'Electrical, panel swap', src: '/images/electrical.webp', rotate: 4 },
  { name: 'Solar', caption: 'Solar, rooftop mount', src: '/images/solar.webp', rotate: -4 },
];

const FEATURES = [
  { title: 'See every job at a glance', desc: 'Your whole week, roofs to rough-ins, on one board.' },
  { title: 'Put jobs on the calendar', desc: 'Drag a job onto the schedule and the crew gets a text.' },
  { title: 'Send quotes from the truck', desc: 'Type a price, tap send, get approved before you leave the driveway.' },
  { title: 'Turn happy customers into reviews', desc: 'A five-star job gets a five-star review request, automatically.' },
];

type CardLine = { label: string; value: string; strong?: boolean };
type CardStage = {
  step: string;
  label: string;
  job: string;
  meta: string;
  lines: CardLine[];
  tag: string;
  tagStyle: 'neutral' | 'amber' | 'stamp';
};

const CARD_STAGES: CardStage[] = [
  {
    step: '01',
    label: 'QUOTE SENT',
    job: 'Roofing — Reroof',
    meta: 'Built from the "Standard reroof" template, edited in under a minute',
    lines: [{ label: 'Total', value: '$4,280.00', strong: true }],
    tag: 'Awaiting approval',
    tagStyle: 'neutral',
  },
  {
    step: '02',
    label: 'DEPOSIT REQUESTED',
    job: 'Roofing — Reroof',
    meta: '30% down, balance due on completion',
    lines: [
      { label: 'Deposit due', value: '$1,284.00' },
      { label: 'Balance due', value: '$2,996.00' },
    ],
    tag: 'Sent via Stripe',
    tagStyle: 'neutral',
  },
  {
    step: '03',
    label: 'DEPOSIT PAID',
    job: 'Roofing — Reroof',
    meta: 'Stripe confirmed the charge automatically',
    lines: [
      { label: 'Deposit received', value: '$1,284.00', strong: true },
      { label: 'Balance queued', value: '$2,996.00' },
    ],
    tag: 'Balance ready to send',
    tagStyle: 'amber',
  },
  {
    step: '04',
    label: 'PAID IN FULL',
    job: 'Roofing — Reroof',
    meta: 'Balance collected the moment the job wrapped',
    lines: [{ label: 'Total collected', value: '$4,280.00', strong: true }],
    tag: 'PAID',
    tagStyle: 'stamp',
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userScrolled, setUserScrolled] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TRADES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userScrolled) return;
    const strip = stripRef.current;
    const card = strip?.children[activeIndex] as HTMLElement | undefined;
    if (!strip || !card) return;

    strip.scrollTo({
      left: card.offsetLeft - strip.offsetLeft - 24,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [activeIndex, userScrolled]);

  return (
    <section
      className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} ${caveat.variable} relative overflow-hidden bg-[#F5EFE1] pt-28 pb-20 sm:pt-36 sm:pb-28 px-6 sm:px-12 font-[family-name:var(--font-work)]`}
    >
      <div className="max-w-6xl mx-auto">
        {/* ── HERO: copy + work order ticket ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20 sm:mb-28">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2.5 mb-6 font-[family-name:var(--font-mono)] text-[12.5px] tracking-[0.12em] font-semibold text-[#B5701F]"
            >
              <span className="w-[7px] h-[7px] rounded-full bg-[#A8432A] shrink-0" />
              TICKET N&deg;10482 &middot; STATUS: BOOKED
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="font-[family-name:var(--font-fraunces)] font-medium text-[34px] sm:text-5xl lg:text-[58px] leading-[1.08] tracking-tight text-[#262019] mb-6"
            >
              Book the job. Send the quote.
              <br />
              Get paid before you&rsquo;ve{' '}
              <span className="bg-[linear-gradient(transparent_62%,rgba(222,145,56,0.45)_62%)]">
                packed up the truck.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="text-lg text-[#6B6152] leading-relaxed max-w-lg mb-8"
            >
              The scheduling, quoting, and invoicing tool that runs from your phone
              &mdash; so the paperwork doesn&rsquo;t wait until you&rsquo;re home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#DE9138] text-[#262019] font-bold text-[15.5px] px-6 py-3.5 rounded-[10px] border-[1.5px] border-[#262019] shadow-[4px_4px_0_0_#A8432A] hover:shadow-[2px_2px_0_0_#A8432A] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-150 flex items-center justify-center gap-2">
                  Start free &mdash; no card needed
                  <ArrowRight size={17} />
                </button>
              </Link>

              <Link href="/demo" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto text-[#262019] font-semibold text-[15.5px] px-6 py-3.5 rounded-[10px] border-[1.5px] border-dashed border-[#A79A83] hover:border-[#262019] hover:bg-[#262019]/[0.03] transition-colors flex items-center justify-center gap-2">
                  See a real work order
                </button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-[13.5px] font-medium text-[#A79A83]"
            >
              Free for solo crews. Set up before your coffee&rsquo;s done.
            </motion.p>
          </div>

          {/* Work order ticket — signature element */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <motion.div
              initial={{ opacity: 0, rotate: -11, y: 16 }}
              animate={{ opacity: 1, rotate: -4, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.9, 0.3, 1.2] }}
              className="relative w-full max-w-[340px] bg-[#FBF7EC] border border-[#DDD0B4] rounded-[4px] p-6 pb-5 shadow-[6px_6px_0_rgba(38,32,25,0.08)]"
            >
              <div
                className="absolute -left-[7px] top-0 bottom-0 w-3.5"
                style={{
                  backgroundImage: 'radial-gradient(circle, #F5EFE1 4.5px, transparent 4.6px)',
                  backgroundSize: '14px 20px',
                  backgroundRepeat: 'repeat-y',
                }}
              />

              <div className="flex justify-between items-start border-b border-dashed border-[#DDD0B4] pb-3.5 mb-3.5">
                <div>
                  <div className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.1em] font-semibold text-[#A79A83]">
                    WORK ORDER
                  </div>
                  <div className="font-[family-name:var(--font-mono)] text-[15px] font-semibold text-[#262019] mt-1">
                    #10482
                  </div>
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.08em] text-[#A8432A] border-2 border-[#A8432A] rounded-md px-2.5 py-1 rotate-[9deg] opacity-85">
                  PAID
                </div>
              </div>

              <div className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-[#262019] mb-0.5">
                Roofing
              </div>
              <div className="text-[13px] text-[#6B6152] mb-4">
                Shingle replacement &middot; 2,400 sq ft
              </div>

              <div className="font-[family-name:var(--font-mono)] text-[12.5px] text-[#6B6152] space-y-1">
                <div className="flex justify-between py-0.5">
                  <span>Labor</span>
                  <span>$2,400.00</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Materials</span>
                  <span>$1,880.00</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#262019] border-t border-dashed border-[#DDD0B4] mt-1.5 pt-2.5">
                  <span>Total</span>
                  <span>$4,280.00</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-[#DDD0B4] text-[11.5px] text-[#A79A83]">
                Quoted 7:42am &middot; Approved in 12 min
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── PHOTO STRIP: pinned job-site polaroids ── */}
        <div className="mb-20 sm:mb-24">
          <div className="flex items-center justify-between gap-4 mb-5">
            <p className="font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.12em] text-[#A79A83]">
              ON THE JOB &mdash; EVERY TRADE
            </p>
            <div className="flex items-center gap-2">
              {TRADES.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setUserScrolled(false);
                    setActiveIndex(i);
                  }}
                  aria-label={`Show ${t.name}`}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex ? 'w-6 bg-[#DE9138]' : 'w-2 bg-[#DDD0B4]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div
            ref={stripRef}
            onTouchStart={() => setUserScrolled(true)}
            onWheel={() => setUserScrolled(true)}
            className="-mx-6 sm:-mx-12 px-6 sm:px-12 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none' }}
          >
            {TRADES.map((trade, i) => {
              const isActive = i === activeIndex && !userScrolled;
              return (
                <div
                  key={trade.name}
                  className="shrink-0 snap-start bg-white p-[9px] pb-[30px] rounded-[2px] shadow-[5px_5px_0_rgba(38,32,25,0.07)] transition-transform duration-300 hover:!rotate-0"
                  style={{ transform: `rotate(${isActive ? trade.rotate / 2 : trade.rotate}deg)` }}
                >
                  <div className="relative w-[140px] h-[128px] sm:w-[168px] sm:h-[150px] overflow-hidden">
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-[52px] h-5 -rotate-3 z-10"
                      style={{ background: 'rgba(222,145,56,0.55)' }}
                    />
                    <img
                      src={trade.src}
                      alt={`${trade.name} crew at work`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-[family-name:var(--font-caveat)] text-lg font-semibold text-[#6B6152] text-center mt-2.5">
                    {trade.caption}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DIFFERENTIATOR: quote → deposit → balance → paid, one card ── */}
        <div className="mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="max-w-xl mb-10"
          >
            <p className="font-[family-name:var(--font-mono)] text-xs font-semibold tracking-[0.12em] text-[#A79A83] mb-4">
              ONE CARD, START TO FINISH
            </p>
            <h2 className="font-[family-name:var(--font-fraunces)] font-medium text-[26px] sm:text-[34px] leading-[1.15] text-[#262019] mb-3">
              The card doesn&rsquo;t change. It just gets closer to paid.
            </h2>
            <p className="text-[#6B6152] text-[15.5px] leading-relaxed">
              Every job lives on one card &mdash; quote to deposit to final invoice
              &mdash; updating itself as Stripe confirms each payment.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
            {CARD_STAGES.flatMap((stage, i) => {
              const card = (
                <motion.div
                  key={`card-${stage.step}`}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex-1 bg-[#FBF7EC] border border-[#DDD0B4] rounded-[4px] p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-[family-name:var(--font-mono)] text-[11px] font-semibold text-[#A8432A]">
                      {stage.step}
                    </span>
                    <span className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.08em] font-semibold text-[#A79A83]">
                      {stage.label}
                    </span>
                  </div>

                  <div className="font-[family-name:var(--font-fraunces)] text-[15px] font-medium text-[#262019] mb-0.5">
                    {stage.job}
                  </div>
                  <div className="text-[12px] text-[#6B6152] mb-4 leading-snug">
                    {stage.meta}
                  </div>

                  <div className="font-[family-name:var(--font-mono)] text-[12px] text-[#6B6152] mb-4">
                    {stage.lines.map((line) => (
                      <div
                        key={line.label}
                        className={`flex justify-between py-0.5 ${
                          line.strong
                            ? 'text-[#262019] font-semibold border-t border-dashed border-[#DDD0B4] mt-1 pt-2'
                            : ''
                        }`}
                      >
                        <span>{line.label}</span>
                        <span>{line.value}</span>
                      </div>
                    ))}
                  </div>

                  {stage.tagStyle === 'stamp' ? (
                    <div className="inline-block font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-[0.08em] text-[#A8432A] border-2 border-[#A8432A] rounded-md px-2.5 py-1 -rotate-[4deg]">
                      {stage.tag}
                    </div>
                  ) : (
                    <div
                      className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        stage.tagStyle === 'amber'
                          ? 'bg-[#DE9138] text-[#262019]'
                          : 'bg-[#ECE1C8] text-[#6B6152]'
                      }`}
                    >
                      {stage.tag}
                    </div>
                  )}
                </motion.div>
              );

              if (i === CARD_STAGES.length - 1) return [card];

              const connector = (
                <div
                  key={`arrow-${stage.step}`}
                  className="hidden lg:flex items-center justify-center w-8 shrink-0"
                >
                  <ChevronRight size={18} className="text-[#A79A83]" />
                </div>
              );
              return [card, connector];
            })}
          </div>
        </div>

        {/* ── FEATURES: job-order checklist ── */}
        <div className="rounded-[22px] bg-[#ECE1C8] p-8 sm:p-12 lg:p-14">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="font-[family-name:var(--font-fraunces)] font-medium text-[28px] sm:text-4xl leading-[1.12] text-[#262019]">
                Everything the truck needs. None of the paperwork.
              </h2>
              <p className="text-[#6B6152] text-[15.5px] leading-relaxed max-w-sm">
                Run the whole job &mdash; booking to payment &mdash; from the cab,
                the roof, or the crawl space.
              </p>
            </div>

            <div className="lg:col-span-7 flex flex-col">
              {FEATURES.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`flex gap-4 py-4 ${
                    i !== FEATURES.length - 1 ? 'border-b border-dashed border-[#DDD0B4]' : ''
                  }`}
                >
                  <div className="w-[22px] h-[22px] rounded-[5px] border-[1.5px] border-[#262019] bg-[#DE9138] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={13} strokeWidth={3} className="text-[#262019]" />
                  </div>
                  <div>
                    <div className="font-bold text-[15.5px] text-[#262019] mb-0.5">
                      {feature.title}
                    </div>
                    <div className="text-sm text-[#6B6152] leading-relaxed">
                      {feature.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}