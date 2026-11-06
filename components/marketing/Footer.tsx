'use client';

import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';

// Remove any link here whose page doesn't exist yet (or still mentions AI features).
const columns: { heading: string; links: [string, string][] }[] = [
  {
    heading: 'Product',
    links: [
      ['Pricing', '/pricing'],
      ['How it works', '/how-it-works'],
      ['Book a demo', '/book-demo'],
      ['Blog', '/blog'],
      ['Log in', '/login'],
    ],
  },
  {
    heading: 'Features',
    links: [
      ['Lead capture', '/features/lead-capture'],
      ['Quoting', '/features/quoting'],
      ['Payments', '/features/payments'],
      ['Scheduling', '/features/scheduling'],
      ['Job board', '/features/operations'],
      ['Outbox & digest', '/features/outbox'],
    ],
  },
  {
    heading: 'Industries',
    links: [
      ['Roofing', '/solutions/roofing'],
      ['HVAC', '/solutions/hvac'],
      ['Plumbing', '/solutions/plumbing'],
      ['Electrical', '/solutions/electrical'],
      ['Cleaning', '/solutions/cleaning'],
      ['For bookkeepers', '/partners'],
    ],
  },
  {
    heading: 'Free tools',
    links: [
      ['Deposit calculator', '/tools/deposit-calculator'],
      ['Invoice maker', '/tools/invoice-generator'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-900 px-5 pb-8 pt-14 text-white sm:px-6 sm:pt-16 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#00828A]/20 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))] md:gap-x-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lead2ProjectLogo.webp" alt="" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
              <span className="font-[family-name:var(--font-display)] text-xl font-extrabold tracking-tight">Lead2Project</span>
            </Link>
            <p className="mt-4 max-w-[30ch] text-base leading-relaxed text-white/80">
              Quotes, deposits, scheduling and payments in one simple place. Built for contractors.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#00828A] px-4 py-2.5 text-[15px] font-bold text-white transition-colors hover:bg-[#00959e]"
            >
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-[15px] leading-snug text-white/75">
              Built on Long Island by Alex.
              <br />
              <a href="mailto:support@lead2project.com" className="mt-1 inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#5EC4C9]">
                <Mail className="h-4 w-4 text-[#5EC4C9]" /> support@lead2project.com
              </a>
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-[#5EC4C9]">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[15px] text-white/80 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/65">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
          <div className="flex items-center gap-5 text-sm text-white/65">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}