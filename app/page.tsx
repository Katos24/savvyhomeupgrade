'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import FeaturesSection from '@/components/marketing/FeaturesSection';
import FormAndDashboardSection from '@/components/marketing/FormAndDashboardSection';
import ComparisonSection from '@/components/marketing/ComparisonSection';
import TruckSection from '@/components/marketing/TruckSection';
import FullStorySection from '@/components/marketing/FullStorySection';
import GoogleReviewSection from '@/components/marketing/GoogleReviewSection';
import DigestBanner from '@/components/marketing/DigestBanner';

import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
      <Nav />

      {/* 1. Sign up and create your form */}
      <NewHero />


            <FormAndDashboardSection></FormAndDashboardSection>

                  <FullStorySection />










      {/* 2. Blast your link everywhere */}
      <TruckSection />

                        <FeaturesSection></FeaturesSection>


      {/* 3. Form lands, ready to track */}

      {/* 4. The full story, tab by tab */}

            <ComparisonSection></ComparisonSection>



      {/* 6. Collect the Google review — TODO: no section built yet, needs a new component */}

      <GoogleReviewSection />

      <DigestBanner />

      {/* 7. Pricing */}
      <Pricing />

      {/* 8. Final CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}