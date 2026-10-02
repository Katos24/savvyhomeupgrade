'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import FormAndDashboardSection from '@/components/marketing/FormAndDashboardSection';
import FeaturesSection from '@/components/marketing/FeaturesSection';
import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import ProfitSection from '@/components/marketing/ProfitSection';
import FAQSection from '@/components/marketing/FAQSection';
import PaymentsReviewsSection from '@/components/marketing/PaymentsReviewsSection';
import Footer from '@/components/marketing/Footer';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
            <Nav />
      <NewHero />
      <FormAndDashboardSection />
      <FeaturesSection />
      <ProfitSection />
      <PaymentsReviewsSection />
      <Pricing />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}