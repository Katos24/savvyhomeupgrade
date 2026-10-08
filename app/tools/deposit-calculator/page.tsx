import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider } from '@/components/marketing/marketingUI';
import DepositCalculator from './DepositCalculator';

export const metadata: Metadata = {
  title: 'Contractor Deposit Calculator (Free) | Lead2Project',
  description:
    'Work out the deposit and the balance due for any job in seconds. Enter the price, sales tax and deposit percent or flat amount. Free, no sign-up.',
  alternates: { canonical: '/tools/deposit-calculator' },
  openGraph: {
    title: 'Contractor Deposit Calculator (Free)',
    description: 'Deposit to get started, balance on completion and job total, with sales tax. Free, no sign-up.',
    url: '/tools/deposit-calculator',
    type: 'website',
  },
};

// Helps Google understand this is a free tool.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Contractor Deposit Calculator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description:
    'Free calculator for contractors: deposit to get started, balance on completion and job total, including sales tax.',
};

const h2 = 'font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight';
const p = 'mt-4 text-base leading-relaxed text-[#3a3f45]';

export default function DepositCalculatorPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-[#F4EFE6] text-[#1C1F23] antialiased`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />

      {/* Header */}
      <section className="px-4 pt-28 sm:pt-36 pb-8 sm:pb-10 text-center">
        <Eyebrow>Free tool</Eyebrow>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold uppercase tracking-tight leading-[0.9]">
          Contractor deposit calculator
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-base sm:text-lg text-[#3a3f45]">
          Enter the job price and your deposit. See what to collect up front and what&rsquo;s left when the job is done.
        </p>
      </section>

      {/* Calculator */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl">
          <DepositCalculator />
          <p className="mt-3 text-center text-xs text-[#5a6067]">
            Nothing you type is saved or sent anywhere. The deposit is figured on the total including tax, rounded to the cent.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl flex flex-col gap-5 rounded-lg bg-[#00828A] p-6 sm:p-9 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none">
              Send it as a real deposit invoice
            </h2>
            <p className="mt-3 text-white/85">
              Put the deposit right on your quote. When the customer accepts, Lead2Project can send the deposit request
              automatically, and they pay by card on the spot.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link
              href="/signup"
              className="rounded-md bg-white px-7 py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-[#00828A] shadow-sm transition-colors hover:bg-slate-50"
            >
              Start free
            </Link>
            <Link href="/features/payments" className="text-center text-sm font-semibold text-white/85 underline-offset-4 hover:underline">
              How deposits work →
            </Link>
          </div>
        </div>
      </section>

      <TapeDivider />

      {/* Guide */}
      <article className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>How much deposit should a contractor charge?</h2>
          <p className={p}>
            There&rsquo;s no single right number. A deposit has two jobs: cover what you have to spend before the work
            starts, and show the customer is committed. Start from those two and the number usually picks itself.
          </p>

          <h3 className="mt-8 text-xl font-bold">What to think about</h3>
          <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#3a3f45]">
            <li>
              <strong className="text-[#1C1F23]">Materials you buy up front.</strong> If you&rsquo;re ordering shingles,
              fixtures or custom pieces before day one, the deposit should cover them. You shouldn&rsquo;t be financing a
              customer&rsquo;s job.
            </li>
            <li>
              <strong className="text-[#1C1F23]">Special orders.</strong> Anything made to measure or non-returnable is
              money you can&rsquo;t get back if the customer cancels.
            </li>
            <li>
              <strong className="text-[#1C1F23]">Job size and length.</strong> On a short repair you might ask for a
              small deposit or none. On a long job, consider progress payments instead of one big deposit.
            </li>
            <li>
              <strong className="text-[#1C1F23]">The customer.</strong> A repeat customer you trust might get lighter
              terms than a first-time one.
            </li>
            <li>
              <strong className="text-[#1C1F23]">The law where you work.</strong> Some states limit deposits on home
              improvement jobs or control where the money goes. See below.
            </li>
          </ul>

          <h3 className="mt-10 text-xl font-bold">Put it on the quote, not in a text later</h3>
          <p className={p}>
            The easiest deposit to collect is one the customer saw before they said yes. Show the deposit and the
            balance right on the quote, and send the deposit request as soon as they accept, while the job is fresh.
            Use the calculator above, copy the text, and paste it into your quote or message.
          </p>

          <h3 className="mt-10 text-xl font-bold">Check your state&rsquo;s rules</h3>
          <p className={p}>A couple of examples of how much the rules can differ:</p>
          <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#3a3f45]">
            <li>
              <strong className="text-[#1C1F23]">New York:</strong> for home improvement work, the state Attorney
              General says payments received before the job is substantially complete must go into an escrow account at
              a New York bank within five business days, or the contractor must give the customer a bond or contract of
              indemnity instead. The contract must also be in writing.{' '}
              <a
                href="https://ag.ny.gov/home-improvement-fact-sheet"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#00828A] underline-offset-4 hover:underline"
              >
                NY AG home improvement fact sheet
              </a>
            </li>
            <li>
              <strong className="text-[#1C1F23]">California:</strong> on home improvement contracts, the down payment
              can&rsquo;t be more than $1,000 or 10% of the contract price, whichever is less, with exceptions for some
              bonded contractors.{' '}
              <a
                href="https://law.justia.com/codes/california/code-bpc/division-3/chapter-9/article-10/section-7159-5"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#00828A] underline-offset-4 hover:underline"
              >
                Cal. Bus. &amp; Prof. Code § 7159.5
              </a>
            </li>
          </ul>
          <p className="mt-4 text-sm text-[#5a6067]">
            Rules change and depend on the type of work, so check your state and local rules before you set your
            deposit. This page is general information, not legal advice.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}