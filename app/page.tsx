'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import HowItWorksSection from '@/components/marketing/HowItWorksSection';
import ProblemSection from '@/components/marketing/ProblemSection';
import TheFixSection from '@/components/marketing/FixSection';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import TruckSection from '@/components/marketing/TruckSection'; // Your Distribution Section
import LeadLandingSection from '@/components/marketing/LeadLandingSection'; // Your Workflow Section
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

      <HowItWorksSection />


      {/* 2. THE PROBLEM: Why the current way (threads/folders) is failing them */}
      <ProblemSection />


      {/* 5. DISTRIBUTION: Where to put the link (QR/Trucks/Bios) Google section */}
      <TruckSection />

  {/* 4. THE ENTRY POINT: Custom Forms (The "Where" & "How") */}
      <CustomizeFormSection />

      {/* 3. THE SOLUTION: The "Lead2Project" Concept (The Fix) */}
      <TheFixSection />

    


      {/* 6. THE HEART: Running the job from one card */}
      <LeadLandingSection />

  

      {/* 7. THE SPEED: One-click emails & Outbox tracking */}
      <EfficiencyShowcase />

            {/* 8. THE PEACE OF MIND: Daily Digest */}
      <DigestBanner />

    

      {/* 9. THE BARRIER REMOVAL: Self-serve sign up */}
      <SelfServeBanner />

      {/* 10. PRICING */}
      <Pricing />

      {/* 11. FINAL CTA */}
      <FinalCTA />

      <Footer />
    </div>
  );
}