import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

// Readable on any screen: Inter for body text, Plus Jakarta Sans (wide, sturdy) for headlines.
// The CSS variable names are unchanged, so every section picks these up automatically.
export const bodyFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

// Put this on the page wrapper so every section can use both fonts.
export const fontVars = `${bodyFont.variable} ${displayFont.variable}`;

// Palette (for inline styles / SVG). Tailwind classes use the same hex values.
export const INK = '#1C1F23'; // asphalt / charcoal
export const PAPER = '#F4EFE6'; // kraft / work-order paper
export const TEAL = '#00828A'; // Lead2Project brand