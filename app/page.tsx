'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import TruckSection from '@/components/marketing/TruckSection';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import LeadLandingSection from '@/components/marketing/LeadLandingSection';
import DigestBanner from '@/components/marketing/DigestBanner';
import EfficiencyShowcase from '@/components/marketing/EfficiencyShowcase';
import ValueSection from '@/components/marketing/ValueSection';
import NewWhySection from '@/components/marketing/NewWhySection';
import Pricing from '@/components/marketing/Pricing';
import Comparison from '@/components/marketing/Comparison';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import SelfServeBanner from '@/components/marketing/SelfServeBanner';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
      <Nav />

      {/* 1. THE HOOK: Hero (White) */}
      <NewHero />

      {/* 2. THE MOMENTUM: Truck Section (Dark) */}
      <TruckSection />

      {/* 3. THE SOLUTION: Lead Landing (Amber-50) */}
      <LeadLandingSection />

      {/* 4. THE POWER: Customize Form (Dark) */}
      <CustomizeFormSection />

      {/* 5. THE LOGIC: Why Section (Light) */}
      <NewWhySection />

      {/* 6. THE PROOF: Efficiency Showcase (White) 
          Moving this here keeps the 'White/Light' flow going before the next dark block.
      */}
      <EfficiencyShowcase />

      {/* 7. THE IMPACT: Digest Banner (Dark) 
          Short, punchy high-contrast section.
      */}
      <DigestBanner />

      {/* 8. THE TRANSFORMATION: Value Section (Dark) 
          Deep dive into the 'After' state of the customer.
      */}
      <ValueSection />

      {/* 9. THE "EASY" BUTTON: SelfServeBanner (White/Apple Smooth) 
          This acts as a 'Visual Palette Cleanser' after two back-to-back dark sections.
          It tells the user: "You've seen the value, now see how easy it is to start."
      */}
      <SelfServeBanner />

      {/* 10. THE COMMITMENT: Pricing (Dark) */}
      <Pricing />

      {/* 11. THE REASSURANCE: Comparison (White) 
          Now that they've seen the price, show them why your competitors 
          are a headache compared to your self-serve model.
      */}
      <Comparison />

      {/* 12. THE CLOSE: Final CTA (Dark) */}
      <FinalCTA />

      {/* 13. FOOTER */}
      <Footer />
    </div>
  );
}