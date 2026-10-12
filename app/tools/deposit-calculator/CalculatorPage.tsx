import Link from 'next/link';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { TapeDivider } from '@/components/marketing/marketingUI';
import DepositCalculator from './DepositCalculator';
import { STATES, OTHER_STATE, GENERAL } from './states';

const h2 = 'font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight';
const p = 'mt-4 text-base leading-relaxed text-[#3a3f45]';

// Shared by /tools/deposit-calculator and /tools/deposit-calculator/[state].
// The header, calculator, rules and FAQ live in DepositCalculator so they
// follow the state dropdown; this file holds the parts that don't change.
export default function CalculatorPage({ stateSlug = OTHER_STATE }: { stateSlug?: string }) {
  const info = STATES[stateSlug] || null;
  const faq = info ? info.faq : GENERAL.faq;

  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: info ? `${info.name} Contractor Deposit Calculator` : 'Contractor Deposit Calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: info
      ? info.description
      : 'Free calculator for contractors: deposit to get started, balance on completion and job total, including sales tax.',
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-[#F4EFE6] text-[#1C1F23] antialiased`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Nav />

      {/* Header, calculator, state rules, FAQ */}
      <section className="px-4 pb-14">
        <div className="mx-auto max-w-5xl">
          <DepositCalculator initialState={stateSlug} />
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

      {/* General guide */}
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
              <strong className="text-[#1C1F23]">The law and taxes where you work.</strong> Some states limit deposits
              or control where the money goes, and sales tax depends on the state and the type of job. Pick your state
              in the calculator to see its rules.
            </li>
          </ul>

          <h3 className="mt-10 text-xl font-bold">Put it on the quote, not in a text later</h3>
          <p className={p}>
            The easiest deposit to collect is one the customer saw before they said yes. Show the deposit and the
            balance right on the quote, and send the deposit request as soon as they accept, while the job is fresh.
            Use the calculator above, copy the text, and paste it into your quote or message.
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}