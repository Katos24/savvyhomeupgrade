import type { Metadata } from 'next';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import InvoiceGenerator from './InvoiceGenerator';

export const metadata: Metadata = {
  title: 'Free Contractor Invoice Maker (No Sign-Up) | Lead2Project',
  description:
    'Make a clean contractor invoice in minutes: line items, sales tax, and a deposit or balance if you need one. Save it as a PDF. Free, no sign-up.',
  alternates: { canonical: '/tools/invoice-generator' },
  openGraph: {
    title: 'Free Contractor Invoice Maker',
    description: 'Line items, sales tax, deposit and balance. Save as PDF. Free, no sign-up.',
    url: '/tools/invoice-generator',
    type: 'website',
  },
};

export default function InvoiceGeneratorPage() {
  const appLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Contractor Invoice Maker',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Free invoice maker for contractors with line items, sales tax, deposits and balances. Save as PDF.',
  };

  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-[#F4EFE6] text-[#1C1F23] antialiased print:bg-white`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appLd) }} />
      <div className="print:hidden">
        <Nav />
      </div>

      <section className="px-4 pb-16 print:p-0">
        <div className="mx-auto max-w-6xl print:max-w-none">
          <InvoiceGenerator />
        </div>
      </section>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}