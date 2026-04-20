'use client';

/**
 * SectionDivider — sharp linear transitions between page sections.
 * Optimized for high-contrast agency layouts.
 */

type Variant =
  | 'dark-to-white'
  | 'white-to-dark'
  | 'white-to-slate'
  | 'slate-to-white'
  | 'slate-to-dark'
  | 'dark-to-dark';

interface Props {
  variant: Variant;
  /** Override the "dark" color. Default: #020617 */
  darkColor?: string;
  /** Override the "light" color. Default: #ffffff */
  lightColor?: string;
  /** Override the "slate" color. Default: #f8fafc */
  slateColor?: string;
  className?: string;
}

export default function SectionDivider({
  variant,
  darkColor = '#020617',
  lightColor = '#ffffff',
  slateColor = '#f8fafc',
  className = '',
}: Props) {

  // Logic to determine gradient flow
  const getColors = () => {
    switch (variant) {
      case 'white-to-slate': return { from: lightColor, to: slateColor };
      case 'slate-to-dark':  return { from: slateColor, to: darkColor };
      case 'dark-to-white':  return { from: darkColor, to: lightColor };
      case 'white-to-dark':  return { from: lightColor, to: darkColor };
      case 'slate-to-white': return { from: slateColor, to: lightColor };
      case 'dark-to-dark':   return { from: darkColor, to: darkColor };
      default: return { from: lightColor, to: darkColor };
    }
  };

  const { from, to } = getColors();

  return (
    <div
      className={`relative h-24 sm:h-32 overflow-hidden pointer-events-none ${className}`}
      style={{ background: `linear-gradient(to bottom, ${from} 0%, ${to} 100%)` }}
    >
      {/* 1. Emerald Bloom Seam (Only on dark transitions) */}
      {(variant.includes('dark')) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[800px] h-px bg-emerald-500/20 shadow-[0_0_50px_2px_rgba(16,185,129,0.3)] opacity-50"
          />
          <div
            className="absolute w-[600px] h-24 rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, #10b981, transparent 70%)' }}
          />
        </div>
      )}

      {/* 2. Technical Dot Mesh */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, ${variant.includes('white') ? '#000' : '#fff'} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
        }}
      />

      {/* 3. Subtle Bottom Shine (Dark variants only) */}
      {variant === 'white-to-dark' && (
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
}