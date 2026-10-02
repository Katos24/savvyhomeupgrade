import { Barlow, Barlow_Condensed } from 'next/font/google';

// Job-site type: condensed signage headlines + a plain, readable body.
export const bodyFont = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const displayFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

// Put this on the page wrapper so every section can use both fonts.
export const fontVars = `${bodyFont.variable} ${displayFont.variable}`;

// Palette (for inline styles / SVG). Tailwind classes use the same hex values.
export const INK = '#1C1F23'; // asphalt / charcoal
export const SAFETY = '#FFC72C'; // hi-vis yellow
export const PAPER = '#F4EFE6'; // kraft / work-order paper
export const TEAL = '#00828A'; // Lead2Project brand