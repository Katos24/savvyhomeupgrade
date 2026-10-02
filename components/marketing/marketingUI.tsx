'use client';

import type { ReactNode } from 'react';
import { Hammer, Wrench, HardHat, Ruler, PaintRoller, Zap, Droplets, Thermometer } from 'lucide-react';

/** A strip of measuring tape — use between sections. */
export function TapeDivider() {
  return (
    <div className="relative h-7 w-full overflow-hidden bg-[#FFC72C] border-y-2 border-[#1C1F23]" aria-hidden>
      {/* minor ticks every 8px */}
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1C1F23 0 1px, transparent 1px 8px)' }}
      />
      {/* major ticks every 64px */}
      <div
        className="absolute inset-x-0 top-0 h-4"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, #1C1F23 0 2px, transparent 2px 64px)' }}
      />
      {/* inch numbers */}
      <div className="absolute inset-x-0 bottom-0.5 flex font-[family-name:var(--font-display)] text-[10px] font-bold text-[#1C1F23]">
        {Array.from({ length: 60 }).map((_, i) => (
          <span key={i} className="shrink-0 w-16 pl-1">
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A rubber stamp, e.g. "PAID" or "DEPOSIT PAID". Position it absolutely inside a relative parent. */
export function Stamp({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none rounded-md border-[3px] border-[#C0392B] px-3 py-1 font-[family-name:var(--font-display)] font-extrabold uppercase tracking-widest text-[#C0392B] opacity-80 ${className}`}
      style={{ transform: 'rotate(-12deg)', mixBlendMode: 'multiply' }}
      aria-hidden
    >
      {label}
    </div>
  );
}

const TRADES = [
  { icon: HardHat, label: 'Roofers' },
  { icon: Droplets, label: 'Plumbers' },
  { icon: Zap, label: 'Electricians' },
  { icon: Thermometer, label: 'HVAC' },
  { icon: PaintRoller, label: 'Painters' },
  { icon: Hammer, label: 'Remodelers' },
  { icon: Wrench, label: 'Handymen' },
  { icon: Ruler, label: 'Carpenters' },
];

/** "Built for the trades" band. */
export function TradesStrip() {
  return (
    <div className="bg-[#1C1F23] text-white py-4 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
        <span className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.18em] text-[#FFC72C]">
          Built for
        </span>
        {TRADES.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wider text-slate-200"
          >
            <Icon className="h-4 w-4 text-[#FFC72C]" strokeWidth={2.25} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Yellow "label tape" eyebrow above section headings. */
export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em] ${
        dark ? 'bg-[#FFC72C] text-[#1C1F23]' : 'bg-[#1C1F23] text-[#FFC72C]'
      }`}
    >
      {children}
    </span>
  );
}