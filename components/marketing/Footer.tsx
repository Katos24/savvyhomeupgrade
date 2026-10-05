'use client';

import Link from 'next/link';

// Remove any link here whose page doesn't exist yet (or still mentions AI features).
const columns: { heading: string; links: [string, string][] }[] = [
  {
    heading: 'Product',
    links: [
           ['Pricing', '/#pricing'],
      ['How it works', '/#how-it-works'],
      ['Blog', '/blog'],
      ['Book a demo', '/book-demo'],
      ['Sign up', '/signup'],
      ['Log in', '/login'],
    ],
  },
  {
    heading: 'Features',
    links: [
      ['Lead capture', '/features/lead-capture'],
      ['Quoting', '/features/quoting'],
      ['Scheduling', '/features/scheduling'],
      ['Payments', '/features/payments'],
      ['Operations', '/features/operations'],
      ['Outbox & digest', '/features/outbox'],
    ],
  },
  {
    heading: 'Industries',
    links: [
      ['HVAC', '/solutions/hvac'],
      ['Plumbing', '/solutions/plumbing'],
      ['Electrical', '/solutions/electrical'],
      ['Roofing', '/solutions/roofing'],
      ['Cleaning', '/solutions/cleaning'],
      ['For bookkeepers', '/partners'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#16191C] py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Lead2ProjectLogo.webp" alt="" className="h-8 w-auto object-contain" />
              <span className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase tracking-wide text-white">Lead2Project</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-[220px]">
              Quotes, deposits and invoices for contractors. Get paid for every job.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.14em] text-[#5EC4C9]">{col.heading}</p>
              <ul className="space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Lead2Project. All rights reserved.</p>
          <div className="flex items-center gap-5 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}