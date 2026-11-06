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
    <section className="bg-slate-50 px-4 py-12 text-[#1C1F23] sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-12">
        {/* Copy (right on desktop, first on phones) */}
        <div className="text-center lg:order-2 lg:text-left">
          <Eyebrow>Quoting</Eyebrow>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[32px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
            Quote it in a tap. <span className="text-[#00828A]">Get the deposit first.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-base leading-relaxed text-[#3a3f45] lg:mx-0">
            Load a saved template, change what&rsquo;s different about this job, and send it. When your customer accepts, the
            deposit request goes out and they pay by card.
          </p>

          <ul className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-3 text-left min-[480px]:grid-cols-2 lg:mx-0 lg:grid-cols-1">
            {POINTS.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00828A]/10 text-[#00828A]">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight">{title}</p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[#3a3f45]">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/features/quoting"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00828A] underline-offset-4 hover:underline"
          >
            See how quoting works <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Demo (left on desktop) */}
        <div ref={ref} className="relative min-h-[520px] w-full lg:order-1">
          <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-6 top-12 -z-10 rounded-[2rem] bg-[#5EC4C9]/25 blur-3xl" />
          {inView && <QuoteBuilderDemo />}
        </div>
      </div>
    </section>
  );
}