'use client';

/**
 * SectionDivider — visual transitions between page sections.
 *
 * Variants:
 *   dark-to-white   — dark section above, white below (with subtle emerald bloom)
 *   white-to-dark   — white section above, dark below (with subtle emerald bloom)
 *   white-to-slate  — soft shift between two light sections (no hard line)
 *   slate-to-white  — reverse of above
 *   dark-to-dark    — two dark sections, glowing seam between them
 */

type Variant =
  | 'dark-to-white'
  | 'white-to-dark'
  | 'white-to-slate'
  | 'slate-to-white'
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

  // ── DARK → WHITE ──────────────────────────────────────────────
  if (variant === 'dark-to-white') {
    return (
      <div
        className={`relative h-24 sm:h-32 overflow-hidden pointer-events-none ${className}`}
        style={{ background: `linear-gradient(to bottom, ${darkColor} 0%, ${lightColor} 100%)` }}
      >
        {/* Emerald bloom at the seam */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[700px] h-24 rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse at center, #1a6645, transparent 70%)' }}
          />
        </div>
        {/* Dot fade at the bottom */}
        <div
          className="absolute bottom-0 inset-x-0 h-12 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(to bottom, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black)',
          }}
        />
      </div>
    );
  }

  // ── WHITE → DARK ──────────────────────────────────────────────
  if (variant === 'white-to-dark') {
    return (
      <div
        className={`relative h-24 sm:h-32 overflow-hidden pointer-events-none ${className}`}
        style={{ background: `linear-gradient(to bottom, ${lightColor} 0%, ${darkColor} 100%)` }}
      >
        {/* Dot fade at the top */}
        <div
          className="absolute top-0 inset-x-0 h-12 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #0f172a 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(to top, transparent, black)',
            WebkitMaskImage: 'linear-gradient(to top, transparent, black)',
          }}
        />
        {/* Emerald bloom at the seam */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[700px] h-24 rounded-full opacity-20"
            style={{ background: 'radial-gradient(ellipse at center, #1a6645, transparent 70%)' }}
          />
        </div>
      </div>
    );
  }

  // ── WHITE → SLATE (soft shift between two light sections) ──────
  if (variant === 'white-to-slate') {
    return (
      <div
        className={`relative h-16 sm:h-20 pointer-events-none ${className}`}
        style={{ background: `linear-gradient(to bottom, ${lightColor} 0%, ${slateColor} 100%)` }}
      />
    );
  }

  // ── SLATE → WHITE ─────────────────────────────────────────────
  if (variant === 'slate-to-white') {
    return (
      <div
        className={`relative h-16 sm:h-20 pointer-events-none ${className}`}
        style={{ background: `linear-gradient(to bottom, ${slateColor} 0%, ${lightColor} 100%)` }}
      />
    );
  }

  // ── DARK → DARK (glowing seam) ─────────────────────────────────
  if (variant === 'dark-to-dark') {
    return (
      <div
        className={`relative h-20 sm:h-24 overflow-hidden pointer-events-none ${className}`}
        style={{ background: darkColor }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[600px] h-20 rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse at center, #1a6645, transparent 70%)' }}
          />
        </div>
        <div
          className="absolute bottom-0 inset-x-0 h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #0a0f1e)' }}
        />
      </div>
    );
  }

  return null;
}