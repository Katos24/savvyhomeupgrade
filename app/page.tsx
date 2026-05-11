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

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
      <Nav />

      {/* 1. HERO — white */}
      <NewHero />

      {/* 2. TRUCK SECTION — dark */}
      <TruckSection />

      {/* 3. LEAD LANDING — amber-50 */}
      <LeadLandingSection />

      {/* 4. CUSTOMIZE FORM — dark */}
      <CustomizeFormSection />

      {/* 5. WHY SECTION — light */}
      <NewWhySection />

      {/* 6. DIGEST BANNER — dark */}
      <DigestBanner />

      {/* 7. EFFICIENCY SHOWCASE — white */}
      <EfficiencyShowcase />

      {/* 8. VALUE SECTION — dark */}
      <ValueSection />

      {/* 9. PRICING — dark */}
      <Pricing />

      {/* 10. COMPARISON — white */}
      <Comparison />

      {/* 11. FINAL CTA — dark */}
      <FinalCTA />

      {/* 12. FOOTER */}
      <Footer />
    </div>
  );
}