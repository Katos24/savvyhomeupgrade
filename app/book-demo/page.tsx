import { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import BookDemoForm from './BookDemoForm';

const font = "'Nunito', sans-serif";

export const metadata: Metadata = {
  title: 'Book a demo | Lead2Project',
  description:
    'See how Lead2Project turns a booking link into leads, quotes, and payments on one board. Twenty minutes, no sales pressure.',
};

const POINTS = [
  'A walkthrough of your booking form and QR code',
  'How leads land on the board with photos attached',
  'Quotes, scheduling, and payments in one place',
  'Straight answers on whether it fits how you work',
];

export default function BookDemoPage() {
  return (
    <main style={{ fontFamily: font }} className="bg-slate-100 min-h-screen py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          {/* Standalone page — no site nav, so this is the only way back. */}
          <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
            <Image
              src="/Lead2ProjectLogo.png"
              alt=""
              aria-hidden="true"
              width={400}
              height={100}
              priority
              className="h-9 w-auto"
            />
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              Lead2Project
            </span>
          </Link>

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700 block mb-4">
            Book a demo
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.08] mb-5">
            Twenty minutes,{' '}
            <span className="text-teal-700">and you&apos;ll know.</span>
          </h1>

          <p className="text-base font-semibold text-slate-600 leading-relaxed mb-8">
            Tell us a bit about your crew and we&apos;ll walk you through the parts
            that matter for the work you actually do.
          </p>

          <ul className="space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center shrink-0 mt-px">
                  <Check className="w-3 h-3 text-white stroke-[3.5]" />
                </span>
                <span className="text-sm font-semibold text-slate-700 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 pt-6 border-t border-slate-300 text-sm font-semibold text-slate-500 leading-relaxed">
            Would rather just poke around?{' '}
            <a href="/demo" className="text-teal-700 font-black underline underline-offset-2">
              Try the live demo
            </a>{' '}
            — no form, no email.
          </p>
        </div>

        <div className="lg:col-span-7">
          {/* useSearchParams needs a Suspense boundary in the app router. */}
          <Suspense
            fallback={
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl h-[600px] animate-pulse" />
            }
          >
            <BookDemoForm />
          </Suspense>
        </div>

      </div>
    </main>
  );
}