import Link from 'next/link';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Eyebrow } from '@/components/marketing/marketingUI';

// Reusable FAQ block for feature pages.
// Questions are written the way contractors type them into Google, and every
// answer must be true for the app today. Also outputs FAQPage structured data.

export type FAQItem = {
  q: string;
  a: string; // plain text: used on the page and in the structured data
  link?: { label: string; href: string };
};

const D = 'font-[family-name:var(--font-display)]';

export default function FeatureFAQ({
  heading = 'Questions contractors ask',
  eyebrow = 'FAQ',
  items,
  className = 'bg-white',
}: {
  heading?: string;
  eyebrow?: string;
  items: FAQItem[];
  className?: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <section className={`${className} py-16 sm:py-24 px-4 sm:px-6 lg:px-8`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto">
        <div className="text-center sm:text-left">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className={`mt-3 ${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`}>{heading}</h2>
        </div>

        <div className="mt-8 divide-y divide-[#1C1F23]/10 border-y border-[#1C1F23]/10">
          {items.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                <h3 className="text-base sm:text-lg font-bold text-[#1C1F23]">{item.q}</h3>
                <ChevronDown className="h-5 w-5 shrink-0 text-[#5a6067] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="pb-5 pr-8">
                <p className="text-[15px] sm:text-base leading-relaxed text-[#3a3f45]">{item.a}</p>
                {item.link && (
                  <Link
                    href={item.link.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00828A] underline-offset-4 hover:underline"
                  >
                    {item.link.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}