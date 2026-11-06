'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { ArrowRight, Layers, Percent, Check, CreditCard } from 'lucide-react';
import { Eyebrow } from './marketingUI';
import QuoteBuilderDemo from './QuoteBuilderDemo';

// Home page: the step after lead capture. Shows the real quote builder demo.
// The demo mounts just before it scrolls into view, so it starts playing when people can see it
// and costs nothing on page load.

const POINTS = [
  { icon: Layers, title: 'Saved price templates', desc: 'Your line items for each service, ready in one tap.' },
  { icon: Percent, title: 'Tax and deposit built in', desc: 'Percent or flat deposit, added to every quote.' },
  { icon: Check, title: 'Customers accept online', desc: 'They read it and say yes from their phone.' },
  { icon: CreditCard, title: 'Deposit paid by card', desc: 'The money is in before you buy materials.' },
];

export default function QuoteSection() {
  const ref = useRef<HTMLDivElement>(null);
  // Start loading a little before it's on screen
  const inView = useInView(ref, { once: true, margin: '0px 0px 200px 0px' });

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#00828A] via-[#006f76] to-[#0b3d44] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#5EC4C9]/40 blur-[110px]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
        {/* Copy (right on desktop, first on phones) */}
        <div className="text-center lg:order-2 lg:text-left">
          <Eyebrow dark>Quoting</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
            Quote it in a tap. <span className="text-[#A6E3E6]">Get the deposit first.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-base leading-relaxed text-white/90 lg:mx-0">
            Load a saved template, change what&rsquo;s different about this job, and send it. When your customer accepts, the
            deposit request goes out and they pay by card.
          </p>

          <ul className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-3 text-left min-[480px]:grid-cols-2 lg:mx-0 lg:grid-cols-1">
            {POINTS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-white/85">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/features/quoting"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#00828A] transition-transform hover:-translate-y-0.5"
          >
            See how quoting works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Demo (left on desktop) */}
        <div ref={ref} className="relative min-h-[520px] w-full lg:order-1">
          <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-6 top-12 rounded-[2rem] bg-black/25 blur-3xl" />
          {inView && (
            // text-[#1C1F23]: the demo card leaves some text colors unset, so it must not inherit this section's white text.
            // The demo's own captions set white explicitly (dark prop), so they stay readable on teal.
            <div className="relative text-[#1C1F23]">
              <QuoteBuilderDemo dark />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}