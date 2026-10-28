'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BoardDemo,
  TemplateDemo,
  QuoteDemo,
  CardDemo,
  PaidDemo,
  BOARD_T,
  TEMPLATE_T,
  QUOTE_T,
  CARD_T,
  PAID_T,
} from '@/components/marketing/HowItWorksTour';

/* ─────────────────────────────────────────────────────────
   Ad recording page. The dashed box is the ad: 540 × 675 on
   screen, which records as 1080 × 1350 (Facebook/Instagram 4:5)
   on a Retina Mac. Everything outside the box is controls and
   isn't part of the ad.
   ───────────────────────────────────────────────────────── */

const D = 'font-[family-name:var(--font-display)]';
const sum = (a: number[]) => a.reduce((s, n) => s + n, 0);

type Scene = { headline: string; Demo: ComponentType; ms: number; kind: 'phone' | 'screen' };
type Variant = { key: string; label: string; eyebrow: string; scenes: Scene[] };

const VARIANTS: Variant[] = [
  {
    key: 'booking',
    label: 'Ad A · Board',
    eyebrow: 'For contractors',
    scenes: [{ headline: 'Stop losing estimate requests in your texts', Demo: BoardDemo, ms: sum(BOARD_T), kind: 'screen' }],
  },
  {
    key: 'paid',
    label: 'Ad B · Getting paid',
    eyebrow: 'Get paid for every job',
    scenes: [{ headline: 'Get the deposit up front. Then the balance.', Demo: PaidDemo, ms: sum(PAID_T), kind: 'screen' }],
  },
  {
    key: 'quote',
    label: 'Ad C · Quotes',
    eyebrow: 'Quote it. Win it.',
    scenes: [
      { headline: 'Quote from your truck, not the kitchen table', Demo: TemplateDemo, ms: sum(TEMPLATE_T), kind: 'screen' },
      { headline: 'They accept it online. No chasing.', Demo: QuoteDemo, ms: sum(QUOTE_T), kind: 'phone' },
    ],
  },
  {
    key: 'card',
    label: 'Ad D · One card',
    eyebrow: 'Everything in one place',
    scenes: [{ headline: 'Quote. Schedule. Deposit. Invoice. One card.', Demo: CardDemo, ms: sum(CARD_T), kind: 'screen' }],
  },
];

export default function AdStudio() {
  const [variantKey, setVariantKey] = useState(VARIANTS[0].key);
  const [scene, setScene] = useState(0);
  const [run, setRun] = useState(0); // bump to restart from the first scene

  const variant = VARIANTS.find((v) => v.key === variantKey) || VARIANTS[0];
  const current = variant.scenes[scene];

  // Each scene plays one full loop of its demo, then the next scene starts.
  useEffect(() => {
    const t = setTimeout(() => setScene((s) => (s + 1) % variant.scenes.length), current.ms + 400);
    return () => clearTimeout(t);
  }, [scene, current.ms, variant.scenes.length, run]);

  const restart = (key = variantKey) => {
    setVariantKey(key);
    setScene(0);
    setRun((r) => r + 1);
  };

  const totalSeconds = Math.round(sum(variant.scenes.map((s) => s.ms + 400)) / 1000);

  return (
    <div className="min-h-screen bg-slate-200 px-4 py-6">
      {/* Controls (not part of the ad) */}
      <div className="mx-auto mb-4 flex max-w-[540px] flex-wrap items-center gap-2">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => restart(v.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              v.key === variantKey ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {v.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => restart()}
          className="ml-auto rounded-full border border-slate-400 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Restart
        </button>
        <p className="w-full text-xs text-slate-600">
          Pick an ad, start your screen recording on the dashed box, then press Restart. One full play is about {totalSeconds} seconds.
        </p>
      </div>

      {/* The ad: 540 × 675 */}
      <div className="mx-auto w-fit outline-dashed outline-1 outline-offset-4 outline-slate-400">
        <div
          className="relative flex flex-col overflow-hidden bg-[#F4EFE6] text-[#1C1F23]"
          style={{
            width: 540,
            height: 675,
            backgroundImage:
              'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          {/* Brand row */}
          <div className="flex items-center justify-between px-7 pt-6">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lead2ProjectLogo.webp" alt="" className="h-7 w-auto object-contain" />
              <span className={`${D} text-xl font-extrabold uppercase tracking-wide`}>Lead2Project</span>
            </div>
            <span className={`${D} text-xs font-bold uppercase tracking-[0.18em] text-[#00828A]`}>{variant.eyebrow}</span>
          </div>

          {/* Headline (changes per scene) */}
          <div className="h-[100px] px-7 pt-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={`${run}-${variant.key}-${scene}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className={`${D} text-[40px] font-extrabold leading-[1] tracking-tight`}
              >
                {current.headline}
              </motion.h1>
            </AnimatePresence>
          </div>

          {/* Demo area */}
          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${run}-${variant.key}-${scene}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex justify-center"
              >
                <div
                  style={{
                    transform: `scale(${current.kind === 'phone' ? 0.76 : 0.98})`,
                    transformOrigin: 'top center',
                    width: current.kind === 'phone' ? 320 : 500,
                    paddingTop: current.kind === 'phone' ? 4 : 24,
                  }}
                >
                  <current.Demo />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between bg-[#1C1F23] px-7 py-4 text-white">
            <span className={`${D} text-lg font-bold uppercase tracking-wider`}>Free to start</span>
            <span className={`${D} text-lg font-bold tracking-wide text-[#5EC4C9]`}>lead2project.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}