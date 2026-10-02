'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import FormAndDashboardSection from '@/components/marketing/FormAndDashboardSection';
import FeaturesSection from '@/components/marketing/FeaturesSection';
import ProfitSection from '@/components/marketing/ProfitSection';
import InvoiceShowcaseSection from '@/components/marketing/InvoiceShowcaseSection';
import PaymentsReviewsSection from '@/components/marketing/PaymentsReviewsSection';
import Pricing from '@/components/marketing/Pricing';
import FAQSection from '@/components/marketing/FAQSection';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

export default function NewHome() {
  return (
    <div
      className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}
    >
      <Nav />
      <NewHero />
      <TradesStrip />
      <FormAndDashboardSection />
      <TapeDivider />
      <FeaturesSection />
      <ProfitSection />
      <InvoiceShowcaseSection />
      <PaymentsReviewsSection />
      <TapeDivider />
      <Pricing />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}