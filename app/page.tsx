'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import TruckSection from '@/components/marketing/TruckSection';
import DashboardShowcase from '@/components/marketing/DashboardShowcase';
import FullStorySection from '@/components/marketing/FullStorySection';
import QuoteToPaidSection from '@/components/marketing/QuoteToPaidSection';
import GoogleReviewSection from '@/components/marketing/GoogleReviewSection';

import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
      <Nav />

      {/* 1. Sign up and create your form */}
      <NewHero />

      <CustomizeFormSection />

      {/* 2. Blast your link everywhere */}
      <TruckSection />

      {/* 3. Form lands, ready to track */}
      <DashboardShowcase />

      {/* 4. The full story, tab by tab */}
      <FullStorySection />

      {/* 5. Send the invoice */}
      <QuoteToPaidSection />

      {/* 6. Collect the Google review — TODO: no section built yet, needs a new component */}

      <GoogleReviewSection />

      {/* 7. Pricing */}
      <Pricing />

      {/* 8. Final CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}