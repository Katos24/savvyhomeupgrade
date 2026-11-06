import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import FormAndDashboardSection, { JobCardSection } from '@/components/marketing/FormAndDashboardSection';
import QuoteSection from '@/components/marketing/QuoteSection';
import { WhatYouGetSection } from '@/components/marketing/FeaturesSection';
import ProfitSection from '@/components/marketing/ProfitSection';
import InvoiceShowcaseSection from '@/components/marketing/InvoiceShowcaseSection';
import PaymentsReviewsSection from '@/components/marketing/PaymentsReviewsSection';
import Pricing from '@/components/marketing/Pricing';
import FAQSection from '@/components/marketing/FAQSection';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

// Removed from the home page (files kept, still usable elsewhere):
// - FeaturesSection ("How it works" work orders): the hero's 4 step cards cover it now.
// - ImportSection: merged into WhatYouGetSection.
export default function NewHome() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}>
      <Nav />
      <NewHero />

      <TradesStrip />
      <FormAndDashboardSection />
      <QuoteSection />
      <JobCardSection />

      <PaymentsReviewsSection />
      <InvoiceShowcaseSection />
      <ProfitSection />

      <WhatYouGetSection />
      <TapeDivider />
      <Pricing />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}