'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import FullStorySection from '@/components/marketing/FullStorySection';
import QuoteToPaidSection from '@/components/marketing/QuoteToPaidSection';

import HowItWorksSection from '@/components/marketing/HowItWorksSection';
import ProblemSection from '@/components/marketing/ProblemSection';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import TruckSection from '@/components/marketing/TruckSection'; // Your Distribution Section
import EfficiencyShowcase from '@/components/marketing/EfficiencyShowcase';
import DigestBanner from '@/components/marketing/DigestBanner';
import SelfServeBanner from '@/components/marketing/SelfServeBanner';
import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
      <Nav />

      {/* 1. THE HOOK: The current state of chaos vs. order */}
      <NewHero />
      <FullStorySection />
            <ProblemSection />
                  <HowItWorksSection />


    <QuoteToPaidSection />



      {/* 2. THE PROBLEM: Why the current way (threads/folders) is failing them */}

  <CustomizeFormSection />
      {/* 5. DISTRIBUTION: Where to put the link (QR/Trucks/Bios) Google section */}
      <TruckSection />

  {/* 4. THE ENTRY POINT: Custom Forms (The "Where" & "How") */}
    

      {/* 3. THE SOLUTION: The "Lead2Project" Concept (The Fix) */}

    


       <DigestBanner />

      <SelfServeBanner />

      {/* 7. THE SPEED: One-click emails & Outbox tracking */}
      <EfficiencyShowcase />



 
      <Pricing />
    

      {/* 9. THE BARRIER REMOVAL: Self-serve sign up */}




      {/* 11. FINAL CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}